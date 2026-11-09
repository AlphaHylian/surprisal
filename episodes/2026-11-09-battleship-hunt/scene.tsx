// "How to sink a Battleship fleet in 62 shots, not 97": checkerboard hunt + follow-up targeting.
// versus hook -> no luck -> 10x10, 17 squares -> checkerboard -> re-hook: after a hit -> 4 neighbours
// -> follow the line -> payoff 62 vs 97 -> CTA: smallest ship 3 long?
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT } from "../kit";

const CELL = 68, X0 = 200, Y0 = 395;
const cx = (c: number) => X0 + c * CELL + CELL / 2;
const cy = (r: number) => Y0 + r * CELL + CELL / 2;
const SHIPS: [number, number][][] = [
  [[1, 2], [1, 3], [1, 4], [1, 5], [1, 6]],
  [[3, 8], [4, 8], [5, 8], [6, 8]],
  [[7, 1], [7, 2], [7, 3]],
  [[4, 5], [5, 5], [6, 5]],
  [[9, 7], [9, 8]],
];
const isShip = (r: number, c: number) => SHIPS.some((s) => s.some(([a, b]) => a === r && b === c));
type Shot = { r: number; c: number; at: number };

// pseudo-random shot order (fixed)
const RND: [number, number][] = (() => {
  let s = 7; const out: [number, number][] = []; const seen = new Set<number>();
  while (out.length < 100) { s = (s * 16807) % 2147483647; const k = s % 100; if (!seen.has(k)) { seen.add(k); out.push([Math.floor(k / 10), k % 10]); } }
  return out;
})();

const Grid: React.FC<{ shots?: Shot[]; ships?: number; checker?: number; dim?: number; hiCells?: { r: number; c: number; at: number; color?: string }[] }> =
  ({ shots = [], ships, checker, dim, hiCells = [] }) => {
    const t = useT();
    const chk = checker === undefined ? 0 : tween(t, checker, checker + 0.6, 0, 1);
    const shipO = ships === undefined ? 0 : tween(t, ships, ships + 0.5, 0, 1);
    const cells = [];
    for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) {
      const dark = (r + c) % 2 === 0;
      const fadeLight = dim !== undefined && !dark ? tween(t, dim, dim + 0.5, 0, 1) : 0;
      cells.push(<div key={`${r}-${c}`} style={{ position: "absolute", left: X0 + c * CELL + 2, top: Y0 + r * CELL + 2, width: CELL - 4, height: CELL - 4, borderRadius: 8,
        background: dark && chk > 0 ? `rgba(80, 220, 170, ${0.32 * chk})` : `rgba(255,255,255,${0.05 * (1 - fadeLight)})`, border: `2px solid rgba(255,255,255,${0.12 * (1 - 0.6 * fadeLight)})` }} />);
    }
    return (
      <>
        {cells}
        {SHIPS.map((s, i) => {
          const rs = s.map((p) => p[0]), cs = s.map((p) => p[1]);
          const r0 = Math.min(...rs), r1 = Math.max(...rs), c0 = Math.min(...cs), c1 = Math.max(...cs);
          return shipO > 0 ? <div key={i} style={{ position: "absolute", left: X0 + c0 * CELL + 8, top: Y0 + r0 * CELL + 8, width: (c1 - c0 + 1) * CELL - 16,
            height: (r1 - r0 + 1) * CELL - 16, borderRadius: 30, border: `4px solid ${C.ink}`, background: `${C.ink}22`, opacity: 0.8 * shipO }} /> : null;
        })}
        {hiCells.map((h, i) => t >= h.at ? <div key={`h${i}`} style={{ position: "absolute", left: X0 + h.c * CELL + 2, top: Y0 + h.r * CELL + 2, width: CELL - 4, height: CELL - 4,
          borderRadius: 8, border: `5px solid ${h.color ?? C.amber}`, boxShadow: `0 0 18px ${h.color ?? C.amber}aa`, opacity: tween(t, h.at, h.at + 0.2, 0, 1) }} /> : null)}
        {shots.map((s, i) => {
          if (t < s.at) return null;
          const hit = isShip(s.r, s.c);
          const k = s.at <= 0.001 ? 1 : tween(t, s.at, s.at + 0.18, 0, 1);
          return hit
            ? <At key={`s${i}`} x={cx(s.c)} y={cy(s.r)} scale={0.4 + 0.6 * k}><div style={{ width: 48, height: 48, borderRadius: 24, background: C.coral, boxShadow: `0 0 22px ${C.coral}` }} /></At>
            : <At key={`s${i}`} x={cx(s.c)} y={cy(s.r)} scale={k}><div style={{ width: 22, height: 22, borderRadius: 11, background: C.muted, opacity: 0.85 }} /></At>;
        })}
      </>
    );
  };

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tYou = at.word("You", 1, 1.8);
  const pre = RND.slice(0, 34).map(([r, c]) => ({ r, c, at: 0 }));
  const more = RND.slice(34, 44).map(([r, c], i) => ({ r, c, at: 0.25 + i * 0.22 }));
  return (
    <>
      <HookText y={265} size={86}>{"Random: **97** shots\nSmart: **62**"}</HookText>
      <Riser to={tYou} volume={0.45} />
      <Grid shots={[...pre, ...more]} />
      {more.map((s, i) => <Sfx key={i} name="pack/click-soft" at={s.at} volume={0.25} />)}
      <Sfx name="pack/hit-low" at={tYou} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- rule out luck
const RuleBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tStop = at.word("stop", 1, 2.0);
  const shots = RND.slice(0, 60).map(([r, c], i) => ({ r, c, at: i < 44 ? 0 : 0.1 + (i - 44) * 0.12 }));
  const wasted = shots.filter((s) => t >= s.at && !isShip(s.r, s.c)).length;
  return (
    <>
      <Headline>No luck. No peeking.</Headline>
      <Grid shots={shots} />
      <At x={540} y={345} style={{ width: 1000, display: "flex", justifyContent: "center" }}><Appear at={tStop - 0.2} from="pop"><Chip color={C.coral} size={44}>{wasted} wasted shots</Chip></Appear></At>
      {shots.slice(44).map((s, i) => <Sfx key={i} name="pack/click-soft" at={s.at} volume={0.2} />)}
    </>
  );
};

