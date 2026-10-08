// "How zip makes files 3x smaller": the reference episode. Structure (docs/STYLE.md, "Script structure"):
// question hook -> supporting hook that rules out the obvious answer -> steps -> re-hook -> steps
// -> short payoff -> call to action tied to the ruled-out guess.
import React from "react";
import {
  Appear, Arrow, At, Bar, Bits, C, Camera, Card, Chip, Counter, Emoji, F, Headline, Icon, Punch, Sfx, Shake,
  HookText, Riser, Span, Stamp, Terminal, Text, Tiles, TypeOn, You, tween, useAt, useT,
} from "../kit";

// Letter tiles for "to be or not to be" in two rows of 9, centred at (540, TY).
const TS = 96, TG = 10, PER = 9, TY = 600;
const tileX = (i: number) => 540 - (PER * TS + (PER - 1) * TG) / 2 + (i % PER) * (TS + TG) + TS / 2;
const tileY = (i: number) => TY - (2 * TS * 1.12 + TG) / 2 + Math.floor(i / PER) * (TS * 1.12 + TG) + (TS * 1.12) / 2;

const FREQ: [string, number][] = [["e", 12.7], ["t", 9.1], ["a", 8.2], ["o", 7.5], ["i", 7.0], ["n", 6.7], ["s", 6.3], ["h", 6.1], ["r", 6.0],
  ["d", 4.3], ["l", 4.0], ["c", 2.8], ["u", 2.8], ["m", 2.4], ["w", 2.4], ["f", 2.2], ["g", 2.0], ["y", 2.0], ["p", 1.9], ["b", 1.5],
  ["v", 0.98], ["k", 0.77], ["j", 0.16], ["x", 0.15], ["q", 0.12], ["z", 0.074]];

// ---------------------------------------------------------------- 1. hook + supporting hook
const HookBody: React.FC = () => {
  // Frame 1 is the thumbnail: the question in big words and the file it's about, fully drawn.
  const at = useAt();
  const tThird = at.word("smaller", 1, 1.6);
  return (
    <>
      <HookText>{"How does **zip** make\nfiles **3x smaller**?"}</HookText>
      <Riser to={tThird} volume={0.5} />
      <Camera keys={[[0, { zoom: 1.04 }], [at.dur, { zoom: 1.12 }]]}>
        <At x={360} y={760}>
          <Appear at={0} from="pop">
            <Card w={420} h={430} border={C.coral}>
              <Icon name="FileText" size={150} color={C.ink} />
              <Text size={42} font={F.mono}>notes.txt</Text>
              <Counter from={48} to={16} t0={tThird} t1={tThird + 0.6} size={92} color={C.coral} suffix=" MB" />
            </Card>
          </Appear>
        </At>
        <At x={800} y={760}><Appear at={0} from="pop"><Icon name="FileArchive" size={230} color={C.amber} glow stroke={1.6} /></Appear></At>
        <At x={540} y={1090}><Appear at={tThird + 0.6} from="slam"><Chip color={C.mint} size={44}>every letter still there</Chip></Appear></At>
      </Camera>
    </>
  );
};

