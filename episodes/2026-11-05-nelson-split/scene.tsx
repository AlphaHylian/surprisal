// "How 40 ships beat 46": Lanchester's square law and Nelson's Trafalgar plan.
// versus hook (40 vs 46, line up = lose, split = win) -> rule out guns/sailors -> Nelson 1805, Lanchester 1916
// -> square law (shoot and get shot: x2 x2 = x4) -> line vs line 1,600 vs 2,116, 23 of theirs left
// -> re-hook flip it? -> split: 32 on 23, 1,024 vs 529, 22 left -> + 8: 30 vs 23, ~20 afloat
// -> payoff Trafalgar 27 broke 33, 18 taken, none lost -> CTA subscribe if you'd have lined them up.
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT,
} from "../kit";

// a block of n ship icons, `alive` of them lit (the rest sunk/dimmed), centred on (x, y)
const Fleet: React.FC<{ n: number; alive?: number; x: number; y: number; cols: number; size?: number; color: string; gap?: number }> =
  ({ n, alive = n, x, y, cols, size = 54, color, gap = 10 }) => {
    const rows = Math.ceil(n / cols);
    const w = cols * size + (cols - 1) * gap, h = rows * size + (rows - 1) * gap;
    return (
      <>
        {Array.from({ length: n }, (_, i) => {
          const live = i < Math.round(alive);
          return (
            <div key={i} style={{ position: "absolute", left: x - w / 2 + (i % cols) * (size + gap), top: y - h / 2 + Math.floor(i / cols) * (size + gap),
              width: size, height: size, opacity: live ? 1 : 0.16 }}>
              <Icon name="Ship" size={size} color={live ? color : C.muted} stroke={2.4} />
            </div>
          );
        })}
      </>
    );
  };
// bar for a squared strength, scaled so 2,116 = 820 px
const SBar: React.FC<{ v: number; t0: number; color: string; label: string; y: number }> = ({ v, t0, color, label, y }) => {
  const t = useT();
  const w = tween(t, t0, t0 + 0.7, 0, (v / 2116) * 820);
  return (
    <>
      <div style={{ position: "absolute", left: 130, top: y - 34, width: w, height: 68, borderRadius: 16, background: color, boxShadow: `0 0 24px ${color}88` }} />
      <At x={130 + 140} y={y - 80}><Appear at={t0} from="fade" sfx={null}><Text size={44} color={color}>{label}</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tOne = at.word("loses", 1, 1.6);
  const tWins = at.word("wins", 1, 2.4);
  return (
    <>
      <HookText>{"40 ships vs 46.\n**Split them. Win.**"}</HookText>
      <Riser to={tWins} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.07 }]]}>
        <Fleet n={40} x={290} y={780} cols={5} color={C.mint} />
        <Fleet n={46} x={790} y={780} cols={5} color={C.coral} />
        <At x={540} y={780}><Text size={64} color={C.muted}>vs</Text></At>
      </Camera>
      <At x={290} y={1110}><Appear at={tOne - 0.2} from="pop"><Chip color={C.coral} size={46}>line up: lose</Chip></Appear></At>
      <At x={760} y={1110}><Appear at={tWins - 0.15} from="slam"><Chip color={C.amber} size={46}>split: win</Chip></Appear></At>
      <Sfx name="pack/boom-short" at={tWins} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- rule out + context
