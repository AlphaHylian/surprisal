// "Why 6 and 8 pay 5 times more than 2 and 12": counting two-dice combinations.
// versus hook (6+8 vs 2+12) -> feels even, it isn't -> 36 combinations grid -> 2 and 12: one way each
// -> 8: five ways, 6 too -> 10 vs 2 per 36 rolls -> re-hook: most common roll isn't on the board
// -> 7: six ways, pays nobody -> dots = ways -> corner 6-8-5: 14 vs 2-12-3: 4 -> CTA corner 4-9-10 (10)
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};
const WAYS = (n: number) => 6 - Math.abs(7 - n);

// ---------------------------------------------------------------- a number token with its dots
const Token: React.FC<{ n: number; size?: number; ring?: string; dots?: boolean }> = ({ n, size = 170, ring = C.ink, dots = true }) => {
  const hot = n === 6 || n === 8;
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: "#EFE4C8", border: `${Math.round(size / 22)}px solid ${ring}`,
      boxShadow: "0 10px 28px #000a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: F.bold, fontSize: size * 0.5, lineHeight: 1, color: hot ? "#C2410C" : "#1E293B" }}>{n}</div>
      {dots && <div style={{ display: "flex", gap: size * 0.035, marginTop: size * 0.04 }}>
        {Array.from({ length: WAYS(n) }, (_, i) => <div key={i} style={{ width: size * 0.065, height: size * 0.065, borderRadius: size, background: hot ? "#C2410C" : "#1E293B" }} />)}
      </div>}
    </div>
  );
};

// ---------------------------------------------------------------- the 6 x 6 grid of two-dice totals
const CS = 118, CG = 12, GX = 540 - (6 * CS + 5 * CG) / 2 + CS / 2 + 30, GY = 470;
const cx = (b: number) => GX + (b - 1) * (CS + CG);
const cy = (a: number) => GY + (a - 1) * (CS + CG);
type Hi = { a: number; b: number; color: string; at: number; out?: number };
const Grid: React.FC<{ show?: number; hi?: Hi[]; fade?: (s: number) => boolean }> = ({ show = -1, hi = [], fade }) => {
  const t = useT();
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((k) => (
        <React.Fragment key={k}>
          <At x={cx(k)} y={GY - CS * 0.85}><Text size={44} color={C.muted} font={F.mono}>{k}</Text></At>
          <At x={GX - CS * 0.85} y={cy(k)}><Text size={44} color={C.muted} font={F.mono}>{k}</Text></At>
        </React.Fragment>
      ))}
      {[1, 2, 3, 4, 5, 6].flatMap((a) => [1, 2, 3, 4, 5, 6].map((b) => {
        const s = a + b;
        const h = hi.find((x) => x.a === a && x.b === b && t >= x.at && (x.out === undefined || t < x.out));
        const k = (a - 1) * 6 + (b - 1);
        const o = show < 0 ? 1 : tween(t, show + k * 0.025, show + k * 0.025 + 0.2, 0, 1);
        const dim = fade && fade(s) && !h ? 0.3 : 1;
        return (
          <At key={`${a}-${b}`} x={cx(b)} y={cy(a)}>
            <div style={{ width: CS, height: CS, borderRadius: 18, background: h ? h.color : C.panel, border: `3px solid ${h ? h.color : C.dim}`,
              opacity: o * dim, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: F.bold, fontSize: 56, color: h ? C.bg : C.ink, boxShadow: h ? `0 0 26px ${h.color}88` : "none",
              transform: `scale(${h ? 1 + 0.12 * Math.exp(-(t - h.at) * 8) : 1})` }}>{s}</div>
          </At>
        );
      }))}
    </>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const tFive = w(["five"], 1, 2.2);
  return (
    <>
      <HookText y={260} size={88}>{"**6 + 8** vs 2 + 12:\n**5×** the cards"}</HookText>
      <Riser to={tFive} volume={0.45} />
      <Camera keys={[[0, { zoom: 1 }], [tFive + 0.8, { zoom: 1.05 }]]}>
        <At x={180} y={680}><Appear at={0} from="pop"><Token n={6} /></Appear></At>
        <At x={370} y={680}><Appear at={0} from="pop" sfx={null}><Token n={8} /></Appear></At>
        <At x={540} y={680}><Text size={64} color={C.muted}>vs</Text></At>
        <At x={710} y={680}><Appear at={0} from="pop" sfx={null}><Token n={2} /></Appear></At>
        <At x={900} y={680}><Appear at={0} from="pop" sfx={null}><Token n={12} /></Appear></At>
        <At x={275} y={900}><Appear at={tFive - 0.2} from="up"><Counter from={0} to={10} t0={tFive - 0.2} t1={tFive + 0.4} size={120} color={C.amber} /></Appear></At>
        <At x={805} y={900}><Appear at={tFive - 0.2} from="up" sfx={null}><Counter from={0} to={2} t0={tFive - 0.2} t1={tFive + 0.4} size={120} color={C.coral} /></Appear></At>
        <At x={540} y={1060}><Appear at={tFive} from="fade" sfx={null}><Text size={46} color={C.muted}>cards every 36 rolls</Text></Appear></At>
      </Camera>
      <Sfx name="pack/kaching" at={tFive + 0.3} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rule out: equal bars become a pyramid
const RuleoutBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tEven = w(["even"], 1, 2.0), tIsnt = w(["isn't", "isnt"], 1, 2.8);
  const nums = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  return (
    <>
      <Headline>Feels even?</Headline>
      {nums.map((n, i) => {
        const hEven = 3.5 * 90, hTrue = WAYS(n) * 90;
        const h = tween(t, tIsnt - 0.1, tIsnt + 0.5, hEven, hTrue);
        const x = 540 + (i - 5) * 86;
        return (
          <React.Fragment key={n}>
            <div style={{ position: "absolute", left: x - 34, top: 1040 - h, width: 68, height: Math.max(0, tween(t, 0.05 + i * 0.04, 0.35 + i * 0.04, 0, 1)) * h,
              background: n === 7 ? C.coral : n === 6 || n === 8 ? C.amber : C.mint, borderRadius: 10, opacity: 0.9 }} />
            <At x={x} y={1090}><Text size={42} font={F.mono} color={C.ink}>{n}</Text></At>
          </React.Fragment>
        );
      })}
      <At x={540} y={420}><Appear at={tIsnt - 0.2} from="slam"><Chip color={C.coral} size={58}>It isn't.</Chip></Appear></At>
      <Sfx name="pack/whoosh-soft" at={tEven} volume={0.2} />
      <Sfx name="pack/riser-ascend" at={tIsnt - 0.1} volume={0.25} dur={0.8} />
    </>
  );
};

