// "How to check a billion usernames in 1.2 GB": a Bloom filter.
// versus hook (16 GB list vs 1.2 GB of switches) -> not compression: a row of switches -> is the name free?
// -> 9.6 billion switches -> 7 hashes flip 7 switches per name -> test: one off = free, guaranteed
// -> re-hook: all on isn't proof -> 1 false alarm in 100 -> 99 in 100 never touch the list, Chrome -> CTA subscribe
import React from "react";
import { Appear, At, C, Camera, Chip, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};
const Big: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = C.ink, size = 96 }) => (
  <div style={{ fontFamily: F.bold, fontSize: size, color, whiteSpace: "nowrap", textShadow: "0 6px 24px #000b" }}>{children}</div>
);

// ---------------------------------------------------------------- the demo filter (positions from verify.py)
const M = 40, COLS = 8;
const NAMES: [string, number[]][] = [
  ["alex", [11, 5, 21, 31, 15, 38, 13]],
  ["mia", [26, 20, 37, 31, 19, 33, 34]],
  ["noah", [0, 13, 24, 35, 21, 35, 4]],
];
const KAI = [5, 34, 4, 5, 14, 31, 15];
const SAM = [34, 15, 33, 38, 13, 5, 19];
const GX = (i: number) => 540 + ((i % COLS) - 3.5) * 104;
const GY = (i: number, y0 = 590) => y0 + Math.floor(i / COLS) * 108;
const ALL_ON = new Set(NAMES.flatMap(([, p]) => p));

const Switch: React.FC<{ on: number; ring?: string; size?: number }> = ({ on, ring, size = 84 }) => (
  <div style={{ width: size, height: size, borderRadius: 18, background: on > 0.5 ? C.amber : C.panel, border: `4px solid ${ring ?? (on > 0.5 ? C.amber : C.dim)}`,
    boxShadow: on > 0.5 ? `0 0 26px ${C.amber}99` : ring ? `0 0 26px ${ring}aa` : "0 6px 14px #0008", transition: "none" }}>
    <div style={{ width: size * 0.3, height: size * 0.3, borderRadius: size, margin: `${size * 0.35 - 4}px auto`, background: on > 0.5 ? C.bg : C.dim }} />
  </div>
);
// grid; onAt[i] = time switch i turns on (-1 = already on, Infinity = off); ring = outline per switch
const Grid: React.FC<{ onAt: (i: number) => number; ring?: (i: number) => string | undefined; y0?: number; show?: number }> = ({ onAt, ring, y0 = 590, show = -1 }) => {
  const t = useT();
  return (
    <>
      {Array.from({ length: M }, (_, i) => {
        const a = tween(t, show + (i % COLS) * 0.02, show + 0.3 + (i % COLS) * 0.02, 0, 1);
        return (
          <At key={i} x={GX(i)} y={GY(i, y0)} scale={0.6 + 0.4 * a} style={{ opacity: a }}>
            <Switch on={t >= onAt(i) ? 1 : 0} ring={ring?.(i)} />
          </At>
        );
      })}
    </>
  );
};
const NameChip: React.FC<{ name: string; color?: string; size?: number }> = ({ name, color = C.ink, size = 64 }) => (
  <div style={{ padding: "12px 34px", borderRadius: 24, background: C.panel, border: `4px solid ${color}`, fontFamily: F.mono, fontSize: size, color }}>{name}</div>
);
// lines from a name chip to its switches
const Hashes: React.FC<{ from: [number, number]; to: number[]; t0: number; color?: string; y0?: number; out?: number }> = ({ from, to, t0, color = C.amber, y0 = 590, out }) => {
  const t = useT();
  const o = out !== undefined ? tween(t, out, out + 0.3, 1, 0) : 1;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: o }}>
      {to.map((p, i) => {
        const q = tween(t, t0 + i * 0.06, t0 + i * 0.06 + 0.35, 0, 1);
        const x2 = GX(p), y2 = GY(p, y0) - 44;
        return q > 0 ? <line key={i} x1={from[0]} y1={from[1]} x2={from[0] + (x2 - from[0]) * q} y2={from[1] + (y2 - from[1]) * q} stroke={color} strokeWidth={5} opacity={0.8} strokeLinecap="round" /> : null;
      })}
    </svg>
  );
};

