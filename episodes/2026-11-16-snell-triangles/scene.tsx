// "How to measure a country by walking 5 km": Snellius's triangulation, 1615.
// claim hook (5 km measured, 130 km free) -> only angles -> Leiden 1615 -> baseline -> two angles -> sides for free
// -> chain of triangles -> re-hook: errors pile up? -> 9 m, 180 check -> 28,500 rods, 107 km, 38,653 -> 3.5% off -> CTA
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

type P = [number, number];
// a straight line drawn on between t0 and t1
const Seg: React.FC<{ a: P; b: P; t0?: number; t1?: number; color?: string; width?: number; dash?: boolean }> = ({ a, b, t0 = -1, t1 = 0, color = C.amber, width = 8, dash }) => {
  const t = useT();
  const p = t1 <= t0 ? 1 : tween(t, t0, t1, 0, 1);
  const x2 = a[0] + (b[0] - a[0]) * p, y2 = a[1] + (b[1] - a[1]) * p;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      {p > 0 ? <line x1={a[0]} y1={a[1]} x2={x2} y2={y2} stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={dash ? "18 16" : undefined}
        style={{ filter: `drop-shadow(0 0 10px ${color}88)` }} /> : null}
    </svg>
  );
};
// an angle arc at vertex v between directions to a and b
const Arc: React.FC<{ v: P; a: P; b: P; r?: number; at: number; color?: string }> = ({ v, a, b, r = 70, at, color = C.amber }) => {
  const t = useT();
  const p = tween(t, at, at + 0.4, 0, 1);
  if (p <= 0) return null;
  const a1 = Math.atan2(a[1] - v[1], a[0] - v[0]), a2r = Math.atan2(b[1] - v[1], b[0] - v[0]);
  let d = a2r - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  const e = a1 + d * p;
  const sx = v[0] + r * Math.cos(a1), sy = v[1] + r * Math.sin(a1), ex = v[0] + r * Math.cos(e), ey = v[1] + r * Math.sin(e);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <path d={`M ${sx} ${sy} A ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${ex} ${ey}`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />
    </svg>
  );
};
const Spire: React.FC<{ p: P; at?: number; color?: string; size?: number; label?: string; ly?: number }> = ({ p, at = 0, color = C.ink, size = 64, label, ly = 60 }) => (
  <>
    <At x={p[0]} y={p[1]}><Appear at={at} from="pop" sfx={at <= 0.05 ? null : undefined}><Icon name="Church" size={size} color={color} /></Appear></At>
    {label ? <At x={p[0]} y={p[1] + ly}><Appear at={at + 0.1} from="fade" sfx={null}><Text size={40} color={C.muted}>{label}</Text></Appear></At> : null}
  </>
);
const Big: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = C.ink, size = 96 }) => (
  <div style={{ fontFamily: F.bold, fontSize: size, color, whiteSpace: "nowrap" }}>{children}</div>
);

