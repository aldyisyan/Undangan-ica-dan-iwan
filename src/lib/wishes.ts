import { useSyncExternalStore } from "react";

export interface Wish {
  name: string;
  attend: "hadir" | "ragu" | "tidak";
  count?: number;
  message: string;
  at: number;
}

const KEY = "rk-wedding-wishes-v2";

const seed: Wish[] = [
  { name: "Keluarga Santoso", attend: "hadir", count: 4, message: "Selamat! Semoga menjadi keluarga sakinah, mawaddah, warahmah. Bahagia selalu Iwan & Ica!", at: 1 },
  { name: "Nadia & Fajar", attend: "hadir", count: 2, message: "AAA akhirnya! Nggak sabar lihat kalian di pelaminan. Bahagia selalu ya!", at: 2 },
  { name: "Pak Hendra", attend: "ragu", message: "Barakallahu lakuma! Semoga lancar sampai hari H. Kami usahakan hadir!", at: 3 },
];

let _state: Wish[] = _load();
const _listeners = new Set<() => void>();

function _load(): Wish[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [...seed];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Wish[]) : [...seed];
  } catch {
    return [...seed];
  }
}

function _commit(next: Wish[], persist = true): void {
  _state = next;
  if (persist) {
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* full */ }
  }
  _listeners.forEach((l) => l());
}

export function useWishes(): Wish[] {
  return useSyncExternalStore(
    (cb) => { _listeners.add(cb); return () => _listeners.delete(cb); },
    () => _state
  );
}

export function loadWishes(): Wish[] { return _state; }
export function addWish(w: Wish): void { _commit([w, ..._state]); }
export function saveWishes(wishes: Wish[]): void { _commit(wishes); }
export function replaceWishesFromCloud(wishes: Wish[]): void {
  _commit(wishes, false);
  try { localStorage.setItem(KEY, JSON.stringify(wishes)); } catch { /* ignore */ }
}
export function removeWish(w: Wish): Wish[] {
  const next = _state.filter((x) => !(x.at === w.at && x.name === w.name));
  _commit(next);
  return next;
}
export function wipeWishes(): void { _commit([]); }

/* ------------------------------------------------------- pencocokan nama */

const HONORIFIC = new Set([
  "bpk", "bapak", "ibu", "pak", "bu", "dr", "drs", "prof", "sh", "sm", "mh",
  "saudara", "saudari", "mr", "mrs", "ms", "miss", "and", "dan", "the", "an",
]);

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function nameTokens(s: string): string[] {
  return normalizeName(s).split(" ").filter((t) => t.length > 1 && !HONORIFIC.has(t));
}

/**
 * Apakah tamu ini sudah mengirim ucapan/RSVP?
 *
 * Pencocokan longgar supaya tidak ada tamu yang salah tercatat "belum respons":
 *  - persis sama setelah normalisasi
 *  - salah satu mengandung yang lain
 *  - seluruh token nama paling pendek cocok di nama lainnya
 *
 * Contoh yang sebelumnya gagal: "Bapak Hendra (Kantor)" vs "Hendra",
 * "Ibu Sinta Maharani" vs "Sinta Maharani", "Rani & Dimas" vs "Rani dan Dimas".
 */
export function hasResponded(guestName: string, wishes: Wish[]): boolean {
  const g = normalizeName(guestName);
  if (!g) return false;
  const gt = nameTokens(guestName);

  return wishes.some((w) => {
    const wn = normalizeName(w.name);
    if (!wn) return false;
    if (wn === g) return true;
    if (wn.includes(g) || g.includes(wn)) return true;

    const wt = nameTokens(w.name);
    if (gt.length === 0 || wt.length === 0) return false;
    const overlap = gt.filter((t) => wt.includes(t)).length;
    return overlap > 0 && overlap >= Math.min(gt.length, wt.length);
  });
}
