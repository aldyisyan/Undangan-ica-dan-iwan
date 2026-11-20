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

async function fetchWishes() {
  try {
    const res = await fetch("/api/wishes");
    if (res.ok) {
      const data = await res.json();
      const mapped = data.map((w: any) => ({
          name: w.name,
          attend: w.attend,
          count: w.count,
          message: w.message,
          at: new Date(w.createdAt).getTime()
      }));
      _commit(mapped.length > 0 ? mapped : _state);
    }
  } catch (e) { console.error(e); }
}

if (typeof window !== "undefined") {
  fetchWishes();
}

let _state: Wish[] = _load();
const _listeners = new Set<() => void>();

function _load(): Wish[] {
  if (typeof window === "undefined") return [...seed];
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
  if (persist && typeof window !== "undefined") {
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* full */ }
  }
  _listeners.forEach((l) => l());
}

export function useWishes(): Wish[] {
  return useSyncExternalStore(
    (cb) => { _listeners.add(cb); return () => _listeners.delete(cb); },
    () => _state,
    () => _state
  );
}

export function loadWishes(): Wish[] { return _state; }
export function addWish(w: Wish): void { 
    _commit([w, ..._state]); 
    fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: w.name,
            attend: w.attend,
            count: w.count,
            message: w.message
        })
    }).catch(console.error);
}
export function saveWishes(wishes: Wish[]): void { _commit(wishes); }
export function replaceWishesFromCloud(wishes: Wish[]): void {
  _commit(wishes, false);
  if (typeof window !== "undefined") {
    try { localStorage.setItem(KEY, JSON.stringify(wishes)); } catch { /* ignore */ }
  }
}
export function removeWish(w: Wish): Wish[] {
  const next = _state.filter((x) => !(x.at === w.at && x.name === w.name));
  _commit(next);
  return next;
}
export function wipeWishes(): void { _commit([]); }
