// "How Euler proved a walk impossible without walking it": Königsberg's 7 bridges (1736), degrees 5, 3, 3, 3.
// versus hook (372 walks or count to 4) -> Königsberg 1736, cross each bridge once, 256 walks die one short ->
// land to dots, bridges to lines -> count: 5, 3, 3, 3 -> pass-through uses one in + one out: even -> re-hook: only
// start and finish exempt, how many odd dots can a walk survive? -> payoff: two, Königsberg has 4, Euler -> today:
// Kaliningrad, the war took 2 bridges, 2 odd dots, island to island -> CTA subscribe.
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, HookText, Headline, Punch, Riser, Sfx, Shake, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- the city: K = Kneiphof, L = Lomse, A = north bank, V = south bank
type N = "K" | "L" | "A" | "V";
const P: Record<N, [number, number]> = { A: [560, 450], V: [560, 990], K: [370, 720], L: [810, 720] };
// bridges 0-6: [from, to, bend (graph view), map x of the bridge]
const B: [N, N, number][] = [["K", "A", -70], ["K", "A", 70], ["K", "V", 70], ["K", "V", -70], ["K", "L", 0], ["A", "L", 0], ["V", "L", 0]];
const MAP_BRIDGE: [number, number, number, number][] = [ // x1, y1, x2, y2 on the map
  [310, 560, 310, 640], [430, 560, 430, 640], [310, 800, 310, 880], [430, 800, 430, 880], [520, 720, 650, 720], [810, 560, 810, 640], [810, 800, 810, 880],
];
const RIVER_TOP = 545, RIVER_BOT = 895;

