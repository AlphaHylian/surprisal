// "How to find pi by dropping a needle (and how one man faked it)": Buffon's needle, Lazzarini 1901.
// claim hook (3,408 needles = pi to 6 digits?) -> rule out circles and rulers, one man got it far too right ->
// lines 3 cm apart, needle 2.5 cm, drop and count -> Buffon: 5 over 3 pi, 53 in 100, turn it around ->
// re-hook: Lazzarini 3.1415929, too right -> honest spread 0.05, 3.1 -> giveaway 3,408 = 16 x 213, 113 crossings
// -> 355/113 -> payoff: 100 trillion drops -> CTA comment: 100 needles, how many cross? (53).
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp,
  Text, tween, useAt, useT,
} from "../kit";

// an icon with a coral cross through it
const Strike: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "relative" }}>
    {children}
    <div style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 14, background: C.coral, transform: "rotate(-35deg)", borderRadius: 7 }} />
  </div>
);

// a deterministic scatter of needles over lined floor: gap G px, needle length 5/6 G
const G = 150;
const rand = (seed: number) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
type Needle = { x: number; y: number; a: number; hit: boolean };
const makeNeedles = (n: number, w: number, h: number, seed: number): Needle[] => {
  const r = rand(seed);
  return Array.from({ length: n }, () => {
    const x = 40 + r() * (w - 80), y = 30 + r() * (h - 60), a = r() * Math.PI;
    const half = (G * 5) / 12;
    const y1 = y - Math.sin(a) * half, y2 = y + Math.sin(a) * half;
    const hit = Math.floor(y1 / G) !== Math.floor(y2 / G);
    return { x, y, a, hit };
  });
};

// Lined floor with needles landing one after another from t0, every `gap` seconds.
const Floor: React.FC<{ w?: number; h?: number; n: number; t0: number; gap?: number; seed?: number; color?: boolean }> =
  ({ w = 900, h = 600, n, t0, gap = 0.12, seed = 7, color = true }) => {
    const t = useT();
    const needles = React.useMemo(() => makeNeedles(n, w, h, seed), [n, w, h, seed]);
    const half = (G * 5) / 12;
    return (
      <svg width={w} height={h} style={{ overflow: "visible" }}>
        <rect width={w} height={h} rx={18} fill={C.panel} />
        {Array.from({ length: Math.floor(h / G) + 1 }, (_, i) => (
          <line key={i} x1={0} x2={w} y1={i * G} y2={i * G} stroke={C.muted} strokeWidth={4} opacity={0.7} />
        ))}
        {needles.map((nd, i) => {
          const ti = t0 + i * gap;
          if (t < ti) return null;
          const k = tween(t, ti, ti + 0.15, 0, 1);
          const dx = Math.cos(nd.a) * half, dy = Math.sin(nd.a) * half;
          const col = color && t > ti + 0.15 ? (nd.hit ? C.amber : C.ink) : C.ink;
          return (
            <line key={`n${i}`} x1={nd.x - dx} y1={nd.y - dy} x2={nd.x + dx} y2={nd.y + dy}
              stroke={col} strokeWidth={9} strokeLinecap="round" opacity={k} />
          );
        })}
      </svg>
    );
  };
