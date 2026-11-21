import { useCallback, useEffect, useMemo, useState } from "react";
import { CUSTOM_PHOTOS, GALLERY, SECTION_PAD, WRAP } from "../lib/data";
import { useAdminConfig } from "../lib/adminSettings";
import { useMediaSrc } from "../lib/mediaStore";
import { HeartDoodle, IconArrow, IconClose, Reveal, SectionHead } from "../lib/ui";

type GalleryEntry = { src: string; caption: string; ratio: string; fallback: string };

/** Cek apakah sebuah file benar-benar bisa dimuat (dipakai untuk folder /custom). */
function probe(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * Resolve a single gallery photo.
 * Bila foto kustom belum/tidak bisa dimuat (mis. blob belum tersinkron ke
 * perangkat tamu), tampilkan foto bawaan — TIDAK pernah menyisakan lubang kosong.
 */
function GalleryItem({
  entry,
  idx,
  onOpen,
}: {
  entry: GalleryEntry;
  idx: number;
  onOpen: (i: number) => void;
}) {
  const resolved = useMediaSrc(entry.src) || entry.fallback;
  return (
    <Reveal delay={idx * 70} className="mb-5 break-inside-avoid">
      <button
        type="button"
        onClick={() => onOpen(idx)}
        className="group relative block w-full overflow-hidden bg-paper2 text-left"
        aria-label={`Buka foto: ${entry.caption}`}
      >
        <img
          src={resolved}
          alt={entry.caption}
          loading="lazy"
          className={`w-full ${entry.ratio} object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]`}
        />
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent"
        />
        <span className="absolute bottom-3 left-4 right-4 font-note text-sm text-paper">{entry.caption}</span>
        <span
          aria-hidden
          className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full border border-paper/50 bg-ink/30 text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
      </button>
    </Reveal>
  );
}

export default function Gallery() {
  const cfg = useAdminConfig();

  /* 1. Foto kustom dari tab Media */
  const configCustom = useMemo(() => {
    if (!Array.isArray(cfg.galleryPhotos)) return [] as string[];
    return cfg.galleryPhotos.filter((s): s is string => typeof s === "string" && s.trim().length > 0);
  }, [cfg.galleryPhotos]);

  /* 2. Kalau admin belum upload lewat tab Media, coba folder /custom (lihat README) */
  const [folder, setFolder] = useState<GalleryEntry[]>([]);
  useEffect(() => {
    if (configCustom.length > 0) { setFolder([]); return; }
    let alive = true;
    Promise.all(
      CUSTOM_PHOTOS.map((p) =>
        probe(p.src).then((ok) =>
          ok ? ({ src: p.src, caption: p.caption, ratio: p.ratio, fallback: GALLERY[0].src } as GalleryEntry) : null
        )
      )
    ).then((list) => {
      if (alive) setFolder(list.filter((x): x is GalleryEntry => x !== null));
    });
    return () => { alive = false; };
  }, [configCustom]);

  const items = useMemo<GalleryEntry[]>(() => {
    const fb = (i: number) => GALLERY[i % GALLERY.length].src;
    if (configCustom.length > 0) {
      return configCustom.map((src, i) => ({
        src,
        caption: `Foto ${i + 1}`,
        ratio: "aspect-[4/5]",
        fallback: fb(i),
      }));
    }
    if (folder.length > 0) return folder;
    return GALLERY.map((g) => ({ src: g.src, caption: g.caption, ratio: g.ratio, fallback: g.src }));
  }, [configCustom, folder]);

  const [open, setOpen] = useState<number | null>(null);
  const move = useCallback(
    (d: number) => setOpen((o) => (o === null || items.length === 0 ? null : (o + d + items.length) % items.length)),
    [items.length]
  );
  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    if (open === null) return;
    if (!items[open]) {
      setOpen(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, move, items]);

  // Resolve open image — jatuhkan ke foto bawaan bila belum termuat
  const openEntry = open !== null && items[open] ? items[open] : null;
  const openResolved = useMediaSrc(openEntry?.src);
  const openSrc = openResolved || openEntry?.fallback || "";

  return (
    <section id="galeri" className={`${SECTION_PAD} relative overflow-hidden`}>
      <div className={WRAP}>
        <SectionHead num="07" kicker="Gallery" title="Galeri Kami" />

        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.map((g, i) => (
            <GalleryItem key={`${g.src}-${i}`} entry={g} idx={i} onOpen={setOpen} />
          ))}

          {/* quote card */}
          <Reveal delay={240} className="mb-5 break-inside-avoid">
            <figure className="relative bg-paper2 px-5 py-8 text-center">
              <HeartDoodle className="heartbeat mx-auto h-8 w-8 text-terra" filled />
              <blockquote className="mt-4 font-hand text-[1.5rem] leading-snug text-ink">
                &ldquo;Cinta tidak perlu sempurna, cukup tulus dan jujur.&rdquo;
              </blockquote>
            </figure>
          </Reveal>
        </div>
      </div>

      {/* lightbox */}
      {open !== null && items[open] && openSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto"
          onClick={close}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-ink/95 px-4 py-16"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Tutup"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-paper/40 text-paper transition hover:border-terra hover:text-terra"
          >
            <IconClose />
          </button>
          <img
            src={openSrc}
            alt={items[open].caption}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[74vh] max-w-full object-contain shadow-2xl"
          />
          <div className="mt-4 flex items-center gap-6 text-paper" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Sebelumnya"
              className="grid h-9 w-9 place-items-center rounded-full border border-paper/40 transition hover:border-terra hover:text-terra"
            >
              <IconArrow />
            </button>
            <p className="min-w-32 text-center font-note text-sm text-paper/85">
              {items[open].caption}
              <span className="mt-1 block text-[10px] tracking-[0.2em] text-paper/50">
                {String(open + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
            </p>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Berikutnya"
              className="grid h-9 w-9 rotate-180 place-items-center rounded-full border border-paper/40 transition hover:border-terra hover:text-terra"
            >
              <IconArrow />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
