// "Find the weekday of any date in your head": Conway's Doomsday rule.
// claim hook (4/4 6/6 8/8 10/10 12/12 same weekday) -> 9 weeks apart -> 2026: Saturday -> odd months
// (9 to 5 at the 7-Eleven) -> Christmas Friday -> re-hook any year -> 69 + 17 = 86, 2 left -> Wed + 2 = Fri
// -> 20 July 1969 Sunday (Apollo 11) -> CTA: what weekday were you born on?
import React from "react";
import { Appear, Arrow, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT } from "../kit";

const MON = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const WD = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// try several spellings of a spoken word (captions may hold digits or words)
const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

const Page: React.FC<{ m: number; d: number; day?: string; dayAt?: number; w?: number; dayColor?: string }> = ({ m, d, day, dayAt = 0, w = 170, dayColor = C.amber }) => {
  const t = useT();
  const k = day ? (dayAt <= 0 ? 1 : tween(t, dayAt, dayAt + 0.25, 0, 1)) : 0;
  return (
    <div style={{ width: w, borderRadius: 22, overflow: "hidden", background: C.ink, boxShadow: "0 20px 40px #0009", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", background: C.coral, color: C.ink, fontFamily: F.bold, fontSize: w * 0.24, textAlign: "center", padding: "6px 0" }}>{MON[m - 1]}</div>
      <div style={{ fontFamily: F.bold, fontSize: w * 0.5, color: C.bg, lineHeight: 1.1, padding: "4px 0 0" }}>{d}</div>
      <div style={{ height: w * 0.32, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {day ? <div style={{ fontFamily: F.bold, fontSize: w * 0.21, color: C.bg, background: dayColor, borderRadius: 12, padding: "2px 12px",
          opacity: k, transform: `scale(${0.6 + 0.4 * k})` }}>{day}</div> : null}
      </div>
    </div>
  );
};

const Row: React.FC<{ y: number; items: { m: number; d: number; at: number }[]; dayAt?: number; day?: string; w?: number; gap?: number }> = ({ y, items, dayAt, day = "SAT", w = 170, gap = 26 }) => {
  const total = items.length * w + (items.length - 1) * gap;
  const x0 = 540 - total / 2 + w / 2;
  return (
    <>
      {items.map((p, i) => (
        <At key={i} x={x0 + i * (w + gap)} y={y}>
          <Appear at={p.at} from="pop"><Page m={p.m} d={p.d} w={w} day={dayAt !== undefined ? day : undefined} dayAt={(dayAt ?? 0) + i * 0.08} /></Appear>
        </At>
      ))}
    </>
  );
};

// month grid (Mon-first). start = weekday index of the 1st (0 = Mon)
const CW = 118, CH = 92, GX = 540 - 3.5 * CW;
const MonthGrid: React.FC<{ y0: number; days: number; start: number; hi: Record<number, { at: number; color: string }>; title: string }> = ({ y0, days, start, hi, title }) => {
  const t = useT();
  const cells = [];
  for (let d = 1; d <= days; d++) {
    const k = start + d - 1, col = k % 7, row = Math.floor(k / 7);
    const h = hi[d];
    const on = h && t >= h.at;
    const o = on ? tween(t, h.at, h.at + 0.2, 0, 1) : 0;
    cells.push(
      <div key={d} style={{ position: "absolute", left: GX + col * CW + 4, top: y0 + 70 + row * CH + 4, width: CW - 8, height: CH - 8, borderRadius: 14,
        background: on ? `${h.color}` : "rgba(255,255,255,0.06)", border: `2px solid rgba(255,255,255,0.12)`, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: F.bold, fontSize: 44, color: on ? C.bg : C.ink, transform: `scale(${1 + 0.12 * o * (1 - o) * 4})` }}>{d}</div>
    );
  }
  return (
    <>
      <div style={{ position: "absolute", left: GX, top: y0 - 70, width: 7 * CW, textAlign: "center", fontFamily: F.bold, fontSize: 52, color: C.ink }}>{title}</div>
      {WD.map((w, i) => (
        <div key={w} style={{ position: "absolute", left: GX + i * CW, top: y0 + 10, width: CW, textAlign: "center", fontFamily: F.med, fontSize: 40,
          color: i === 5 ? C.amber : C.muted }}>{w}</div>
      ))}
      {cells}
    </>
  );
};

const EVEN = [{ m: 4, d: 4 }, { m: 6, d: 6 }, { m: 8, d: 8 }, { m: 10, d: 10 }, { m: 12, d: 12 }];

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const tSame = w(["same"], 1, 2.0);
  return (
    <>
      <HookText y={330} size={92}>{"These 5 dates:\n**same weekday.** Always."}</HookText>
      <Riser to={tSame} volume={0.45} />
      <Row y={760} w={176} gap={22} items={EVEN.map((p) => ({ ...p, at: 0 }))} dayAt={0} />
      <Sfx name="pack/ding" at={tSame} volume={0.4} />
      <At x={540} y={1030}><Appear at={tSame + 0.3} from="pop"><Text size={50} color={C.muted}>every year, any year</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 9 weeks apart
const RuleBody: React.FC = () => {
  const w = useW();
  const tWeeks = w(["weeks"], 1, 4.0);
  const xs = [540 - 2 * 198, 540 - 198, 540, 540 + 198, 540 + 396];
  return (
    <>
      <Headline>Exactly 9 weeks apart</Headline>
      <Camera keys={[[0, { zoom: 1 }], ...(["April", "June", "August", "October", "December"].map((m, i) => [w([m], 1, 0.3 + i * 0.9), { zoom: 1.35, x: xs[i], y: 600 }]) as any), [w(["Every"], 1, 4.6), { zoom: 1 }]]}>
        <Row y={600} w={176} gap={22} items={EVEN.map((p) => ({ ...p, at: 0 }))} dayAt={0} />
      </Camera>
      {[0, 1, 2, 3].map((i) => (
        <React.Fragment key={i}>
          <Arrow x1={xs[i] + 10} y1={770} x2={xs[i + 1] - 10} y2={770} t0={tWeeks - 0.4 + i * 0.15} t1={tWeeks + i * 0.15} bend={-60} color={C.mint} width={8} />
          <At x={(xs[i] + xs[i + 1]) / 2} y={860}><Appear at={tWeeks + i * 0.15} from="pop"><Text size={42} color={C.mint}>63 d</Text></Appear></At>
        </React.Fragment>
      ))}
      <At x={540} y={990}><Appear at={tWeeks + 0.6} from="slam"><Chip color={C.amber} size={52}>63 days = 9 weeks</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- the anchor
const ContextBody: React.FC = () => {
  const w = useW();
  const tSat = w(["Saturdays"], 1, 1.4), tAnchor = w(["anchor"], 1, 2.6);
  return (
    <>
      <Headline>2026: all Saturdays</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tAnchor, { zoom: 1.08, x: 540, y: 650 }]]}>
        <Row y={560} w={176} gap={22} items={EVEN.map((p) => ({ ...p, at: 0 }))} dayAt={tSat - 0.2} />
        <At x={540} y={880}><Appear at={tAnchor - 0.1} from="slam"><Stamp color={C.amber} size={96} rotate={-6}>ANCHOR: SAT</Stamp></Appear></At>
      </Camera>
      <Sfx name="pack/hit-low" at={tAnchor} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- odd months
const OddBody: React.FC = () => {
  const w = useW();
  const t9 = w(["9", "nine"], 1, 1.4), t7e = w(["7Eleven", "seveneleven", "Eleven"], 1, 2.6);
  const tMay = w(["May"], 1, 3.4), tSep = w(["September"], 1, 4.2), tJul = w(["July"], 1, 5.0), tNov = w(["November"], 1, 5.8);
  const tSat = w(["Saturdays"], 1, 7.0);
  const pages = [{ m: 5, d: 9, at: tMay }, { m: 9, d: 5, at: tSep }, { m: 7, d: 11, at: tJul }, { m: 11, d: 7, at: tNov }];
  return (
    <>
      <Headline>9 to 5 at the 7-Eleven</Headline>
      <At x={330} y={420}><Appear at={t9 - 0.2} from="left"><Chip color={C.mint} size={50}>9 → 5</Chip></Appear></At>
      <At x={750} y={420}><Appear at={t7e - 0.2} from="right"><Chip color={C.mint} size={50}>7 – 11</Chip></Appear></At>
      {pages.map((p, i) => (
        <At key={i} x={i % 2 === 0 ? 330 : 750} y={i < 2 ? 660 : 960}>
          <Appear at={p.at - 0.1} from="pop"><Page m={p.m} d={p.d} w={190} day="SAT" dayAt={tSat - 0.2 + i * 0.08} /></Appear>
        </At>
      ))}
      <Sfx name="pack/ding" at={tSat} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- Christmas
const XmasBody: React.FC = () => {
  const w = useW();
  const t12 = w(["12th", "twelfth"], 1, 1.6), tWeek = w(["week"], 1, 3.0);
  const t19 = w(["19th", "nineteenth"], 1, 3.5), t26 = w(["26th", "twentysixth"], 1, 4.2);
  const t25 = w(["25th", "twentyfifth"], 1, 5.2), tFri = w(["Friday"], 1, 5.9);
  // December 2026: the 1st is a Tuesday
  return (
    <>
      <Headline>Christmas 2026</Headline>
      <Camera keys={[[0, { zoom: 1 }]]}>
        <MonthGrid y0={420} days={31} start={1} title="December 2026"
          hi={{ 12: { at: t12, color: C.amber }, 19: { at: t19, color: C.mint }, 26: { at: t26, color: C.mint }, 25: { at: t25, color: C.amber } }} />
        <At x={540} y={1060}><Appear at={tFri - 0.15} from="slam"><Chip color={C.amber} size={56}>25th: FRIDAY</Chip></Appear></At>
      </Camera>
      <At x={540} y={990}><Appear at={tWeek - 0.2} out={tFri - 0.3} from="pop"><Text size={50} color={C.mint}>+7 days, +7 days</Text></Appear></At>
      <Sfx name="pack/click-soft" at={t19} volume={0.35} />
      <Sfx name="pack/click-soft" at={t26} volume={0.35} />
      <Sfx name="pack/correct" at={tFri} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook: any year
const RehookBody: React.FC = () => {
  const w = useW();
  const tAny = w(["any"], 1, 2.0);
  return (
    <>
      <Headline color={C.amber}>Any year at all</Headline>
      <At x={540} y={700} style={{ width: 1000, display: "flex", justifyContent: "center" }}><Punch at={tAny + 0.6}><Counter comma={false} from={2026} to={1969} t0={0.3} t1={tAny + 0.6} size={220} color={C.ink} /></Punch></At>
      <Sfx name="pack/rewind-tape" at={0.3} volume={0.35} />
      <At x={540} y={930}><Appear at={tAny + 0.6} from="pop"><Text size={54} color={C.muted}>what weekday?</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 69 + 17 = 86, 2 left
const YearBody: React.FC = () => {
  const w = useW();
  const t69 = w(["69", "sixtynine"], 1, 2.2), tQuarter = w(["quarter"], 1, 3.2), t17 = w(["17", "seventeen"], 1, 4.4);
  const t86 = w(["86", "eightysix"], 1, 5.4), tSevens = w(["sevens"], 1, 6.4), t2 = w(["2", "two"], 1, 7.2);
  return (
    <>
      <Headline>The year's number</Headline>
      <At x={540} y={440}>
        <div style={{ fontFamily: F.bold, fontSize: 170, color: C.ink, letterSpacing: 4 }}>
          <span style={{ color: C.muted }}>19</span><span style={{ color: t69 > 0 && true ? C.amber : C.ink }}>69</span>
        </div>
      </At>
      <At x={540} y={660} style={{ width: 1000 }}><Appear at={t69 - 0.1} from="up">
        <Text size={84} font={F.mono}>69 <span style={{ color: C.mint }}>+ 17</span></Text>
      </Appear></At>
      <At x={830} y={570}><Appear at={tQuarter - 0.1} from="pop"><Text size={40} color={C.mint}>69 ÷ 4 → 17</Text></Appear></At>
      <At x={540} y={800}><Appear at={t86 - 0.15} from="pop"><Text size={96} font={F.mono}>= 86</Text></Appear></At>
      <At x={540} y={940} style={{ width: 1000 }}><Appear at={tSevens - 0.2} from="fade" sfx={null}><Text size={58} color={C.muted} font={F.mono}>86 − 84 (12 sevens)</Text></Appear></At>
      <At x={540} y={1070}><Appear at={t2 - 0.1} from="slam"><Chip color={C.amber} size={60}>2 left</Chip></Appear></At>
      <Sfx name="pack/pencil" at={t17} volume={0.3} />
      <Sfx name="pack/ding" at={t2} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- century anchor + 2
const CenturyBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tWed = w(["Wednesday"], 1, 1.2), tTwo = w(["Two"], 1, 1.8), tFri = w(["Friday"], 1, 2.6);
  const step = t < tTwo ? 2 : t < (tTwo + tFri) / 2 ? 3 : 4;
  const CWD = 136, x0 = 540 - 3 * CWD;
  return (
    <>
      <Headline>1900s start on Wednesday</Headline>
      {WD.map((d, i) => {
        const isWed = i === 2 && t >= tWed - 0.1, isNow = t >= tTwo && i === step, isFri = i === 4 && t >= tFri - 0.1;
        const bg = isFri ? C.amber : isWed ? C.mint : isNow ? `${C.amber}88` : "rgba(255,255,255,0.07)";
        return (
          <At key={d} x={x0 + i * CWD} y={640}>
            <div style={{ width: CWD - 14, height: 130, borderRadius: 20, background: bg, border: "2px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center",
              justifyContent: "center", fontFamily: F.bold, fontSize: 42, color: isWed || isFri ? C.bg : C.ink }}>{d}</div>
          </At>
        );
      })}
      <Arrow x1={x0 + 2 * CWD} y1={560} x2={x0 + 4 * CWD} y2={560} t0={tTwo - 0.1} t1={tFri} bend={90} color={C.amber} width={8} />
      <At x={x0 + 3 * CWD} y={460}><Appear at={tTwo - 0.1} from="pop"><Text size={50} color={C.amber}>+2</Text></Appear></At>
      <At x={540} y={900} style={{ width: 1000 }}><Appear at={tFri - 0.1} from="slam"><Chip color={C.amber} size={56}>1969's day: FRIDAY</Chip></Appear></At>
      <Sfx name="pack/click-soft" at={tTwo + 0.2} volume={0.35} />
      <Sfx name="pack/click-soft" at={(tTwo + tFri) / 2 + 0.1} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- payoff: 20 July 1969
const PayoffBody: React.FC = () => {
  const w = useW();
  const t11 = w(["11th", "eleventh"], 1, 0.6), t18 = w(["18th", "eighteenth"], 1, 1.8), t20 = w(["20th", "twentieth"], 1, 2.8);
  const tApollo = w(["Apollo"], 1, 4.0), tSun = w(["Sunday"], 2, 6.0);
  // July 1969: the 1st was a Tuesday
  return (
    <>
      <Headline>20 July 1969</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tApollo - 0.3, { zoom: 1 }], [tApollo + 0.4, { zoom: 0.92, x: 540, y: 700 }]]}>
        <MonthGrid y0={420} days={31} start={1} title="July 1969"
          hi={{ 11: { at: t11, color: C.amber }, 18: { at: t18, color: C.mint }, 20: { at: t20, color: C.amber } }} />
      </Camera>
      <At x={540} y={1080}><Appear at={tApollo - 0.1} from="up"><div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Icon name="Moon" size={90} color={C.amber} glow /><Chip color={C.amber} size={52}>Moon landing: SUNDAY</Chip></div></Appear></At>
      <Sfx name="pack/click-soft" at={t18} volume={0.35} />
      <Sfx name="pack/ding" at={t20} volume={0.4} />
      <Sfx name="pack/hit-grand" at={tSun} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tTue = w(["Tuesday"], 1, 1.2), tBorn = w(["born"], 1, 2.6);
  return (
    <>
      <Headline>Your turn</Headline>
      <At x={540} y={460}><div style={{ display: "flex", gap: 30 }}>
        <Chip color={C.mint} size={50}>1900s: WED</Chip>
        <Appear at={tTue - 0.2} from="pop"><Chip color={C.mint} size={50}>2000s: TUE</Chip></Appear>
      </div></At>
      <At x={540} y={720}><Appear at={tBorn - 0.3} from="slam"><Text size={84} color={C.amber}>your birthday?</Text></Appear></At>
      <At x={540} y={930} style={{ width: 1000 }}><Appear at={tBorn} from="fade" sfx={null}><Text size={42} color={C.muted}>Jan 3 (leap year: 4) · Feb: last day · Mar 14</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="odd"><OddBody /></Span>
    <Span from="xmas"><XmasBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="year"><YearBody /></Span>
    <Span from="century"><CenturyBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
