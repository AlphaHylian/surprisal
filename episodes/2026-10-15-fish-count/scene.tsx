// "How to count every fish in a lake with two catches": stakes hook -> rule out draining -> trip one
// (tag 200) -> mix -> trip two (20 tagged of 200) -> 1 in 10 -> 2,000 -> re-hook (luck?) -> simulated
// trips -> bigger catches -> tag-shy catch -> payoff (share in the net = share of the lake) -> frog question.
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, Emoji, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// Deterministic scatter of the lake's 2,000 fish (shown as 400 dots: 1 dot = 5 fish, 40 of them tagged).
const rand = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const LAKE = { x: 540, y: 790, rx: 430, ry: 270 };
const DOTS = Array.from({ length: 400 }, (_, i) => {
  const a = rand(i) * Math.PI * 2, r = Math.sqrt(rand(i + 1000)) * 0.9;
  return { x: LAKE.x + Math.cos(a) * r * LAKE.rx, y: LAKE.y + Math.sin(a) * r * LAKE.ry, tagged: i % 10 === 3 };
});

const Lake: React.FC<{ show?: number; tagged?: number; fade?: number; children?: React.ReactNode }> = ({ show = 0, tagged = 1e9, fade = 1, children }) => {
  const t = useT();
  return (
    <div style={{ position: "absolute", inset: 0, opacity: fade }}>
      <div style={{ position: "absolute", left: LAKE.x - LAKE.rx - 30, top: LAKE.y - LAKE.ry - 30, width: (LAKE.rx + 30) * 2, height: (LAKE.ry + 30) * 2,
        borderRadius: "50%", background: `radial-gradient(${C.mint}33, ${C.mint}11)`, border: `4px solid ${C.mint}88` }} />
      {DOTS.map((d, i) => {
        const p = tween(t, show + (i / 400) * 0.6, show + (i / 400) * 0.6 + 0.2, 0, 1);
        const tg = d.tagged && t >= tagged;
        return <div key={i} style={{ position: "absolute", left: d.x - 7, top: d.y - 7, width: 14, height: 14, borderRadius: 7,
          background: tg ? C.amber : C.ink, opacity: p * (tg ? 1 : 0.5), boxShadow: tg ? `0 0 12px ${C.amber}` : "none" }} />;
      })}
      {children}
    </div>
  );
};

/** A 20 x 10 grid of fish dots (the 200 in your net); `tagged` indices glow amber from tTag. */
const Net: React.FC<{ show: number; tTag: number; tagged: (i: number) => boolean; y?: number }> = ({ show, tTag, tagged, y = 720 }) => {
  const t = useT();
  return (
    <At y={y}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(20, 34px)", gap: 8 }}>
        {Array.from({ length: 200 }, (_, i) => {
          const p = tween(t, show + i * 0.004, show + i * 0.004 + 0.2, 0, 1);
          const tg = tagged(i) && t >= tTag;
          return <div key={i} style={{ width: 34, height: 34, borderRadius: 17, background: tg ? C.amber : C.ink, opacity: p * (tg ? 1 : 0.55),
            boxShadow: tg ? `0 0 14px ${C.amber}` : "none" }} />;
        })}
      </div>
    </At>
  );
};

// ---------------------------------------------------------------- 1. hook + rule-out
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tOut = at.word("fished", 1, 2.0);
  const gone = tween(t, tOut, tOut + 0.8, 1, 0.15);
  return (
    <>
      <HookText>{"Wrong fish count.\n**Empty lake.**"}</HookText>
      <Riser to={tOut} volume={0.5} />
      <Camera keys={[[0, { zoom: 1.0 }], [at.dur, { zoom: 1.06 }]]}>
        <Lake show={-1} fade={gone} />
        <At x={540} y={790}><Appear at={0} from="pop"><Chip size={64} color={C.coral}>? fish</Chip></Appear></At>
      </Camera>
      <Shake at={tOut}><At x={540} y={1100}><Appear at={tOut} from="slam"><Text size={56} color={C.coral}>fished out</Text></Appear></At></Shake>
    </>
  );
};

