// "Why braking at the speed camera doesn't save you": average speed cameras and the mean value theorem.
// claim hook (braked, still fined) -> rule out radar: it clocks time -> two cameras 5 km apart, limit 100
// -> plate reads 150 s apart -> 5 km / 150 s = 120 -> re-hook: 95 at both cameras, so how? -> graph:
// 95 to 95, averaging 120 means climbing above 120 -> speed can't jump: it passes 120 exactly
// -> at 100 it takes 3 minutes, 30 s saved -> payoff: mean value theorem -> CTA checkable question.
import React from "react";
import {
  Appear, At, Bar, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- the road: two cameras and a car
const AX = 220, BX = 860, RY = 760;
const Limit: React.FC<{ n?: number; size?: number }> = ({ n = 100, size = 130 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: C.ink, border: `${size * 0.11}px solid ${C.coral}`,
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.bold, fontSize: size * 0.4, color: C.bg, boxShadow: "0 10px 24px #0009" }}>{n}</div>
);
const Road: React.FC<{ carX?: number; carColor?: string; flashA?: number; flashB?: number }> = ({ carX, carColor = C.ink, flashA, flashB }) => {
  const t = useT();
  const flash = (f?: number) => (f === undefined ? 0 : Math.max(0, 1 - Math.abs(t - f - 0.08) * 5));
  return (
    <>
      <div style={{ position: "absolute", left: 90, top: RY + 70, width: 900, height: 14, borderRadius: 7, background: C.dim }} />
      <div style={{ position: "absolute", left: 90, top: RY + 75, width: 900, height: 4,
        backgroundImage: `repeating-linear-gradient(90deg, ${C.muted} 0 40px, transparent 40px 80px)` }} />
      {[AX, BX].map((x, i) => {
        const f = flash(i === 0 ? flashA : flashB);
        return (
          <At key={i} x={x} y={RY - 70}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ filter: f > 0 ? `drop-shadow(0 0 ${40 * f}px ${C.ink})` : undefined }}>
                <Icon name="Cctv" size={130} color={f > 0.2 ? C.amber : C.ink} />
              </div>
              <Text size={42} color={C.muted} font={F.med}>camera {i + 1}</Text>
            </div>
          </At>
        );
      })}
      {carX !== undefined ? <At x={carX} y={RY + 100}><Icon name="Car" size={100} color={carColor} glow /></At> : null}
    </>
  );
};

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tBraked = at.word("braked", 1, 0.4);
  const tFined = at.word("fined.", 1, 2.2);
  return (
    <>
      <HookText size={84}>{"Braked at the camera.\n**Still fined.**"}</HookText>
      <Riser to={tFined} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06 }]]}>
        <Road carX={tween(t, 0, at.dur, AX - 10, AX + 60)} flashA={tBraked} />
        <At x={AX} y={RY + 210}><Chip size={56} color={C.mint}>95 km/h</Chip></At>
        <At x={BX} y={RY + 210}><Chip size={56} color={C.mint}>95 km/h</Chip></At>
        <Shake at={tFined}>
          <At x={540} y={1100}><Appear at={0} from="fade"><Stamp size={80} rotate={-4}>FINE: 120 km/h</Stamp></Appear></At>
        </Shake>
      </Camera>
      <Sfx name="pack/shutter" at={tBraked} volume={0.5} />
      <Sfx name="stamp" at={tFined} volume={0.6} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out: it clocks time, not speed
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSpeed = at.word("speed.", 1, 1.0);
  const tTime = at.word("time.", 1, 2.4);
  const strike = tween(t, tSpeed + 0.1, tSpeed + 0.4, 0, 100);
  return (
    <>
      <At x={300} y={640}>
        <Appear at={0.05} from="left">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, position: "relative" }}>
            <Icon name="Gauge" size={200} color={C.muted} />
            <Text size={60} color={C.muted}>your speed</Text>
            <div style={{ position: "absolute", left: -20, top: "50%", width: `${strike * 1.1}%`, height: 14, background: C.coral, borderRadius: 7, transform: "rotate(-8deg)" }} />
          </div>
        </Appear>
      </At>
      <Punch at={tTime}>
        <At x={780} y={640}>
          <Appear at={tTime - 0.15} from="pop">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <Icon name="Timer" size={200} color={C.amber} glow />
              <Text size={60} color={C.amber}>your time</Text>
            </div>
          </Appear>
        </At>
      </Punch>
      <Sfx name="error" at={tSpeed + 0.1} volume={0.3} />
      <Sfx name="pack/clock" at={tTime} dur={1.2} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 3. road, plates, division
const RoadBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tKm = at.word("5", 1, 0.8);
  const tLimit = at.word("100.", 1, 2.2);
  const tOne = at.word("one", 1, at.beat("plates") + 0.3);
  const tLater = at.word("later.", 1, at.beat("plates") + 3.0);
  const t150 = at.word("150", 1, tLater - 1.0);
  const tDiv = at.beat("divide");
  const t120 = at.word("120", 1, tDiv + 2.0);
  const tOver = at.word("Over", 1, tDiv + 3.4);
  const carX = tween(t, tOne, tLater, AX, BX);
  return (
    <>
      <Headline out={tDiv - 0.3}>Two cameras, one road</Headline>
      <Headline at={tDiv} color={C.amber}>Divide</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tOne, { zoom: 1.04 }], [tDiv, { zoom: 1 }]]}>
        <Road carX={t >= tOne - 0.3 ? carX : AX - 90} flashA={tOne} flashB={tLater} />
        <At x={540} y={RY - 230}>
          <Appear at={tKm} from="pop">
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 200, height: 6, background: C.mint, borderRadius: 3 }} />
              <Chip size={60} color={C.mint}>5 km</Chip>
              <div style={{ width: 200, height: 6, background: C.mint, borderRadius: 3 }} />
            </div>
          </Appear>
        </At>
        <At x={540} y={RY - 70}><Appear at={tLimit - 0.2} from="pop"><Limit /></Appear></At>
        <At x={AX} y={RY + 200}><Appear at={tOne} from="up"><Chip size={48} color={C.ink}>2:00:00</Chip></Appear></At>
        <At x={BX} y={RY + 200}><Appear at={tLater} from="up"><Chip size={48} color={C.ink}>2:02:30</Chip></Appear></At>
        <At x={540} y={RY + 320}>
          <Appear at={tOne + 0.2} out={tDiv - 0.2} from="fade">
            <Counter from={0} to={150} t0={tOne + 0.2} t1={Math.max(tOne + 0.8, t150)} size={84} color={C.amber} suffix=" s" />
          </Appear>
        </At>
        <At x={540} y={RY + 320}>
          <Appear at={tDiv + 0.1} from="up">
            <div style={{ display: "flex", alignItems: "center", gap: 22, whiteSpace: "nowrap", fontFamily: F.bold, fontSize: 68, color: C.ink }}>
              <span>5 km ÷ 150 s =</span>
              <span style={{ color: C.amber, textShadow: `0 0 30px ${C.amber}88` }}>{t >= t120 ? "120 km/h" : "…"}</span>
            </div>
          </Appear>
        </At>
        <At x={540} y={400}><Appear at={tOver} from="slam"><Stamp size={70} rotate={-5}>OVER 100</Stamp></Appear></At>
      </Camera>
      <Sfx name="pack/shutter" at={tOne} volume={0.5} />
      <Sfx name="pack/shutter-2" at={tLater} volume={0.5} />
      <Sfx name="ding" at={t120} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 4. re-hook: 95 at both cameras
