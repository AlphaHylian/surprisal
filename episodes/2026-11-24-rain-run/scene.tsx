// "Should you run in the rain?": top catches rain per second, front catches the drops along the path.
// versus hook (walk vs run, only 29% drier) -> you can't outrun some rain -> 100 m, pouring -> split in two
// -> top: 67 s vs 22 s, a third -> re-hook: look at your front -> same drops either way -> 24 mL front, 7x area
// -> walk 43 vs run 30 = 29% drier -> infinite speed still 24 -> CTA twice as far? (same 29%)
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------------------------------------------------------- pieces
// falling rain streaks inside a box (absolute, page coordinates)
const Rain: React.FC<{ x: number; y: number; w: number; h: number; n?: number; speed?: number; tilt?: number }> = ({ x, y, w, h, n = 60, speed = 1400, tilt = 0 }) => {
  const t = useT();
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden" }}>
      {Array.from({ length: n }).map((_, i) => {
        const yy = ((rnd(i) * h + t * speed * (0.85 + 0.3 * rnd(i + 9))) % (h + 80)) - 60;
        const xx = rnd(i + 3) * w - tilt * (yy / h) * 40;
        return <div key={i} style={{ position: "absolute", left: xx, top: yy, width: 4, height: 46, borderRadius: 2, background: "#8fb8ff", opacity: 0.55, transform: `rotate(${tilt}deg)` }} />;
      })}
    </div>
  );
};
// side-view person: head + body. top = head/shoulders highlight, front = chest highlight (facing right)
const Person: React.FC<{ s?: number; top?: number; front?: number; run?: boolean }> = ({ s = 1, top = 0, front = 0, run = false }) => {
  const t = useT();
  const swing = Math.sin(t * (run ? 16 : 7)) * (run ? 28 : 14);
  const lean = run ? 10 : 0;
  return (
    <svg width={260 * s} height={520 * s} viewBox="0 0 260 520" style={{ overflow: "visible" }}>
      <g transform={`rotate(${lean} 130 500)`}>
        {/* legs */}
        <g transform={`rotate(${swing} 130 330)`}><rect x={112} y={320} width={36} height={190} rx={18} fill="#3a4152" /></g>
        <g transform={`rotate(${-swing} 130 330)`}><rect x={112} y={320} width={36} height={190} rx={18} fill="#4a5266" /></g>
        {/* body */}
        <rect x={80} y={120} width={100} height={220} rx={40} fill="#5b6478" />
        {/* front (chest) highlight */}
        <rect x={168} y={120} width={26} height={220} rx={13} fill={C.amber} opacity={front} />
        {/* head */}
        <circle cx={130} cy={70} r={52} fill="#6b7489" />
        {/* top highlight */}
        <rect x={74} y={6} width={112} height={22} rx={11} fill={C.mint} opacity={top} />
        <rect x={72} y={112} width={116} height={18} rx={9} fill={C.mint} opacity={top} />
      </g>
    </svg>
  );
};
const Cup: React.FC<{ ml: number; max?: number; label: string; color?: string; h?: number }> = ({ ml, max = 45, label, color = "#8fb8ff", h = 300 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
    <div style={{ position: "relative", width: 170, height: h, border: `6px solid ${C.ink}`, borderTop: "none", borderRadius: "0 0 28px 28px", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${(ml / max) * 100}%`, background: color, opacity: 0.85 }} />
    </div>
    <div style={{ fontFamily: F.bold, fontSize: 60, color: C.ink }}>{Math.round(ml)} mL</div>
    <div style={{ fontFamily: F.med, fontSize: 44, color: C.muted }}>{label}</div>
  </div>
);
// stacked bar: top (mint) + front (amber), 1 mL = PX px
const PX = 17, X0 = 200;
const Stack: React.FC<{ y: number; top: number; front: number; label: string; show?: number }> = ({ y, top, front, label, show = -1 }) => {
  const t = useT();
  if (t < show) return null;
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: y + 16, fontFamily: F.med, fontSize: 44, color: C.muted, width: 130, textAlign: "right" }}>{label}</div>
      <div style={{ position: "absolute", left: X0, top: y, width: front * PX, height: 90, borderRadius: "18px 0 0 18px", background: C.amber }} />
      <div style={{ position: "absolute", left: X0 + front * PX, top: y, width: top * PX, height: 90, borderRadius: "0 18px 18px 0", background: C.mint }} />
      <div style={{ position: "absolute", left: X0 + (front + top) * PX + 16, top: y + 12, fontFamily: F.bold, fontSize: 58, color: C.ink, whiteSpace: "nowrap" }}>{Math.round(front + top)}</div>
    </>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const tRun = w(["Running"], 1, 1.4), t29 = w(["29%", "29"], 1, 2.4);
  return (
    <>
      <HookText y={250} size={96}>{"Walk vs **Run**:\nonly **29%** drier"}</HookText>
      <Riser to={t29} volume={0.45} />
      <Rain x={60} y={460} w={960} h={700} n={70} />
      <Camera keys={[[0, { zoom: 1 }], [t29 + 0.8, { zoom: 1.05 }]]}>
        <At x={300} y={760}><Appear at={0} from="pop"><Person s={0.75} /></Appear></At>
        <At x={780} y={760}><Appear at={0} from="pop" sfx={null}><Person s={0.75} run /></Appear></At>
        <At x={300} y={1070}><Appear at={0} from="up" sfx={null}><Chip color={C.muted} size={54}>walk: 43 mL</Chip></Appear></At>
        <At x={780} y={1070}><Appear at={0} from="up" sfx={null}><Chip color={C.amber} size={54}>run: 30 mL</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/whoosh-soft" at={tRun} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tWay = w(["way"], 1, 1.0), tCant = w(["can't."], 1, 2.0), tOut = w(["outrun."], 1, 3.6);
  return (
    <>
      <Headline>Run = way drier?</Headline>
      <Rain x={60} y={380} w={960} h={760} n={60} />
      <At x={540} y={700}><Appear at={0.05} from="right"><Person s={0.85} run /></Appear></At>
      <At x={540} y={1010}><Appear at={Math.max(tCant, tWay + 0.4)} from="slam"><Stamp color={C.coral} size={84}>CAN'T OUTRUN IT</Stamp></Appear></At>
      <Sfx name="pack/wrong" at={tCant} volume={0.3} />
      <Sfx name="pack/whoosh-short" at={tOut} volume={0.2} />
    </>
  );
};

// ---------------------------------------------------------------- context: 100 m from your door
const ContextBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t100 = w(["100"], 1, 0.6), tPour = w(["pouring."], 1, 2.0);
  const k = tween(t, 0, 3.5, 0, 1);
  return (
    <>
      <Headline>100 m from your door</Headline>
      <Rain x={60} y={380} w={960} h={760} n={tPour > 0 && t > tPour - 0.3 ? 90 : 40} speed={1600} />
      <div style={{ position: "absolute", left: 120, top: 1000, width: 840, height: 8, background: C.dim, borderRadius: 4 }} />
      <At x={200 + 40 * k} y={830}><Appear at={0.05} from="left"><Person s={0.55} /></Appear></At>
      <At x={900} y={880}><Appear at={0.2} from="drop"><Icon name="House" size={220} color={C.mint} /></Appear></At>
      <Punch at={t100}><At x={560} y={1080}><Appear at={t100 - 0.2} from="pop"><Chip color={C.amber} size={60}>100 m</Chip></Appear></At></Punch>
      <Sfx name="pack/transition-wind" at={tPour - 0.2} volume={0.25} dur={1.2} />
    </>
  );
};

// ---------------------------------------------------------------- split: top catches per second
const SplitBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tTwo = w(["two."], 1, 1.0), tHead = w(["head"], 1, 1.6), tSec = w(["second"], 1, 3.4);
  const topOp = t > tHead - 0.2 ? 0.6 + 0.4 * Math.sin(t * 6) ** 2 : 0;
  return (
    <>
      <Headline>Two targets</Headline>
      <Rain x={200} y={380} w={680} h={560} n={40} />
      <Camera keys={[[0, { zoom: 1 }], [tHead, { zoom: 1 }], [tHead + 0.8, { zoom: 1.08, x: 540, y: 520 }]]}>
        <At x={540} y={730}><Appear at={0.05} from="pop"><Person s={1} top={topOp} /></Appear></At>
      </Camera>
      <At x={540} y={1060}><Appear at={tTwo} from="up"><Chip color={C.mint} size={54}>top: rain every second</Chip></Appear></At>
      <Sfx name="pack/clock" at={tSec - 0.2} volume={0.3} dur={1.2} />
    </>
  );
};

// ---------------------------------------------------------------- top: 67 s vs 22 s, a third
const TopBody: React.FC = () => {
  const w = useW();
  const t67 = w(["67"], 1, 1.0), tRun = w(["Run"], 1, 2.0), t22 = w(["22"], 1, 3.4), tThird = w(["third"], 1, 4.6);
  return (
    <>
      <Headline>Rain on top</Headline>
      <At x={300} y={460}><Appear at={0.05} from="up"><Icon name="Footprints" size={110} color={C.muted} /></Appear></At>
      <At x={300} y={590}><Counter from={0} to={67} t0={0.1} t1={t67} size={96} suffix=" s" /></At>
      <At x={780} y={460}><Appear at={tRun - 0.2} from="up"><Icon name="Zap" size={110} color={C.amber} /></Appear></At>
      <At x={780} y={590}><Appear at={tRun} from="fade" sfx={null}><Counter from={0} to={22} t0={tRun} t1={t22} size={96} suffix=" s" color={C.amber} /></Appear></At>
      <At x={300} y={900}><Appear at={tThird - 0.6} from="up"><Cup ml={18.5} max={20} h={180} label="walk top" color={C.mint} /></Appear></At>
      <At x={780} y={900}><Appear at={tThird - 0.6} from="up" sfx={null}><Cup ml={6.2} max={20} h={180} label="run top" color={C.mint} /></Appear></At>
      <Sfx name="pack/correct" at={tThird} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook: look at your front
const RehookBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tFront = w(["front."], 1, 1.8);
  const fr = t > tFront - 0.2 ? 0.6 + 0.4 * Math.sin(t * 6) ** 2 : 0;
  return (
    <>
      <Headline color={C.amber}>Look at your front</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tFront - 0.2, { zoom: 1 }], [tFront + 0.6, { zoom: 1.08, x: 600, y: 700 }]]}>
        <At x={540} y={730}><Appear at={0.05} from="pop"><Person s={1} front={fr} /></Appear></At>
      </Camera>
      <Sfx name="pack/suspense-sting" at={tFront} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- front: the drops hanging in the air
const FrontBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tHang = w(["hanging"], 1, 1.0), tChest = w(["chest."], 1, 3.4), tWalk = w(["Walk"], 1, 4.2), tSame = w(["same"], 1, 5.4);
  const run = t > tWalk;
  // walker moves through a frozen field of drops (the drops in the air along the path); front collects them
  const px = run ? tween(t, tWalk, tWalk + 1.0, 180, 860) : tween(t, tHang, tChest + 0.4, 180, 860);
  const frontX = px + 50;
  return (
    <>
      <Headline>The drops in your way</Headline>
      <div style={{ position: "absolute", left: 120, top: 1050, width: 840, height: 8, background: C.dim, borderRadius: 4 }} />
      {Array.from({ length: 70 }).map((_, i) => {
        const dx = 260 + rnd(i) * 680, dy = 600 + rnd(i + 5) * 400;
        const gone = (run ? t > tWalk : true) && frontX > dx;
        const reset = run && t < tWalk + 0.02;
        return (gone && !reset) ? null : <div key={i} style={{ position: "absolute", left: dx, top: dy, width: 12, height: 22, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#8fb8ff", opacity: t > tHang - 0.3 ? 0.9 : 0.35 }} />;
      })}
      <At x={px} y={830}><Person s={0.5} front={1} run={run} /></At>
      <At x={540} y={480}><Appear at={tWalk - 0.1} from="pop"><Chip color={C.muted} size={50}>{run ? "run" : "walk"}</Chip></Appear></At>
      <At x={540} y={1120}><Appear at={tSame - 0.2} from="slam"><Chip color={C.amber} size={58}>same drops</Chip></Appear></At>
      <Sfx name="pack/pop-bubble" at={tChest - 0.6} volume={0.25} />
      <Sfx name="pack/whoosh-fast" at={tWalk + 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- numbers: 24 mL front, 7x area
const NumbersBody: React.FC = () => {
  const w = useW();
  const t24 = w(["24"], 1, 1.2), tEither = w(["either"], 1, 2.8), t7 = w(["7"], 1, 4.4);
  return (
    <>
      <Headline>Your front: 24 mL</Headline>
      <At x={300} y={660}><Appear at={t24 - 0.3} from="up"><Cup ml={24.3} max={45} h={300} label="walk front" color={C.amber} /></Appear></At>
      <At x={780} y={660}><Appear at={tEither - 0.2} from="up"><Cup ml={24.3} max={45} h={300} label="run front" color={C.amber} /></Appear></At>
      <At x={540} y={1060}><Appear at={t7 - 0.2} from="slam"><Chip color={C.amber} size={58}>front = 7× your top</Chip></Appear></At>
      <Sfx name="pack/ding" at={tEither} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- total: 43 vs 30
const TotalBody: React.FC = () => {
  const w = useW();
  const t43 = w(["43"], 1, 1.2), t30 = w(["30."], 1, 2.4), t29 = w(["29%", "29"], 1, 3.2);
  return (
    <>
      <Headline>Total</Headline>
      <At x={540} y={440}><div style={{ display: "flex", gap: 40, fontFamily: F.med, fontSize: 44 }}><span style={{ color: C.amber }}>■ front</span><span style={{ color: C.mint }}>■ top</span></div></At>
      <Stack y={560} front={24.3} top={18.52} label="walk" show={t43 - 0.5} />
      <Stack y={760} front={24.3} top={6.17} label="run" show={t30 - 0.5} />
      <Punch at={t29}><At x={540} y={1030}><Appear at={t29 - 0.3} from="slam"><Chip color={C.amber} size={72}>29% drier</Chip></Appear></At></Punch>
      <Sfx name="pack/click-hard" at={t43} volume={0.3} />
      <Sfx name="pack/correct" at={t29} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- payoff: infinite speed still 24
const PayoffBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tInf = w(["infinite"], 1, 0.6), t24 = w(["24."], 1, 2.4), tDry = w(["dry."], 1, 4.4);
  const top = tween(t, tInf, tInf + 1.4, 6.2, 0);
  return (
    <>
      <Headline>Infinitely fast?</Headline>
      <At x={540} y={440}><div style={{ display: "flex", gap: 40, fontFamily: F.med, fontSize: 44 }}><span style={{ color: C.amber }}>■ front</span><span style={{ color: C.mint }}>■ top</span></div></At>
      <Stack y={600} front={24.3} top={top} label="∞" />
      <At x={540} y={830}><Appear at={t24 - 0.3} from="pop"><Text size={64}>still <span style={{ color: C.amber }}>24 mL</span></Text></Appear></At>
      <At x={540} y={1030}><Appear at={tDry - 0.4} from="slam"><Stamp color={C.coral} size={80}>NEVER DRY</Stamp></Appear></At>
      <Sfx name="pack/whoosh-fast-2" at={tInf} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- CTA: twice as far?
const CtaBody: React.FC = () => {
  const w = useW();
  const tTwice = w(["twice"], 1, 1.2), t29 = w(["29%", "29"], 1, 3.0);
  return (
    <>
      <Headline>Your turn</Headline>
      <div style={{ position: "absolute", left: 120, top: 760, width: 840, height: 8, background: C.dim, borderRadius: 4 }} />
      <At x={170} y={660}><Icon name="User" size={130} color={C.ink} /></At>
      <At x={560} y={660}><Appear at={0} from="pop"><Icon name="House" size={130} color={C.muted} /></Appear></At>
      <At x={920} y={660}><Appear at={tTwice - 0.2} from="right"><Icon name="House" size={150} color={C.mint} /></Appear></At>
      <At x={540} y={860}><Appear at={tTwice} from="pop"><Chip color={C.muted} size={52}>200 m</Chip></Appear></At>
      <At x={540} y={1040}><Appear at={t29 - 0.3} from="slam"><div style={{ fontFamily: F.bold, fontSize: 104, color: C.amber, whiteSpace: "nowrap" }}>more than 29%?</div></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="split"><SplitBody /></Span>
    <Span from="top"><TopBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="front"><FrontBody /></Span>
    <Span from="numbers"><NumbersBody /></Span>
    <Span from="total"><TotalBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
