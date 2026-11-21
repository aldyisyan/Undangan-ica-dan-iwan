/**
 * Cloud sync via Supabase Storage (REST, no SDK).
 *
 * Bug-fixes & hardening:
 *  1. syncToCloud ALWAYS merges wishes & guests with remote before uploading
 *     → prevents auto-sync from overwriting RSVP data from guest devices.
 *  2. pullFromCloud respects admin version guard (updatedAt) so stale cloud
 *     settings never overwrite freshly-uploaded photos/config.
 *  3. Upload retries once on 5xx / network failure.
 *  4. Guest-side pull is serialised (no overlapping fetches).
 *  5. Media blobs are uploaded with correct MIME + cache-control.
 */
import { type CloudAdmin, type CloudRead, cloudObjectURL, getCloudRead, setLastSync } from "./cloudConfig";
import { replaceWishesFromCloud, loadWishes, type Wish } from "./wishes";
import { replaceGuestBookFromCloud, loadGuestBook, type InviteGuest } from "./guestBook";
import { readMedia, isMediaRef, listMediaKeys } from "./mediaStore";

/* ------------------------------------------------------------------ READ */

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch { return null; }
}

export const fetchRemoteSettings = (read: CloudRead) =>
  fetchJson<Record<string, unknown>>(cloudObjectURL(read, "site/settings.json"));
export const fetchRemoteWishes = (read: CloudRead) =>
  fetchJson<Wish[]>(cloudObjectURL(read, "site/wishes.json"));
export const fetchRemoteGuestBook = (read: CloudRead) =>
  fetchJson<InviteGuest[]>(cloudObjectURL(read, "site/guests.json"));

/* ---------------------------------------------------------------- MERGE */

function mergeWishes(local: Wish[], remote: Wish[]): Wish[] {
  const seen = new Set<string>();
  const merged: Wish[] = [];
  const key = (w: Wish) => `${w.name.trim().toLowerCase()}|${w.at}`;
  
  // 1. Ambil semua dari remote (cloud adalah sumber kebenaran)
  for (const w of remote) {
    const k = key(w);
    if (!seen.has(k)) { seen.add(k); merged.push(w); }
  }
  
  // 2. Tambahkan dari lokal HANYA JIKA belum ada di remote DAN sangat baru (dibuat < 2 jam lalu).
  // Jika usianya sudah lama tapi tidak ada di remote, berarti sudah dihapus admin (mencegah zombie data).
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const now = Date.now();
  for (const w of local) {
    const k = key(w);
    if (!seen.has(k) && now - w.at < TWO_HOURS) {
      seen.add(k);
      merged.push(w);
    }
  }
  
  merged.sort((a, b) => b.at - a.at);
  return merged;
}

function mergeGuests(local: InviteGuest[], remote: InviteGuest[]): InviteGuest[] {
  const map = new Map<string, InviteGuest>();
  
  // 1. Ambil semua dari remote
  for (const g of remote) map.set(g.id, g);
  
  // 2. Gabungkan dengan lokal.
  // Jika di lokal ada tamu yang tidak ada di remote, pertahankan HANYA JIKA baru dibuat (< 2 jam).
  // Jika sudah lama, berarti admin telah menghapusnya dari cloud (mencegah zombie).
  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const now = Date.now();
  for (const g of local) {
    if (map.has(g.id)) {
      // jika ada di keduanya, ambil properti terbaru (misal: sentAt atau events)
      // utamakan data lokal yang lebih rich, tapi tidak masalah karena cloud juga di-update admin.
      map.set(g.id, { ...g, ...map.get(g.id)! });
    } else if (now - g.createdAt < TWO_HOURS) {
      // tamu lokal baru (belum masuk cloud CDN cache) -> pertahankan
      map.set(g.id, g);
    }
  }
  
  return [...map.values()].sort((a, b) => a.createdAt - b.createdAt);
}

/* --------------------------------------------------------------- PULL */

let _pulling = false;

