/**
 * Penyimpanan file media (foto & audio) berbasis IndexedDB.
 * Aman untuk file besar, tidak terkena batas 5MB localStorage.
 * Nilai di settings hanya berupa referensi "media:<key>".
 */
import { useEffect, useState } from "react";
import { cloudObjectURL, getCloudRead } from "./cloudConfig";

const DB_NAME = "rk-invite-media";
const STORE = "media";
let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

export async function saveMedia(key: string, blob: Blob): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  bustCache(key);
}

export async function readMedia(key: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve((req.result as Blob) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function removeMedia(key: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  bustCache(key);
}

export async function clearMedia(): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  urlCache.forEach((url) => { if (url.startsWith("blob:")) URL.revokeObjectURL(url); });
  urlCache.clear();
}

/* ---- refs ---- */
const urlCache = new Map<string, string>();

function bustCache(key: string) {
  const old = urlCache.get(key);
  if (old) { if (old.startsWith("blob:")) URL.revokeObjectURL(old); urlCache.delete(key); }
}

export const mediaRef = (key: string) => `media:${key}`;
export const isMediaRef = (v?: string | null): v is string => !!v && v.startsWith("media:");

export async function resolveSrc(value: string): Promise<string> {
  if (!isMediaRef(value)) return value;
  const key = value.slice(6);
  const cached = urlCache.get(key);
  if (cached) return cached;
  const blob = await readMedia(key);
  if (blob) {
    const url = URL.createObjectURL(blob);
    urlCache.set(key, url);
    return url;
  }
  const read = getCloudRead();
  if (read) {
    const url = cloudObjectURL(read, `media/${key}`);
    urlCache.set(key, url);
    return url;
  }
  return "";
}

export function useMediaSrc(value?: string | null): string {
  const [src, setSrc] = useState(() => (isMediaRef(value) ? "" : (value ?? "")));
  useEffect(() => {
    let alive = true;
    if (!value) { setSrc(""); }
    else if (!isMediaRef(value)) { setSrc(value); }
    else { resolveSrc(value).then((url) => alive && setSrc(url)); }
    return () => { alive = false; };
  }, [value]);
  return src;
}
