/**
 * Tab Media: upload foto hero cover, foto mempelai, galeri, musik, voice note
 */
import { useState } from "react";
import { useAdminConfig, saveAdminConfig } from "../../lib/adminSettings";
import { getCloudAdmin } from "../../lib/cloudConfig";
import { syncToCloud } from "../../lib/cloud";
import { saveMedia, mediaRef, useMediaSrc as useMediaSrcHook } from "../../lib/mediaStore";
import MediaUpload from "./MediaUpload";

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

  // Gallery photo management
  const addGalleryPhoto = async (file: File) => {
    const key = `gallery-${Date.now()}`;
    await saveMedia(key, file);
    const ref = mediaRef(key);
    saveAdminConfig({ galleryPhotos: [...cfg.galleryPhotos, ref] });
  };

  const removeGalleryPhoto = (idx: number) => {
    const updated = cfg.galleryPhotos.filter((_, i) => i !== idx);
    saveAdminConfig({ galleryPhotos: updated });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-hand text-4xl text-ink">Upload Media</h2>
          <p className="mt-1 text-sm text-ink/60">Foto & audio disimpan di perangkat ini. Klik "Sync ke Cloud" agar tamu bisa melihatnya.</p>
        </div>
        <button type="button" onClick={sync} disabled={syncing} className="admin-btn-primary">
          {syncing ? "Menyinkronkan…" : "⬆ Sync Semua ke Cloud"}
        </button>
      </div>

      {toast && <p className="text-sm text-green-700">{toast}</p>}

      {/* Cover / Hero */}
      <section className="space-y-4 border-t border-dashed border-ink/15 pt-8">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Cover / Hero Utama</h3>
        <MediaUpload
          label="Foto Cover (tampil di halaman pembuka)"
          mediaKey="hero-cover"
          currentValue={cfg.heroCoverPhoto}
          accept="image/*"
          previewClass="h-48 w-full max-w-xs"
          hint="Rasio landscape (4:3) atau portrait (3:4) sama-sama oke. Foto ini menggantikan ilustrasi bawaan di cover undangan."
          onSave={(ref) => saveAdminConfig({ heroCoverPhoto: ref })}
        />
      </section>

      {/* Foto Mempelai */}
      <section className="space-y-4 border-t border-dashed border-ink/15 pt-8">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Foto Mempelai (opsional)</h3>
        <p className="text-xs text-ink/55">Foto akan ditampilkan sebagai portrait lingkaran di section Mempelai. Jika kosong, ilustrasi bawaan tetap digunakan.</p>
        <div className="grid gap-8 sm:grid-cols-2">
          <MediaUpload
            label={`Foto ${cfg.groomNick} (Mempelai Pria)`}
            mediaKey="groom-photo"
            currentValue={cfg.groomPhoto}
            accept="image/*"
            previewClass="h-36 w-36 rounded-full"
            hint="Foto wajah dengan latar bersih — tampil dalam bingkai lingkaran."
            onSave={(ref) => saveAdminConfig({ groomPhoto: ref })}
          />
          <MediaUpload
            label={`Foto ${cfg.brideNick} (Mempelai Wanita)`}
            mediaKey="bride-photo"
            currentValue={cfg.bridePhoto}
            accept="image/*"
            previewClass="h-36 w-36 rounded-full"
            hint="Foto wajah dengan latar bersih — tampil dalam bingkai lingkaran."
            onSave={(ref) => saveAdminConfig({ bridePhoto: ref })}
          />
        </div>
      </section>

      {/* Galeri */}
      <section className="space-y-4 border-t border-dashed border-ink/15 pt-8">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Galeri Foto ({cfg.galleryPhotos.length} foto)</h3>
        <p className="text-xs text-ink/55">Foto-foto ini menggantikan ilustrasi galeri bawaan. Tambah sebanyak yang Anda inginkan.</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cfg.galleryPhotos.map((_, idx) => (
            <GalleryThumb key={idx} src={_} onRemove={() => removeGalleryPhoto(idx)} />
          ))}

          {/* tombol tambah foto */}
          <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-ink/20 bg-paper2 transition-colors hover:border-terra/50">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-ink/30" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink/40">Tambah</span>
            <input type="file" accept="image/*" className="hidden" multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                for (const f of files) await addGalleryPhoto(f);
                e.target.value = "";
              }} />
          </label>
        </div>

        {cfg.galleryPhotos.length > 0 && (
          <button type="button" onClick={() => saveAdminConfig({ galleryPhotos: [] })} className="admin-btn-danger text-[10px]">
            Hapus Semua Foto Galeri
          </button>
        )}
      </section>

      {/* Musik */}
      <section className="space-y-4 border-t border-dashed border-ink/15 pt-8">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Musik Latar</h3>
        <MediaUpload
          label="File Musik (mp3 / m4a / wav)"
          mediaKey="bg-music"
          currentValue={cfg.musicSrc}
          accept="audio/*"
          isAudio={true}
          hint="Lagu instrumental 2–4 menit adalah pilihan ideal. Jika kosong, dipakai musik sintetis bawaan."
          onSave={(ref) => saveAdminConfig({ musicSrc: ref })}
        />
      </section>

      {/* Voice Note */}
      <section className="space-y-4 border-t border-dashed border-ink/15 pt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-terra">Pesan Suara (Voice Note)</h3>
          <button
            type="button"
            onClick={() => saveAdminConfig({ voiceNoteEnabled: !cfg.voiceNoteEnabled })}
            role="switch"
            aria-checked={cfg.voiceNoteEnabled}
            className={`relative h-7 w-14 shrink-0 rounded-full border-2 transition-all duration-300 ${cfg.voiceNoteEnabled ? "border-terra bg-terra" : "border-ink/30 bg-ink/10"}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow transition-transform duration-300 ${cfg.voiceNoteEnabled ? "translate-x-7" : "translate-x-0.5"}`} />
          </button>
        </div>

        {cfg.voiceNoteEnabled ? (
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-navy/70">Judul Voice Note</label>
              <input value={cfg.voiceNoteTitle} onChange={(e) => saveAdminConfig({ voiceNoteTitle: e.target.value })}
                className="mt-2 w-full border-b border-ink/25 bg-transparent py-2.5 text-sm text-ink outline-none focus:border-terra" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-navy/70">Keterangan / Hint</label>
              <input value={cfg.voiceNoteHint} onChange={(e) => saveAdminConfig({ voiceNoteHint: e.target.value })}
                className="mt-2 w-full border-b border-ink/25 bg-transparent py-2.5 text-sm text-ink outline-none focus:border-terra" />
            </div>
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

function GalleryThumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  const resolved = useMediaSrcHook(src);
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-paper2 group">
      {resolved && <img src={resolved} alt="" className="h-full w-full object-cover" />}
      <button type="button" onClick={onRemove}
        className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-ink/70 text-paper opacity-0 transition-opacity group-hover:opacity-100">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}