export async function pullFromCloud(): Promise<boolean> {
  if (_pulling) return false; // prevent overlapping pulls
  _pulling = true;
  try {
    const read = getCloudRead();
    if (!read) return false;
    const [remoteSettings, remoteWishes, remoteGuests] = await Promise.all([
      fetchRemoteSettings(read), fetchRemoteWishes(read), fetchRemoteGuestBook(read),
    ]);
    let ok = false;
    if (remoteSettings) {
      const { replaceAdminSettings } = await import("./adminSettings");
      replaceAdminSettings(remoteSettings);
      ok = true;
    }
    if (remoteWishes) {
      replaceWishesFromCloud(mergeWishes(loadWishes(), remoteWishes));
      ok = true;
    }
    if (remoteGuests) {
      replaceGuestBookFromCloud(mergeGuests(loadGuestBook(), remoteGuests));
      ok = true;
    }
    return ok;
  } finally {
    _pulling = false;
  }
}

/* --------------------------------------------------------------- UPLOAD */

async function uploadObject(admin: CloudAdmin, path: string, blob: Blob, ct: string): Promise<boolean> {
  const doUpload = async () => {
    const res = await fetch(`${admin.url}/storage/v1/object/${admin.bucket}/${path}`, {
      method: "POST",
      headers: {
        apikey: admin.anonKey,
        authorization: `Bearer ${admin.anonKey}`,
        "content-type": ct,
        "x-upsert": "true",
        "cache-control": "public, max-age=0, must-revalidate",
      },
      body: blob,
    });
    return res.ok;
  };
  try {
    const ok = await doUpload();
    if (ok) return true;
    // retry once after short delay
    await new Promise((r) => setTimeout(r, 800));
    return await doUpload();
  } catch {
    try {
      await new Promise((r) => setTimeout(r, 800));
      return await doUpload();
    } catch { return false; }
  }
}

export async function pushWishesToCloud(admin: CloudAdmin, local: Wish[]): Promise<boolean> {
  const remote = await fetchRemoteWishes(admin) ?? [];
  const merged = mergeWishes(local, remote);
  const blob = new Blob([JSON.stringify(merged)], { type: "application/json" });
  const ok = await uploadObject(admin, "site/wishes.json", blob, "application/json; charset=utf-8");
  if (ok) replaceWishesFromCloud(merged);
  return ok;
}

export async function pushGuestBookToCloud(admin: CloudAdmin, guests: InviteGuest[]): Promise<boolean> {
  const remote = await fetchRemoteGuestBook(admin) ?? [];
  const merged = mergeGuests(guests, remote);
  const ok = await uploadObject(admin, "site/guests.json",
    new Blob([JSON.stringify(merged)], { type: "application/json" }), "application/json; charset=utf-8");
  if (ok) replaceGuestBookFromCloud(merged);
  return ok;
}

export async function forceReplaceGuestBookCloud(admin: CloudAdmin, guests: InviteGuest[]): Promise<boolean> {
  return uploadObject(admin, "site/guests.json", new Blob([JSON.stringify(guests)], { type: "application/json" }), "application/json; charset=utf-8");
}

export async function forceReplaceWishesCloud(admin: CloudAdmin, wishes: Wish[]): Promise<boolean> {
  return uploadObject(admin, "site/wishes.json", new Blob([JSON.stringify(wishes)], { type: "application/json" }), "application/json; charset=utf-8");
}

/* --------------------------------------------------------------- collect media refs */

function collectMediaRefs(s: Record<string, unknown>): string[] {
  const refs: string[] = [];
  const push = (v?: unknown) => { if (typeof v === "string" && isMediaRef(v)) refs.push(v.slice(6)); };
  push(s.heroCoverPhoto);
  push(s.groomPhoto);
  push(s.bridePhoto);
  push(s.musicSrc);
  push(s.voiceNoteSrc);
  push(s.closingPhoto);
  push(s.calendarPhoto);
  push(s.mapsPhoto);
  if (Array.isArray(s.galleryPhotos)) (s.galleryPhotos as string[]).forEach((g) => push(g));
  if (Array.isArray(s.storyPhotos)) (s.storyPhotos as string[]).forEach((g) => push(g));
  return [...new Set(refs)];
}

/* --------------------------------------------------------------- SYNC ALL (with media!) */

