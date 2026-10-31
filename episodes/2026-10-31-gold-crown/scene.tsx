// "How to catch a fake gold crown without a scratch": Archimedes' crown, Galileo's balance.
// question hook -> rule out weighing -> volumes 52 vs 65 -> overflow (Eureka) -> re-hook: 0.4 mm
// -> balance level in air -> both into water, 52 vs 65 g push -> payoff 13 g -> checkable CTA.
import React from "react";
import {
  Appear, At, C, Camera, Card, Chip, Counter, Emoji, F, Headline, HookText, Punch, Riser, Sfx, Shake, Span, Stamp, Text, tween, useAt, useT,
} from "../kit";

const WATER = `${C.mint}40`;
const PX = 540, PY = 540, ARM = 270, STR = 250;

const GoldBar: React.FC<{ w?: number }> = ({ w = 190 }) => (
  <div style={{ width: w, height: w * 0.5, borderRadius: 14, background: `linear-gradient(160deg, ${C.amber}, #c9862a)`, boxShadow: `0 0 30px ${C.amber}66`,
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.bold, fontSize: 40, color: C.bg }}>1,000 g</div>
);

// The balance: crown on the left, pure gold on the right. tilt > 0 lifts the crown side.
// water 0..1 fills two tanks under the pans.
const Rig: React.FC<{ tilt: number; water: number; labels?: number }> = ({ tilt, water, labels = 0 }) => {
  const r = (tilt * Math.PI) / 180;
  const lx = PX - ARM * Math.cos(r), ly = PY - ARM * Math.sin(r);
  const rx = PX + ARM * Math.cos(r), ry = PY + ARM * Math.sin(r);
  const tankTop = 760, tankBot = 1120, tankW = 250;
  const wTop = tankBot - water * (tankBot - tankTop - 20);
  const Tank: React.FC<{ x: number }> = ({ x }) => (
    <div style={{ position: "absolute", left: x - tankW / 2, top: tankTop, width: tankW, height: tankBot - tankTop, border: `4px solid ${C.muted}`,
      borderTop: "none", borderRadius: "0 0 26px 26px", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: wTop - tankTop, bottom: 0, background: WATER, borderTop: `4px solid ${C.mint}` }} />
    </div>
  );
  return (
    <>
      <div style={{ position: "absolute", left: PX - 8, top: PY, width: 16, height: 600, background: C.dim, borderRadius: 8 }} />
      <div style={{ position: "absolute", left: PX - 110, top: PY + 590, width: 220, height: 20, background: C.dim, borderRadius: 10 }} />
      <div style={{ position: "absolute", left: PX - ARM - 10, top: PY - 8, width: 2 * ARM + 20, height: 16, background: C.ink, borderRadius: 8,
        transform: `rotate(${-tilt}deg)`, transformOrigin: "50% 50%" }} />
      <div style={{ position: "absolute", left: PX - 18, top: PY - 18, width: 36, height: 36, borderRadius: 18, background: C.amber }} />
      {[lx, rx].map((x, i) => (
        <div key={i} style={{ position: "absolute", left: x - 2, top: i ? ry : ly, width: 4, height: STR, background: C.muted }} />
      ))}
      <Tank x={lx} />
      <Tank x={rx} />
      <At x={lx} y={ly + STR + 40}><Emoji char="👑" size={150} /></At>
      <At x={rx} y={ry + STR + 30}><GoldBar /></At>
      {labels > 0 ? (
        <>
          <At x={lx} y={1060}><div style={{ opacity: labels }}><Chip color={C.amber} size={46}>↑ 65 g</Chip></div></At>
          <At x={rx} y={1060}><div style={{ opacity: labels }}><Chip color={C.mint} size={46}>↑ 52 g</Chip></div></At>
        </>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- hook (frame 1 = the answer's picture)
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tScratch = at.word("13", 1, 1.8);
  const tilt = 7 + 1.2 * Math.sin(t * 3);
  return (
    <>
      <HookText>{"Fake gold crown?\n**13 grams** gives it away"}</HookText>
      <Riser to={tScratch} volume={0.5} />
      <Camera keys={[[0, { zoom: 0.92, y: 700 }], [at.dur, { zoom: 0.96, y: 700 }]]}>
        <Rig tilt={tilt} water={1} />
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- rule out weighing
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tGrams = at.word("grams", 1, 2.0);
  const tSilver = at.word("silver", 1, 4.6);
  return (
    <>
      <Headline>Weighing won't help</Headline>
      <At y={600}><Appear at={0.05} from="drop"><Emoji char="👑" size={260} /></Appear></At>
      <At y={860}>
        <Appear at={0.2} from="up">
          <Card w={520} h={170} border={C.mint}>
            <Counter from={0} to={1000} t0={0.3} t1={Math.max(0.9, tGrams)} size={100} color={C.mint} suffix=" g" />
          </Card>
        </Appear>
      </At>
      <At y={1080}><Appear at={tSilver - 0.2} from="slam"><Chip color={C.coral} size={56}>how much is silver?</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- volumes 52 vs 65
const VolumeBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t52 = at.word("52", 1, 3.6);
  const tSwap = at.word("swap", 1, 5.4);
  const t65 = at.word("65", 1, 7.0);
  const k = 7.5;
  const hGold = tween(t, 0.4, t52, 0, 52 * k);
  const hFake = tween(t, t65 - 0.6, t65, 0, 65 * k);
  const silverShare = 300 / 10.5 / (700 / 19.3 + 300 / 10.5);
  const Col: React.FC<{ x: number; h: number; split?: number; label: string }> = ({ x, h, split = 0, label }) => (
    <>
      <div style={{ position: "absolute", left: x - 110, top: 1110 - h, width: 220, height: h, borderRadius: 16, overflow: "hidden",
        background: C.amber, boxShadow: `0 0 30px ${C.amber}44` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h * split, background: "#C9D1DC" }} />
      </div>
      <At x={x} y={1150 - 0}><Text size={42} color={C.muted}>{label}</Text></At>
    </>
  );
  return (
    <>
      <Headline color={C.amber}>Same weight, more room</Headline>
      <At x={540} y={420}><Appear at={0.1} from="up"><Text size={50} color={C.ink}>silver is lighter than gold</Text></Appear></At>
      <Camera keys={[[0, { zoom: 1 }], [tSwap, { zoom: 1 }], [t65 + 0.3, { zoom: 1.05, y: 760 }]]}>
        <Col x={330} h={hGold} label="pure gold" />
        {t >= tSwap - 0.3 ? <Col x={750} h={hFake} split={silverShare} label="300 g silver in" /> : null}
        <At x={330} y={1110 - hGold - 60}><Appear at={t52} from="pop"><Text size={64} color={C.amber}>52 cm³</Text></Appear></At>
        <At x={750} y={1110 - hFake - 60}><Appear at={t65} from="pop"><Text size={64} color={C.coral}>65 cm³</Text></Appear></At>
      </Camera>
      <Sfx name="pack/ding" at={t65} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- the famous overflow test
const OverflowBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSink = at.word("sink", 1, 1.6);
  const tSpill = at.word("spills", 1, 3.0);
  const tEureka = at.word("Eureka", 1, 4.0);
  const sink = tween(t, tSink, tSink + 0.6, 0, 1);
  const drops = [0, 1, 2, 3, 4, 5];
  return (
    <>
      <Headline>The famous fix</Headline>
      <div style={{ position: "absolute", left: 220, top: 640, width: 640, height: 380, border: `6px solid ${C.muted}`, borderTop: "none",
        borderRadius: "0 0 200px 200px", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, background: WATER, borderTop: `5px solid ${C.mint}` }} />
      </div>
      <At x={540} y={480 + sink * 330}><Appear at={0.1} from="drop"><Emoji char="👑" size={170} /></Appear></At>
      {t > tSpill - 0.4 ? drops.map((i) => {
        const d = (t - (tSpill - 0.4) - i * 0.12) % 1.0;
        if (d < 0) return null;
        const side = i % 2 ? 1 : -1;
        return <div key={i} style={{ position: "absolute", left: 540 + side * (330 + d * 50) - 12, top: 640 + d * 420, width: 24, height: 32,
          borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: C.mint, opacity: 1 - d * 0.6 }} />;
      }) : null}
      <Sfx name="pack/pop-bubble" at={tSink + 0.5} volume={0.5} />
      <Punch at={tEureka}>
        <At x={540} y={1110}><Appear at={tEureka} from="slam"><Text size={110} font={F.display} color={C.amber} glow>Eureka!</Text></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- re-hook: the difference is 0.41 mm
const RehookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tHalf = at.word("half", 1, 4.0);
  const tDrip = at.word("drip", 1, 6.0);
  const z = tween(t, 0.3, 2.0, 1, 1.0);
  return (
    <Shake at={tDrip}>
      <Headline color={C.coral}>But it barely moves</Headline>
      <Camera keys={[[0, { zoom: z }]]}>
        <div style={{ position: "absolute", left: 140, top: 520, width: 800, height: 560, border: `6px solid ${C.muted}`, borderRadius: 30, background: `${C.panel}cc` }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 240, height: 4, background: C.mint }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 252, height: 4, background: C.coral, opacity: tween(t, tHalf - 1.2, tHalf - 0.6, 0, 1) }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 256, bottom: 0, background: WATER }} />
        </div>
        <At x={360} y={700}><Appear at={0.3} from="left"><Text size={46} color={C.mint}>pure gold</Text></Appear></At>
        <At x={360} y={830}><Appear at={tHalf - 0.6} from="left"><Text size={46} color={C.coral}>fake crown</Text></Appear></At>
        <At x={760} y={765}><Appear at={tHalf} from="slam"><Chip color={C.amber} size={60}>0.4 mm</Chip></Appear></At>
        <At x={540} y={1000}><Appear at={0.5} from="up"><Text size={46} color={C.muted}>20 cm bowl, 13 cm³ extra</Text></Appear></At>
      </Camera>
      <At x={820} y={600}><Appear at={tDrip - 0.1} from="drop" sfx="pack/pop-bubble"><div style={{ width: 40, height: 54, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: C.mint }} /></Appear></At>
      <Sfx name="pack/wrong" at={tDrip + 0.2} volume={0.35} />
    </Shake>
  );
};

// ---------------------------------------------------------------- balance in air, then water, then the tip
const BalanceBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tGold = at.word("gold", 1, 2.6);
  const tLevel = at.word("level", 1, 4.5);
  const tWater = at.beat("water");
  const tLower = at.word("lower", 1, tWater + 0.4);
  const tPush = at.word("pushes", 1, tWater + 2.0);
  const t52 = at.word("52", 1, tWater + 4.5);
  const t65 = at.word("65", 1, tWater + 6.0);
  const tPay = at.beat("payoff");
  const tRise = at.word("rises", 1, tPay + 0.8);
  const t13 = at.word("13", 1, tPay + 1.3);
  const tScale = at.word("scale", 1, tPay + 2.4);
  const tGalileo = at.word("Galileo", 1, tPay + 3.4);
  const swing = t < tLevel ? 6 * Math.cos((t - 0.2) * 4) * Math.exp(-(t - 0.2) * 0.9) : 0;
  const tilt = tween(t, tRise - 0.2, tRise + 0.9, 0, 8) + (t < tRise ? swing : 0);
  const water = tween(t, tLower, tLower + 1.4, 0, 1);
  const labels = tween(t, t52 - 0.2, t52 + 0.2, 0, 1);
  return (
    <>
      <Headline out={tWater - 0.3}>Use a balance</Headline>
      <Headline at={tWater} out={tPay - 0.3} color={C.mint}>Lower both into water</Headline>
      <Headline at={tPay} color={C.amber}>The crown side rises</Headline>
      <Punch at={t13}>
        <Camera keys={[[0, { zoom: 0.94, y: 720 }], [tWater, { zoom: 0.94, y: 720 }], [t65, { zoom: 0.98, y: 740 }], [tRise, { zoom: 0.94, y: 720 }]]}>
          <Rig tilt={tilt} water={water} labels={labels} />
          {t >= tGold - 0.1 && t < tWater ? <At x={PX + ARM} y={PY - 70}><Appear at={tGold - 0.1} from="pop"><Text size={44} color={C.amber}>pure gold</Text></Appear></At> : null}
          <At x={540} y={1000}><Appear at={tLevel} out={tLower - 0.2} from="pop"><Chip color={C.mint} size={44}>level</Chip></Appear></At>
        </Camera>
      </Punch>
      <At x={540} y={900}><Appear at={t13} from="slam"><Stamp color={C.amber} size={80} rotate={-6}>13 g</Stamp></Appear></At>
      <At x={540} y={360}><Appear at={tGalileo} from="up"><Text size={42} color={C.muted}>Galileo, La Bilancetta, 1586</Text></Appear></At>
      <Sfx name="pack/whoosh-soft" at={tLower} volume={0.4} />
      <Sfx name="ding" at={t65} volume={0.35} />
      <Sfx name="pack/boom-short" hit={t13} volume={0.55} />
      <Sfx name="pack/correct" at={tScale} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- CTA: 100 g swapped?
const CtaBody: React.FC = () => {
  const at = useAt();
  const tTip = at.word("tip", 1, 2.4);
  return (
    <>
      <At y={430}><Appear at={0} from="up"><Text size={70}>Only <span style={{ color: C.amber }}>100 g</span> swapped</Text></Appear></At>
      <At y={720}><Appear at={0.2} from="pop"><Emoji char="👑" size={230} /></Appear></At>
      <At y={1000}><Appear at={tTip} from="slam"><Chip color={C.amber} size={64}>tip = ? g</Chip></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="volume"><VolumeBody /></Span>
    <Span from="overflow"><OverflowBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="balance" to="payoff"><BalanceBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
