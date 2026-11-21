/**
 * RK-INVITE v2.5
 * Undangan pernikahan digital (Ica & Iwan)
 * Fitur: Scrapbook gallery, auto-sync Supabase, RSVP override
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { disposeMusic, music, setMusicStateListener, syncMusicSource } from "./lib/music";
import { useMediaSrc } from "./lib/mediaStore";
import { IconMusic } from "./lib/ui";
import Cover from "./sections/Cover";
import DateEvents from "./sections/DateEvents";
import Gallery from "./sections/Gallery";
import Opening from "./sections/Opening";
import Rsvp from "./sections/Rsvp";
import Story from "./sections/Story";
import VoiceNote from "./components/VoiceNote";
import FloatingAccents from "./components/FloatingAccents";
import AdminPage from "./pages/AdminPage";
import { getCloudRead, saveCloudRead, saveCloudAdmin, getCloudAdmin, decodeCloudParam, resolveCloudFromRef } from "./lib/cloudConfig";
import { pullFromCloud } from "./lib/cloud";
import { useAdminConfig } from "./lib/adminSettings";
import { getGuestNameParam, useGuestFromUrl } from "./lib/guestBook";

function useGuestDisplayName() {
  const guestRecord = useGuestFromUrl();
  return useMemo(() => guestRecord?.name || getGuestNameParam(), [guestRecord]);
}

function useIsAdmin() {
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  return hash === "#admin" || hash.startsWith("#admin?") || hash === "#/admin";
}

export default function App() {
  const isAdmin = useIsAdmin();
  const guestName = useGuestDisplayName();
  const cfg = useAdminConfig();
  const resolvedMusicUrl = useMediaSrc(cfg.musicSrc);

  const [opened, setOpened] = useState(false);
  const [burst, setBurst] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* ---- cloud bootstrap ---- */
  useEffect(() => {
    let timer: number | null = null;

    const boot = async () => {
      const combined = `${window.location.search}&${window.location.hash}`;
      const shortMatch = combined.match(/[?&]c=([^&#]+)/);
      const longMatch = combined.match(/[?&]cloud=([^&#]+)/);
      if (shortMatch) {
        const ref = decodeURIComponent(shortMatch[1]).trim();
        const existing = getCloudRead();
        // Selalu resolve cloud.json untuk mendapatkan anonKey terbaru.
        // anonKey di cloud.json bersifat PUBLIK dan aman dibaca oleh siapa pun.
        // Tanpa anonKey ini, perangkat tamu tidak bisa push ucapan RSVP ke Supabase.
        if (!existing?.anonKey) {
          const full = await resolveCloudFromRef(ref);
          if (full) {
            saveCloudRead(full); // simpan termasuk anonKey agar tamu bisa push
            if (full.anonKey && !getCloudAdmin()) {
              saveCloudAdmin({ url: full.url, bucket: full.bucket, anonKey: full.anonKey });
            }
          } else {
            saveCloudRead({ url: `https://${ref}.supabase.co`, bucket: "invite" });
          }
        }
      } else if (longMatch) {
        const c = decodeCloudParam(longMatch[1]);
        if (c) {
          saveCloudRead(c);
          if (c.anonKey && !getCloudAdmin()) {
            saveCloudAdmin({ url: c.url, bucket: c.bucket, anonKey: c.anonKey });
          }
        }
      }

      if (getCloudRead()) await pullFromCloud().catch(() => {});

      if (!isAdmin) {
        timer = window.setInterval(() => {
          if (getCloudRead()) pullFromCloud().catch(() => {});
        }, 20_000);
      }
    };

    boot();

    const onVisible = () => {
      if (isAdmin) return;
      if (document.visibilityState === "visible" && getCloudRead()) pullFromCloud().catch(() => {});
    };

    if (!isAdmin) {
      document.addEventListener("visibilitychange", onVisible);
      window.addEventListener("focus", onVisible);
    }

    return () => {
      if (timer !== null) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [isAdmin]);

  useEffect(() => {
    setMusicStateListener((nextPlaying) => setPlaying(nextPlaying));
    return () => setMusicStateListener(null);
  }, []);

  useEffect(() => {
    void syncMusicSource(resolvedMusicUrl);
  }, [resolvedMusicUrl]);

  useEffect(() => {
    if (isAdmin) return;
    document.body.style.overflow = opened ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened, isAdmin]);

  useEffect(() => {
    if (!opened || isAdmin) return;
    const onScroll = () => setScrolled(window.scrollY > 200);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [opened, isAdmin]);

  useEffect(() => () => disposeMusic(), []);

  const openInvitation = useCallback(async () => {
    setOpened(true);
    setBurst(true);
    window.setTimeout(() => setBurst(false), 3200);
    await syncMusicSource(resolvedMusicUrl);
    try {
      setPlaying(await music.start());
    } catch {
      setPlaying(false);
    }
    window.setTimeout(() => {
      document.getElementById("salam")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 700);
  }, [resolvedMusicUrl]);

  const toggleMusic = useCallback(async () => {
    await syncMusicSource(resolvedMusicUrl);
    try {
      setPlaying(await music.toggle());
    } catch {
      setPlaying(false);
    }
  }, [resolvedMusicUrl]);

  if (isAdmin) return <AdminPage />;

  return (
    <div className="relative min-h-screen bg-paper text-ink antialiased">
      <div className="paper-grain" aria-hidden />
      <FloatingAccents />

      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${opened && scrolled ? "translate-y-0 border-b border-dashed border-ink/20 bg-paper/90 backdrop-blur-sm" : "-translate-y-full opacity-0"}`}
      >
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-3">
          <a href="#cover" className="font-hand text-2xl leading-none text-ink">
            {cfg.brideNick} <span className="text-terra">&amp;</span> {cfg.groomNick}
          </a>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-navy/75">{cfg.weddingDateLabel}</p>
        </div>
      </header>

      <main>
        <Cover opened={opened} burst={burst} onOpen={openInvitation} guestName={guestName} />
        <Opening guestName={guestName} />
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

      {opened && (
        <button
          type="button"
          onClick={toggleMusic}
          aria-pressed={playing}
          aria-label={playing ? "Matikan musik" : "Nyalakan musik"}
          className="group fixed bottom-5 right-5 z-50 grid h-12 w-12 place-items-center rounded-full border border-ink/25 bg-paper text-ink shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-terra hover:text-terra sm:bottom-7 sm:right-7 sm:h-14 sm:w-14"
        >
          <span
            aria-hidden
            className={`absolute -inset-1.5 rounded-full border border-dashed transition-colors duration-300 ${playing ? "spin-slow border-terra/70" : "border-ink/20"}`}
          />
          <IconMusic playing={playing} className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
