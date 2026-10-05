// "How your card number catches its own typos": the Luhn check digit as a how-to.
import React from "react";
import {
  Appear, At, C, Camera, Card, Chip, Counter, Emoji, F, Headline, Icon, Punch, Riser, Sfx, Shake,
  Span, Stamp, Text, TypeOn, You, tween, useAt, useT,
} from "../kit";

const CARD = [4, 5, 3, 9, 1, 4, 8, 8, 0, 3, 4, 3, 6, 4, 6, 7];
const dbl = (d: number) => (2 * d > 9 ? 2 * d - 9 : 2 * d);
// From the right, every second digit is doubled: with 16 digits that's the even indices.
const isDbl = (i: number) => (CARD.length - 1 - i) % 2 === 1;

// Two rows of 8 digit boxes.
const BS = 96, BG = 14, ROW_Y = [420, 700];
const bx = (i: number) => 540 - (8 * BS + 7 * BG) / 2 + (i % 8) * (BS + BG) + BS / 2;
const by = (i: number) => ROW_Y[Math.floor(i / 8)];

const Box: React.FC<{ d: number | string; color?: string; fill?: boolean }> = ({ d, color = C.ink, fill }) => (
  <div style={{ width: BS, height: BS * 1.15, borderRadius: 18, border: `4px solid ${color}`, background: fill ? `${color}33` : `${C.panel}ee`,
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontSize: 70, color, boxShadow: `0 0 18px ${color}44` }}>{d}</div>
);

/** The card's digits. `digits` may differ from CARD (typo, swap); colours per index. */
const Digits: React.FC<{ digits?: number[]; color?: (i: number) => string; show?: number; labels?: (i: number) => React.ReactNode }> =
  ({ digits = CARD, color = () => C.ink, show = -1, labels }) => (
    <>
      {digits.map((d, i) => (
        <At key={i} x={bx(i)} y={by(i)}>
          {show >= 0 ? <Appear at={show + i * 0.04} from="pop" sfx={i % 4 === 0 ? "pop" : null} volume={0.25}><Box d={d} color={color(i)} /></Appear>
            : <Box d={d} color={color(i)} />}
        </At>
      ))}
      {labels ? digits.map((_, i) => <At key={`l${i}`} x={bx(i)} y={by(i) + 110}>{labels(i)}</At>) : null}
    </>
  );

