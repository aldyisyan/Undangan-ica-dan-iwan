/**
 * ImageCropper — crop interaktif berbasis Canvas, tanpa library tambahan.
 * Mendukung drag & pinch-to-zoom (via wheel/touch).
 */
import { useCallback, useEffect, useRef, useState } from "react";

export type AspectPreset = "square" | "portrait" | "landscape" | "circle";

interface Props {
  src: string;                    // object URL dari file yang dipilih
  aspect: number;                 // width / height  (mis. 1 = square, 4/3 = landscape)
  shape?: "rect" | "circle";
  label?: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropper({ src, aspect, shape = "rect", label = "Atur posisi & perbesaran gambar", onConfirm, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  /* ---- state posisi ---- */
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const PREVIEW_W = 440;
  const PREVIEW_H = Math.round(PREVIEW_W / aspect);

  /* ---- muat gambar ---- */
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      /* fit: scale agar seluruh sisi terpenuhi */
      const initScale = Math.max(PREVIEW_W / img.naturalWidth, PREVIEW_H / img.naturalHeight);
      setScale(initScale);
      setOffset({ x: (PREVIEW_W - img.naturalWidth * initScale) / 2, y: (PREVIEW_H - img.naturalHeight * initScale) / 2 });
      setImgLoaded(true);
    };
    img.src = src;
  }, [src, PREVIEW_W, PREVIEW_H]);

  /* ---- gambar ulang canvas ---- */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H);
    if (shape === "circle") {
      ctx.save();
      ctx.beginPath();
      ctx.arc(PREVIEW_W / 2, PREVIEW_H / 2, Math.min(PREVIEW_W, PREVIEW_H) / 2, 0, Math.PI * 2);
      ctx.clip();
    }
    ctx.drawImage(img, offset.x, offset.y, img.naturalWidth * scale, img.naturalHeight * scale);
    if (shape === "circle") ctx.restore();
  }, [offset, scale, shape, PREVIEW_W, PREVIEW_H]);

  useEffect(() => { if (imgLoaded) draw(); }, [imgLoaded, draw]);

  /* ---- drag ---- */
  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  }, [dragging]);
  const onMouseUp = useCallback(() => setDragging(false), []);

  /* ---- touch drag ---- */
  const touchStart = useRef<{ tx: number; ty: number; ox: number; oy: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStart.current = { tx: e.touches[0].clientX, ty: e.touches[0].clientY, ox: offset.x, oy: offset.y };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStart.current.tx;
    const dy = e.touches[0].clientY - touchStart.current.ty;
    setOffset({ x: touchStart.current.ox + dx, y: touchStart.current.oy + dy });
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, [onMouseMove, onMouseUp]);

  /* ---- wheel zoom ---- */
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.93;
    const newScale = Math.min(8, Math.max(0.1, scale * factor));
    // zoom toward cursor
    const rect = canvasRef.current!.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    setScale(newScale);
    setOffset((o) => ({
      x: cx - (cx - o.x) * (newScale / scale),
      y: cy - (cy - o.y) * (newScale / scale),
    }));
  };

  /* ---- konfirmasi → export ---- */
  const confirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(true);
    // Export at 2× for HiDPI
    const exportCanvas = document.createElement("canvas");
    const dpr = 2;
    exportCanvas.width = PREVIEW_W * dpr;
    exportCanvas.height = PREVIEW_H * dpr;
    const ctx = exportCanvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const img = imgRef.current!;
    if (shape === "circle") {
      ctx.save();
      ctx.beginPath();
      ctx.arc(PREVIEW_W / 2, PREVIEW_H / 2, Math.min(PREVIEW_W, PREVIEW_H) / 2, 0, Math.PI * 2);
      ctx.clip();
    }
    ctx.drawImage(img, offset.x, offset.y, img.naturalWidth * scale, img.naturalHeight * scale);
    if (shape === "circle") ctx.restore();
    exportCanvas.toBlob((blob) => {
      if (blob) onConfirm(blob);
      setSaving(false);
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-ink/90 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg bg-paper" style={{ maxHeight: "90dvh", overflowY: "auto" }}>
        {/* header */}
        <div className="border-b border-dashed border-ink/20 px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/70">Atur Foto</p>
          <p className="mt-1 text-sm text-ink/70">{label}</p>
        </div>

        {/* canvas */}
        <div className="relative select-none overflow-hidden bg-paper2 flex items-center justify-center" style={{ height: Math.min(PREVIEW_H, 320) }}>
          {!imgLoaded && (
            <p className="text-sm text-ink/40">Memuat gambar…</p>
          )}
          <canvas
            ref={canvasRef}
            width={PREVIEW_W}
            height={PREVIEW_H}
            style={{
              width: "100%",
              height: Math.min(PREVIEW_H, 320),
              objectFit: "contain",
              cursor: dragging ? "grabbing" : "grab",
              display: imgLoaded ? "block" : "none",
            }}
            onMouseDown={onMouseDown}
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => { touchStart.current = null; }}
          />
          {/* overlay grid */}
          {imgLoaded && (
            <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-25" aria-hidden>
              <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          )}
        </div>

        {/* zoom slider */}
        <div className="flex items-center gap-3 border-t border-dashed border-ink/15 px-5 py-3">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-ink/40" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="m21 21-4-4M8 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <input type="range" min={0.3} max={5} step={0.01} value={scale}
            onChange={(e) => {
              const ns = Number(e.target.value);
              const cx = PREVIEW_W / 2, cy = PREVIEW_H / 2;
              setOffset((o) => ({ x: cx - (cx - o.x) * (ns / scale), y: cy - (cy - o.y) * (ns / scale) }));
              setScale(ns);
            }}
            className="h-1 w-full cursor-pointer accent-terra" />
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-ink/40" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="m21 21-4-4M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </div>

        <p className="px-5 pb-2 text-[10px] text-ink/40">Seret untuk geser · Scroll/slider untuk zoom</p>

        {/* actions */}
        <div className="flex gap-3 border-t border-dashed border-ink/20 px-5 py-4">
          <button type="button" onClick={confirm} disabled={!imgLoaded || saving}
            className="admin-btn-primary flex-1">{saving ? "Menyimpan…" : "✓ Simpan Crop"}</button>
          <button type="button" onClick={onCancel} className="admin-btn">Batal</button>
        </div>
      </div>
    </div>
  );
}
