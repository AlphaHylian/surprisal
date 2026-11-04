// "How to stack 4 books so the top one is off the table": the harmonic book stack.
// claim hook (final stack, top book past the edge) -> rule out glue/weights -> the rule: middle over support,
// build top-down -> top +12 -> top two +6 -> three +4, four +3 past the table -> re-hook 12/6/4/3 enough?
// -> payoff 25 cm, 1 cm past, more books forever (staircase grows) -> CTA: two lengths, how many books?
import React from "react";
import {
  Appear, At, C, Camera, Chip, Headline, HookText, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT,
} from "../kit";

// geometry: 15 px per cm, books 24 cm = 360 px long, 70 px thick; table edge at x = EDGE, top at y = TOP
const PX = 20, LEN = 24 * PX, THICK = 90, EDGE = 360, TOP = 1000;
const COLORS = ["#e0a458", "#5fb39a", "#c96f6f", "#6f8fc9"]; // top .. bottom
// shift of each book's right end past the table edge after s steps (s = 0..4); book 0 = top
const STEP = [12, 6, 4, 3].map((c) => c * PX);
const rightEnd = (book: number, prog: number[]) => EDGE + STEP.reduce((acc, d, k) => acc + (book <= k ? d * prog[k] : 0), 0);

const Book: React.FC<{ i: number; right: number; glow?: boolean }> = ({ i, right, glow }) => {
  const y = TOP - THICK * (4 - i);
  return (
    <div style={{ position: "absolute", left: right - LEN, top: y, width: LEN, height: THICK - 4, borderRadius: 8, background: COLORS[i],
      boxShadow: glow ? `0 0 30px ${C.amber}` : "0 6px 16px #0007", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 16, top: 10, width: LEN - 32, height: 6, background: "#ffffff55", borderRadius: 3 }} />
      <div style={{ position: "absolute", left: 16, bottom: 10, width: LEN - 32, height: 6, background: "#00000033", borderRadius: 3 }} />
    </div>
  );
};
const Table: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: -40, top: TOP, width: EDGE + 40, height: 34, background: "#8a6a4a", borderRadius: "0 8px 8px 0" }} />
    <div style={{ position: "absolute", left: EDGE - 70, top: TOP + 34, width: 34, height: 1170 - TOP - 34, background: "#6e5238" }} />
  </>
);
const EdgeLine: React.FC<{ x: number; y0: number; y1: number; color?: string }> = ({ x, y0, y1, color = C.amber }) => (
  <div style={{ position: "absolute", left: x - 2, top: y0, width: 0, height: y1 - y0, borderLeft: `4px dashed ${color}` }} />
);
const Dot: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <div style={{ position: "absolute", left: x - 16, top: y - 16, width: 32, height: 32, borderRadius: 16, background: C.amber, border: `4px solid ${C.bg}`,
    boxShadow: `0 0 18px ${C.amber}` }} />
);
const Stack: React.FC<{ prog: number[]; glowTop?: boolean }> = ({ prog, glowTop }) => (
  <>
    <Table />
    {[3, 2, 1, 0].map((i) => <Book key={i} i={i} right={rightEnd(i, prog)} glow={glowTop && i === 0} />)}
  </>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tOff = at.word("off", 1, 2.4);
  return (
    <>
      <HookText>{"4 books.\n**Top one off the table.**"}</HookText>
      <Riser to={tOff} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06 }]]}>
        <Stack prog={[1, 1, 1, 1]} glowTop />
        <EdgeLine x={EDGE} y0={600} y1={TOP} />
      </Camera>
      <At x={540} y={1100}><Appear at={tOff - 0.2} from="slam"><Chip color={C.amber} size={56}>no glue, no tricks</Chip></Appear></At>
      <Sfx name="pack/hit-low" at={tOff} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- rule out + rule
const RuleBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRule = at.beat("rule");
  const tGlue = at.word("glue", 1, 0.4);
  const tTape = at.word("tape", 1, 1.0);
  const tWeight = at.word("weight", 1, 1.6);
  const tMiddle = at.word("middle", 1, 3.4);
  const tStays = at.word("stays", 1, tRule + 1.4);
  const tHolds = at.word("holds", 1, tRule + 3.4);
  const tTop = at.word("top", 1, tRule + 5.4);
  // a single book teetering: middle over the edge -> stays; past it -> falls
  const tilt = t > tHolds + 0.3 ? tween(t, tHolds + 0.3, tHolds + 1.0, 0, 0) : 0;
  const cx = tween(t, tStays, tStays + 1.2, EDGE - 60, EDGE);
  return (
    <>
      <Headline out={tRule - 0.3}>No tricks</Headline>
      <Headline at={tRule} color={C.amber}>Middle over the support</Headline>
      {/* rule-out words */}
      <At x={250} y={480}><Appear at={tGlue} out={tRule - 0.2} from="pop"><Stamp size={70} color={C.coral} rotate={-8}>GLUE</Stamp></Appear></At>
      <At x={540} y={560}><Appear at={tTape} out={tRule - 0.2} from="pop"><Stamp size={70} color={C.coral} rotate={6}>TAPE</Stamp></Appear></At>
      <At x={820} y={480}><Appear at={tWeight} out={tRule - 0.2} from="pop"><Stamp size={70} color={C.coral} rotate={-4}>WEIGHTS</Stamp></Appear></At>
      <At x={540} y={760}><Appear at={tMiddle - 0.2} out={tRule - 0.2} from="up"><Text size={58}>just where each <span style={{ color: C.amber }}>middle</span> sits</Text></Appear></At>
      {/* the rule: one book sliding until its middle is on the edge */}
      {t >= tRule - 0.05 && (
        <>
          <Table />
          <div style={{ position: "absolute", left: cx - LEN / 2, top: TOP - THICK, width: LEN, height: THICK - 4, borderRadius: 8, background: COLORS[0],
            transform: `rotate(${tilt}deg)`, transformOrigin: `${EDGE - (cx - LEN / 2)}px 100%`, boxShadow: "0 6px 16px #0007" }} />
          <Dot x={cx} y={TOP - THICK / 2} />
          <EdgeLine x={EDGE} y0={720} y1={TOP} />
          <At x={540} y={620}><Appear at={tHolds - 0.3} from="up"><Text size={52} color={C.mint}>middle on the edge: it stays</Text></Appear></At>
          <At x={540} y={480}><Appear at={tTop - 0.2} from="slam"><Chip color={C.amber} size={54}>build from the top down</Chip></Appear></At>
        </>
      )}
      <Sfx name="pack/thud-heavy" at={tRule + 0.1} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- the steps: +12, +6, +4, +3 (top, two, rest, rehook)
const StepsBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tTwo = at.beat("two");
  const tRest = at.beat("rest");
  const tRe = at.beat("rehook");
  const t24 = at.word("24", 1, 1.4);
  const t12 = at.word("12", 1, 3.2);
  const tEdge1 = at.word("edge", 1, 6.0);
  const t6 = at.word("6", 1, tTwo + 3.0);
  const t6b = at.word("6", 2, tTwo + 4.6);
  const t4 = at.word("4", 1, tRest + 1.0);
  const t3 = at.word("3", 1, tRest + 2.6);
  const tWhole = at.word("whole", 1, tRe + 3.2);
  const p = [
    tween(t, t12 - 0.2, t12 + 0.8, 0, 1),
    tween(t, t6b - 0.2, t6b + 0.6, 0, 1),
    tween(t, t4 - 0.1, t4 + 0.5, 0, 1),
    tween(t, t3 - 0.1, t3 + 0.5, 0, 1),
  ];
  // centre of the moving group, shown during its slide
  const groupCentre = (k: number) => {
    let s = 0;
    for (let i = 0; i <= k; i++) s += rightEnd(i, p) - LEN / 2;
    return s / (k + 1);
  };
  const supportEdge = (k: number) => (k < 3 ? rightEnd(k + 1, p) : EDGE);
  const phase = t < tTwo ? 0 : t < tRest ? 1 : t < t3 - 0.3 ? 2 : 3;
  const dotY = TOP - THICK * 4 + (THICK * (phase + 1)) / 2;
  const showDot = t > t12 - 0.4 && t < tRe;
  const labels = ["+12", "+6", "+4", "+3"];
  const lt = [t12, t6b, t4, t3];
  return (
    <>
      <Headline out={tTwo - 0.3}>Top book: half out</Headline>
      <Headline at={tTwo} out={tRest - 0.3}>Top two as one</Headline>
      <Headline at={tRest} out={tRe - 0.3}>Then 4, then 3</Headline>
      <Headline at={tRe} color={C.amber}>Enough for 24?</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tRe, { zoom: 1 }], [tRe + 0.6, { zoom: 1.04 }]]}>
        <Stack prog={p} />
        {showDot && <Dot x={groupCentre(phase)} y={dotY} />}
        {showDot && <EdgeLine x={supportEdge(phase)} y0={dotY} y1={TOP - THICK * (3 - phase) + 40} color={C.mint} />}
        <EdgeLine x={EDGE} y0={TOP} y1={1150} color={C.muted} />
        {/* step labels next to each book, right side */}
        {labels.map((l, i) => (
          <At key={i} x={rightEnd(i, p) + 70} y={TOP - THICK * (4 - i) + THICK / 2 - 4}>
            <Appear at={lt[i] + 0.4} from="pop" sfx={null}><Text size={44} color={C.amber}>{l}</Text></Appear>
          </At>
        ))}
      </Camera>
      <At x={540} y={480}><Appear at={t24 - 0.2} out={tTwo - 0.2} from="up"><Text size={54} color={C.muted}>each book: 24 cm</Text></Appear></At>
      <At x={540} y={480}><Appear at={t6 - 0.2} out={tRest - 0.2} from="up"><Text size={52} color={C.muted}>their middle: 6 cm in</Text></Appear></At>
      <At x={540} y={1100}><Appear at={tEdge1} out={tTwo - 0.2} from="fade"><Text size={46} color={C.mint}>middle on the edge below</Text></Appear></At>
      <At x={540} y={480}><Appear at={tRe + 0.2} from="pop"><Text size={66}>12 + 6 + 4 + 3 = <span style={{ color: C.amber }}>?</span></Text></Appear></At>
      <At x={540} y={1100}><Appear at={tWhole - 0.2} from="slam"><Chip color={C.ink} size={52}>a book is 24 cm</Chip></Appear></At>
      <Sfx name="pack/paper-slide" at={t12 - 0.2} volume={0.5} />
      <Sfx name="pack/paper-slide" at={t6b - 0.2} volume={0.5} />
      <Sfx name="pack/paper-slide" at={t4 - 0.1} volume={0.5} />
      <Sfx name="pack/paper-slide" at={t3 - 0.1} volume={0.5} />
    </>
  );
};

