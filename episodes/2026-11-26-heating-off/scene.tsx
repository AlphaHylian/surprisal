// "Heating on all day, or off while you're out?": a colder house leaks slower, so off always wins.
// versus hook -> rule out the reheat myth -> 0 C out, 20 in, 9 h -> leak grows with the gap -> on: 4 kW, 36 kWh
// -> off: drifts to 15, leak 3 -> re-hook: the warm-up -> it only refills the leak: 31 not 36 -> DOE 10% -> CTA
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// temperature -> interior colour (20 = warm amber, 15 = cooler)
const mix = (a: string, b: string, k: number) => {
  const p = (s: string, i: number) => parseInt(s.slice(1 + 2 * i, 3 + 2 * i), 16);
  const c = [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * k).toString(16).padStart(2, "0"));
  return `#${c.join("")}`;
};
const warmth = (temp: number) => mix("#2a4a6a", "#b86a2a", Math.max(0, Math.min(1, (temp - 10) / 10)));

// A house: walls + roof, a temperature readout inside, and heat arrows leaking out of the walls whose
// length and speed follow the leak (kW). `flame` shows the boiler running.
const House: React.FC<{ temp: number; leak: number; w?: number; flame?: boolean; off?: boolean; label?: string }> =
  ({ temp, leak, w = 420, flame = false, off = false, label }) => {
    const t = useT();
    const h = w * 0.72, roof = w * 0.42;
    const L = 30 + leak * 22;               // arrow length (px) per kW
    const arrows = [
      { x: -w / 2 - 10, y: roof + h * 0.35, dx: -1, dy: 0 }, { x: -w / 2 - 10, y: roof + h * 0.72, dx: -1, dy: 0 },
      { x: w / 2 + 10, y: roof + h * 0.35, dx: 1, dy: 0 }, { x: w / 2 + 10, y: roof + h * 0.72, dx: 1, dy: 0 },
      { x: -w * 0.28, y: roof * 0.35, dx: -0.6, dy: -0.8 }, { x: w * 0.28, y: roof * 0.35, dx: 0.6, dy: -0.8 },
    ];
    const W = w + 2 * (L + 60), H = roof + h + 40;
    const ox = W / 2;
    return (
      <div style={{ position: "relative", width: W, height: H }}>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <polygon points={`${ox - w / 2 - 20},${roof} ${ox},${0} ${ox + w / 2 + 20},${roof}`} fill={C.dim} stroke={C.muted} strokeWidth={6} strokeLinejoin="round" />
          <rect x={ox - w / 2} y={roof} width={w} height={h} rx={14} fill={warmth(temp)} stroke={C.muted} strokeWidth={6} />
          {arrows.map((a, i) => {
            const ph = ((t * (0.6 + leak * 0.25) + i * 0.17) % 1);
            const x0 = ox + a.x, y0 = a.y;
            const len = L * (0.55 + 0.45 * ph);
            const x1 = x0 + a.dx * len, y1 = y0 + a.dy * len;
            const op = leak <= 0 ? 0 : 0.35 + 0.65 * (1 - ph);
            return (
              <g key={i} opacity={op}>
                <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={C.coral} strokeWidth={10} strokeLinecap="round" />
                <circle cx={x1} cy={y1} r={11} fill={C.coral} />
              </g>
            );
          })}
        </svg>
        <div style={{ position: "absolute", left: ox - w / 2, top: roof + 18, width: w, textAlign: "center", fontFamily: F.bold, fontSize: w * 0.26, color: C.ink,
          textShadow: "0 4px 14px #000a" }}>{temp.toFixed(0)}°</div>
        <div style={{ position: "absolute", left: ox - 45, top: roof + h - 110, width: 90, height: 90, display: "flex", justifyContent: "center" }}>
          {flame ? <Icon name="Flame" size={90} color={C.amber} glow /> : off ? <Icon name="Snowflake" size={80} color={C.mint} /> : null}
        </div>
        {label ? <div style={{ position: "absolute", left: 0, top: H + 6, width: W, textAlign: "center" }}><Chip color={off ? C.mint : C.amber} size={46}>{label}</Chip></div> : null}
      </div>
    );
  };

