// "How to catch fake expenses with one digit": Benford's law as a fraud investigator's how-to.
import React from "react";
import {
  Appear, At, C, Camera, Card, Chip, Counter, F, Headline, Icon, Punch, Riser, Sfx, Shake,
  Span, Stamp, Text, You, tween, useAt, useT,
} from "../kit";

// Benford first-digit shares (verify.py)
const BEN = [0.301, 0.176, 0.125, 0.097, 0.079, 0.067, 0.058, 0.051, 0.046];
// the clerk: 150 honest + 50 claims just under $5,000 -> 32% fours
const CLERK = BEN.map((p, i) => (150 * p + (i === 3 ? 50 : 0)) / 200);

/** A bar chart of first digits 1..9. `vals(i)` gives each bar's share; bars grow in from t0. */
const DigitChart: React.FC<{ vals: (i: number) => number; t0: number; color: (i: number) => string; base?: number; scale?: number; labels?: boolean }> =
  ({ vals, t0, color, base = 1060, scale = 1500, labels = true }) => {
    const t = useT();
    const BW = 84, GAP = 18, X0 = 540 - (9 * BW + 8 * GAP) / 2;
    return (
      <>
        {Array.from({ length: 9 }, (_, i) => {
          const g = tween(t, t0 + i * 0.07, t0 + i * 0.07 + 0.45, 0, 1);
          const h = Math.max(4, vals(i) * scale * g);
          const col = color(i);
          return (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: X0 + i * (BW + GAP), top: base - h, width: BW, height: h, borderRadius: "14px 14px 4px 4px",
                background: col, boxShadow: `0 0 18px ${col}55` }} />
              {labels ? <div style={{ position: "absolute", left: X0 + i * (BW + GAP), top: base + 12, width: BW, textAlign: "center",
                fontFamily: F.bold, fontSize: 48, color: C.ink }}>{i + 1}</div> : null}
            </React.Fragment>
          );
        })}
      </>
    );
  };
const barX = (i: number) => 540 - (9 * 84 + 8 * 18) / 2 + i * (84 + 18) + 42;

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tFake = at.word("faking", 1, 2.4);
  return (
    <>
      <Riser from={0} to={tFake} volume={0.5} />
      <Shake at={tFake}>
        <Camera keys={[[0, { zoom: 1.08 }], [tFake, { zoom: 1 }], [at.dur, { zoom: 1.05, y: 640 }]]}>
          <At x={240} y={480}><Appear at={0} from="pop"><You role="investigator" size={190} /></Appear></At>
          <At x={720} y={480}>
            <Appear at={0.1} from="right" dist={140}>
              <Card w={440} h={340} border={C.coral}>
                <Icon name="ReceiptText" size={150} color={C.ink} />
                <Text size={42} color={C.muted} font={F.med}>expense claims</Text>
              </Card>
            </Appear>
          </At>
          <At x={540} y={880}><Appear at={tFake} from="slam"><Stamp size={96}>FAKED</Stamp></Appear></At>
        </Camera>
      </Shake>
      <Sfx name="pack/paper-flip" at={0.3} volume={0.4} />
      <Sfx name="pack/wrong" hit={tFake + 0.05} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 2. first digits only
const AMOUNTS = ["1,280", "312", "47", "1,905", "8,640", "2,150"];
const DigitsBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFirst = at.word("first", 1, 1.8);
  const t1280 = at.word("1,280", 1, at.dur - 2.0);
  const tOne = at.word("1", 1, at.dur - 0.6);
  return (
    <>
      <Headline>Only the first digit</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t1280 - 0.2, { zoom: 1 }], [t1280 + 0.4, { zoom: 1.08, x: 540, y: 670 }]]}>
        {AMOUNTS.map((a, i) => {
          const dim = t >= tFirst;
          return (
            <At key={a} x={i % 2 === 0 ? 330 : 750} y={430 + Math.floor(i / 2) * 170}>
              <Appear at={0.15 + i * 0.12} from="left" dist={80} sfx={i % 2 === 0 ? "pack/cash-ting" : null} volume={0.2}>
                <div style={{ fontFamily: F.mono, fontSize: 76, color: C.ink, whiteSpace: "nowrap" }}>
                  <span style={{ color: C.muted }}>$</span>
                  <span style={{ color: dim ? C.amber : C.ink, textShadow: dim ? `0 0 24px ${C.amber}` : "none" }}>{a[0]}</span>
                  <span style={{ opacity: dim ? 0.3 : 1 }}>{a.slice(1)}</span>
                </div>
              </Appear>
            </At>
          );
        })}
        <At x={540} y={960}><Appear at={t1280} from="slam"><Chip size={60}>$1,280 → 1</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/ding" at={tFirst} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 3. count: honest books
const CountBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t30 = at.word("30%", 1, 2.4);
  const t9 = at.word("9", 1, at.dur - 0.6);
  return (
    <>
      <Headline>Honest books</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t9 - 0.2, { zoom: 1 }], [t9 + 0.4, { zoom: 1.12, x: 760, y: 900 }]]}>
        <DigitChart t0={0.2} vals={(i) => BEN[i]} color={(i) => (i === 0 && t >= t30 - 0.3 ? C.mint : i === 8 && t >= t9 - 0.3 ? C.amber : C.muted)} />
        <At x={barX(0) + 120} y={480}><Appear at={t30} from="pop" sfx="pack/ding-short"><Text size={90} color={C.mint}>30%</Text></Appear></At>
        <At x={barX(8) - 20} y={880}><Appear at={t9} from="pop" sfx="pack/ding-short"><Text size={64} color={C.amber}>5%</Text></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 4. why: money grows by percent
const WhyBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t100 = at.word("100", 1, 2.0);
  const tDouble = at.word("double", 1, t100 + 1.6);
  const t900 = at.word("900", 1, tDouble + 0.8);
  const t11 = at.word("11%", 1, t900 + 2.0);
  const tSit = at.word("sit", 1, at.dur - 1.4);
  const p1 = tween(t, t100, tDouble + 0.3, 0, 1);
  const p2 = tween(t, t900, t11 + 0.2, 0, 1);
  const Track: React.FC<{ y: number; p: number; a: string; b: string; tag: string; color: string; w: number; tagAt: number }> = ({ y, p, a, b, tag, color, w, tagAt }) => (
    <>
      <At x={540} y={y}>
        <div style={{ width: 900, height: 24, borderRadius: 12, background: C.dim, position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: 24, width: w * p, borderRadius: 12, background: color, boxShadow: `0 0 20px ${color}88` }} />
        </div>
      </At>
      <At x={120} y={y - 70}><Text size={52} font={F.mono}>{a}</Text></At>
      <At x={90 + w} y={y - 70}><Appear at={tagAt - 0.6} from="pop" sfx={null}><Text size={52} font={F.mono}>{b}</Text></Appear></At>
      <At x={90 + w / 2} y={y + 70}><Appear at={tagAt} from="up"><Chip size={46} color={color}>{tag}</Chip></Appear></At>
    </>
  );
  return (
    <>
      <Headline out={tSit - 0.3}>Money grows by percent</Headline>
      <Headline at={tSit} color={C.mint}>So amounts sit on 1</Headline>
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.04 }]]}>
        <Appear at={t100 - 0.2} from="left"><Track y={540} p={p1} a="100" b="200" tag="×2: a long climb" color={C.mint} w={860} tagAt={tDouble} /></Appear>
        <Appear at={t900 - 0.2} from="left"><Track y={900} p={p2} a="900" b="1,000" tag="+11%" color={C.amber} w={200} tagAt={t11} /></Appear>
      </Camera>
      <Sfx name="pack/riser-ascend" at={t100} dur={1.6} volume={0.2} />
    </>
  );
};

