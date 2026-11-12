// "How 3 extra bits fix any error": Hamming (7,4) code with three circles.
// versus hook (3 copies: 12 bits / Hamming: 7) -> same job: one flip, message back -> Bell Labs 1940s, weekend jobs dying
// -> 1011 into the overlaps -> parity: each circle even, 7 bits -> re-hook: a bit flips, the circles know
// -> B and C odd, only BC is in exactly those two, flip back -> 3 checks = 8 answers -> CTA subscribe
import React from "react";
import { Appear, At, C, Camera, Chip, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Terminal, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// ---- a bit tile
const Bit: React.FC<{ v: number | string; size?: number; bg?: string; fg?: string; ring?: string }> = ({ v, size = 70, bg = C.panel, fg = C.ink, ring }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.22, background: bg, color: fg, fontFamily: F.mono, fontSize: size * 0.62, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", border: `3px solid ${ring ?? C.dim}`, boxShadow: ring ? `0 0 26px ${ring}` : "none" }}>{v}</div>
);

const Row: React.FC<{ bits: (number | string)[]; groups?: number; size?: number; colors?: Record<number, string>; flip?: Record<number, number | string> }> = ({ bits, groups = 0, size = 66, colors = {}, flip = {} }) => (
  <div style={{ display: "flex", gap: 8, width: "max-content" }}>
    {bits.map((b, i) => (
      <div key={i} style={{ marginLeft: groups && i > 0 && i % groups === 0 ? 18 : 0 }}>
        <Bit v={flip[i] ?? b} size={size} bg={colors[i] ?? C.panel} fg={colors[i] ? C.bg : C.ink} />
      </div>
    ))}
  </div>
);

const COPIES = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1];
const HAM = [1, 0, 1, 1, 0, 1, 0]; // shown as data then parity: 1 0 1 1 | 0 1 0

// ---- the three circles
type Reg = "AB" | "AC" | "BC" | "ABC" | "A" | "B" | "C";
const POS: Record<Reg, [number, number]> = { AB: [540, 470], AC: [430, 700], BC: [650, 700], ABC: [540, 630], A: [290, 480], B: [790, 480], C: [540, 905] };
const CEN: Record<"A" | "B" | "C", [number, number]> = { A: [420, 560], B: [660, 560], C: [540, 770] };
const R = 235;
const VAL: Record<Reg, number> = { AB: 1, AC: 0, BC: 1, ABC: 1, A: 0, B: 1, C: 0 };
const RING: Record<"A" | "B" | "C", string> = { A: C.mint, B: C.amber, C: C.ink };

type CellState = { at: number; v?: number; bg?: string; fg?: string; ring?: string };
const Venn: React.FC<{ circlesAt?: number; circle?: Partial<Record<"A" | "B" | "C", { stroke?: string; fill?: string }>>; cells: Partial<Record<Reg, CellState>>; size?: number }> =
  ({ circlesAt = 0, circle = {}, cells, size = 92 }) => {
    const t = useT();
    const k = circlesAt <= 0 ? 1 : tween(t, circlesAt, circlesAt + 0.5, 0, 1);
    return (
      <>
        <svg width={1080} height={1200} style={{ position: "absolute", left: 0, top: 0 }}>
          {(["A", "B", "C"] as const).map((c) => (
            <circle key={c} cx={CEN[c][0]} cy={CEN[c][1]} r={R * (0.85 + 0.15 * k)} fill={circle[c]?.fill ?? "transparent"}
              stroke={circle[c]?.stroke ?? RING[c]} strokeWidth={8} opacity={k} />
          ))}
        </svg>
        {(Object.keys(cells) as Reg[]).map((r) => {
          const s = cells[r]!;
          const o = s.at <= 0 ? 1 : tween(t, s.at, s.at + 0.2, 0, 1);
          return (
            <At key={r} x={POS[r][0]} y={POS[r][1]} scale={0.5 + 0.5 * o}>
              <div style={{ opacity: o }}><Bit v={s.v ?? VAL[r]} size={size} bg={s.bg ?? (r.length === 1 ? C.mint : C.panel)} fg={s.fg ?? (r.length === 1 ? C.bg : C.ink)} ring={s.ring} /></div>
            </At>
          );
        })}
      </>
    );
  };