const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tDrain = at.word("drain", 1, 0.6);
  const tBottom = at.word("count", 1, 1.4);
  const tTwo = at.word("two", 1, 3.0);
  const Out: React.FC<{ t: number; children: string }> = ({ t, children }) => (
    <div style={{ position: "relative" }}>
      <Chip color={C.panel} text={C.ink} size={70}>{children}</Chip>
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%" }}>
        <Appear at={t + 0.3} from="slam"><div style={{ height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-4deg)" }} /></Appear>
      </div>
    </div>
  );
  return (
    <>
      <At y={430}><Appear at={0.05} from="left"><Out t={tDrain}>drain the lake</Out></Appear></At>
      <At y={620}><Appear at={Math.min(tBottom, 0.6)} from="right"><Out t={tBottom}>count them all</Out></Appear></At>
      <Punch at={tTwo}>
        <At y={880}>
          <Appear at={tTwo} from="pop">
            <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
              <Icon name="Sailboat" size={150} color={C.amber} glow />
              <Icon name="Sailboat" size={150} color={C.amber} glow />
            </div>
          </Appear>
        </At>
        <At y={1080}><Appear at={tTwo + 0.2} from="up"><Text size={64} color={C.amber}>2 fishing trips</Text></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 2. trip one: tag 200, release, mix
const TripOneBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t200 = at.word("200", 1, 1.0);
  const tTag = at.word("tag", 1, 2.4);
  const tGo = at.word("go", 1, 3.6);
  const tMix = at.beat("mix");
  const netFade = tween(t, tGo, tGo + 0.5, 1, 0);
  return (
    <>
      <Headline out={tMix - 0.3}>Trip 1: tag 200</Headline>
      <Headline at={tMix} color={C.mint}>Let them mix</Headline>
      {netFade > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: netFade }}>
          <Net show={t200} tTag={tTag} tagged={() => true} />
          <At y={1080}><Appear at={tTag} from="pop"><Icon name="Tag" size={110} color={C.amber} glow /></Appear></At>
        </div>
      ) : null}
      {t >= tGo ? <Lake show={tGo} tagged={tGo} /> : null}
      <At y={1110}><Appear at={tMix + 0.3} from="up"><Text size={48} color={C.muted}>200 tagged, swimming with the rest</Text></Appear></At>
      <Sfx name="pack/whoosh-short" at={tGo} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 3. trip two: 20 of 200 -> 2,000
const TAG2 = new Set([7, 18, 26, 41, 55, 63, 79, 84, 97, 102, 116, 121, 138, 149, 153, 167, 172, 185, 191, 198]);
const TripTwoBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCount = at.word("count", 1, 2.0);
  const t20 = at.word("20", 1, 3.2);
  const tMath = at.beat("math");
  const tTenth = at.word("tenth", 1, tMath + 4.0);
  const t2000 = at.word("2,000", 1, tMath + 6.0);
  const netOut = tween(t, tMath + 0.0, tMath + 0.4, 1, 0);
  return (
    <>
      <Headline out={tMath - 0.3}>Trip 2: catch 200</Headline>
      <Headline at={tMath} color={C.amber}>1 in 10 is tagged</Headline>
      {netOut > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: netOut }}>
          <Net show={0.1} tTag={tCount + 0.3} tagged={(i) => TAG2.has(i)} y={640} />
          <At y={1000}><Appear at={t20} from="slam"><Chip size={64}>20 tagged</Chip></Appear></At>
        </div>
      ) : null}
      <At y={500}>
        <Appear at={tMath + 0.1} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Text size={84} color={C.amber}>20</Text><Text size={60} color={C.muted}>of</Text><Text size={84}>200</Text>
            <Text size={60} color={C.muted}>=</Text><Text size={84} color={C.amber}>1 in 10</Text>
          </div>
        </Appear>
      </At>
      <At y={700}>
        <Appear at={tTenth - 0.6} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Text size={64} color={C.amber}>200 tagged</Text><Text size={60} color={C.muted}>=</Text><Text size={64}>1/10 of the lake</Text>
          </div>
        </Appear>
      </At>
      <Punch at={t2000}>
        <At y={940}>
          <Appear at={t2000 - 0.5} from="pop">
            <Counter from={200} to={2000} t0={t2000 - 0.5} t1={t2000} size={170} color={C.mint} suffix=" fish" />
          </Appear>
        </At>
      </Punch>
      <Sfx name="ding" at={tCount + 0.3} volume={0.4} />
      <Sfx name="pack/boom-short" hit={t2000} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 4. re-hook + simulated trips
