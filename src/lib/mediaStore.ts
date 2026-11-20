/**
 * Media store — IndexedDB for large files (photos, audio).
 * Settings store references as "media:<key>".
 *
 * REACTIVE: Every save/delete bumps a global version counter,
 * causing all useMediaSrc hooks to re-resolve from IndexedDB.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { cloudObjectURL, getCloudRead } from "./cloudConfig";

const DB = "rk-invite-media";
const STORE = "media";
let dbP: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (!dbP) {
    dbP = new Promise((res, rej) => {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE); };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  return dbP;
}

/* ---- reactive version ---- */
let _ver = 0;
const _subs = new Set<() => void>();
function bump() { _ver++; _subs.forEach((f) => f()); }
function useVer(): number {
  return useSyncExternalStore((cb) => { _subs.add(cb); return () => _subs.delete(cb); }, () => _ver);
}

/* ---- blob URL cache ---- */
const cache = new Map<string, string>();
function bust(key: string) {
  const old = cache.get(key);
  if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
  cache.delete(key);
}

/* ========== CRUD ========== */

export async function saveMedia(key: string, blob: Blob): Promise<void> {
  const db = await open();
  await new Promise<void>((ok, no) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => ok();
    tx.onerror = () => no(tx.error);
  });
  bust(key);
  bump();
}

export async function readMedia(key: string): Promise<Blob | null> {
  const db = await open();
  return new Promise((ok, no) => {
    const tx = db.transaction(STORE, "readonly");
    const r = tx.objectStore(STORE).get(key);
    r.onsuccess = () => ok((r.result as Blob) ?? null);
    r.onerror = () => no(r.error);
  });
}

export async function removeMedia(key: string): Promise<void> {
  const db = await open();
  await new Promise<void>((ok, no) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => ok();
    tx.onerror = () => no(tx.error);
  });
  bust(key);
  bump();
}

export async function clearMedia(): Promise<void> {
  const db = await open();
  await new Promise<void>((ok, no) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => ok();
    tx.onerror = () => no(tx.error);
  });
  cache.forEach((u) => { if (u.startsWith("blob:")) URL.revokeObjectURL(u); });
  cache.clear();
  bump();
}

export async function listMediaKeys(): Promise<string[]> {
  const db = await open();
  return new Promise((ok, no) => {
    const tx = db.transaction(STORE, "readonly");
    const r = tx.objectStore(STORE).getAllKeys();
    r.onsuccess = () => ok(r.result as string[]);
    r.onerror = () => no(r.error);
  });
}

/* ========== resolve ========== */

export const mediaRef = (key: string) => `media:${key}`;
export const isMediaRef = (v?: string | null): v is string => !!v && v.startsWith("media:");

export async function resolveSrc(value: string): Promise<string> {
  if (!isMediaRef(value)) return value;
  const key = value.slice(6);
  // Always read fresh from IndexedDB
  const blob = await readMedia(key);
  if (blob) {
    bust(key);
    const url = URL.createObjectURL(blob);
    cache.set(key, url);
    return url;
  }
  // Fallback: cloud URL
  const read = getCloudRead();
  if (read) {
    const url = cloudObjectURL(read, `media/${key}`);
    cache.set(key, url);
    return url;
  }
  return "";
}

/** Reactive hook — re-resolves on every media save/delete */
export function useMediaSrc(value?: string | null): string {
  const ver = useVer();
  const [src, setSrc] = useState("");
  useEffect(() => {
    let alive = true;
    if (!value) setSrc("");
    else if (!isMediaRef(value)) setSrc(value);
    else resolveSrc(value).then((u) => { if (alive) setSrc(u); });
    return () => { alive = false; };
  }, [value, ver]);
  return src;
}
