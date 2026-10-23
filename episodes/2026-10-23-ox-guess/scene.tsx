// "How 787 strangers guessed an ox to within 9 pounds": Galton's Vox Populi (Nature, 1907).
// versus hook (you miss by 37 lb, the crowd by 9) -> rule out experts -> Plymouth 1906, 787 tickets at sixpence ->
// sort every ticket -> take the middle one: 1,207 -> the ox weighed 1,198, off by 9 -> re-hook: half missed by more
// than 37, why is the middle so close? -> each guess = weight + a mistake, the mistakes cancel in the middle ->
// payoff: yours has nothing to cancel it; Galton -> CTA: 10, 12, 30, 14, 11 sweets.
import React from "react";
import {
  Appear, At, C, Camera, Card, Chip, Counter, Emoji, F, HookText, Headline, Icon, Punch, Riser, Sfx, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- the 787 tickets, drawn as 61 dots from Galton's table
const CENT: [number, number][] = [[0, 1010], [0.05, 1074], [0.1, 1109], [0.15, 1126], [0.2, 1148], [0.25, 1162], [0.3, 1174],
  [0.35, 1181], [0.4, 1188], [0.45, 1197], [0.5, 1207], [0.55, 1214], [0.6, 1219], [0.65, 1225], [0.7, 1230], [0.75, 1236],
  [0.8, 1243], [0.85, 1254], [0.9, 1267], [0.95, 1293], [1, 1370]];
const quant = (p: number) => {
  for (let i = 1; i < CENT.length; i++) {
    const [p0, v0] = CENT[i - 1], [p1, v1] = CENT[i];
    if (p <= p1) return v0 + (v1 - v0) * (p - p0) / (p1 - p0);
  }
  return CENT[CENT.length - 1][1];
};
const ND = 61, MID = 30, TRUE = 1198;
const VALS = Array.from({ length: ND }, (_, i) => quant((i + 0.5) / ND));
const LO = 1000, HI = 1380, X0 = 110, X1 = 970, LINE_Y = 900, DOT = 26;
const vx = (v: number) => X0 + (v - LO) / (HI - LO) * (X1 - X0);
// stacked dot plot: bin by 20 lb
const SLOTS = (() => {
  const count: Record<number, number> = {};
  return VALS.map((v) => {
    const b = Math.round((v - LO) / 20);
    const k = count[b] ?? 0;
    count[b] = k + 1;
    return { x: vx(LO + b * 20), y: LINE_Y - 24 - k * (DOT + 4) };
  });
})();
// a fixed shuffled start position for each dot (a heap of tickets)
const rnd = (i: number, s: number) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); };
const HEAP = VALS.map((_, i) => ({ x: 170 + rnd(i, 1) * 740, y: 430 + rnd(i, 2) * 380 }));

