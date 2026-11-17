// "How sailors measured speed with a knotted rope": the chip log and dead reckoning.
// claim hook (knots in 28 s = your speed) -> no GPS, the rope does the math -> mid-Atlantic, where are you?
// -> throw the board -> 28 s glass, count 7 -> why: 47 ft 3 in = 1 nautical mile/h for 28 s -> re-hook: speed isn't position
// -> log every hour: 7 x 4 = 28 miles west -> current: 24 miles off a day -> payoff: knots -> CTA subscribe
import React from "react";
import { Appear, Arrow, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};
const Big: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = C.ink, size = 96 }) => (
  <div style={{ fontFamily: F.bold, fontSize: size, color, whiteSpace: "nowrap" }}>{children}</div>
);

// water line
const Sea: React.FC<{ y: number }> = ({ y }) => {
  const t = useT();
  const pts = Array.from({ length: 28 }, (_, i) => `${i * 40},${y + 8 * Math.sin(i * 0.9 + t * 3)}`).join(" ");
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <polyline points={pts} fill="none" stroke={C.mint} strokeWidth={5} opacity={0.5} />
    </svg>
  );
};

// a log line from the board (x0) to the ship (x1) at height y, knots every `gap` px, scrolling by `shift`
const Line: React.FC<{ x0: number; x1: number; y: number; gap?: number; shift?: number; hiFrom?: number; hiCount?: number }> =
  ({ x0, x1, y, gap = 80, shift = 0, hiFrom = 1e9, hiCount = 0 }) => {
  const knots: number[] = [];
  for (let x = x1 - (shift % gap); x > x0 + 10; x -= gap) knots.push(x);
  return (
    <>
      <div style={{ position: "absolute", left: x0, top: y - 3, width: x1 - x0, height: 6, background: C.ink, opacity: 0.8, borderRadius: 3 }} />
      {knots.map((x, i) => (
        <div key={i} style={{ position: "absolute", left: x - 11, top: y - 11, width: 22, height: 22, borderRadius: 11,
          background: x >= hiFrom && i < hiCount ? C.amber : C.ink, boxShadow: x >= hiFrom && i < hiCount ? `0 0 16px ${C.amber}` : undefined }} />
      ))}
    </>
  );
};
const Board: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{ position: "absolute", left: x - 45, top: y - 40, width: 90, height: 80, borderRadius: "0 0 45px 45px", background: "#9a6a3a", border: `4px solid ${C.ink}` }} />
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const t28 = w(["28"], 1, 1.2), tSpeed = w(["speed"], 1, 2.4);
  const shift = t * 150;
  return (
    <>
      <HookText y={260} size={90}>{"Knots in 28 s\n= **your speed**"}</HookText>
      <Riser to={tSpeed} volume={0.45} />
      <Sea y={800} />
      <Board x={120} y={790} />
      <Line x0={120} x1={800} y={740} shift={shift} />
      <At x={880} y={700}><Icon name="Ship" size={190} color={C.ink} /></At>
      <At x={300} y={1000}><Icon name="Hourglass" size={120} color={C.mint} /></At>
      <Punch at={tSpeed}><At x={650} y={1000}><Big size={120} color={C.amber}>7 knots</Big></At></Punch>
      <Sfx name="pack/kaching" at={tSpeed} volume={0.3} />
      <Sfx name="pack/whoosh-soft" at={t28} volume={0.2} />
    </>
  );
};

// ---------------------------------------------------------------- no GPS
const RuleoutBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tGps = w(["GPS"], 1, 0.4), tLand = w(["land"], 1, 1.2), tRope = w(["rope"], 1, 2.4);
  const strike = (t0: number) => tween(t, t0 + 0.1, t0 + 0.4, 0, 1);
  const Crossed: React.FC<{ name: string; t0: number; x: number }> = ({ name, t0, x }) => (
    <At x={x} y={520}><Appear at={t0 - 0.3} from="pop">
      <div style={{ position: "relative" }}>
        <Icon name={name} size={170} color={C.coral} />
        <div style={{ position: "absolute", left: -20, top: "50%", height: 10, width: `${strike(t0) * 125}%`, background: C.ink, borderRadius: 5, transform: "rotate(-30deg)" }} />
      </div>
    </Appear></At>
  );
  return (
    <>
      <Headline>No GPS. No land.</Headline>
      <Crossed name="Satellite" t0={tGps} x={340} />
      <Crossed name="MountainSnow" t0={tLand} x={740} />
      <At x={540} y={860}><Appear at={tRope - 0.4} from="slam"><Text size={88} color={C.amber} glow>the rope does the math</Text></Appear></At>
      <Sfx name="pack/wrong" at={tGps + 0.1} volume={0.2} />
    </>
  );
};

