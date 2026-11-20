import { useCallback, useEffect, useState } from "react";
import { disposeMusic, music } from "./lib/music";
import { IconMusic } from "./lib/ui";
import Cover from "./sections/Cover";
import DateEvents from "./sections/DateEvents";
import Gallery from "./sections/Gallery";
import Opening from "./sections/Opening";
import Rsvp from "./sections/Rsvp";
import Story from "./sections/Story";
import VoiceNote from "./components/VoiceNote";
import FloatingAccents from "./components/FloatingAccents";
import { useAdminConfig } from "./lib/adminSettings";

function useGuestParam() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("to")?.trim() || null;
}

export default function App() {
  const guestParam = useGuestParam();
  const cfg = useAdminConfig();

  const [opened, setOpened] = useState(false);
  const [burst, setBurst] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* ---- redirect hash admin to /admin ---- */
  useEffect(() => {
    if (window.location.hash.startsWith("#admin") || window.location.hash.startsWith("#/admin")) {
        window.location.href = "/admin";
    }
  }, []);

  useEffect(() => { 
    document.body.style.overflow = opened ? "" : "hidden"; 
    return () => { document.body.style.overflow = ""; }; 
  }, [opened]);

  useEffect(() => {
    if (!opened) return;
    const onScroll = () => setScrolled(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [opened]);

  useEffect(() => () => disposeMusic(), []);

  const openInvitation = useCallback(async () => {
    setOpened(true);
    setBurst(true);
    window.setTimeout(() => setBurst(false), 3200);
    try { setPlaying(await music.start()); } catch { setPlaying(false); }
    window.setTimeout(() => { document.getElementById("salam")?.scrollIntoView({ behavior: "smooth", block: "start" }); }, 700);
  }, []);

  const toggleMusic = useCallback(async () => {
    try { setPlaying(await music.toggle()); } catch { setPlaying(false); }
  }, []);

  return (
    <div className="relative min-h-screen bg-paper text-ink antialiased">
      <div className="paper-grain" aria-hidden />
      <FloatingAccents />

      {/* sticky header */}
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${opened && scrolled ? "translate-y-0 border-b border-dashed border-ink/20 bg-paper/90 backdrop-blur-sm" : "-translate-y-full opacity-0"}`}>
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-3">
          <a href="#cover" className="font-hand text-2xl leading-none text-ink">
            {cfg.groomNick} <span className="text-terra">&amp;</span> {cfg.brideNick}
          </a>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-navy/75">{cfg.weddingDateLabel}</p>
        </div>
      </header>

      <main>
        <Cover opened={opened} burst={burst} onOpen={openInvitation} />
        <Opening guestName={guestParam} />
        <DateEvents />
        {cfg.showStory && <Story showDressCode={cfg.showDressCode} />}
        {!cfg.showStory && cfg.showDressCode && <Story showDressCode={true} />}
        {cfg.showGallery && <Gallery />}
        {cfg.showVoiceNote && cfg.voiceNoteEnabled && (
          <section className="py-16 sm:py-20">
            <div className="mx-auto w-full max-w-4xl px-6 sm:px-8">
              <VoiceNote />
            </div>
          </section>
        )}
        <Rsvp showRsvp={cfg.showRsvp} showGifts={cfg.showGifts} gifts={cfg.gifts} />
      </main>

      {/* floating music button */}
      {opened && (
        <button type="button" onClick={toggleMusic} aria-pressed={playing}
          aria-label={playing ? "Matikan musik" : "Nyalakan musik"}
          className="group fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full border border-ink/25 bg-paper text-ink shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-terra hover:text-terra sm:bottom-7 sm:right-7 sm:h-14 sm:w-14">
          <span aria-hidden className={`absolute -inset-1.5 rounded-full border border-dashed transition-colors duration-300 ${playing ? "spin-slow border-terra/70" : "border-ink/20"}`} />
          <IconMusic playing={playing} className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
