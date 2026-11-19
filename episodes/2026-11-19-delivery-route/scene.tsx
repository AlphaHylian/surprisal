// "How to plan 20 delivery stops when no computer can": nearest neighbour + 2-opt uncrossing.
// claim hook (20 stops > seconds since the Big Bang) -> no brute force: 38 years -> 9 stops today
// -> nearest stop first -> it crosses itself, +24% -> re-hook: the X is the clue -> flip a crossing
// -> repeat: +3% -> UPS: 100 million miles a year -> CTA: 5 stops, how many loops? (12)
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};
const Big: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = C.ink, size = 96 }) => (
  <div style={{ fontFamily: F.bold, fontSize: size, color, whiteSpace: "nowrap", textShadow: "0 6px 24px #000b" }}>{children}</div>
);

// ---------------------------------------------------------------- the 9-stop map (index 0 = depot), checked in verify.py
const P: [number, number][] = [[540, 1040], [300, 900], [240, 700], [380, 520], [600, 430], [820, 560], [860, 800], [700, 930], [480, 720], [650, 700]];
const NN = [0, 7, 6, 9, 8, 3, 2, 1, 4, 5];
const edgesOf = (tour: number[]) => tour.map((a, i) => [a, tour[(i + 1) % tour.length]] as [number, number]);
const key = ([a, b]: [number, number]) => (a < b ? `${a}-${b}` : `${b}-${a}`);
const NN_E = edgesOf(NN);
const A_REMOVED = ["6-9", "0-5"], A_ADDED: [number, number][] = [[6, 5], [9, 0]];
const B_REMOVED = ["1-4", "3-8"], B_ADDED: [number, number][] = [[4, 3], [1, 8]];
const inter = (a: number, b: number, c: number, d: number): [number, number] => {
  const [x1, y1] = P[a], [x2, y2] = P[b], [x3, y3] = P[c], [x4, y4] = P[d];
  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  const u = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
  return [x1 + u * (x2 - x1), y1 + u * (y2 - y1)];
};
const X1 = inter(6, 9, 5, 0), X2 = inter(4, 1, 3, 8);

