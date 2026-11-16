// "How to tell how far away lightning is": flash-to-bang.
// versus hook (flash 3 microseconds vs thunder 3 s per km) -> no radar, the gap is a ruler -> light vs sound speeds
// -> count 15 -> divide by 3 = 5 km -> rumble: near end 6 s, far end 15 s -> re-hook: when? -> count 12 two minutes later
// -> 8 minutes -> payoff -> CTA: 21 seconds? (7 km)
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Text, tween, useAt, useT } from "../kit";

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

// a lightning bolt (zigzag polyline) with an optional flash
const BOLT = "0,0 -40,90 20,110 -50,230 10,250 -60,380";
const Bolt: React.FC<{ x: number; y: number; scale?: number; flashAt?: number; color?: string }> = ({ x, y, scale = 1, flashAt = -10, color = C.amber }) => {
  const t = useT();
  const fl = t >= flashAt ? Math.exp(-(t - flashAt) * 5) : 0;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>
      <g transform={`translate(${x},${y}) scale(${scale})`}>
        <polyline points={BOLT} fill="none" stroke={color} strokeWidth={14 / scale} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 ${18 + 50 * fl}px ${color})` }} />
      </g>
    </svg>
  );
};
// a horizontal track from bolt (left) to you (right) with a marker moving along it
const Track: React.FC<{ y: number; p: number; color: string; label: string; x0?: number; x1?: number }> = ({ y, p, color, label, x0 = 230, x1 = 830 }) => (
  <>
    <div style={{ position: "absolute", left: x0, top: y - 3, width: x1 - x0, height: 6, background: C.dim, borderRadius: 3 }} />
    <div style={{ position: "absolute", left: x0, top: y - 3, width: (x1 - x0) * p, height: 6, background: color, borderRadius: 3, boxShadow: `0 0 14px ${color}` }} />
    <At x={x0 + (x1 - x0) * p} y={y}><div style={{ width: 34, height: 34, borderRadius: 17, background: color, boxShadow: `0 0 20px ${color}` }} /></At>
    <At x={x0 - 90} y={y}><Text size={42} color={color}>{label}</Text></At>
  </>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tThunder = w(["Thunder"], 1, 1.3), tSame = Math.max(tThunder + 0.9, 2.2);
  const pSound = tween(t, 0, Math.max(tSame, 2.0), 0.05, 1);
  return (
    <>
      <HookText y={300} size={92}>{"Flash: **0.000003 s**\nThunder: **3 s**"}</HookText>
      <Riser to={tThunder} volume={0.45} />
      <Bolt x={150} y={600} scale={1.0} flashAt={0} />
      <Track y={760} p={1} color={C.amber} label="" />
      <Track y={900} p={pSound} color={C.mint} label="" />
      <At x={540} y={710}><Text size={42} color={C.amber}>light: done</Text></At>
      <At x={540} y={850}><Text size={42} color={C.mint}>sound: still going</Text></At>
      <At x={930} y={830}><Icon name="PersonStanding" size={130} color={C.ink} /></At>
      <At x={540} y={1060}><Appear at={tSame - 0.2} from="pop"><Chip color={C.ink} size={50}>same 1 km</Chip></Appear></At>
      <Sfx name="pack/flash" at={0} volume={0.35} />
      <Sfx name="pack/boom-deep" at={tSame} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- the gap is a ruler
const RuleoutBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tRadar = w(["radar"], 1, 1.2), tRuler = w(["ruler"], 1, 2.8);
  const strike = tween(t, tRadar + 0.2, tRadar + 0.5, 0, 1);
  return (
    <>
      <Headline>No radar needed</Headline>
      <At x={540} y={560}><Appear at={0.05} from="pop">
        <div style={{ position: "relative" }}>
          <Icon name="Radar" size={190} color={C.coral} />
          <div style={{ position: "absolute", left: -20, top: "50%", height: 10, width: `${strike * 120}%`, background: C.ink, borderRadius: 5, transform: "rotate(-30deg)" }} />
        </div>
      </Appear></At>
      <At x={540} y={880}><Appear at={tRuler - 0.4} from="slam">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Icon name="Ruler" size={120} color={C.amber} />
          <Text size={88} color={C.amber} glow>the gap is a ruler</Text>
        </div>
      </Appear></At>
      <Sfx name="pack/wrong" at={tRadar + 0.2} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- light vs sound
const ContextBody: React.FC = () => {
  const w = useW();
  const tLight = w(["300,000"], 1, 1.0), tSound = w(["343"], 1, 3.6);
  return (
    <>
      <Headline>Two speeds</Headline>
      <At x={540} y={520}><Appear at={tLight - 0.3} from="left">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}><Icon name="Zap" size={110} color={C.amber} /><Big size={84} color={C.amber}>300,000 km/s</Big></div>
      </Appear></At>
      <At x={540} y={760}><Appear at={tSound - 0.3} from="left">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}><Icon name="Volume2" size={110} color={C.mint} /><Big size={84} color={C.mint}>0.343 km/s</Big></div>
      </Appear></At>
      <At x={540} y={960}><Appear at={tSound + 0.5} from="fade" sfx={null}><Text size={48} color={C.muted}>sound: about 3 seconds per km</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- step 1: count
const CountBody: React.FC = () => {
  const w = useW();
  const tFlash = w(["flashes"], 1, 1.0), tCount = w(["Count"], 1, 1.8), t15 = w(["15"], 1, 4.6);
  return (
    <>
      <Headline>Step 1: count</Headline>
      <Bolt x={300} y={420} scale={1.0} flashAt={tFlash} />
      <At x={680} y={700}><Appear at={tCount - 0.2} from="pop">
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Icon name="Timer" size={130} color={C.ink} />
          <Counter from={0} to={15} t0={tCount} t1={t15} size={180} color={C.amber} suffix=" s" />
        </div>
      </Appear></At>
      <At x={540} y={1020}><Appear at={t15} from="slam"><Icon name="Volume2" size={120} color={C.mint} /></Appear></At>
      <Sfx name="pack/flash-2" at={tFlash} volume={0.35} />
      <Sfx name="pack/boom-short" at={t15} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- step 2: divide
const DivideBody: React.FC = () => {
  const w = useW();
  const t3 = w(["3"], 1, 1.4), t5k = w(["5"], 1, 2.8), tMiles = w(["miles"], 1, 4.4);
  return (
    <>
      <Headline>Step 2: divide by 3</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t5k - 0.2, { zoom: 1 }], [t5k + 0.5, { zoom: 1.1, x: 540, y: 640 }], [tMiles, { zoom: 1 }]]}>
        <At x={540} y={560}><Appear at={t3 - 0.3} from="up"><Big size={120}>15 ÷ 3 = </Big></Appear></At>
        <Punch at={t5k}><At x={540} y={720}><Appear at={t5k - 0.2} from="slam"><Big size={150} color={C.amber}>5 km</Big></Appear></At></Punch>
      </Camera>
      <At x={540} y={960}><Appear at={tMiles - 0.2} from="up"><Chip color={C.mint} size={54}>miles: ÷ 5 → 3 miles</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- rumble
const RumbleBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tLong = w(["long"], 1, 2.0), tNear = w(["near"], 1, 3.4), tFar = w(["far"], 1, 4.6), t6 = w(["6"], 1, 6.4), t15 = w(["15"], 1, 8.2);
  // bolt seen from the side: a channel from 2 km to 5 km away (x: 0 km at 900, 1 km = 130 px)
  const X = (km: number) => 940 - km * 130;
  const wave = tween(t, t6 - 0.3, t15, 0, 1);
  return (
    <>
      <Headline>Why it rumbles</Headline>
      <At x={X(0)} y={760}><Icon name="PersonStanding" size={120} color={C.ink} /></At>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <polyline points={`${X(5)},470 ${X(4.4)},560 ${X(3.7)},520 ${X(3.0)},610 ${X(2)},660`} fill="none" stroke={C.amber} strokeWidth={12}
          strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 20px ${C.amber})`, opacity: tween(t, tLong - 0.4, tLong, 0, 1) }} />
      </svg>
      <At x={X(2)} y={600}><Appear at={tNear - 0.2} from="pop"><Chip color={C.mint} size={44}>2 km</Chip></Appear></At>
      <At x={X(5)} y={410}><Appear at={tFar - 0.2} from="pop"><Chip color={C.coral} size={44}>5 km</Chip></Appear></At>
      {/* timeline: 0..15 s */}
      <div style={{ position: "absolute", left: 140, top: 950, width: 800, height: 8, background: C.dim, borderRadius: 4 }} />
      <div style={{ position: "absolute", left: 140 + 800 * 6 / 15, top: 935, width: 800 * 9 / 15 * wave, height: 38, background: C.amber, borderRadius: 10, opacity: 0.85 }} />
      <At x={140 + 800 * 6 / 15} y={1030}><Appear at={t6 - 0.2} from="up"><Text size={48} color={C.mint}>6 s</Text></Appear></At>
      <At x={940} y={1030}><Appear at={t15 - 0.2} from="up"><Text size={48} color={C.coral}>15 s</Text></Appear></At>
      <At x={140} y={1030}><Text size={40} color={C.muted}>flash</Text></At>
      <Sfx name="pack/boom-trailer" at={t6} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const w = useW();
  const tWhere = w(["where"], 1, 0.8), tWhen = w(["when"], 1, 2.4);
  return (
    <>
      <Headline color={C.amber}>Where, then when</Headline>
      <At x={540} y={580}><Appear at={tWhere - 0.2} from="left"><Chip color={C.mint} size={60}>where: 5 km ✓</Chip></Appear></At>
      <At x={540} y={820}><Appear at={tWhen - 0.2} from="slam">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}><Icon name="Clock" size={130} color={C.amber} /><Text size={96} color={C.amber} glow>when?</Text></div>
      </Appear></At>
      <Sfx name="pack/clock" at={tWhen} volume={0.3} dur={1.2} />
    </>
  );
};

