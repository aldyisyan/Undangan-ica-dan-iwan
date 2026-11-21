import { useEffect, useMemo, useState } from "react";
import { SECTION_PAD, WRAP } from "../lib/data";
import { useAdminConfig } from "../lib/adminSettings";
import { useMediaSrc } from "../lib/mediaStore";
import { useEventVisibility } from "../lib/eventVisibility";
import SaveToCalendar from "../components/SaveToCalendar";
import {
  HeartDoodle,
  IconArrow,
  IconMap,
  Reveal,
  RoughFrame,
  SectionHead,
  Sprig,
} from "../lib/ui";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DOW = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function useCountdown(isoDate: string) {
  const target = useMemo(() => new Date(isoDate).getTime(), [isoDate]);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = Math.max(0, target - now);
  return {
    done: diff === 0,
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor(diff / 3_600_000) % 24,
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}

function MiniCalendar({ targetDate }: { targetDate: Date }) {
  const [cursor, setCursor] = useState({ y: targetDate.getFullYear(), m: targetDate.getMonth() });
  const today = new Date();
  const tDay = targetDate.getDate();
  const tMonth = targetDate.getMonth();
  const tYear = targetDate.getFullYear();

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
    setCursor((c) => { const m = c.m + dir; return { y: c.y + Math.floor(m / 12), m: ((m % 12) + 12) % 12 }; });
  };

  return (
    <div className="relative bg-paper px-5 py-5 sm:px-6">
      <RoughFrame stroke="rgba(30,27,24,0.5)" />
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} aria-label="Bulan sebelumnya" className="grid h-8 w-8 place-items-center rounded-full border border-ink/20 text-ink/70 transition hover:border-terra hover:text-terra"><IconArrow className="h-3.5 w-3.5" /></button>
        <p className="font-hand text-xl leading-none text-ink sm:text-2xl">{MONTHS[cursor.m]} <span className="text-terra">{cursor.y}</span></p>
        <button type="button" onClick={() => shift(1)} aria-label="Bulan berikutnya" className="grid h-8 w-8 rotate-180 place-items-center rounded-full border border-ink/20 text-ink/70 transition hover:border-terra hover:text-terra"><IconArrow className="h-3.5 w-3.5" /></button>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {DOW.map((d) => (<span key={d} className="pb-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-navy/60">{d}</span>))}
        {cells.map((d, i) => {
          const isWedding = cursor.y === tYear && cursor.m === tMonth && d === tDay;
          const isToday = d === today.getDate() && cursor.m === today.getMonth() && cursor.y === today.getFullYear();
          return (
            <div key={i} className="relative aspect-square">
              {isWedding && <HeartDoodle className="heartbeat pointer-events-none absolute inset-0 h-full w-full text-terra" strokeWidth={1.3} />}
              {d && (
                <span className={`relative grid h-full w-full place-items-center rounded-full text-[12px] tabular transition ${isWedding ? "font-bold text-terra" : isToday ? "border border-dashed border-navy/50 text-navy" : "text-ink/70"}`}>{d}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Counter({ value, label }: { value: number; label: string }) {
  return (
    <div className="relative bg-paper px-2 py-4 text-center">
      <RoughFrame stroke="rgba(44,62,99,0.4)" />
      <span className="block font-hand text-[clamp(2rem,6vw,2.8rem)] leading-none text-navy tabular">{String(value).padStart(2, "0")}</span>
      <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.22em] text-ink/55">{label}</span>
    </div>
  );
}

function EventCard({ data, rotate }: { data: { title: string; time: string; place: string; note: string }; rotate: string }) {
  return (
    <article className={`relative bg-paper px-5 py-6 text-center sm:px-7 ${rotate}`}>
      <RoughFrame stroke="rgba(30,27,24,0.45)" />
      <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-navy/70">Agenda</p>
      <h3 className="mt-1.5 font-hand text-3xl leading-none text-ink sm:text-4xl">{data.title}</h3>
      <p className="mt-3 inline-block border-y border-dashed border-terra/50 py-1 text-sm font-semibold tracking-[0.12em] text-terra">{data.time}</p>
      <p className="mt-3 text-sm font-semibold text-ink/85">{data.place}</p>
      <p className="mt-3 font-note text-[12px] text-ink/55">{data.note}</p>
    </article>
  );
}

export default function DateEvents() {
  const cfg = useAdminConfig();
  const ev = useEventVisibility();
  const calendarPhoto = useMediaSrc(cfg.calendarPhoto);
  const mapsPhoto = useMediaSrc(cfg.mapsPhoto);
  const weddingDate = useMemo(() => new Date(cfg.weddingDate), [cfg.weddingDate]);
  const c = useCountdown(cfg.weddingDate);

  const akad = { title: "Akad Nikah", time: cfg.akadTime, place: cfg.akadPlace, note: "Mohon hadir 15 menit lebih awal." };
  const resepsi = {
    title: "Resepsi",
    time: cfg.resepsiTime,
    place: cfg.resepsiPlace,
    note: cfg.resepsiNote || "Dress code: palet sage, nude & terakota.",
  };

  return (
    <>
      {/* 03 · hitung mundur */}
      <section id="hitung-mundur" className={`${SECTION_PAD} relative overflow-hidden`}>
        <Sprig className="pointer-events-none absolute -left-4 bottom-10 hidden h-40 w-24 rotate-12 text-terra/20 lg:block" />
        <div className={WRAP}>
          <SectionHead num="03" kicker="Countdown" title="Hari-H" />
          <div className="mt-12 grid items-start gap-10 md:grid-cols-2">
            <Reveal>
              <div className="flex items-end gap-4">
                <span className="font-hand text-[clamp(4.5rem,18vw,7rem)] leading-[0.75] text-terra">{weddingDate.getDate()}</span>
                <div className="pb-1">
                  <p className="font-hand text-3xl leading-none text-ink sm:text-4xl">{MONTHS[weddingDate.getMonth()]}</p>
                  <p className="font-hand text-2xl leading-none text-navy sm:text-3xl">{weddingDate.getFullYear()}</p>
                </div>
              </div>
              {c.done ? (
                <p className="mt-6 flex items-center gap-3 font-hand text-2xl text-terra"><HeartDoodle className="h-6 w-6 heartbeat" filled /> Hari bahagia telah tiba!</p>
              ) : (
                <div className="mt-6 grid grid-cols-4 gap-2">
                  <Counter value={c.days} label="Hari" />
                  <Counter value={c.hours} label="Jam" />
                  <Counter value={c.minutes} label="Menit" />
                  <Counter value={c.seconds} label="Detik" />
                </div>
              )}
            </Reveal>
            <Reveal delay={160}>
              {calendarPhoto ? (
                <figure className="polaroid relative mx-auto w-full max-w-[320px] p-3 pb-8 md:mx-0">
                  <span className="tape -top-3 left-1/2 -translate-x-1/2 -rotate-3" aria-hidden />
                  <div className="aspect-[4/5] overflow-hidden bg-paper2">
                    <img
                      src={calendarPhoto}
                      alt={`Kalender ${cfg.weddingDateLabel}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <figcaption className="mt-3 text-center font-note text-sm text-terra">
                    {cfg.weddingDateLabel}
                  </figcaption>
                </figure>
              ) : (
                <MiniCalendar targetDate={weddingDate} />
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* 04 · acara */}
      <section id="acara" className={`${SECTION_PAD} relative bg-paper2/70`}>
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-ink/20" />
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 border-b border-dashed border-ink/20" />
        <div className={WRAP}>
          <SectionHead num="04" kicker="Lokasi & Waktu" title="Rangkaian Acara" />

          {!ev.showAkad && !ev.showResepsi ? (
            <Reveal className="mt-10 text-center">
              <p className="font-note text-sm text-ink/50">Detail acara akan diinformasikan lebih lanjut.</p>
            </Reveal>
          ) : (
            <div className={`mt-12 grid gap-6 ${ev.showAkad && ev.showResepsi ? "sm:grid-cols-2" : ""}`}>
              {ev.showAkad && <Reveal><EventCard data={akad} rotate={ev.showResepsi ? "sm:-rotate-1" : ""} /></Reveal>}
              {ev.showResepsi && <Reveal delay={ev.showAkad ? 200 : 0}><EventCard data={resepsi} rotate={ev.showAkad ? "sm:rotate-1" : ""} /></Reveal>}
            </div>
          )}

          <Reveal delay={120} className="mt-12 text-center">
            <p className="font-hand text-3xl text-ink">{cfg.venue}</p>
            <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-ink/60">{cfg.address}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a href={cfg.mapsUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 border border-ink/30 bg-paper px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-terra hover:text-terra">
                <IconMap className="h-4 w-4" /> Buka Google Maps
              </a>
              <SaveToCalendar compact />
            </div>
          </Reveal>

          {mapsPhoto ? (
            <Reveal delay={180} className="mt-10">
              <figure className="relative overflow-hidden border border-ink/15 bg-paper">
                <div className="aspect-[16/9] overflow-hidden bg-paper2">
                  <img
                    src={mapsPhoto}
                    alt={`Peta lokasi ${cfg.venue}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-ink/20 px-5 py-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-navy/70">Lokasi Acara</p>
                    <p className="mt-1 truncate text-sm font-semibold text-ink">{cfg.venue}</p>
                  </div>
                  <a
                    href={cfg.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-2 border border-ink/30 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-terra hover:text-terra"
                  >
                    <IconMap className="h-3.5 w-3.5" /> Buka Maps
                  </a>
                </figcaption>
              </figure>
            </Reveal>
          ) : cfg.showMapsEmbed && cfg.mapsEmbed ? (
            <Reveal delay={180} className="mt-10">
              <div className="relative overflow-hidden" style={{ paddingBottom: "56.25%", height: 0 }}>
                <iframe src={cfg.mapsEmbed} title="Lokasi Venue" className="absolute inset-0 h-full w-full border-0" allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            </Reveal>
          ) : null}

          <div className="mt-12"><SaveToCalendar /></div>
        </div>
      </section>
    </>
  );
}
