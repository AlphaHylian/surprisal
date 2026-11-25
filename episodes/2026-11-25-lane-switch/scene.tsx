// "Should you switch lanes in traffic?": the next lane only looks faster (Redelmeier & Tibshirani 1999).
// versus hook -> seems faster, mostly isn't -> waves of 20/40 mph, lanes out of step -> slow mile 3 min, passed
// -> fast mile 90 s, you pass -> re-hook: count the cars -> 60 vs 30 a mile -> 30 vs 30, a tie
// -> 2/3 of the time you watch them win -> 70% of students -> CTA (10 mph?)
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// ---------------------------------------------------------------- the road, seen from above, driving up
// the camera rides with your car (amber). `rel` = how fast the next lane's cars move past you, in px/s
// (positive: they move up, i.e. overtake you). `myGap` / `nextGap`: spacing of cars in each lane.
const ROAD_TOP = 380, ROAD_BOT = 1160;
const LANE_ME = 420, LANE_NEXT = 660;
const Car: React.FC<{ x: number; y: number; color: string; glow?: boolean }> = ({ x, y, color, glow }) => (
  <div style={{ position: "absolute", left: x - 48, top: y - 78, width: 96, height: 156, borderRadius: 26, background: color,
    boxShadow: glow ? `0 0 40px ${color}aa` : "0 10px 24px #0009", border: `4px solid ${C.bg}` }}>
    <div style={{ position: "absolute", left: 14, top: 22, width: 60, height: 34, borderRadius: 10, background: "#0b0e14aa" }} />
    <div style={{ position: "absolute", left: 14, top: 100, width: 60, height: 26, borderRadius: 8, background: "#0b0e1488" }} />
  </div>
);
const Road: React.FC<{ rel?: number; myGap?: number; nextGap?: number; t0?: number; nextColor?: string; flash?: number }> =
  ({ rel = 120, myGap = 200, nextGap = 300, t0 = 0, nextColor = C.mint, flash = 0 }) => {
    const t = useT();
    const H = ROAD_BOT - ROAD_TOP;
    const off = ((-(t - t0) * rel) % nextGap + nextGap) % nextGap;
    const nextCars: React.ReactNode[] = [];
    for (let k = -1; k * nextGap < H + nextGap; k++) {
      const y = ROAD_TOP + k * nextGap + off;
      if (y > ROAD_TOP - 60 && y < ROAD_BOT + 60) nextCars.push(<Car key={k} x={LANE_NEXT} y={y} color={nextColor} />);
    }
    const meY = (ROAD_TOP + ROAD_BOT) / 2;
    const myCars: React.ReactNode[] = [];
    for (let k = -3; k <= 3; k++) {
      const y = meY + k * myGap;
      if (k !== 0 && y > ROAD_TOP - 40 && y < ROAD_BOT + 40) myCars.push(<Car key={k} x={LANE_ME} y={y} color="#59627a" />);
    }
    const dashOff = (((t - t0) * 160) % 120);
    return (
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}>
        <div style={{ position: "absolute", left: 290, top: ROAD_TOP - 40, width: 500, height: H + 80, background: "#151a24", borderRadius: 30,
          borderLeft: `6px solid ${C.dim}`, borderRight: `6px solid ${C.dim}`, overflow: "hidden" }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: 247, top: i * 120 - 120 + dashOff, width: 6, height: 60, background: C.dim }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: 290, top: ROAD_TOP - 40, width: 500, height: H + 80, overflow: "hidden", borderRadius: 30 }}>
          <div style={{ position: "absolute", left: -290, top: -(ROAD_TOP - 40) }}>{myCars}{nextCars}</div>
        </div>
        <Car x={LANE_ME} y={meY} color={C.amber} glow={flash > 0} />
      </div>
    );
  };

