// "One slow phone can slow down your whole Wi-Fi": the 802.11 performance anomaly.
// claim hook -> not hogging, just far -> 11 vs 1 Mb/s -> equal turns -> 1 ms vs 12 ms on the air -> re-hook
// -> one round: 3 short blocks + 1 long one, 3/4 of the air -> 1.9 vs 0.6 Mb/s each -> equal turns, unequal time -> CTA
import React from "react";
import { Appear, At, C, Camera, Chip, F, Headline, HookText, Icon, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// ---------------------------------------------------------------- the home network
// router in the middle, 3 laptops on the left, the far phone up and to the right
const LAPTOPS: [number, number][] = [[200, 560], [200, 760], [200, 960]];
const PHONE: [number, number] = [840, 560];
const ROUTER: [number, number] = [520, 760];

const Waves: React.FC<{ x: number; y: number; color?: string; t0?: number }> = ({ x, y, color = C.mint, t0 = 0 }) => {
  const t = useT();
  const rings = [0, 1, 2].map((k) => {
    const ph = ((t - t0) * 0.9 + k / 3) % 1;
    return <circle key={k} cx={x} cy={y} r={40 + ph * 160} fill="none" stroke={color} strokeWidth={5} opacity={(1 - ph) * 0.5} />;
  });
  return <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>{rings}</svg>;
};

const Net: React.FC<{ slow?: number; hiLaptop?: boolean; labels?: boolean; dim?: boolean }> = ({ slow = 0, hiLaptop = false, labels = true, dim = false }) => (
  <>
    <Waves x={ROUTER[0]} y={ROUTER[1]} />
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      {LAPTOPS.map(([x, y], i) => <line key={i} x1={ROUTER[0]} y1={ROUTER[1]} x2={x + 80} y2={y} stroke={C.mint} strokeWidth={6} opacity={dim ? 0.3 : 0.7} />)}
      <line x1={ROUTER[0]} y1={ROUTER[1]} x2={PHONE[0] - 50} y2={PHONE[1] + 40} stroke={slow > 0.5 ? C.coral : C.mint} strokeWidth={6}
        strokeDasharray={slow > 0.5 ? "14 18" : undefined} opacity={0.8} />
    </svg>
    <At x={ROUTER[0]} y={ROUTER[1]}><Icon name="Router" size={170} color={C.ink} /></At>
    {LAPTOPS.map(([x, y], i) => (
      <At key={i} x={x} y={y}><div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Icon name="Laptop" size={130} color={hiLaptop && i === 0 ? C.amber : C.ink} />
        {labels ? <Text size={42} color={C.mint}>11</Text> : null}
      </div></At>
    ))}
    <At x={PHONE[0]} y={PHONE[1]}><div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Icon name="Smartphone" size={130} color={slow > 0.5 ? C.coral : C.ink} />
      {labels ? <Text size={42} color={slow > 0.5 ? C.coral : C.mint}>{slow > 0.5 ? "1" : "11"}</Text> : null}
    </div></At>
  </>
);

// ---------------------------------------------------------------- the air: one round of turns
const MS = 54.9;                    // px per millisecond (17.1 ms round = 940 px)
const FAST = 1.42, SLOW = 12.87;    // ms on the air per packet, with overhead (verify.py)
const AirBar: React.FC<{ t0: number; speed?: number; y?: number; showSlow?: boolean; labels?: boolean }> = ({ t0, speed = 6, y = 1040, showSlow = true, labels = true }) => {
  const t = useT();
  const fill = Math.max(0, (t - t0) * speed);            // ms drawn so far
  const segs: [number, number, string, string][] = [[0, FAST, C.mint, "1"], [FAST, FAST, C.mint, "1"], [2 * FAST, FAST, C.mint, "1"]];
  if (showSlow) segs.push([3 * FAST, SLOW, C.coral, "12 ms"]);
  return (
    <div style={{ position: "absolute", left: 70, top: y - 50, width: 940, height: 100, borderRadius: 18, background: "#1b202b" }}>
      {segs.map(([s, d, col, lab], i) => {
        const w = Math.max(0, Math.min(d, fill - s)) * MS;
        if (w <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: s * MS + 3, top: 6, width: Math.max(0, w - 6), height: 88, borderRadius: 12, background: col,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.bold, fontSize: 44, color: C.bg, overflow: "hidden" }}>
            {labels && w > 40 ? lab : ""}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const tDrags = w(["drags"], 1, 1.4), tSpeed = w(["speed."], 1, 2.4);
  return (
    <>
      <HookText y={250} size={96}>{"**1** slow phone.\n**Everyone** slow."}</HookText>
      <Riser to={tDrags} volume={0.45} />
      <Camera keys={[[0, { zoom: 1 }], [tSpeed + 0.5, { zoom: 1.05 }]]}>
        <Appear at={0} from="fade"><Net slow={1} /></Appear>
        <At x={540} y={1110}><Appear at={0} from="up" sfx={null}><Chip color={C.coral} size={52}>every device: 0.6 Mb/s</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/disconnected" at={tDrags} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tHog = w(["hogging"], 1, 0.6), tFar = w(["far"], 1, 1.8);
  const t = useT();
  const k = tween(t, tFar - 0.2, tFar + 0.6, 0, 1);
  return (
    <>
      <Headline>Not hogging. Just far.</Headline>
      <At x={540} y={700}><Icon name="Router" size={150} /></At>
      <At x={540 + 300 * k} y={700 - 120 * k}><Icon name="Smartphone" size={120} color={k > 0.5 ? C.coral : C.ink} /></At>
      <At x={540} y={950}><Appear at={tHog - 0.2} from="pop"><Chip color={C.muted} size={48}>✗ using all the data</Chip></Appear></At>
      <At x={540} y={1080}><Appear at={tFar} from="slam"><Chip color={C.amber} size={52}>far from the router</Chip></Appear></At>
      <Sfx name="pack/wrong" at={tHog} volume={0.22} />
    </>
  );
};

// ---------------------------------------------------------------- context: 11 vs 1
const ContextBody: React.FC = () => {
  const w = useW();
  const tOne = w(["1."], 1, 2.8), tLap = w(["laptops"], 1, 3.8);
  const slow = useT() > tOne - 0.2 ? 1 : 0;
  return (
    <>
      <Headline>Megabits a second</Headline>
      <Camera keys={[[0, { zoom: 1.0 }], [tOne - 0.3, { zoom: 1.0 }], [tOne + 0.4, { zoom: 1.25, x: 760, y: 640 }], [tLap, { zoom: 1.25, x: 760, y: 640 }], [tLap + 0.6, { zoom: 1.0 }]]}>
        <Net slow={slow} />
      </Camera>
      <Sfx name="pack/glitch" at={tOne - 0.2} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- equal turns
const TurnsBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tTurns = w(["turns."], 1, 1.2), tEqual = w(["equal"], 1, 2.4);
  // a highlight that hops round the 4 devices: one turn each
  const order: [number, number][] = [...LAPTOPS, PHONE];
  const k = t > tTurns ? Math.floor((t - tTurns) * 2.2) % 4 : -1;
  return (
    <>
      <Headline>One turn each</Headline>
      <Net slow={1} labels={false} dim />
      {k >= 0 ? <At x={order[k][0]} y={order[k][1]}><div style={{ width: 200, height: 200, borderRadius: 100, border: `8px solid ${C.amber}`, boxShadow: `0 0 40px ${C.amber}88` }} /></At> : null}
      <At x={540} y={1110}><Appear at={tEqual - 0.2} from="up"><Chip color={C.mint} size={50}>equal shot at the next packet</Chip></Appear></At>
      {[0, 1, 2, 3, 4, 5].map((i) => <Sfx key={i} name="pack/click-soft" at={tTurns + i / 2.2} volume={0.15} />)}
    </>
  );
};

// ---------------------------------------------------------------- airtime: 1 ms vs 12 ms
const AirtimeBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tMs = w(["millisecond."], 1, 2.6), t12 = w(["12."], 1, 4.6);
  const fw = tween(t, tMs - 0.6, tMs, 0, FAST * MS), sw = tween(t, t12 - 0.8, t12 + 0.3, 0, SLOW * MS);
  return (
    <>
      <Headline>Time on the air</Headline>
      <At x={180} y={560}><Icon name="Laptop" size={110} /></At>
      <div style={{ position: "absolute", left: 270, top: 520, width: fw, height: 80, borderRadius: 12, background: C.mint }} />
      <At x={300 + FAST * MS + 70} y={560}><Appear at={tMs - 0.1} from="pop"><Text size={52} color={C.mint}>~1 ms</Text></Appear></At>
      <At x={180} y={800}><Icon name="Smartphone" size={110} color={C.coral} /></At>
      <div style={{ position: "absolute", left: 270, top: 760, width: Math.min(sw, 760), height: 80, borderRadius: 12, background: C.coral }} />
      <At x={540} y={950}><Appear at={t12 - 0.1} from="slam"><Text size={80} color={C.coral}>12 ms</Text></Appear></At>
      <At x={540} y={1100}><Appear at={t12 + 0.4} from="up"><Text size={48} color={C.muted}>same 1,500-byte packet</Text></Appear></At>
      <Sfx name="pack/whoosh-tiny" at={tMs - 0.5} volume={0.3} />
      <Sfx name="pack/whoosh-long" at={t12 - 0.8} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const w = useW();
  const tFair = w(["fair."], 1, 1.2), tLap = w(["laptop."], 1, 2.4);
  return (
    <>
      <Headline color={C.amber}>Sounds fair…</Headline>
      <At x={540} y={680}><Icon name="Scale" size={260} color={C.mint} /></At>
      <At x={540} y={1000}><Appear at={tLap - 0.3} from="pop"><Icon name="Laptop" size={170} color={C.amber} /></Appear></At>
      <Sfx name="pack/suspense-sting" at={tFair} volume={0.28} />
    </>
  );
};

// ---------------------------------------------------------------- one round
const RoundBody: React.FC = () => {
  const w = useW();
  const tEach = w(["each."], 1, 2.2), tWaits = w(["waits"], 1, 3.4), tQ = w(["quarters"], 1, 6.2);
  const t0 = tEach - 1.6;
  return (
    <>
      <Headline>One round of turns</Headline>
      <At x={200} y={660}><div style={{ display: "flex", gap: 10 }}>{[0, 1, 2].map((i) => <Icon key={i} name="Laptop" size={100} color={C.mint} />)}</div></At>
      <At x={850} y={660}><Icon name="Smartphone" size={110} color={C.coral} /></At>
      <At x={540} y={820}><Appear at={tWaits - 0.2} from="up"><Text size={50} color={C.muted}>everyone else waits…</Text></Appear></At>
      {/* 3 fast blocks while "millisecond each", then the long one from "waits" */}
      <AirBar t0={t0} speed={FAST * 3 / 1.6} showSlow={false} />
      <AirBarSlow t0={tWaits - 0.2} />
      <At x={540} y={1150}><Appear at={tQ - 0.3} from="slam"><Chip color={C.amber} size={56}>¾ of the air: 1 phone</Chip></Appear></At>
      <Sfx name="pack/clock-fast" at={tWaits} volume={0.2} dur={1.6} />
    </>
  );
};
const AirBarSlow: React.FC<{ t0: number }> = ({ t0 }) => {
  const t = useT();
  const w = tween(t, t0, t0 + 1.8, 0, SLOW * MS);
  if (w <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 70 + 3 * FAST * MS + 3, top: 996, width: w - 6, height: 88, borderRadius: 12, background: C.coral,
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.bold, fontSize: 48, color: C.bg }}>{w > 200 ? "12 ms" : ""}</div>
  );
};

// ---------------------------------------------------------------- result: 1.9 -> 0.6
const ResultBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t19 = w(["1.9"], 1, 1.8), t06 = w(["0.6."], 1, 3.6), tOwn = w(["own"], 1, 5.0);
  const h = (v: number) => v * 300;
  const after = t > t06 - 0.3;
  const k = tween(t, t06 - 0.4, t06 + 0.2, 0, 1);
  const v = after ? 1.9 + (0.6 - 1.9) * k : 1.9;
  return (
    <>
      <Headline>Each device gets…</Headline>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: "absolute", left: 150 + i * 200, top: 1000 - h(t > t19 - 0.4 ? v : 0), width: 140, height: h(t > t19 - 0.4 ? v : 0),
          borderRadius: 14, background: after ? C.coral : C.mint }} />
      ))}
      {[0, 1, 2, 3].map((i) => <At key={"i" + i} x={220 + i * 200} y={1080}><Icon name={i < 3 ? "Laptop" : "Smartphone"} size={90} /></At>)}
      <At x={540} y={380}><Appear at={t19 - 0.3} from="pop"><Text size={84} color={after ? C.coral : C.mint}>{after ? "0.6 Mb/s" : "1.9 Mb/s"}</Text></Appear></At>
      <div style={{ position: "absolute", left: 120, top: 1000 - h(1), width: 840, borderTop: `5px dashed ${C.amber}`, opacity: t > tOwn - 0.3 ? 1 : 0 }} />
      <At x={540} y={1000 - h(1) - 40}><Appear at={tOwn - 0.3} from="fade"><Text size={44} color={C.amber}>the phone's own speed: 1</Text></Appear></At>
      <Sfx name="pack/struck-down" at={t06 - 0.3} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const tUnequal = w(["unequal"], 1, 1.0), tSlowest = w(["slowest"], 1, 2.4), tTime = w(["time,"], 2, 5.4);
  return (
    <>
      <Headline>Equal turns, <span style={{ color: C.amber }}>unequal time</span></Headline>
      <AirBar t0={-10} y={600} />
      <At x={540} y={800}><Appear at={tSlowest - 0.3} from="slam"><Chip color={C.amber} size={54}>slowest device sets the speed</Chip></Appear></At>
      <At x={540} y={1020}><Appear at={tTime - 0.6} from="up"><Text size={52} color={C.mint}>fix: share by time, not turns</Text></Appear></At>
      <Sfx name="pack/correct" at={tUnequal} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => (
  <>
    <Camera keys={[[0, { zoom: 1 }], [2.5, { zoom: 1.06 }]]}><Net slow={1} /></Camera>
    <At x={540} y={1120}><Appear at={0.6} from="pop"><Text size={56} color={C.muted}>hogging your data?</Text></Appear></At>
  </>
);

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="turns"><TurnsBody /></Span>
    <Span from="airtime"><AirtimeBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="round"><RoundBody /></Span>
    <Span from="result"><ResultBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
