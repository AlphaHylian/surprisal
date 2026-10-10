// "Why a 90% hit in Fire Emblem is really 98%". Stakes hook (90% missed twice, "rigged") -> rule out
// broken dice (1 in 100) -> 6 players in 10 see it -> roll two, average, hit under 90 -> 98%, 1 in 2,770
// -> re-hook: enemy long shots 10% -> 2%, 50% stays -> payoff: averages pile up in the middle -> the
// screen lies in your favor, Fire Emblem 2002 -> CTA: checkable question (80% -> 92%).
import React from "react";
import {
  Appear, At, C, Camera, Card, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

/** The game's attack forecast panel. */
const Forecast: React.FC<{ hit: React.ReactNode; w?: number; color?: string; icon?: string; who?: string }> = ({ hit, w = 640, color = C.mint, icon = "Sword", who = "YOU" }) => (
  <Card w={w} h={w * 0.62} border={color}>
    <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
      <Icon name={icon} size={w * 0.2} color={color} stroke={1.8} glow />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <Text size={w * 0.07} color={C.muted}>{who}</Text>
        <Text size={w * 0.09} color={C.muted}>HIT</Text>
        <div style={{ fontFamily: F.bold, fontSize: w * 0.2, color: C.ink, lineHeight: 1, whiteSpace: "nowrap" }}>{hit}</div>
      </div>
    </div>
  </Card>
);

/** A number die (0-99) that spins until `stop`, then shows `value`. */
const Roll: React.FC<{ value: number; t0: number; stop: number; color?: string; size?: number }> = ({ value, t0, stop, color = C.amber, size = 200 }) => {
  const t = useT();
  const spinning = t < stop;
  const v = spinning ? Math.floor((Math.sin(Math.floor(t * 20) * 91.7 + value) * 0.5 + 0.5) * 100) % 100 : value;
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.16, border: `6px solid ${color}`, background: C.panel, opacity: t >= t0 ? 1 : 0,
      display: "flex", alignItems: "center", justifyContent: "center", boxShadow: spinning ? "none" : `0 0 30px ${color}66` }}>
      <span style={{ fontFamily: F.mono, fontSize: size * 0.48, color: spinning ? C.muted : color }}>{v}</span>
    </div>
  );
};

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tTwice = at.word("shot", 1, 1.2);
  const tRigged = at.word("rigged", 1, 2.0);
  return (
    <>
      <HookText>{"90% to hit.\n**Missed twice.**"}</HookText>
      <Riser to={tTwice} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.07 }]]}>
        <At x={540} y={770}><Forecast hit="90%" /></At>
        <At x={360} y={1030}><Appear at={0} from="slam"><Stamp size={90} rotate={-8}>MISS</Stamp></Appear></At>
        <Shake at={tTwice}>
          <At x={720} y={1060}><Appear at={tTwice} from="slam" sfx="pack/wrong" volume={0.5}><Stamp size={90} rotate={6}>MISS</Stamp></Appear></At>
        </Shake>
      </Camera>
      <Sfx name="pack/crowd-gasp" at={Math.max(tTwice + 0.4, tRigged - 0.3)} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out + players
const OddsBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFine = at.word("fine", 1, 0.6);
  const t100 = at.word("100", 1, 2.6);
  const tCtx = at.beat("context");
  const t6 = at.word("6", 1, tCtx + 1.6);
  const tHits = at.word("hits", 1, tCtx + 3.6);
  return (
    <>
      <Headline out={tCtx - 0.3}>Your dice are fine</Headline>
      <Headline at={tCtx} color={C.coral}>Someone always sees it</Headline>
      {t < tCtx ? (
        <>
          <At x={540} y={560}>
            <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
              <Appear at={tFine} from="pop"><Chip color={C.coral} size={56}>miss 1 in 10</Chip></Appear>
              <Appear at={tFine + 0.4} from="pop"><Text size={70} color={C.muted}>×</Text></Appear>
              <Appear at={tFine + 0.6} from="pop"><Chip color={C.coral} size={56}>miss 1 in 10</Chip></Appear>
            </div>
          </At>
          <Punch at={t100}>
            <At x={540} y={820}><Appear at={t100 - 0.15} from="slam"><Text size={150} font={F.bold} color={C.amber} glow>1 in 100</Text></Appear></At>
          </Punch>
        </>
      ) : (
        <>
          <At x={540} y={480}><Appear at={tCtx + 0.1} from="up"><Text size={56} color={C.muted}>100 shots each</Text></Appear></At>
          <At x={540} y={740}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 150px)", gap: 24 }}>
              {Array.from({ length: 10 }, (_, i) => {
                const saw = i < 6 && t >= t6 + i * 0.06;
                return (
                  <div key={i} style={{ opacity: t >= tCtx + 0.2 + i * 0.04 ? 1 : 0, display: "flex", justifyContent: "center" }}>
                    <Icon name={saw ? "Frown" : "Smile"} size={130} color={saw ? C.coral : C.mint} stroke={1.8} glow={saw} />
                  </div>
                );
              })}
            </div>
          </At>
          <At x={540} y={990}><Appear at={t6 + 0.3} from="pop"><Chip color={C.coral} size={56}>6 in 10 see a double miss</Chip></Appear></At>
          <Sfx name="pack/hit-low" at={t6} volume={0.4} />
          <At x={540} y={1090}><Appear at={tHits} from="fade"><Text size={46} color={C.muted}>the 90 hits? forgotten</Text></Appear></At>
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------- 3. roll two, average
const TwoBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRoll = at.word("roll", 1, 1.6);
  const tAvg = at.word("average", 1, 3.6);
  const tUnder = at.beat("under");
  const tHits = at.word("hits", 1, tUnder + 0.6);
  return (
    <>
      <Headline out={tUnder - 0.3}>Roll two, not one</Headline>
      <Headline at={tUnder} color={C.mint}>Hit if under 90</Headline>
      <At x={540} y={460}><Appear at={0.05} out={tRoll - 0.2} from="pop"><Roll value={95} t0={0} stop={0.9} color={C.coral} /></Appear></At>
      <At x={540} y={640}><Appear at={0.9} out={tRoll - 0.2} from="fade"><Text size={50} color={C.coral}>one roll of 95: miss</Text></Appear></At>
      {t >= tRoll - 0.2 ? (
        <>
          <At x={540} y={520}>
            <div style={{ display: "flex", gap: 60 }}>
              <Roll value={95} t0={tRoll - 0.2} stop={tRoll + 0.6} />
              <Roll value={71} t0={tRoll - 0.2} stop={tRoll + 0.9} />
            </div>
          </At>
          <At x={540} y={780}><Appear at={tAvg} from="up"><Text size={70} color={C.ink}>(95 + 71) ÷ 2 =</Text></Appear></At>
          <Punch at={tAvg + 0.5}>
            <At x={540} y={930}><Appear at={tAvg + 0.4} from="pop"><Text size={140} font={F.bold} color={C.amber} glow>83</Text></Appear></At>
          </Punch>
          <At x={540} y={1100}><Appear at={tHits} from="slam" sfx="pack/punch" volume={0.5}><Chip color={C.green} size={64}>83 &lt; 90: HIT</Chip></Appear></At>
        </>
      ) : null}
      <Sfx name="pack/wheel-spin" at={tRoll - 0.2} dur={1.1} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 4. the effect
const EffectBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t98 = at.word("98%", 1, 1.6);
  const tTwo = at.word("misses", 1, 3.0);
  const tN = at.word("2,770", 1, 4.6);
  return (
    <>
      <Headline color={C.mint}>Your 90% shot</Headline>
      <At x={540} y={620}><Forecast who={t >= t98 - 0.3 ? "REALLY" : "YOU"} hit={<Counter from={90} to={98} t0={t98 - 0.6} t1={t98} size={150} color={C.amber} suffix="%" />} w={700} /></At>
      <At x={540} y={940}><Appear at={tTwo} from="up"><Text size={56} color={C.muted}>two misses in a row</Text></Appear></At>
      <Punch at={tN}>
        <At x={540} y={1070}><Appear at={tN - 0.1} from="slam"><Chip size={72}>1 in 2,770</Chip></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 5. re-hook: the enemy's long shots
const LowBody: React.FC = () => {
  const at = useAt();
  const tLow = at.beat("low");
  const t2 = at.word("2%", 1, tLow + 1.8);
  const t50 = at.word("50%", 1, tLow + 3.2);
  return (
    <>
      <Headline out={tLow - 0.3} color={C.amber}>Half the trick</Headline>
      <Headline at={tLow} color={C.coral}>Their long shots</Headline>
      <Camera keys={[[0, { zoom: 0.95 }], [tLow, { zoom: 1 }], [t50, { zoom: 1 }], [t50 + 0.4, { zoom: 0.95 }]]}>
        <At x={540} y={620}>
          <Appear at={0.1} from="right">
            <Forecast w={700} color={C.coral} icon="Skull" who="ENEMY"
              hit={<span><Counter from={10} to={2} t0={t2 - 0.6} t1={t2} size={140} color={C.coral} suffix="%" /></span>} />
          </Appear>
        </At>
        <At x={540} y={1000}><Appear at={t50} from="up"><Chip color={C.panel} text={C.ink} size={60}>50% → still a coin flip</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/whoosh-metal" at={tLow} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 6. payoff: averages pile up in the middle
// probability that the average of two rolls 0-99 lands in each 10-wide bin
const BINS = (() => {
  const b = Array(10).fill(0);
  for (let a = 0; a < 100; a++) for (let c = 0; c < 100; c++) b[Math.min(9, Math.floor((a + c) / 20))] += 1;
  return b.map((x) => x / 10000);
})();
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tMiddle = at.word("middle", 1, 1.4);
  const tBetter = at.word("better", 1, 2.6);
  const tWorse = at.word("worse", 1, 3.8);
  const tLie = at.beat("lie");
  const tFE = at.word("emblem", 1, tLie + 2.6);
  const morph = tween(t, tMiddle - 0.6, tMiddle + 0.2, 0, 1);
  const H = 520;
  return (
    <>
      <Headline out={tLie - 0.3}>Two rolls pile up</Headline>
      <Headline at={tLie} color={C.amber}>The screen lies</Headline>
      {t < tLie ? (
        <>
          <At x={540} y={760}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: H }}>
              {BINS.map((p, i) => {
                const v = 0.1 + (p - 0.1) * morph;
                const col = i === 9 ? (t >= tBetter ? C.coral : C.mint) : i === 0 ? (t >= tWorse ? C.coral : C.mint) : C.mint;
                return <div key={i} style={{ width: 70, height: (v / 0.2) * H * 0.9, background: col, borderRadius: 10, boxShadow: `0 0 20px ${col}55` }} />;
              })}
            </div>
          </At>
          <At x={540} y={1060}><Text size={44} color={C.muted}>0 ··· average of two rolls ··· 99</Text></At>
          <At x={900} y={410}><Appear at={tBetter} from="pop"><Chip color={C.coral} size={44}>misses: rare</Chip></Appear></At>
          <At x={200} y={410}><Appear at={tWorse} from="pop"><Chip color={C.coral} size={44}>long shots: rare</Chip></Appear></At>
        </>
      ) : (
        <>
          <At x={540} y={620}><Forecast hit="90%" w={700} /></At>
          <At x={540} y={900}><Appear at={tLie + 0.3} from="pop"><Chip size={60}>really 98%</Chip></Appear></At>
          <At x={540} y={1010}><Appear at={tFE} from="pop"><Chip color={C.panel} text={C.ink} size={56}>Fire Emblem, since 2002</Chip></Appear></At>
        </>
      )}
      <Sfx name="pack/warp-slide" at={tMiddle - 0.6} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 7. CTA: checkable question
const CtaBody: React.FC = () => {
  const at = useAt();
  const tReally = at.word("really", 1, 2.0);
  return (
    <>
      <At x={540} y={620}><Appear at={0} from="up"><Forecast hit="80%" w={700} /></Appear></At>
      <At x={540} y={1000}><Appear at={tReally} from="pop" sfx="pack/hmm" volume={0.4}><Text size={110} font={F.bold} color={C.amber} glow>really: ?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout" to="context"><OddsBody /></Span>
    <Span from="two" to="under"><TwoBody /></Span>
    <Span from="effect"><EffectBody /></Span>
    <Span from="rehook" to="low"><LowBody /></Span>
    <Span from="payoff" to="lie"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