const RuleOutBody: React.FC = () => {
  // Say what the viewer is thinking and cross it out, then tease.
  const at = useAt();
  const tSqueeze = at.word("squeeze", 1, 0.5);
  const tThrow = at.word("throw", 1, 1.6);
  const tSneaky = at.word("sneakier", 1, 3.0);
  const Out: React.FC<{ t: number; children: string }> = ({ t, children }) => (
    <div style={{ position: "relative" }}>
      <Chip color={C.panel} text={C.ink} size={74}>{children}</Chip>
      <div style={{ position: "absolute", left: 0, right: 0, top: "50%" }}>
        <Appear at={t + 0.45} from="slam"><div style={{ height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-4deg)", boxShadow: `0 0 20px ${C.coral}` }} /></Appear>
      </div>
    </div>
  );
  return (
    <>
      <At y={430}><Appear at={0.05} from="left"><Out t={tSqueeze}>squeeze the letters</Out></Appear></At>
      <At y={640}><Appear at={Math.min(tThrow, 0.5)} from="right"><Out t={tThrow}>throw data away</Out></Appear></At>
      <Punch at={tSneaky}>
        <At y={900}><Appear at={tSneaky} from="pop" sfx="pack/suspense-sting" volume={0.45}><Text size={200} color={C.amber} glow>?</Text></Appear></At>
      </Punch>
      <Sfx name="pack/whoosh-short" at={at.dur - 0.3} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 2. repeats -> notes -> bits
const RepeatsBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSecond = at.word("second", 1, 2.6);
  const tFirst = at.word("in", 1, 1.4);
  const tDelete = at.word("deletes", 1, at.beat("note") + 0.3);
  const tNote = at.word("note", 1, tDelete + 0.8);
  const tBits = at.beat("bits");
  const deleted = t >= tDelete + 0.15;
  const hi: Record<number, string> = {};
  if (t >= tFirst + 0.2) [0, 1, 2, 3, 4].forEach((i) => (hi[i] = C.mint));
  if (t >= tSecond && !deleted) [13, 14, 15, 16, 17].forEach((i) => (hi[i] = C.amber));
  const lift = tween(t, tBits - 0.1, tBits + 0.4, 0, -70);
  return (
    <>
      <Headline out={at.beat("note") - 0.3}>Find what repeats</Headline>
      <Headline at={at.beat("note")} out={tBits - 0.3} color={C.amber}>Leave a note</Headline>
      <Headline at={tBits} color={C.mint}>Count the bits</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tSecond, { zoom: 1.12, x: 540, y: 640 }], [tNote, { zoom: 1.12, x: 540, y: 640 }], [tBits, { zoom: 1 }]]}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${lift}px)` }}>
          <At x={540} y={TY}><Tiles text={"to be or not to be"} size={TS} gap={TG} perRow={PER} show={0.05} stagger={0.03} hi={hi} hide={deleted ? [13, 14, 15, 16, 17] : []} /></At>
          <At x={(tileX(13) + tileX(17)) / 2} y={tileY(13)}>
            <Appear at={tNote} from="slam"><Chip size={44}>back 13, copy 5</Chip></Appear>
          </At>
          {t >= tNote + 0.2 ? <Arrow x1={tileX(14)} y1={tileY(13) - 70} x2={tileX(2)} y2={tileY(0) - 64} t0={tNote + 0.2} t1={tNote + 0.8} bend={80} /> : null}
        </div>
        <At x={540} y={900}>
          <Appear at={tBits + 0.15} from="up">
            <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <Text size={44} font={F.mono} color={C.amber}>"to be"</Text>
                <Bits n={40} t0={tBits + 0.2} t1={tBits + 1.3} color={C.amber} size={22} perRow={20} />
                <Counter from={0} to={40} t0={tBits + 0.2} t1={tBits + 1.3} size={56} color={C.amber} suffix=" bits" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <Text size={44} font={F.mono} color={C.mint}>note</Text>
                <Bits n={14} t0={at.word("14", 1, tBits + 1.8)} t1={at.word("14", 1, tBits + 1.8) + 0.5} color={C.mint} size={22} perRow={20} />
                <Counter from={0} to={14} t0={at.word("14", 1, tBits + 1.8)} t1={at.word("14", 1, tBits + 1.8) + 0.5} size={56} color={C.mint} suffix=" bits" />
              </div>
            </div>
          </Appear>
        </At>
      </Camera>
      <Sfx name="pop" at={tFirst + 0.2} volume={0.4} />
      <Sfx name="ding" at={tSecond} volume={0.45} />
      <Sfx name="swoosh" at={tDelete + 0.1} />
      <Sfx name="ding" at={at.word("14", 1, tBits + 1.8) + 0.5} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 3. re-hook
const ALPHA = "abcdefghijklmnopqrstuvwxyz";
const RehookBody: React.FC = () => {
  const at = useAt();
  const tAlpha = at.word("alphabet", 1, 2.2);
  return (
    <>
      <Headline color={C.amber}>The big trick</Headline>
      <At y={720}><Tiles text={ALPHA} size={88} gap={10} perRow={7} show={0.05} stagger={0.05} /></At>
      <At y={1080}><Appear at={tAlpha + 0.3} from="up"><Text size={50} color={C.muted}>every letter costs 8 bits</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 4. common letters get short codes
const CodesBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCodes = at.beat("codes");
  const tE = at.word("e", 2, tCodes + 1.6);
  const tZ = at.word("z", 2, tE + 0.8);
  const tCheap = at.word("cheap", 1, tZ + 1.0);
  const chartOut = tween(t, tCodes - 0.2, tCodes + 0.3, 1, 0);
  const maxH = 520;
  return (
    <>
      <Headline out={tCodes - 0.3}>Some letters are just common</Headline>
      <Headline at={tCodes} color={C.mint}>Short codes for common letters</Headline>
      {chartOut > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: chartOut }}>
          <At x={540} y={700}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: maxH + 60 }}>
              {FREQ.map(([ch, f], i) => {
                const h = tween(t, 0.2 + i * 0.03, 0.8 + i * 0.03, 4, (f / 12.7) * maxH);
                const col = ch === "e" ? C.amber : ch === "z" ? C.coral : C.mint;
                return (
                  <div key={ch} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 26, height: h, borderRadius: 6, background: col, opacity: ch === "e" || ch === "z" ? 1 : 0.55, boxShadow: ch === "e" ? `0 0 20px ${C.amber}88` : "none" }} />
                    <span style={{ fontFamily: F.mono, fontSize: 26, color: col }}>{ch}</span>
                  </div>
                );
              })}
            </div>
          </At>
          <At x={300} y={300}><Appear at={at.word("172", 1, 3)} from="pop"><Chip size={54}>e: 12.7%</Chip></Appear></At>
          <At x={830} y={900}><Appear at={at.word("172", 1, 3) + 0.3} from="pop"><Chip size={40} color={C.coral}>z: 0.074%</Chip></Appear></At>
          <At x={720} y={420}><Appear at={at.word("172", 1, 3) + 0.4} from="slam"><Text size={110} color={C.amber} glow>172×</Text></Appear></At>
        </div>
      ) : null}
      <At x={540} y={480}>
        <Appear at={tCodes + 0.1} out={tE - 0.3} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Text size={56}>every letter</Text><Bits n={8} t0={tCodes + 0.1} t1={tCodes + 0.5} size={40} color={C.muted} /><Text size={56} color={C.muted}>8 bits</Text>
          </div>
        </Appear>
      </At>
      <At x={540} y={560}>
        <Appear at={tE} from="left">
          <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
            <Text size={110} font={F.mono} color={C.amber}>e</Text>
            <Tiles text="100" size={86} hi={{ 0: C.amber, 1: C.amber, 2: C.amber }} show={tE} stagger={0.06} />
            <Text size={52} color={C.amber}>3 bits</Text>
          </div>
        </Appear>
      </At>
      <At x={540} y={760}>
        <Appear at={tZ} from="left">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Text size={90} font={F.mono} color={C.coral}>z</Text>
            <Tiles text="001011000" size={70} gap={6} hi={Object.fromEntries([...Array(9)].map((_, i) => [i, C.coral]))} show={tZ} stagger={0.04} />
          </div>
        </Appear>
      </At>
      <At x={540} y={940}>
        <Appear at={tCheap} from="up">
          <div style={{ display: "flex", gap: 30 }}><Chip color={C.mint}>common = cheap</Chip><Chip color={C.coral}>rare = expensive</Chip></div>
        </Appear>
      </At>
      <At x={540} y={1060}><Appear at={tCheap + 0.6} from="fade"><Text size={44} color={C.muted}>average: 4.2 bits instead of 8</Text></Appear></At>
      <Sfx name="swoosh" at={0.1} volume={0.4} />
      <Sfx name="whoosh" at={tCodes - 0.1} volume={0.4} />
      <Sfx name="ding" at={tCheap} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 5. the code table rides along
const TableBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tTable = at.beat("table");
  const tRebuild = at.word("rebuild", 1, tTable + 2.2);
  return (
    <>
      <Headline color={C.mint}>Code table on top</Headline>
      <>
        <At x={600} y={820}>
          {t < tRebuild ? (
            <Terminal title="notes.txt" lines={["10011101011000101", "1110110100100010111", "0100011101101..."]} size={42} w={760} typeAt={0} cps={90} color={C.coral} />
          ) : (
            <Card w={760} h={280} border={C.mint}><TypeOn text="to be or not to be" t0={tRebuild} t1={tRebuild + 0.9} size={58} color={C.mint} /></Card>
          )}
        </At>
        <At x={540} y={460}>
          <Appear at={tTable + 0.2} from="drop">
            <Card w={520} pad={22} border={C.amber}>
              <Text size={34} color={C.amber}>CODE TABLE</Text>
              <Text size={38} font={F.mono}>t 000 · e 100</Text>
              <Text size={38} font={F.mono}>o 1101 · a 1110 …</Text>
            </Card>
          </Appear>
        </At>
        <At x={900} y={1000}><Appear at={tRebuild + 0.9} from="pop"><Icon name="CircleCheck" size={110} color={C.mint} glow /></Appear></At>
      </>
      <Sfx name="ding" at={tRebuild + 0.9} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 6. payoff + call to action
const ResultBody: React.FC = () => {
  const at = useAt();
  const tThird = at.word("third", 1, 1.6);
  return (
    <>
      <Punch at={tThird}>
        <At x={540} y={430}><Appear at={0} from="pop"><Icon name="FileArchive" size={260} color={C.amber} glow stroke={1.6} /></Appear></At>
        <At x={540} y={790}>
          <Appear at={0.1} from="up"><Card w={600} h={300} border={C.mint}>
            <Counter from={48} to={16} t0={tThird - 0.5} t1={tThird} size={120} color={C.mint} suffix=" MB" />
            <Bar from={1} to={0.34} t0={tThird - 0.5} t1={tThird} w={460} h={36} />
          </Card></Appear>
        </At>
      </Punch>
      <At x={540} y={1060}><Appear at={at.word("lost", 1, 3)} from="slam"><Chip color={C.mint} size={54}>0 letters lost</Chip></Appear></At>
      <Sfx name="pack/boom-short" hit={tThird} volume={0.55} />
    </>
  );
};

const CtaBody: React.FC = () => {
  // Calls back to the guess the supporting hook ruled out (and loops to the opening question).
  const at = useAt();
  const tSqueezed = at.word("squeezed", 1, 1.4);
  return (
    <>
      <At y={560}><Appear at={0} from="up"><Text size={76}>Subscribe if you thought</Text></Appear></At>
      <At y={720}>
        <Appear at={tSqueezed - 0.3} from="pop">
          <div style={{ position: "relative" }}>
            <Chip color={C.panel} text={C.ink} size={66}>it just squeezed the letters</Chip>
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-4deg)" }} />
          </div>
        </Appear>
      </At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="repeat" to="bits"><RepeatsBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="common" to="codes"><CodesBody /></Span>
    <Span from="table"><TableBody /></Span>
    <Span from="result"><ResultBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
