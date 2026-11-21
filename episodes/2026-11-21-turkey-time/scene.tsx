// "Why a turkey twice as big doesn't take twice as long": square-cube + diffusion.
// claim hook (2x turkey, +60% time) -> minutes per pound says 6 h -> 12 lb 3 h, now 24 lb
// -> heat cares about distance to the middle -> 26% thicker -> re-hook: not 26% -> diffusion: 2x deep = 4x time
// -> 1.26 x 1.26 = 1.59 -> 3 h -> 4 h 45 (USDA 4.5-5) -> thermometer 165 -> CTA 8x heavier (4x)
import React from "react";
import { Appear, Arrow, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// ---------------------------------------------------------------- a roast turkey, drawn
const Roast: React.FC<{ s?: number }> = ({ s = 1 }) => {
  const W = 300 * s, H = 200 * s;
  return (
    <div style={{ position: "relative", width: W * 1.3, height: H * 1.15 }}>
      <div style={{ position: "absolute", left: -W * 0.02, top: H * 0.45, width: W * 0.36, height: H * 0.42, borderRadius: "50%", background: "#9A4F1E", transform: "rotate(-25deg)" }} />
      <div style={{ position: "absolute", left: W * 0.96, top: H * 0.45, width: W * 0.36, height: H * 0.42, borderRadius: "50%", background: "#9A4F1E", transform: "rotate(25deg)" }} />
      <div style={{ position: "absolute", left: -W * 0.08, top: H * 0.7, width: W * 0.12, height: H * 0.12, borderRadius: "50%", background: "#F3E6CC" }} />
      <div style={{ position: "absolute", left: W * 1.26, top: H * 0.7, width: W * 0.12, height: H * 0.12, borderRadius: "50%", background: "#F3E6CC" }} />
      <div style={{ position: "absolute", left: W * 0.15, top: 0, width: W, height: H, borderRadius: "50% 50% 46% 46%", background: "radial-gradient(circle at 40% 30%, #E0913F, #B8621F 60%, #8A4517)", boxShadow: "0 14px 40px #000a" }} />
    </div>
  );
};
const Clock: React.FC<{ label: string; color?: string; size?: number }> = ({ label, color = C.ink, size = 64 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
    <Icon name="Clock" size={size * 1.1} color={color} />
    <div style={{ fontFamily: F.bold, fontSize: size, color }}>{label}</div>
  </div>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t60 = w(["60%", "60"], 1, 1.9);
  return (
    <>
      <HookText y={260} size={92}>{"**2×** the turkey,\nonly **+60%** time"}</HookText>
      <Riser to={t60} volume={0.45} />
      <Camera keys={[[0, { zoom: 1 }], [t60 + 0.8, { zoom: 1.05, y: 720 }]]}>
        <At x={270} y={700}><Appear at={0} from="pop"><Roast s={0.62} /></Appear></At>
        <At x={760} y={680} scale={1 + 0.02 * Math.sin(t * 6)}><Appear at={0} from="pop" sfx={null}><Roast s={0.86} /></Appear></At>
        <At x={270} y={940}><Appear at={0} from="up" sfx={null}><Clock label="3 h" /></Appear></At>
        <At x={760} y={940}><Appear at={t60 - 0.3} from="slam"><Clock label="4 h 45" color={C.amber} size={70} /></Appear></At>
        <At x={270} y={1060}><Text size={44} color={C.muted}>12 lb</Text></At>
        <At x={760} y={1060}><Text size={44} color={C.muted}>24 lb</Text></At>
      </Camera>
      <Sfx name="pack/ding" at={t60} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rule out: minutes per pound -> 6 h, dry
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tDouble = w(["double"], 1, 1.2), tSix = w(["6"], 1, 2.4), tDry = w(["dry"], 1, 3.6);
  return (
    <>
      <Headline>Minutes per pound?</Headline>
      <At x={540} y={560}><Appear at={0.05} from="left"><div style={{ fontFamily: F.mono, fontSize: 70, color: C.ink }}>12 lb → 3 h</div></Appear></At>
      <At x={540} y={700}><Appear at={tDouble - 0.1} from="left"><div style={{ fontFamily: F.mono, fontSize: 70, color: C.ink }}>24 lb → <span style={{ color: C.coral }}>6 h</span></div></Appear></At>
      <At x={540} y={940}><Appear at={tDry - 0.3} from="slam"><Stamp color={C.coral} size={100}>DRY</Stamp></Appear></At>
      <Sfx name="pack/wrong" at={tDry} volume={0.3} />
      <Sfx name="pack/click-soft" at={tSix} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- context
const ContextBody: React.FC = () => {
  const w = useW();
  const t3 = w(["3"], 1, 1.4), t325 = w(["325"], 1, 2.2), t24 = w(["24"], 1, 3.8);
  return (
    <>
      <Headline>Your turkey</Headline>
      <At x={540} y={620}><Appear at={0.05} from="pop"><Roast s={0.8} /></Appear></At>
      <At x={300} y={900}><Appear at={t3 - 0.2} from="up"><Clock label="3 h" /></Appear></At>
      <At x={760} y={900}><Appear at={t325 - 0.2} from="up"><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Icon name="Flame" size={70} color={C.coral} /><Text size={60} font={F.bold}>325°F</Text></div></Appear></At>
      <At x={540} y={1060}><Appear at={t24 - 0.5} from="slam"><Counter from={12} to={24} t0={t24 - 0.5} t1={t24} size={110} color={C.amber} suffix=" lb" /></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- heat cares about the distance to the middle
const Section: React.FC<{ r: number; t0: number; fill?: number }> = ({ r, t0, fill = 0 }) => (
  <div style={{ position: "relative", width: 2 * r, height: 2 * r }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#F3D9B5", border: "14px solid #9A4F1E", boxSizing: "border-box" }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", boxShadow: `inset 0 0 0 ${fill * r}px #E07A3Faa` }} />
    <div style={{ position: "absolute", left: r - 14, top: r - 14, width: 28, height: 28, borderRadius: 14, background: C.amber }} />
  </div>
);
const MiddleBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tWeight = w(["weight"], 1, 0.6), tFar = w(["far"], 1, 2.0), tMiddle = w(["middle"], 1, 3.2);
  const fill = tween(t, tFar, tMiddle + 1.2, 0, 0.75);
  return (
    <>
      <Headline>How far to the middle</Headline>
      <At x={540} y={560}><Appear at={0.05} out={tFar - 0.2} from="fade"><div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Icon name="Scale" size={110} color={C.muted} /><div style={{ fontFamily: F.bold, fontSize: 80, color: C.muted, textDecoration: "line-through" }}>24 lb</div></div></Appear></At>
      <Camera keys={[[0, { zoom: 1 }], [tMiddle, { zoom: 1.1, y: 700 }]]}>
        <At x={540} y={700}><Appear at={tFar - 0.3} from="pop"><Section r={300} t0={tFar} fill={fill} /></Appear></At>
        {[0, 1, 2, 3].map((k) => {
          const a = (k * Math.PI) / 2 + Math.PI / 4;
          return <Arrow key={k} x1={540 + 420 * Math.cos(a)} y1={700 + 420 * Math.sin(a)} x2={540 + 60 * Math.cos(a)} y2={700 + 60 * Math.sin(a)} t0={tFar + k * 0.12} t1={tFar + 0.8 + k * 0.12} color={C.coral} />;
        })}
        <At x={540} y={1080}><Appear at={tMiddle - 0.2} from="up"><Chip color={C.amber} size={56}>distance to the middle</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/whoosh-soft" at={tWeight} volume={0.2} />
    </>
  );
};

// ---------------------------------------------------------------- 26% thicker
const Cube: React.FC<{ side: number; color: string; label: string; at: number }> = ({ side, color, label, at }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
    <div style={{ width: side, height: side, background: color + "33", border: `6px solid ${color}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: F.bold, fontSize: 56, color }}>{label}</div>
    </div>
  </div>
);
const ThickBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tDouble = w(["Double"], 1, 0.3), tCube = w(["cube"], 1, 2.2), t26 = w(["26%", "26"], 1, 4.0);
  const s2 = tween(t, tCube - 0.3, tCube + 0.6, 260, 260 * 1.26);
  return (
    <>
      <Headline>Twice the weight</Headline>
      <At x={290} y={660}><Appear at={0.05} from="pop"><Cube side={260} color={C.mint} label="1×" at={0} /></Appear></At>
      <At x={740} y={660}><Appear at={tDouble + 0.2} from="pop"><Cube side={s2} color={C.amber} label="2×" at={0} /></Appear></At>
      <At x={290} y={880}><Appear at={0.2} from="up" sfx={null}><Text size={50} color={C.mint} font={F.mono}>side 1</Text></Appear></At>
      <At x={740} y={920}><Appear at={tCube} from="up"><Text size={50} color={C.amber} font={F.mono}>side ∛2 = 1.26</Text></Appear></At>
      <Punch at={t26}><At x={540} y={1070}><Appear at={t26 - 0.3} from="slam"><Chip color={C.amber} size={66}>26% thicker</Chip></Appear></At></Punch>
      <Sfx name="pack/click-hard" at={t26} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook: not 26%
const RehookBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tNo = w(["No"], 1, 1.4), tSteady = w(["steady"], 1, 3.0);
  const x = tween(t, tNo + 0.3, tSteady + 0.8, 160, 900);
  return (
    <>
      <Headline color={C.amber}>26% more time?</Headline>
      <At x={540} y={600}><Appear at={tNo - 0.2} from="slam"><Stamp color={C.coral} size={120}>NO</Stamp></Appear></At>
      <div style={{ position: "absolute", left: 140, top: 900, width: 800, height: 8, background: C.dim, borderRadius: 4 }} />
      <At x={x} y={904}><Appear at={tNo + 0.3} from="fade" sfx={null}><Icon name="Flame" size={90} color={C.coral} /></Appear></At>
      <At x={540} y={1050}><Appear at={tSteady - 0.2} from="up"><Text size={52} color={C.muted}>not a steady march</Text></Appear></At>
      <Sfx name="pack/suspense-sting" at={tNo} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- diffusion: 2x deep = 4x time
const SquareBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tSlows = w(["slows"], 1, 1.6), tTwice = w(["Twice"], 1, 2.6), tFour = w(["four"], 1, 3.8);
  // graph: depth vs time, depth = sqrt(time)
  const X0 = 170, Y0 = 1040, GW = 760, GH = 640;
  const prog = tween(t, 0.1, tSlows + 0.8, 0, 1);
  const pts = Array.from({ length: 60 }, (_, i) => i / 59).filter((u) => u <= prog).map((u) => `${X0 + u * GW},${Y0 - Math.sqrt(u) * GH}`).join(" ");
  const yA = Y0 - 0.5 * GH, yB = Y0 - GH, xA = X0 + 0.25 * GW, xB = X0 + GW;
  return (
    <>
      <Headline>Heat spreads, and slows</Headline>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={X0} y1={Y0} x2={X0 + GW} y2={Y0} stroke={C.muted} strokeWidth={5} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y0 - GH - 30} stroke={C.muted} strokeWidth={5} />
        <polyline points={pts} fill="none" stroke={C.coral} strokeWidth={9} strokeLinecap="round" />
        {t > tTwice && <line x1={X0} y1={yA} x2={xA} y2={yA} stroke={C.mint} strokeWidth={4} strokeDasharray="12 10" />}
        {t > tTwice && <line x1={xA} y1={yA} x2={xA} y2={Y0} stroke={C.mint} strokeWidth={4} strokeDasharray="12 10" />}
        {t > tTwice + 0.5 && <line x1={X0} y1={yB} x2={xB} y2={yB} stroke={C.amber} strokeWidth={4} strokeDasharray="12 10" />}
        {t > tFour - 0.2 && <line x1={xB} y1={yB} x2={xB} y2={Y0} stroke={C.amber} strokeWidth={4} strokeDasharray="12 10" />}
      </svg>
      <At x={X0 + 40} y={Y0 - GH - 60}><Text size={42} color={C.muted}>depth</Text></At>
      <At x={X0 + GW - 40} y={Y0 + 50}><Text size={42} color={C.muted}>time</Text></At>
      <At x={X0 - 55} y={yA}><Appear at={tTwice} from="pop"><Text size={50} color={C.mint} font={F.bold}>1</Text></Appear></At>
      <At x={X0 - 55} y={yB}><Appear at={tTwice + 0.5} from="pop"><Text size={50} color={C.amber} font={F.bold}>2</Text></Appear></At>
      <At x={xA} y={Y0 + 50}><Appear at={tTwice} from="pop" sfx={null}><Text size={50} color={C.mint} font={F.bold}>1</Text></Appear></At>
      <Punch at={tFour}><At x={xB - 60} y={Y0 + 50}><Appear at={tFour - 0.2} from="slam"><Text size={56} color={C.amber} font={F.bold}>4</Text></Appear></At></Punch>
      <At x={560} y={620}><Appear at={tFour + 0.1} from="pop"><Chip color={C.amber} size={60}>2× deep = 4× time</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 1.26 x 1.26 = 1.59
const MathBody: React.FC = () => {
  const w = useW();
  const tMul = w(["multiply"], 1, 0.4), t159 = w(["1.59"], 1, 2.6), t60 = w(["60%", "60"], 1, 3.8);
  return (
    <>
      <Headline>Put it together</Headline>
      <At x={540} y={620}><Appear at={tMul} from="up"><div style={{ fontFamily: F.mono, fontSize: 96, color: C.ink, whiteSpace: "nowrap" }}>1.26 × 1.26</div></Appear></At>
      <Punch at={t159}><At x={540} y={820}><Appear at={t159 - 0.4} from="slam"><div style={{ fontFamily: F.bold, fontSize: 150, color: C.amber }}>= 1.59</div></Appear></At></Punch>
      <At x={540} y={1040}><Appear at={t60 - 0.2} from="pop"><Chip color={C.amber} size={64}>about +60% time</Chip></Appear></At>
      <Sfx name="pack/correct" at={t159} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- payoff: 3 h -> 4 h 45, USDA 4.5-5
const PayoffBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tQuarters = w(["quarters"], 1, 1.6), tUSDA = w(["USDA"], 1, 2.6), tFive = w(["5"], 1, 4.6);
  const X0 = 140, PX = 140; // px per hour
  const bar = (y: number, h: number, color: string, t0: number) => (
    <div style={{ position: "absolute", left: X0, top: y, height: 90, width: tween(t, t0, t0 + 0.6, 0, h * PX), background: color, borderRadius: 14 }} />
  );
  return (
    <>
      <Headline>24 lb in the oven</Headline>
      {bar(480, 6, C.coral + "55", 0.05)}
      <At x={X0 + 6 * PX - 70} y={440}><Text size={44} color={C.coral}>6 h ✗</Text></At>
      {bar(640, 3, C.mint, 0.1)}
      <At x={X0 + 3 * PX + 90} y={685}><Text size={48} color={C.mint} font={F.bold}>3 h</Text></At>
      {bar(800, 4.76, C.amber, Math.max(0.2, tQuarters - 0.8))}
      <At x={X0 + 4.76 * PX + 120} y={845}><Appear at={tQuarters - 0.2} from="pop"><Text size={52} color={C.amber} font={F.bold}>4 h 45</Text></Appear></At>
      <Appear at={tUSDA - 0.1} from="fade">
        <div style={{ position: "absolute", left: X0 + 4.5 * PX, top: 760, width: 0.5 * PX, height: 180, background: C.ink + "30", border: `4px dashed ${C.ink}`, borderRadius: 8 }} />
      </Appear>
      <At x={540} y={1050}><Appear at={tFive - 0.3} from="up"><Chip color={C.mint} size={56}>USDA: 4½ to 5 h</Chip></Appear></At>
      <Sfx name="pack/kaching" at={tFive} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- thermometer
const CheckBody: React.FC = () => {
  const w = useW();
  const tTherm = w(["thermometer"], 1, 1.0), t165 = w(["165"], 1, 1.8);
  return (
    <>
      <Headline>Still: check it</Headline>
      <At x={540} y={640}><Appear at={tTherm - 0.3} from="drop"><Icon name="Thermometer" size={300} color={C.coral} /></Appear></At>
      <Punch at={t165}><At x={540} y={950}><Appear at={t165 - 0.2} from="slam"><Chip color={C.amber} size={80}>165°F</Chip></Appear></At></Punch>
      <At x={540} y={1090}><Appear at={t165 + 0.4} from="fade" sfx={null}><Text size={44} color={C.muted}>thickest part</Text></Appear></At>
      <Sfx name="pack/ding-short" at={t165} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- CTA: 8x as heavy?
const CtaBody: React.FC = () => {
  const w = useW();
  const t8 = w(["8"], 1, 1.0), tHow = w(["How"], 1, 2.4);
  return (
    <>
      <Headline>Your turn</Headline>
      <At x={540} y={640}><Appear at={t8 - 0.2} from="pop"><div style={{ fontFamily: F.bold, fontSize: 130, color: C.ink }}>8× the turkey</div></Appear></At>
      <At x={540} y={880}><Appear at={tHow - 0.2} from="slam"><div style={{ fontFamily: F.bold, fontSize: 120, color: C.amber }}>? × the time</div></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="middle"><MiddleBody /></Span>
    <Span from="thick"><ThickBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="square"><SquareBody /></Span>
    <Span from="math"><MathBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="check"><CheckBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
