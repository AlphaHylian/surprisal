// "Why a bus every 10 minutes makes you wait 8": bus bunching and the waiting-time paradox, how-to format.
// claim hook -> rule out luck/driver -> even gaps: wait 5 -> one bus late -> pairs + 18-minute holes
// -> re-hook -> the clock drops you in the holes (9 in 10) -> 8.2 min, +64% -> hold the early bus -> payoff -> CTA.
import React from "react";
import {
  Appear, At, Bar, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- the hour as a line
// 6 buses an hour. m = 0: exactly 10 apart; m = 1: pairs 2 apart with 18-minute holes.
const X0 = 100, X1 = 980;
const px = (min: number) => X0 + ((X1 - X0) * min) / 60;
const EVEN = [5, 15, 25, 35, 45, 55];
const BUNCHED = [9, 11, 29, 31, 49, 51];
const busMin = (i: number, m: number) => EVEN[i] + (BUNCHED[i] - EVEN[i]) * m;

const Timeline: React.FC<{ y: number; m: number; holes?: number; lateOnly?: boolean; busColor?: (i: number) => string }> =
  ({ y, m, holes = 0, lateOnly, busColor }) => {
    const pos = EVEN.map((_, i) => busMin(i, lateOnly && i > 1 ? 0 : m));
    return (
      <>
        {holes > 0 ? [0, 1, 2].map((k) => {
          const a = px(pos[2 * k + 1]), b = px(k < 2 ? pos[2 * k + 2] : 60 + pos[0]);
          const right = Math.min(b, X1);
          return (
            <div key={k} style={{ position: "absolute", left: a, top: y - 14, width: Math.max(0, right - a), height: 28, borderRadius: 14,
              background: C.coral, opacity: 0.55 * holes, boxShadow: `0 0 24px ${C.coral}` }} />
          );
        }) : null}
        <div style={{ position: "absolute", left: X0, top: y - 4, width: X1 - X0, height: 8, borderRadius: 4, background: C.muted }} />
        {[0, 30, 60].map((mm) => (
          <div key={mm} style={{ position: "absolute", left: px(mm) - 60, top: y + 30, width: 120, textAlign: "center" }}>
            <Text size={44} color={C.muted} font={F.mono}>{mm === 60 ? "1 h" : `${mm}`}</Text>
          </div>
        ))}
        {pos.map((p, i) => (
          <div key={i} style={{ position: "absolute", left: px(p) - 48, top: y - 116 - (i % 2 === 1 && !lateOnly ? 100 * m : 0) }}>
            <Icon name="Bus" size={96} color={busColor ? busColor(i) : C.ink} />
          </div>
        ))}
      </>
    );
  };

// a rider dropped on the line at minute `min`, with the wait to the next bus drawn as a bracket
const Rider: React.FC<{ y: number; min: number; next: number; color?: string; label?: string }> = ({ y, min, next, color = C.amber, label }) => (
  <>
    <div style={{ position: "absolute", left: px(min) - 32, top: y + 96, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Icon name="PersonStanding" size={84} color={color} />
    </div>
    <div style={{ position: "absolute", left: px(min), top: y + 80, width: px(next) - px(min), height: 10, borderRadius: 5, background: color }} />
    {label ? (
      <div style={{ position: "absolute", left: (px(min) + px(next)) / 2 - 150, top: y + 190, width: 300, textAlign: "center" }}>
        <Text size={72} color={color} glow>{label}</Text>
      </div>
    ) : null}
  </>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t8 = at.word("8", 1, 2.2);
  return (
    <>
      <HookText>{"Bus every **10 min**.\nYou still wait **8**."}</HookText>
      <Riser to={t8} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06 }]]}>
        <Timeline y={860} m={1} holes={1} />
        <Rider y={860} min={21} next={29} label="8 min" />
      </Camera>
      <Sfx name="pack/clock" at={0.2} volume={0.18} dur={at.dur} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out luck and the driver
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tLuck = at.word("luck.", 1, 0.6);
  const tDriver = at.word("driver.", 1, 1.6);
  const tSix = at.word("six", 1, 2.4);
  const tGaps = at.word("gaps", 1, 3.6);
  const strike = (t0: number) => tween(t, t0, t0 + 0.25, 0, 100);
  const Struck: React.FC<{ t0: number; children: string }> = ({ t0, children }) => (
    <div style={{ position: "relative" }}>
      <Text size={70} color={C.ink}>{children}</Text>
      <div style={{ position: "absolute", left: -10, top: "50%", width: `${strike(t0)}%`, height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-4deg)" }} />
    </div>
  );
  return (
    <>
      <At x={300} y={330}><Appear at={0.02} from="pop"><Struck t0={tLuck}>bad luck</Struck></Appear></At>
      <At x={780} y={330}><Appear at={tLuck} from="pop"><Struck t0={tDriver}>slow driver</Struck></Appear></At>
      <At x={540} y={470}><Appear at={tSix - 0.1} from="up"><Chip size={56} color={C.mint}>6 buses an hour</Chip></Appear></At>
      <Timeline y={820} m={1} holes={tween(t, tGaps, tGaps + 0.4, 0, 1)} />
      <At x={540} y={1060}><Appear at={tGaps} from="slam"><Text size={84} color={C.coral} glow>the gaps</Text></Appear></At>
      <Sfx name="pack/wrong" at={tLuck} volume={0.25} />
      <Sfx name="pack/wrong" at={tDriver} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 3. even gaps: wait 5
const EvenBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRandom = at.word("random", 1, 2.4);
  const t0to = at.word("anywhere", 1, 3.6);
  const t5 = at.word("5.", 1, 6.0);
  // the rider hops to a few random moments
  const spots = [[17, 25], [21.5, 25], [33, 35], [26, 35], [44, 45]];
  const k = Math.max(0, Math.min(spots.length - 1, Math.floor((t - tRandom) / 0.7)));
  return (
    <>
      <Headline out={at.dur - 0.3}>Even gaps</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t5, { zoom: 1 }], [at.dur, { zoom: 1.04 }]]}>
        <Timeline y={700} m={0} />
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ position: "absolute", left: (px(EVEN[i]) + px(EVEN[i + 1])) / 2 - 60, top: 500, width: 120, textAlign: "center" }}>
            <Appear at={0.1 + i * 0.12} from="pop"><Text size={44} color={C.mint}>10</Text></Appear>
          </div>
        ))}
        {t >= tRandom ? <Rider y={700} min={spots[k][0]} next={spots[k][1]} /> : null}
        <At x={540} y={1010}><Appear at={t0to} out={t5 - 0.2} from="up"><Text size={60}>wait 0 to 10 min</Text></Appear></At>
        <At x={540} y={1010}><Appear at={t5 - 0.1} from="slam"><Chip size={70} color={C.mint}>average: 5 min</Chip></Appear></At>
      </Camera>
      {[0, 1, 2, 3, 4].map((i) => <Sfx key={i} name="pack/click-hard" at={tRandom + i * 0.7} volume={0.18} />)}
    </>
  );
};

