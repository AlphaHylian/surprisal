// "How to cut a pizza into 11 slices with 4 cuts": the lazy caterer's sequence.
// versus hook (4 cuts: 8 vs 11) -> your pizza, 11 people, four straight cuts -> cut 1: 2, cut 2: 4 ->
// cut 3: through the middle 6, off the middle 7 -> rule: one plus one per crossing -> re-hook: room for cut 4? ->
// tilt it, three crossings, 11 -> payoff: 10 cuts = 56 not 20, nobody said equal -> CTA comment: 5 cuts? (16).
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, HookText, Headline, Punch, Riser, Sfx, Shake, Span, Stamp,
  Text, tween, useAt, useT,
} from "../kit";

// a cut is a straight line in normal form: x cos(phi) + y sin(phi) = d (d as a fraction of the radius)
type Cut = { phi: number; d: number; t?: number; color?: string };
const MIDDLE4: Cut[] = [{ phi: 0, d: 0 }, { phi: 45, d: 0 }, { phi: 90, d: 0 }, { phi: 135, d: 0 }];
const SMART4: Cut[] = [{ phi: 0, d: 0.3 }, { phi: 45, d: 0.3 }, { phi: 90, d: 0.3 }, { phi: 135, d: 0.3 }];
// the step-by-step cuts: two diameters, then an off-centre diagonal, then a tilted fourth (11 pieces, no triple points)
const S1: Cut = { phi: 0, d: 0 };
const S2: Cut = { phi: 90, d: 0 };
const S3MID: Cut = { phi: 45, d: 0 };
const S3: Cut = { phi: 45, d: 0.35 };
const S4: Cut = { phi: 110, d: 0.15 };

const crossPt = (a: Cut, b: Cut) => {
  const ra = (a.phi * Math.PI) / 180, rb = (b.phi * Math.PI) / 180;
  const det = Math.cos(ra) * Math.sin(rb) - Math.sin(ra) * Math.cos(rb);
  return { x: (a.d * Math.sin(rb) - b.d * Math.sin(ra)) / det, y: (Math.cos(ra) * b.d - Math.cos(rb) * a.d) / det };
};

// Pizza with cuts that draw in at their time t (seconds in the current span; undefined = already drawn).
const Pizza: React.FC<{ r?: number; cuts: Cut[]; dots?: { a: Cut; b: Cut; t: number }[] }> = ({ r = 300, cuts, dots = [] }) => {
  const t = useT();
  const s = r + 20;
  const pep = [[0.45, 0.2], [-0.5, 0.35], [0.1, -0.6], [-0.25, -0.15], [0.55, -0.45], [-0.6, -0.5], [0.2, 0.65], [-0.15, 0.55]];
  return (
    <svg width={2 * s} height={2 * s} viewBox={`${-s} ${-s} ${2 * s} ${2 * s}`} style={{ overflow: "visible" }}>
      <circle r={r} fill="#E8A33D" />
      <circle r={r * 0.88} fill="#F4D27A" />
      {pep.map(([x, y], i) => <circle key={i} cx={x * r} cy={y * r} r={r * 0.09} fill={C.coral} opacity={0.85} />)}
      {cuts.map((c, i) => {
        const ph = (c.phi * Math.PI) / 180;
        const h = Math.sqrt(1 - c.d * c.d) * r * 1.02;
        const px = c.d * r * Math.cos(ph), py = -c.d * r * Math.sin(ph);
        const dx = -Math.sin(ph), dy = -Math.cos(ph);
        const k = c.t === undefined ? 1 : tween(t, c.t, c.t + 0.45, 0, 1);
        return (
          <line key={i} x1={px - dx * h} y1={py - dy * h} x2={px - dx * h + 2 * dx * h * k} y2={py - dy * h + 2 * dy * h * k}
            stroke={c.color ?? C.bg} strokeWidth={r * 0.035} strokeLinecap="round" opacity={k > 0 ? 1 : 0} />
        );
      })}
      {dots.map(({ a, b, t: td }, i) => {
        const p = crossPt(a, b);
        return <circle key={`d${i}`} cx={p.x * r} cy={-p.y * r} r={r * 0.06} fill={C.mint} stroke={C.bg} strokeWidth={4}
          opacity={t >= td ? 1 : 0} />;
      })}
    </svg>
  );
};

