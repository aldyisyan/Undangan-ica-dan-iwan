import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { CUSTOM_PHOTOS, GALLERY, SECTION_PAD, WRAP } from "../lib/data";
import { useAdminConfig } from "../lib/adminSettings";
import { useMediaSrc } from "../lib/mediaStore";
import { HeartDoodle, IconArrow, IconClose, Reveal, SectionHead } from "../lib/ui";

type GalleryEntry = { src: string; caption: string; ratio: string; fallback: string };

/** Lima perlakuan bingkai — dipakai bergantian supaya galeri terasa album tempel, bukan grid. */
const FRAMES = ["polaroid", "taped", "mount", "ink", "clip"] as const;
type FrameKind = (typeof FRAMES)[number];
const TILTS = [-1.7, 1.3, -0.9, 1.9, -1.35];

/** Cek apakah sebuah file benar-benar bisa dimuat (dipakai untuk folder /custom). */
function probe(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/** "2026-11-21T09:00:00+07:00" → "21.11.26" untuk cap pos. */
function stampDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`;
}

const WASI = {
  sage: "rgba(125,132,113,.6)",
  nude: "rgba(231,211,190,.92)",
  terra: "rgba(181,83,60,.28)",
  navy: "rgba(44,62,99,.22)",
} as const;

const washiStyle = (color: string) => ({ "--washi": color } as CSSProperties);

/** Ornamen yang menempel di tiap bingkai. */
function FrameDecor({ frame, stamp }: { frame: FrameKind; stamp: string }) {
  if (frame === "taped")
    return (
      <>
        <span aria-hidden className="washi -left-3 -top-3 -rotate-12" style={washiStyle(WASI.sage)} />
        <span aria-hidden className="washi -bottom-3 -right-3 -rotate-12" style={washiStyle(WASI.nude)} />
      </>
    );

  if (frame === "mount")
    return (
      <>
        <span aria-hidden className="pcorner pcorner--tl" />
        <span aria-hidden className="pcorner pcorner--tr" />
        <span aria-hidden className="pcorner pcorner--bl" />
        <span aria-hidden className="pcorner pcorner--br" />
      </>
    );

  if (frame === "ink")
    return (
      <svg className="scrap__ink draw" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden>
        <path pathLength={1} d="M2.6 4.2C30 1.8 62 3.4 97.4 2.4c1 24 .2 58 .5 95.2-30 1.4-66 .2-95.7 1.1C1.2 74 3.4 30 2.6 4.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path pathLength={1} d="M4.4 7c29-2 60-.6 93.2-1.4.6 22-.3 55 .4 90-28 1.3-63 .1-92 .9C5 72 5.4 32 4.4 7Z" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity=".5" />
      </svg>
    );

  if (frame === "clip")
    return (
      <>
        <svg className="paperclip" viewBox="0 0 24 48" fill="none" aria-hidden>
          <path d="M17 8v26a6 6 0 0 1-12 0V10a3.4 3.4 0 0 1 6.8 0v22" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        </svg>
        {stamp && <span aria-hidden className="postmark">{stamp}</span>}
      </>
    );

  // polaroid
  return <HeartDoodle className="drift absolute -right-2 -top-2 h-5 w-5 text-terra/55" filled />;
}

/**
 * Satu foto galeri dengan bingkai scrapbook.
 * Bila foto kustom belum/tidak bisa dimuat, jatuh ke foto bawaan — tidak pernah bolong.
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
  const cfg = useAdminConfig();
  const resolved = useMediaSrc(entry.src) || entry.fallback;
  const frame = FRAMES[idx % FRAMES.length];
  const stamp = stampDate(cfg.weddingDate);

  return (
    <Reveal delay={idx * 70} className="mb-7 break-inside-avoid">
      <button
        type="button"
        onClick={() => onOpen(idx)}
        aria-label={`Buka foto: ${entry.caption}`}
        className={`scrap f-${frame}`}
        style={{ "--tilt": `${TILTS[idx % TILTS.length]}deg` } as CSSProperties}
      >
        <span className="scrap__win">
          <img
            src={resolved}
            alt={entry.caption}
            loading="lazy"
            className={`w-full ${entry.ratio} object-cover`}
          />
          <span aria-hidden className="scrap__zoom">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
        </span>

        <FrameDecor frame={frame} stamp={stamp} />

        {entry.caption ? (
          <span className="scrap__cap">
            <span className="scrap__cap-text">{entry.caption}</span>
            {(frame === "clip" || frame === "ink") && (
              <span className="scrap__no">No. {String(idx + 1).padStart(2, "0")}</span>
            )}
          </span>
        ) : (
          <span className="scrap__cap" />
        )}
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
      return configCustom.map((src, i) => ({ src, caption: "", ratio: "aspect-[4/5]", fallback: fb(i) }));
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
    if (!items[open]) { setOpen(null); return; }
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

  const openEntry = open !== null && items[open] ? items[open] : null;
  const openResolved = useMediaSrc(openEntry?.src);
  const openSrc = openResolved || openEntry?.fallback || "";

  return (
    <section id="galeri" className={`${SECTION_PAD} relative overflow-hidden`}>
      <div className={WRAP}>
        <SectionHead num="07" kicker="Gallery" title="Galeri Kami" aside="ditempel tangan, bukan dirapikan" />

        <p className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 font-note text-[13px] text-ink/50">
          <span>{items.length} foto &middot; sentuh untuk memperbesar</span>
          <span className="hidden sm:inline">tiap foto mendapat bingkai berbeda</span>
        </p>

        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {items.map((g, i) => (
            <GalleryItem key={`${g.src}-${i}`} entry={g} idx={i} onOpen={setOpen} />
          ))}

          {/* kartu kutipan — ikut bergaya album tempel */}
          <Reveal delay={240} className="mb-7 break-inside-avoid">
            <figure className="quote-card">
              <span aria-hidden className="washi -left-4 top-5 -rotate-6" style={washiStyle(WASI.terra)} />
              <span aria-hidden className="washi -bottom-2 -right-4 rotate-6" style={washiStyle(WASI.navy)} />
              <HeartDoodle className="heartbeat mx-auto h-8 w-8 text-terra" filled />
              <blockquote className="mt-4 font-hand text-[1.5rem] leading-snug text-ink">
                &ldquo;Cinta tidak perlu sempurna, cukup tulus dan jujur.&rdquo;
              </blockquote>
              <figcaption className="mt-3 font-note text-[11px] uppercase tracking-[0.2em] text-ink/45">
                catatan kecil &middot; {cfg.brideNick} &amp; {cfg.groomNick}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>

      {/* lightbox — foto disajikan di atas dudukan kertas */}
      {open !== null && items[open] && openSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pratinjau foto"
          onClick={close}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-ink/95 px-4 py-12"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Tutup"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-paper/40 text-paper transition hover:border-terra hover:text-terra"
          >
            <IconClose />
          </button>

          <figure
            className="relative max-w-[92vw] bg-[#FFFDF8] px-3 pb-12 pt-3 shadow-2xl sm:px-4 sm:pb-14"
            onClick={(e) => e.stopPropagation()}
          >
            <span aria-hidden className="washi -top-3 left-1/2 -ml-[2.6rem] -rotate-6" style={washiStyle(WASI.nude)} />
            <img
              src={openSrc}
              alt={items[open].caption}
              className="max-h-[66vh] w-auto max-w-full object-contain"
            />
            <figcaption className="absolute inset-x-0 bottom-3.5 px-4 text-center font-note text-sm text-terra">
              {items[open].caption}
            </figcaption>
          </figure>

          <div className="mt-6 flex items-center gap-6 text-paper" onClick={(e) => e.stopPropagation()}>
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
