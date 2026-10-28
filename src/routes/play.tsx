import { createFileRoute } from "@tanstack/react-router";
import { LobbyShell } from "@/components/lobby/LobbyShell";
import { LudoGame, activeColors, type GameConfig } from "@/components/game/LudoGame";
import { COLORS, type Color, type Difficulty } from "@/lib/ludo";

type Search = { mode: "computer" | "local"; players: number; color: Color; diff: Difficulty; names: string[] };

export const Route = createFileRoute("/play")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const players = [2, 3, 4].includes(Number(s["players"])) ? Number(s["players"]) : 4;
    const color = COLORS.includes(s["color"] as Color) ? (s["color"] as Color) : "red";
    const diff = ["easy", "normal", "hard"].includes(String(s["diff"])) ? (s["diff"] as Difficulty) : "normal";
    const names = Array.isArray(s["names"]) ? s["names"].map((n) => String(n).slice(0, 14)) : [];
    return { mode: s["mode"] === "local" ? "local" : "computer", players, color, diff, names };
  },
  head: () => ({
    meta: [
      { title: "Playing Ludo – Ludo King" },
      { name: "description", content: "Roll the dice and race your tokens home in a game of Ludo." },
      { property: "og:title", content: "Playing Ludo – Ludo King" },
      { property: "og:description", content: "Roll the dice and race your tokens home in a game of Ludo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlayPage,
});

function PlayPage() {
  const s = Route.useSearch();
  let config: GameConfig;
  if (s.mode === "local") {
    const active = COLORS.slice(0, s.players);
    config = {
      active, humans: active, difficulty: s.diff,
      names: Object.fromEntries(active.map((c, i) => [c, s.names[i]?.trim() || `Player ${i + 1}`])),
    };
  } else {
    config = { active: activeColors(s.players, s.color), humans: [s.color], difficulty: s.diff, names: { [s.color]: "You" } };
  }
  return (
    <LobbyShell>
      <div className="flex-1 overflow-y-auto">
        <LudoGame key={JSON.stringify(s)} config={config} />
      </div>
    </LobbyShell>
  );
}
