// "How a JPEG deletes 90% of your photo": color subsampling + 8x8 DCT + rounding + end-of-block.
// claim hook (90% deleted, looks the same) -> not smaller, not fewer pixels -> 12 MP = 36 million bytes
// -> split brightness / color -> color at half x half, half gone -> 8x8 blocks, 64 patterns -> re-hook
// -> round fine stripes: 52 of 64 zero in this real block -> EOB code -> 36 MB -> 3.6 MB -> CTA subscribe
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// ---------------------------------------------------------------- a procedural "photo": sunset over hills
const N = 32;
const rgbAt = (i: number, j: number): [number, number, number] => {
  const x = (i + 0.5) / N, y = (j + 0.5) / N;
  const hill = 0.68 + 0.08 * Math.sin(x * 7 + 1) + 0.04 * Math.sin(x * 17);
  const sun = Math.hypot(x - 0.62, y - 0.42);
  if (y > hill) { const d = (y - hill) * 3; return [40 + 30 * d, 90 - 20 * d + 15 * Math.sin(i * 1.7 + j), 70 - 10 * d]; }
  if (sun < 0.12) return [255, 214 - sun * 300, 120];
  const g = y / hill;
  return [250 - 120 * (1 - g) + 20 * Math.exp(-sun * 6), 120 + 60 * g - 30 * (1 - g), 140 + 60 * (1 - g) - 70 * g];
};
const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
const lum = ([r, g, b]: [number, number, number]) => 0.299 * r + 0.587 * g + 0.114 * b;
// mode: full color, brightness only, color only (fixed brightness), coarse color (2x2)
type Mode = "full" | "luma" | "chroma" | "coarse";
const Photo: React.FC<{ size?: number; mode?: Mode; grid8?: number; hiBlock?: number }> = ({ size = 640, mode = "full", grid8 = 0, hiBlock = 0 }) => {
  const c = size / N;
  const cells: React.ReactNode[] = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
    let [r, g, b] = mode === "coarse" ? rgbAt(i - (i % 2) + 0.5, j - (j % 2) + 0.5) : rgbAt(i, j);
    if (mode === "luma") { const l = lum([r, g, b]); r = g = b = l; }
    if (mode === "chroma" || mode === "coarse") { const l = lum([r, g, b]); const k = 150 - l; r += k; g += k; b += k; }
    cells.push(<rect key={j * N + i} x={i * c} y={j * c} width={c + 0.5} height={c + 0.5} fill={`rgb(${clamp(r)},${clamp(g)},${clamp(b)})`} />);
  }
  const lines: React.ReactNode[] = [];
  if (grid8 > 0) for (let k = 0; k <= N; k += 8) {
    lines.push(<line key={"v" + k} x1={k * c} y1={0} x2={k * c} y2={size} stroke={C.ink} strokeWidth={4} opacity={grid8} />);
    lines.push(<line key={"h" + k} x1={0} y1={k * c} x2={size} y2={k * c} stroke={C.ink} strokeWidth={4} opacity={grid8} />);
  }
  return (
    <svg width={size} height={size} style={{ borderRadius: 18, boxShadow: "0 18px 50px #000a" }}>
      {cells}{lines}
      {hiBlock > 0 ? <rect x={16 * c} y={8 * c} width={8 * c} height={8 * c} fill="none" stroke={C.amber} strokeWidth={8} opacity={hiBlock} /> : null}
    </svg>
  );
};
// 8x8 DCT basis patterns
const Basis: React.FC<{ cell?: number; t0?: number; hi?: number }> = ({ cell = 76, t0 = 0, hi = 0 }) => {
  const t = useT();
  const tiles: React.ReactNode[] = [];
  for (let v = 0; v < 8; v++) for (let u = 0; u < 8; u++) {
    const show = t >= t0 + (u + v) * 0.06;
    const fine = u + v >= 5;
    const px: React.ReactNode[] = [];
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const val = Math.cos(((2 * x + 1) * u * Math.PI) / 16) * Math.cos(((2 * y + 1) * v * Math.PI) / 16);
      const g = clamp(128 + 120 * val);
      px.push(<rect key={y * 8 + x} x={(x * (cell - 6)) / 8} y={(y * (cell - 6)) / 8} width={(cell - 6) / 8 + 0.4} height={(cell - 6) / 8 + 0.4} fill={`rgb(${g},${g},${g})`} />);
    }
    tiles.push(
      <svg key={v * 8 + u} x={u * cell} y={v * cell} width={cell - 6} height={cell - 6} opacity={show ? (hi && fine ? 0.35 + 0.65 * (0.5 + 0.5 * Math.cos(t * 8)) : 1) : 0}>{px}</svg>
    );
  }
  return <svg width={cell * 8} height={cell * 8}>{tiles}</svg>;
};
// a real 8x8 block from a photo: DCT coefficients before and after rounding (verify step, cat-on-snow photo)
const BEFORE = [[-57, 5, -25, -18, -6, 2, 7, 0], [5, -28, 7, 14, 7, 0, 0, -1], [-1, 15, 4, -3, 5, 0, -5, 1], [-10, -6, -5, 1, 0, 5, 0, -1], [4, 0, 0, -8, 0, 0, 0, 0], [-4, -4, 0, 0, 0, 0, 0, 1], [4, 0, 5, 6, 0, -8, 0, 0], [-5, 0, 0, 0, 0, 0, 0, 0]];
const AFTER = [[-7, 1, -5, -2, 0, 0, 0, 0], [1, -5, 1, 1, 1, 0, 0, 0], [0, 2, 0, 0, 0, 0, 0, 0], [-1, -1, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
// zigzag order
const ZZ: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let s = 0; s < 15; s++) {
    const d: [number, number][] = [];
    for (let r = 0; r < 8; r++) { const c = s - r; if (c >= 0 && c < 8) d.push([r, c]); }
    out.push(...(s % 2 === 0 ? d.reverse() : d));
  }
  return out;
})();
const LAST = ZZ.reduce((m, [r, c], k) => (AFTER[r][c] !== 0 ? k : m), 0);
const Matrix: React.FC<{ roundAt?: number; eobAt?: number; cell?: number }> = ({ roundAt = 1e9, eobAt = 1e9, cell = 104 }) => {
  const t = useT();
  return (
    <div style={{ position: "relative", width: cell * 8, height: cell * 8 }}>
      {ZZ.map(([r, c], k) => {
        const rt = roundAt + (r + c) * 0.12;
        const done = t >= rt;
        const v = done ? AFTER[r][c] : BEFORE[r][c];
        const zero = done && v === 0;
        const eob = t >= eobAt && k > LAST;
        return (
          <div key={k} style={{ position: "absolute", left: c * cell, top: r * cell, width: cell - 6, height: cell - 6, borderRadius: 10,
            background: eob ? `${C.amber}33` : zero ? "#1b202b" : "#2a3140", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: F.mono, fontSize: 40, color: zero ? (eob ? C.amber : C.dim) : C.ink }}>{v}</div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const t90 = w(["90%", "90"], 1, 1.2), tTell = w(["tell."], 1, 2.6);
  return (
    <>
      <HookText y={250} size={96}>{"**90%** deleted.\nLooks the same."}</HookText>
      <Riser to={t90} volume={0.45} />
      <Camera keys={[[0, { zoom: 1 }], [tTell + 0.6, { zoom: 1.04 }]]}>
        <At x={540} y={700}><Appear at={0} from="pop"><Photo size={520} /></Appear></At>
        <At x={540} y={1040}><Appear at={0} from="up" sfx={null}><div style={{ fontFamily: F.bold, fontSize: 70, color: C.ink, whiteSpace: "nowrap" }}>
          <span style={{ color: C.muted, textDecoration: "line-through" }}>36 MB</span> → <span style={{ color: C.amber }}>3.6 MB</span></div></Appear></At>
      </Camera>
      <Sfx name="pack/data-erased" at={t90} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tShrink = w(["shrink"], 1, 0.8), tDrop = w(["drop"], 1, 2.0), tEyes = w(["eyes"], 1, 4.0);
  return (
    <>
      <Headline>Not smaller. Not fewer.</Headline>
      <At x={540} y={640}><Appear at={0.05} from="pop"><Photo size={440} /></Appear></At>
      <At x={300} y={940}><Appear at={tShrink} from="pop"><Chip color={C.coral} size={46}>✗ shrink it</Chip></Appear></At>
      <At x={780} y={940}><Appear at={tDrop} from="pop"><Chip color={C.coral} size={46}>✗ drop pixels</Chip></Appear></At>
      <At x={540} y={1080}><Appear at={tEyes - 0.3} from="slam"><Chip color={C.amber} size={52}>deletes what your eyes miss</Chip></Appear></At>
      <Sfx name="pack/wrong" at={tDrop} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- context: 36 million bytes
const ContextBody: React.FC = () => {
  const w = useW();
  const t12 = w(["12"], 1, 0.6), t36 = w(["36"], 1, 2.2), tRed = w(["red,"], 1, 3.4);
  return (
    <>
      <Headline>Your photo, raw</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tRed - 0.3, { zoom: 1 }], [tRed + 0.5, { zoom: 1.08, x: 540, y: 560 }]]}>
        <At x={540} y={560}><Appear at={0.05} from="fade"><Photo size={420} /></Appear></At>
      </Camera>
      <At x={540} y={830}><Appear at={t12 - 0.2} from="up"><Text size={56} color={C.muted}>12,000,000 pixels × 3 bytes</Text></Appear></At>
      <At x={540} y={940}><Appear at={tRed - 0.2} from="pop"><div style={{ display: "flex", gap: 20 }}>
        <Chip color="#ff6b6b" size={48}>R</Chip><Chip color={C.mint} size={48}>G</Chip><Chip color="#6b9bff" size={48}>B</Chip></div></Appear></At>
      <At x={540} y={1080}><Counter from={0} to={36000000} t0={t36 - 0.4} t1={t36 + 0.8} size={84} suffix=" bytes" color={C.amber} /></At>
    </>
  );
};

// ---------------------------------------------------------------- split brightness / color
const SplitBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tSplit = w(["split"], 1, 0.6), tBright = w(["brightness."], 1, 3.2), tColor = w(["color."], 2, 4.6);
  const k = tween(t, tSplit, tSplit + 0.8, 0, 1);
  return (
    <>
      <Headline>Brightness | color</Headline>
      <At x={540 - 250 * k} y={640}><Photo size={400} mode={k > 0.5 ? "luma" : "full"} /></At>
      <At x={540 + 250 * k} y={640}><div style={{ opacity: k }}><Photo size={400} mode="chroma" /></div></At>
      <At x={290} y={900}><Appear at={tBright - 0.6} from="up"><Chip color={C.mint} size={46}>sharp detail: seen</Chip></Appear></At>
      <At x={790} y={900}><Appear at={tColor - 0.6} from="up"><Chip color={C.muted} size={46}>detail: barely</Chip></Appear></At>
      <Sfx name="pack/swoosh" at={tSplit} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- color at half x half
const ColorBody: React.FC = () => {
  const w = useW();
  const tHalf = w(["half"], 1, 0.8), t4 = w(["4"], 1, 2.8), tGone = w(["gone."], 1, 4.4);
  const coarse = useT() > tHalf;
  return (
    <>
      <Headline>Color: 1 per 4 pixels</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tHalf, { zoom: 1 }], [tHalf + 0.6, { zoom: 1.08, x: 540, y: 620 }]]}>
        <At x={540} y={620}><Photo size={480} mode={coarse ? "coarse" : "chroma"} /></At>
      </Camera>
      <At x={540} y={975}><Appear at={t4 - 0.3} from="pop"><div style={{ display: "grid", gridTemplateColumns: "60px 60px", gap: 6 }}>
        {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 60, height: 60, borderRadius: 8, background: "#c98a7a" }} />)}</div></Appear></At>
      <Punch at={tGone}><At x={540} y={1110}><Appear at={tGone - 0.3} from="slam"><Chip color={C.amber} size={56}>half the file, gone</Chip></Appear></At></Punch>
      <Sfx name="pack/data-erased" at={tGone} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 8x8 blocks, 64 patterns
const BlocksBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t8 = w(["8"], 1, 1.0), tRe = w(["rewrite"], 1, 2.6), t64 = w(["64"], 1, 3.8), tFine = w(["fine"], 1, 5.4);
  const g = tween(t, t8 - 0.2, t8 + 0.4, 0, 1);
  const showBasis = t > tRe - 0.2;
  return (
    <>
      <Headline>{showBasis ? "64 patterns" : "8 × 8 blocks"}</Headline>
      {!showBasis ? (
        <At x={540} y={660}><Photo size={560} mode="luma" grid8={g} hiBlock={g} /></At>
      ) : (
        <At x={540} y={680}><Basis cell={76} t0={tRe - 0.2} /></At>
      )}
      <At x={540} y={1090}><Appear at={tFine - 0.4} from="up"><Text size={50} color={C.muted}>flat ↖ … ↘ fine stripes</Text></Appear></At>
      <Sfx name="pack/click-mech" at={t8} volume={0.3} />
      <Sfx name="pack/digits" at={t64 - 0.3} volume={0.25} dur={1} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const w = useW();
  const tRuth = w(["ruthless"], 1, 2.2);
  return (
    <>
      <Headline color={C.amber}>Nothing lost… yet</Headline>
      <At x={540} y={700}><Basis cell={70} hi={1} /></At>
      <At x={540} y={1090}><Appear at={tRuth - 0.2} from="slam"><Stamp color={C.coral} size={80}>NEXT: RUTHLESS</Stamp></Appear></At>
      <Sfx name="pack/suspense-sting" at={tRuth} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- round: 52 of 64 to zero
const RoundBody: React.FC = () => {
  const w = useW();
  const tRound = w(["Round"], 1, 0.4), t40 = w(["40"], 1, 4.6), tZero = w(["zero."], 1, 5.6);
  return (
    <>
      <Headline>Round off the stripes</Headline>
      <At x={540} y={680}><Matrix roundAt={tRound + 0.3} cell={92} /></At>
      <At x={540} y={1120}><Appear at={t40 - 0.3} from="slam"><Chip color={C.amber} size={56}>this block: 52 of 64 → 0</Chip></Appear></At>
      <Sfx name="pack/glitch" at={tRound + 0.5} volume={0.2} />
      <Sfx name="pack/correct" at={tZero} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- pack: end of block
const PackBody: React.FC = () => {
  const w = useW();
  const tCode = w(["code"], 1, 0.8), tRest = w(["rest"], 1, 1.8);
  return (
    <>
      <Headline>"The rest is zero"</Headline>
      <At x={540} y={680}><Matrix roundAt={-10} eobAt={tRest - 0.2} cell={92} /></At>
      <At x={540} y={1120}><Appear at={tCode - 0.2} from="pop"><Chip color={C.amber} size={56}>1 short code: END OF BLOCK</Chip></Appear></At>
      <Sfx name="pack/click-hard" at={tRest} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t36 = 2.2, tTenth = w(["tenth."], 1, 2.6), tSame = w(["same."], 1, 4.0);
  const bw = tween(t, 0.4, t36 + 0.2, 860, 86);
  return (
    <>
      <Headline>A tenth</Headline>
      <div style={{ position: "absolute", left: 110, top: 400, width: 860, height: 70, borderRadius: 16, background: C.dim }} />
      <div style={{ position: "absolute", left: 110, top: 400, width: bw, height: 70, borderRadius: 16, background: C.amber }} />
      <At x={540} y={540}><Text size={60}>{t > t36 ? "3.6 MB" : "36 MB"}</Text></At>
      <At x={300} y={850}><Appear at={tTenth - 0.6} from="left"><Photo size={380} /></Appear></At>
      <At x={780} y={850}><Appear at={tTenth - 0.4} from="right"><Photo size={380} mode="coarse" /></Appear></At>
      <At x={540} y={1110}><Appear at={tSame - 0.4} from="slam"><Chip color={C.mint} size={56}>looks the same</Chip></Appear></At>
      <Sfx name="pack/kaching" at={t36} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tSmall = w(["smaller."], 1, 2.2);
  return (
    <>
      <At x={540} y={620}><Photo size={460} /></At>
      <At x={540} y={1000}><Appear at={tSmall - 0.4} from="pop"><Text size={64} color={C.muted}>just made it smaller?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="split"><SplitBody /></Span>
    <Span from="color"><ColorBody /></Span>
    <Span from="blocks"><BlocksBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="round"><RoundBody /></Span>
    <Span from="pack"><PackBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
