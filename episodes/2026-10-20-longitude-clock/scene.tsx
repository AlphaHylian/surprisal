// "How a clock tells your ship where it is": longitude by clock, Harrison's H4, how-to format.
// claim hook (1 minute wrong = 28 km off) -> rule out the compass -> noon by the sun -> a clock on home time
// says 3 pm -> 15 degrees an hour: 45 degrees west -> re-hook: a rolling ship for months -> a minute =
// a quarter degree = 28 km; the prize: half a degree = 2 minutes -> H4: 81 days, 5 seconds, 24x -> CTA (9 pm?).
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- a clock face
const ClockFace: React.FC<{ h: number; m?: number; size?: number; ring?: string; label?: string }> = ({ h, m = 0, size = 300, ring = C.ink, label }) => {
  const hourA = ((h % 12) * 30 + m * 0.5) * Math.PI / 180;
  const minA = m * 6 * Math.PI / 180;
  const r = 50;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="-60 -60 120 120" style={{ filter: "drop-shadow(0 12px 24px #0009)" }}>
        <circle r={r} fill={C.panel} stroke={ring} strokeWidth={5} />
        {[...Array(12)].map((_, i) => {
          const a = i * 30 * Math.PI / 180;
          return <line key={i} x1={Math.sin(a) * 42} y1={-Math.cos(a) * 42} x2={Math.sin(a) * 47} y2={-Math.cos(a) * 47} stroke={C.muted} strokeWidth={i % 3 ? 1.5 : 3} />;
        })}
        <line x1={0} y1={0} x2={Math.sin(hourA) * 26} y2={-Math.cos(hourA) * 26} stroke={C.ink} strokeWidth={5} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.sin(minA) * 38} y2={-Math.cos(minA) * 38} stroke={ring} strokeWidth={3} strokeLinecap="round" />
        <circle r={4} fill={ring} />
      </svg>
      {label ? <Text size={48} color={ring}>{label}</Text> : null}
    </div>
  );
};