const Axis: React.FC<{ show?: number }> = ({ show = 0 }) => (
  <Appear at={show} from="fade">
    <div style={{ position: "absolute", left: X0 - 20, top: LINE_Y, width: X1 - X0 + 40, height: 4, background: C.muted, opacity: 0.7 }} />
    {[1100, 1200, 1300].map((v) => (
      <At key={v} x={vx(v)} y={LINE_Y + 44}><Text size={40} color={C.muted} font={F.med}>{v.toLocaleString("en-US")}</Text></At>
    ))}
    <At x={X1 - 10} y={LINE_Y + 96}><Text size={40} color={C.muted} font={F.med}>pounds</Text></At>
  </Appear>
);
const Dots: React.FC<{ sortAt: number; midAt?: number; fadeEndsAt?: number; showAt?: number }> = ({ sortAt, midAt = 1e9, fadeEndsAt = 1e9, showAt = 0 }) => {
  const t = useT();
  return (
    <>
      {VALS.map((v, i) => {
        if (t < showAt + i * 0.012) return null;
        const k = tween(t, sortAt + (i % 7) * 0.05, sortAt + 0.9 + (i % 7) * 0.05, 0, 1);
        const x = HEAP[i].x + (SLOTS[i].x - HEAP[i].x) * k;
        const y = HEAP[i].y + (SLOTS[i].y - HEAP[i].y) * k;
        const isMid = i === MID && t >= midAt;
        const wild = (i < 6 || i > ND - 7) && t >= fadeEndsAt;
        const col = isMid ? C.amber : wild ? C.coral : C.ink;
        return <div key={i} style={{ position: "absolute", left: x - DOT / 2, top: y - DOT / 2, width: DOT, height: DOT, borderRadius: 6,
          background: col, opacity: isMid ? 1 : 0.8, transform: `scale(${isMid ? 1.5 : 1})`, boxShadow: isMid ? `0 0 24px ${C.amber}` : "none" }} />;
      })}
    </>
  );
};

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t9 = at.word("9.", 1, 2.4);
  return (
    <>
      <HookText size={96}>{"You: **37 lb** off\nCrowd: **9 lb** off"}</HookText>
      <Riser to={t9} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06 }]]}>
        <At x={540} y={700}><Appear at={0} from="pop"><Emoji char="🐂" size={300} /></Appear></At>
        <At x={290} y={1000}>
          <Appear at={0} from="left">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Icon name="User" size={110} color={C.coral} />
              <Chip size={52} color={C.coral}>± 37 lb</Chip>
            </div>
          </Appear>
        </At>
        <At x={790} y={1000}>
          <Appear at={0} from="right">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Icon name="Users" size={110} color={C.amber} />
              <Chip size={52}>± 9 lb</Chip>
            </div>
          </Appear>
        </At>
      </Camera>
      <Sfx name="pack/ding" at={t9} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out experts
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tExperts = at.word("experts.", 1, 1.0);
  const tGuess = at.word("guessing", 1, 2.4);
  return (
    <>
      <Headline>Not a room of experts</Headline>
      <At x={540} y={620}>
        <Appear at={0.05} from="up">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, auto)", gap: 26 }}>
            {Array.from({ length: 10 }, (_, i) => <Icon key={i} name="User" size={110} color={C.ink} />)}
          </div>
        </Appear>
      </At>
      <At x={540} y={920}><Appear at={tExperts - 0.2} out={tGuess - 0.3} from="slam"><Stamp size={80} rotate={-6}>NOT EXPERTS</Stamp></Appear></At>
      <At x={540} y={920}>
        <Appear at={tGuess - 0.2} from="pop">
          <div style={{ display: "flex", gap: 40 }}>
            {["?", "?", "?"].map((q, i) => <Text key={i} size={130} color={C.amber} glow>{q}</Text>)}
          </div>
        </Appear>
      </At>
      <Sfx name="pack/hmm" at={tGuess} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 3. Plymouth, 1906: 787 tickets at sixpence