// ---------------------------------------------------------------- 1. the problem
const HookBody: React.FC = () => {
  const at = useAt();
  const tWrong = at.word("wrong", 1, 2.4);
  return (
    <>
      <Riser from={0} to={tWrong} volume={0.5} />
      <Shake at={tWrong}>
        <Camera keys={[[0, { zoom: 1.08 }], [tWrong, { zoom: 1 }], [at.dur, { zoom: 1.08, y: 640 }]]}>
          <At x={230} y={500}><Appear at={0} from="pop"><You role="shop owner" size={210} /></Appear></At>
          <At x={720} y={500}>
            <Appear at={0.1} from="right" dist={140}>
              <Card w={480} h={340} border={C.coral}>
                <Icon name="CreditCard" size={150} color={C.ink} />
                <Text size={40} color={C.muted} font={F.med}>card number</Text>
              </Card>
            </Appear>
          </At>
          <At x={540} y={830}>
            <Appear at={0.2} from="up">
              <Card w={900} h={150} pad={20} border={C.dim}>
                <TypeOn text="4539 1488 0343 6467" t0={0.3} t1={Math.max(0.9, tWrong - 0.2)} size={66} font={F.mono} />
              </Card>
            </Appear>
          </At>
          <At x={540} y={1030}><Appear at={tWrong} from="slam"><Stamp size={76}>ONE DIGIT OFF?</Stamp></Appear></At>
        </Camera>
      </Shake>
      <Sfx name="type" at={0.3} volume={0.3} />
      <Sfx name="whoosh" at={at.dur - 0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 2. the check digit, doubling, the total
const RuleBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCheck = at.word("check", 1, 1.6);
  const tDouble = at.beat("double");
  const tDbl = at.word("double", 1, tDouble + 1.0);
  const t16 = at.word("16", 1, tDouble + 4.2);
  const t7 = at.word("7", 1, t16 + 0.6);
  const tSum = at.beat("sum");
  const t80 = at.word("80", 1, tSum + 3.6);
  const showDbl = t >= tDbl;
  const color = (i: number) => (i === 15 && t >= tCheck ? C.amber : showDbl && isDbl(i) ? C.mint : C.ink);
  const labels = (i: number) =>
    isDbl(i) ? (
      <Appear at={tDbl + 0.4 + (14 - i) * 0.08} from="up" sfx={i === 14 ? "swoosh" : null}>
        <Text size={44} font={F.mono} color={CARD[i] * 2 > 9 ? C.amber : C.mint}>{dbl(CARD[i])}</Text>
      </Appear>
    ) : null;
  return (
    <>
      <Headline out={tDouble - 0.3}>Make the last digit a check</Headline>
      <Headline at={tDouble} out={tSum - 0.3} color={C.mint}>Double every second digit</Headline>
      <Headline at={tSum} color={C.amber}>Total must end in 0</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tCheck, { zoom: 1.2, x: 860, y: 720 }], [tDouble, { zoom: 1 }], [t16 - 0.2, { zoom: 1 }],
        [t16, { zoom: 1.25, x: bx(6), y: by(6) + 40 }], [t7 + 0.8, { zoom: 1.25, x: bx(6), y: by(6) + 40 }], [tSum, { zoom: 1 }]]}>
        <Digits show={0} color={color} labels={labels} />
        <At x={bx(15)} y={by(15) - 110}><Appear at={tCheck} from="pop"><Chip size={36}>check</Chip></Appear></At>
        <At x={bx(6)} y={by(6) - 105}>
          <Appear at={t16} out={tSum - 0.2} from="pop">
            <Chip size={40} color={C.amber}>8 × 2 = 16 → 16 − 9 = 7</Chip>
          </Appear>
        </At>
        <At x={540} y={1010}>
          <Appear at={tSum + 0.3} from="up">
            <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <Text size={56}>total</Text>
              <Counter from={0} to={80} t0={tSum + 0.4} t1={Math.max(tSum + 1.0, t80)} size={110} color={C.amber} />
              <Appear at={t80 + 0.1} from="pop" sfx="ding"><Icon name="CircleCheck" size={100} color={C.mint} glow /></Appear>
            </div>
          </Appear>
        </At>
      </Camera>
      <Sfx name="whoosh" at={tDouble - 0.1} volume={0.4} />
      <Sfx name="ding" at={t7} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 3. a typo: 9 -> 7, total 78, rejected
const TypoBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t7 = at.word("7", 1, 1.4);
  const t78 = at.word("78", 1, 3.2);
  const tReject = at.word("reject", 1, at.beat("reject") + 1.6);
  const tMoves = at.word("moves", 1, tReject + 1.8);
  const typed = t >= t7;
  const digits = CARD.map((d, i) => (i === 3 && typed ? 7 : d));
  return (
    <>
      <Headline out={at.beat("reject") - 0.3} color={C.coral}>Uh-oh</Headline>
      <Headline at={at.beat("reject")} color={C.mint}>Rejected on the spot</Headline>
      <Shake at={tReject}>
        <Camera keys={[[0, { zoom: 1 }], [t7 - 0.1, { zoom: 1.25, x: bx(3), y: by(3) + 60 }], [t78 - 0.3, { zoom: 1 }]]}>
          <Digits digits={digits} color={(i) => (i === 3 && typed ? C.coral : C.ink)} />
          <At x={bx(3)} y={by(3) - 110}><Appear at={t7} from="pop" sfx="error"><Chip size={36} color={C.coral}>was 9</Chip></Appear></At>
          <At x={540} y={940}>
            <Appear at={t78 - 0.4} from="up">
              <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
                <Text size={56}>total</Text>
                <Counter from={80} to={78} t0={t78 - 0.3} t1={t78} size={110} color={C.coral} />
              </div>
            </Appear>
          </At>
          <At x={540} y={1100}><Appear at={tMoves} from="up"><Text size={44} color={C.muted}>one digit off → total moves by 1 to 9</Text></Appear></At>
        </Camera>
        <At x={760} y={560}><Appear at={tReject} out={tMoves - 0.2} from="slam"><Stamp size={96}>REJECTED</Stamp></Appear></At>
      </Shake>
    </>
  );
};

