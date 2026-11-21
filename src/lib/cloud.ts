/**
 * Cloud sync via Supabase Storage (REST, no SDK).
 *
 * ARSITEKTUR:
 * ───────────
 * Ada dua set credential:
 *   - CloudAdmin  = URL + bucket + anonKey → hanya tersimpan di perangkat admin.
 *   - CloudRead   = URL + bucket (+ anonKey bila cloud.json memuat key) → tersimpan di
 *                   semua perangkat yang pernah membuka link undangan.
 *
 * MASALAH LAMA:
 *   Guest device tidak punya anonKey karena tidak pernah login sebagai admin.
 *   Rsvp.tsx memakai getCloudAdmin() yang null di perangkat tamu →
 *   ucapan hanya tersimpan di lokal, tidak pernah dikirim ke Supabase.
 *
 * SOLUSI:
 *   1. cloud.json (file publik di bucket) WAJIB memuat anonKey saat admin push.
 *   2. Saat tamu buka link ?c=xxx, app fetch cloud.json → simpan anonKey ke CloudRead.
 *   3. Semua fungsi yang perlu menulis (pushWishesToCloud) pakai getWritableCloud()
 *      bukan getCloudAdmin(), sehingga guest punya credential yang cukup.
 *   4. pullFromCloud memakai CloudRead (public URL), tidak butuh anonKey.
 *   5. Admin push/delete tetap bisa pakai CloudAdmin (lebih privileged).
 */

import {
  type CloudAdmin,
  type CloudRead,
  cloudObjectURL,
  getCloudRead,
  getWritableCloud,
  setLastSync,
} from "./cloudConfig";
import { replaceWishesFromCloud, loadWishes, type Wish } from "./wishes";
import { replaceGuestBookFromCloud, loadGuestBook, type InviteGuest } from "./guestBook";
import { readMedia, isMediaRef, listMediaKeys } from "./mediaStore";

/* ------------------------------------------------------------------ READ */

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const fetchRemoteSettings = (read: CloudRead) =>
  fetchJson<Record<string, unknown>>(cloudObjectURL(read, "site/settings.json"));
export const fetchRemoteWishes = (read: CloudRead) =>
  fetchJson<Wish[]>(cloudObjectURL(read, "site/wishes.json"));
export const fetchRemoteGuestBook = (read: CloudRead) =>
  fetchJson<InviteGuest[]>(cloudObjectURL(read, "site/guests.json"));

/* --------------------------------------------------------------- PULL */

let _pulling = false;

/**
 * Tarik data terbaru dari cloud dan timpa state lokal.
 * Bisa dipanggil dari perangkat mana pun (tamu maupun admin).
 * Tidak butuh anonKey — cukup URL publik.
 */
export async function pullFromCloud(): Promise<boolean> {
  if (_pulling) return false;
  _pulling = true;
  try {
    const read = getCloudRead();
    if (!read) return false;

    const [remoteSettings, remoteWishes, remoteGuests] = await Promise.all([
      fetchRemoteSettings(read),
      fetchRemoteWishes(read),
      fetchRemoteGuestBook(read),
    ]);

    let ok = false;

    if (remoteSettings) {
      const { replaceAdminSettings } = await import("./adminSettings");
      replaceAdminSettings(remoteSettings);
      ok = true;
    }
    if (remoteWishes) {
      replaceWishesFromCloud(remoteWishes);  // cloud = sumber kebenaran
      ok = true;
    }
    if (remoteGuests) {
      replaceGuestBookFromCloud(remoteGuests); // cloud = sumber kebenaran
      ok = true;
    }
    return ok;
  } finally {
    _pulling = false;
  }
}

/* --------------------------------------------------------------- UPLOAD */

