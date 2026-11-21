import { useEffect, useRef, type ReactNode } from "react";

/* ------------------------------------------------------------------ reveal */

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "figure" | "header";
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("in");
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------ section head */

export function SectionHead({
  kicker,
  title,
  aside,
  align = "center",
}: {
  num?: string;
  kicker: string;
  title: string;
  aside?: string;
  align?: "center" | "start";
}) {
  const center = align === "center";
  return (
    <Reveal className={center ? "text-center" : "text-left"}>
      <div className={`relative ${center ? "inline-block" : ""}`}>
        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-navy/70">{kicker}</p>
        <h2 className="mt-2 font-hand text-[clamp(2.4rem,7vw,3.6rem)] leading-[1.05] text-ink">{title}</h2>
        <svg
          className={`draw mx-auto mt-1 h-4 w-40 text-terra ${center ? "" : "ml-0"}`}
          viewBox="0 0 160 16"
          fill="none"
          aria-hidden
        >
          <path
            pathLength={1}
            d="M3 11C28 4 52 13 78 7c26-6 48 4 79-2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        {aside && (
          <span
            className={`mt-3 hidden font-note text-sm text-terra/80 lg:block ${
              center ? "absolute left-full top-1/2 ml-4 w-40 -translate-y-1/2 -rotate-3 text-left" : ""
            }`}
          >
            {aside}
          </span>
        )}
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------- ornaments */

