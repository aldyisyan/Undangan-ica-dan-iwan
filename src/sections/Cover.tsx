import type { CSSProperties } from "react";
import cover from "../assets/cover.jpg";
import { CUSTOM_PHOTOS } from "../lib/data";
import { useResolvedPhoto } from "../lib/customPhotos";
import { HeartDoodle, OvalButton, Reveal, Sprig } from "../lib/ui";

const BURST = Array.from({ length: 14 }, (_, i) => ({
  left: 8 + ((i * 37) % 84),
  dx: ((i % 2 === 0 ? 1 : -1) * (18 + ((i * 13) % 46))),
  delay: (i % 7) * 130,
  size: 14 + ((i * 5) % 14),
}));

export default function Cover({
  opened,
  burst,
  onOpen,
}: {
  opened: boolean;
  burst: boolean;
  onOpen: () => void;
}) {
  const heroSrc = useResolvedPhoto(CUSTOM_PHOTOS[0].src, cover);
  const isCustomHero = heroSrc === CUSTOM_PHOTOS[0].src;

  return (
    <section
      id="cover"
      className="relative flex min-h-[100svh] flex-col overflow-hidden pt-20 sm:pt-24"
    >
      <div className="pointer-events-none absolute left-3 top-4 hidden text-navy/25 sm:block">
        <Sprig className="h-28 w-16 sway" />
      </div>
      <div className="pointer-events-none absolute right-3 top-4 hidden text-terra/30 sm:block">
        <Sprig className="h-28 w-16 sway" flip />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-6 text-center">
        <Reveal>
          <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-navy/70 sm:text-[11px]">
            The Wedding of
          </p>

          <h1 className="mt-4 font-hand text-[clamp(2.7rem,10.5vw,5.6rem)] font-semibold uppercase leading-[0.92] tracking-tight text-ink">
            We&rsquo;re Getting
            <br />
            Married
          </h1>

          <svg
            className="draw mx-auto mt-2 h-5 w-56 max-w-[70%] text-terra"
            viewBox="0 0 240 20"
            fill="none"
            aria-hidden
          >
            <path
              pathLength={1}
              d="M6 13C58 4 116 17 174 8c18-3 36 1 60-4"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              pathLength={1}
              d="M34 18c56-6 124 3 178-6"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              opacity="0.45"
            />
          </svg>

          <div className="mt-5 flex items-center justify-center gap-3 font-hand text-[clamp(3rem,14vw,5.5rem)] font-bold leading-none sm:gap-5">
            <span className="text-ink">Iwan</span>
            <span className="heartbeat text-terra">&amp;</span>
            <span className="text-ink">Ica</span>
          </div>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-navy sm:text-xs">
            Sabtu &middot; 21 November 2026 &middot; Jakarta
          </p>

          <div className="mt-8 flex justify-center">
            {opened ? (
              <a
                href="#salam"
                className="group flex flex-col items-center gap-1 text-ink/55 transition-colors hover:text-terra"
              >
                <span className="font-note text-sm">gulir perlahan, ya</span>
                <svg
                  viewBox="0 0 24 34"
                  className="h-8 w-6 drift"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M12 2v27M4 22l8 9 8-9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            ) : (
              <OvalButton onClick={onOpen}>Buka Undangan</OvalButton>
            )}
          </div>
        </Reveal>
      </div>

      <div className="relative mt-auto w-full px-6 pt-10">
        <div className="relative mx-auto w-full max-w-lg sm:max-w-2xl">
          <span className="tape -top-3 left-8 -rotate-6" aria-hidden />
          <span className="tape -top-3 right-8 rotate-6" aria-hidden />
          <div className="relative aspect-[3/2] overflow-hidden bg-paper2">
            <img
              src={heroSrc}
              alt={
                isCustomHero
                  ? "Ilustrasi personal pasangan pengantin pada cover undangan"
                  : "Ilustrasi Iwan dan Ica mengenakan baju pengantin sederhana sambil tertawa"
              }
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper/85 via-paper/20 to-transparent" />
            <div className="absolute left-4 top-4 border border-ink/20 bg-paper/85 px-3 py-1.5 backdrop-blur-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/75">
                {isCustomHero ? "Foto/Ilustrasi Asli Kami" : "Cover Illustration"}
              </p>
            </div>
          </div>
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full text-ink/70"
            viewBox="0 0 300 200"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden
          >
            <path
              d="M6 8C80 4 200 10 294 6c3 54-2 134 1 187-85 4-175-2-288 2C3 140 9 60 6 8Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <HeartDoodle className="drift absolute -left-4 top-10 h-7 w-7 text-terra/70" />
          <HeartDoodle className="drift absolute -right-3 top-20 h-5 w-5 text-navy/60" />
          <HeartDoodle className="drift absolute -bottom-4 left-16 h-4 w-4 text-terra/55" />
        </div>
      </div>

      {burst && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[30%] z-20 h-0" aria-hidden>
          {BURST.map((b, i) => (
            <span
              key={i}
              className="pop-heart absolute bottom-0 text-terra"
              style={
                {
                  left: `${b.left}%`,
                  "--dx": `${b.dx}px`,
                  animationDelay: `${b.delay}ms`,
                } as CSSProperties
              }
            >
              <HeartDoodle className="h-6 w-6" filled />
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
