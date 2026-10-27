// "How one letter cracked a code with 400 septillion keys": frequency analysis (Mary, Queen of Scots, 1586).
// claim hook (403 septillion keys, cracked by E) -> rule out trying keys (13 billion years) -> 1586, Mary writes in
// symbols, smuggled in a beer barrel -> the codebreaker counts symbols -> one letter in 8 is E, top symbol = E ->
// re-hook: one down, 25 to go, plus fake symbols -> a three-symbol word ending in E is THE -> letters give words ->
// payoff: a swap changes the symbols, never the counts; beheaded 1587 -> CTA subscribe if you thought more keys meant safer.
import React from "react";
import {
  Appear, At, Bar, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp,
  Text, Tiles, tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- the cipher
const SYM: Record<string, string> = { T: "▲", H: "◆", E: "●", B: "■", A: "★", R: "▼", L: "○", I: "◇", D: "△", S: "□" };
const LINES = ["THE BEER", "BARREL HIDES", "THE LETTERS"];
const NULL = "◎";
// the order the letters fall in the "THE" beat (after E): T, H, then the rest
const CASCADE = ["R", "B", "A", "L", "S", "I", "D"];

// One tile row per line; known letters show as letters (amber for E, mint for the rest), the rest as symbols.
// `mark` highlights symbols (not yet decoded) in a colour; `nulls` inserts fake symbols in coral.
const Cipher: React.FC<{ known: string[]; y?: number; size?: number; mark?: Record<string, string>; nulls?: boolean; word?: boolean }> =
  ({ known, y = 700, size = 72, mark = {}, nulls = false, word = false }) => {
    const rows = nulls ? ["THE B" + NULL + "EER", "BAR" + NULL + "REL HIDES", "THE LET" + NULL + "TERS"] : LINES;
    return (
      <At x={540} y={y}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          {rows.map((line, r) => {
            const hi: Record<number, string> = {};
            const text = line.split("").map((ch, i) => {
              if (ch === NULL) { hi[i] = C.coral; return NULL; }
              if (ch === " ") return " ";
              if (known.includes(ch)) { hi[i] = ch === "E" ? C.amber : C.mint; return ch; }
              if (mark[ch]) hi[i] = mark[ch];
              if (word && r === 0 && i < 3) hi[i] = C.mint;
              return SYM[ch];
            }).join("");
            return <Tiles key={r} text={text} size={size} hi={hi} show={-5} sfx={false} gap={8} />;
          })}
        </div>
      </At>
    );
  };

// symbol counts in the message (E 8, T 4, R 4, H 3, B 2)
const COUNTS: [string, number][] = [["E", 8], ["T", 4], ["R", 4], ["H", 3], ["B", 2]];
const Counts: React.FC<{ t0: number; y?: number; letters?: boolean; topE?: boolean }> = ({ t0, y = 440, letters = false, topE = false }) => (
  <>
    {COUNTS.map(([ch, n], i) => (
      <At key={ch} x={540} y={y + i * 105}>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <Text size={64} color={(topE || letters) && i === 0 ? C.amber : C.ink} font={F.mono} width={80}>
            {letters || (topE && i === 0) ? ch : SYM[ch]}
          </Text>
          <Bar to={n / 8} t0={t0 + i * 0.15} t1={t0 + i * 0.15 + 0.6} w={600} h={56} color={i === 0 ? C.amber : C.mint} />
          <Text size={56} color={C.ink} font={F.mono} width={70}>{n}</Text>
        </div>
      </At>
    ))}
  </>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tLetter = at.word("letter", 1, 1.6);
  return (
    <>
      <HookText size={84} y={270} out={at.dur - 0.3}>{"403 septillion keys.\nCracked by **E**."}</HookText>
      <Riser to={tLetter} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05, y: 760 }]]}>
        <Punch at={tLetter} amount={0.05}>
          <Cipher known={t >= tLetter ? ["E"] : []} y={760} mark={{ E: C.amber }} />
        </Punch>
      </Camera>
      <Sfx name="pack/access-granted" at={tLetter} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out: trying keys
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tBillion = at.word("billion", 1, 1.8);
  const tYears = at.word("13", 1, 3.0);
  return (
    <>
      <Headline>Try every key?</Headline>
      <At x={540} y={480}><Appear at={0.05} from="fade"><Text size={40} color={C.muted} font={F.mono}>26 × 25 × 24 × … × 1 =</Text></Appear></At>
      <At x={540} y={560}><Appear at={0.2} from="up"><Text size={42} color={C.ink} font={F.mono}>403,291,461,126,605,635,584,000,000</Text></Appear></At>
      <At x={540} y={760}>
        <Appear at={tBillion - 0.3} from="pop">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Icon name="Cpu" size={100} color={C.mint} />
            <Text size={52} color={C.mint}>1 billion keys a second</Text>
          </div>
        </Appear>
      </At>
      <At x={540} y={960}>
        <Appear at={tYears - 0.2} from="pop">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Icon name="Hourglass" size={110} color={C.coral} />
            <Counter from={0} to={13} t0={tYears - 0.2} t1={tYears + 0.5} size={96} color={C.coral} suffix=" billion years" />
          </div>
        </Appear>
      </At>
      <Sfx name="pack/clock-fast" at={tYears - 0.2} volume={0.3} dur={1.2} />
    </>
  );
};

