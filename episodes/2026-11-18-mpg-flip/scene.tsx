// "Why 10 to 20 mpg saves more than 25 to 50": the MPG illusion.
// versus hook -> sounds backwards (car +25, truck +10) -> truck + car, 10,000 miles each -> flip to gallons
// -> truck 1,000 -> 500 (save 500) -> re-hook: the car -> 400 -> 200 (save 200) -> 50 -> 100 saves 100
// -> payoff: each step saves less, fix the thirstiest first; Europe: L/100 km -> CTA subscribe
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};
const Big: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = C.ink, size = 96 }) => (
  <div style={{ fontFamily: F.bold, fontSize: size, color, whiteSpace: "nowrap" }}>{children}</div>
);

// a vehicle card: icon + mpg change
const Vehicle: React.FC<{ icon: string; label: string; from: string; to: string; color?: string; win?: boolean }> = ({ icon, label, from, to, color = C.ink, win }) => (
  <div style={{ width: 440, padding: "28px 0", borderRadius: 30, background: C.panel, border: `5px solid ${win ? C.amber : C.dim}`,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 10, boxShadow: win ? `0 0 40px ${C.amber}66` : "0 14px 30px #0008" }}>
    <Icon name={icon} size={150} color={color} />
    <Text size={46} color={C.muted}>{label}</Text>
    <Text size={64} color={win ? C.amber : C.ink} font={F.mono}>{from}→{to}</Text>
    <Text size={36} color={C.muted}>mpg</Text>
  </div>
);