// ---------------------------------------------------------------- 4. a swap: 39 -> 93, total 77
const SwapBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSwap = at.word("becomes", 1, 2.6);
  const tWhy = at.beat("why");
  const t77 = at.word("77", 1, tWhy + 4.4);
  const t45 = at.word("45", 1, t77 + 1.6);
  const p = tween(t, tSwap, tSwap + 0.6, 0, 1);
  const digits = CARD.slice();
  const lift = Math.sin(p * Math.PI) * 120;
  return (
    <>
      <Headline out={tWhy - 0.3} color={C.coral}>Two neighbours swapped</Headline>
      <Headline at={tWhy} color={C.mint}>That's why you double</Headline>
      <Camera keys={[[0, { zoom: 1.2, x: bx(2) + 55, y: by(2) + 80 }], [tWhy + 0.4, { zoom: 1.2, x: bx(2) + 55, y: by(2) + 80 }], [t77 - 0.4, { zoom: 1 }]]}>
        {digits.map((d, i) => {
          if (i === 2 || i === 3) {
            const from = i === 2 ? bx(2) : bx(3), to = i === 2 ? bx(3) : bx(2);
            const doubledNow = (i === 2 ? p < 0.5 : p >= 0.5);
            return (
              <At key={i} x={from + (to - from) * p} y={by(i) + (i === 2 ? -lift : lift)}>
                <Box d={d} color={t >= tWhy && doubledNow ? C.mint : C.amber} fill />
              </At>
            );
          }
          return <At key={i} x={bx(i)} y={by(i)}><Box d={d} color={C.ink} /></At>;
        })}
        <At x={(bx(2) + bx(3)) / 2} y={by(2) - 120}>
          <Appear at={tWhy + 1.2} from="pop"><Chip size={36} color={C.mint}>was 6 + 9 = 15 · now 9 + 3 = 12</Chip></Appear>
        </At>
        <At x={540} y={940}>
          <Appear at={t77 - 0.5} from="up">
            <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
              <Text size={56}>total</Text>
              <Counter from={80} to={77} t0={t77 - 0.4} t1={t77} size={110} color={C.coral} />
              <Appear at={t77 + 0.2} from="slam"><Chip size={48} color={C.coral}>CAUGHT</Chip></Appear>
            </div>
          </Appear>
        </At>
        <At x={540} y={1100}><Appear at={t45} from="up"><Text size={44} color={C.muted}>only 09 ↔ 90 slips through</Text></Appear></At>
      </Camera>
      <Sfx name="swoosh" at={tSwap} volume={0.5} />
      <Sfx name="error" at={t77} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 5. result, reveal, question
const ResultBody: React.FC = () => {
  const at = useAt();
  return (
    <>
      <Headline>Your checkout now</Headline>
      <At x={540} y={560}>
        <Appear at={0} from="pop">
          <Card w={640} h={420} border={C.mint}>
            <Icon name="CreditCard" size={150} />
            <Text size={52} color={C.mint} font={F.bold}>every single typo caught</Text>
          </Card>
        </Appear>
      </At>
      <At x={540} y={940}><Appear at={at.word("bank", 1, 2.6)} from="slam"><Chip color={C.mint} size={52}>0 calls to the bank</Chip></Appear></At>
      <Riser from={at.dur - 1.6} to={at.dur} volume={0.45} />
    </>
  );
};

const RevealBody: React.FC = () => {
  const at = useAt();
  return (
    <>
      <Punch at={0}>
        <At x={540} y={460}><Appear at={0} from="pop" sfx={null}><Icon name="CreditCard" size={340} color={C.amber} glow stroke={1.6} /></Appear></At>
        <At x={540} y={770}><Appear at={0.15} from="slam" sfx={null}><Text size={110} font={F.bold} color={C.amber} glow>Luhn check</Text></Appear></At>
        <At x={540} y={940}><Appear at={at.word("ibms", 1, 2.2)} from="up"><Text size={50}>Hans Peter Luhn, IBM, 1960</Text></Appear></At>
      </Punch>
      <Sfx name="boom" at={0} volume={0.7} />
      <Sfx name="reveal" at={0.05} volume={0.5} />
    </>
  );
};

const CtaBody: React.FC = () => (
  <>
    <At x={540} y={520}>
      <div style={{ display: "flex", gap: BG }}>
        {["1", "2", "3", "4", "?"].map((d, i) => (
          <Appear key={i} at={0.1 + i * 0.12} from="pop" sfx={i === 4 ? "pop" : null}><Box d={d} color={i === 4 ? C.amber : C.ink} fill={i === 4} /></Appear>
        ))}
      </div>
    </At>
    <At x={540} y={800}>
      <Appear at={0.6} from="up">
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}><You size={110} /><Chip size={48}>what's the check digit?</Chip></div>
      </Appear>
    </At>
    <At x={180} y={300}><Appear at={0.2} from="pop"><Emoji char="🤔" size={110} /></Appear></At>
  </>
);

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="spare" to="sum"><RuleBody /></Span>
    <Span from="typo" to="reject"><TypoBody /></Span>
    <Span from="swap" to="why"><SwapBody /></Span>
    <Span from="result"><ResultBody /></Span>
    <Span from="reveal"><RevealBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
