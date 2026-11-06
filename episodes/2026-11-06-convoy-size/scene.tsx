// "Why one big convoy beat four small ones": Blackett's convoy-size analysis.
// claim hook (4 small vs 1 big) -> rule out hiding: four convoys = four targets -> 1942 rule 40/60
// -> squares: edge 80 vs 40 -> escorts twice as close -> re-hook: the one that gets in? -> a few of 100, not of 25
// -> payoff: 32 ships 2.5%, 54 ships 1.1%, 100-ship convoys by 1943 -> CTA: 400 ships, edge x?
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Text, tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- pieces
const Ship: React.FC<{ s: number; color?: string }> = ({ s, color = C.ink }) => (
  <div style={{ width: s * 0.62, height: s * 0.36, borderRadius: `${s * 0.18}px ${s * 0.3}px ${s * 0.3}px ${s * 0.18}px`, background: color }} />
);
// k x k convoy centred on (cx, cy), ship spacing s; `hot` = indices drawn coral; optional edge outline
const Fleet: React.FC<{ k: number; cx: number; cy: number; s: number; hot?: Set<number>; edge?: string; edgeAt?: number; show?: number; stagger?: number }> =
  ({ k, cx, cy, s, hot, edge, edgeAt = 1e9, show = -1, stagger = 0 }) => {
    const t = useT();
    const half = (k * s) / 2;
    const eo = tween(t, edgeAt, edgeAt + 0.35, 0, 1);
    return (
      <>
        {Array.from({ length: k * k }, (_, i) => {
          const r = Math.floor(i / k), c = i % k;
          if (t < show + (stagger * i) / (k * k)) return null;
          return (
            <div key={i} style={{ position: "absolute", left: cx - half + c * s + s / 2, top: cy - half + r * s + s / 2, transform: "translate(-50%, -50%)" }}>
              <Ship s={s} color={hot?.has(i) ? C.coral : C.ink} />
            </div>
          );
        })}
        {edge && eo > 0 && (
          <div style={{ position: "absolute", left: cx - half - 6, top: cy - half - 6, width: 2 * half + 12, height: 2 * half + 12,
            border: `6px solid ${edge}`, borderRadius: 8, opacity: eo }} />
        )}
      </>
    );
  };
// n escorts spread evenly around the edge of a square of half-size h centred on (cx, cy)
const Escorts: React.FC<{ n: number; cx: number; cy: number; h: number; at: number; color?: string; size?: number }> = ({ n, cx, cy, h, at, color = C.mint, size = 26 }) => {
  const t = useT();
  if (t < at) return null;
  const P = 8 * h;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        let d = ((i + 0.5) / n) * P;
        let x = 0, y = 0;
        const side = 2 * h;
        if (d < side) { x = -h + d; y = -h; } else if ((d -= side) < side) { x = h; y = -h + d; } else if ((d -= side) < side) { x = h - d; y = h; } else { d -= side; x = -h; y = h - d; }
        const o = tween(t, at + i * 0.03, at + i * 0.03 + 0.2, 0, 1);
        return <div key={i} style={{ position: "absolute", left: cx + x * 1.18 - size / 2, top: cy + y * 1.18 - size / 2, width: size, height: size,
          transform: "rotate(45deg)", background: color, opacity: o }} />;
      })}
    </>
  );
};

// layout: four 5x5 blocks (left) and one 10x10 (right)
const S = 26;                       // ship spacing
const SMALL = [[180, 690], [350, 690], [180, 860], [350, 860]];
const BIG = { x: 760, y: 775 };

const FourAndOne: React.FC<{ edgeAt?: number; smallEdge?: string; bigEdge?: string; show?: number }> = ({ edgeAt, smallEdge, bigEdge, show = -1 }) => (
  <>
    {SMALL.map(([x, y], i) => <Fleet key={i} k={5} cx={x} cy={y} s={S} edge={smallEdge} edgeAt={edgeAt} show={show} />)}
    <Fleet k={10} cx={BIG.x} cy={BIG.y} s={S} edge={bigEdge} edgeAt={edgeAt} show={show} />
  </>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tSafer = at.word("safer", 1, 1.2);
  const tFour = at.word("four", 1, 2.2);
  return (
    <>
      <HookText>{"4 small convoys?\n**1 big one is safer.**"}</HookText>
      <Riser to={tSafer} volume={0.45} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06 }]]}>
        <FourAndOne />
        <At x={265} y={1040}><Appear at={tFour - 0.2} from="up"><Text size={48} color={C.coral}>4 × 25 ships</Text></Appear></At>
        <At x={760} y={1040}><Punch at={tSafer}><Appear at={tSafer - 0.1} from="pop"><Text size={48} color={C.amber}>1 × 100 ships</Text></Appear></Punch></At>
      </Camera>
      <Sfx name="pack/hit-glass-suspense" hit={tSafer} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rule out: four targets
