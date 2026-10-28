// "How 8 cups of tea prove you're not guessing": Fisher's lady tasting tea (Muriel Bristol, Rothamsted).
// claim hook (8 cups, 1 in 70) -> rule out one cup (half of guessers right) -> Bristol says she tastes milk-first,
// Fisher doesn't buy it -> pour eight, four and four, shuffle -> 70 ways to pick four, one is all right ->
// re-hook: three out of four? -> a guesser does that one time in four, so the rule is set first: all four ->
// payoff: she got all eight, 1 in 70; Fisher's 1935 book -> CTA subscribe if you'd have believed her after three.
import React from "react";
import {
  Appear, At, Bar, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp,
  Text, tween, useAt, useT,
} from "../kit";

// milk-first cups after the shuffle (positions 0-7, two rows of four)
const MILK = [0, 3, 5, 6];
const pos = (i: number, y0 = 620) => ({ x: 240 + (i % 4) * 200, y: y0 + Math.floor(i / 4) * 230 });

// state per cup: "plain" (unknown), "pick" (she picked it, mint), "miss" (picked wrong, coral), "milk"/"tea" (revealed)
type Mark = "plain" | "pick" | "miss" | "milk" | "tea";
const Cup: React.FC<{ x: number; y: number; mark?: Mark; size?: number }> = ({ x, y, mark = "plain", size = 130 }) => {
  const col = mark === "pick" ? C.mint : mark === "miss" ? C.coral : mark === "milk" ? C.amber : C.ink;
  return (
    <At x={x} y={y}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <Icon name="Coffee" size={size} color={col} />
        <Text size={40} color={mark === "milk" ? C.amber : C.muted} font={F.med} style={{ opacity: mark === "milk" || mark === "tea" ? 1 : 0 }}>
          {mark === "milk" ? "milk 1st" : "tea 1st"}
        </Text>
      </div>
    </At>
  );
};
const Cups: React.FC<{ marks: (i: number) => Mark; y0?: number }> = ({ marks, y0 = 620 }) => (
  <>{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Cup key={i} {...pos(i, y0)} mark={marks(i)} />)}</>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tProve = at.word("prove", 1, 1.2);
  return (
    <>
      <HookText size={96} y={290} out={at.dur - 0.3}>{"8 cups.\n**1 in 70** luck."}</HookText>
      <Riser to={tProve} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05, y: 740 }]]}>
        <Cups y0={640} marks={(i) => (t >= tProve - 0.1 && MILK.includes(i) ? "pick" : "plain")} />
      </Camera>
      <Sfx name="pack/correct" at={tProve - 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out: one cup
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tGuesser = at.word("guesser", 1, 1.8);
  const tHalf = at.word("half", 1, 2.8);
  return (
    <>
      <Headline>One cup?</Headline>
      <At x={540} y={620}><Appear at={0.05} from="pop"><Icon name="Coffee" size={260} color={C.ink} /></Appear></At>
      <At x={540} y={900}><Appear at={tGuesser - 0.2} from="up"><Icon name="Coins" size={120} color={C.amber} /></Appear></At>
      <At x={540} y={1070}>
        <Appear at={tHalf - 0.2} from="pop"><Chip size={54} color={C.coral}>guessing: right 1 in 2</Chip></Appear>
      </At>
      <Sfx name="pack/wrong" at={tHalf - 0.1} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 3. Bristol and Fisher
const SetupBody: React.FC = () => {
  const at = useAt();
  const tMuriel = at.word("Muriel", 1, 1.8);
  const tMilk = at.word("milk", 1, 3.6);
  const tFisher = at.word("Ronald", 1, 5.0);
  const tBuy = at.word("buy", 1, 6.2);
  return (
    <>
      <Headline>Rothamsted, England</Headline>
      <At x={540} y={440}><Appear at={0.1} from="drop"><Icon name="Sprout" size={120} color={C.mint} /></Appear></At>
      <At x={540} y={600}><Appear at={tMuriel - 0.2} from="left"><Text size={58}>Muriel Bristol</Text></Appear></At>
      <At x={540} y={700}><Appear at={tMilk - 0.3} from="pop"><Chip size={46}>"I can taste if the milk went in first"</Chip></Appear></At>
      <At x={540} y={900}><Appear at={tFisher - 0.2} from="right"><Text size={58}>Ronald Fisher</Text></Appear></At>
      <Shake at={tBuy}>
        <At x={540} y={1010}><Appear at={tBuy - 0.2} from="slam"><Chip size={50} color={C.coral}>prove it</Chip></Appear></At>
      </Shake>
      <Sfx name="pack/hmm" at={tBuy - 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 4. pour eight, four and four, shuffle
const PourBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tEight = at.word("eight", 1, 0.7);
  const tFour = at.word("Four", 1, 1.6);
  const tShuffle = at.word("Shuffle", 1, 3.6);
  const tTell = at.word("tell", 1, 4.8);
  // before the shuffle: milk cups are 0-3 (top row); the shuffle slides each cup to its new place
  const START = [0, 1, 2, 3, 4, 5, 6, 7];
  const END = [0, 3, 5, 6, 1, 2, 4, 7]; // cup k (k<4 milk) ends at END[k]
  const s = tween(t, tShuffle, tShuffle + 0.8, 0, 1);
  return (
    <>
      <Headline out={tShuffle - 0.3}>Pour 8 cups</Headline>
      <Headline at={tShuffle}>Shuffle them</Headline>
      {START.map((k) => {
        const a = pos(START[k]);
        const b = pos(END[k]);
        const shown = t >= tEight - 0.2 + k * 0.08;
        const known = t >= tFour - 0.2 && t < tShuffle;
        return shown ? (
          <Cup key={k} x={a.x + (b.x - a.x) * s} y={a.y + (b.y - a.y) * s - Math.sin(s * Math.PI) * 60}
            mark={known ? (k < 4 ? "milk" : "tea") : "plain"} />
        ) : null;
      })}
      <At x={540} y={1100}><Appear at={tTell - 0.2} from="pop"><Chip size={50} color={C.mint}>4 milk first, 4 tea first</Chip></Appear></At>
      <Sfx name="pack/pop" at={tEight - 0.2} volume={0.3} />
      <Sfx name="pack/whoosh-fast" at={tShuffle} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 5. she picks four: 70 ways, one right
const PickBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tPicks = at.word("picks", 1, 0.5);
  const t70 = at.word("70", 1, 3.0);
  const tOne = at.word("one", 1, 5.0);
  // cycle through wrong picks while the 70 counts up, then land on the right four
  const WRONG = [[0, 1, 2, 3], [1, 3, 4, 6], [0, 2, 5, 7], [2, 4, 6, 7], [0, 1, 5, 6], [3, 4, 5, 7]];
  const cycling = t >= t70 - 0.3 && t < tOne - 0.2;
  const pick = cycling ? WRONG[Math.floor((t - t70 + 0.3) / 0.28) % WRONG.length] : MILK;
  return (
    <>
      <Headline out={t70 - 0.3}>Pick the 4 milk-first cups</Headline>
      <Headline at={t70}>Ways to pick 4 of 8</Headline>
      <Cups y0={560} marks={(i) => (t < tPicks ? "plain" : pick.includes(i) ? (cycling ? "miss" : "pick") : "plain")} />
      <At x={540} y={980}>
        <Appear at={t70 - 0.3} from="pop">
          <Counter from={1} to={70} t0={t70 - 0.3} t1={t70 + 0.4} size={96} color={C.amber} />
        </Appear>
      </At>
      <At x={540} y={1100}><Appear at={tOne - 0.2} from="pop"><Text size={46} color={C.mint} font={F.bold}>only 1 is all right</Text></Appear></At>
      <Sfx name="pack/counting-digital" at={t70 - 0.3} volume={0.25} dur={1.0} />
      <Sfx name="pack/correct" at={tOne - 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 6. re-hook: three out of four?
const ReHookBody: React.FC = () => {
  const at = useAt();
  const tThree = at.word("three", 1, 1.2);
  const tConv = at.word("convincing.", 1, 2.6);
  return (
    <>
      <Headline color={C.amber}>3 out of 4?</Headline>
      <Punch at={tThree} amount={0.06}>
        <Cups y0={620} marks={(i) => ([0, 3, 5].includes(i) ? "pick" : i === 1 ? "miss" : "plain")} />
      </Punch>
      <At x={540} y={1060}><Appear at={tConv - 0.3} from="pop"><Text size={50} color={C.muted}>sounds convincing…</Text></Appear></At>
      <Sfx name="pack/ding-short" at={tThree} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 7. a guesser does that 1 time in 4; set the rule first
const ThreeBody: React.FC = () => {
  const at = useAt();
  const tGuesser = at.word("guesser", 1, 0.4);
  const tFour = at.word("four.", 1, 1.6);
  const tRule = at.word("rule", 1, 2.8);
  const tAll = at.word("all", 1, 4.2);
  return (
    <>
      <Headline out={tRule - 0.3}>Guessers who get 3+</Headline>
      <Headline at={tRule}>Set the rule first</Headline>
      <At x={540} y={500}><Counter from={0} to={17} t0={tGuesser} t1={tFour} size={110} color={C.coral} suffix=" of 70" /></At>
      <At x={540} y={660}><Bar to={17 / 70} t0={tGuesser} t1={tFour} w={760} h={56} color={C.coral} /></At>
      <At x={540} y={760}><Appear at={tFour - 0.2} from="pop"><Text size={50} color={C.coral} font={F.bold}>about 1 in 4</Text></Appear></At>
      <At x={540} y={1000}>
        <Appear at={tAll - 0.25} from="slam"><Stamp size={84} color={C.amber} rotate={-5}>ALL 4 OR NOTHING</Stamp></Appear>
      </At>
      <Sfx name="pack/wrong" at={tFour - 0.2} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 8. payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tAll = at.word("all", 1, 0.5);
  const tLuck = at.word("luck,", 1, 1.6);
  const tFisher = at.word("Fisher", 1, 3.6);
  return (
    <>
      <Headline out={tFisher - 0.3} color={C.mint}>She got all 8</Headline>
      <Headline at={tFisher}>The Design of Experiments</Headline>
      {t < tFisher - 0.2 ? (
        <>
          <Cups y0={520} marks={(i) => (t >= tAll ? (MILK.includes(i) ? "milk" : "tea") : "plain")} />
          <At x={540} y={1060}>
            <Appear at={tLuck - 0.2} from="slam"><Chip size={64}>luck: 1 in 70 = 1.4%</Chip></Appear>
          </At>
        </>
      ) : (
        <>
          <At x={540} y={600}><Appear at={tFisher - 0.2} from="drop"><Icon name="BookOpen" size={230} color={C.amber} /></Appear></At>
          <At x={540} y={860}><Appear at={tFisher} from="pop"><Text size={80} color={C.ink} font={F.bold}>1935</Text></Appear></At>
        </>
      )}
      <Sfx name="pack/win" at={tAll} volume={0.3} />
      <Sfx name="pack/paper-flip" at={tFisher - 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 9. CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const tThree = at.word("three.", 1, 1.8);
  return (
    <>
      <Headline>Believe her after 3?</Headline>
      <Punch at={tThree} amount={0.05}>
        <Cups y0={620} marks={(i) => ([0, 3, 5].includes(i) ? "pick" : i === 1 ? "miss" : "plain")} />
      </Punch>
      <At x={540} y={1060}><Text size={46} color={C.muted}>a guesser does it 1 time in 4</Text></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="setup"><SetupBody /></Span>
    <Span from="pour"><PourBody /></Span>
    <Span from="pick"><PickBody /></Span>
    <Span from="rehook"><ReHookBody /></Span>
    <Span from="three"><ThreeBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