// ---------------------------------------------------------------- context: 36 combinations
const ContextBody: React.FC = () => {
  const w = useW();
  const t36 = w(["36"], 1, 1.0), tCount = w(["Count"], 1, 2.4);
  return (
    <>
      <Headline>36 combinations</Headline>
      <Camera keys={[[0, { zoom: 0.96 }], [tCount + 1, { zoom: 1 }]]}>
        <Grid show={Math.max(0.05, t36 - 0.6)} />
      </Camera>
      <Sfx name="pack/counting-digital" at={Math.max(0.05, t36 - 0.6)} volume={0.2} dur={1.0} />
    </>
  );
};

// ---------------------------------------------------------------- 2 and 12: one way each
const RareBody: React.FC = () => {
  const w = useW();
  const t12 = w(["12"], 1, 0.3), t2 = w(["2"], 1, 2.2);
  return (
    <>
      <Headline>2 and 12: one way each</Headline>
      <Grid hi={[{ a: 6, b: 6, color: C.coral, at: t12 }, { a: 1, b: 1, color: C.coral, at: t2 }]} />
    </>
  );
};

// ---------------------------------------------------------------- 8: five ways, 6 too
const CommonBody: React.FC = () => {
  const w = useW();
  const tEight = w(["8"], 1, 0.2), tSame = w(["Same"], 1, 6.0);
  const eights: [number, number][] = [[2, 6], [3, 5], [4, 4], [5, 3], [6, 2]];
  const sixes: [number, number][] = [[1, 5], [2, 4], [3, 3], [4, 2], [5, 1]];
  const pairT = (k: number) => w(["two", "three", "four", "five", "six"].slice(k, k + 1), k === 0 ? 1 : k === 3 ? 2 : k === 1 ? 1 : k === 2 ? 1 : 2, tEight + 1.2 + k * 0.8);
  const hi: Hi[] = [
    ...eights.map(([a, b], k) => ({ a, b, color: C.amber, at: Math.min(pairT(k), tSame - 0.2) })),
    ...sixes.map(([a, b], k) => ({ a, b, color: C.mint, at: tSame + k * 0.1 })),
  ];
  return (
    <>
      <Headline>8: five ways</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tEight + 0.8, { zoom: 1.06, x: 600, y: 700 }], [tSame, { zoom: 1 }]]}>
        <Grid hi={hi} fade={(s) => s !== 8 && s !== 6} />
      </Camera>
      {eights.map((_, k) => <Sfx key={k} name="pack/click-soft" at={hi[k].at} volume={0.3} />)}
      <Sfx name="pack/whoosh-tiny" at={tSame} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 10 vs 2 per 36 rolls
