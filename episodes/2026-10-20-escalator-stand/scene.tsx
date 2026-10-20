// "Why standing still gets more people up the escalator": TfL's Holborn pilot, how-to format.
// versus hook (walk left or all stand: +27%) -> rule out (faster for you, not the crowd) -> a step every half
// second, 112 a minute -> standers: one empty step, 56 a side -> walkers: two empty steps, 62 if full
// -> re-hook: only if the lane is full -> 24 m, 4 in 10 climb, the walking lane runs half empty
// -> fix: both sides stand, 112 -> proof: Holborn 12,745 -> 16,220 -> twist: short escalators -10% -> CTA.
import React from "react";
import {
  Appear, At, Bar, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- an escalator seen from above
// Two lanes of steps scrolling up. A lane is empty, standers (one empty step between, moving with
// the steps) or walkers (two empty steps between, moving 5/3 as fast). `keep` thins a lane out.
type Lane = "none" | "stand" | "walk";
const STAND_SPEED = 1.875;  // steps a second (112.5 a minute)
const WALK_SPEED = 3.125;   // steps a second (187.5 a minute)
const Escalator: React.FC<{
  left: Lane; right: Lane; rows?: number; stepH?: number; laneW?: number;
  keepLeft?: (i: number) => boolean; leftColor?: string; rightColor?: string; odd?: { lane: "left" | "right"; color: string };
}> = ({ left, right, rows = 11, stepH = 62, laneW = 136, keepLeft = () => true, leftColor = C.mint, rightColor = C.ink, odd }) => {
  const t = useT();
  const H = rows * stepH;
  const off = ((t * STAND_SPEED) % 1) * stepH;
  const people = (lane: Lane, side: "left" | "right", color: string, keep: (i: number) => boolean) => {
    if (lane === "none") return null;
    const speed = lane === "stand" ? STAND_SPEED : WALK_SPEED;
    const gap = lane === "stand" ? 2 : 3;
    const n = Math.ceil(rows / gap) + 2;
    const base = Math.floor(t * speed / gap);
    const out: React.ReactNode[] = [];
    for (let k = 0; k < n; k++) {
      const idx = base - k;                            // a stable id per person, so `keep` doesn't flicker
      const s = t * speed - idx * gap;                 // steps travelled from the bottom
      if (s < -0.5 || s > rows - 0.5 || !keep(((idx % 1000) + 1000) % 1000)) continue;
      const y = H - (s + 0.5) * stepH;
      const fade = Math.min(1, (s + 0.5) / 0.8, (rows - 0.5 - s) / 0.8);
      const c = odd && odd.lane === side && ((idx % 3) + 3) % 3 === 0 ? odd.color : color;
      out.push(
        <div key={idx} style={{ position: "absolute", left: side === "left" ? laneW / 2 - 22 : laneW * 1.5 + 8 - 22, top: y - 22, width: 44, height: 44,
          borderRadius: 22, background: c, opacity: fade, boxShadow: `0 0 16px ${c}88, 0 4px 10px #0009`, border: `3px solid ${C.bg}` }} />,
      );
    }
    return out;
  };
  return (
    <div style={{ position: "relative", width: laneW * 2 + 16, height: H, borderRadius: 18, background: C.panel, overflow: "hidden",
      border: `6px solid ${C.dim}`, boxShadow: "0 20px 50px #0009" }}>
      {[...Array(rows + 2)].map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: H - (i + 1) * stepH - off + stepH, height: 3, background: `${C.muted}55` }} />
      ))}
      <div style={{ position: "absolute", left: laneW + 5, top: 0, width: 6, height: H, background: C.dim }} />
      {people(left, "left", leftColor, keepLeft)}
      {people(right, "right", rightColor, () => true)}
    </div>
  );
};
const sparse = (i: number) => [0, 1, 3].includes(i % 5);   // 3 in 5 of a full walking lane (37.5 of 62.5)

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t27 = at.word("27%", 1, 2.0);
  return (
    <>
      <HookText>{"Walk or stand?\nOne moves **27% more**"}</HookText>
      <Riser to={t27} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05, y: 760 }]]}>
        <At x={290} y={520}><Text size={50} color={C.muted}>walk left</Text></At>
        <At x={790} y={520}><Text size={50} color={C.amber}>all stand</Text></At>
        <At x={290} y={840}><Escalator left="walk" right="stand" rows={9} stepH={52} laneW={104} keepLeft={sparse} /></At>
        <At x={790} y={840}><Escalator left="stand" right="stand" rows={9} stepH={52} laneW={104} leftColor={C.amber} rightColor={C.amber} /></At>
        <Punch at={t27}><At x={790} y={1135}><Chip size={60} color={C.amber}>+27%</Chip></At></Punch>
      </Camera>
      <Sfx name="pack/pop" at={t27} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tYou = at.word("you.", 1, 0.9);
  const tCrowd = at.word("crowd.", 1, 2.0);
  return (
    <>
      <At x={300} y={640}><Appear at={0.02} from="left"><Icon name="PersonStanding" size={230} color={C.mint} /></Appear></At>
      <At x={300} y={880}><Appear at={tYou - 0.4} from="up"><Text size={60} color={C.mint}>faster for you</Text></Appear></At>
      <Shake at={tCrowd}>
        <At x={780} y={640}><Appear at={tCrowd - 0.5} from="pop"><Icon name="Users" size={230} color={C.coral} /></Appear></At>
      </Shake>
      <At x={760} y={880}><Appear at={tCrowd - 0.3} from="up"><Text size={60} color={C.coral}>not for the crowd</Text></Appear></At>
      <Sfx name="pack/wrong" at={tCrowd} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 3. the escalator, a step every half second
const ContextBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t24 = at.word("24", 1, 0.9);
  const tHalf = at.word("half", 1, 2.8);
  const t112 = at.word("112", 1, 4.3);
  return (
    <>
      <Headline out={at.dur - 0.3}>Your escalator</Headline>
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.04 }]]}>
        <At x={540} y={770}><Appear at={0.02} from="up"><Escalator left="none" right="none" /></Appear></At>
        <At x={220} y={730}><Appear at={t24 - 0.1} from="left">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <Icon name="MoveVertical" size={160} color={C.mint} />
            <Text size={70} color={C.mint}>24 m</Text>
          </div>
        </Appear></At>
        <At x={840} y={480}><Appear at={tHalf - 0.2} from="pop"><Chip size={48} color={C.dim} text={C.ink}>1 step / 0.5 s</Chip></Appear></At>
        <At x={850} y={720}>
          <Appear at={t112 - 0.6} from="up">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Counter from={0} to={112} t0={t112 - 0.6} t1={t112 + 0.1} size={110} color={C.amber} />
              <Text size={46} color={C.muted}>steps a minute</Text>
            </div>
          </Appear>
        </At>
      </Camera>
      {t > tHalf ? <Sfx name="pack/clock-fast" at={tHalf} volume={0.2} dur={1.0} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- 4-5. standers, then walkers
const LanesBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tEmpty = at.word("empty", 1, 1.4);
  const t56 = at.word("56", 1, 4.0);
  const tW = at.beat("walk");
  const tTwo = at.word("two", 1, tW + 1.8);
  const t62 = at.word("62.", 1, tW + 4.0);
  return (
    <>
      <Headline out={tW - 0.3}>Standers: 1 empty step</Headline>
      <Headline at={tW} out={at.dur - 0.3} color={C.mint}>Walkers: 2 empty steps</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tEmpty, { zoom: 1.06, x: 600, y: 720 }], [tW, { zoom: 1.06, x: 480, y: 720 }], [t62, { zoom: 1 }]]}>
        <At x={540} y={770}>
          <Escalator left={t >= tW + 0.2 ? "walk" : "none"} right="stand" />
        </At>
        <At x={860} y={520}><Appear at={t56 - 0.1} from="slam"><Chip size={56} color={C.ink}>56 / min</Chip></Appear></At>
        <At x={210} y={520}><Appear at={t62 - 0.1} from="slam"><Chip size={56} color={C.mint}>62 / min</Chip></Appear></At>
        <At x={210} y={630}><Appear at={t62} from="up"><Text size={44} color={C.muted}>if full</Text></Appear></At>
      </Camera>
      <Sfx name="pack/whoosh-fast" at={tW + 0.2} volume={0.3} />
      <Sfx name="pack/ding-short" at={tTwo} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 6-7. re-hook: only if full; 4 in 10 climb
const ClimbBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFull = at.word("full.", 1, 1.6);
  const tIsnt = at.word("isn't.", 1, 2.4);
  const tC = at.beat("climb");
  const t8 = at.word("8", 1, tC + 1.2);
  const t4 = at.word("4", 1, tC + 2.4);
  const tHalf = at.word("half", 1, tC + 5.0);
  const tQueue = at.word("queue", 1, tC + 6.4);
  const queue = Math.floor(tween(t, tHalf, at.dur, 3, 14));
  return (
    <>
      <Headline out={tC - 0.3}>Walking wins?</Headline>
      {t < tC - 0.2 ? (
        <>
          <At x={540} y={560}><Appear at={0.05} from="pop"><Text size={140} font={F.mono}><span style={{ color: C.mint }}>62</span> {">"} 56</Text></Appear></At>
          <At x={540} y={820}><Appear at={tFull - 0.3} from="up"><Text size={66}>only if the lane is full</Text></Appear></At>
          <At x={540} y={1000}><Appear at={tIsnt - 0.1} from="slam"><Stamp size={90}>IT ISN'T</Stamp></Appear></At>
          <Sfx name="pack/wrong" at={tIsnt} volume={0.3} />
        </>
      ) : (
        <>
          <At x={540} y={320}><Appear at={tC} from="down">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Icon name="Building" size={110} color={C.muted} />
              <Text size={56}>≈ 8 floors</Text>
            </div>
          </Appear></At>
          <At x={540} y={440}>
            <Appear at={t4 - 0.1} from="up">
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[...Array(10)].map((_, i) => <Icon key={i} name="User" size={58} color={i < 4 ? C.mint : C.muted} />)}
              </div>
            </Appear>
          </At>
          <At x={540} y={515}><Appear at={t4} from="up"><Text size={50} color={C.mint}>4 in 10 walk</Text></Appear></At>
          <Camera keys={[[tC, { zoom: 1 }], [tHalf, { zoom: 1.05, x: 540, y: 820 }], [at.dur, { zoom: 1.0 }]]}>
            <At x={540} y={830}><Escalator left="walk" right="stand" rows={7} keepLeft={sparse} /></At>
            {/* the queue for the standing side, piling up at the foot */}
            <At x={640} y={1105}>
              <div style={{ display: "flex", flexWrap: "wrap", width: 330, gap: 6, justifyContent: "flex-start" }}>
                {[...Array(queue)].map((_, i) => <div key={i} style={{ width: 34, height: 34, borderRadius: 17, background: C.ink, border: `3px solid ${C.bg}` }} />)}
              </div>
            </At>
            <At x={230} y={700}><Appear at={tHalf - 0.1} from="slam"><Chip size={50} color={C.coral}>half empty</Chip></Appear></At>
            <At x={330} y={1100}><Appear at={tQueue - 0.1} from="up"><Text size={46} color={C.coral}>queue grows →</Text></Appear></At>
          </Camera>
          <Sfx name="pack/hmm" at={tHalf} volume={0.3} />
        </>
      )}
      <Sfx name="pack/whoosh-fast" at={tC} volume={0.25} />
      <Sfx name="pack/pop-2" at={t8} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 8. the fix: everyone stands
