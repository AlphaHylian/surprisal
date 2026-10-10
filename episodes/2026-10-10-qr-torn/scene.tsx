// "Why a QR code still scans with 30% scratched off". Claim hook (scratched QR, still scans) -> rule
// out the camera guessing -> message 3 and 5 as a line -> 4 points, 2 spares -> scratch two, rebuild ->
// re-hook (a smudge lies) -> 6 points, true line gets 4 votes, outvoted -> real QR bytes (9 + 17) ->
// fixes 8 -> payoff (logo in the middle) -> Reed-Solomon 1960 -> CTA tied to "camera guessing".
import React from "react";
import {
  Appear, At, C, Camera, Chip, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- QR picture
/** Deterministic pseudo-random 21x21 QR-like grid with the three corner finder squares. */
const rnd = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const finder = (r: number, c: number) => {
  const inBox = (r0: number, c0: number) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
  for (const [r0, c0] of [[0, 0], [0, 14], [14, 0]]) {
    if (inBox(r0, c0)) {
      const rr = r - r0, cc = c - c0;
      const ring = Math.max(Math.abs(rr - 3), Math.abs(cc - 3));
      return ring === 3 || ring <= 1 ? 1 : 0;
    }
    // white separator around each finder
    if (r >= r0 - 1 && r <= r0 + 7 && c >= c0 - 1 && c <= c0 + 7) return 0;
  }
  return -1;
};
const QR: React.FC<{ size?: number; scratch?: number; logo?: boolean; scan?: number }> = ({ size = 560, scratch = 0, logo = false, scan = -1 }) => {
  const n = 21, m = size / (n + 2);
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const f = finder(r, c);
    const on = f === -1 ? rnd(r * 31 + c * 7 + 3) > 0.5 : f === 1;
    if (on) cells.push(<rect key={`${r}-${c}`} x={(c + 1) * m} y={(r + 1) * m} width={m + 0.5} height={m + 0.5} fill={C.bg} />);
  }
  // the scratch: a rough band across the middle-right, about 30% of the data area
  const sw = size * 0.62 * scratch;
  return (
    <svg width={size} height={size} style={{ filter: "drop-shadow(0 18px 40px #000a)" }}>
      <rect x={0} y={0} width={size} height={size} rx={18} fill={C.ink} />
      {cells}
      {scratch > 0 ? (
        <g>
          <path d={`M ${size * 0.3} ${size * 0.36} L ${size * 0.3 + sw} ${size * 0.3} L ${size * 0.3 + sw} ${size * 0.74} L ${size * 0.3} ${size * 0.8} Z`}
            fill={C.muted} opacity={0.96} />
          {[0.42, 0.5, 0.58, 0.66].map((yy, i) => (
            <line key={i} x1={size * 0.3} y1={size * (yy - 0.02)} x2={size * 0.3 + sw} y2={size * (yy - 0.06)} stroke={C.ink} strokeWidth={4} opacity={0.35} />
          ))}
        </g>
      ) : null}
      {logo ? (
        <g>
          <rect x={size * 0.36} y={size * 0.36} width={size * 0.28} height={size * 0.28} rx={20} fill={C.ink} />
          <rect x={size * 0.39} y={size * 0.39} width={size * 0.22} height={size * 0.22} rx={16} fill={C.amber} />
        </g>
      ) : null}
      {scan >= 0 && scan <= 1 ? (
        <rect x={size * 0.04} y={size * (0.04 + 0.9 * scan)} width={size * 0.92} height={8} fill={C.green} opacity={0.9}
          style={{ filter: `drop-shadow(0 0 14px ${C.green})` }} />
      ) : null}
    </svg>
  );
};

