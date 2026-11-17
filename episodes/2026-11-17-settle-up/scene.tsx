// "How to settle a group trip in 4 payments, not 16": net balances + greedy settle-up.
// versus hook (16 IOUs vs 4 payments) -> nobody pays more or less -> five friends, four receipts -> 800 / 5 = 160
// -> balances +240 +40 -10 -110 -160 -> re-hook: only the balances matter -> biggest debt pays biggest credit
// -> repeat -> each payment clears someone: at most 4 -> CTA: +50 -20 -30? (2)
import React from "react";
import { Appear, Arrow, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

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

// five friends on a pentagon
type Who = "You" | "Ana" | "Tom" | "Max" | "Zoe";
const CX = 540, CY = 760, R = 270;
const ORDER: Who[] = ["You", "Ana", "Tom", "Max", "Zoe"];
const POS: Record<Who, [number, number]> = Object.fromEntries(ORDER.map((w, i) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
  return [w, [Math.round(CX + R * Math.cos(a)), Math.round(CY + R * Math.sin(a))]];
})) as Record<Who, [number, number]>;

const Node: React.FC<{ who: Who; bal?: string; balColor?: string; glow?: boolean }> = ({ who, bal, balColor = C.muted, glow }) => {
  const [x, y] = POS[who];
  return (
    <>
      <At x={x} y={y}>
        <div style={{ width: 150, height: 150, borderRadius: 75, background: C.panel, border: `5px solid ${glow ? C.amber : who === "You" ? C.mint : C.dim}`,
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: glow ? `0 0 40px ${C.amber}88` : "0 14px 30px #0008" }}>
          <Text size={46} color={who === "You" ? C.mint : C.ink}>{who}</Text>
        </div>
      </At>
      {bal !== undefined && <At x={x} y={who === "You" ? y - 112 : y + 112}><Text size={44} color={balColor}>{bal}</Text></At>}
    </>
  );
};

// a curved IOU line between two friends (SVG), with a small arrowhead
const Iou: React.FC<{ a: Who; b: Who; bend: number; color?: string; width?: number; opacity?: number }> = ({ a, b, bend, color = C.coral, width = 5, opacity = 0.8 }) => {
  const [x1, y1] = POS[a], [x2, y2] = POS[b];
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
  const nx = -dy / L, ny = dx / L, qx = mx + nx * bend, qy = my + ny * bend;
  // stop 80 px short of the target circle
  const s = 1 - 85 / L, ex = (1 - s) * (1 - s) * x1 + 2 * (1 - s) * s * qx + s * s * x2, ey = (1 - s) * (1 - s) * y1 + 2 * (1 - s) * s * qy + s * s * y2;
  const s0 = 85 / L, sx = (1 - s0) * (1 - s0) * x1 + 2 * (1 - s0) * s0 * qx + s0 * s0 * x2, sy = (1 - s0) * (1 - s0) * y1 + 2 * (1 - s0) * s0 * qy + s0 * s0 * y2;
  const ang = Math.atan2(ey - qy, ex - qx);
  const h = 18;
  return (
    <g opacity={opacity}>
      <path d={`M${sx},${sy} Q${qx},${qy} ${ex},${ey}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${ex},${ey} ${ex - h * Math.cos(ang - 0.5)},${ey - h * Math.sin(ang - 0.5)} ${ex - h * Math.cos(ang + 0.5)},${ey - h * Math.sin(ang + 0.5)}`} fill={color} />
    </g>
  );
};
// the 16 IOUs: everyone who didn't pay owes each payer (You, Ana, Tom, Max)
const PAYERS: Who[] = ["You", "Ana", "Tom", "Max"];
const IOUS: [Who, Who][] = PAYERS.flatMap((q) => ORDER.filter((p) => p !== q).map((p) => [p, q] as [Who, Who]));

