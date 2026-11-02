// "Why riding faster gets you more red lights": a green wave (10 lights, 250 m apart, 45 s offsets = 20 km/h).
// versus hook (20: no reds, 30: at least nine) -> rule out (lights set for one speed) -> setup -> at 20: zero stops
// -> at 30: gain 15 s a block -> re-hook: wait, sprint, red -> stuck at the front of the wave, 15 s each
// -> payoff: 2.5 min vs under 30 s, Copenhagen -> CTA.
// The lights and bikes are driven by the same model as verify.py (60 s cycle, 30 s green, offset 45 s per light).
import React from "react";
import {
  Appear, At, C, Camera, Chip, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text, tween, useAt, useT,
} from "../kit";

const OFF = 45, CYCLE = 60, GREEN = 30, N = 10;
const X0 = 110, DX = 86, ROAD_Y = 760;
const lx = (k: number) => X0 + k * DX;
const greenAt = (k: number, s: number) => ((((s - k * OFF) % CYCLE) + CYCLE) % CYCLE) < GREEN;

// position (in lights, 0..N) and stops of a rider at speed kmh who passes light 0 at sim time ph (0 <= ph < 30)
const ride = (kmh: number, ph: number, s: number): { pos: number; stops: number; waiting: boolean } => {
  const seg = 250 / (kmh / 3.6);
  let t = ph, stops = 0;
  if (s <= t) return { pos: 0, stops: 0, waiting: false };
  for (let k = 1; k <= N; k++) {
    const arrive = t + seg;
    if (s < arrive) return { pos: k - 1 + (s - t) / seg, stops, waiting: false };
    const phase = ((((arrive - k * OFF) % CYCLE) + CYCLE) % CYCLE);
    const wait = phase < GREEN ? 0 : CYCLE - phase;
    if (wait > 0) {
      stops++;
      if (s < arrive + wait) return { pos: k, stops, waiting: true };
    }
    t = arrive + wait;
  }
  return { pos: N, stops, waiting: false };
};

const Lights: React.FC<{ s: number; y?: number }> = ({ s, y = ROAD_Y }) => (
  <>
    <div style={{ position: "absolute", left: X0 - 40, top: y - 14, width: N * DX + 80, height: 28, borderRadius: 14, background: "#2a3140" }} />
    {[...Array(N + 1)].map((_, k) => {
      const g = greenAt(k, s);
      const col = g ? C.mint : C.coral;
      return (
        <div key={k}>
          <div style={{ position: "absolute", left: lx(k) - 3, top: y - 120, width: 6, height: 106, background: C.muted }} />
          <div style={{ position: "absolute", left: lx(k) - 24, top: y - 150, width: 48, height: 48, borderRadius: 24, background: col,
            boxShadow: `0 0 22px ${col}` }} />
        </div>
      );
    })}
  </>
);

