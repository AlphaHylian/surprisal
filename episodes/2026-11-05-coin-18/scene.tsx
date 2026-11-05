// "Why an 18-cent coin would beat the dime": Shallit's 18-cent piece.
// claim hook (dime -> 18, 4.7 -> 3.89) -> rule out rounder/bigger -> score: every amount 0-99, fewest coins
// -> US: 99 = 9 coins, grid average 4.7 -> swap: 36 = 25+10+1 -> 18+18 -> re-hook: biggest-first 25+5+5+1
// -> fails on 37 of 100 -> payoff: grid recolours, 3.89, -17% -> CTA: 72 cents?
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- coin maths (same as verify.py)
const fewest = (coins: number[]) => {
  const best = [0], how: number[][] = [[]];
  for (let v = 1; v < 100; v++) {
    let b = 1e9, h: number[] = [];
    for (const c of coins) if (c <= v && best[v - c] + 1 < b) { b = best[v - c] + 1; h = [...how[v - c], c]; }
    best.push(b); how.push(h);
  }
  return best;
};
const greedy = (coins: number[], v: number) => {
  let n = 0;
  for (const c of [...coins].sort((a, b) => b - a)) { n += Math.floor(v / c); v %= c; }
  return n;
};
const US = fewest([1, 5, 10, 25]);
const NEW = fewest([1, 5, 18, 25]);
const FAILS = new Set(Array.from({ length: 100 }, (_, v) => v).filter((v) => greedy([1, 5, 18, 25], v) !== NEW[v]));

// ---------------------------------------------------------------- pieces
const COIN: Record<number, { d: number; bg: string; ink: string }> = {
  1: { d: 120, bg: "#b8734a", ink: "#2b160b" },
  5: { d: 140, bg: "#b9c0c8", ink: "#1f2630" },
  10: { d: 112, bg: "#d3d8de", ink: "#1f2630" },
  25: { d: 160, bg: "#c6ccd3", ink: "#1f2630" },
  18: { d: 150, bg: C.amber, ink: C.bg },
};
const Coin: React.FC<{ v: number; scale?: number; dim?: boolean; glow?: boolean }> = ({ v, scale = 1, dim, glow }) => {
  const c = COIN[v];
  const d = c.d * scale;
  return (
    <div style={{ width: d, height: d, borderRadius: d, background: c.bg, opacity: dim ? 0.35 : 1, display: "flex", alignItems: "center",
      justifyContent: "center", border: `${6 * scale}px solid #00000033`, boxShadow: glow ? `0 0 40px ${C.amber}` : "0 6px 14px #0008",
      fontFamily: F.bold, fontSize: Math.max(40, 52 * scale), color: c.ink }}>
      {v}¢
    </div>
  );
};
// a row of coins centred on (540, y), each appearing at times[i]
const CoinRow: React.FC<{ vals: number[]; y: number; times: number[]; scale?: number; out?: number; gap?: number }> = ({ vals, y, times, scale = 1, out, gap = 14 }) => {
  const ws = vals.map((v) => COIN[v].d * scale);
  const total = ws.reduce((a, b) => a + b, 0) + gap * (vals.length - 1);
  let x = 540 - total / 2;
  return (
    <>
      {vals.map((v, i) => {
        const cx = x + ws[i] / 2;
        x += ws[i] + gap;
        return <At key={i} x={cx} y={y}><Appear at={times[i]} out={out} from="drop" sfx={null}><Coin v={v} scale={scale} /></Appear></At>;
      })}
    </>
  );
};

