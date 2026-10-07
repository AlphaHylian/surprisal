// "How to get the most pizza for your money": area vs width, as a pizza-ordering how-to.
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, Headline, Icon, Punch, Riser, Sfx, Shake,
  Span, Stamp, Text, You, tween, useAt, useT,
} from "../kit";

const PX = 22; // pixels per inch for the pizzas

/** A pizza `d` inches across. `crust` (0..1) lights the outer inch up in coral; `cut` (0..1) fades it away. */
const Pizza: React.FC<{ d: number; crust?: number; cut?: number; ring?: number }> = ({ d, crust = 0, cut = 0, ring = 0 }) => {
  const r = (d / 2) * PX, rin = r - PX;
  const dots = Array.from({ length: Math.round(d * 0.7) }, (_, i) => {
    const a = i * 2.39996, rr = rin * 0.82 * Math.sqrt((i + 0.5) / Math.round(d * 0.7));
    return [r + rr * Math.cos(a), r + rr * Math.sin(a)] as const;
  });
  const crustCol = crust > 0.5 ? C.coral : `${C.amber}99`;
  return (
    <svg width={2 * r} height={2 * r} style={{ overflow: "visible", filter: "drop-shadow(0 18px 30px #0009)" }}>
      <circle cx={r} cy={r} r={r} fill={crustCol} opacity={1 - cut * 0.85} />
      {ring > 0 ? <circle cx={r} cy={r} r={r - 4} fill="none" stroke={C.coral} strokeWidth={8} opacity={ring} style={{ filter: `drop-shadow(0 0 12px ${C.coral})` }} /> : null}
      <circle cx={r} cy={r} r={rin} fill={C.amber} />
      <circle cx={r} cy={r} r={rin * 0.96} fill={C.amber} opacity={0.85} />
      {dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={PX * 0.62} fill={C.coral} opacity={0.9} />)}
    </svg>
  );
};

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tTrick = at.word("trick", 1, 2.6);
  return (
    <>
      <Riser from={0} to={tTrick} volume={0.5} />
      <Shake at={tTrick}>
        <Camera keys={[[0, { zoom: 1.08 }], [tTrick, { zoom: 1 }], [at.dur, { zoom: 1.05, y: 640 }]]}>
          <At x={240} y={470}><Appear at={0} from="pop"><You role="hungry friend" size={190} /></Appear></At>
          <At x={720} y={470}><Appear at={0.1} from="right" dist={140}><Pizza d={16} /></Appear></At>
          <At x={540} y={900}><Appear at={tTrick} from="slam"><Stamp size={96}>MENU TRICK</Stamp></Appear></At>
        </Camera>
      </Shake>
      <Sfx name="pack/wrong" hit={tTrick + 0.05} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 2-3. the menu, and the width illusion
const MenuBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t18 = at.word("18-inch", 1, 1.4);
  const t12 = at.word("12-inch", 1, t18 + 1.2);
  const tWidth = at.beat("width");
  const t24 = at.word("24", 1, tWidth + 1.4);
  const tIsnt = at.word("isnt", 1, at.dur - 0.6);
  const pBar = tween(t, t24 - 0.5, t24 + 0.2, 0, 1);
  const S = 36; // px per inch for the width bars
  return (
    <>
      <Headline out={tWidth - 0.3}>Same price</Headline>
      <Headline at={tWidth}>Compare the widths?</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tWidth, { zoom: 1 }], [tWidth + 0.6, { zoom: 0.96 }]]}>
        <At x={290} y={620}><Appear at={t18 - 0.2} from="pop" sfx="pack/whoosh-fast" volume={0.3}><Pizza d={18} /></Appear></At>
        <At x={290} y={870}><Appear at={t18} from="up"><Chip size={44}>18-inch</Chip></Appear></At>
        <At x={800} y={480}><Appear at={t12 - 0.2} from="pop" sfx="pack/whoosh-fast" volume={0.3}><Pizza d={12} /></Appear></At>
        <At x={800} y={780}><Appear at={t12} from="pop" sfx={null}><Pizza d={12} /></Appear></At>
        <At x={800} y={960}><Appear at={t12 + 0.2} from="up"><Chip size={44}>2 × 12-inch</Chip></Appear></At>
        {/* width bars */}
        <At x={60 + (18 * S) / 2} y={1050}><Appear at={tWidth} from="left"><div style={{ width: 18 * S, height: 26, borderRadius: 13, background: C.mint }} /></Appear></At>
        <At x={60 + (24 * S * pBar) / 2} y={1110}><div style={{ width: 24 * S * pBar, height: 26, borderRadius: 13, background: C.amber, opacity: pBar > 0 ? 1 : 0 }} /></At>
        <At x={980} y={1050}><Appear at={tWidth + 0.2} from="pop"><Text size={44} color={C.mint}>18"</Text></Appear></At>
        <At x={980} y={1150}><Appear at={t24} from="pop"><Text size={44} color={C.amber}>24"</Text></Appear></At>
        <At x={800} y={630}><Appear at={tIsnt - 0.1} from="slam"><Stamp size={80}>IT ISN'T</Stamp></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 4. area
