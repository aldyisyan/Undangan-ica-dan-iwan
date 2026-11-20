import { useEffect, useMemo, useState } from "react";
import { SECTION_PAD, WEDDING, WRAP } from "../lib/data";
import {
  HeartDoodle,
  IconArrow,
  IconMap,
  Reveal,
  RoughFrame,
  SectionHead,
  Sprig,
} from "../lib/ui";

const TARGET = new Date(WEDDING.iso).getTime();
const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const DOW = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const diff = Math.max(0, TARGET - now);
  return {
    done: diff === 0,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

function MiniCalendar() {
  const [cursor, setCursor] = useState({ y: 2026, m: 10 });
  const today = new Date();

  const cells = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1);
    const offset = (first.getDay() + 6) % 7;
    const total = new Date(cursor.y, cursor.m + 1, 0).getDate();
    const list: (number | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= total; d++) list.push(d);
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [cursor]);

  const shift = (dir: number) => {
    setCursor((c) => {
      const m = c.m + dir;
      return { y: c.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 };
    });
  };

  return (
    <div className="relative bg-paper px-5 py-6 sm:px-7">
      <RoughFrame stroke="rgba(30,27,24,0.5)" />
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Bulan sebelumnya"
          className="grid h-9 w-9 place-items-center rounded-full border border-ink/20 text-ink/70 transition hover:border-terra hover:text-terra"
        >
          <IconArrow className="h-4 w-4" />
        </button>
        <p className="font-hand text-2xl leading-none text-ink">
          {MONTHS[cursor.m]} <span className="text-terra">{cursor.y}</span>
        </p>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Bulan berikutnya"
          className="grid h-9 w-9 rotate-180 place-items-center rounded-full border border-ink/20 text-ink/70 transition hover:border-terra hover:text-terra"
        >
          <IconArrow className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center">
        {DOW.map((d) => (
          <span
            key={d}
            className="pb-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-navy/60"
          >
            {d}
          </span>
        ))}
        {cells.map((d, i) => {
          const isWedding = cursor.y === 2026 && cursor.m === 10 && d === 21;
          const isToday =
            d === today.getDate() &&
            cursor.m === today.getMonth() &&
            cursor.y === today.getFullYear();
          return (
            <div key={i} className="relative aspect-square">
              {isWedding && (
                <HeartDoodle
                  className="heartbeat pointer-events-none absolute inset-0 h-full w-full text-terra"
                  strokeWidth={1.3}
                />
              )}
              {d && (
                <span
                  className={`relative grid h-full w-full place-items-center rounded-full text-[13px] tabular transition ${
                    isWedding
                      ? "font-bold text-terra"
                      : isToday
                        ? "border border-dashed border-navy/50 text-navy"
                        : "text-ink/70"
                  }`}
                >
                  {d}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 font-note text-xs text-terra">
        <HeartDoodle className="h-3.5 w-3.5" filled /> hari pernikahan kami
      </p>
    </div>
  );
}

function Counter({ value, label }: { value: number; label: string }) {
  return (
    <div className="relative bg-paper px-2 py-5 text-center">
      <RoughFrame stroke="rgba(44,62,99,0.4)" />
      <span className="block font-hand text-[clamp(2.2rem,7vw,3.2rem)] leading-none text-navy tabular">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-2 block text-[9px] font-semibold uppercase tracking-[0.22em] text-ink/55">
        {label}
      </span>
    </div>
  );
}

function VenueIllustration() {
  return (
    <svg
      className="draw h-auto w-full max-w-[320px] text-ink/75"
      viewBox="0 0 300 224"
      fill="none"
      aria-hidden
    >
      <path pathLength={1} d="M10 208h280" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        pathLength={1}
        d="M54 208V98c0-44 42-74 96-74s96 30 96 74v110"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        pathLength={1}
        d="M74 84c26 24 126 24 152 0"
        stroke="#B5533C"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path pathLength={1} d="M96 96l10 18 12-16M140 104l10 18 12-16M184 100l10 18 12-16" stroke="#B5533C" strokeWidth="1.3" strokeLinejoin="round" />
      <path pathLength={1} d="M104 160h92" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path pathLength={1} d="M100 160c6 30 94 30 100 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path pathLength={1} d="M120 190v18M180 190v18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path pathLength={1} d="M150 160v-16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path pathLength={1} d="M150 144c-8-4-12-12-9-20 8 3 12 11 9 20ZM150 144c8-4 12-12 9-20-8 3-12 11-9 20Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path pathLength={1} d="M64 208v-38h30v38M70 170v-14h18v14" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path pathLength={1} d="M206 208v-38h30v38M212 170v-14h18v14" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle pathLength={1} cx="150" cy="30" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path pathLength={1} d="M150 24V10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function EventCard({
  data,
  rotate,
}: {
  data: { title: string; time: string; place: string; note: string };
  rotate: string;
}) {
  return (
    <article className={`relative bg-paper px-6 py-8 text-center sm:px-8 ${rotate}`}>
      <RoughFrame stroke="rgba(30,27,24,0.45)" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-navy/70">Agenda</p>
      <h3 className="mt-2 font-hand text-4xl leading-none text-ink">{data.title}</h3>
      <p className="mt-4 inline-block border-y border-dashed border-terra/50 py-1.5 text-sm font-semibold tracking-[0.12em] text-terra">
        {data.time}
      </p>
      <p className="mt-4 text-sm font-semibold text-ink/85">{data.place}</p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink/60">{WEDDING.address}</p>
      <p className="mt-4 font-note text-[13px] text-ink/55">{data.note}</p>
    </article>
  );
}

export default function DateEvents() {
  const c = useCountdown();

  return (
    <>
      {/* ------------------------------------------- 03 · hitung mundur */}
      <section id="hitung-mundur" className={`${SECTION_PAD} relative overflow-hidden`}>
        <Sprig className="pointer-events-none absolute -left-4 bottom-10 hidden h-40 w-24 rotate-12 text-terra/20 xl:block" />

        <div className={WRAP}>
          <SectionHead
            num="03"
            kicker="Countdown Menuju Hari Bahagia"
            title="Hari-H"
            aside="hitung mundur berjalan langsung"
          />

          <div className="mt-16 grid items-start gap-14 md:grid-cols-2 md:gap-12">
            <Reveal>
              <div className="flex items-end gap-5">
                <span className="font-hand text-[clamp(5.5rem,20vw,8rem)] leading-[0.75] text-terra">
                  21
                </span>
                <div className="pb-2">
                  <p className="font-hand text-4xl leading-none text-ink">November</p>
                  <p className="font-hand text-3xl leading-none text-navy">2026</p>
                </div>
              </div>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink/70">
                {WEDDING.weekday} &middot; 09.00 WIB &middot; {WEDDING.city}
              </p>

              {c.done ? (
                <p className="mt-8 flex items-center gap-3 font-hand text-3xl text-terra">
                  <HeartDoodle className="h-7 w-7 heartbeat" filled /> Hari bahagia telah tiba!
                </p>
              ) : (
                <div className="mt-8 grid grid-cols-4 gap-2 sm:gap-3">
                  <Counter value={c.days} label="Hari" />
                  <Counter value={c.hours} label="Jam" />
                  <Counter value={c.minutes} label="Menit" />
                  <Counter value={c.seconds} label="Detik" />
                </div>
              )}

              <p className="mt-6 font-note text-sm leading-relaxed text-ink/55">
                Semakin dekat. Semakin deg-degan. Sampai jumpa di sana, ya!
              </p>
            </Reveal>

            <Reveal delay={160}>
              <MiniCalendar />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- 04 · acara */}
      <section id="acara" className={`${SECTION_PAD} relative bg-paper2/70`}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-ink/20"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 border-b border-dashed border-ink/20"
        />
        <div className={WRAP}>
          <SectionHead
            num="04"
            kicker="Lokasi & Waktu"
            title="Rangkaian Acara"
            aside="dua momen, satu hari"
          />

          <div className="mt-16 grid gap-8 md:grid-cols-3 md:items-center">
            <Reveal>
              <EventCard data={WEDDING.akad} rotate="md:-rotate-1" />
            </Reveal>

            <Reveal delay={140} className="order-last flex justify-center md:order-none">
              <VenueIllustration />
            </Reveal>

            <Reveal delay={260}>
              <EventCard data={WEDDING.resepsi} rotate="md:rotate-1" />
            </Reveal>
          </div>

          <Reveal delay={120} className="mt-14 text-center">
            <p className="font-hand text-3xl text-ink">{WEDDING.venue}</p>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-ink/60">
              {WEDDING.address}
            </p>
            <a
              href={WEDDING.maps}
              target="_blank"
              rel="noreferrer"
              className="group mt-7 inline-flex items-center gap-2.5 border border-ink/30 bg-paper px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-terra hover:text-terra"
            >
              <IconMap className="h-4 w-4" />
              View Google Maps
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}
