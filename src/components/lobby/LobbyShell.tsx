import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Maximize, Minimize, Volume2, VolumeX, Settings, Plus, Pencil, Home } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import pattern from "@/assets/ludo-pattern.jpg";
import { loadSettings, getSettings, subscribe, updateSettings, startMusic, playClick } from "@/lib/lobby-audio";

function useLobbySettings() {
  const [s, setS] = useState(getSettings());
  useEffect(() => { setS(loadSettings()); return subscribe(setS); }, []);
  return s;
}

function Sparkles() {
  const dots = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    left: (i * 37) % 100, delay: (i * 0.73) % 12, dur: 10 + ((i * 3) % 9), size: 2 + (i % 4),
  })), []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span key={i} className="absolute bottom-0 rounded-full bg-gold"
          style={{ left: `${d.left}%`, width: d.size, height: d.size, animation: `sparkle ${d.dur}s linear ${d.delay}s infinite`, boxShadow: "0 0 8px var(--gold)" }} />
      ))}
    </div>
  );
}

export function LobbyShell({ children, showHome = false }: { children: ReactNode; showHome?: boolean }) {
  const s = useLobbySettings();
  const [fs, setFs] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [name, setName] = useState("Guest");
  const [coins, setCoins] = useState(2500);

  useEffect(() => {
    setName(localStorage.getItem("ludo-name") || "Guest");
    setCoins(Number(localStorage.getItem("ludo-coins") || 2500));
    const onFs = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    // Browsers require a gesture before audio can play.
    const kick = () => { startMusic(); window.removeEventListener("pointerdown", kick); };
    window.addEventListener("pointerdown", kick);
    return () => { document.removeEventListener("fullscreenchange", onFs); window.removeEventListener("pointerdown", kick); };
  }, []);

  const toggleFs = () => {
    playClick();
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };
  const addBonus = () => {
    playClick();
    const n = coins + 100; setCoins(n); localStorage.setItem("ludo-coins", String(n));
  };

  return (
    <div className="lobby-bg relative h-screen overflow-hidden text-primary-foreground">
      {/* Dimmed, blurred board pattern behind the phone-shaped game column (as on the original site) */}
      <div className="absolute inset-0 scale-110 bg-repeat opacity-40 blur-[3px]" style={{ backgroundImage: `url(${pattern})`, backgroundSize: "420px" }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--lobby-deep)_95%)] opacity-90" />
      <div className="game-frame relative mx-auto flex h-screen w-full max-w-[min(100vw,56.25vh)] flex-col overflow-hidden">
      <div className="absolute inset-0 bg-repeat" style={{ backgroundImage: `url(${pattern})`, backgroundSize: "260px" }} />
      <div className="absolute inset-0 bg-lobby-royal/60" />
      <div className="lobby-rays absolute left-1/2 top-1/2 h-[220vmax] w-[220vmax] -translate-x-1/2 -translate-y-1/2" />
      <Sparkles />

      <header className="relative z-10 flex items-start justify-between gap-2 p-3">
        <div className="flex flex-wrap items-center gap-2">
          {showHome && (
            <Link to="/" onClick={playClick} aria-label="Home" className="icon-btn grid h-11 w-11 place-items-center rounded-xl text-lobby-deep"><Home className="h-6 w-6" /></Link>
          )}
          <button onClick={() => { playClick(); setOpenProfile(true); }} className="pill flex items-center gap-3 rounded-2xl py-1.5 pl-1.5 pr-4" aria-label="Edit profile">
            <div className="relative h-12 w-12 rounded-xl border-2 border-gold bg-gradient-to-br from-ludo-yellow to-ludo-red">
              <span className="absolute inset-0 grid place-items-center font-display text-2xl text-stroke">{name[0]?.toUpperCase()}</span>
              <span className="absolute -bottom-2 -right-2 grid h-6 w-6 place-items-center rounded-full border-2 border-gold bg-lobby-royal font-display text-xs">1</span>
            </div>
            <div className="text-left">
              <div className="font-display text-lg leading-none">{name}</div>
              <div className="mt-1 flex items-center gap-1 text-xs font-bold text-gold"><Pencil className="h-3 w-3" /> Level 1</div>
            </div>
          </button>
          <div className="pill flex items-center gap-2 rounded-full py-1 pl-1 pr-1">
            <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-gold-deep bg-gold font-display text-gold-deep">$</span>
            <span className="min-w-14 font-display text-lg">{coins.toLocaleString()}</span>
            <button onClick={addBonus} aria-label="Bonus coins" className="grid h-7 w-7 place-items-center rounded-full bg-bonus"><Plus className="h-4 w-4" /></button>
          </div>
          <div className="pill flex items-center gap-2 rounded-full py-1 pl-1 pr-4">
            <span className="h-7 w-7 rotate-45 rounded-sm border-2 border-gold bg-gem" />
            <span className="font-display text-lg">25</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={toggleFs} aria-label="Full screen" className="icon-btn grid h-11 w-11 place-items-center rounded-xl text-lobby-deep">{fs ? <Minimize /> : <Maximize />}</button>
          <button onClick={() => { updateSettings({ muted: !s.muted }); startMusic(); playClick(); }} aria-label="Toggle sound" className="icon-btn grid h-11 w-11 place-items-center rounded-xl text-lobby-deep">{s.muted ? <VolumeX /> : <Volume2 />}</button>
          <button onClick={() => { playClick(); setOpenSettings(true); }} aria-label="Settings" className="icon-btn grid h-11 w-11 place-items-center rounded-xl text-lobby-deep"><Settings /></button>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">{children}</main>
      </div>

      <Dialog open={openSettings} onOpenChange={setOpenSettings}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-2xl">Settings</DialogTitle><DialogDescription>Sound, music and how to play.</DialogDescription></DialogHeader>
          <div className="space-y-5">
            <label className="block space-y-2"><span className="font-bold">Lobby music</span>
              <Slider value={[s.music * 100]} onValueChange={([v]) => updateSettings({ music: (v ?? 0) / 100 })} /></label>
            <label className="block space-y-2"><span className="font-bold">Sound effects</span>
              <Slider value={[s.sfx * 100]} onValueChange={([v]) => updateSettings({ sfx: (v ?? 0) / 100 })} /></label>
            <div className="flex items-center justify-between"><span className="font-bold">Mute all</span><Switch checked={s.muted} onCheckedChange={(v) => updateSettings({ muted: v })} /></div>
            <div className="flex items-center justify-between"><span className="font-bold">Vibration</span><Switch checked={s.haptics} onCheckedChange={(v) => updateSettings({ haptics: v })} /></div>
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <b className="text-foreground">Rules:</b> Roll a 6 to bring a token out. Move clockwise by the dice value. Landing on an opponent sends it home. Safe squares are marked with a star. First to bring all 4 tokens home wins.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openProfile} onOpenChange={setOpenProfile}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-2xl">Your profile</DialogTitle><DialogDescription>Choose the name other players see.</DialogDescription></DialogHeader>
          <Input value={name} maxLength={16} onChange={(e) => { setName(e.target.value); localStorage.setItem("ludo-name", e.target.value || "Guest"); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