const ALL = (at = 0): Partial<Record<Reg, CellState>> => ({ AB: { at }, AC: { at }, BC: { at }, ABC: { at }, A: { at }, B: { at }, C: { at } });

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const t7 = w(["7", "seven"], 1, 2.2);
  return (
    <>
      <HookText y={300} size={96}>{"3 copies: **12 bits**\nHamming: **7 bits**"}</HookText>
      <Riser to={t7} volume={0.45} />
      <At x={540} y={640}><Text size={44} color={C.muted}>your 4 bits, sent 3 times</Text></At>
      <At x={540} y={730} style={{ width: "max-content" }}><Row bits={COPIES} groups={3} size={64} /></At>
      <At x={540} y={900}><Text size={44} color={C.muted}>Hamming's way</Text></At>
      <Punch at={t7}><At x={540} y={1000} style={{ width: "max-content" }}><Row bits={HAM} size={86} colors={{ 4: C.mint, 5: C.mint, 6: C.mint }} /></At></Punch>
      <Sfx name="pack/ding" at={t7} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- same job
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tFlip = w(["flips"], 1, 1.4), tBack = w(["back"], 1, 3.4);
  const t = useT();
  const fixed = t >= tBack;
  const bad = t >= tFlip;
  return (
    <>
      <Headline>Same job</Headline>
      <Shake at={tFlip}><At x={540} y={560} style={{ width: "max-content" }}><Row bits={COPIES} groups={3} size={64}
        colors={bad ? { 7: fixed ? C.mint : C.coral } : {}} flip={bad && !fixed ? { 7: 0 } : {}} /></At></Shake>
      <Shake at={tFlip}><At x={540} y={800} style={{ width: "max-content" }}><Row bits={HAM} size={86}
        colors={bad ? { 2: fixed ? C.mint : C.coral, 4: C.mint, 5: C.mint, 6: C.mint } : { 4: C.mint, 5: C.mint, 6: C.mint }} flip={bad && !fixed ? { 2: 0 } : {}} /></At></Shake>
      <At x={540} y={1010}><Appear at={tBack} from="pop"><Chip color={C.mint} size={54}>message back, both ways</Chip></Appear></At>
      <Sfx name="pack/glitch" at={tFlip} volume={0.35} dur={0.5} />
      <Sfx name="pack/correct" at={tBack} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- Bell Labs
const ContextBody: React.FC = () => {
  const w = useW();
  const tHam = w(["Richard"], 1, 1.8), tFix = w(["fix"], 1, 4.0), tDying = w(["dying"], 1, 6.0);
  return (
    <>
      <Headline>Bell Labs, late 1940s</Headline>
      <At x={540} y={470}><Appear at={0} from="pop"><Icon name="Server" size={150} color={C.ink} /></Appear></At>
      <At x={540} y={630}><Appear at={tHam - 0.1} from="up"><Chip color={C.amber} size={50}>Richard Hamming</Chip></Appear></At>
      <At x={540} y={900}><Appear at={tHam + 0.4} from="up"><Terminal w={860} size={44} title="relay computer, Saturday" typeAt={tHam + 0.6} cps={26}
        lines={["RUNNING YOUR JOB...", "ERROR DETECTED", "JOB ABANDONED"]} color={C.mint} /></Appear></At>
      <At x={540} y={1110}><Appear at={tDying - 0.2} from="slam"><Text size={50} color={C.coral}>spots it, can't fix it</Text></Appear></At>
      <Sfx name="pack/reboot-fail" at={Math.max(tFix, tDying - 0.6)} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 1011 into the overlaps
const CirclesBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tBits = w(["bits"], 1, 0.9), tOver = w(["overlaps"], 1, 4.2), tThree = w(["three"], 1, 4.8);
  const drop = (i: number) => tThree + 0.2 + i * 0.25;
  return (
    <>
      <At x={540} y={250} style={{ width: "max-content" }}><Appear at={tBits - 0.2} out={drop(0) - 0.1} from="down"><Row bits={[1, 0, 1, 1]} size={96} /></Appear></At>
      <Camera keys={[[0, { zoom: 1 }], [drop(3) + 0.2, { zoom: 1 }], [drop(3) + 1.0, { zoom: 1.08, x: 540, y: 650 }]]}>
        <Venn circlesAt={tOver - 0.2} cells={{ AB: { at: drop(0) }, AC: { at: drop(1) }, BC: { at: drop(2) }, ABC: { at: drop(3) } }} />
      </Camera>
      {[0, 1, 2, 3].map((i) => <Sfx key={i} name="pack/pop-2" at={drop(i)} volume={0.35} />)}
      <At x={540} y={1110}><Appear at={drop(3) + 0.3} from="fade" sfx={null}><Text size={44} color={C.muted}>4 data bits in the overlaps</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- parity: make every circle even
const ParityBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tEven = w(["even"], 1, 2.2), tExtra = w(["extra"], 1, 4.2), tAll = w(["all"], 1, 5.2);
  const tA = 0.8, tB = (tA + tEven) / 2 + 0.6, tC = tEven + 0.4;
  const cur = t < tB ? "A" : t < tC ? "B" : t < tExtra - 0.2 ? "C" : "";
  const note: Record<string, string> = { A: "circle A: two 1s → add 0", B: "circle B: three 1s → add 1", C: "circle C: two 1s → add 0" };
  const fill = (c: "A" | "B" | "C") => (cur === c ? { fill: `${RING[c]}22` } : {});
  return (
    <>
      <Camera keys={[[0, { zoom: 1.08, x: 540, y: 650 }], [tExtra - 0.3, { zoom: 1.08, x: 540, y: 650 }], [tExtra + 0.3, { zoom: 0.92, x: 540, y: 620 }]]}>
        <Venn circle={{ A: fill("A"), B: fill("B"), C: fill("C") }}
          cells={{ AB: { at: 0 }, AC: { at: 0 }, BC: { at: 0 }, ABC: { at: 0 }, A: { at: tA + 0.4 }, B: { at: tB + 0.4 }, C: { at: tC + 0.4 } }} />
      </Camera>
      <At x={540} y={230}>{cur ? <Text size={50} color={RING[cur as "A"]}>{note[cur]}</Text> : null}</At>
      <At x={540} y={1110} style={{ width: "max-content" }}><Appear at={tAll - 0.4} from="slam"><div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <Row bits={HAM} size={62} colors={{ 4: C.mint, 5: C.mint, 6: C.mint }} /><Chip color={C.amber} size={50}>7 bits</Chip></div></Appear></At>
      <Sfx name="pack/click-soft" at={tA + 0.4} volume={0.35} />
      <Sfx name="pack/click-soft" at={tB + 0.4} volume={0.35} />
      <Sfx name="pack/click-soft" at={tC + 0.4} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook: a bit flips
const RehookBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tFlip = w(["flips"], 1, 0.7), tWhich = w(["which"], 1, 1.8), tDo = w(["do"], 2, 2.8);
  const flipped = t >= tFlip;
  const cells = ALL(0);
  cells.BC = { at: 0, v: flipped ? 0 : 1, bg: flipped ? C.panel : C.panel };
  return (
    <>
      <Headline color={C.amber}>One bit flips. Which?</Headline>
      <Shake at={tFlip}><Venn cells={cells} circle={t > tDo ? { A: { fill: `${C.mint}18` }, B: { fill: `${C.amber}18` }, C: { fill: `${C.ink}14` } } : {}} /></Shake>
      <At x={540} y={1110}><Appear at={tWhich} from="pop"><Text size={84} color={C.muted}>?</Text></Appear></At>
      <Sfx name="pack/glitch-2" at={tFlip} volume={0.35} dur={0.5} />
    </>
  );
};

// ---------------------------------------------------------------- find it: B and C odd
const FindBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tOdd = w(["odd"], 1, 1.2), tOnly = w(["Only"], 1, 1.8), tTwo = w(["two"], 2, 3.4), tFlip = w(["Flip"], 1, 4.0);
  const fixed = t >= tFlip + 0.2;
  const cells = ALL(0);
  cells.BC = { at: 0, v: fixed ? 1 : 0, bg: fixed ? C.amber : t >= tTwo - 0.2 ? C.panel : C.panel, fg: fixed ? C.bg : C.ink, ring: t >= tTwo - 0.2 && !fixed ? C.amber : undefined };
  const odd = t >= tOdd - 0.1 && !fixed;
  return (
    <>
      <Camera keys={[[0, { zoom: 1 }], [tOnly, { zoom: 1 }], [tTwo, { zoom: 1.12, x: 600, y: 680 }], [tFlip + 0.8, { zoom: 1.12, x: 600, y: 680 }], [tFlip + 1.4, { zoom: 1 }]]}>
        <Venn cells={cells} circle={odd ? { B: { stroke: C.coral, fill: `${C.coral}22` }, C: { stroke: C.coral, fill: `${C.coral}22` } } : {}} />
      </Camera>
      <At x={540} y={230}><Appear at={tOdd - 0.2} from="pop"><div style={{ display: "flex", gap: 20 }}>
        <Chip color={C.mint} size={46}>A even</Chip><Chip color={C.coral} size={46}>B odd</Chip><Chip color={C.coral} size={46}>C odd</Chip></div></Appear></At>
      <At x={540} y={1110}><Appear at={tFlip} from="slam"><Chip color={C.amber} size={54}>flip it back: fixed</Chip></Appear></At>
      <Sfx name="pack/wrong" at={tOdd} volume={0.3} />
      <Sfx name="pack/correct" at={tFlip + 0.2} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- payoff: 3 checks = 8 answers
const ANS: [string, string][] = [["none", "no error"], ["A", "A only"], ["B", "B only"], ["C", "C only"], ["A B", "AB"], ["A C", "AC"], ["B C", "BC"], ["A B C", "middle"]];
const PayoffBody: React.FC = () => {
  const w = useW();
  const t8 = w(["8", "eight"], 1, 1.6), tNo = w(["no"], 1, 2.4), tWhy = w(["why"], 1, 4.6), tAll = w(["7", "seven"], 2, 6.0);
  return (
    <>
      <Headline>3 checks, 8 answers</Headline>
      <At x={540} y={420}><Appear at={0} from="pop"><Text size={80} font={F.mono}>2 × 2 × 2 = <span style={{ color: C.amber }}>8</span></Text></Appear></At>
      {ANS.map(([odd, spot], i) => (
        <At key={i} x={i % 2 === 0 ? 300 : 780} y={560 + Math.floor(i / 2) * 108}>
          <Appear at={(i === 0 ? tNo : t8 + 0.15 * i) - 0.1} from="pop" sfx={i === 0 ? undefined : null}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: F.bold, fontSize: 50, whiteSpace: "nowrap", width: "max-content" }}>
              <span style={{ color: odd === "none" ? C.mint : C.coral, minWidth: 190, textAlign: "right" }}>{odd === "none" ? "all even" : odd + " odd"}</span>
              <span style={{ color: C.muted }}>→</span>
              <span style={{ color: odd === "none" ? C.mint : C.amber }}>{spot}</span>
            </div>
          </Appear>
        </At>
      ))}
      <At x={540} y={1100}><Appear at={tWhy} from="slam"><Chip color={C.amber} size={54}>3 extra bits cover all 7</Chip></Appear></At>
      <Sfx name="pack/ding" at={t8} volume={0.35} />
      <Sfx name="pack/hit-grand" at={tAll} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tThree = w(["three"], 1, 1.8);
  return (
    <>
      <At x={540} y={420} style={{ width: "max-content" }}><Appear at={0} from="pop"><Row bits={COPIES} groups={3} size={64} /></Appear></At>
      <At x={540} y={520}><Text size={44} color={C.muted}>12 bits</Text></At>
      <At x={540} y={720} style={{ width: "max-content" }}><Appear at={0.2} from="pop"><Row bits={HAM} size={86} colors={{ 4: C.mint, 5: C.mint, 6: C.mint }} /></Appear></At>
      <At x={540} y={830}><Text size={44} color={C.amber}>7 bits</Text></At>
      <At x={540} y={1040}><Appear at={tThree - 0.3} from="fade" sfx={null}><Text size={44} color={C.muted}>Hamming, Bell Labs, 1950</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="circles"><CirclesBody /></Span>
    <Span from="parity"><ParityBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="find"><FindBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