// ---------------------------------------------------------------- 5. range: tens to thousands
const RangeBody: React.FC = () => {
  const at = useAt();
  const tTens = at.word("tens", 1, 1.2);
  const tTh = at.word("thousands", 1, tTens + 0.7);
  const items: [string, number][] = [["$40", tTens], ["$400", (tTens + tTh) / 2], ["$4,000", tTh]];
  return (
    <>
      <Headline>Needs a wide spread</Headline>
      <Camera keys={[[0, { zoom: 1.04 }], [at.dur, { zoom: 1 }]]}>
        {items.map(([s, t0], i) => (
          <At key={s} x={540} y={500 + i * 190}>
            <Appear at={t0} from="up"><Text size={70 + i * 24} font={F.mono} color={i === 2 ? C.amber : C.ink}>{s}</Text></Appear>
          </At>
        ))}
        <At x={540} y={1090}><Appear at={tTh + 0.5} from="pop" sfx="pack/ding-short"><Chip size={46} color={C.mint}>like expenses</Chip></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 6. approval limit
const LimitBody: React.FC = () => {
  const at = useAt();
  const t5000 = at.word("5,000", 1, 2.4);
  const tMgr = at.word("manager", 1, at.dur - 0.8);
  return (
    <>
      <Headline>Approval limit</Headline>
      <At x={540} y={560}><Appear at={0.1} out={t5000 - 0.3} from="pop" sfx="pack/paper-flip"><Icon name="FilePen" size={220} color={C.ink} /></Appear></At>
      <Punch at={t5000}>
        <At x={540} y={560}><Appear at={t5000 - 0.2} from="slam"><Text size={170} color={C.amber} glow>$5,000</Text></Appear></At>
      </Punch>
      <At x={540} y={760}><Appear at={t5000 + 0.2} from="left"><div style={{ width: 900, height: 8, borderRadius: 4, background: C.coral, boxShadow: `0 0 18px ${C.coral}` }} /></Appear></At>
      <At x={540} y={950}>
        <Appear at={tMgr - 0.3} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}><Icon name="UserCheck" size={110} color={C.ink} /><Text size={52} font={F.med}>above: a manager signs</Text></div>
        </Appear>
      </At>
      <Sfx name="pack/kaching" at={t5000 - 0.1} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 7. one clerk: 32% fours
const ClerkBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tClerk = at.word("clerk", 1, 1.0);
  const t4 = at.word("4", 1, 3.0);
  const tUnder = at.word("under", 1, at.dur - 1.2);
  const grow = tween(t, t4 - 0.6, t4 + 0.4, 0, 1);
  return (
    <>
      <Headline>One clerk's claims</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t4 - 0.3, { zoom: 1 }], [t4 + 0.5, { zoom: 1.06, x: 400, y: 760 }], [tUnder + 0.6, { zoom: 1 }]]}>
        <DigitChart t0={0.1} scale={1100} vals={(i) => (i === 3 ? BEN[3] + (CLERK[3] - BEN[3]) * grow : CLERK[i])}
          color={(i) => (i === 3 && t >= t4 - 0.6 ? C.coral : C.muted)} />
        <At x={barX(3)} y={1060 - 0.32 * 1100 - 80}>
          <Appear at={t4} from="pop" sfx={null}><Counter from={10} to={32} t0={t4} t1={t4 + 0.5} size={84} color={C.coral} suffix="%" /></Appear>
        </At>
        {/* honest level for 4: a dashed line at 9.7% */}
        <At x={barX(3)} y={1060 - 0.097 * 1100}>
          <Appear at={tUnder - 0.2} from="fade" sfx={null}><div style={{ width: 150, height: 0, borderTop: `6px dashed ${C.mint}` }} /></Appear>
        </At>
        <At x={760} y={560}><Appear at={tUnder} from="right"><Chip size={46} color={C.mint}>honest: under 10%</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/paper-slide" at={tClerk} volume={0.3} />
      <Sfx name="pack/wrong" hit={t4 + 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 8. zoom in: just under the limit
const ZoomBody: React.FC = () => {
  const at = useAt();
  const ts = [at.word("4,850", 1, 1.0), at.word("4,920", 1, 1.9), at.word("4,975", 1, 2.8)];
  const tUnder = at.word("under", 1, at.dur - 1.0);
  return (
    <>
      <Headline>Just under the line</Headline>
      <Camera keys={[[0, { zoom: 1.1, y: 700 }], [ts[2] + 0.3, { zoom: 1.1, y: 700 }], [tUnder, { zoom: 1 }]]}>
        <At x={540} y={480}><Text size={50} font={F.med} color={C.coral}>limit $5,000</Text></At>
        <At x={540} y={540}><div style={{ width: 900, height: 8, borderRadius: 4, background: C.coral, boxShadow: `0 0 18px ${C.coral}` }} /></At>
        {["$4,975", "$4,920", "$4,850"].map((s, i) => (
          <At key={s} x={540} y={640 + i * 140}>
            <Appear at={ts[2 - i]} from="down" sfx="pack/cash-ting" volume={0.3}><Text size={92} font={F.mono} color={C.ink}>{s}</Text></Appear>
          </At>
        ))}
        <At x={540} y={1080}><Appear at={tUnder} from="slam"><Stamp size={70} rotate={-6}>NO SIGNATURE</Stamp></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 9. no time: the digits narrow it down
const TimeBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t10k = at.word("10,000", 1, 1.4);
  const tPoint = at.word("point", 1, at.dur - 2.4);
  const t50 = at.word("50", 1, at.dur - 0.8);
  const N = 120;
  return (
    <>
      <Headline color={C.coral} out={tPoint - 0.3}>Uh-oh</Headline>
      <Headline at={tPoint} color={C.mint}>The digits point the way</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t50, { zoom: 1 }], [t50 + 0.5, { zoom: 1.06 }]]}>
        {Array.from({ length: N }, (_, i) => {
          const x = 120 + (i % 12) * 76, y = 420 + Math.floor(i / 12) * 62;
          const t0 = Math.min(0.1, t10k - 0.4) + i * 0.008;
          if (t < t0) return null;
          const hit = i === 40 || i === 41 || i === 52;
          const dim = t >= tPoint && !hit;
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: 60, height: 46, borderRadius: 8,
            background: dim ? C.dim : hit && t >= tPoint ? C.coral : C.panel, border: `2px solid ${hit && t >= tPoint ? C.coral : C.muted}55`,
            opacity: dim ? 0.35 : 1 }} />;
        })}
        <At x={540} y={1080}>
          <Appear at={0.1} out={tPoint - 0.2} from="up">
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Counter from={0} to={10000} t0={0.1} t1={t10k + 0.2} size={90} color={C.ink} /><Text size={46} font={F.med}>expenses</Text>
            </div>
          </Appear>
        </At>
        <At x={540} y={1070}><Appear at={t50 - 0.2} from="slam"><Chip size={52} color={C.coral} text={C.ink}>1 clerk · 50 claims</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/clock" at={0.1} dur={1.4} volume={0.3} />
      <Sfx name="pack/loading" at={0.1} dur={1.0} volume={0.18} />
    </>
  );
};

// ---------------------------------------------------------------- 10. result, reveal, question
const ResultBody: React.FC = () => {
  const at = useAt();
  const tDigit = at.word("digit", 1, 1.2);
  const t9950 = at.word("9,950", 1, at.dur - 1.2);
  return (
    <>
      <Headline>Case closed</Headline>
      <At x={540} y={540}><Appear at={0} from="pop"><Text size={220} color={C.amber} glow>4</Text></Appear></At>
      <At x={540} y={800}><Appear at={tDigit} from="up"><Chip size={52} color={C.mint}>one digit</Chip></Appear></At>
      <At x={540} y={940}><Appear at={t9950 - 0.2} from="up" sfx="pack/win"><Chip size={52}>9,950 receipts unopened</Chip></Appear></At>
      <Riser from={at.dur - 1.6} to={at.dur} volume={0.45} />
    </>
  );
};

const RevealBody: React.FC = () => {
  const at = useAt();
  const tLaw = at.word("law", 1, 1.0);
  const tSimon = at.word("simon", 1, 1.8);
  return (
    <>
      <Punch at={0}>
        <At x={540} y={460}><Appear at={0} from="pop" sfx={null}><Icon name="BarChart3" size={280} color={C.amber} glow stroke={1.6} /></Appear></At>
        <At x={540} y={760}><Appear at={tLaw - 0.3} from="slam" sfx={null}><Text size={110} font={F.bold} color={C.amber} glow>Benford's law</Text></Appear></At>
        <At x={540} y={930}><Appear at={tSimon} from="up"><Text size={50}>Simon Newcomb, 1881</Text></Appear></At>
        <At x={540} y={1060}><Appear at={at.word("auditors", 1, at.dur - 1.4)} from="up"><Chip size={44} color={C.mint}>still used by auditors</Chip></Appear></At>
      </Punch>
      <Sfx name="boom" at={tLaw - 0.3} volume={0.6} />
      <Sfx name="reveal" at={0.05} volume={0.4} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  return (
    <>
      <At x={540} y={540}><Appear at={0} from="pop"><Text size={260} color={C.amber} glow>2</Text></Appear></At>
      <At x={760} y={460}><Appear at={0.5} from="pop"><Text size={120} color={C.ink}>?</Text></Appear></At>
      <At x={540} y={900}>
        <Appear at={0.8} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}><You size={110} /><Chip size={46}>what share start with 2?</Chip></div>
        </Appear>
      </At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="digits"><DigitsBody /></Span>
    <Span from="count"><CountBody /></Span>
    <Span from="why"><WhyBody /></Span>
    <Span from="range"><RangeBody /></Span>
    <Span from="limit"><LimitBody /></Span>
    <Span from="clerk"><ClerkBody /></Span>
    <Span from="zoom"><ZoomBody /></Span>
    <Span from="time"><TimeBody /></Span>
    <Span from="result"><ResultBody /></Span>
    <Span from="reveal"><RevealBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
