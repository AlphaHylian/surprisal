// "How to make a password a hacker can't crack": count the guesses; length beats symbols; dice words.
import React from "react";
import {
  Appear, At, C, Camera, Card, Chip, Counter, Emoji, F, Headline, Icon, Punch, Riser, Sfx, Shake,
  Span, Stamp, Text, Tiles, You, tween, useAt, useT,
} from "../kit";

const PW8 = "kqzmbvra";
const TS = 96; // tile size

/** Eight password slots, each with "26" (or another count) under it. */
const Slots: React.FC<{ text: string; label: string; tLabel: number; hi?: string; show?: number }> = ({ text, label, tLabel, hi, show = 0 }) => {
  const t = useT();
  const hiMap: Record<number, string> = {};
  if (hi) text.split("").forEach((_, i) => (hiMap[i] = hi));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <Tiles text={text} size={TS} show={show} stagger={0.05} hi={hiMap} />
      <div style={{ display: "flex", gap: 10 }}>
        {text.split("").map((_, i) => (
          <div key={i} style={{ width: TS, textAlign: "center", fontFamily: F.bold, fontSize: 40, color: C.amber,
            opacity: tween(t, tLabel + i * 0.06, tLabel + i * 0.06 + 0.2, 0, 1) }}>{label}</div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t100 = at.word("100", 1, 3.0);
  const tBeat = at.word("beat", 1, at.dur - 0.5);
  const dots = Math.min(8, Math.floor(tween(t, 0.1, 1.2, 0, 8, (x) => x)));
  return (
    <>
      <Riser from={0} to={t100} volume={0.5} />
      <Shake at={t100}>
        <Camera keys={[[0, { zoom: 1.08 }], [t100, { zoom: 1 }], [at.dur, { zoom: 1.04 }]]}>
          <At x={250} y={460}><Appear at={0} from="pop"><You role="new password" size={190} /></Appear></At>
          <At x={780} y={440}>
            <Appear at={0.15} from="right" dist={140}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <Icon name="Cpu" size={210} color={C.coral} glow />
                <Text size={42} font={F.med} color={C.muted}>hacker's GPU</Text>
              </div>
            </Appear>
          </At>
          <At x={540} y={780}>
            <Appear at={0} from="up">
              <Card w={760} h={130} pad={20} border={C.mint}>
                <Text size={70} font={F.mono} color={C.ink} style={{ letterSpacing: 12 }}>{"•".repeat(dots)}{dots < 8 ? "▌" : ""}</Text>
              </Card>
            </Appear>
          </At>
          <At x={540} y={1000}><Appear at={t100 - 0.1} from="slam"><Stamp size={74} rotate={-6}>100 BILLION / SEC</Stamp></Appear></At>
        </Camera>
      </Shake>
      <Sfx name="pack/hacking" at={0.3} dur={Math.max(0.5, t100 - 0.4)} volume={0.25} />
      <Sfx name="pack/whoosh-fast" hit={tBeat} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 2-3. count: 26^8, 2 seconds
const CountBody: React.FC = () => {
  const at = useAt();
  const t26 = at.word("26", 1, 2.6);
  const tLet = at.beat("letters");
  const t209 = at.word("209", 1, tLet + 2.6);
  const t2 = at.word("2", 1, at.dur - 0.8);
  return (
    <>
      <Headline out={tLet - 0.3}>Count the guesses</Headline>
      <Headline at={tLet}>26 × 26 × … 8 times</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t26, { zoom: 1.06, y: 640 }], [t209, { zoom: 1 }]]}>
        <At x={540} y={560}><Slots text={PW8} label="26" tLabel={t26} show={0.05} /></At>
        <At x={540} y={860}>
          <Appear at={t209 - 0.4} from="up" sfx={null}>
            <Counter from={0} to={209} t0={t209 - 0.4} t1={t209 + 0.2} size={96} color={C.ink} suffix=" billion" />
          </Appear>
        </At>
        <At x={540} y={1060}><Appear at={t2 - 0.1} from="slam"><Stamp size={84}>CRACKED: 2 SEC</Stamp></Appear></At>
      </Camera>
      <Sfx name="pack/access-denied" at={t2 + 0.1} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 4. symbols: 95 per spot, 18 hours
const SymbolsBody: React.FC = () => {
  const at = useAt();
  const t95 = at.word("95", 1, 3.0);
  const t66 = at.word("6.6", 1, t95 + 1.6);
  const t18 = at.word("18", 1, at.dur - 0.9);
  return (
    <>
      <Headline>Add symbols?</Headline>
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.04 }]]}>
        <At x={540} y={560}><Slots text="kQ7#bV!a" label="95" tLabel={t95} show={0.15} /></At>
        <At x={540} y={860}>
          <Appear at={t66 - 0.4} from="up" sfx={null}>
            <Counter from={0} to={6.6} t0={t66 - 0.4} t1={t66 + 0.2} size={96} decimals={1} suffix=" quadrillion" />
          </Appear>
        </At>
        <At x={540} y={1060}><Appear at={t18 - 0.1} from="pop"><Chip size={60} color={C.coral} text={C.ink}>cracked in 18 hours</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/clock-fast" at={t18 + 0.1} dur={0.8} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 5. length: 12 letters 11 days, 16 letters 14,000 years
const LengthBody: React.FC = () => {
  const at = useAt();
  const tLonger = at.word("longer", 1, 1.4);
  const t26 = at.word("26", 1, 3.6);
  const t12 = at.word("12", 1, t26 + 1.0);
  const t11 = at.word("11", 1, t12 + 0.8);
  const t16 = at.word("16", 1, t11 + 1.0);
  const t14 = at.word("14,000", 1, t16 + 0.8);
  const W8 = 8 * TS + 7 * 10, W4 = 4 * TS + 3 * 10;
  const x0 = 540 - W8 / 2;
  return (
    <>
      <Headline out={tLonger - 0.2} color={C.mint}>Better</Headline>
      <Headline at={tLonger} color={C.mint}>Make it longer</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t16, { zoom: 1 }], [t14 + 0.4, { zoom: 1.05, y: 680 }]]}>
        <At x={540} y={480}><Tiles text={PW8} size={TS} sfx={false} show={-1} /></At>
        <At x={x0 + W4 / 2} y={600}><Tiles text="tjwp" size={TS} show={t12 - 0.2} hi={{ 0: C.mint, 1: C.mint, 2: C.mint, 3: C.mint }} /></At>
        <At x={x0 + W8 - W4 / 2} y={600}><Tiles text="xdhn" size={TS} show={t16 - 0.2} hi={{ 0: C.amber, 1: C.amber, 2: C.amber, 3: C.amber }} /></At>
        <At x={540} y={740}><Appear at={t26 - 0.1} from="pop"><Chip size={52}>× 26 per letter</Chip></Appear></At>
        <At x={300} y={880}><Appear at={t12} from="up"><Text size={50} font={F.med}>12 letters</Text></Appear></At>
        <At x={300} y={960}><Appear at={t11} from="pop"><Text size={72} color={C.mint}>11 days</Text></Appear></At>
        <At x={780} y={880}><Appear at={t16} from="up"><Text size={50} font={F.med}>16 letters</Text></Appear></At>
        <At x={780} y={960}><Appear at={t14 - 0.1} from="slam" sfx={null}><Text size={72} color={C.amber} glow>14,000 years</Text></Appear></At>
      </Camera>
      <Sfx name="pack/hit-grand" at={t14 - 0.1} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 6. uh-oh: can't remember it
const UhOhBody: React.FC = () => {
  const at = useAt();
  const tRem = at.word("remembers", 1, 1.0);
  const all: Record<number, string> = {};
  for (let i = 0; i < 16; i++) all[i] = C.coral;
  return (
    <>
      <Headline color={C.coral}>Uh-oh</Headline>
      <Shake at={tRem}>
        <At x={540} y={540}><Tiles text="kqzmbvratjwpxdhn" size={TS} perRow={8} hi={all} sfx={false} show={-1} /></At>
        <At x={540} y={900}>
          <Appear at={tRem - 0.1} from="pop">
            <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
              <You size={120} />
              <Text size={110} color={C.coral}>???</Text>
            </div>
          </Appear>
        </At>
      </Shake>
      <Sfx name="pack/wrong" at={tRem} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 7. words: 7,776-word list, five dice
const WordsBody: React.FC = () => {
  const at = useAt();
  const tList = at.word("7,776", 1, 2.2);
  const tFive = at.word("five", 1, tList + 1.4);
  const tPick = at.word("pick", 1, at.dur - 0.6);
  return (
    <>
      <Headline>Use words</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tFive, { zoom: 1 }], [at.dur, { zoom: 1.05 }]]}>
        <At x={540} y={500}>
          <Appear at={tList - 0.3} from="up">
            <Card w={640} h={250} border={C.mint}>
              <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
                <Icon name="BookOpen" size={110} color={C.mint} />
                <Text size={80}>7,776 words</Text>
              </div>
            </Card>
          </Appear>
        </At>
        {[0, 1, 2, 3, 4].map((i) => (
          <At key={i} x={220 + i * 160} y={780}><Appear at={tFive + i * 0.1} from="drop" sfx={i === 0 ? "pack/wheel-spin" : null} volume={0.3}><Emoji char="🎲" size={120} /></Appear></At>
        ))}
        <At x={540} y={980}><Appear at={tPick - 0.1} from="pop" sfx="pack/ding-short"><Chip size={64} color={C.mint}>orbit</Chip></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 8. six words: 70,000 years
const WORDS = ["orbit", "cactus", "violin", "tundra", "pepper", "lagoon"];
const SixBody: React.FC = () => {
  const at = useAt();
  const t7776 = at.word("7,776", 1, 2.4);
  const tSix = at.word("six", 1, t7776 + 1.0);
  const t70 = at.word("70,000", 1, tSix + 1.2);
  const tRem = at.word("remember", 1, at.dur - 0.6);
  return (
    <>
      <Headline>Six random words</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t70, { zoom: 1 }], [t70 + 0.5, { zoom: 1.04 }]]}>
        {WORDS.map((w, i) => (
          <At key={w} x={220 + (i % 3) * 320} y={450 + Math.floor(i / 3) * 120}>
            <Appear at={i === 0 ? 0 : tSix - 0.3 + i * 0.12} from="pop" sfx={i === 0 || i === 1 ? undefined : null}><Chip size={56} color={C.mint}>{w}</Chip></Appear>
          </At>
        ))}
        <At x={540} y={730}><Appear at={t7776 - 0.1} from="up"><Text size={56} font={F.med}>× 7,776 per word</Text></Appear></At>
        <At x={540} y={900}><Appear at={t70 - 0.1} from="slam" sfx={null}><Text size={120} color={C.amber} glow>70,000 years</Text></Appear></At>
        <At x={540} y={1070}><Appear at={tRem - 0.1} from="up"><Chip size={48} color={C.mint}>easy to remember</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/boom-short" at={t70 - 0.1} volume={0.5} />
    </>
  );
};

