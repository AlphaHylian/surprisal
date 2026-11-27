// "Why splitting the bill makes everyone pay more": the unscrupulous diner's dilemma (Gneezy, Haruvy & Yafe 2004).
// versus hook -> same menu, the rule changes what you order -> six of you, $12 dessert -> own: costs 12 -> split: costs 2
// -> re-hook: all six did the same math -> 6 desserts, $72, your share 12 -> Haifa: 37 / 51 / 82 shekels -> 4 in 5
// preferred own -> splitting shares the temptation, a quarter less -> CTA subscribe
import React from "react";
import { Appear, At, C, Chip, Counter, F, Headline, HookText, Icon, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// A round table seen from above with six seats; `desserts` = how many seats have a cake (0..6), `you` highlights seat 0.
const Table: React.FC<{ r?: number; desserts?: number; you?: boolean; dim?: number }> = ({ r = 230, desserts = 0, you = true, dim = 1 }) => {
  const seats = Array.from({ length: 6 }, (_, i) => {
    const a = -Math.PI / 2 + Math.PI + (i * Math.PI * 2) / 6; // seat 0 at the bottom
    return [Math.cos(a), Math.sin(a)];
  });
  const S = r * 2 + 260;
  return (
    <div style={{ position: "relative", width: S, height: S, opacity: dim }}>
      <div style={{ position: "absolute", left: 130, top: 130, width: 2 * r, height: 2 * r, borderRadius: "50%", background: "#5a3d26", border: `8px solid #7a5535`, boxShadow: "0 20px 40px #0009" }} />
      {seats.map(([cx, cy], i) => {
        const px = S / 2 + cx * (r + 75), py = S / 2 + cy * (r + 75);
        const dx = S / 2 + cx * (r - 70), dy = S / 2 + cy * (r - 70);
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: px - 55, top: py - 55, width: 110, height: 110, borderRadius: "50%",
              background: i === 0 && you ? C.amber : "#3d5266", border: `4px solid ${i === 0 && you ? C.amber : C.muted}`,
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="User" size={66} color={i === 0 && you ? C.bg : C.ink} />
            </div>
            <div style={{ position: "absolute", left: dx - 48, top: dy - 48, width: 96, height: 96, borderRadius: "50%", background: "#e9e4da", border: "3px solid #bdb6a8",
              display: "flex", alignItems: "center", justifyContent: "center" }}>
              {i < desserts ? <Icon name="CakeSlice" size={62} color={C.coral} stroke={2.5} /> : null}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const tThird = w(["third"], 1, 2.0);
  return (
    <>
      <Riser to={tThird} volume={0.45} />
      <HookText y={280} size={96}>{"Split it vs\n**pay your own**"}</HookText>
      <At x={540} y={760} scale={0.78}><Table desserts={6} you={false} /></At>
      <At x={540} y={760}><Appear at={0} from="pop"><Icon name="Receipt" size={170} color={C.ink} /></Appear></At>
      <At x={540} y={1110}><Appear at={tThird - 0.3} from="slam"><Chip color={C.amber} size={62}>one costs a third more</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tMenu = w(["menu,"], 1, 0.4), tPrices = w(["prices,"], 1, 1.1), tPeople = w(["people."], 1, 1.8), tOrder = w(["order."], 1, 4.0);
  const item = (t: number, icon: string, label: string, y: number) => (
    <At x={540} y={y}><Appear at={t - 0.2} from="left"><div style={{ display: "flex", alignItems: "center", gap: 26, width: 620 }}>
      <Icon name={icon} size={80} color={C.mint} /><Text size={60}>{label}</Text><Icon name="Check" size={70} color={C.mint} /></div></Appear></At>
  );
  return (
    <>
      <Headline>Only one thing changes</Headline>
      {item(tMenu, "BookOpen", "same menu", 450)}
      {item(tPrices, "Tag", "same prices", 600)}
      {item(tPeople, "Users", "same people", 750)}
      <At x={540} y={980}><Appear at={tOrder - 0.6} from="slam"><Chip color={C.amber} size={64}>what you order</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- context
const ContextBody: React.FC = () => {
  const w = useW();
  const tDes = w(["dessert."], 1, 2.4);
  return (
    <>
      <Headline>Six of you. One dessert.</Headline>
      <At x={540} y={700} scale={0.8}><Table desserts={0} /></At>
      <At x={540} y={700}><Appear at={tDes - 0.6} from="drop"><div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Icon name="CakeSlice" size={120} color={C.coral} /><Text size={60} color={C.amber}>$12</Text></div></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- paying your own
const OwnBody: React.FC = () => {
  const w = useW();
  const t12 = w(["12."], 1, 1.4), tSkip = w(["Skip"], 1, 2.2);
  return (
    <>
      <Headline>Paying your own</Headline>
      <At x={540} y={560}><Icon name="CakeSlice" size={220} color={C.coral} /></At>
      <At x={540} y={820}><Appear at={t12 - 0.3} from="pop"><Text size={64} color={C.muted}>costs you <span style={{ color: C.coral, fontSize: 110 }}>$12</span></Text></Appear></At>
      <At x={540} y={1030}><Appear at={tSkip - 0.2} from="slam"><Chip color={C.ink} size={60}>skip it</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- splitting six ways
const SplitBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t2 = w(["2."], 1, 1.6), t10 = w(["10."], 1, 3.6), tOrder = w(["Order"], 1, 4.4);
  const n = Math.floor(tween(t, t2 - 0.6, t2 + 0.3, 1, 6));
  return (
    <>
      <Headline>Splitting six ways</Headline>
      <div style={{ position: "absolute", left: 90, top: 440, width: 900, display: "flex", gap: 12 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 150, borderRadius: 14, background: i === 0 ? C.amber : i < n ? "#3d5266" : "transparent",
            border: `4px solid ${i === 0 ? C.amber : C.muted}`, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: F.bold, fontSize: 58, color: i === 0 ? C.bg : C.ink }}>$2</div>))}
      </div>
      <At x={185} y={660}><Text size={46} color={C.amber}>you</Text></At>
      <At x={620} y={660}><Appear at={t10 - 0.5} from="up"><Text size={46} color={C.muted}>your friends: $10</Text></Appear></At>
      <At x={540} y={850}><Appear at={t2 - 0.3} from="pop"><Text size={64} color={C.muted}>costs you <span style={{ color: C.mint, fontSize: 110 }}>$2</span></Text></Appear></At>
      <At x={540} y={1050}><Appear at={tOrder - 0.2} from="slam"><Chip color={C.mint} size={60}>order it</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tSix = w(["six"], 1, 1.6), tMath = w(["math."], 1, 3.0);
  const k = Math.floor(tween(t, tSix - 0.2, tMath, 1, 6));
  return (
    <>
      <Headline color={C.amber}>Everyone did the same math</Headline>
      <At x={540} y={720} scale={0.85}><Table desserts={k} you /></At>
      <Sfx name="pack/notify-idea" at={tMath - 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- six desserts
const SixBody: React.FC = () => {
  const w = useW();
  const t72 = w(["72"], 1, 1.4), t12 = w(["12."], 1, 3.0), tFull = w(["Full"], 1, 3.6), t2 = w(["2"], 2, 6.0);
  return (
    <>
      <Headline>The bill arrives</Headline>
      <At x={540} y={440}><div style={{ display: "flex", gap: 14 }}>
        {Array.from({ length: 6 }).map((_, i) => <Appear key={i} at={0.05 + i * 0.12} from="drop"><Icon name="CakeSlice" size={110} color={C.coral} /></Appear>)}</div></At>
      <At x={540} y={630}><Appear at={t72 - 0.3} from="pop"><Text size={90}>6 × $12 = <span style={{ color: C.coral }}>$72</span></Text></Appear></At>
      <At x={540} y={790}><Appear at={t12 - 0.3} from="up"><Text size={70}>your share: <span style={{ color: C.coral }}>$12</span></Text></Appear></At>
      <At x={540} y={990}><Appear at={tFull - 0.2} from="slam"><Chip color={C.amber} size={56}>full price for a $2 want</Chip></Appear></At>
      <Sfx name="pack/cash-register" at={t72 - 0.2} volume={0.35} />
      <Sfx name="pack/ding-short" at={t2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- the real study
const StudyBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t37 = w(["37"], 1, 4.6), t51 = w(["51."], 1, 6.2), t82 = w(["82."], 1, 7.2);
  const bar = (label: string, v: number, at: number, y: number, color: string) => (
    <div style={{ position: "absolute", left: 90, top: y }}>
      <div style={{ fontFamily: F.med, fontSize: 46, color: C.muted }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 8.4 * v * tween(t, at - 0.5, at + 0.2, 0, 1), height: 80, background: color, borderRadius: 12 }} />
        <Appear at={at - 0.1} from="pop"><Text size={64} color={color}>{v}</Text></Appear>
      </div>
    </div>
  );
  return (
    <>
      <Headline>Tested: a restaurant in Israel</Headline>
      <At x={540} y={400}><Appear at={0.1} from="up"><div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Icon name="Users" size={60} color={C.ink} /><Text size={46} color={C.muted}>tables of 6 strangers · shekels each</Text></div></Appear></At>
      {bar("pay your own", 37, t37, 490, C.mint)}
      {bar("split evenly", 51, t51, 680, C.amber)}
      {bar("free", 82, t82, 870, C.coral)}
      <At x={540} y={1120}><Text size={40} color={C.muted}>Gneezy, Haruvy & Yafe, 2004</Text></At>
    </>
  );
};

// ---------------------------------------------------------------- they preferred paying their own
const PrefBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t4 = w(["4"], 1, 1.4), tOwn = w(["own."], 1, 3.0);
  const lit = Math.floor(tween(t, t4 - 0.3, tOwn, 0, 4));
  return (
    <>
      <Headline>Before ordering</Headline>
      <At x={540} y={620}><div style={{ display: "flex", gap: 24 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ width: 150, height: 150, borderRadius: "50%", background: i < lit ? C.mint : "#3d5266", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="User" size={90} color={i < lit ? C.bg : C.ink} /></div>))}</div></At>
      <At x={540} y={860}><Appear at={t4 - 0.2} from="up"><Text size={72}><span style={{ color: C.mint }}>4 in 5</span> would rather</Text></Appear></At>
      <At x={540} y={970}><Appear at={tOwn - 0.6} from="up"><Text size={72} color={C.mint}>pay their own</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const tTempt = w(["temptation."], 1, 3.0), tQuarter = w(["quarter"], 1, 5.4);
  return (
    <>
      <At x={540} y={730} scale={0.8}><Table desserts={1} /></At>
      <At x={540} y={330}><Appear at={0.05} from="up"><Text size={64}>splitting shares the <span style={{ color: C.coral }}>temptation</span></Text></Appear></At>
      <At x={540} y={1110}><Appear at={tQuarter - 0.3} from="slam"><Chip color={C.amber} size={64}>a quarter less</Chip></Appear></At>
      <Sfx name="pack/ding" at={tTempt} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tDes = w(["dessert."], 1, 1.8);
  return (
    <>
      <At x={540} y={620}><Appear at={0.05} from="pop"><Icon name="CakeSlice" size={260} color={C.coral} /></Appear></At>
      <At x={540} y={900}><Appear at={tDes - 0.5} from="up"><Text size={68}>would you have <span style={{ color: C.amber }}>ordered it?</span></Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="own"><OwnBody /></Span>
    <Span from="split"><SplitBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="six"><SixBody /></Span>
    <Span from="study"><StudyBody /></Span>
    <Span from="pref"><PrefBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
