// "How a new shortcut makes everyone's drive longer": Braess's paradox (Wikipedia's 4,000-driver network).
// versus hook 65 vs 80 -> rule out (0-minute shortcut, everyone picks fastest) -> setup (bridges 45, town roads cars/100)
// -> split 2,000/2,000 = 65 -> open the shortcut, first driver 40 -> re-hook: everyone copies -> 4,000 + 4,000 = 80, alone 85
// -> payoff: everyone lost 15, Stuttgart 1969 -> CTA.
import React from "react";
import {
  Appear, At, C, Camera, Chip, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text, tween, useAt, useT,
} from "../kit";

// diamond: Start left, End right, A top, B bottom
type P = [number, number];
const S: P = [150, 740], A: P = [540, 500], E: P = [930, 740], B: P = [540, 980];
const ROUTES: Record<string, P[]> = { top: [S, A, E], bot: [S, B, E], short: [S, A, B, E] };
const along = (pts: P[], f: number): P => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  let d = f * seg.reduce((a, b) => a + b, 0);
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) { const k = d / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};

const Road: React.FC<{ a: P; b: P; color: string; w?: number; dash?: boolean; draw?: number }> = ({ a, b, color, w = 26, dash, draw = 1 }) => {
  const bx = a[0] + (b[0] - a[0]) * draw, by = a[1] + (b[1] - a[1]) * draw;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <line x1={a[0]} y1={a[1]} x2={bx} y2={by} stroke={color} strokeWidth={w} strokeLinecap="round" opacity={0.9}
        strokeDasharray={dash ? "30 22" : undefined} style={{ filter: `drop-shadow(0 0 10px ${color}66)` }} />
    </svg>
  );
};

// moving cars: n dots per route, looping
const Cars: React.FC<{ route: string; n: number; color: string; speed?: number; t: number; size?: number }> = ({ route, n, color, speed = 0.25, t, size = 22 }) => (
  <>
    {[...Array(n)].map((_, i) => {
      const f = ((t * speed + i / n) % 1 + 1) % 1;
      const [x, y] = along(ROUTES[route], f);
      return <div key={route + i} style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: 6,
        background: color, boxShadow: `0 0 12px ${color}aa` }} />;
    })}
  </>
);

const Node: React.FC<{ p: P; label?: string }> = ({ p, label }) => (
  <At x={p[0]} y={p[1]}>
    <div style={{ width: 54, height: 54, borderRadius: 27, background: C.panel, border: `5px solid ${C.ink}`, display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: F.bold, fontSize: 26, color: C.ink }}>{label}</div>
  </At>
);

// edge label spots (outside the diamond), and the shortcut label
const LBL = { sa: [270, 550] as P, ae: [810, 550] as P, sb: [270, 940] as P, be: [810, 940] as P, ab: [690, 740] as P };

const Network: React.FC<{ town?: string; bridge?: string; showShort?: number; shortDraw?: number; townColor?: string; shortColor?: string }> =
  ({ town = C.mint, bridge = C.muted, showShort, shortDraw = 1, townColor, shortColor = C.amber }) => (
  <>
    <Road a={S} b={A} color={townColor ?? town} />
    <Road a={B} b={E} color={townColor ?? town} />
    <Road a={A} b={E} color={bridge} />
    <Road a={S} b={B} color={bridge} />
    {showShort !== undefined ? <Road a={A} b={B} color={shortColor} w={18} dash draw={shortDraw} /> : null}
    <Node p={S} /><Node p={E} /><Node p={A} /><Node p={B} />
  </>
);