const Web: React.FC<{ fade?: number }> = ({ fade = 1 }) => {
  const t = useT();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none", opacity: fade }}>
      {IOUS.map(([p, q], i) => <Iou key={i} a={p} b={q} bend={38 + 10 * Math.sin(t * 3 + i)} />)}
    </svg>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const t16 = w(["16"], 1, 1.0), t4 = w(["4"], 1, 2.4);
  return (
    <>
      <HookText y={250} size={88}>{"16 IOUs → **4 payments**"}</HookText>
      <Riser to={t4} volume={0.45} />
      <Web />
      {ORDER.map((who) => <Node key={who} who={who} />)}
      <At x={540} y={1110}><Appear at={0} from="pop" sfx={null}><Text size={44} color={C.coral}>16 IOUs</Text></Appear></At>
      <Sfx name="pack/paper-rip" at={t16} volume={0.3} />
      <Sfx name="pack/kaching" at={t4} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tCent = w(["cent"], 1, 0.9), tReceipts = w(["receipts"], 1, 3.0);
  const strike = tween(t, tReceipts - 0.1, tReceipts + 0.3, 0, 1);
  return (
    <>
      <Headline>Same money, fewer transfers</Headline>
      <At x={540} y={540}><Appear at={tCent - 0.3} from="up"><Chip color={C.mint} size={56}>nobody pays more or less</Chip></Appear></At>
      <At x={540} y={830}><Appear at={tReceipts - 0.6} from="pop">
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 24 }}>
          <Icon name="Receipt" size={150} color={C.coral} />
          <Text size={70} color={C.coral}>pay back receipts</Text>
          <div style={{ position: "absolute", left: -20, top: "50%", height: 10, width: `${strike * 108}%`, background: C.ink, borderRadius: 5 }} />
        </div>
      </Appear></At>
      <Sfx name="pack/paper-crumple" at={tReceipts} volume={0.3} dur={0.9} />
    </>
  );
};

// ---------------------------------------------------------------- context: who paid what
const PAID: [Who, string, string, number][] = [["You", "Hotel", "$400", 0], ["Ana", "Car", "$150", 1], ["Tom", "Dinners", "$200", 2], ["Max", "Fuel", "$50", 3], ["Zoe", "—", "$0", 4]];
const ContextBody: React.FC = () => {
  const w = useW();
  const tFive = w(["Five"], 1, 0.1);
  const times = [Math.max(0.35, tFive + 0.3), w(["Ana"], 1, 2.6), w(["Tom"], 1, 3.4), w(["Max"], 1, 4.2), w(["fuel"], 1, 4.8) - 0.1];
  return (
    <>
      <Headline>Who paid what</Headline>
      {PAID.map(([who, item, amt, i]) => (
        <At key={who} x={540} y={430 + i * 150} style={{ width: 860 }}>
          <Appear at={times[i] - 0.3} from="left">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: 820, padding: "14px 34px", borderRadius: 30,
              background: C.panel, border: `3px solid ${who === "You" ? C.mint : C.dim}` }}>
              <Text size={54} color={who === "You" ? C.mint : C.ink}>{who}</Text>
              <Text size={48} color={C.muted}>{item}</Text>
              <Text size={58} color={who === "Zoe" ? C.muted : C.amber} font={F.mono}>{amt}</Text>
            </div>
          </Appear>
        </At>
      ))}
      <Sfx name="pack/cash-register" at={times[0]} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- step 1: share
