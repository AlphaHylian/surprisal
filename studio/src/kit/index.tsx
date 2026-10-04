// Surprisal Remotion kit. Episode scenes import everything from "../kit".
//
//   import { Beat, At, Appear, Camera, Emoji, Chip, Sfx, ... } from "../kit";
//
// Time inside a <Beat> is in SECONDS from that beat's start (its voice clip starts at 0).
// Positions are canvas pixels (1080x1920), x/y = the element's CENTRE.
import React, { createContext, useContext } from "react";
import {
  AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile,
  useCurrentFrame, useVideoConfig,
} from "remotion";
import * as Lucide from "lucide-react";
import { C, CENTER, F, H, SAFE, W } from "./theme";

export { C, F, W, H, SAFE, CENTER };

// ------------------------------------------------------------------ plan & timing
export type Word = { text: string; start: number; end: number };
export type Chunk = { start: number; end: number; words: Word[] };
export type PlanBeat = { id: string; start: number; dur: number; say: string };
export type Plan = { fps: number; total: number; beats: PlanBeat[]; chunks: Chunk[]; format: string };

export const PlanContext = createContext<Plan | null>(null);
export const usePlan = () => useContext(PlanContext)!;

type SpanInfo = { start: number; dur: number; ids: string[] };
const SpanCtx = createContext<SpanInfo | null>(null);

/** A span of one or more consecutive beats: one continuous scene from the first beat's start to the
 *  last beat's end. Inside, time (useT) is seconds from the span's start. Fades in/out briefly at its
 *  edges (except at the very start of the video, so frame 1 is fully drawn). */
export const Span: React.FC<{ from: string; to?: string; children: React.ReactNode; fade?: number }> = ({ from, to, children, fade = 0.14 }) => {
  const plan = usePlan();
  const { fps } = useVideoConfig();
  const idx = (id: string) => {
    const i = plan.beats.findIndex((x) => x.id === id);
    if (i < 0) throw new Error(`Beat "${id}" is not in script.json (beats: ${plan.beats.map((x) => x.id).join(", ")})`);
    return i;
  };
  const i0 = idx(from), i1 = idx(to ?? from);
  const start = plan.beats[i0].start;
  const end = plan.beats[i1].start + plan.beats[i1].dur + (i1 === plan.beats.length - 1 ? plan.total - plan.beats[i1].start - plan.beats[i1].dur : 0);
  const info = { start, dur: end - start, ids: plan.beats.slice(i0, i1 + 1).map((b) => b.id) };
  return (
    <Sequence from={Math.round(start * fps)} durationInFrames={Math.max(1, Math.round((end - start) * fps))} name={info.ids.join("+")}>
      <SpanCtx.Provider value={info}><SpanFade fade={fade} first={start === 0}>{children}</SpanFade></SpanCtx.Provider>
    </Sequence>
  );
};
const SpanFade: React.FC<{ fade: number; first: boolean; children: React.ReactNode }> = ({ fade, first, children }) => {
  const t = useT();
  const { dur } = useContext(SpanCtx)!;
  const o = Math.min(first ? 1 : tween(t, 0, fade, 0, 1), tween(t, dur - fade, dur, 1, 0));
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
/** A single beat (same as <Span from={id}>). */
export const Beat: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => <Span from={id}>{children}</Span>;

/** Length of the current span in seconds. */
export const useSpanDur = () => useContext(SpanCtx)?.dur ?? 0;

/** Times inside the current span, in seconds from its start:
 *    const at = useAt();
 *    at.beat("note")            -> when the beat "note" starts
 *    at.word("delete")          -> when the narrator says "delete" (1st time in this span)
 *    at.word("to", 3)           -> the 3rd "to" in this span
 *  Words come from the caption alignment, so visuals land exactly on the spoken word. */
export const useAt = () => {
  const plan = usePlan();
  const sp = useContext(SpanCtx);
  if (!sp) throw new Error("useAt() was called outside a <Span>. Put the hooks in a child component: const X = () => <Span from=\"id\"><XBody /></Span>");
  const norm = (x: string) => x.toLowerCase().replace(/[^a-z0-9%]/g, "");
  return {
    beat: (id: string) => {
      const b = plan.beats.find((x) => x.id === id);
      return b ? b.start - sp.start : 0;
    },
    word: (w: string, nth = 1, fallback = 0) => {
      const want = norm(w);
      let n = 0;
      for (const ch of plan.chunks) for (const x of ch.words) {
        if (x.start < sp.start - 0.05 || x.start > sp.start + sp.dur) continue;
        if (norm(x.text) === want && ++n === nth) return Math.max(0, x.start - sp.start);
      }
      return fallback;
    },
    dur: sp.dur,
  };
};

/** Seconds since the current beat (or Sequence) started. */
export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

export const ease = Easing.bezier(0.22, 1, 0.36, 1); // fast out, soft landing
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** Interpolate a value between two times (seconds), clamped. */
export const tween = (t: number, t0: number, t1: number, a: number, b: number, e = ease) =>
  interpolate(t, [t0, t1], [a, b], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });

