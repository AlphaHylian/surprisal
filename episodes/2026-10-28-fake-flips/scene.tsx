// "How to spot fake coin flips in one look": the longest streak in 200 flips.
// versus hook (two lists, the more random-looking one is fake) -> rule out counting heads -> a professor spots
// nearly every faker -> find the longest streak -> fakers switch too often -> re-hook: is six in a row normal? ->
// each flip matches half the time, 1 in 32, 195 places to start -> payoff: 97 in 100 real lists have six ->
// CTA: flip 20 times, what's your longest streak?
import React from "react";
import {
  Appear, At, Bar, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp,
  Text, Tiles, useAt, useT,
} from "../kit";

// the first 40 flips of each list (checked in verify.py: real longest streak 6, fake longest 2)
const REAL = "HTTHHHHHHTHTTHTTTHHTHHTTTHTHHHTTHTHTTTTH";
const FAKE = "HTHHTHTTHTHHTHTTHTHTHHTHTTHTHTHHTTHTHTHT";
const STREAK = [3, 4, 5, 6, 7, 8];
const hiOf = (idx: number[], col: string) => Object.fromEntries(idx.map((i) => [i, col]));

const List: React.FC<{ s: string; x: number; y: number; size?: number; hi?: Record<number, string>; label?: string; labelColor?: string; perRow?: number }> =
  ({ s, x, y, size = 46, hi = {}, label, labelColor = C.muted, perRow = 8 }) => (
    <>
      {label ? <At x={x} y={y - 210}><Text size={44} color={labelColor}>{label}</Text></At> : null}
      <At x={x} y={y}><Tiles text={s} size={size} perRow={perRow} gap={6} hi={hi} show={-5} sfx={false} /></At>
    </>
  );

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tFake = at.word("fake.", 1, 2.4);
  return (
    <>
      <HookText size={92} y={270} out={at.dur - 0.3}>{"Looks random?\n**Fake.**"}</HookText>
      <Riser to={tFake} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.04, y: 720 }]]}>
        <List s={FAKE} x={290} y={720} label="List A" />
        <List s={REAL} x={790} y={720} label="List B" />
        <At x={290} y={1000}><Appear at={tFake - 0.15} from="slam"><Chip size={52} color={C.coral}>FAKE</Chip></Appear></At>
        <At x={790} y={1000}><Appear at={tFake + 0.05} from="pop"><Chip size={52} color={C.mint}>REAL</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/wrong" at={tFake - 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out: counting heads
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tBoth = at.word("Both", 1, 1.2);
  return (
    <>
      <Headline>Count the heads?</Headline>
      <List s={FAKE} x={290} y={680} hi={Object.fromEntries([...FAKE].map((c, i) => [i, c === "H" ? C.ink : ""]).filter(([, v]) => v))} />
      <List s={REAL} x={790} y={680} hi={Object.fromEntries([...REAL].map((c, i) => [i, c === "H" ? C.ink : ""]).filter(([, v]) => v))} />
      <At x={290} y={960}><Appear at={tBoth - 0.2} from="pop"><Chip size={48} color={C.mint}>≈ 100 heads</Chip></Appear></At>
      <At x={790} y={960}><Appear at={tBoth} from="pop"><Chip size={48} color={C.mint}>≈ 100 heads</Chip></Appear></At>
      <Sfx name="pack/counting-digital" at={0.1} volume={0.2} dur={0.8} />
    </>
  );
};

