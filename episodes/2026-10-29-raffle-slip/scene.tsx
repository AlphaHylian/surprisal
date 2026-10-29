// "How to run a fair raffle with one slip of paper": one-slot reservoir sampling (Algorithm R).
// versus hook (every name vs one slip) -> your party raffle, unknown guest count, one slip -> first/last unfair ->
// guest 1 writes the slip -> guest 2 coin -> guest 3 die 1-2, guest 10 1 in 10 -> re-hook: is guest one doomed? ->
// survives 1/2, 2/3, 3/4, multiply, cancels -> payoff: 1 in 100 for everyone, count never needed ->
// reveal: reservoir sampling -> CTA subscribe if you'd have kept every name (loops to the hook).
import React from "react";
import {
  Appear, At, C, Camera, Card, Chip, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp,
  Text, tween, useAt, useT,
} from "../kit";

// the one slip of paper with a name on it
const Slip: React.FC<{ name: string; color?: string; w?: number }> = ({ name, color = C.amber, w = 520 }) => (
  <Card w={w} h={170} border={color}>
    <Text size={64} color={color} font={F.bold}>{name}</Text>
  </Card>
);
// a row of guests, the first n shown, one highlighted
const Guests: React.FC<{ n: number; hi?: number; y?: number; size?: number }> = ({ n, hi = -1, y = 560, size = 110 }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <At key={i} x={540 - ((n - 1) * (size + 20)) / 2 + i * (size + 20)} y={y}>
        <Icon name="User" size={size} color={i === hi ? C.amber : C.ink} />
      </At>
    ))}
  </>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tOne = at.word("one.", 1, 1.4);
  const tFair = at.word("fair", 1, 2.4);
  return (
    <>
      <HookText size={92} y={290} out={at.dur - 0.3}>{"Every name\nor **1 slip**?"}</HookText>
      <Riser to={tFair} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05, y: 760 }]]}>
        <At x={300} y={720}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Icon name="Archive" size={220} color={C.muted} />
            <Text size={46} color={C.muted} font={F.med}>200 names</Text>
          </div>
        </At>
        <At x={540} y={720}><Text size={70} color={C.muted} font={F.bold}>vs</Text></At>
        <Punch at={tOne} amount={0.08}><At x={790} y={720}><Icon name="FileText" size={220} color={C.amber} /></At></Punch>
        <At x={790} y={900}><Text size={46} color={C.amber} font={F.bold}>1 name</Text></At>
        <At x={540} y={1080}>
          <div style={{ opacity: t >= tFair - 0.1 ? 1 : 0 }}><Chip size={52} color={C.mint}>both fair</Chip></div>
        </At>
      </Camera>
      <Sfx name="pack/correct" at={tFair - 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 2. the problem
const ProblemBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tArr = at.word("arriving,", 1, 1.4);
  const tHow = at.word("many,", 1, 2.8);
  const tSlip = at.word("slip", 1, 4.2);
  const n = Math.min(6, Math.max(0, Math.floor((t - tArr + 0.4) / 0.35)));
  return (
    <>
      <Headline>Your party raffle</Headline>
      <At x={540} y={440}><Icon name="PartyPopper" size={110} color={C.amber} /></At>
      <Guests n={n} y={640} size={100} />
      <At x={540} y={800}><Appear at={tHow - 0.2} from="pop"><Text size={70} color={C.coral} font={F.bold}>how many?</Text></Appear></At>
      <At x={540} y={1020}><Appear at={tSlip - 0.2} from="drop"><Slip name="1 slip" color={C.amber} w={420} /></Appear></At>
      <Sfx name="pack/pop" at={tArr - 0.4} volume={0.25} />
      <Sfx name="pack/paper-slide" at={tSlip - 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 3. rule out first / last
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tFirst = at.word("first", 1, 0.6);
  const tLast = at.word("last?", 1, 2.0);
  return (
    <>
      <Headline>First guest? Last guest?</Headline>
      <Guests n={6} hi={-1} y={640} />
      <At x={540 - 2.5 * 130} y={820}><Appear at={tFirst - 0.1} from="slam"><Text size={72} color={C.coral} font={F.bold}>✗</Text></Appear></At>
      <At x={540 + 2.5 * 130} y={820}><Appear at={tLast - 0.1} from="slam"><Text size={72} color={C.coral} font={F.bold}>✗</Text></Appear></At>
      <At x={540} y={1000}><Appear at={tLast + 0.4} from="up"><Text size={56} color={C.coral} font={F.bold}>both unfair</Text></Appear></At>
      <Sfx name="pack/wrong" at={tFirst} volume={0.25} />
      <Sfx name="pack/wrong" at={tLast} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 4. guest one
const FirstBody: React.FC = () => {
  const at = useAt();
  const tWrite = at.word("Write", 1, 1.2);
  return (
    <>
      <Headline>Guest 1</Headline>
      <Guests n={1} hi={0} y={560} size={150} />
      <At x={540} y={880}><Appear at={tWrite - 0.2} from="pop"><Slip name="Ana" /></Appear></At>
      <Sfx name="pack/paper-flip" at={tWrite - 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 5. guest two: coin
const CoinBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCoin = at.word("coin.", 1, 1.2);
  const tHeads = at.word("Heads,", 1, 2.0);
  const swapped = t >= tHeads + 0.6;
  return (
    <>
      <Headline>Guest 2: flip a coin</Headline>
      <Guests n={2} hi={1} y={480} size={130} />
      <At x={540} y={700}>
        <Appear at={tCoin - 0.3} from="drop"><Icon name="Coins" size={140} color={C.amber} /></Appear>
      </At>
      <At x={540} y={830}><Appear at={tCoin - 0.1} from="pop"><Chip size={50} color={C.mint}>1 in 2</Chip></Appear></At>
      <At x={540} y={1030}><Slip name={swapped ? "Ben" : "Ana"} color={swapped ? C.mint : C.amber} /></At>
      <Sfx name="coin" at={tCoin - 0.2} />
      <Sfx name="pack/paper-crumple" at={tHeads + 0.6} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 6. guest three: die; guest 10
const DieBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tDie = at.word("die.", 1, 1.0);
  const tOne = at.word("one", 2, 2.6);
  const t10 = at.word("10", 1, 4.6);
  const show10 = t >= t10 - 0.3;
  return (
    <>
      <Headline out={t10 - 0.4}>Guest 3: roll a die</Headline>
      <Headline at={t10 - 0.3}>Guest k: 1 in k</Headline>
      {!show10 ? (
        <>
          <Guests n={3} hi={2} y={480} size={130} />
          <At x={540} y={720}><Appear at={tDie - 0.3} from="drop"><Icon name="Dice5" size={160} color={C.amber} /></Appear></At>
          <At x={540} y={900}><Appear at={tOne - 0.3} from="pop"><Chip size={56} color={C.mint}>1 or 2 = 1 in 3</Chip></Appear></At>
        </>
      ) : (
        <>
          <Guests n={10} hi={9} y={540} size={72} />
          <At x={540} y={760}><Appear at={t10 - 0.3} from="slam"><Text size={110} color={C.amber} font={F.bold}>1 in 10</Text></Appear></At>
          <At x={540} y={940}><Appear at={t10 + 0.3} from="up"><Text size={56} color={C.muted} font={F.med}>guest 100: 1 in 100</Text></Appear></At>
        </>
      )}
      <Sfx name="pack/drum-roll" at={tDie - 0.3} volume={0.2} dur={0.8} />
      <Sfx name="pack/ding-short" at={t10 - 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 7. re-hook: is guest one doomed?
const ReHookBody: React.FC = () => {
  const at = useAt();
  const tEvery = at.word("every", 1, 1.4);
  const tDoomed = at.word("doomed?", 1, 2.8);
  return (
    <>
      <Headline color={C.amber}>Is guest 1 doomed?</Headline>
      <At x={540} y={560}><Icon name="User" size={170} color={C.amber} /></At>
      <At x={540} y={800}>
        <Appear at={tEvery - 0.2} from="pop"><Text size={60} color={C.coral} font={F.bold}>swap, swap, swap, swap…</Text></Appear>
      </At>
      <Shake at={tDoomed}>
        <At x={540} y={980}><Appear at={tDoomed - 0.2} from="slam"><Chip size={56} color={C.coral}>99 chances to lose it</Chip></Appear></At>
      </Shake>
      <Sfx name="pack/hmm" at={tDoomed} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 8. proof: the product cancels
const ProofBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tHalf = at.word("half", 1, 1.4);
  const tTwo = at.word("two", 2, 2.6);
  const tThree = at.word("three", 1, 3.6);
  const tMult = at.word("Multiply,", 1, 4.8);
  const tCancel = at.word("cancels.", 1, 6.0);
  const fr = [["1", "2", tHalf], ["2", "3", tTwo], ["3", "4", tThree], ["99", "100", tMult]] as const;
  const struck = t >= tCancel - 0.3;
  return (
    <>
      <Headline>Guest 1 survives…</Headline>
      <At x={540} y={640}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: F.bold, fontSize: 72, color: C.ink }}>
          {fr.map(([a, b, ta], i) => (
            <React.Fragment key={i}>
              {i === 3 ? <span style={{ opacity: t >= tMult - 0.3 ? 1 : 0 }}>…×</span> : i > 0 ? <span style={{ opacity: t >= ta - 0.3 ? 1 : 0 }}>×</span> : null}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: t >= ta - 0.3 ? 1 : 0 }}>
                <span style={{ color: i > 0 && struck ? C.muted : C.ink, textDecoration: i > 0 && struck ? "line-through" : "none" }}>{a}</span>
                <div style={{ width: 90, height: 6, background: C.ink }} />
                <span style={{ color: i < 3 && struck ? C.muted : C.ink, textDecoration: i < 3 && struck ? "line-through" : "none" }}>{b}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </At>
      <At x={540} y={960}>
        <Appear at={tCancel - 0.2} from="slam"><Text size={110} color={C.amber} font={F.bold}>= 1/100</Text></Appear>
      </At>
      <Sfx name="pack/pop" at={tHalf - 0.3} volume={0.25} />
      <Sfx name="pack/pop-2" at={tTwo - 0.3} volume={0.25} />
      <Sfx name="pack/pop-3" at={tThree - 0.3} volume={0.25} />
      <Sfx name="pack/whoosh-fast" at={tCancel - 0.3} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 9. payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tExact = at.word("exactly", 1, 1.6);
  const tEvery = at.word("everyone.", 1, 3.6);
  const tNever = at.word("never", 1, 4.8);
  return (
    <>
      <Headline color={C.mint}>Everyone: 1 in 100</Headline>
      <At x={540} y={470}><Appear at={tExact - 0.2} from="pop"><Text size={70} color={C.amber} font={F.bold}>guest 1: 1 in 100</Text></Appear></At>
      <At x={540} y={680}>
        <Appear at={tEvery - 0.3} from="up">
          <div style={{ display: "flex", flexWrap: "wrap", width: 820, gap: 6, justifyContent: "center" }}>
            {Array.from({ length: 40 }, (_, i) => <Icon key={i} name="User" size={56} color={C.mint} />)}
          </div>
        </Appear>
      </At>
      <At x={540} y={930}>
        <Appear at={tNever - 0.2} from="slam"><Stamp size={72} color={C.amber} rotate={-4}>COUNT NOT NEEDED</Stamp></Appear>
      </At>
      <Sfx name="pack/win" at={tEvery - 0.2} volume={0.3} />
      <Sfx name="stamp" at={tNever} />
    </>
  );
};

// ---------------------------------------------------------------- 10. reveal: reservoir sampling
const RevealBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tEndless = at.word("endless", 1, 1.4);
  const tRes = at.word("reservoir", 1, 3.6);
  const scroll = tween(t, 0, at.dur, 0, -200);
  return (
    <>
      <Headline>Reservoir sampling</Headline>
      <At x={540} y={690}>
        <div style={{ height: 360, overflow: "hidden", width: 760 }}>
          <div style={{ transform: `translateY(${scroll}px)`, fontFamily: F.mono, fontSize: 46, color: C.muted, lineHeight: 1.35 }}>
            {Array.from({ length: 14 }, (_, i) => <div key={i}>row {String(48201 + i * 7)} … keep 1 in {48201 + i * 7}</div>)}
          </div>
        </div>
      </At>
      <At x={540} y={400}><Appear at={tEndless - 0.2} from="pop"><Icon name="Database" size={110} color={C.mint} /></Appear></At>
      <At x={540} y={1000}><Appear at={tRes - 0.2} from="pop"><Chip size={54}>one pass, one slot</Chip></Appear></At>
      <Sfx name="pack/whoosh-mid" at={tEndless - 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 11. CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const tEvery = at.word("every", 1, 1.2);
  return (
    <>
      <Headline>Kept every name?</Headline>
      <At x={300} y={680}><Icon name="Archive" size={200} color={C.muted} /></At>
      <At x={540} y={680}><Text size={64} color={C.muted} font={F.bold}>vs</Text></At>
      <Punch at={tEvery} amount={0.06}><At x={790} y={680}><Icon name="FileText" size={200} color={C.amber} /></At></Punch>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="problem"><ProblemBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="first"><FirstBody /></Span>
    <Span from="coin"><CoinBody /></Span>
    <Span from="die"><DieBody /></Span>
    <Span from="rehook"><ReHookBody /></Span>
    <Span from="proof"><ProofBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="reveal"><RevealBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