async function uploadObject(
  cred: CloudAdmin,
  path: string,
  blob: Blob,
  ct: string
): Promise<boolean> {
  const doUpload = async () => {
    const res = await fetch(
      `${cred.url}/storage/v1/object/${cred.bucket}/${path}`,
      {
        method: "POST",
        headers: {
          apikey: cred.anonKey,
          authorization: `Bearer ${cred.anonKey}`,
          "content-type": ct,
          "x-upsert": "true",
          "cache-control": "public, max-age=0, must-revalidate",
        },
        body: blob,
      }
    );
    return res.ok;
  };
  try {
    if (await doUpload()) return true;
    await new Promise((r) => setTimeout(r, 800));
    return await doUpload();
  } catch {
    try {
      await new Promise((r) => setTimeout(r, 800));
      return await doUpload();
    } catch {
      return false;
    }
  }
}

/* --------------------------------------------------------------- GUEST RSVP */

/**
 * Dipanggil oleh perangkat TAMU saat submit RSVP.
 *
 * Memakai getWritableCloud() bukan getCloudAdmin(), sehingga bekerja juga
 * di perangkat tamu yang hanya punya CloudRead + anonKey dari cloud.json publik.
 */
export async function pushWishesToCloud(
  _ignored: CloudAdmin | null, // backward-compat — kini tidak dipakai
  newWish: Wish
): Promise<boolean> {
  const cred = getWritableCloud();
  if (!cred) return false;

  const read = getCloudRead();
  if (!read) return false;

  const remote = (await fetchRemoteWishes(read)) ?? [];
  const isDup = remote.some((w) => w.at === newWish.at && w.name === newWish.name);
  const next = isDup ? remote : [newWish, ...remote].sort((a, b) => b.at - a.at);

  const blob = new Blob([JSON.stringify(next)], { type: "application/json" });
  const ok = await uploadObject(cred, "site/wishes.json", blob, "application/json; charset=utf-8");
  if (ok) replaceWishesFromCloud(next);
  return ok;
}

/* --------------------------------------------------------------- ADMIN ONLY */

/**
 * Timpa penuh wishes.json di cloud — hanya admin.
 */
export async function forceReplaceWishesCloud(
  admin: CloudAdmin,
  wishes: Wish[]
): Promise<boolean> {
  const ok = await uploadObject(
    admin,
    "site/wishes.json",
    new Blob([JSON.stringify(wishes)], { type: "application/json" }),
    "application/json; charset=utf-8"
  );
  if (ok) replaceWishesFromCloud(wishes);
  return ok;
}

/**
 * Timpa penuh guests.json di cloud — hanya admin.
 */
export async function pushGuestBookToCloud(
  admin: CloudAdmin,
  guests: InviteGuest[]
): Promise<boolean> {
  const ok = await uploadObject(
    admin,
    "site/guests.json",
    new Blob([JSON.stringify(guests)], { type: "application/json" }),
    "application/json; charset=utf-8"
  );
  if (ok) replaceGuestBookFromCloud(guests);
  return ok;
}

/* --------------------------------------------------------------- SYNC ALL */

function collectMediaRefs(s: Record<string, unknown>): string[] {
  const refs: string[] = [];
  const push = (v?: unknown) => {
    if (typeof v === "string" && isMediaRef(v)) refs.push(v.slice(6));
  };
  push(s.heroCoverPhoto);
  push(s.groomPhoto);
  push(s.bridePhoto);
  push(s.musicSrc);
  push(s.voiceNoteSrc);
  push(s.closingPhoto);
  push(s.calendarPhoto);
  push(s.mapsPhoto);
  if (Array.isArray(s.galleryPhotos))
    (s.galleryPhotos as string[]).forEach((g) => push(g));
  if (Array.isArray(s.storyPhotos))
    (s.storyPhotos as string[]).forEach((g) => push(g));
  return [...new Set(refs)];
}

/**
 * Push semua data admin ke Supabase: settings, media, wishes, guests, cloud.json.
 * Hanya bisa dijalankan dari perangkat admin yang punya CloudAdmin.
 */
