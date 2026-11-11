type Sfx = 'click' | 'correct' | 'wrong' | 'coin' | 'star';

let ctx: AudioContext | null = null;
let enabledSound = true;
let enabledMusic = true;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  return ctx;
}

export function configure(sound: boolean, music: boolean): void {
  enabledSound = sound;
  enabledMusic = music;
}

const TONES: Record<Sfx, [number, number, OscillatorType]> = {
  click: [520, 0.05, 'sine'],
  correct: [660, 0.14, 'sine'],
  wrong: [200, 0.2, 'sawtooth'],
  coin: [880, 0.08, 'triangle'],
  star: [990, 0.12, 'sine']
};

export function play(sfx: Sfx): void {
  if (!enabledSound) return;
  const context = getCtx();
  if (!context) return;
  const [frequency, duration, type] = TONES[sfx];
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.1, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
}

let musicTimer: number | null = null;
let musicStep = 0;
const NOTES = [261.6, 329.6, 392, 329.6];

export function startMusic(): void {
  if (!enabledMusic || musicTimer !== null) return;
  musicTimer = window.setInterval(() => {
    if (!enabledMusic) return;
    const context = getCtx();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.value = NOTES[musicStep % NOTES.length] ?? 261.6;
    gain.gain.setValueAtTime(0.02, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.85);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.85);
    musicStep += 1;
  }, 1000);
}

export function stopMusic(): void {
  if (musicTimer !== null) window.clearInterval(musicTimer);
  musicTimer = null;
}
