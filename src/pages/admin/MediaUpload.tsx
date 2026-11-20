/**
 * Komponen upload foto/audio dengan preview dan crop sederhana.
 * Menyimpan ke IndexedDB via mediaStore, menghasilkan referensi "media:<key>".
 */
import { useRef, useState } from "react";
import { saveMedia, mediaRef, useMediaSrc } from "../../lib/mediaStore";

interface Props {
  label: string;
  mediaKey: string;
  currentValue: string; // "media:<key>" | URL | ""
  accept: string;
  onSave: (ref: string) => void;
  hint?: string;
  previewClass?: string; // Tailwind classes untuk preview container
  isAudio?: boolean;
}

export default function MediaUpload({
  label,
  mediaKey,
  currentValue,
  accept,
  onSave,
  hint,
  previewClass = "h-28 w-28",
  isAudio = false,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>("");
  const resolvedSrc = useMediaSrc(currentValue);

  const handleFile = async (file: File) => {
    setSaving(true);
    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    await saveMedia(mediaKey, file);
    const ref = mediaRef(mediaKey);
    onSave(ref);
    setSaving(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setLocalPreview("");
    onSave("");
  };

  const previewSrc = localPreview || resolvedSrc;

  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/75">{label}</label>

      {/* drop zone */}
      <div
        className={`relative border-2 border-dashed border-ink/20 bg-paper2 transition-colors hover:border-terra/50 ${!isAudio && previewSrc ? "p-0" : "p-6"} flex flex-col items-center justify-center gap-3 cursor-pointer`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
      >
        {!isAudio && previewSrc ? (
          <div className={`${previewClass} overflow-hidden relative`}>
            <img src={previewSrc} alt="Preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-paper">Ganti</span>
            </div>
          </div>
        ) : isAudio && previewSrc ? (
          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            <audio controls src={previewSrc} className="w-full" />
            <p className="mt-2 text-center text-xs text-ink/50">Klik untuk ganti file</p>
          </div>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-ink/25" fill="none">
              <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4M8 8l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="text-center">
              <p className="text-sm font-semibold text-ink/70">{saving ? "Menyimpan…" : "Klik atau seret file ke sini"}</p>
              <p className="mt-1 text-xs text-ink/40">{accept.replace(/\*/g, "semua").replace(/,/g, ", ")}</p>
            </div>
          </>
        )}
      </div>

      {hint && <p className="text-[11px] leading-relaxed text-ink/50">{hint}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={() => fileRef.current?.click()}
          className="admin-btn text-[10px]">{saving ? "Menyimpan…" : previewSrc ? "Ganti File" : "Pilih File"}</button>
        {previewSrc && (
          <button type="button" onClick={clear} className="admin-btn-danger text-[10px]">Hapus</button>
        )}
      </div>

      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
    </div>
  );
}
