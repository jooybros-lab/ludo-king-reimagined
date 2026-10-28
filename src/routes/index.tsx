import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Monitor, Users } from "lucide-react";
import { LobbyShell } from "@/components/lobby/LobbyShell";
import { playClick } from "@/lib/lobby-audio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ludo King – Play Online Lobby" },
      { name: "description", content: "Play Ludo against the computer or pass & play with friends on one device." },
      { property: "og:title", content: "Ludo King – Play Online Lobby" },
      { property: "og:description", content: "Play Ludo against the computer or pass & play with friends." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 2200); return () => clearTimeout(t); }, []);
  return (
    <LobbyShell>
      {!loaded ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-24">
          <div className="text-center">
            <div className="font-display text-2xl text-gold text-stroke">🎲 CERTIFIED DICE</div>
            <div className="mt-1 rounded border-2 border-ludo-blue bg-lobby-deep/70 px-3 py-1 font-display text-sm text-gold">RANDOM NUMBERS GUARANTEED</div>
          </div>
          <Logo />
          <p className="font-display text-2xl">The Official Ludo Game</p>
          <div className="h-5 w-56 overflow-hidden bg-muted-foreground/60">
            <div className="h-full bg-primary-foreground" style={{ animation: "load 2.1s ease-out forwards" }} />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-16">
          <div className="animate-pop"><Logo /></div>
          <div className="flex w-full flex-col items-center gap-8">
            <ModeCard to="/vs-computer" label="Computer" sub="Play vs Bot" color="mode-cyan" delay="0s" icon={<Monitor className="h-14 w-14" strokeWidth={2.2} />} />
            <ModeCard to="/pass-and-play" label="Pass N Play" sub="Local Multiplayer" color="mode-warm" delay="-1.6s" icon={<Users className="h-14 w-14" strokeWidth={2.2} />} />
          </div>
        </div>
      )}
    </LobbyShell>
  );
}

function Logo() {
  const letters = [["L", "bg-ludo-blue"], ["U", "bg-ludo-red"], ["D", "bg-ludo-green"], ["O", "bg-ludo-yellow"]];
  return (
    <div className="relative text-center">
      <div className="text-5xl">👑</div>
      <div className="flex gap-1.5">
        {letters.map(([l, c]) => (
          <span key={l} className={`grid h-16 w-16 place-items-center rounded-full border-4 border-primary-foreground ${c} font-display text-4xl text-stroke shadow-lg`}>{l}</span>
        ))}
      </div>
      <div className="absolute -right-2 top-6 font-display text-2xl text-gold text-stroke">KING</div>
    </div>
  );
}

function ModeCard({ to, label, sub, color, delay, icon }: {
  to: "/vs-computer" | "/pass-and-play"; label: string; sub: string; color: string; delay: string; icon: React.ReactNode;
}) {
  return (
    <div className="animate-bob" style={{ animationDelay: delay }}>
      <Link to={to} onClick={playClick}
        className={`mode-card sheen ${color} relative flex h-40 w-64 flex-col items-center justify-center gap-1 overflow-hidden rounded-3xl`}>
        <div className="grid h-20 w-20 place-items-center rounded-full bg-primary-foreground/20 shadow-[0_0_40px_var(--cyan-glow)] drop-shadow-lg">
          {icon}
        </div>
        <div className="font-display text-3xl text-stroke">{label}</div>
        <div className="rounded-full bg-lobby-deep/40 px-3 py-0.5 text-sm font-extrabold">{sub}</div>
      </Link>
    </div>
  );
}
