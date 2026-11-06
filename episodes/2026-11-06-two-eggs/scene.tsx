// "Two eggs, 100 floors": the two-egg drop puzzle.
// versus hook (steps of 10: 19 vs smart: 14) -> rule out halving (50) -> rules -> steps of 10: 19
// -> re-hook: jumps cost drops, the climb never shrinks -> shrink: 14, 27, 39, 50 -> any break = 14
// -> payoff: 14+13+...+1 = 105 >= 100, 13 -> 91 -> CTA: 200 floors?
import React from "react";
import {
  Appear, At, C, Chip, Counter, F, Headline, HookText, Punch, Riser, Sfx, Span, Text, tween, useAt, useT,
} from "../kit";

const SMART = [14, 27, 39, 50, 60, 69, 77, 84, 90, 95, 99, 100];
const TENS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
const TOP = 450, BOT = 1130;
const fy = (f: number) => BOT - (f / 100) * (BOT - TOP);

// a 100-floor tower centred at x; marks = drop floors (shown one by one from markAt, every markStep s)
const Tower: React.FC<{ x: number; w?: number; marks?: number[]; markAt?: number; markStep?: number; markColor?: string; labels?: boolean;
  climb?: [number, number]; climbAt?: number; climbDur?: number; brk?: number; brkAt?: number; gapLabels?: boolean }> =
  ({ x, w = 150, marks = [], markAt = 0, markStep = 0.25, markColor = C.amber, labels = true, climb, climbAt = 1e9, climbDur = 1.5, brk, brkAt = 1e9, gapLabels }) => {
    const t = useT();
    const cl = climb ? tween(t, climbAt, climbAt + climbDur, 0, 1) : 0;
    return (
      <>
        <div style={{ position: "absolute", left: x - w / 2, top: TOP, width: w, height: BOT - TOP, background: C.dim, borderRadius: 10, border: `3px solid ${C.muted}55` }} />
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: x - w / 2, top: fy((i + 1) * 10), width: w, height: 2, background: `${C.muted}44` }} />
        ))}
        {labels && [0, 50, 100].map((f) => (
          <div key={f} style={{ position: "absolute", left: x - w / 2 - 100, top: fy(f) - 24, width: 86, textAlign: "right", fontFamily: F.bold, fontSize: 40, color: C.muted }}>{f}</div>
        ))}
        {climb && cl > 0 && (
          <div style={{ position: "absolute", left: x - w / 2 + 8, top: fy(climb[0] + (climb[1] - climb[0]) * cl), width: w - 16,
            height: fy(climb[0]) - fy(climb[0] + (climb[1] - climb[0]) * cl), background: C.mint, opacity: 0.85, borderRadius: 4 }} />
        )}
        {marks.map((f, i) => {
          const a = markAt + i * markStep;
          if (t < a) return null;
          const hit = brk === f && t >= brkAt;
          const prev = i === 0 ? 0 : marks[i - 1];
          return (
            <React.Fragment key={f}>
              <div style={{ position: "absolute", left: x - w / 2 - 10, top: fy(f) - 4, width: w + 20, height: 8, background: hit ? C.coral : markColor, borderRadius: 4 }} />
              {gapLabels && (
                <div style={{ position: "absolute", left: x + w / 2 + 16, top: (fy(f) + fy(prev)) / 2 - 24, fontFamily: F.bold, fontSize: 40, color: markColor }}>+{f - prev}</div>
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };
const Egg: React.FC<{ size?: number; broken?: boolean }> = ({ size = 90, broken }) => (
  <div style={{ width: size * 0.78, height: size, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: broken ? C.coral : "#f3ead8",
    boxShadow: "0 6px 14px #0008", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.bold, fontSize: size * 0.5, color: C.bg }}>
    {broken ? "×" : ""}
  </div>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t19 = at.word("19", 1, 1.6);
  const t14 = at.word("14", 1, 2.6);
  return (
    <>
      <HookText>{"Jump by 10: 19 drops\n**Jump smart: 14**"}</HookText>
      <Riser to={t14} volume={0.45} />
      <Tower x={330} marks={TENS} markAt={0} markStep={0} markColor={C.coral} />
      <Tower x={780} marks={SMART} markAt={0} markStep={0} labels={false} />
      <At x={540} y={790}><Egg size={80} /></At>
      <At x={540} y={900}><Egg size={80} /></At>
      <At x={330} y={1180 - 40}><Appear at={t19 - 0.1} from="pop"><Chip color={C.coral} size={56}>19</Chip></Appear></At>
      <At x={780} y={1180 - 40}><Punch at={t14}><Appear at={t14 - 0.1} from="slam"><Chip color={C.amber} size={56}>14</Chip></Appear></Punch></At>
    </>
  );
};

// ---------------------------------------------------------------- rule out halving
const RuleBody: React.FC = () => {
  const at = useAt();
  const t50 = at.word("50", 1, 1.4);
  const tBreaks = at.word("breaks", 1, 2.2);
  const tClimbs = at.word("climbs", 1, 3.2);
  const t50b = at.word("50", 2, 5.4);
  return (
    <>
      <Headline color={C.coral}>Halving? No.</Headline>
      <Tower x={420} marks={[50]} markAt={t50 - 0.2} brk={50} brkAt={tBreaks} climb={[0, 49]} climbAt={tClimbs} climbDur={Math.max(1, t50b - tClimbs - 0.2)} />
      <At x={720} y={fy(50)}><Appear at={tBreaks - 0.1} from="pop" sfx="pack/splat"><Egg size={90} broken /></Appear></At>
      <At x={760} y={fy(20)}><Appear at={tClimbs} from="up"><Text size={48} color={C.mint}>floor 1, 2, 3...</Text></Appear></At>
      <At x={760} y={1060}><Appear at={t50b - 0.2} from="slam"><Chip color={C.coral} size={56}>50 drops</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- rules
const RulesBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tHigh = at.word("highest", 1, 1.8);
  const tGone = at.word("gone", 1, 2.8);
  const tOne = at.word("one", 1, 5.4);
  const step = Math.max(0, Math.floor(tween(t, tOne, tOne + 1.6, 0, 4.99, (x) => x)));
  return (
    <>
      <Headline>2 eggs, 100 floors</Headline>
      <At x={540} y={480}><Appear at={tHigh - 0.2} from="up"><Text size={56}>find the <span style={{ color: C.amber }}>highest safe floor</span></Text></Appear></At>
      <At x={360} y={700}><Appear at={0} from="fade" sfx={null}>{t >= tGone - 0.2 ? <Egg size={130} broken /> : <Egg size={130} />}</Appear></At>
      <At x={360} y={850}><Appear at={tGone - 0.1} from="pop"><Text size={50} color={C.coral}>broken = gone</Text></Appear></At>
      <At x={720} y={700}><Egg size={130} /></At>
      <At x={720} y={850}><Appear at={tOne - 0.3} from="up"><Text size={50} color={C.mint}>last egg</Text></Appear></At>
      {t >= tOne - 0.1 && (
        <At x={720} y={1020}>
          <div style={{ display: "flex", gap: 14 }}>
            {[1, 2, 3, 4, 5].map((f) => (
              <div key={f} style={{ width: 70, height: 70, borderRadius: 10, background: f <= step + 1 ? C.mint : C.dim, color: C.bg,
                fontFamily: F.bold, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>{f}</div>
            ))}
          </div>
        </At>
      )}
      <Sfx name="pack/splat" at={tGone - 0.2} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- steps of 10 + rehook
const TensBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRe = at.beat("rehook");
  const tTry = at.word("10", 1, 0.6);
  const t100 = at.word("100", 1, 2.4);
  const t91 = at.word("91", 1, 4.4);
  const t19 = at.word("19", 1, 6.0);
  const tJump = at.word("jump", 2, tRe + 0.8);
  const tClimb = at.word("climb", 1, tRe + 2.6);
  const n = t < t100 ? Math.min(10, Math.floor(tween(t, tTry, t100 - 0.1, 0, 10, (x) => x))) : t < t91 ? 10 : Math.round(tween(t, t91, t19 - 0.2, 10, 19, (x) => x));
  return (
    <>
      <Headline out={tRe - 0.3}>Jump by 10</Headline>
      <Headline at={tRe} color={C.coral}>Every jump costs a drop</Headline>
      <Tower x={400} marks={TENS} markAt={tTry} markStep={Math.max(0.12, (t100 - tTry - 0.2) / 10)} markColor={C.amber} brk={100} brkAt={t100}
        climb={[90, 99]} climbAt={t91 - 0.2} climbDur={Math.max(0.8, t19 - t91 - 0.2)} gapLabels={t >= tRe} />
      <At x={780} y={560}><Text size={44} color={C.muted}>drops</Text></At>
      <At x={780} y={660}>{t >= t19 - 0.2 ? <Punch at={t19}><Text size={130} color={C.coral}>19</Text></Punch> : <Text size={130}>{Math.max(0, n)}</Text>}</At>
      {t >= tRe && (
        <>
          <At x={780} y={880}><Appear at={tJump} from="up"><Text size={48} color={C.amber}>jumps: +1 each</Text></Appear></At>
          <At x={780} y={980}><Appear at={tClimb - 0.2} from="up"><Text size={48} color={C.coral}>climb: still 9</Text></Appear></At>
        </>
      )}
      <Sfx name="pack/wrong" at={t19} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- shrink + any break
const ShrinkBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tAny = at.beat("any");
  const t14 = at.word("14", 1, 1.4);
  const t27 = at.word("27", 1, 2.8);
  const t39 = at.word("39", 1, 3.8);
  const t50 = at.word("50", 1, 4.6);
  const tB14 = tAny;
  const tB27 = at.word("27", 2, tAny + 2.8);
  const tStill = at.word("Still", 1, tAny + 4.6);
  const marks = t < tAny ? SMART.slice(0, t < t39 ? (t < t27 ? 1 : 2) : t < t50 ? 3 : 12) : SMART;
  const case27 = t >= tB27 - 0.2;
  return (
    <>
      <Headline out={tAny - 0.3} color={C.amber}>Shrink the jumps</Headline>
      <Headline at={tAny}>Breaks anywhere? 14.</Headline>
      {t >= t14 - 0.2 && (
        <Tower x={400} marks={marks} markAt={t14 - 0.2} markStep={0} gapLabels={t < tAny} brk={t >= tAny ? (case27 ? 27 : 14) : undefined} brkAt={tAny}
          climb={t >= tAny ? (case27 ? [14, 26] : [0, 13]) : undefined} climbAt={case27 ? tB27 : tB14 + 0.3} climbDur={1.0} />
      )}
      {t >= t50 - 0.2 && t < tAny && <At x={790} y={fy(75)}><Appear at={t50} from="up"><Text size={48} color={C.muted}>60, 69, 77...</Text></Appear></At>}
      {t >= tAny && (
        <>
          <At x={790} y={700}><Appear at={tB14 + 0.3} from="pop"><Text size={64}>{case27 ? "2 + 12" : "1 + 13"}</Text></Appear></At>
          <At x={790} y={820}><Appear at={tB14 + 0.6} from="slam"><Chip color={C.amber} size={60}>= 14</Chip></Appear></At>
          <At x={790} y={1000}><Appear at={tStill - 0.2} from="up"><Text size={48} color={C.mint}>every floor: 14 or less</Text></Appear></At>
        </>
      )}
      <Sfx name="pack/correct" at={tStill} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- payoff: 14 + 13 + ... + 1 = 105
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tPlus = at.word("plus", 1, 1.0);
  const t105 = at.word("105", 1, 3.6);
  const t13 = at.word("13", 2, 6.0);
  const t91 = at.word("91", 1, 7.0);
  const W = 52, H0 = 36;
  return (
    <>
      <Headline color={C.amber}>Why 14?</Headline>
      {/* staircase: column i has height (14 - i) */}
      {Array.from({ length: 14 }, (_, i) => {
        const a = 0.05 + i * Math.min(0.14, Math.max(0.05, (tPlus - 0.1) / 14));
        if (t < a) return null;
        const h = (14 - i) * H0 * tween(t, a, a + 0.25, 0, 1);
        const dimmed = t >= t13 - 0.2 && i === 0;
        return <div key={i} style={{ position: "absolute", left: 540 - 7 * W + i * W + 3, top: 1080 - h, width: W - 6, height: h, borderRadius: 6,
          background: dimmed ? C.dim : C.mint, opacity: 0.9 }} />;
      })}
      <At x={540} y={480}><Appear at={Math.max(0.3, tPlus - 0.3)} from="up"><Text size={50}>14 + 13 + 12 + ... + 1</Text></Appear></At>
      <At x={540} y={1130}><Appear at={0} from="fade" sfx={null}><Text size={40} color={C.muted}>floors each drop covers</Text></Appear></At>
      <At x={760} y={620}>
        {t < t13 - 0.2
          ? <Appear at={t105 - 0.3} from="slam"><Chip color={C.amber} size={64}>105 ≥ 100</Chip></Appear>
          : <Appear at={t13 - 0.2} from="slam"><Chip color={C.coral} size={64}>{t >= t91 - 0.2 ? "13 drops: 91" : "13 drops: ?"}</Chip></Appear>}
      </At>
      <Sfx name="pack/kaching" at={t105} volume={0.35} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const t200 = at.word("200", 1, 1.2);
  return (
    <>
      <Headline color={C.amber}>Your turn</Headline>
      <At x={540} y={500}><Egg size={110} /></At>
      <At x={540} y={700}><Appear at={t200 - 0.3} from="slam"><Text size={150}>200 floors</Text></Appear></At>
      <At x={540} y={900}><Appear at={t200 + 0.2} from="up"><Text size={66}>fewest drops<span style={{ color: C.amber }}>?</span></Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleBody /></Span>
    <Span from="rules"><RulesBody /></Span>
    <Span from="tens" to="rehook"><TensBody /></Span>
    <Span from="shrink" to="any"><ShrinkBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
