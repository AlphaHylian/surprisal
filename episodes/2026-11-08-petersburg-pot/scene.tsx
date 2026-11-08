// "An infinite payout that's worth about $30": the St. Petersburg paradox (Nicolaus Bernoulli, 1713).
// versus hook -> fair coin, 1713 -> rules (pot doubles, heads pays) -> every round adds $1 = infinite
// -> re-hook: nobody pays $25 -> a million games -> round 30 passes a billion -> a billionaire covers 30 rounds = $30
// -> payoff: world economy under $50 -> CTA millionaire
import React from "react";
import { Appear, At, C, Camera, Ticks, Card, Chip, Counter, Emoji, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT } from "../kit";

// a coin that spins (squashes on its vertical axis)
const Coin: React.FC<{ size?: number; spin?: number; t0?: number }> = ({ size = 180, spin = 2.2, t0 = 0 }) => {
  const t = useT();
  const sx = Math.abs(Math.cos(Math.max(0, t - t0) * Math.PI * spin));
  return <div style={{ transform: `scaleX(${0.15 + 0.85 * sx})` }}><Emoji char="🪙" size={size} /></div>;
};

// pots as bars, doubling (drawn on a log scale so they fit)
const Pots: React.FC<{ n: number; payable?: number; y?: number; t0?: number; cut?: number }> = ({ n, payable = 99, y = 1120, t0 = 0, cut }) => {
  const t = useT();
  const w = 96, gap = 18, x0 = 540 - (n * w + (n - 1) * gap) / 2;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const h = 60 + i * 60;
        const grow = t0 <= 0.001 ? 1 : tween(t, t0 + i * 0.08, t0 + i * 0.08 + 0.4, 0, 1);
        const lost = cut !== undefined && i >= payable && t >= cut;
        const col = lost ? C.coral : i === n - 1 ? C.amber : C.mint;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x0 + i * (w + gap), top: y - h * grow, width: w, height: h * grow, borderRadius: 14,
              background: `${col}${lost ? "55" : "cc"}`, border: `3px solid ${col}` }} />
            <At x={x0 + i * (w + gap) + w / 2} y={y - h * grow - 34}>
              <Text size={40} color={col} font={F.bold}>{grow > 0.5 ? `$${2 ** (i + 1)}` : ""}</Text>
            </At>
          </React.Fragment>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tWorth = at.word("worth", 1, 1.6);
  return (
    <>
      <HookText>{"Average: **infinite**\nWorth: **$30**"}</HookText>
      <Riser to={tWorth} volume={0.45} />
      <At x={540} y={600}><Coin size={170} /></At>
      <Pots n={7} y={1110} />
      <Sfx name="pack/kaching" at={tWorth} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- rule out a trick
const RuleBody: React.FC = () => {
  const at = useAt();
  const tYear = at.word("1713", 1, 2.4);
  return (
    <>
      <Headline>A fair coin</Headline>
      <At x={540} y={620}><Coin size={260} spin={1.2} /></At>
      <At x={540} y={880}><Appear at={0.15} from="slam"><Chip color={C.mint} size={56}>no trick</Chip></Appear></At>
      <At x={540} y={1050}><Appear at={tYear - 0.2} from="up"><Text size={54} color={C.muted}>Nicolaus Bernoulli, <span style={{ color: C.amber }}>1713</span></Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- rules: tails doubles, heads pays
const Flip: React.FC<{ s: string; at: number; x: number }> = ({ s, at, x }) => (
  <At x={x} y={560}>
    <Appear at={at} from="pop">
      <div style={{ width: 150, height: 150, borderRadius: 75, border: `6px solid ${s === "H" ? C.mint : C.muted}`, background: `${C.panel}ee`,
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.bold, fontSize: 80, color: s === "H" ? C.mint : C.ink }}>{s}</div>
    </Appear>
  </At>
);
const RulesBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t2 = at.word("2", 1, 1.2), tDbl = at.word("doubles", 1, 2.4), tHeads = at.word("heads", 1, 3.6), tTake = at.word("take", 1, 4.8);
  const tails = [tDbl - 0.3, tDbl + 0.25, tDbl + 0.8];
  const nT = tails.filter((x) => t >= x).length;
  const pot = 2 * 2 ** nT;
  const xs = [210, 430, 650, 870];
  return (
    <>
      <Headline>The game</Headline>
      {tails.map((x, i) => <Flip key={i} s="T" at={x} x={xs[i]} />)}
      <Flip s="H" at={tHeads - 0.15} x={xs[3]} />
      <At x={540} y={790}><Appear at={t2 - 0.2} from="fade" sfx={null}><Text size={48} color={C.muted}>the pot</Text></Appear></At>
      {t >= t2 - 0.2 && (
        <At x={540} y={920}>
          <Punch at={tails[Math.max(0, nT - 1)] ?? 0}>
            <Text size={150} color={t >= tHeads ? C.amber : C.ink} glow={t >= tHeads}>${pot}</Text>
          </Punch>
        </At>
      )}
      <At x={540} y={1100}><Appear at={tTake - 0.2} from="up"><Chip color={C.mint} size={54}>heads: you take it</Chip></Appear></At>
      {tails.map((x, i) => <Sfx key={i} name="pack/cash-ting" at={x} volume={0.3} />)}
    </>
  );
};

// ---------------------------------------------------------------- every round adds $1
const AvgRow: React.FC<{ y: number; p: string; pay: string; at: number }> = ({ y, p, pay, at }) => (
  <At x={540} y={y}>
    <Appear at={at} from="left">
      <Card w={820} pad={22}>
        <Text size={60} font={F.mono}>{p} × {pay} = <span style={{ color: C.mint }}>$1</span></Text>
      </Card>
    </Appear>
  </At>
);
const AverageBody: React.FC = () => {
  const at = useAt();
  const tHalf = at.word("Half", 1, 0.3), tQ = at.word("quarter", 1, 2.4), tEvery = at.word("Every", 1, 4.4), tFor = at.word("forever", 1, 6.0);
  return (
    <>
      <Headline>The average payout</Headline>
      <Camera keys={[[0, { zoom: 1.05, y: 560 }], [tEvery, { zoom: 1.05, y: 560 }], [tFor, { zoom: 0.95, y: 700 }]]}>
        <AvgRow y={460} p="½" pay="$2" at={tHalf - 0.1} />
        <AvgRow y={620} p="¼" pay="$4" at={tQ - 0.1} />
        <AvgRow y={780} p="⅛" pay="$8" at={tEvery - 0.1} />
        <AvgRow y={940} p="1/16" pay="$16" at={tEvery + 0.4} />
        <At x={540} y={1100}><Punch at={tFor}><Appear at={tFor - 0.15} from="slam"><Text size={68} color={C.amber} glow>1 + 1 + 1 + … = infinite</Text></Appear></Punch></At>
      </Camera>
      <Sfx name="pack/kaching" at={tFor} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook: nobody pays $25
const RehookBody: React.FC = () => {
  const at = useAt();
  const t25 = at.word("25", 1, 2.2), tRight = at.word("right", 1, 3.6);
  return (
    <>
      <Headline color={C.coral}>Pay any price?</Headline>
      <At x={540} y={560}><Appear at={0.1} from="pop"><Text size={200}>$25</Text></Appear></At>
      <At x={540} y={790}><Appear at={t25 + 0.1} from="slam"><Stamp size={100}>NOBODY</Stamp></Appear></At>
      <At x={540} y={1010}><Appear at={tRight - 0.2} from="up"><Text size={64} color={C.mint}>…and they're right</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- a million games
const SIM = [["$2", 0.5], ["$4", 0.25], ["$8", 0.125], ["$16", 0.0625], ["$32", 0.03125], ["more", 0.03125]] as const;
const SimBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tMil = at.word("million", 1, 0.8), tHalf = at.word("Half", 1, 2.0), t32 = at.word("32", 1, 3.6);
  return (
    <>
      <Headline>1,000,000 games</Headline>
      {SIM.map(([lab, f], i) => {
        const y = 520 + i * 105;
        const w = 620 * (f / 0.5) * tween(t, tMil + 0.2 + i * 0.1, tMil + 0.8 + i * 0.1, 0, 1);
        const col = i === 0 && t >= tHalf ? C.mint : i === 5 && t >= t32 ? C.amber : C.muted;
        return (
          <React.Fragment key={lab}>
            <At x={175} y={y}><Text size={46} color={col} font={F.bold}>{lab}</Text></At>
            <div style={{ position: "absolute", left: 270, top: y - 32, width: Math.max(6, w), height: 64, borderRadius: 12, background: col, opacity: 0.85 }} />
          </React.Fragment>
        );
      })}
      <At x={690} y={520}><Appear at={tHalf - 0.1} from="pop"><Chip color={C.mint} size={48}>half</Chip></Appear></At>
      <At x={560} y={1045}><Appear at={t32 - 0.1} from="pop"><Chip color={C.amber} size={48}>1 in 32</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- the infinity is in giant pots
const BankBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t30 = at.word("30", 1, 2.4), tBil = at.word("billion", 1, 3.6);
  const rnd = Math.round(tween(t, 0.3, t30, 1, 30));
  return (
    <>
      <Headline>Where the infinity lives</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t30, { zoom: 1 }], [tBil + 0.3, { zoom: 1.12, y: 700 }]]}>
        <At x={540} y={540}><Text size={56} color={C.muted}>round <span style={{ color: C.ink }}>{rnd}</span></Text></At>
        <At x={540} y={740}><Text size={104} color={C.amber} font={F.bold} style={{ fontVariantNumeric: "tabular-nums" }}>${(2 ** rnd).toLocaleString("en-US")}</Text></At>
        <Ticks t0={0.3} t1={t30} every={Math.max(0.05, (t30 - 0.3) / 29)} />
        <At x={540} y={930}><Appear at={tBil} from="up"><Text size={56}>pot <span style={{ color: C.amber }}>&gt; a billion</span></Text></Appear></At>
      </Camera>
      <Sfx name="pack/cash-register" at={tBil} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- a billionaire covers 30 rounds
const CapBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tBill = at.word("billionaire", 1, 1.0), tFirst = at.word("first", 1, 2.2), tEach = at.word("each", 1, 3.6), t30 = at.word("30", 2, 4.8);
  const cols = 10, size = 76, gap = 10, x0 = 540 - (cols * size + (cols - 1) * gap) / 2;
  return (
    <>
      <Headline>Who pays you?</Headline>
      <At x={540} y={450}><Appear at={tBill - 0.2} from="drop"><Card w={720} pad={18}><Text size={54}><Icon name="Landmark" size={56} color={C.mint} /> bank: $1 billion</Text></Card></Appear></At>
      {Array.from({ length: 40 }, (_, i) => {
        const on = t >= tFirst - 0.2 + i * 0.03;
        const lost = i >= 30;
        const col = lost ? C.coral : C.mint;
        const r = Math.floor(i / cols), c = i % cols;
        return on ? (
          <div key={i} style={{ position: "absolute", left: x0 + c * (size + gap), top: 590 + r * (size + gap), width: size, height: size, borderRadius: 12,
            background: lost ? `${C.coral}33` : `${C.mint}bb`, border: `3px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: F.bold, fontSize: 30, color: lost ? C.coral : C.bg }}>{lost ? "✗" : t >= tEach - 0.2 ? "$1" : i + 1}</div>
        ) : null;
      })}
      <At x={540} y={1060}><Punch at={t30}><Appear at={t30 - 0.15} from="slam"><Text size={110} color={C.amber} glow>= $30</Text></Appear></Punch></At>
      <Sfx name="pack/kaching" at={t30} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tWorld = at.word("world's", 1, 0.6), t50 = at.word("50", 1, 2.4), tTable = at.word("table", 1, 4.0);
  return (
    <>
      <Headline color={C.amber}>Never on the table</Headline>
      <At x={540} y={520}><Appear at={0.1} from="left"><Card w={860}><Text size={56}>billionaire: <span style={{ color: C.amber }}>$30</span></Text></Card></Appear></At>
      <At x={540} y={720}><Appear at={tWorld - 0.1} from="right"><Card w={860}><Text size={56}>world economy: <span style={{ color: C.amber }}>under $50</span></Text></Card></Appear></At>
      <At x={540} y={960}><Appear at={t50 + 0.5} from="pop"><Text size={110} color={C.coral} style={{ textDecoration: "line-through" }}>infinite</Text></Appear></At>
      <Sfx name="pack/whoosh-short" at={tTable - 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const tMil = at.word("millionaire", 1, 0.8), tFair = at.word("fair", 1, 2.2);
  return (
    <>
      <Headline>Your turn</Headline>
      <At x={540} y={560}><Appear at={tMil - 0.2} from="drop"><Card w={820}><Text size={58}><Icon name="Landmark" size={58} color={C.mint} /> bank: $1,000,000</Text></Card></Appear></At>
      <At x={540} y={820}><Appear at={tFair - 0.2} from="slam"><Text size={96} color={C.amber}>fair price = ?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleBody /></Span>
    <Span from="rules"><RulesBody /></Span>
    <Span from="average"><AverageBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="sim"><SimBody /></Span>
    <Span from="bank"><BankBody /></Span>
    <Span from="cap"><CapBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
