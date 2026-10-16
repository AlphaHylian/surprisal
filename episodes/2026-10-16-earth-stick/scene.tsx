// "How to measure the whole Earth with a stick": Eratosthenes, how-to format.
// question hook -> rule out (no walk, no space: noon) -> the well -> the stick's 7.2 degree shadow
// -> parallel rays = slice of Earth -> re-hook (1/50 of a circle) -> pace 5,000 x 50 -> payoff -> DIY -> CTA.
import React from "react";
import {
  Appear, At, C, Camera, Card, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx,
  Span, Text, You, tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- shared drawing: the Earth with two towns
// The angle between the towns is drawn at 20 degrees (7.2 would be too thin to see); the label says 7.2.
const EX = 540, EY = 790, ER = 300, DRAWN = 20;
const pt = (deg: number, r = ER) => [EX + r * Math.sin((deg * Math.PI) / 180), EY - r * Math.cos((deg * Math.PI) / 180)];

const Earth: React.FC<{ show: number; rays?: number; centre?: number; sticks?: number; t: number }> = ({ show, rays, centre, sticks, t }) => {
  const [sx, sy] = pt(0), [ax, ay] = pt(-DRAWN);
  const rayO = rays !== undefined ? tween(t, rays, rays + 0.5, 0, 1) : 0;
  const cenO = centre !== undefined ? tween(t, centre, centre + 0.6, 0, 1) : 0;
  const stickO = sticks !== undefined ? tween(t, sticks, sticks + 0.4, 0, 1) : 1;
  const [a1x, a1y] = pt(-DRAWN, ER + 70);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: tween(t, show, show + 0.3, 0, 1) }}>
      <defs>
        <radialGradient id="earth" cx="40%" cy="35%"><stop offset="0%" stopColor="#2b5f7a" /><stop offset="100%" stopColor={C.bg2} /></radialGradient>
      </defs>
      <circle cx={EX} cy={EY} r={ER} fill="url(#earth)" stroke={C.mint} strokeWidth={5} />
      {/* parallel sunlight from straight above */}
      <g opacity={rayO}>
        {[-260, -170, -80, 0, 90].map((dx, i) => (
          <line key={i} x1={EX + dx} y1={340} x2={EX + dx} y2={dx === 0 ? sy : dx === -80 ? ay - 20 : 420} stroke={C.amber} strokeWidth={dx === 0 || dx === -80 ? 6 : 3} strokeDasharray={dx === 0 || dx === -80 ? "0" : "14 12"} opacity={0.9} />
        ))}
      </g>
      {/* lines to the centre, with the angle there */}
      <g opacity={cenO}>
        <line x1={EX} y1={EY} x2={sx} y2={sy} stroke={C.ink} strokeWidth={4} strokeDasharray="12 10" />
        <line x1={EX} y1={EY} x2={ax} y2={ay} stroke={C.ink} strokeWidth={4} strokeDasharray="12 10" />
        <path d={`M ${EX} ${EY - 90} A 90 90 0 0 0 ${pt(-DRAWN, 90)[0]} ${pt(-DRAWN, 90)[1]}`} fill="none" stroke={C.amber} strokeWidth={8} />
        <path d={`M ${sx} ${sy} A ${ER} ${ER} 0 0 0 ${ax} ${ay}`} fill="none" stroke={C.amber} strokeWidth={14} strokeLinecap="round" />
      </g>
      {/* the towns: a well at Syene (top), a stick at Alexandria */}
      <g opacity={stickO}>
        <circle cx={sx} cy={sy} r={14} fill={C.amber} />
        <line x1={ax} y1={ay} x2={a1x} y2={a1y} stroke={C.ink} strokeWidth={10} strokeLinecap="round" />
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tStick = at.word("stick", 1, 2.2);
  const spin = tween(t, 0, at.dur, 0, 6);
  return (
    <>
      <HookText size={80} y={270}>{"Measure **the whole Earth**\nwith a stick?"}</HookText>
      <Riser to={tStick} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.08 }]]}>
        <At x={540} y={810}>
          <Appear at={0} from="pop">
            <div style={{ position: "relative", width: 520, height: 520 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle at 38% 32%, #2f6d8c, ${C.bg2})`, border: `6px solid ${C.mint}`, transform: `rotate(${spin}deg)` }} />
              <div style={{ position: "absolute", left: 253, top: -100, width: 14, height: 110, background: C.ink, borderRadius: 7 }} />
              <div style={{ position: "absolute", left: 265, top: 4, width: 110, height: 10, background: C.muted, borderRadius: 5, transform: "rotate(8deg)", transformOrigin: "left" }} />
            </div>
          </Appear>
        </At>
        <At x={850} y={520}><Appear at={0} from="pop"><Icon name="Sun" size={130} color={C.amber} glow /></Appear></At>
        <At x={540} y={1120}><Appear at={tStick} from="slam"><Chip size={50}>40,000 km around</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/shutter" at={tStick} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tWalk = at.word("walk", 1, 0.5);
  const tSpace = at.word("space", 1, 1.6);
  const tNoon = at.word("need", 1, 2.6);
  const Out: React.FC<{ t: number; icon: string; children: string }> = ({ t, icon, children }) => (
    <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20 }}>
      <Icon name={icon} size={80} color={C.muted} />
      <Chip color={C.panel} text={C.ink} size={64}>{children}</Chip>
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%" }}>
        <Appear at={t + 0.4} from="slam"><div style={{ height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-4deg)", boxShadow: `0 0 20px ${C.coral}` }} /></Appear>
      </div>
    </div>
  );
  return (
    <>
      <At y={400}><Appear at={0.05} from="left"><Out t={tWalk} icon="Footprints">walk around it</Out></Appear></At>
      <At y={600}><Appear at={Math.min(tSpace, 0.6)} from="right"><Out t={tSpace} icon="Rocket">go to space</Out></Appear></At>
      <Punch at={tNoon}>
        <At y={900}>
          <Appear at={tNoon} from="pop">
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}><Icon name="Sun" size={150} color={C.amber} glow /><Text size={120} color={C.amber} glow>noon</Text></div>
          </Appear>
        </At>
      </Punch>
      <Sfx name="pack/suspense-sting" at={tNoon} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 3-4. the well, then the stick
const WellStickBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tWell = at.word("well", 1, 2.4);
  const tNoShadow = at.word("shadow", 1, at.beat("stick") - 1);
  const tStick = at.beat("stick");
  const tShadow = at.word("shadow", 2, tStick + 3.6);
  const t72 = at.word("7.2", 1, tShadow + 0.6);
  const tilt = 7.2 * 3; // drawn 3x so the angle is visible; labelled 7.2
  const rayLen = 360;
  const showStick = t >= tStick;
  return (
    <>
      <Headline out={tStick - 0.3}>Syene: no shadow</Headline>
      <Headline at={tStick} color={C.amber}>Alexandria: a shadow</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tStick, { zoom: 1 }], [t72, { zoom: 1.1, x: 540, y: 670 }]]}>
        {!showStick ? (
          <>
            <At x={540} y={400}><Appear at={0.05} from="drop"><Icon name="Sun" size={150} color={C.amber} glow /></Appear></At>
            {[-60, 0, 60].map((dx, i) => (
              <At key={i} x={540 + dx} y={700}><Appear at={0.4 + i * 0.1} from="down"><div style={{ width: 8, height: tween(t, 0.4, 1.2, 0, 380), background: C.amber, borderRadius: 4, boxShadow: `0 0 16px ${C.amber}` }} /></Appear></At>
            ))}
            <At x={540} y={960}>
              <Appear at={tWell - 0.3} from="up">
                <div style={{ width: 260, height: 150, border: `10px solid ${C.ink}`, borderTop: "none", borderRadius: "0 0 30px 30px", background: `linear-gradient(${C.amber}55, ${C.bg})` }} />
              </Appear>
            </At>
            <At x={540} y={1110}><Appear at={tNoShadow} from="slam"><Chip size={52} color={C.mint}>0° shadow</Chip></Appear></At>
          </>
        ) : (
          <>
            <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
              {[-120, 0, 120].map((dx, i) => {
                const x2 = 540 + dx, y2 = 940 - (dx === 0 ? 300 : 120);
                const r = (tilt * Math.PI) / 180;
                const len = Math.min(rayLen, (y2 - 380) / Math.cos(r));
                return <line key={i} x1={x2 - len * Math.sin(r)} y1={y2 - len * Math.cos(r)} x2={x2} y2={y2} stroke={C.amber} strokeWidth={6} opacity={tween(t, tStick + 0.3, tStick + 0.8, 0, 1)} />;
              })}
              <line x1={540} y1={940} x2={540} y2={640} stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
              <line x1={540} y1={940} x2={540 + 300 * Math.tan((tilt * Math.PI) / 180) * tween(t, tShadow, tShadow + 0.6, 0, 1)} y2={940} stroke={C.muted} strokeWidth={18} strokeLinecap="round" opacity={0.9} />
              <line x1={300} y1={944} x2={780} y2={944} stroke={C.muted} strokeWidth={4} />
              <path d={`M 540 760 A 180 180 0 0 1 ${540 + 180 * Math.sin((tilt * Math.PI) / 180)} ${940 - 180 * Math.cos((tilt * Math.PI) / 180)}`} fill="none" stroke={C.amber} strokeWidth={6} opacity={t >= t72 ? 1 : 0} />
            </svg>
            <At x={830} y={700}><Appear at={t72} from="slam"><Text size={96} color={C.amber} glow>7.2°</Text></Appear></At>
            <At x={540} y={1090}><Appear at={tStick + 0.6} from="up"><Text size={46} color={C.muted}>same day, same noon, further north</Text></Appear></At>
          </>
        )}
      </Camera>
      <Sfx name="pack/whoosh-fast" at={tStick} volume={0.35} />
      <Sfx name="ding" at={t72} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 5. parallel rays = slice of Earth
const ParallelBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tParallel = at.word("parallel", 1, 1.2);
  const tSlice = at.word("slice", 1, 3.6);
  const [lx, ly] = pt(-DRAWN / 2, 130);
  return (
    <>
      <Headline color={C.mint}>Same angle at the centre</Headline>
      <Earth t={t} show={0} sticks={0} rays={tParallel - 0.3} centre={tSlice - 0.3} />
      <At x={lx - 30} y={ly}><Appear at={tSlice} from="pop"><Text size={64} color={C.amber} glow>7.2°</Text></Appear></At>
      <At x={EX + 60} y={EY - ER - 50}><Appear at={0.3} from="fade"><Text size={40} color={C.amber}>Syene</Text></Appear></At>
      <At x={pt(-DRAWN, ER + 60)[0] - 170} y={pt(-DRAWN, ER + 60)[1] + 30}><Appear at={0.5} from="fade"><Text size={40} color={C.ink}>Alexandria</Text></Appear></At>
      <Sfx name="pack/whoosh-soft" at={tParallel} volume={0.35} />
      <Sfx name="ding" at={tSlice} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 6. re-hook: 1/50 of a circle
const RehookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFiftieth = at.word("fiftieth", 1, 2.0);
  const t50 = at.word("50", 1, 3.6);
  const n = Math.round(tween(t, t50 - 0.2, t50 + 0.9, 1, 50));
  const R = 330;
  return (
    <>
      <Headline color={C.amber}>1/50 of a circle</Headline>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {[...Array(50)].map((_, i) => {
          if (i >= (t < tFiftieth ? 1 : n)) return null;
          const a0 = (i * 7.2 - 90) * Math.PI / 180, a1 = ((i + 1) * 7.2 - 90) * Math.PI / 180;
          const cx = 540, cy = 760;
          return <path key={i} d={`M ${cx} ${cy} L ${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} A ${R} ${R} 0 0 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} Z`}
            fill={i === 0 ? C.amber : C.mint} opacity={i === 0 ? 1 : 0.45} stroke={C.bg} strokeWidth={2} />;
        })}
        <circle cx={540} cy={760} r={R} fill="none" stroke={C.mint} strokeWidth={4} />
      </svg>
      <At x={540} y={1130}><Appear at={t50 + 0.9} from="slam"><Chip size={54}>Earth = 50 slices</Chip></Appear></At>
      {t >= t50 - 0.2 && t < t50 + 0.9 ? <Sfx name="pack/counting-digital" at={t50 - 0.2} dur={1.1} volume={0.3} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- 7. pace it, times 50
const PaceBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tPace = at.word("pace", 1, 1.0);
  const t5000 = at.word("5,000", 1, 2.4);
  const tTimes = at.word("Times", 1, 3.6);
  const t250 = at.word("250,000", 1, 4.6);
  const walk = tween(t, tPace, t5000 + 0.3, 0, 1);
  return (
    <>
      <Headline color={C.mint}>Pace it out</Headline>
      <At x={540} y={540}>
        <Appear at={0.05} from="fade">
          <div style={{ position: "relative", width: 820, height: 120 }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 70, height: 8, background: C.dim, borderRadius: 4 }} />
            <div style={{ position: "absolute", left: 0, width: 820 * walk, top: 70, height: 8, background: C.amber, borderRadius: 4 }} />
            <div style={{ position: "absolute", left: 820 * walk - 40, top: 0 }}><Icon name="Footprints" size={70} color={C.amber} /></div>
          </div>
        </Appear>
      </At>
      <At x={180} y={650}><Appear at={0.2} from="fade"><Text size={40} color={C.muted}>Syene</Text></Appear></At>
      <At x={880} y={650}><Appear at={0.2} from="fade"><Text size={40} color={C.muted}>Alexandria</Text></Appear></At>
      <At x={540} y={800}><Appear at={tPace} from="up"><Counter from={0} to={5000} t0={tPace} t1={t5000 + 0.3} size={90} color={C.amber} comma suffix=" stadia" /></Appear></At>
      <At x={540} y={1060}>
        <Appear at={tTimes} from="up">
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <Text size={70} color={C.muted}>× 50 =</Text>
            <Counter from={5000} to={250000} t0={tTimes + 0.2} t1={t250 + 0.3} size={96} color={C.mint} comma />
          </div>
        </Appear>
      </At>
      <Sfx name="ding" at={t250 + 0.3} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 8. payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tShort = at.word("short", 1, 2.8);
  const t40k = at.word("40,000", 1, 3.6);
  const tReal = at.word("real", 1, 5.4);
  return (
    <>
      <At x={540} y={360}><Appear at={0.05} from="up"><Text size={50} color={C.muted}>1 stadion: 160 to 210 m (argued)</Text></Appear></At>
      <At x={540} y={620}>
        <Appear at={tShort} from="left">
          <Card w={800} h={210} border={C.amber}>
            <Text size={40} color={C.amber}>his answer, short stadion</Text>
            <Counter from={0} to={40000} t0={tShort + 0.1} t1={t40k + 0.3} size={96} color={C.amber} comma suffix=" km" />
          </Card>
        </Appear>
      </At>
      <Punch at={tReal + 0.5}>
        <At x={540} y={900}>
          <Appear at={tReal} from="right">
            <Card w={800} h={210} border={C.mint}>
              <Text size={40} color={C.mint}>the real Earth, pole to pole</Text>
              <Text size={96} color={C.mint}>40,008 km</Text>
            </Card>
          </Appear>
        </At>
      </Punch>
      <Sfx name="pack/boom-short" hit={tReal + 0.5} volume={0.5} />
    </>
  );
};

// ---------------------------------------------------------------- 9. DIY + 10. CTA
const Pair: React.FC<{ km: string; deg: string; tDeg: number; t0: number }> = ({ km, deg, tDeg, t0 }) => (
  <>
    <At x={300} y={620}><Appear at={t0} from="pop"><You size={150} color={C.mint} /></Appear></At>
    <At x={780} y={620}><Appear at={t0 + 0.2} from="pop"><You size={150} color={C.amber} /></Appear></At>
    <At x={540} y={420}><Appear at={t0 + 0.4} from="fade"><Text size={56}>{km}</Text></Appear></At>
    <At x={540} y={840}><Appear at={t0 + 0.4} from="fade"><div style={{ width: 520, height: 8, background: C.dim, borderRadius: 4 }} /></Appear></At>
    <At x={540} y={1040}><Appear at={tDeg} from="slam"><Text size={110} color={C.amber} glow>{deg}</Text></Appear></At>
  </>
);
const DiyBody: React.FC = () => {
  const at = useAt();
  const t9 = at.word("9", 1, 4.0);
  return (
    <>
      <Headline color={C.mint}>Try it with a friend</Headline>
      <Pair km="1,000 km apart" deg="9° apart" tDeg={t9} t0={0.1} />
      <Sfx name="ding" at={t9} volume={0.4} />
    </>
  );
};
const CtaBody: React.FC = () => {
  const at = useAt();
  const t500 = at.word("500", 1, 1.6);
  return (
    <>
      <Headline color={C.amber}>Your turn</Headline>
      <Pair km="500 km apart" deg="?°" tDeg={t500 + 0.6} t0={0.05} />
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="well" to="stick"><WellStickBody /></Span>
    <Span from="parallel"><ParallelBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="pace"><PaceBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="diy"><DiyBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
