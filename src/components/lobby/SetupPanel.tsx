import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { playClick } from "@/lib/lobby-audio";

const COLORS = [
  { id: "red", cls: "bg-ludo-red" }, { id: "green", cls: "bg-ludo-green" },
  { id: "yellow", cls: "bg-ludo-yellow" }, { id: "blue", cls: "bg-ludo-blue" },
] as const;

function Choice({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={() => { playClick(); onClick(); }}
      className={`rounded-xl px-5 py-2 font-display text-xl transition ${active ? "icon-btn text-lobby-deep" : "pill"}`}>{children}</button>
  );
}

export function SetupPanel({ mode }: { mode: "computer" | "local" }) {
  const [players, setPlayers] = useState(mode === "computer" ? 2 : 2);
  const [color, setColor] = useState<string>("red");
  const [diff, setDiff] = useState("Normal");
  const navigate = useNavigate();
  const [names, setNames] = useState(["Player 1", "Player 2", "Player 3", "Player 4"]);

  return (
    <div className="flex flex-1 items-center overflow-y-auto px-3 pb-6">
      <div className="animate-pop w-full rounded-3xl border-4 border-gold bg-lobby-deep/80 p-6 shadow-2xl backdrop-blur">
        <h1 className="mb-6 text-center font-display text-4xl text-gold text-stroke">
          {mode === "computer" ? "Play vs Computer" : "Pass N Play"}
        </h1>
        <section className="mb-5">
          <h2 className="mb-2 font-extrabold">Players</h2>
          <div className="flex gap-2">{[2, 3, 4].map((n) => <Choice key={n} active={players === n} onClick={() => setPlayers(n)}>{n}</Choice>)}</div>
        </section>
        {mode === "computer" ? (
          <>
            <section className="mb-5">
              <h2 className="mb-2 font-extrabold">Your color</h2>
              <div className="flex gap-3">{COLORS.map((c) => (
                <button key={c.id} aria-label={c.id} onClick={() => { playClick(); setColor(c.id); }}
                  className={`h-12 w-12 rounded-full border-4 ${c.cls} ${color === c.id ? "scale-110 border-gold" : "border-transparent opacity-70"} transition`} />
              ))}</div>
            </section>
            <section className="mb-6">
              <h2 className="mb-2 font-extrabold">Difficulty</h2>
              <div className="flex gap-2">{["Easy", "Normal", "Hard"].map((d) => <Choice key={d} active={diff === d} onClick={() => setDiff(d)}>{d}</Choice>)}</div>
            </section>
          </>
        ) : (
          <section className="mb-6 space-y-2">
            <h2 className="mb-2 font-extrabold">Names & colors</h2>
            {COLORS.slice(0, players).map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className={`h-9 w-9 shrink-0 rounded-full border-2 border-gold ${c.cls}`} />
                <Input value={names[i]} maxLength={14} className="text-foreground bg-background"
                  onChange={(e) => setNames(names.map((n, j) => (j === i ? e.target.value : n)))} />
              </div>
            ))}
          </section>
        )}
        <button onClick={() => { playClick(); navigate({ to: "/play", search: { mode, players, color: color as "red", diff: diff.toLowerCase() as "normal", names: names.slice(0, players) } }); }}
          className="mode-card mode-warm sheen relative w-full overflow-hidden rounded-2xl py-3 font-display text-3xl text-stroke">Play</button>
      </div>
    </div>
  );
}
