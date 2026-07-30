/* ============================================
   LumiStrip — Booth Sound Effects
   Drop real files at /public/sounds/countdown-tick.mp3
   and /public/sounds/shutter.mp3 to use your own audio —
   they'll be picked up automatically. Until then, or if
   they fail to load, a synthesized tone is used instead.
   ============================================ */

let audioCtx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  try {
    if (!audioCtx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new Ctor();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  } catch {
    return null;
  }
}

function beep(frequency: number, durationMs: number, type: OscillatorType = 'sine', gainPeak = 0.22) {
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(gainPeak, ctx.currentTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + durationMs / 1000 + 0.02);
}

const fileCache: Record<string, HTMLAudioElement | null> = {};

function playFileOrFallback(path: string, fallback: () => void) {
  if (fileCache[path] === undefined) {
    const audio = new Audio(path);
    audio.volume = 0.7;
    // If the file doesn't exist / can't load, fall back permanently for this session.
    audio.addEventListener('error', () => {
      fileCache[path] = null;
    });
    fileCache[path] = audio;
  }
  const cached = fileCache[path];
  if (cached) {
    cached.currentTime = 0;
    cached.play().catch(fallback);
  } else {
    fallback();
  }
}

/** Countdown tick — plays once per second during the 5-4-3-2-1 countdown. */
export function playCountdownTick(secondsLeft: number) {
  playFileOrFallback('/sounds/countdown-tick.mp3', () => {
    // Higher pitch as we approach zero, like a real booth countdown
    beep(secondsLeft === 1 ? 720 : 520, 110, 'sine', 0.18);
  });
}

/** Shutter — plays the instant a photo is captured. */
export function playShutter() {
  playFileOrFallback('/sounds/shutter.mp3', () => {
    beep(180, 90, 'square', 0.25);
    setTimeout(() => beep(1200, 60, 'triangle', 0.15), 40);
  });
}

/** Print/complete chime — plays once the full strip has been captured. */
export function playPrintChime() {
  playFileOrFallback('/sounds/print-chime.mp3', () => {
    [660, 880, 1100].forEach((freq, i) => setTimeout(() => beep(freq, 180, 'sine', 0.16), i * 110));
  });
}