// 10x10 grid of amounts 0..99 with the fewest-coin count in each cell
const CELL = 68, GX = 540 - 5 * CELL, GY = 470;
const SHADE = ["#1d2b42", "#22405a", "#2b5a6a", "#3a7a78", "#5a9a7a", "#c9a14f", "#e08a4f", "#e06a5a", "#d0505a", "#b04060"];
const Grid: React.FC<{ counts: number[]; reveal?: number; revealDur?: number; mark?: Set<number>; markAt?: number; hi?: number }> = ({ counts, reveal = -1, revealDur = 1.5, mark, markAt = 1e9, hi = -1 }) => {
  const t = useT();
  return (
    <>
      {counts.map((n, v) => {
        const shown = t >= reveal + (v / 100) * revealDur;
        const marked = mark && mark.has(v) && t >= markAt + (v / 100) * 0.8;
        return (
          <div key={v} style={{ position: "absolute", left: GX + (v % 10) * CELL, top: GY + Math.floor(v / 10) * CELL, width: CELL - 6, height: CELL - 6,
            borderRadius: 10, background: marked ? C.coral : shown ? SHADE[n] : C.dim, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: F.bold, fontSize: 40, color: marked ? C.bg : C.ink, opacity: shown ? 1 : 0.4,
            outline: v === hi ? `6px solid ${C.amber}` : "none", transition: "none" }}>
            {shown ? n : ""}
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t18 = at.word("18", 1, 1.0);
  const tLess = at.word("less", 1, 2.2);
  const flip = tween(t, t18 - 0.3, t18 + 0.1, 0, 1);
  return (
    <>
      <HookText>{"Swap the dime for **18¢**.\nCarry less change."}</HookText>
      <Riser to={tLess} volume={0.45} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.08 }]]}>
        <At x={300} y={720}>
          <div style={{ transform: `scaleX(${Math.abs(1 - 2 * flip)})` }}>{flip < 0.5 ? <Coin v={10} scale={1.6} /> : <Coin v={18} scale={1.2} glow />}</div>
        </At>
        <At x={760} y={640}><Text size={64} color={C.muted}>4.7 coins</Text></At>
        <At x={760} y={740}><Text size={60} color={C.muted}>↓</Text></At>
        <At x={760} y={840}><Punch at={tLess}><Text size={84} color={C.amber}>3.89</Text></Punch></At>
      </Camera>
      <At x={540} y={1080}><Appear at={tLess - 0.1} from="slam"><Chip color={C.amber} size={52}>on average, every time you get change</Chip></Appear></At>
      <Sfx name="pack/cash-ting" at={t18} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleBody: React.FC = () => {
  const at = useAt();
  const tRound = at.word("rounder", 1, 0.4);
  const tBig = at.word("bigger", 1, 1.4);
  const tGaps = at.word("gaps", 1, 2.8);
  return (
    <>
      <Headline>Why 18?</Headline>
      <At x={290} y={560}><Appear at={tRound - 0.2} from="pop"><Stamp size={64} color={C.coral} rotate={-8}>ROUNDER?</Stamp></Appear></At>
      <At x={790} y={560}><Appear at={tBig - 0.2} from="pop"><Stamp size={64} color={C.coral} rotate={6}>BIGGER?</Stamp></Appear></At>
      <At x={540} y={820}><Appear at={tGaps - 0.6} from="up"><Coin v={18} scale={1.3} glow /></Appear></At>
      <At x={540} y={1060}><Appear at={tGaps - 0.2} from="up"><Text size={60} color={C.amber}>it fills the gaps</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- count + US
const CountBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tUs = at.beat("us");
  const tEvery = at.word("every", 1, 1.4);
  const tFewest = at.word("fewest", 1, 4.0);
  const t99 = at.word("99", 2, tUs + 2.4);
  const t9 = at.word("9", 1, tUs + 3.2);
  const tAll = at.word("100", 1, tUs + 4.6);
  const t47 = at.word("4.7", 1, tUs + 6.0);
  const showRow = t >= t99 - 0.3 && t < tAll - 0.2;
  return (
    <>
      <Headline out={tUs - 0.3}>Score a set of coins</Headline>
      <Headline at={tUs} out={tAll - 0.3}>Today's coins</Headline>
      <Headline at={tAll} color={C.amber}>Average: 4.7 coins</Headline>
      {!showRow && (
        <Camera keys={[[0, { zoom: 1 }], [tFewest, { zoom: 1 }], [tFewest + 0.8, { zoom: 1.05 }], [tUs, { zoom: 1 }]]}>
          <At x={540} y={385}><Appear at={tEvery - 0.2} from="fade" sfx={null}><Text size={44} color={C.muted}>0¢ to 99¢: fewest coins for each</Text></Appear></At>
          <Grid counts={US} reveal={tFewest - 0.3} revealDur={2.2} hi={t >= tAll ? 99 : -1} />
        </Camera>
      )}
      {showRow && (
        <>
          <At x={540} y={420}><Text size={56} color={C.muted}>1¢ · 5¢ · 10¢ · 25¢</Text></At>
          <At x={540} y={560}><Text size={90}>99¢</Text></At>
          <CoinRow vals={[25, 25, 25]} y={760} times={[t99, t99 + 0.15, t99 + 0.3]} scale={1} />
          <CoinRow vals={[10, 10, 1, 1, 1, 1]} y={940} times={[t99 + 0.45, t99 + 0.6, t99 + 0.75, t99 + 0.85, t99 + 0.95, t99 + 1.05]} scale={0.9} />
          <At x={540} y={1110}><Appear at={t9 - 0.1} from="slam"><Chip color={C.coral} size={60}>9 coins</Chip></Appear></At>
          <Sfx name="pack/cash-register" at={t99 + 0.2} volume={0.35} />
        </>
      )}
      {t >= tAll - 0.2 && (
        <At x={540} y={1150}><Appear at={t47 - 0.2} from="pop"><Text size={48} color={C.amber}>470 coins ÷ 100 amounts</Text></Appear></At>
      )}
    </>
  );
};

// ---------------------------------------------------------------- swap + rehook (36 cents three ways)
const SwapBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRe = at.beat("rehook");
  const tNow = at.word("Now", 1, 0.2);
  const t36 = at.word("36", 1, 2.0);
  const tTwo = at.word("two", 1, 4.6);
  const tCatch = at.word("catch", 1, tRe + 0.8);
  const tQuarter = at.word("quarter", 2, tRe + 3.6);
  const tNickels = at.word("nickels", 1, tRe + 4.4);
  const tPenny = at.word("penny", 2, tRe + 5.2);
  const flip = tween(t, tNow, tNow + 0.5, 0, 1);
  return (
    <>
      <Headline out={tRe - 0.3}>Dime out, 18 in</Headline>
      <Headline at={tRe} color={C.coral}>Biggest coin first?</Headline>
      {/* the swapping coin, top */}
      <At x={540} y={420}>
        <div style={{ transform: `scaleX(${Math.abs(1 - 2 * flip)})` }}>{flip < 0.5 ? <Coin v={10} scale={0.9} /> : <Coin v={18} scale={0.8} glow />}</div>
      </At>
      <At x={540} y={560}><Appear at={t36 - 0.3} from="up"><Text size={80}>36¢</Text></Appear></At>
      {/* old way */}
      <At x={150} y={720}><Appear at={t36} from="fade" sfx={null}><Text size={40} color={C.muted}>was</Text></Appear></At>
      <CoinRow vals={[25, 10, 1]} y={720} times={[t36 + 0.3, t36 + 0.6, t36 + 0.9]} scale={0.75} />
      {/* new way */}
      <At x={150} y={880}><Appear at={tTwo - 0.2} from="fade" sfx={null}><Text size={40} color={C.mint}>now</Text></Appear></At>
      <CoinRow vals={[18, 18]} y={880} times={[tTwo - 0.1, tTwo + 0.15]} scale={0.75} />
      <At x={860} y={880}><Appear at={tTwo + 0.4} from="pop"><Text size={48} color={C.mint}>2</Text></Appear></At>
      {/* greedy */}
      <At x={150} y={1050}><Appear at={tCatch} from="fade" sfx={null}><Text size={40} color={C.coral}>biggest first</Text></Appear></At>
      <CoinRow vals={[25, 5, 5, 1]} y={1050} times={[tQuarter - 0.1, tNickels - 0.2, tNickels, tPenny - 0.1]} scale={0.7} />
      <At x={540} y={1150}><Appear at={tPenny + 0.2} from="slam"><Chip color={C.coral} size={48}>4 coins, not 2</Chip></Appear></At>
      <Sfx name="pack/kaching" at={tTwo + 0.1} volume={0.4} />
      <Sfx name="pack/wrong" at={tPenny + 0.2} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- fix + payoff (grid recolours)
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tPay = at.beat("payoff");
  const t37 = at.word("37", 1, 1.0);
  const tSmart = at.word("smart", 1, 3.4);
  const t389 = at.word("3.89", 1, tPay + 1.6);
  const t17 = at.word("17%", 1, tPay + 3.0);
  const counts = t < tSmart ? US : NEW;
  return (
    <>
      <Headline out={tPay - 0.3} color={C.coral}>Fails on 37 of 100</Headline>
      <Headline at={tPay} color={C.amber}>Count it properly</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t17 - 0.3, { zoom: 1 }], [t17 + 0.5, { zoom: 0.92 }]]}>
        <Grid counts={counts} reveal={t < tSmart ? -1 : tSmart} revealDur={1.4} mark={t < tSmart ? FAILS : undefined} markAt={t37 - 0.4} />
        <At x={540} y={385}><Appear at={tSmart} from="fade" sfx={null}><Text size={44} color={C.muted}>1¢ · 5¢ · 18¢ · 25¢</Text></Appear></At>
      </Camera>
      {t >= t389 - 0.4 && (
        <At x={540} y={800}>
          <div style={{ background: `${C.bg}ee`, borderRadius: 30, padding: "24px 50px", border: `4px solid ${C.amber}` }}>
            <Counter from={4.7} to={3.89} t0={t389 - 0.4} t1={t389 + 0.4} decimals={2} size={130} color={C.amber} />
          </div>
        </At>
      )}
      <At x={540} y={1000}><Appear at={t17 - 0.1} from="slam"><Chip color={C.mint} size={60}>17% less change</Chip></Appear></At>
      <Sfx name="pack/correct" at={t389} volume={0.35} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const t72 = at.word("72", 1, 1.6);
  return (
    <>
      <Headline color={C.amber}>Your turn</Headline>
      <At x={540} y={520}><Text size={56} color={C.muted}>1¢ · 5¢ · 18¢ · 25¢</Text></At>
      <At x={540} y={720}><Appear at={t72 - 0.3} from="slam"><Text size={150}>72¢</Text></Appear></At>
      <At x={540} y={940}><Appear at={t72 + 0.2} from="up"><Text size={66}>fewest coins<span style={{ color: C.amber }}>?</span></Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleBody /></Span>
    <Span from="count" to="us"><CountBody /></Span>
    <Span from="swap" to="rehook"><SwapBody /></Span>
    <Span from="fix" to="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