// chain of triangles across the frame (used in hook and chain beats)
const CHAIN: P[] = [[120, 980], [250, 820], [390, 1000], [530, 830], [670, 1010], [810, 840], [950, 1000]];

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const t130 = w(["130"], 1, 1.8);
  const glow = 0.6 + 0.4 * Math.sin(t * 6);
  return (
    <>
      <HookText y={300} size={100}>{"Measure **5 km**.\nGet **130 km** free."}</HookText>
      <Riser to={t130} volume={0.45} />
      {/* the measured base: short, mint */}
      <Seg a={[120, 980]} b={[250, 820]} color={C.mint} width={16} />
      {CHAIN.slice(0, -1).map((p, i) => <Seg key={"s" + i} a={p} b={CHAIN[i + 1]} t0={-1} t1={0} color={C.amber} width={6} />)}
      {CHAIN.slice(0, -2).map((p, i) => <Seg key={"d" + i} a={p} b={CHAIN[i + 2]} t0={-1} t1={0} color={C.amber} width={6} />)}
      {CHAIN.map((p, i) => <At key={i} x={p[0]} y={p[1]}><div style={{ width: 26, height: 26, borderRadius: 13, background: i < 2 ? C.mint : C.amber, opacity: i < 2 ? 1 : glow }} /></At>)}
      <At x={185} y={1080}><Text size={44} color={C.mint}>5 km</Text></At>
      <Punch at={t130}><At x={640} y={690}><Text size={56} color={C.amber}>130 km of angles</Text></At></Punch>
      <Sfx name="pack/ding" at={t130} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- only angles
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tRiv = w(["rivers"], 1, 1.0), tTown = w(["towns"], 1, 2.2), tAng = w(["angles"], 1, 3.4);
  return (
    <>
      <Headline>No tape needed</Headline>
      <At x={300} y={560}><Appear at={tRiv - 0.3} from="pop"><Icon name="Waves" size={150} color={C.coral} /></Appear></At>
      <At x={780} y={560}><Appear at={tTown - 0.3} from="pop"><Icon name="Building2" size={150} color={C.coral} /></Appear></At>
      <At x={300} y={700}><Appear at={tRiv} from="fade" sfx={null}><Text size={44} color={C.muted}>no chains</Text></Appear></At>
      <At x={780} y={700}><Appear at={tTown} from="fade" sfx={null}><Text size={44} color={C.muted}>no ropes</Text></Appear></At>
      <At x={540} y={930}><Appear at={tAng - 0.25} from="slam"><Text size={110} color={C.amber} glow>only angles</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- Leiden 1615
const ContextBody: React.FC = () => {
  const w = useW();
  const tSnel = w(["Snellius"], 1, 1.6), tEarth = w(["Earth"], 1, 3.2);
  return (
    <>
      <Headline>Leiden, 1615</Headline>
      <At x={540} y={560}><Appear at={tSnel - 0.3} from="up"><Icon name="UserRound" size={200} color={C.ink} /></Appear></At>
      <At x={540} y={740}><Appear at={tSnel} from="fade" sfx={null}><Text size={56} color={C.ink}>Willebrord Snellius</Text></Appear></At>
      <At x={540} y={960}><Appear at={tEarth - 0.3} from="pop"><Icon name="Globe" size={190} color={C.mint} glow /></Appear></At>
      <At x={760} y={900}><Appear at={tEarth} from="pop" sfx={null}><Text size={90} color={C.amber}>?</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- step 1: baseline
const BaseBody: React.FC = () => {
  const w = useW();
  const tSnel = w(["Snellius"], 1, 1.8), tLine = w(["line"], 1, 3.2), tLei = 0.1, t5 = w(["5"], 1, 5.6);
  return (
    <>
      <Headline>Step 1: one careful line</Headline>
      <At x={540} y={480}><Appear at={tSnel - 0.3} from="up"><div style={{ display: "flex", alignItems: "center", gap: 18 }}><Icon name="UserRound" size={90} color={C.ink} /><Text size={52} color={C.ink}>Snellius, 1615</Text></div></Appear></At>
      <Seg a={[200, 800]} b={[880, 800]} t0={tLine - 0.2} t1={tLine + 1.2} color={C.mint} width={14} />
      <Spire p={[200, 720]} at={tLei - 0.2} label="Leiden" ly={-80} />
      <Spire p={[880, 720]} at={tLei + 0.3} label="Zoeterwoude" ly={-80} />
      <At x={540} y={900}><Appear at={t5 - 0.3} from="slam"><Big size={110} color={C.mint}>≈ 5 km</Big></Appear></At>
      <At x={540} y={1050}><Appear at={t5 + 0.4} from="fade" sfx={null}><Text size={46} color={C.ink}>the only distance you measure</Text></Appear></At>
      <Sfx name="pack/pencil" at={tLine} volume={0.3} dur={1.2} />
    </>
  );
};

// triangle geometry for steps 2-3: base 5 km drawn 600 px, angles 60 at A, 70 at B
const A: P = [290, 1060], B: P = [790, 1060];
const pxPerKm = 100;
const apex: P = (() => {
  const ac = 6.1334 * pxPerKm; // side from A (opposite B = 70 deg)
  const ang = (60 * Math.PI) / 180;
  return [A[0] + ac * Math.cos(ang), A[1] - ac * Math.sin(ang)];
})();

// ---------------------------------------------------------------- step 2: angles
const AnglesBody: React.FC = () => {
  const w = useW();
  const tSpire = w(["tower"], 1, 1.4), tEach = w(["ends"], 1, 2.4), t60 = w(["60"], 1, 3.6), t70 = w(["70"], 1, 4.4);
  return (
    <>
      <Headline>Step 2: sight a tower</Headline>
      <Seg a={A} b={B} color={C.mint} width={14} />
      <Spire p={[apex[0], apex[1] - 40]} at={tSpire - 0.2} color={C.amber} size={80} />
      <Seg a={A} b={apex} t0={tEach - 0.3} t1={tEach + 0.4} color={C.ink} width={5} dash />
      <Seg a={B} b={apex} t0={tEach + 0.2} t1={tEach + 0.9} color={C.ink} width={5} dash />
      <Arc v={A} a={B} b={apex} at={t60 - 0.2} r={90} />
      <Arc v={B} a={A} b={apex} at={t70 - 0.2} r={90} />
      <At x={A[0] + 150} y={A[1] - 50}><Appear at={t60 - 0.1} from="pop"><Text size={54} color={C.amber}>60°</Text></Appear></At>
      <At x={B[0] - 150} y={B[1] - 50}><Appear at={t70 - 0.1} from="pop"><Text size={54} color={C.amber}>70°</Text></Appear></At>
      <At x={540} y={1120}><Text size={44} color={C.mint}>5 km</Text></At>
    </>
  );
};

// ---------------------------------------------------------------- step 2b: sides for free
const SidesBody: React.FC = () => {
  const w = useW();
  const tFix = w(["fix"], 1, 1.4), t57 = w(["5.7"], 1, 3.2), t61 = w(["6.1"], 1, 4.0), tNever = w(["never"], 1, 5.4);
  return (
    <>
      <Headline>Two angles + one side</Headline>
      <>
        <Seg a={A} b={B} color={C.mint} width={14} />
        <Seg a={A} b={apex} t0={tFix - 0.2} t1={tFix + 0.3} color={C.amber} width={10} />
        <Seg a={B} b={apex} t0={tFix} t1={tFix + 0.5} color={C.amber} width={10} />
        <Spire p={[apex[0], apex[1] - 40]} color={C.amber} size={80} />
        <At x={A[0] + 80} y={(A[1] + apex[1]) / 2}><Appear at={t61 - 0.2} from="pop"><Chip size={50}>6.1 km</Chip></Appear></At>
        <At x={B[0] - 20} y={(B[1] + apex[1]) / 2}><Appear at={t57 - 0.2} from="pop"><Chip size={50}>5.7 km</Chip></Appear></At>
        <At x={540} y={1120}><Text size={44} color={C.mint}>5 km</Text></At>
      </>
      <At x={540} y={380}><Appear at={tNever - 0.2} from="slam"><Text size={70} color={C.amber} glow>never walked</Text></Appear></At>
      <Sfx name="pack/correct" at={t61} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- step 3: chain
const TOWNS: [P, string][] = [[[180, 420], "Alkmaar"], [[420, 520], ""], [[250, 640], "Leiden"], [[520, 700], ""], [[330, 850], ""], [[620, 900], ""], [[420, 1060], "Bergen op Zoom"]];
const ChainBody: React.FC = () => {
  const w = useW();
  const tNext = w(["next"], 1, 1.4), tSpire = w(["Tower"], 1, 2.6), t14 = w(["14"], 1, 3.8), tAlk = w(["Alkmaar"], 1, 4.6);
  const pts = TOWNS.map((x) => x[0]);
  const step = (i: number) => tSpire - 0.2 + i * 0.35;
  return (
    <>
      <Headline>Step 3: repeat</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tAlk, { zoom: 1 }], [tAlk + 1.2, { zoom: 1.05 }]]}>
        <Seg a={pts[2]} b={pts[3]} color={C.mint} width={12} />
        {pts.slice(0, -1).map((p, i) => <Seg key={"a" + i} a={p} b={pts[i + 1]} t0={step(i)} t1={step(i) + 0.4} color={C.amber} width={6} />)}
        {pts.slice(0, -2).map((p, i) => <Seg key={"b" + i} a={p} b={pts[i + 2]} t0={step(i) + 0.15} t1={step(i) + 0.55} color={C.amber} width={6} />)}
        {TOWNS.map(([p, n], i) => <Spire key={i} p={p} at={i === 2 || i === 3 ? 0.05 : step(Math.max(0, i - 1))} size={52} label={n} ly={n === "Alkmaar" ? -60 : 55} />)}
      </Camera>
      <At x={830} y={560}><Appear at={tNext - 0.2} from="right"><Chip color={C.mint} size={44}>new side = new base</Chip></Appear></At>
      <At x={830} y={760}><Appear at={t14 - 0.2} from="pop"><Big size={90} color={C.amber}>14 towns</Big></Appear></At>
      <At x={830} y={900}><Appear at={tAlk} from="fade" sfx={null}><Text size={48} color={C.muted}>≈ 130 km</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const w = useW();
  const tTenths = w(["tenths"], 1, 1.6), tPile = w(["pile"], 1, 3.8);
  return (
    <>
      <Headline color={C.amber}>But the errors?</Headline>
      <At x={540} y={560}><Appear at={0.1} from="pop"><Icon name="Compass" size={190} color={C.ink} /></Appear></At>
      <At x={540} y={760}><Appear at={tTenths - 0.2} from="up"><Chip color={C.ink} size={54}>reads to 0.1°</Chip></Appear></At>
      <Shake at={tPile}><At x={540} y={960}><Appear at={tPile - 0.3} from="slam"><Text size={84} color={C.coral}>× 130 km ?</Text></Appear></At></Shake>
      <Sfx name="pack/hmm" at={tPile} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- error answer
const ErrorBody: React.FC = () => {
  const w = useW();
  const t9 = w(["9"], 1, 2.6), t180 = w(["180"], 1, 5.4), tBad = w(["bad"], 1, 6.4);
  return (
    <>
      <Headline>Small, and caught</Headline>
      <Seg a={[160, 640]} b={[920, 640]} color={C.ink} width={6} />
      <Seg a={[160, 640]} b={[920, 560]} t0={0.6} t1={1.4} color={C.coral} width={6} dash />
      <At x={160} y={700}><Text size={40} color={C.muted}>0.1° off</Text></At>
      <At x={860} y={480}><Appear at={t9 - 0.2} from="pop"><Chip color={C.amber} size={54}>9 m</Chip></Appear></At>
      <At x={540} y={740}><Appear at={t9} from="fade" sfx={null}><Text size={40} color={C.muted}>over 5 km</Text></Appear></At>
      <At x={540} y={940}><Appear at={t180 - 0.4} from="up"><Big size={88}>60° + 70° + 50° = <span style={{ color: C.mint }}>180°</span></Big></Appear></At>
      <At x={540} y={1080}><Appear at={tBad - 0.2} from="fade" sfx={null}><Text size={46} color={C.mint}>a bad reading won't add up</Text></Appear></At>
      <Sfx name="pack/correct" at={t180} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- result
const ResultBody: React.FC = () => {
  const w = useW();
  const tRods = 0.3, t107 = w(["107"], 1, 1.2), tAround = w(["38,653"], 1, 4.0);
  return (
    <>
      <Headline>One degree of Earth</Headline>
      <At x={540} y={480}><Appear at={tRods} from="up"><Big size={96}>28,500 rods</Big></Appear></At>
      <At x={540} y={640}><Appear at={t107 - 0.3} from="pop"><Big size={96} color={C.mint}>= 107 km</Big></Appear></At>
      <At x={540} y={800}><Appear at={tAround - 0.6} from="fade" sfx={null}><Text size={48} color={C.muted}>× 360°</Text></Appear></At>
      <Punch at={tAround + 0.6}><At x={540} y={960}>
        {/* the counter starts at tAround - 0.4 */}
        <Appear at={tAround - 0.5} from="fade" sfx={null}><Counter from={0} to={38653} t0={tAround - 0.4} t1={tAround + 0.6} size={120} color={C.amber} suffix=" km" /></Appear>
      </At></Punch>
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const tReal = w(["40,075"], 1, 1.4), tOff = w(["3.5%"], 1, 3.0), tLine = w(["line"], 1, 4.6);
  return (
    <>
      <At x={540} y={420}><Appear at={0.05} from="fade" sfx={null}><Text size={56} color={C.muted}>his: 38,653 km</Text></Appear></At>
      <At x={540} y={560}><Appear at={tReal - 0.3} from="up"><Text size={56} color={C.ink}>real: 40,075 km</Text></Appear></At>
      <Punch at={tOff}><At x={540} y={770}><Appear at={tOff - 0.3} from="slam"><Big size={150} color={C.amber}>3.5% off</Big></Appear></At></Punch>
      <Seg a={[390, 990]} b={[690, 990]} t0={tLine - 0.5} t1={tLine} color={C.mint} width={16} />
      <At x={540} y={1080}><Appear at={tLine - 0.2} from="fade" sfx={null}><Text size={46} color={C.mint}>from one 5 km line</Text></Appear></At>
      <Sfx name="pack/hit-grand" at={tOff} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tTape = w(["tape"], 1, 2.0);
  return (
    <>
      <At x={540} y={640}><Appear at={0.05} from="pop"><Icon name="Ruler" size={230} color={C.ink} /></Appear></At>
      <At x={540} y={860}><Appear at={tTape - 0.3} from="up"><Text size={64} color={C.amber}>a very long tape?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="base"><BaseBody /></Span>
    <Span from="angles"><AnglesBody /></Span>
    <Span from="sides"><SidesBody /></Span>
    <Span from="chain"><ChainBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="error"><ErrorBody /></Span>
    <Span from="result"><ResultBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