// ---------------------------------------------------------------- where are you?
const ContextBody: React.FC = () => {
  const w = useW();
  const t400 = w(["400"], 1, 1.0), tWhere = w(["Where"], 1, 2.0);
  return (
    <>
      <Headline>400 years ago</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tWhere + 1.2, { zoom: 1.12 }]]}>
        <Sea y={760} />
        <At x={540} y={640}><Appear at={t400 - 0.3} from="drop"><Icon name="Ship" size={170} color={C.ink} /></Appear></At>
        <At x={540} y={950}><Appear at={tWhere - 0.2} from="pop"><Big size={130} color={C.amber}>?</Big></Appear></At>
      </Camera>
      <Sfx name="pack/whoosh-soft" at={t400} volume={0.2} />
    </>
  );
};

// ---------------------------------------------------------------- step 1: throw the board
const ThrowBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tThrow = w(["throw"], 1, 0.6), tGrips = w(["grips"], 1, 2.4), tRope = w(["rope"], 1, 3.6);
  const ship = tween(t, tGrips, tGrips + 3, 560, 860);
  const board = tween(t, tThrow, tThrow + 0.6, 360, 300);
  return (
    <>
      <Headline>Step 1: throw the board</Headline>
      <Sea y={800} />
      <Board x={board} y={790} />
      {t > tThrow && <Line x0={board} x1={ship - 70} y={740} shift={ship - 560} />}
      <At x={ship} y={700}><Icon name="Ship" size={170} color={C.ink} /></At>
      <At x={board} y={930}><Appear at={tGrips - 0.2} from="up"><Chip color={C.mint} size={42}>stays put</Chip></Appear></At>
      <At x={540} y={1080}><Appear at={tRope - 0.2} from="fade" sfx={null}><Text size={48} color={C.muted}>the ship pulls the rope out</Text></Appear></At>
      <Sfx name="pack/whoosh-swing" at={tThrow} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- step 2: count
const CountBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tGlass = w(["sandglass"], 1, 1.4), tCount = w(["count"], 1, 2.4), t7 = w(["7"], 1, 4.4);
  const shift = tween(t, tCount, t7, 0, 7 * 110);
  return (
    <>
      <Headline>Step 2: 28 seconds, count</Headline>
      <At x={250} y={560}><Appear at={0.05} from="pop"><Icon name="Hourglass" size={170} color={C.mint} /></Appear></At>
      <At x={250} y={720}><Appear at={tGlass} from="fade" sfx={null}><Text size={52} color={C.mint}>28 s</Text></Appear></At>
      <At x={700} y={600}><Appear at={tCount - 0.3} from="pop">
        <Counter from={0} to={7} t0={tCount} t1={t7} size={190} color={C.amber} sfx />
      </Appear></At>
      <Line x0={60} x1={1020} y={920} gap={110} shift={shift} />
      <At x={540} y={1010}><Icon name="Hand" size={90} color={C.ink} /></At>
      <Sfx name="pack/clock" at={tGlass} volume={0.2} dur={Math.max(t7 - tGlass, 1)} />
      <Sfx name="pack/ding" at={t7} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- why the count is the speed
const WhyBody: React.FC = () => {
  const w = useW();
  const t47 = w(["47"], 1, 1.0), tMile = w(["nautical"], 1, 3.2), t28 = w(["28"], 1, 5.0), tSo = w(["So"], 1, 6.4);
  return (
    <>
      <Headline>Why it works</Headline>
      {/* two knots with a dimension */}
      <div style={{ position: "absolute", left: 200, top: 477, width: 680, height: 6, background: C.ink, opacity: 0.8 }} />
      {[260, 820].map((x) => <div key={x} style={{ position: "absolute", left: x - 14, top: 466, width: 28, height: 28, borderRadius: 14, background: C.amber }} />)}
      <At x={540} y={400}><Appear at={t47 - 0.3} from="down"><Text size={66} color={C.amber}>47 ft 3 in</Text></Appear></At>
      <At x={540} y={640}><Appear at={tMile - 0.3} from="up"><Text size={56}>1 nautical mile an hour</Text></Appear></At>
      <At x={540} y={730}><Appear at={t28 - 0.3} from="up"><Text size={56} color={C.mint}>× 28 seconds = 47 ft 3 in</Text></Appear></At>
      <Punch at={tSo + 0.6}><At x={540} y={940}><Appear at={tSo} from="slam"><Big size={92} color={C.amber}>7 knots = 7 mi/h</Big></Appear></At></Punch>
      <At x={540} y={1050}><Appear at={tSo + 0.6} from="fade" sfx={null}><Text size={42} color={C.muted}>nautical miles</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const w = useW();
  const tPos = w(["position"], 1, 1.0);
  return (
    <>
      <Headline color={C.amber}>Speed isn't position</Headline>
      <At x={380} y={700}><Appear at={0.05} from="left"><Chip color={C.mint} size={60}>7 knots ✓</Chip></Appear></At>
      <At x={760} y={700}><Appear at={tPos - 0.2} from="slam"><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Icon name="MapPin" size={120} color={C.coral} /><Big size={110} color={C.coral}>?</Big></div></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- step 3: dead reckoning on a chart
const FIX: [number, number] = [840, 620];
const MILE = 22; // px per mile on the chart
const Chart: React.FC<{ hours: number; t0s: number[] }> = ({ hours, t0s }) => (
  <>
    <div style={{ position: "absolute", left: 90, top: 400, width: 840, height: 560, borderRadius: 30, border: `3px solid ${C.dim}`, background: `${C.panel}aa` }} />
    <At x={FIX[0]} y={FIX[1]}><div style={{ width: 34, height: 34, borderRadius: 17, background: C.mint, boxShadow: `0 0 18px ${C.mint}` }} /></At>
    <At x={FIX[0]} y={FIX[1] + 60}><Text size={40} color={C.mint}>last fix</Text></At>
    {Array.from({ length: hours }, (_, h) => (
      <Arrow key={h} x1={FIX[0] - h * 7 * MILE} y1={FIX[1]} x2={FIX[0] - (h + 1) * 7 * MILE} y2={FIX[1]} t0={t0s[h]} t1={t0s[h] + 0.4} bend={0} color={C.amber} width={9} />
    ))}
  </>
);
const ReckonBody: React.FC = () => {
  const w = useW();
  const tLog = w(["log"], 1, 1.0), tWest = w(["west"], 1, 2.6), t4 = w(["4"], 1, 3.4), t28 = w(["28"], 1, 4.6);
  const step = (t4 + 0.2 - tWest) / 4;
  const t0s = [0, 1, 2, 3].map((i) => tWest + i * Math.max(step, 0.25));
  return (
    <>
      <Headline>Step 3: log every hour</Headline>
      <Chart hours={4} t0s={t0s} />
      <At x={540} y={500}><Appear at={tLog - 0.2} from="down"><Text size={48}>7 knots · west · 4 hours</Text></Appear></At>
      <At x={FIX[0] - 28 * MILE} y={FIX[1] + 110}><Appear at={t28 - 0.3} from="pop"><Chip color={C.amber} size={52}>28 miles west</Chip></Appear></At>
      <At x={FIX[0] - 28 * MILE} y={FIX[1]}><Appear at={t28 - 0.2} from="pop" sfx={null}><Icon name="MapPin" size={90} color={C.amber} /></Appear></At>
      {t0s.map((tt, i) => <Sfx key={i} name="pack/pop" at={tt + 0.3} volume={0.2} />)}
    </>
  );
};

// ---------------------------------------------------------------- drift
const DriftBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tCurrent = w(["current"], 1, 1.0), t24 = w(["24"], 1, 3.4);
  const off = tween(t, tCurrent, t24, 0, 1);
  const est: [number, number] = [FIX[0] - 28 * MILE, FIX[1]];
  return (
    <>
      <Headline color={C.coral}>A current you can't see</Headline>
      <Chart hours={4} t0s={[-10, -10, -10, -10]} />
      <At x={est[0]} y={est[1]}><Icon name="MapPin" size={80} color={C.amber} /></At>
      {/* where you really are: dragged south */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        <path d={`M${FIX[0]},${FIX[1]} Q${(FIX[0] + est[0]) / 2},${FIX[1] + 40 * off} ${est[0]},${est[1] + 260 * off}`} fill="none" stroke={C.coral} strokeWidth={7} strokeDasharray="18 14" />
      </svg>
      <At x={est[0]} y={est[1] + 260 * off}><Appear at={tCurrent} from="pop"><Icon name="Ship" size={80} color={C.coral} /></Appear></At>
      <At x={est[0] + 240} y={est[1] + 160}><Appear at={t24 - 0.3} from="slam"><Chip color={C.coral} size={52}>24 miles off a day</Chip></Appear></At>
      <Sfx name="pack/wrong" at={t24} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const tShips = w(["ships"], 1, 1.4), tPlanes = w(["planes"], 1, 1.9), tKnots = w(["knots"], 1, 3.2);
  return (
    <>
      <At x={360} y={520}><Appear at={tShips - 0.3} from="left"><Icon name="Ship" size={170} color={C.ink} /></Appear></At>
      <At x={720} y={520}><Appear at={tPlanes - 0.3} from="right"><Icon name="Plane" size={170} color={C.ink} /></Appear></At>
      <Punch at={tKnots}><At x={540} y={820}><Appear at={tKnots - 0.3} from="slam"><Big size={150} color={C.amber}>knots</Big></Appear></At></Punch>
      <Line x0={140} x1={940} y={1020} gap={110} />
      <Sfx name="pack/hit-grand" at={tKnots} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tSlang = w(["slang"], 1, 2.0);
  return (
    <>
      <At x={540} y={600}><Appear at={0.1} from="up"><Text size={70}>1 knot on the rope per 28 s</Text></Appear></At>
      <At x={540} y={720}><Appear at={0.5} from="up" sfx={null}><Text size={56} color={C.mint}>= 1 nautical mile an hour</Text></Appear></At>
      <At x={540} y={900}><Appear at={tSlang - 0.4} from="fade" sfx={null}><Text size={46} color={C.muted}>not sailor slang</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="throw"><ThrowBody /></Span>
    <Span from="count"><CountBody /></Span>
    <Span from="why"><WhyBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="reckon"><ReckonBody /></Span>
    <Span from="drift"><DriftBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