// ---------------------------------------------------------------- hook: two houses side by side
const HookBody: React.FC = () => {
  const w = useW();
  const tOff = w(["off"], 1, 1.5);
  return (
    <>
      <Riser to={tOff} volume={0.45} />
      <HookText y={270} size={92}>{"Heating on all day\nvs **off while out**"}</HookText>
      <At x={280} y={760} scale={0.68}><House temp={20} leak={4} flame label="ON" /></At>
      <At x={800} y={760} scale={0.68}><House temp={15} leak={3} off label="OFF" /></At>
      <At x={540} y={760}><Text size={70} color={C.muted}>vs</Text></At>
      <Sfx name="pack/switch" at={tOff} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- rule out: the reheat myth
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tBurns = w(["burns"], 1, 2.2), tCant = w(["can't."], 1, 4.2);
  return (
    <>
      <Headline>"Reheating costs more"</Headline>
      <At x={540} y={700}><Appear at={0.05} out={tCant - 0.3} from="pop"><Icon name="Flame" size={260} color={C.coral} /></Appear></At>
      <At x={540} y={960}><Appear at={tBurns - 0.2} from="up"><Text size={56} color={C.coral}>burns more than you saved?</Text></Appear></At>
      <At x={540} y={700}><Appear at={tCant - 0.15} from="slam"><Chip color={C.amber} size={84}>It can't.</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- context: 0 out, 20 in, 9 hours
const ContextBody: React.FC = () => {
  const w = useW();
  const t0 = w(["0"], 1, 0.6), t20 = w(["20,", "20"], 1, 2.0), t9 = w(["9"], 1, 3.4);
  return (
    <>
      <Headline>Your day out</Headline>
      <At x={210} y={620}><Appear at={t0 - 0.2} from="pop"><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <Icon name="ThermometerSnowflake" size={150} color={C.mint} /><Text size={70} color={C.mint}>0° out</Text></div></Appear></At>
      <At x={560} y={680} scale={0.7}><Appear at={t20 - 0.3} from="up"><House temp={20} leak={4} /></Appear></At>
      <At x={540} y={1080}><Appear at={t9 - 0.2} from="up"><div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Icon name="Clock" size={80} color={C.amber} /><Text size={64} color={C.amber}>out for 9 hours</Text></div></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- the leak grows with the gap
const LeakBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tWall = w(["wall."], 1, 1.6), tGap = w(["gap"], 1, 3.0), tFaster = w(["faster"], 1, 4.6);
  const gap = tween(t, tGap, tFaster + 0.6, 5, 20);
  return (
    <>
      <Headline>Every wall leaks</Headline>
      <Camera keys={[[0, { zoom: 1.0 }], [tWall, { zoom: 1.08, y: 700 }]]}>
        <At x={540} y={680} scale={0.85}><House temp={gap} leak={gap / 5} /></At>
      </Camera>
      <At x={540} y={1100}><Appear at={tGap - 0.2} from="up"><Text size={60}>gap <span style={{ color: C.amber }}>{gap.toFixed(0)}°</span> → leak <span style={{ color: C.coral }}>{(gap / 5).toFixed(1)} kW</span></Text></Appear></At>
      <Sfx name="pack/transition-wind" at={tWall - 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- heating on: 4 kW, 36 kWh
const OnBody: React.FC = () => {
  const w = useW();
  const t4 = w(["4"], 1, 2.6), t36 = w(["36"], 1, 6.0), tRefill = w(["refill"], 1, 7.6);
  return (
    <>
      <Headline color={C.amber}>Heating on</Headline>
      <At x={540} y={620} scale={0.72}><House temp={20} leak={4} flame /></At>
      <At x={540} y={940}><Appear at={t4 - 0.2} from="pop"><Chip color={C.coral} size={56}>leaks 4 kW</Chip></Appear></At>
      <At x={540} y={1080}><div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
        <Counter from={0} to={36} t0={t36 - 1.6} t1={t36} size={110} color={C.amber} /><Text size={56} color={C.amber}>kWh</Text></div></At>
      <Sfx name="pack/transition-fire" at={tRefill - 0.3} volume={0.2} dur={1.5} />
    </>
  );
};

// ---------------------------------------------------------------- heating off: drifts to 15, leak 3
const OffBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t15 = w(["15."], 1, 1.8), tShrinks = w(["shrinks,"], 1, 2.8), t3 = w(["3."], 1, 4.4);
  const temp = tween(t, 0.2, t15 + 0.2, 20, 15);
  return (
    <>
      <Headline color={C.mint}>Heating off</Headline>
      <At x={540} y={620} scale={0.72}><House temp={temp} leak={temp / 5} off /></At>
      <At x={540} y={940}><Appear at={tShrinks - 0.2} from="up"><Text size={58}>gap 20° → <span style={{ color: C.mint }}>15°</span></Text></Appear></At>
      <At x={540} y={1070}><Appear at={t3 - 0.3} from="pop"><Chip color={C.mint} size={56}>leak slows to 3 kW</Chip></Appear></At>
      <Sfx name="pack/switch" at={0.15} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook: the warm-up
const RehookBody: React.FC = () => {
  const w = useW();
  const tWarm = w(["warm"], 1, 1.4), tCatch = w(["catch,"], 1, 3.6);
  return (
    <>
      <Headline color={C.amber}>The catch?</Headline>
      <At x={540} y={660}><Appear at={0.05} from="pop"><Icon name="Moon" size={200} color={C.ink} /></Appear></At>
      <At x={540} y={900}><Appear at={tWarm - 0.2} from="up"><Text size={60}>warm the whole house back up</Text></Appear></At>
      <At x={540} y={1060}><Appear at={tCatch - 0.2} from="slam"><Text size={110} color={C.coral}>?</Text></Appear></At>
      <Sfx name="pack/suspense-sting" at={0.2} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- refill: 31 not 36
const RefillBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tBack = w(["back"], 1, 1.2), t31 = w(["31,"], 1, 4.0), t36 = w(["36."], 1, 4.8);
  const k1 = tween(t, tBack, tBack + 1.0, 0, 1), k2 = tween(t, t31 - 0.8, t31, 0, 1);
  const bar = (v: number, k: number, color: string, label: string, y: number) => (
    <div style={{ position: "absolute", left: 120, top: y, width: 840 }}>
      <div style={{ fontFamily: F.med, fontSize: 44, color: C.muted, marginBottom: 10 }}>{label}</div>
      <div style={{ width: 840, height: 100, borderRadius: 18, background: "#1b2333", overflow: "hidden" }}>
        <div style={{ width: (840 * v / 36) * k, height: 100, background: color, display: "flex", alignItems: "center", justifyContent: "flex-end",
          paddingRight: 24, boxSizing: "border-box", fontFamily: F.bold, fontSize: 60, color: C.bg }}>{k > 0.6 ? `${v} kWh` : ""}</div>
      </div>
    </div>
  );
  return (
    <>
      <Headline>Warm-up = what leaked</Headline>
      {bar(36, k1, C.amber, "on all day", 470)}
      {bar(31, k2, C.mint, "off, then warm up", 720)}
      <At x={540} y={1060}><Appear at={t36 - 0.1} from="slam"><Chip color={C.amber} size={64}>5 kWh saved</Chip></Appear></At>
      <Sfx name="pack/notify-idea" at={t36} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const tWins = w(["wins."], 1, 2.4), t10 = w(["10%", "10"], 1, 5.4);
  return (
    <>
      <Headline>A cold house leaks slower</Headline>
      <Punch at={tWins}>
        <At x={540} y={640} scale={0.72}><House temp={15} leak={3} off /></At>
      </Punch>
      <At x={540} y={960}><Appear at={tWins - 0.2} from="slam"><Chip color={C.mint} size={70}>off always wins</Chip></Appear></At>
      <At x={540} y={1100}><Appear at={t10 - 0.3} from="up"><Text size={56}>US DOE: up to <span style={{ color: C.amber }}>10% a year</span></Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tTwice = w(["twice"], 1, 1.6), tMuch = w(["much?"], 1, 3.0);
  return (
    <>
      <At x={540} y={620}><Appear at={0.05} from="pop"><div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Icon name="Clock" size={120} color={C.ink} /><Text size={90}>9 h</Text></div></Appear></At>
      <At x={540} y={800}><Appear at={tTwice - 0.2} from="pop"><Text size={110} color={C.amber}>18 h → 2× saved?</Text></Appear></At>
      <At x={540} y={1030}><Appear at={tMuch - 0.3} from="up"><Chip color={C.amber} size={52}>what do you think?</Chip></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="leak"><LeakBody /></Span>
    <Span from="on"><OnBody /></Span>
    <Span from="off"><OffBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="refill"><RefillBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
