// "Why RAISE beats AUDIO as a Wordle opener": versus hook -> rule out vowels -> the list of 2,315
// -> sort the answers into color piles -> AUDIO's piles -> re-hook -> RAISE's piles -> a third as many
// -> payoff (a sort, not a search) -> CTA tied to the AUDIO habit.
import React from "react";
import {
  Appear, At, Bar, C, Camera, Chip, Counter, F, Headline, HookText, Punch, Riser, Sfx, Span, Stamp, Text, Tiles,
  tween, useAt, useT,
} from "../kit";

// Pile sizes (words still possible after each color pattern), largest first. From verify.py.
const AUDIO = [435, 282, 265, 190, 109, 91, 76, 54, 52, 49, 47, 44, 42, 37, 32, 32, 31, 31, 30, 22, 18, 16, 16, 16, 16, 15, 13, 13, 13, 13, 12, 11, 11, 10, 10, 9, 8, 8, 8, 8, 7, 7, 6, 6, 6, 6, 5, 5, 5, 4, 3, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const RAISE = [168, 121, 107, 103, 102, 92, 91, 80, 78, 69, 61, 51, 43, 41, 41, 40, 35, 34, 34, 29, 28, 28, 26, 26, 26, 26, 25, 24, 23, 23, 22, 21, 21, 20, 20, 20, 20, 20, 18, 18, 17, 17, 17, 15, 15, 14, 13, 13, 12, 12, 12, 10, 10, 9, 9, 9, 9, 8, 8, 8, 8, 7, 7, 7, 6, 6, 6, 6, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];

// Wordle colors: 2 green, 1 yellow, 0 gray.
const tileCols = (pat: number[]) => Object.fromEntries(pat.map((p, i) => [i, p === 2 ? C.green : p === 1 ? C.amber : C.muted]));

/** A bar per pile, bottom-aligned at the At point; bars grow from t0 (largest first). */
const Piles: React.FC<{ data: number[]; t0: number; w?: number; scale?: number; color?: string; hiFirst?: number }> =
  ({ data, t0, w = 860, scale = 1, color = C.mint, hiFirst }) => {
    const t = useT();
    const bw = w / data.length;
    const maxH = data[0] * scale;
    return (
      <div style={{ position: "relative", width: w, height: maxH }}>
        {data.map((v, i) => {
          const p = tween(t, t0 + i * 0.008, t0 + i * 0.008 + 0.35, 0, 1);
          const hi = hiFirst !== undefined && i === 0 && t >= hiFirst;
          return (
            <div key={i} style={{ position: "absolute", left: i * bw, bottom: 0, width: Math.max(2, bw - 2), height: Math.max(2, v * scale * p),
              borderRadius: 3, background: hi ? C.amber : color, opacity: hi ? 1 : 0.8, boxShadow: hi ? `0 0 26px ${C.amber}` : "none" }} />
          );
        })}
      </div>
    );
  };

// ---------------------------------------------------------------- 1. hook + rule-out
const HookBody: React.FC = () => {
  const at = useAt();
  const tThree = at.word("three", 1, 1.4);
  return (
    <>
      <HookText>{"**RAISE** or **AUDIO**?\nOne is 3x better"}</HookText>
      <Riser to={tThree} volume={0.5} />
      <Camera keys={[[0, { zoom: 1.0 }], [at.dur, { zoom: 1.08 }]]}>
        <At y={640}><Appear at={0} from="pop"><Tiles text="raise" size={130} show={0} stagger={0} hi={{ 0: C.mint, 1: C.mint, 2: C.mint, 3: C.mint, 4: C.mint }} sfx={false} /></Appear></At>
        <At y={810}><Text size={60} color={C.muted}>vs</Text></At>
        <At y={980}><Appear at={0} from="pop"><Tiles text="audio" size={130} show={0} stagger={0} hi={{ 0: C.coral, 1: C.coral, 2: C.coral, 3: C.coral, 4: C.coral }} sfx={false} /></Appear></At>
        <At x={880} y={810}><Appear at={tThree} from="slam"><Text size={120} color={C.amber} glow>3×</Text></Appear></At>
      </Camera>
    </>
  );
};

const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tVowels = at.word("vowels", 1, 1.0);
  const tFour = at.word("four", 1, 2.4);
  const tLoses = at.word("loses", 1, 3.4);
  const t = useT();
  const vow = t >= tVowels ? { 0: C.amber, 1: C.amber, 3: C.amber, 4: C.amber } : {};
  return (
    <>
      <Headline>More vowels?</Headline>
      <At y={600}><Tiles text="audio" size={130} show={0.05} stagger={0.05} hi={vow} /></At>
      <At y={800}><Appear at={tFour} from="pop"><Chip size={56}>4 vowels</Chip></Appear></At>
      <At y={1000}><Appear at={tLoses} from="slam"><Stamp>STILL LOSES</Stamp></Appear></At>
      <Sfx name="ding" at={tVowels} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 2. the list
const N = 2315, PERROW = 60, DOT = 11, DG = 3;
const ListBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tShrink = at.word("shrink", 1, at.dur - 1);
  const tGuess = at.word("guess", 1, 2.5);
  const shrink = tween(t, tShrink, tShrink + 0.6, 0, 1);
  return (
    <>
      <Headline>2,315 possible answers</Headline>
      <Camera keys={[[0, { zoom: 1.0 }], [tShrink, { zoom: 1.12, x: 540, y: 660 }], [at.dur, { zoom: 1.0 }]]}>
      <At y={660}>
        <div style={{ display: "flex", flexWrap: "wrap", width: PERROW * (DOT + DG), gap: DG }}>
          {Array.from({ length: N }, (_, i) => {
            const p = tween(t, 0.1 + (i / N) * 1.2, 0.3 + (i / N) * 1.2, 0, 1);
            const kept = i % 37 === 5;   // the few that survive a good guess
            const o = p * (kept ? 1 : 1 - 0.85 * shrink);
            return <div key={i} style={{ width: DOT, height: DOT, borderRadius: 3, background: kept && shrink > 0 ? C.amber : C.mint, opacity: o }} />;
          })}
        </div>
      </At>
      </Camera>
      <At y={1060}><Appear at={tGuess} from="up"><Text size={52} color={C.muted}>guess 1 won't find it</Text></Appear></At>
      <At y={1060}><Appear at={tShrink} from="slam"><Chip size={56}>its job: shrink the list</Chip></Appear></At>
      <Sfx name="pack/whoosh-short" at={tShrink} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 3. test AUDIO against every answer
const AudioBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tColors = at.word("colors", 1, 3.5);
  const tPile = at.beat("pile");
  const tYellow = at.word("yellow", 1, tPile + 4.5);
  const t435 = at.word("435", 1, tYellow + 1.2);
  const tAvg = at.beat("avg");
  const t184 = at.word("184", 1, tAvg + 2.2);
  const exampleOut = tween(t, tColors - 0.3, tColors, 1, 0);
  return (
    <>
      <Headline out={tPile - 0.3}>Test it on every answer</Headline>
      <Headline at={tPile} out={tAvg - 0.3} color={C.amber}>Each pattern is a pile</Headline>
      <Headline at={tAvg} color={C.coral}>AUDIO, on average</Headline>
      <At y={420}><Tiles text="audio" size={90} show={0.05} stagger={0.04} sfx={false} /></At>
      {exampleOut > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: exampleOut }}>
          <At y={620}><Appear at={0.6} from="up"><Text size={44} color={C.muted}>answer: storm</Text></Appear></At>
          <At y={760}><Appear at={1.0} from="pop"><Tiles text="audio" size={100} show={1.0} stagger={0.08} hi={tileCols([0, 0, 0, 0, 1])} /></Appear></At>
        </div>
      ) : null}
      <At x={530} y={1140 - 435 / 2}>
        <div style={{ opacity: t >= tColors ? 1 : 0 }}><Piles data={AUDIO} t0={tColors} scale={1} color={C.coral} hiFirst={tYellow} /></div>
      </At>
      <At x={300} y={640}><Appear at={tYellow} out={tAvg - 0.2} from="pop"><Tiles text="audio" size={70} show={tYellow} stagger={0} hi={tileCols([1, 0, 0, 0, 0])} sfx={false} /></Appear></At>
      <At x={720} y={640}><Appear at={t435} out={tAvg - 0.2} from="slam"><Chip size={56}>435 words left</Chip></Appear></At>
      <At x={620} y={630}>
        <Appear at={tAvg + 0.1} from="up">
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <Counter from={0} to={184} t0={tAvg + 0.2} t1={t184} size={130} color={C.coral} />
            <Text size={48} color={C.muted}>words left</Text>
          </div>
        </Appear>
      </At>
      <Sfx name="pack/whoosh-short" at={tColors} volume={0.4} />
      <Sfx name="ding" at={tYellow} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 4. re-hook
const RehookBody: React.FC = () => {
  const at = useAt();
  const tVowels = at.word("vowels", 1, 0.4);
  const tMore = at.word("more", 1, 2.2);
  const tSmaller = at.word("smaller", 1, 3.2);
  return (
    <>
      <Headline color={C.amber}>The real trick</Headline>
      <At y={540}>
        <Appear at={0.05} from="left">
          <div style={{ position: "relative" }}>
            <Chip color={C.panel} text={C.ink} size={74}>more vowels</Chip>
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%" }}>
              <Appear at={tVowels + 0.3} from="slam"><div style={{ height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-4deg)" }} /></Appear>
            </div>
          </div>
        </Appear>
      </At>
      <At y={760}><Appear at={tMore} from="pop"><Chip color={C.mint} size={74}>more piles</Chip></Appear></At>
      <Punch at={tSmaller}><At y={960}><Appear at={tSmaller} from="pop"><Chip color={C.amber} size={74}>smaller piles</Chip></Appear></At></Punch>
    </>
  );
};

// ---------------------------------------------------------------- 5. RAISE's piles, same scale
const S = 0.75;
const RaiseBody: React.FC = () => {
  const at = useAt();
  const t132 = at.word("132", 1, 1.6);
  const t89 = at.word("89", 1, 3.2);
  const t168 = at.word("168", 1, 5.2);
  return (
    <>
      <Headline color={C.mint}>Same list, more piles</Headline>
      <At x={720} y={450}><Tiles text="audio" size={56} show={0} stagger={0} sfx={false} hi={tileCols([0, 0, 0, 0, 0])} /></At>
      <At x={530} y={700 - (435 * S) / 2}><Piles data={AUDIO} t0={0} scale={S} color={C.coral} /></At>
      <At x={720} y={540}><Appear at={t89} from="pop"><Chip color={C.coral} size={48}>89 piles</Chip></Appear></At>
      <At x={720} y={820}><Appear at={0.2} from="up"><Tiles text="raise" size={56} show={0.2} stagger={0.04} hi={{ 0: C.mint, 1: C.mint, 2: C.mint, 3: C.mint, 4: C.mint }} /></Appear></At>
      <At x={530} y={1130 - (168 * S) / 2}><Piles data={RAISE} t0={0.5} scale={S} color={C.mint} hiFirst={t168} /></At>
      <At x={720} y={910}><Appear at={t132} from="pop"><Chip color={C.mint} size={48}>132 piles</Chip></Appear></At>
      <At x={300} y={950}><Appear at={t168} from="slam"><Chip size={48}>biggest: 168</Chip></Appear></At>
      <Sfx name="pack/whoosh-short" at={0.5} volume={0.4} />
      <Sfx name="ding" at={t168} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 6. result + payoff
const ResultBody: React.FC = () => {
  const at = useAt();
  const t61 = at.word("61", 1, 1.4);
  const tThird = at.word("third", 1, 2.6);
  return (
    <>
      <Headline>Words left, on average</Headline>
      <At y={520}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <Text size={56} font={F.mono} color={C.coral}>AUDIO</Text>
          <Bar from={0} to={1} t0={0.1} t1={0.6} w={460} h={56} color={C.coral} />
          <Text size={64} color={C.coral}>184</Text>
        </div>
      </At>
      <At y={700}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <Text size={56} font={F.mono} color={C.mint}>RAISE</Text>
          <Bar from={0} to={61 / 184} t0={t61 - 0.3} t1={t61 + 0.2} w={460} h={56} color={C.mint} />
          <Appear at={t61} from="pop"><Text size={64} color={C.mint}>61</Text></Appear>
        </div>
      </At>
      <Punch at={tThird}><At y={950}><Appear at={tThird} from="slam"><Text size={150} color={C.amber} glow>÷ 3</Text></Appear></At></Punch>
      <Sfx name="pack/boom-short" hit={tThird} volume={0.5} />
    </>
  );
};

const PayoffBody: React.FC = () => {
  const at = useAt();
  const tSearch = at.word("search", 1, 1.0);
  const tSort = at.word("sort", 1, 2.0);
  return (
    <>
      <At y={560}>
        <Appear at={0.05} from="up">
          <div style={{ position: "relative" }}>
            <Text size={96}>Not a search.</Text>
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%" }}>
              <Appear at={tSearch + 0.3} from="slam"><div style={{ height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-3deg)" }} /></Appear>
            </div>
          </div>
        </Appear>
      </At>
      <Punch at={tSort}><At y={800}><Appear at={tSort} from="pop"><Text size={140} color={C.amber} glow>A sort.</Text></Appear></At></Punch>
      <Sfx name="ding" at={tSort} volume={0.4} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const tAudio = at.word("audio", 1, 1.6);
  return (
    <>
      <At y={560}><Appear at={0} from="up"><Text size={76}>Subscribe if you've</Text></Appear></At>
      <At y={720}><Appear at={0.3} from="up"><Text size={76}>been opening with</Text></Appear></At>
      <At y={900}><Appear at={tAudio - 0.2} from="pop"><Tiles text="audio" size={110} show={tAudio - 0.2} stagger={0.04} hi={{ 0: C.coral, 1: C.coral, 2: C.coral, 3: C.coral, 4: C.coral }} /></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="list"><ListBody /></Span>
    <Span from="test" to="avg"><AudioBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="raise"><RaiseBody /></Span>
    <Span from="result"><ResultBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
