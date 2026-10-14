// "How to pick the best flat when you can't go back". Mistake hook (take the first nice flat and you'll miss
// the best) -> rule out waiting for perfect -> 20 viewings, yes or no on the spot -> gut feel: 1 in 20 = 5%
// -> step 1: view the first 7, say no to all -> learning what good looks like -> step 2: sign the first that
// beats all 7 -> best 38%, top 3 63% -> catch: best in the first 7 -> stuck with the last (35%) -> scales:
// 100 skip 37, 1,000 skip 368, still 37% -> payoff: the 37% rule, secretary problem -> CTA: subscribe.
import React from "react";
import {
  Appear, At, C, Camera, Chip, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// one example month: scores out of 100, in viewing order. Best of the first 7: 81. First to beat it: flat 12 (93), the best.
const SCORES = [62, 48, 81, 55, 70, 39, 66, 58, 74, 44, 77, 93, 85, 51, 68, 90, 47, 60, 72, 35];
// the unlucky month: the best (95) is flat 4, so nothing later beats it
const UNLUCKY = [62, 48, 70, 95, 55, 39, 66, 58, 74, 44, 77, 83, 85, 51, 68, 90, 47, 60, 72, 35];

type State = "hidden" | "seen" | "no" | "signed" | "best" | "dim" | "gone";

/** One flat: a house icon and its score. */
const Flat: React.FC<{ n: number; score: number; state: State; size?: number }> = ({ n, score, state, size = 170 }) => {
  const col = state === "signed" ? C.amber : state === "best" ? C.mint : state === "no" || state === "dim" ? C.muted : state === "gone" ? C.coral : C.ink;
  const glow = state === "signed" || state === "best";
  return (
    <div style={{ width: size, height: size * 1.05, borderRadius: 20, background: C.panel, border: `4px solid ${col}`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
      opacity: state === "dim" ? 0.45 : 1, boxShadow: glow ? `0 0 34px ${col}` : "none", position: "relative" }}>
      <Icon name="House" size={size * 0.38} color={col} stroke={1.8} />
      <div style={{ fontFamily: F.bold, fontSize: size * 0.27, color: state === "hidden" ? C.muted : C.ink, lineHeight: 1 }}>{state === "hidden" ? "?" : score}</div>
      <div style={{ position: "absolute", top: 6, left: 12, fontFamily: F.med, fontSize: size * 0.14, color: C.muted }}>{n}</div>
      {state === "no" ? <div style={{ position: "absolute", fontFamily: F.bold, fontSize: size * 0.7, color: C.coral, opacity: 0.85, lineHeight: 1 }}>✕</div> : null}
    </div>
  );
};

/** The 20 flats as a 5 x 4 grid; `state(i)` gives each one's look. */
const Grid: React.FC<{ scores?: number[]; state: (i: number) => State; size?: number }> = ({ scores = SCORES, state, size = 170 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(5, ${size}px)`, gap: 22 }}>
    {scores.map((s, i) => <Flat key={i} n={i + 1} score={s} state={state(i)} size={size} />)}
  </div>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tBest = at.word("best", 1, 2.2);
  return (
    <>
      <HookText>{"First nice flat?\n**Wrong move.**"}</HookText>
      <Riser to={tBest} volume={0.45} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05, x: 540, y: 820 }]]}>
        <At x={540} y={815}>
          <Grid size={128} state={i => (i === 2 ? "signed" : i === 11 ? (t >= tBest - 0.2 ? "best" : "seen") : i < 12 ? "seen" : "hidden")} />
        </At>
      </Camera>
      <Sfx name="pack/suspense-sting" at={tBest - 0.2} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out + context
const WaitBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tPerfect = at.word("perfect", 1, 1.2);
  const tSigns = at.word("signs", 1, 3.0);
  const tBack = at.word("back", 1, 4.2);
  const tCtx = at.beat("context");
  const t20 = at.word("20", 1, tCtx + 0.8);
  const tSpot = at.word("spot", 1, tCtx + 3.6);
  return (
    <>
      <Headline out={tCtx - 0.3}>Waiting for perfect?</Headline>
      <Headline at={tCtx}>20 viewings. Yes or no.</Headline>
      {t < tCtx ? (
        <>
          <At x={540} y={640}><Appear at={tPerfect - 0.3} from="pop"><Flat n={9} score={74} state={t >= tSigns ? "gone" : "seen"} size={300} /></Appear></At>
          <At x={540} y={640}><Appear at={tSigns} from="slam" sfx="pack/slam-metal" volume={0.35}><Stamp size={90}>TAKEN</Stamp></Appear></At>
          <At x={540} y={1050}><Appear at={tBack - 0.2} from="up"><Chip color={C.coral} size={56}>no going back</Chip></Appear></At>
        </>
      ) : (
        <>
          <At x={540} y={760}><Grid state={i => (t >= t20 - 0.4 + i * 0.04 ? "hidden" : "dim")} size={150} /></At>
          <Sfx name="pack/paper-flip" at={t20 - 0.4} volume={0.35} />
          <At x={540} y={1130}><Appear at={tSpot - 0.3} from="up"><Text size={50} color={C.muted}>decide on the spot</Text></Appear></At>
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------- 3. gut feel: 5%
const GutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tGut = at.word("gut", 1, 0.6);
  const t20 = at.word("20", 1, 3.4);
  const t5 = at.word("5%", 1, 4.4);
  const pick = Math.floor(tween(t, tGut, tGut + 1.6, 0, 19.99));
  return (
    <>
      <Headline>Gut feel</Headline>
      <At x={540} y={650}><Grid state={i => (i === pick && t >= tGut ? "signed" : "hidden")} size={140} /></At>
      <Sfx name="pack/fast-forward" at={tGut} dur={1.6} volume={0.25} />
      <Punch at={t5}>
        <At x={540} y={1080}><Appear at={t20 - 0.2} from="pop"><Text size={96} font={F.bold} color={C.coral}>1 in 20 = 5%</Text></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 4-5. step 1: say no to the first 7
const SkipBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t7 = at.word("7", 1, 1.6);
  const tNo = at.word("no", 1, 2.8);
  const tGreat = at.word("great", 1, 4.4);
  const tLearn = at.beat("learn");
  const tGood = at.word("good", 1, tLearn + 2.6);
  const st = (i: number): State => {
    if (i >= 7) return "dim";
    if (t < t7 - 0.2 + i * 0.12) return "hidden";
    if (t < tNo + i * 0.1) return "seen";
    return "no";
  };
  return (
    <>
      <Headline out={tLearn - 0.3}>Step 1: say no to the first 7</Headline>
      <Headline at={tLearn} color={C.mint}>Learn what good looks like</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t7, { zoom: 1.12, x: 540, y: 640 }], [tLearn + 0.5, { zoom: 1.12, x: 540, y: 640 }], [tGood, { zoom: 1 }]]}>
        <At x={540} y={700}><Grid state={st} size={140} /></At>
      </Camera>
      <Sfx name="pack/paper-flip" at={t7 - 0.2} volume={0.3} />
      <Sfx name="pack/wrong" at={tNo} volume={0.3} />
      <At x={540} y={290 + 80}><Appear at={tGreat - 0.2} out={tLearn - 0.2} from="pop"><Chip color={C.coral} size={50}>even the 81</Chip></Appear></At>
      <At x={540} y={1110}><Appear at={tLearn + 0.3} from="up"><Chip size={54}>best so far: 81</Chip></Appear></At>
      <Sfx name="pack/ding" at={tLearn + 0.3} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 6. step 2: sign the first that beats all 7
const PounceBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t8 = at.word("8", 1, 1.4);
  const tBeats = at.word("beats", 1, 3.2);
  // flats 8..12 revealed one by one; flat 12 (93) beats 81
  const show = (i: number) => t8 - 0.2 + (i - 7) * 0.45;
  const st = (i: number): State => {
    if (i < 7) return "no";
    if (i > 11) return "dim";
    if (t < show(i)) return "hidden";
    if (i === 11) return t >= tBeats ? "signed" : "seen";
    return "dim";
  };
  return (
    <>
      <Headline>Step 2: first to beat 81</Headline>
      <At x={540} y={690}><Grid state={st} size={140} /></At>
      {[7, 8, 9, 10, 11].map(i => <Sfx key={i} name={i === 11 ? "pack/pop-3" : "pack/click-soft"} at={show(i)} volume={0.3} />)}
      <Punch at={tBeats}>
        <At x={540} y={1100}><Appear at={tBeats - 0.1} from="slam" sfx="pack/correct" volume={0.4}><Chip size={54}>93 beats 81: sign it</Chip></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 7. result: 38% vs 5%, top 3 63%
const ResultBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t38 = at.word("38%", 1, 1.6);
  const t5 = at.word("5", 1, 3.0);
  const tTop = at.word("top", 1, 3.8);
  const tThree = at.word("three", 1, 6.0);
  const bar = (v: number, show: number, col: string, label: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 24, opacity: t >= show ? 1 : 0 }}>
      <div style={{ width: 260, textAlign: "right" }}><Text size={44} color={C.muted}>{label}</Text></div>
      <div style={{ width: tween(t, show, show + 0.6, 0, v * 9), height: 80, background: col, borderRadius: 12 }} />
      <Text size={60} font={F.bold}>{v}%</Text>
    </div>
  );
  return (
    <>
      <Headline color={C.amber}>The very best flat</Headline>
      <At x={500} y={620}>
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {bar(5, t5 - 0.3, C.coral, "gut feel")}
          {bar(38, t38 - 0.3, C.amber, "skip 7 rule")}
        </div>
      </At>
      <Sfx name="pack/pop" at={t38 - 0.3} volume={0.3} />
      <Sfx name="pack/pop-2" at={t5 - 0.3} volume={0.3} />
      <Punch at={tThree}>
        <At x={540} y={1020}><Appear at={tTop - 0.1} from="up"><Chip color={C.mint} size={62}>a top-3 flat: 63%</Chip></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 8. the catch: best in the first 7
const CatchBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tBest = at.word("best", 1, 1.0);
  const tNothing = at.word("nothing", 1, 2.4);
  const tLast = at.word("last", 1, 4.2);
  const t35 = at.word("35%", 1, 5.8);
  const st = (i: number): State => {
    if (i === 3) return "no";
    if (i < 7) return "no";
    if (i === 19) return t >= tLast - 0.2 ? "gone" : t >= tNothing ? "dim" : "hidden";
    return t >= tNothing + (i - 7) * 0.05 ? "dim" : "hidden";
  };
  return (
    <>
      <Headline color={C.coral}>The catch</Headline>
      <Shake at={tLast}>
        <At x={540} y={720}><Grid scores={UNLUCKY} state={st} size={140} /></At>
      </Shake>
      <At x={540} y={350}><Appear at={tBest - 0.2} from="pop"><Chip color={C.coral} size={42}>the best: flat 4 (95)</Chip></Appear></At>
      <Sfx name="pack/suspense-sting" at={tBest - 0.2} volume={0.3} />
      <At x={540} y={1120}><Appear at={t35 - 0.2} from="slam" sfx="pack/wrong" volume={0.4}><Chip color={C.coral} size={46}>stuck with the last: 35%</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 9. it scales: still 37%
const ScaleBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t100 = at.word("100", 1, 1.2);
  const t37 = at.word("37", 1, 2.2);
  const tK = at.word("thousand", 1, 3.2);
  const t368 = at.word("368", 1, 4.2);
  const tLand = at.word("best", 1, 8.5);
  const row = (n: string, skip: string, show: number, show2: number) => (
    <div style={{ display: "flex", gap: 30, alignItems: "center", opacity: t >= show ? 1 : 0 }}>
      <div style={{ width: 320, textAlign: "right" }}><Text size={64} font={F.bold}>{n} flats</Text></div>
      <Text size={56} color={C.muted}>→</Text>
      <div style={{ opacity: t >= show2 ? 1 : 0 }}><Chip color={C.panel} text={C.ink} size={56}>skip {skip}</Chip></div>
    </div>
  );
  return (
    <>
      <Headline>It scales</Headline>
      <At x={520} y={560}>
        <div style={{ display: "flex", flexDirection: "column", gap: 44 }}>
          {row("100", "37", t100 - 0.2, t37 - 0.2)}
          {row("1,000", "368", tK - 0.2, t368 - 0.2)}
        </div>
      </At>
      <Sfx name="pack/pop" at={t100 - 0.2} volume={0.3} />
      <Sfx name="pack/pop-2" at={tK - 0.2} volume={0.3} />
      <Punch at={tLand}>
        <At x={540} y={870}><Appear at={tLand - 0.2} from="slam" sfx="pack/punch" volume={0.45}><Text size={200} font={F.bold} color={C.amber} glow>37%</Text></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 10. payoff: the 37% rule
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tThen = at.word("Then", 1, 1.6);
  const tSec = at.word("secretary", 1, 4.6);
  const cut = 7;
  return (
    <>
      <Headline color={C.amber}>The 37% rule</Headline>
      <At x={540} y={560}>
        <div style={{ display: "flex", gap: 6 }}>
          {SCORES.map((s, i) => (
            <div key={i} style={{ width: 40, height: s * 3.6, alignSelf: "flex-end", borderRadius: 6,
              background: i < cut ? C.muted : i === 11 && t >= tThen ? C.amber : C.mint, opacity: i < cut ? 0.6 : 1 }} />
          ))}
        </div>
      </At>
      <At x={540} y={790}>
        <div style={{ display: "flex", gap: 30 }}>
          <Appear at={0.2} from="up"><Chip color={C.panel} text={C.ink} size={48}>look: first 37%</Chip></Appear>
          <Appear at={tThen - 0.1} from="up"><Chip size={48}>take the first better</Chip></Appear>
        </div>
      </At>
      <Sfx name="pack/whoosh-fast" at={tThen - 0.4} volume={0.3} />
      <At x={540} y={1040}><Appear at={tSec - 0.3} from="pop" sfx="pack/ding" volume={0.35}><Text size={64} color={C.muted} font={F.med}>the secretary problem</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 11. CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const tFirst = at.word("first", 1, 1.4);
  return (
    <>
      <At x={540} y={680}><Grid state={i => (i === 2 ? "signed" : i < 12 ? "seen" : "hidden")} size={140} /></At>
      <At x={540} y={1090}><Appear at={tFirst - 0.2} from="pop"><Chip color={C.panel} text={C.ink} size={50}>would you have signed the 81?</Chip></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout" to="context"><WaitBody /></Span>
    <Span from="random"><GutBody /></Span>
    <Span from="skip" to="learn"><SkipBody /></Span>
    <Span from="pounce"><PounceBody /></Span>
    <Span from="result"><ResultBody /></Span>
    <Span from="rehook"><CatchBody /></Span>
    <Span from="scale"><ScaleBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
