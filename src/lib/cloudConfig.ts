/**
 * Konfigurasi cloud Supabase.
 * - Admin menyimpan URL + bucket + anonKey di localStorage perangkatnya.
 * - Tamu hanya membaca lewat URL publik tanpa API key.
 * - Link pendek: ?c=<projectRef> → app fetch cloud.json untuk mendapat config lengkap.
 */

export interface CloudRead {
  url: string;
  bucket: string;
  anonKey?: string;
}

export interface CloudAdmin extends CloudRead {
  anonKey: string;
}

const READ_KEY = "rk-cloud-read";
const ADMIN_KEY = "rk-cloud-admin";
const LAST_KEY = "rk-cloud-last";

function readLS<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export const getCloudRead = (): CloudRead | null => readLS<CloudRead>(READ_KEY);
export const saveCloudRead = (cfg: CloudRead) =>
  typeof window !== "undefined" && localStorage.setItem(READ_KEY, JSON.stringify(cfg));

export const getCloudAdmin = (): CloudAdmin | null => readLS<CloudAdmin>(ADMIN_KEY);
export const saveCloudAdmin = (cfg: CloudAdmin) =>
  typeof window !== "undefined" && localStorage.setItem(ADMIN_KEY, JSON.stringify(cfg));
export const clearCloudAdmin = () => typeof window !== "undefined" && localStorage.removeItem(ADMIN_KEY);

export const getLastSync = (): string | null => typeof window !== "undefined" ? localStorage.getItem(LAST_KEY) : null;
export const setLastSync = (iso: string) => typeof window !== "undefined" && localStorage.setItem(LAST_KEY, iso);

export function cloudObjectURL(cfg: CloudRead, path: string): string {
  return `${cfg.url}/storage/v1/object/public/${cfg.bucket}/${path}`;
}

export function extractRef(url: string): string {
  const m = url.match(/^https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return m ? m[1] : "";
}

export function encodeCloudParam(_source?: CloudRead): string {
  const admin = getCloudAdmin();
  const source = _source || getCloudRead();
  const url = admin?.url || source?.url || "";
  return extractRef(url);
}

export function decodeCloudParam(value: string): CloudRead | null {
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("http")) {
      const [url, bucket = "invite", anonKey] = decoded.split("|");
      return { url, bucket, ...(anonKey ? { anonKey } : {}) };
    }
    const ref = decoded.trim();
    if (/^[a-z0-9-]+$/i.test(ref) && ref.length >= 6) {
      return { url: `https://${ref}.supabase.co`, bucket: "invite" };
    }
    return null;
  } catch {
    return null;
  }
}

export async function resolveCloudFromRef(ref: string): Promise<CloudRead | null> {
  try {
    const url = `https://${ref}.supabase.co`;
    const res = await fetch(
      `${url}/storage/v1/object/public/invite/site/cloud.json?t=${Date.now()}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && typeof data.anonKey === "string") {
      return { url: data.url || url, bucket: data.bucket || "invite", anonKey: data.anonKey };
    }
    return { url, bucket: "invite" };
  } catch {
    return null;
  }
}

export function getWritableCloud(): CloudAdmin | null {
  const admin = getCloudAdmin();
  if (admin) return admin;
  const r = getCloudRead();
  if (r?.anonKey) return { url: r.url, bucket: r.bucket, anonKey: r.anonKey };
  return null;
}