const Bike: React.FC<{ pos: number; color: string; y?: number; label?: string }> = ({ pos, color, y = ROAD_Y, label }) => {
  const x = X0 + pos * DX;
  return (
    <>
      <div style={{ position: "absolute", left: x - 45, top: y + 22, width: 90, height: 90, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="Bike" size={90} color={color} stroke={2.6} />
      </div>
      {label ? <div style={{ position: "absolute", left: x - 70, top: y + 112, width: 140, textAlign: "center", fontFamily: F.bold, fontSize: 44, color }}>{label}</div> : null}
    </>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tNine = at.word("reds", 1, 2.4);
  const s = 40 + t * 60;  // sim clock, fast
  const slow = ride(20, 10, s), fast = ride(30, 10, s);
  return (
    <>
      <HookText>{"20 km/h: 0 stops\n30 km/h: **9+ stops**"}</HookText>
      <Riser to={tNine} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.04 }]]}>
        <Lights s={s} y={640} />
        <Bike pos={slow.pos} color={C.mint} y={640} label="20" />
        <Lights s={s} y={950} />
        <Bike pos={fast.pos} color={fast.waiting ? C.coral : C.amber} y={950} />
        <At x={540} y={1130}><Appear at={tNine} from="slam"><Chip color={C.coral} size={52}>at 30: {fast.stops} stops so far</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/hit-low" at={tNine} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSlow = at.word("slow", 1, 2.2);
  const tOne = at.word("one", 1, 4.0);
  const s = 200 + t * 20;
  return (
    <>
      <Headline>Not bad luck</Headline>
      <Lights s={s} />
      <At x={540} y={480}><Appear at={tSlow} from="pop"><Text size={52} color={C.muted}>not too slow either</Text></Appear></At>
      <At x={540} y={1000}><Appear at={tOne} from="slam"><Chip color={C.amber} size={56}>set for exactly one speed</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- setup + slow + fast + rehook + stuck
const RoadBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSlow = at.beat("slow");
  const tFast = at.beat("fast");
  const tRe = at.beat("rehook");
  const tStuck = at.beat("stuck");
  const t250 = at.word("250", 1, 1.6);
  const t45 = at.word("45", 1, 4.2);
  const t20 = at.word("20", 1, 7.4);
  const tZero = at.word("Zero", 1, tSlow + 3.6);
  const t30b = at.word("30", 2, tFast + 2.0);
  const t15 = at.word("15", 1, tFast + 3.8);
  const tRed = at.word("red", 1, tFast + 6.0);
  const tWait = at.word("wait", 1, tRe + 0.3);
  const tSprint = at.word("sprint", 1, tRe + 1.2);
  const tRed2 = at.word("red", 2, tRe + 2.4);
  const t15b = at.word("15", 2, tStuck + 2.6);
  // sim clock: before the slow ride, lights tick in real time x 8 to show the offsets; then two rides
  const showOff = t < tSlow;
  const sSlow = Math.max(0, (t - tSlow - 0.3) * 120);
  const sFast = Math.max(0, (t - tFast - 0.3) * 30);
  const s = showOff ? t * 8 : t < tFast ? sSlow + 15 : sFast + 15;
  const slow = ride(20, 15, s);
  const fast = ride(30, 15, s);
  const stopsShown = t >= tFast ? fast.stops : 0;
  return (
    <Shake at={tRed2}>
      <Headline out={tSlow - 0.3}>10 lights, 250 m apart</Headline>
      <Headline at={tSlow} out={tFast - 0.3} color={C.mint}>Pedal at 20</Headline>
      <Headline at={tFast} out={tRe - 0.3} color={C.coral}>Pedal at 30</Headline>
      <Headline at={tRe} out={tStuck - 0.3} color={C.coral}>Wait. Sprint. Red.</Headline>
      <Headline at={tStuck} color={C.coral}>Stuck at the front</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tFast, { zoom: 1 }], [tFast + 1, { zoom: 1.05 }], [tStuck, { zoom: 1.05 }], [tStuck + 1, { zoom: 1 }]]}>
        <Lights s={s} />
        {t >= tSlow && t < tFast ? <Bike pos={slow.pos} color={C.mint} label="20" /> : null}
        {t >= tFast ? <Bike pos={fast.pos} color={fast.waiting ? C.coral : C.amber} label="30" /> : null}
      </Camera>
      {/* setup labels */}
      <At x={540} y={480}><Appear at={t250} out={t45 - 0.2} from="fade"><Text size={52}>250 m between lights</Text></Appear></At>
      <At x={540} y={480}><Appear at={t45} out={tSlow - 0.2} from="pop"><Text size={52} color={C.amber}>each turns green 45 s later</Text></Appear></At>
      <At x={540} y={1040}><Appear at={t20} out={tSlow - 0.2} from="slam"><Chip color={C.mint} size={46}>250 m at 20 km/h: 45 s</Chip></Appear></At>
      {/* slow ride */}
      <At x={540} y={1040}><Appear at={tZero} out={tFast - 0.2} from="slam"><Chip color={C.mint} size={58}>0 stops</Chip></Appear></At>
      {/* fast ride */}
      <At x={540} y={480}><Appear at={t30b} out={tRe - 0.2} from="pop"><Text size={52}>30 s a block, not 45</Text></Appear></At>
      <At x={540} y={1040}><Appear at={t15} out={tStuck - 0.2} from="slam"><Chip color={C.amber} size={54}>+15 s on the lights, every block</Chip></Appear></At>
      <At x={540} y={480}><Appear at={tWait} out={tStuck - 0.2} from="fade" sfx={null}><Text size={60} color={C.coral}>stops: {stopsShown}</Text></Appear></At>
      <At x={540} y={1040}><Appear at={t15b} from="slam"><Chip color={C.coral} size={56}>15 s at every light</Chip></Appear></At>
      <At x={540} y={480}><Appear at={tStuck + 0.3} from="fade" sfx={null}><Text size={60} color={C.coral}>stops: {stopsShown}</Text></Appear></At>
      <Sfx name="pack/ding-short" at={tZero} volume={0.4} />
      <Sfx name="pack/whoosh-fast" at={tSprint} volume={0.35} />
      <Sfx name="pack/wrong" at={tRed + 0.05} volume={0.3} />
      <Sfx name="pack/wrong" at={tRed2 + 0.05} volume={0.3} />
    </Shake>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tHalf = at.word("half", 1, 2.2);
  const tUnder = at.word("under", 1, 3.8);
  const tDecide = at.word("decide", 1, 5.6);
  const tCph = at.word("Copenhagen", 1, 7.4);
  return (
    <>
      <Headline color={C.amber}>What 30 really buys you</Headline>
      <At x={540} y={460}><Appear at={0.1} from="pop"><Text size={50} color={C.muted}>no lights</Text></Appear></At>
      <At x={540} y={560}><Appear at={tHalf - 0.3} from="slam"><Text size={110} font={F.bold} color={C.mint}>2.5 min</Text></Appear></At>
      <At x={540} y={700}><Appear at={tUnder - 0.6} from="pop"><Text size={50} color={C.muted}>green wave</Text></Appear></At>
      <Punch at={tUnder}>
        <At x={540} y={800}><Appear at={tUnder} from="slam"><Text size={110} font={F.bold} color={C.coral}>&lt; 30 s</Text></Appear></At>
      </Punch>
      <At x={540} y={940}><Appear at={tDecide} from="up"><Chip color={C.amber} size={52}>the lights decide</Chip></Appear></At>
      <At x={540} y={1080}><Appear at={tCph} from="up"><Text size={48}>Copenhagen: bikes at 20, for 2.5 km</Text></Appear></At>
    </>
  );
};

const CtaBody: React.FC = () => {
  const t = useT();
  const s = 300 + t * 60;
  const slow = ride(20, 10, s);
  return (
    <>
      <At x={540} y={420}><Appear at={0} from="pop"><Text size={80} color={C.amber}>Would you sprint?</Text></Appear></At>
      <Lights s={s} />
      <Bike pos={slow.pos} color={C.mint} />
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="setup" to="stuck"><RoadBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
