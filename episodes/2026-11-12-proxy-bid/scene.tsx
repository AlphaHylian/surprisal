// "The smartest eBay bid is the most you'd pay": eBay proxy bidding is a second-price (Vickrey) auction.
// claim hook (Bid $200, pay $152.50) -> bidding low backfires -> rule: highest max wins, pays runner-up + 1 step
// -> worth 200, rival 150: pay 152.50 -> shade to 140: rival gets it at 142.50 -> re-hook: overbid? -> 300 vs 250: pay 255
// -> payoff: your bid only picks which prices you accept -> 100,000 auctions, Vickrey 1961 -> CTA 200 vs 180?
import React from "react";
import { Appear, Arrow, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// ---- the price line: $0 .. MAX across the screen
const X0 = 110, X1 = 970;
const px = (v: number, max: number) => X0 + (v / max) * (X1 - X0);

const Marker: React.FC<{ x: number; y: number; label: string; color: string; up?: boolean; o?: number }> = ({ x, y, label, color, up = true, o = 1 }) => (
  <>
    <div style={{ position: "absolute", left: x - 4, top: up ? y - 70 : y, width: 8, height: 70, background: color, borderRadius: 4, opacity: o }} />
    <div style={{ position: "absolute", left: x - 150, top: up ? y - 150 : y + 78, width: 300, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ background: color, color: C.bg, fontFamily: F.bold, fontSize: 42, borderRadius: 14, padding: "4px 16px", whiteSpace: "nowrap" }}>{label}</div>
    </div>
  </>
);

const Line: React.FC<{ y: number; max: number; ticks: number[]; at?: number }> = ({ y, max, ticks, at = 0 }) => {
  const t = useT();
  const k = at <= 0 ? 1 : tween(t, at, at + 0.4, 0, 1);
  return (
    <>
      <div style={{ position: "absolute", left: X0, top: y - 5, width: (X1 - X0) * k, height: 10, background: C.muted, borderRadius: 5 }} />
      {ticks.map((v) => (
        <div key={v} style={{ position: "absolute", left: px(v, max) - 60, top: y + 14, width: 120, textAlign: "center", fontFamily: F.med, fontSize: 40, color: C.muted, opacity: k }}>${v}</div>
      ))}
    </>
  );
};

const Listing: React.FC<{ worth?: string; size?: number }> = ({ worth = "worth $200 to you", size = 150 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 26, background: C.panel, borderRadius: 28, padding: "22px 34px", border: `3px solid ${C.dim}` }}>
    <Icon name="Camera" size={size} color={C.ink} />
    <div style={{ fontFamily: F.bold, fontSize: 48, color: C.ink, lineHeight: 1.15 }}>Used camera<br /><span style={{ color: C.amber }}>{worth}</span></div>
  </div>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const tPay = w(["pay"], 1, 2.2);
  return (
    <>
      <HookText y={320} size={104}>{"Bid **$200**.\nPay **$152.50**."}</HookText>
      <Riser to={tPay} volume={0.45} />
      <At x={540} y={700}><Appear at={0} from="pop"><Listing /></Appear></At>
      <At x={540} y={900}><Chip color={C.mint} size={54}>YOUR MAX $200</Chip></At>
      <Punch at={tPay} amount={0.12}><At x={540} y={1040}><Chip color={C.amber} size={60}>YOU PAY $152.50</Chip></At></Punch>
      <Sfx name="pack/cash-ting" at={tPay} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- bidding low backfires
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tLow = w(["low"], 1, 0.6), tBack = w(["backfires"], 1, 1.8);
  return (
    <>
      <Headline>Bid low and hope?</Headline>
      <At x={540} y={560}><Appear at={0} from="pop"><Listing size={120} /></Appear></At>
      <Shake at={tBack}><At x={540} y={830} style={{ width: "max-content" }}><div style={{ display: "flex", gap: 30, alignItems: "center" }}>
        <Text size={90} color={C.muted} style={{ textDecoration: useT() >= tLow ? "line-through" : "none" }}>$200</Text>
        <Appear at={tLow} from="right"><Text size={110} color={C.coral}>$140</Text></Appear>
      </div></At></Shake>
      <At x={540} y={1040}><Appear at={tBack - 0.1} from="slam"><Stamp color={C.coral} size={80} rotate={-5}>BACKFIRES</Stamp></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- the rule
const ContextBody: React.FC = () => {
  const w = useW();
  const tWins = w(["wins"], 1, 1.4), tStep = w(["step"], 1, 2.6), tRun = w(["runnerup", "runner"], 1, 3.4);
  return (
    <>
      <Headline>eBay's rule</Headline>
      <At x={540} y={480}><Appear at={0} from="pop"><Icon name="Gavel" size={150} color={C.amber} glow /></Appear></At>
      <At x={540} y={700}><Appear at={tWins - 0.2} from="left"><Chip color={C.mint} size={56}>Highest max wins</Chip></Appear></At>
      <At x={540} y={860}><Appear at={tStep - 0.3} from="right"><Chip color={C.amber} size={56}>pays runner-up + 1 step</Chip></Appear></At>
      <At x={540} y={1010}><Appear at={tRun} from="fade" sfx={null}><Text size={42} color={C.muted}>$100 to $250: a step is $2.50</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- win: 200 vs 150
const WinBody: React.FC = () => {
  const w = useW();
  const t150 = w(["150"], 1, 3.0), tBid = w(["Bid"], 1, 3.8), tPay = w(["pay"], 1, 5.0);
  const Y = 820, M = 250;
  return (
    <>
      <Headline>You win</Headline>
      <At x={540} y={420}><Appear at={0} from="down"><Listing size={110} /></Appear></At>
      <Line y={Y} max={M} ticks={[0, 50, 100, 250]} />
      <Appear at={t150 - 0.1} from="up"><Marker x={px(150, M)} y={Y} label="RIVAL 150" color={C.coral} up={false} /></Appear>
      <Appear at={tBid - 0.1} from="down"><Marker x={px(200, M)} y={Y} label="YOU 200" color={C.mint} /></Appear>
      <At x={540} y={1040}><Appear at={tPay} from="slam"><Chip color={C.amber} size={58}>YOU PAY $152.50</Chip></Appear></At>
      <Sfx name="pack/kaching" at={tPay + 0.2} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- shade to 140
const ShadeBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const t140 = w(["140"], 1, 1.0), tRival = w(["rival"], 1, 1.8), tGone = w(["gone"], 1, 4.6);
  const Y = 820, M = 250;
  const you = tween(t, t140 - 0.2, t140 + 0.4, 200, 140);
  return (
    <>
      <Headline>Shade it to $140?</Headline>
      <At x={540} y={420}><Appear at={0} out={tGone - 0.1} from="fade" sfx={null}><Listing size={110} /></Appear></At>
      <At x={540} y={420}><Appear at={tGone - 0.1} from="slam"><Stamp color={C.coral} size={100} rotate={-6}>CAMERA GONE</Stamp></Appear></At>
      <Line y={Y} max={M} ticks={[0, 50, 100, 250]} />
      <Marker x={px(150, M)} y={Y} label="RIVAL 150" color={C.coral} up={false} />
      <Marker x={px(you, M)} y={Y} label={`YOU ${Math.round(you)}`} color={C.mint} />
      <At x={540} y={1040}><Appear at={tRival + 0.3} from="pop"><Chip color={C.coral} size={54}>RIVAL PAYS $142.50</Chip></Appear></At>
      <Sfx name="pack/whoosh-swing" at={t140 - 0.2} volume={0.4} />
      <Sfx name="pack/wrong" at={tGone} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const w = useW();
  const tOver = w(["over"], 1, 0.8), tTrap = w(["trap"], 1, 2.4);
  return (
    <>
      <Headline color={C.amber}>So bid way over?</Headline>
      <At x={540} y={640}><Appear at={tOver - 0.1} from="slam"><Text size={220} color={C.ink}>$300</Text></Appear></At>
      <At x={540} y={900}><Appear at={tTrap - 0.2} from="pop"><Chip color={C.coral} size={60}>the other trap</Chip></Appear></At>
      <Sfx name="pack/suspense-sting" at={tTrap - 0.1} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- over: 300 vs 250
const OverBody: React.FC = () => {
  const w = useW();
  const t250 = w(["250"], 1, 1.8), tPay = w(["pay"], 1, 2.8), tCam = w(["camera"], 1, 4.4);
  const Y = 720, M = 320;
  return (
    <>
      <Headline>Overbid</Headline>
      <Line y={Y} max={M} ticks={[0, 50, 100, 150]} />
      <div style={{ position: "absolute", left: px(200, M) - 3, top: Y - 260, width: 6, height: 520, background: `repeating-linear-gradient(${C.amber} 0 18px, transparent 18px 32px)` }} />
      <At x={px(200, M)} y={Y - 300}><Text size={40} color={C.amber}>worth 200</Text></At>
      <Appear at={0} from="down"><Marker x={px(300, M)} y={Y} label="YOU 300" color={C.mint} /></Appear>
      <Appear at={t250 - 0.1} from="up"><Marker x={px(250, M)} y={Y} label="RIVAL 250" color={C.coral} up={false} /></Appear>
      <At x={540} y={1000}><Appear at={tPay} from="slam"><Chip color={C.amber} size={58}>YOU PAY $255</Chip></Appear></At>
      <At x={540} y={1095}><Appear at={tCam} from="pop"><Text size={50} color={C.coral}>−$55 on a $200 camera</Text></Appear></At>
      <Sfx name="pack/cash-register" at={tPay + 0.1} volume={0.4} />
      <Sfx name="pack/wrong" at={tCam + 0.3} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- payoff: your bid only draws the line
const PayoffBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tRival = w(["Rival's", "rivals"], 1, 1.6), tPicks = w(["picks"], 1, 3.0), tTrue = w(["true"], 1, 5.4);
  const Y = 720, M = 320;
  // the rival's max sweeps across; the price follows it, your bid only decides yes or no
  const r = tween(t, tRival - 0.2, tPicks + 1.4, 60, 290, (x) => x);
  const win = r < 200;
  return (
    <>
      <Headline>The price isn't yours</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tTrue, { zoom: 1 }], [tTrue + 0.5, { zoom: 1.06, x: 540, y: 720 }]]}>
        <div style={{ position: "absolute", left: X0, top: Y - 40, width: px(200, M) - X0, height: 80, background: `${C.mint}33`, borderRadius: 12, opacity: t > tPicks - 0.2 ? 1 : 0 }} />
        <div style={{ position: "absolute", left: px(200, M), top: Y - 40, width: X1 - px(200, M), height: 80, background: `${C.coral}33`, borderRadius: 12, opacity: t > tPicks - 0.2 ? 1 : 0 }} />
        <Line y={Y} max={M} ticks={[0, 100]} />
        <Marker x={px(200, M)} y={Y} label="YOU 200" color={C.mint} />
        <Appear at={tRival - 0.2} from="up"><Marker x={px(r, M)} y={Y} label={`RIVAL ${Math.round(r)}`} color={C.coral} up={false} /></Appear>
      </Camera>
      <At x={540} y={360}><Appear at={tRival} from="fade" sfx={null}><Text size={48} color={win ? C.mint : C.coral}>{win ? "you win, price = rival + step" : "you'd overpay: you drop out"}</Text></Appear></At>
      <At x={540} y={1040}><Appear at={tTrue - 0.2} from="slam"><Chip color={C.amber} size={58}>your max = what it's worth</Chip></Appear></At>
      <Sfx name="pack/whoosh-soft" at={tRival} volume={0.3} />
      <Sfx name="pack/hit-grand" at={tTrue} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- proof
const ProofBody: React.FC = () => {
  const w = useW();
  const tNo = w(["no"], 1, 1.8), tVick = w(["Vickrey"], 1, 4.4);
  return (
    <>
      <Headline>100,000 auctions</Headline>
      <At x={540} y={520} style={{ width: 1000, display: "flex", justifyContent: "center" }}><Counter from={0} to={100000} t0={0.1} t1={tNo} size={170} color={C.ink} /></At>
      <At x={540} y={720}><Appear at={tNo} from="pop"><Chip color={C.mint} size={52}>honest bid: never beaten by a step</Chip></Appear></At>
      <At x={540} y={940}><Appear at={tVick - 0.2} from="up"><div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Icon name="BookOpen" size={90} color={C.amber} /><Text size={56} color={C.ink}>William Vickrey, 1961</Text></div></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const t180 = w(["180"], 1, 2.2), tPay = w(["pay"], 1, 3.6);
  const Y = 760, M = 250;
  return (
    <>
      <Headline>Your turn</Headline>
      <Line y={Y} max={M} ticks={[0, 50, 100, 250]} />
      <Appear at={0} from="down"><Marker x={px(200, M)} y={Y} label="YOU 200" color={C.mint} /></Appear>
      <Appear at={t180 - 0.1} from="up"><Marker x={px(180, M)} y={Y} label="RIVAL 180" color={C.coral} up={false} /></Appear>
      <At x={540} y={420}><Appear at={tPay - 0.3} from="slam"><Text size={110} color={C.amber}>you pay $ ?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="win"><WinBody /></Span>
    <Span from="shade"><ShadeBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="over"><OverBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="proof"><ProofBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
