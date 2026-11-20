/**
 * Tab Media: upload foto hero cover, foto mempelai, galeri, musik, voice note.
 * Semua upload foto melewati ImageCropper agar hasilnya pas dengan frame undangan.
 */
import { useRef, useState } from "react";
import { useAdminConfig, saveAdminConfig } from "../../lib/adminSettings";
import { getCloudAdmin } from "../../lib/cloudConfig";
import { syncToCloud } from "../../lib/cloud";
import { saveMedia, mediaRef, useMediaSrc } from "../../lib/mediaStore";
import MediaUpload from "./MediaUpload";
import ImageCropper from "./ImageCropper";

/* ---- preview thumbnail untuk galeri ---- */
function GalleryThumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  const resolved = useMediaSrc(src);
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-paper2 group">
      {resolved && <img src={resolved} alt="" className="h-full w-full object-cover" />}
      {!resolved && <div className="h-full w-full animate-pulse bg-ink/10" />}
      <button type="button" onClick={onRemove}
        className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-ink/70 text-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

export default function TabMedia() {
  const cfg = useAdminConfig();
  const [toast, setToast] = useState("");
  const [syncing, setSyncing] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const sync = async () => {
    const admin = getCloudAdmin();
    if (!admin) { showToast("Hubungkan ke Supabase dulu di tab Cloud."); return; }
    setSyncing(true);
    const ok = await syncToCloud(admin, cfg as unknown as Record<string, unknown>);
    setSyncing(false);
    showToast(ok ? "✓ Media tersinkronisasi ke cloud!" : "Gagal sync. Cek koneksi.");
  };

  const addGalleryPhoto = async (file: File | Blob) => {
    const key = `gallery-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await saveMedia(key, file);
    const ref = mediaRef(key);
    saveAdminConfig({ galleryPhotos: [...cfg.galleryPhotos, ref] });
  };

  const removeGalleryPhoto = (idx: number) => {
    saveAdminConfig({ galleryPhotos: cfg.galleryPhotos.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-10">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-hand text-4xl text-ink">Upload Media</h2>
          <p className="mt-1 text-sm text-ink/60">
            Semua foto melalui editor crop agar pas dengan bingkai undangan.
            Klik &quot;Sync ke Cloud&quot; agar tamu bisa melihat hasilnya.
          </p>
        </div>
        <button type="button" onClick={sync} disabled={syncing} className="admin-btn-primary">
          {syncing ? "Menyinkronkan…" : "⬆ Sync Semua ke Cloud"}
        </button>
      </div>

      {toast && <p className="rounded bg-green-50 px-4 py-2 text-sm text-green-800">{toast}</p>}

      {/* ───────── Cover / Hero ───────── */}
      <section className="space-y-4 border-t border-dashed border-ink/15 pt-8">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Cover / Hero Utama</h3>
        <p className="text-xs text-ink/50">
          Foto ini tampil sebagai background cover undangan <strong>dan</strong> sebagai polaroid di halaman pembuka.
          Disarankan rasio landscape <strong>4 : 3</strong>.
        </p>
        <MediaUpload
          label="Foto Cover (4 : 3 — landscape)"
          mediaKey="hero-cover"
          currentValue={cfg.heroCoverPhoto}
          accept="image/*"
          aspect={4 / 3}
          cropShape="rect"
          previewClass="h-40 w-full max-w-xs"
          cropHint="Atur agar subjek utama (wajah/pasangan) berada di tengah bingkai landscape 4:3."
          hint="Disarankan foto horizontal. Akan ditampilkan sebagai background cover dan thumbnail polaroid."
          onSave={(ref) => saveAdminConfig({ heroCoverPhoto: ref })}
        />
      </section>

      {/* ───────── Foto Mempelai ───────── */}
      <section className="space-y-4 border-t border-dashed border-ink/15 pt-8">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Foto Mempelai</h3>
        <p className="text-xs text-ink/55">
          Ditampilkan sebagai lingkaran di section Mempelai. Editor crop berbentuk lingkaran — pastikan wajah berada di tengah.
        </p>
        <div className="grid gap-10 sm:grid-cols-2">
          <MediaUpload
            label={`Foto ${cfg.groomNick} (Mempelai Pria) — Lingkaran 1:1`}
            mediaKey="groom-photo"
            currentValue={cfg.groomPhoto}
            accept="image/*"
            aspect={1}
            cropShape="circle"
            previewClass="h-36 w-36 rounded-full"
            cropHint="Atur agar wajah berada di tengah lingkaran crop."
            hint="Frame lingkaran — gunakan foto wajah dengan latar bersih."
            onSave={(ref) => saveAdminConfig({ groomPhoto: ref })}
          />
          <MediaUpload
            label={`Foto ${cfg.brideNick} (Mempelai Wanita) — Lingkaran 1:1`}
            mediaKey="bride-photo"
            currentValue={cfg.bridePhoto}
            accept="image/*"
            aspect={1}
            cropShape="circle"
            previewClass="h-36 w-36 rounded-full"
            cropHint="Atur agar wajah berada di tengah lingkaran crop."
            hint="Frame lingkaran — gunakan foto wajah dengan latar bersih."
            onSave={(ref) => saveAdminConfig({ bridePhoto: ref })}
          />
        </div>
      </section>

      {/* ───────── Galeri ───────── */}
      <section className="space-y-4 border-t border-dashed border-ink/15 pt-8">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">
          Galeri Foto ({cfg.galleryPhotos.length} foto)
        </h3>
        <p className="text-xs text-ink/55">
          Foto-foto ini tampil di section Galeri, menggantikan ilustrasi bawaan.
          Setiap foto akan dicrop ke rasio portrait <strong>4 : 5</strong>.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cfg.galleryPhotos.map((src, idx) => (
            <GalleryThumb key={`${src}-${idx}`} src={src} onRemove={() => removeGalleryPhoto(idx)} />
          ))}

          {/* tombol tambah dengan cropper */}
          <GalleryAddButton onAdd={addGalleryPhoto} />
        </div>

        {cfg.galleryPhotos.length > 0 && (
          <button type="button" onClick={() => { if (confirm("Hapus semua foto galeri?")) saveAdminConfig({ galleryPhotos: [] }); }}
            className="admin-btn-danger text-[10px]">Hapus Semua Foto Galeri</button>
        )}
      </section>

      {/* ───────── Musik ───────── */}
      <section className="space-y-4 border-t border-dashed border-ink/15 pt-8">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Musik Latar</h3>
        <MediaUpload
          label="File Musik (mp3 / m4a / wav)"
          mediaKey="bg-music"
          currentValue={cfg.musicSrc}
          accept="audio/*"
          isAudio={true}
          hint="Lagu instrumental 2–4 menit adalah pilihan ideal. Jika kosong, dipakai musik sintetis bawaan (music box)."
          onSave={(ref) => saveAdminConfig({ musicSrc: ref })}
        />
      </section>

      {/* ───────── Voice Note ───────── */}
      <section className="space-y-4 border-t border-dashed border-ink/15 pt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Pesan Suara (Voice Note)</h3>
          <ToggleBtn value={cfg.voiceNoteEnabled} onChange={(v) => saveAdminConfig({ voiceNoteEnabled: v })} />
        </div>

        {cfg.voiceNoteEnabled ? (
          <div className="space-y-5">
            <FieldText label="Judul Voice Note" value={cfg.voiceNoteTitle} onChange={(v) => saveAdminConfig({ voiceNoteTitle: v })} />
            <FieldText label="Keterangan / Hint" value={cfg.voiceNoteHint} onChange={(v) => saveAdminConfig({ voiceNoteHint: v })} />
            <MediaUpload
              label="File Suara (mp3 / m4a / wav)"
              mediaKey="voice-note"
              currentValue={cfg.voiceNoteSrc}
              accept="audio/*"
              isAudio={true}
              hint="Rekam pesan suara dari HP lalu upload di sini."
              onSave={(ref) => saveAdminConfig({ voiceNoteSrc: ref })}
            />
          </div>
        ) : (
          <p className="text-sm text-ink/50">Voice note dinonaktifkan — tamu tidak akan melihat bagian ini.</p>
        )}
      </section>
    </div>
  );
}

/* ---- komponen kecil ---- */

function ToggleBtn({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} role="switch" aria-checked={value}
      className={`relative h-7 w-14 shrink-0 rounded-full border-2 transition-all duration-300 ${value ? "border-terra bg-terra" : "border-ink/30 bg-ink/10"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform duration-300 ${value ? "translate-x-7" : "translate-x-0.5"}`} />
    </button>
  );
}

function FieldText({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-navy/70">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border-b border-ink/25 bg-transparent py-2.5 text-sm text-ink outline-none focus:border-terra" />
    </div>
  );
}

/**
 * Tombol tambah foto galeri — buka file picker → cropper → simpan
 */
function GalleryAddButton({ onAdd }: { onAdd: (blob: Blob) => void }) {
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ImageCropper dipakai langsung — import di atas */

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setCropSrc(url);
  };

  return (
    <>
      <label
        className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-ink/20 bg-paper2 transition-colors hover:border-terra/50"
        onClick={(e) => { e.preventDefault(); fileRef.current?.click(); }}
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-ink/30" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/40">Tambah</span>
      </label>
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />

      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          aspect={4 / 5}
          shape="rect"
          label="Crop ke rasio portrait 4:5 — cocok untuk bingkai galeri undangan."
          onConfirm={(blob) => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
            onAdd(blob);
          }}
          onCancel={() => { URL.revokeObjectURL(cropSrc); setCropSrc(null); }}
        />
      )}
    </>
  );
}
