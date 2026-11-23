// "Why 50% off plus 20% more isn't 70% off": stacked discounts multiply.
// versus hook (50% + 20% vs 70%, one $20 cheaper) -> feels like a tie, one is only 60% -> $200 coat, Black Friday
// -> half: $100 -> extra 20% of the new price: $80 -> 70%: $60 -> re-hook: does order help? -> 160 then 80
// -> 0.5 x 0.8 = 0.4, pay 40% = 60% off -> stacks land short by 10 points -> CTA 30% + 30%? (51%)
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// ---------------------------------------------------------------- pieces
const Tag: React.FC<{ top: string; price: string; color?: string; s?: number }> = ({ top, price, color = C.amber, s = 1 }) => (
  <div style={{ position: "relative", width: 380 * s, padding: `${34 * s}px ${20 * s}px`, borderRadius: 26 * s, background: "#1b202b", border: `6px solid ${color}`,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 12 * s, boxShadow: "0 18px 50px #000a" }}>
    <div style={{ position: "absolute", top: 18 * s, left: 22 * s, width: 30 * s, height: 30 * s, borderRadius: "50%", border: `5px solid ${C.muted}` }} />
    <div style={{ fontFamily: F.bold, fontSize: 60 * s, color, textAlign: "center", lineHeight: 1.1, whiteSpace: "pre-line" }}>{top}</div>
    <div style={{ fontFamily: F.bold, fontSize: 96 * s, color: C.ink }}>{price}</div>
  </div>
);
// A price bar: full width = $200
const PX = 3.6, X0 = 180;
const PriceBar: React.FC<{ y: number; value: number; color: string; t0: number; from?: number; label?: string; show?: number }> = ({ y, value, color, t0, from = 200, label, show = -1 }) => {
  const t = useT();
  if (t < show) return null;
  const v = tween(t, t0, t0 + 0.7, from, value);
  return (
    <>
      <div style={{ position: "absolute", left: X0, top: y, width: 200 * PX, height: 90, borderRadius: 18, background: C.dim }} />
      <div style={{ position: "absolute", left: X0, top: y, width: v * PX, height: 90, borderRadius: 18, background: color }} />
      <div style={{ position: "absolute", left: X0 + v * PX + 18, top: y + 10, fontFamily: F.bold, fontSize: 60, color: C.ink, whiteSpace: "nowrap" }}>${Math.round(v)}</div>
      {label ? <div style={{ position: "absolute", left: X0, top: y - 58, fontFamily: F.med, fontSize: 44, color: C.muted }}>{label}</div> : null}
    </>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t70 = w(["70%", "70"], 1, 1.4), t20 = w(["Pick"], 1, 2.0);
  return (
    <>
      <HookText y={260} size={92}>{"**50% + 20%** off\nvs **70%** off"}</HookText>
      <Riser to={t20} volume={0.45} />
      <Camera keys={[[0, { zoom: 1 }], [t20 + 0.8, { zoom: 1.05 }]]}>
        <At x={290} y={790} rotate={-4 + Math.sin(t * 3) * 1.5}><Appear at={0} from="pop"><Tag top={"50% off\n+20% more"} price="$80" color={C.mint} s={0.9} /></Appear></At>
        <At x={790} y={790} rotate={4 - Math.sin(t * 3) * 1.5}><Appear at={0} from="pop" sfx={null}><Tag top="70% off" price="$60" s={0.9} /></Appear></At>
        <At x={540} y={1030}><Appear at={Math.max(t70, t20 - 0.3)} from="slam"><Chip color={C.amber} size={56}>$20 apart</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/kaching" at={t20} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rule out: feels like a tie
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tTie = w(["tie"], 1, 1.6), tIsnt = w(["isn't"], 1, 2.4), t60 = w(["60%", "60"], 1, 3.8);
  return (
    <>
      <Headline>50 + 20 = 70?</Headline>
      <At x={540} y={560}><Appear at={0.05} from="left"><div style={{ fontFamily: F.mono, fontSize: 96, color: C.ink, whiteSpace: "nowrap" }}>50% + 20% = 70%</div></Appear></At>
      <At x={540} y={760}><Appear at={tTie - 0.2} from="pop"><Text size={60} color={C.muted}>feels like a tie</Text></Appear></At>
      <At x={540} y={1010}><Appear at={Math.min(tIsnt, t60 - 0.4)} from="slam"><Stamp color={C.coral} size={96}>ONLY 60%</Stamp></Appear></At>
      <Sfx name="pack/wrong" at={t60} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- context: $200 coat
const ContextBody: React.FC = () => {
  const w = useW();
  const t200 = w(["$200", "200"], 1, 0.8), tBF = w(["Black"], 1, 1.6);
  return (
    <>
      <Headline>Your coat</Headline>
      <At x={540} y={640}><Appear at={0.05} from="drop"><Icon name="Shirt" size={300} color={C.ink} /></Appear></At>
      <Punch at={t200}><At x={540} y={900}><Appear at={t200 - 0.2} from="slam"><div style={{ fontFamily: F.bold, fontSize: 130, color: C.ink }}>$200</div></Appear></At></Punch>
      <At x={540} y={1070}><Appear at={tBF - 0.1} from="up"><Chip color={C.coral} size={52}>Black Friday</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- half, then extra 20%, then 70%
const HalfBody: React.FC = () => {
  const w = useW();
  const tHalf = w(["half"], 1, 0.5), t100 = w(["$100", "100"], 1, 2.2);
  return (
    <>
      <Headline>Half off first</Headline>
      <PriceBar y={560} value={100} color={C.mint} t0={tHalf + 0.2} label="50% off" />
      <Punch at={t100}><At x={540} y={900}><Appear at={t100 - 0.3} from="slam"><div style={{ fontFamily: F.mono, fontSize: 90, color: C.ink, whiteSpace: "nowrap" }}>$200 → <span style={{ color: C.mint }}>$100</span></div></Appear></At></Punch>
    </>
  );
};
const ExtraBody: React.FC = () => {
  const w = useW();
  const tNew = w(["new"], 1, 1.4), tOld = w(["old"], 1, 2.6), t20 = w(["$20", "20"], 2, 3.6), t80 = w(["$80", "80"], 1, 4.6);
  return (
    <>
      <Headline>Then 20% more</Headline>
      <PriceBar y={480} value={100} from={100} color={C.mint} t0={0} label="after half off" />
      <At x={540} y={700}><Appear at={tNew - 0.2} from="pop"><Chip color={C.amber} size={52}>20% of $100, not of $200</Chip></Appear></At>
      <At x={540} y={810}><Appear at={tOld} from="fade" sfx={null}><Text size={44} color={C.muted}>(not $40)</Text></Appear></At>
      <PriceBar y={950} value={80} from={100} color={C.mint} t0={Math.max(t20, tOld + 0.4)} label="you pay" show={tOld} />
      <Sfx name="pack/kaching" at={t80} volume={0.3} />
    </>
  );
};
const SeventyBody: React.FC = () => {
  const w = useW();
  const tFull = w(["full"], 1, 0.9), t60 = w(["$60", "60"], 1, 2.0), tLess = w(["less"], 1, 3.0);
  return (
    <>
      <Headline>Or 70% off</Headline>
      <PriceBar y={480} value={80} from={80} color={C.mint} t0={0} label="50% + 20%" />
      <PriceBar y={760} value={60} color={C.amber} t0={tFull} label="70% off" show={tFull - 0.6} />
      <Punch at={tLess}><At x={540} y={1040}><Appear at={tLess - 0.3} from="slam"><Chip color={C.amber} size={66}>$20 less</Chip></Appear></At></Punch>
      <Sfx name="pack/click-hard" at={t60} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook: does the order help?
const RehookBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tSwap = w(["Swap"], 1, 1.4);
  const k = tween(t, tSwap, tSwap + 0.7, 0, 1);
  return (
    <>
      <Headline color={C.amber}>Does order help?</Headline>
      <At x={300 + 480 * k} y={700}><Chip color={C.mint} size={80}>−50%</Chip></At>
      <At x={780 - 480 * k} y={700}><Chip color={C.amber} size={80}>−20%</Chip></At>
      <At x={540} y={950}><Appear at={tSwap - 0.1} from="pop"><Icon name="ArrowLeftRight" size={140} color={C.ink} /></Appear></At>
      <Sfx name="pack/whoosh-soft" at={tSwap} volume={0.3} />
    </>
  );
};
const SwapBody: React.FC = () => {
  const w = useW();
  const t160 = w(["$160", "160"], 1, 1.4), tHalf = w(["half"], 1, 2.0), tSame = w(["same"], 1, 3.6);
  return (
    <>
      <Headline>20% first</Headline>
      <PriceBar y={480} value={160} color={C.amber} t0={0.3} label="20% off" />
      <PriceBar y={720} value={80} from={160} color={C.mint} t0={tHalf} label="then half" show={tHalf - 0.4} />
      <Punch at={tSame}><At x={540} y={1020}><Appear at={tSame - 0.3} from="slam"><Chip color={C.mint} size={66}>still $80</Chip></Appear></At></Punch>
      <Sfx name="pack/click-soft" at={t160} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- why: multiply what's left
const WhyBody: React.FC = () => {
  const w = useW();
  const tLeft = w(["left"], 1, 1.4), t04 = w(["0.4"], 1, 3.2), t40 = w(["40%", "40"], 1, 4.2), t60 = w(["60%", "60"], 1, 5.4);
  return (
    <>
      <Headline>Each cut is of what's left</Headline>
      <At x={540} y={540}><Appear at={tLeft - 0.3} from="up"><div style={{ fontFamily: F.mono, fontSize: 92, color: C.ink, whiteSpace: "nowrap" }}>0.5 × 0.8 = <span style={{ color: C.amber }}>0.4</span></div></Appear></At>
      <At x={540} y={700}><Appear at={t04} from="fade" sfx={null}><Text size={46} color={C.muted}>half kept × 80% kept</Text></Appear></At>
      <At x={540} y={860}><Appear at={t40 - 0.2} from="pop"><Text size={80} font={F.bold}>you pay 40%</Text></Appear></At>
      <Punch at={t60}><At x={540} y={1040}><Appear at={t60 - 0.3} from="slam"><Chip color={C.amber} size={76}>= 60% off</Chip></Appear></At></Punch>
      <Sfx name="pack/correct" at={t60} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const tShort = w(["short"], 1, 1.6), t10 = w(["10"], 1, 3.0);
  return (
    <>
      <Headline>Stacks land short</Headline>
      <At x={540} y={560}><Appear at={0.05} from="left"><div style={{ fontFamily: F.mono, fontSize: 80, color: C.muted, whiteSpace: "nowrap", textDecoration: "line-through" }}>50 + 20 = 70</div></Appear></At>
      <At x={540} y={740}><Appear at={tShort - 0.2} from="pop"><div style={{ fontFamily: F.mono, fontSize: 80, color: C.ink, whiteSpace: "nowrap" }}>real: <span style={{ color: C.amber }}>60</span></div></Appear></At>
      <Punch at={t10}><At x={540} y={960}><Appear at={t10 - 0.3} from="slam"><Chip color={C.coral} size={64}>−10 points (50% × 20%)</Chip></Appear></At></Punch>
    </>
  );
};

// ---------------------------------------------------------------- CTA: 30% + 30%?
const CtaBody: React.FC = () => {
  const w = useW();
  const t30 = w(["30%", "30"], 1, 0.4), tReal = w(["real"], 1, 2.4);
  return (
    <>
      <Headline>Your turn</Headline>
      <At x={540} y={640}><Appear at={t30 - 0.1} from="pop"><div style={{ fontFamily: F.bold, fontSize: 100, color: C.ink, whiteSpace: "nowrap" }}>30% + 30%</div></Appear></At>
      <At x={540} y={900}><Appear at={tReal - 0.3} from="slam"><div style={{ fontFamily: F.bold, fontSize: 110, color: C.amber, whiteSpace: "nowrap" }}>= ?% off</div></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="half"><HalfBody /></Span>
    <Span from="extra"><ExtraBody /></Span>
    <Span from="seventy"><SeventyBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="swap"><SwapBody /></Span>
    <Span from="why"><WhyBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
