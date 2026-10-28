// Synthesized lobby music (marimba + light percussion) and SFX via Web Audio.
type Settings = { music: number; sfx: number; muted: boolean; haptics: boolean };
const KEY = "ludo-settings";
const defaults: Settings = { music: 0.5, sfx: 0.8, muted: false, haptics: true };

let ctx: AudioContext | null = null;
let musicGain: GainNode | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let step = 0;
let settings: Settings = defaults;
const listeners = new Set<(s: Settings) => void>();

export function loadSettings(): Settings {
  if (typeof window === "undefined") return defaults;
  try { settings = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { settings = defaults; }
  return settings;
}
export function getSettings() { return settings; }
export function subscribe(fn: (s: Settings) => void) { listeners.add(fn); return () => { listeners.delete(fn); }; }
export function updateSettings(p: Partial<Settings>) {
  settings = { ...settings, ...p };
  localStorage.setItem(KEY, JSON.stringify(settings));
  if (musicGain && ctx) musicGain.gain.setTargetAtTime(settings.muted ? 0 : settings.music * 0.35, ctx.currentTime, 0.2);
  listeners.forEach((l) => l(settings));
}

function ensure() {
  if (!ctx) {
    ctx = new AudioContext();
    musicGain = ctx.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function marimba(freq: number, t: number, vol: number, dest: AudioNode) {
  const c = ctx!;
  const o = c.createOscillator(), o2 = c.createOscillator(), g = c.createGain();
  o.type = "sine"; o.frequency.value = freq;
  o2.type = "sine"; o2.frequency.value = freq * 4;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  o.connect(g); o2.connect(g); g.connect(dest);
  o.start(t); o2.start(t); o.stop(t + 0.55); o2.stop(t + 0.55);
}
function tick(t: number, vol: number, dest: AudioNode) {
  const c = ctx!;
  const buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
  f.type = "highpass"; f.frequency.value = 6000; g.gain.value = vol;
  s.buffer = buf; s.connect(f); f.connect(g); g.connect(dest); s.start(t);
}

// C major pentatonic pattern, 16 steps
const N = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
const melody = [0, 2, 4, 2, 3, 2, 0, -1, 1, 3, 5, 3, 4, 2, 1, -1];
const bass = [130.81, 130.81, 174.61, 196];

export function startMusic() {
  const c = ensure();
  updateSettings({});
  if (timer) return;
  const spb = 0.18;
  let next = c.currentTime + 0.05;
  timer = setInterval(() => {
    while (next < c.currentTime + 0.3) {
      const m = melody[step % 16] ?? -1;
      if (m >= 0) marimba(N[m] ?? 523.25, next, 0.25, musicGain!);
      if (step % 4 === 0) marimba(bass[Math.floor(step / 16) % 4] ?? 130.81, next, 0.4, musicGain!);
      if (step % 2 === 1) tick(next, 0.08, musicGain!);
      step++; next += spb;
    }
  }, 60);
}
export function stopMusic() {
  if (timer) clearInterval(timer);
  timer = null;
  if (musicGain && ctx) musicGain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
}

export function playClick() {
  const c = ensure();
  if (settings.muted) return;
  const t = c.currentTime;
  const o = c.createOscillator(), g = c.createGain();
  o.type = "square";
  o.frequency.setValueAtTime(880, t);
  o.frequency.exponentialRampToValueAtTime(440, t + 0.08);
  g.gain.setValueAtTime(settings.sfx * 0.2, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + 0.13);
  if (settings.haptics && navigator.vibrate) navigator.vibrate(15);
}