const hitsUpTo = (n: number, seed = 7, w = 900, h = 600) => makeNeedles(n, w, h, seed).filter((x) => x.hit).length;

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tSix = at.word("pi.", 1, 2.0);
  return (
    <>
      <HookText size={92} y={290}>{"3,408 needles =\n**π to 6 digits**?"}</HookText>
      <Riser to={tSix} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06, y: 760 }]]}>
        <At x={540} y={720}><Floor n={30} t0={-3.4} gap={0.11} h={450} /></At>
        <Punch at={tSix} amount={0.12}>
          <At x={540} y={1070}><Text size={96} color={C.amber} font={F.mono}>3.141592…</Text></At>
        </Punch>
      </Camera>
      <Sfx name="pack/click-soft" at={0.05} volume={0.25} />
      <Sfx name="pack/ding" at={tSix} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tCircle = at.word("circle,", 1, 0.3);
  const tRuler = at.word("ruler.", 1, 1.0);
  const tFloor = at.word("floor,", 1, 2.0);
  const tMan = at.word("man", 1, 4.0);
  const tToo = at.word("far", 1, 5.0);
  return (
    <>
      <Headline>No circle. No ruler.</Headline>
      <At x={330} y={470}><Appear at={tCircle - 0.2} out={tFloor - 0.2} from="pop"><Strike><Icon name="Circle" size={170} color={C.muted} /></Strike></Appear></At>
      <At x={750} y={470}><Appear at={tRuler - 0.2} out={tFloor - 0.2} from="pop"><Strike><Icon name="Ruler" size={170} color={C.muted} /></Strike></Appear></At>
      <At x={540} y={700}><Appear at={tFloor - 0.2} from="up"><Floor n={8} t0={tFloor + 0.4} gap={0.25} h={450} color={false} /></Appear></At>
      <At x={540} y={1060}>
        <Appear at={tMan - 0.2} from="slam"><Stamp size={60} color={C.coral} rotate={-4}>FAR TOO RIGHT</Stamp></Appear>
      </At>
      <Sfx name="pack/wrong" at={tCircle} volume={0.2} />
      <Sfx name="pack/wrong" at={tRuler} volume={0.2} />
      <Sfx name="stamp" at={tToo} />
    </>
  );
};

// ---------------------------------------------------------------- 3. the setup: lines, needle, drop, count
const DropBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tLines = at.word("lines", 1, 0.5);
  const tNeedle = at.word("needle", 1, 2.2);
  const tAgain = at.word("again", 1, 3.6);
  const tCount = at.word("count", 1, 5.0);
  const n = 40;
  const shown = Math.max(0, Math.min(n, Math.floor((t - tAgain) / 0.09) + 1));
  return (
    <>
      <Headline>Drop and count</Headline>
      <Camera keys={[[0, { zoom: 1.15, y: 560 }], [tAgain, { zoom: 1 }]]}>
        <At x={540} y={660}>
          <Appear at={tLines - 0.3} from="fade"><Floor n={n} t0={tAgain} gap={0.09} h={600} /></Appear>
        </At>
              </Camera>
      <At x={540} y={1060}>
        {t < tCount - 0.3
          ? <Appear at={tLines} from="pop"><Chip size={52} color={C.ink}>{t < tNeedle - 0.2 ? "lines 3 cm apart" : "needle 2.5 cm"}</Chip></Appear>
          : <Text size={64} color={C.amber} font={F.bold}>{`${hitsUpTo(shown)} of ${shown} cross`}</Text>}
      </At>
      <Sfx name="pack/pencil" at={tLines - 0.3} volume={0.25} dur={0.8} />
      <Sfx name="pack/typing" at={tAgain} volume={0.15} dur={3.5} />
    </>
  );
};

