// "Why your friends have more friends than you": the friendship paradox (Feld 1991; Facebook 2011, 92.7%).
// claim hook (93% of Facebook users have fewer friends than their friends) -> rule out being boring: a counting trick ->
// draw six people (Max knows everyone, Ana-Ben, Cleo/Dev/Eli only Max) -> count 5, 2, 2, 1, 1, 1 ->
// compare like online: Cleo 1 vs 5, Ana 2 vs 3.5 -> re-hook: five of six lose, who's cheating? ->
// Max is on five friend lists, counted five times -> payoff: average person 2, average friend 3 ->
// CTA comment question (three in a line: how many lose?).
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- the group
type P = { name: string; x: number; y: number; deg: number };
const PEOPLE: Record<string, P> = {
  Max: { name: "Max", x: 540, y: 700, deg: 5 },
  Ana: { name: "Ana", x: 290, y: 500, deg: 2 },
  Ben: { name: "Ben", x: 790, y: 500, deg: 2 },
  Cleo: { name: "Cleo", x: 250, y: 900, deg: 1 },
  Dev: { name: "Dev", x: 540, y: 1040, deg: 1 },
  Eli: { name: "Eli", x: 820, y: 900, deg: 1 },
};
const EDGES: [string, string][] = [["Max", "Ana"], ["Max", "Ben"], ["Max", "Cleo"], ["Max", "Dev"], ["Max", "Eli"], ["Ana", "Ben"]];
const R = 72;

