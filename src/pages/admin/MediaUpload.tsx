/**
 * MediaUpload dengan Image Cropper terintegrasi.
 * Setelah file dipilih → tampil cropper → setelah konfirmasi → simpan ke IndexedDB.
 */
import { useRef, useState } from "react";
import { saveMedia, removeMedia, isMediaRef, mediaRef, useMediaSrc } from "../../lib/mediaStore";
import ImageCropper from "./ImageCropper";

export interface MediaUploadProps {
  label: string;
  mediaKey: string;
  currentValue: string;
  accept: string;
  onSave: (ref: string) => void;
  hint?: string;
  /** Aspek ratio crop: width/height. Default 1 (square). */
  aspect?: number;
  /** Bentuk crop: "rect" (default) atau "circle" (untuk foto profil bulat). */
  cropShape?: "rect" | "circle";
  /** Kelas Tailwind untuk container preview. Default "h-32 w-32". */
  previewClass?: string;
  /** Jika true, tidak tampilkan cropper (untuk audio). */
  isAudio?: boolean;
  cropHint?: string;
}

export default function MediaUpload({
  label,
  mediaKey,
  currentValue,
  accept,
  onSave,
  hint,
  aspect = 1,
  cropShape = "rect",
  previewClass = "h-32 w-32",
  isAudio = false,
  cropHint,
}: MediaUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const resolvedSrc = useMediaSrc(currentValue);

  /* ---- user memilih file ---- */
  const handleFileChosen = (file: File) => {
    if (isAudio) {
      saveAndEmit(file);
      return;
    }
    const url = URL.createObjectURL(file);
    setCropSrc(url);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChosen(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChosen(file);
  };

  /* ---- setelah crop dikonfirmasi ---- */
  const handleCropConfirm = async (blob: Blob) => {
    if (cropSrc) {
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    }
    await saveAndEmit(blob);
  };

  const handleCropCancel = () => {
    if (cropSrc) {
      URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    }
  };

  const saveAndEmit = async (data: File | Blob) => {
    setSaving(true);
    await saveMedia(mediaKey, data instanceof Blob ? data : data);
    const ref = mediaRef(mediaKey);
    onSave(ref);
    setSaving(false);
  };

  const clear = async () => {
    onSave("");
    if (isMediaRef(currentValue)) {
      await removeMedia(currentValue.slice(6));
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/75">{label}</label>

      {/* drop zone / preview */}
      <div
        className={`relative cursor-pointer border-2 border-dashed border-ink/20 bg-paper2 transition-colors hover:border-terra/50 ${!isAudio && resolvedSrc ? "p-0" : "flex flex-col items-center justify-center gap-3 p-6"}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
      >
        {!isAudio && resolvedSrc ? (
          <div className={`${previewClass} relative overflow-hidden ${cropShape === "circle" ? "rounded-full" : ""}`}>
            <img src={resolvedSrc} alt="Preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-ink/50 opacity-0 transition-opacity hover:opacity-100">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-paper" fill="none">
                <path
                  d="M15 3h6v6M14 10l6.5-6.5M9 21H3v-6M10 14l-6.5 6.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-paper">Ganti & Crop</span>
            </div>
          </div>
        ) : isAudio && resolvedSrc ? (
          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            <audio controls src={resolvedSrc} className="w-full" />
            <p className="mt-2 text-center text-xs text-ink/40">Klik untuk ganti file</p>
          </div>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="h-9 w-9 text-ink/25" fill="none">
              <path
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4M8 8l4-4 4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-center">
              <p className="text-sm font-semibold text-ink/60">{saving ? "Menyimpan…" : "Klik atau seret file"}</p>
              {!isAudio && <p className="mt-1 text-xs text-ink/35">Akan muncul editor crop setelah dipilih</p>}
            </div>
          </>
        )}
      </div>

      {hint && <p className="text-[11px] leading-relaxed text-ink/50">{hint}</p>}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} className="admin-btn text-[10px]">
          {saving ? "Menyimpan…" : resolvedSrc ? "Ganti File" : "Pilih File"}
        </button>
        {resolvedSrc && (
          <button type="button" onClick={clear} className="admin-btn-danger text-[10px]">
            Hapus
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={handleChange} />

      {/* Image Cropper Modal */}
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          aspect={aspect}
          shape={cropShape}
          label={cropHint || `Atur posisi & ukuran — rasio ${aspect.toFixed(2)}:1`}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