const RuleBody: React.FC = () => {
  const at = useAt();
  const tFinds = at.word("finds", 1, 1.8);
  const tFour = at.word("four", 2, 4.6);
  return (
    <>
      <Headline color={C.coral}>Hiding doesn't help</Headline>
      <FourAndOne />
      <At x={760} y={775}><Appear at={tFinds - 0.1} from="pop"><Icon name="Crosshair" size={150} color={C.coral} stroke={2.5} /></Appear></At>
      {SMALL.map(([x, y], i) => (
        <At key={i} x={x} y={y}><Appear at={tFour - 0.2 + i * 0.12} from="pop"><Icon name="Crosshair" size={100} color={C.coral} stroke={2.5} /></Appear></At>
      ))}
      <At x={265} y={1040}><Appear at={tFour + 0.4} from="slam"><Chip color={C.coral} size={48}>4 targets</Chip></Appear></At>
      <At x={760} y={1040}><Appear at={tFour + 0.6} from="slam"><Chip color={C.mint} size={48}>1 target</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- context: the rule
const ContextBody: React.FC = () => {
  const at = useAt();
  const t40 = at.word("40", 1, 2.0);
  const t60 = at.word("60", 1, 3.4);
  return (
    <>
      <Headline>The Atlantic, 1942</Headline>
      <At x={540} y={500}><Appear at={0} from="fade" sfx={null}><Icon name="Ship" size={190} color={C.muted} /></Appear></At>
      <At x={300} y={780}><Appear at={t40 - 0.2} from="slam"><Text size={160} color={C.mint}>40</Text></Appear></At>
      <At x={300} y={920}><Appear at={t40} from="up"><Text size={50} color={C.muted}>ships: "best"</Text></Appear></At>
      <At x={780} y={780}><Appear at={t60 - 0.2} from="slam"><Text size={160} color={C.coral}>60</Text></Appear></At>
      <At x={780} y={920}><Appear at={t60} from="up"><Text size={50} color={C.muted}>the limit</Text></Appear></At>
      <At x={540} y={1080}><Appear at={t60 + 0.5} from="up"><Text size={44} color={C.muted}>the navy's rule</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- square + escorts
const SquareBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tEsc = at.beat("escorts");
  const t25 = at.word("25", 1, 2.0);
  const t80 = at.word("80", 1, 3.4);
  const t40 = at.word("40", 1, 5.6);
  const tSame = at.word("Same", 1, tEsc + 1.4);
  const tTwice = at.word("twice", 1, tEsc + 3.2);
  const tThin = at.word("thin", 1, tEsc + 5.5);
  return (
    <>
      <Headline out={tEsc - 0.3}>Count the edge</Headline>
      <Headline at={tEsc} color={C.mint}>Same escorts, half the edge</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tEsc, { zoom: 1 }], [tEsc + 0.8, { zoom: 1.04 }]]}>
        {SMALL.map(([x, y], i) => <Fleet key={i} k={5} cx={x} cy={y} s={S} edge={C.coral} edgeAt={t25 + i * 0.12} />)}
        <Fleet k={10} cx={BIG.x} cy={BIG.y} s={S} edge={C.mint} edgeAt={Math.min(t40, tEsc - 0.4) - 0.3} />
        {SMALL.map(([x, y], i) => <Escorts key={i} n={4} cx={x} cy={y} h={(5 * S) / 2} at={tSame + i * 0.1} color={C.amber} size={22} />)}
        <Escorts n={16} cx={BIG.x} cy={BIG.y} h={(10 * S) / 2} at={tSame + 0.3} color={C.amber} size={22} />
      </Camera>
      {t < tSame + 0.5 && (
        <>
          <At x={265} y={1060}><Appear at={t80 - 0.2} from="pop"><Text size={56} color={C.coral}>edge 80</Text></Appear></At>
          <At x={760} y={1060}><Appear at={Math.min(t40 - 0.2, tEsc - 0.6)} from="pop"><Text size={56} color={C.mint}>edge 40</Text></Appear></At>
        </>
      )}
      {t >= tSame + 0.5 && (
        <>
          <At x={265} y={1060}><Appear at={tSame + 0.6} from="up"><Text size={46} color={C.coral}>16 escorts, far apart</Text></Appear></At>
          <At x={760} y={1060}><Appear at={tTwice - 0.2} from="slam"><Chip color={C.amber} size={48}>twice as close</Chip></Appear></At>
          <At x={265} y={500}><Appear at={tThin - 0.3} from="drop"><Icon name="ArrowDown" size={110} color={C.coral} stroke={3} /></Appear></At>
        </>
      )}
      <Sfx name="pack/correct" at={tTwice} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rehook + inside
const HOT_BIG = new Set([34, 45, 56]);
const HOT_SMALL = new Set([6, 12, 18]);
const InsideBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tIn = at.beat("inside");
  const tSinks = at.word("sinks", 1, tIn + 0.4);
  const t100 = at.word("100", 1, tIn + 3.4);
  const t25 = at.word("25", 1, tIn + 4.6);
  const sub = tween(t, 0.4, Math.max(1.4, tIn - 0.2), 0, 1);
  return (
    <>
      <Headline out={tIn - 0.3} color={C.coral}>The one that gets in?</Headline>
      <Headline at={tIn}>A few ships either way</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tIn, { zoom: 1.0 }]]}>
        <Fleet k={5} cx={250} cy={775} s={S + 6} hot={t >= tSinks ? HOT_SMALL : undefined} edge={C.coral} edgeAt={-1} />
        <Fleet k={10} cx={BIG.x} cy={BIG.y} s={S} hot={t >= tSinks ? HOT_BIG : undefined} edge={C.mint} edgeAt={-1} />
        {/* the U-boat slipping into the big convoy */}
        <At x={tween(t, 0.4, tIn, 1000, 800)} y={tween(t, 0.4, tIn, 480, 690)}>
          <div style={{ width: 90, height: 26, borderRadius: 13, background: C.coral, opacity: sub > 0 ? 1 : 0, boxShadow: "0 0 18px #0008" }} />
        </At>
      </Camera>
      <At x={760} y={1060}><Appear at={t100 - 0.2} from="pop"><Text size={56} color={C.mint}>3 of 100 = 3%</Text></Appear></At>
      <At x={250} y={1060}><Appear at={t25 - 0.2} from="pop"><Text size={56} color={C.coral}>3 of 25 = 12%</Text></Appear></At>
      <Sfx name="pack/boom-short" at={tSinks} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- payoff: Blackett's records
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t32 = at.word("32", 1, 2.0);
  const t25 = at.word("2.5%", 1, 3.6);
  const t54 = at.word("54", 1, 4.8);
  const t11 = at.word("1.1%", 1, 6.0);
  const t1943 = at.word("1943", 1, 7.4);
  const BarV: React.FC<{ x: number; pct: number; at: number; color: string; label: string; n: string }> = ({ x, pct, at: a, color, label, n }) => {
    const hpx = tween(t, a - 0.3, a + 0.3, 0, pct * 170);
    return (
      <>
        <div style={{ position: "absolute", left: x - 80, top: 1000 - hpx, width: 160, height: hpx, background: color, borderRadius: "14px 14px 0 0" }} />
        <At x={x} y={1050}><Text size={46} color={C.muted}>{n}</Text></At>
        {t >= a - 0.2 && <At x={x} y={1000 - hpx - 50}><Text size={64} color={color}>{label}</Text></At>}
      </>
    );
  };
  return (
    <>
      <Headline color={C.amber}>Blackett's records</Headline>
      {t < t1943 - 0.3 && (
        <>
          {t >= t32 - 0.3 && <BarV x={330} pct={2.5} at={t25} color={C.coral} label="2.5%" n="~32 ships" />}
          {t >= t54 - 0.3 && <BarV x={750} pct={1.1} at={t11} color={C.mint} label="1.1%" n="~54 ships" />}
          <At x={540} y={1120}><Appear at={0} from="fade" sfx={null}><Text size={44} color={C.muted}>share of ships lost</Text></Appear></At>
          {t < t32 - 0.3 && <At x={540} y={700}><Appear at={0} from="pop"><Icon name="FileSpreadsheet" size={260} color={C.amber} /></Appear></At>}
          {t < t32 - 0.3 && <At x={540} y={930}><Appear at={0.3} from="up"><Text size={50} color={C.muted}>two years of convoys</Text></Appear></At>}
        </>
      )}
      {t >= t1943 - 0.3 && (
        <>
          <At x={540} y={480}><Appear at={t1943 - 0.3} from="slam"><Text size={110} color={C.amber}>1943</Text></Appear></At>
          <Fleet k={10} cx={540} cy={790} s={S} show={t1943 - 0.2} stagger={0.8} />
          <At x={540} y={1060}><Appear at={t1943 + 0.3} from="up"><Chip color={C.amber} size={52}>100-ship convoys</Chip></Appear></At>
        </>
      )}
      <Sfx name="pack/correct" at={t11} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const t400 = at.word("400", 1, 0.6);
  return (
    <>
      <Headline color={C.amber}>Your turn</Headline>
      <Fleet k={10} cx={270} cy={760} s={20} edge={C.mint} edgeAt={-1} />
      <At x={270} y={940}><Text size={48} color={C.mint}>100: edge 40</Text></At>
      <Fleet k={20} cx={760} cy={760} s={17} edge={C.amber} edgeAt={t400} show={t400 - 0.3} stagger={0.6} />
      <At x={760} y={1000}><Appear at={t400 + 0.3} from="up"><Text size={56}>400: edge <span style={{ color: C.amber }}>?</span></Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="square" to="escorts"><SquareBody /></Span>
    <Span from="rehook" to="inside"><InsideBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