const ResultBody: React.FC = () => {
  const w = useW();
  const t10 = w(["10"], 1, 2.0), tTwice = w(["twice"], 1, 3.6);
  return (
    <>
      <Headline>Every 36 rolls</Headline>
      <At x={300} y={560}><Appear at={0.05} from="pop"><div style={{ display: "flex", gap: 16 }}><Token n={6} size={150} /><Token n={8} size={150} /></div></Appear></At>
      <At x={780} y={560}><Appear at={tTwice - 1.2} from="pop"><div style={{ display: "flex", gap: 16 }}><Token n={2} size={150} /><Token n={12} size={150} /></div></Appear></At>
      <Punch at={t10}><At x={300} y={800}><Appear at={t10 - 0.3} from="slam"><Counter from={0} to={10} t0={t10 - 0.3} t1={t10 + 0.2} size={170} color={C.amber} /></Appear></At></Punch>
      <At x={780} y={800}><Appear at={tTwice - 0.3} from="slam"><Counter from={0} to={2} t0={tTwice - 0.3} t1={tTwice} size={170} color={C.coral} /></Appear></At>
      <At x={540} y={1040}><Appear at={tTwice + 0.3} from="pop"><Chip color={C.amber} size={70}>5× the cards</Chip></Appear></At>
      <Sfx name="pack/cash-register" at={t10} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook: the most common roll isn't on the board
const RehookBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tBoard = w(["board"], 1, 1.6);
  const nums = [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
  return (
    <>
      <Headline color={C.amber}>One number is missing</Headline>
      {nums.map((n, i) => (
        <At key={n} x={540 + ((i % 5) - 2) * 190} y={560 + Math.floor(i / 5) * 230}>
          <Appear at={0.05 + i * 0.05} from="pop" sfx={i === 0 ? undefined : null}><Token n={n} size={150} /></Appear>
        </At>
      ))}
      <At x={540} y={1040} scale={1 + 0.08 * Math.max(0, Math.sin((t - tBoard) * 7)) * (t > tBoard ? 1 : 0)}>
        <Appear at={tBoard - 0.3} from="slam"><div style={{ fontFamily: F.bold, fontSize: 130, color: C.coral }}>7 ?</div></Appear>
      </At>
      <Sfx name="pack/suspense-sting" at={tBoard} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 7: six ways, pays nobody
const SevenBody: React.FC = () => {
  const w = useW();
  const tSix = w(["six"], 1, 0.6), tRoll = w(["roll"], 1, 1.8), tNobody = w(["nobody"], 1, 3.2), tRobber = w(["robber"], 1, 4.2);
  const sevens: Hi[] = [1, 2, 3, 4, 5, 6].map((a, k) => ({ a, b: 7 - a, color: C.coral, at: tSix - 0.1 + k * 0.1 }));
  return (
    <>
      <Headline out={tRoll - 0.3}>7: six ways</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tNobody, { zoom: 1 }]]}>
        <Grid hi={sevens} fade={(s) => s !== 7} />
      </Camera>
      <At x={540} y={250}><Appear at={tRoll - 0.2} out={tNobody - 0.3} from="pop"><Chip color={C.coral} size={58}>1 roll in 6</Chip></Appear></At>
      <At x={540} y={250}><Appear at={tNobody - 0.2} from="slam"><div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Chip color={C.coral} size={54}>pays nobody</Chip><Appear at={tRobber - 0.3} from="right"><Icon name="VenetianMask" size={80} color={C.coral} /></Appear></div></Appear></At>
      <Sfx name="pack/drop-dark" at={tNobody} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- dots = ways
const DotsBody: React.FC = () => {
  const w = useW();
  const tDots = w(["dots"], 1, 0.4), tWays = w(["ways"], 1, 2.0), tAdd = w(["add"], 1, 3.2);
  return (
    <>
      <Headline>Dots = ways</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tDots + 0.3, { zoom: 1.55, x: 540, y: 640 }], [tAdd, { zoom: 1 }]]}>
        <At x={340} y={640}><Appear at={0.05} from="pop"><Token n={8} size={240} /></Appear></At>
        <At x={740} y={640}><Appear at={0.05} from="pop" sfx={null}><Token n={3} size={240} /></Appear></At>
        <At x={340} y={860}><Appear at={tWays - 0.2} from="up"><Text size={50} color={C.amber}>5 ways</Text></Appear></At>
        <At x={740} y={860}><Appear at={tWays} from="up"><Text size={50} color={C.mint}>2 ways</Text></Appear></At>
      </Camera>
      <At x={540} y={1060}><Appear at={tAdd - 0.2} from="pop"><Chip color={C.amber} size={60}>add the dots</Chip></Appear></At>
      <Sfx name="pack/idea" at={tWays} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- payoff: corner 6-8-5 = 14, corner 2-12-3 = 4
const Corner: React.FC<{ ns: number[]; x: number; y: number; at: number }> = ({ ns, x, y, at }) => (
  <>
    {ns.map((n, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
      return <At key={n} x={x + 120 * Math.cos(a)} y={y + 120 * Math.sin(a)}><Appear at={at + i * 0.1} from="pop" sfx={i === 0 ? undefined : null}><Token n={n} size={140} /></Appear></At>;
    })}
    <At x={x} y={y}><Appear at={at + 0.3} from="pop" sfx={null}><div style={{ width: 46, height: 46, borderRadius: 10, background: C.ink, border: `6px solid ${C.bg}`, transform: "rotate(45deg)" }} /></Appear></At>
  </>
);
const PayoffBody: React.FC = () => {
  const w = useW();
  const t14 = w(["14"], 1, 2.4), t2 = w(["2"], 1, 3.6), t4 = w(["4"], 1, 5.0);
  return (
    <>
      <Corner ns={[6, 8, 5]} x={290} y={560} at={0.05} />
      <Corner ns={[2, 12, 3]} x={790} y={560} at={t2 - 0.3} />
      <Punch at={t14}><At x={290} y={860}><Appear at={t14 - 0.4} from="slam"><Counter from={0} to={14} t0={t14 - 0.4} t1={t14} size={160} color={C.amber} /></Appear></At></Punch>
      <At x={790} y={860}><Appear at={t4 - 0.3} from="slam"><Counter from={0} to={4} t0={t4 - 0.3} t1={t4} size={160} color={C.coral} /></Appear></At>
      <At x={540} y={1060}><Appear at={t14 + 0.2} from="fade" sfx={null}><Text size={48} color={C.muted}>cards every 36 rolls</Text></Appear></At>
      <Sfx name="pack/kaching" at={t14} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- CTA: corner 4-9-10, how many dots?
const CtaBody: React.FC = () => {
  const w = useW();
  const tHow = w(["How"], 1, 1.6);
  return (
    <>
      <Headline>Your corner</Headline>
      <Corner ns={[4, 9, 10]} x={540} y={640} at={0.05} />
      <At x={540} y={1000}><Appear at={tHow - 0.2} from="slam"><div style={{ fontFamily: F.bold, fontSize: 110, color: C.amber }}>? dots</div></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="rare"><RareBody /></Span>
    <Span from="common"><CommonBody /></Span>
    <Span from="result"><ResultBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="seven"><SevenBody /></Span>
    <Span from="dots"><DotsBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
