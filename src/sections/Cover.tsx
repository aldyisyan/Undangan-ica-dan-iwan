import type { CSSProperties } from "react";
import coverFallback from "../assets/cover.jpg";
import { useAdminConfig } from "../lib/adminSettings";
import { useMediaSrc } from "../lib/mediaStore";
import { HeartDoodle, OvalButton, Reveal } from "../lib/ui";

const BURST = Array.from({ length: 14 }, (_, i) => ({
  left: 8 + ((i * 37) % 84),
  dx: (i % 2 === 0 ? 1 : -1) * (18 + ((i * 13) % 46)),
  delay: (i % 7) * 130,
}));

export default function Cover({
  opened,
  burst,
  onOpen,
  guestName,
}: {
  opened: boolean;
  burst: boolean;
  onOpen: () => void;
  guestName?: string | null;
}) {
  const cfg = useAdminConfig();
  const adminHero = useMediaSrc(cfg.heroCoverPhoto);
  const heroSrc = adminHero || coverFallback;

  return (
    <section
      id="cover"
      className="relative flex h-[100svh] flex-col items-center justify-center overflow-hidden px-6"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={heroSrc}
          alt=""
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-paper/80" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-lg text-center">
        <Reveal>
          <p className="text-[9px] font-semibold uppercase tracking-[0.5em] text-navy/70 sm:text-[11px]">
            The Wedding of
          </p>

          <h1 className="mt-3 font-hand text-[clamp(2.4rem,12vw,4.8rem)] font-semibold leading-[0.9] text-ink">
            {cfg.brideNick} <span className="text-terra">&amp;</span> {cfg.groomNick}
          </h1>

          <svg
            className="mx-auto mt-2 h-4 w-40 text-terra"
            viewBox="0 0 160 16"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 11C28 4 52 13 78 7c26-6 48 4 79-2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-ink/60 sm:text-[11px]">
            {cfg.weddingDateLabel}
          </p>

          {/* Nama tamu sekarang tampil sejak layar pembuka */}
          <div className="mt-5 inline-flex max-w-full flex-col items-center border border-dashed border-ink/20 bg-paper/70 px-5 py-3 backdrop-blur-sm">
            <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-navy/65">Kepada Yth.</p>
            <p className="mt-1 break-words font-hand text-[clamp(1.6rem,5vw,2.2rem)] leading-tight text-ink">
              {guestName || "Bapak / Ibu / Saudara / i"}
            </p>
          </div>

          <div className="relative mx-auto mt-6 w-full max-w-[280px] sm:max-w-[320px]">
            <div className="polaroid p-2 pb-6">
              <div className="aspect-[4/3] overflow-hidden bg-paper2">
                <img
                  src={heroSrc}
                  alt={`Ilustrasi ${cfg.brideNick} dan ${cfg.groomNick}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="mt-2 text-center font-note text-xs text-ink/50">
                {cfg.brideNick} & {cfg.groomNick}
              </p>
            </div>
            <HeartDoodle className="drift absolute -right-3 -top-2 h-6 w-6 text-terra/60" />
            <HeartDoodle className="drift absolute -left-2 bottom-4 h-5 w-5 text-navy/50" />
          </div>

          <div className="mt-6">
            {opened ? (
              <a
                href="#salam"
                className="inline-flex flex-col items-center gap-1 text-ink/55 transition-colors hover:text-terra"
              >
                <span className="font-note text-xs">gulir ke bawah</span>
                <svg viewBox="0 0 24 34" className="h-6 w-5 drift" fill="none" aria-hidden>
                  <path d="M12 2v27M4 22l8 9 8-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ) : (
              <OvalButton onClick={onOpen}>Buka Undangan</OvalButton>
            )}
          </div>
        </Reveal>
      </div>

      {burst && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[30%] z-20 h-0" aria-hidden>
          {BURST.map((b, i) => (
            <span
              key={i}
              className="pop-heart absolute bottom-0 text-terra"
              style={{ left: `${b.left}%`, "--dx": `${b.dx}px`, animationDelay: `${b.delay}ms` } as CSSProperties}
            >
              <HeartDoodle className="h-5 w-5" filled />
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