const AreaBody: React.FC = () => {
  const at = useAt();
  const t254 = at.word("254", 1, 2.4);
  const t113 = at.word("113", 1, t254 + 1.8);
  const t226 = at.word("226", 1, at.dur - 0.7);
  return (
    <>
      <Headline>You eat area</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t226 - 0.2, { zoom: 1 }], [t226 + 0.4, { zoom: 1.05 }]]}>
        <At x={290} y={620}><Pizza d={18} /></At>
        <At x={800} y={480}><Pizza d={12} /></At>
        <At x={800} y={780}><Pizza d={12} /></At>
        <At x={290} y={900}><Appear at={t254 - 0.3} from="up" sfx={null}><Counter from={0} to={254} t0={t254 - 0.3} t1={t254 + 0.2} size={90} color={C.mint} /></Appear></At>
        <At x={290} y={980}><Appear at={t254} from="fade" sfx={null}><Text size={40} font={F.med} color={C.muted}>square inches</Text></Appear></At>
        <At x={800} y={480}><Appear at={t113} from="pop"><Chip size={48}>113</Chip></Appear></At>
        <At x={800} y={780}><Appear at={t113 + 0.25} from="pop"><Chip size={48}>113</Chip></Appear></At>
        <At x={800} y={1010}><Appear at={t226 - 0.2} from="up"><Text size={90} color={C.amber}>226</Text></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 5-6. width times width; an eighth more
const SquareBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t324 = at.word("324", 1, 3.2);
  const t144 = at.word("144", 1, t324 + 1.6);
  const t288 = at.word("288", 1, t144 + 1.8);
  const tEighth = at.beat("eighth");
  const tMore = at.word("eighth", 1, tEighth + 1.4);
  const B = 18 * 22, S = 12 * 22;
  const sq = (n: number, size: number, t0: number, col: string) => (
    <div style={{ width: size, height: size, border: `4px solid ${col}`, borderRadius: 6, background: `${col}18`, display: "grid",
      gridTemplateColumns: `repeat(${n}, 1fr)`, opacity: tween(t, t0 - 0.4, t0, 0, 1) }}>
      {Array.from({ length: n * n }, (_, i) => <div key={i} style={{ border: `1px solid ${col}33` }} />)}
    </div>
  );
  return (
    <>
      <Headline out={tEighth - 0.3}>Width × width</Headline>
      <Headline at={tEighth} color={C.mint}>One big pizza wins</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tEighth, { zoom: 1 }], [tMore + 0.4, { zoom: 1.04 }]]}>
        <At x={290} y={620}>{sq(18, B, t324, C.mint)}</At>
        <At x={290} y={620}><div style={{ opacity: 0.55 }}><Pizza d={18} /></div></At>
        <At x={800} y={480}>{sq(12, S, t144, C.amber)}</At>
        <At x={800} y={780}>{sq(12, S, t288, C.amber)}</At>
        <At x={800} y={480}><div style={{ opacity: 0.55 }}><Pizza d={12} /></div></At>
        <At x={800} y={780}><div style={{ opacity: 0.55 }}><Pizza d={12} /></div></At>
        <At x={290} y={900}><Appear at={t324} from="pop" sfx="pack/ding-short"><Text size={84} color={C.mint}>18 × 18 = 324</Text></Appear></At>
        <At x={800} y={1010}><Appear at={t144} out={t288 - 0.1} from="pop" sfx="pack/ding-short"><Text size={64} color={C.amber}>12 × 12 = 144</Text></Appear></At>
        <At x={800} y={1010}><Appear at={t288} from="pop" sfx="pack/ding-short"><Text size={64} color={C.amber}>× 2 = 288</Text></Appear></At>
        <At x={540} y={1110}><Appear at={tMore - 0.2} from="slam"><Chip size={56} color={C.mint}>+ an eighth more food</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/kaching" at={tMore} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 7-8. crust: the middle
const CrustBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCrust = at.word("crust", 1, 2.0);
  const tCut = at.word("cut", 1, tCrust + 0.8);
  const tMid = at.beat("middle");
  const t201 = at.word("201", 1, tMid + 1.6);
  const t157 = at.word("157", 1, t201 + 2.4);
  const t28 = at.word("28%", 1, at.dur - 1.4);
  const cut = tween(t, tCut + 0.4, tCut + 1.2, 0, 1);
  return (
    <>
      <Headline color={C.coral} out={tMid - 0.3}>Uh-oh: no crust</Headline>
      <Headline at={tMid}>Just the middle</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tCut, { zoom: 1.06, y: 640 }], [tMid + 0.4, { zoom: 1 }]]}>
        <At x={290} y={620}><Pizza d={18} crust={t >= tCrust ? 1 : 0} cut={cut} /></At>
        <At x={800} y={480}><Pizza d={12} crust={t >= tCrust ? 1 : 0} cut={cut} /></At>
        <At x={800} y={780}><Pizza d={12} crust={t >= tCrust ? 1 : 0} cut={cut} /></At>
        <At x={540} y={1060}><Appear at={tCut} out={tMid - 0.2} from="pop" sfx="pack/paper-rip" volume={0.4}><Chip size={50} color={C.coral} text={C.ink}>−1 inch all round</Chip></Appear></At>
        <At x={290} y={900}><Appear at={t201 - 0.3} from="up" sfx={null}><Counter from={254} to={201} t0={t201 - 0.3} t1={t201 + 0.2} size={90} color={C.mint} /></Appear></At>
        <At x={800} y={1010}><Appear at={t157 - 0.3} from="up" sfx={null}><Counter from={226} to={157} t0={t157 - 0.3} t1={t157 + 0.2} size={90} color={C.amber} /></Appear></At>
        <At x={540} y={1120}><Appear at={t28 - 0.1} from="slam"><Chip size={54} color={C.mint}>28% more middle</Chip></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 9. every pizza adds a rim
const RimBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRing = at.word("ring", 1, 1.6);
  const tOne = at.word("one", 2, at.dur - 0.8);
  const g1 = tween(t, tRing - 0.2, tRing + 0.3, 0, 1);
  return (
    <>
      <Headline>Every pizza adds a rim</Headline>
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.04 }]]}>
        <At x={290} y={620}><Pizza d={18} ring={t >= tOne - 0.2 ? 1 : 0} /></At>
        <At x={800} y={480}><Pizza d={12} ring={g1} /></At>
        <At x={800} y={780}><Pizza d={12} ring={g1} /></At>
        <At x={800} y={1010}><Appear at={tRing} from="up"><Text size={56} color={C.coral}>2 rims</Text></Appear></At>
        <At x={290} y={900}><Appear at={tOne - 0.2} from="up"><Text size={56} color={C.mint}>1 rim</Text></Appear></At>
      </Camera>
      <Sfx name="pack/whoosh-arrow" hit={tRing} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 10. result, reveal, question
