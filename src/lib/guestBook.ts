import { useSyncExternalStore } from "react";
import { encodeCloudParam } from "./cloudConfig";

/** Acara mana yang bisa dilihat tamu ini */
export interface GuestEventVisibility {
  showAkad: boolean;
  showResepsi: boolean;
}

export interface InviteGuest {
  id: string;
  name: string;
  phone: string;
  createdAt: number;
  sentAt?: number;
  /** Override visibilitas acara untuk tamu ini. Jika undefined → ikut setting global admin. */
  events?: GuestEventVisibility;
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
  if (typeof window === "undefined") return DEFAULT_WA_TEMPLATE;
  try { return localStorage.getItem(TPL_KEY) || DEFAULT_WA_TEMPLATE; }
  catch { return DEFAULT_WA_TEMPLATE; }
}
export function saveWaTemplate(tpl: string): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(TPL_KEY, tpl); } catch { /* ignore */ }
}

export function buildInviteLink(name: string, eventParams?: string): string {
  const base = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "/";
  const params = new URLSearchParams();
  const trimmed = name.trim();
  if (trimmed) params.set("to", trimmed);
  const ref = encodeCloudParam();
  if (ref) params.set("c", ref);
  if (eventParams) {
    const ep = new URLSearchParams(eventParams);
    ep.forEach((v, k) => params.set(k, v));
  }
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
  if (typeof window === "undefined") return [];
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
        events:
          g.events && typeof g.events === "object"
            ? {
                showAkad:
                  typeof g.events.showAkad === "boolean" ? g.events.showAkad : true,
                showResepsi:
                  typeof g.events.showResepsi === "boolean" ? g.events.showResepsi : true,
              }
            : undefined,
      }));
  } catch { return []; }
}

function cryptoId(): string {
  try { return crypto.randomUUID(); }
  catch { return `g-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }
}

async function fetchGuests() {
  try {
    const res = await fetch("/api/guests");
    if (res.ok) {
      const data = await res.json();
      const mapped = data.map((g: any) => ({
        id: g.id,
        name: g.name,
        phone: g.phone || "",
        createdAt: new Date(g.createdAt).getTime(),
        sentAt: g.sentAt ? new Date(g.sentAt).getTime() : undefined,
        events: g.hasOverride ? { showAkad: g.showAkad, showResepsi: g.showResepsi } : undefined
      }));
      commit(mapped);
    }
  } catch (e) { console.error(e); }
}

if (typeof window !== "undefined") {
  fetchGuests();
}

let state: InviteGuest[] = load();
const listeners = new Set<() => void>();

function commit(next: InviteGuest[]): void {
  state = next;
  if (typeof window !== "undefined") {
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }
  listeners.forEach((l) => l());
}

export function addGuest(name: string, phone: string): InviteGuest {
  const trimmed = name.trim();
  const existing = state.find((g) => g.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) {
    const p = normalizeWaPhone(phone);
    if (p && p !== existing.phone) {
        const next = state.map((g) => (g.id === existing.id ? { ...g, phone: p } : g));
        commit(next);
        fetch("/api/guests", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: existing.id, name: trimmed, phone: p })
        }).catch(console.error);
        return { ...existing, phone: p };
    }
    return existing;
  }
  const guest: InviteGuest = { id: cryptoId(), name: trimmed, phone: normalizeWaPhone(phone), createdAt: Date.now() };
  commit([guest, ...state]);
  
  fetch("/api/guests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: trimmed, phone: normalizeWaPhone(phone) })
  }).then(res => res.json()).then(data => {
      if (data.id) {
          // Update local ID if needed, but we used cryptoId so it's fine if they differ unless we need exact match
          // Better to use the returned ID
          commit(state.map(g => g.id === guest.id ? { ...g, id: data.id } : g));
      }
  }).catch(console.error);
  
  return guest;
}

export function removeGuest(id: string): InviteGuest[] {
  const next = state.filter((g) => g.id !== id);
  commit(next);
  fetch(`/api/guests?id=${id}`, { method: "DELETE" }).catch(console.error);
  return next;
}
export function markSent(id: string): InviteGuest[] {
  const next = state.map((g) => (g.id === id ? { ...g, sentAt: Date.now() } : g));
  commit(next);
  fetch("/api/guests", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, sentAt: Date.now() })
  }).catch(console.error);
  return next;
}
export function clearGuestBook(): InviteGuest[] {
  const next: InviteGuest[] = [];
  commit(next);
  fetch("/api/guests", { method: "DELETE" }).catch(console.error);
  return next;
}
export function loadGuestBook(): InviteGuest[] { return state; }
export function replaceGuestBookFromCloud(guests: InviteGuest[]): void { commit(guests); }

/** Ubah visibilitas acara untuk tamu tertentu */
export function setGuestEvents(id: string, events: GuestEventVisibility): InviteGuest[] {
  const next = state.map((g) => (g.id === id ? { ...g, events } : g));
  commit(next);
  
  const g = next.find(x => x.id === id);
  if (g) {
      fetch("/api/guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              id,
              name: g.name,
              phone: g.phone,
              showAkad: events.showAkad,
              showResepsi: events.showResepsi,
              hasOverride: true
          })
      }).catch(console.error);
  }
  
  return next;
}

export function useGuestBook(): InviteGuest[] {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => state,
    () => state
  );
}