const SIM200 = [1600, 2353, 2000, 2857, 2222, 1905, 1739, 1481, 2000, 2500, 2353, 2353, 1600, 1739, 1667, 1538, 1818, 2105, 1818, 2500, 2667, 2222, 1905, 2667, 2667, 1905, 2222, 2667, 1905, 1538, 1905, 2000, 2105, 1818, 2000, 1538, 2000, 2353, 2667, 3077, 1905, 2667, 2000, 2000, 1538, 1905, 1481, 3333, 1739, 2222, 2000, 1818, 1818, 2500, 4444, 1739, 2500, 2000, 3333, 1739];
const SIM500 = [1773, 1984, 1953, 2137, 2212, 2137, 1761, 2066, 1923, 2083, 1938, 2174, 1953, 1908, 1852, 2119, 1825, 2174, 1923, 2336, 1736, 2033, 1969, 2336, 2033, 2083, 2066, 1761, 2137, 1799, 1866, 1908, 2049, 1938, 2101, 1969, 1880, 1953, 2033, 2137, 1923, 2016, 2049, 2049, 1908, 1812, 2033, 1894, 2016, 2101, 2083, 2155, 2016, 2119, 1969, 2000, 1799, 1969, 1984, 1984];
const X0 = 1000, X1 = 4600, PX0 = 110, PX1 = 970;
const px = (v: number) => PX0 + ((v - X0) / (X1 - X0)) * (PX1 - PX0);

/** Dot plot: one dot per simulated trip, stacked where estimates land in the same 50-fish bin. */
const Strip: React.FC<{ data: number[]; base: number; t0: number; color: string }> = ({ data, base, t0, color }) => {
  const t = useT();
  const stack: Record<number, number> = {};
  return (
    <>
      {data.map((v, i) => {
        const bin = Math.round(v / 60);
        const h = (stack[bin] = (stack[bin] ?? 0) + 1);
        const p = tween(t, t0 + i * 0.03, t0 + i * 0.03 + 0.2, 0, 1);
        return <div key={i} style={{ position: "absolute", left: px(v) - 9, top: base - h * 22, width: 18, height: 18, borderRadius: 9, background: color, opacity: p }} />;
      })}
    </>
  );
};

const Axis: React.FC<{ y: number }> = ({ y }) => (
  <>
    <div style={{ position: "absolute", left: PX0, top: y, width: PX1 - PX0, height: 4, background: C.muted }} />
    {[1000, 2000, 3000, 4000].map((v) => (
      <div key={v} style={{ position: "absolute", left: px(v) - 60, top: y + 12, width: 120, textAlign: "center", fontFamily: F.med, fontSize: 40, color: v === 2000 ? C.mint : C.muted }}>{v.toLocaleString("en-US")}</div>
    ))}
    <div style={{ position: "absolute", left: px(2000) - 2, top: y - 360, width: 4, height: 360, background: `${C.mint}88` }} />
  </>
);