const Node: React.FC<{ p: P; color?: string; badge?: boolean; badgeColor?: string; dim?: boolean }> =
  ({ p, color = C.ink, badge, badgeColor, dim }) => (
    <div style={{ position: "relative", width: R * 2, height: R * 2, opacity: dim ? 0.35 : 1 }}>
      <div style={{ width: R * 2, height: R * 2, borderRadius: "50%", boxSizing: "border-box", border: `6px solid ${color}`,
        background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Text size={42} color={color}>{p.name}</Text>
      </div>
      {badge ? (
        <div style={{ position: "absolute", right: -22, top: -22, width: 70, height: 70, borderRadius: "50%",
          background: badgeColor ?? (p.deg === 5 ? C.amber : C.mint), display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Text size={46} color={C.bg} font={F.mono} style={{ textShadow: "none" }}>{p.deg}</Text>
        </div>
      ) : null}
    </div>
  );

// edges drawn as lines; show[i] = time edge i starts drawing (undefined = always)
const Edges: React.FC<{ t: number; show?: (number | undefined)[]; hi?: number[]; dim?: boolean }> = ({ t, show, hi = [], dim }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
    {EDGES.map(([a, b], i) => {
      const A = PEOPLE[a], B = PEOPLE[b];
      const t0 = show?.[i];
      const k = t0 === undefined ? 1 : tween(t, t0, t0 + 0.35, 0, 1);
      return (
        <line key={i} x1={A.x} y1={A.y} x2={A.x + (B.x - A.x) * k} y2={A.y + (B.y - A.y) * k}
          stroke={hi.includes(i) ? C.amber : C.muted} strokeWidth={hi.includes(i) ? 9 : 6} opacity={dim ? 0.3 : k > 0 ? 1 : 0} />
      );
    })}
  </svg>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFewer = at.word("more", 1, 1.0);
  return (
    <>
      <HookText size={88} y={260} out={at.dur - 0.3}>{"**93%** have fewer friends\nthan their friends"}</HookText>
      <Riser to={tFewer} volume={0.5} />
      <Camera keys={[[0, { zoom: 0.92, y: 650 }], [at.dur, { zoom: 0.95, y: 660 }]]}>
        <Edges t={t} />
        {Object.values(PEOPLE).map((p) => (
          <At key={p.name} x={p.x} y={p.y}>
            <Appear at={0} from="pop" sfx={null}><Node p={p} color={p.deg === 5 ? C.amber : C.ink} badge /></Appear>
          </At>
        ))}
      </Camera>
      <Sfx name="pack/pop-bubble" at={tFewer} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out: not you, a counting trick
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const t93 = at.word("93%", 1, 1.6);
  const tBoring = at.word("boring.", 1, 4.2);
  return (
    <>
      <Headline>On Facebook</Headline>
      <At x={540} y={560}><Appear at={0.1} from="up"><Icon name="Users" size={150} color={C.ink} /></Appear></At>
      <At x={540} y={760}><Appear at={t93 - 0.2} from="slam"><Text size={190} color={C.amber} font={F.mono} glow>93%</Text></Appear></At>
      <At x={540} y={900}><Appear at={t93 + 0.3} from="fade"><Text size={46} color={C.muted}>have fewer friends than their friends</Text></Appear></At>
      <At x={540} y={1060}><Appear at={tBoring - 0.4} from="pop"><Chip size={52} color={C.coral}>not because you're boring</Chip></Appear></At>
      <Sfx name="pack/hit-swell" hit={t93} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 3-4. draw the group, count friends
const DrawBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSix = at.word("six", 1, 1.6);
  const tMax = at.word("Max", 1, 2.4);
  const tEvery = at.word("everyone.", 1, 2.2);
  const tAna = at.word("Ana", 1, 3.0);
  const tEach = at.word("other.", 1, 4.2);
  const tCleo = at.word("Cleo,", 1, 5.0);
  const tOnly = at.word("only", 1, 6.0);
  const tCount = at.beat("count");
  const t5 = at.word("5.", 1, tCount + 1.8);
  const t2 = at.word("2.", 1, tCount + 3.0);
  const t1 = at.word("1.", 1, tCount + 4.0);
  const order = ["Max", "Ana", "Ben", "Cleo", "Dev", "Eli"];
  const showAt: Record<string, number> = Object.fromEntries(order.map((n, i) => [n, tSix - 0.2 + i * 0.1]));
  const badgeAt: Record<string, number> = { Max: t5 - 0.1, Ana: t2 - 0.1, Ben: t2 - 0.1, Cleo: t1 - 0.1, Dev: t1, Eli: t1 + 0.1 };
  return (
    <>
      <Headline out={tSix - 0.3}>A counting trick</Headline>
      <Headline at={tSix} out={tCount - 0.3}>Take six people</Headline>
      <Headline at={tCount}>Count friends</Headline>
      <Camera keys={[[0, { zoom: 1, y: 760 }], [tOnly, { zoom: 1, y: 760 }], [tOnly + 0.5, { zoom: 1.04, y: 780 }], [tCount + 0.5, { zoom: 0.96, y: 760 }]]}>
        <Edges t={t} show={[tEvery - 0.3, tEvery - 0.2, tCleo, tCleo + 0.3, tCleo + 0.5, tEach - 0.3]} />
        {Object.values(PEOPLE).map((p) => (
          <At key={p.name} x={p.x} y={p.y}>
            <Appear at={showAt[p.name]} from="pop" sfx={p.name === "Max" ? undefined : null}>
              <Node p={p} color={p.deg === 5 && t >= t5 - 0.1 ? C.amber : C.ink} badge={t >= badgeAt[p.name]}
                dim={t < (p.name === "Max" ? tMax : p.name === "Ana" || p.name === "Ben" ? tAna : tCleo) - 0.2} />
            </Appear>
          </At>
        ))}
      </Camera>
      <Sfx name="pack/whoosh-short" at={tEvery - 0.3} volume={0.3} />
      <Sfx name="pack/ding-short" at={t5 - 0.1} volume={0.3} />
      <Sfx name="pack/click-soft" at={t2 - 0.1} volume={0.4} />
      <Sfx name="pack/click-soft" at={t1 - 0.1} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 5-6. compare like online; re-hook: five of six lose
const VsChip: React.FC<{ who: string; you: string; them: string }> = ({ who, you, them }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 18, background: C.bg, padding: "8px 26px", borderRadius: 18, border: `4px solid ${C.coral}` }}>
    <Text size={44} color={C.ink}>{who}:</Text>
    <Text size={54} color={C.coral} font={F.mono}>{you}</Text>
    <Text size={40} color={C.muted}>vs</Text>
    <Text size={54} color={C.amber} font={F.mono}>{them}</Text>
  </div>
);

const CompareBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCleo = at.word("Cleo", 1, 1.6);
  const t5 = at.word("5.", 1, 3.0);
  const tAna = at.word("Ana", 1, 3.8);
  const t35 = at.word("3.5.", 1, 5.6);
  const tRe = at.beat("rehook");
  const tWins = at.word("wins.", 1, tRe + 2.2);
  const tCheat = at.word("cheating?", 1, tRe + 3.2);
  const loseT = (i: number) => tRe + 0.2 + i * 0.15;
  return (
    <>
      <Headline out={tRe - 0.3}>Compare, like online</Headline>
      <Headline at={tRe} out={tCheat - 0.3} color={C.coral}>5 of 6 lose</Headline>
      <Headline at={tCheat} color={C.amber}>Who's cheating?</Headline>
      <Camera keys={[[0, { zoom: 0.96, y: 760 }], [tRe, { zoom: 0.96, y: 760 }], [tRe + 0.6, { zoom: 0.92, y: 740 }]]}>
        <Edges t={t} hi={t >= tAna && t < tRe ? [0, 5] : t >= tCleo && t < tAna ? [2] : []} />
        {Object.values(PEOPLE).map((p, i) => {
          const loses = p.deg < 5 && t >= loseT(i);
          return (
            <At key={p.name} x={p.x} y={p.y}>
              <Node p={p} color={p.deg === 5 ? (t >= tWins - 0.1 ? C.mint : C.amber) : loses ? C.coral : C.ink} badge />
            </At>
          );
        })}
        <At x={540} y={588}><Appear at={tWins - 0.15} from="pop"><Chip size={40} color={C.mint}>wins</Chip></Appear></At>
      </Camera>
        {/* Cleo: 1 vs 5 */}
        <At x={540} y={1110}><Appear at={t5 - 0.2} out={tAna - 0.2} from="pop"><VsChip who="Cleo" you="1" them="5" /></Appear></At>
        {/* Ana: 2 vs 3.5 */}
        <At x={540} y={1110}><Appear at={t35 - 0.3} out={tRe - 0.2} from="pop"><VsChip who="Ana" you="2" them="3.5" /></Appear></At>
      <Sfx name="pack/wrong" at={t5 - 0.2} volume={0.3} />
      <Sfx name="pack/wrong" at={t35 - 0.3} volume={0.3} />
      <Sfx name="pack/correct" at={tWins - 0.15} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 7. why: Max is on five friend lists
const LISTS: [string, string[]][] = [
  ["Ana", ["Max", "Ben"]], ["Ben", ["Max", "Ana"]], ["Cleo", ["Max"]], ["Dev", ["Max"]], ["Eli", ["Max"]],
];
const WhyBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tLists = at.word("lists.", 1, 1.6);
  const tCleo = at.word("Cleo", 1, 2.4);
  const tFive = at.word("five", 2, 4.4);
  return (
    <>
      <Headline>Max is on 5 friend lists</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tFive - 0.2, { zoom: 1 }], [tFive + 0.4, { zoom: 1.05, y: 760 }]]}>
        {LISTS.map(([who, list], i) => (
          <At key={who} x={540} y={450 + i * 120}>
            <Appear at={0.1 + i * 0.18} from="left" sfx={i === 0 ? undefined : null}>
              <div style={{ display: "flex", alignItems: "center", gap: 24, width: 720 }}>
                <Text size={50} color={C.muted} font={F.mono} style={{ width: 170, textAlign: "left" }}>{who}:</Text>
                {list.map((f) => (
                  <div key={f} style={{ padding: "6px 22px", borderRadius: 14,
                    border: `4px solid ${f === "Max" ? C.amber : f === "Cleo" ? C.coral : C.dim}`,
                    background: f === "Max" && t >= tLists - 0.2 ? `${C.amber}33` : "transparent" }}>
                    <Text size={50} font={F.mono} color={f === "Max" ? C.amber : C.ink}>{f}</Text>
                  </div>
                ))}
              </div>
            </Appear>
          </At>
        ))}
        <At x={540} y={1070}>
          <div style={{ display: "flex", gap: 30 }}>
            <Appear at={tCleo - 0.1} from="fade"><Text size={48} color={C.coral}>Cleo: on 1 list</Text></Appear>
          </div>
        </At>
        <At x={540} y={1150}><Appear at={tFive - 0.2} from="slam"><Chip size={52}>Max counted 5×</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/hit-swell" hit={tFive} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 8. payoff: average person 2, average friend 3
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t2 = at.word("2", 1, 1.4);
  const t3 = at.word("3.", 1, 3.0);
  const tPop = at.word("Popular", 1, 3.6);
  return (
    <>
      <Headline out={tPop - 0.3}>In your group</Headline>
      <Headline at={tPop} color={C.amber}>Popular = on every list</Headline>
      <At x={300} y={620}>
        <Appear at={0.1} from="up">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Icon name="User" size={130} color={C.ink} />
            <Text size={44} color={C.muted}>average person</Text>
          </div>
        </Appear>
      </At>
      <At x={300} y={860}><Appear at={t2 - 0.2} from="pop"><Text size={170} color={C.ink} font={F.mono}>2</Text></Appear></At>
      <At x={780} y={620}>
        <Appear at={t3 - 0.9} from="up">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Icon name="Users" size={130} color={C.amber} />
            <Text size={44} color={C.muted}>average friend</Text>
          </div>
        </Appear>
      </At>
      <Punch at={t3} amount={0.08}>
        <At x={780} y={860}><Appear at={t3 - 0.15} from="slam"><Text size={170} color={C.amber} font={F.mono} glow>3</Text></Appear></At>
      </Punch>
      <At x={540} y={1080}><Appear at={tPop + 0.2} from="fade"><Text size={46} color={C.muted}>Facebook, 721 million users: 93%</Text></Appear></At>
      <Sfx name="pack/hit-swell" hit={t3} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 9. CTA: three in a line
const CtaBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tB = at.word("B,", 1, 1.6);
  const tC = at.word("C.", 1, 2.6);
  const tLose = at.word("lose?", 1, 3.8);
  const xs = [300, 540, 780];
  return (
    <>
      <Headline>Your turn</Headline>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={xs[0]} y1={700} x2={xs[0] + (xs[1] - xs[0]) * tween(t, tB - 0.3, tB, 0, 1)} y2={700} stroke={C.muted} strokeWidth={6} />
        <line x1={xs[1]} y1={700} x2={xs[1] + (xs[2] - xs[1]) * tween(t, tC - 0.3, tC, 0, 1)} y2={700} stroke={C.muted} strokeWidth={6} />
      </svg>
      {["A", "B", "C"].map((n, i) => (
        <At key={n} x={xs[i]} y={700}>
          <Appear at={0.1 + i * 0.15} from="pop" sfx={i === 0 ? undefined : null}><Node p={{ name: n, x: 0, y: 0, deg: 0 }} /></Appear>
        </At>
      ))}
      <At x={540} y={940}><Appear at={tLose - 0.3} from="pop"><Chip size={58}>how many lose?</Chip></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="draw" to="count"><DrawBody /></Span>
    <Span from="compare" to="rehook"><CompareBody /></Span>
    <Span from="why"><WhyBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
