import fs from "node:fs";

const PW = 595.28, PH = 841.89, ML = 56, MR = 56, MT = 62, MB = 58;

const items = [];
const T = s => items.push(["title", s]);
const H = s => items.push(["head", s]);
const B = s => items.push(["body", s]);
const N = s => items.push(["note", s]);
const SP = () => items.push(["space", ""]);

const ascii = s => s.replace(/[^\x20-\x7E]/g, c =>
  ({ "–": "-", "—": "-", "·": "-", "×": "x", "“": '"', "”": '"', "’": "'", "‘": "'", "•": "-" }[c] || "-"));

T("PANDUAN UKURAN FOTO");
N("Undangan Pernikahan Ica & Iwan  |  21 November 2026  |  The Tribrata Darmawangsa");
SP();
B("Semua foto diunggah lewat Admin Panel > Media & Foto. Setiap slot memakai editor crop, jadi Anda cukup mengirim foto dengan RASIO yang benar - sisanya dipotong otomatis agar pas dengan bingkai undangan.");
B("Angka \"Disarankan\" adalah ukuran piksel ideal. Angka \"Minimum\" adalah batas terkecil agar tidak pecah di layar HP maupun laptop.");
SP();

const rows = [
  ["1. FOTO COVER / HERO UTAMA", "4 : 3 (landscape)", "1600 x 1200 px", "1200 x 900 px",
   "Background layar pembuka + thumbnail polaroid. Subjek (wajah/pasangan) sebaiknya di tengah."],
  ["2. FOTO MEMPELAI WANITA & PRIA", "1 : 1 (persegi)", "800 x 800 px", "600 x 600 px",
   "Ditampilkan bulat di section Mempelai. Wajah di tengah crop, latar belakang bersih."],
  ["3. FOTO GALERI", "4 : 5 (portrait)", "1200 x 1500 px", "900 x 1125 px",
   "Grid galeri + lightbox. Setiap foto mendapat bingkai berbeda (polaroid, washi, corner, ink, clip)."],
  ["4. FOTO LOVE STORY", "4 : 5 (portrait)", "1000 x 1250 px", "800 x 1000 px",
   "5 slot pada timeline Perjalanan Kami. Bingkai polaroid, maks. lebar tampil 290 px."],
  ["5. FOTO PENUTUP (PALING BAWAH)", "3 : 2 (landscape)", "1500 x 1000 px", "1200 x 800 px",
   "Foto terakhir sebelum footer Terima Kasih."],
  ["6. FOTO VISUAL KALENDER", "4 : 5 (portrait)", "1000 x 1250 px", "800 x 1000 px",
   "Menggantikan kalender grid di section Hari-H. Maks. lebar tampil 320 px."],
  ["7. FOTO VISUAL PETA", "16 : 9 (landscape)", "1600 x 900 px", "1280 x 720 px",
   "Menggantikan embed Google Maps. Lebar penuh kolom (maks. 896 px)."],
  ["8. FOTO FOLDER /custom", "portrait atau square", "1200 x 1500 px", "900 x 1125 px",
   "our-1.jpg s/d our-4.jpg. Hanya terbaca bila seluruh folder dist ikut diunggah."],
];

for (const [name, ratio, rec, min, note] of rows) {
  H(name);
  B("Rasio        : " + ratio);
  B("Disarankan   : " + rec);
  B("Minimum      : " + min);
  N(note);
  SP();
}

H("9. FAVICON");
B("Ukuran : SVG 64 x 64 px (skala otomatis ke 16 / 32 px).");
N("Dibuat otomatis dari inisial mempelai. Tidak perlu diunggah manual.");
SP();

H("10. AUDIO (BUKAN FOTO, NAMUN SATU SLOT)");
B("Musik latar : MP3 / M4A / WAV, durasi 2-4 menit, maks. 15 MB.");
B("Voice note  : MP3 / M4A / WAV, durasi 30-90 detik, maks. 10 MB.");
SP();

H("11. CATATAN TEKNIS");
B("- Format : JPG untuk foto, PNG bila butuh transparansi.");
B("- Ruang warna : sRGB (bukan AdobeRGB / Display-P3).");
B("- Kualitas ekspor : 80-85%. Hindari kualitas di bawah 60%.");
B("- Ukuran file ideal per foto : 150 - 500 KB.");
B("- Jangan crop manual ke rasio lain; biarkan editor crop admin yang bekerja.");
B("- Jangan pakai watermark atau bingkai tambahan pada foto.");
B("- Foto portrait atau square sama-sama aman untuk semua slot.");
SP();
N("Dibuat otomatis - bagian dari panel admin undangan Ica & Iwan.");