const ResultBody: React.FC = () => {
  const at = useAt();
  const tMore = at.word("more", 1, 1.6);
  const tCheese = at.word("cheese", 1, at.dur - 0.6);
  return (
    <>
      <Headline>Order the big one</Headline>
      <At x={540} y={560}><Appear at={0} from="pop" sfx="pack/kaching"><Pizza d={16} /></Appear></At>
      <At x={540} y={850}><Appear at={0.3} from="up"><Chip size={50} color={C.mint}>same money</Chip></Appear></At>
      <At x={540} y={960}><Appear at={tMore} from="up"><Chip size={50} color={C.mint}>+ an eighth more pizza</Chip></Appear></At>
      <At x={540} y={1070}><Appear at={tCheese - 0.2} from="pop" sfx="pack/win"><Chip size={50}>+28% middle</Chip></Appear></At>
      <Riser from={at.dur - 1.6} to={at.dur} volume={0.45} />
    </>
  );
};

const RevealBody: React.FC = () => {
  const at = useAt();
  const tSq = at.word("square", 1, 1.6);
  const t64 = at.word("64-inch", 1, tSq + 1.6);
  const t4 = at.word("4", 1, t64 + 1.0);
  return (
    <>
      <Headline>Area grows with the square</Headline>
      <Punch at={tSq}>
        <At x={260} y={640}><Appear at={t64 - 0.2} from="pop"><Icon name="Tv" size={180} color={C.ink} /></Appear></At>
        <At x={260} y={800}><Appear at={t64} from="up"><Text size={48} font={F.med}>32-inch</Text></Appear></At>
        <At x={700} y={600}><Appear at={t64} from="pop" sfx={null}><Icon name="Tv" size={360} color={C.amber} glow stroke={1.6} /></Appear></At>
        <At x={700} y={830}><Appear at={t64 + 0.2} from="up"><Text size={48} font={F.med}>64-inch</Text></Appear></At>
        <At x={540} y={1040}><Appear at={t4 - 0.1} from="slam" sfx={null}><Text size={130} color={C.amber} glow>× 4 the screen</Text></Appear></At>
      </Punch>
      <Sfx name="boom" at={t4 - 0.1} volume={0.6} />
      <Sfx name="reveal" at={0.05} volume={0.4} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const tSub = at.word("subscribe", 1, at.dur - 1.6);
  return (
    <>
      <At x={290} y={560}><Appear at={0.1} from="pop"><Pizza d={14} /></Appear></At>
      <At x={290} y={780}><Appear at={0.3} from="up"><Chip size={42}>14-inch</Chip></Appear></At>
      <At x={810} y={440}><Appear at={0.6} from="pop"><Pizza d={10} /></Appear></At>
      <At x={810} y={680}><Appear at={0.7} from="pop" sfx={null}><Pizza d={10} /></Appear></At>
      <At x={810} y={840}><Appear at={0.9} from="up"><Chip size={42}>2 × 10-inch</Chip></Appear></At>
      <At x={550} y={560}><Appear at={1.2} from="pop"><Text size={120} color={C.amber}>?</Text></Appear></At>
      <At x={540} y={1000}>
        <Appear at={1.4} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}><You size={100} /><Chip size={46}>which is more food?</Chip></div>
        </Appear>
      </At>
      <At x={540} y={1130}><Appear at={tSub} from="fade"><Text size={40} color={C.muted} font={F.med}>two a day</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="menu" to="width"><MenuBody /></Span>
    <Span from="area"><AreaBody /></Span>
    <Span from="square" to="eighth"><SquareBody /></Span>
    <Span from="crust" to="middle"><CrustBody /></Span>
    <Span from="rim"><RimBody /></Span>
    <Span from="result"><ResultBody /></Span>
    <Span from="reveal"><RevealBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
