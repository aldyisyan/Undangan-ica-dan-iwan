/**
 * Musik latar undangan:
 * - Jika ada sumber audio kustom (`musicSrc`, baik `media:<key>` dari IndexedDB/Cloud maupun URL/data URI),
 *   putar lewat HTMLAudioElement (`<audio>`) dan hentikan Web Audio synth bawaan.
 * - Jika kosong / tidak ada file kustom, pakai sintetis "music box" Web Audio API bawaan.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: number | null = null;
let nextTime = 0;
let step = 0;
let playing = false;

let customAudio: HTMLAudioElement | null = null;
let currentSourceUrl = "";
let activeMode: "synth" | "custom" = "synth";
let onStateChange: ((playing: boolean) => void) | null = null;

const BPM = 74;
const EIGHTH = 60 / BPM / 2;

type Chord = { bass: number; tones: number[] };

const CHORDS: Chord[] = [
  { bass: 65.41, tones: [261.63, 329.63, 392.0] }, // C
  { bass: 98.0, tones: [246.94, 293.66, 392.0] }, // G
  { bass: 110.0, tones: [261.63, 329.63, 440.0] }, // Am
  { bass: 87.31, tones: [261.63, 349.23, 440.0] }, // F
];

const ARP = [0, 1, 2, 1, 0, 2, 1, 2];

function emitState(next: boolean) {
  playing = next;
  onStateChange?.(next);
}

function note(t: number, freq: number, dur: number, vol: number, type: OscillatorType) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(vol, 0.0002), t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.06);
}

function schedule() {
  if (!ctx || activeMode !== "synth" || !playing) return;
  while (nextTime < ctx.currentTime + 0.3) {
    const bar = Math.floor(step / 8);
    const chord = CHORDS[bar % CHORDS.length];
    const i = step % 8;
    const t = nextTime;

    if (i === 0) {
      note(t, chord.bass, 1.7, 0.14, "sine");
      chord.tones.forEach((f, k) => note(t + 0.03 + k * 0.02, f / 2, 2.8, 0.03, "sine"));
    }

    const tone = chord.tones[ARP[i]];
    const oct = i === 3 || i === 7 ? 2 : 1;
    note(t, tone * oct, 0.9, i % 2 === 0 ? 0.085 : 0.06, "triangle");

    if (bar % 2 === 1 && (i === 2 || i === 5)) {
      note(t + 0.02, tone * 2, 1.2, 0.05, "sine");
    }

    nextTime += EIGHTH;
    step += 1;
  }
}

function ensureSynth(): AudioContext {
  if (ctx) return ctx;
  const Ctor: typeof AudioContext =
    window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ac = new Ctor();
  ctx = ac;

  const gain = ac.createGain();
  gain.gain.value = 0;
  master = gain;

  const tone = ac.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 2400;

  const delay = ac.createDelay(1);
  delay.delayTime.value = 0.3;
  const feedback = ac.createGain();
  feedback.gain.value = 0.3;
  const wet = ac.createGain();
  wet.gain.value = 0.32;

  gain.connect(tone);
  tone.connect(ac.destination);
  gain.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  wet.connect(tone);

  nextTime = ac.currentTime + 0.2;
  timer = window.setInterval(schedule, 50);
  return ac;
}

function fadeSynth(target: number) {
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(target, now + 0.6);
}

function pauseSynthSilently() {
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(0, now);
}

function destroyCustomAudio() {
  if (!customAudio) return;
  customAudio.pause();
  customAudio.removeAttribute("src");
  customAudio.load();
  customAudio = null;
  currentSourceUrl = "";
}

function ensureCustomAudio(url: string): HTMLAudioElement {
  if (customAudio && currentSourceUrl === url) {
    return customAudio;
  }
  destroyCustomAudio();
  const el = new Audio();
  el.src = url;
  el.loop = true;
  el.preload = "auto";
  el.crossOrigin = "anonymous";
  el.addEventListener("ended", () => {
    if (!el.loop) emitState(false);
  });
  customAudio = el;
  currentSourceUrl = url;
  return el;
}

export function setMusicStateListener(listener: ((playing: boolean) => void) | null) {
  onStateChange = listener;
}

/**
 * Sinkronkan sumber musik kustom (`resolvedUrl` dari `useMediaSrc(cfg.musicSrc)`).
 * - Jika `resolvedUrl` ada: pindah ke mode custom audio. Jika sedang playing, langsung putar audio kustom.
 * - Jika `resolvedUrl` kosong: kembali ke mode synth bawaan. Jika sedang playing, hentikan custom audio dan lanjutkan synth.
 */
export async function syncMusicSource(resolvedUrl: string): Promise<boolean> {
  const cleanUrl = (resolvedUrl || "").trim();
  const wasPlaying = playing;

  if (cleanUrl) {
    activeMode = "custom";
    pauseSynthSilently();

    const el = ensureCustomAudio(cleanUrl);
    if (wasPlaying) {
      try {
        await el.play();
        emitState(true);
        return true;
      } catch {
        emitState(false);
        return false;
      }
    }
    return playing;
  }

  // Tidak ada musik kustom -> pakai synth bawaan
  activeMode = "synth";
  destroyCustomAudio();

  if (wasPlaying) {
    const ac = ensureSynth();
    if (ac.state === "suspended") {
      try {
        await ac.resume();
      } catch {
        /* ignore */
      }
    }
    nextTime = ac.currentTime + 0.1;
    fadeSynth(0.17);
    emitState(true);
    return true;
  }

  return playing;
}

export const music = {
  get isPlaying() {
    return playing;
  },
  async start(): Promise<boolean> {
    if (activeMode === "custom" && currentSourceUrl) {
      const el = ensureCustomAudio(currentSourceUrl);
      pauseSynthSilently();
      try {
        await el.play();
        emitState(true);
        return true;
      } catch {
        emitState(false);
        return false;
      }
    }

    activeMode = "synth";
    const ac = ensureSynth();
    if (ac.state === "suspended") {
      try {
        await ac.resume();
      } catch {
        /* autoplay policy — tetap coba lagi pada interaksi berikutnya */
      }
    }
    nextTime = ac.currentTime + 0.1;
    fadeSynth(0.17);
    emitState(true);
    return true;
  },
  async pause(): Promise<boolean> {
    if (activeMode === "custom" && customAudio) {
      customAudio.pause();
      emitState(false);
      return false;
    }
    if (!ctx) {
      emitState(false);
      return false;
    }
    fadeSynth(0);
    emitState(false);
    return false;
  },
  async toggle(): Promise<boolean> {
    return playing ? this.pause() : this.start();
  },
};

export function disposeMusic() {
  if (timer !== null) window.clearInterval(timer);
  timer = null;
  destroyCustomAudio();
  if (ctx) void ctx.close();
  ctx = null;
  master = null;
  playing = false;
  activeMode = "synth";
}
