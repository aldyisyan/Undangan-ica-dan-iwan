/**
 * Admin settings — konfigurasi yang bisa diubah dari halaman admin
 * dan disinkronisasi ke Supabase Storage.
 */
import { useSyncExternalStore } from "react";

export interface AdminConfig {
  /** Toggle section-section di halaman undangan */
  showGifts: boolean;
  showDressCode: boolean;
  showStory: boolean;
  showGallery: boolean;
  showRsvp: boolean;
  showVoiceNote: boolean;
  showSaveCalendar: boolean;
  showMapsEmbed: boolean;

  /**
   * Visibilitas acara secara GLOBAL (default untuk semua tamu).
   * Bisa di-override per tamu di tab Tamu.
   */
  globalShowAkad: boolean;
  globalShowResepsi: boolean;

  /** Data rekening/amplop digital */
  gifts: { bank: string; number: string; holder: string; kind: string }[];
  kadoAddress: string;

  /** Supabase Cloud */
  supabaseUrl: string;
  supabaseBucket: string;
  supabaseAnonKey: string;

  /** Admin PIN */
  adminPin: string;

  /** Data pasangan */
  groomName: string;
  groomNick: string;
  groomParents: string;
  groomPhoto: string; // "media:<key>" | URL
  brideName: string;
  brideNick: string;
  brideParents: string;
  bridePhoto: string;
  weddingDate: string; // ISO 8601
  weddingDateLabel: string;
  venue: string;
  address: string;
  mapsUrl: string;
  mapsEmbed: string; // iframe src untuk embed
  akadTime: string;
  akadPlace: string;
  resepsiTime: string;
  resepsiPlace: string;

  /** Musik & voice note */
  musicSrc: string; // "media:<key>" | URL
  voiceNoteEnabled: boolean;
  voiceNoteSrc: string;
  voiceNoteTitle: string;
  voiceNoteHint: string;

  /** Hero / background */
  heroCoverPhoto: string; // "media:<key>" | URL

  /** Galeri foto */
  galleryPhotos: string[]; // array of "media:<key>" | URL

  /** Pesan template WhatsApp undangan */
  waTemplate: string;
}

const DEFAULT: AdminConfig = {
  showGifts: true,
  showDressCode: true,
  showStory: true,
  showGallery: true,
  showRsvp: true,
  showVoiceNote: false,
  showSaveCalendar: true,
  showMapsEmbed: false,
  globalShowAkad: true,
  globalShowResepsi: true,

  gifts: [
    { bank: "BCA", number: "1234567890", holder: "Ica Lestari", kind: "Rekening Tabungan" },
    { bank: "Bank Mandiri", number: "1370009988776", holder: "Iwan Pratama", kind: "Rekening Tabungan" },
    { bank: "GoPay", number: "0812 3456 7890", holder: "Iwan Pratama", kind: "Dompet Digital" },
  ],
  kadoAddress: "Jl. Kenanga Raya No. 12, Kebayoran Baru, Jakarta Selatan",

  supabaseUrl: "",
  supabaseBucket: "invite",
  supabaseAnonKey: "",
  adminPin: "140626",

  groomName: "Iwan Pratama S.Kom.",
  groomNick: "Iwan",
  groomParents: "Putra pertama dari Bapak H. Suryadi Wijaya & Ibu Hj. Marlina Sari",
  groomPhoto: "",
  brideName: "Ica Lestari S.Pd.",
  brideNick: "Ica",
  brideParents: "Putri kedua dari Bapak H. Bambang Prasetyo & Ibu Hj. Ratna Kusuma",
  bridePhoto: "",
  weddingDate: "2026-11-21T09:00:00+07:00",
  weddingDateLabel: "Sabtu, 21 November 2026",
  venue: "The Tribrata Darmawangsa",
  address: "Jl. Darmawangsa III No. 2, Kebayoran Baru, Jakarta Selatan 12160",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=The%20Tribrata%20Darmawangsa%20Jakarta",
  mapsEmbed: "",
  akadTime: "09.00 – 10.00 WIB",
  akadPlace: "Masjid Al-Ikhlas, Lantai 1",
  resepsiTime: "11.00 – 14.00 WIB",
  resepsiPlace: "Grand Ballroom, Lantai 3",

  musicSrc: "",
  voiceNoteEnabled: false,
  voiceNoteSrc: "",
  voiceNoteTitle: "Pesan Suara untuk Anda",
  voiceNoteHint: "Salam hangat dari kami berdua",

  heroCoverPhoto: "",
  galleryPhotos: [],

  waTemplate: `Kepada Yth. {nama}\ndi tempat\n\nAssalamu'alaikum Warahmatullahi Wabarakatuh\n\nTanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pernikahan kami:\n\n{mempelai}\n{tanggal}\n{lokasi}\n\nUndangan digital khusus untuk Anda dapat dibuka melalui tautan berikut:\n{link}\n\nMerupakan kehormatan bagi kami apabila Anda berkenan hadir.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh`,
};

const STORAGE_KEY = "rk-admin-config-v1";

async function fetchSettings() {
  try {
    const res = await fetch("/api/settings");
    if (res.ok) {
      const data = await res.json();
      if (Object.keys(data).length > 0) {
        _state = { ...DEFAULT, ...data };
        emit();
      }
    }
  } catch (e) { console.error(e); }
}

if (typeof window !== "undefined") {
  fetchSettings();
}

function loadConfig(): AdminConfig {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    const stored = JSON.parse(raw) as Partial<AdminConfig>;
    return { ...DEFAULT, ...stored };
  } catch {
    return { ...DEFAULT };
  }
}

let _state: AdminConfig = loadConfig();
const _listeners = new Set<() => void>();

function emit() { _listeners.forEach((l) => l()); }

export function getAdminConfig(): AdminConfig { return _state; }

export function saveAdminConfig(next: Partial<AdminConfig>): void {
  const newState = { ..._state, ...next };
  _state = newState;
  if (typeof window !== "undefined") {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_state)); } catch { /* ignore */ }
  }
  emit();

  // Async push to DB
  fetch("/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(next)
  }).catch(console.error);
}

export function replaceAdminSettings(remote: Record<string, unknown>): void {
  _state = { ...DEFAULT, ...(_state), ...(remote as Partial<AdminConfig>) };
  if (typeof window !== "undefined") {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_state)); } catch { /* ignore */ }
  }
  emit();
}

export function resetAdminConfig(): void {
  _state = { ...DEFAULT };
  if (typeof window !== "undefined") {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }
  emit();
}

export function useAdminConfig(): AdminConfig {
  return useSyncExternalStore(
    (cb) => { _listeners.add(cb); return () => _listeners.delete(cb); },
    () => _state,
    () => _state
  );
}
