// "166,000 people could unlock your phone": fingerprint false-match rate times the world, and the 5-try limit.
// claim hook (166,000 strangers) -> not hackers, not copies -> 1 in 50,000 -> a map of ridges, scored
// -> a bar one stranger in 50,000 clears -> 8.3 billion / 50,000 -> re-hook: 5 -> 5 tries = 1 in 10,000
// = a 4-digit PIN -> face: 1 in a million, ~8,300 -> payoff -> CTA subscribe (loops to the hook)
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};
const rnd = (s: number) => { const x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); };

const Phone: React.FC<{ glow?: string; children?: React.ReactNode; w?: number; h?: number }> = ({ glow = C.mint, children, w = 300, h = 560 }) => (
  <div style={{ width: w, height: h, borderRadius: 48, background: C.panel, border: `8px solid ${C.ink}`, boxShadow: `0 0 50px ${glow}55, 0 16px 40px #000c`,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>{children}</div>
);

// ---------------------------------------------------------------- hook: a phone and a crowd, some fingers pass
const HookBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tNum = w(["166000", "166,000"], 1, 1.4);
  const crowd = Array.from({ length: 60 }, (_, i) => ({ x: 90 + (i % 12) * 82 + (Math.floor(i / 12) % 2) * 40, y: 560 + Math.floor(i / 12) * 84, hit: rnd(i + 3) < 0.12 }));
  return (
    <>
      <HookText y={260} size={88}>{"Your phone opens for\n**166,000** strangers"}</HookText>
      <Riser to={tNum} volume={0.45} />
      <Camera keys={[[0, { zoom: 1 }], [tNum + 1, { zoom: 1.06 }]]}>
        {crowd.map((p, i) => {
          const on = p.hit && t > 0.3 + rnd(i) * 1.6;
          const near = Math.abs(p.x - 540) < 200;
          return near ? null : (
            <At key={i} x={p.x} y={p.y}><Icon name="User" size={60} color={on ? C.amber : C.muted} stroke={on ? 2.6 : 2} glow={on} /></At>
          );
        })}
        <At x={540} y={800}><Appear at={0} from="pop"><Phone glow={C.amber}><Icon name="Fingerprint" size={190} color={C.amber} glow /><Icon name="LockOpen" size={70} color={C.mint} /></Phone></Appear></At>
      </Camera>
      <Sfx name="pack/access-granted" at={0.4} volume={0.2} />
      <Sfx name="pack/hit-swell" hit={tNum} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rule out: not hackers, not copies
const Out: React.FC<{ t: number; children: string }> = ({ t, children }) => (
  <div style={{ position: "relative" }}>
    <Chip color={C.panel} text={C.ink} size={70}>{children}</Chip>
    <div style={{ position: "absolute", left: -10, right: -10, top: "50%" }}>
      <Appear at={t + 0.4} from="slam" sfx={null}><div style={{ height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-4deg)", boxShadow: `0 0 20px ${C.coral}` }} /></Appear>
    </div>
  </div>
);
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tFing = w(["finger"], 1, 0.4), tHack = w(["hackers"], 1, 1.2), tCopy = w(["copies"], 1, 2.0), tStr = w(["strangers"], 1, 3.0);
  return (
    <>
      <Headline>Who gets in?</Headline>
      <At x={540} y={480}><Appear at={Math.max(0.05, tFing - 0.3)} from="pop"><Icon name="Hand" size={150} color={C.ink} /></Appear></At>
      <At x={540} y={680}><Appear at={tHack - 0.25} from="left"><Out t={tHack}>hackers</Out></Appear></At>
      <At x={540} y={830}><Appear at={tCopy - 0.25} from="right"><Out t={tCopy}>fake copies</Out></Appear></At>
      <At x={540} y={1010}><Appear at={tStr - 0.25} from="slam"><Chip color={C.amber} size={66}>just strangers</Chip></Appear></At>
      <Sfx name="pack/wrong" at={tHack + 0.4} volume={0.2} />
      <Sfx name="pack/wrong" at={tCopy + 0.4} volume={0.2} />
    </>
  );
};

// ---------------------------------------------------------------- context: 1 in 50,000
const ContextBody: React.FC = () => {
  const w = useW();
  const tRandom = w(["random"], 1, 1.2), t50 = w(["time"], 1, 2.2) + 0.35;
  return (
    <>
      <Headline>The maker's number</Headline>
      <At x={540} y={560}><Appear at={0.05} from="pop"><Icon name="Fingerprint" size={260} color={C.ink} /></Appear></At>
      <At x={540} y={770}><Appear at={tRandom - 0.2} from="fade" sfx={null}><Text size={52} color={C.muted}>a random finger gets in</Text></Appear></At>
      <Punch at={t50}><At x={540} y={930}><Appear at={t50 - 0.4} from="slam"><div style={{ fontFamily: F.bold, fontSize: 116, color: C.amber, whiteSpace: "nowrap" }}>1 in 50,000</div></Appear></At></Punch>
    </>
  );
};

// ---------------------------------------------------------------- the phone keeps a map of ridge points, and scores touches
const MIN: [number, number][] = [[470, 520], [610, 500], [430, 640], [560, 610], [660, 660], [500, 740], [620, 780], [450, 850], [580, 880], [530, 680]];
const MapBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tPic = w(["picture"], 1, 1.0), tMap = w(["map"], 1, 2.6), tScore = w(["scores"], 1, 4.4);
  const score = Math.round(tween(t, tScore, tScore + 1.0, 0, 97));
  return (
    <>
      <Headline>No picture. A map.</Headline>
      <At x={540} y={700}><div style={{ opacity: tween(t, tMap - 0.2, tMap + 0.6, 1, 0.18) }}><Icon name="Fingerprint" size={480} color={C.ink} stroke={1.2} /></div></At>
      <At x={820} y={420}><Appear at={tPic - 0.2} out={tMap - 0.3} from="pop"><div style={{ position: "relative" }}><Icon name="Image" size={110} color={C.muted} />
        <div style={{ position: "absolute", left: -10, right: -10, top: 50, height: 10, background: C.coral, transform: "rotate(-30deg)", borderRadius: 5 }} /></div></Appear></At>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {MIN.slice(0, -1).map(([x, y], i) => {
          const [x2, y2] = MIN[i + 1]; const p = tween(t, tMap + 0.1 + i * 0.08, tMap + 0.3 + i * 0.08, 0, 1);
          return <line key={i} x1={x} y1={y} x2={x + (x2 - x) * p} y2={y + (y2 - y) * p} stroke={C.mint} strokeWidth={4} opacity={0.7} />;
        })}
        {MIN.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={tween(t, tMap + i * 0.08, tMap + 0.2 + i * 0.08, 0, 16)} fill={C.mint} />)}
      </svg>
      <At x={540} y={1060}><Appear at={tScore - 0.2} from="up"><div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
        <Text size={56} color={C.muted}>match score</Text><div style={{ fontFamily: F.bold, fontSize: 96, color: C.mint, width: 120 }}>{score}</div></div></Appear></At>
      <Sfx name="pack/processing" at={tMap} volume={0.2} dur={1.2} />
      <Sfx name="pack/digits" at={tScore} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- the bar: your touches vs strangers
const curve = (mu: number, sd: number, x0: number, x1: number, base: number, hgt: number) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 8) { const z = (x - mu) / sd; pts.push(`${x},${base - hgt * Math.exp(-z * z / 2)}`); }
  return `M${x0},${base} L${pts.join(" L")} L${x1},${base} Z`;
};
const BarBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tPerfect = w(["perfect"], 1, 1.6), tBar = w(["bar"], 1, 3.4), tStr = w(["stranger"], 1, 4.4);
  const base = 980, barX = tween(t, tBar - 0.2, tBar + 0.6, 260, 690);
  return (
    <>
      <Headline>Set the bar</Headline>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={curve(330, 70, 90, 600, base, 380)} fill={C.coral} opacity={tween(t, 0.05, 0.5, 0, 0.75)} />
        <path d={curve(820, 60, 600, 1000, base, 300)} fill={C.mint} opacity={tween(t, tPerfect - 0.3, tPerfect + 0.3, 0, 0.8)} />
        <line x1={90} y1={base} x2={1000} y2={base} stroke={C.ink} strokeWidth={4} />
        <line x1={barX} y1={460} x2={barX} y2={base + 10} stroke={C.amber} strokeWidth={10} opacity={tween(t, tBar - 0.3, tBar, 0, 1)} />
      </svg>
      <At x={300} y={1040}><Appear at={0.1} from="up"><Text size={48} color={C.coral}>strangers</Text></Appear></At>
      <At x={820} y={1040}><Appear at={tPerfect - 0.3} from="up"><Text size={48} color={C.mint}>you</Text></Appear></At>
      <At x={barX} y={420}><Appear at={tBar} from="pop"><Chip color={C.amber} size={44}>the bar</Chip></Appear></At>
      <At x={540} y={1130}><Appear at={tStr - 0.2} from="pop"><Chip color={C.amber} size={46}>1 stranger in 50,000 clears it</Chip></Appear></At>
      <Sfx name="pack/whoosh-mid" at={tBar - 0.2} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 8.3 billion / 50,000 = 166,000
const WorldBody: React.FC = () => {
  const w = useW();
  const tBil = w(["billion"], 1, 1.0), tDiv = w(["divide"], 1, 2.2), tThat = w(["That's", "Thats"], 1, 3.4);
  return (
    <>
      <Headline>Everyone on Earth</Headline>
      <At x={540} y={500}><Appear at={0.05} from="pop"><Icon name="Globe" size={200} color={C.mint} /></Appear></At>
      <At x={540} y={700}><Appear at={tBil - 0.4} from="up"><Text size={84} font={F.mono}>8,300,000,000</Text></Appear></At>
      <At x={540} y={820}><Appear at={tDiv - 0.2} from="up"><Text size={72} font={F.mono} color={C.muted}>÷ 50,000</Text></Appear></At>
      <Punch at={tThat + 0.4}><At x={540} y={990}><Appear at={tThat - 0.1} from="slam">
        <Counter from={0} to={166000} t0={tThat - 0.1} t1={tThat + 0.5} size={150} color={C.amber} comma />
      </Appear></At></Punch>
      <Sfx name="pack/boom-short" at={tThat + 0.5} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook: one more number, 5
const RehookBody: React.FC = () => {
  const w = useW();
  const tSafe = w(["safe"], 1, 0.8), t5 = w(["5"], 1, 2.4);
  return (
    <>
      <Headline color={C.amber}>So why are you safe?</Headline>
      <At x={540} y={620}><Appear at={Math.max(0.05, tSafe - 0.4)} from="pop"><Icon name="ShieldQuestion" size={220} color={C.mint} /></Appear></At>
      <Punch at={t5}><At x={540} y={940}><Appear at={t5 - 0.25} from="slam"><div style={{ fontFamily: F.bold, fontSize: 260, color: C.amber }}>5</div></Appear></At></Punch>
      <Sfx name="pack/suspense-sting" at={t5} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 5 misses -> passcode: 1 in 10,000 = a 4-digit PIN
const TriesBody: React.FC = () => {
  const w = useW();
  const tMiss = w(["misses"], 1, 0.6), tLock = w(["passcode"], 1, 1.6), t10k = w(["10000", "10,000"], 1, 4.0), tPin = w(["PIN"], 1, 6.0);
  return (
    <>
      <Headline>5 tries, then the passcode</Headline>
      {[0, 1, 2, 3, 4].map((i) => (
        <At key={i} x={220 + i * 160} y={500}><Appear at={Math.max(0.05, tMiss - 0.6) + i * 0.18} from="pop" sfx={null}>
          <div style={{ width: 120, height: 120, borderRadius: 60, border: `6px solid ${C.coral}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="X" size={80} color={C.coral} /></div></Appear></At>
      ))}
      {[0, 1, 2, 3, 4].map((i) => <Sfx key={i} name="pack/access-denied" at={Math.max(0.05, tMiss - 0.6) + i * 0.18} volume={0.12} />)}
      <At x={540} y={700}><Appear at={tLock - 0.2} from="drop"><Icon name="Lock" size={130} color={C.ink} /></Appear></At>
      <Punch at={t10k}><At x={540} y={880}><Appear at={t10k - 0.4} from="slam"><Chip color={C.amber} size={70}>1 in 10,000</Chip></Appear></At></Punch>
      <At x={540} y={1060}><Appear at={tPin - 0.4} from="up"><div style={{ display: "flex", gap: 16 }}>
        {["?", "?", "?", "?"].map((c, i) => <div key={i} style={{ width: 100, height: 120, borderRadius: 16, background: C.panel, border: `4px solid ${C.mint}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontSize: 70, color: C.mint }}>{c}</div>)}
      </div></Appear></At>
      <Sfx name="pack/slam-metal" at={tLock} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- face: 20x higher bar, 1 in a million, ~8,300 faces
const FaceBody: React.FC = () => {
  const w = useW();
  const t20 = w(["20"], 1, 1.4), tMil = w(["million"], 1, 2.8), t8 = w(["8300", "8,300"], 1, 4.0);
  return (
    <>
      <Headline>Face unlock</Headline>
      <At x={540} y={540}><Appear at={0.05} from="pop"><Icon name="ScanFace" size={240} color={C.mint} /></Appear></At>
      <At x={540} y={740}><Appear at={t20 - 0.3} from="up"><Chip color={C.mint} size={56}>bar 20× higher</Chip></Appear></At>
      <At x={540} y={910}><Appear at={tMil - 0.4} from="slam"><div style={{ fontFamily: F.bold, fontSize: 96, color: C.amber, whiteSpace: "nowrap" }}>1 in 1,000,000</div></Appear></At>
      <At x={540} y={1060}><Appear at={t8 - 0.4} from="up"><Text size={60}>≈ 8,300 faces on Earth</Text></Appear></At>
      <Sfx name="pack/power-up" at={t20} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const tThief = w(["thief"], 1, 2.4), t5 = w(["5"], 1, 3.2);
  return (
    <>
      <At x={540} y={460}><Appear at={0.05} from="pop"><div style={{ fontFamily: F.bold, fontSize: 130, color: C.amber }}>166,000</div></Appear></At>
      <At x={540} y={580}><Appear at={0.2} from="fade" sfx={null}><Text size={54} color={C.muted}>could open it</Text></Appear></At>
      <At x={540} y={760}><Appear at={tThief - 0.3} from="right"><Icon name="UserRound" size={140} color={C.coral} /></Appear></At>
      <At x={540} y={960}><Appear at={t5 - 0.3} from="slam"><Chip color={C.mint} size={66}>gets 5 tries</Chip></Appear></At>
      <Sfx name="pack/correct" at={t5} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tOne = w(["one"], 1, 1.4);
  return (
    <>
      <At x={540} y={640}><Appear at={0.05} from="pop"><Icon name="Fingerprint" size={300} color={C.ink} /></Appear></At>
      <At x={540} y={940}><Appear at={tOne - 0.3} from="fade"><Text size={60} color={C.muted}>one of a kind?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="map"><MapBody /></Span>
    <Span from="bar"><BarBody /></Span>
    <Span from="world"><WorldBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="tries"><TriesBody /></Span>
    <Span from="face"><FaceBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
