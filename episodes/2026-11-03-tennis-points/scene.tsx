// "How 54% of points wins 80% of tennis matches": scoring stacks races.
// versus hook (54% of points / 80% of matches) -> rule out clutch points (same 54% every point)
// -> points into games 60 -> games into sets 76 -> re-hook: where's the edge from? -> streaks rarely
// last a set -> best of 3: 86 -> payoff 54 -> 86, Federer 80 -> CTA 51% of points?
import React from "react";
import {
  Appear, At, C, Camera, Chip, F, Headline, HookText, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT,
} from "../kit";

const BALL = "#d7e84a";
const Ball: React.FC<{ size?: number }> = ({ size = 60 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: BALL, position: "relative", boxShadow: "0 6px 18px #0007", flex: "none",
    overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -size * 0.55, top: size * 0.08, width: size * 0.9, height: size * 0.84, borderRadius: "50%", border: `${Math.max(2, size * 0.05)}px solid #ffffffcc` }} />
    <div style={{ position: "absolute", left: size * 0.65, top: size * 0.08, width: size * 0.9, height: size * 0.84, borderRadius: "50%", border: `${Math.max(2, size * 0.05)}px solid #ffffffcc` }} />
  </div>
);

// One row of the ladder: label, animated bar, value.
const ROW_Y = [420, 560, 700, 840];
const LABELS = ["point", "game", "set", "match"];
const VALUES = [54, 60, 76, 86];
const LadderRow: React.FC<{ i: number; t0: number; hi?: boolean }> = ({ i, t0, hi }) => {
  const t = useT();
  const W = 560;
  const w = tween(t, t0, t0 + 0.7, 0, (W * VALUES[i]) / 100);
  const v = Math.round(tween(t, t0, t0 + 0.7, 50, VALUES[i]));
  const color = hi ? C.amber : i === 0 ? C.muted : C.mint;
  if (t < t0 - 0.05) return null;
  return (
    <>
      <div style={{ position: "absolute", left: 70, top: ROW_Y[i] - 32 }}><Text size={52} color={C.muted}>{LABELS[i]}</Text></div>
      <div style={{ position: "absolute", left: 280, top: ROW_Y[i] - 32, width: W, height: 64, borderRadius: 32, background: C.dim }} />
      <div style={{ position: "absolute", left: 280, top: ROW_Y[i] - 32, width: w, height: 64, borderRadius: 32, background: color, boxShadow: `0 0 26px ${color}66` }} />
      <div style={{ position: "absolute", left: 280 + (W * 0.5) - 2, top: ROW_Y[i] - 44, width: 4, height: 88, background: C.ink, opacity: 0.35 }} />
      <div style={{ position: "absolute", left: 860, top: ROW_Y[i] - 34 }}><Text size={58} color={color}>{v}%</Text></div>
    </>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t80 = at.word("80%", 1, 2.2);
  const w54 = 560 * 0.54, w80 = tween(t, 0, t80, 560 * 0.54, 560 * 0.8);
  const bob = 30 * Math.abs(Math.sin(t * 4));
  return (
    <>
      <HookText>{"54% of points.\n**80% of matches.**"}</HookText>
      <Riser to={t80} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05 }]]}>
        <div style={{ position: "absolute", left: 70, top: 600 }}><Text size={50} color={C.muted}>points</Text></div>
        <div style={{ position: "absolute", left: 300, top: 600, width: 560, height: 64, borderRadius: 32, background: C.dim }} />
        <div style={{ position: "absolute", left: 300, top: 600, width: w54, height: 64, borderRadius: 32, background: C.muted }} />
        <div style={{ position: "absolute", left: 880, top: 598 }}><Text size={56}>54%</Text></div>
        <div style={{ position: "absolute", left: 70, top: 760 }}><Text size={50} color={C.muted}>matches</Text></div>
        <div style={{ position: "absolute", left: 300, top: 760, width: 560, height: 64, borderRadius: 32, background: C.dim }} />
        <div style={{ position: "absolute", left: 300, top: 760, width: w80, height: 64, borderRadius: 32, background: C.amber, boxShadow: `0 0 30px ${C.amber}88` }} />
        <div style={{ position: "absolute", left: 880, top: 758 }}><Text size={56} color={C.amber}>80%</Text></div>
        <At x={540} y={1020 - bob}><Ball size={90} /></At>
      </Camera>
      <Sfx name="pack/hit-low" at={t80} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tBig = at.word("big", 1, 1.0);
  const tSame = at.word("same", 1, 2.8);
  const tScore = at.word("scoring", 1, 4.6);
  return (
    <>
      <Headline>Not the big points</Headline>
      <At x={540} y={450}><Appear at={tBig} out={tSame - 0.1} from="pop"><Stamp size={90} color={C.coral}>CLUTCH?</Stamp></Appear></At>
      {Array.from({ length: 8 }).map((_, i) => (
        <At key={i} x={160 + i * 108} y={700}>
          <Appear at={0.1 + i * 0.08} from="drop" sfx={i === 0 ? undefined : null}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Ball size={70} />
              <Text size={40} color={C.mint}>54</Text>
            </div>
          </Appear>
        </At>
      ))}
      <At x={540} y={870}><Appear at={tSame + 0.4} from="up"><Text size={52} color={C.muted}>every point: the same 54%</Text></Appear></At>
      <At x={540} y={1010}><Appear at={tScore} from="slam"><Chip color={C.amber} size={60}>the scoring does the rest</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- ladder: games, sets (+ rehook, why, match)
const LadderBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSets = at.beat("sets");
  const tRe = at.beat("rehook");
  const tWhy = at.beat("why");
  const tMatch = at.beat("match");
  const tFour = at.word("4", 1, 2.2);
  const tTwo = at.word("2", 1, 3.6);
  const t60 = at.word("60%", 1, 5.2);
  const tSix = at.word("6", 1, tSets + 2.0);
  const t76 = at.word("76%", 1, tSets + 4.2);
  const tEdge = at.word("edge", 1, tRe + 2.6);
  const tStreak = at.word("streak", 1, tWhy + 0.8);
  const tGame = at.word("game", 3, tWhy + 2.6);
  const tRarely = at.word("rarely", 1, tWhy + 5.5);
  const t86 = at.word("86%", 1, tMatch + 2.4);
  const whyOut = tMatch - 0.2;
  // a streak strip: 14 points, mostly mixed, a coral run of 4 in the middle
  const strip = [1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1];
  const streak = [4, 5, 6, 7];
  return (
    <>
      <Headline out={tSets - 0.3}>Points into games</Headline>
      <Headline at={tSets} out={tRe - 0.3}>Games into sets</Headline>
      <Headline at={tRe} out={tWhy - 0.3} color={C.amber}>Where's the edge from?</Headline>
      <Headline at={tWhy} out={whyOut} color={C.coral}>Streaks don't last</Headline>
      <Headline at={tMatch} color={C.amber}>Best of 3 sets</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tRe, { zoom: 1 }], [tRe + 0.8, { zoom: 1.04 }], [tWhy, { zoom: 1 }], [whyOut, { zoom: 1.03 }], [tMatch + 0.4, { zoom: 1 }]]}>
        <LadderRow i={0} t0={0.1} />
        <LadderRow i={1} t0={t60 - 0.5} />
        <LadderRow i={2} t0={t76 - 0.5} />
        <LadderRow i={3} t0={t86 - 0.6} hi />
        {/* the rule chips under the ladder, one per step */}
        <At x={540} y={1060}><Appear at={tFour} out={tTwo - 0.05} from="pop"><Chip color={C.ink} size={50}>first to 4 points</Chip></Appear></At>
        <At x={540} y={1060}><Appear at={tTwo} out={tSets - 0.2} from="pop"><Chip color={C.ink} size={50}>first to 4, win by 2</Chip></Appear></At>
        <At x={540} y={1060}><Appear at={tSix} out={tRe - 0.2} from="pop"><Chip color={C.ink} size={50}>first to 6 games, win by 2</Chip></Appear></At>
        <At x={540} y={1060}><Appear at={tEdge - 0.2} out={tWhy - 0.2} from="slam"><Stamp size={80} color={C.amber} rotate={-6}>SAME 54%?</Stamp></Appear></At>
        {/* why: a strip of points with a lucky streak */}
        {strip.map((w, i) => (
          <At key={i} x={130 + i * 63} y={990}>
            <Appear at={tStreak - 0.3 + i * 0.05} out={whyOut} from="pop" sfx={i === 0 ? undefined : null}>
              <div style={{ width: 48, height: 48, borderRadius: 24, background: streak.includes(i) ? C.coral : w ? C.mint : C.muted,
                boxShadow: streak.includes(i) && t > tStreak + 0.4 ? `0 0 22px ${C.coral}` : "none" }} />
            </Appear>
          </At>
        ))}
        <At x={540} y={1090}><Appear at={tGame} out={tRarely - 0.1} from="up"><Text size={54} color={C.coral}>4 lucky points steal a game</Text></Appear></At>
        <At x={540} y={1090}><Appear at={tRarely} out={whyOut} from="up"><Text size={54} color={C.mint}>a set needs luck again and again</Text></Appear></At>
        <At x={540} y={1060}><Appear at={t86} from="slam"><Chip color={C.amber} size={60}>86% of matches</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/ding-short" at={t60} volume={0.4} />
      <Sfx name="pack/ding-short" at={t76} volume={0.4} />
      <Sfx name="pack/ding" at={t86} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t86 = at.word("86%", 1, 1.6);
  const tReal = at.word("Real", 1, 3.0);
  const t80 = at.word("80", 1, 5.2);
  const tHalf = at.word("half", 1, 6.5);
  return (
    <>
      <Headline color={C.amber}>54% → 86%</Headline>
      <At x={250} y={520}><Text size={120} color={C.muted}>54%</Text></At>
      <At x={510} y={520}><Text size={90} color={C.muted}>→</Text></At>
      <At x={790} y={520}><Appear at={t86 - 0.3} from="slam"><Text size={150} color={C.amber}>86%</Text></Appear></At>
      <At x={540} y={700}><Appear at={0.1} from="fade" sfx={null}><Text size={46} color={C.muted}>if every point were 54%</Text></Appear></At>
      <At x={540} y={860}><Appear at={tReal} from="up"><Text size={52}>real opponents vary</Text></Appear></At>
      <At x={540} y={990}><Appear at={t80 - 0.1} from="slam"><Chip color={C.amber} size={60}>Federer: 80% of 1,526</Chip></Appear></At>
      <At x={540} y={1120}><Appear at={tHalf} from="up"><Text size={50} color={C.mint}>barely half the points</Text></Appear></At>
      <Sfx name="pack/kaching" at={t80} volume={0.3} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t51 = at.word("51%", 1, 0.8);
  const bob = 24 * Math.abs(Math.sin(t * 4));
  return (
    <>
      <At x={540} y={380}><Appear at={0} from="pop"><Text size={84} color={C.amber}>51% of points?</Text></Appear></At>
      <div style={{ position: "absolute", left: 70, top: 560 }}><Text size={50} color={C.muted}>points</Text></div>
      <div style={{ position: "absolute", left: 300, top: 560, width: 560, height: 64, borderRadius: 32, background: C.dim }} />
      <div style={{ position: "absolute", left: 300, top: 560, width: tween(t, t51, t51 + 0.6, 0, 560 * 0.51), height: 64, borderRadius: 32, background: C.mint }} />
      <div style={{ position: "absolute", left: 70, top: 720 }}><Text size={50} color={C.muted}>matches</Text></div>
      <div style={{ position: "absolute", left: 300, top: 720, width: 560, height: 64, borderRadius: 32, background: C.dim }} />
      <div style={{ position: "absolute", left: 880, top: 716 }}><Text size={60} color={C.amber}>?</Text></div>
      <At x={540} y={980 - bob}><Ball size={80} /></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="games" to="match"><LadderBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
