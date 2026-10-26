// "How Kepler caught a wine seller's one-stick trick": Kepler's wine barrels (Linz 1613, Nova stereometria 1615).
// versus hook (same stick, same price: 605 L or 340 L) -> rule out: longer stick = more wine? not if thin ->
// Linz 1613, one rod from the top hole to the far corner -> thin and fat both read 1 m -> the rod is a diagonal ->
// sweep the width: 340 L, climbs, peak 605 at 82 cm, falls -> re-hook: was anyone's barrel built like that? ->
// best = 1.4x as long as wide, Austrian barrels close -> payoff: flat at the peak, 10% off loses under 1%, fair ->
// CTA subscribe if you'd have trusted the stick (loops to the hook).
import React from "react";
import {
  Appear, At, C, Camera, Chip, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- the barrel (a cylinder lying on its side)
const len = (w: number) => 2 * Math.sqrt(Math.max(0, 1 - w * w)); // metres, for a 1 m rod
const litres = (w: number) => Math.PI * (w / 2) ** 2 * len(w) * 1000;

// side view centred on (cx, cy); S = pixels per metre; rodK = how far the rod has gone in (0..1)
const Barrel: React.FC<{ w: number; cx?: number; cy?: number; S?: number; rodK?: number; color?: string; tri?: boolean }> =
  ({ w, cx = 540, cy = 640, S = 420, rodK = 1, color = C.ink, tri }) => {
    const L = len(w) * S, Wd = w * S;
    const x0 = cx - L / 2, y0 = cy - Wd / 2;
    const bx = cx, by = y0;                // the top hole, in the middle
    const ex = cx + L / 2, ey = cy + Wd / 2; // far bottom corner of the lid
    return (
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={x0} y={y0} width={L} height={Wd} rx={Math.min(30, Wd / 5)} fill={`${C.ink}10`} stroke={color} strokeWidth={6} />
        {[0.18, 0.82].map((k) => (
          <line key={k} x1={x0 + L * k} y1={y0} x2={x0 + L * k} y2={y0 + Wd} stroke={C.dim} strokeWidth={5} />
        ))}
        <rect x={bx - 14} y={by - 10} width={28} height={16} rx={4} fill={color} />
        {tri ? (
          <>
            <line x1={bx} y1={by} x2={bx} y2={ey} stroke={C.mint} strokeWidth={5} strokeDasharray="14 10" />
            <line x1={bx} y1={ey} x2={ex} y2={ey} stroke={C.mint} strokeWidth={5} strokeDasharray="14 10" />
          </>
        ) : null}
        <line x1={bx} y1={by - 40} x2={bx + (ex - bx) * rodK} y2={by - 40 + (ey - by + 40) * rodK}
          stroke={C.amber} strokeWidth={10} strokeLinecap="round" opacity={rodK > 0 ? 1 : 0} />
      </svg>
    );
  };

// litres vs width, with a dot at the current width
const GX0 = 190, GX1 = 890, GY0 = 1150, GY1 = 900;
const gx = (w: number) => GX0 + ((w - 0.3) / 0.7) * (GX1 - GX0);
const gy = (l: number) => GY0 - (l / 650) * (GY0 - GY1);
const Graph: React.FC<{ w: number; band?: number; showDot?: boolean }> = ({ w, band = 0, showDot = true }) => {
  const pts: string[] = [];
  for (let i = 0; i <= 140; i++) { const x = 0.3 + (i / 140) * 0.69; pts.push(`${gx(x)},${gy(litres(x))}`); }
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      <line x1={GX0} y1={GY0} x2={GX1} y2={GY0} stroke={C.dim} strokeWidth={4} />
      {band > 0 ? (
        <rect x={gx(0.7893)} y={GY1 - 20} width={gx(0.8436) - gx(0.7893)} height={GY0 - GY1 + 20} fill={C.mint} opacity={0.25 * band} />
      ) : null}
      <polyline points={pts.join(" ")} fill="none" stroke={C.ink} strokeWidth={6} />
      {showDot ? <circle cx={gx(w)} cy={gy(litres(w))} r={18} fill={C.amber} /> : null}
    </svg>
  );
};

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t605 = at.word("44%", 1, 1.6);
  return (
    <>
      <HookText size={76} y={250} out={at.dur - 0.3}>{"Same stick, same price:\n**605 L** or **340 L**"}</HookText>
      <Riser to={t605} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.04 }]]}>
        <Barrel w={0.5} cy={600} S={300} />
        <At x={540} y={730}><Appear at={0} from="left"><Text size={56} color={C.coral} font={F.mono}>340 L</Text></Appear></At>
        <Barrel w={0.816} cy={930} S={300} />
        <At x={540} y={1120}><Appear at={0} from="right"><Text size={56} color={C.amber} font={F.mono}>605 L</Text></Appear></At>
      </Camera>
      <Sfx name="pack/cash-ting" at={t605 - 0.1} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tNot = at.word("Not", 1, 2.4);
  return (
    <>
      <Headline>Longer stick = more wine?</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tNot, { zoom: 1 }], [tNot + 0.5, { zoom: 1.08, y: 640 }]]}>
        <Barrel w={0.5} cy={640} S={420} color={C.ink} />
        <At x={540} y={460}><Appear at={0.2} from="fade"><Text size={46} color={C.amber} font={F.mono}>1 m</Text></Appear></At>
        <At x={540} y={950}><Appear at={tNot - 0.1} from="slam"><Stamp size={80} rotate={-6}>NOT IF IT'S THIN</Stamp></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 3. Linz 1613: one rod, priced by its length
const SetupBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tWed = at.word("wedding.", 1, 3.2);
  const tRod = at.word("seller", 1, 3.6);
  const tCorner = at.word("corner.", 1, 6.4);
  const tLen = at.word("prices", 1, 4.0);
  return (
    <>
      <Headline out={tRod - 0.3}>Linz, 1613</Headline>
      <Headline at={tRod}>One rod, one price</Headline>
      <At x={400} y={520}><Appear at={0.2} out={tRod - 0.3} from="up"><Icon name="Wine" size={150} color={C.amber} /></Appear></At>
      <At x={680} y={520}><Appear at={tWed - 0.4} out={tRod - 0.3} from="pop"><Icon name="Heart" size={130} color={C.coral} /></Appear></At>
      <At x={540} y={700}><Appear at={0.6} out={tRod - 0.3} from="fade"><Text size={50} color={C.ink}>Johannes Kepler</Text></Appear></At>
      {t >= tRod - 0.3 ? (
        <Appear at={tRod - 0.3} from="fade">
          <Barrel w={0.82} cy={700} S={420} rodK={tween(t, tRod, tCorner, 0, 1)} />
        </Appear>
      ) : null}
      <At x={540} y={1060}><Appear at={tLen - 0.2} from="pop"><Chip size={54}>price = rod length</Chip></Appear></At>
      <Sfx name="pack/whoosh-soft" at={tRod} volume={0.3} />
      <Sfx name="pack/cash-register" at={tLen - 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 4. thin and fat both read 1 m
const OutrageBody: React.FC = () => {
  const at = useAt();
  const tThin = at.word("long", 1, 1.4);
  const tFat = at.word("short", 1, 2.6);
  const tMetre = at.word("metre.", 1, 4.0);
  const t = useT();
  return (
    <>
      <Headline color={C.coral}>Both read 1 metre</Headline>
      <Shake at={tMetre}>
        {t >= 0.05 ? <Appear at={0.05} from="left"><Barrel w={0.4} cy={520} S={380} /></Appear> : null}
        {t >= tFat - 0.3 ? <Appear at={tFat - 0.3} from="right"><Barrel w={0.95} cy={895} S={380} /></Appear> : null}
      </Shake>
      <At x={540} y={628}><Appear at={tThin - 0.1} from="fade"><Text size={44} color={C.muted}>long, thin</Text></Appear></At>
      <At x={230} y={895}><Appear at={tFat} from="fade"><Text size={44} color={C.muted}>short, fat</Text></Appear></At>
      <At x={540} y={1140}><Appear at={tMetre - 0.2} from="pop"><Chip size={52} color={C.coral}>same price</Chip></Appear></At>
      <Sfx name="pack/wrong" at={tMetre} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 5. the rod is a diagonal
const DiagonalBody: React.FC = () => {
  const at = useAt();
  const tDiag = at.word("diagonal:", 1, 2.6);
  const tWidth = at.word("width,", 1, 3.6);
  const tHalf = at.word("half", 1, 4.4);
  const t = useT();
  return (
    <>
      <Headline>The rod is a diagonal</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tDiag, { zoom: 1 }], [tDiag + 0.5, { zoom: 1.12, x: 640, y: 680 }]]}>
        <Barrel w={0.7} cy={680} S={420} tri={t >= tDiag - 0.2} />
        <At x={480} y={680}><Appear at={tWidth - 0.2} from="fade"><Text size={46} color={C.mint}>width</Text></Appear></At>
        <At x={690} y={850}><Appear at={tHalf - 0.2} from="fade"><Text size={46} color={C.mint}>half the length</Text></Appear></At>
        <At x={760} y={600}><Appear at={tDiag - 0.2} from="pop"><Text size={50} color={C.amber} font={F.mono}>1 m</Text></Appear></At>
      </Camera>
      <At x={540} y={1060}><Appear at={tHalf + 0.6} from="up"><Text size={48} color={C.ink} font={F.mono}>rod² = width² + (½ length)²</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 6-7. sweep the width; re-hook
const SweepBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tGo = at.word("Go", 1, 2.6);
  const tClimb = at.word("climbs.", 1, 3.6);
  const t82 = at.word("82,", 1, 4.6);
  const t605 = at.word("605.", 1, 5.8);
  const tFalls = at.word("falls.", 1, 7.2);
  const tRe = at.beat("rehook");
  const tBuilt = at.word("built", 1, tRe + 3.2);
  const w = t < tRe
    ? (t < t82 ? tween(t, tGo, t82, 0.5, 0.816) : t < t605 + 0.3 ? 0.816 : tween(t, t605 + 0.3, tFalls, 0.816, 0.95))
    : tween(t, tRe, tRe + 0.6, 0.95, 0.816);
  const L = Math.round(litres(w));
  const atPeak = Math.abs(w - 0.816) < 0.01;
  return (
    <>
      <Headline out={tRe - 0.3}>Change the width</Headline>
      <Headline at={tRe} color={C.amber}>One best barrel per rod</Headline>
      <Barrel w={w} cy={560} S={330} />
      <At x={540} y={770}>
        <div style={{ display: "flex", gap: 40, alignItems: "baseline" }}>
          <Text size={52} color={C.muted} font={F.mono}>{Math.round(w * 100)} cm</Text>
          <Text size={76} color={atPeak ? C.amber : L < 400 ? C.coral : C.ink} font={F.mono}>{L} L</Text>
        </div>
      </At>
      <Graph w={w} />
      <At x={gx(0.816)} y={gy(605) - 60}><Appear at={t605 - 0.2} from="pop"><Chip size={44}>peak</Chip></Appear></At>
      <At x={540} y={1160}><Appear at={tBuilt - 0.3} from="fade"><Text size={46} color={C.ink}>but who builds that barrel?</Text></Appear></At>
      <Sfx name="pack/whoosh-soft" at={tClimb - 0.6} volume={0.25} />
      <Sfx name="pack/ding-short" at={t605 - 0.1} volume={0.35} />
      <Sfx name="pack/whoosh-short" at={tFalls - 0.5} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 8-9. best = 1.4x; Austrian barrels close; flat at the peak: fair
const BestBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t14 = at.word("1.4", 1, 1.4);
  const tAus = at.word("Austrian", 1, 3.6);
  const tPay = at.beat("payoff");
  const tFlat = at.word("flat.", 1, tPay + 2.0);
  const t10 = at.word("10%", 1, tPay + 2.8);
  const tFair = at.word("fair.", 1, tPay + 6.0);
  return (
    <>
      <Headline out={tPay - 0.3}>Long = 1.4 × wide</Headline>
      <Headline at={tPay} out={tFair - 0.3}>Flat at the peak</Headline>
      <Headline at={tFair} color={C.mint}>The rod was fair</Headline>
      {t < tPay ? (
        <>
          <Barrel w={0.816} cy={620} S={420} />
          <At x={540} y={880}><Appear at={t14 - 0.2} from="pop"><Text size={64} color={C.amber} font={F.mono}>115 cm ÷ 82 cm = 1.4</Text></Appear></At>
          <At x={540} y={1040}>
            <Appear at={tAus - 0.2} from="up">
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <Icon name="MapPin" size={80} color={C.mint} />
                <Text size={52} color={C.mint}>Austrian barrels: close</Text>
              </div>
            </Appear>
          </At>
        </>
      ) : (
        <Camera keys={[[0, { zoom: 1 }], [tFlat - 0.2, { zoom: 1 }], [tFlat + 0.4, { zoom: 1.35, x: gx(0.816), y: 940 }], [tFair - 0.2, { zoom: 1.35, x: gx(0.816), y: 940 }], [tFair + 0.3, { zoom: 1, y: 900 }]]}>
          <Graph w={0.816} band={tween(t, t10 - 0.2, t10 + 0.3, 0, 1)} />
          <At x={gx(0.816)} y={820}><Appear at={t10} from="pop"><Chip size={40} color={C.mint}>10% off: under 1% less</Chip></Appear></At>
        </Camera>
      )}
      {t >= tFair - 0.15 ? <At x={540} y={1120}><Appear at={tFair - 0.15} from="slam"><Stamp size={90} color={C.mint} rotate={-5}>FAIR</Stamp></Appear></At> : null}
      <Sfx name="pack/ding-short" at={t14 - 0.1} volume={0.3} />
      <Sfx name="pack/hit-swell" hit={tFair} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 10. CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const tStick = at.word("stick.", 1, 1.6);
  return (
    <>
      <Headline>Trust the stick?</Headline>
      <Barrel w={0.5} cy={600} S={300} />
      <Barrel w={0.816} cy={920} S={300} />
      <Punch at={tStick} amount={0.05}><At x={540} y={1130}><Text size={46} color={C.muted}>Kepler, Nova stereometria, 1615</Text></At></Punch>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="setup"><SetupBody /></Span>
    <Span from="outrage"><OutrageBody /></Span>
    <Span from="diagonal"><DiagonalBody /></Span>
    <Span from="sweep" to="rehook"><SweepBody /></Span>
    <Span from="best" to="payoff"><BestBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
