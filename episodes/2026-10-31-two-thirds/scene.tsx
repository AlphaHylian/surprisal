// "Why picking 33 loses this number game": guess 2/3 of the average, level-k thinking.
// mistake hook -> rules -> rule out 33 (random average 50) -> everyone thinks it: 22 -> 15, 10 ... 0
// -> re-hook: 0 loses too -> Politiken 2005, 19,196 readers, 21.6 -> payoff: one step past the crowd -> CTA.
import React from "react";
import {
  Appear, At, C, Camera, Card, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text, tween, useAt, useT,
} from "../kit";

// Number line 0..100 from x 120 to 960 at y LY.
const X0 = 120, X1 = 930, LY = 1080;
const xOf = (v: number) => X0 + (v / 100) * (X1 - X0);

// 40 crowd dots: deterministic "random" picks 0..100.
const N = 40;
const rnd = (i: number) => { const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
const RANDOM = [...Array(N)].map((_, i) => Math.round(rnd(i) * 100));
const near = (c: number, spread: number) => [...Array(N)].map((_, i) => Math.max(0, Math.min(100, c + (rnd(i + 99) - 0.5) * spread)));

const Line: React.FC<{ show?: number }> = ({ show = 0 }) => (
  <Appear at={show} from="fade">
    <div style={{ position: "absolute", left: X0, top: LY - 3, width: X1 - X0, height: 6, background: C.muted, borderRadius: 3 }} />
    {[0, 50, 100].map((v) => (
      <At key={v} x={xOf(v)} y={LY + 50}><Text size={42} color={C.muted}>{v}</Text></At>
    ))}
  </Appear>
);

// dots stacked above the line in bins of 5
const Dots: React.FC<{ vals: number[]; color?: string }> = ({ vals, color = C.ink }) => {
  const count: Record<number, number> = {};
  return (
    <>
      {vals.map((v, i) => {
        const b = Math.round(v / 2);
        const k = (count[b] = (count[b] ?? 0) + 1) - 1;
        return <div key={i} style={{ position: "absolute", left: xOf(v) - 11, top: LY - 36 - k * 24, width: 22, height: 22, borderRadius: 11,
          background: color, opacity: 0.8 }} />;
      })}
    </>
  );
};

const Pin: React.FC<{ v: number; color: string; label: string; up?: number }> = ({ v, color, label, up = 0 }) => (
  <>
    <div style={{ position: "absolute", left: xOf(v) - 4, top: LY - 330 - up, width: 8, height: 330 + up, background: color, borderRadius: 4, boxShadow: `0 0 20px ${color}88` }} />
    <At x={Math.min(Math.max(xOf(v), 170), 860)} y={LY - 370 - up}><Chip color={color} size={46}>{label}</Chip></At>
  </>
);

const lerpVals = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tLose = at.word("lose", 1, 1.8);
  return (
    <>
      <HookText>{"Pick 33: lose.\nPick 0: **lose too.**"}</HookText>
      <Riser to={tLose} volume={0.5} />
      <Camera keys={[[0, { zoom: 1.0 }], [at.dur, { zoom: 1.04 }]]}>
        <Line />
        <Dots vals={near(30, 30)} />
        <Pin v={33} color={C.coral} label="you: 33" up={60} />
        <Pin v={22} color={C.amber} label="wins: 22" />
      </Camera>
      
    </>
  );
};

// ---------------------------------------------------------------- the rules
const RulesBody: React.FC = () => {
  const at = useAt();
  const tPick = at.word("picks", 1, 0.6);
  const tTwo = at.word("two", 1, 2.6);
  const tWins = at.word("wins", 1, 4.0);
  return (
    <>
      <Headline>The game</Headline>
      <At y={500}><Appear at={0.05} from="pop"><Icon name="Users" size={200} color={C.mint} /></Appear></At>
      <At y={720}><Appear at={tPick} from="up"><Text size={84}>pick <span style={{ color: C.amber }}>0</span> to <span style={{ color: C.amber }}>100</span></Text></Appear></At>
      <At y={920}>
        <Appear at={tTwo} from="up">
          <Card w={820} h={190} border={C.amber}>
            <Text size={60}>closest to <span style={{ color: C.amber }}>2/3</span> of the average</Text>
          </Card>
        </Appear>
      </At>
      <At y={1110}><Appear at={tWins} from="slam"><Chip color={C.mint} size={56}>wins</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 33 looks smart, then everyone does it
const ChainBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t50 = at.word("50", 1, 2.0);
  const t33 = at.word("33", 2, 4.0);
  const tStep = at.beat("step");
  const tAll = at.word("all", 1, tStep + 1.8);
  const t22 = at.word("22", 1, tStep + 3.4);
  const tChain = at.beat("chain");
  const t15 = at.word("15", 1, tChain + 1.4);
  const t10 = at.word("10", 1, tChain + 2.2);
  const t0 = at.word("0", 1, tChain + 4.0);
  const crowd = t < tAll ? RANDOM
    : t < t15 ? lerpVals(RANDOM, near(33, 8), tween(t, tAll, tAll + 0.8, 0, 1))
    : t < t10 ? lerpVals(near(33, 8), near(22, 8), tween(t, t15 - 0.3, t15 + 0.3, 0, 1))
    : t < t0 ? lerpVals(near(22, 8), near(15, 8), tween(t, t10 - 0.3, t10 + 0.3, 0, 1))
    : lerpVals(near(15, 8), near(2, 4), tween(t, t0 - 0.8, t0, 0, 1));
  const target = t < t22 ? 33 : t < t15 ? 22 : t < t10 ? tween(t, t15 - 0.3, t15, 22, 15) : t < t0 ? tween(t, t10 - 0.3, t10, 15, 10) : tween(t, t0 - 0.8, t0, 10, 0);
  return (
    <>
      <Headline out={tStep - 0.3}>33 looks smart</Headline>
      <Headline at={tStep} out={tChain - 0.3} color={C.coral}>Everyone had that idea</Headline>
      <Headline at={tChain} color={C.amber}>Keep going</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t0 - 1, { zoom: 1 }], [t0, { zoom: 1.05 }]]}>
        <Line show={0} />
        <Dots vals={crowd} color={t < tAll ? C.ink : C.muted} />
        {t >= t50 && t < tAll ? <Appear at={t50} from="drop"><Pin v={50} color={C.mint} label="average 50" up={110} /></Appear> : null}
        {t >= t33 - 0.2 ? <Appear at={t33 - 0.2} from="pop"><Pin v={target} color={C.amber} label={`target ${Math.round(target)}`} /></Appear> : null}
      </Camera>
      <At x={540} y={480}>
        <Appear at={t33} out={tStep - 0.2} from="up"><Text size={56} color={C.amber}>2/3 of 50 = 33</Text></Appear>
      </At>
      <At x={540} y={480}>
        <Appear at={t22} out={tChain - 0.2} from="up"><Text size={56} color={C.amber}>2/3 of 33 = 22</Text></Appear>
      </At>
      <At x={540} y={480}>
        <Appear at={t15} from="up"><Text size={56} color={C.amber} font={F.mono}>33 → 22 → 15 → 10 → … 0</Text></Appear>
      </At>
      <Sfx name="pack/ding-short" at={t22} volume={0.4} />
      <Sfx name="pack/ding-short" at={t15} volume={0.4} />
      <Sfx name="pack/ding-short" at={t10} volume={0.4} />
      <Sfx name="pack/whoosh-soft" at={t0 - 0.8} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook: 0 loses too