const FixBody: React.FC = () => {
  const at = useAt();
  const tBoth = at.word("both", 1, 1.4);
  const t112 = at.word("112", 1, 3.6);
  return (
    <>
      <Headline out={at.dur - 0.3} color={C.amber}>Everyone stands</Headline>
      <Camera keys={[[0, { zoom: 1.05 }], [at.dur, { zoom: 1 }]]}>
        <At x={540} y={740}><Escalator left={"stand"} right="stand" rows={10} leftColor={C.amber} rightColor={C.amber} /></At>
        <Punch at={t112}><At x={540} y={1110}><Appear at={t112 - 0.15} from="slam"><Chip size={64} color={C.amber}>112 / min</Chip></Appear></At></Punch>
      </Camera>
      <Sfx name="pack/whoosh-punchy" at={tBoth} volume={0.3} />
      <Sfx name="pack/correct" at={t112} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 9. proof: Holborn
const ProofBody: React.FC = () => {
  const at = useAt();
  const tHol = at.word("Holborn", 1, 1.2);
  const t16 = at.word("16,220", 1, 4.2);
  const t12 = at.word("12,745.", 1, 6.4);
  const t27 = at.word("27%", 1, 7.6);
  const t = useT();
  return (
    <>
      <Headline out={at.dur - 0.3}>London tried it</Headline>
      <At x={540} y={420}><Appear at={tHol - 0.2} from="pop">
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Icon name="TrainFront" size={90} color={C.mint} />
          <Text size={64}>Holborn station</Text>
        </div>
      </Appear></At>
      <At x={540} y={620}><Appear at={t16 - 0.4} from="left">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
          <Text size={46} color={C.amber}>everyone stands</Text>
          <Bar to={1} t0={t16 - 0.4} t1={t16 + 0.3} w={760} h={60} color={C.amber} />
        </div>
      </Appear></At>
      <At x={540} y={790}><Appear at={t12 - 0.4} from="left">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
          <Text size={46} color={C.muted}>walk on the left</Text>
          <Bar to={12745 / 16220} t0={t12 - 0.4} t1={t12 + 0.3} w={760} h={60} color={C.muted} />
        </div>
      </Appear></At>
      <At x={540} y={960}><Appear at={t16 - 0.3} from="up">
        <Text size={52} font={F.mono}><span style={{ color: C.amber }}>16,220</span>{t >= t12 - 0.3 ? <span style={{ color: C.muted }}> vs 12,745</span> : null}</Text>
      </Appear></At>
      <Punch at={t27}><At x={540} y={1100}><Appear at={t27 - 0.15} from="slam"><Chip size={76} color={C.amber}>+27%</Chip></Appear></At></Punch>
      <Sfx name="pack/boom-short" hit={t27} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 10. twist: short escalators
const TwistBody: React.FC = () => {
  const at = useAt();
  const tShort = at.word("short", 1, 0.8);
  const tWalk = at.word("walk,", 1, 2.0);
  const t10 = at.word("10%.", 1, 4.6);
  return (
    <>
      <Headline out={at.dur - 0.3}>But on a short one</Headline>
      <At x={320} y={720}><Appear at={tShort - 0.2} from="up"><Escalator left="walk" right="stand" rows={5} /></Appear></At>
      <At x={760} y={620}><Appear at={tWalk - 0.2} from="pop"><Text size={58} color={C.mint}>more walk</Text></Appear></At>
      <Shake at={t10}><At x={760} y={800}><Appear at={t10 - 0.15} from="slam"><Stamp size={90}>−10%</Stamp></Appear></At></Shake>
      <At x={760} y={990}><Appear at={t10} from="up"><Text size={44} color={C.muted}>if forced to stand</Text></Appear></At>
      <Sfx name="pack/thud-heavy" at={t10} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 11. CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const tLeft = at.word("left.", 1, 2.6);
  return (
    <>
      <At x={540} y={700}><Escalator left="stand" right="stand" rows={11} leftColor={C.ink} odd={{ lane: "left", color: C.coral }} /></At>
            <Sfx name="pack/whoosh-tiny" at={tLeft - 0.6} volume={0.3} />
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="stand" to="walk"><LanesBody /></Span>
    <Span from="rehook" to="climb"><ClimbBody /></Span>
    <Span from="fix"><FixBody /></Span>
    <Span from="proof"><ProofBody /></Span>
    <Span from="twist"><TwistBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
