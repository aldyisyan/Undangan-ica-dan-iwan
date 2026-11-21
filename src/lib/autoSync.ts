/**
 * Auto-sync: setiap perubahan konfigurasi admin otomatis di-push ke Supabase
 * setelah jeda singkat (debounce). Admin tidak perlu lagi mencari tombol
 * "Sync" di tiap tab — cukup ubah, langsung tersimpan.
 *
 * Statusnya ditampilkan di header admin lewat `useSyncStatus()`.
 */
import { useEffect, useRef } from "react";
import { useSyncExternalStore } from "react";
import { getAdminConfig, useAdminConfig } from "./adminSettings";
import { getCloudAdmin, getLastSync } from "./cloudConfig";
import { syncToCloud } from "./cloud";

export type SyncStatus = "offline" | "pending" | "syncing" | "synced" | "error";

let _status: SyncStatus = "offline";
const _subs = new Set<() => void>();

function setStatus(next: SyncStatus) {
  if (_status === next) return;
  _status = next;
  _subs.forEach((f) => f());
}

export function getSyncStatus(): SyncStatus { return _status; }

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    (cb) => { _subs.add(cb); return () => _subs.delete(cb); },
    () => _status
  );
}

export function getLastSyncLabel(): string | null {
  const iso = getLastSync();
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  const diff = Math.max(0, Date.now() - t);
  const menit = Math.floor(diff / 60000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  return `${Math.floor(jam / 24)} hari lalu`;
}

const DEBOUNCE_MS = 2600;
let _timer: number | null = null;
let _busy = false;
let _queued = false;

async function runSync(): Promise<void> {
  const admin = getCloudAdmin();
  if (!admin) { setStatus("offline"); return; }
  if (_busy) { _queued = true; return; }
  _busy = true;
  setStatus("syncing");
  try {
    const ok = await syncToCloud(admin, getAdminConfig() as unknown as Record<string, unknown>);
    setStatus(ok ? "synced" : "error");
  } catch {
    setStatus("error");
  } finally {
    _busy = false;
    if (_queued) { _queued = false; void runSync(); }
  }
}

/** Re-export for direct usage. */
export { pullFromCloud } from "./cloud";

/** Paksa sinkron sekarang (dipakai tombol manual). */
export async function syncNow(): Promise<boolean> {
  const admin = getCloudAdmin();
  if (!admin) { setStatus("offline"); return false; }
  if (_timer) { window.clearTimeout(_timer); _timer = null; }
  setStatus("syncing");
  try {
    const ok = await syncToCloud(admin, getAdminConfig() as unknown as Record<string, unknown>);
    setStatus(ok ? "synced" : "error");
    return ok;
  } catch {
    setStatus("error");
    return false;
  }
}

/**
 * Pasang di halaman admin. Otomatis men-trigger sync setiap kali config berubah.
 */
export function useAutoSync(): SyncStatus {
  const cfg = useAdminConfig();
  const first = useRef(true);
  const status = useSyncStatus();

  useEffect(() => {
    if (first.current) {
      first.current = false;
      setStatus(getCloudAdmin() ? "synced" : "offline");
      return;
    }
    if (!getCloudAdmin()) { setStatus("offline"); return; }

    setStatus("pending");
    if (_timer !== null) window.clearTimeout(_timer);
    _timer = window.setTimeout(() => {
      _timer = null;
      void runSync();
    }, DEBOUNCE_MS);

    return () => {
      if (_timer !== null) { window.clearTimeout(_timer); _timer = null; }
    };
  }, [cfg]);

  return status;
}
