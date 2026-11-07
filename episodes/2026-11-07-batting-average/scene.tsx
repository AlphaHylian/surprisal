// "He hit better both years and still lost": Simpson's paradox, Jeter vs Justice 1995-96.
// versus hook -> rule out typos -> 1995 Justice -> 1996 Justice -> total Jeter -> re-hook: when did they bat?
// -> at-bats split -> same at-bats: Justice .287 vs .282 -> payoff: the total measured the year -> CTA home/away
import React from "react";
import { Appear, At, C, Camera, Card, Chip, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

const XJ = 330, XD = 750;          // Jeter column, Justice column
const ROWS = { y95: 610, y96: 800, tot: 1000 };
type Win = "J" | "D" | null;

// one row of the scoreboard: label, two averages, winner in amber
const Row: React.FC<{ y: number; label: string; j: string; d: string; win: Win; at?: number; winAt?: number; big?: boolean }> =
  ({ y, label, j, d, win, at = 0, winAt = 0, big }) => {
    const t = useT();
    const lit = t >= winAt;
    const col = (who: Win) => (lit && win === who ? C.amber : C.ink);
    const size = big ? 96 : 84;
    return (
      <Appear at={at} from="up" sfx={at <= 0.001 ? null : undefined}>
        <div style={{ position: "absolute", left: 540 - 470, top: y - 70, width: 940, height: 140, borderRadius: 26,
          background: big ? `${C.panel}ee` : `${C.panel}aa`, border: `3px solid ${big ? C.muted : C.dim}` }} />
        <At x={540} y={y - 92}><Text size={40} color={C.muted}>{label}</Text></At>
        <At x={XJ} y={y}><Text size={size} color={col("J")} glow={lit && win === "J"}>{j}</Text></At>
        <At x={XD} y={y}><Text size={size} color={col("D")} glow={lit && win === "D"}>{d}</Text></At>
        {lit && win && (
          <At x={win === "J" ? XJ - 190 : XD + 190} y={y}><Icon name="Check" size={64} color={C.amber} stroke={3} /></At>
        )}
      </Appear>
    );
  };
const Names: React.FC<{ at?: number; y?: number }> = ({ at = 0, y = 450 }) => (
  <>
    <At x={XJ} y={y}><Appear at={at} from="fade" sfx={null}><Text size={58} color={C.mint}>JETER</Text></Appear></At>
    <At x={XD} y={y}><Appear at={at} from="fade" sfx={null}><Text size={58} color={C.mint}>JUSTICE</Text></Appear></At>
  </>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tOver = at.word("overall", 1, 2.4);
  return (
    <>
      <HookText>{"Wins both years.\n**Loses overall.**"}</HookText>
      <Riser to={tOver} volume={0.45} />
      <Names y={520} />
      <Row y={660} label="1995" j=".250" d=".253" win="D" />
      <Row y={840} label="1996" j=".314" d=".321" win="D" />
      <Punch at={tOver}><Row y={1030} label="BOTH YEARS" j=".310" d=".270" win="J" winAt={tOver - 0.1} big /></Punch>
      <Sfx name="pack/crowd-gasp" at={tOver} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleBody: React.FC = () => {
  const at = useAt();
  const tTypo = at.word("typo", 1, 1.8);
  const tSame = at.word("Same", 1, 2.6);
  return (
    <>
      <Headline>Batting average</Headline>
      <At x={540} y={560}><Appear at={0.2} from="pop"><Text size={64}>hits ÷ at-bats</Text></Appear></At>
      <At x={540} y={720}><Appear at={tTypo - 0.2} from="slam"><Chip color={C.coral} size={56}>no typo</Chip></Appear></At>
      <At x={540} y={880}><Appear at={tSame - 0.1} from="up"><Text size={54} color={C.mint}>same hits, same at-bats</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- the three rows, built up, then re-hook
const BoardBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t96 = at.beat("y96");
  const tTot = at.beat("total");
  const tRe = at.beat("rehook");
  const tJ95 = at.word("Jeter", 1, 1.0), tD95 = at.word("Justice", 1, 2.0), tW95 = at.word("wins", 1, 3.0);
  const tJ96 = at.word("Jeter", 2, t96 + 0.6), tD96 = at.word("Justice", 2, t96 + 1.8), tW96 = at.word("again", 1, t96 + 3.2);
  const tJT = at.word("Jeter", 3, tTot + 1.6), tMile = at.word("mile", 1, tTot + 4.0);
  const tWhen = at.word("when", 1, tRe + 1.6);
  const show = (t0: number) => t >= t0 - 0.15;
  return (
    <>
      <Headline out={tRe - 0.3}>{t < tTot ? "Who hit better?" : "Add up the hits"}</Headline>
      <Headline at={tRe} color={C.coral}>Same hits. Flipped winner.</Headline>
      <Camera keys={[[0, { zoom: 1.08 }], [tTot - 0.3, { zoom: 1.08 }], [tTot + 0.5, { zoom: 1 }]]}>
        <Names />
        <Row y={ROWS.y95} label="1995" j={show(tJ95) ? ".250" : ""} d={show(tD95) ? ".253" : ""} win="D" at={0.05} winAt={tW95 - 0.2} />
        <Row y={ROWS.y96} label="1996" j={show(tJ96) ? ".314" : ""} d={show(tD96) ? ".321" : ""} win="D" at={t96 - 0.1} winAt={tW96 - 0.2} />
        {t >= tTot - 0.1 && (
          <Punch at={tMile}>
            <Row y={ROWS.tot} label="BOTH YEARS" j={show(tJT) ? ".310" : ""} d={show(tJT + 0.8) ? ".270" : ""} win="J" at={tTot} winAt={tMile - 0.3} big />
          </Punch>
        )}
        {t >= tRe && (
          <At x={540} y={1135}><Appear at={tWhen - 0.2} from="up"><Text size={52} color={C.amber}>when did they bat?</Text></Appear></At>
        )}
      </Camera>
      <Sfx name="pack/correct" at={tW95} volume={0.25} />
      <Sfx name="pack/correct" at={tW96} volume={0.25} />
      <Sfx name="pack/crowd-gasp" at={tMile} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- at-bats: where each player's season went
const ABBar: React.FC<{ y: number; name: string; bad: number; good: number; tBad: number; tGood: number }> = ({ y, name, bad, good, tBad, tGood }) => {
  const t = useT();
  const W = 860, scale = W / 630;
  const wb = bad * scale * tween(t, tBad, tBad + 0.6, 0, 1);
  const wg = good * scale * tween(t, tGood, tGood + 0.6, 0, 1);
  return (
    <>
      <At x={540} y={y - 90}><Text size={54} color={C.mint}>{name}</Text></At>
      <div style={{ position: "absolute", left: 110, top: y - 40, width: wb, height: 80, background: C.coral, borderRadius: "16px 0 0 16px", opacity: 0.9 }} />
      <div style={{ position: "absolute", left: 110 + wb, top: y - 40, width: wg, height: 80, background: C.mint, borderRadius: "0 16px 16px 0", opacity: 0.9 }} />
      {t >= tBad + 0.2 && <At x={110 + Math.max(wb, 120) / 2 + (wb < 120 ? 20 : 0)} y={y + 80}><Text size={46} color={C.coral}>{bad}</Text></At>}
      {t >= tGood + 0.2 && <At x={110 + wb + wg / 2} y={y + 80}><Text size={46} color={C.mint}>{good}</Text></At>}
    </>
  );
};
const AtBatsBody: React.FC = () => {
  const at = useAt();
  const t48 = at.word("48", 1, 1.2), t582 = at.word("582", 1, 3.0), t411 = at.word("411", 1, 5.2), t140 = at.word("140", 1, 7.0);
  return (
    <>
      <Headline>At-bats per season</Headline>
      <At x={330} y={410}><Appear at={0.1} from="fade" sfx={null}><Text size={44} color={C.coral}>■ 1995 (bad year)</Text></Appear></At>
      <At x={760} y={410}><Appear at={0.1} from="fade" sfx={null}><Text size={44} color={C.mint}>■ 1996 (good)</Text></Appear></At>
      <ABBar y={640} name="JETER" bad={48} good={582} tBad={t48 - 0.2} tGood={t582 - 0.2} />
      <ABBar y={960} name="JUSTICE" bad={411} good={140} tBad={t411 - 0.2} tGood={t140 - 0.2} />
    </>
  );
};

// ---------------------------------------------------------------- fix: same at-bats each year
const FixBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSame = at.word("same", 1, 0.8);
  const tD = at.word("Justice", 1, 2.6);
  const tJ = at.word("Jeter", 1, 4.4);
  return (
    <>
      <Headline color={C.mint}>Same at-bats each year</Headline>
      <At x={540} y={480}><Appear at={tSame - 0.1} from="pop"><Text size={50} color={C.muted}>half 1995, half 1996</Text></Appear></At>
      <At x={XD} y={640}><Text size={58} color={C.mint}>JUSTICE</Text></At>
      <At x={XJ} y={640}><Text size={58} color={C.mint}>JETER</Text></At>
      <At x={XD} y={790}><Punch at={tD}><Appear at={tD - 0.15} from="slam"><Text size={130} color={C.amber} glow>.287</Text></Appear></Punch></At>
      <At x={XJ} y={790}><Appear at={tJ - 0.15} from="pop"><Text size={130}>.282</Text></Appear></At>
      {t >= tJ + 0.4 && <At x={XD} y={960}><Appear at={tJ + 0.4} from="up"><Chip color={C.amber} size={50}>better hitter</Chip></Appear></At>}
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tYear = at.word("year", 1, 2.6);
  const tMeas = at.word("measured", 2, 1.8);
  return (
    <>
      <Headline color={C.amber}>The total measured the year</Headline>
      <At x={540} y={560}><Appear at={0.2} from="left"><Card w={880}><Text size={56}>Jeter: <span style={{ color: C.mint }}>92%</span> in 1996</Text></Card></Appear></At>
      <At x={540} y={800}><Appear at={tMeas} from="right"><Card w={880}><Text size={56}>Justice: <span style={{ color: C.coral }}>75%</span> in 1995</Text></Card></Appear></At>
      <Sfx name="pack/kaching" at={tYear} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const tHome = at.word("home", 1, 1.0), tAway = at.word("away", 1, 2.2), tWorse = at.word("worse", 1, 4.0);
  return (
    <>
      <Headline>Your team</Headline>
      <At x={540} y={520}><Appear at={tHome - 0.2} from="left"><Text size={70}>home: <span style={{ color: C.mint }}>better</span></Text></Appear></At>
      <At x={540} y={680}><Appear at={tAway - 0.2} from="left"><Text size={70}>away: <span style={{ color: C.mint }}>better</span></Text></Appear></At>
      <At x={540} y={880}><Appear at={tWorse - 0.2} from="slam"><Text size={84} color={C.amber}>record: worse?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleBody /></Span>
    <Span from="y95" to="rehook"><BoardBody /></Span>
    <Span from="atbats"><AtBatsBody /></Span>
    <Span from="fix"><FixBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