export function RoughFrame({ stroke = "rgba(30,27,24,0.55)", width = 1.5, className = "" }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M1.6 3.4C20 1.4 46 2.8 70 1.7c15-.7 26 .2 28.4 1.7.8 17 .2 52 .4 77.1.1 11.6-.8 16.2-2.2 17.8-21.6 1-56.6-.2-78.6.6C8.4 99 3.4 98.2 2.2 97 1.4 75 2.5 40 1.6 3.4Z"
        fill="none"
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function HeartDoodle({
  className = "",
  filled = false,
  strokeWidth = 1.6,
}: {
  className?: string;
  filled?: boolean;
  strokeWidth?: number;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 20.6C10.4 19.3 3 14.4 3 8.9 3 5.6 5.4 3.6 8 3.6c1.9 0 3.3 1.1 4 2.3.7-1.2 2.1-2.3 4-2.3 2.6 0 5 2 5 5.3 0 5.5-7.4 10.4-9 11.7Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`draw h-11 w-full max-w-[340px] text-ink/55 ${className}`}
      viewBox="0 0 340 44"
      fill="none"
      aria-hidden
    >
      <path
        pathLength={1}
        d="M6 27C34 9 62 41 90 23c18-11 32 8 44 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        pathLength={1}
        d="M334 27c-28-18-56 14-84-4-18-11-32 8-44 2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <g transform="translate(158 11) scale(1.1)" className="heartbeat">
        <path
          pathLength={1}
          d="M12 20.6C10.4 19.3 3 14.4 3 8.9 3 5.6 5.4 3.6 8 3.6c1.9 0 3.3 1.1 4 2.3.7-1.2 2.1-2.3 4-2.3 2.6 0 5 2 5 5.3 0 5.5-7.4 10.4-9 11.7Z"
          fill="none"
          stroke="#B5533C"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function Sprig({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 60 90"
      className={`${className} ${flip ? "-scale-x-100" : ""}`}
      fill="none"
      aria-hidden
    >
      <path d="M30 88C30 60 30 32 30 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M30 70c-11-1-18-8-19-19 11 1 18 8 19 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M30 52c11-1 18-8 19-19-11 1-18 8-19 19Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M30 34c-9-1-15-7-16-16 9 1 15 7 16 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M30 20c9-1 15-7 16-16-9 1-15 7-16 16Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------------------------------------------------------- buttons */

export function OvalButton({
  children,
  onClick,
  tone = "ink",
  className = "",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "ink" | "terra" | "navy";
  className?: string;
  type?: "button" | "submit";
}) {
  const color =
    tone === "terra" ? "text-terra" : tone === "navy" ? "text-navy" : "text-ink";
  return (
    <button
      type={type}
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center px-9 py-3.5 ${color} transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0 ${className}`}
    >
      <svg
        className="draw absolute inset-0 h-full w-full"
        viewBox="0 0 200 64"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden
      >
        <path
          pathLength={1}
          d="M100 3c55 0 97 12 97 29S152 61 100 61 3 48 3 32 45 3 100 3Z"
          stroke="currentColor"
          strokeWidth="1.6"
          vectorEffect="non-scaling-stroke"
          className="opacity-70 transition-opacity duration-300 group-hover:opacity-100"
        />
      </svg>
      <span className="relative font-hand text-[1.6rem] leading-none tracking-wide">{children}</span>
    </button>
  );
}

export function PillButton({
  children,
  href,
  onClick,
  className = "",
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const cls = `inline-flex items-center gap-2 border border-ink/25 bg-paper px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-terra hover:text-terra ${className}`;
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ icons */

type IconProps = { className?: string };

export const IconMap = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

export const IconCopy = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <rect x="8.5" y="8.5" width="11" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M15.5 5.5H6.5A2 2 0 0 0 4.5 7.5v9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const IconCheck = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const IconMusic = ({ className = "h-5 w-5", playing = false }: IconProps & { playing?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path
      d="M9 18V6.6l10-2v11"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="6.6" cy="18" r="2.6" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="16.6" cy="15.6" r="2.6" stroke="currentColor" strokeWidth="1.7" />
    {playing && <path d="M4 8.5c2-1.6 4-1.6 6 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
  </svg>
);

export const IconClose = ({ className = "h-5 w-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

export const IconArrow = ({ className = "h-5 w-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path d="M14.5 5 7.5 12l7 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ------------------------------------------------------------- margin rail */

/* ============================================================
   SCRAPBOOK ORNAMENT COMPONENTS
   ============================================================ */

/** Potongan amplop segitiga di pojok — dekorasi murni */
export function EnvelopeFlap({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 60" fill="none" className={className} aria-hidden>
      <path d="M0 0h120L60 60Z" fill="currentColor" opacity=".12" />
      <path d="M0 0h120L60 60Z" stroke="currentColor" strokeWidth="1" opacity=".35" strokeLinejoin="round" />
      <path d="M4 2l112 0" stroke="currentColor" strokeWidth=".6" opacity=".2" strokeLinecap="round" />
    </svg>
  );
}

/** Pita pelangi horizontal bergaya sticker */
export function RibbonBand({
  text,
  tone = "terra",
  className = "",
}: {
  text: string;
  tone?: "terra" | "navy" | "sage" | "nude";
  className?: string;
}) {
  const bg: Record<string, string> = {
    terra: "rgba(181,83,60,.14)",
    navy: "rgba(44,62,99,.12)",
    sage: "rgba(125,132,113,.14)",
    nude: "rgba(231,211,190,.55)",
  };
  const col: Record<string, string> = {
    terra: "rgba(181,83,60,.8)",
    navy: "rgba(44,62,99,.75)",
    sage: "rgba(125,132,113,.85)",
    nude: "rgba(30,27,24,.55)",
  };
  return (
    <div
      className={`relative overflow-hidden py-2 text-center ${className}`}
      style={{ background: bg[tone] }}
      aria-hidden
    >
      <span
        className="font-note text-[10px] uppercase tracking-[0.38em]"
        style={{ color: col[tone] }}
      >
        {text}
      </span>
      {/* serrated left */}
      <svg className="absolute inset-y-0 left-0 h-full w-3" viewBox="0 0 12 60" preserveAspectRatio="none" fill="var(--color-paper)" aria-hidden>
        <path d="M12 0C9 5 12 10 9 15s3 10 0 15 3 10 0 15 3 10 0 15V0Z" />
      </svg>
      {/* serrated right */}
      <svg className="absolute inset-y-0 right-0 h-full w-3" viewBox="0 0 12 60" preserveAspectRatio="none" fill="var(--color-paper)" aria-hidden>
        <path d="M0 0c3 5 0 10 3 15s-3 10 0 15-3 10 0 15-3 10 0 15V0Z" />
      </svg>
    </div>
  );
}

/** Tiket bergigi — ornamen pembatas */
export function TicketDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center gap-3 ${className}`} aria-hidden>
      <div className="flex-1 border-t border-dashed border-ink/20" />
      <svg viewBox="0 0 48 24" className="h-5 w-10 text-terra/60" fill="none">
        <rect x="1" y="1" width="46" height="22" rx="3" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
        <circle cx="11" cy="12" r="3" stroke="currentColor" strokeWidth="1" />
        <circle cx="24" cy="12" r="3" stroke="currentColor" strokeWidth="1" />
        <circle cx="37" cy="12" r="3" stroke="currentColor" strokeWidth="1" />
      </svg>
      <div className="flex-1 border-t border-dashed border-ink/20" />
    </div>
  );
}

/** Hiasan bunga / kembang empat kelopak — aksen pojok */
export function FloretMark({
  className = "h-6 w-6 text-terra/40",
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <ellipse cx="12" cy="6" rx="3.5" ry="5.5" opacity=".9" />
      <ellipse cx="12" cy="18" rx="3.5" ry="5.5" opacity=".9" />
      <ellipse cx="6" cy="12" rx="5.5" ry="3.5" opacity=".9" />
      <ellipse cx="18" cy="12" rx="5.5" ry="3.5" opacity=".9" />
      <circle cx="12" cy="12" r="3" fill="var(--color-paper)" />
    </svg>
  );
}

/** Ampersand bergaya tangan */
export function HandAmpersand({ className = "h-16 text-ink/8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 80" fill="none" className={className} aria-hidden>
      <path
        d="M42 62c-14 8-32 2-32-14 0-10 7-16 16-20L14 16c-4-5-2-12 6-13 7-1 12 5 10 12l-6 10c8 4 20 11 18 23"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 36c8 6 18 12 18 22 0 8-7 14-16 14-6 0-12-3-16-8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Tiga titik tulisan tangan vertikal */
export function PenDots({ className = "text-terra/40" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 36" className={`h-8 w-3 ${className}`} fill="currentColor" aria-hidden>
      <circle cx="6" cy="4" r="2.2" />
      <circle cx="6" cy="18" r="2.2" />
      <circle cx="6" cy="32" r="2.2" />
    </svg>
  );
}

/** Bintang sketsa — hiasan pojok / sidebar */
export function StarSketch({ className = "h-8 w-8 text-terra/30" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M16 2l3.5 9.5H30l-8.5 6 3 9.5L16 22l-8.5 5 3-9.5L2 11.5h10.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Tanaman ranting bercabang — pojok bawah section */
export function TwigLeft({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 120" fill="none" className={className} aria-hidden>
      <path d="M40 115V30" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M40 85c-18-3-28-16-26-32 18 3 28 16 26 32Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M40 65c14-3 24-16 22-30-14 3-24 16-22 30Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M40 48c-12-2-20-13-18-26 12 2 20 13 18 26Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity=".65" />
      <path d="M40 34c10-2 16-12 14-23-10 2-16 12-14 23Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity=".45" />
    </svg>
  );
}

/** Pin 3D Enamel — memberikan kesan benda yang menancap/menahan kertas */
export function EnamelPin({ color = "#b5533c", className = "h-5 w-5" }) {
  return (
    <div className={`depth-3d flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 40 40" className="h-full w-full drop-shadow-lg">
        <defs>
          <radialGradient id="pinGrad" cx="35%" cy="35%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="black" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        <circle cx="20" cy="20" r="18" fill="url(#pinGrad)" />
        <circle cx="16" cy="14" r="5" fill="white" opacity="0.3" />
      </svg>
    </div>
  );
}

/** Klip Kertas 3D Logam */
export function MetalClip({ className = "h-10 w-5" }) {
  return (
    <svg viewBox="0 0 24 48" className={`depth-3d ${className}`} fill="none">
      <path
        d="M17 8v26a6 6 0 0 1-12 0V10a3.4 3.4 0 0 1 6.8 0v22"
        stroke="#2c3e63"
        strokeWidth="2.8"
        strokeLinecap="round"
        className="drop-shadow-md"
      />
      <path
        d="M17 8v26a6 6 0 0 1-12 0V10a3.4 3.4 0 0 1 6.8 0v22"
        stroke="white"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

/** Selotip Washi Realistik 3D */
export function WashiTape3D({ color = "#7d8471", className = "" }) {
  return (
    <div
      className={`washi-3d depth-3d pointer-events-none h-6 w-24 ${className}`}
      style={{
        backgroundColor: color,
        backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0 2px, transparent 2px 12px)`,
      }}
    />
  );
}

/** Bunga Kering 3D (Pressed Flower) */
export function PressedFlower({ className = "h-12 w-12" }) {
  return (
    <div className={`depth-3d ${className}`}>
      <svg viewBox="0 0 100 100" fill="#e7d3be" opacity="0.85">
        <path d="M50 50 Q 70 10 90 50 T 50 90 T 10 50 T 50 10" />
        <path d="M50 50 Q 90 30 90 50 T 50 70 T 10 50 T 50 30" transform="rotate(45 50 50)" />
        <circle cx="50" cy="50" r="8" fill="#b5533c" />
      </svg>
    </div>
  );
}

export type RailItem = { id: string; num: string; label: string };

export function MarginRail({ items, active }: { items: RailItem[]; active: string }) {
  return (
    <nav
      aria-label="Daftar isi undangan"
      className="fixed left-7 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      <ul className="relative border-l border-dashed border-ink/25 pl-6">
        {items.map((item) => {
          const on = active === item.id;
          return (
            <li key={item.id} className="relative py-2.5">
              <span
                aria-hidden
                className={`absolute -left-6 top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 ${
                  on ? "scale-125 border-terra bg-terra" : "border-ink/35 bg-paper"
                }`}
              />
              <a
                href={`#${item.id}`}
                className={`group flex items-baseline gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors duration-300 ${
                  on ? "text-ink" : "text-ink/35 hover:text-terra"
                }`}
              >
                <span className={`font-hand text-sm ${on ? "text-terra" : "text-ink/30"}`}>{item.num}</span>
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