// ---------------------------------------------------------------- Earth seen from above the pole, 24 one-hour slices
const Globe: React.FC<{ lit: number; size?: number }> = ({ lit, size = 560 }) => {
  const R = 100;
  const slice = (k: number) => {
    const a0 = (-90 - k * 15) * Math.PI / 180, a1 = (-90 - (k + 1) * 15) * Math.PI / 180;
    return `M0 0 L${R * Math.cos(a0)} ${R * Math.sin(a0)} A${R} ${R} 0 0 0 ${R * Math.cos(a1)} ${R * Math.sin(a1)} Z`;
  };
  return (
    <svg width={size} height={size} viewBox="-120 -120 240 240" style={{ overflow: "visible" }}>
      <circle r={R} fill="#1B3A5C" stroke={C.muted} strokeWidth={2} />
      {[...Array(24)].map((_, k) => (
        <path key={k} d={slice(k)} fill={k < lit ? `${C.amber}cc` : "none"} stroke={`${C.ink}44`} strokeWidth={0.8} />
      ))}
      <circle r={5} fill={C.ink} />
      <line x1={0} y1={0} x2={0} y2={-R - 10} stroke={C.mint} strokeWidth={3} />
      <text x={0} y={-R - 16} textAnchor="middle" fontSize={14} fontFamily="Space Grotesk Bold" fill={C.mint}>home</text>
    </svg>
  );
};

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t28 = at.word("28", 1, 1.9);
  const gap = tween(t, 0, t28, 120, 260);
  return (
    <>
      <HookText>{"**1 minute** wrong =\nship **28 km** off"}</HookText>
      <Riser to={t28} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06, y: 760 }]]}>
        <At x={540} y={680}><ClockFace h={12} m={Math.min(1, t / Math.max(0.5, t28)) * 1} size={260} ring={C.amber} /></At>
        {/* the sea, where you think you are, and where you really are */}
        <At x={540} y={960}><div style={{ width: 900, height: 6, borderRadius: 3, background: "#2E5A86" }} /></At>
        <At x={540 - gap / 2 - 20} y={890}><Icon name="Ship" size={120} color={C.muted} /></At>
        <At x={540 + gap / 2 + 20} y={890}><Icon name="Ship" size={120} color={C.amber} /></At>
        <At x={540 - gap / 2 - 20} y={1020}><Text size={40} color={C.muted}>real</Text></At>
        <At x={540 + gap / 2 + 20} y={1020}><Text size={40} color={C.amber}>you think</Text></At>
        <Punch at={t28}><At x={540} y={1100}><Chip size={56} color={C.coral} text={C.bg}>28 km</Chip></At></Punch>
      </Camera>
      <Sfx name="pack/clock" at={0} volume={0.2} dur={1.2} />
      <Sfx name="pack/pop" at={t28} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out the compass
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tNorth = at.word("north.", 1, 1.0);
  const tEast = at.word("east", 1, 2.8);
  const spin = Math.sin(t * 9) * tween(t, tEast - 0.2, tEast + 0.2, 0, 25);
  return (
    <>
      <At x={540} y={620}><Appear at={0.02} from="pop">
        <div style={{ transform: `rotate(${spin}deg)` }}><Icon name="Compass" size={340} color={C.ink} /></div>
      </Appear></At>
      <At x={540} y={360}><Appear at={tNorth - 0.3} from="down"><Chip size={60} color={C.mint}>N ✓</Chip></Appear></At>
      <At x={540} y={950}><Appear at={tEast - 0.2} from="slam"><Text size={80} color={C.coral}>how far east?</Text></Appear></At>
      <Sfx name="pack/wrong" at={tEast} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 3. noon by the sun
const NoonBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tPeak = at.word("peak.", 1, 1.4);
  const tNoon = at.word("noon,", 1, 2.4);
  const p = tween(t, 0, tPeak, 0.15, 0.5);
  const sx = 540 - 380 * Math.cos(Math.PI * p);
  const sy = 1000 - 560 * Math.sin(Math.PI * p);
  return (
    <>
      <Headline out={at.dur - 0.3}>Step 1: noon, here</Headline>
      <At x={540} y={1000}><div style={{ width: 860, height: 6, borderRadius: 3, background: "#2E5A86" }} /></At>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M160 1000 A380 560 0 0 1 920 1000" fill="none" stroke={`${C.muted}66`} strokeWidth={4} strokeDasharray="10 14" />
      </svg>
      <At x={sx} y={sy}><Icon name="Sun" size={150} color={C.amber} glow /></At>
      <At x={540} y={1100}><Appear at={tNoon - 0.15} from="slam"><Chip size={64} color={C.amber}>12:00 here</Chip></Appear></At>
      <At x={540} y={960}><Icon name="Ship" size={90} color={C.ink} /></At>
      <Sfx name="pack/ding" at={tNoon} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 4. the home clock
const HomeBody: React.FC = () => {
  const at = useAt();
  const tHome = at.word("home", 1, 1.6);
  const t3 = at.word("3", 1, 3.4);
  return (
    <>
      <Headline out={at.dur - 0.3}>Step 2: check home time</Headline>
      <At x={290} y={680}><Appear at={0.05} from="left"><ClockFace h={12} size={300} ring={C.ink} label="here: noon" /></Appear></At>
      <At x={790} y={680}><Appear at={tHome - 0.2} from="right"><ClockFace h={3} size={300} ring={C.mint} label="home: 3 pm" /></Appear></At>
      <Punch at={t3}><At x={540} y={1050}><Appear at={t3 - 0.1} from="slam"><Chip size={64} color={C.mint}>3 hours apart</Chip></Appear></At></Punch>
      <Sfx name="pack/click-mech" at={tHome} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 5. 15 degrees an hour
const TurnBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t15 = at.word("15", 1, 1.0);
  const t45 = at.word("45", 1, 4.0);
  const lit = t < t15 ? 0 : t < t45 - 1.2 ? 1 : Math.min(3, 1 + Math.floor((t - (t45 - 1.2)) / 0.4) + 1);
  return (
    <>
      <Headline out={at.dur - 0.3}>Step 3: turn hours into degrees</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t45, { zoom: 1.1, x: 460, y: 620 }]]}>
        <At x={540} y={760}><Appear at={0.02} from="pop"><Globe lit={lit} size={520} /></Appear></At>
      </Camera>
      <At x={540} y={370}><Appear at={t15 - 0.1} out={t45 - 0.3} from="up"><Text size={60} color={C.amber}>1 hour = 15°</Text></Appear></At>
      <Punch at={t45}><At x={540} y={1110}><Appear at={t45 - 0.15} from="slam"><Chip size={68} color={C.amber}>3 h = 45° west</Chip></Appear></At></Punch>
      <Sfx name="pack/gears" at={t15} volume={0.25} dur={1.0} />
      <Sfx name="pack/correct" at={t45} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 6-7. re-hook, drift, the prize
const DriftBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tShip = at.word("rolling", 1, 1.6);
  const tD = at.beat("drift");
  const tQuarter = at.word("quarter", 1, tD + 1.5);
  const t28 = at.word("28", 1, tD + 3.0);
  const tBrit = at.word("Britain", 1, tD + 4.6);
  const tHalf = at.word("half", 1, tD + 7.0);
  const t2 = at.word("2", 1, tD + 8.4);
  const roll = Math.sin(t * 3.2) * 12;
  return (
    <>
      <Headline out={tD - 0.3} color={C.coral}>Months at sea</Headline>
      {t < tD - 0.2 ? (
        <>
          <At x={540} y={650}>
            <div style={{ transform: `rotate(${roll}deg)`, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <ClockFace h={3} m={Math.floor(t * 4) % 60} size={200} ring={C.coral} />
              <Icon name="Ship" size={300} color={C.ink} />
            </div>
          </At>
          <At x={540} y={1100}><Sea /></At>
          <Sfx name="pack/wind-spooky" at={tShip - 0.5} volume={0.2} dur={2.0} />
        </>
      ) : (
        <>
          <At x={540} y={420}><Appear at={tD} from="up"><Text size={64} font={F.mono}>1 min of drift</Text></Appear></At>
          <At x={540} y={540}><Appear at={tQuarter - 0.1} from="pop"><Text size={64} font={F.mono} color={C.mint}>= ¼ degree</Text></Appear></At>
          <Punch at={t28}><At x={540} y={680}><Appear at={t28 - 0.1} from="slam"><Chip size={70} color={C.coral}>= 28 km</Chip></Appear></At></Punch>
          <At x={540} y={880}><Appear at={tBrit - 0.2} from="up">
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Icon name="Trophy" size={100} color={C.amber} />
              <Counter from={0} to={20000} t0={tBrit} t1={tBrit + 1.0} size={90} color={C.amber} prefix="£" />
            </div>
          </Appear></At>
          <At x={540} y={1060}><Appear at={Math.min(tHalf, t2) - 0.3} from="up"><Text size={60}>½° = <span style={{ color: C.amber }}>2 minutes</span></Text></Appear></At>
          <Sfx name="pack/kaching" at={tBrit + 0.4} volume={0.35} />
        </>
      )}
    </>
  );
};
const Sea: React.FC = () => <div style={{ width: 860, height: 6, borderRadius: 3, background: "#2E5A86" }} />;

// ---------------------------------------------------------------- 8. payoff: H4
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tWatch = at.word("watch", 1, 1.0);
  const t81 = at.word("81", 1, 2.6);
  const t5 = at.word("5", 1, 4.4);
  const t24 = at.word("24", 1, 5.8);
  return (
    <>
      <Headline out={at.dur - 0.3}>Harrison's sea watch</Headline>
      <At x={540} y={560}><Appear at={tWatch - 0.3} from="pop"><Icon name="Watch" size={300} color={C.amber} glow /></Appear></At>
      <At x={290} y={850}><Appear at={t81 - 0.2} from="left">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Counter from={0} to={81} t0={t81 - 0.2} t1={t81 + 0.5} size={100} />
          <Text size={46} color={C.muted}>days at sea</Text>
        </div>
      </Appear></At>
      <At x={790} y={850}><Appear at={t5 - 0.2} from="right">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Text size={100} color={C.mint}>5 s</Text>
          <Text size={46} color={C.muted}>off</Text>
        </div>
      </Appear></At>
      <Punch at={t24}><At x={540} y={1020}><Appear at={t24 - 0.15} from="slam"><Stamp size={70} color={C.amber} rotate={-6}>24× BETTER</Stamp></Appear></At></Punch>
      <Sfx name="pack/boom-short" hit={t24} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 9. CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const t9 = at.word("9", 1, 1.6);
  const tHow = at.word("How", 1, 2.6);
  return (
    <>
      <At x={290} y={640}><ClockFace h={12} size={280} ring={C.ink} label="your noon" /></At>
      <At x={790} y={640}><Appear at={t9 - 0.2} from="pop"><ClockFace h={9} size={280} ring={C.mint} label="home: 9 pm" /></Appear></At>
      <At x={540} y={1000}><Appear at={tHow - 0.1} from="slam"><Text size={90} color={C.amber} glow>? ° west</Text></Appear></At>
      <Sfx name="pack/whoosh-tiny" at={t9 - 0.2} volume={0.3} />
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="noon"><NoonBody /></Span>
    <Span from="home"><HomeBody /></Span>
    <Span from="turn"><TurnBody /></Span>
    <Span from="rehook" to="drift"><DriftBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
