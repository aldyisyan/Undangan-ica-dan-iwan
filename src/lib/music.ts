/**
 * Latar musik romantis "music box" — dibangkitkan penuh lewat Web Audio API
 * supaya tidak bergantung pada file audio eksternal yang bisa gagal dimuat.
 * Progresi C - G - Am - F, arpeggio lembut + bass sine + echo dangkal.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer: number | null = null;
let nextTime = 0;
let step = 0;
let playing = false;

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
  if (!ctx) return;
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

function ensure(): AudioContext {
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

function fade(target: number) {
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(master.gain.value, now);
  master.gain.linearRampToValueAtTime(target, now + 1.1);
}

export const music = {
  get isPlaying() {
    return playing;
  },
  async start(): Promise<boolean> {
    const ac = ensure();
    if (ac.state === "suspended") {
      try {
        await ac.resume();
      } catch {
        /* autoplay policy — tetap coba lagi pada interaksi berikutnya */
      }
    }
    fade(0.17);
    playing = true;
    return playing;
  },
  async pause(): Promise<boolean> {
    if (!ctx) {
      playing = false;
      return false;
    }
    fade(0);
    playing = false;
    return playing;
  },
  async toggle(): Promise<boolean> {
    return playing ? this.pause() : this.start();
  },
};

export function disposeMusic() {
  if (timer !== null) window.clearInterval(timer);
  timer = null;
  if (ctx) void ctx.close();
  ctx = null;
  master = null;
  playing = false;
}