// ---------------------------------------------------------------- 4-5. one late bus -> pairs and holes
const BunchBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tLate = at.word("late.", 1, 1.6);
  const tLonger = at.word("longer,", 1, 3.6);
  const tPairsB = at.beat("pairs");
  const tCatch = at.word("catches", 1, tPairsB + 1.6);
  const t2 = at.word("2", 1, tPairsB + 3.8);
  const t18 = at.word("18-minute", 1, tPairsB + 5.2);
  // the late bus (index 0) drifts first; then every pair closes up
  const mLate = tween(t, tLate, tPairsB, 0, 0.5);
  const m = t < tCatch ? mLate : tween(t, tCatch, t2, 0.5, 1);
  const pos = EVEN.map((_, i) => (i === 0 ? busMin(0, t < tCatch ? mLate : m) : t < tCatch ? EVEN[i] : busMin(i, m)));
  const riders = Math.round(tween(t, tLate, tLonger + 0.8, 3, 11));
  return (
    <>
      <Headline out={tPairsB - 0.3} color={C.coral}>One bus runs late</Headline>
      <Headline at={tPairsB} out={at.dur - 0.3}>They come in pairs</Headline>
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.04 }]]}>
        <div style={{ position: "absolute", left: X0, top: 646, width: X1 - X0, height: 8, borderRadius: 4, background: C.muted }} />
        {pos.map((p, i) => (
          <div key={i} style={{ position: "absolute", left: px(p) - 48, top: 534 - (i % 2 === 1 && t >= tCatch ? 100 * m : 0) }}>
            <Icon name="Bus" size={96} color={i === 0 && t >= tLate && t < tCatch ? C.coral : i % 2 === 1 && t >= tCatch ? C.mint : C.ink} />
          </div>
        ))}
        {t < tPairsB ? (
          <At x={px(pos[0])} y={400}>
            <Appear at={tLate - 0.2} from="up">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="Users" size={70} color={C.coral} />
                <Text size={50} color={C.coral} font={F.mono}>{`×${riders}`}</Text>
              </div>
            </Appear>
          </At>
        ) : null}
        {t >= t18 - 0.1 ? [0, 1, 2].map((k) => {
          const a = px(pos[2 * k + 1]), b = Math.min(px(k < 2 ? pos[2 * k + 2] : 60 + pos[0]), X1);
          return <div key={k} style={{ position: "absolute", left: a, top: 636, width: b - a, height: 28, borderRadius: 14, background: C.coral,
            opacity: 0.55 * tween(t, t18 - 0.1, t18 + 0.3, 0, 1), boxShadow: `0 0 24px ${C.coral}` }} />;
        }) : null}
        <At x={px(10)} y={800}><Appear at={t2 - 0.1} from="pop"><Text size={54} color={C.mint}>2 min</Text></Appear></At>
        <At x={px(20)} y={800}><Appear at={t18 - 0.1} from="slam"><Text size={64} color={C.coral} glow>18 min</Text></Appear></At>
      </Camera>
      <At x={540} y={1050}><Appear at={tLonger} out={tPairsB - 0.2} from="up"><Text size={56} color={C.coral}>longer stops → later still</Text></Appear></At>
      <Sfx name="pack/whoosh-short" hit={tCatch + 0.4} volume={0.35} />
      <Sfx name="pack/wrong" at={t18} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 6-7. re-hook, then where you land
