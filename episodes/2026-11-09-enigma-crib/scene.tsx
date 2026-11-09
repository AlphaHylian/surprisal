// "Enigma's one flaw: a letter never became itself": crib dragging and the bombe.
// claim hook -> not brute force (159 billion billion, 5 million years) -> Bletchley 1940 -> guess a phrase
// -> slide it, crashes rule spots out -> 2 crash, 4 left -> re-hook: pairs are clues -> bombe 17,576 / 20 min
// -> payoff: a day's work -> CTA subscribe
import React from "react";
import { Appear, At, C, Camera, Card, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT } from "../kit";

// real ciphertext from verify.py (Enigma I simulation, seed 0); the crib truly sits at offset 3
const CT = "OBISBRPGFQARBSDXIUSVJZQDOHRDRH";
const CRIB = "KEINEBESONDERENEREIGNISSE";
const CRASH: Record<number, number> = { 0: 2, 4: 10 };   // offset -> index in the crib that lands on itself
const W = 33, X0 = 540 - (CT.length * W) / 2;

const Row: React.FC<{ text: string; y: number; off?: number; color?: string; hi?: Record<number, string>; size?: number }> = ({ text, y, off = 0, color = C.ink, hi = {}, size = 42 }) => (
  <>
    {text.split("").map((ch, i) => (
      <div key={i} style={{ position: "absolute", left: X0 + (i + off) * W, top: y - 30, width: W - 3, height: 60, borderRadius: 8,
        background: hi[i] ? `${hi[i]}44` : `${C.panel}bb`, border: `2px solid ${hi[i] ?? C.dim}`, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: F.mono, fontSize: size, color: hi[i] ?? color }}>{ch}</div>
    ))}
  </>
);

// a letter going into the machine and coming out as any other letter
const Lamp: React.FC<{ ch: string; on?: boolean; color?: string }> = ({ ch, on, color = C.amber }) => (
  <div style={{ width: 150, height: 150, borderRadius: 75, border: `6px solid ${on ? color : C.dim}`, background: on ? `${color}33` : `${C.panel}ee`,
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontSize: 90, color: on ? color : C.ink, boxShadow: on ? `0 0 40px ${color}88` : "none" }}>{ch}</div>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tNever = at.word("never", 1, 1.6);
  const outs = "QWERTZUIOPSDFGHJKLYXCVBNM";
  const k = Math.floor(t * 9) % outs.length;
  return (
    <>
      <HookText>{"Enigma's flaw:\n**A** never becomes **A**"}</HookText>
      <Riser to={tNever} volume={0.45} />
      <At x={300} y={700}><Lamp ch="A" on color={C.mint} /></At>
      <At x={540} y={700}><Icon name="ArrowRight" size={120} color={C.muted} /></At>
      <At x={780} y={700}><Lamp ch={outs[k]} on /></At>
      <At x={540} y={950}><Appear at={tNever} from="slam"><Stamp size={80}>never A</Stamp></Appear></At>
      <Sfx name="pack/typewriter" at={0} volume={0.25} dur={1.6} />
    </>
  );
};

// ---------------------------------------------------------------- not brute force
const RuleBody: React.FC = () => {
  const at = useAt();
  const tSet = at.word("settings", 1, 2.4), tMil = at.word("million", 1, 3.6), tYears = at.word("years", 1, 5.6);
  return (
    <>
      <Headline>Not brute force</Headline>
      <At x={540} y={520}><Appear at={0.2} from="pop"><Text size={64} font={F.mono}>158,962,555,217,<br />826,360,000</Text></Appear></At>
      <At x={540} y={700}><Appear at={tSet - 0.2} from="up"><Text size={52} color={C.muted}>settings, new every day</Text></Appear></At>
      <At x={540} y={880}><Appear at={tMil - 0.2} from="left"><Card w={820} pad={20}><Text size={50}>1 million tries a second</Text></Card></Appear></At>
      <At x={540} style={{ width: 1000 }} y={1060}><Punch at={tYears}><Appear at={tYears - 0.3} from="slam"><Text size={90} color={C.coral} glow>5 million years</Text></Appear></Punch></At>
      <Sfx name="pack/clock-fast" at={tMil} volume={0.25} dur={1.5} />
    </>
  );
};

