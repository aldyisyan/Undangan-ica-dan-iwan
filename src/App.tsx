import { useCallback, useEffect, useState } from "react";
import { disposeMusic, music } from "./lib/music";
import { IconMusic, MarginRail, type RailItem } from "./lib/ui";
import Cover from "./sections/Cover";
import DateEvents from "./sections/DateEvents";
import Gallery from "./sections/Gallery";
import Opening from "./sections/Opening";
import Rsvp from "./sections/Rsvp";
import Story from "./sections/Story";
import AdminPage from "./pages/AdminPage";
import { getCloudRead, saveCloudRead, saveCloudAdmin, getCloudAdmin, decodeCloudParam, resolveCloudFromRef } from "./lib/cloudConfig";
import { pullFromCloud } from "./lib/cloud";
import { useAdminConfig } from "./lib/adminSettings";

const RAIL: RailItem[] = [
  { id: "salam", num: "01", label: "Salam" },
  { id: "mempelai", num: "02", label: "Mempelai" },
  { id: "hitung-mundur", num: "03", label: "Hari-H" },
  { id: "acara", num: "04", label: "Acara" },
  { id: "cerita", num: "05", label: "Cerita" },
  { id: "dresscode", num: "06", label: "Dress Code" },
  { id: "galeri", num: "07", label: "Galeri" },
  { id: "rsvp", num: "08", label: "RSVP" },
  { id: "penutup", num: "09", label: "Terima Kasih" },
];

function useGuestParam() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("to")?.trim() || null;
}

function useIsAdmin() {
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  return hash === "#admin" || hash.startsWith("#admin?") || hash === "#/admin";
}

export default function App() {
  const isAdmin = useIsAdmin();
  const guestParam = useGuestParam();
  const cfg = useAdminConfig();

  const [opened, setOpened] = useState(false);
  const [burst, setBurst] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState("salam");
  const [scrolled, setScrolled] = useState(false);

  /* ---------- cloud bootstrap (identical to reference repo) ---------- */
  useEffect(() => {
    const boot = async () => {
      const combined = `${window.location.search}&${window.location.hash}`;
      const shortMatch = combined.match(/[?&]c=([^&#]+)/);
      const longMatch = combined.match(/[?&]cloud=([^&#]+)/);

      if (shortMatch) {
        const ref = decodeURIComponent(shortMatch[1]).trim();
        const existing = getCloudRead();
        if (!existing || !existing.anonKey) {
          const full = await resolveCloudFromRef(ref);
          if (full) {
            saveCloudRead(full);
            if (full.anonKey && !getCloudAdmin()) {
              saveCloudAdmin({ url: full.url, bucket: full.bucket, anonKey: full.anonKey });
            }
          } else {
            saveCloudRead({ url: `https://${ref}.supabase.co`, bucket: "invite" });
          }
        }
      } else if (longMatch) {
        const cfg = decodeCloudParam(longMatch[1]);
        if (cfg) {
          saveCloudRead(cfg);
          if (cfg.anonKey && !getCloudAdmin()) {
            saveCloudAdmin({ url: cfg.url, bucket: cfg.bucket, anonKey: cfg.anonKey });
          }
        }
      }

      if (getCloudRead()) await pullFromCloud().catch(() => {});
    };
    boot();

    const timer = window.setInterval(() => {
      if (getCloudRead()) pullFromCloud().catch(() => {});
    }, 15_000);

    const onVisible = () => {
      if (document.visibilityState === "visible" && getCloudRead()) pullFromCloud().catch(() => {});
    };
    const onFocus = () => { if (getCloudRead()) pullFromCloud().catch(() => {}); };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  /* ---------- block scroll until opened ---------- */
  useEffect(() => {
    if (isAdmin) return;
    document.body.style.overflow = opened ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [opened, isAdmin]);

  /* ---------- scroll tracking ---------- */
  useEffect(() => {
    if (!opened || isAdmin) return;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 260);
        const line = window.innerHeight * 0.38;
        let current = RAIL[0].id;
        for (const item of RAIL) {
          const el = document.getElementById(item.id);
          if (el && el.getBoundingClientRect().top <= line) current = item.id;
        }
        setActive(current);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [opened, isAdmin]);

  useEffect(() => () => disposeMusic(), []);

  const openInvitation = useCallback(async () => {
    setOpened(true);
    setBurst(true);
    window.setTimeout(() => setBurst(false), 3200);
    try { setPlaying(await music.start()); } catch { setPlaying(false); }
    window.setTimeout(() => {
      document.getElementById("salam")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 700);
  }, []);

  const toggleMusic = useCallback(async () => {
    try { setPlaying(await music.toggle()); } catch { setPlaying(false); }
  }, []);

  /* -------------------- ADMIN route -------------------- */
  if (isAdmin) return <AdminPage />;

  /* -------------------- Build dynamic RAIL (hide disabled sections) -------------------- */
  const visibleRail = RAIL.filter((r) => {
    if (r.id === "cerita" && !cfg.showStory) return false;
    if (r.id === "dresscode" && !cfg.showDressCode) return false;
    if (r.id === "galeri" && !cfg.showGallery) return false;
    if (r.id === "rsvp" && !cfg.showRsvp) return false;
    return true;
  });

  return (
    <div className="relative min-h-screen bg-paper text-ink antialiased">
      <div className="paper-grain" aria-hidden />

      {/* sticky header */}
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${opened && scrolled ? "translate-y-0 border-b border-dashed border-ink/20 bg-paper/90 backdrop-blur-sm" : "-translate-y-full opacity-0"}`}>
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-3 xl:pl-52">
          <a href="#cover" className="font-hand text-2xl leading-none text-ink">
            Iwan <span className="text-terra">&amp;</span> Ica
          </a>
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-navy/75">21 · 11 · 2026</p>
            <a href="#admin" className="text-[9px] font-semibold uppercase tracking-[0.18em] text-ink/30 transition-colors hover:text-terra">Admin</a>
          </div>
        </div>
      </header>

      {opened && <MarginRail items={visibleRail} active={active} />}

      <main>
        <Cover opened={opened} burst={burst} onOpen={openInvitation} />
        <Opening guestName={guestParam} />
        <DateEvents />
        {cfg.showStory && <Story showDressCode={cfg.showDressCode} />}
        {!cfg.showStory && cfg.showDressCode && <Story showDressCode={true} />}
        {cfg.showGallery && <Gallery />}
        <Rsvp
          showRsvp={cfg.showRsvp}
          showGifts={cfg.showGifts}
          gifts={cfg.gifts}
        />
      </main>

      {/* floating music button */}
      {opened && (
        <button
          type="button"
          onClick={toggleMusic}
          aria-pressed={playing}
          aria-label={playing ? "Matikan musik latar" : "Nyalakan musik latar"}
          className="group fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full border border-ink/25 bg-paper text-ink shadow-[0_10px_30px_-18px_rgba(30,27,24,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:border-terra hover:text-terra sm:bottom-7 sm:right-7"
        >
          <span aria-hidden className={`absolute -inset-1.5 rounded-full border border-dashed transition-colors duration-300 ${playing ? "spin-slow border-terra/70" : "border-ink/20"}`} />
          <IconMusic playing={playing} className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