const SetupBody: React.FC = () => {
  const at = useAt();
  const t787 = at.word("787", 1, 1.4);
  const tSix = at.word("sixpence", 1, 2.6);
  const tOx = at.word("ox's", 1, 3.6);
  return (
    <>
      <Headline>Plymouth, 1906</Headline>
      <At x={300} y={620}><Appear at={0.05} from="pop"><Emoji char="🐂" size={240} /></Appear></At>
      <At x={760} y={560}>
        <Appear at={t787 - 0.2} from="up">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Counter from={0} to={787} t0={t787 - 0.2} t1={t787 + 0.8} size={140} color={C.amber} />
            <Text size={46} color={C.muted}>tickets</Text>
          </div>
        </Appear>
      </At>
      <At x={760} y={790}><Appear at={tSix - 0.2} from="pop" sfx="pack/cash-ting"><Chip size={56} color={C.mint}>6d a guess</Chip></Appear></At>
      <At x={540} y={1000}>
        <Appear at={tOx - 0.3} from="up">
          <Card w={620} pad={22} border={C.amber}>
            <Text size={46} font={F.mono} color={C.ink}>Weight after dressing:</Text>
            <Text size={60} font={F.mono} color={C.amber}>____ lb</Text>
          </Card>
        </Appear>
      </At>
      <Sfx name="pack/writing" at={tOx} dur={0.8} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 4-6. sort, take the middle, the true weight
const SortBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSort = at.word("sort", 1, 1.6);
  const tMiddleBeat = at.beat("middle");
  const tMid = at.word("middle.", 1, tMiddleBeat + 0.8);
  const tWild = at.word("wild", 1, tMiddleBeat + 1.6);
  const t1207 = at.word("1,207", 1, tMiddleBeat + 3.4);
  const tTruth = at.beat("truth");
  const t1198 = at.word("1,198.", 1, tTruth + 0.8);
  const t9 = at.word("9.", 1, tTruth + 1.6);
  const trueX = vx(TRUE), midX = SLOTS[MID].x;
  return (
    <>
      <Headline out={tMiddleBeat - 0.3}>Sort every ticket</Headline>
      <Headline at={tMiddleBeat} out={tTruth - 0.3} color={C.amber}>Take the middle one</Headline>
      <Headline at={tTruth} color={C.mint}>The real weight</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tMid, { zoom: 1 }], [tMid + 0.6, { zoom: 1.12, x: midX, y: 760 }], [tTruth + 0.2, { zoom: 1.12, x: midX, y: 760 }], [t9 + 0.4, { zoom: 1.3, x: (midX + trueX) / 2, y: 760 }]]}>
        <Axis show={tSort - 0.2} />
        <Dots showAt={0} sortAt={tSort - 0.1} midAt={tMid - 0.2} fadeEndsAt={tWild - 0.2} />
        {t >= t1198 - 0.2 ? <div style={{ position: "absolute", left: trueX - 3, top: 560, width: 6, height: LINE_Y - 560, background: C.mint,
          opacity: tween(t, t1198 - 0.2, t1198 + 0.2, 0, 1), boxShadow: `0 0 18px ${C.mint}` }} /> : null}
      </Camera>
      <At x={540} y={1060}><Appear at={tWild - 0.2} out={t1207 - 0.3} from="fade"><Text size={46} color={C.coral}>wild guesses don't move it</Text></Appear></At>
      <Punch at={t1207}>
        <At x={760} y={480}><Appear at={t1207 - 0.2} out={tTruth - 0.3} from="slam"><Chip size={64}>middle: 1,207 lb</Chip></Appear></At>
      </Punch>
      <At x={300} y={480}><Appear at={t1198 - 0.2} from="pop"><Chip size={56} color={C.mint}>ox: 1,198 lb</Chip></Appear></At>
      <At x={760} y={480}><Appear at={t9 - 0.2} from="slam"><Chip size={64}>off by 9</Chip></Appear></At>
      <Sfx name="pack/paper-flip" at={tSort} volume={0.35} />
      <Sfx name="pack/correct" at={t9} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 7-8. re-hook, then the mistakes cancel
const CancelBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tHalf = at.word("half", 1, 0.5);
  const tWhy = at.word("why", 1, 2.6);
  const tCancel = at.beat("cancel");
  const tPlus = at.word("plus", 1, tCancel + 1.0);
  const tHigh = at.word("high", 1, tCancel + 2.2);
  const tCancels = at.word("cancel.", 1, tCancel + 4.4);
  const trueX = vx(TRUE);
  // the half of the tickets beyond 37 lb, shaded
  const shade = tween(t, tHalf - 0.2, tHalf + 0.4, 0, 1) * tween(t, tCancel - 0.3, tCancel, 1, 0);
  // error sticks: from the true weight to each dot (every 4th dot), shrinking into the middle once they cancel
  const pull = tween(t, tCancels - 0.3, tCancels + 0.6, 0, 1);
  return (
    <>
      <Headline out={tCancel - 0.3}>Half missed by 37+ lb</Headline>
      <Headline at={tCancel} color={C.amber}>Guess = weight + mistake</Headline>
      <Axis />
      <Dots sortAt={-10} midAt={tCancels - 0.2} />
      <div style={{ position: "absolute", left: trueX - 3, top: 420, width: 6, height: LINE_Y - 420, background: C.mint, boxShadow: `0 0 18px ${C.mint}` }} />
      {shade > 0 ? <>
        <div style={{ position: "absolute", left: X0 - 20, top: 420, width: vx(TRUE - 37) - X0 + 20, height: LINE_Y - 420, background: C.coral, opacity: 0.18 * shade }} />
        <div style={{ position: "absolute", left: vx(TRUE + 37), top: 420, width: X1 + 20 - vx(TRUE + 37), height: LINE_Y - 420, background: C.coral, opacity: 0.18 * shade }} />
      </> : null}
      <At x={540} y={1060}><Appear at={tWhy - 0.2} out={tCancel - 0.3} from="pop"><Text size={60} color={C.amber} glow>so why is the middle so close?</Text></Appear></At>
      {t >= tPlus - 0.2 ? VALS.map((v, i) => i % 4 !== 2 ? null : (() => {
        const e = (v - TRUE) * (1 - pull);
        const y = 520 + (i / 4) * 24;
        const x0 = trueX, x1 = vx(TRUE + e);
        const up = e > 0;
        const o = tween(t, tPlus - 0.2 + i * 0.01, tPlus + 0.2 + i * 0.01, 0, 1);
        return <div key={i} style={{ position: "absolute", left: Math.min(x0, x1), top: y, width: Math.max(4, Math.abs(x1 - x0)), height: 12, borderRadius: 6,
          background: up ? C.coral : C.mint, opacity: o * (t >= tHigh - 0.2 ? 1 : 0.7) }} />;
      })()) : null}
      <At x={300} y={1060}><Appear at={tHigh - 0.2} out={tCancels - 0.3} from="left"><Chip size={48} color={C.mint}>too low</Chip></Appear></At>
      <At x={780} y={1060}><Appear at={tHigh} out={tCancels - 0.3} from="right"><Chip size={48} color={C.coral}>too high</Chip></Appear></At>
      <Punch at={tCancels}>
        <At x={540} y={1060}><Appear at={tCancels - 0.1} from="slam"><Stamp size={76} color={C.amber} rotate={-4}>THEY CANCEL</Stamp></Appear></At>
      </Punch>
      <Sfx name="pack/whoosh-mid" at={tCancels} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 9. payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tTheirs = at.word("crowd's", 1, 1.8);
  const tGalton = at.word("Galton", 1, 3.0);
  return (
    <>
      <Camera keys={[[0, { zoom: 1.04 }], [at.dur, { zoom: 1 }]]}>
        <At x={290} y={560}>
          <Appear at={0.05} from="left">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <Icon name="User" size={150} color={C.coral} />
              <Chip size={50} color={C.coral}>1 mistake, alone</Chip>
            </div>
          </Appear>
        </At>
        <At x={790} y={560}>
          <Appear at={tTheirs - 0.2} from="right">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <Icon name="Users" size={150} color={C.amber} />
              <Chip size={50}>787 that cancel</Chip>
            </div>
          </Appear>
        </At>
        <At x={540} y={900}>
          <Appear at={tGalton - 0.3} from="up">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <Text size={52} color={C.ink}>Francis Galton</Text>
              <Text size={42} color={C.muted}>"Vox Populi", Nature, 1907</Text>
            </div>
          </Appear>
        </At>
      </Camera>
      <Sfx name="reveal" at={tTheirs - 0.2} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 10. CTA: five friends, the crowd's guess
const CtaBody: React.FC = () => {
  const at = useAt();
  const tFive = at.word("guess", 1, 0.6);
  const tWhat = at.word("What's", 1, 3.6);
  const nums = [10, 12, 30, 14, 11];
  return (
    <>
      <At x={540} y={480}><Appear at={0.05} from="pop"><Emoji char="🍬" size={170} /></Appear></At>
      <At x={540} y={740}>
        <div style={{ display: "flex", gap: 22 }}>
          {nums.map((n, i) => (
            <Appear key={i} at={tFive - 0.2 + i * 0.35} from="pop">
              <div style={{ width: 150, height: 150, borderRadius: 24, background: C.panel, border: `4px solid ${C.dim}`, display: "flex",
                alignItems: "center", justifyContent: "center", fontFamily: F.bold, fontSize: 76, color: C.ink }}>{n}</div>
            </Appear>
          ))}
        </div>
      </At>
      <Punch at={tWhat}>
        <At x={540} y={990}><Appear at={tWhat - 0.2} from="pop"><Text size={84} color={C.amber} glow>crowd's guess?</Text></Appear></At>
      </Punch>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="setup"><SetupBody /></Span>
    <Span from="sort" to="truth"><SortBody /></Span>
    <Span from="rehook" to="cancel"><CancelBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
