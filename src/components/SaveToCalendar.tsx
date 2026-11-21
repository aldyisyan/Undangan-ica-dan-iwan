import { useState } from "react";
import { useAdminConfig } from "../lib/adminSettings";
import { Reveal } from "../lib/ui";

function toICalDate(isoStr: string): string {
  // Convert "2026-11-21T09:00:00+07:00" → "20261121T090000"
  const d = new Date(isoStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

function buildICalContent(title: string, start: string, end: string, location: string, description: string) {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Undangan Digital//ID",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export default function SaveToCalendar({ compact = false }: { compact?: boolean }) {
  const cfg = useAdminConfig();
  const [open, setOpen] = useState(false);

  if (!cfg.showSaveCalendar) return null;

  const title = `Pernikahan ${cfg.brideNick} & ${cfg.groomNick}`;
  const loc = `${cfg.venue}, ${cfg.address}`;
  const desc = `Resepsi: ${cfg.resepsiTime} — ${cfg.resepsiPlace}`;
  const startISO = cfg.weddingDate; // "2026-11-21T09:00:00+07:00"
  const startUTC = toICalDate(startISO);
  // Assume 5 hours duration
  const endDate = new Date(new Date(startISO).getTime() + 5 * 60 * 60 * 1000);
  const endUTC = toICalDate(endDate.toISOString());

  // Google Calendar
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startUTC}/${endUTC}&details=${encodeURIComponent(desc)}&location=${encodeURIComponent(loc)}`;

  // iCal download
  const downloadIcal = () => {
    const content = buildICalContent(title, startUTC, endUTC, loc, desc);
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `undangan-${cfg.brideNick}-${cfg.groomNick}.ics`.toLowerCase().replace(/\s+/g, "-");
    a.click();
    URL.revokeObjectURL(url);
  };

  if (compact) {
    return (
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-2 border border-dashed border-navy/40 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-terra hover:text-terra">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          Simpan ke Kalender
        </button>
        {open && (
          <div className="absolute bottom-full left-0 mb-2 z-50 w-52 bg-paper border border-ink/15 shadow-xl">
            <a href={gcalUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-sm text-ink hover:bg-paper2">
              <span>🗓</span> Google Calendar
            </a>
            <button type="button" onClick={() => { downloadIcal(); setOpen(false); }}
              className="flex w-full items-center gap-3 px-4 py-3 text-sm text-ink hover:bg-paper2">
              <span>📅</span> Apple / iCal (.ics)
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Reveal className="text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/70">
        Jangan sampai terlewat
      </p>
      <p className="mt-1 font-hand text-3xl text-ink">Simpan Tanggal</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <a href={gcalUrl} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-2.5 border border-ink/25 bg-paper px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-terra hover:text-terra">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          Google Calendar
        </a>
        <button type="button" onClick={downloadIcal}
          className="inline-flex items-center gap-2.5 border border-ink/25 bg-paper px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-terra hover:text-terra">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          Apple / iCal (.ics)
        </button>
      </div>
    </Reveal>
  );
}
