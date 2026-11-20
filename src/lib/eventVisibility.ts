/**
 * Sistem visibilitas acara per tamu.
 *
 * Admin mengatur global default (globalShowAkad / globalShowResepsi).
 * Per tamu bisa dioverride: URL mengandung param ?ea=0 (sembunyikan akad) ?er=0 (sembunyikan resepsi).
 *
 * Format link tamu:
 *   https://site/?to=Nama&c=ref&ea=1&er=1
 *   ea = show akad   (1=tampil, 0=sembunyikan)
 *   er = show resepsi (1=tampil, 0=sembunyikan)
 *
 * Jika param tidak ada di URL → ikut setting global admin.
 */
import { getAdminConfig } from "./adminSettings";

export interface EventVisibility {
  showAkad: boolean;
  showResepsi: boolean;
}

/** Baca dari URL search params (sisi tamu) */
export function getEventVisibilityFromURL(): EventVisibility {
  const cfg = getAdminConfig();
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();

  const ea = params.get("ea");
  const er = params.get("er");

  return {
    showAkad: ea !== null ? ea !== "0" : cfg.globalShowAkad,
    showResepsi: er !== null ? er !== "0" : cfg.globalShowResepsi,
  };
}

/** Bangun URL param visibilitas acara */
export function buildEventParams(showAkad: boolean, showResepsi: boolean): string {
  const parts: string[] = [];
  if (!showAkad) parts.push("ea=0");
  if (!showResepsi) parts.push("er=0");
  // jika keduanya true (default) → tidak perlu param tambahan
  return parts.join("&");
}

/** Hook untuk membaca visibilitas acara secara reaktif */
import { useMemo } from "react";

export function useEventVisibility(): EventVisibility {
  return useMemo(() => getEventVisibilityFromURL(), []);
}