const RehookBody: React.FC = () => {
  const at = useAt();
  const tPerfect = at.word("perfect", 1, 0.8);
  const tLose = at.word("lose", 1, 2.8);
  return (
    <Shake at={tLose}>
      <Headline>The perfect answer?</Headline>
      <At y={680}><Appear at={tPerfect} from="pop"><Text size={360} color={C.mint} glow>0</Text></Appear></At>
      <At y={1000}><Appear at={tLose} from="slam"><Stamp size={100}>LOSES TOO</Stamp></Appear></At>
      <Sfx name="pack/wrong" at={tLose + 0.1} volume={0.35} />
    </Shake>
  );
};

// ---------------------------------------------------------------- the real game
const RealBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tReaders = at.word("readers", 1, 3.0);
  const tWin = at.word("21.6", 1, 5.0);
  const tNum = at.word("19,196", 1, 1.8);
  return (
    <>
      <Headline>A real game, 2005</Headline>
      <At x={300} y={480}><Appear at={0.05} from="drop"><Icon name="Newspaper" size={170} color={C.ink} /></Appear></At>
      <At x={680} y={480}>
        <Appear at={Math.max(0.2, tNum - 0.3)} from="up">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Counter from={0} to={19196} t0={tNum - 0.2} t1={tReaders} size={90} color={C.ink} />
            <Text size={44} color={C.muted}>Danish readers</Text>
          </div>
        </Appear>
      </At>
      <Line show={0.3} />
      <Dots vals={RANDOM.map((v, i) => (i % 3 === 0 ? v : i % 3 === 1 ? 30 + rnd(i + 7) * 10 : 18 + rnd(i + 3) * 10))} color={C.muted} />
      {t >= tWin - 0.1 ? <Appear at={tWin - 0.1} from="pop"><Pin v={21.6} color={C.amber} label="winner: 21.6" up={80} /></Appear> : null}
      <Sfx name="pack/kaching" at={tWin} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tSteps = at.word("steps", 1, 1.6);
  const tOne = at.word("one", 2, 4.4);
  const rows: [string, string, string][] = [["no thinking", "50", C.muted], ["1 step", "33", C.ink], ["2 steps", "22", C.ink], ["one more", "15", C.amber]];
  return (
    <>
      <Headline color={C.amber}>One step past the crowd</Headline>
      <Punch at={tOne}>
        {rows.map(([a, b, col], i) => (
          <At key={a} x={540} y={450 + i * 160}>
            <Appear at={i < 3 ? 0.1 + i * Math.max(0.3, tSteps / 3) : tOne} from={i < 3 ? "left" : "slam"}>
              <div style={{ display: "flex", alignItems: "center", gap: 40, width: 720, justifyContent: "space-between",
                padding: "12px 40px", borderRadius: 30, border: `3px solid ${i === 3 ? C.amber : C.dim}`, background: `${C.panel}dd` }}>
                <Text size={54} color={col}>{a}</Text><Text size={72} color={col} font={F.bold}>{b}</Text>
              </div>
            </Appear>
          </At>
        ))}
      </Punch>
      <At x={540} y={1060}><Appear at={tSteps + 0.2} from="fade"><Text size={42} color={C.muted}>most people stop at 1 or 2 steps</Text></Appear></At>
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const tWins = at.word("wins", 1, 3.0);
  return (
    <>
      <At y={560}><Appear at={0} from="pop"><Text size={120} color={C.amber}>Your number?</Text></Appear></At>
      <At y={800}><Appear at={0.4} from="up"><Text size={60}>0 to 100</Text></Appear></At>
      <At y={980}><Appear at={tWins - 0.6} from="up"><Chip color={C.mint} size={54}>2/3 of the average wins</Chip></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="rules"><RulesBody /></Span>
    <Span from="ruleout" to="chain"><ChainBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="real"><RealBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
