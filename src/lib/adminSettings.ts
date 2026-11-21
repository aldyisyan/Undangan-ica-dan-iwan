/**
 * Admin settings — konfigurasi yang bisa diubah dari halaman admin
 * dan disinkronisasi ke Supabase Storage.
 *
 * PENTING: setiap perubahan lokal menaikkan `updatedAt`. Saat cloud di-pull,
 * konfigurasi remote HANYA diterapkan bila `updatedAt` remote tidak lebih lama
 * dari lokal. Ini mencegah settings.json yang basi menimpa foto/setting yang
 * baru saja di-upload admin (kasus "file sudah di-upload tapi web tetap default").
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

  /** Foto Love Story — per indeks cerita; string kosong = pakai foto bawaan */
  storyPhotos: string[];

  /** Foto penutup — gambar paling bawah undangan. Kosong = ilustrasi bawaan. */
  closingPhoto: string;

  /**
   * Visual kalender countdown. Kosong = kalender grid bawaan.
   * Diisi foto → visual berpindah ke foto (bisa dikosongkan kembali untuk switch balik).
   */
  calendarPhoto: string;

  /** Visual peta lokasi. Kosong = embed / tombol bawaan. Diisi foto → tampil foto. */
  mapsPhoto: string;

  /** Dress code — seluruh isi section "Palet Tamu" di halaman undangan */
  dressKicker: string;
  dressTitle: string;
  dressAside: string;
  dressNote: string;
  dressSwatches: { name: string; hex: string }[];
  dressMaleDos: string[];
  dressMaleDont: string;
  dressFemaleDos: string[];
  dressFemaleDont: string;
  /** Catatan kecil pada kartu Resepsi di section Rangkaian Acara */
  resepsiNote: string;

  /** Pesan template WhatsApp undangan */
  waTemplate: string;

  /**
   * Epoch ms dari perubahan terakhir. Dipakai sebagai versi konfigurasi agar
   * pull cloud yang basi tidak menimpa perubahan lokal yang lebih baru.
   */
  updatedAt: number;
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
  storyPhotos: [],
  closingPhoto: "",
  calendarPhoto: "",
  mapsPhoto: "",

  dressKicker: "Dress Code Suggestions",
  dressTitle: "Palet Tamu",
  dressAside: "hangat, netral, senada",
  dressNote: "Kenakan salah satu warna di atas — atau campuran harmonis di antaranya.",
  dressSwatches: [
    { name: "Hitam Pekat", hex: "#1E1B18" },
    { name: "Sage Olive", hex: "#7D8471" },
    { name: "Nude Beige", hex: "#E7D3BE" },
    { name: "Terakota", hex: "#B5533C" },
  ],
  dressMaleDos: [
    "Jas atau blazer navy/boneka dengan kemeja nude atau sage",
    "Smart casual: kemeja lengan panjang tanpa dasi, celana bahan",
    "Sepatu kulit cokelat atau hitam, jam tangan sederhana",
    "Bisa ditambahkan sapu tangan terakota di saku jas",
  ],
  dressMaleDont: "Hindari kaos berlogo besar, sandal, dan celana jeans robek.",
  dressFemaleDos: [
    "Dress midi atau maxi bernuansa sage, nude, atau terakota",
    "Kebaya modern & kain senada sangat kami tunggu kehadirannya",
    "Kerudung atau selendang dengan warna turunan palet di atas",
    "Flat shoes atau heels rendah — acara berlangsung duduk",
  ],
  dressFemaleDont:
    "Mohon tidak mengenakan pakaian serba putih, karena mempelai wanita mengenakan putih.",
  resepsiNote: "Dress code: palet sage, nude & terakota.",

  waTemplate: `Kepada Yth. {nama}\ndi tempat\n\nAssalamu'alaikum Warahmatullahi Wabarakatuh\n\nTanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pernikahan kami:\n\n{mempelai}\n{tanggal}\n{lokasi}\n\nUndangan digital khusus untuk Anda dapat dibuka melalui tautan berikut:\n{link}\n\nMerupakan kehormatan bagi kami apabila Anda berkenan hadir.\n\nWassalamu'alaikum Warahmatullahi Wabarakatuh`,

  updatedAt: 0,
};

const STORAGE_KEY = "rk-admin-config-v1";

function loadConfig(): AdminConfig {
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

/** Versi konfigurasi lokal saat ini (epoch ms). */
export function getLocalVersion(): number {
  return typeof _state.updatedAt === "number" && Number.isFinite(_state.updatedAt) ? _state.updatedAt : 0;
}

export function saveAdminConfig(next: Partial<AdminConfig>): void {
  _state = { ..._state, ...next, updatedAt: Date.now() };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_state)); } catch { /* ignore */ }
  emit();
}

/**
 * Terapkan konfigurasi dari cloud.
 * Aman terhadap data basi: bawaan versi remote lebih lama dari lokal → dilewati.
 */
export function replaceAdminSettings(remote: Record<string, unknown>): void {
  const remoteVersion = Number.isFinite(Number(remote.updatedAt)) ? Number(remote.updatedAt) : 0;
  if (remoteVersion < getLocalVersion()) return; // lokal lebih baru — jangan ditimpa

  _state = { ...DEFAULT, ...(_state), ...(remote as Partial<AdminConfig>) };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_state)); } catch { /* ignore */ }
  emit();
}

export function resetAdminConfig(): void {
  _state = { ...DEFAULT, updatedAt: Date.now() };
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  // tetap simpan versi agar pull cloud berikutnya tidak menghidupkan lagi data lama
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(_state)); } catch { /* ignore */ }
  emit();
}

export function useAdminConfig(): AdminConfig {
  return useSyncExternalStore(
    (cb) => { _listeners.add(cb); return () => _listeners.delete(cb); },
    () => _state
  );
}
