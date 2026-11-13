// "How a letter found a stranger in 5 handoffs": Milgram's small-world folders (Travers & Milgram 1969).
// claim hook (Nebraska -> Boston, 5 friends) -> no address, first-name friends only -> 296 folders, one stockbroker
// -> you in Omaha: send to the friend most likely to know him -> 100, 10,000, ten billion -> re-hook: overlap
// -> the far friend: one hop, 1,300 miles -> 64 arrived, 5.2 in between, 1 in 4 via one shop owner -> CTA comment
import React from "react";
import { Appear, Arrow, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// a person disc
const Person: React.FC<{ color?: string; size?: number; label?: string; ring?: boolean }> = ({ color = C.ink, size = 96, label, ring }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: "max-content" }}>
    <div style={{ width: size, height: size, borderRadius: "50%", background: C.panel, border: `4px solid ${color}`, display: "flex", alignItems: "center",
      justifyContent: "center", boxShadow: ring ? `0 0 30px ${color}` : "0 8px 20px #0008" }}>
      <Icon name="User" size={size * 0.58} color={color} />
    </div>
    {label ? <div style={{ fontFamily: F.med, fontSize: 40, color: C.muted, whiteSpace: "nowrap" }}>{label}</div> : null}
  </div>
);

// the hook chain: Nebraska -> 5 people -> Boston
const CHAIN: [number, number][] = [[110, 760], [250, 600], [390, 800], [530, 620], [670, 820], [800, 640]];
const TARGET: [number, number] = [940, 800];
const Chain: React.FC<{ t0?: number; speed?: number; lit?: number }> = ({ t0 = 0, speed = 0.42, lit = 0 }) => {
  const t = useT();
  const pts = [...CHAIN, TARGET];
  const p = Math.max(0, (t - t0) / speed);
  const i = Math.min(Math.floor(p), pts.length - 2), f = Math.min(1, p - i);
  const mx = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, my = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f;
  return (
    <>
      <svg width={1080} height={1200} style={{ position: "absolute", left: 0, top: 0 }}>
        {pts.slice(0, -1).map((a, k) => (
          <line key={k} x1={a[0]} y1={a[1]} x2={pts[k + 1][0]} y2={pts[k + 1][1]} stroke={k < p ? C.amber : C.dim} strokeWidth={8} strokeDasharray="18 14" />
        ))}
      </svg>
      {CHAIN.map(([x, y], k) => (
        <At key={k} x={x} y={y}><Person size={k === 0 ? 104 : 92} color={k === 0 ? C.mint : k <= Math.max(lit, p) ? C.amber : C.ink} /></At>
      ))}
      <At x={TARGET[0]} y={TARGET[1]}><div style={{ width: 120, height: 120, borderRadius: 26, background: C.panel, border: `4px solid ${C.mint}`,
        display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="Briefcase" size={70} color={C.mint} /></div></At>
      <At x={mx} y={my - 70}><Icon name="Mail" size={78} color={C.amber} glow /></At>
    </>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const t5 = w(["5", "five"], 1, 2.2);
  return (
    <>
      <HookText y={300} size={96}>{"Nebraska → Boston:\n**5 friends**"}</HookText>
      <Riser to={t5} volume={0.45} />
      <Chain t0={0} speed={0.38} />
      <At x={140} y={880}><Text size={42} color={C.mint}>Nebraska</Text></At>
      <At x={930} y={690}><Text size={42} color={C.mint}>Boston</Text></At>
      <Punch at={t5}><At x={540} y={1110}><Appear at={t5 - 0.1} from="pop"><Chip color={C.amber} size={52}>a total stranger</Chip></Appear></At></Punch>
      <Sfx name="pack/whoosh-fast" at={0.05} volume={0.25} />
      <Sfx name="pack/ding" at={t5} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- no address
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tNo = w(["address"], 1, 0.6), tFirst = w(["first"], 1, 3.4);
  return (
    <>
      <Headline>No address</Headline>
      <At x={540} y={600}>
        <Appear at={0} from="pop">
          <div style={{ width: 760, height: 420, borderRadius: 28, background: C.panel, border: `4px solid ${C.dim}`, position: "relative", boxShadow: "0 30px 60px #0009" }}>
            <svg width={760} height={420} style={{ position: "absolute", left: 0, top: 0 }}>
              <polyline points="0,0 380,220 760,0" fill="none" stroke={C.dim} strokeWidth={6} />
            </svg>
            <div style={{ position: "absolute", left: 60, top: 250, fontFamily: F.mono, fontSize: 44, color: C.ink }}>To: a stockbroker</div>
            <div style={{ position: "absolute", left: 60, top: 320, fontFamily: F.mono, fontSize: 44, color: C.muted }}>Street: ???</div>
          </div>
        </Appear>
      </At>
      <At x={540} y={890}><Appear at={tNo} from="slam"><Stamp size={80} rotate={-6}>NO ADDRESS</Stamp></Appear></At>
      <At x={540} y={1060}><Appear at={tFirst - 0.2} from="up"><Chip color={C.mint} size={54}>first-name friends only</Chip></Appear></At>
      <Sfx name="pack/paper-crumple" at={0.1} volume={0.25} dur={0.6} />
    </>
  );
};

// ---------------------------------------------------------------- 296 folders, one stockbroker
const ContextBody: React.FC = () => {
  const w = useW();
  const t296 = w(["296"], 1, 1.4), tOne = w(["one"], 1, 3.0);
  const t = useT();
  const dots = Array.from({ length: 48 }, (_, i) => i);
  return (
    <>
      <Headline>Stanley Milgram's test</Headline>
      <At x={540} y={460}><Counter from={0} to={296} t0={t296 - 0.4} t1={t296 + 0.5} size={150} color={C.amber} /></At>
      <At x={540} y={570}><Text size={46} color={C.muted}>folders</Text></At>
      {dots.map((i) => {
        const a = (i / dots.length) * Math.PI * 2;
        const k = tween(t, tOne, tOne + 1.4, 0, 1);
        const r = 360 * (1 - k) + 40 * k;
        return (
          <At key={i} x={540 + Math.cos(a) * r * 1.05} y={860 + Math.sin(a) * r * 0.55}>
            <Appear at={0.2 + i * 0.02} from="fade" sfx={null}><Icon name="Folder" size={44} color={C.amber} /></Appear>
          </At>
        );
      })}
      <At x={540} y={860}><Appear at={tOne - 0.2} from="pop"><div style={{ width: 130, height: 130, borderRadius: 28, background: C.panel, border: `4px solid ${C.mint}`,
        display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="Briefcase" size={76} color={C.mint} /></div></Appear></At>
      <At x={540} y={1100}><Appear at={tOne + 0.3} from="up"><Text size={46} color={C.mint}>1 stockbroker in Boston</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- you in Omaha: pick the friend most likely to know him
const GuessBody: React.FC = () => {
  const w = useW();
  const tGuess = w(["guess"], 1, 2.0), tBoston = w(["Boston"], 1, 5.6), tStocks = w(["stocks"], 1, 6.6);
  const t = useT();
  return (
    <>
      <Headline>Don't guess</Headline>
      <At x={220} y={640}><Appear at={0} from="left"><Person size={150} color={C.mint} label="you, Omaha" ring /></Appear></At>
      <At x={240} y={460}><Appear at={0.3} from="pop"><Icon name="Mail" size={80} color={C.amber} /></Appear></At>
      {[["neighbour", 440, 0], ["friend in Boston", 640, tBoston], ["friend in stocks", 840, tStocks]].map(([lab, y, hi], k) => {
        const on = (hi as number) > 0 && t >= (hi as number) - 0.1;
        return (
          <At key={k} x={700} y={y as number}><Appear at={tGuess + 0.3 + k * 0.25} from="right">
            <div style={{ display: "flex", alignItems: "center", gap: 18, width: "max-content" }}>
              <Person size={84} color={on ? C.amber : C.muted} ring={on} />
              <span style={{ fontFamily: F.bold, fontSize: 46, color: on ? C.amber : C.muted }}>{lab}</span>
            </div></Appear></At>
        );
      })}
      <Arrow x1={330} y1={620} x2={480} y2={640} t0={tBoston - 0.1} t1={tBoston + 0.4} bend={-40} />
      <At x={540} y={1080}><Appear at={tGuess - 0.1} from="fade" sfx={null}><Text size={44} color={C.muted}>most likely to know him</Text></Appear></At>
      <Sfx name="pack/whoosh-arrow" at={tBoston} volume={0.3} />
      <Sfx name="pack/click-soft" at={tStocks} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 100, 10,000, ten billion
const MathBody: React.FC = () => {
  const w = useW();
  const t100 = w(["100"], 1, 1.6), tTwo = w(["10,000"], 1, 4.6), tFive = w(["billion"], 1, 6.6);
  const rows: [string, string, number, string][] = [["1 hop", "100", t100, C.ink], ["2 hops", "10,000", tTwo, C.ink], ["5 hops", "10,000,000,000", tFive, C.amber]];
  return (
    <>
      <Headline>Friends of friends</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tFive - 0.2, { zoom: 1 }], [tFive + 0.6, { zoom: 1.06, x: 540, y: 700 }]]}>
        {rows.map(([h, n, at, col], k) => (
          <At key={k} x={540} y={480 + k * 190} style={{ width: 860 }}>
            <Appear at={at - 0.15} from="up">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", width: 860 }}>
                <span style={{ fontFamily: F.med, fontSize: 52, color: C.muted }}>{h}</span>
                <span style={{ fontFamily: F.mono, fontSize: k === 2 ? 74 : 80, fontWeight: 700, color: col }}>{n}</span>
              </div>
            </Appear>
          </At>
        ))}
        <At x={540} y={1060}><Appear at={tFive + 0.4} from="fade" sfx={null}><Text size={46} color={C.mint}>more people than exist</Text></Appear></At>
      </Camera>
      <Sfx name="pack/ding" at={tFive} volume={0.35} />
    </>
  );
};

// a tight cluster of friends who all know each other
const Cluster: React.FC<{ cx: number; cy: number; r?: number; color?: string; n?: number; lit?: boolean }> = ({ cx, cy, r = 170, color = C.ink, n = 7, lit }) => {
  const pts = Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * 6.283 - 1.57) * r, cy + Math.sin((i / n) * 6.283 - 1.57) * r]);
  return (
    <>
      <svg width={1080} height={1200} style={{ position: "absolute", left: 0, top: 0 }}>
        {pts.flatMap((a, i) => pts.slice(i + 1).map((b, j) => (
          <line key={`${i}-${j}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={lit ? `${C.coral}aa` : `${color}55`} strokeWidth={4} />
        )))}
      </svg>
      {pts.map(([x, y], i) => <At key={i} x={x} y={y}><Person size={64} color={i === 0 && !lit ? C.mint : color} /></At>)}
    </>
  );
};

// ---------------------------------------------------------------- re-hook: overlap
const RehookBody: React.FC = () => {
  const w = useW();
  const tEach = w(["other"], 1, 1.6), tKill = w(["kill"], 1, 3.2);
  const t = useT();
  return (
    <>
      <Headline color={C.coral}>The overlap</Headline>
      <Shake at={tKill}><Cluster cx={540} cy={680} r={260} n={8} lit={t >= tEach} /></Shake>
      <At x={540} y={680}><Appear at={tEach} from="pop"><Chip color={C.coral} size={50}>same people, again</Chip></Appear></At>
      <Sfx name="pack/wrong" at={tKill} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- the far friend
const FarBody: React.FC = () => {
  const w = useW();
  const tAway = w(["away"], 1, 2.4), tJumps = w(["jumps"], 1, 4.6), tMiles = w(["miles"], 1, 5.6);
  return (
    <>
      <Headline>The friend who moved away</Headline>
      <Camera keys={[[0, { zoom: 1.1, x: 300, y: 640 }], [tJumps - 0.3, { zoom: 1.1, x: 300, y: 640 }], [tJumps + 0.5, { zoom: 0.95, x: 540, y: 680 }]]}>
        <Cluster cx={250} cy={640} r={150} n={6} />
        <Cluster cx={830} cy={760} r={140} n={6} color={C.mint} />
        <At x={250} y={860}><Text size={42} color={C.muted}>Omaha</Text></At>
        <At x={800} y={980}><Text size={42} color={C.mint}>Boston</Text></At>
        <Arrow x1={330} y1={520} x2={760} y2={640} t0={tJumps - 0.2} t1={tJumps + 0.5} bend={-200} />
      </Camera>
      <At x={540} y={1070}><Appear at={tMiles - 0.2} from="slam"><Chip color={C.amber} size={54}>1,300 miles, 1 hop</Chip></Appear></At>
      <At x={540} y={380}><Appear at={tAway - 0.2} out={tJumps - 0.3} from="fade" sfx={null}><Text size={44} color={C.muted}>one cousin, far away</Text></Appear></At>
      <Sfx name="pack/whoosh-swing" at={tJumps} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const t64 = w(["64"], 1, 0.4), t52 = w(["5.2"], 1, 2.0), tOne = w(["One"], 1, 4.2), tShop = w(["shop"], 1, 5.6);
  return (
    <>
      <Headline>What happened</Headline>
      <At x={290} y={500}><Counter from={0} to={64} t0={t64} t1={t64 + 0.6} size={140} color={C.ink} /></At>
      <At x={290} y={610}><Text size={42} color={C.muted}>folders arrived</Text></At>
      <Punch at={t52}><At x={780} y={500}><Appear at={t52 - 0.1} from="slam"><Text size={140} font={F.bold} color={C.amber} glow>5.2</Text></Appear></At></Punch>
      <At x={780} y={610}><Appear at={t52} from="fade" sfx={null}><Text size={42} color={C.muted}>people in between</Text></Appear></At>
      <At x={540} y={860}><Appear at={tOne - 0.1} from="up">
        <div style={{ display: "flex", alignItems: "center", gap: 24, width: "max-content" }}>
          <Icon name="Store" size={120} color={C.mint} />
          <span style={{ fontFamily: F.bold, fontSize: 58, color: C.mint }}>1 in 4: one shop owner</span>
        </div></Appear></At>
      <At x={540} y={1010}><Appear at={tShop} from="fade" sfx={null}><Text size={42} color={C.muted}>clothing store, the broker's hometown</Text></Appear></At>
      <Sfx name="pack/hit-grand" at={t52} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tFirst = w(["first"], 1, 1.4);
  return (
    <>
      <Chain t0={99} speed={0.4} />
      <At x={120} y={870}><Appear at={0} from="pop"><Text size={44} color={C.mint}>you</Text></Appear></At>
      <At x={250} y={480}><Appear at={tFirst - 0.2} from="pop"><Text size={110} color={C.amber} glow>?</Text></Appear></At>
      <At x={540} y={300}><Appear at={0} from="down"><Text size={66} font={F.display} color={C.ink}>Your first hop?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="guess"><GuessBody /></Span>
    <Span from="math"><MathBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="far"><FarBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
