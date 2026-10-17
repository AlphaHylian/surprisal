// "Why 11% of PINs are 1234, and how to pick a safe one": human-chosen PINs vs the 10,000-code space.
// claim hook -> rule out "10,000 is safe" -> random odds 3 in 10,000 -> leaked codes (top 20 = 27%)
// -> step 1 no patterns -> re-hook birthday -> dates 366 / 19xx 100 -> wallet: 3 in 100 -> step 3 random -> payoff -> CTA.
import React from "react";
import {
  Appear, At, Bar, C, Camera, Card, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake,
  Span, Text, tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- pieces
// Four digit boxes, like a PIN entry screen.
const Pin: React.FC<{ digits: string; color?: string; size?: number; strike?: number }> = ({ digits, color = C.ink, size = 120, strike }) => {
  const t = useT();
  const w = strike === undefined ? 0 : tween(t, strike, strike + 0.25, 0, 100);
  return (
    <div style={{ position: "relative", display: "flex", gap: size * 0.16 }}>
      {digits.split("").map((d, i) => (
        <div key={i} style={{ width: size * 0.82, height: size * 1.08, borderRadius: size * 0.16, background: C.panel, border: `4px solid ${color}`,
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 24px ${color}44` }}>
          <Text size={size * 0.78} font={F.mono} color={color}>{d}</Text>
        </div>
      ))}
      {strike !== undefined ? (
        <div style={{ position: "absolute", left: -10, top: "50%", width: `${w}%`, height: 12, background: C.coral, borderRadius: 6,
          transform: "rotate(-6deg)", boxShadow: `0 0 20px ${C.coral}` }} />
      ) : null}
    </div>
  );
};

// 100 x 100 grid of all 10,000 codes, drawn with a CSS grid pattern; `marks` lights cells.
const GRID = 640, CELLS = 100, STEP = GRID / CELLS;
const AllCodes: React.FC<{ marks: number[]; markColor?: string; litRows?: number; litAt?: number }> = ({ marks, markColor = C.amber, litRows = 0, litAt = 0 }) => {
  const t = useT();
  const rows = litRows ? Math.round(tween(t, litAt, litAt + 0.6, 0, litRows)) : 0;
  return (
    <div style={{ position: "relative", width: GRID, height: GRID, borderRadius: 14, border: `3px solid ${C.muted}66`, background: C.panel,
      backgroundImage: `linear-gradient(${C.dim} 1px, transparent 1px), linear-gradient(90deg, ${C.dim} 1px, transparent 1px)`,
      backgroundSize: `${STEP}px ${STEP}px` }}>
      {rows ? <div style={{ position: "absolute", left: 0, top: 0, width: GRID, height: rows * STEP, background: `${C.coral}55` }} /> : null}
      {marks.map((m) => (
        <div key={m} style={{ position: "absolute", left: (m % CELLS) * STEP - 6, top: Math.floor(m / CELLS) * STEP - 6, width: STEP + 12, height: STEP + 12,
          borderRadius: 4, background: markColor, boxShadow: `0 0 18px ${markColor}` }} />
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFour = at.word("four", 1, 2.2);
  // 100 people, 11 of them amber: "11 in 100 use 1234"
  return (
    <>
      <HookText>{"**11%** of PINs\nare 1234"}</HookText>
      <Riser to={tFour} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05 }]]}>
        <At x={540} y={640}><Appear at={0} from="pop"><Pin digits="1234" color={C.amber} size={150} /></Appear></At>
        <At x={540} y={960}>
          <Appear at={0} from="up">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(20, 34px)", gap: 8 }}>
              {[...Array(100)].map((_, i) => {
                const lit = i % 9 === 4 && i < 99; // 11 lit, spread out
                const on = lit && t > 0.15 + (i / 100) * 1.4;
                return <div key={i} style={{ width: 34, height: 34, borderRadius: 17, background: on ? C.amber : C.dim,
                  boxShadow: on ? `0 0 14px ${C.amber}` : "none" }} />;
              })}
            </div>
          </Appear>
        </At>
      </Camera>
      <Sfx name="pack/access-granted" at={tFour + 0.1} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 2-3. rule out + random odds
const OddsBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tThree = at.word("3", 1, 2.0);
  const tLocks = at.word("locks", 1, 3.6);
  const tOdds = at.beat("odds");
  const t10k = at.word("10,000", 1, tOdds + 2.8);
  const tries = [0, 1, 2].map((i) => tThree + 0.35 * i);
  return (
    <>
      <Headline out={tOdds - 0.3}>10,000 codes</Headline>
      <Headline at={tOdds} color={C.mint}>3 tries, at random</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tOdds, { zoom: 1 }], [t10k + 0.4, { zoom: 1.04 }]]}>
        <At x={540} y={650}>
          <Appear at={0.05} from="pop"><AllCodes marks={t >= t10k ? [1234, 5871, 8305] : []} /></Appear>
        </At>
        <At x={540} y={1045}>
          <Appear at={tThree} out={tOdds - 0.1} from="up">
            <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
              {tries.map((ti, i) => <Appear key={i} at={ti} from="pop"><Icon name="KeyRound" size={70} color={C.ink} /></Appear>)}
              <Appear at={tLocks} from="slam"><Icon name="Lock" size={80} color={C.coral} /></Appear>
            </div>
          </Appear>
        </At>
        <At x={540} y={1045}>
          <Appear at={t10k} from="slam"><Text size={72} color={C.amber} glow>3 in 10,000</Text></Appear>
        </At>
      </Camera>
      <Sfx name="pack/click-hard" at={tries[0]} volume={0.3} />
      <Sfx name="pack/click-hard" at={tries[1]} volume={0.3} />
      <Sfx name="pack/click-hard" at={tries[2]} volume={0.3} />
      <Sfx name="pack/slam-metal" hit={tLocks + 0.05} volume={0.3} dur={1.2} />
      <Sfx name="pack/ding" at={t10k} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 4. the leak
const LeakBody: React.FC = () => {
  const at = useAt();
  const t34 = at.word("3.4", 1, 1.2);
  const t20 = at.word("20", 1, 3.0);
  const t27 = at.word("27%", 1, 3.8);
  return (
    <>
      <Headline color={C.coral}>People don't pick at random</Headline>
      <At x={540} y={520}>
        <Appear at={t34 - 0.2} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Icon name="DatabaseZap" size={84} color={C.coral} />
            <Counter from={0} to={3.4} t0={t34} t1={t34 + 0.8} decimals={1} size={80} color={C.ink} suffix=" million leaked" comma={false} />
          </div>
        </Appear>
      </At>
      <At x={540} y={780}>
        <Appear at={t20 - 0.3} from="left">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
            <Text size={48} color={C.amber}>the 20 most common codes</Text>
            <Bar from={0} to={0.27} t0={t20} t1={t27} w={860} h={70} color={C.amber} />
          </div>
        </Appear>
      </At>
      <Punch at={t27}>
        <At x={540} y={1040}><Appear at={t27} from="slam"><Text size={130} color={C.amber} glow>27%</Text></Appear></At>
      </Punch>
      <Sfx name="pack/data-transfer" at={t34} volume={0.3} dur={0.9} />
    </>
  );
};

// ---------------------------------------------------------------- 5. step one: no patterns
const PatternsBody: React.FC = () => {
  const at = useAt();
  const tA = at.word("four", 1, 1.6);
  const tB = at.word("ones", 1, 2.6);
  const tC = at.word("zeros", 1, 3.6);
  return (
    <>
      <Headline color={C.mint}>Step 1: no patterns</Headline>
      <At x={540} y={500}><Appear at={0.05} from="left"><Pin digits="1234" size={110} strike={tA + 0.1} /></Appear></At>
      <At x={540} y={720}><Appear at={tB - 0.4} from="left"><Pin digits="1111" size={110} strike={tB + 0.1} /></Appear></At>
      <At x={540} y={940}><Appear at={tC - 0.4} from="left"><Pin digits="0000" size={110} strike={tC + 0.1} /></Appear></At>
      <Sfx name="pack/wrong" at={tA + 0.1} volume={0.3} />
      <Sfx name="pack/wrong" at={tB + 0.1} volume={0.3} />
      <Sfx name="pack/wrong" at={tC + 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 6-8. birthday
const BirthdayBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tBirth = at.word("birthday", 1, 2.2);
  const tDates = at.beat("dates");
  const t366 = at.word("366", 1, tDates + 2.2);
  const t19 = at.word("19", 1, tDates + 3.6);
  const t100 = at.word("100", 1, tDates + 4.6);
  const tWallet = at.beat("wallet");
  const tId = at.word("ID", 1, tWallet + 1.4);
  const t3in100 = at.word("100", 2, tWallet + 3.4);
  const tWorse = at.word("worse", 1, tWallet + 4.8);
  const count = t < t366 ? 10000 : t < t100 ? 366 : 100;
  return (
    <>
      <Headline out={tDates - 0.3} color={C.amber}>Step 2: your birthday</Headline>
      <Headline at={tDates} out={tWallet - 0.3}>A date shrinks the list</Headline>
      <Headline at={tWallet} color={C.coral}>Your wallet holds your ID</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tDates, { zoom: 1 }], [t100 + 0.3, { zoom: 1.04 }], [tWallet, { zoom: 1 }]]}>
        <At x={540} y={560}>
          <Appear at={tBirth - 0.3} out={tWallet - 0.1} from="pop"><Icon name="Cake" size={220} color={C.amber} glow /></Appear>
        </At>
        <At x={540} y={800}>
          <Appear at={tDates + 0.2} out={tWallet - 0.1} from="up">
            <div style={{ display: "flex", gap: 34 }}>
              <Card w={400} h={230} pad={16} border={t >= t366 ? C.amber : C.dim}>
                <Text size={44} color={C.muted}>month + day</Text>
                <Pin digits="0412" size={58} color={C.ink} />
              </Card>
              <Card w={400} h={230} pad={16} border={t >= t100 ? C.coral : C.dim}>
                <Text size={44} color={C.muted}>a year</Text>
                <Pin digits="19??" size={58} color={t >= t19 ? C.coral : C.ink} />
              </Card>
            </div>
          </Appear>
        </At>
        <At x={540} y={1010}>
          <Appear at={t366 - 0.1} out={tWallet - 0.1} from="slam">
            <Text size={84} color={count === 100 ? C.coral : C.amber} glow>{count.toLocaleString("en-US")} codes</Text>
          </Appear>
        </At>
        {/* wallet beat */}
        <At x={330} y={560}><Appear at={tWallet + 0.1} from="left"><Icon name="Wallet" size={200} color={C.ink} /></Appear></At>
        <At x={760} y={560}><Appear at={tId} from="pop"><Icon name="IdCard" size={220} color={C.coral} glow /></Appear></At>
        <Shake at={t3in100}>
          <At x={540} y={800}><Appear at={t3in100 - 0.2} from="slam"><Text size={130} color={C.coral} glow>3 in 100</Text></Appear></At>
        </Shake>
        <At x={540} y={980}><Appear at={tWorse - 0.2} from="up"><Chip size={60} color={C.coral} text={C.bg}>100× worse than random</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/digits" at={t366} volume={0.3} />
      <Sfx name="pack/digits-2" at={t100} volume={0.3} />
      <Sfx name="pack/access-denied" at={t3in100} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 9. step three: random
const FINAL = "7295";
const FixBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRandom = at.word("random", 1, 1.0);
  const tKeep = at.word("keep", 1, 3.2);
  // each digit spins, then settles one after another
  const digits = FINAL.split("").map((d, i) => {
    const settle = tRandom + 0.5 + i * 0.35;
    if (t < tRandom) return "?";
    if (t >= settle) return d;
    return String(Math.floor((t * 30 + i * 3) % 10));
  }).join("");
  return (
    <>
      <Headline color={C.mint}>Step 3: let chance pick</Headline>
      <At x={540} y={520}><Appear at={0.05} from="pop"><Icon name="Dices" size={190} color={C.mint} glow /></Appear></At>
      <At x={540} y={790}><Appear at={0.2} from="up"><Pin digits={digits} size={150} color={t >= tRandom + 1.6 ? C.mint : C.ink} /></Appear></At>
      <At x={540} y={1010}><Appear at={tKeep} from="up"><Chip size={56} color={C.mint}>any of 10,000</Chip></Appear></At>
      <Sfx name="pack/counting-digital" at={tRandom} volume={0.3} dur={1.6} />
      <Sfx name="pack/correct" at={tRandom + 1.6} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 10-11. payoff + CTA
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tAny = at.word("any", 1, 2.4);
  return (
    <>
      <At x={540} y={620}>
        <Appear at={0} from="fade"><AllCodes marks={[7295]} markColor={C.mint} /></Appear>
      </At>
      <Punch at={tAny}>
        <At x={540} y={1030}><Appear at={tAny} from="slam"><Text size={68} color={C.amber} glow>yours could be any of them</Text></Appear></At>
      </Punch>
      <Sfx name="pack/boom-short" hit={tAny} volume={0.45} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const tSafe = at.word("safe", 1, 1.6);
  return (
    <>
      <At x={540} y={560}><Appear at={0.05} from="pop"><Pin digits="1234" size={120} color={C.amber} /></Appear></At>
      <At x={540} y={860}><Appear at={tSafe - 0.3} from="up"><Text size={84}>10,000 = <span style={{ color: C.coral }}>safe?</span></Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout" to="odds"><OddsBody /></Span>
    <Span from="leak"><LeakBody /></Span>
    <Span from="patterns"><PatternsBody /></Span>
    <Span from="rehook" to="wallet"><BirthdayBody /></Span>
    <Span from="fix"><FixBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