// ---------------------------------------------------------------- 1. hook: 8 vs 11
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t11 = at.word("11.", 1, 1.8);
  return (
    <>
      <HookText size={100} y={290}>{"4 cuts:\n8 vs **11**"}</HookText>
      <Riser to={t11} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06, y: 760 }]]}>
        <At x={290} y={720}><Pizza r={210} cuts={MIDDLE4} /></At>
        <At x={790} y={720}><Pizza r={210} cuts={SMART4} /></At>
        <At x={290} y={1010}><Text size={96} color={C.muted} font={F.bold}>8</Text></At>
        <Punch at={t11} amount={0.15}>
          <At x={790} y={1010}><Text size={110} color={t >= t11 - 0.1 ? C.amber : C.muted} font={F.bold}>11</Text></At>
        </Punch>
      </Camera>
      <Sfx name="pack/ding" at={t11} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 2. the problem
const ProblemBody: React.FC = () => {
  const at = useAt();
  const t11 = at.word("11", 1, 1.0);
  const tStack = at.word("stacking,", 1, 2.0);
  const tFour = at.word("Four", 1, 3.4);
  return (
    <>
      <Headline>11 people, 1 pizza</Headline>
      <At x={540} y={700}><Pizza r={280} cuts={[]} /></At>
      <At x={540} y={460}><Appear at={t11 - 0.2} from="pop"><Chip size={52} color={C.amber}>11 hungry people</Chip></Appear></At>
      <At x={540} y={1030}>
        <Appear at={tStack - 0.2} out={tFour - 0.2} from="pop"><Text size={58} color={C.coral} font={F.bold}>no stacking, no folding</Text></Appear>
      </At>
      <At x={540} y={1030}><Appear at={tFour - 0.1} from="slam"><Text size={72} color={C.ink} font={F.bold}>4 straight cuts</Text></Appear></At>
      <Sfx name="pack/wrong" at={tStack} volume={0.2} />
      <Sfx name="pack/swoosh" at={tFour} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 3. cuts one and two
const TwoBody: React.FC = () => {
  const at = useAt();
  const t1 = at.word("one:", 1, 0.4);
  const t2 = at.word("two,", 2, 1.8);
  const tFour = at.word("four.", 1, 3.0);
  return (
    <>
      <Headline>Cut 1, cut 2</Headline>
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05, y: 680 }]]}>
        <At x={540} y={680}><Pizza r={300} cuts={[{ ...S1, t: t1 - 0.2 }, { ...S2, t: t2 - 0.1 }]} /></At>
      </Camera>
      <At x={540} y={1080}>
        <Counter from={2} to={4} t0={tFour - 0.2} t1={tFour} size={90} color={C.amber} suffix=" pieces" />
      </At>
      <Sfx name="pack/whoosh-fast" at={t1 - 0.2} volume={0.3} />
      <Sfx name="pack/whoosh-fast-2" at={t2 - 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 4. cut three: middle 6, off-centre 7
const ThreeBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tWrong = at.word("wrong.", 1, 1.4);
  const tMid = at.word("middle,", 1, 2.6);
  const tSix = at.word("six.", 1, 3.6);
  const tMiss = at.word("Miss", 1, 4.4);
  const tCross = at.word("crosses", 1, 5.6);
  const tSeven = at.word("seven.", 1, 7.4);
  const off = t >= tMiss - 0.2;
  return (
    <>
      <Headline>Cut 3</Headline>
      <At x={290} y={660}>
        <Pizza r={210} cuts={[S1, S2, { ...S3MID, t: tMid - 0.4, color: C.coral }]} />
      </At>
      <At x={290} y={930}><Appear at={tSix - 0.2} from="pop"><Text size={80} color={C.coral} font={F.bold}>6</Text></Appear></At>
      <At x={790} y={660}>
        <div style={{ opacity: off ? 1 : 0.25 }}>
          <Pizza r={210} cuts={[S1, S2, { ...S3, t: tMiss - 0.1, color: C.mint }]}
            dots={[{ a: S1, b: S3, t: tCross }, { a: S2, b: S3, t: tCross + 0.3 }]} />
        </div>
      </At>
      <Punch at={tSeven} amount={0.15}>
        <At x={790} y={930}><Appear at={tSeven - 0.2} from="slam"><Text size={96} color={C.amber} font={F.bold}>7</Text></Appear></At>
      </Punch>
      <At x={290} y={1060}><Appear at={tWrong - 0.2} from="up"><Text size={44} color={C.muted} font={F.med}>through the middle</Text></Appear></At>
      <At x={790} y={1060}><Appear at={tMiss - 0.1} from="up"><Text size={44} color={C.muted} font={F.med}>miss the middle</Text></Appear></At>
      <Sfx name="pack/wrong" at={tSix} volume={0.2} />
      <Sfx name="pack/pop" at={tCross} volume={0.25} />
      <Sfx name="pack/pop-2" at={tCross + 0.3} volume={0.25} />
      <Sfx name="pack/correct" at={tSeven} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 5. the rule
const RuleBody: React.FC = () => {
  const at = useAt();
  const tOne = at.word("one", 1, 1.6);
  const tEvery = at.word("every", 1, 3.0);
  return (
    <>
      <Headline>The rule</Headline>
      <At x={540} y={600}><Pizza r={240} cuts={[S1, S2, { ...S3, color: C.mint }]} dots={[{ a: S1, b: S3, t: 0 }, { a: S2, b: S3, t: 0 }]} /></At>
      <At x={540} y={900}><Appear at={tOne - 0.2} from="pop"><Text size={72} color={C.ink} font={F.bold}>new cut: 1 piece</Text></Appear></At>
      <At x={540} y={1000}><Appear at={tEvery - 0.2} from="pop"><Text size={72} color={C.mint} font={F.bold}>+ 1 per crossing ●</Text></Appear></At>
      <At x={540} y={1100}><Appear at={tEvery + 0.8} from="up"><Text size={50} color={C.muted} font={F.med}>cut 3: 1 + 2 = 3 new</Text></Appear></At>
      <Sfx name="pack/notify-idea" at={tOne - 0.2} volume={0.3} />
      <Sfx name="pack/pop-3" at={tEvery - 0.2} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 6. re-hook: room for cut four?
const ReHookBody: React.FC = () => {
  const at = useAt();
  const tAll = at.word("all", 1, 1.2);
  const tRoom = at.word("room?", 1, 2.4);
  return (
    <>
      <Headline color={C.amber}>Cross all three?</Headline>
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.12, y: 680 }]]}>
        <At x={540} y={680}><Pizza r={300} cuts={[S1, S2, S3]} /></At>
      </Camera>
      <Shake at={tRoom}>
        <At x={540} y={1080}><Appear at={tAll - 0.2} from="slam"><Chip size={56} color={C.coral}>3 crossings needed</Chip></Appear></At>
      </Shake>
      <Sfx name="pack/hmm" at={tRoom} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 7. cut four: 11
const FourBody: React.FC = () => {
  const at = useAt();
  const tTilt = at.word("Tilt", 1, 0.3);
  const tAll = at.word("all", 1, 1.6);
  const tFour = at.word("four", 1, 3.8);
  const t11 = at.word("11.", 1, 4.6);
  return (
    <>
      <Headline>Cut 4</Headline>
      <Camera keys={[[0, { zoom: 1.08, y: 640 }], [t11, { zoom: 1 }]]}>
        <At x={540} y={660}>
          <Pizza r={300} cuts={[S1, S2, S3, { ...S4, t: tTilt - 0.1, color: C.mint }]}
            dots={[{ a: S1, b: S4, t: tAll - 0.1 }, { a: S2, b: S4, t: tAll + 0.2 }, { a: S3, b: S4, t: tAll + 0.5 }]} />
        </At>
      </Camera>
      <At x={540} y={1060}>
        <Appear at={tFour - 0.2} out={t11 - 0.2} from="pop"><Text size={64} color={C.mint} font={F.bold}>7 + 4</Text></Appear>
      </At>
      <Punch at={t11} amount={0.15}>
        <At x={540} y={1060}><Appear at={t11 - 0.15} from="slam"><Text size={120} color={C.amber} font={F.bold}>11</Text></Appear></At>
      </Punch>
      <Sfx name="pack/whoosh-fast" at={tTilt - 0.1} volume={0.3} />
      <Sfx name="pack/pop" at={tAll - 0.1} volume={0.25} />
      <Sfx name="pack/pop-2" at={tAll + 0.2} volume={0.25} />
      <Sfx name="pack/pop-3" at={tAll + 0.5} volume={0.25} />
      <Sfx name="pack/win" at={t11} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 8. payoff: 56 vs 20
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tAdds = at.word("adds", 1, 0.8);
  const t56 = at.word("56", 1, 3.2);
  const t20 = at.word("20.", 1, 4.2);
  const tEqual = at.word("equal.", 1, 5.8);
  const steps = ["+1", "+2", "+3", "+4", "+5", "…", "+10"];
  return (
    <>
      <Headline>10 cuts</Headline>
      <At x={540} y={440}>
        <div style={{ display: "flex", gap: 18, fontFamily: F.bold, fontSize: 56, color: C.mint }}>
          {steps.map((s, i) => (
            <Appear key={i} at={tAdds - 0.2 + i * 0.18} from="pop"><span>{s}</span></Appear>
          ))}
        </div>
      </At>
      <At x={330} y={720}><Appear at={t56 - 0.3} from="slam"><Text size={150} color={C.amber} font={F.bold}>56</Text></Appear></At>
      <At x={330} y={850}><Appear at={t56 - 0.1} from="up"><Text size={44} color={C.muted} font={F.med}>smart cuts</Text></Appear></At>
      <At x={760} y={720}><Appear at={t20 - 0.3} from="pop"><Text size={110} color={C.muted} font={F.bold}>20</Text></Appear></At>
      <At x={760} y={850}><Appear at={t20 - 0.1} from="up"><Text size={44} color={C.muted} font={F.med}>through the middle</Text></Appear></At>
      <At x={540} y={1040}><Appear at={tEqual - 0.5} from="slam"><Stamp size={64} color={C.coral} rotate={-5}>NOT EQUAL</Stamp></Appear></At>
      <Sfx name="pack/cash-ting" at={t56 - 0.2} volume={0.3} />
      <Sfx name="stamp" at={tEqual - 0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 9. CTA: five cuts?
const CtaBody: React.FC = () => {
  const at = useAt();
  const tHow = at.word("How", 1, 0.9);
  return (
    <>
      <Headline>5 cuts?</Headline>
      <At x={540} y={680}><Pizza r={280} cuts={[...SMART4, { phi: 160, d: 0.55 }]} /></At>
      <At x={540} y={1060}><Appear at={tHow - 0.2} from="pop"><Text size={84} color={C.amber} font={F.bold}>? slices</Text></Appear></At>
      <Sfx name="pack/popup" at={tHow - 0.2} volume={0.3} />
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="problem"><ProblemBody /></Span>
    <Span from="two"><TwoBody /></Span>
    <Span from="three"><ThreeBody /></Span>
    <Span from="rule"><RuleBody /></Span>
    <Span from="rehook"><ReHookBody /></Span>
    <Span from="four"><FourBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
