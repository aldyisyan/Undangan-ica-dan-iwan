import { useCallback, useEffect, useMemo, useState } from "react";
import { CUSTOM_PHOTOS, GALLERY, SECTION_PAD, WRAP } from "../lib/data";
import { useResolvedGallery } from "../lib/customPhotos";
import { HeartDoodle, IconArrow, IconClose, Reveal, SectionHead } from "../lib/ui";

export default function Gallery() {
  const customGallery = useResolvedGallery(CUSTOM_PHOTOS);
  const items = useMemo(() => [...customGallery, ...GALLERY], [customGallery]);
  const [open, setOpen] = useState<number | null>(null);
  const move = useCallback(
    (d: number) =>
      setOpen((o) => (o === null ? o : (o + d + items.length) % items.length)),
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

  return (
    <section id="galeri" className={`${SECTION_PAD} relative overflow-hidden`}>
      <div className={WRAP}>
        <SectionHead
          num="07"
          kicker="Pre-wedding Gallery"
          title="Galeri Kami"
          aside="klik untuk memperbesar"
        />

        <div className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {customGallery.length > 0 && (
            <Reveal className="mb-5 break-inside-avoid">
              <div className="relative overflow-hidden bg-paper2 px-6 py-7 text-center">
                <svg
                  className="draw absolute inset-0 h-full w-full text-ink/45"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  fill="none"
                  aria-hidden
                >
                  <path
                    pathLength={1}
                    d="M1.6 3.4C20 1.4 46 2.8 70 1.7c15-.7 26 .2 28.4 1.7.8 17 .2 52 .4 77.1.1 11.6-.8 16.2-2.2 17.8-21.6 1-56.6-.2-78.6.6C8.4 99 3.4 98.2 2.2 97 1.4 75 2.5 40 1.6 3.4Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                <HeartDoodle className="heartbeat mx-auto h-8 w-8 text-terra" filled />
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.26em] text-navy/75">
                  Foto & Ilustrasi Personal
                </p>
                <p className="mt-2 font-hand text-[1.8rem] leading-tight text-ink">
                  Karya yang Anda kirim kini tampil di cover dan galeri ini.
                </p>
              </div>
            </Reveal>
          )}

          {items.map((g, i) => (
            <Reveal key={`${g.src}-${i}`} delay={i * 90} className="mb-5 break-inside-avoid">
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="group relative block w-full overflow-hidden bg-paper2 text-left"
                aria-label={`Buka foto: ${g.caption}`}
              >
                <img
                  src={g.src}
                  alt={g.caption}
                  loading="lazy"
                  className={`w-full ${g.ratio} object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]`}
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent"
                />
                <span className="absolute bottom-3 left-4 right-4 font-note text-sm text-paper">
                  {g.caption}
                </span>
                {i < customGallery.length && (
                  <span className="absolute left-3 top-3 border border-paper/60 bg-paper/85 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-terra backdrop-blur-sm">
                    Personal
                  </span>
                )}
                <span
                  aria-hidden
                  className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-paper/60 bg-ink/30 text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path
                      d="M12 5v14M5 12h14"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </button>
            </Reveal>
          ))}

          <Reveal delay={280} className="mb-5 break-inside-avoid">
            <figure className="relative bg-paper2 px-6 py-10 text-center">
              <svg
                className="draw absolute inset-0 h-full w-full text-ink/45"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden
              >
                <path
                  pathLength={1}
                  d="M1.6 3.4C20 1.4 46 2.8 70 1.7c15-.7 26 .2 28.4 1.7.8 17 .2 52 .4 77.1.1 11.6-.8 16.2-2.2 17.8-21.6 1-56.6-.2-78.6.6C8.4 99 3.4 98.2 2.2 97 1.4 75 2.5 40 1.6 3.4Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <HeartDoodle className="heartbeat mx-auto h-9 w-9 text-terra" filled />
              <blockquote className="mt-5 font-hand text-[1.7rem] leading-snug text-ink">
                &ldquo;Aku mencintaimu bukan karena siapa dirimu, tapi karena dirimu saat bersamaku.&rdquo;
              </blockquote>
              <figcaption className="mt-4 font-note text-xs uppercase tracking-[0.2em] text-terra">
                catatan pinggir, 2026
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>

      {open !== null && (
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
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-paper/40 text-paper transition hover:border-terra hover:text-terra"
          >
            <IconClose />
          </button>

          <img
            src={items[open].src}
            alt={items[open].caption}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[74vh] max-w-full object-contain shadow-2xl"
          />

          <div
            className="mt-5 flex items-center gap-6 text-paper"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Foto sebelumnya"
              className="grid h-10 w-10 place-items-center rounded-full border border-paper/40 transition hover:border-terra hover:text-terra"
            >
              <IconArrow />
            </button>
            <p className="min-w-40 text-center font-note text-sm text-paper/85">
              {items[open].caption}
              <span className="mt-1 block text-[11px] tracking-[0.2em] text-paper/50">
                {String(open + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
            </p>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Foto berikutnya"
              className="grid h-10 w-10 rotate-180 place-items-center rounded-full border border-paper/40 transition hover:border-terra hover:text-terra"
            >
              <IconArrow />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