// gallons bar: width proportional to gallons, max 1,000 -> 820 px
const GalBar: React.FC<{ y: number; label: string; gal: number; t0: number; color: string }> = ({ y, label, gal, t0, color }) => {
  const t = useT();
  const g = tween(t, t0, t0 + 0.6, 0, 1);
  const w = (gal / 1000) * 820 * g;
  return (
    <>
      <At x={170} y={y - 62}><Appear at={t0 - 0.1} from="fade" sfx={null}><Text size={42} color={C.muted}>{label}</Text></Appear></At>
      <div style={{ position: "absolute", left: 130, top: y - 30, height: 80, width: w, background: color, borderRadius: 14, opacity: g > 0 ? 0.9 : 0 }} />
      {(gal / 1000) * 820 >= 300
        ? <At x={130 + w - 120} y={y + 10}><Appear at={t0 + 0.3} from="fade" sfx={null}><Text size={50} color={C.bg} font={F.mono}>{gal.toLocaleString("en-US")}</Text></Appear></At>
        : <At x={130 + w + 90} y={y + 10}><Appear at={t0 + 0.3} from="fade" sfx={null}><Text size={50} color={C.ink} font={F.mono}>{gal.toLocaleString("en-US")}</Text></Appear></At>}
    </>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const tMore = w(["more"], 1, 1.6), t50 = w(["50"], 1, 2.6);
  return (
    <>
      <HookText y={250} size={86}>{"**10→20 mpg** beats 25→50"}</HookText>
      <Riser to={tMore} volume={0.45} />
      <Punch at={tMore}><At x={290} y={680}><Appear at={0} from="left"><Vehicle icon="Truck" label="truck" from="10" to="20" win /></Appear></At></Punch>
      <At x={790} y={680}><Appear at={0} from="right"><Vehicle icon="Car" label="car" from="25" to="50" /></Appear></At>
      <At x={540} y={1060}><Appear at={tMore - 0.2} from="slam"><Chip color={C.amber} size={52}>saves more fuel</Chip></Appear></At>
      <At x={540} y={1060}><Appear at={0} out={tMore - 0.2} from="fade" sfx={null}><Text size={46} color={C.muted}>which saves more?</Text></Appear></At>
      <Sfx name="pack/whoosh-fast" at={0.05} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const w = useW();
  const t25 = w(["25"], 1, 1.4), t10 = w(["10"], 1, 2.4), tDouble = w(["double"], 1, 3.6);
  return (
    <>
      <Headline>Sounds backwards</Headline>
      <At x={290} y={620}><Vehicle icon="Truck" label="truck" from="10" to="20" /></At>
      <At x={790} y={620}><Vehicle icon="Car" label="car" from="25" to="50" /></At>
      <At x={790} y={950}><Appear at={t25 - 0.2} from="pop"><Chip color={C.mint} size={60}>+25</Chip></Appear></At>
      <At x={290} y={950}><Appear at={t10 - 0.2} from="pop"><Chip color={C.muted} size={60}>+10</Chip></Appear></At>
      <At x={540} y={1100}><Appear at={tDouble - 0.3} from="up"><Text size={50} color={C.ink}>both × 2</Text></Appear></At>
      <Sfx name="pack/hmm" at={tDouble} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- context
const ContextBody: React.FC = () => {
  const w = useW();
  const tOne = w(["one"], 1, 2.4), tMiles = w(["10,000"], 1, 3.8);
  return (
    <>
      <Headline>Replace one</Headline>
      <At x={290} y={560}><Appear at={0.05} from="up"><Icon name="Truck" size={200} color={C.ink} /></Appear></At>
      <At x={790} y={560}><Appear at={0.25} from="up"><Icon name="Car" size={200} color={C.ink} /></Appear></At>
      <At x={540} y={560}><Appear at={tOne - 0.2} from="pop"><Text size={70} color={C.amber}>or</Text></Appear></At>
      <At x={540} y={880}><Appear at={tMiles - 0.3} from="slam"><Big size={96}>10,000 miles</Big></Appear></At>
      <At x={540} y={1010}><Appear at={tMiles + 0.2} from="fade" sfx={null}><Text size={46} color={C.muted}>each, every year</Text></Appear></At>
      <Sfx name="pack/whoosh-soft" at={tMiles} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- step 1: flip
const FlipBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tMiles = w(["miles"], 1, 1.8), tGal = w(["gallons"], 1, 3.4);
  const rot = tween(t, tGal - 0.4, tGal + 0.2, 0, 180);
  return (
    <>
      <Headline>Step 1: flip the number</Headline>
      <At x={540} y={560}><Appear at={tMiles - 0.3} from="up">
        <div style={{ transform: `rotateX(${rot}deg)` }}>
          <div style={{ transform: rot > 90 ? "rotateX(180deg)" : undefined }}>
            {rot <= 90 ? <Big size={110} color={C.muted}>miles / gallon</Big> : <Big size={110} color={C.amber}>gallons / year</Big>}
          </div>
        </div>
      </Appear></At>
      <At x={540} y={820}><Appear at={tGal + 0.2} from="pop"><Icon name="Fuel" size={180} color={C.amber} /></Appear></At>
      <At x={540} y={1030}><Appear at={tGal + 0.4} from="fade" sfx={null}><Text size={46} color={C.muted}>what you actually burn</Text></Appear></At>
      <Sfx name="pack/swoosh" at={tGal - 0.4} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- step 2: truck
const TruckBody: React.FC = () => {
  const w = useW();
  const t1000 = w(["1,000"], 1, 2.4), t500 = w(["500"], 1, 4.0), tSave = w(["save"], 1, 5.0);
  return (
    <>
      <Headline>Step 2: the truck</Headline>
      <At x={540} y={420}><Icon name="Truck" size={140} color={C.ink} /></At>
      <GalBar y={640} label="at 10 mpg" gal={1000} t0={t1000 - 0.3} color={C.coral} />
      <GalBar y={840} label="at 20 mpg" gal={500} t0={t500 - 0.3} color={C.mint} />
      <Punch at={tSave + 0.3}><At x={540} y={1010}><Appear at={tSave - 0.1} from="up"><Big size={110} color={C.amber}>save 500 gal</Big></Appear></At></Punch>
      <Sfx name="pack/kaching" at={tSave + 0.3} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const w = useW();
  const t25 = w(["25"], 1, 1.6);
  return (
    <>
      <Headline color={C.amber}>Now the car</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t25, { zoom: 1.12 }]]}>
        <At x={540} y={680}><Appear at={0.05} from="pop"><Vehicle icon="Car" label="car" from="25" to="50" /></Appear></At>
        <At x={540} y={1020}><Appear at={t25 - 0.2} from="pop"><Chip color={C.mint} size={60}>+25 mpg</Chip></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- step 3: car
const CarBody: React.FC = () => {
  const w = useW();
  const t400 = w(["400"], 1, 1.6), t200 = w(["200"], 1, 3.0), tOnly = w(["only"], 1, 4.2);
  return (
    <>
      <Headline>Step 3: the car</Headline>
      <At x={540} y={420}><Icon name="Car" size={140} color={C.ink} /></At>
      <GalBar y={640} label="at 25 mpg" gal={400} t0={t400 - 0.3} color={C.coral} />
      <GalBar y={840} label="at 50 mpg" gal={200} t0={t200 - 0.3} color={C.mint} />
      <At x={540} y={1060}><Appear at={tOnly - 0.2} from="up"><Big size={100} color={C.ink}>save 200 gal</Big></Appear></At>
      <Sfx name="pack/cash-ting" at={tOnly} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- step 4: the curve
const MPGS = [10, 20, 25, 50, 100];
const MoreBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const t100 = w(["100"], 1, 1.4), tMore = w(["more"], 1, 3.0);
  // gallons per 10,000 miles as falling columns
  const X0 = 100, BW = 130, GAP = 35, BASE = 1080, K = 0.55;
  return (
    <>
      <Headline>Step 4: push it to 100</Headline>
      {MPGS.map((m, i) => {
        const g = 10000 / m;
        const show = i < 4 ? 0.05 + i * 0.12 : t100 - 0.3;
        const h = g * K * tween(t, show, show + 0.4, 0, 1);
        const x = X0 + i * (BW + GAP);
        return (
          <React.Fragment key={m}>
            <div style={{ position: "absolute", left: x, top: BASE - h, width: BW, height: h, borderRadius: 12, background: i === 4 ? C.amber : i < 2 ? C.coral : C.mint, opacity: 0.88 }} />
            <At x={x + BW / 2} y={BASE - h - 40}><Appear at={show + 0.2} from="fade" sfx={null}><Text size={40} color={C.ink} font={F.mono}>{g.toLocaleString("en-US")}</Text></Appear></At>
            <At x={x + BW / 2} y={BASE + 45}><Text size={40} color={C.muted} font={F.mono}>{m}</Text></At>
          </React.Fragment>
        );
      })}
      <At x={540} y={360}><Appear at={tMore - 0.3} from="slam"><Chip color={C.amber} size={56}>50→100: just 100 more</Chip></Appear></At>
      <Sfx name="pack/pop" at={t100} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const tLess = w(["less"], 1, 1.2), tFirst = w(["first"], 1, 3.6), tEurope = w(["Europe"], 1, 5.0);
  return (
    <>
      <Headline>Fix the thirstiest first</Headline>
      <At x={540} y={390}><Appear at={tLess - 0.3} from="up"><Text size={60}>every step saves less</Text></Appear></At>
      <Punch at={tFirst}><At x={540} y={720}><Appear at={tFirst - 0.4} from="slam"><Vehicle icon="Truck" label="swap this one" from="10" to="20" win /></Appear></At></Punch>
      <At x={540} y={1040}><Appear at={tEurope - 0.3} from="pop"><Chip color={C.mint} size={56}>Europe: litres per 100 km</Chip></Appear></At>
      <Sfx name="pack/hit-grand" at={tFirst} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tCar = w(["car"], 1, 2.6);
  return (
    <>
      <At x={290} y={650}><Vehicle icon="Truck" label="truck" from="10" to="20" win /></At>
      <At x={790} y={650}><Appear at={0} from="fade" sfx={null}><Vehicle icon="Car" label="car" from="25" to="50" /></Appear></At>
      <At x={790} y={390}><Appear at={tCar - 0.3} from="pop"><Text size={46} color={C.muted}>picked this one?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="flip"><FlipBody /></Span>
    <Span from="truck"><TruckBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="car"><CarBody /></Span>
    <Span from="more"><MoreBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