// ---------------------------------------------------------------- hook: tall list vs short row of switches
const LIST = ["alex_88", "mia.k", "noah2001", "kai", "sam197", "zoe_r", "liam.w", "emma99", "leo_x", "ivy.m", "maxpower", "eli_42", "nora.b", "finn77"];
const HookBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t16 = w(["16"], 1, 1.2), t12 = w(["1.2"], 1, 2.4);
  const scroll = (t * 220) % (LIST.length * 58);
  return (
    <>
      <HookText y={260} size={86}>{"1 billion names:\n16 GB vs **1.2 GB**"}</HookText>
      <Riser to={t12} volume={0.45} />
      {/* left: the list */}
      <div style={{ position: "absolute", left: 90, top: 470, width: 400, height: 600, overflow: "hidden", borderRadius: 26, background: C.panel, border: `4px solid ${C.coral}` }}>
        {[...LIST, ...LIST, ...LIST].map((n, i) => (
          <div key={i} style={{ position: "absolute", left: 30, top: 16 + i * 58 - scroll, fontFamily: F.mono, fontSize: 40, color: C.ink, opacity: 0.85 }}>{n}</div>
        ))}
      </div>
      <At x={290} y={1130}><Appear at={0} from="pop" sfx={null}><Text size={60} color={C.coral}>16 GB</Text></Appear></At>
      {/* right: a short row of switches */}
      {Array.from({ length: 12 }, (_, i) => (
        <At key={i} x={650 + (i % 3) * 112} y={620 + Math.floor(i / 3) * 112}>
          <Switch on={[0, 4, 5, 7, 10].includes(i) ? 1 : 0} />
        </At>
      ))}
      <At x={762} y={1130}><Appear at={0} from="pop" sfx={null}><Text size={60} color={C.amber}>1.2 GB</Text></Appear></At>
      <Sfx name="pack/typing" at={0.1} volume={0.15} dur={1.2} />
      <Sfx name="pack/switch" at={t12} volume={0.4} />
      <Sfx name="pack/hit-low" at={t16} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tComp = w(["compression"], 1, 0.8), tName = w(["name"], 1, 2.2), tRow = w(["row"], 1, 3.6);
  const strike = tween(t, tComp, tComp + 0.4, 0, 1);
  return (
    <>
      <Headline>No names stored</Headline>
      <At x={540} y={450}><Appear at={0.05} out={tName + 0.6} from="up"><div style={{ position: "relative" }}>
        <Text size={64} color={C.muted}>compression</Text>
        <div style={{ position: "absolute", left: -10, top: "50%", height: 8, width: `${strike * 105}%`, background: C.coral, borderRadius: 4 }} />
      </div></Appear></At>
      <At x={540} y={450}><Appear at={tName - 0.3} out={tRow - 0.3} from="pop"><NameChip name="0 names" color={C.coral} /></Appear></At>
      <Grid onAt={() => Infinity} show={tRow - 0.4} />
      <Sfx name="pack/click-mech" at={tRow} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- context: sign-up form
const ContextBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tSigns = w(["signs"], 1, 0.4), tFree = w(["free"], 1, 3.4);
  const typed = "kai".slice(0, Math.max(0, Math.floor((t - tSigns) * 6)));
  return (
    <>
      <Headline>Is the name free?</Headline>
      <At x={540} y={640}><Appear at={0.05} from="up">
        <div style={{ width: 820, padding: 40, borderRadius: 34, background: C.panel, border: `4px solid ${C.dim}` }}>
          <div style={{ fontFamily: F.med, fontSize: 44, color: C.muted, marginBottom: 20 }}>Choose a username</div>
          <div style={{ height: 110, borderRadius: 20, border: `4px solid ${C.mint}`, display: "flex", alignItems: "center", padding: "0 30px", fontFamily: F.mono, fontSize: 64, color: C.ink }}>
            {typed}<span style={{ opacity: Math.floor(t * 3) % 2 ? 1 : 0, color: C.mint }}>|</span>
          </div>
        </div>
      </Appear></At>
      <At x={540} y={960}><Appear at={tFree - 0.4} from="pop"><Chip color={C.amber} size={60}>taken or free?</Chip></Appear></At>
      <Sfx name="pack/typing" at={tSigns} volume={0.25} dur={0.6} />
    </>
  );
};

// ---------------------------------------------------------------- step 1: the row of switches
const RowBody: React.FC = () => {
  const w = useW();
  const t96 = w(["9.6"], 1, 1.4), t12 = w(["1.2"], 1, 4.0);
  return (
    <>
      <Headline>Step 1: switches, all off</Headline>
      <Grid onAt={() => Infinity} />
      <At x={540} y={430}><Appear at={t96 - 0.3} from="up"><Big size={80}>9,600,000,000</Big></Appear></At>
      <Punch at={t12}><At x={540} y={1130}><Appear at={t12 - 0.3} from="slam"><Chip color={C.amber} size={60}>= 1.2 GB</Chip></Appear></At></Punch>
    </>
  );
};

// ---------------------------------------------------------------- step 2: add names
const AddBody: React.FC = () => {
  const w = useW();
  const tHash = w(["hashes"], 1, 1.8), tFlip = w(["Flip"], 1, 4.8);
  const t0 = [tHash - 0.2, tFlip + 0.2, tFlip + 1.0];
  const onAt = (i: number) => {
    let best = Infinity;
    NAMES.forEach(([, p], k) => { if (p.includes(i)) best = Math.min(best, t0[k] + 0.45); });
    return best;
  };
  return (
    <>
      <Headline>Step 2: 7 hashes, 7 switches</Headline>
      {NAMES.map(([n], k) => (
        <At key={n} x={540} y={430}><Appear at={Math.max(0.05, t0[k] - 0.5)} out={k < 2 ? t0[k + 1] - 0.5 : undefined} from="pop"><NameChip name={n} color={C.amber} /></Appear></At>
      ))}
      {NAMES.map(([n, p], k) => <Hashes key={n} from={[540, 480]} to={p} t0={t0[k]} out={k < 2 ? t0[k + 1] - 0.5 : undefined} />)}
      <Grid onAt={onAt} />
      {t0.map((tt, k) => <Sfx key={k} name="pack/switch" at={tt + 0.45} volume={0.3} />)}
    </>
  );
};

// ---------------------------------------------------------------- step 3: test a name -> one off = free
const done = (i: number) => (ALL_ON.has(i) ? -1 : Infinity);
const TestBody: React.FC = () => {
  const w = useW();
  const tSame = w(["same"], 1, 2.4), tOff = w(["off"], 1, 4.4), tFree = w(["Free"], 1, 6.4);
  return (
    <>
      <Headline>Step 3: check its switches</Headline>
      <At x={540} y={430}><Appear at={0.05} from="pop"><NameChip name="kai" color={C.mint} /></Appear></At>
      <Hashes from={[540, 480]} to={KAI} t0={tSame - 0.2} color={C.mint} />
      <Grid onAt={done} ring={(i) => (KAI.includes(i) ? (i === 14 ? C.coral : C.mint) : undefined)} />
      <At x={GX(14)} y={GY(14) + 0}><Appear at={tOff - 0.2} from="pop" sfx={null}>
        <div style={{ width: 120, height: 120, borderRadius: 60, border: `8px solid ${C.coral}`, boxShadow: `0 0 30px ${C.coral}aa` }} /></Appear></At>
      <Sfx name="pack/wrong" at={tOff} volume={0.25} />
      <Punch at={tFree}><At x={540} y={1130}><Appear at={tFree - 0.3} from="slam"><Chip color={C.mint} size={62}>FREE, guaranteed</Chip></Appear></At></Punch>
      <Sfx name="pack/correct" at={tFree} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook: all on is not proof
const RehookBody: React.FC = () => {
  const w = useW();
  const tAll = w(["all"], 1, 0.4), tOther = w(["Other"], 1, 2.6);
  return (
    <>
      <Headline color={C.amber}>All 7 on? Not proof.</Headline>
      <At x={540} y={430}><Appear at={0.05} from="pop"><NameChip name="sam197" color={C.amber} /></Appear></At>
      <Hashes from={[540, 480]} to={SAM} t0={tAll} />
      <Grid onAt={done} ring={(i) => (SAM.includes(i) ? C.ink : undefined)} />
      <At x={540} y={1130}><Appear at={tOther - 0.2} from="up"><Text size={50} color={C.muted}>never added: alex, mia, noah lit them</Text></Appear></At>
      <Sfx name="pack/hmm" at={tOther} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- the false-alarm rate
const RateBody: React.FC = () => {
  const w = useW();
  const t100 = w(["100"], 1, 3.6), tReal = w(["real"], 1, 6.0);
  return (
    <>
      <Headline>False alarms</Headline>
      <At x={540} y={460}><Appear at={0.1} from="up"><Text size={58}>7 hashes · 9.6 switches per name</Text></Appear></At>
      <Punch at={t100}><At x={540} y={680}><Appear at={t100 - 0.3} from="slam"><Big size={150} color={C.amber}>1 in 100</Big></Appear></At></Punch>
      <At x={540} y={940}><Appear at={tReal - 0.5} from="up"><div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        <Icon name="Database" size={130} color={C.muted} /><Text size={56} color={C.muted}>only these check the list</Text></div></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const t99 = w(["99"], 1, 0.4), tChrome = w(["Chrome"], 1, 3.0);
  return (
    <>
      <Camera keys={[[0, { zoom: 1 }], [tChrome + 1.5, { zoom: 1.06 }]]}>
        <Punch at={t99}><At x={540} y={480}><Appear at={Math.max(0.05, t99 - 0.3)} from="slam"><Big size={140} color={C.amber}>99 / 100</Big></Appear></At></Punch>
        <At x={540} y={640}><Appear at={t99 + 0.4} from="fade" sfx={null}><Text size={56}>free names skip the big list</Text></Appear></At>
        <At x={540} y={870}><Appear at={tChrome - 0.3} from="up"><div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <Icon name="Globe" size={120} color={C.mint} /><Text size={56} color={C.mint}>Chrome: malware links</Text></div></Appear></At>
        <At x={540} y={1040}><Appear at={tChrome + 0.5} from="fade" sfx={null}><Text size={44} color={C.muted}>Burton Bloom, 1970</Text></Appear></At>
      </Camera>
      <Sfx name="pack/hit-grand" at={t99} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- CTA: back to the hook picture
const CtaBody: React.FC = () => (
  <>
    <Grid onAt={done} y0={560} />
    <At x={540} y={1130}><Appear at={0.2} from="fade" sfx={null}><Text size={48} color={C.muted}>no list. just switches.</Text></Appear></At>
  </>
);

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="row"><RowBody /></Span>
    <Span from="add"><AddBody /></Span>
    <Span from="test"><TestBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="rate"><RateBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