const Stops: React.FC<{ hi?: number[] }> = ({ hi = [] }) => (
  <>
    {P.map(([x, y], i) => i === 0 ? (
      <At key={i} x={x} y={y}><div style={{ width: 120, height: 120, borderRadius: 30, background: C.panel, border: `5px solid ${C.mint}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="Warehouse" size={72} color={C.mint} /></div></At>
    ) : (
      <At key={i} x={x} y={y}><div style={{ width: 54, height: 54, borderRadius: 27, background: hi.includes(i) ? C.amber : C.ink, border: `6px solid ${C.bg}`, boxShadow: "0 6px 16px #0009" }} /></At>
    ))}
  </>
);

type E = { e: [number, number]; color: string; t0: number; t1: number; out?: number; width?: number };
const Roads: React.FC<{ edges: E[] }> = ({ edges }) => {
  const t = useT();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      {edges.map(({ e: [a, b], color, t0, t1, out, width = 12 }, i) => {
        const [x1, y1] = P[a], [x2, y2] = P[b];
        const p = tween(t, t0, t1, 0, 1);
        const o = out !== undefined ? tween(t, out, out + 0.4, 1, 0) : 1;
        if (p <= 0 || o <= 0) return null;
        return <line key={i} x1={x1} y1={y1} x2={x1 + (x2 - x1) * p} y2={y1 + (y2 - y1) * p} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={o}
          style={{ filter: `drop-shadow(0 0 10px ${color}66)` }} />;
      })}
    </svg>
  );
};
const XMark: React.FC<{ at: number; p: [number, number]; out?: number }> = ({ at, p, out }) => (
  <At x={p[0]} y={p[1]}><Appear at={at} out={out} from="pop" sfx={null}>
    <div style={{ width: 110, height: 110, borderRadius: 55, border: `8px solid ${C.coral}`, boxShadow: `0 0 30px ${C.coral}aa` }} />
  </Appear></At>
);
const still = (edges: [number, number][], color: string, skip: string[] = []): E[] =>
  edges.filter((e) => !skip.includes(key(e))).map((e) => ({ e, color, t0: -2, t1: -1.9 }));

// ---------------------------------------------------------------- hook: 20 dots, routes flickering
const rnd = (s: number) => { const x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); };
const HP: [number, number][] = Array.from({ length: 20 }, (_, i) => [140 + rnd(i + 1) * 800, 520 + rnd(i + 40) * 600]);
const HookBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tBang = w(["Big", "Bang"], 1, 2.0);
  const k = Math.floor(t / 0.12);
  const tour = Array.from({ length: 20 }, (_, i) => i).sort((a, b) => rnd(a * 31 + k * 7) - rnd(b * 31 + k * 7));
  return (
    <>
      <HookText y={260} size={86}>{"20 stops:\n**1.2 quintillion** routes"}</HookText>
      <Riser to={tBang} volume={0.45} />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {[0, 1, 2].map((g) => {
          const tt = Array.from({ length: 20 }, (_, i) => i).sort((a, b) => rnd(a * 13 + (k + g * 5) * 3) - rnd(b * 13 + (k + g * 5) * 3));
          return <polygon key={g} points={tt.map((i) => HP[i].join(",")).join(" ")} fill="none" stroke={C.coral} strokeWidth={3} opacity={0.25 + 0.1 * g} />;
        })}
        <polygon points={tour.map((i) => HP[i].join(",")).join(" ")} fill="none" stroke={C.amber} strokeWidth={6} opacity={0.9} />
      </svg>
      {HP.map(([x, y], i) => <At key={i} x={x} y={y}><div style={{ width: 36, height: 36, borderRadius: 18, background: C.ink, border: `5px solid ${C.bg}` }} /></At>)}
      <Sfx name="pack/counting-digital" at={0.1} volume={0.2} dur={2.2} />
      <Sfx name="pack/boom-universe" hit={tBang} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- rule out: brute force takes 38 years
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tAll = w(["all"], 1, 0.9), tBillion = w(["billion"], 1, 2.0), t38 = w(["38"], 1, 3.2);
  return (
    <>
      <Headline>Try every route?</Headline>
      <At x={540} y={500}><Appear at={0.05} from="up"><Text size={52} font={F.mono} color={C.muted}>1,216,451,004,088,320,000</Text></Appear></At>
      <At x={540} y={600}><Appear at={tAll - 0.2} from="fade" sfx={null}><Text size={46} color={C.muted}>round trips</Text></Appear></At>
      <At x={540} y={760}><Appear at={tBillion - 0.3} from="up"><div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Icon name="Cpu" size={100} color={C.mint} /><Text size={58}>1 billion / second</Text></div></Appear></At>
      <Punch at={t38}><At x={540} y={960}><Appear at={t38 - 0.3} from="slam">
        <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}><Counter from={0} to={38} t0={t38 - 0.3} t1={t38 + 0.4} size={150} color={C.coral} /><Text size={80} color={C.coral}>years</Text></div>
      </Appear></At></Punch>
    </>
  );
};

// ---------------------------------------------------------------- context: today's 9 stops
const ContextBody: React.FC = () => {
  const w = useW();
  const t9 = w(["9"], 1, 1.4), tHome = w(["home"], 1, 3.6);
  return (
    <>
      <Headline>Today: 9 stops</Headline>
      <Camera keys={[[0, { zoom: 0.94 }], [tHome, { zoom: 1 }]]}>
        {P.map(([x, y], i) => i === 0 ? null : (
          <At key={i} x={x} y={y}><Appear at={0.05 + i * 0.08} from="pop" sfx={i % 3 === 1 ? undefined : null}>
            <div style={{ width: 54, height: 54, borderRadius: 27, background: C.ink, border: `6px solid ${C.bg}` }} /></Appear></At>
        ))}
        <At x={P[0][0]} y={P[0][1]}><Appear at={0.05} from="drop"><div style={{ width: 120, height: 120, borderRadius: 30, background: C.panel, border: `5px solid ${C.mint}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="Warehouse" size={72} color={C.mint} /></div></Appear></At>
        <At x={P[0][0] + 190} y={P[0][1]}><Appear at={tHome - 0.3} from="left"><Chip color={C.mint} size={44}>start + end</Chip></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- step 1: nearest neighbour, drawn hop by hop
const NearestBody: React.FC = () => {
  const w = useW();
  const tNear = w(["nearest"], 1, 1.4);
  const hop = 0.42;
  const edges: E[] = NN_E.map((e, i) => ({ e, color: C.amber, t0: tNear - 0.2 + i * hop, t1: tNear - 0.2 + i * hop + hop * 0.9 }));
  return (
    <>
      <Headline>Step 1: nearest stop next</Headline>
      <Roads edges={edges} />
      <Stops />
      {NN_E.map((_, i) => <Sfx key={i} name="pack/click-soft" at={tNear + i * hop + 0.2} volume={0.25} />)}
    </>
  );
};

// ---------------------------------------------------------------- the cost: it crosses itself, +24%
const CostBody: React.FC = () => {
  const w = useW();
  const tLook = w(["look"], 1, 1.0), tCross = w(["crosses"], 1, 1.8), t24 = w(["24%", "24"], 1, 3.2);
  return (
    <>
      <Headline>Fast. But…</Headline>
      <Roads edges={still(NN_E, C.amber)} />
      <Stops />
      <XMark at={tCross - 0.2} p={X1} />
      <XMark at={tCross + 0.2} p={X2} />
      <Sfx name="pack/wrong" at={tCross} volume={0.3} />
      <At x={540} y={360}><Appear at={t24 - 0.3} from="slam"><Chip color={C.coral} size={56}>24% longer than the best</Chip></Appear></At>
      <Sfx name="pack/whoosh-soft" at={tLook} volume={0.2} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook: the X is the clue
const RehookBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tX = w(["X"], 1, 0.6), tNever = w(["never"], 1, 2.4);
  const pulse = 1 + 0.12 * Math.max(0, Math.sin((t - tX) * 8)) * (t > tX ? 1 : 0);
  return (
    <>
      <Headline color={C.amber}>Shortest loops never cross</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tX + 0.6, { zoom: 1.08 }], [tNever + 1.5, { zoom: 1.0 }]]}>
        <Roads edges={still(NN_E, C.amber)} />
        <Stops />
        <At x={X1[0]} y={X1[1]} scale={pulse}><div style={{ width: 110, height: 110, borderRadius: 55, border: `8px solid ${C.coral}`, boxShadow: `0 0 30px ${C.coral}aa` }} /></At>
        <At x={X2[0]} y={X2[1]} scale={pulse}><div style={{ width: 110, height: 110, borderRadius: 55, border: `8px solid ${C.coral}`, boxShadow: `0 0 30px ${C.coral}aa` }} /></At>
      </Camera>
      <Sfx name="pack/idea" at={tNever} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- step 2: flip one crossing
const FlipBody: React.FC = () => {
  const w = useW();
  const tCross = w(["cross"], 1, 1.4), tFlip = w(["flip"], 1, 2.4), tShort = w(["shorter"], 1, 4.6);
  const edges: E[] = [
    ...still(NN_E, C.amber, A_REMOVED),
    ...NN_E.filter((e) => A_REMOVED.includes(key(e))).map((e) => ({ e, color: C.coral, t0: -2, t1: -1.9, out: tFlip })),
    ...A_ADDED.map((e) => ({ e, color: C.mint, t0: tFlip + 0.2, t1: tFlip + 0.8 })),
  ];
  return (
    <>
      <Headline>Step 2: flip the crossing</Headline>
      <Roads edges={edges} />
      <Stops hi={[6, 9, 5]} />
      <XMark at={tCross - 0.3} out={tFlip} p={X1} />
      <XMark at={-1} p={X2} />
      <Sfx name="pack/whoosh-swing" at={tFlip} volume={0.3} />
      <At x={540} y={360}><Appear at={tShort - 0.4} from="pop"><Chip color={C.amber} size={56}>+24% → +16%</Chip></Appear></At>
      <Sfx name="pack/correct" at={tShort} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- step 3: repeat until no X
const RepeatBody: React.FC = () => {
  const w = useW();
  const tRepeat = w(["repeat"], 1, 0.8), tX = w(["X"], 1, 2.0), t3 = w(["3%", "3"], 1, 3.6);
  const A_E: [number, number][] = [...NN_E.filter((e) => !A_REMOVED.includes(key(e))), ...A_ADDED];
  const tF = tRepeat + 0.3;
  const edges: E[] = [
    ...still(A_E, C.amber, B_REMOVED),
    ...A_E.filter((e) => B_REMOVED.includes(key(e))).map((e) => ({ e, color: C.coral, t0: -2, t1: -1.9, out: tF })),
    ...B_ADDED.map((e) => ({ e, color: C.mint, t0: tF + 0.2, t1: tF + 0.8 })),
  ];
  return (
    <>
      <Headline>Step 3: repeat until no X</Headline>
      <Roads edges={edges} />
      <Stops />
      <XMark at={-1} out={tF} p={X2} />
      <Sfx name="pack/whoosh-swing" at={tF} volume={0.3} />
      <At x={540} y={360}><Appear at={tX} out={t3 - 0.35} from="pop"><Chip color={C.mint} size={56}>no crossings</Chip></Appear></At>
      <At x={540} y={360}><Appear at={t3 - 0.3} from="slam"><Chip color={C.amber} size={60}>3% from the best</Chip></Appear></At>
      <Sfx name="pack/win" at={t3} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- payoff: UPS
const PayoffBody: React.FC = () => {
  const w = useW();
  const tUps = w(["UPS"], 1, 0.3), t100 = w(["100"], 1, 1.2), tMiles = w(["miles"], 1, 4.0);
  return (
    <>
      <Camera keys={[[0, { zoom: 1 }], [tMiles + 1, { zoom: 1.06 }]]}>
        <At x={540} y={420}><Appear at={Math.max(0.05, tUps - 0.3)} from="right"><Icon name="Truck" size={200} color={C.amber} /></Appear></At>
        <At x={540} y={620}><Appear at={t100 - 0.3} from="up"><Text size={64}>100 stops a day, per driver</Text></Appear></At>
        <Punch at={tMiles}><At x={540} y={830}><Appear at={tMiles - 1.4} from="pop">
          <Counter from={0} to={100000000} t0={tMiles - 1.4} t1={tMiles} size={120} color={C.amber} comma />
        </Appear></At></Punch>
        <At x={540} y={980}><Appear at={tMiles - 0.2} from="fade" sfx={null}><Text size={56} color={C.amber}>miles saved a year</Text></Appear></At>
      </Camera>
      <Sfx name="pack/kaching" at={tMiles} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- CTA: 5 stops, how many loops?
const CtaBody: React.FC = () => {
  const w = useW();
  const t5 = w(["5"], 1, 0.4), tHow = w(["How"], 1, 1.4);
  const pts = Array.from({ length: 5 }, (_, i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5; return [540 + 260 * Math.cos(a), 680 + 260 * Math.sin(a)]; });
  return (
    <>
      <Headline>5 stops</Headline>
      {pts.map(([x, y], i) => <At key={i} x={x} y={y}><Appear at={Math.max(0.05, t5 - 0.3 + i * 0.1)} from="pop" sfx={i === 0 ? undefined : null}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: i === 0 ? C.mint : C.ink, border: `6px solid ${C.bg}` }} /></Appear></At>)}
      <At x={540} y={1080}><Appear at={tHow - 0.2} from="slam"><Big size={110} color={C.amber}>? loops</Big></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="nearest"><NearestBody /></Span>
    <Span from="cost"><CostBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="flip"><FlipBody /></Span>
    <Span from="repeat"><RepeatBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