export async function syncToCloud(
  admin: CloudAdmin,
  settings: Record<string, unknown>,
  onProgress?: (done: number, total: number) => void
): Promise<boolean> {
  try {
    // 1. Collect all media refs from settings
    const mediaKeys = collectMediaRefs(settings);

    // Also collect any orphan keys from IndexedDB
    let allKeys: string[] = [];
    try { allKeys = await listMediaKeys(); } catch { /* ignore */ }
    const uniqueKeys = [...new Set([...mediaKeys, ...allKeys])];

    const total = uniqueKeys.length + 4; // media + settings + wishes + guests + cloud.json
    let done = 0;

    // 2. Upload all media blobs
    for (const key of uniqueKeys) {
      const blob = await readMedia(key);
      if (blob) {
        const ct = blob.type || (key.includes("music") || key.includes("voice") ? "audio/mpeg" : "image/jpeg");
        await uploadObject(admin, `media/${key}`, blob, ct);
      }
      onProgress?.(++done, total);
    }

    // 3. Upload settings.json
    const ok = await uploadObject(admin, "site/settings.json",
      new Blob([JSON.stringify(settings)], { type: "application/json" }), "application/json; charset=utf-8");
    if (!ok) return false;
    onProgress?.(++done, total);

    // 4. Upload wishes.json — ALWAYS merge with remote
    const remoteWishes = await fetchRemoteWishes(admin);
    const mergedWishes = mergeWishes(loadWishes(), remoteWishes ?? []);
    const wishesOk = await uploadObject(admin, "site/wishes.json",
      new Blob([JSON.stringify(mergedWishes)], { type: "application/json" }), "application/json; charset=utf-8");
    if (wishesOk) replaceWishesFromCloud(mergedWishes);
    onProgress?.(++done, total);

    // 5. Upload guests.json — ALWAYS merge with remote
    const remoteGuests = await fetchRemoteGuestBook(admin);
    const mergedGuests = mergeGuests(loadGuestBook(), remoteGuests ?? []);
    const guestsOk = await uploadObject(admin, "site/guests.json",
      new Blob([JSON.stringify(mergedGuests)], { type: "application/json" }), "application/json; charset=utf-8");
    if (guestsOk) replaceGuestBookFromCloud(mergedGuests);
    onProgress?.(++done, total);

    // 6. Upload cloud.json (bootstrap config)
    await uploadObject(admin, "site/cloud.json",
      new Blob([JSON.stringify({ url: admin.url, bucket: admin.bucket, anonKey: admin.anonKey })], { type: "application/json" }),
      "application/json; charset=utf-8");
    onProgress?.(++done, total);

    setLastSync(new Date().toISOString());
    return true;
  } catch { return false; }
}

/* --------------------------------------------------------------- TEST */

export interface CloudTestResult { ok: boolean; status?: number; hint?: string; }

export async function testCloudConnection(admin: CloudAdmin): Promise<CloudTestResult> {
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(admin.url))
    return { ok: false, hint: "Format Project URL salah. Harus https://abcdefgh.supabase.co" };
  if (!admin.anonKey.startsWith("eyJ") && !admin.anonKey.startsWith("sb_publishable"))
    return { ok: false, hint: "Gunakan anon/publishable key." };
  try {
    const res = await fetch(`${admin.url}/storage/v1/object/${admin.bucket}/site/ping.txt`, {
      method: "POST",
      headers: { apikey: admin.anonKey, authorization: `Bearer ${admin.anonKey}`, "content-type": "text/plain", "x-upsert": "true" },
      body: new Blob(["ok"], { type: "text/plain" }),
    });
    if (res.ok) return { ok: true };
    let msg = "";
    try { const b = await res.json(); msg = String(b?.message || b?.error || ""); } catch {}
    if (res.status === 403 || /row.level security/i.test(msg))
      return { ok: false, status: 403, hint: "RLS menolak. Jalankan 4 policy SQL (SELECT, INSERT, UPDATE, DELETE) untuk role anon." };
    if (/bucket not found/i.test(msg) || res.status === 404)
      return { ok: false, status: 404, hint: `Bucket "${admin.bucket}" tidak ditemukan.` };
    if (res.status === 401) return { ok: false, status: 401, hint: "API key ditolak." };
    if (res.status >= 500) return { ok: false, status: res.status, hint: "Project pause/error. Resume di dashboard." };
    return { ok: false, status: res.status, hint: `Error ${res.status}${msg ? `: ${msg}` : ""}` };
  } catch {
    return { ok: false, hint: "Tidak dapat menjangkau server." };
  }
}