const Lbl: React.FC<{ p: P; at?: number; out?: number; color?: string; children: React.ReactNode; size?: number }> = ({ p, at = 0, out, color = C.ink, children, size = 50 }) => (
  <At x={p[0]} y={p[1]}><Appear at={at} out={out} from="pop"><Text size={size} color={color}>{children}</Text></Appear></At>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t80 = at.word("80", 1, 2.0);
  return (
    <>
      <HookText>{"No shortcut: 65 min\nShortcut: **80 min**"}</HookText>
      <Riser to={t80} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.03 }]]}>
        <Network showShort={0} townColor={C.coral} />
        <Cars route="short" n={14} color={C.coral} t={t} speed={0.12} />
        <Lbl p={LBL.sa} color={C.coral}>40 min</Lbl>
        <Lbl p={LBL.be} color={C.coral}>40 min</Lbl>
        <Lbl p={LBL.ab} color={C.amber}>shortcut</Lbl>
      </Camera>
      <Sfx name="pack/hit-low" at={t80} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tZero = at.word("zero", 1, 1.6);
  const tFast = at.word("fastest", 1, 3.6);
  return (
    <>
      <Headline>No crash. No roadworks.</Headline>
      <Network showShort={0} />
      <Cars route="short" n={6} color={C.ink} t={t} speed={0.15} />
      <At x={540} y={740}><Appear at={tZero} from="slam"><Chip color={C.amber} size={52}>0 min</Chip></Appear></At>
      <At x={540} y={1080}><Appear at={tFast} from="up"><Text size={48} color={C.mint}>everyone picks the fastest route</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- the whole network story: setup .. jam
const NetBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSplit = at.beat("split");
  const tShort = at.beat("shortcut");
  const tRe = at.beat("rehook");
  const tJam = at.beat("jam");
  const t4000 = at.word("4,000", 1, 0.3);
  const tBridge = at.word("bridge", 1, 2.0);
  const t45 = at.word("45", 1, 3.6);
  const tTown = at.word("town", 1, 5.0);
  const t100 = at.word("100", 1, 6.5);
  const t2000 = at.word("2,000", 1, tSplit + 1.4);
  const t20 = at.word("20", 1, tSplit + 3.0);
  const t65 = at.word("65", 1, tSplit + 4.6);
  const tOpen = at.word("shortcut", 1, tShort + 1.0);
  const tSkip = at.word("skip", 1, tShort + 3.4);
  const t40 = at.word("40", 1, tShort + 5.6);
  const tCopy = at.word("copies", 1, tRe + 0.8);
  const tTrap = at.word("trap", 1, tRe + 1.8);
  const tJ4000 = at.word("4,000", 2, tJam + 1.2);
  const t80 = at.word("80", 1, tJam + 3.4);
  const t85 = at.word("85", 1, tJam + 5.4);
  const tNobody = at.word("Nobody", 1, tJam + 6.2);
  const shift = tween(t, tCopy - 0.2, tCopy + 1.2, 0, 1);   // cars moving onto the shortcut
  const nSplit = Math.round(7 * (1 - shift));
  const jammed = t >= tJ4000;
  return (
    <Shake at={tNobody}>
      <Headline out={tSplit - 0.3}>4,000 drivers, two routes</Headline>
      <Headline at={tSplit} out={tShort - 0.3}>Traffic splits in half</Headline>
      <Headline at={tShort} out={tRe - 0.3} color={C.amber}>Open a free shortcut</Headline>
      <Headline at={tRe} out={tJam - 0.3} color={C.coral}>Everyone copies</Headline>
      <Headline at={tJam} color={C.coral}>The trap</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tShort - 0.2, { zoom: 1 }], [tShort + 0.6, { zoom: 1.04 }], [tJam, { zoom: 1.04 }], [tJam + 1, { zoom: 1 }]]}>
        <Network showShort={t >= tOpen - 0.3 ? 1 : undefined} shortDraw={tween(t, tOpen - 0.3, tOpen + 0.5, 0, 1)}
          townColor={jammed ? C.coral : C.mint} />
        <Appear at={0.05} from="fade" sfx={null}>
          {t >= tSplit ? <>
            <Cars route="top" n={nSplit} color={C.ink} t={t} />
            <Cars route="bot" n={nSplit} color={C.ink} t={t + 0.5} />
          </> : null}
          {t >= t40 - 0.6 && t < tCopy ? <Cars route="short" n={1} color={C.amber} t={t} size={30} /> : null}
          {t >= tCopy - 0.2 ? <Cars route="short" n={Math.round(1 + 13 * shift)} color={jammed ? C.coral : C.ink} t={t} speed={jammed ? 0.08 : 0.2} /> : null}
        </Appear>
        {/* bridges */}
        <Lbl p={LBL.ae} at={t45} color={C.muted}>45 min</Lbl>
        <Lbl p={LBL.sb} at={t45} color={C.muted}>45 min</Lbl>
        {/* town roads */}
        <Lbl p={LBL.sa} at={t100} out={t2000 - 0.2} color={C.mint} size={44}>cars ÷ 100</Lbl>
        <Lbl p={LBL.be} at={t100} out={t2000 - 0.2} color={C.mint} size={44}>cars ÷ 100</Lbl>
        <Lbl p={LBL.sa} at={t2000} out={tJ4000 - 0.2} color={C.mint}>{t >= t20 ? "20 min" : "2,000"}</Lbl>
        <Lbl p={LBL.be} at={t2000} out={tJ4000 - 0.2} color={C.mint}>{t >= t20 ? "20 min" : "2,000"}</Lbl>
        <Lbl p={LBL.sa} at={tJ4000} color={C.coral}>40 min</Lbl>
        <Lbl p={LBL.be} at={tJ4000} color={C.coral}>40 min</Lbl>
        <Lbl p={LBL.ab} at={tOpen + 0.3} color={C.amber} size={44}>0 min</Lbl>
      </Camera>
      <At x={150} y={640}><Appear at={t4000} out={tSplit - 0.2} from="pop"><Chip color={C.ink} size={40}>4,000</Chip></Appear></At>
      <At x={540} y={410}><Appear at={tBridge} out={tTown} from="fade"><Text size={42} color={C.muted}>bridge: always 45</Text></Appear></At>
      <At x={540} y={410}><Appear at={tTown} out={tSplit - 0.2} from="fade"><Text size={42} color={C.mint}>town road: 1 min per 100 cars</Text></Appear></At>
      {/* totals */}
      <At x={540} y={1090}><Appear at={t65} out={tShort - 0.2} from="slam"><Chip color={C.mint} size={56}>20 + 45 = 65 min</Chip></Appear></At>
      <At x={540} y={1090}><Appear at={tSkip} out={t40 - 0.1} from="fade"><Text size={46} color={C.amber}>skip both bridges</Text></Appear></At>
      <At x={540} y={1090}><Appear at={t40} out={tRe - 0.2} from="slam"><Chip color={C.amber} size={56}>first driver: 40 min</Chip></Appear></At>
      <At x={540} y={1090}><Appear at={tTrap} out={tJam - 0.2} from="fade"><Text size={46} color={C.coral}>4,000 cars, one route</Text></Appear></At>
      <At x={540} y={1090}><Appear at={t80} out={t85 - 0.1} from="slam"><Chip color={C.coral} size={56}>40 + 40 = 80 min</Chip></Appear></At>
      <At x={540} y={1090}><Appear at={t85} from="up"><Chip color={C.ink} size={50}>back to a bridge alone: 85</Chip></Appear></At>
      <At x={540} y={390}><Appear at={tNobody} from="slam"><Stamp size={84}>STUCK</Stamp></Appear></At>
      <Sfx name="pack/ding-short" at={t65} volume={0.4} />
      <Sfx name="pack/whoosh-soft" at={tCopy} volume={0.35} />
      <Sfx name="pack/wrong" at={t80 + 0.05} volume={0.35} />
    </Shake>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t15 = at.word("15", 1, 3.0);
  const tStutt = at.word("Stuttgart", 1, 5.0);
  const tBetter = at.word("better", 1, 7.5);
  return (
    <>
      <Headline color={C.amber}>Everyone chose well</Headline>
      <Punch at={t15}>
        <At x={540} y={520}>
          <Appear at={0.05} from="pop">
            <Text size={150} font={F.bold}><span style={{ color: C.mint }}>65</span><span style={{ color: C.muted }}> → </span><span style={{ color: C.coral }}>80</span></Text>
          </Appear>
        </At>
        <At x={540} y={680}><Appear at={t15} from="slam"><Chip color={C.coral} size={60}>everyone: +15 min</Chip></Appear></At>
      </Punch>
      <At x={300} y={930}><Appear at={tStutt} from="drop"><Icon name="Construction" size={170} color={C.amber} /></Appear></At>
      <At x={640} y={900}><Appear at={tStutt + 0.2} from="left"><Text size={56}>Stuttgart, 1969</Text></Appear></At>
      <At x={640} y={980}><Appear at={tStutt + 0.8} from="left"><Text size={44} color={C.muted}>closed a new road</Text></Appear></At>
      <At x={540} y={1110}><Appear at={tBetter} from="slam"><Chip color={C.mint} size={54}>traffic got better</Chip></Appear></At>
    </>
  );
};

const CtaBody: React.FC = () => {
  const t = useT();
  return (
    <>
      <Network showShort={0} />
      <Cars route="short" n={1} color={C.amber} t={t} size={30} speed={0.35} />
      <At x={540} y={300}><Appear at={0} from="pop"><Text size={84} color={C.amber}>Would you take it?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="setup" to="jam"><NetBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