// a lane drawn as a strip of alternating mile stretches (slow = coral, fast = mint)
const Strip: React.FC<{ y: number; shift: boolean; t0: number; label: string }> = ({ y, shift, t0, label }) => {
  const t = useT();
  const blocks = [0, 1, 2, 3, 4, 5].map((i) => {
    const slow = (i + (shift ? 1 : 0)) % 2 === 0;
    const show = t > t0 + i * 0.12;
    return (
      <div key={i} style={{ position: "absolute", left: 90 + i * 150, top: 0, width: 144, height: 110, borderRadius: 14, opacity: show ? 1 : 0,
        background: slow ? `${C.coral}cc` : `${C.mint}cc`, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: F.bold, fontSize: 46, color: C.bg }}>{slow ? "20" : "40"}</div>
    );
  });
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: 110 }}>
      {blocks}
      <div style={{ position: "absolute", left: 90, top: -56, fontFamily: F.med, fontSize: 42, color: C.muted }}>{label}</div>
    </div>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const tSwitch = w(["switch"], 1, 1.0), tStay = w(["stay"], 1, 2.0);
  return (
    <>
      <Riser to={tSwitch} volume={0.45} />
      <Road rel={260} nextGap={300} myGap={190} />
      <At x={850} y={600}><Appear at={0} from="pop" sfx={null}><Icon name="ArrowRightLeft" size={110} color={C.amber} /></Appear></At>
      <HookText y={230} size={96}>{"Switch lanes\nvs **stay put**"}</HookText>
      <Sfx name="pack/whoosh-fast" at={tStay} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tSeems = w(["seems"], 1, 0.9), tIsnt = w(["isn't."], 1, 2.4), tLooks = w(["looks"], 1, 3.6);
  return (
    <>
      <Headline>Always faster?</Headline>
      <Road rel={260} nextGap={300} myGap={190} />
      <At x={540} y={1100}><Appear at={tSeems} from="pop"><Chip color={C.mint} size={50}>next lane: "faster"</Chip></Appear></At>
      <At x={850} y={700}><Appear at={tIsnt - 0.1} from="slam"><Text size={120} color={C.coral}>?</Text></Appear></At>
      <Sfx name="pack/hmm" at={tLooks} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- context: waves, out of step
const ContextBody: React.FC = () => {
  const w = useW();
  const t20 = w(["20"], 1, 1.4), t40 = w(["40."], 1, 3.0), tNext = w(["next"], 1, 4.0), tStep = w(["step."], 1, 5.2);
  return (
    <>
      <Headline>Waves of traffic (mph)</Headline>
      <Strip y={560} shift={false} t0={t20 - 0.5} label="your lane" />
      <Strip y={800} shift={true} t0={tNext - 0.3} label="next lane" />
      <At x={540} y={1050}><Appear at={tStep - 0.3} from="up"><Text size={52} color={C.amber}>where you're slow, it's fast</Text></Appear></At>
      <Sfx name="pack/click-soft" at={t40} volume={0.2} />
    </>
  );
};

// ---------------------------------------------------------------- slow mile: 3 minutes, passed
const SlowBody: React.FC = () => {
  const w = useW();
  const t3 = w(["3"], 1, 0.9), tSlides = w(["slides"], 1, 3.0);
  return (
    <>
      <Headline>Your slow mile</Headline>
      <Road rel={260} nextGap={320} myGap={170} />
      <At x={160} y={560}><Appear at={t3 - 0.2} from="pop"><Card2 color={C.coral} top="20 mph" big="3:00" /></Appear></At>
      <At x={540} y={1110}><Appear at={tSlides - 0.2} from="up"><Chip color={C.coral} size={48}>being passed</Chip></Appear></At>
      <Sfx name="pack/whoosh-mid" at={tSlides} volume={0.25} />
    </>
  );
};
const Card2: React.FC<{ color: string; top: string; big: string }> = ({ color, top, big }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "#151a24ee", border: `4px solid ${color}`, borderRadius: 24, padding: "14px 22px" }}>
    <div style={{ fontFamily: F.med, fontSize: 40, color: C.muted }}>{top}</div>
    <div style={{ fontFamily: F.bold, fontSize: 72, color }}>{big}</div>
  </div>
);

