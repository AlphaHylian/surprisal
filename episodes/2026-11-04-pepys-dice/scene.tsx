// "Newton's dice bet": the Newton-Pepys problem (1693).
// versus hook (1 six from 6 dice vs 3 from 18) -> rule out "same bet": Pepys sure 18 is better, asks Newton
// -> 6 dice: count misses, 5 in 6, all miss a third, win 67% -> 18 dice: average 3, why not safer?
// -> ways to fall short: one vs three (0, 1, 2 = 40%) -> 18 win 60%, 12 win 62% -> payoff 67/62/60 -> CTA
import React from "react";
import {
  Appear, At, C, Camera, Chip, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT,
} from "../kit";

const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]], 6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};
const Die: React.FC<{ n: number; size?: number; color?: string; rot?: number; dim?: boolean }> = ({ n, size = 100, color = C.ink, rot = 0, dim }) => {
  const pip = size * 0.17;
  const pipColor = color === C.ink || color === C.muted ? C.bg : "#1a1a1a";
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.18, background: color, position: "relative", transform: `rotate(${rot}deg)`,
      boxShadow: color === C.amber ? `0 0 26px ${C.amber}aa` : `0 8px 24px #0008`, flex: "none", opacity: dim ? 0.35 : 1 }}>
      {PIPS[n].map(([r, c], i) => (
        <div key={i} style={{ position: "absolute", width: pip, height: pip, borderRadius: pip / 2, background: pipColor,
          left: size * (0.2 + 0.3 * c) - pip / 2, top: size * (0.2 + 0.3 * r) - pip / 2 }} />
      ))}
    </div>
  );
};
// fixed rolls so the pictures are always the same
const SIX = [3, 6, 2, 5, 1, 4];
const EIGHTEEN = [2, 6, 4, 1, 5, 3, 6, 2, 4, 5, 1, 3, 4, 2, 6, 5, 1, 3];
const Grid: React.FC<{ dice: number[]; size?: number; perRow?: number; gap?: number; hiSix?: boolean; wob?: number; dimNonSix?: boolean; show?: number }> =
  ({ dice, size = 90, perRow = 6, gap = 16, hiSix = true, wob = 0, dimNonSix, show = 0 }) => {
  const t = useT();
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${perRow}, ${size}px)`, gap }}>
      {dice.map((d, i) => {
        const vis = t >= show + i * 0.03;
        return (
          <div key={i} style={{ opacity: vis ? 1 : 0 }}>
            <Die n={d} size={size} color={hiSix && d === 6 ? C.amber : C.ink} rot={wob * Math.sin(t * 5 + i)} dim={dimNonSix && d !== 6} />
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSmart = at.word("smart", 1, 2.4);
  const w = 6 * Math.exp(-t * 0.7);
  return (
    <>
      <HookText>{"1 six from 6 dice\nvs **3 from 18**"}</HookText>
      <Riser to={tSmart} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05 }]]}>
        <At x={540} y={540}><Grid dice={SIX} size={110} wob={w} /></At>
        <At x={540} y={660}><Text size={46} color={C.muted}>6 dice: need 1 six</Text></At>
        <At x={540} y={880}><Grid dice={EIGHTEEN} size={82} gap={12} wob={w} /></At>
        <At x={540} y={1090}><Text size={46} color={C.muted}>18 dice: need 3 sixes</Text></At>
      </Camera>
      <Sfx name="pack/hit-low" at={tSmart} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- rule out: same bet? Pepys asks Newton
const RuleoutBody: React.FC = () => {
  const at = useAt();
  const tSame = at.word("same", 1, 0.8);
  const tEvery = at.word("every", 1, 1.8);
  const t1693 = at.word("1693", 1, 3.2);
  const tSure = at.word("sure", 1, 4.6);
  const tNewton = at.word("Newton", 1, 6.4);
  const groups = [EIGHTEEN.slice(0, 6), EIGHTEEN.slice(6, 12), EIGHTEEN.slice(12, 18)];
  return (
    <>
      <Headline out={t1693 - 0.3}>The same bet?</Headline>
      <Headline at={t1693} color={C.amber}>London, 1693</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t1693 - 0.2, { zoom: 1 }], [t1693 + 0.5, { zoom: 1.03 }]]}>
        {groups.map((g, k) => (
          <At key={k} x={540} y={430 + k * 130}>
            <Appear at={0.05 + k * 0.2} from="left">
              <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
                <Grid dice={g} size={78} gap={10} />
                <Text size={44} color={C.mint}>1 six</Text>
              </div>
            </Appear>
          </At>
        ))}
        <At x={540} y={430 + 3 * 130 - 20}><Appear at={tSame} out={t1693 - 0.1} from="up"><Text size={50} color={C.muted}>one six for every 6 dice</Text></Appear></At>
        <At x={290} y={930}><Appear at={t1693} from="pop">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Icon name="Feather" size={190} color={C.ink} />
            <Text size={54}>Samuel Pepys</Text>
          </div>
        </Appear></At>
        <At x={290} y={1120}><Appear at={tSure} from="slam"><Chip color={C.coral} size={52}>"18 dice!"</Chip></Appear></At>
        <At x={790} y={930}><Appear at={tNewton - 0.2} from="pop">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Icon name="Apple" size={190} color={C.mint} />
            <Text size={54}>Isaac Newton</Text>
          </div>
        </Appear></At>
      </Camera>
      <Sfx name="pack/paper-flip" at={t1693} volume={0.4} />
      <Sfx name="pack/paper-slide" at={tNewton} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 6 dice: count the misses
const SixBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCheck = at.word("Check", 1, 0.9);
  const tMiss = at.word("misses", 1, 2.6);
  const tFive = at.word("5", 1, 4.0);
  const tThird = at.word("third", 1, 6.4);
  const t67 = at.word("67%", 1, 8.0);
  return (
    <>
      <Headline at={0} out={tMiss - 0.3}>Newton: take the 6 dice</Headline>
      <Headline at={tMiss} color={C.amber}>Count the misses</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tFive, { zoom: 1 }], [tFive + 0.6, { zoom: 1.08, y: 600 }], [t67 - 0.3, { zoom: 1 }]]}>
        <At x={540} y={500}><Appear at={0} from="drop"><Grid dice={[1, 2, 3, 4, 5, 6]} size={130} hiSix /></Appear></At>
        <At x={540} y={660}><Appear at={tFive} from="up"><Text size={56} color={C.muted}>each die misses <span style={{ color: C.ink }}>5 in 6</span></Text></Appear></At>
        <At x={540} y={820}><Appear at={tThird - 0.6} from="drop"><Grid dice={[3, 1, 5, 2, 4, 1]} size={120} hiSix={false} /></Appear></At>
        <At x={540} y={960}><Appear at={tThird} from="pop"><Text size={60} color={C.coral}>all six miss: 1 in 3</Text></Appear></At>
        <At x={540} y={1080}><Appear at={t67 - 0.1} from="slam"><Chip color={C.amber} size={66}>you win 67%</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/wrong" at={tThird} volume={0.3} />
      <Sfx name="pack/ding" at={t67} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 18 dice + falling short + 12 dice
const Hist: React.FC<{ vals: number[]; labels: string[]; failUpTo: number; t0: number; x: number; y: number; scale?: number; hiFail?: boolean }> =
  ({ vals, labels, failUpTo, t0, x, y, scale = 9, hiFail }) => {
  const t = useT();
  const bw = 62;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: vals.length * (bw + 10), height: 300 }}>
      {vals.map((v, i) => {
        const h = tween(t, t0 + i * 0.05, t0 + i * 0.05 + 0.5, 0, v * scale);
        const fail = i < failUpTo;
        const color = fail ? (hiFail ? C.coral : C.muted) : C.mint;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: i * (bw + 10), bottom: 60, width: bw, height: h, borderRadius: 10, background: color,
              boxShadow: fail && hiFail ? `0 0 18px ${C.coral}88` : "none" }} />
            <div style={{ position: "absolute", left: i * (bw + 10), bottom: 0, width: bw, textAlign: "center" }}>
              <Text size={40} color={fail && hiFail ? C.coral : C.muted}>{labels[i]}</Text>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
// chance (%) of exactly k sixes; 6 dice: k = 0..4, 18 dice: k = 0..8
const P6 = [33.5, 40.2, 20.1, 5.4, 0.8];
const P18 = [3.8, 13.5, 23.0, 24.5, 18.4, 10.3, 4.5, 1.5, 0.4];

const ShortBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tShort = at.beat("short");
  const tTwelve = at.beat("twelve");
  const tAvg = at.word("average", 1, 2.4);
  const tWhy = at.word("why", 1, 4.4);
  const tOne = at.word("one", 2, tShort + 2.4);
  const t18 = at.word("18", 2, tShort + 4.4);
  const t40 = at.word("40%", 1, tShort + 7.6);
  const t60 = at.word("60%", 1, tTwelve + 1.8);
  const t62 = at.word("62", 1, tTwelve + 4.0);
  return (
    <>
      <Headline out={tShort - 0.3}>18 dice, need 3</Headline>
      <Headline at={tShort} out={tTwelve - 0.3} color={C.amber}>Ways to fall short</Headline>
      <Headline at={tTwelve}>So who wins?</Headline>
      {/* beat "eighteen": the 18 dice with an average marker */}
      <At x={540} y={560}><Appear at={0} out={tShort - 0.2} from="drop"><Grid dice={EIGHTEEN} size={82} gap={12} /></Appear></At>
      <At x={540} y={800}><Appear at={tAvg} out={tShort - 0.2} from="up"><Text size={58}>average: exactly <span style={{ color: C.amber }}>3 sixes</span></Text></Appear></At>
      <At x={540} y={980}><Appear at={tWhy} out={tShort - 0.2} from="slam"><Stamp size={80} color={C.amber} rotate={-5}>SAFER?</Stamp></Appear></At>
      {/* beat "short": two histograms, the fail bars in coral */}
      <Camera keys={[[tShort, { zoom: 1 }], [t40, { zoom: 1 }], [t40 + 0.5, { zoom: 1.04 }], [tTwelve, { zoom: 1 }]]}>
        {t >= tShort - 0.05 && t < tTwelve + 0.2 && (
          <>
            <At x={540} y={370}><Text size={46} color={C.muted}>6 dice: sixes rolled</Text></At>
            <Hist vals={P6} labels={["0", "1", "2", "3", "4"]} failUpTo={1} t0={tShort + 0.2} x={360} y={380} scale={4.2} hiFail={t > tOne - 0.6} />
            <At x={540} y={760}><Appear at={t18 - 0.4} from="fade" sfx={null}><Text size={46} color={C.muted}>18 dice: sixes rolled</Text></Appear></At>
            <Hist vals={P18} labels={["0", "1", "2", "3", "4", "5", "6", "7", "8"]} failUpTo={3} t0={t18 - 0.3} x={216} y={770} scale={7} hiFail={t > t18 + 0.6} />
          </>
        )}
      </Camera>
      <At x={820} y={470}><Appear at={tOne} out={tTwelve - 0.2} from="pop"><Chip color={C.coral} size={46}>1 way to fail: 33%</Chip></Appear></At>
      <At x={540} y={1130}><Appear at={t40 - 0.1} out={tTwelve - 0.2} from="slam"><Chip color={C.coral} size={52}>0, 1 or 2 sixes: 40%</Chip></Appear></At>
      {/* beat "twelve": the three bets as bars */}
      {[{ l: "1 from 6", v: 67, t0: tTwelve + 0.1, c: C.amber }, { l: "2 from 12", v: 62, t0: t62 - 0.4, c: C.ink }, { l: "3 from 18", v: 60, t0: t60 - 0.4, c: C.muted }].map((r, i) => {
        const y = 480 + i * 200;
        const w = tween(t, r.t0, r.t0 + 0.6, 0, 6.4 * r.v);
        if (t < r.t0 - 0.05) return null;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: 80, top: y - 70 }}><Text size={48} color={C.muted}>{r.l}</Text></div>
            <div style={{ position: "absolute", left: 80, top: y, width: 640, height: 70, borderRadius: 35, background: C.dim }} />
            <div style={{ position: "absolute", left: 80, top: y, width: w, height: 70, borderRadius: 35, background: r.c }} />
            <div style={{ position: "absolute", left: 760, top: y - 2 }}><Text size={64} color={r.c}>{r.v}%</Text></div>
          </React.Fragment>
        );
      })}
      <Sfx name="pack/wrong" at={t40} volume={0.35} />
      <Sfx name="pack/ding-short" at={t60} volume={0.4} />
      <Sfx name="pack/ding-short" at={t62} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tMore = at.word("worse", 1, 5.0);
  const tBack = at.word("backwards", 1, 7.0);
  const t62 = at.word("62", 1, 1.4);
  const t60 = at.word("60", 1, 2.4);
  return (
    <>
      <Headline color={C.amber}>More dice, worse bet</Headline>
      <At x={250} y={520}><Appear at={0} from="pop"><Text size={120} color={C.amber}>67%</Text></Appear></At>
      <At x={540} y={520}><Appear at={t62 - 0.2} from="pop"><Text size={100}>62%</Text></Appear></At>
      <At x={830} y={520}><Appear at={t60 - 0.2} from="pop"><Text size={90} color={C.muted}>60%</Text></Appear></At>
      <At x={540} y={660}><Text size={44} color={C.muted}>6 dice · 12 dice · 18 dice</Text></At>
      <At x={540} y={850}><Appear at={tMore - 0.3} from="up"><Text size={54} color={C.mint}>same 1 six per 6 dice</Text></Appear></At>
      <At x={540} y={1030}><Appear at={tBack - 0.3} from="slam"><Stamp size={76} color={C.coral} rotate={-6}>PEPYS: BACKWARDS</Stamp></Appear></At>
      <Sfx name="pack/kaching" at={tBack} volume={0.3} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const t = useT();
  return (
    <>
      <HookText>{"1 six from 6 dice\nvs **3 from 18**"}</HookText>
      <At x={540} y={620}><Grid dice={SIX} size={110} wob={4 * Math.sin(t * 2)} /></At>
      <At x={540} y={880}><Grid dice={EIGHTEEN} size={82} gap={12} /></At>
      <At x={540} y={1100}><Appear at={0.2} from="up"><Text size={46} color={C.muted}>which would you bet on?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="six"><SixBody /></Span>
    <Span from="eighteen" to="twelve"><ShortBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