export async function syncToCloud(
  admin: CloudAdmin,
  settings: Record<string, unknown>,
  onProgress?: (done: number, total: number) => void
): Promise<boolean> {
  try {
    const mediaKeys = collectMediaRefs(settings);
    let allKeys: string[] = [];
    try { allKeys = await listMediaKeys(); } catch { /* ignore */ }
    const uniqueKeys = [...new Set([...mediaKeys, ...allKeys])];

    const total = uniqueKeys.length + 4;
    let done = 0;

    // 1. Upload media blobs
    for (const key of uniqueKeys) {
      const blob = await readMedia(key);
      if (blob) {
        const ct =
          blob.type ||
          (key.includes("music") || key.includes("voice") ? "audio/mpeg" : "image/jpeg");
        await uploadObject(admin, `media/${key}`, blob, ct);
      }
      onProgress?.(++done, total);
    }

    // 2. settings.json
    const ok = await uploadObject(
      admin,
      "site/settings.json",
      new Blob([JSON.stringify(settings)], { type: "application/json" }),
      "application/json; charset=utf-8"
    );
    if (!ok) return false;
    onProgress?.(++done, total);

    // 3. wishes.json (admin = sumber kebenaran saat sync penuh)
    await uploadObject(
      admin,
      "site/wishes.json",
      new Blob([JSON.stringify(loadWishes())], { type: "application/json" }),
      "application/json; charset=utf-8"
    );
    onProgress?.(++done, total);

    // 4. guests.json (admin = sumber kebenaran saat sync penuh)
    await uploadObject(
      admin,
      "site/guests.json",
      new Blob([JSON.stringify(loadGuestBook())], { type: "application/json" }),
      "application/json; charset=utf-8"
    );
    onProgress?.(++done, total);

    // 5. cloud.json — WAJIB memuat anonKey agar perangkat tamu bisa upload ucapan
    await uploadObject(
      admin,
      "site/cloud.json",
      new Blob(
        [
          JSON.stringify({
            url: admin.url,
            bucket: admin.bucket,
            anonKey: admin.anonKey, // ← kunci: tamu baca ini lalu bisa push
          }),
        ],
        { type: "application/json" }
      ),
      "application/json; charset=utf-8"
    );
    onProgress?.(++done, total);

    setLastSync(new Date().toISOString());
    return true;
  } catch {
    return false;
  }
}

/* --------------------------------------------------------------- TEST */

export interface CloudTestResult {
  ok: boolean;
  status?: number;
  hint?: string;
}

export async function testCloudConnection(
  admin: CloudAdmin
): Promise<CloudTestResult> {
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(admin.url))
    return {
      ok: false,
      hint: "Format Project URL salah. Harus https://abcdefgh.supabase.co",
    };
  if (
    !admin.anonKey.startsWith("eyJ") &&
    !admin.anonKey.startsWith("sb_publishable")
  )
    return { ok: false, hint: "Gunakan anon/publishable key." };
  try {
    const res = await fetch(
      `${admin.url}/storage/v1/object/${admin.bucket}/site/ping.txt`,
      {
        method: "POST",
        headers: {
          apikey: admin.anonKey,
          authorization: `Bearer ${admin.anonKey}`,
          "content-type": "text/plain",
          "x-upsert": "true",
        },
        body: new Blob(["ok"], { type: "text/plain" }),
      }
    );
    if (res.ok) return { ok: true };
    let msg = "";
    try {
      const b = await res.json();
      msg = String(b?.message || b?.error || "");
    } catch { /* ignore */ }
    if (res.status === 403 || /row.level security/i.test(msg))
      return {
        ok: false,
        status: 403,
        hint: "RLS menolak. Jalankan 4 policy SQL (SELECT, INSERT, UPDATE, DELETE) untuk role anon.",
      };
    if (/bucket not found/i.test(msg) || res.status === 404)
      return {
        ok: false,
        status: 404,
        hint: `Bucket "${admin.bucket}" tidak ditemukan.`,
      };
    if (res.status === 401)
      return { ok: false, status: 401, hint: "API key ditolak." };
    if (res.status >= 500)
      return {
        ok: false,
        status: res.status,
        hint: "Project pause/error. Resume di dashboard.",
      };
    return {
      ok: false,
      status: res.status,
      hint: `Error ${res.status}${msg ? `: ${msg}` : ""}`,
    };
  } catch {
    return { ok: false, hint: "Tidak dapat menjangkau server." };
  }
}