// ---------------------------------------------------------------- the plot of the line
// x 0..5 -> px 200..900, y 0..30 -> py 960..420
const PX = (x: number) => 200 + x * 140;
const PY = (y: number) => 960 - y * 18;
type Pt = { x: number; y: number; show: number; col?: string; gone?: number; label?: string };
const Plot: React.FC<{ pts: Pt[]; lines?: { a: number; b: number; t0: number; col: string; dash?: boolean; x0?: number; x1?: number; out?: number }[] }> = ({ pts, lines = [] }) => {
  const t = useT();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <line x1={PX(0) - 30} y1={PY(0)} x2={PX(5) + 40} y2={PY(0)} stroke={C.muted} strokeWidth={4} opacity={0.6} />
      {lines.map((L, i) => {
        if (t < L.t0 || (L.out !== undefined && t > L.out)) return null;
        const x0 = L.x0 ?? -0.2, x1 = L.x1 ?? 5.2;
        const k = tween(t, L.t0, L.t0 + 0.6, 0, 1);
        const xe = x0 + (x1 - x0) * k;
        return <line key={i} x1={PX(x0)} y1={PY(L.a + L.b * x0)} x2={PX(xe)} y2={PY(L.a + L.b * xe)} stroke={L.col} strokeWidth={10}
          strokeLinecap="round" strokeDasharray={L.dash ? "24 20" : undefined} style={{ filter: `drop-shadow(0 0 12px ${L.col}88)` }} />;
      })}
      {pts.map((p, i) => {
        if (t < p.show) return null;
        const gone = p.gone !== undefined && t >= p.gone;
        const s = tween(t, p.show, p.show + 0.25, 0.3, 1);
        const col = p.col ?? C.amber;
        return (
          <g key={i} opacity={gone ? 0.18 : 1}>
            <circle cx={PX(p.x)} cy={PY(p.y)} r={24 * s} fill={gone ? "none" : col} stroke={col} strokeWidth={5} />
            <text x={PX(p.x) - 40} y={PY(p.y) - 38} fill={col} fontFamily={F.mono} fontSize={56} textAnchor="middle">{p.label ?? p.y}</text>
          </g>
        );
      })}
    </svg>
  );
};