const ReHookBody: React.FC = () => {
  const at = useAt();
  const t95 = at.word("95", 1, 1.0);
  const tSaw = at.word("saw?", 1, 3.6);
  return (
    <>
      <Road carX={BX + 40} carColor={C.mint} />
      <At x={AX} y={RY + 210}><Appear at={t95} from="up"><Chip size={56} color={C.mint}>95 km/h</Chip></Appear></At>
      <At x={BX} y={RY + 210}><Appear at={t95 + 0.25} from="up"><Chip size={56} color={C.mint}>95 km/h</Chip></Appear></At>
      <Punch at={tSaw - 0.3}>
        <At x={540} y={RY - 300}><Appear at={tSaw - 0.3} from="pop" sfx="pack/suspense-sting" volume={0.45}><Text size={200} color={C.amber} glow>?</Text></Appear></At>
      </Punch>
      <At x={540} y={RY + 320}><Appear at={tSaw - 0.6} from="fade"><Text size={56} color={C.muted}>nobody saw 120</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 5-6. the speed graph
const GX0 = 150, GX1 = 860, VLO = 85, PXV = 10, GY0 = 1080;
const gy = (v: number) => GY0 - (v - VLO) * PXV;
const AMP = (120 - 95) * Math.PI / 2;            // 95 + AMP sin(pi x) averages exactly 120 (verify.py)
const speed = (x: number) => 95 + AMP * Math.sin(Math.PI * x);
const XC = Math.asin(25 / AMP) / Math.PI;        // where it passes 120 on the way up
const gx = (x: number) => GX0 + x * (GX1 - GX0);
const GraphBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tDraw = at.word("Draw", 1, 0.2);
  const tEnd = at.word("end.", 1, 2.6);
  const tAvg = at.word("average", 1, 3.2);
  const tAbove = at.word("above", 1, 4.4);
  const tCross = at.beat("cross");
  const tJump = at.word("jump.", 1, tCross + 1.0);
  const tExact = at.word("exactly.", 1, tCross + 3.2);
  const tMoment = at.word("moment,", 1, tCross + 4.0);
  const drawn = tween(t, tDraw + 0.2, tEnd, 0, 1);
  const N = 120;
  const pts = Array.from({ length: Math.round(N * drawn) + 1 }, (_, i) => i / N).map((x) => `${gx(x)},${gy(speed(x))}`).join(" ");
  const fill = Array.from({ length: N + 1 }, (_, i) => i / N).map((x) => `${gx(x)},${gy(Math.max(120, speed(x)))}`).join(" ");
  const fillO = tween(t, tAbove, tAbove + 0.4, 0, 0.35);
  const dotO = tween(t, tExact - 0.2, tExact, 0, 1);
  const pulse = 1 + 0.25 * Math.max(0, Math.sin((t - tExact) * 6)) * (t > tExact ? Math.exp(-(t - tExact) * 1.5) : 0);
  return (
    <>
      <Headline out={tCross - 0.3}>Draw your speed</Headline>
      <Headline at={tCross} color={C.amber}>It can't skip 120</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tCross, { zoom: 1 }], [tExact, { zoom: 1.25, x: gx(XC) + 120, y: gy(120) }], [tMoment + 1.2, { zoom: 1.25, x: gx(XC) + 120, y: gy(120) }]]}>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          <line x1={GX0} y1={GY0} x2={GX1 + 20} y2={GY0} stroke={C.muted} strokeWidth={5} />
          <line x1={GX0} y1={GY0} x2={GX0} y2={gy(140)} stroke={C.muted} strokeWidth={5} />
          <line x1={GX0} y1={gy(100)} x2={GX1} y2={gy(100)} stroke={C.coral} strokeWidth={4} strokeDasharray="14 12" opacity={0.8} />
          {t >= tAvg ? <line x1={GX0} y1={gy(120)} x2={GX0 + (GX1 - GX0) * tween(t, tAvg, tAvg + 0.5, 0, 1)} y2={gy(120)} stroke={C.amber} strokeWidth={6} strokeDasharray="20 12" /> : null}
          <polygon points={`${gx(0)},${gy(120)} ${fill} ${gx(1)},${gy(120)}`} fill={C.amber} opacity={fillO} />
          <polyline points={pts} fill="none" stroke={C.mint} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
          {t >= tExact - 0.2 ? <circle cx={gx(XC)} cy={gy(120)} r={20 * pulse} fill={C.amber} opacity={dotO} /> : null}
        </svg>
        <At x={GX0 - 70} y={gy(100)}><Text size={40} color={C.coral}>100</Text></At>
        <At x={GX0 + 10} y={gy(95) + 60}><Appear at={tDraw + 0.3} from="pop"><Text size={44} color={C.mint}>95</Text></Appear></At>
        <At x={GX1} y={gy(95) + 60}><Appear at={tEnd - 0.2} from="pop"><Text size={44} color={C.mint}>95</Text></Appear></At>
        <At x={540} y={GY0 + 50}><Text size={40} color={C.muted} font={F.med}>camera 1 → camera 2 (150 s)</Text></At>
        <At x={GX0 - 70} y={gy(120)}><Appear at={tAvg} from="fade"><Text size={40} color={C.amber}>120</Text></Appear></At>
        <At x={540} y={gy(140) - 30}><Appear at={tAvg} out={tCross - 0.3} from="fade"><Text size={46} color={C.amber}>- - -  your average: 120</Text></Appear></At>
        <At x={540} y={gy(140) - 30}><Appear at={tJump - 0.3} from="up"><Chip size={44} color={C.panel} text={C.ink}>speed can't jump</Chip></Appear></At>
        <At x={gx(XC) + 150} y={gy(120) + 70}><Appear at={tExact} from="slam"><Chip size={46}>120 exactly</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/whoosh-short" at={tDraw + 0.2} volume={0.3} />
      <Sfx name="pop" at={tAbove} volume={0.35} />
      <Sfx name="pack/flash" at={tExact} volume={0.5} />
      <Sfx name="stamp" at={tMoment + 0.4} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 7. what you saved
const SavedBody: React.FC = () => {
  const at = useAt();
  const t3 = at.word("3", 1, 2.0);
  const t30 = at.word("30", 1, 3.6);
  return (
    <>
      <Headline>What braking bought you</Headline>
      <At x={540} y={560}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
          <Text size={52} color={C.coral}>at 120 km/h: 2 min 30 s</Text>
          <Bar to={150 / 180} t0={0.1} t1={0.8} w={820} h={60} color={C.coral} />
        </div>
      </At>
      <At x={540} y={790}>
        <Appear at={t3 - 0.6} from="up">
          <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
            <Text size={52} color={C.mint}>at 100 km/h: 3 min</Text>
            <Bar to={1} t0={t3 - 0.5} t1={t3 + 0.2} w={820} h={60} color={C.mint} />
          </div>
        </Appear>
      </At>
      <Punch at={t30}>
        <At x={540} y={1040}><Appear at={t30} from="slam"><Chip size={80}>30 seconds</Chip></Appear></At>
      </Punch>
      <Sfx name="pack/cash-ting" at={t30 + 0.1} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 8. payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tOnce = at.word("once.", 1, 2.4);
  const tMvt = at.word("mean", 1, 3.2);
  const tSee = at.word("see", 1, 5.2);
  return (
    <>
      <Camera keys={[[0, { zoom: 1.05 }], [at.dur, { zoom: 1 }]]}>
        <At x={540} y={560}><Appear at={0.05} from="pop"><Icon name="Gauge" size={300} color={C.amber} glow /></Appear></At>
        <At x={540} y={800}><Appear at={tOnce - 0.5} from="up"><Text size={60} color={C.ink}>speed = average, at least once</Text></Appear></At>
        <At x={540} y={940}><Appear at={tMvt} from="slam"><Chip size={64}>mean value theorem</Chip></Appear></At>
        <At x={540} y={1080}><Appear at={tSee - 0.3} from="fade"><Text size={50} color={C.muted}>no photo of you speeding needed</Text></Appear></At>
      </Camera>
      <Sfx name="reveal" at={tMvt} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 9. CTA (checkable, loops back to the cameras)
const CtaBody: React.FC = () => {
  const at = useAt();
  const t5 = at.word("5", 1, 1.6);
  const tFined = at.word("fined?", 1, 3.0);
  return (
    <>
      <Road carX={540} />
      <At x={540} y={RY - 230}>
        <Appear at={0.05} from="pop">
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 190, height: 6, background: C.mint, borderRadius: 3 }} />
            <Chip size={60} color={C.mint}>10 km</Chip>
            <div style={{ width: 190, height: 6, background: C.mint, borderRadius: 3 }} />
          </div>
        </Appear>
      </At>
      <At x={540} y={RY + 220}><Appear at={t5 - 0.2} from="up"><Chip size={60} color={C.ink}>5 minutes</Chip></Appear></At>
      <At x={AX} y={RY + 220}><Appear at={t5 + 0.2} from="fade"><Limit size={100} /></Appear></At>
      <Punch at={tFined}>
        <At x={540} y={RY - 420}><Appear at={tFined - 0.2} from="pop"><Text size={110} color={C.amber} glow>Fined?</Text></Appear></At>
      </Punch>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="setup" to="divide"><RoadBody /></Span>
    <Span from="rehook"><ReHookBody /></Span>
    <Span from="graph" to="cross"><GraphBody /></Span>
    <Span from="saved"><SavedBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
