// "Why the line with one full cart is faster": per-person overhead vs per-item time (Dan Meyer's 2009 checkout timing).
// versus hook -> you'd count items -> two clocks -> 3 s per item -> 48 s per person -> cart 3:18 -> baskets 5:12
// -> re-hook: what to count? -> 48 / 3 = 16 items per person -> 66 vs 104, cart wins until 88 -> count the people -> CTA subscribe
import React from "react";
import { Appear, At, C, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

// one shopper: a person icon with a cart or basket and an item count
const Shopper: React.FC<{ kind: "cart" | "basket"; items: number; size?: number; hi?: boolean; color?: string }> = ({ kind, items, size = 1, hi, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14 * size }}>
    <div style={{ width: 96 * size, height: 96 * size, borderRadius: "50%", background: hi ? C.amber : "#3d5266", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon name="User" size={60 * size} color={hi ? C.bg : C.ink} />
    </div>
    <Icon name={kind === "cart" ? "ShoppingCart" : "ShoppingBasket"} size={(kind === "cart" ? 120 : 80) * size} color={color ?? (kind === "cart" ? C.amber : C.mint)} />
    <div style={{ fontFamily: F.bold, fontSize: 46 * size, color: C.muted, whiteSpace: "nowrap" }}>{items}</div>
  </div>
);

// two lanes side by side: left = four baskets, right = one cart
const Lanes: React.FC<{ y?: number; scale?: number; t0?: number }> = ({ y = 760, scale = 1.35, t0 = -1 }) => (
  <>
    <At x={290} y={y} scale={scale}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start", padding: "24px 30px", borderLeft: `6px solid ${C.dim}`, borderRight: `6px solid ${C.dim}` }}>
        {[0, 1, 2, 3].map((i) => (t0 < 0 ? <Shopper key={i} kind="basket" items={10} /> :
          <Appear key={i} at={t0 + i * 0.15} from="left"><Shopper kind="basket" items={10} /></Appear>))}
      </div>
    </At>
    <At x={760} y={y} scale={scale}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 30px", borderLeft: `6px solid ${C.dim}`, borderRight: `6px solid ${C.dim}` }}>
        <Shopper kind="cart" items={50} />
      </div>
    </At>
  </>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tFast = at.word("faster", 1, 2.4);
  return (
    <>
      <Riser to={tFast} volume={0.45} />
      <HookText y={280} size={96}>{"4 baskets vs\n**1 full cart**"}</HookText>
      <Lanes y={750} scale={1.25} />
      <At x={540} y={1125}><Appear at={tFast - 0.5} from="slam"><Chip color={C.amber} size={60}>one is 2 minutes faster</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const at = useAt();
  const t40 = at.word("40", 1, 1.2), t50 = at.word("50", 1, 1.8), tWrong = at.word("wrong", 1, 3.0);
  return (
    <>
      <Headline>Count the items?</Headline>
      <Lanes y={610} scale={1.1} />
      <At x={290} y={960}><Appear at={t40 - 0.3} from="pop"><Text size={64} color={C.mint}>40 items</Text></Appear></At>
      <At x={760} y={960}><Appear at={t50 - 0.3} from="pop"><Text size={64} color={C.muted}>50 items</Text></Appear></At>
      <At x={540} y={1080}><Appear at={tWrong - 0.3} from="slam"><Chip color={C.coral} size={54}>wrong thing to count</Chip></Appear></At>
      <Sfx name="pack/wrong" at={tWrong - 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- context: two clocks
const ContextBody: React.FC = () => {
  const at = useAt();
  const tWatch = at.word("stopwatch", 1, 2.2), tTwo = at.word("two", 1, 3.8);
  return (
    <>
      <Headline>Timed with a stopwatch</Headline>
      <At x={540} y={600}><Appear at={0.05} from="pop"><Icon name="Timer" size={260} color={C.ink} /></Appear></At>
      <Sfx name="pack/clock" at={tWatch - 0.3} dur={1.5} volume={0.25} />
      <At x={320} y={940}><Appear at={tTwo - 0.2} from="left"><Chip color={C.mint} size={56}>clock 1: items</Chip></Appear></At>
      <At x={760} y={940}><Appear at={tTwo + 0.1} from="right"><Chip color={C.amber} size={56}>clock 2: people</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- clock one: items
const ScanBody: React.FC = () => {
  const t = useT();
  const at = useAt();
  const t3 = at.word("3", 1, 1.6);
  const n = Math.floor(tween(t, 0.3, 3.0, 0, 6));
  return (
    <>
      <Headline>Clock 1: every item</Headline>
      <At x={540} y={560}><div style={{ display: "flex", gap: 18 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ width: 120, height: 120, borderRadius: 16, background: i < n ? C.mint : C.dim, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="Package" size={70} color={i < n ? C.bg : C.muted} /></div>))}</div></At>
      <At x={540} y={800}><Icon name="ScanBarcode" size={160} color={C.mint} /></At>
      <At x={540} y={1030}><Appear at={t3 - 0.3} from="pop"><Text size={110} color={C.mint}>3 s <span style={{ fontSize: 60, color: C.muted }}>each</span></Text></Appear></At>
      {Array.from({ length: 6 }).map((_, i) => <Sfx key={i} name="pack/censor-2" at={0.3 + i * 0.45} volume={0.15} />)}
    </>
  );
};

// ---------------------------------------------------------------- clock two: people
const PersonBody: React.FC = () => {
  const at = useAt();
  const t48 = at.word("48", 1, 1.6);
  const words = ["hello", "pay", "bag", "receipt", "goodbye"];
  const ts = words.map((w, i) => at.word(w, 1, 3.0 + i * 0.5));
  const tOne = at.word("one", 1, 6.0);
  return (
    <>
      <Headline>Clock 2: every person</Headline>
      <At x={540} y={480}><Appear at={0.05} from="pop"><div style={{ width: 150, height: 150, borderRadius: "50%", background: C.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="User" size={96} color={C.bg} /></div></Appear></At>
      <At x={540} y={680}><Appear at={t48 - 0.3} from="slam"><Text size={130} color={C.amber}>48 s</Text></Appear></At>
      <At x={540} y={880}><div style={{ display: "flex", gap: 14, flexWrap: "wrap", width: 900, justifyContent: "center" }}>
        {words.map((w, i) => <Appear key={w} at={ts[i] - 0.15} from="up"><Chip color={C.dim} text={C.ink} size={44}>{w}</Chip></Appear>)}</div></At>
      <At x={540} y={1100}><Appear at={tOne - 0.4} from="up"><Text size={54} color={C.muted}>even with <span style={{ color: C.amber }}>1 item</span></Text></Appear></At>
    </>
  );
};

// a "line of math" row
const Row: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = C.ink, size = 72 }) => (
  <div style={{ fontFamily: F.bold, fontSize: size, color, whiteSpace: "nowrap" }}>{children}</div>
);

// ---------------------------------------------------------------- the cart
const CartBody: React.FC = () => {
  const at = useAt();
  const t150 = at.word("150", 1, 2.6), t48 = at.word("48", 1, 4.6), tTot = at.word("3", 1, 5.6);
  return (
    <>
      <Headline>Time the cart</Headline>
      <At x={540} y={460}><Shopper kind="cart" items={50} hi size={1.6} /></At>
      <At x={540} y={660}><Appear at={t150 - 0.6} from="left"><Row>50 × 3 s = <span style={{ color: C.mint }}>150 s</span></Row></Appear></At>
      <At x={540} y={780}><Appear at={t48 - 0.5} from="left"><Row>1 person = <span style={{ color: C.amber }}>48 s</span></Row></Appear></At>
      <At x={540} y={1000}><Appear at={tTot - 0.3} from="slam"><Text size={150} color={C.mint}>3:18</Text></Appear></At>
      <Sfx name="pack/ding" at={tTot} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- the baskets
const BasketsBody: React.FC = () => {
  const at = useAt();
  const t120 = at.word("120", 1, 2.0), t192 = at.word("192", 1, 4.4), tTot = at.word("5", 1, 5.6);
  return (
    <>
      <Headline>Now the baskets</Headline>
      <At x={540} y={460} scale={1.5}><div style={{ display: "flex", gap: 22 }}>
        {[0, 1, 2, 3].map((i) => <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#3d5266", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="User" size={56} /></div>
          <Icon name="ShoppingBasket" size={70} color={C.mint} /></div>)}</div></At>
      <At x={540} y={660}><Appear at={t120 - 0.6} from="left"><Row>40 × 3 s = <span style={{ color: C.mint }}>120 s</span></Row></Appear></At>
      <At x={540} y={780}><Appear at={t192 - 0.6} from="left"><Row>4 people = <span style={{ color: C.coral }}>192 s</span></Row></Appear></At>
      <At x={540} y={1000}><Appear at={tTot - 0.3} from="slam"><Text size={150} color={C.coral}>5:12</Text></Appear></At>
      <Sfx name="pack/wrong" at={tTot} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const at = useAt();
  const tInstead = at.word("instead", 1, 3.4);
  return (
    <>
      <Headline color={C.amber}>Fewer items. 2 min slower.</Headline>
      <At x={290} y={560}><Icon name="ShoppingBasket" size={150} color={C.mint} /></At>
      <At x={760} y={560}><Icon name="ShoppingCart" size={170} color={C.amber} /></At>
      <At x={290} y={790}><Text size={120} color={C.coral}>5:12</Text></At>
      <At x={760} y={790}><Text size={120} color={C.mint}>3:18</Text></At>
      <At x={540} y={1030}><Appear at={tInstead - 0.6} from="pop"><Text size={76}>so what do you <span style={{ color: C.amber }}>count?</span></Text></Appear></At>
      <Sfx name="pack/notify-idea" at={tInstead - 0.4} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- the rule: 1 person = 16 items
const RuleBody: React.FC = () => {
  const t = useT();
  const at = useAt();
  const t16 = at.word("16", 1, 1.8), tWorth = at.word("worth", 1, 3.6);
  const lit = Math.floor(tween(t, tWorth - 0.2, tWorth + 1.2, 0, 16));
  return (
    <>
      <At x={540} y={330}><Appear at={0.05} from="up"><Text size={110}>48 ÷ 3 = <span style={{ color: C.amber }}>16</span></Text></Appear></At>
      <Sfx name="pack/ding" at={t16} volume={0.3} />
      <At x={540} y={720}><Appear at={tWorth - 0.5} from="pop"><div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <div style={{ width: 150, height: 150, borderRadius: "50%", background: C.amber, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="User" size={96} color={C.bg} /></div>
        <Text size={90} color={C.muted}>=</Text>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 80px)", gap: 10 }}>
          {Array.from({ length: 16 }).map((_, i) => <div key={i} style={{ width: 80, height: 80, borderRadius: 12, background: i < lit ? C.mint : C.dim, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="Package" size={48} color={i < lit ? C.bg : C.muted} /></div>)}</div></div></Appear></At>
      <At x={540} y={1090}><Appear at={tWorth + 0.3} from="up"><Text size={62}>each person = <span style={{ color: C.amber }}>16 items</span></Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- convert: 66 vs 104, until 88
const ConvertBody: React.FC = () => {
  const t = useT();
  const at = useAt();
  const t66 = at.word("66", 1, 1.8), t104 = at.word("104", 1, 3.6), t88 = at.word("88", 1, 6.4);
  const bar = (label: string, v: number, tt: number, y: number, color: string) => (
    <div style={{ position: "absolute", left: 90, top: y }}>
      <div style={{ fontFamily: F.med, fontSize: 46, color: C.muted }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 6.6 * v * tween(t, tt - 0.6, tt + 0.1, 0, 1), height: 84, background: color, borderRadius: 12 }} />
        <Appear at={tt - 0.1} from="pop"><Text size={70} color={color}>{v}</Text></Appear>
      </div>
    </div>
  );
  return (
    <>
      <Headline>Waiting, in items</Headline>
      {bar("cart: 16 + 50", 66, t66, 430, C.mint)}
      {bar("baskets: 4 × 16 + 40", 104, t104, 640, C.coral)}
      <At x={540} y={1020}><Appear at={t88 - 0.8} from="slam"><Chip color={C.amber} size={58}>cart wins up to 88 items</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tPeople = at.word("people", 1, 1.6);
  return (
    <>
      <At x={540} y={420}><Text size={80} color={C.muted}><span style={{ textDecoration: "line-through" }}>count the items</span></Text></At>
      <At x={540} y={620}><Appear at={tPeople - 0.5} from="slam"><Text size={110}>count the <span style={{ color: C.amber }}>people</span></Text></Appear></At>
      <At x={540} y={900}><Appear at={tPeople - 0.2} from="up"><div style={{ display: "flex", gap: 20 }}>
        {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 120, height: 120, borderRadius: "50%", background: C.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="User" size={76} color={C.bg} /></div>)}</div></Appear></At>
      <Sfx name="pack/cash-register" at={tPeople} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const tB = at.word("baskets", 1, 1.6);
  return (
    <>
      <Lanes y={660} scale={1.15} />
      <At x={540} y={1060}><Appear at={tB - 0.6} from="up"><div style={{ textAlign: "center" }}><Text size={60}>would you have picked</Text><Text size={60} color={C.mint}>the baskets?</Text></div></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="scan"><ScanBody /></Span>
    <Span from="person"><PersonBody /></Span>
    <Span from="cart"><CartBody /></Span>
    <Span from="baskets"><BasketsBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="rule"><RuleBody /></Span>
    <Span from="convert"><ConvertBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