/* ---------------- layout & pagination ---------------- */
function wrap(text, max) {
  const out = []; let line = "";
  for (const w of text.split(/\s+/)) {
    if (!line.length) { line = w; continue; }
    if ((line + " " + w).length > max) { out.push(line); line = w; } else line += " " + w;
  }
  if (line) out.push(line);
  return out;
}

const STYLE = {
  title: { font: "F2", size: 19, lh: 24, col: "0.71 0.33 0.24", gap: 6 },
  head:  { font: "F2", size: 11, lh: 15, col: "0.71 0.33 0.24", gap: 3 },
  body:  { font: "F1", size: 9.5, lh: 13.5, col: "0.12 0.11 0.10", gap: 0 },
  note:  { font: "F1", size: 8.5, lh: 12, col: "0.42 0.40 0.38", gap: 5 },
  space: { font: "F1", size: 9, lh: 9, col: "0 0 0", gap: 0 },
};

const pages = [];
let ops = [], y = PH - MT;
function newPage() { pages.push(ops); ops = []; y = PH - MT; }

function pushLine(text, st) {
  const esc = text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  ops.push(`BT ${st.col} rg /${st.font} ${st.size} Tf 1 0 0 1 ${ML.toFixed(2)} ${y.toFixed(2)} Tm (${esc}) Tj ET`);
}

for (const [kind, text] of items) {
  const st = STYLE[kind];
  const lines = kind === "space" ? [""] : (kind === "body" || kind === "note")
    ? wrap(ascii(text), kind === "body" ? 96 : 108) : [ascii(text)];
  const need = lines.length * st.lh + st.gap;
  if (y - need < MB) newPage();
  for (const ln of lines) { y -= st.lh; if (ln) pushLine(ln, st); }
  y -= st.gap;
}
pages.push(ops);

/* footer + garis penanda tiap halaman */
const total = pages.length;
const footY1 = MB - 14, footY2 = MB - 28;
pages.forEach((p, i) => {
  p.push(`0.71 0.33 0.24 RG 0.6 w ${ML} ${footY1} m ${(PW - MR).toFixed(2)} ${footY1} l S`);
  const left = ascii(`Undangan Ica & Iwan  -  Panduan Ukuran Foto`);
  const right = ascii(`halaman ${i + 1} dari ${total}`);
  p.push(`BT 0.45 0.43 0.40 rg /F1 8 Tf 1 0 0 1 ${ML} ${footY2} Tm (${left}) Tj ET`);
  p.push(`BT 0.45 0.43 0.40 rg /F1 8 Tf 1 0 0 1 ${(PW - MR - 74).toFixed(2)} ${footY2} Tm (${right}) Tj ET`);
});

/* ---------------- PDF assembly ---------------- */
const objs = [];
const put = s => { objs.push(s); return objs.length; };
put("<< /Type /Catalog /Pages 2 0 R >>");
put("");
put("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
put("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

const kidIds = [];
for (const pageOps of pages) {
  const content = pageOps.join("\n");
  const cId = put(`<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`);
  const pId = put(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${cId} 0 R >>`);
  kidIds.push(`${pId} 0 R`);
}
objs[1] = `<< /Type /Pages /Kids [${kidIds.join(" ")}] /Count ${total} >>`;

let out = "%PDF-1.4\n";
const offsets = [];
for (let i = 0; i < objs.length; i++) {
  offsets.push(Buffer.byteLength(out, "latin1"));
  out += `${i + 1} 0 obj\n${objs[i]}\nendobj\n`;
}
const xref = Buffer.byteLength(out, "latin1");
out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
for (const off of offsets) out += `${String(off).padStart(10, "0")} 00000 n \n`;
out += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

const buf = Buffer.from(out, "latin1");
fs.writeFileSync("PANDUAN-FOTO.pdf", buf);
fs.mkdirSync("public", { recursive: true });
fs.writeFileSync("public/PANDUAN-FOTO.pdf", buf);
console.log(`OK  pages=${total}  bytes=${buf.length}`);