// ---------------------------------------------------------------- 3. the professor's homework
const SetupBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFlip = at.word("flip", 1, 1.8);
  const tFake = at.word("fake", 1, 3.2);
  const tSpots = at.word("spots", 1, 5.0);
  const caught = [1, 3, 4];
  return (
    <>
      <Headline out={tSpots - 0.3}>Homework: 200 flips</Headline>
      <Headline at={tSpots} color={C.coral}>Every faker, caught</Headline>
      <At x={540} y={500}><Appear at={0.1} from="drop"><Icon name="GraduationCap" size={170} color={C.amber} /></Appear></At>
      <At x={320} y={720}><Appear at={tFlip - 0.2} from="left"><Chip size={48} color={C.mint}>flip 200 times</Chip></Appear></At>
      <At x={760} y={720}><Appear at={tFake - 0.2} from="right"><Chip size={48} color={C.coral}>or fake it</Chip></Appear></At>
      <At x={500} y={930}>
        <Appear at={tFake + 0.3} from="up">
          <div style={{ display: "flex", gap: 26 }}>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const bad = caught.includes(i) && t >= tSpots + i * 0.12;
              return <Icon key={i} name={bad ? "UserX" : "User"} size={110} color={bad ? C.coral : C.ink} />;
            })}
          </div>
        </Appear>
      </At>
      <Sfx name="pack/paper-flip" at={tFlip - 0.2} volume={0.35} />
      <Sfx name="pack/access-denied" at={tSpots} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 4. find the longest streak (real list)
const StreakBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tLongest = at.word("longest", 1, 1.0);
  const tRow = at.word("row.", 1, 4.0);
  return (
    <>
      <Headline>Find the longest streak</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tLongest, { zoom: 1 }], [tLongest + 0.6, { zoom: 1.12, x: 540, y: 600 }]]}>
        <List s={REAL} x={540} y={680} size={76} perRow={10} hi={t >= tLongest ? hiOf(STREAK, C.amber) : {}} />
      </Camera>
      <At x={540} y={1060}><Appear at={tRow - 0.4} from="pop"><Chip size={54}>6 in a row</Chip></Appear></At>
      <Sfx name="pack/ding-short" at={tLongest} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 5. fakers switch too often