// ---------------------------------------------------------------- 4. Buffon's formula
const FormulaBody: React.FC = () => {
  const at = useAt();
  const tChance = at.word("chance", 1, 1.0);
  const t53 = at.word("53", 1, 2.6);
  const tTurn = at.word("Turn", 1, 3.6);
  const tPi = at.word("pi.", 2, 5.0);
  return (
    <>
      <Headline>Buffon's needle</Headline>
      <At x={540} y={460}>
        <Appear at={tChance - 0.2} out={tTurn - 0.2} from="pop">
          <Text size={96} color={C.ink} font={F.bold}>chance = 5 / 3π</Text>
        </Appear>
      </At>
      <At x={540} y={640}>
        <Appear at={t53 - 0.2} out={tTurn - 0.2} from="up"><Text size={76} color={C.amber} font={F.bold}>≈ 53 in 100</Text></Appear>
      </At>
      <At x={540} y={560}>
        <Appear at={tTurn - 0.1} from="slam">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Text size={96} color={C.amber} font={F.bold}>π = 5 × drops</Text>
            <Text size={84} color={C.amber} font={F.bold}>÷ (3 × crosses)</Text>
          </div>
        </Appear>
      </At>
      <At x={540} y={950}><Appear at={tPi - 0.3} from="pop"><Chip size={56} color={C.mint}>count → π</Chip></Appear></At>
      <Sfx name="pack/notify-idea" at={tChance - 0.2} volume={0.3} />
      <Sfx name="pack/swoosh" at={tTurn - 0.1} volume={0.3} />
      <Sfx name="pack/correct" at={tPi - 0.3} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 5. re-hook: Lazzarini's result
const ReHookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tGot = at.word("pi", 1, 3.6);
  const tSix = at.word("six", 1, 4.4);
  const tToo = at.word("Suspiciously", 1, 5.4);
  const digits = "3.1415929";
  const pi = "3.1415926";
  return (
    <>
      <Headline color={C.amber}>Lazzarini, 1901</Headline>
      <At x={540} y={440}><Counter from={0} to={3408} t0={0.6} t1={2.2} size={84} color={C.ink} comma suffix=" drops" /></At>
      <At x={540} y={640}>
        <Appear at={tGot - 0.2} from="pop">
          <div style={{ display: "flex", fontFamily: F.mono, fontSize: 100 }}>
            {digits.split("").map((d, i) => (
              <span key={i} style={{ color: t >= tSix - 0.2 && i <= 7 && d === pi[i] ? C.mint : C.ink }}>{d}</span>
            ))}
          </div>
        </Appear>
      </At>
      <At x={540} y={790}><Appear at={tSix - 0.2} from="up"><Text size={50} color={C.muted} font={F.mono}>π = 3.1415926…</Text></Appear></At>
      <Shake at={tToo}>
        <At x={540} y={1010}><Appear at={tToo - 0.2} from="slam"><Stamp size={76} color={C.coral} rotate={-5}>SUSPICIOUSLY RIGHT</Stamp></Appear></At>
      </Shake>
      <Sfx name="pack/hit-glass-suspense" hit={tToo} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 6. what an honest run looks like
const HonestBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tOff = at.word("off", 1, 2.0);
  const t31 = at.word("3.1.", 1, 3.6);
  // a bell of honest results around pi, sd 0.05
  const xs = Array.from({ length: 61 }, (_, i) => -0.15 + i * 0.005);
  const w = 860, h = 300;
  const px = (x: number) => w / 2 + (x / 0.15) * (w / 2);
  const py = (x: number) => h - Math.exp(-(x * x) / (2 * 0.05 * 0.05)) * (h - 20);
  const grow = tween(t, 0.2, 1.4, 0, 1);
  return (
    <>
      <Headline>An honest 3,408 drops</Headline>
      <At x={540} y={620}>
        <svg width={w} height={h + 80} style={{ overflow: "visible" }}>
          <path d={`M ${px(xs[0])} ${h} ` + xs.map((x) => `L ${px(x)} ${h - (h - py(x)) * grow}`).join(" ") + ` L ${px(xs[xs.length - 1])} ${h} Z`}
            fill={C.mint} opacity={0.35} stroke={C.mint} strokeWidth={5} />
          <line x1={px(0)} x2={px(0)} y1={0} y2={h} stroke={C.amber} strokeWidth={5} />
          <rect x={px(-0.05)} y={h + 6} width={px(0.05) - px(-0.05)} height={12} fill={C.ink} opacity={t >= tOff - 0.2 ? 1 : 0} rx={6} />
          <text x={px(-0.15)} y={h + 60} fill={C.muted} fontFamily="Space Grotesk Medium" fontSize={40}>3.09</text>
          <text x={px(0)} y={h + 60} fill={C.amber} fontFamily="Space Grotesk Medium" fontSize={40} textAnchor="middle">π</text>
          <text x={px(0.15)} y={h + 60} fill={C.muted} fontFamily="Space Grotesk Medium" fontSize={40} textAnchor="end">3.19</text>
        </svg>
      </At>
      <At x={540} y={380}><Appear at={tOff - 0.2} from="pop"><Chip size={52} color={C.ink}>usually off by ± 0.05</Chip></Appear></At>
      <At x={540} y={1050}><Appear at={t31 - 0.2} from="slam"><Text size={110} color={C.amber} font={F.mono}>3.1</Text></Appear></At>
      <Sfx name="pack/whoosh-mid" at={0.2} volume={0.25} />
      <Sfx name="pack/ding-short" at={t31 - 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 7. the giveaway: 16 x 213, 355/113
const TellBody: React.FC = () => {
  const at = useAt();
  const t16 = at.word("16", 1, 1.6);
  const t213 = at.word("213", 2, 3.2);
  const t355 = at.word("355", 1, 5.6);
  const tBest = at.word("famous", 1, 6.8);
  const tStop = at.word("stopped", 1, 9.0);
  return (
    <>
      <Headline>The giveaway</Headline>
      <At x={540} y={420}><Appear at={t16 - 0.3} from="pop"><Text size={84} color={C.ink} font={F.bold}>3,408 = 16 × 213</Text></Appear></At>
      <At x={540} y={590}>
        <Appear at={t213 - 0.2} from="up"><Text size={64} color={C.mint} font={F.bold}>213 drops, 113 cross</Text></Appear>
      </At>
      <Punch at={t355} amount={0.12}>
        <At x={540} y={770}><Appear at={t355 - 0.2} from="slam"><Text size={110} color={C.amber} font={F.bold}>→ 355/113</Text></Appear></At>
      </Punch>
      <At x={540} y={900}><Appear at={tBest - 0.2} from="up"><Text size={48} color={C.muted} font={F.med}>the famous fraction for π</Text></Appear></At>
      <At x={540} y={1060}><Appear at={tStop - 0.2} from="slam"><Stamp size={58} color={C.coral} rotate={-4}>STOP WHEN IT FITS</Stamp></Appear></At>
      <Sfx name="pack/pop" at={t16 - 0.3} volume={0.25} />
      <Sfx name="pack/pop-2" at={t213 - 0.2} volume={0.25} />
      <Sfx name="pack/cash-ting" at={t355 - 0.2} volume={0.3} />
      <Sfx name="stamp" at={tStop} />
    </>
  );
};

// ---------------------------------------------------------------- 8. payoff: 100 trillion drops
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t100 = at.word("100", 1, 1.6);
  return (
    <>
      <Headline color={C.mint}>6 honest digits</Headline>
      <At x={540} y={620}>
        <Appear at={t100 - 0.3} from="slam"><Text size={130} color={C.amber} font={F.bold}>100 trillion</Text></Appear>
      </At>
      <At x={540} y={780}><Appear at={t100} from="up"><Text size={60} color={C.ink} font={F.med}>drops</Text></Appear></At>
      <At x={540} y={1000}><Appear at={t100 + 0.4} from="up"><Text size={46} color={C.muted} font={F.med}>he claimed 3,408</Text></Appear></At>
      <Sfx name="pack/boom-short" at={t100 - 0.3} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 9. CTA: 100 needles?
const CtaBody: React.FC = () => {
  const at = useAt();
  const tHow = at.word("how", 1, 1.4);
  return (
    <>
      <Headline>100 needles</Headline>
      <At x={540} y={660}><Floor n={40} t0={0} gap={0.04} h={600} color={false} /></At>
      <At x={540} y={1060}><Appear at={tHow - 0.2} from="pop"><Text size={80} color={C.amber} font={F.bold}>how many cross?</Text></Appear></At>
      <Sfx name="pack/popup" at={tHow - 0.2} volume={0.3} />
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="drop"><DropBody /></Span>
    <Span from="formula"><FormulaBody /></Span>
    <Span from="rehook"><ReHookBody /></Span>
    <Span from="honest"><HonestBody /></Span>
    <Span from="tell"><TellBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
