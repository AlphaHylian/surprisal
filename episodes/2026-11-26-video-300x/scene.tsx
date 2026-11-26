// "How Netflix fits a 4 TB movie into 14 GB": inter-frame prediction (send what changed).
// claim hook -> not blurrier, never sends the same thing twice -> 8M px x 3 B x 24 fps x 2 h = 4 TB -> JPEG each
// frame: 400 GB -> re-hook: 30x too big -> frames are almost identical -> blocks + "copy from last frame, 3 px left"
// -> full picture every 2 s 130 KB vs 8 KB -> 4 TB -> 14 GB, 300x -> CTA subscribe
import React from "react";
import { Appear, Arrow, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// A movie frame drawn procedurally: sky, sun, hills, a tree, and a ball rolling right with frame index `k`.
const Frame: React.FC<{ w: number; k?: number; grid?: number; hiBlock?: [number, number] | null; diff?: boolean }> =
  ({ w, k = 0, grid = 0, hiBlock = null, diff = false }) => {
    const h = w * 9 / 16;
    const bx = w * (0.28 + k * 0.03), by = h * 0.66, br = w * 0.07;
    const cells = grid > 0 ? grid : 0;
    const cw = w / (cells || 1), chh = h / Math.round((cells || 1) * 9 / 16);
    const rows = Math.round(cells * 9 / 16);
    return (
      <div style={{ position: "relative", width: w, height: h, borderRadius: 14, overflow: "hidden", border: `4px solid ${C.muted}`, boxShadow: "0 20px 40px #0009" }}>
        <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, opacity: diff ? 0.18 : 1 }}>
          <defs><linearGradient id={`sky${w}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b6ea8" /><stop offset="1" stopColor="#9cc7e6" /></linearGradient></defs>
          <rect width={w} height={h} fill={`url(#sky${w})`} />
          <circle cx={w * 0.8} cy={h * 0.24} r={w * 0.07} fill="#ffd27a" />
          <ellipse cx={w * 0.25} cy={h * 1.05} rx={w * 0.55} ry={h * 0.42} fill="#3f8f5a" />
          <ellipse cx={w * 0.8} cy={h * 1.1} rx={w * 0.5} ry={h * 0.45} fill="#2f7a4a" />
          <rect x={w * 0.62} y={h * 0.42} width={w * 0.03} height={h * 0.25} fill="#6b4a2a" />
          <circle cx={w * 0.635} cy={h * 0.4} r={w * 0.07} fill="#2c6b3f" />
        </svg>
        <div style={{ position: "absolute", left: bx - br, top: by - br, width: 2 * br, height: 2 * br, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #ffe3b0, #e0702a)", boxShadow: diff ? `0 0 30px ${C.amber}` : "none" }} />
        {cells > 0 ? (
          <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
            {Array.from({ length: cells + 1 }).map((_, i) => <line key={`v${i}`} x1={i * cw} y1={0} x2={i * cw} y2={h} stroke="#0e1726" strokeOpacity={0.55} strokeWidth={2} />)}
            {Array.from({ length: rows + 1 }).map((_, i) => <line key={`h${i}`} x1={0} y1={i * chh} x2={w} y2={i * chh} stroke="#0e1726" strokeOpacity={0.55} strokeWidth={2} />)}
            {hiBlock ? <rect x={hiBlock[0] * cw} y={hiBlock[1] * chh} width={cw} height={chh} fill="none" stroke={C.amber} strokeWidth={6} /> : null}
          </svg>
        ) : null}
      </div>
    );
  };

// ---------------------------------------------------------------- hook: film strip + 4 TB -> 14 GB
const Strip: React.FC<{ y: number; n?: number; speed?: number }> = ({ y, n = 5, speed = 120 }) => {
  const t = useT();
  const fw = 300, gap = 24;
  const off = -((t * speed) % (fw + gap));
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: fw * 9 / 16 + 40, background: "#0a0f18", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: off, top: 20, display: "flex", gap }}>
        {Array.from({ length: n + 1 }).map((_, i) => <Frame key={i} w={fw} k={i + Math.floor(t * speed / (fw + gap))} />)}
      </div>
    </div>
  );
};
const HookBody: React.FC = () => {
  const w = useW();
  const t14 = w(["14"], 1, 1.6);
  return (
    <>
      <Riser to={t14} volume={0.45} />
      <HookText y={280} size={96}>{"4 TB movie.\n**14 GB** sent."}</HookText>
      <Strip y={520} />
      <At x={540} y={940}><div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <Text size={110} color={C.coral}>4 TB</Text><Icon name="ArrowRight" size={100} color={C.muted} />
        <Text size={110} color={C.amber}>14 GB</Text></div></At>
      <Sfx name="pack/whoosh-punchy" at={t14 - 0.1} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tBlur = w(["blurrier"], 1, 0.8), tSame = w(["same"], 1, 2.8);
  return (
    <>
      <Headline>Not a blurrier copy</Headline>
      <At x={540} y={560}><div style={{ filter: "blur(10px)" }}><Frame w={560} k={0} /></div></At>
      <At x={540} y={560}><Appear at={tBlur} from="slam"><Icon name="X" size={260} color={C.coral} stroke={3} /></Appear></At>
      <At x={540} y={940}><Appear at={tSame - 0.3} from="up"><Chip color={C.amber} size={56}>never the same thing twice</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- context: 4 TB raw
const ContextBody: React.FC = () => {
  const w = useW();
  const t8 = w(["8"], 1, 1.0), t3 = w(["3"], 1, 2.4), t24 = w(["24"], 1, 3.6), t2 = w(["2"], 1, 5.4), t4 = w(["4"], 1, 6.6);
  const row = (at: number, a: string, b: string, y: number, col: string = C.ink) => (
    <At x={540} y={y}><Appear at={at - 0.2} from="left"><div style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
      <Text size={78} color={col}>{a}</Text><Text size={46} color={C.muted} font={F.med}>{b}</Text></div></Appear></At>
  );
  return (
    <>
      <Headline>Every pixel, every frame</Headline>
      <>
        {row(t8, "8,294,400", "pixels", 440)}
        {row(t3, "× 3", "bytes each", 570)}
        {row(t24, "× 24", "frames a second", 700)}
        {row(t2, "× 7,200", "seconds (2 h)", 830)}
        <At x={540} y={1020}><Appear at={t4 - 0.2} from="slam"><Text size={130} color={C.coral}>= 4.3 TB</Text></Appear></At>
      </>
    </>
  );
};

// ---------------------------------------------------------------- step 1: JPEG each frame
const JpegBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tSq = w(["squeeze"], 1, 0.4), t10 = w(["10"], 1, 2.4), t400 = w(["400"], 1, 4.0);
  const s = tween(t, tSq, t10, 1, 0.6);
  return (
    <>
      <Headline>Step 1: JPEG every frame</Headline>
      <At x={540} y={600} scale={s}><Frame w={640} k={1} /></At>
      <At x={540} y={880}><Appear at={t10 - 0.2} from="pop"><Chip color={C.mint} size={60}>÷ 10</Chip></Appear></At>
      <At x={540} y={1040}><div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        <Counter from={4300} to={430} t0={t10} t1={t400} size={100} color={C.amber} /><Text size={56} color={C.amber}>GB</Text></div></At>
    </>
  );
};

// ---------------------------------------------------------------- re-hook: still 30x too big
const RehookBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t30 = w(["30"], 1, 0.6), tBetween = w(["between"], 1, 2.6);
  const k = tween(t, 0.1, t30 + 0.4, 0, 1);
  return (
    <>
      <Headline color={C.amber}>Still 30× too big</Headline>
      <div style={{ position: "absolute", left: 120, top: 480 }}>
        <div style={{ fontFamily: F.med, fontSize: 44, color: C.muted }}>400 GB</div>
        <div style={{ width: 840 * k, height: 90, background: C.coral, borderRadius: 14 }} />
        <div style={{ fontFamily: F.med, fontSize: 44, color: C.muted, marginTop: 30 }}>14 GB</div>
        <div style={{ width: 28 * k, height: 90, background: C.amber, borderRadius: 8 }} />
      </div>
      <At x={540} y={1000}><Appear at={tBetween - 0.3} from="slam"><Text size={70}>the trick: <span style={{ color: C.amber }}>between</span> frames</Text></Appear></At>
      <Sfx name="pack/suspense-sting" at={0.2} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- frames are almost identical
const SameBody: React.FC = () => {
  const w = useW();
  const tIdent = w(["identical."], 1, 1.6), tSend = w(["Send"], 1, 4.0);
  return (
    <>
      <Headline>Frame 1 vs frame 2</Headline>
      <At x={290} y={560}><Frame w={440} k={0} /></At>
      <At x={790} y={560}><Frame w={440} k={1} /></At>
      <At x={290} y={720}><Text size={44} color={C.muted}>frame 1</Text></At>
      <At x={790} y={720}><Text size={44} color={C.muted}>frame 2</Text></At>
      <At x={540} y={940}><Appear at={tSend - 0.3} from="up"><Frame w={520} k={1} diff /></Appear></At>
      <At x={540} y={1110}><Appear at={tSend} from="pop"><Chip color={C.amber} size={48}>only this changed</Chip></Appear></At>
      <Sfx name="pack/click-soft" at={tIdent} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- blocks + motion instruction
const BlocksBody: React.FC = () => {
  const w = useW();
  const tBlocks = w(["blocks."], 1, 1.2), tCopy = w(["copy"], 1, 4.2), t3 = w(["3"], 1, 6.0), tTiny = w(["tiny"], 1, 8.0);
  return (
    <>
      <Headline>One line per block</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tCopy, { zoom: 1 }], [tCopy + 0.8, { zoom: 1.15, x: 470, y: 640 }], [tTiny, { zoom: 1.15, x: 470, y: 640 }], [tTiny + 0.6, { zoom: 1 }]]}>
        <At x={540} y={600}><Appear at={0.05} from="fade"><Frame w={880} k={1} grid={tBlocks > 0 ? 16 : 0} hiBlock={[4, 5]} /></Appear></At>
        <Arrow x1={182} y1={640} x2={330} y2={650} bend={70} t0={t3 - 0.4} t1={t3 + 0.2} color={C.amber} />
      </Camera>
      <At x={540} y={1040}><Appear at={tCopy - 0.2} from="up"><div style={{ whiteSpace: "nowrap", fontFamily: F.mono, fontSize: 44, color: C.ink, background: "#0a0f18ee", padding: "16px 26px", borderRadius: 14, border: `3px solid ${C.amber}` }}>
        copy from last frame, <span style={{ color: C.amber }}>← 3 px</span></div></Appear></At>
      <At x={540} y={1135}><Appear at={tTiny - 0.2} from="up"><Text size={50} color={C.mint}>+ the tiny difference</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- measured: 130 KB vs 8 KB
const MeasureBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t130 = w(["130"], 1, 2.6), t8 = w(["8."], 1, 5.0), t16 = w(["Sixteen"], 1, 6.0);
  const N = 30;
  return (
    <>
      <Headline>Measured on a real film</Headline>
      <div style={{ position: "absolute", left: 60, top: 420, width: 960, height: 420, display: "flex", alignItems: "flex-end", gap: 6 }}>
        {Array.from({ length: N }).map((_, i) => {
          const isI = i % 24 === 0;
          const show = isI ? t > t130 - 1.2 : t > t8 - 1.2 + i * 0.03;
          const h = isI ? 400 : 26;
          return <div key={i} style={{ width: 26, height: show ? h : 0, background: isI ? C.coral : C.mint, borderRadius: 6 }} />;
        })}
      </div>
      <At x={250} y={900}><Appear at={t130 - 0.3} from="pop"><Text size={64} color={C.coral}>full: 130 KB</Text></Appear></At>
      <At x={720} y={900}><Appear at={t8 - 0.3} from="pop"><Text size={64} color={C.mint}>in between: 8 KB</Text></Appear></At>
      <At x={540} y={1070}><Appear at={t16 - 0.2} from="slam"><Chip color={C.amber} size={64}>16× less</Chip></Appear></At>
      <At x={540} y={350}><Text size={40} color={C.muted}>Big Buck Bunny (CC BY), 1 minute, x264</Text></At>
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const t14 = w(["14"], 1, 2.0), t300 = w(["300"], 1, 3.4);
  return (
    <>
      <Strip y={420} speed={160} />
      <At x={540} y={860}><div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <Text size={110} color={C.coral}>4 TB</Text><Icon name="ArrowRight" size={100} color={C.muted} />
        <Appear at={t14 - 0.2} from="pop"><Text size={110} color={C.amber}>14 GB</Text></Appear></div></At>
      <At x={540} y={1060}><Appear at={t300 - 0.2} from="slam"><Chip color={C.amber} size={72}>300× smaller</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tBlur = w(["blurrier"], 1, 2.0);
  return (
    <>
      <At x={540} y={620}><Appear at={0.05} from="pop"><Icon name="Clapperboard" size={220} color={C.amber} /></Appear></At>
      <At x={540} y={900}><Appear at={tBlur - 0.3} from="up"><div style={{ filter: "blur(4px)" }}><Text size={80}>just blurrier?</Text></div></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="jpeg"><JpegBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="same"><SameBody /></Span>
    <Span from="blocks"><BlocksBody /></Span>
    <Span from="measure"><MeasureBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
