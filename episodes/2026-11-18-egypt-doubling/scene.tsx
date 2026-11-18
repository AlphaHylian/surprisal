// "How to multiply anything with no times table": Egyptian doubling multiplication.
// claim hook (13 x 24, no times table) -> only doubling and adding -> Egypt, 3,500+ years ago
// -> doubling table 1/24 .. 8/192 -> stop before 16 -> re-hook: which rows make 13? -> tick 8, 4, 1
// -> add 192 + 96 + 24 = 312 -> payoff: one split into doubles = binary, chips still do it -> CTA 11 x 15?
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};
const Big: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = C.ink, size = 96 }) => (
  <div style={{ fontFamily: F.bold, fontSize: size, color, whiteSpace: "nowrap" }}>{children}</div>
);

// ---------------------------------------------------------------- the doubling table
type RowState = "plain" | "tick" | "skip" | "bad";
const ROWS: [number, number][] = [[1, 24], [2, 48], [4, 96], [8, 192]];
const TY = 420, TS = 145, LX = 370, RX = 710;
const Table: React.FC<{ rows?: [number, number][]; times?: number[]; states?: (t: number) => RowState[]; tickAt?: number[]; extra?: { at: number; strike?: number } }> =
  ({ rows = ROWS, times = [0, 0, 0, 0], states, tickAt, extra }) => {
  const t = useT();
  const st = states ? states(t) : rows.map(() => "plain" as RowState);
  const all: [number, number][] = extra ? [...rows, [16, 384]] : rows;
  return (
    <>
      <div style={{ position: "absolute", left: 540 - 2, top: TY - 60, width: 4, height: (all.length) * TS - 20, background: C.dim, opacity: tween(t, 0, 0.3, 0, 1) }} />
      {all.map(([l, r], i) => {
        const isExtra = i >= rows.length;
        const at = isExtra ? extra!.at : times[i];
        const s: RowState = isExtra ? "bad" : st[i];
        const y = TY + i * TS;
        const col = s === "tick" ? C.amber : s === "skip" ? C.dim : s === "bad" ? C.coral : C.ink;
        const glow = s === "tick";
        const strike = isExtra && extra!.strike !== undefined ? tween(t, extra!.strike, extra!.strike + 0.35, 0, 1) : 0;
        return (
          <React.Fragment key={i}>
            <At x={540} y={y}><Appear at={at} from="left" sfx={null}>
              <div style={{ position: "relative", width: 760, height: 120, borderRadius: 28, background: glow ? "#2a2410" : C.panel,
                border: `4px solid ${glow ? C.amber : s === "bad" ? C.coral : C.dim}`, opacity: s === "skip" ? 0.45 : 1 }}>
                <div style={{ position: "absolute", left: LX - 540 + 380 - 130, top: 18, width: 260, textAlign: "center" }}><Text size={72} color={col} font={F.mono}>{l}</Text></div>
                <div style={{ position: "absolute", left: RX - 540 + 380 - 150, top: 18, width: 300, textAlign: "center" }}><Text size={72} color={col} font={F.mono}>{r}</Text></div>
                {strike > 0 && <div style={{ position: "absolute", left: 20, top: 56, height: 9, width: `${strike * 95}%`, background: C.coral, borderRadius: 5 }} />}
              </div>
            </Appear></At>
            {tickAt && !isExtra && tickAt[i] >= 0 && (
              <At x={980} y={y}><Appear at={tickAt[i]} from="pop" sfx={null}><Icon name="Check" size={84} color={C.amber} stroke={3} /></Appear></At>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
const Labels: React.FC = () => (
  <>
    <At x={LX} y={TY - 95}><Text size={42} color={C.muted}>count</Text></At>
    <At x={RX} y={TY - 95}><Text size={42} color={C.muted}>× 24</Text></At>
  </>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tTable = w(["table"], 1, 2.2);
  return (
    <>
      <HookText y={250} size={86}>{"13 × 24, **no times table**"}</HookText>
      <Riser to={tTable} volume={0.45} />
      <Camera keys={[[0, { zoom: 1 }], [tTable + 0.4, { zoom: 1.07 }]]}>
        <At x={540} y={700}>
          <div style={{ width: 760, height: 520, borderRadius: 30, background: "#2b2416", border: `5px solid ${C.amber}55`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <Big size={150}>13 × 24</Big>
            <Big size={110} color={C.amber}>= ?</Big>
          </div>
        </At>
        <At x={540} y={1080}><Appear at={0} from="fade" sfx={null}>
          <div style={{ display: "flex", gap: 30, alignItems: "center", opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 4)) }}>
            <Text size={50} color={C.coral}>×</Text><Text size={46} color={C.muted}>no 7 × 8, no 9 × 6</Text>
          </div>
        </Appear></At>
      </Camera>
      <Sfx name="pack/paper-slide" at={0.05} volume={0.3} />
      <Sfx name="pack/hmm" at={tTable} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tCalc = w(["calculator"], 1, 0.4), tDoub = w(["doubling"], 1, 2.6), tAdd = w(["adding"], 1, 3.4);
  const strike = tween(t, tCalc + 0.2, tCalc + 0.6, 0, 1);
  return (
    <>
      <Headline>Only two moves</Headline>
      <At x={540} y={530}><Appear at={tCalc - 0.3} from="pop">
        <div style={{ position: "relative" }}>
          <Icon name="Calculator" size={200} color={C.muted} />
          <div style={{ position: "absolute", left: -20, top: 95, height: 12, width: `${strike * 120}%`, background: C.coral, borderRadius: 6, transform: "rotate(-30deg)", transformOrigin: "left center" }} />
        </div>
      </Appear></At>
      <At x={330} y={900}><Appear at={tDoub - 0.3} from="slam"><Chip color={C.mint} size={70}>× 2</Chip></Appear></At>
      <At x={750} y={900}><Appear at={tAdd - 0.3} from="slam"><Chip color={C.mint} size={70}>+</Chip></Appear></At>
      <At x={330} y={1030}><Appear at={tDoub} from="fade" sfx={null}><Text size={46} color={C.muted}>double</Text></Appear></At>
      <At x={750} y={1030}><Appear at={tAdd} from="fade" sfx={null}><Text size={46} color={C.muted}>add</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- context
const ContextBody: React.FC = () => {
  const w = useW();
  const tEgypt = w(["Egypt"], 1, 0.1), tJob = w(["job"], 1, 2.0), t13 = w(["13"], 1, 2.6);
  return (
    <>
      <Headline>Egypt, 3,500+ years ago</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t13, { zoom: 1.1 }]]}>
        <At x={540} y={600}><Appear at={Math.max(0.05, tEgypt)} from="drop"><Icon name="ScrollText" size={260} color={C.amber} /></Appear></At>
        <At x={540} y={900}><Appear at={tJob - 0.2} from="up"><Text size={50} color={C.muted}>your job</Text></Appear></At>
        <At x={540} y={1030}><Appear at={t13 - 0.2} from="slam"><Big size={120}>13 × 24</Big></Appear></At>
      </Camera>
      <Sfx name="pack/paper-flip" at={tEgypt + 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- step 1: double
const DoubleBody: React.FC = () => {
  const w = useW();
  const times = [w(["1"], 2, 1.0) - 0.2, w(["48"], 1, 3.6) - 0.5, w(["96"], 1, 4.8) - 0.5, w(["192"], 1, 6.0) - 0.5];
  return (
    <>
      <Headline>Step 1: double, double</Headline>
      <Labels />
      <Table times={times} />
      {times.map((tt, i) => <Sfx key={i} name="pack/pop" at={tt + 0.1} volume={0.25} />)}
      {times.slice(1).map((tt, i) => (
        <At key={i} x={130} y={TY + (i + 0.5) * TS}><Appear at={tt - 0.1} from="fade" sfx={null}><Text size={40} color={C.mint}>×2</Text></Appear></At>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- step 2: stop
const StopBody: React.FC = () => {
  const w = useW();
  const t13 = w(["13"], 1, 2.2), t16 = w(["16"], 1, 3.6);
  return (
    <>
      <Headline>Step 2: stop before 13</Headline>
      <Labels />
      <Table extra={{ at: t16 - 0.3, strike: t16 + 0.6 }} />
      <At x={540} y={TY + 4 * TS + 125}><Appear at={t16 + 0.6} from="pop" sfx={null}><Text size={46} color={C.coral}>16 is bigger than 13</Text></Appear></At>
      <Sfx name="pack/wrong" at={t16 + 0.6} volume={0.25} />
      <Sfx name="pack/whoosh-soft" at={t13} volume={0.2} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const w = useW();
  const t13 = w(["13"], 1, 2.6);
  return (
    <>
      <Headline color={C.amber}>Which rows make 13?</Headline>
      <Labels />
      <Table />
      <Punch at={t13}><At x={540} y={TY + 4 * TS + 40}><Appear at={t13 - 0.3} from="slam"><Chip color={C.amber} size={64}>? + ? + ? = 13</Chip></Appear></At></Punch>
    </>
  );
};

// ---------------------------------------------------------------- step 3: tick
const TickBody: React.FC = () => {
  const w = useW();
  const t8 = w(["8"], 1, 0.8), t4 = w(["4"], 1, 1.5), t1 = w(["1"], 1, 2.2), tSkip = w(["Skip"], 1, 3.8);
  const ticks = [t1, -1, t4, t8];
  return (
    <>
      <Headline>Step 3: tick 8, 4, 1</Headline>
      <Labels />
      <Table tickAt={ticks} states={(t) => ROWS.map((_, i) => (i === 1 ? (t >= tSkip - 0.2 ? "skip" : "plain") : t >= ticks[i] ? "tick" : "plain"))} />
      <At x={540} y={TY + 4 * TS + 40}><Appear at={t1 + 0.3} from="up"><Big size={90} color={C.amber}>8 + 4 + 1 = 13</Big></Appear></At>
      {[t8, t4, t1].map((tt, i) => <Sfx key={i} name="pack/click-hard" at={tt} volume={0.3} />)}
    </>
  );
};

// ---------------------------------------------------------------- step 4: add
const AddBody: React.FC = () => {
  const w = useW();
  const t192 = w(["192"], 1, 1.6), t96 = w(["96"], 1, 2.4), t24 = w(["24"], 1, 3.1), t312 = w(["312"], 1, 4.0), tAgain = w(["312"], 2, 6.4);
  return (
    <>
      <Headline>Step 4: add the right side</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t312, { zoom: 1 }], [t312 + 0.6, { zoom: 1.04 }]]}>
        <At x={540} y={440}><Appear at={t192 - 0.3} from="right"><Big size={100} color={C.amber}>192</Big></Appear></At>
        <At x={540} y={570}><Appear at={t96 - 0.3} from="right"><Big size={100} color={C.amber}>+ 96</Big></Appear></At>
        <At x={540} y={700}><Appear at={t24 - 0.3} from="right"><Big size={100} color={C.amber}>+ 24</Big></Appear></At>
        <At x={540} y={790}><Appear at={t312 - 0.4} from="fade" sfx={null}><div style={{ width: 420, height: 8, background: C.ink, borderRadius: 4 }} /></Appear></At>
        <Punch at={t312}><At x={540} y={900}><Appear at={t312 - 0.3} from="slam"><Counter from={0} to={312} t0={t312 - 0.3} t1={t312 + 0.3} size={150} color={C.amber} /></Appear></At></Punch>
        <At x={540} y={1090}><Appear at={tAgain - 0.5} from="up"><Chip color={C.mint} size={60}>13 × 24 = 312 ✓</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/correct" at={tAgain} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- payoff: binary
const PayoffBody: React.FC = () => {
  const w = useW();
  const tWay = w(["way"], 1, 3.6), tBin = w(["binary"], 1, 4.8), tChip = w(["chip"], 1, 6.6);
  const bits: [number, string][] = [[8, "1"], [4, "1"], [2, "0"], [1, "1"]];
  return (
    <>
      <Headline>One way to split. Always.</Headline>
      <At x={540} y={450}><Appear at={0.05} from="up"><Big size={96}>13 = 8 + 4 + 1</Big></Appear></At>
      {bits.map(([v, b], i) => (
        <React.Fragment key={v}>
          <At x={270 + i * 180} y={640}><Appear at={tWay - 0.2 + i * 0.12} from="fade" sfx={null}><Text size={44} color={C.muted} font={F.mono}>{v}</Text></Appear></At>
          <At x={270 + i * 180} y={760}><Appear at={tBin - 0.3 + i * 0.12} from="pop"><Big size={130} color={b === "1" ? C.amber : C.dim}><span style={{ fontFamily: F.mono }}>{b}</span></Big></Appear></At>
        </React.Fragment>
      ))}
      <At x={540} y={900}><Appear at={tBin + 0.2} from="fade" sfx={null}><Text size={50} color={C.mint}>binary: 1101</Text></Appear></At>
      <At x={540} y={1060}><Appear at={tChip - 0.4} from="pop"><div style={{ display: "flex", gap: 24, alignItems: "center" }}><Icon name="Cpu" size={110} color={C.mint} /><Text size={50}>shift and add</Text></div></Appear></At>
      <Sfx name="pack/digits" at={tBin - 0.3} volume={0.3} dur={0.8} />
      <Sfx name="pack/hit-grand" at={tBin} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CTA_ROWS: [number, number][] = [[1, 15], [2, 30], [4, 60], [8, 120]];
const CtaBody: React.FC = () => {
  const w = useW();
  const t11 = w(["11"], 1, 0.8), tTick = w(["tick"], 1, 2.6);
  return (
    <>
      <At x={540} y={250}><Appear at={0.05} from="up"><Big size={100} color={C.amber}>11 × 15 = ?</Big></Appear></At>
      <Table rows={CTA_ROWS} times={[0.05, 0.2, 0.35, Math.min(0.5, t11)]} />
      <At x={540} y={TY + 4 * TS + 40}><Appear at={tTick - 0.3} from="pop"><Text size={56} color={C.amber}>Which rows do you tick?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="double"><DoubleBody /></Span>
    <Span from="stop"><StopBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="tick"><TickBody /></Span>
    <Span from="add"><AddBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
