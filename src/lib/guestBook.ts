import { useSyncExternalStore } from "react";
import { encodeCloudParam } from "./cloudConfig";

export interface InviteGuest {
  id: string;
  name: string;
  phone: string;
  createdAt: number;
  sentAt?: number;
}

const KEY = "rk-invite-guestbook-v1";
const TPL_KEY = "rk-invite-wa-template-v1";

export const DEFAULT_WA_TEMPLATE = `Kepada Yth. {nama}
di tempat

Assalamu'alaikum Warahmatullahi Wabarakatuh

Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pernikahan kami:

{mempelai}
{tanggal}
{lokasi}

Undangan digital khusus untuk Anda dapat dibuka melalui tautan berikut:
{link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir.

Wassalamu'alaikum Warahmatullahi Wabarakatuh`;

export const WA_PLACEHOLDERS = ["{nama}", "{mempelai}", "{tanggal}", "{lokasi}", "{link}"];

export function getWaTemplate(): string {
  try { return localStorage.getItem(TPL_KEY) || DEFAULT_WA_TEMPLATE; }
  catch { return DEFAULT_WA_TEMPLATE; }
}
export function saveWaTemplate(tpl: string): void {
  try { localStorage.setItem(TPL_KEY, tpl); } catch { /* ignore */ }
}

export function buildInviteLink(name: string): string {
  const base = `${window.location.origin}${window.location.pathname}`;
  const params = new URLSearchParams();
  const trimmed = name.trim();
  if (trimmed) params.set("to", trimmed);
  const ref = encodeCloudParam();
  if (ref) params.set("c", ref);
  const q = params.toString();
  return q ? `${base}?${q}` : base;
}

export function normalizeWaPhone(raw: string): string {
  let digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("620")) digits = "62" + digits.slice(3);
  else if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  else if (digits.startsWith("8")) digits = "62" + digits;
  return digits;
}

export function buildWaUrl(phone: string, message: string): string {
  const p = normalizeWaPhone(phone);
  const text = encodeURIComponent(message);
  return p ? `https://wa.me/${p}?text=${text}` : `https://wa.me/?text=${text}`;
}

export function renderWaMessage(
  template: string,
  vars: { nama: string; link: string; mempelai: string; tanggal: string; lokasi: string }
): string {
  return template
    .replace(/\{nama\}/g, vars.nama)
    .replace(/\{mempelai\}/g, vars.mempelai)
    .replace(/\{tanggal\}/g, vars.tanggal)
    .replace(/\{lokasi\}/g, vars.lokasi)
    .replace(/\{link\}/g, vars.link);
}

function load(): InviteGuest[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((g): g is InviteGuest => !!g && typeof g === "object" && typeof (g as InviteGuest).name === "string")
      .map((g) => ({
        id: typeof g.id === "string" && g.id ? g.id : cryptoId(),
        name: g.name,
        phone: typeof g.phone === "string" ? g.phone : "",
        createdAt: typeof g.createdAt === "number" ? g.createdAt : Date.now(),
        sentAt: typeof g.sentAt === "number" ? g.sentAt : undefined,
      }));
  } catch { return []; }
}

function cryptoId(): string {
  try { return crypto.randomUUID(); }
  catch { return `g-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }
}

let state: InviteGuest[] = load();
const listeners = new Set<() => void>();

function commit(next: InviteGuest[]): void {
  state = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function addGuest(name: string, phone: string): InviteGuest {
  const trimmed = name.trim();
  const existing = state.find((g) => g.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    const p = normalizeWaPhone(phone);
    if (p && p !== existing.phone) {
      commit(state.map((g) => (g.id === existing.id ? { ...g, phone: p } : g)));
      return { ...existing, phone: p };
    }
    return existing;
  }
  const guest: InviteGuest = { id: cryptoId(), name: trimmed, phone: normalizeWaPhone(phone), createdAt: Date.now() };
  commit([guest, ...state]);
  return guest;
}

export function removeGuest(id: string): void { commit(state.filter((g) => g.id !== id)); }
export function markSent(id: string): void { commit(state.map((g) => (g.id === id ? { ...g, sentAt: Date.now() } : g))); }
export function clearGuestBook(): void { commit([]); }
export function loadGuestBook(): InviteGuest[] { return state; }
export function replaceGuestBookFromCloud(guests: InviteGuest[]): void { commit(guests); }

export function useGuestBook(): InviteGuest[] {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => state
  );
}
