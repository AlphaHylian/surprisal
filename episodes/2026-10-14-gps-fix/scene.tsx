// "How your phone finds you from 20,000 km up". Question hook (how does your phone find you from space?)
// -> rule out "the phone talks to them" (receive-only) -> each satellite: where + when -> one signal, 67 ms,
// a sphere -> two spheres: a circle -> three: two points, one in space -> re-hook: cheap clock, 1 us = 300 m
// -> a fourth: 4 unknowns (x, y, z, clock) -> borrowed atomic clocks, ~5 m -> Einstein: +38 us/day = 11 km
// -> payoff: it knows when, works out where -> CTA: a ship, height known: how many satellites? (3)
import React from "react";
import {
  Appear, At, C, Camera, Card, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

const SATS: [number, number][] = [[170, 700], [400, 610], [680, 630], [910, 720]];
const PHONE: [number, number] = [540, 1010];

/** The Earth's edge at the bottom of the frame. */
const EarthArc: React.FC = () => (
  <div style={{ position: "absolute", left: -560, top: 1060, width: 2200, height: 2200, borderRadius: "50%",
    background: `radial-gradient(circle at 50% 8%, ${C.mint}33, ${C.panel} 40%)`, border: `4px solid ${C.mint}88` }} />
);

/** Expanding signal rings from a satellite. */
const Rings: React.FC<{ x: number; y: number; t0: number; color?: string }> = ({ x, y, t0, color = C.amber }) => {
  const t = useT();
  if (t < t0) return null;
  return (
    <>
      {[0, 0.45, 0.9].map((d, i) => {
        const p = ((t - t0 + d) % 1.35) / 1.35;
        const r = 30 + p * 260;
        return <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%",
          border: `4px solid ${color}`, opacity: (1 - p) * 0.8 }} />;
      })}
    </>
  );
};

const Sat: React.FC<{ size?: number; color?: string }> = ({ size = 120, color = C.ink }) => <Icon name="Satellite" size={size} color={color} stroke={1.6} glow />;
const Phone: React.FC<{ size?: number; color?: string }> = ({ size = 120, color = C.amber }) => <Icon name="Smartphone" size={size} color={color} stroke={1.8} glow />;

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tSpace = at.word("space", 1, 1.8);
  return (
    <>
      <HookText>{"20,000 km up.\nFinds you to **5 meters.**"}</HookText>
      <Riser to={tSpace + 0.2} volume={0.45} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05, x: 540, y: 760 }]]}>
        <EarthArc />
        {SATS.map(([x, y], i) => <React.Fragment key={i}><Rings x={x} y={y} t0={0.05 + i * 0.12} /><At x={x} y={y}><Sat /></At></React.Fragment>)}
        <At x={PHONE[0]} y={PHONE[1]}><Phone size={130} /></At>
        <At x={PHONE[0]} y={PHONE[1] - 110}><Appear at={tSpace - 0.2} from="drop"><Icon name="MapPin" size={80} color={C.coral} stroke={2.2} glow /></Appear></At>
      </Camera>
      <Sfx name="pack/popup" at={tSpace - 0.1} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out + context
const ShoutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tNever = at.word("never", 1, 0.4);
  const tShout = at.word("shout", 1, 3.6);
  const tCtx = at.beat("context");
  const t20 = at.word("20,000", 1, tCtx + 0.8);
  const tWhere = at.word("where", 1, tCtx + 2.6);
  const tWhen = at.word("when", 1, tCtx + 4.0);
  return (
    <>
      <Headline out={tCtx - 0.3}>It never talks back</Headline>
      <Headline at={tCtx}>Where I am. When I sent this.</Headline>
      {t < tCtx ? (
        <>
          <At x={540} y={500}><Sat size={170} /></At>
          <At x={540} y={950}><Phone size={170} /></At>
          <At x={540} y={730}><Appear at={tNever} from="pop"><Icon name="ArrowUp" size={120} color={C.coral} stroke={2.4} /></Appear></At>
          <At x={540} y={730}><Appear at={tNever + 0.4} from="slam" sfx="pack/wrong" volume={0.4}><Stamp size={90}>NOTHING</Stamp></Appear></At>
          <At x={540} y={1130}><Appear at={tShout - 0.1} from="up"><Chip size={52}>it just shouts the time</Chip></Appear></At>
          <Rings x={540} y={500} t0={tShout} />
        </>
      ) : (
        <>
          <Rings x={300} y={560} t0={tCtx} />
          <At x={300} y={560}><Sat size={180} /></At>
          <At x={300} y={760}><Appear at={t20 - 0.2} from="up"><Counter from={0} to={20000} t0={t20 - 0.2} t1={t20 + 0.6} size={56} color={C.amber} suffix=" km up" /></Appear></At>
          <At x={720} y={950}>
            <Appear at={tWhere - 0.2} from="right">
              <Card w={560} h={300} border={C.amber}>
                <Text size={44} color={C.muted} font={F.mono}>{"I'm at  15,602 km N…"}</Text>
                <div style={{ height: 20 }} />
                <Text size={44} color={t >= tWhen - 0.1 ? C.amber : C.muted} font={F.mono}>{"sent  12:00:00.000 000"}</Text>
              </Card>
            </Appear>
          </At>
          <Sfx name="pack/hacking" at={tWhere} dur={1.2} volume={0.2} />
          <Sfx name="pack/ding" at={tWhen} volume={0.35} />
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------- 3. one satellite: 67 ms -> a sphere
const OneBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t67 = at.word("67", 1, 1.4);
  const tLight = at.word("light", 1, 3.6);
  const tKm = at.word("20,000", 1, 4.8);
  const tSphere = at.word("sphere", 1, 7.0);
  const py = tween(t, 0.3, t67 + 0.3, 500, 900);
  const r = tween(t, tSphere - 0.6, tSphere + 0.3, 0, 530);
  return (
    <>
      <Headline out={tSphere - 0.8}>One signal: a distance</Headline>
      <Headline at={tSphere - 0.6} color={C.amber}>You're on this sphere</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tSphere - 0.8, { zoom: 1 }], [tSphere + 0.4, { zoom: 1.04, x: 540, y: 700 }]]}>
        <div style={{ position: "absolute", left: 540 - r, top: 430 - r, width: 2 * r, height: 2 * r, borderRadius: "50%",
          border: `5px solid ${C.amber}`, background: `${C.amber}14` }} />
        <At x={540} y={430}><Sat size={150} /></At>
        <div style={{ position: "absolute", left: 535, top: 500, width: 10, height: Math.max(0, py - 500), background: `linear-gradient(${C.amber}00, ${C.amber})` }} />
        <At x={540} y={960}><Phone size={140} /></At>
        <At x={800} y={640}><Appear at={t67 - 0.2} from="pop"><Counter from={0} to={0.067} t0={t67 - 0.2} t1={t67 + 0.4} decimals={3} size={64} color={C.ink} suffix=" s" /></Appear></At>
        <At x={800} y={740}><Appear at={tLight - 0.1} from="up"><Text size={44} color={C.muted}>× speed of light</Text></Appear></At>
        <At x={800} y={830}><Appear at={tKm - 0.2} from="slam" sfx="pack/punch" volume={0.4}><Chip size={58}>20,000 km</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/whoosh-fast" at={0.3} volume={0.3} />
      <Sfx name="pack/warp-slide" at={tSphere - 0.6} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 4-5. two spheres: a circle; three: two points
const CIRC = [
  { x: 370, y: 760, r: 330 },
  { x: 720, y: 740, r: 320 },
  { x: 560, y: 1140, r: 300 },
];
// the two crossings of circles 1 and 2 (computed for these numbers)
const crossings = () => {
  const [a, b] = CIRC;
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
  const l = (a.r ** 2 - b.r ** 2 + d ** 2) / (2 * d), h = Math.sqrt(a.r ** 2 - l ** 2);
  const mx = a.x + (l * dx) / d, my = a.y + (l * dy) / d;
  return [[mx + (h * dy) / d, my - (h * dx) / d], [mx - (h * dy) / d, my + (h * dx) / d]] as [number, number][];
};

const CrossBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSecond = at.word("second", 1, 0.5);
  const tCircle = at.word("circle", 1, 2.0);
  const tThree = at.beat("three");
  const tTwo = at.word("two", 2, tThree + 1.6);
  const tSpace = at.word("space", 1, tThree + 3.2);
  const tYou = at.word("you", 1, tThree + 4.4);
  const [top, bottom] = crossings();
  const third = CIRC[2];
  // make circle 3 pass exactly through the lower crossing
  const r3 = Math.hypot(bottom[0] - third.x, bottom[1] - third.y);
  const ring = (x: number, y: number, r: number, show: number, col: string) => {
    const k = tween(t, show, show + 0.5, 0, 1);
    return <div style={{ position: "absolute", left: x - r * k, top: y - r * k, width: 2 * r * k, height: 2 * r * k, borderRadius: "50%",
      border: `5px solid ${col}`, opacity: k }} />;
  };
  return (
    <>
      <Headline out={tThree - 0.3}>Two spheres: a circle</Headline>
      <Headline at={tThree} color={C.amber}>Three: two points</Headline>
      <Camera keys={[[0, { zoom: 0.8, x: 540, y: 800 }], [tThree, { zoom: 0.8, x: 540, y: 800 }], [tYou, { zoom: 0.88, x: 540, y: 840 }]]}>
        {ring(CIRC[0].x, CIRC[0].y, CIRC[0].r, 0, C.amber)}
        {ring(CIRC[1].x, CIRC[1].y, CIRC[1].r, tSecond - 0.2, C.mint)}
        {t >= tThree ? ring(third.x, third.y, r3, tThree + 0.1, C.ink) : null}
        <At x={CIRC[0].x} y={CIRC[0].y}><Sat size={120} color={C.amber} /></At>
        <At x={CIRC[1].x} y={CIRC[1].y}><Appear at={tSecond - 0.2} from="pop"><Sat size={120} color={C.mint} /></Appear></At>
        <At x={third.x} y={third.y}><Appear at={tThree + 0.1} from="pop"><Sat size={120} /></Appear></At>
        {/* the circle where two spheres meet, seen edge-on: the line between the crossings */}
        <svg width={1080} height={1600} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <line x1={top[0]} y1={top[1]} x2={bottom[0]} y2={bottom[1]} stroke={C.coral} strokeWidth={8} strokeDasharray="18 12"
            opacity={tween(t, tCircle - 0.2, tCircle + 0.3, 0, 1) * (t >= tTwo ? 0.3 : 1)} />
        </svg>
        <At x={top[0]} y={top[1]}><Appear at={tTwo - 0.2} from="pop"><div style={{ width: 44, height: 44, borderRadius: 22, background: t >= tSpace ? C.muted : C.coral }} /></Appear></At>
        <At x={bottom[0]} y={bottom[1]}><Appear at={tTwo} from="pop"><div style={{ width: 44, height: 44, borderRadius: 22, background: t >= tYou - 0.1 ? C.amber : C.coral, boxShadow: t >= tYou - 0.1 ? `0 0 40px ${C.amber}` : "none" }} /></Appear></At>
        <At x={top[0] + 170} y={top[1] - 40}><Appear at={tSpace - 0.1} from="left"><Chip color={C.panel} text={C.muted} size={46}>out in space</Chip></Appear></At>
        <At x={bottom[0] + 130} y={bottom[1] + 10}><Appear at={tYou - 0.1} from="slam" sfx="pack/correct" volume={0.4}><Chip size={54}>you</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/pop" at={tSecond - 0.2} volume={0.3} />
      <Sfx name="pack/pop-2" at={tTwo - 0.2} volume={0.3} />
      <Sfx name="pack/pop-3" at={tTwo} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 6. re-hook: cheap clock
const ClockBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCheap = at.word("cheap", 1, 1.2);
  const tMillionth = at.word("millionth", 1, 2.6);
  const t300 = at.word("300", 1, 5.0);
  const blur = tween(t, t300 - 0.3, t300 + 0.3, 5, 70);
  return (
    <>
      <Headline color={C.coral}>Your clock is cheap</Headline>
      <Shake at={t300}><At x={540} y={600}>
          <div style={{ width: 520, height: 520, borderRadius: "50%", border: `${blur}px solid ${C.coral}55`, boxShadow: `inset 0 0 0 5px ${C.coral}`,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Appear at={tCheap - 0.2} from="pop"><Icon name="Clock" size={180} color={C.ink} stroke={1.6} /></Appear>
          </div>
      </At></Shake>
      <At x={540} y={940}><Appear at={tMillionth - 0.2} from="up"><Text size={64} font={F.mono} color={C.ink}>off by 0.000 001 s</Text></Appear></At>
      <Punch at={t300}>
        <At x={540} y={1080}><Appear at={t300 - 0.15} from="slam" sfx="pack/glitch" volume={0.4}><Chip color={C.coral} size={62}>every distance: 300 m wrong</Chip></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 7. a fourth: four unknowns
const FourBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFourth = at.word("fourth", 1, 0.8);
  const tUnk = at.word("unknowns", 1, 2.4);
  const tThreeW = at.word("three", 1, 3.4);
  const tClock = at.word("clock", 1, 5.6);
  const tSolve = at.word("solve", 1, 7.4);
  const chips: [string, number][] = [["x", tThreeW - 0.1], ["y", tThreeW + 0.1], ["z", tThreeW + 0.3], ["clock", tClock - 0.2]];
  return (
    <>
      <Headline>Listen to a fourth</Headline>
      <At x={540} y={500}>
        <div style={{ display: "flex", gap: 40 }}>
          {[0, 1, 2, 3].map(i => (
            <Appear key={i} at={i < 3 ? 0.05 : tFourth - 0.1} from={i < 3 ? "fade" : "drop"}>
              <Sat size={130} color={i === 3 ? C.amber : C.ink} />
            </Appear>
          ))}
        </div>
      </At>
      <Sfx name="pack/whoosh-fast" hit={tFourth} volume={0.35} />
      <At x={540} y={700}><Appear at={tUnk - 0.2} from="up"><Text size={52} color={C.muted}>4 unknowns</Text></Appear></At>
      <At x={540} y={860}>
        <div style={{ display: "flex", gap: 24 }}>
          {chips.map(([lab, show], i) => (
            <Appear key={i} at={show} from="pop">
              <Chip color={t >= tSolve ? C.mint : i === 3 ? C.coral : C.panel} text={t >= tSolve || i === 3 ? C.bg : C.ink} size={60}>{lab}{t >= tSolve ? " ✓" : " ?"}</Chip>
            </Appear>
          ))}
        </div>
      </At>
      <Sfx name="pack/pop" at={tThreeW} volume={0.3} />
      <Sfx name="pack/pop-2" at={tClock - 0.2} volume={0.3} />
      <At x={540} y={1060}><Appear at={tSolve - 0.2} from="slam" sfx="pack/correct" volume={0.4}><Text size={64} color={C.amber} font={F.bold}>4 signals solve all 4</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 8. effect: borrowed atomic clocks, ~5 m
const EffectBody: React.FC = () => {
  const at = useAt();
  const tAtomic = at.word("atomic", 1, 1.6);
  const t5 = at.word("5", 1, 4.2);
  return (
    <>
      <Headline color={C.mint}>Four atomic clocks, borrowed</Headline>
      <At x={540} y={540}>
        <div style={{ display: "flex", gap: 50 }}>
          {[0, 1, 2, 3].map(i => (
            <Appear key={i} at={tAtomic - 0.3 + i * 0.12} from="pop"><Icon name="Atom" size={140} color={C.mint} stroke={1.6} glow /></Appear>
          ))}
        </div>
      </At>
      <Sfx name="pack/pop" at={tAtomic - 0.3} volume={0.3} />
      <At x={540} y={780}><Phone size={150} /></At>
      <Punch at={t5}>
        <At x={540} y={1040}><Appear at={t5 - 0.2} from="slam" sfx="pack/punch" volume={0.45}><Text size={130} font={F.bold} color={C.amber} glow>≈ 5 m</Text></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 9. Einstein: +38 us/day = 11 km
const EinsteinBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFast = at.word("fast", 1, 1.6);
  const t38 = at.word("38", 1, 2.4);
  const t11 = at.word("11", 1, 5.6);
  const spin = t >= tFast ? (t - tFast) * 900 : 0;
  return (
    <>
      <Headline>Up there, time runs fast</Headline>
      <At x={300} y={600}>
        <div style={{ position: "relative" }}>
          <Sat size={200} />
        </div>
      </At>
      <At x={760} y={600}>
        <div style={{ width: 260, height: 260, borderRadius: "50%", border: `8px solid ${C.amber}`, position: "relative" }}>
          <div style={{ position: "absolute", left: 126, top: 30, width: 8, height: 100, background: C.amber, transformOrigin: "4px 100px", transform: `rotate(${spin}deg)` }} />
        </div>
      </At>
      <Sfx name="pack/fast-forward" at={tFast - 0.2} volume={0.3} />
      <At x={540} y={880}><Appear at={t38 - 0.2} from="up"><Chip size={60}>+38 µs a day</Chip></Appear></At>
      <Punch at={t11}>
        <At x={540} y={1060}><Appear at={t11 - 0.15} from="slam" sfx="pack/wrong" volume={0.4}><Text size={90} font={F.bold} color={C.coral}>11 km off by tomorrow</Text></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 10. payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tWhen = at.word("when", 1, 3.0);
  const tWhere = at.word("where", 2, 4.4);
  return (
    <>
      <At x={540} y={540}><Phone size={220} /></At>
      <At x={540} y={830}><Appear at={tWhen - 0.2} from="pop" sfx="pack/ding" volume={0.35}><Text size={90} font={F.bold}>It knows <span style={{ color: C.amber }}>when</span>.</Text></Appear></At>
      <At x={540} y={970}><Appear at={tWhere - 0.2} from="pop"><Text size={90} font={F.bold}>Works out <span style={{ color: C.mint }}>where</span>.</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 11. CTA: a ship, height known
const CtaBody: React.FC = () => {
  const at = useAt();
  const tHeight = at.word("height", 1, 1.2);
  const tHow = at.word("how", 1, 2.4);
  return (
    <>
      <EarthArc />
      {SATS.map(([x, y], i) => <At key={i} x={x} y={y - 80}><Sat size={100} color={C.muted} /></At>)}
      <At x={540} y={960}><Icon name="Ship" size={170} color={C.ink} stroke={1.6} glow /></At>
      <At x={540} y={700}><Appear at={tHeight - 0.2} from="up"><Chip color={C.panel} text={C.ink} size={50}>height known: sea level</Chip></Appear></At>
      <At x={540} y={1120}><Appear at={tHow} from="pop" sfx="pack/popup" volume={0.35}><Text size={64} color={C.amber} font={F.bold}>how many satellites?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout" to="context"><ShoutBody /></Span>
    <Span from="one"><OneBody /></Span>
    <Span from="two" to="three"><CrossBody /></Span>
    <Span from="rehook"><ClockBody /></Span>
    <Span from="four"><FourBody /></Span>
    <Span from="effect"><EffectBody /></Span>
    <Span from="einstein"><EinsteinBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
