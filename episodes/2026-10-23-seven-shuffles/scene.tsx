// "Why you have to shuffle a deck 7 times": Bayer & Diaconis (1992), rising runs and the cutoff at seven riffles.
// claim hook (not shuffled until 7 riffles) -> rule out: 3 riffles look random -> number the cards 1-52, riffle ->
// each half keeps its order: 2 climbing runs -> riffle again: at most 4, then 8, 16, 32 -> re-hook: a random deck has
// about 26 runs, is 5 enough? -> distance from random: 92%, 61%, 33%, then halves -> payoff: the drop lands at seven,
// Bayer and Diaconis 1992 -> CTA subscribe.
import React from "react";
import {
  Appear, At, Bar, C, Camera, Chip, Counter, F, HookText, Headline, Punch, Riser, Sfx, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- a deterministic riffle (Gilbert-Shannon-Reeds)
const N = 52;
const mkRng = (seed: number) => () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const riffle = (deck: number[], rng: () => number, cut?: number) => {
  const c = cut ?? deck.filter(() => rng() < 0.5).length;
  const L = deck.slice(0, c), R = deck.slice(c);
  const out: number[] = [];
  let i = 0, j = 0;
  while (i < L.length || j < R.length) {
    const a = L.length - i, b = R.length - j;
    if (rng() < a / (a + b)) out.push(L[i++]); else out.push(R[j++]);
  }
  return out;
};
const runOf = (deck: number[]) => {             // run index of each card value (rising sequences)
  const pos: number[] = [];
  deck.forEach((v, i) => { pos[v] = i; });
  const run: number[] = [];
  let r = 0;
  for (let v = 1; v <= N; v++) { if (v > 1 && pos[v] < pos[v - 1]) r++; run[v] = r; }
  return { run, count: r + 1 };
};
const rng = mkRng(2310);
const D0 = Array.from({ length: N }, (_, i) => i + 1);
const D1 = riffle(D0, rng, 26);
const D2 = riffle(D1, rng);
const D3 = riffle(D2, rng);
const RUN_COLORS = [C.mint, C.amber, C.coral, "#8fb8ff", "#d39bff", "#ffd27a", "#7fe0c9", "#ff9e9e"];

const CW = 64, CH = 92, GAP = 8;
const Deck: React.FC<{ deck: number[]; colored?: boolean; show?: number; y?: number; dim?: boolean }> = ({ deck, colored = false, show = 0, y = 740, dim = false }) => {
  const t = useT();
  const { run } = runOf(deck);
  const w = 13 * CW + 12 * GAP, h = 4 * CH + 3 * GAP;
  return (
    <div style={{ position: "absolute", left: 540 - w / 2, top: y - h / 2, width: w, height: h }}>
      {deck.map((v, i) => {
        const o = tween(t, show + i * 0.008, show + 0.15 + i * 0.008, 0, 1);
        const col = colored ? RUN_COLORS[run[v] % RUN_COLORS.length] : C.ink;
        return (
          <div key={i} style={{ position: "absolute", left: (i % 13) * (CW + GAP), top: Math.floor(i / 13) * (CH + GAP), width: CW, height: CH,
            borderRadius: 10, background: colored ? `${col}26` : C.panel, border: `3px solid ${colored ? col : C.dim}`, opacity: o * (dim ? 0.45 : 1),
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.bold, fontSize: 34, color: colored ? col : C.ink }}>{v}</div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t7 = at.word("7", 1, 2.2);
  return (
    <>
      <HookText size={96}>{"Riffle it **7 times**\nor it's not shuffled"}</HookText>
      <Riser to={t7} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05 }]]}>
        <Deck deck={D3} colored show={0} y={760} />
        <At x={540} y={1060}><Appear at={0} from="pop"><Chip size={56} color={C.coral}>3 riffles: 8 runs, still in order</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/paper-flip" at={0.3} volume={0.35} />
      <Sfx name="pack/ding" at={t7} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out: 3 riffles look random
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tClose = at.word("nowhere", 1, 1.6);
  return (
    <>
      <Headline>3 riffles</Headline>
      <Deck deck={D3} show={0} y={700} />
      <At x={540} y={1030}><Appear at={tClose - 0.2} from="slam"><Stamp size={76} rotate={-5}>NOT RANDOM</Stamp></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 3-4. number the cards, one riffle: two climbing runs
const OneRiffleBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t52 = at.word("52,", 1, 1.6);
  const tRiffle = at.word("riffle", 1, 3.6);
  const tRuns = at.beat("runs");
  const tTwo = at.word("two", 1, tRuns + 1.8);
  const t27 = at.word("27,", 1, tRuns + 4.4);
  const riffled = t >= tRiffle - 0.1;
  return (
    <>
      <Headline out={tRuns - 0.3}>{riffled ? "One riffle" : "Number every card"}</Headline>
      <Headline at={tRuns} color={C.amber}>Two climbing runs</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tTwo, { zoom: 1 }], [t27 - 0.4, { zoom: 1.6, x: 380, y: 590 }]]}>
        {riffled ? <Deck deck={D1} colored={t >= tTwo - 0.2} show={tRiffle - 0.1} y={700} /> : <Deck deck={D0} show={0.1} y={700} />}
      </Camera>
      <At x={290} y={1060}><Appear at={tTwo - 0.1} from="left"><Chip size={50} color={C.mint}>1, 2, 3...</Chip></Appear></At>
      <At x={790} y={1060}><Appear at={t27 - 0.2} from="right"><Chip size={50}>27, 28, 29...</Chip></Appear></At>
      <Sfx name="pack/counting-digital" at={t52 - 0.6} dur={0.8} volume={0.25} />
      <Sfx name="pack/paper-flip" at={tRiffle} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 5. riffle again: 4, then 8, 16, 32
const DoubleBody: React.FC = () => {
  const at = useAt();
  const t4 = at.word("4", 1, 1.2);
  const t8 = at.word("8,", 1, 2.2);
  const t16 = at.word("16,", 1, 2.7);
  const t32 = at.word("32.", 1, 3.2);
  return (
    <>
      <Headline>At most double the runs</Headline>
      <Deck deck={D2} colored show={0.05} y={640} />
      <At x={540} y={1010}>
        <div style={{ display: "flex", gap: 34, alignItems: "baseline" }}>
          {[[2, 0.05], [4, t4], [8, t8], [16, t16], [32, t32]].map(([n, tt], i) => (
            <Appear key={i} at={tt - 0.15} from="pop"><Text size={i === 4 ? 100 : 80} color={i === 4 ? C.amber : C.ink}>{n}</Text></Appear>
          ))}
        </div>
      </At>
      <At x={540} y={1110}><Appear at={0.2} from="fade"><Text size={42} color={C.muted}>runs after 1, 2, 3, 4, 5 riffles</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 6. re-hook: a random deck has about 26 runs
const RehookBody: React.FC = () => {
  const at = useAt();
  const t26 = at.word("26", 1, 1.6);
  const t5 = at.word("5", 1, 3.0);
  return (
    <>
      <Headline>A truly random deck</Headline>
      <At x={540} y={620}>
        <Appear at={t26 - 0.2} from="slam">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Counter from={0} to={26} t0={t26 - 0.2} t1={t26 + 0.4} size={220} color={C.amber} />
            <Text size={50} color={C.muted}>runs, on average</Text>
          </div>
        </Appear>
      </At>
      <Punch at={t5}>
        <At x={540} y={980}><Appear at={t5 - 0.2} from="pop"><Text size={84} color={C.ink} glow>5 riffles = 32 runs. Enough?</Text></Appear></At>
      </Punch>
      <Sfx name="pack/hmm" at={t5 + 0.4} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 7. distance from random: 92, 61, 33, then halves
const MeasureBody: React.FC = () => {
  const at = useAt();
  const t5 = at.word("Five", 1, 2.4);
  const t6 = at.word("Six:", 1, 3.8);
  const t7 = at.word("Seven:", 1, 5.0);
  const tHalves = at.word("halves", 1, 6.6);
  const rows: [string, number, number, string][] = [["4", 1.0, 0.1, C.coral], ["5", 0.924, t5, C.coral], ["6", 0.614, t6, C.amber],
    ["7", 0.334, t7, C.mint], ["8", 0.167, tHalves - 0.1, C.mint], ["9", 0.085, tHalves + 0.15, C.mint]];
  return (
    <>
      <Headline>Distance from random</Headline>
      {rows.map(([k, v, tt, col], i) => (
        <At key={k} x={540} y={470 + i * 112}>
          <Appear at={tt - 0.2} from="left">
            <div style={{ display: "flex", alignItems: "center", gap: 24, width: 940 }}>
              <Text size={50} color={C.muted} style={{ width: 70 }}>{k}×</Text>
              <Bar to={v} t0={tt - 0.1} t1={tt + 0.5} w={620} h={56} color={col} />
              <Text size={50} color={k === "7" ? C.amber : C.ink} style={{ width: 150 }}>{Math.round(v * 100)}%</Text>
            </div>
          </Appear>
        </At>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- 8. payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tSeven = at.word("seven.", 1, 2.0);
  const tBayer = at.word("Bayer", 1, 3.0);
  return (
    <>
      <Camera keys={[[0, { zoom: 1.05 }], [at.dur, { zoom: 1 }]]}>
        <Punch at={tSeven}>
          <At x={540} y={600}><Appear at={tSeven - 0.2} from="slam"><Text size={360} color={C.amber} glow>7</Text></Appear></At>
        </Punch>
        <At x={540} y={830}><Appear at={tSeven} from="fade"><Text size={50} color={C.ink}>riffles</Text></Appear></At>
        <At x={540} y={1010}><Appear at={tBayer - 0.3} from="up"><Text size={48} color={C.muted}>Dave Bayer & Persi Diaconis, 1992</Text></Appear></At>
      </Camera>
      <At x={540} y={360}><Appear at={0.05} from="down"><Text size={54} color={C.ink}>the drop comes all at once</Text></Appear></At>
      <Sfx name="reveal" at={tSeven - 0.2} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 9. CTA: subscribe (loops to the hook's 3-riffle deck)
const CtaBody: React.FC = () => {
  const at = useAt();
  const tThree = at.word("three", 1, 1.4);
  return (
    <>
      <Deck deck={D3} colored show={0.05} y={700} />
      <At x={540} y={1060}><Appear at={tThree - 0.2} from="pop"><Chip size={56} color={C.coral}>3 riffles</Chip></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="setup" to="runs"><OneRiffleBody /></Span>
    <Span from="double"><DoubleBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="measure"><MeasureBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