const curve = (i: number) => {
  const [a, b, bend] = B[i];
  const [x1, y1] = P[a], [x2, y2] = P[b];
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
  const cx = mx + (-dy / len) * bend, cy = my + (dx / len) * bend;
  return { d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`, cx, cy, x1, y1, x2, y2 };
};
const pointOn = (i: number, u: number, reverse = false) => {
  const c = curve(i);
  const s = reverse ? 1 - u : u;
  return [(1 - s) ** 2 * c.x1 + 2 * (1 - s) * s * c.cx + s ** 2 * c.x2, (1 - s) ** 2 * c.y1 + 2 * (1 - s) * s * c.cy + s ** 2 * c.y2];
};

/** The map (land, river, bridges), fading to the graph as `g` goes 0 -> 1. */
const City: React.FC<{ g?: number; lit?: Record<number, string>; gone?: number[]; goneAt?: number; deg?: Record<N, number> | null; degAt?: number[];
  odd?: boolean; nodeColor?: Partial<Record<N, string>> }> =
  ({ g = 0, lit = {}, gone = [], goneAt = 0, deg = null, degAt = [0, 0, 0, 0], odd = false, nodeColor = {} }) => {
    const t = useT();
    const mapO = 1 - g;
    const goneO = (i: number) => (gone.includes(i) ? tween(t, goneAt, goneAt + 0.5, 1, 0) : 1);
    return (
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* map layer */}
        <g opacity={mapO}>
          <rect x={60} y={RIVER_TOP} width={960} height={RIVER_BOT - RIVER_TOP} fill="#1d3b5c" />
          <rect x={60} y={300} width={960} height={RIVER_TOP - 300} rx={24} fill={C.panel} />
          <rect x={60} y={RIVER_BOT} width={960} height={1150 - RIVER_BOT} rx={24} fill={C.panel} />
          <ellipse cx={370} cy={720} rx={130} ry={80} fill={C.panel} stroke={C.dim} strokeWidth={4} />
          <ellipse cx={810} cy={720} rx={150} ry={80} fill={C.panel} stroke={C.dim} strokeWidth={4} />
          {MAP_BRIDGE.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={lit[i] ?? C.ink} strokeWidth={26} strokeLinecap="round" opacity={goneO(i)} />
          ))}
        </g>
        {/* graph layer */}
        <g opacity={g}>
          {B.map((_, i) => (
            <path key={i} d={curve(i).d} fill="none" stroke={lit[i] ?? C.ink} strokeWidth={12} strokeLinecap="round" opacity={goneO(i)} />
          ))}
          {(Object.keys(P) as N[]).map((n) => (
            <circle key={n} cx={P[n][0]} cy={P[n][1]} r={44} fill={C.bg} stroke={nodeColor[n] ?? (odd && deg && deg[n] % 2 ? C.coral : C.mint)} strokeWidth={10} />
          ))}
        </g>
        {deg ? (Object.keys(P) as N[]).map((n, j) => {
          const o = tween(t, degAt[j], degAt[j] + 0.2, 0, 1);
          const col = odd && deg[n] % 2 ? C.coral : C.amber;
          return <text key={n} x={P[n][0]} y={P[n][1] + 20} textAnchor="middle" fontFamily="Space Grotesk Bold" fontSize={58} fill={col} opacity={o * g}>{deg[n]}</text>;
        }) : null}
      </svg>
    );
  };

const DEG_1736: Record<N, number> = { K: 5, A: 3, V: 3, L: 3 };
const DEG_NOW: Record<N, number> = { K: 3, A: 2, V: 2, L: 3 };

// ---------------------------------------------------------------- 1. hook: 372 walks, or count to 4
const HookBody: React.FC = () => {
  const at = useAt();
  const t4 = at.word("4.", 1, 2.2);
  return (
    <>
      <Camera keys={[[0, { zoom: 0.9, y: 690 }], [at.dur, { zoom: 0.95, y: 690 }]]}>
        <City g={1} deg={DEG_1736} odd />
      </Camera>
      <HookText size={96} y={235}>{"372 walks\nor **count to 4**"}</HookText>
      <Riser to={t4} volume={0.5} />
      <Sfx name="pack/ding" at={t4} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 2. Königsberg 1736: one walk, every bridge once; 256 die one short
const WALK = [0, 1, 5, 4, 2, 3];
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCross = at.word("Cross", 1, 1.4);
  const tNowhere = at.word("nowhere:", 1, 3.6);
  const t256 = at.word("256", 1, 4.4);
  const tShort = at.word("short.", 1, 6.0);
  const lit: Record<number, string> = {};
  WALK.forEach((b, k) => { if (t >= tCross + 0.2 + k * 0.32) lit[b] = C.amber; });
  if (t >= tNowhere) lit[6] = C.coral;
  return (
    <>
      <Headline>Königsberg, 1736</Headline>
      <City g={0} lit={lit} />
      <At x={540} y={380}><Appear at={tCross - 0.1} from="down"><Text size={50} color={C.ink}>every bridge, exactly once</Text></Appear></At>
      <At x={540} y={1080}><Appear at={t256 - 0.2} from="pop"><Chip size={52} color={C.coral}><Counter from={0} to={256} t0={t256 - 0.2} t1={t256 + 0.5} size={52} color={C.bg} sfx={false} /></Chip></Appear></At>
      <At x={540} y={1150}><Appear at={tShort - 0.5} from="fade"><Text size={42} color={C.muted}>walks stuck at 6 of 7</Text></Appear></At>
      {WALK.map((_, k) => <Sfx key={k} name="pack/pop" at={tCross + 0.2 + k * 0.32} volume={0.25} />)}
      <Sfx name="pack/wrong" at={tNowhere} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 3. land to dots, bridges to lines
const ShrinkBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tDot = at.word("dot,", 1, 1.4);
  const tLine = at.word("line.", 1, 3.0);
  const g = tween(t, tDot - 0.4, tLine, 0, 1);
  return (
    <>
      <Headline>Land → dots, bridges → lines</Headline>
      <City g={g} />
      <Sfx name="pack/warp-slide" at={tDot - 0.4} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 4. count the lines at each dot: 5, 3, 3, 3
const CountBody: React.FC = () => {
  const at = useAt();
  const t5 = at.word("5,", 1, 1.6);
  const t3a = at.word("3,", 1, 2.0);
  const t3b = at.word("3,", 2, 2.4);
  const t3c = at.word("3.", 1, 2.8);
  return (
    <>
      <Headline>Count the lines</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t5 - 0.2, { zoom: 1.25, x: 370, y: 720 }], [t3a, { zoom: 1, x: 540, y: 720 }]]}>
        <City g={1} deg={DEG_1736} degAt={[t5 - 0.15, t3c - 0.15, t3a - 0.15, t3b - 0.15]} />
      </Camera>
      {[t5, t3a, t3b, t3c].map((tt, i) => <Sfx key={i} name="pack/pop" at={tt - 0.15} volume={0.35} />)}
    </>
  );
};

// ---------------------------------------------------------------- 5. pass through a dot: one in, one out
const RuleBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tIn = at.word("in,", 1, 2.4);
  const tOut = at.word("out.", 1, 3.0);
  const tEven = at.word("even", 1, 5.0);
  // a walker comes over bridge 5 (L -> A) and leaves over bridge 0 (A -> K)
  const u1 = tween(t, tIn - 0.8, tIn, 0, 1);
  const u2 = tween(t, tOut - 0.3, tOut + 0.5, 0, 1);
  const [wx, wy] = t < tOut - 0.3 ? pointOn(5, u1, true) : pointOn(0, u2, true);
  return (
    <>
      <Headline>One in, one out</Headline>
      <Camera keys={[[0, { zoom: 1 }], [0.6, { zoom: 1.1, x: 560, y: 620 }], [tEven + 0.4, { zoom: 1.1, x: 560, y: 620 }], [tEven + 1.2, { zoom: 1, x: 540, y: 720 }]]}>
        <City g={1} lit={{ 5: t >= tIn - 0.8 ? C.amber : C.ink, 0: t >= tOut - 0.3 ? C.amber : C.ink }} />
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          {t >= tIn - 0.8 ? <circle cx={wx} cy={wy} r={22} fill={C.amber} /> : null}
        </svg>
      </Camera>
      <At x={540} y={1110}><Appear at={tEven - 0.2} from="pop"><Chip size={58} color={C.mint}>pass through = even</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 6. re-hook: only start and finish are exempt
const RehookBody: React.FC = () => {
  const at = useAt();
  const tStart = at.word("start,", 1, 1.6);
  const tFinish = at.word("finish.", 1, 2.6);
  const tHow = at.word("how", 1, 3.4);
  return (
    <>
      <Headline>Only two exceptions</Headline>
      <City g={1} nodeColor={{ A: C.amber, V: C.amber }} />
      <At x={560} y={340}><Appear at={tStart - 0.2} from="down"><Chip size={46}>start</Chip></Appear></At>
      <At x={560} y={1100}><Appear at={tFinish - 0.2} from="up"><Chip size={46}>finish</Chip></Appear></At>
      <Punch at={tHow + 0.3}>
        <At x={810} y={1000}><Appear at={tHow} from="pop"><Text size={60} color={C.amber} glow>odd dots: ?</Text></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 7. payoff: two allowed, Königsberg has 4
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tTwo = at.word("Two.", 1, 0.3);
  const t4 = at.word("4.", 1, 1.6);
  const tNo = at.word("No", 1, 2.2);
  const tEuler = at.word("Euler", 1, 3.2);
  return (
    <Shake at={tNo}>
      <At x={540} y={250}><Appear at={tTwo - 0.1} from="pop"><Text size={72} color={C.ink}>allowed: <span style={{ color: C.mint }}>2</span>  ·  here: <span style={{ color: C.coral }}>4</span></Text></Appear></At>
      <Camera keys={[[0, { zoom: 0.88, y: 760 }]]}>
        <City g={1} deg={DEG_1736} odd degAt={[0, 0, 0, 0]} />
      </Camera>
      <At x={540} y={1035}><Appear at={tNo - 0.1} from="slam"><Stamp size={80} rotate={-5}>NO WALK</Stamp></Appear></At>
      <At x={540} y={335}><Appear at={tEuler - 0.2} from="down"><Text size={44} color={C.muted}>Leonhard Euler, 1736</Text></Appear></At>
      <Sfx name="pack/hit-low" at={t4} volume={0.3} />
    </Shake>
  );
};

// ---------------------------------------------------------------- 8. today: Kaliningrad, 2 bridges gone, island to island
const PATH_NOW: [number, boolean][] = [[0, false], [5, false], [6, true], [2, true], [4, false]]; // K-A, A-L, L-V, V-K, K-L
const TodayBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tWar = at.word("war", 1, 1.6);
  const tOdd = at.word("odd", 1, 3.4);
  const tWorks = at.word("works,", 1, 4.6);
  const step = 0.45;
  let walker = null as number[] | null;
  const lit: Record<number, string> = {};
  PATH_NOW.forEach(([b, rev], k) => {
    const t0 = tWorks - 0.6 + k * step;
    if (t >= t0) {
      lit[b] = C.amber;
      if (t < t0 + step) walker = pointOn(b, (t - t0) / step, rev);
    }
  });
  const last = PATH_NOW[PATH_NOW.length - 1];
  if (!walker && t >= tWorks - 0.6 + PATH_NOW.length * step) walker = pointOn(last[0], 1, last[1]);
  return (
    <>
      <Headline>Kaliningrad, today</Headline>
      <City g={1} gone={[1, 3]} goneAt={tWar} lit={lit} deg={t >= tOdd - 0.3 ? DEG_NOW : null} degAt={[tOdd - 0.3, tOdd - 0.3, tOdd - 0.3, tOdd - 0.3]} odd />
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {walker ? <circle cx={walker[0]} cy={walker[1]} r={22} fill={C.amber} /> : null}
      </svg>
      <At x={540} y={1110}><Appear at={tWorks + 1.6} from="pop"><Chip size={50} color={C.mint}>island to island</Chip></Appear></At>
      <Sfx name="pack/whoosh-metal" at={tWar} volume={0.35} />
      <Sfx name="pack/notify-idea" at={tWorks + 1.6} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 9. CTA: subscribe (loops to the 1736 map)
const CtaBody: React.FC = () => (
  <>
    <City g={0} />
    <At x={540} y={380}><Appear at={0.1} from="down"><Text size={50} color={C.muted}>372 walks, or count to 4</Text></Appear></At>
  </>
);

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="shrink"><ShrinkBody /></Span>
    <Span from="count"><CountBody /></Span>
    <Span from="rule"><RuleBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="today"><TodayBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