// ---------------------------------------------------------------- step 3: count again
const AgainBody: React.FC = () => {
  const w = useW();
  const tTwo = w(["two"], 1, 1.4), t12 = w(["12"], 1, 2.6), t4 = w(["4"], 1, 4.0), tMoved = w(["moved"], 1, 5.4);
  const X = (km: number) => 920 - km * 130;
  const t = useT();
  const pos = tween(t, tMoved - 0.2, tMoved + 0.8, 5, 4);
  return (
    <>
      <Headline>Step 3: count again</Headline>
      <At x={540} y={430}><Appear at={tTwo - 0.2} from="up"><Chip color={C.ink} size={48}>2 minutes later</Chip></Appear></At>
      <At x={540} y={600}><Appear at={t12 - 0.3} from="pop"><Big size={100}>12 s ÷ 3 = <span style={{ color: C.amber }}>4 km</span></Big></Appear></At>
      {/* distance line: storm moving toward you */}
      <div style={{ position: "absolute", left: X(6), top: 880, width: X(0) - X(6), height: 6, background: C.dim, borderRadius: 3 }} />
      {[0, 1, 2, 3, 4, 5].map((k) => <At key={k} x={X(k)} y={930}><Text size={36} color={C.muted}>{k}</Text></At>)}
      <At x={X(pos)} y={810}><Icon name="CloudLightning" size={120} color={C.amber} /></At>
      <At x={X(0)} y={810}><Icon name="PersonStanding" size={110} color={C.ink} /></At>
      <At x={540} y={1060}><Appear at={tMoved} from="fade" sfx={null}><Text size={48} color={C.mint}>1 km in 2 minutes</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- eta
const EtaBody: React.FC = () => {
  const w = useW();
  const t8 = w(["8"], 1, 3.4);
  return (
    <>
      <Headline>4 km left</Headline>
      <At x={540} y={560}><Appear at={0.1} from="up"><Big size={84}>4 km × 2 min per km</Big></Appear></At>
      <Punch at={t8}><At x={540} y={820}><Appear at={t8 - 0.3} from="slam">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}><Icon name="Clock" size={130} color={C.amber} /><Big size={150} color={C.amber}>≈ 8 min</Big></div>
      </Appear></At></Punch>
      <At x={540} y={1030}><Appear at={t8 + 0.4} from="fade" sfx={null}><Text size={46} color={C.muted}>if it keeps coming your way</Text></Appear></At>
      <Sfx name="pack/hit-grand" at={t8} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const tCounts = w(["counts"], 1, 0.6), tDiv = w(["division"], 1, 1.6), tWhere = w(["where"], 1, 3.0), tWhen = w(["when"], 1, 4.2);
  return (
    <>
      <At x={540} y={440}><Appear at={tCounts - 0.2} from="up"><Big size={80}>2 counts + 1 division</Big></Appear></At>
      <At x={540} y={680}><Appear at={tWhere - 0.2} from="pop"><Chip color={C.mint} size={60}>where it is</Chip></Appear></At>
      <At x={540} y={860}><Appear at={tWhen - 0.2} from="pop"><Chip color={C.amber} size={60}>when it arrives</Chip></Appear></At>
      <Sfx name="pack/correct" at={tDiv} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const t21 = w(["21"], 1, 1.6), tHow = w(["How"], 1, 2.4);
  return (
    <>
      <Bolt x={320} y={420} scale={0.8} flashAt={0.05} />
      <At x={680} y={640}><Appear at={t21 - 0.3} from="pop"><Big size={160} color={C.ink}>21 s</Big></Appear></At>
      <At x={540} y={900}><Appear at={tHow - 0.2} from="pop"><Big size={120} color={C.amber}>? km</Big></Appear></At>
      <Sfx name="pack/flash" at={0.05} volume={0.3} />
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="count"><CountBody /></Span>
    <Span from="divide"><DivideBody /></Span>
    <Span from="rumble"><RumbleBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="again"><AgainBody /></Span>
    <Span from="eta"><EtaBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
