// "How 11 minutes a year deleted 10 days in 1582": Julian drift and the Gregorian fix.
// claim hook -> rule out -> 365 d + ~6 h -> leap day every 4 = 365.25 -> re-hook: 11 min too long -> drift: a day / 128 years,
// spring 21 -> 11 March -> cut: Thu 4 Oct -> Fri 15 Oct -> rule: 3 of 4 centuries skip -> payoff 27 s, 3,200 years -> CTA 2100?
import React from "react";
import { Appear, At, C, Camera, Card, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT } from "../kit";

// October 1582: the 1st was a Monday. cut = when 5-14 get struck, collapse = when 15+ slide into the gap
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const October: React.FC<{ y?: number; cut?: number; collapse?: number; scale?: number }> = ({ y = 760, cut = 0, collapse = 1e9, scale = 1 }) => {
  const t = useT();
  const cell = 118, gx = 540 - 3 * cell;
  const k = tween(t, collapse, collapse + 0.5, 0, 1);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${scale})`, transformOrigin: `540px ${y}px` }}>
      <div style={{ position: "absolute", left: 540 - 4 * cell + 20, top: y - 330, width: 8 * cell - 40, height: 700, borderRadius: 30, background: `${C.panel}ee`, border: `3px solid ${C.dim}` }} />
      <div style={{ position: "absolute", left: 0, width: 1080, top: y - 310, textAlign: "center", fontFamily: F.bold, fontSize: 52, color: C.mint }}>OCTOBER 1582</div>
      {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
        <div key={i} style={{ position: "absolute", left: gx + i * cell - 40, top: y - 230, width: 80, textAlign: "center", fontFamily: F.bold, fontSize: 40, color: C.muted }}>{d}</div>
      ))}
      {DAYS.map((d) => {
        const gone = d >= 5 && d <= 14;
        const idx0 = d - 1, idx1 = d <= 4 ? d - 1 : d - 11;
        const idx = gone ? idx0 : idx0 + (idx1 - idx0) * k;
        const col = idx % 7, row = Math.floor(idx / 7);
        const r0 = Math.floor(idx0 / 7), c0 = idx0 % 7, r1 = Math.floor(idx1 / 7), c1 = idx1 % 7;
        const cx = gone ? c0 : c0 + (c1 - c0) * k, ry = gone ? r0 : r0 + (r1 - r0) * k;
        const struck = gone && t >= cut;
        const op = gone ? 1 - k : 1;
        return (
          <div key={d} style={{ position: "absolute", left: gx + cx * cell - 50, top: y - 160 + ry * 100, width: 100, height: 84, borderRadius: 14,
            background: struck ? `${C.coral}33` : `${C.dim}88`, color: struck ? C.coral : d === 4 || d === 15 ? C.amber : C.ink, opacity: op,
            fontFamily: F.bold, fontSize: 46, display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: struck ? "line-through" : "none", textDecorationThickness: 6 }}>{d}</div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t10 = at.word("10", 1, 2.4);
  return (
    <>
      <HookText>{"11 minutes a year.\n**10 days gone.**"}</HookText>
      <Riser to={t10} volume={0.45} />
      <Punch at={t10}><October y={790} cut={0} scale={0.88} /></Punch>
      <Sfx name="pack/paper-flip" at={t10 - 0.1} volume={0.4} />
    </>
  );
};

const RuleBody: React.FC = () => {
  const at = useAt();
  const tWar = at.word("war", 1, 0.5), tPl = at.word("plague", 1, 1.4), tLeap = at.word("leap", 1, 2.6);
  return (
    <>
      <Headline>What took 10 days?</Headline>
      <At x={330} y={560}><Appear at={tWar - 0.2} from="pop"><Icon name="Swords" size={170} color={C.muted} /></Appear></At>
      <At x={750} y={560}><Appear at={tPl - 0.2} from="pop"><Icon name="Biohazard" size={170} color={C.muted} /></Appear></At>
      <At x={330} y={560}><Appear at={tWar + 0.3} from="slam" sfx="pack/wrong"><div style={{ transform: "translate(70px, 70px)" }}><Icon name="X" size={110} color={C.coral} stroke={4} /></div></Appear></At>
      <At x={750} y={560}><Appear at={tPl + 0.3} from="slam" sfx="pack/wrong"><div style={{ transform: "translate(70px, 70px)" }}><Icon name="X" size={110} color={C.coral} stroke={4} /></div></Appear></At>
      <At x={540} y={880}><Appear at={tLeap - 0.3} from="up"><Chip color={C.amber} size={64}>one leap day too many</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- the year, the leap day, the re-hook
const YearBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tLeap = at.beat("leap");
  const tRe = at.beat("rehook");
  const t6 = at.word("6", 1, 1.6), tOff = at.word("off", 1, 3.6);
  const tAdd = at.word("add", 1, tLeap + 0.3), tQ = at.word("quarter", 1, tLeap + 2.4);
  const tMuch = at.word("much", 1, tRe + 1.4), t11 = at.word("11", 1, tRe + 2.6);
  return (
    <>
      <Headline out={tLeap - 0.3}>One year</Headline>
      <Headline at={tLeap} out={tRe - 0.3} color={C.mint}>A leap day every 4 years</Headline>
      <Headline at={tRe} color={C.coral}>A quarter is too much</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tRe, { zoom: 1 }], [tRe + 0.8, { zoom: 1.12 }]]}>
        <At x={540} y={500}>
          <Text size={96}>365 d <span style={{ color: t >= t6 - 0.2 ? C.amber : C.dim }}>+ 5 h 49 m</span></Text>
        </At>
        {t < tLeap && <At x={540} y={700}><Appear at={tOff - 0.3} from="up"><Text size={56} color={C.coral}>skip it: 1 day off every 4 years</Text></Appear></At>}
        {t >= tLeap - 0.1 && (
          <At x={540} y={760}>
            <div style={{ display: "flex", gap: 26 }}>
              {[1, 2, 3, 4].map((y) => (
                <Appear key={y} at={tAdd - 0.3 + y * 0.15} from="pop">
                  <div style={{ width: 190, height: 190, borderRadius: 24, background: y === 4 ? `${C.mint}44` : `${C.dim}aa`, border: `4px solid ${y === 4 ? C.mint : C.muted}66`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: F.bold, color: y === 4 ? C.mint : C.ink }}>
                    <div style={{ fontSize: 72 }}>{y === 4 ? "366" : "365"}</div><div style={{ fontSize: 36, color: C.muted }}>year {y}</div>
                  </div>
                </Appear>
              ))}
            </div>
          </At>
        )}
        {t >= tQ - 0.2 && <At x={540} y={980}><Appear at={tQ - 0.2} from="slam"><Text size={84} color={C.mint}>365.25</Text></Appear></At>}
        {t >= tRe && (
          <>
            <At x={540} y={1090}><Appear at={tMuch - 0.2} from="up"><Text size={54} color={C.muted}>real: 365.2422</Text></Appear></At>
            <At x={820} y={980}><Appear at={t11 - 0.2} from="slam"><Chip color={C.coral} size={52}>+11 min</Chip></Appear></At>
          </>
        )}
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- drift
const DriftBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t128 = at.word("128", 1, 2.2), t1582 = at.word("1582", 1, 3.4), t11 = at.word("11", 2, 4.6), t21 = at.word("21", 1, 6.0);
  return (
    <>
      <Headline>1 day every 128 years</Headline>
      <At x={540} y={480}><Appear at={t128 - 0.3} from="pop"><Text size={54} color={C.muted}>11 min × 128 years ≈ 1 day</Text></Appear></At>
      <At x={540} y={640}><Text size={44} color={C.muted}>spring arrives</Text></At>
      <At x={540} y={760}>
        <Counter from={21} to={11} t0={t1582 - 0.1} t1={t11} size={150} color={t >= t11 ? C.coral : C.ink} prefix="" suffix=" March" />
      </At>
      <At x={540} y={920}><Appear at={t1582 - 0.3} from="up"><Text size={52}>325 → <span style={{ color: C.amber }}>1582</span></Text></Appear></At>
      <At x={540} y={1060}><Appear at={t21 - 0.3} from="up"><Text size={50} color={C.mint}>should be 21 March</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- the cut
const CutBody: React.FC = () => {
  const at = useAt();
  const tDel = at.word("deleted", 1, 1.4), tFri = at.word("Friday", 1, 4.6);
  return (
    <>
      <Headline color={C.amber}>Pope Gregory XIII</Headline>
      <October y={730} cut={tDel} collapse={tFri - 0.3} />
      <Sfx name="pack/paper-flip" at={tDel} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- the rule
const YEARS = [1600, 1700, 1800, 1900, 2000];
const RuleYearsBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t3 = at.word("3", 1, 1.6);
  const t1700 = at.word("1700", 1, 3.4), tSkip = at.word("skipped", 1, 5.0), t2000 = at.word("2000", 1, 5.8);
  return (
    <>
      <Headline>Stop the drift</Headline>
      <At x={540} y={460}><Appear at={t3 - 0.3} from="pop"><Text size={58}>drop <span style={{ color: C.amber }}>3</span> leap days every 400 years</Text></Appear></At>
      {YEARS.map((y, i) => {
        const leap = y % 400 === 0;
        const tShow = y === 2000 ? t2000 - 0.2 : y === 1600 ? t1700 - 0.4 : t1700 - 0.2 + (i - 1) * 0.35;
        const decided = leap ? t >= tShow + 0.1 : t >= tSkip - 0.2;
        return (
          <At key={y} x={540} y={600 + i * 120}>
            <Appear at={tShow} from="left">
              <div style={{ display: "flex", alignItems: "center", gap: 40, width: 620 }}>
                <Text size={72} color={decided ? (leap ? C.mint : C.coral) : C.ink}
                  style={{ textDecoration: decided && !leap ? "line-through" : "none" }}>{y}</Text>
                {decided && <Text size={50} color={leap ? C.mint : C.coral}>{leap ? "leap ✓" : "no leap day"}</Text>}
              </div>
            </Appear>
          </At>
        );
      })}
      <Sfx name="pack/wrong" at={tSkip} volume={0.3} />
      <Sfx name="pack/correct" at={t2000} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t27 = at.word("27", 1, 2.0), t3200 = at.word("3,200", 1, 4.0);
  return (
    <>
      <Headline color={C.amber}>365.2425</Headline>
      <At x={540} y={540}><Text size={48} color={C.muted}>too long by</Text></At>
      <At x={540} y={680}><Punch at={t27}><Counter from={660} to={27} t0={0.2} t1={t27} size={150} color={C.amber} suffix=" s" /></Punch></At>
      <At x={540} y={900}><Text size={44} color={C.muted}>a year (was 11 min)</Text></At>
      <At x={540} y={1050}><Appear at={t3200 - 0.3} from="slam"><Chip color={C.mint} size={60}>1 day / 3,200 years</Chip></Appear></At>
      <Sfx name="pack/kaching" at={t3200} volume={0.3} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const t2100 = at.word("2100", 1, 0.8);
  return (
    <>
      <Headline>Your turn</Headline>
      <At x={540} y={640}><Appear at={t2100 - 0.3} from="slam"><Text size={200} color={C.amber}>2100</Text></Appear></At>
      <At x={540} y={840}><Appear at={t2100 + 0.3} from="up"><Text size={70}>leap year?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleBody /></Span>
    <Span from="year" to="rehook"><YearBody /></Span>
    <Span from="drift"><DriftBody /></Span>
    <Span from="cut"><CutBody /></Span>
    <Span from="rule"><RuleYearsBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