// 40 riders at fixed pseudo-random minutes; holes are (11, 29), (31, 49), (51, 69)
const DROPS = [...Array(40)].map((_, i) => ((i * 37.7 + 13.3) % 60));
const inHole = (mm: number) => { const r = (mm - 11 + 60) % 20; return r < 18; };
const LandBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tJump = at.word("jump?", 1, 2.4);
  const tLand = at.beat("land");
  const tClock = at.word("clock", 1, tLand + 2.0);
  const t9 = at.word("9", 1, tLand + 3.6);
  const shown = Math.floor(tween(t, tClock, t9 + 0.6, 0, 40));
  const hits = DROPS.slice(0, shown).filter(inHole).length;
  return (
    <>
      <Headline out={tLand - 0.3} color={C.amber}>Still 6 buses an hour</Headline>
      <Headline at={tLand} out={at.dur - 0.3}>The clock picks the gap</Headline>
      <Timeline y={700} m={1} holes={1} />
      <At x={540} y={390}><Appear at={tJump - 0.3} out={tLand - 0.2} from="pop"><Text size={120} color={C.amber} glow>?</Text></Appear></At>
      {DROPS.slice(0, shown).map((mm, i) => (
        <div key={i} style={{ position: "absolute", left: px(mm) - 11, top: 740 + (i % 5) * 34, width: 22, height: 22, borderRadius: 11,
          background: inHole(mm) ? C.coral : C.mint }} />
      ))}
      <At x={540} y={1060}>
        <Appear at={tClock} from="up"><Text size={60} color={C.coral} font={F.mono}>{`${hits} of ${shown} in a hole`}</Text></Appear>
      </At>
      <Punch at={t9}>
        <At x={540} y={375}><Appear at={t9 - 0.1} from="slam"><Chip size={76} color={C.coral}>9 in 10</Chip></Appear></At>
      </Punch>
      <Sfx name="pack/whoosh-short" at={tLand} volume={0.3} />
      {t >= tClock ? <Sfx name="pack/clock-fast" at={tClock} volume={0.15} dur={t9 + 0.6 - tClock} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- 8. the math
const MathBody: React.FC = () => {
  const at = useAt();
  const t9 = at.word("9", 1, 1.2);
  const t82 = at.word("8.2", 1, 2.8);
  const t64 = at.word("64%", 1, 4.6);
  return (
    <>
      <Headline color={C.coral}>Same buses, longer wait</Headline>
      <At x={540} y={420}><Appear at={t9 - 0.1} from="pop"><Text size={56}>in a hole: wait <span style={{ color: C.coral }}>9 min</span></Text></Appear></At>
      <At x={540} y={640}>
        <Appear at={0.1} from="left">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <Text size={48} color={C.mint}>even gaps</Text>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Bar from={0} to={5 / 9} t0={0.1} t1={0.6} w={640} h={64} color={C.mint} />
              <Text size={60} color={C.mint}>5</Text>
            </div>
          </div>
        </Appear>
      </At>
      <At x={540} y={860}>
        <Appear at={t82 - 0.6} from="left">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <Text size={48} color={C.coral}>in pairs</Text>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Bar from={0} to={8.2 / 9} t0={t82 - 0.5} t1={t82} w={640} h={64} color={C.coral} />
              <Counter from={5} to={8.2} t0={t82 - 0.5} t1={t82} size={60} color={C.coral} decimals={1} />
            </div>
          </div>
        </Appear>
      </At>
      <Punch at={t64}>
        <At x={540} y={1070}><Appear at={t64 - 0.1} from="slam"><Text size={96} color={C.amber} glow>+64% waiting</Text></Appear></At>
      </Punch>
      <Sfx name="pack/boom-short" hit={t64} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 9. the fix: hold the early bus
const FixBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tHold = at.word("hold", 1, 0.8);
  const tEven = at.word("even", 1, 3.0);
  const t5 = at.word("5.", 1, 5.2);
  const m = tween(t, tHold + 0.4, tEven + 0.4, 1, 0);
  return (
    <>
      <Headline out={at.dur - 0.3} color={C.mint}>Hold the early bus</Headline>
      <Timeline y={700} m={m} holes={Math.max(0, m)} busColor={(i) => (i % 2 === 1 && t >= tHold && t < tEven + 0.4 ? C.amber : C.ink)} />
      <At x={px(busMin(1, m))} y={470}>
        <Appear at={tHold - 0.1} out={tEven + 0.5} from="slam"><Stamp color={C.amber} size={70}>HOLD</Stamp></Appear>
      </At>
      <At x={540} y={1000}><Appear at={t5 - 0.1} from="slam"><Chip size={76} color={C.mint}>back to 5 min</Chip></Appear></At>
      <Sfx name="pack/thud-heavy" at={tHold} volume={0.35} />
      <Sfx name="pack/ding" at={t5} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 10-11. payoff + CTA
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tOften = at.word("often", 1, 1.6);
  const tEven = at.word("even", 1, 3.6);
  const tCta = at.beat("cta");
  return (
    <>
      <Timeline y={560} m={0} />
      <At x={540} y={790}><Appear at={tOften - 0.3} from="up"><Text size={66} color={C.muted}>not how often buses come</Text></Appear></At>
      <Punch at={tEven}>
        <At x={540} y={920}><Appear at={tEven - 0.1} from="slam"><Text size={84}>how <span style={{ color: C.amber }}>even</span> the gaps are</Text></Appear></At>
      </Punch>
      <At x={540} y={1090}><Appear at={tCta} from="up"><Text size={56} color={C.mint}>Blamed the driver?</Text></Appear></At>
      <Sfx name="pack/ding" at={tEven} volume={0.4} />
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="even"><EvenBody /></Span>
    <Span from="late" to="pairs"><BunchBody /></Span>
    <Span from="rehook" to="land"><LandBody /></Span>
    <Span from="math"><MathBody /></Span>
    <Span from="fix"><FixBody /></Span>
    <Span from="payoff" to="cta"><PayoffBody /></Span>
  </>
);
export default Scene;
