import { useState, type FormEvent } from "react";
import closing from "../assets/closing.jpg";
import { SECTION_PAD, WEDDING, WRAP } from "../lib/data";
import { useWishes, addWish, type Wish } from "../lib/wishes";
import { getCloudAdmin } from "../lib/cloudConfig";
import { pushWishesToCloud } from "../lib/cloud";
import {
  DoodleDivider,
  HeartDoodle,
  IconCheck,
  IconCopy,
  OvalButton,
  Reveal,
  RoughFrame,
  SectionHead,
} from "../lib/ui";

interface GiftItem { bank: string; number: string; holder: string; kind: string; }

const STATUS_OPTIONS = ["Hadir", "Tidak Hadir", "Masih Ragu"] as const;

function statusChip(attend: string) {
  if (attend === "hadir" || attend === "Hadir") return "border-terra/60 bg-terra/10 text-terra";
  if (attend === "tidak" || attend === "Tidak Hadir") return "border-ink/25 bg-ink/5 text-ink/60";
  return "border-navy/40 bg-navy/10 text-navy";
}
function attendLabel(attend: string) {
  const map: Record<string, string> = { hadir: "Hadir", tidak: "Tidak Hadir", ragu: "Masih Ragu" };
  return map[attend] ?? attend;
}

export default function Rsvp({
  showRsvp = true,
  showGifts = true,
  gifts = [],
}: {
  showRsvp?: boolean;
  showGifts?: boolean;
  gifts?: GiftItem[];
}) {
  const cloudWishes = useWishes();
  const [name, setName] = useState("");
  const [attend, setAttend] = useState<"Hadir" | "Tidak Hadir" | "Masih Ragu">("Hadir");
  const [guestCount, setGuestCount] = useState(2);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(""), 2800);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) { setError("Mohon isi nama Anda terlebih dahulu."); return; }
    setError("");
    const attendMap: Record<string, Wish["attend"]> = { "Hadir": "hadir", "Tidak Hadir": "tidak", "Masih Ragu": "ragu" };
    const wish: Wish = {
      name: name.trim(),
      attend: attendMap[attend] ?? "hadir",
      count: attend === "Hadir" ? guestCount : 0,
      message: message.trim() || "Selamat menempuh hidup baru, Iwan & Ica!",
      at: Date.now(),
    };
    addWish(wish);
    const admin = getCloudAdmin();
    if (admin) await pushWishesToCloud(admin, [wish, ...cloudWishes]);
    setName(""); setMessage(""); setGuestCount(2); setAttend("Hadir");
    showToast("Terima kasih, ucapan Anda tersimpan ♥");
  };

  const copy = async (text: string, label: string) => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy");
      document.body.removeChild(ta);
    }
    showToast(`${label} berhasil disalin ✓`);
  };

  return (
    <>
      {/* ---- 08 · rsvp ---- */}
      {showRsvp && (
        <section id="rsvp" className={`${SECTION_PAD} relative bg-paper2/70`}>
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-ink/20" />
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 border-b border-dashed border-ink/20" />

          <div className={WRAP}>
            <SectionHead num="08" kicker="RSVP & Amplop Digital" title="Konfirmasi Kehadiran" aside="satu klik, satu doa" />

            <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-10">
              {/* form */}
              <Reveal>
                <form onSubmit={submit} className="relative bg-paper px-6 py-8 sm:px-8">
                  <RoughFrame stroke="rgba(30,27,24,0.5)" />
                  <p className="font-hand text-3xl leading-none text-ink">Apakah Anda akan hadir?</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink/60">Mohon konfirmasi sebelum 14 November 2026 agar kami dapat menyiapkan tempat terbaik untuk Anda.</p>

                  <label className="mt-7 block text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/75">Nama Lengkap</label>
                  <input value={name} onChange={(e) => { setName(e.target.value); if (error) setError(""); }}
                    placeholder="Tulis nama Anda"
                    className="mt-2 w-full border-b border-ink/25 bg-transparent py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-terra" />

                  <span className="mt-7 block text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/75">Kehadiran</span>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {STATUS_OPTIONS.map((s) => {
                      const on = attend === s;
                      return (
                        <button key={s} type="button" onClick={() => setAttend(s)} aria-pressed={on}
                          className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 ${on ? "border-terra bg-terra text-paper" : "border-ink/25 bg-paper text-ink/65 hover:border-terra hover:text-terra"}`}>
                          {s}
                        </button>
                      );
                    })}
                  </div>

                  <span className="mt-7 block text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/75">Jumlah Tamu</span>
                  <div className={`mt-3 flex items-center gap-4 ${attend !== "Hadir" ? "opacity-40" : ""}`}>
                    <button type="button" disabled={attend !== "Hadir" || guestCount <= 1} onClick={() => setGuestCount((g) => Math.max(1, g - 1))}
                      className="grid h-10 w-10 place-items-center rounded-full border border-ink/25 text-lg leading-none text-ink transition hover:border-terra hover:text-terra disabled:cursor-not-allowed">
                      &minus;
                    </button>
                    <span className="w-24 text-center font-hand text-3xl text-ink tabular">{attend === "Hadir" ? guestCount : 0} orang</span>
                    <button type="button" disabled={attend !== "Hadir" || guestCount >= 10} onClick={() => setGuestCount((g) => Math.min(10, g + 1))}
                      className="grid h-10 w-10 place-items-center rounded-full border border-ink/25 text-lg leading-none text-ink transition hover:border-terra hover:text-terra disabled:cursor-not-allowed">
                      +
                    </button>
                  </div>

                  <label className="mt-7 block text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/75">Ucapan &amp; Doa</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                    placeholder="Tuliskan doa terbaik Anda…"
                    className="mt-2 w-full resize-none border-b border-ink/25 bg-transparent py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-terra" />

                  {error && <p className="mt-3 font-note text-sm text-terra">{error}</p>}
                  <div className="mt-8 flex justify-center">
                    <OvalButton type="submit" tone="terra">Kirim Ucapan</OvalButton>
                  </div>
                </form>
              </Reveal>

              {/* ucapan + amplop */}
              <Reveal delay={140} className="flex flex-col">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/75">Doa dari Tamu</p>
                <p className="mt-2 font-hand text-3xl text-ink">Ucapan yang masuk</p>

                <ul className="no-scrollbar mt-6 max-h-[520px] space-y-4 overflow-y-auto pr-1">
                  {cloudWishes.length === 0 && (
                    <li className="text-sm text-ink/50">Jadilah yang pertama memberikan ucapan ♥</li>
                  )}
                  {cloudWishes.map((w, i) => (
                    <li key={`${w.name}-${i}`} className="border border-dashed border-ink/25 bg-paper px-5 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-hand text-2xl leading-none text-ink">{w.name}</p>
                        <span className={`rounded-full border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] ${statusChip(w.attend)}`}>
                          {attendLabel(w.attend)}{w.count ? ` · ${w.count}` : ""}
                        </span>
                      </div>
                      <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink/75">{w.message}</p>
                      <p className="mt-2.5 font-note text-[11px] uppercase tracking-[0.14em] text-ink/55">
                        {new Date(w.at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </li>
                  ))}
                </ul>

                {/* amplop digital */}
                {showGifts && gifts.length > 0 && (
                  <div className="mt-10">
                    <div className="flex items-center gap-3">
                      <HeartDoodle className="h-5 w-5 text-terra" filled />
                      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/75">Kirim Hadiah / Amplop Digital</p>
                    </div>
                    <p className="mt-3 text-[13px] leading-relaxed text-ink/60">
                      Doa restu Anda sudah lebih dari cukup. Namun bila berkenan, tanda kasih dapat dikirimkan melalui:
                    </p>
                    <div className="mt-5 space-y-3">
                      {gifts.map((g) => (
                        <div key={`${g.bank}-${g.number}`} className="group flex items-center justify-between gap-4 bg-paper px-5 py-4">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy/70">{g.bank} &middot; {g.kind}</p>
                            <p className="mt-1 truncate font-hand text-2xl leading-none text-ink tabular">{g.number}</p>
                            <p className="mt-1 text-[12px] text-ink/55">a.n. {g.holder}</p>
                          </div>
                          <button type="button" onClick={() => copy(g.number, `Nomor ${g.bank}`)}
                            className="flex shrink-0 items-center gap-2 border border-ink/25 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-terra hover:text-terra">
                            <IconCopy className="h-3.5 w-3.5" />Salin
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Reveal>
            </div>
          </div>

          {toast && (
            <div role="status" className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 bg-ink px-6 py-3 text-paper shadow-xl">
              <span className="flex items-center gap-2 font-note text-sm">
                <IconCheck className="h-4 w-4 text-terra" />{toast}
              </span>
            </div>
          )}
        </section>
      )}

      {/* ---- 09 · penutup ---- */}
      <section id="penutup" className={`${SECTION_PAD} relative overflow-hidden pb-16`}>
        <div className={WRAP}>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-navy/70">09 &mdash; Terima Kasih</p>
            <h2 className="mt-4 font-hand text-[clamp(2.6rem,9vw,4.4rem)] leading-none text-ink">Terima Kasih</h2>
            <div className="mt-3 flex justify-center"><DoodleDivider /></div>
            <p className="mt-6 text-[15px] leading-[1.9] text-ink/75">
              Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak, Ibu, Saudara, dan Saudari berkenan hadir untuk memberikan doa restu.
            </p>
            <p className="mt-6 font-note text-lg text-terra">Sampai jumpa di hari bahagia kami, {WEDDING.dateLabel}</p>
            <p className="mt-8 font-hand text-5xl leading-none text-ink">Iwan <span className="text-terra">&amp;</span> Ica</p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-navy/70">{WEDDING.fullLabel} &middot; {WEDDING.venue}</p>
          </Reveal>
        </div>

        <div className="mx-auto mt-12 w-full max-w-lg px-6 sm:max-w-2xl">
          <Reveal className="relative">
            <div className="relative aspect-[3/2] overflow-hidden bg-paper2">
              <img src={closing} alt="Ilustrasi Iwan dan Ica berjalan beriringan pulang" className="h-full w-full object-cover" loading="lazy" />
            </div>
            <svg className="pointer-events-none absolute inset-0 h-full w-full text-ink/70" viewBox="0 0 300 200" preserveAspectRatio="none" fill="none" aria-hidden>
              <path d="M6 8C80 4 200 10 294 6c3 54-2 134 1 187-85 4-175-2-288 2C3 140 9 60 6 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <HeartDoodle className="drift absolute -right-4 top-8 h-6 w-6 text-terra/70" />
            <HeartDoodle className="drift absolute -left-3 bottom-14 h-5 w-5 text-navy/55" />
          </Reveal>
        </div>

        <footer className="mt-10 flex flex-col items-center gap-4 px-6 text-center">
          <HeartDoodle className="heartbeat h-5 w-5 text-terra" filled />
          <p className="font-note text-[13px] text-ink/55">Dibuat dengan cinta &mdash; #IwanIcaForever</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href={`https://wa.me/?text=${encodeURIComponent(`Undangan Pernikahan Iwan & Ica — Sabtu, 21 November 2026. Kami menantikan kehadiran dan doa restu Anda. ${typeof window !== "undefined" ? window.location.href : ""}`)}`}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 border border-ink/25 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-terra hover:text-terra">
              <HeartDoodle className="h-3.5 w-3.5" filled />Bagikan via WhatsApp
            </a>
            <a href="#admin" className="inline-flex items-center gap-2 border border-dashed border-navy/30 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/60 transition-all duration-300 hover:-translate-y-0.5 hover:border-terra hover:text-terra">
              Admin Panel
            </a>
            <a href="#cover" className="inline-flex items-center gap-2 border border-dashed border-navy/40 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-navy transition-all duration-300 hover:-translate-y-0.5 hover:border-terra hover:text-terra">
              Kembali ke atas
            </a>
          </div>
        </footer>
      </section>
    </>
  );
}