// ---------------------------------------------------------------- the board
const ContextBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFive = at.word("five", 1, 1.0), t17 = at.word("17", 1, 1.8), tRandom = at.word("random", 1, 2.8), tEnd = at.word("end", 1, 5.0);
  const n = Math.round(tween(t, tRandom, tEnd, 0, 96));
  const order = RND.filter(([r, c]) => !(r === 9 && (c === 7 || c === 8)));
  const shots = order.slice(0, n).map(([r, c]) => ({ r, c, at: 0 }));
  return (
    <>
      <Headline>10 × 10, 5 ships</Headline>
      <Grid ships={tFive - 0.2} shots={shots} hiCells={t >= tEnd ? [{ r: 9, c: 7, at: tEnd }, { r: 9, c: 8, at: tEnd }] : []} />
      <At x={300} y={360}><Appear at={t17 - 0.2} from="pop"><Chip color={C.mint} size={44}>17 squares</Chip></Appear></At>
      <At x={780} y={360}><Appear at={tRandom - 0.1} from="fade" sfx={null}><Text size={48} color={C.muted}>shot <span style={{ color: C.ink }}>{n}</span></Text></Appear></At>
      <Sfx name="pack/counting-digital" at={tRandom} volume={0.25} dur={Math.max(0.3, tEnd - tRandom)} />
      <Sfx name="pack/wrong" at={tEnd} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- checkerboard
const ParityBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tDark = at.word("dark", 1, 1.4), tTwo = at.word("2", 1, 3.6), tEach = at.word("covers", 1, 4.6), tHalf = at.word("Half", 1, 6.4);
  // a 2-long ship sliding around: always one dark square under it
  const spots: [number, number, boolean][] = [[2, 2, true], [2, 3, true], [5, 6, false], [6, 6, false], [3, 1, true]];
  const k = Math.min(spots.length - 1, Math.max(0, Math.floor((t - tTwo) / 0.55)));
  const [r, c, horiz] = spots[k];
  const show = t >= tTwo - 0.1;
  const darkCell: [number, number] = horiz ? ((r + c) % 2 === 0 ? [r, c] : [r, c + 1]) : ((r + c) % 2 === 0 ? [r, c] : [r + 1, c]);
  return (
    <>
      <Headline>Shoot only the dark squares</Headline>
      <Camera keys={[[0, { zoom: 1 }]]}>
        <Grid checker={tDark - 0.3} dim={tHalf} />
        {show && (
          <>
            <div style={{ position: "absolute", left: X0 + c * CELL + 6, top: Y0 + r * CELL + 6, width: (horiz ? 2 : 1) * CELL - 12, height: (horiz ? 1 : 2) * CELL - 12,
              borderRadius: 28, border: `5px solid ${C.amber}`, background: `${C.amber}33` }} />
            {t >= tEach - 0.1 && <At x={cx(darkCell[1])} y={cy(darkCell[0])}><div style={{ width: 30, height: 30, borderRadius: 15, background: C.mint, boxShadow: `0 0 18px ${C.mint}` }} /></At>}
          </>
        )}
      </Camera>
      {spots.map((_, i) => i > 0 ? <Sfx key={i} name="pack/whoosh-tiny" at={tTwo + i * 0.55} volume={0.25} /> : null)}
      <At x={540} y={345} style={{ width: 1000, display: "flex", justifyContent: "center" }}><Appear at={tHalf - 0.1} from="slam"><Chip color={C.amber} size={44}>50 squares, every ship</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const at = useAt();
  const tHit = at.word("hit", 1, 2.4);
  const wild = RND.slice(60, 72).filter(([r, c]) => !isShip(r, c)).slice(0, 7).map(([r, c], i) => ({ r, c, at: 0.3 + i * 0.25 }));
  return (
    <>
      <Headline color={C.coral}>The real waste</Headline>
      <Grid shots={[{ r: 1, c: 4, at: 0.05 }, ...wild]} checker={-1} />
      <At x={540} y={345} style={{ width: 1000 }}><Appear at={tHit - 0.1} from="pop"><Text size={46} color={C.coral}>a hit… then shots anywhere</Text></Appear></At>
      <Sfx name="pack/hit-low" at={0.05} volume={0.4} />
      {wild.map((s, i) => <Sfx key={i} name="pack/click-soft" at={s.at} volume={0.2} />)}
    </>
  );
};

// ---------------------------------------------------------------- target the 4 neighbours
const TargetBody: React.FC = () => {
  const at = useAt();
  const tStop = at.word("stop", 1, 0.9), t4 = at.word("4", 1, 2.0), tAround = at.word("around", 1, 2.8);
  const nb = [{ r: 0, c: 4 }, { r: 2, c: 4 }, { r: 1, c: 3 }, { r: 1, c: 5 }];
  return (
    <>
      <Headline>Hit? Fire around it</Headline>
      <Camera keys={[[0, { zoom: 1 }]]}>
        <Grid checker={-1} shots={[{ r: 1, c: 4, at: 0 }, { r: 0, c: 4, at: tAround }, { r: 2, c: 4, at: tAround + 0.35 }, { r: 1, c: 3, at: tAround + 0.7 }]}
          hiCells={nb.map((p, i) => ({ ...p, at: t4 - 0.1 + i * 0.12 }))} />
      </Camera>
      <Sfx name="pack/click-soft" at={tAround} volume={0.3} />
      <Sfx name="pack/click-soft" at={tAround + 0.35} volume={0.3} />
      <Sfx name="pack/hit-low" at={tAround + 0.7} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- follow the line
const LineBody: React.FC = () => {
  const at = useAt();
  const tDir = at.word("direction", 1, 1.4), tFollow = at.word("Follow", 1, 2.2), tSinks = at.word("sinks", 1, 3.6), tBack = at.word("back", 1, 4.6);
  const prev = [{ r: 1, c: 4, at: 0 }, { r: 0, c: 4, at: 0 }, { r: 2, c: 4, at: 0 }, { r: 1, c: 3, at: 0 }];
  const seq = [{ r: 1, c: 2, at: tFollow }, { r: 1, c: 1, at: tFollow + 0.4 }, { r: 1, c: 5, at: tFollow + 0.8 }, { r: 1, c: 6, at: tSinks - 0.15 }];
  const hunt = RND.filter(([r, c]) => (r + c) % 2 === 0 && r > 2).slice(0, 6).map(([r, c], i) => ({ r, c, at: tBack + 0.3 + i * 0.25 }));
  return (
    <>
      <Headline>Follow the line</Headline>
      <Camera keys={[[0, { zoom: 1 }]]}>
        <Grid checker={-1} shots={[...prev, ...seq, ...hunt]} hiCells={[{ r: 1, c: 3, at: tDir - 0.2, color: C.mint }, { r: 1, c: 4, at: tDir - 0.2, color: C.mint }]} />
        <At x={cx(4)} y={cy(1) - 70}><Appear at={tSinks} out={tBack} from="slam"><Stamp size={70}>SUNK</Stamp></Appear></At>
      </Camera>
      {seq.map((s, i) => <Sfx key={i} name={isShip(s.r, s.c) ? "pack/hit-low" : "pack/click-soft"} at={s.at} volume={0.35} />)}
      <Sfx name="pack/boom-short" at={tSinks} volume={0.45} />
      {hunt.map((s, i) => <Sfx key={`h${i}`} name="pack/click-soft" at={s.at} volume={0.2} />)}
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tGames = at.word("games", 1, 1.0), t62 = at.word("62", 1, 2.4), t97 = at.word("97", 1, 3.6);
  const bar = (frac: number, t0: number, color: string) => (
    <div style={{ width: 760, height: 90, borderRadius: 20, background: `${C.panel}cc`, border: `3px solid ${C.dim}` }}>
      <div style={{ width: 760 * frac * tween(t, t0, t0 + 0.7, 0, 1), height: "100%", borderRadius: 18, background: color }} />
    </div>
  );
  return (
    <>
      <Headline color={C.amber}>Half your games: shot 62</Headline>
      <At x={540} y={420} style={{ width: 1000 }}><Appear at={tGames - 0.3} from="fade" sfx={null}><Text size={50} color={C.muted}>100,000 simulated games</Text></Appear></At>
      <At x={540} y={560} style={{ width: 1000 }}><Text size={52} color={C.mint}>checkerboard + follow-up</Text></At>
      <At x={540} y={650}>{bar(0.62, t62 - 0.6, C.mint)}</At>
      <At x={540} y={760}><Punch at={t62}><Counter from={0} to={62} t0={t62 - 0.6} t1={t62 + 0.1} size={84} color={C.amber} /></Punch></At>
      <At x={540} y={890}><Appear at={t97 - 0.6} from="fade" sfx={null}><Text size={52} color={C.coral}>random</Text></Appear></At>
      <At x={540} y={980}>{t >= t97 - 0.6 ? bar(0.97, t97 - 0.6, C.coral) : null}</At>
      <At x={540} y={1075}><Appear at={t97 - 0.1} from="pop"><Text size={64} color={C.coral}>97</Text></Appear></At>
      <Sfx name="pack/correct" at={t62} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const t3 = at.word("3", 1, 1.6), tWhich = at.word("which", 1, 2.4);
  return (
    <>
      <Headline>Your turn</Headline>
      <Grid />
      <Appear at={t3 - 0.2} from="pop">
        <div style={{ position: "absolute", left: X0 + 3 * CELL + 6, top: Y0 + 4 * CELL + 6, width: 3 * CELL - 12, height: CELL - 12, borderRadius: 28, border: `5px solid ${C.amber}`, background: `${C.amber}33` }} />
      </Appear>
      <At x={540} y={345} style={{ width: 1000 }}><Appear at={tWhich - 0.1} from="slam"><Text size={56} color={C.amber}>which squares?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="parity"><ParityBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="target"><TargetBody /></Span>
    <Span from="line"><LineBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
