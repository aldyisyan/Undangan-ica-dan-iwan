import { useEffect, useRef, useState } from "react";
import { useAdminConfig } from "../lib/adminSettings";
import { useMediaSrc } from "../lib/mediaStore";
import { Reveal } from "../lib/ui";

export default function VoiceNote() {
  const cfg = useAdminConfig();
  const src = useMediaSrc(cfg.voiceNoteSrc);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.duration ? a.currentTime / a.duration : 0);
    const onDur = () => setDuration(a.duration || 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onDur);
    a.addEventListener("ended", onEnd);
    return () => { a.removeEventListener("timeupdate", onTime); a.removeEventListener("loadedmetadata", onDur); a.removeEventListener("ended", onEnd); };
  }, [src]);

  const toggle = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { await a.play(); setPlaying(true); }
  };

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  // Cegah player rusak (0:00 tanpa suara) bila admin belum mengunggah file.
  if (!cfg.showVoiceNote || !cfg.voiceNoteEnabled || !src) return null;

  return (
    <Reveal className="mx-auto max-w-md">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="relative bg-paper px-6 py-7 shadow-[0_8px_32px_-16px_rgba(30,27,24,0.4)]">
        <svg className="pointer-events-none absolute inset-0 h-full w-full text-ink/40" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" aria-hidden>
          <path d="M1.6 3.4C20 1.4 46 2.8 70 1.7c15-.7 26 .2 28.4 1.7.8 17 .2 52 .4 77.1.1 11.6-.8 16.2-2.2 17.8-21.6 1-56.6-.2-78.6.6C8.4 99 3.4 98.2 2.2 97 1.4 75 2.5 40 1.6 3.4Z" stroke="currentColor" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        </svg>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-navy/70">
          {cfg.voiceNoteTitle || "Pesan Suara untuk Anda"}
        </p>
        <p className="mt-1 font-note text-sm text-terra">{cfg.voiceNoteHint || "Salam hangat dari kami"}</p>

        <div className="mt-5 flex items-center gap-4">
          <button type="button" onClick={toggle}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-terra text-terra transition-all hover:bg-terra hover:text-paper">
            {playing ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-0.5" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
          </button>
          <div className="flex-1">
            {/* progress bar */}
            <div className="relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-ink/10"
              onClick={(e) => {
                const a = audioRef.current;
                if (!a || !duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                a.currentTime = pct * duration;
              }}>
              <div className="h-full bg-terra transition-all" style={{ width: `${progress * 100}%` }} />
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-ink/50">
              <span>{fmtTime(progress * duration)}</span>
              <span>{fmtTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* waveform doodle */}
        <div className="mt-3 flex items-center justify-center gap-0.5 opacity-30">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className={`w-1 rounded-full bg-terra transition-all duration-150 ${playing ? "animate-pulse" : ""}`}
              style={{ height: `${6 + ((i * 7) % 14)}px`, animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}