// ---------------------------------------------------------------- 3. 1586: Mary writes in symbols, in a beer barrel
const SetupBody: React.FC = () => {
  const at = useAt();
  const tLocked = at.word("locked", 1, 1.8);
  const tSymbols = at.word("symbols,", 1, 4.2);
  const tBeer = at.word("beer", 1, 5.6);
  return (
    <>
      <Headline out={tSymbols - 0.3}>1586</Headline>
      <Headline at={tSymbols}>A letter in symbols</Headline>
      <At x={380} y={470}><Appear at={0.1} from="drop"><Icon name="Crown" size={140} color={C.amber} /></Appear></At>
      <At x={540} y={600}><Appear at={0.4} out={tSymbols - 0.3} from="fade"><Text size={50}>Mary, Queen of Scots</Text></Appear></At>
      <At x={700} y={470}><Appear at={tLocked - 0.2} from="slam"><Icon name="Lock" size={130} color={C.coral} /></Appear></At>
      {at.dur > 0 ? (
        <Appear at={tSymbols - 0.4} from="up">
          <Cipher known={[]} y={760} size={64} />
        </Appear>
      ) : null}
      <At x={540} y={1060}>
        <Appear at={tBeer - 0.3} from="right">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Icon name="Beer" size={100} color={C.amber} />
            <Text size={48} color={C.ink}>smuggled out in a beer barrel</Text>
          </div>
        </Appear>
      </At>
      <Sfx name="pack/writing" at={tSymbols - 0.4} volume={0.3} dur={1.2} />
      <Sfx name="pack/cork" at={tBeer} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 4-5. count the symbols; the top one is E
const CountBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCounts = at.word("counts", 1, 2.4);
  const tE = at.beat("eee");
  const tEight = at.word("eight", 1, tE + 1.0);
  const tLong = at.word("long", 1, tE + 3.0);
  const tNine = at.word("nine", 1, tE + 5.0);
  return (
    <>
      <Headline out={tE - 0.3}>Skip the keys. Count.</Headline>
      <Headline at={tE}>1 letter in 8 is an E</Headline>
      {t < tLong - 0.2 ? (
        <Camera keys={[[0, { zoom: 1 }], [tEight, { zoom: 1 }], [tEight + 0.5, { zoom: 1.12, x: 540, y: 440 }]]}>
          <Appear at={0.05} from="fade"><Counts t0={tCounts - 0.2} y={440} topE={t >= tEight - 0.2} /></Appear>
        </Camera>
      ) : (
        <>
          <Appear at={tLong - 0.2} from="fade"><Cipher known={["E"]} y={640} /></Appear>
          <At x={540} y={950}><Appear at={tNine - 0.3} from="pop"><Chip size={50}>top symbol = E, 9 times in 10</Chip></Appear></At>
        </>
      )}
      <Sfx name="pack/counting-digital" at={tCounts - 0.2} volume={0.25} dur={1.0} />
      <Sfx name="pack/ding-short" at={tEight - 0.1} volume={0.35} />
      <Sfx name="pack/correct" at={tNine - 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 6. re-hook: one down, 25 to go, and fake symbols
const ReHookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFake = at.word("fake", 1, 2.6);
  return (
    <>
      <Headline color={C.amber}>1 down, 25 to go</Headline>
      <Shake at={tFake}>
        <Cipher known={["E"]} y={660} nulls={t >= tFake - 0.2} />
      </Shake>
      <At x={540} y={1000}><Appear at={tFake} from="pop"><Chip size={48} color={C.coral}>◎ = means nothing</Chip></Appear></At>
      <Sfx name="pack/glitch" at={tFake - 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 7. THE, then the cascade
const TheBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFind = at.word("three-symbol", 1, 0.6);
  const tThe = at.word("THE.", 1, 2.6);
  const tTH = at.word("T", 1, 3.6);
  const tWords = at.word("Letters", 1, 5.0);
  const end = at.dur - 0.4;
  const known = ["E"];
  if (t >= tThe) known.push("T", "H");
  const k = Math.floor(tween(t, tWords, end, 0, CASCADE.length + 0.99));
  known.push(...CASCADE.slice(0, t >= tWords ? k : 0));
  return (
    <>
      <Headline out={tThe - 0.3}>▲◆● = ?</Headline>
      <Headline at={tThe} color={C.mint}>▲◆● = THE</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tFind, { zoom: 1 }], [tFind + 0.5, { zoom: 1.06, x: 500, y: 640 }],
        [tWords - 0.3, { zoom: 1.06, x: 500, y: 640 }], [tWords + 0.3, { zoom: 1, x: 540, y: 660 }]]}>
        <Cipher known={known} y={660} word={t >= tFind && t < tThe} />
      </Camera>
      <At x={540} y={1020}><Appear at={tTH - 0.2} from="pop"><Chip size={50} color={C.mint}>+ T, H</Chip></Appear></At>
      <Sfx name="pack/correct" at={tThe - 0.1} volume={0.3} />
      <Sfx name="pack/typewriter" at={tWords} volume={0.3} dur={Math.max(0.5, end - tWords)} />
    </>
  );
};

// ---------------------------------------------------------------- 8. payoff: a swap never changes the counts
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tNever = at.word("never", 1, 1.4);
  const tKeys = at.word("keys", 1, 3.2);
  const tMary = at.word("Mary", 1, 4.4);
  return (
    <>
      <Headline out={tMary - 0.3}>New symbols, same counts</Headline>
      <Headline at={tMary}>Beheaded, 1587</Headline>
      {t < tMary - 0.2 ? (
        <Appear at={0.05} from="fade"><Counts t0={0.1} y={390} letters={t >= tNever - 0.2} /></Appear>
      ) : (
        <At x={540} y={640}><Appear at={tMary - 0.2} from="fade"><Icon name="Crown" size={220} color={C.dim} /></Appear></At>
      )}
      {t >= tKeys - 0.2 ? (
        <At x={540} y={1000}><Appear at={tKeys - 0.2} from="slam"><Stamp size={76} color={C.amber} rotate={-5}>KEYS DIDN'T MATTER</Stamp></Appear></At>
      ) : null}
      <Sfx name="pack/hit-swell" hit={tKeys} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 9. CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const tSafer = at.word("safer.", 1, 1.8);
  return (
    <>
      <Headline>More keys = safer?</Headline>
      <Cipher known={["E", "T", "H", ...CASCADE]} y={640} />
      <Punch at={tSafer} amount={0.05}>
        <At x={540} y={980}><Text size={40} color={C.muted} font={F.mono}>403,291,461,126,605,635,584,000,000 keys</Text></At>
      </Punch>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="setup"><SetupBody /></Span>
    <Span from="count" to="eee"><CountBody /></Span>
    <Span from="rehook"><ReHookBody /></Span>
    <Span from="the"><TheBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