const FakersBody: React.FC = () => {
  const at = useAt();
  const tSwitch = at.word("switch", 1, 0.6);
  const tSix = at.word("Six", 1, 2.4);
  const tRigged = at.word("rigged,", 1, 3.6);
  return (
    <>
      <Headline color={C.coral}>Fakers switch too often</Headline>
      <List s={FAKE} x={540} y={640} size={76} perRow={10} />
      <At x={540} y={960}><Appear at={tSwitch} out={tSix - 0.3} from="pop"><Chip size={50} color={C.coral}>switches 31 times in 39</Chip></Appear></At>
      <Shake at={tRigged}>
        <At x={540} y={1060}><Appear at={tSix - 0.1} from="up"><Tiles text="HHHHHH" size={70} hi={hiOf([0, 1, 2, 3, 4, 5], C.coral)} show={tSix - 0.1} stagger={0.05} /></Appear></At>
      </Shake>
      <Sfx name="pack/whoosh-fast" at={tSwitch} volume={0.3} />
      <Sfx name="pack/wrong" at={tRigged} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 6. re-hook
const ReHookBody: React.FC = () => {
  const at = useAt();
  const tNormal = at.word("normal?", 1, 1.4);
  return (
    <>
      <Headline color={C.amber}>Is 6 in a row normal?</Headline>
      <Punch at={tNormal} amount={0.08}>
        <At x={540} y={700}><Tiles text="HHHHHH" size={120} hi={hiOf([0, 1, 2, 3, 4, 5], C.amber)} show={0} stagger={0.05} /></At>
      </Punch>
      <At x={540} y={960}><Appear at={tNormal - 0.2} from="pop"><Icon name="CircleHelp" size={140} color={C.amber} /></Appear></At>
      <Sfx name="pack/hmm" at={tNormal - 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 7. the math: 1 in 2, 1 in 32, 195 places
const MathBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tHalf = at.word("half", 1, 1.4);
  const tFive = at.word("Five", 1, 2.6);
  const t32 = at.word("32.", 1, 4.4);
  const t200 = at.word("200", 1, 5.6);
  const t195 = at.word("195", 1, 7.4);
  const nMatch = t < tFive ? (t >= tHalf ? 1 : 0) : Math.min(5, 1 + Math.floor((t - tFive) / 0.3));
  const chain = "H" + "H".repeat(nMatch);
  return (
    <>
      <Headline out={t200 - 0.3}>Each flip: 1 in 2 to match</Headline>
      <Headline at={t200}>200 flips, 195 chances</Headline>
      {t < t200 - 0.2 ? (
        <>
          <At x={540} y={620}><Tiles text={chain} size={110} hi={hiOf([1, 2, 3, 4, 5].slice(0, nMatch), C.mint)} show={-5} sfx={false} /></At>
          <At x={540} y={820}><Appear at={tHalf - 0.2} from="fade"><Text size={56} color={C.mint} font={F.bold}>{["½", "½ × ½", "½ × ½ × ½", "½ × ½ × ½ × ½", "½ × ½ × ½ × ½ × ½"][Math.max(0, nMatch - 1)].replace(/½/g, "1/2")}</Text></Appear></At>
          <At x={540} y={1000}><Appear at={t32 - 0.3} from="slam"><Chip size={60}>= 1 in 32</Chip></Appear></At>
        </>
      ) : (
        <>
          <At x={540} y={640}>
            <Appear at={t200 - 0.2} from="fade">
              <Tiles text={(REAL + FAKE + REAL + FAKE + REAL).slice(0, 200)} size={34} perRow={20} gap={4}
                hi={Object.fromEntries(Array.from({ length: 195 }, (_, i) => [i, i < Math.floor((t - t200) / 0.012) ? C.amber : ""]).filter(([, v]) => v))}
                show={-5} sfx={false} />
            </Appear>
          </At>
          <At x={540} y={1050}>
            <Appear at={t195 - 0.4} from="pop">
              <Counter from={0} to={195} t0={t195 - 0.4} t1={t195 + 0.3} size={72} color={C.amber} suffix=" places to start" />
            </Appear>
          </At>
        </>
      )}
      <Sfx name="pack/ding" at={t32 - 0.2} volume={0.3} />
      <Sfx name="pack/counting-digital" at={t200} volume={0.2} dur={1.4} />
    </>
  );
};

// ---------------------------------------------------------------- 8. payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t97 = at.word("97", 1, 1.8);
  const tNo = at.word("No", 1, 3.8);
  const tMade = at.word("made", 1, 5.2);
  return (
    <>
      <Headline out={tNo - 0.3}>Real lists with 6 in a row</Headline>
      <Headline at={tNo} color={C.coral}>No streak of 6?</Headline>
      <At x={540} y={560}><Counter from={0} to={97} t0={0.2} t1={t97 + 0.2} size={200} color={C.amber} suffix="%" /></At>
      <At x={540} y={760}><Bar to={0.97} t0={0.2} t1={t97 + 0.2} w={760} h={60} color={C.amber} /></At>
      <At x={540} y={1010}>
        <Appear at={tMade - 0.25} from="slam"><Stamp size={100} color={C.coral} rotate={-6}>MADE UP</Stamp></Appear>
      </At>
      <Sfx name="pack/hit-swell" hit={t97} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 9. CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const tStreak = at.word("streak?", 1, 2.2);
  return (
    <>
      <Headline>Your turn: 20 flips</Headline>
      <At x={540} y={560}><Appear at={0.05} from="drop"><Icon name="Coins" size={170} color={C.amber} /></Appear></At>
      <At x={540} y={820}><Tiles text="HTTHHHTHTT" size={80} gap={8} show={0.2} stagger={0.06} /></At>
      <At x={540} y={1020}><Appear at={tStreak - 0.3} from="pop"><Chip size={56}>longest streak = ?</Chip></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="setup"><SetupBody /></Span>
    <Span from="streak"><StreakBody /></Span>
    <Span from="fakers"><FakersBody /></Span>
    <Span from="rehook"><ReHookBody /></Span>
    <Span from="math"><MathBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