// ---------------------------------------------------------------- fast mile: 90 seconds, you pass
const FastBody: React.FC = () => {
  const w = useW();
  const t90 = w(["90"], 1, 1.2), tPass = w(["pass"], 1, 2.6);
  return (
    <>
      <Headline>Your fast mile</Headline>
      <Road rel={-260} nextGap={160} myGap={330} nextColor="#7d8aa6" flash={1} />
      <At x={160} y={560}><Appear at={t90 - 0.2} from="pop"><Card2 color={C.mint} top="40 mph" big="1:30" /></Appear></At>
      <At x={540} y={1110}><Appear at={tPass - 0.2} from="up"><Chip color={C.mint} size={48}>you pass them</Chip></Appear></At>
      <Sfx name="pack/whoosh-fast-2" at={tPass} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const w = useW();
  const tCount = w(["Count"], 1, 1.2);
  return (
    <>
      <Headline color={C.amber}>Who's winning?</Headline>
      <At x={540} y={720}><Icon name="Car" size={300} color={C.amber} /></At>
      <At x={540} y={1020}><Appear at={tCount - 0.2} from="slam"><Text size={72}>Count the cars</Text></Appear></At>
      <Sfx name="pack/suspense-sting" at={0.2} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- density: 60 vs 30 a mile
const Packed: React.FC<{ n: number; color: string; t0: number }> = ({ n, color, t0 }) => {
  const t = useT();
  return (
    <div style={{ position: "relative", width: 900, height: 90 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: (i * 900) / n + 2, top: 10, width: Math.min(60, 900 / n - 10), height: 70, borderRadius: 12,
          background: color, opacity: t > t0 + i * 0.03 ? 1 : 0 }} />
      ))}
    </div>
  );
};
const DensityBody: React.FC = () => {
  const w = useW();
  const t60 = w(["60"], 1, 1.4), t30 = w(["30."], 1, 3.6);
  return (
    <>
      <Headline>One mile of each</Headline>
      <At x={540} y={520}><Text size={52} color={C.coral}>slow: bunched up</Text></At>
      <At x={540} y={620}><Packed n={15} color={C.coral} t0={t60 - 0.6} /></At>
      <At x={540} y={730}><Appear at={t60 - 0.1} from="pop"><Text size={72} color={C.coral}>60 cars a mile</Text></Appear></At>
      <At x={540} y={860}><Text size={52} color={C.mint}>fast: spread out</Text></At>
      <At x={540} y={960}><Packed n={8} color={C.mint} t0={t30 - 0.8} /></At>
      <At x={540} y={1070}><Appear at={t30 - 0.1} from="pop"><Text size={72} color={C.mint}>30 cars a mile</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- the tie: 30 vs 30
const TieBody: React.FC = () => {
  const w = useW();
  const tA = w(["30"], 1, 1.8), tB = w(["30"], 2, 4.4), tTie = w(["tie."], 1, 5.6);
  return (
    <>
      <Headline>Count them</Headline>
      <At x={290} y={560}><Text size={48} color={C.coral}>pass you (3 min)</Text></At>
      <At x={290} y={700}><Counter from={0} to={30} t0={tA - 1.2} t1={tA} size={150} color={C.coral} /></At>
      <At x={790} y={560}><Appear at={tB - 1.4} from="fade"><Text size={48} color={C.mint}>you pass (90 s)</Text></Appear></At>
      <At x={790} y={700}><Counter from={0} to={30} t0={tB - 1.0} t1={tB} size={150} color={C.mint} /></At>
      <At x={540} y={980}><Appear at={tTie - 0.3} from="slam"><Chip color={C.amber} size={64}>30 = 30: a tie</Chip></Appear></At>
      <Sfx name="pack/bell-boxing" at={tTie} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- payoff: 2/3 of the time
const PayoffBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tArr = w(["arrival."], 1, 1.4), tTwo = w(["two"], 1, 2.8), tWin = w(["win."], 1, 4.6);
  const k = tween(t, tTwo - 0.3, tTwo + 0.8, 0, 1);
  return (
    <>
      <Headline>Same arrival</Headline>
      <At x={540} y={500}><Appear at={0.1} from="pop"><Icon name="Flag" size={150} color={C.mint} /></Appear></At>
      <At x={540} y={640}><Appear at={tArr - 0.4} from="up"><Text size={54}>both lanes: 26.7 mph average</Text></Appear></At>
      <div style={{ position: "absolute", left: 90, top: 780, width: 900, height: 110, borderRadius: 20, background: "#1b202b", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 600 * k, height: 110, background: C.coral }} />
        <div style={{ position: "absolute", left: 600, top: 0, width: 300 * k, height: 110, background: C.mint }} />
      </div>
      <At x={390} y={835}><Appear at={tTwo + 0.4} from="fade"><Text size={52} color={C.bg}>⅔ watching them</Text></Appear></At>
      <At x={540} y={1010}><Appear at={tWin - 0.4} from="slam"><Chip color={C.amber} size={56}>the other lane "wins"</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- proof: 70%
const ProofBody: React.FC = () => {
  const w = useW();
  const t70 = w(["70%", "70"], 1, 1.6), tSlower = w(["slower."], 1, 4.6);
  return (
    <>
      <Headline>Toronto, 1999</Headline>
      <At x={540} y={640}><Counter from={0} to={70} t0={t70 - 0.8} t1={t70 + 0.2} size={220} color={C.amber} suffix="%" /></At>
      <At x={540} y={820}><Appear at={t70 + 0.2} from="up"><Text size={50}>said "the next lane is faster"</Text></Appear></At>
      <At x={540} y={1000}><Appear at={tSlower - 0.5} from="slam"><Chip color={C.coral} size={56}>it was slightly slower</Chip></Appear></At>
      <Sfx name="pack/wrong" at={tSlower} volume={0.22} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const t10 = w(["10"], 1, 1.6);
  return (
    <>
      <Road rel={260} nextGap={300} myGap={190} />
      <At x={160} y={560}><Appear at={t10 - 0.2} from="pop"><Card2 color={C.coral} top="slow part" big="10 mph" /></Appear></At>
      <At x={540} y={1110}><Appear at={t10 + 0.8} from="up"><Chip color={C.amber} size={52}>how often does it look faster?</Chip></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="slow"><SlowBody /></Span>
    <Span from="fast"><FastBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="density"><DensityBody /></Span>
    <Span from="tie"><TieBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="proof"><ProofBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