// ---------------------------------------------------------------- Bletchley 1940
const ContextBody: React.FC = () => {
  const at = useAt();
  const tToday = at.word("today's", 1, 2.2);
  return (
    <>
      <Headline>Bletchley Park, 1940</Headline>
      <At x={540} y={560}><Appear at={0.05} from="drop"><Card w={900} pad={26}><Text size={44} color={C.muted}>intercepted message</Text>
        <Text size={50} font={F.mono}>OBISB RPGFQ ARBSD</Text><Text size={50} font={F.mono}>XIUSV JZQDO HRDRH</Text></Card></Appear></At>
      <At x={540} y={900}><Appear at={tToday - 0.2} from="pop"><Chip color={C.amber} size={56}>today's settings = ?</Chip></Appear></At>
      <Sfx name="pack/rf-switch" at={0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- guess a phrase
const CribBody: React.FC = () => {
  const at = useAt();
  const tNothing = at.word("nothing", 1, 2.0), tGerman = at.word("German", 1, 3.6), t25 = at.word("25", 1, 4.4);
  return (
    <>
      <Headline>Guess a phrase</Headline>
      <At x={540} style={{ width: 1000 }} y={540}><Appear at={tNothing - 0.2} from="up"><Text size={72}>"nothing to report"</Text></Appear></At>
      <At x={540} y={720}><Appear at={tGerman - 0.2} from="left"><Text size={52} color={C.muted}>keine besonderen Ereignisse</Text></Appear></At>
      {/* crib row, letters appear one by one */}
      <Appear at={t25 - 0.4} from="fade" sfx={null}><Row text={CRIB} y={880} off={2.5} color={C.amber} /></Appear>
      <At x={540} y={1010}><Appear at={t25} from="pop"><Chip color={C.mint} size={50}>25 letters</Chip></Appear></At>
      <Sfx name="pack/typewriter" at={t25 - 0.4} volume={0.25} dur={1.0} />
    </>
  );
};

// ---------------------------------------------------------------- slide it; crashes
const SlideBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSlide = at.word("Slide", 1, 0.2), tLands = at.word("lands", 1, 2.4), tImp = at.word("impossible", 1, 3.8);
  const off = 0;
  const crash = t >= tLands;
  return (
    <>
      <Headline>Slide it under the message</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tLands - 0.2, { zoom: 1 }], [tLands + 0.3, { zoom: 1.5, x: 230, y: 640 }], [tImp + 0.6, { zoom: 1.5, x: 230, y: 640 }]]}>
        <Row text={CT} y={580} hi={crash ? { 2: C.coral } : {}} />
        <Appear at={tSlide - 0.1} from="up" sfx="pack/whoosh-short"><Row text={CRIB} y={680} off={off} color={C.amber} hi={crash ? { 2: C.coral } : {}} /></Appear>
        <At x={X0 + 2.5 * W} y={790}><Appear at={tLands} from="pop"><Text size={44} color={C.coral}>I on I</Text></Appear></At>
      </Camera>
      <At x={540} y={1000}><Appear at={tImp - 0.1} from="slam"><Stamp size={80}>CRASH</Stamp></Appear></At>
      <Sfx name="pack/wrong" at={tLands} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- two crash, four left
const DemoBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tTwo = at.word("two", 1, 0.6), tFour = at.word("Four", 1, 1.6);
  const step = Math.min(5, Math.max(0, Math.floor(t / 0.3)));
  return (
    <>
      <Headline>Every spot, one by one</Headline>
      <Row text={CT} y={480} />
      <Row text={CRIB} y={570} off={step} color={C.amber} hi={CRASH[step] !== undefined ? { [CRASH[step]]: C.coral } : {}} />
      {[0, 1, 2, 3, 4, 5].map((k) => {
        const bad = CRASH[k] !== undefined;
        const show = t >= k * 0.3 + 0.15;
        const lit = (bad && t >= tTwo - 0.1) || (!bad && t >= tFour - 0.1);
        return show ? (
          <At key={k} x={175 + k * 146} y={800}>
            <div style={{ width: 120, height: 150, borderRadius: 22, border: `4px solid ${lit ? (bad ? C.coral : C.mint) : C.dim}`, background: `${C.panel}dd`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: bad && lit ? 0.75 : 1 }}>
              <Text size={40} color={C.muted}>{k + 1}</Text>
              <Text size={64} color={bad ? C.coral : C.mint}>{bad ? "✗" : "✓"}</Text>
            </div>
          </At>
        ) : null;
      })}
      {[0, 1, 2, 3, 4, 5].map((k) => <Sfx key={k} name={CRASH[k] !== undefined ? "pack/wrong" : "pack/click-soft"} at={k * 0.3 + 0.15} volume={0.25} />)}
      <At x={540} y={1020}><Appear at={tFour - 0.1} from="pop"><Chip color={C.mint} size={52}>4 spots left</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- re-hook: pairs are clues
const PAIRS = [0, 1, 2, 3].map((i) => [CRIB[i], CT[3 + i]]);
const RehookBody: React.FC = () => {
  const at = useAt();
  const tPair = at.word("pair", 1, 2.0), tClue = at.word("clue", 1, 3.0);
  return (
    <>
      <Headline color={C.coral}>A spot isn't the key</Headline>
      <Row text={CT} y={480} />
      <Row text={CRIB} y={570} off={3} color={C.amber} hi={{ 0: C.mint, 1: C.mint, 2: C.mint, 3: C.mint }} />
      {PAIRS.map(([a, b], i) => (
        <At key={i} x={230 + i * 205} y={800}><Appear at={tPair - 0.2 + i * 0.15} from="pop"><Chip color={C.mint} size={54}>{a}↔{b}</Chip></Appear></At>
      ))}
      <At x={540} y={980}><Appear at={tClue - 0.1} from="up"><Text size={64} color={C.amber}>each pair = a clue</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- the bombe
const Drum: React.FC<{ x: number; y: number; speed: number; t0: number }> = ({ x, y, speed, t0 }) => {
  const t = useT();
  const a = Math.max(0, t - t0) * speed * 360;
  return (
    <At x={x} y={y}>
      <div style={{ width: 170, height: 170, borderRadius: 85, border: `6px solid ${C.mint}`, background: `${C.panel}ee`, position: "relative", transform: `rotate(${a}deg)` }}>
        {[0, 1, 2, 3, 4, 5].map((k) => <div key={k} style={{ position: "absolute", left: 79, top: 8, width: 12, height: 40, borderRadius: 6, background: k ? C.dim : C.amber,
          transformOrigin: "6px 77px", transform: `rotate(${k * 60}deg)` }} />)}
      </div>
    </At>
  );
};
const BombeBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSpun = at.word("spun", 1, 1.0), tPos = at.word("positions", 1, 3.2), tStop = at.word("stopped", 1, 4.2), t20 = at.word("20", 1, 6.4);
  const stop = t >= tStop + 0.3;
  return (
    <>
      <Headline>Turing's bombe</Headline>
      <Drum x={300} y={520} speed={stop ? 0 : 0.6} t0={tSpun - 0.3} />
      <Drum x={540} y={520} speed={stop ? 0 : 1.4} t0={tSpun - 0.3} />
      <Drum x={780} y={520} speed={stop ? 0 : 3.1} t0={tSpun - 0.3} />
      <At x={540} y={760}><Appear at={tSpun - 0.3} from="fade" sfx={null}><Counter from={0} to={17576} t0={tSpun} t1={tPos} size={110} color={C.ink} /></Appear></At>
      <At x={540} y={860}><Appear at={tPos - 0.3} from="fade" sfx={null}><Text size={46} color={C.muted}>rotor positions</Text></Appear></At>
      <At x={540} y={980}><Appear at={tStop + 0.3} from="slam"><Chip color={C.mint} size={56}>every clue fits: STOP</Chip></Appear></At>
      <At x={540} y={1110}><Appear at={t20 - 0.2} from="up"><Text size={56}>~<span style={{ color: C.amber }}>20 minutes</span> per rotor order</Text></Appear></At>
      <Sfx name="pack/gears" at={tSpun - 0.3} volume={0.3} dur={Math.max(0.5, tStop - tSpun + 0.6)} />
      <Sfx name="pack/access-granted" at={tStop + 0.3} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tDay = at.word("day's", 1, 1.4), tItself = at.word("itself", 1, 4.2);
  return (
    <>
      <Headline color={C.amber}>From years to a day</Headline>
      <At x={540} style={{ width: 1000 }} y={540}><Text size={88} color={C.coral} style={{ textDecoration: t >= tDay - 0.3 ? "line-through" : "none" }}>5 million years</Text></At>
      <At x={540} style={{ width: 1000 }} y={720}><Punch at={tDay}><Appear at={tDay - 0.2} from="slam"><Text size={110} color={C.amber} glow>a day's work</Text></Appear></Punch></At>
      <At x={540} y={960}><Appear at={tItself - 1.0} from="up"><Text size={60} font={F.mono}>A <span style={{ color: C.coral }}>≠</span> A</Text></Appear></At>
      <Sfx name="pack/boom-short" at={tDay} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const tEvery = at.word("every", 1, 1.4);
  return (
    <>
      <Headline>Would you have…</Headline>
      <At x={540} y={620}><Appear at={0.1} from="pop"><Text size={76} font={F.mono}>158,962,555,217,<br />826,360,000</Text></Appear></At>
      <At x={540} style={{ width: 1000 }} y={880}><Appear at={tEvery - 0.1} from="slam"><Text size={74} color={C.amber}>tried every setting?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="crib"><CribBody /></Span>
    <Span from="slide"><SlideBody /></Span>
    <Span from="demo"><DemoBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="bombe"><BombeBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