const Bracket: React.FC<{ lo: number; hi: number; y: number; at: number; label: string; color: string }> = ({ lo, hi, y, at, label, color }) => {
  const t = useT();
  const o = tween(t, at, at + 0.3, 0, 1);
  return (
    <div style={{ position: "absolute", left: px(lo), top: y, width: px(hi) - px(lo), opacity: o }}>
      <div style={{ height: 10, borderRadius: 5, background: color, boxShadow: `0 0 16px ${color}` }} />
      <div style={{ textAlign: "center", fontFamily: F.bold, fontSize: 46, color, marginTop: 8, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
};

const RangeBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRange = at.beat("range");
  const tComputer = at.word("computer", 1, tRange + 1.8);
  const t2900 = at.word("2,900", 1, tRange + 6.0);
  const tBig = at.beat("bigger");
  const t2300 = at.word("2,300", 1, tBig + 3.0);
  const first = tween(t, tBig, tBig + 0.4, 1, 0);
  return (
    <>
      <Headline out={tRange - 0.3} color={C.coral}>One trip could be luck</Headline>
      <Headline at={tRange} out={tBig - 0.3}>Each dot: one trip of 200</Headline>
      <Headline at={tBig} color={C.mint}>Catch 500 each trip</Headline>
      {t < tRange ? (
        <Punch at={0.4}><At y={720}><Appear at={0.1} from="pop"><Text size={150} color={C.coral}>2,000?</Text></Appear></At></Punch>
      ) : null}
      {t >= tRange ? (
        <>
          <Axis y={980} />
          <div style={{ position: "absolute", inset: 0, opacity: first }}>
            <Strip data={SIM200} base={975} t0={tComputer} color={C.amber} />
            <Bracket lo={1500} hi={2900} y={420} at={t2900 - 1.0} label="9 in 10: 1,500 to 2,900" color={C.amber} />
          </div>
          {t >= tBig ? <Strip data={SIM500} base={975} t0={tBig + 0.3} color={C.mint} /> : null}
          {t >= tBig ? <Bracket lo={1800} hi={2300} y={420} at={t2300 - 0.6} label="1,800 to 2,300" color={C.mint} /> : null}
        </>
      ) : null}
      <Sfx name="pack/whoosh-short" at={tComputer} volume={0.35} />
      <Sfx name="ding" at={t2300} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 5. the catch: tag-shy fish
const ShyBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tDodge = at.word("dodge", 1, 1.4);
  const tFew = at.word("few", 1, 2.6);
  const tTwice = at.word("twice", 1, 4.6);
  const drift = tween(t, tDodge, tDodge + 1.0, 0, 1);
  return (
    <>
      <Headline color={C.coral}>The catch</Headline>
      <At x={540} y={620}><Icon name="Grid3x3" size={300} color={C.muted} stroke={1.2} /></At>
      {[0, 1, 2, 3, 4].map((i) => (
        <At key={i} x={460 + i * 40 + drift * (i % 2 ? 260 : -260)} y={560 + (i % 3) * 60 + drift * 120}>
          <Appear at={0.1 + i * 0.05} from="pop"><div style={{ width: 30, height: 30, borderRadius: 15, background: C.amber, boxShadow: `0 0 14px ${C.amber}` }} /></Appear>
        </At>
      ))}
      <At y={880}><Appear at={tFew} from="pop"><Chip size={54} color={C.coral}>too few tagged in the net</Chip></Appear></At>
      <At y={1060}>
        <Appear at={tTwice - 0.6} from="up">
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <Counter from={2000} to={3700} t0={tTwice - 0.6} t1={tTwice} size={110} color={C.coral} />
            <Text size={48} color={C.muted}>fish (really 2,000)</Text>
          </div>
        </Appear>
      </At>
      <Sfx name="swoosh" at={tDodge} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 6. payoff + question
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tLake = at.word("lake", 1, 2.6);
  const tDanish = at.word("danish", 1, 4.0);
  return (
    <>
      <Headline color={C.amber}>The whole trick</Headline>
      <At y={560}>
        <Appear at={0.1} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <Text size={60} color={C.amber}>tagged in net</Text><Text size={60} color={C.muted}>=</Text><Text size={60} color={C.amber}>tagged in lake</Text>
          </div>
        </Appear>
      </At>
      <At y={700}>
        <Appear at={tLake} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <Text size={74} font={F.mono}>20 / 200</Text><Text size={60} color={C.muted}>=</Text><Text size={74} font={F.mono} color={C.mint}>200 / 2,000</Text>
          </div>
        </Appear>
      </At>
      <At y={940}><Appear at={tDanish} from="pop"><Chip color={C.mint} size={50}>plaice, Denmark, 1896</Chip></Appear></At>
      <Sfx name="ding" at={tLake} volume={0.4} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const t40 = at.word("40", 1, 1.4);
  const t8 = at.word("8", 1, 2.4);
  const tHow = at.word("how", 1, 3.2);
  return (
    <>
      <At y={420}><Appear at={0} from="pop"><Emoji char="🐸" size={190} /></Appear></At>
      <At y={640}><Appear at={0.2} from="left"><Text size={64}>tag <span style={{ color: C.amber }}>50</span> frogs</Text></Appear></At>
      <At y={760}><Appear at={t40} from="left"><Text size={64}>catch <span style={{ color: C.ink }}>40</span></Text></Appear></At>
      <At y={880}><Appear at={t8} from="left"><Text size={64}><span style={{ color: C.amber }}>8</span> are tagged</Text></Appear></At>
      <At y={1030}><Appear at={tHow} from="slam"><Stamp color={C.amber} rotate={-4} size={84}>how many frogs?</Stamp></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="mark" to="mix"><TripOneBody /></Span>
    <Span from="catch" to="math"><TripTwoBody /></Span>
    <Span from="rehook" to="bigger"><RangeBody /></Span>
    <Span from="shy"><ShyBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
