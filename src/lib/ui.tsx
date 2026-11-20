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