const ShareBody: React.FC = () => {
  const w = useW();
  const t800 = w(["800"], 1, 1.8), t160 = w(["160"], 1, 3.2);
  return (
    <>
      <Headline>Step 1: forget the receipts</Headline>
      <At x={540} y={560}><Appear at={0.05} out={t800 - 0.4} from="pop"><Icon name="Receipt" size={190} color={C.muted} /></Appear></At>
      <At x={540} y={560}><Appear at={t800 - 0.3} from="up"><Big size={120}>$800 ÷ 5</Big></Appear></At>
      <Punch at={t160}><At x={540} y={790}><Appear at={t160 - 0.2} from="slam"><Big size={150} color={C.amber}>$160 each</Big></Appear></At></Punch>
      <At x={540} y={1000}><Appear at={t160 + 0.4} from="fade" sfx={null}><Text size={46} color={C.muted}>everyone's fair share</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- step 2: balances (bars around a zero line)
const BAL: [Who, number][] = [["You", 240], ["Tom", 40], ["Ana", -10], ["Max", -110], ["Zoe", -160]];
const BalanceRows: React.FC<{ times: number[]; zeroAt?: number[] }> = ({ times, zeroAt }) => {
  const t = useT();
  const X0 = 480, K = 1.3;
  return (
    <>
      <div style={{ position: "absolute", left: X0 - 2, top: 380, width: 4, height: 760, background: C.dim }} />
      {BAL.map(([who, v], i) => {
        const y = 420 + i * 140;
        const grow = tween(t, times[i] - 0.1, times[i] + 0.4, 0, 1);
        const shrink = zeroAt ? tween(t, zeroAt[i], zeroAt[i] + 0.5, 1, 0) : 1;
        const len = Math.abs(v) * K * grow * shrink;
        const col = v > 0 ? C.mint : C.coral;
        return (
          <React.Fragment key={who}>
            <At x={130} y={y}><Text size={50} color={who === "You" ? C.mint : C.ink}>{who}</Text></At>
            <div style={{ position: "absolute", top: y - 30, height: 60, borderRadius: 12, background: col, opacity: grow > 0 ? 0.9 : 0,
              left: v > 0 ? X0 : X0 - len, width: len }} />
            <At x={v > 0 ? Math.min(X0 + len + 90, 880) : X0 + 110} y={y}>
              <Appear at={times[i]} from="fade" sfx={null}>
                <Text size={48} color={shrink < 0.05 ? C.mint : col} font={F.mono}>{shrink < 0.05 ? "0 ✓" : `${v > 0 ? "+" : "−"}${Math.abs(v)}`}</Text>
              </Appear>
            </At>
          </React.Fragment>
        );
      })}
    </>
  );
};
const BalanceBody: React.FC = () => {
  const w = useW();
  const times = [w(["240"], 1, 2.6), w(["40"], 1, 3.6), w(["10"], 1, 4.6), w(["110"], 1, 5.4), w(["160"], 1, 6.2)];
  return (
    <>
      <Headline>Step 2: paid minus share</Headline>
      <BalanceRows times={times} />
      {times.map((tt, i) => <Sfx key={i} name="pack/pop" at={tt} volume={0.25} />)}
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const w = useW();
  const tWhom = w(["whom"], 1, 1.4), tZero = w(["zero"], 1, 3.6);
  return (
    <>
      <Headline color={C.amber}>Only the balances matter</Headline>
      <BalanceRows times={[0, 0, 0, 0, 0]} />
      <At x={540} y={1120}><Appear at={tZero - 0.3} from="slam"><Chip color={C.amber} size={56}>every bar → 0</Chip></Appear></At>
      <Sfx name="pack/whoosh-soft" at={tWhom} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- steps 3-4: payments on the pentagon
type Pay = { from: Who; to: Who; amt: number; at: number };
const balAfter = (pays: Pay[], t: number): Record<Who, number> => {
  const b: Record<Who, number> = { You: 240, Ana: -10, Tom: 40, Max: -110, Zoe: -160 };
  for (const p of pays) if (t >= p.at + 0.5) { b[p.from] += p.amt; b[p.to] -= p.amt; }
  return b;
};
const Payments: React.FC<{ pays: Pay[]; before?: Pay[] }> = ({ pays, before = [] }) => {
  const t = useT();
  const b = balAfter([...before.map((p) => ({ ...p, at: -10 })), ...pays], t);
  return (
    <>
      {ORDER.map((who) => {
        const v = b[who];
        return <Node key={who} who={who} bal={v === 0 ? "0 ✓" : `${v > 0 ? "+" : "−"}${Math.abs(v)}`} balColor={v === 0 ? C.mint : v > 0 ? C.mint : C.coral}
          glow={pays.some((p) => t >= p.at - 0.3 && t < p.at + 1.2 && (p.from === who || p.to === who))} />;
      })}
      {[...before.map((p) => ({ ...p, at: -10 })), ...pays].map((p, i) => {
        const [x1, y1] = POS[p.from], [x2, y2] = POS[p.to];
        const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), u = 90 / L;
        const old = p.at < 0;
        return (
          <React.Fragment key={i}>
            <div style={{ opacity: old ? 0.45 : 1 }}>
              <Arrow x1={x1 + dx * u} y1={y1 + dy * u} x2={x2 - dx * u} y2={y2 - dy * u} t0={old ? -10 : p.at - 0.2} t1={old ? -9.5 : p.at + 0.4} bend={40} color={C.amber} width={9} />
            </div>
            <At x={(x1 + x2) / 2 + (-dy / L) * 70} y={(y1 + y2) / 2 + (dx / L) * 70}>
              <Appear at={old ? -10 : p.at} from="pop" sfx={null}><Chip color={C.amber} size={44}>${p.amt}</Chip></Appear>
            </At>
          </React.Fragment>
        );
      })}
    </>
  );
};
const BiggestBody: React.FC = () => {
  const w = useW();
  const tDebt = w(["debt"], 1, 1.6), tCredit = w(["credit"], 1, 2.6), tSends = w(["sends"], 1, 3.6), tDone = w(["Done"], 1, 5.0);
  return (
    <>
      <Headline>Step 3: biggest pays biggest</Headline>
      <At x={POS.Zoe[0]} y={POS.Zoe[1] - 120}><Appear at={tDebt - 0.2} out={tSends} from="pop"><Chip color={C.coral} size={40}>biggest debt</Chip></Appear></At>
      <At x={POS.You[0] + 230} y={POS.You[1]}><Appear at={tCredit - 0.2} out={tSends + 1.5} from="pop"><Chip color={C.mint} size={40}>biggest credit</Chip></Appear></At>
      <Payments pays={[{ from: "Zoe", to: "You", amt: 160, at: tSends }]} />
      <Sfx name="pack/cash-ting" at={tSends + 0.4} volume={0.3} />
      <Sfx name="pack/ding-short" at={tDone} volume={0.3} />
    </>
  );
};
const RepeatBody: React.FC = () => {
  const w = useW();
  const t80 = w(["80"], 1, 1.6), t30 = w(["30"], 1, 2.6), t10 = w(["10"], 1, 4.0), tZero = w(["zero"], 1, 5.4);
  const pays: Pay[] = [{ from: "Max", to: "You", amt: 80, at: t80 - 0.3 }, { from: "Max", to: "Tom", amt: 30, at: t30 - 0.3 }, { from: "Ana", to: "Tom", amt: 10, at: t10 - 0.3 }];
  return (
    <>
      <Headline>Repeat</Headline>
      <Payments before={[{ from: "Zoe", to: "You", amt: 160, at: 0 }]} pays={pays} />
      <At x={540} y={1130}><Appear at={tZero - 0.2} from="slam"><Chip color={C.mint} size={52}>4 payments. All zero.</Chip></Appear></At>
      {pays.map((p, i) => <Sfx key={i} name="pack/cash-ting" at={p.at + 0.4} volume={0.25} />)}
      <Sfx name="pack/correct" at={tZero} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const tClears = w(["clears"], 1, 1.0), t4 = w(["five"], 1, 3.2);
  return (
    <>
      <Camera keys={[[0, { zoom: 1 }], [t4, { zoom: 1.06 }]]}>
        <At x={540} y={470}><Appear at={tClears - 0.3} from="up"><Text size={66}>1 payment → 1 person at 0</Text></Appear></At>
        <Punch at={t4}><At x={540} y={740}><Appear at={t4 - 0.3} from="slam"><Big size={120} color={C.amber}>5 friends ≤ 4</Big></Appear></At></Punch>
        <At x={540} y={960}><Appear at={t4 + 0.3} from="fade" sfx={null}><Text size={46} color={C.muted}>Splitwise: “simplify debts”</Text></Appear></At>
      </Camera>
      <Sfx name="pack/hit-grand" at={t4} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const t50 = w(["50"], 1, 1.4), t20 = w(["20"], 1, 2.4), t30 = w(["30"], 1, 3.2), tHow = w(["How"], 1, 3.8);
  const rows: [string, string, string, number][] = [["You", "+50", C.mint, t50], ["Ana", "−20", C.coral, t20], ["Tom", "−30", C.coral, t30]];
  return (
    <>
      {rows.map(([who, v, col, tt], i) => (
        <At key={who} x={540} y={430 + i * 150}><Appear at={Math.min(0.05 + i * 0.25, tt - 0.3)} from="left">
          <div style={{ display: "flex", gap: 60, alignItems: "center" }}><Text size={64} color={who === "You" ? C.mint : C.ink}>{who}</Text><Text size={70} color={col} font={F.mono}>{v}</Text></div>
        </Appear></At>
      ))}
      <At x={540} y={950}><Appear at={tHow - 0.2} from="pop"><Big size={110} color={C.amber}>? payments</Big></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="share"><ShareBody /></Span>
    <Span from="balance"><BalanceBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="biggest"><BiggestBody /></Span>
    <Span from="repeat"><RepeatBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