/** Spring from 0 to 1 starting at time `at` (seconds). */
export const useSpring = (at = 0, opts: { damping?: number; stiffness?: number; mass?: number } = {}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - Math.round(at * fps), fps, config: { damping: 14, stiffness: 170, mass: 0.7, ...opts } });
};

// ------------------------------------------------------------------ layout & motion
/** Absolutely position children with their centre at (x, y). */
export const At: React.FC<{ x?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties; rotate?: number; scale?: number }> =
  ({ x = CENTER.x, y = CENTER.y, children, style, rotate = 0, scale = 1 }) => (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`, ...style }}>
      {children}
    </div>
  );

type Dir = "up" | "down" | "left" | "right" | "pop" | "fade" | "slam" | "drop";
/** Enter at `at` seconds (and optionally leave at `out`), with a motion style. */
export const Appear: React.FC<{ at?: number; out?: number; from?: Dir; dist?: number; children: React.ReactNode; style?: React.CSSProperties }> =
  ({ at = 0, out, from = "up", dist = 60, children, style }) => {
    const t = useT();
    const s = useSpring(at, from === "slam" ? { damping: 11, stiffness: 260 } : {});
    if (t < at - 0.001) return null;
    let o = from === "slam" ? Math.min(1, s * 3) : Math.min(1, s * 1.6);
    let tf = "";
    if (from === "up") tf = `translateY(${(1 - s) * dist}px)`;
    if (from === "down") tf = `translateY(${-(1 - s) * dist}px)`;
    if (from === "left") tf = `translateX(${(1 - s) * dist}px)`;
    if (from === "right") tf = `translateX(${-(1 - s) * dist}px)`;
    if (from === "pop") tf = `scale(${0.4 + 0.6 * s})`;
    if (from === "slam") tf = `scale(${2.2 - 1.2 * s})`;
    if (from === "drop") tf = `translateY(${-(1 - s) * 400}px)`;
    if (out !== undefined) o *= tween(t, out, out + 0.25, 1, 0);
    if (out !== undefined && t > out + 0.3) return null;
    return <div style={{ opacity: o, transform: tf, ...style }}>{children}</div>;
  };

type Key = [number, { zoom?: number; x?: number; y?: number; rot?: number }];
/** Camera over its children: keyframes of [time, {zoom, x, y, rot}], where (x, y) is the canvas
 *  point that should sit at the centre of the visual zone. Eases between keys. */
export const Camera: React.FC<{ keys: Key[]; children: React.ReactNode }> = ({ keys, children }) => {
  const t = useT();
  const ks = [...keys].sort((a, b) => a[0] - b[0]);
  const val = (k: "zoom" | "x" | "y" | "rot", d: number) => {
    const pts = ks.map(([tt, v]) => [tt, v[k] ?? d] as [number, number]);
    if (pts.length === 1) return pts[0][1];
    return interpolate(t, pts.map((p) => p[0]), pts.map((p) => p[1]), { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeInOut });
  };
  const z = val("zoom", 1), x = val("x", CENTER.x), y = val("y", CENTER.y), r = val("rot", 0);
  return (
    <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${CENTER.x}px, ${CENTER.y}px) rotate(${r}deg) scale(${z}) translate(${-x}px, ${-y}px)` }}>
      {children}
    </AbsoluteFill>
  );
};

