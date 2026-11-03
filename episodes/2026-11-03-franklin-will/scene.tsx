// "How Ben Franklin planned to turn 1,000 pounds into 4 million": 5% for 200 years (codicil, 1789).
// claim hook (1,000 -> 4,000,000, you won't be around) -> rule out stocks/luck -> lend at 5%, a tenth back a year
// -> never spend the interest (50, 52.50, 1,629) -> re-hook: doubles every 14 years, millions? -> 100 years:
// 7 doublings, x131 = 131,000 -> spend 100,000, lend 31,000 another century -> payoff 4,061,000 -> CTA 300 years?
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT,
} from "../kit";

const Coin: React.FC<{ size?: number; color?: string }> = ({ size = 70, color = C.amber }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: color, border: `${size * 0.08}px solid #00000033`,
    boxShadow: "0 5px 14px #0007", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
    <span style={{ fontFamily: F.bold, fontSize: size * 0.5, color: C.bg }}>£</span>
  </div>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tMil = at.word("million", 1, 1.6);
  const tAround = at.word("gone", 1, 2.6);
  return (
    <>
      <HookText>{"£1,000 → **£4,000,000**"}</HookText>
      <Riser to={tMil} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05 }]]}>
        <At x={230} y={720}><Coin size={170} color={C.muted} /></At>
        <At x={230} y={890}><Text size={60} color={C.muted}>£1,000</Text></At>
        <At x={540} y={700}><Text size={90} color={C.muted}>→</Text></At>
        <At x={810} y={700}>
          <div style={{ position: "relative", width: 300, height: 260 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ position: "absolute", left: (i % 4) * 80 - 20, top: 170 - Math.floor(i / 4) * 85 - 6 * Math.sin(t * 3 + i) }}>
                <Coin size={100} />
              </div>
            ))}
          </div>
        </At>
        <At x={790} y={920}><Text size={60} color={C.amber}>£4,000,000</Text></At>
        <At x={540} y={1080}><Appear at={tAround - 0.3} from="slam"><Chip color={C.coral} size={58}>in 200 years</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/cash-register" at={tMil} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const at = useAt();
  const tLuck = at.word("luck", 1, 1.0);
  const t5 = at.word("5%", 1, 2.0);
  const tWait = at.word("wait", 1, 3.0);
  const tFr = at.word("Franklin", 1, 4.0);
  const tWill = at.word("will", 1, 5.5);
  return (
    <>
      <Headline>No stocks. No luck.</Headline>
      <At x={540} y={500}><Appear at={t5} from="pop"><Text size={170} color={C.amber}>5%</Text></Appear></At>
      <At x={540} y={660}><Appear at={tWait} from="up"><Text size={56} color={C.muted}>and patience</Text></Appear></At>
      <At x={540} y={860}><Appear at={tFr} from="left"><Icon name="ScrollText" size={150} color={C.ink} /></Appear></At>
      <At x={540} y={1060}><Appear at={tWill} from="slam"><Chip color={C.ink} size={54}>Franklin's will, 1789</Chip></Appear></At>
      <Sfx name="pack/paper-slide" at={tFr} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- lend + compound
const LendBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tComp = at.beat("compound");
  const tTrades = at.word("tradesmen", 1, 1.4);
  const tTenth = at.word("tenth", 1, 3.6);
  const tAgain = at.word("again", 1, 6.0);
  const t50 = at.word("50", 1, tComp + 2.6);
  const t52 = at.word("52", 1, tComp + 4.0);
  const tInt = at.word("interest", 2, tComp + 5.0);
  const lendOut = tComp - 0.25;
  // a ring of three borrowers, money flowing out and back
  const ang = (k: number) => (-90 + k * 120) * Math.PI / 180;
  const flow = (t * 0.8) % 1;
  return (
    <>
      <Headline out={lendOut}>Lend it at 5%</Headline>
      <Headline at={tComp} color={C.amber}>Never spend the interest</Headline>
      {t < lendOut && (<>
        <At x={540} y={680}><Coin size={130} /></At>
        {[0, 1, 2].map((k) => (
          <At key={k} x={540 + 290 * Math.cos(ang(k))} y={680 + 260 * Math.sin(ang(k))}>
            <Appear at={tTrades - 0.2 + k * 0.2} from="pop"><Icon name="Hammer" size={110} color={C.mint} /></Appear>
          </At>
        ))}
        {t > tTenth && [0, 1, 2].map((k) => (
          <At key={"c" + k} x={540 + 290 * (1 - flow) * Math.cos(ang(k))} y={680 + 260 * (1 - flow) * Math.sin(ang(k))}>
            <Coin size={40} />
          </At>
        ))}
        <At x={540} y={1060}><Appear at={tTenth} out={tAgain - 0.1} from="up"><Chip color={C.ink} size={50}>a tenth back each year + 5%</Chip></Appear></At>
        <At x={540} y={1060}><Appear at={tAgain} from="pop"><Chip color={C.mint} size={50}>lend it out again</Chip></Appear></At>
      </>)}
      {/* compound: three rows */}
      <At x={540} y={430}><Appear at={tComp + 0.2} from="fade" sfx={null}><Text size={52} color={C.muted}>start: £1,000</Text></Appear></At>
      <At x={540} y={570}><Appear at={t50 - 0.2} from="left"><Text size={66}>year 1: <span style={{ color: C.mint }}>+£50</span></Text></Appear></At>
      <At x={540} y={700}><Appear at={t52 - 0.2} from="left"><Text size={66}>year 2: <span style={{ color: C.amber }}>+£52.50</span></Text></Appear></At>
      <At x={540} y={820}><Appear at={tInt - 0.4} from="up"><Text size={46} color={C.amber}>£2.50 is interest on the interest</Text></Appear></At>
      <Sfx name="pack/cash-ting" at={t50} volume={0.35} />
      <Sfx name="pack/cash-ting" at={t52} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- rehook + century + second (the curve)
// x axis: years 0..200 -> px 140..900; y: log-ish stepped heights for the chart are drawn as doublings
const GrowthBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCen = at.beat("century");
  const tSec = at.beat("second");
  const t14 = at.word("14", 1, 2.0);
  const tMil = at.word("millions", 1, 3.6);
  const t7 = at.word("7", 1, tCen + 2.4);
  const t131k = at.word("131,000", 1, tCen + 5.0);
  const tSpend = at.word("100,000", 1, tSec + 1.6);
  const t31 = at.word("31,000", 1, tSec + 3.6);
  const tAgain = at.word("century", 1, tSec + 4.8);
  // doubling blocks: 7 bars doubling in height (shown on a log feel: each step +60px)
  const dbl = [1, 2, 4, 8, 16, 32, 64, 128];
  return (
    <>
      <Headline out={tCen - 0.3} color={C.coral}>Doubles every 14 years</Headline>
      <Headline at={tCen} out={tSec - 0.3} color={C.amber}>Wait 100 years</Headline>
      <Headline at={tSec}>Spend some. Lend the rest.</Headline>
      {/* rehook: one slow doubling */}
      <At x={540} y={560}><Appear at={0.1} out={tCen - 0.2} from="pop"><Text size={80}>£1,000 → £2,000</Text></Appear></At>
      <At x={540} y={720}><Appear at={t14 - 0.2} out={tCen - 0.2} from="up"><Text size={60} color={C.muted}>every 14 years</Text></Appear></At>
      <At x={540} y={940}><Appear at={tMil} out={tCen - 0.2} from="slam"><Stamp size={90} color={C.coral}>MILLIONS?</Stamp></Appear></At>
      {/* century: 7 doubling bars */}
      {dbl.map((d, i) => {
        const tb = tCen + 0.4 + i * ((t7 + 0.6 - tCen - 0.4) / 7);
        const h = 40 + i * 70;
        return (
          <div key={i} style={{ position: "absolute", left: 110 + i * 112, top: 1000 - h, width: 84, height: tween(t, tb, tb + 0.4, 0, h),
            background: i === 7 ? C.amber : C.mint, borderRadius: 10, opacity: t >= tb && t < tSec - 0.2 ? 1 : 0 }} />
        );
      })}
      {dbl.map((d, i) => {
        const tb = tCen + 0.4 + i * ((t7 + 0.6 - tCen - 0.4) / 7);
        return (
          <div key={"l" + i} style={{ position: "absolute", left: 110 + i * 112, width: 84, top: 1010, textAlign: "center",
            opacity: t >= tb + 0.2 && t < tSec - 0.2 ? 1 : 0 }}>
            <Text size={40} color={i === 7 ? C.amber : C.muted}>×{d}</Text>
          </div>
        );
      })}
      <At x={540} y={420}><Appear at={t131k - 0.2} out={tSec - 0.2} from="slam"><Chip color={C.amber} size={70}>£131,000</Chip></Appear></At>
      {/* second century */}
      <At x={540} y={450}><Appear at={tSec + 0.2} from="pop"><Text size={80} color={C.muted}>£131,000</Text></Appear></At>
      <At x={540} y={590}><Appear at={tSpend - 0.2} from="left"><Chip color={C.mint} size={50}>£100,000 to the town</Chip></Appear></At>
      <At x={540} y={710}><Appear at={t31 - 0.2} from="right"><Chip color={C.amber} size={56}>£31,000 lent on</Chip></Appear></At>
      <At x={540} y={900}><Appear at={tAgain - 0.4} from="slam"><Text size={120} color={C.amber}>× 131</Text></Appear></At>
      <At x={540} y={1040}><Appear at={tAgain - 0.2} from="up"><Text size={50} color={C.muted}>another 100 years</Text></Appear></At>
      <Sfx name="pack/riser-ascend" at={tCen + 0.4} volume={0.3} />
      <Sfx name="pack/ding" at={t131k} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tOwn = at.word("own", 1, 2.4);
  const tReal = at.word("real", 1, 3.6);
  const tBos = at.word("Boston's", 1, 5.0);
  return (
    <>
      <Headline color={C.amber}>£31,000 × 131</Headline>
      <At x={540} y={520}><Counter from={31000} to={4061000} t0={0.1} t1={1.6} size={130} color={C.amber} prefix="£" /></At>
      <At x={540} y={680}><Appear at={tOwn - 0.2} from="pop"><Chip color={C.ink} size={52}>Franklin's own number</Chip></Appear></At>
      <At x={540} y={880}><Appear at={tReal} from="up"><Text size={54} color={C.coral}>the real funds fell short</Text></Appear></At>
      <At x={540} y={1040}><Appear at={tBos} from="slam"><Chip color={C.mint} size={54}>Boston, 1990: ~$5 million</Chip></Appear></At>
      <Sfx name="pack/kaching" at={1.6} volume={0.35} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t300 = at.word("300", 1, 2.6);
  return (
    <>
      <At x={540} y={380}><Appear at={0} from="pop"><Text size={80} color={C.amber}>300 years at 5%?</Text></Appear></At>
      <At x={540} y={650}><Coin size={170 + 10 * Math.sin(t * 4)} /></At>
      <At x={540} y={840}><Text size={60} color={C.muted}>£1,000, never touched</Text></At>
      <At x={540} y={1000}><Appear at={t300} from="pop"><Text size={100} color={C.amber}>£ ?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="lend" to="compound"><LendBody /></Span>
    <Span from="rehook" to="second"><GrowthBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
