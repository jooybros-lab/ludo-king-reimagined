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
      className={`rounded-xl px-4 py-1.5 font-display text-lg transition ${active ? "icon-btn text-lobby-deep" : "pill"}`}>{children}</button>
  );
}

export function SetupPanel({ mode }: { mode: "computer" | "local" }) {
  const [players, setPlayers] = useState(mode === "computer" ? 2 : 2);
  const [color, setColor] = useState<string>("red");
  const [diff, setDiff] = useState("normal");
  const navigate = useNavigate();
  const [names, setNames] = useState(["بازیکن ۱", "بازیکن ۲", "بازیکن ۳", "بازیکن ۴"]);

  return (
    <div className="flex flex-1 items-center overflow-y-auto px-3 pb-6">
      <div dir="rtl" className="animate-pop w-full rounded-3xl border-4 border-gold bg-lobby-deep/80 p-4 shadow-2xl backdrop-blur">
        <h1 className="mb-4 text-center font-display text-3xl text-gold text-stroke">
          {mode === "computer" ? "بازی با کامپیوتر" : "بازی دونفره"}
        </h1>
        <section className="mb-5">
          <h2 className="mb-2 font-extrabold">تعداد بازیکنان</h2>
          <div className="flex gap-2">{[2, 3, 4].map((n) => <Choice key={n} active={players === n} onClick={() => setPlayers(n)}>{n}</Choice>)}</div>
        </section>
        {mode === "computer" ? (
          <>
            <section className="mb-5">
              <h2 className="mb-2 font-extrabold">رنگ شما</h2>
              <div className="flex gap-3">{COLORS.map((c) => (
                <button key={c.id} aria-label={c.id} onClick={() => { playClick(); setColor(c.id); }}
                  className={`h-10 w-10 rounded-full border-4 ${c.cls} ${color === c.id ? "scale-110 border-gold" : "border-transparent opacity-70"} transition`} />
              ))}</div>
            </section>
            <section className="mb-6">
              <h2 className="mb-2 font-extrabold">سطح سختی</h2>
              <div className="flex gap-2">{([["easy","آسان"],["normal","معمولی"],["hard","سخت"]] as const).map(([d,l]) => <Choice key={d} active={diff === d} onClick={() => setDiff(d)}>{l}</Choice>)}</div>
            </section>
          </>
        ) : (
          <section className="mb-6 space-y-2">
            <h2 className="mb-2 font-extrabold">نام‌ها و رنگ‌ها</h2>
            {COLORS.slice(0, players).map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className={`h-9 w-9 shrink-0 rounded-full border-2 border-gold ${c.cls}`} />
                <Input value={names[i]} maxLength={14} className="text-foreground bg-background"
                  onChange={(e) => setNames(names.map((n, j) => (j === i ? e.target.value : n)))} />
              </div>
            ))}
          </section>
        )}
        <button onClick={() => { playClick(); navigate({ to: "/play", search: { mode, players, color: color as "red", diff: diff as "normal", names: names.slice(0, players) } }); }}
          className="mode-card mode-warm sheen relative w-full overflow-hidden rounded-2xl py-2 font-display text-2xl text-stroke">شروع بازی</button>
      </div>
    </div>
  );
}
