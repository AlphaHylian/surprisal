// "How to split the pot when the game stops early": the problem of points (Pascal's letter to Fermat, 29 July 1654).
// versus hook (stopped at 2 to 1: split 2:1 or 3:1?) -> rule out the score split (the textbook answer for 160 years) ->
// Paris 1654, first to 3, 64 coins -> count rounds still needed: 1 vs 2 -> one more round in your head: win 64, lose 2-2 = 32 each ->
// re-hook: 32 is yours either way, only 32 in doubt -> half of it: 48 / 16, 3 to 1 -> payoff: Fermat's 4 endings, you win 3 ->
// CTA comment question (you lead 1 to 0: your share of 64?).
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- pieces
// a scoreboard row: name + 3 round pips (filled = won), first to 3
const Pips: React.FC<{ won: number; color: string; need?: boolean; size?: number }> = ({ won, color, need, size = 70 }) => (
  <div style={{ display: "flex", gap: 18 }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{ width: size, height: size, borderRadius: "50%", boxSizing: "border-box",
        background: i < won ? color : "transparent",
        border: `6px ${i < won ? "solid" : need ? "dashed" : "solid"} ${i < won ? color : need ? color : C.dim}` }} />
    ))}
  </div>
);

const Score: React.FC<{ you: number; them: number; need?: boolean; size?: number }> = ({ you, them, need, size = 70 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
      <Text size={size * 0.8} color={C.amber} style={{ width: size * 2.6, textAlign: "left" }}>You</Text>
      <Pips won={you} color={C.amber} need={need} size={size} />
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
      <Text size={size * 0.8} color={C.ink} style={{ width: size * 2.6, textAlign: "left" }}>Them</Text>
      <Pips won={them} color={C.ink} need={need} size={size} />
    </div>
  </div>
);

// the pot split as one bar: your part amber, theirs ink
const SplitBar: React.FC<{ you: number; w?: number; label?: string; color?: string; left?: string; right?: string }> =
  ({ you, w = 840, color = C.amber, left, right }) => (
    <div style={{ display: "flex", width: w, height: 110, borderRadius: 16, overflow: "hidden", border: `4px solid ${C.dim}` }}>
      <div style={{ width: (w * you) / 64, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Text size={56} color={C.bg} font={F.mono} style={{ textShadow: "none" }}>{left}</Text>
      </div>
      <div style={{ flex: 1, background: `${C.ink}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Text size={56} color={C.ink} font={F.mono}>{right}</Text>
      </div>
    </div>
  );

const Coins: React.FC<{ n?: string; size?: number }> = ({ n = "64", size = 1 }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16 * size }}>
    <Icon name="Coins" size={110 * size} color={C.amber} />
    <Text size={84 * size} color={C.amber} font={F.mono}>{n}</Text>
  </div>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t3 = at.word("3", 1, 2.2);
  return (
    <>
      <HookText size={96} out={at.dur - 0.4}>{"Stopped at 2–1:\nsplit **2:1** or **3:1**?"}</HookText>
      <Riser to={t3} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06 }]]}>
        <At x={540} y={640}><Appear at={0} from="pop"><Score you={2} them={1} size={72} /></Appear></At>
        <At x={540} y={880}><Appear at={0} from="left"><SplitBar you={42.67} color={C.coral} left="2" right="1" /></Appear></At>
        <At x={540} y={1050}><Appear at={0} from="right"><SplitBar you={48} left="3" right="1" /></Appear></At>
      </Camera>
      <Sfx name="pack/cash-ting" at={t3 - 0.1} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out the score split
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const t160 = at.word("160", 1, 2.6);
  const tWrong = at.word("wrong.", 1, 4.6);
  return (
    <>
      <Headline>Split by the score?</Headline>
      <At x={540} y={560}><Appear at={0.1} from="up"><SplitBar you={42.67} color={C.coral} left="43" right="21" /></Appear></At>
      <At x={540} y={700}><Appear at={0.4} from="fade"><Text size={44} color={C.muted}>2 rounds won : 1 round won</Text></Appear></At>
      <At x={540} y={880}>
        <Appear at={t160 - 0.2} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <Icon name="BookOpen" size={100} color={C.ink} />
            <Text size={60} color={C.ink} font={F.mono}>1494 → 1654</Text>
          </div>
        </Appear>
      </At>
      <At x={540} y={1060}><Appear at={tWrong - 0.15} from="slam"><Stamp size={90} rotate={-6}>WRONG</Stamp></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 3. Paris 1654: first to 3, 64 coins, stopped at 2 to 1
const SetupBody: React.FC = () => {
  const at = useAt();
  const tPascal = at.word("Pascal:", 1, 2.4);
  const t64 = at.word("64", 1, 4.6);
  const tStop = at.word("stops", 1, 6.0);
  return (
    <>
      <Headline>Paris, 1654</Headline>
      <At x={540} y={500}>
        <Appear at={0.15} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Icon name="ScrollText" size={110} color={C.ink} />
            <Text size={54} color={C.ink}>to Blaise Pascal</Text>
          </div>
        </Appear>
      </At>
      <At x={540} y={680}><Appear at={t64 - 0.3} from="pop"><Coins /></Appear></At>
      <At x={540} y={790}><Appear at={t64 - 0.1} from="fade"><Text size={46} color={C.muted}>first to 3 rounds</Text></Appear></At>
      <At x={540} y={990}><Appear at={tStop - 0.2} from="up"><Score you={2} them={1} size={66} /></Appear></At>
      <Sfx name="pack/paper-flip" at={0.15} volume={0.4} />
      <Sfx name="pack/cash-register" at={t64 - 0.2} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 4. count the rounds still needed
const NeedBody: React.FC = () => {
  const at = useAt();
  const tStill = at.word("still", 1, 2.2);
  const t1 = at.word("1.", 1, 3.6);
  const t2 = at.word("2.", 1, 4.6);
  return (
    <>
      <Headline out={tStill - 0.3}>Don't count wins</Headline>
      <Headline at={tStill} color={C.amber}>Count what's still needed</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tStill, { zoom: 1 }], [tStill + 0.6, { zoom: 1.08, x: 540, y: 760 }]]}>
        <At x={540} y={660}><Score you={2} them={1} need={true} size={80} /></At>
        <At x={540} y={880}><Appear at={t1 - 0.15} from="pop"><Chip size={56}>you need 1</Chip></Appear></At>
        <At x={540} y={990}><Appear at={t2 - 0.15} from="pop"><Chip size={56} color={C.ink}>they need 2</Chip></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 5-8. one more round in your head: the tree, then 32 sure + half of 32
const Branch: React.FC<{ x: number; y: number; at: number; title: string; color: string; you: number; score: string }> =
  ({ x, y, at, title, color, you, score }) => (
    <At x={x} y={y}>
      <Appear at={at} from="up">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 440 }}>
          <Text size={56} color={color}>{title}</Text>
          <Text size={44} color={C.muted} font={F.mono}>{score}</Text>
          <SplitBar you={you} w={400} left={String(you)} right={you < 64 ? String(64 - you) : ""} />
        </div>
      </Appear>
    </At>
  );

const TreeBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tWin = at.word("Win", 1, 1.8);
  const t64 = at.word("64.", 1, 3.2);
  const tLose = at.beat("lose");
  const tFlip = at.word("flip.", 1, tLose + 1.8);
  const t32 = at.word("32", 1, tLose + 3.4);
  const tRe = at.beat("rehook");
  const tDoubt = at.word("doubt.", 1, tRe + 2.6);
  const tHalf = at.beat("half");
  const t48 = at.word("48", 1, tHalf + 1.2);
  const t31 = at.word("3", 1, tHalf + 2.6);
  const treeOut = tHalf - 0.2;
  const fade = tween(t, treeOut, treeOut + 0.3, 1, 0);
  return (
    <>
      <Headline out={tRe - 0.3}>Play one more round</Headline>
      <Headline at={tRe} out={tHalf - 0.3} color={C.amber}>32 is yours either way</Headline>
      <Headline at={tHalf}>Half of the rest</Headline>
      {t < treeOut + 0.3 ? (
        <div style={{ opacity: fade }}>
          <At x={540} y={420}><Appear at={0.1} from="pop"><Icon name="Dices" size={100} color={C.ink} /></Appear></At>
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
            <line x1={540} y1={480} x2={290} y2={600} stroke={C.amber} strokeWidth={6} opacity={tween(t, tWin - 0.2, tWin, 0, 1)} />
            <line x1={540} y1={480} x2={790} y2={600} stroke={C.ink} strokeWidth={6} opacity={tween(t, tLose - 0.2, tLose, 0, 1)} />
          </svg>
          <Branch x={290} y={760} at={tWin} title="Win" color={C.amber} you={64} score="3–1" />
          <Branch x={790} y={760} at={tLose} title="Lose" color={C.ink} you={32} score="2–2" />
          <At x={790} y={940}><Appear at={tFlip - 0.2} from="pop"><Icon name="Coins" size={80} color={C.muted} /></Appear></At>
          {/* re-hook: the sure 32 lights up in both outcomes */}
          <At x={540} y={1030}><Appear at={tRe + 0.2} from="up"><Chip size={56}>sure: 32</Chip></Appear></At>
          <At x={540} y={1120}><Appear at={tDoubt - 0.25} from="fade"><Text size={46} color={C.coral}>in doubt: the other 32</Text></Appear></At>
        </div>
      ) : null}
      {/* half: 32 + 16 = 48 vs 16 */}
      <At x={540} y={560}><Appear at={tHalf + 0.1} from="fade"><Text size={56} color={C.muted} font={F.mono}>32 + 32 ÷ 2</Text></Appear></At>
      <Punch at={t48} amount={0.04}>
        <At x={540} y={740}><Appear at={t48 - 0.2} from="up"><SplitBar you={48} left="48" right="16" /></Appear></At>
      </Punch>
      <At x={540} y={960}><Appear at={t31 - 0.15} from="slam"><Text size={150} color={C.amber} font={F.mono} glow>3 : 1</Text></Appear></At>
      <At x={540} y={1110}><Appear at={t31 + 0.6} from="fade"><Text size={46} color={C.coral}>not 2 : 1</Text></Appear></At>
      <Sfx name="pack/kaching" at={t64 - 0.1} volume={0.35} />
      <Sfx name="pack/cash-ting" at={t32} volume={0.35} />
      <Sfx name="pack/hit-swell" hit={t31} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 9. payoff: Fermat plays out every ending
const ENDINGS = [["W", "W"], ["W", "L"], ["L", "W"], ["L", "L"]];
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tEvery = at.word("endings,", 1, 2.4);
  const t4 = at.word("4", 1, 2.0);
  const t3 = at.word("3.", 1, 3.6);
  const tLetters = at.word("letters", 1, 5.2);
  const t = useT();
  return (
    <>
      <Headline out={tLetters - 0.3}>Fermat: every ending</Headline>
      <Headline at={tLetters} color={C.amber}>The start of probability</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tLetters - 0.3, { zoom: 1 }], [tLetters + 0.5, { zoom: 0.9, y: 760 }]]}>
        {ENDINGS.map((e, i) => {
          const youWin = e[0] === "W";
          const lit = t >= t3 - 0.1;
          return (
            <At key={i} x={540} y={470 + i * 130}>
              <Appear at={Math.min(0.3, tEvery - 0.4) + i * 0.25} from="left" sfx={i === 0 ? undefined : null}>
                <div style={{ display: "flex", alignItems: "center", gap: 30, width: 760 }}>
                  {e.map((r, j) => (
                    <div key={j} style={{ width: 96, height: 96, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                      background: r === "W" ? `${C.amber}33` : `${C.ink}18`, border: `4px solid ${r === "W" ? C.amber : C.muted}` }}>
                      <Text size={56} font={F.mono} color={r === "W" ? C.amber : C.ink}>{r}</Text>
                    </div>
                  ))}
                  <Text size={50} color={lit ? (youWin ? C.amber : C.coral) : C.muted} style={{ marginLeft: 30 }}>
                    {youWin ? "you win" : "they win"}
                  </Text>
                </div>
              </Appear>
            </At>
          );
        })}
        <At x={540} y={1030}><Appear at={t3 - 0.1} from="pop"><Chip size={60}>3 of 4 = 48 of 64</Chip></Appear></At>
        <At x={540} y={1140}><Appear at={tLetters} from="up"><Text size={46} color={C.muted}>Pascal ↔ Fermat, 1654</Text></Appear></At>
      </Camera>
      <Sfx name="pack/paper-slide" at={tLetters - 0.2} volume={0.35} />
      <Sfx name="pack/ding-short" at={t4 - 0.05} volume={0.3} />
      <Sfx name="pack/correct" at={t3} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 10. CTA: you lead 1 to 0, your share of 64?
const CtaBody: React.FC = () => {
  const at = useAt();
  const tShare = at.word("share", 1, 2.6);
  return (
    <>
      <Headline>You lead 1–0</Headline>
      <At x={540} y={640}><Appear at={0.1} from="up"><Score you={1} them={0} size={80} /></Appear></At>
      <At x={540} y={900}><Appear at={tShare - 0.2} from="pop"><Chip size={60}>your share of 64: ?</Chip></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="setup"><SetupBody /></Span>
    <Span from="need"><NeedBody /></Span>
    <Span from="win" to="half"><TreeBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