/** A quick zoom "punch" at time `at` (for impacts and reveals). */
export const Punch: React.FC<{ at: number; amount?: number; children: React.ReactNode }> = ({ at, amount = 0.08, children }) => {
  const t = useT();
  const k = t < at ? 0 : Math.exp(-(t - at) * 7) * Math.sin(Math.min(1, (t - at) * 9) * Math.PI / 2);
  return <AbsoluteFill style={{ transform: `scale(${1 + amount * k})`, transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}>{children}</AbsoluteFill>;
};

/** Screen shake at time `at`. */
export const Shake: React.FC<{ at: number; amp?: number; children: React.ReactNode }> = ({ at, amp = 16, children }) => {
  const t = useT();
  const d = t - at;
  const k = d < 0 || d > 0.45 ? 0 : amp * Math.exp(-d * 9);
  return <AbsoluteFill style={{ transform: `translate(${Math.sin(d * 90) * k}px, ${Math.cos(d * 70) * k * 0.7}px)` }}>{children}</AbsoluteFill>;
};

// ------------------------------------------------------------------ sound
export type SfxName = "whoosh" | "swoosh" | "riser" | "click" | "pop" | "thud" | "stamp" | "ding" | "tick" | "type" | "error" | "coin" | "reveal" | "boom";
/** A sound effect at `at` seconds (inside a beat). Files live in studio/public/sfx/. */
export const Sfx: React.FC<{ name: SfxName; at?: number; volume?: number }> = ({ name, at = 0, volume = 0.6 }) => {
  const { fps } = useVideoConfig();
  return (
    <Sequence from={Math.round(at * fps)} name={`sfx ${name}`}>
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  );
};

// ------------------------------------------------------------------ backdrop
export const Backdrop: React.FC<{ tint?: string }> = ({ tint = C.mint }) => {
  const f = useCurrentFrame();
  const gx = 50 + 18 * Math.sin(f / 90), gy = 30 + 10 * Math.cos(f / 110);
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(900px 900px at ${gx}% ${gy}%, ${tint}22, transparent 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(700px 700px at ${100 - gx}% ${80 - gy / 2}%, ${C.amber}14, transparent 70%)` }} />
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${C.dim}55 1px, transparent 1px), linear-gradient(90deg, ${C.dim}55 1px, transparent 1px)`,
        backgroundSize: "90px 90px", backgroundPosition: `0 ${(f * 0.6) % 90}px`, opacity: 0.55,
        maskImage: "radial-gradient(ellipse at 50% 40%, black 30%, transparent 80%)",
      }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, #000a 100%)" }} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ text & shapes
export const Text: React.FC<{ children: React.ReactNode; size?: number; color?: string; font?: string; style?: React.CSSProperties; glow?: boolean; width?: number }> =
  ({ children, size = 64, color = C.ink, font = F.bold, style, glow, width }) => (
    <div style={{ fontFamily: font, fontSize: size, color, lineHeight: 1.08, textAlign: "center", whiteSpace: width ? "normal" : "nowrap",
      width, textShadow: glow ? `0 0 30px ${color}88, 0 4px 18px #0008` : "0 4px 18px #0008", letterSpacing: font === F.mono ? 0 : -0.5, ...style }}>
      {children}
    </div>
  );

/** Headline in the top band. */
export const Headline: React.FC<{ children: React.ReactNode; color?: string; at?: number; out?: number }> = ({ children, color = C.ink, at = 0, out }) => (
  <At y={250}><Appear at={at} out={out} from="down" dist={30}><Text font={F.display} size={76} color={color} width={940}>{children}</Text></Appear></At>
);

export const Emoji: React.FC<{ char: string; size?: number; style?: React.CSSProperties }> = ({ char, size = 200, style }) => (
  <div style={{ fontFamily: F.emoji, fontSize: size, lineHeight: 1, filter: "drop-shadow(0 18px 30px #0009)", ...style }}>{char}</div>
);

/** Any Lucide icon by its React name ("Gavel", "FileArchive", "Plane"): https://lucide.dev/icons */
export const Icon: React.FC<{ name: string; size?: number; color?: string; stroke?: number; glow?: boolean }> = ({ name, size = 160, color = C.ink, stroke = 2, glow }) => {
  const Cmp = (Lucide as any)[name] ?? (Lucide as any)["HelpCircle"];
  return <Cmp size={size} color={color} strokeWidth={stroke} style={{ filter: glow ? `drop-shadow(0 0 22px ${color}aa)` : "drop-shadow(0 10px 20px #0008)" }} />;
};

export const Chip: React.FC<{ children: React.ReactNode; color?: string; text?: string; size?: number }> = ({ children, color = C.amber, text = C.bg, size = 46 }) => (
  <div style={{ background: color, color: text, fontFamily: F.bold, fontSize: size, padding: `${size * 0.22}px ${size * 0.55}px`, borderRadius: size,
    whiteSpace: "nowrap", boxShadow: `0 10px 30px ${color}55` }}>{children}</div>
);

export const Card: React.FC<{ children: React.ReactNode; w?: number; h?: number; pad?: number; border?: string; style?: React.CSSProperties }> =
  ({ children, w, h, pad = 36, border = C.dim, style }) => (
    <div style={{ width: w, height: h, padding: pad, borderRadius: 34, background: `linear-gradient(160deg, ${C.panel}f2, ${C.bg}f2)`,
      border: `3px solid ${border}`, boxShadow: "0 30px 60px #0009, inset 0 1px 0 #ffffff12", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 18, ...style }}>{children}</div>
  );

/** The viewer: a person badge labelled YOU, with an optional role ("casino owner"). */
export const You: React.FC<{ role?: string; size?: number; color?: string }> = ({ role, size = 180, color = C.amber }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
    <div style={{ width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, ${color}44, ${color}11)`,
      border: `5px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${color}55` }}>
      <Icon name="User" size={size * 0.62} color={color} stroke={2.2} />
    </div>
    <Chip size={size * 0.24}>YOU</Chip>
    {role ? <Text size={size * 0.24} font={F.med}>{role}</Text> : null}
  </div>
);

/** A rubber stamp ("BANNED", "SOLD OUT", "-$2,000"). Bring it in with <Appear from="slam">. */
export const Stamp: React.FC<{ children: React.ReactNode; color?: string; size?: number; rotate?: number }> = ({ children, color = C.coral, size = 110, rotate = -10 }) => (
  <div style={{ transform: `rotate(${rotate}deg)`, border: `${size * 0.09}px solid ${color}`, borderRadius: size * 0.16, padding: `${size * 0.05}px ${size * 0.25}px`,
    color, fontFamily: F.bold, fontSize: size, letterSpacing: 2, whiteSpace: "nowrap", background: `${C.bg}cc`, textShadow: `0 0 24px ${color}66`, boxShadow: `0 0 34px ${color}33, inset 0 0 24px ${color}22` }}>
    {children}
  </div>
);

/** Number counting from `from` to `to` between times t0 and t1. */
export const Counter: React.FC<{ from: number; to: number; t0: number; t1: number; size?: number; color?: string; prefix?: string; suffix?: string; decimals?: number; comma?: boolean }> =
  ({ from, to, t0, t1, size = 120, color = C.ink, prefix = "", suffix = "", decimals = 0, comma = true }) => {
    const t = useT();
    const v = tween(t, t0, t1, from, to, easeInOut);
    const s = comma ? v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : v.toFixed(decimals);
    return <Text size={size} color={color} font={F.bold} style={{ fontVariantNumeric: "tabular-nums" }}>{prefix}{s}{suffix}</Text>;
  };

/** A horizontal bar whose fill animates from `from` to `to` (0..1) between t0 and t1. */
export const Bar: React.FC<{ from?: number; to: number; t0?: number; t1?: number; w?: number; h?: number; color?: string }> =
  ({ from = 0, to, t0 = 0, t1 = 0.8, w = 860, h = 64, color = C.mint }) => {
    const t = useT();
    const v = tween(t, t0, t1, from, to, easeInOut);
    return (
      <div style={{ width: w, height: h, borderRadius: h, background: C.dim, overflow: "hidden", border: `3px solid ${C.muted}55` }}>
        <div style={{ width: `${v * 100}%`, height: "100%", borderRadius: h, background: `linear-gradient(90deg, ${color}, ${color}cc)`, boxShadow: `0 0 30px ${color}88` }} />
      </div>
    );
  };

/** Letters in boxes. `hi` maps index -> colour; `show` reveals tiles one by one from that time. */
export const Tiles: React.FC<{ text: string; size?: number; hi?: Record<number, string>; show?: number; stagger?: number; perRow?: number; hide?: number[]; gap?: number }> =
  ({ text, size = 92, hi = {}, show = 0, stagger = 0.04, perRow, hide = [], gap = 10 }) => {
    const t = useT();
    const rows: string[][] = [];
    const chars = text.split("");
    const n = perRow ?? chars.length;
    for (let i = 0; i < chars.length; i += n) rows.push(chars.slice(i, i + n));
    return (
      <div style={{ display: "flex", flexDirection: "column", gap }}>
        {rows.map((r, ri) => (
          <div key={ri} style={{ display: "flex", gap }}>
            {r.map((ch, ci) => {
              const i = ri * n + ci;
              const p = tween(t, show + i * stagger, show + i * stagger + 0.25, 0, 1);
              const col = hi[i];
              const gone = hide.includes(i);
              return (
                <div key={ci} style={{ width: size, height: size * 1.12, borderRadius: size * 0.14, display: "flex", alignItems: "center", justifyContent: "center",
                  background: col ? `${col}26` : C.panel, border: `${Math.max(3, size * 0.04)}px solid ${col ?? C.dim}`, color: col ?? C.ink,
                  fontFamily: F.mono, fontSize: size * 0.62, opacity: gone ? 0.12 : p, transform: `translateY(${(1 - p) * 20}px) scale(${col ? 1.04 : 1})`,
                  boxShadow: col ? `0 0 24px ${col}55` : "0 8px 18px #0006" }}>
                  {ch === " " ? <span style={{ width: size * 0.12, height: size * 0.12, borderRadius: "50%", background: C.muted }} /> : ch}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

/** A curved arrow from (x1, y1) to (x2, y2), drawn on between t0 and t1. bend > 0 curves upward. */
export const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; t0?: number; t1?: number; bend?: number; color?: string; width?: number }> =
  ({ x1, y1, x2, y2, t0 = 0, t1 = 0.6, bend = 160, color = C.amber, width = 10 }) => {
    const t = useT();
    const p = tween(t, t0, t1, 0, 1, easeInOut);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - bend;
    const d = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
    const len = Math.hypot(x2 - x1, y2 - y1) + Math.abs(bend) * 1.2;
    const ang = Math.atan2(y2 - my, x2 - mx) * 180 / Math.PI;
    return (
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)}
          style={{ filter: `drop-shadow(0 0 12px ${color}aa)` }} />
        {p > 0.97 ? <polygon points="0,-18 34,0 0,18" fill={color} transform={`translate(${x2},${y2}) rotate(${ang})`} /> : null}
      </svg>
    );
  };

/** A retro computer window; lines type on from `typeAt` at `cps` characters per second. */
export const Terminal: React.FC<{ lines: string[]; w?: number; title?: string; typeAt?: number; cps?: number; size?: number; color?: string }> =
  ({ lines, w = 920, title = "", typeAt = 0, cps = 28, size = 46, color = C.mint }) => {
    const t = useT();
    let budget = Math.max(0, (t - typeAt) * cps);
    return (
      <div style={{ width: w, borderRadius: 26, overflow: "hidden", background: "#070C14", border: `3px solid ${C.dim}`, boxShadow: "0 30px 60px #000a" }}>
        <div style={{ height: 54, background: C.panel, display: "flex", alignItems: "center", gap: 12, padding: "0 22px", position: "relative" }}>
          {[C.coral, C.amber, C.mint].map((c) => <div key={c} style={{ width: 18, height: 18, borderRadius: 9, background: c }} />)}
          <div style={{ position: "absolute", left: 0, right: 0, textAlign: "center", fontFamily: F.mono, color: C.muted, fontSize: 24 }}>{title}</div>
        </div>
        <div style={{ padding: "26px 34px", fontFamily: F.mono, fontSize: size, color, lineHeight: 1.35, minHeight: lines.length * size * 1.35 }}>
          {lines.map((l, i) => {
            const shown = l.slice(0, Math.floor(Math.min(l.length, budget)));
            budget -= l.length;
            return <div key={i} style={{ whiteSpace: "pre" }}>{shown}{shown.length < l.length && shown.length > 0 ? "▌" : ""}</div>;
          })}
        </div>
      </div>
    );
  };

// ------------------------------------------------------------------ captions
/** Word-by-word captions from the plan (the current word pops in amber). Rendered by Main. */
export const Captions: React.FC = () => {
  const plan = usePlan();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const ch = plan.chunks.find((c) => t >= c.start && t < c.end);
  if (!ch) return null;
  const firstIn = tween(t, ch.start, ch.start + 0.08, 0.85, 1);
  return (
    <At y={SAFE.captionY}>
      <div style={{ display: "flex", gap: 22, transform: `scale(${firstIn})`, maxWidth: 980, flexWrap: "wrap", justifyContent: "center" }}>
        {ch.words.map((w, i) => {
          const on = t >= w.start && (i === ch.words.length - 1 || t < ch.words[i + 1].start);
          const s = on ? tween(t, w.start, w.start + 0.12, 1.18, 1.08) : 1;
          return (
            <span key={i} style={{ fontFamily: F.bold, fontSize: 84, color: on ? C.amber : C.ink, transform: `scale(${s})`, display: "inline-block",
              WebkitTextStroke: `10px ${C.bg}`, paintOrder: "stroke fill", textShadow: "0 6px 20px #000c" }}>{w.text}</span>
          );
        })}
      </div>
    </At>
  );
};

/** A row (or grid) of `n` bit cells lighting up one by one between t0 and t1. */
export const Bits: React.FC<{ n: number; t0?: number; t1?: number; color?: string; size?: number; perRow?: number; label?: string }> =
  ({ n, t0 = 0, t1 = 0.8, color = C.amber, size = 34, perRow = 20 }) => {
    const t = useT();
    const lit = Math.floor(tween(t, t0, t1, 0, n, (x) => x));
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(n, perRow)}, ${size}px)`, gap: size * 0.22 }}>
        {Array.from({ length: n }, (_, i) => (
          <div key={i} style={{ width: size, height: size, borderRadius: size * 0.2, background: i < lit ? color : C.dim,
            boxShadow: i < lit ? `0 0 14px ${color}88` : "none", transform: `scale(${i === lit - 1 ? 1.25 : 1})` }} />
        ))}
      </div>
    );
  };

/** Text shown character by character between t0 and t1. */
export const TypeOn: React.FC<{ text: string; t0: number; t1: number; size?: number; color?: string; font?: string }> =
  ({ text, t0, t1, size = 56, color = C.ink, font = F.mono }) => {
    const t = useT();
    const n = Math.floor(tween(t, t0, t1, 0, text.length, (x) => x));
    return <Text size={size} color={color} font={font} style={{ whiteSpace: "pre" }}>{text.slice(0, n)}{n < text.length && n > 0 ? "▌" : ""}</Text>;
  };
