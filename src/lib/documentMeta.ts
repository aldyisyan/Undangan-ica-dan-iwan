/**
 * Judul tab & favicon dinamis.
 *
 * Menyesuaikan dengan konfigurasi admin:
 *   - Nama mempelai  → inisial monogram di favicon, pasangan "A & B" di judul
 *   - Tanggal nikah  → tanggal ringkas di judul
 *   - Tempat acara   → venue di judul & deskripsi
 *
 * Berjalan sendiri tanpa React: diterapkan saat halaman dimuat, lalu diperbarui
 * setiap kali konfigurasi admin berubah (terdeteksi lewat `updatedAt`).
 */
import { getAdminConfig } from "./adminSettings";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Inisial pasangan, mis. "Iwan" & "Ica" → "I&I" */
function monogram(a: string, b: string): string {
  const first = (s: string) => {
    const c = s.trim().charAt(0).toUpperCase();
    return c || "·";
  };
  return `${first(a)}&${first(b)}`;
}

/**
 * Favicon SVG: kertas dengan bingkai terakota + inisial mempelai.
 * Warna & bentuk mengikuti palet undangan; inisial mengikuti nama mempelai.
 */
function faviconDataUri(mono: string, fullTitle: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<title>${escapeXml(fullTitle)}</title>` +
    `<rect width="64" height="64" rx="14" fill="#FDFBF7"/>` +
    `<rect x="4.5" y="4.5" width="55" height="55" rx="10.5" fill="none" stroke="#B5533C" stroke-width="3"/>` +
    `<path d="M32 52s-9-5.6-9-11.4a5.2 5.2 0 0 1 9-3.3 5.2 5.2 0 0 1 9 3.3C41 46.4 32 52 32 52z" fill="#B5533C" opacity="0.16"/>` +
    `<text x="32" y="42" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="30" font-weight="700" fill="#B5533C">${escapeXml(mono)}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function setFavicon(href: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/svg+xml";
  link.href = href;
}

function setMetaDescription(content: string): void {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function apply(): void {
  if (typeof document === "undefined") return;
  const cfg = getAdminConfig();

  const couple = `${cfg.brideNick} & ${cfg.groomNick}`;
  const date = shortDate(cfg.weddingDate);
  const venue = cfg.venue.trim();

  // Judul tab: nama mempelai · tanggal · tempat
  document.title = [couple, date, venue].filter(Boolean).join(" · ");

  // Deskripsi untuk hasil pencarian / pratinjau tautan
  const longDate = cfg.weddingDateLabel || date;
  setMetaDescription(
    `Undangan pernikahan ${couple} — ${longDate}${venue ? ` di ${venue}` : ""}.`
  );

  // Favicon mengikuti inisial mempelai (wanita lebih dulu)
  setFavicon(faviconDataUri(monogram(cfg.brideNick, cfg.groomNick), document.title));
}

/* Terapkan saat muat, lalu pantau perubahan konfigurasi admin. */
let _last = -1;

function sync(): void {
  const v = getAdminConfig().updatedAt ?? 0;
  if (v === _last) return;
  _last = v;
  apply();
}

sync();

if (typeof window !== "undefined") {
  window.setInterval(sync, 1200);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") sync();
  });
}
