import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  COLORS, type Color, type State, type Difficulty, TRACK, HOME_COL, SAFE, START, FINISH,
  initialState, cellOf, canMove, applyMove, botChoose,
} from "@/lib/ludo";
import { sfx, toggleMusic } from "@/lib/game-sound";
import { Button } from "@/components/ui/button";
import { Pawn, PlayerPanel } from "./game-pieces";
import { Music2, VolumeX, RotateCcw, Home } from "lucide-react";
import "./ludo-game.css";

export type GameConfig = {
  active: Color[];
  humans: Color[];
  names: Partial<Record<Color, string>>;
  difficulty: Difficulty;
};

/** Picks which colors play: N players starting from `first`, 2 players sit opposite. */
export function activeColors(players: number, first: Color): Color[] {
  const start = COLORS.indexOf(first);
  const offsets = players === 2 ? [0, 2] : players === 3 ? [0, 1, 2] : [0, 1, 2, 3];
  const picked = offsets.map((o) => COLORS[(start + o) % 4]!);
  return COLORS.filter((c) => picked.includes(c));
}

export function LudoGame({ config }: { config: GameConfig }) {
  const { active, humans, difficulty } = config;
  const isHuman = (c: Color) => humans.includes(c);
  const nameOf = (c: Color) => config.names[c] ?? (isHuman(c) ? "شما" : `ربات ${({red:"قرمز",green:"سبز",yellow:"زرد",blue:"آبی"} as Record<Color,string>)[c]}`);

  const [state, setState] = useState<State>(initialState);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [winner, setWinner] = useState<Color | null>(null);
  const [music, setMusic] = useState(false);
  const [msg, setMsg] = useState("برای پرتاب، روی تاس بزنید!");
  const busy = useRef(false);
  const [tick, setTick] = useState(0);
  const [face, setFace] = useState(6);
  const sixes = useRef(0);
  const epoch = useRef(0);
  const later = (fn: () => void, ms: number) => { const e = epoch.current; setTimeout(() => { if (e === epoch.current) fn(); }, ms); };
  const color = active[turn % active.length]!;

  useEffect(() => () => { epoch.current++; toggleMusic(false); }, []);

  const nextTurn = (extra: boolean) => {
    setDice(null);
    busy.current = false;
    if (!extra) { sixes.current = 0; setTurn((t) => (t + 1) % active.length); }
    setTick((k) => k + 1);
  };

  const doMove = (s: State, c: Color, i: number, d: number) => {
    const r = applyMove(s, c, i, d);
    setState(r.state);
    if (r.captured) { sfx.capture(); setMsg(`${nameOf(c)} یک مهره را زد!`); }
    else if (r.finished) sfx.home();
    else sfx.move();
    if (r.state[c].every((p) => p === FINISH)) { setWinner(c); sfx.win(); return; }
    later(() => nextTurn(d === 6 || r.captured || r.finished), 450);
  };

  const roll = () => {
    if (busy.current || winner) return;
    busy.current = true;
    setRolling(true);
    sfx.roll();
    const spin = setInterval(() => setFace(1 + Math.floor(Math.random() * 6)), 70);
    later(() => {
      clearInterval(spin);
      const d = 1 + Math.floor(Math.random() * 6);
      setRolling(false);
      setDice(d);
      if (d === 6) sfx.six();
      const c = color;
      if (d === 6 && ++sixes.current === 3) {
        setMsg(`${nameOf(c)} سه بار ۶ آورد — نوبت سوخت`);
        later(() => nextTurn(false), 900);
        return;
      }
      const movable = state[c].map((p, i) => (canMove(p, d) ? i : -1)).filter((i) => i >= 0);
      if (movable.length === 0) {
        setMsg(`${nameOf(c)} ${d} آورد — حرکتی ممکن نیست`);
        later(() => nextTurn(false), 800);
        return;
      }
      setMsg(`${nameOf(c)} ${d} آورد`);
      if (!isHuman(c)) {
        later(() => doMove(state, c, botChoose(state, c, d, difficulty), d), 600);
      } else if (movable.length === 1) {
        const only = movable[0]!;
        later(() => doMove(state, c, only, d), 350);
      }
    }, 550);
  };

  useEffect(() => {
    if (winner) return;
    if (isHuman(color)) { setMsg(`${nameOf(color)} — روی تاس بزنید!`); return; }
    const t = setTimeout(roll, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, winner, tick]);

  const clickToken = (c: Color, i: number) => {
    if (c !== color || !isHuman(c) || dice == null || rolling) return;
    const p = state[c][i];
    if (p === undefined || !canMove(p, dice)) return;
    const d = dice;
    setDice(null);
    doMove(state, c, i, d);
  };

  const restart = () => {
    epoch.current++; sixes.current = 0; setRolling(false); setState(initialState());
    setTurn(0); setDice(null); setWinner(null); busy.current = false; setTick((k) => k + 1);
  };

  const cellClass = (r: number, c: number) => {
    const ti = TRACK.findIndex(([a, b]) => a === r && b === c);
    for (const col of COLORS) {
      if (HOME_COL[col].some(([a, b]) => a === r && b === c)) return `lg-bg-${col}`;
      if (ti === START[col]) return `lg-bg-${col}`;
    }
    return ti >= 0 ? "lg-bg-card" : "";
  };

  const tokens: { c: Color; i: number; r: number; col: number; offset: number }[] = [];
  const stack: Record<string, number> = {};
  for (const c of active) state[c].forEach((p, i) => {
    const [r, col] = cellOf(c, p, i);
    const k = `${r},${col}`;
    const offset = p >= 0 ? (stack[k] = (stack[k] ?? -1) + 1) : 0;
    tokens.push({ c, i, r, col, offset });
  });

  const panel = (c: Color) => active.includes(c) ? (
    <PlayerPanel key={c} color={c} name={nameOf(c)} active={color === c} human={isHuman(c)}
      dice={rolling ? face : dice} rolling={rolling}
      disabled={!isHuman(c) || color !== c || dice != null || rolling || !!winner}
      finished={state[c].filter((p) => p === FINISH).length} onRoll={roll} />
  ) : <div key={c} />;

  return (
    <main className="ludo-game game-layout text-foreground">
      <header className="game-header grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <h1 className="min-w-0 font-display text-2xl text-gold text-stroke">لودو کینگ</h1>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="secondary" size="icon" className="h-11 w-11" aria-label="بازگشت به منو" title="Back to menu">
            <Link to="/"><Home /></Link>
          </Button>
          <Button variant="secondary" size="icon" className="h-11 w-11" aria-label={music ? "Turn music off" : "Turn music on"} aria-pressed={music}
            onClick={() => { setMusic(!music); toggleMusic(!music); }}>
            {music ? <Music2 /> : <VolumeX />}
          </Button>
          <Button variant="secondary" size="icon" className="h-11 w-11" aria-label="New game" title="New game" onClick={restart}><RotateCcw /></Button>
        </div>
      </header>

      <div className="game-arena">
        <div className="player-row">{(["red", "green"] as Color[]).map(panel)}</div>
        <div className="game-board relative aspect-square bg-board shadow-board">
          <div className="board-grid relative grid h-full w-full grid-cols-[repeat(15,1fr)] grid-rows-[repeat(15,1fr)]">
            {Array.from({ length: 225 }).map((_, k) => {
              const r = Math.floor(k / 15), c = k % 15;
              const ti = TRACK.findIndex(([a, b]) => a === r && b === c);
              return (
                <div key={k} className={`board-cell relative ${cellClass(r, c)}`}>
                  {ti >= 0 && SAFE.has(ti) && (
                    <svg viewBox="0 0 24 24" className="safe-star" aria-hidden="true"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" /></svg>
                  )}
                </div>
              );
            })}
            {COLORS.map((c) => {
              const pos = { red: "top-0 left-0", green: "top-0 right-0", yellow: "bottom-0 right-0", blue: "bottom-0 left-0" }[c];
              return (
                <div key={c} className={`home-zone absolute ${pos} h-[40%] w-[40%] lg-bg-${c} ${active.includes(c) ? "" : "lg-inactive"}`}>
                  <div className="home-court lg-bg-card" />
                  {[0, 1, 2, 3].map((i) => <span key={i} className={`home-seat home-seat-${i} lg-text-${c}`} />)}
                </div>
              );
            })}
            <div className="center-tri absolute left-[40%] top-[40%] h-[20%] w-[20%]" />
            {tokens.map(({ c, i, r, col, offset }) => {
              const p = state[c][i];
              const can = c === color && isHuman(c) && dice != null && p !== undefined && canMove(p, dice);
              return (
                <Button variant="ghost" key={`${c}${i}`} onClick={() => clickToken(c, i)}
                  className={`token ${can ? "token-active" : ""}`}
                  style={{ top: `calc(${(r / 15) * 100}% + ${offset * 3}px)`, left: `calc(${(col / 15) * 100}% + ${offset * 3}px)` }}
                  aria-label={`${c} token ${i + 1}`}><Pawn color={c} id={`${c}-${i}`} /></Button>
              );
            })}
          </div>
        </div>
        <div className="player-row">{(["blue", "yellow"] as Color[]).map(panel)}</div>
      </div>

      <div dir="rtl" className="game-status flex items-center gap-3 bg-card p-3">
        <div className="min-w-0">
          <div className={`text-sm font-bold uppercase lg-text-${color}`}>نوبت {nameOf(color)}</div>
          <div className="break-words text-sm text-muted-foreground sm:text-base" aria-live="polite">{winner ? `${nameOf(winner)} برنده شد! 🎉` : msg}</div>
        </div>
      </div>

      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60">
          <div className="mx-4 max-w-full rounded-lg bg-card p-6 text-center shadow-board">
            <div className="font-display text-4xl text-primary">{isHuman(winner) && humans.length === 1 ? "شما بردید!" : `${nameOf(winner)} برنده شد`}</div>
            <div className="mt-6 flex justify-center gap-2">
              <Button onClick={restart} className="h-11 px-6 font-bold">بازی دوباره</Button>
              <Button asChild variant="secondary" className="h-11 px-6 font-bold"><Link to="/">منو</Link></Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