const RuleBody: React.FC = () => {
  const at = useAt();
  const tCtx = at.beat("context");
  const tShips = at.word("ships", 1, 0.3);
  const tGuns = at.word("guns", 1, 0.9);
  const tSailors = at.word("sailors", 1, 1.5);
  const tArith = at.word("arithmetic", 1, 2.8);
  const t1805 = at.word("1805", 1, tCtx + 2.2);
  const t1916 = at.word("1916", 1, tCtx + 3.2);
  return (
    <>
      <Headline out={tCtx - 0.3}>Same everything</Headline>
      <Headline at={tCtx}>Why it works</Headline>
      <At x={540} y={470}><Appear at={tShips - 0.1} out={tCtx - 0.2} from="pop"><Text size={60}>ships <span style={{ color: C.mint }}>=</span></Text></Appear></At>
      <At x={540} y={590}><Appear at={tGuns - 0.1} out={tCtx - 0.2} from="pop"><Text size={60}>guns <span style={{ color: C.mint }}>=</span></Text></Appear></At>
      <At x={540} y={710}><Appear at={tSailors - 0.1} out={tCtx - 0.2} from="pop"><Text size={60}>sailors <span style={{ color: C.mint }}>=</span></Text></Appear></At>
      <At x={540} y={900}><Appear at={tArith - 0.3} out={tCtx - 0.2} from="slam"><Stamp size={80} color={C.amber} rotate={-4}>ARITHMETIC</Stamp></Appear></At>
      <At x={540} y={560}><Appear at={tCtx} from="up"><Icon name="Anchor" size={200} color={C.mint} /></Appear></At>
      <At x={540} y={820}><Appear at={t1805 - 0.4} from="up"><Text size={64}>Nelson, Trafalgar <span style={{ color: C.amber }}>1805</span></Text></Appear></At>
      <At x={540} y={960}><Appear at={t1916 - 0.4} from="up"><Text size={56} color={C.muted}>Lanchester's maths, <span style={{ color: C.amber }}>1916</span></Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- square law
const SquareBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tShoot = at.word("shoots", 1, 0.6);
  const tShot = at.word("shot", 1, 1.6);
  const tDouble = at.word("Double", 1, 2.6);
  const tTwice = at.word("twice", 1, 4.0);
  const tThin = at.word("thin", 1, 6.0);
  const t4 = at.word("4", 1, 7.2);
  const fire = (t0: number) => tween(t, t0, t0 + 0.5, 0, 1);
  const f1 = fire(tShoot), f2 = fire(tShot);
  return (
    <>
      <Headline>Shoot and get shot</Headline>
      {t < tDouble - 0.1 ? (
        <>
          <At x={280} y={700}><Icon name="Ship" size={160} color={C.mint} /></At>
          <At x={800} y={700}><Icon name="Ship" size={160} color={C.coral} /></At>
          <div style={{ position: "absolute", left: 360 + f1 * 340, top: 660, width: 24, height: 24, borderRadius: 12, background: C.mint, opacity: f1 > 0 && f1 < 1 ? 1 : 0 }} />
          <div style={{ position: "absolute", left: 700 - f2 * 340, top: 720, width: 24, height: 24, borderRadius: 12, background: C.coral, opacity: f2 > 0 && f2 < 1 ? 1 : 0 }} />
          <Sfx name="pack/boom-shot" at={tShoot} volume={0.2} />
        </>
      ) : (
        <>
          <Fleet n={2} x={270} y={600} cols={1} size={110} color={C.mint} gap={30} />
          <Fleet n={1} x={810} y={600} cols={1} size={110} color={C.coral} />
          <At x={540} y={880}><Appear at={tTwice - 0.2} from="up"><Text size={58}><span style={{ color: C.mint }}>×2</span> the fire</Text></Appear></At>
          <At x={540} y={980}><Appear at={tThin - 0.5} from="up"><Text size={58}><span style={{ color: C.mint }}>×2</span> their fire spread thin</Text></Appear></At>
          <At x={540} y={1110}><Appear at={t4 - 0.2} from="slam"><Punch at={t4}><Chip color={C.amber} size={66}>×4 the strength</Chip></Punch></Appear></At>
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------- line vs line + rehook
const LineBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRe = at.beat("rehook");
  const t1600 = at.word("1,600", 1, 2.2);
  const t2116 = at.word("2,116", 1, 4.2);
  const tLose = at.word("lose", 1, 6.0);
  const t23 = at.word("23", 1, 7.2);
  const sink = tween(t, tLose, tLose + 1.4, 1, 0);
  const sinkThem = tween(t, tLose, tLose + 1.4, 46, 23);
  return (
    <>
      <Headline out={tRe - 0.3}>Square it</Headline>
      <Headline at={tRe} color={C.amber}>Same 40. Flip it?</Headline>
      <SBar v={1600} t0={t1600 - 0.3} color={C.mint} label="40² = 1,600" y={480} />
      <SBar v={2116} t0={t2116 - 0.3} color={C.coral} label="46² = 2,116" y={650} />
      <Camera keys={[[0, { zoom: 1 }], [tRe, { zoom: 1 }], [tRe + 0.6, { zoom: 1.04 }]]}>
        <Fleet n={40} alive={40 * sink} x={290} y={950} cols={8} size={40} gap={8} color={C.mint} />
        <Fleet n={46} alive={sinkThem} x={790} y={950} cols={8} size={40} gap={8} color={C.coral} />
      </Camera>
      <At x={790} y={1140}><Appear at={t23 - 0.2} from="pop"><Text size={48} color={C.coral}>23 left</Text></Appear></At>
      <At x={290} y={1140}><Appear at={tLose} from="pop"><Text size={48} color={C.muted}>0 left</Text></Appear></At>
      <Sfx name="pack/drop-sub" at={tLose} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- the split
const SplitBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFin = at.beat("finish");
  const tCut = at.word("Cut", 1, 0.2);
  const t32 = at.word("32", 1, 1.8);
  const t1024 = at.word("1,024", 1, 3.6);
  const t529 = at.word("529", 1, 4.8);
  const t22 = at.word("22", 1, 7.4);
  const t8 = at.word("8", 1, tFin + 1.0);
  const t30 = at.word("30", 1, tFin + 1.8);
  const t20 = at.word("20", 1, tFin + 4.6);
  const gapY = tween(t, tCut, tCut + 0.6, 0, 90);
  // first fight: 32 vs first 23 -> 22 vs 0; second: 30 vs 23 -> 20 vs 0
  const f1 = tween(t, t529 + 0.3, t22, 0, 1);
  const f2 = tween(t, t30 + 0.3, t20, 0, 1);
  const main = t < tFin ? 32 - 10 * f1 : 22;
  const reserve = 8;
  const them1 = 23 - 23 * f1;
  const them2 = 23 - 23 * f2;
  const ours2 = 30 - 10 * f2;
  return (
    <>
      <Headline out={tFin - 0.3}>Cut their line</Headline>
      <Headline at={tFin}>Then the other half</Headline>
      {t < tFin - 0.1 ? (
        <>
          {/* enemy halves, right; the near half is attacked */}
          <Fleet n={23} alive={them1} x={800} y={500 - gapY / 2} cols={5} size={44} gap={8} color={C.coral} />
          <Fleet n={23} x={800} y={820 + gapY / 2} cols={5} size={44} gap={8} color={C.coral} />
          <Fleet n={32} alive={main} x={300} y={500} cols={6} size={44} gap={8} color={C.mint} />
          <Fleet n={reserve} x={300} y={860} cols={4} size={44} gap={8} color={C.mint} />
          <At x={300} y={330}><Appear at={t32 - 0.2} from="fade" sfx={null}><Text size={44} color={C.mint}>32</Text></Appear></At>
          <At x={300} y={970}><Appear at={t32 - 0.2} from="fade" sfx={null}><Text size={40} color={C.muted}>8 wait</Text></Appear></At>
          <At x={540} y={1080}><Appear at={t1024 - 0.3} from="up"><Text size={66}><span style={{ color: C.mint }}>1,024</span> vs <span style={{ color: C.coral }}>529</span></Text></Appear></At>
          <At x={540} y={1160}><Appear at={t22 - 0.2} from="slam"><Chip color={C.amber} size={46}>you win, 22 left</Chip></Appear></At>
          <Sfx name="pack/whoosh-punchy" at={tCut} volume={0.4} />
        </>
      ) : (
        <>
          <Fleet n={30} alive={t < t8 ? 22 : ours2} x={300} y={640} cols={6} size={48} gap={8} color={C.mint} />
          <Fleet n={23} alive={them2} x={800} y={640} cols={5} size={48} gap={8} color={C.coral} />
          <At x={300} y={400}><Appear at={t8 - 0.2} from="pop"><Text size={50} color={C.mint}>22 + 8 = 30</Text></Appear></At>
          <At x={540} y={960}><Appear at={t30 - 0.3} from="up"><Text size={66}><span style={{ color: C.mint }}>900</span> vs <span style={{ color: C.coral }}>529</span></Text></Appear></At>
          <At x={540} y={1100}><Appear at={t20 - 0.2} from="slam"><Chip color={C.amber} size={52}>about 20 still afloat</Chip></Appear></At>
          <Sfx name="pack/correct" at={t20} volume={0.35} />
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------- payoff + CTA
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tCta = at.beat("cta");
  const t27 = at.word("27", 1, 1.0);
  const t18 = at.word("18", 1, 2.8);
  const tNone = at.word("none", 1, 4.6);
  return (
    <>
      <Headline out={tCta - 0.3}>Trafalgar, 21 Oct 1805</Headline>
      <Headline at={tCta} color={C.amber}>Line up, or split?</Headline>
      <At x={540} y={470}><Appear at={t27 - 0.3} from="up"><Text size={70}><span style={{ color: C.mint }}>27</span> ships broke <span style={{ color: C.coral }}>33</span></Text></Appear></At>
      <At x={540} y={660}>
        <Appear at={t18 - 0.3} from="pop">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Counter from={0} to={18} t0={t18 - 0.2} t1={t18 + 0.6} size={120} color={C.coral} />
            <Text size={50} color={C.ink}>taken or destroyed</Text>
          </div>
        </Appear>
      </At>
      <At x={540} y={860}>
        <Appear at={tNone - 0.3} from="slam">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Text size={120} color={C.mint} font={F.bold}>0</Text>
            <Text size={50} color={C.ink}>British ships lost</Text>
          </div>
        </Appear>
      </At>
      <At x={540} y={1060}><Appear at={tCta} from="up"><Text size={56} color={C.muted}>40 vs 46: <span style={{ color: C.amber }}>what's your move?</span></Text></Appear></At>
      <Sfx name="pack/ding" at={tNone} volume={0.4} />
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout" to="context"><RuleBody /></Span>
    <Span from="square"><SquareBody /></Span>
    <Span from="line" to="rehook"><LineBody /></Span>
    <Span from="split" to="finish"><SplitBody /></Span>
    <Span from="payoff" to="cta"><PayoffBody /></Span>
  </>
);
export default Scene;