// ---------------------------------------------------------------- payoff: 25 cm, 1 cm past; more books forever
const harmonic = (n: number) => { let s = 0; for (let i = 1; i <= n; i++) s += 1 / (2 * i); return s; };
const Staircase: React.FC<{ n: number; x0: number; yBottom: number; len: number; thick: number }> = ({ n, x0, yBottom, len, thick }) => {
  const books = [];
  let right = x0;
  // bottom book's right end at x0 + len/(2n); go upwards
  const ends: number[] = [];
  let acc = 0;
  for (let k = n; k >= 1; k--) { acc += len / (2 * k); ends.push(x0 + acc); }
  for (let j = 0; j < n; j++) {
    books.push(<div key={j} style={{ position: "absolute", left: ends[j] - len, top: yBottom - thick * (j + 1), width: len, height: thick - 2, borderRadius: 3,
      background: COLORS[j % 4] }} />);
  }
  void right;
  return <>{books}</>;
};
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t25 = at.word("25", 1, 1.4);
  const tFull = at.word("centimetre", 2, 4.0);
  const tMore = at.word("More", 1, 5.6);
  const tForever = at.word("forever", 1, 7.0);
  const n = Math.round(tween(t, tMore, at.dur - 0.3, 4, 20));
  const len = 300, thick = 24, x0 = 220, yB = 1120;
  return (
    <>
      <Headline out={tMore - 0.3} color={C.amber}>25 cm out</Headline>
      <Headline at={tMore}>More books: no limit</Headline>
      {t < tMore - 0.1 && (
        <Camera keys={[[0, { zoom: 1, x: 540, y: 670 }], [tFull - 0.8, { zoom: 1, x: 540, y: 670 }], [tFull, { zoom: 1.7, x: EDGE + 10, y: 760 }]]}>
          <Stack prog={[1, 1, 1, 1]} glowTop />
          <EdgeLine x={EDGE} y0={560} y1={TOP} />
          <div style={{ position: "absolute", left: EDGE, top: TOP - THICK * 4 - 40, width: PX, height: 30, background: C.amber, borderRadius: 4 }} />
          <At x={EDGE + 10} y={TOP - THICK * 4 - 70}><Appear at={tFull - 0.2} from="pop"><Text size={30} color={C.amber}>1 cm</Text></Appear></At>
        </Camera>
      )}
      {t < tMore - 0.1 && <At x={540} y={480}><Appear at={t25 - 0.2} out={tFull - 0.9} from="slam"><Text size={80}>12 + 6 + 4 + 3 = <span style={{ color: C.amber }}>25</span></Text></Appear></At>}
      {t >= tMore - 0.1 && (
        <>
          <div style={{ position: "absolute", left: -40, top: yB, width: x0 + 40, height: 24, background: "#8a6a4a", borderRadius: "0 6px 6px 0" }} />
          <EdgeLine x={x0} y0={yB - 600} y1={yB} />
          <Staircase n={n} x0={x0} yBottom={yB} len={len} thick={thick} />
          <At x={800} y={420}><Text size={56}>{n} books</Text></At>
          <At x={800} y={500}><Text size={50} color={C.amber}>{harmonic(n).toFixed(2)} lengths out</Text></At>
          <At x={800} y={600}><Appear at={tForever} from="up"><Text size={44} color={C.muted}>each step smaller</Text></Appear></At>
        </>
      )}
      <Sfx name="pack/ding" at={t25} volume={0.45} />
      <Sfx name="pack/correct" at={tFull} volume={0.35} />
      <Sfx name="pack/counting-digital" at={tMore + 0.2} volume={0.2} dur={2.0} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const tTwo = at.word("two", 1, 1.8);
  const len = 300, thick = 24, x0 = 220, yB = 1120;
  return (
    <>
      <Headline color={C.amber}>2 whole lengths?</Headline>
      <div style={{ position: "absolute", left: -40, top: yB, width: x0 + 40, height: 24, background: "#8a6a4a", borderRadius: "0 6px 6px 0" }} />
      <EdgeLine x={x0} y0={yB - 600} y1={yB} />
      <EdgeLine x={x0 + 2 * len} y0={yB - 600} y1={yB} color={C.mint} />
      <Staircase n={20} x0={x0} yBottom={yB} len={len} thick={thick} />
      <At x={x0 + len} y={480}><Appear at={tTwo - 0.2} from="pop"><Text size={50} color={C.mint}>← 2 lengths →</Text></Appear></At>
      <At x={540} y={380}><Appear at={0.1} from="up"><Text size={64}>how many books<span style={{ color: C.amber }}>?</span></Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout" to="rule"><RuleBody /></Span>
    <Span from="top" to="rehook"><StepsBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