/** A row of number boxes. */
const Row: React.FC<{ vals: (number | string)[]; cols: string[]; show: number[]; size?: number; crossed?: boolean[] }> = ({ vals, cols, show, size = 120, crossed = [] }) => {
  const t = useT();
  return (
    <div style={{ display: "flex", gap: 18 }}>
      {vals.map((v, i) => (
        <div key={i} style={{ width: size, height: size, borderRadius: 18, border: `5px solid ${cols[i]}`, background: C.panel,
          display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
          opacity: t >= show[i] ? 1 : 0, transform: `scale(${tween(t, show[i], show[i] + 0.25, 0.6, 1)})` }}>
          <span style={{ fontFamily: F.mono, fontSize: size * 0.45, color: cols[i] }}>{v}</span>
          {crossed[i] ? <div style={{ position: "absolute", inset: 8, background: C.muted, borderRadius: 10, opacity: 0.95 }} /> : null}
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tScans = at.word("scans", 1, 2.2);
  const scan = tween(t, 0.3, tScans, 0, 1);
  return (
    <>
      <HookText>{"**30%** scratched off.\nStill scans."}</HookText>
      <Riser to={tScans} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06 }]]}>
        <At x={540} y={780}><QR size={600} scratch={1} scan={t < tScans + 0.1 ? scan : -1} /></At>
        <At x={540} y={1120}>
          <Appear at={tScans} from="pop" sfx="pack/correct" volume={0.5}><Chip color={C.green} size={60}>✓ scanned</Chip></Appear>
        </At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tGuess = at.word("guessing", 1, 1.2);
  const tBuilt = at.word("built", 1, 2.4);
  return (
    <>
      <At x={540} y={700}><QR size={460} scratch={1} /></At>
      <At y={330}>
        <Appear at={0.02} from="left">
          <div style={{ position: "relative" }}>
            <Chip color={C.panel} text={C.ink} size={58}>the camera guesses</Chip>
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%" }}>
              <Appear at={tGuess + 0.1} from="slam"><div style={{ height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-3deg)", boxShadow: `0 0 20px ${C.coral}` }} /></Appear>
            </div>
          </div>
        </Appear>
      </At>
      <Punch at={tBuilt}>
        <At x={540} y={1060}><Appear at={tBuilt} from="pop" sfx="pack/suspense-sting" volume={0.4}><Chip size={58}>built to rebuild</Chip></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 3. the line and its spares
const LineBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tLine = at.beat("line");
  const tClimb = at.word("climb", 1, tLine + 2.0);
  const t8 = at.word("8", 1, tLine + 3.4);
  const t13 = at.word("13", 1, tLine + 3.9);
  const t18 = at.word("18", 1, tLine + 4.4);
  const tSpare = at.beat("spare");
  const tSpares = at.word("spares", 1, tSpare + 1.6);
  const t3 = at.word("3", 1, 1.6);
  const t5 = at.word("5", 1, 2.3);
  const pts: Pt[] = [
    { x: 0, y: 3, show: tLine + 0.6 }, { x: 1, y: 8, show: t8 }, { x: 2, y: 13, show: t13, col: C.amber }, { x: 3, y: 18, show: t18 },
  ];
  const spareCol = t >= tSpares ? C.mint : C.amber;
  return (
    <>
      <Headline out={tLine - 0.3}>Your message</Headline>
      <Headline at={tLine} out={tSpare - 0.3}>Make it a line</Headline>
      <Headline at={tSpare} out={at.dur - 0.3} color={C.mint}>Print all four</Headline>
      {t < tLine ? (<>
        <At x={540} y={480}><Appear at={0.02} from="pop"><QR size={240} /></Appear></At>
        <At x={540} y={640}><Appear at={0.3} from="down"><Icon name="ArrowDown" size={90} color={C.muted} /></Appear></At>
        <At x={540} y={860}>
          <div style={{ display: "flex", gap: 40 }}>
            <Appear at={t3} from="pop"><Text size={220} font={F.mono} color={C.amber}>3</Text></Appear>
            <Appear at={t5} from="pop"><Text size={220} font={F.mono} color={C.amber}>5</Text></Appear>
          </div>
        </At>
        <At x={540} y={860}><Appear at={0.5} out={t3 - 0.05} from="fade"><Text size={220} font={F.mono} color={C.dim}>? ?</Text></Appear></At>
      </>) : (
        <>
          <Plot pts={pts.map((p, i) => ({ ...p, col: i >= 2 ? spareCol : C.amber }))} lines={[{ a: 3, b: 5, t0: tClimb, col: C.ink, x1: 3.3 }]} />
          <At x={540} y={1070}>
            <Row vals={[3, 8, 13, 18]} cols={[C.amber, C.amber, spareCol, spareCol]} show={[tLine + 0.6, t8, t13, t18]} size={100} />
          </At>
          <At x={720} y={480}><Appear at={tClimb} out={tSpare} from="up"><Chip color={C.panel} text={C.ink} size={48}>+5 each step</Chip></Appear></At>
          <At x={300} y={480}><Appear at={tSpares} from="pop"><Chip color={C.mint} size={52}>2 spares</Chip></Appear></At>
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------- 4. scratch two, rebuild
const RebuildBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tGone = at.word("scratch", 1, 0.5) + 0.3;
  const tReb = at.beat("rebuild");
  const tLine = at.word("line", 1, tReb + 1.8);
  const tBack = at.word("back", 1, tReb + 2.8);
  const tCome = at.word("come", 1, tReb + 4.0);
  const back = t >= tCome;
  const pts: Pt[] = [
    { x: 0, y: 3, show: -1, gone: tGone, col: C.amber }, { x: 1, y: 8, show: -1 }, { x: 2, y: 13, show: -1, gone: tGone, col: C.amber }, { x: 3, y: 18, show: -1 },
  ].map((p) => (back && p.gone !== undefined ? { ...p, gone: undefined, col: C.green } : p));
  return (
    <>
      <Headline out={tReb - 0.3} color={C.coral}>Scratch out two</Headline>
      <Headline at={tReb} out={at.dur - 0.3} color={C.green}>Rebuilt</Headline>
      <Shake at={tGone}>
        <Plot pts={pts} lines={[{ a: 3, b: 5, t0: tLine, col: C.mint, x0: 3.3, x1: 0.9 }, { a: 3, b: 5, t0: tBack, col: C.mint, x0: 1, x1: -0.2 }]} />
        <At x={540} y={1070}>
          <Row vals={[3, 8, 13, 18]} cols={[back ? C.green : C.amber, C.amber, back ? C.green : C.mint, C.mint]} show={[-1, -1, -1, -1]} size={100}
            crossed={[t >= tGone && !back, false, t >= tGone && !back, false]} />
        </At>
      </Shake>
      <Sfx name="pack/paper-rip" hit={tGone} volume={0.5} />
      <Sfx name="pack/rewind-tape" at={tBack} volume={0.35} />
      <Sfx name="pack/correct" at={tCome} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 5. re-hook: a smudge lies; 6 points vote
const VoteBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tChanges = at.word("changes", 1, 1.8);
  const tWhich = at.word("which", 1, 3.5);
  const tSix = at.beat("six");
  const tReal = at.word("real", 1, tSix + 1.4);
  const tNo = at.word("no", 1, tSix + 3.0);
  const tOut = at.beat("outvote");
  const tCost = at.word("costs", 1, tOut + 2.0);
  // six points; 13 smudged to 9 (x=2), 28 smudged to 20 (x=5)
  const smudged = t >= tChanges;
  const six = t >= tSix;
  const pts: Pt[] = [
    { x: 0, y: 3, show: -1 }, { x: 1, y: 8, show: -1 },
    { x: 2, y: smudged ? 9 : 13, show: -1, col: smudged ? C.coral : C.amber, label: smudged ? "9" : "13" },
    { x: 3, y: 18, show: -1 },
    { x: 4, y: 23, show: tSix + 0.3 },
    { x: 5, y: six ? 20 : 28, show: tSix + 0.5, col: C.coral, label: "20" },
  ];
  return (
    <>
      <Headline out={tSix - 0.3} color={C.coral}>A smudge lies</Headline>
      <Headline at={tSix} out={tOut - 0.3}>Print 6 points</Headline>
      <Headline at={tOut} out={at.dur - 0.3} color={C.mint}>Outvoted</Headline>
      <Plot pts={pts} lines={[
        // a wrong candidate through the two smudged points: fewer votes
        { a: 5 / 3, b: 11 / 3, t0: tNo, col: C.coral, dash: true, x0: -0.2, x1: 5.2 },
        { a: 3, b: 5, t0: tReal, col: C.mint, x0: -0.2, x1: 5.2 },
      ]} />
      <At x={540} y={1050}>
        <div style={{ display: "flex", gap: 24 }}>
          <Appear at={tReal + 0.4} from="up"><Chip color={C.mint} size={50}>4 votes</Chip></Appear>
          <Appear at={tNo + 0.4} from="up"><Chip color={C.coral} size={50}>3 at most</Chip></Appear>
        </div>
      </At>
      <At x={540} y={1050}>
        <Appear at={tCost - 0.1} from="slam"><div style={{ background: C.bg, padding: 8, borderRadius: 20 }}><Chip size={56}>1 wrong number = 2 spares</Chip></div></Appear>
      </At>
      <At x={540} y={360}><Appear at={tWhich} out={tSix - 0.2} from="pop" sfx="pack/hmm" volume={0.4}><Text size={64} color={C.coral}>which one?</Text></Appear></At>
      <Sfx name="pack/glitch-2" at={tChanges} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 6. real QR bytes
const BytesBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t26 = at.word("26", 1, 2.6);
  const t9 = at.word("9", 1, 3.4);
  const t17 = at.word("17", 1, 4.4);
  const tFix = at.beat("fix8");
  const t8 = at.word("8", 1, tFix + 0.8);
  const t30 = at.word("30%", 1, tFix + 2.0);
  const bad = new Set([2, 5, 11, 14, 17, 20, 22, 25]);  // 8 wrong bytes, spread out
  const cols = 6;
  const shown = (i: number) => t >= t26 - 0.3 + i * 0.03;
  return (
    <>
      <Headline out={tFix - 0.3}>The smallest QR code</Headline>
      <Headline at={tFix} out={at.dur - 0.3} color={C.green}>8 wrong, all fixed</Headline>
      <At x={250} y={640}><Appear at={0.02} from="left"><QR size={300} /></Appear></At>
      <Camera keys={[[0, { zoom: 1 }], [tFix, { zoom: 1 }], [tFix + 0.5, { zoom: 1.05 }]]}>
        <At x={700} y={640}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 72px)`, gap: 10 }}>
            {Array.from({ length: 26 }, (_, i) => {
              const msg = i < 9;
              const col = msg ? C.amber : C.mint;
              const lit = msg ? t >= t9 : t >= t17;
              const wrong = bad.has(i) && t >= t8 && t < t30;
              const fixed = bad.has(i) && t >= t30;
              return (
                <div key={i} style={{ width: 72, height: 72, borderRadius: 12, opacity: shown(i) ? 1 : 0,
                  background: wrong ? C.coral : fixed ? C.green : lit ? col : C.dim, border: `3px solid ${wrong ? C.coral : col}55` }} />
              );
            })}
          </div>
        </At>
      </Camera>
      <At x={540} y={1040}>
        <div style={{ display: "flex", gap: 24 }}>
          <Appear at={t9} out={tFix} from="up"><Chip size={50}>9 message</Chip></Appear>
          <Appear at={t17} out={tFix} from="up"><Chip color={C.mint} size={50}>17 spares</Chip></Appear>
        </div>
      </At>
      <Punch at={t30}>
        <At x={540} y={1040}><Appear at={t30 - 0.1} from="slam"><Chip size={64}>≈ 30% can go bad</Chip></Appear></At>
      </Punch>
      <Sfx name="pack/glitch" at={t8} volume={0.4} />
      <Sfx name="pack/correct" at={t30 + 0.1} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 7. payoff + reveal
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tLogo = at.word("logo", 1, 1.0);
  const tPhone = at.word("phone", 1, 3.6);
  const tRev = at.beat("reveal");
  const tReed = at.word("reed-solomon", 1, tRev + 1.2) || tRev + 1.2;
  return (
    <>
      <Headline at={tRev} out={at.dur - 0.3} color={C.amber}>Reed–Solomon, 1960</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tRev, { zoom: 1.04 }], [tRev + 0.5, { zoom: 0.92 }]]}>
        <At x={540} y={720}><QR size={560} logo={t >= tLogo} scan={t >= tPhone - 0.6 && t < tPhone + 0.2 ? tween(t, tPhone - 0.6, tPhone + 0.2, 0, 1) : -1} /></At>
        <At x={540} y={720}><Appear at={tLogo} from="pop"><Icon name="Coffee" size={110} color={C.bg} stroke={2.6} /></Appear></At>
        <At x={540} y={1100}><Appear at={tPhone + 0.2} from="pop" sfx="pack/correct" volume={0.45}><Chip color={C.green} size={56}>✓ still reads</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/swell-brass" at={tReed} volume={0.3} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const tGuess = at.word("guessing", 1, 2.2);
  return (
    <>
      <At y={540}><Appear at={0} from="up"><Text size={76}>Subscribe if you thought</Text></Appear></At>
      <At y={700}>
        <Appear at={tGuess - 0.6} from="pop">
          <div style={{ position: "relative" }}>
            <Chip color={C.panel} text={C.ink} size={60}>the camera was guessing</Chip>
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-4deg)" }} />
          </div>
        </Appear>
      </At>
      <At x={540} y={950}><Appear at={0.2} from="fade"><QR size={260} scratch={1} /></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="context" to="spare"><LineBody /></Span>
    <Span from="scratch" to="rebuild"><RebuildBody /></Span>
    <Span from="rehook" to="outvote"><VoteBody /></Span>
    <Span from="real" to="fix8"><BytesBody /></Span>
    <Span from="payoff" to="reveal"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
