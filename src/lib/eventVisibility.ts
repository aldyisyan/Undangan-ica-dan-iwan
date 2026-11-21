/**
 * Sistem visibilitas acara per tamu.
 *
 * Prioritas sumber data:
 *  1. Jika URL punya gid dan guest ditemukan di DB/cloud -> pakai override guest terbaru.
 *  2. Jika tidak ada gid / guest belum ditemukan -> fallback ke param URL ea & er.
 *  3. Jika param juga tidak ada -> ikut setting global admin.
 */
import { useMemo } from "react";
import { getAdminConfig, useAdminConfig } from "./adminSettings";
import { findGuestById, getGuestIdParam, loadGuestBook, useGuestBook } from "./guestBook";

export interface EventVisibility {
  showAkad: boolean;
  showResepsi: boolean;
}

export function getEventVisibilityFromURL(): EventVisibility {
  const cfg = getAdminConfig();
  const guests = loadGuestBook();
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();

  const gid = params.get("gid")?.trim() || null;
  const guest = findGuestById(gid, guests);
  if (guest?.events) {
    return {
      showAkad: guest.events.showAkad,
      showResepsi: guest.events.showResepsi,
    };
  }

  const ea = params.get("ea");
  const er = params.get("er");

  return {
    showAkad: ea !== null ? ea !== "0" : cfg.globalShowAkad,
    showResepsi: er !== null ? er !== "0" : cfg.globalShowResepsi,
  };
}

/**
 * Selalu tulis DUA parameter eksplisit (ea dan er),
 * agar link tamu lama tetap bisa fallback bila gid belum terselesaikan.
 */
export function buildEventParams(showAkad: boolean, showResepsi: boolean): string {
  return `ea=${showAkad ? 1 : 0}&er=${showResepsi ? 1 : 0}`;
}

/** Hook reaktif: ikut update saat guestbook cloud masuk / global setting berubah */
export function useEventVisibility(): EventVisibility {
  const cfg = useAdminConfig();
  const guests = useGuestBook();
  return useMemo(() => {
    void cfg;
    void guests;
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const gid = getGuestIdParam();
    const guest = findGuestById(gid, guests);
    if (guest?.events) return { showAkad: guest.events.showAkad, showResepsi: guest.events.showResepsi };
    const ea = params.get("ea");
    const er = params.get("er");
    return {
      showAkad: ea !== null ? ea !== "0" : cfg.globalShowAkad,
      showResepsi: er !== null ? er !== "0" : cfg.globalShowResepsi,
    };
  }, [cfg.globalShowAkad, cfg.globalShowResepsi, guests]);
}
