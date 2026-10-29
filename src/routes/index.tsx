import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Monitor, Users } from "lucide-react";
import { LobbyShell } from "@/components/lobby/LobbyShell";
import { playClick } from "@/lib/lobby-audio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "لودو کینگ – بازی آنلاین" },
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
            <div className="font-display text-2xl text-gold text-stroke">🎲 تاس تأیید‌شده</div>
            <div className="mt-1 rounded border-2 border-ludo-blue bg-lobby-deep/70 px-3 py-1 font-display text-sm text-gold">اعداد کاملاً تصادفی</div>
          </div>
          <Logo />
          <p className="font-display text-2xl">بازی رسمی لودو</p>
          <div className="h-5 w-56 overflow-hidden bg-muted-foreground/60">
            <div className="h-full bg-primary-foreground" style={{ animation: "load 2.1s ease-out forwards" }} />
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-evenly gap-[1.5dvh] px-6 pb-16">
          <div className="animate-pop origin-top scale-[min(1,calc(100dvh/760px))] pt-6"><Logo board /></div>
          <div className="flex w-full flex-col items-center gap-[2.5dvh]">
            <ModeCard to="/pass-and-play" label={["چند نفره", "روی یک گوشی"]} delay="0s" icon={
              <div className="flex items-center gap-1">
                <Phone /><span className="h-1 w-3 rounded bg-gold" /><span className="grid h-6 w-6 place-items-center rounded-full bg-ludo-green ring-2 ring-gold"><Users className="h-3.5 w-3.5 text-lobby-deep" /></span><span className="h-1 w-3 rounded bg-gold" /><Phone />
              </div>} />
            <ModeCard to="/vs-computer" label={["کامپیوتر"]} delay="-1.6s" icon={<Phone vs />} />
          </div>
          <button onClick={playClick} aria-label="Free coins" className="absolute bottom-3 left-3 flex flex-col items-center animate-bob">
            <span className="grid h-9 w-12 place-items-center rounded-xl border-2 border-gold bg-ludo-red shadow-[0_0_18px_var(--gold)]"><Monitor className="h-5 w-5" /></span>
            <span className="-mt-1 rounded-full bg-gold px-2 text-[10px] font-bold text-lobby-deep">سکه رایگان</span>
          </button>
        </div>
      )}
    </LobbyShell>
  );
}

function Logo({ board = false }: { board?: boolean }) {
  const letters = [["L", "text-ludo-blue"], ["U", "text-ludo-red"], ["D", "text-ludo-green"], ["O", "text-ludo-yellow"]];
  return (
    <div className="relative text-center">
      <div className="absolute -left-4 -top-7 -rotate-12 text-4xl drop-shadow-lg">👑</div>
      <div className="absolute -right-1 -top-5 font-display text-xl text-gold text-stroke">KING</div>
      <div className="flex gap-1">
        {letters.map(([l, c]) => (
          <span key={l} className={`grid h-11 w-11 place-items-center rounded-full border-[3px] border-gold bg-primary-foreground ${c} font-display text-3xl shadow-lg`}>{l}</span>
        ))}
      </div>
      {board && (
        <div className="relative mx-auto -mt-1 h-16 w-52">
          <div className="absolute inset-x-6 bottom-1 top-3 grid grid-cols-2 grid-rows-2 overflow-hidden rounded-md border-2 border-primary-foreground shadow-xl" style={{ transform: "perspective(200px) rotateX(35deg)" }}>
            <span className="bg-ludo-red" /><span className="bg-ludo-green" /><span className="bg-ludo-blue" /><span className="bg-ludo-yellow" />
          </div>
          <span className="absolute left-1/2 top-0 -translate-x-1/2 text-4xl drop-shadow-lg">🎲</span>
          <span className="absolute bottom-0 left-0 h-11 w-7 rounded-t-full bg-ludo-blue shadow-lg" />
          <span className="absolute bottom-0 right-0 h-14 w-9 rounded-t-full bg-ludo-yellow shadow-lg" />
          <span className="absolute -right-6 bottom-0 font-display text-sm text-gold">TM</span>
        </div>
      )}
    </div>
  );
}

function ModeCard({ to, label, delay, icon }: {
  to: "/vs-computer" | "/pass-and-play"; label: string[]; delay: string; icon: React.ReactNode;
}) {
  return (
    <div className="animate-bob" style={{ animationDelay: delay }}>
      <Link to={to} onClick={playClick}
        className="sheen relative flex h-[min(10rem,20dvh)] w-[min(12rem,25dvh)] flex-col overflow-hidden rounded-[1.75rem] border-4 border-gold bg-gold shadow-[0_0_24px_var(--gold)] transition-transform hover:scale-105 active:scale-95">
        <div className="m-2 mb-0 grid flex-1 place-items-center rounded-t-2xl border-b-4 border-lobby-deep bg-gradient-to-b from-ludo-blue to-lobby-royal">{icon}</div>
        <div className="grid h-[40%] place-items-center bg-gold px-1 font-display text-[min(1.3rem,2.7dvh)] leading-tight text-primary-foreground text-stroke">
          <div>{label.map((l) => <div key={l}>{l}</div>)}</div>
        </div>
      </Link>
    </div>
  );
}
