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

      {/* Header laid out like the original: avatar+name bar left, coins + MORE COINS right, settings under avatar */}
      <header className="relative z-10 px-2 pt-2">
        <div className="flex items-start gap-2">
          <button onClick={() => { playClick(); setOpenProfile(true); }} aria-label="Edit profile"
            className="relative h-16 w-16 shrink-0 rounded-lg border-[3px] border-gold bg-gradient-to-br from-muted-foreground/60 to-lobby-deep shadow-lg">
            <span className="absolute inset-0 grid place-items-center font-display text-3xl text-stroke">{name[0]?.toUpperCase()}</span>
            <span className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5 rounded-full bg-ludo-red" />
            <span className="absolute -bottom-3 -left-2 grid h-7 w-7 place-items-center font-display text-sm text-lobby-deep" style={{ clipPath: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)", background: "var(--gold)" }}>1</span>
          </button>
          <div className="flex flex-1 items-center justify-between rounded-br-3xl border-b-[3px] border-r-[3px] border-gold px-2 py-1">
            <span className="font-display text-xl text-stroke">{name}</span>
            <span className="flex items-center gap-1.5 font-display text-xl">
              <span className="grid h-6 w-6 place-items-center rounded-full border-2 border-gold-deep bg-gold text-xs text-gold-deep">$</span>
              {coins.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-row gap-2 pl-1">
            {showHome && (
              <Link to="/" onClick={playClick} aria-label="Home" className="grid h-11 w-12 place-items-center rounded-xl border-[3px] border-gold bg-lobby-deep text-gold"><Home className="h-6 w-6" /></Link>
            )}
            <button onClick={() => { playClick(); setOpenSettings(true); }} aria-label="Settings" className="grid h-11 w-12 place-items-center rounded-xl border-[3px] border-gold bg-lobby-deep text-gold shadow-[0_0_12px_var(--gold)]"><Settings className="h-7 w-7" /></button>
            <button onClick={() => { updateSettings({ muted: !s.muted }); startMusic(); playClick(); }} aria-label="Toggle sound" className="grid h-11 w-12 place-items-center rounded-xl border-[3px] border-gold bg-lobby-deep text-gold">{s.muted ? <VolumeX /> : <Volume2 />}</button>
          </div>
          <button onClick={addBonus} className="rounded-2xl border-[3px] border-gold bg-lobby-deep whitespace-nowrap px-2.5 py-1.5 font-display text-base text-gold shadow-[0_0_12px_var(--gold)] active:scale-95">
            <Plus className="mr-1 inline h-4 w-4" />MORE COINS
          </button>
        </div>
      </header>

      <main className="relative z-10 mt-2 flex min-h-0 flex-1 flex-col">{children}</main>

      <button onClick={toggleFs} aria-label="Full screen" className="absolute bottom-3 right-3 z-20 grid h-12 w-12 place-items-center rounded-xl border-[3px] border-gold bg-lobby-deep text-gold">{fs ? <Minimize /> : <Maximize />}</button>
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