// ---------------------------------------------------------------- 9. let the dice pick
const DiceBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tPhr = at.word("phrases", 1, 2.4);
  const tCommon = at.word("common", 1, tPhr + 0.6);
  const tRand = at.word("random", 1, at.dur - 0.6);
  const strike = (t0: number) => (
    <div style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 8, borderRadius: 4, background: C.coral,
      transform: `scaleX(${tween(t, t0, t0 + 0.25, 0, 1)})`, transformOrigin: "left" }} />
  );
  return (
    <>
      <Headline>Let the dice pick</Headline>
      <At x={540} y={470}><Appear at={0.05} from="drop"><Emoji char="🎲" size={150} /></Appear></At>
      <At x={540} y={680}>
        <Appear at={tPhr - 0.1} from="left">
          <div style={{ position: "relative" }}><Text size={58} font={F.mono} color={C.coral}>"to be or not to be"</Text>{strike(tPhr + 0.3)}</div>
        </Appear>
      </At>
      <At x={540} y={800}>
        <Appear at={tCommon - 0.1} from="right">
          <div style={{ position: "relative" }}><Text size={58} font={F.mono} color={C.coral}>123456</Text>{strike(tCommon + 0.3)}</div>
        </Appear>
      </At>
      <At x={540} y={960}><Appear at={tPhr + 0.2} from="pop" sfx="pack/glitch"><Chip size={48} color={C.coral} text={C.ink}>guessed first</Chip></Appear></At>
      <At x={540} y={1080}><Appear at={tRand - 0.1} from="up"><Chip size={52} color={C.mint}>random = last</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 10. result
const ResultBody: React.FC = () => {
  const at = useAt();
  const tRem = at.word("remember", 1, 1.6);
  const t70 = at.word("70,000", 1, at.dur - 1.0);
  return (
    <>
      <Headline color={C.mint}>Uncrackable, memorable</Headline>
      <At x={540} y={540}><Appear at={0} from="pop" sfx="pack/access-granted" volume={0.4}><Icon name="LockKeyhole" size={260} color={C.amber} glow /></Appear></At>
      <At x={540} y={810}><Appear at={tRem - 0.1} from="up"><Chip size={46} color={C.mint}>orbit cactus violin</Chip></Appear></At>
      <At x={540} y={890}><Appear at={tRem} from="up" sfx={null}><Chip size={46} color={C.mint}>tundra pepper lagoon</Chip></Appear></At>
      <At x={540} y={1030}><Appear at={t70 - 0.1} from="pop" sfx="pack/win"><Text size={80} color={C.amber}>70,000 years</Text></Appear></At>
      <Riser from={at.dur - 1.4} to={at.dur} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 11. reveal
const RevealBody: React.FC = () => {
  const at = useAt();
  const tAR = at.word("arnold", 1, 1.4);
  const tSix = at.word("six", 1, at.dur - 0.8);
  return (
    <>
      <Punch at={0.05}>
        <At x={540} y={420}><Appear at={0.05} from="slam" sfx={null}><Text size={140} color={C.amber} font={F.display} glow>Diceware</Text></Appear></At>
        {[0, 1, 2, 3, 4].map((i) => (
          <At key={i} x={240 + i * 150} y={620}><Appear at={0.25 + i * 0.08} from="pop" sfx={null}><Emoji char="🎲" size={100} /></Appear></At>
        ))}
        <At x={540} y={820}><Appear at={tAR - 0.1} from="up"><Text size={64} font={F.med}>list by Arnold Reinhold</Text></Appear></At>
        <At x={540} y={980}><Appear at={tSix - 0.1} from="pop"><Chip size={60} color={C.mint}>at least 6 words</Chip></Appear></At>
      </Punch>
      <Sfx name="reveal" at={0.05} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 12. question
const CtaBody: React.FC = () => {
  const at = useAt();
  const tTwelve = at.word("12", 1, 1.8);
  const tWhich = at.word("which", 1, at.dur - 1.2);
  return (
    <>
      <At x={290} y={520}>
        <Appear at={0.05} from="left">
          <Card w={420} h={330} border={C.mint}>
            <Text size={110} color={C.mint}>5</Text>
            <Text size={46} font={F.med}>random words</Text>
          </Card>
        </Appear>
      </At>
      <At x={790} y={520}>
        <Appear at={tTwelve - 0.1} from="right">
          <Card w={420} h={330} border={C.amber}>
            <Text size={110} color={C.amber}>12</Text>
            <Text size={46} font={F.med}>random letters</Text>
          </Card>
        </Appear>
      </At>
      <At x={540} y={520}><Appear at={tTwelve + 0.3} from="pop"><Text size={100} color={C.ink}>vs</Text></Appear></At>
      <At x={540} y={900}>
        <Appear at={tWhich - 0.1} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}><You size={100} /><Chip size={46}>which lasts longer?</Chip></div>
        </Appear>
      </At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="count" to="letters"><CountBody /></Span>
    <Span from="symbols"><SymbolsBody /></Span>
    <Span from="length"><LengthBody /></Span>
    <Span from="uhoh"><UhOhBody /></Span>
    <Span from="words"><WordsBody /></Span>
    <Span from="six"><SixBody /></Span>
    <Span from="dice"><DiceBody /></Span>
    <Span from="result"><ResultBody /></Span>
    <Span from="reveal"><RevealBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
