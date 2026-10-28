import { createFileRoute, Link } from "@tanstack/react-router";
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
  return (
    <LobbyShell>
      <div className="flex min-h-[calc(100vh-100px)] flex-col items-center justify-center gap-10 px-4 pb-10">
        <h1 className="animate-pop text-center font-display text-6xl text-gold text-stroke sm:text-8xl">
          Ludo <span className="text-primary-foreground">King</span>
        </h1>
        <div className="flex flex-col gap-10 sm:flex-row sm:gap-14">
          <ModeCard to="/vs-computer" label="Computer" sub="Play vs Bot" color="mode-cyan" delay="0s" icon={<Monitor className="h-20 w-20" strokeWidth={2.2} />} />
          <ModeCard to="/pass-and-play" label="Pass N Play" sub="Local Multiplayer" color="mode-warm" delay="-1.6s" icon={<Users className="h-20 w-20" strokeWidth={2.2} />} />
        </div>
      </div>
    </LobbyShell>
  );
}

function ModeCard({ to, label, sub, color, delay, icon }: {
  to: "/vs-computer" | "/pass-and-play"; label: string; sub: string; color: string; delay: string; icon: React.ReactNode;
}) {
  return (
    <div className="animate-bob" style={{ animationDelay: delay }}>
      <Link to={to} onClick={playClick}
        className={`mode-card sheen ${color} relative flex h-60 w-56 flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl sm:h-72 sm:w-64`}>
        <div className="grid h-28 w-28 place-items-center rounded-full bg-primary-foreground/20 shadow-[0_0_40px_var(--cyan-glow)] drop-shadow-lg">
          {icon}
        </div>
        <div className="font-display text-3xl text-stroke">{label}</div>
        <div className="rounded-full bg-lobby-deep/40 px-3 py-0.5 text-sm font-extrabold">{sub}</div>
      </Link>
    </div>
  );
}
