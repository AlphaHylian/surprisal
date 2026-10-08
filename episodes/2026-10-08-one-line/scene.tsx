// "How to fix the slow checkout line": separate lanes vs one snake line, as a supermarket how-to.
import React from "react";
import {
  Appear, Arrow, At, Bar, C, Camera, Card, Chip, Counter, F, Headline, Icon, Punch, Riser, Sfx, Shake,
  Span, Stamp, Text, You, tween, useAt, useT,
} from "../kit";

const LX = [210, 430, 650, 870]; // lane x
const TILL_Y = 430;
const P = 54; // person dot size

/** A till with its queue of shoppers below it. `n` can be fractional while animating; `col` colours one dot. */
const Lane: React.FC<{ x: number; n: number; you?: number; slow?: boolean; idle?: boolean; dim?: number }> = ({ x, n, you, slow, idle, dim = 1 }) => (
  <>
    <At x={x} y={TILL_Y}>
      <div style={{ opacity: dim, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <Icon name="ScanBarcode" size={110} color={idle ? C.mint : C.ink} glow={idle} />
      </div>
    </At>
    {Array.from({ length: Math.ceil(n) }, (_, i) => {
      const o = Math.min(1, n - i);
      const col = i === you ? C.amber : slow && i === 0 ? C.coral : C.muted;
      return (
        <At key={i} x={x} y={TILL_Y + 110 + i * (P + 14)}>
          <div style={{ width: P, height: P, borderRadius: "50%", background: col, opacity: o * dim,
            boxShadow: i === you ? `0 0 24px ${C.amber}` : "0 6px 12px #0006" }} />
        </At>
      );
    })}
  </>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tFur = at.word("furious", 1, 1.6);
  const tSlow = at.word("slow", 1, tFur + 1.4);
  return (
    <>
      <Riser from={0} to={tSlow} volume={0.5} />
      <Shake at={tSlow}>
        <Camera keys={[[0, { zoom: 1.08 }], [tSlow, { zoom: 1 }], [at.dur, { zoom: 1.03 }]]}>
          {LX.map((x, k) => (
            <Appear key={k} at={0.05 * k} from="up" sfx={k === 0 ? undefined : null}><Lane x={x} n={[4, 6, 3, 5][k]} you={k === 1 ? 5 : undefined} /></Appear>
          ))}
          <At x={430} y={1010}><Appear at={0} from="pop"><You role="store manager" size={110} /></Appear></At>
          <At x={810} y={1000}><Appear at={tFur - 0.1} from="pop" sfx="pack/crowd-aww" volume={0.3}><Icon name="Angry" size={150} color={C.coral} glow /></Appear></At>
          <At x={430} y={760}><Appear at={tSlow - 0.1} from="slam"><Stamp size={76}>SLOW LINE</Stamp></Appear></At>
        </Camera>
      </Shake>
    </>
  );
};

// ---------------------------------------------------------------- 2-3. they're right; one slow shopper
const LinesBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFour = at.word("four", 1, 3.0);
  const tThree = at.word("three", 1, tFour + 0.8);
  const tSlowB = at.beat("slow");
  const tCheck = at.word("check", 1, tSlowB + 1.4);
  const tEmpty = at.word("empty", 1, at.dur - 0.5);
  // the race: other lanes shrink faster than yours (lane 1)
  const race = tween(t, tFour - 0.6, tThree + 0.6, 0, 1);
  const frozen = t > tSlowB;
  const ns = frozen ? [3, 5, tween(t, tSlowB, tEmpty, 2, 0), 3] : [4 - 2 * race, 6 - 1 * race, 3 - 1 * race, 5 - 2 * race];
  return (
    <>
      <Headline out={tSlowB - 0.3}>They're right</Headline>
      <Headline at={tSlowB} color={C.coral}>One slow shopper</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tSlowB, { zoom: 1 }], [tCheck, { zoom: 1.08, x: 540, y: 640 }], [at.dur, { zoom: 1.02 }]]}>
        {LX.map((x, k) => <Lane key={k} x={x} n={ns[k]} you={k === 1 ? Math.ceil(ns[1]) - 1 : undefined} slow={frozen && k === 1} idle={frozen && k === 2 && t > tEmpty - 0.2} />)}
        <At x={540} y={1020}><Appear at={tFour - 0.1} out={tSlowB - 0.3} from="pop"><Chip size={52}>fastest: 1 in 4</Chip></Appear></At>
        <At x={540} y={1120}><Appear at={tThree - 0.1} out={tSlowB - 0.3} from="pop" sfx="pack/wrong" volume={0.3}><Chip size={46} color={C.coral} text={C.ink}>another wins: 3 in 4</Chip></Appear></At>
        <At x={330} y={1060}><Appear at={tCheck - 0.2} from="drop"><Chip size={40} color={C.coral} text={C.ink}>price check</Chip></Appear></At>
        <At x={720} y={1060}><Appear at={tEmpty - 0.1} from="pop" sfx="pack/ding-short"><Chip size={40} color={C.mint}>empty</Chip></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 4. one snake line
const SNAKE = Array.from({ length: 14 }, (_, i) => {
  const row = Math.floor(i / 5), col = i % 5;
  const x = row % 2 === 0 ? 220 + col * 160 : 860 - col * 160;
  return [x, 720 + row * 110] as const;
});
const Snake: React.FC<{ n: number; shift?: number; dim?: number }> = ({ n, shift = 0, dim = 1 }) => (
  <>
    {SNAKE.slice(0, n).map(([x, y], i) => (
      <At key={i} x={x} y={y - shift}>
        <div style={{ width: P, height: P, borderRadius: "50%", background: i === n - 1 ? C.amber : C.muted, opacity: dim, boxShadow: "0 6px 12px #0006" }} />
      </At>
    ))}
  </>
);
const FixBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tTear = at.word("tear", 1, 0.4);
  const tSnake = at.word("snake", 1, 1.8);
  const tFree = at.word("free", 1, at.dur - 0.8);
  const gone = tween(t, tTear, tTear + 0.5, 1, 0);
  return (
    <>
      <Headline>One line, every till</Headline>
      {LX.map((x, k) => (
        <React.Fragment key={k}>
          <At x={x} y={TILL_Y}><Icon name="ScanBarcode" size={110} color={k === 2 && t > tFree ? C.mint : C.ink} glow={k === 2 && t > tFree} /></At>
          <At x={x} y={TILL_Y + 140}><div style={{ width: 8, height: 120 * gone, background: C.dim, borderRadius: 4 }} /></At>
        </React.Fragment>
      ))}
      <Appear at={tSnake - 0.2} from="up"><Snake n={Math.min(14, Math.floor(tween(t, tSnake - 0.2, tSnake + 0.8, 1, 14.9, (x) => x)))} /></Appear>
      <Arrow x1={220} y1={680} x2={650} y2={500} t0={tFree - 0.3} t1={tFree + 0.3} bend={120} color={C.mint} />
      <Sfx name="pack/paper-rip" at={tTear} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 5. the test
const SimBody: React.FC = () => {
  const at = useAt();
  const t4 = at.word("4", 1, 0.8);
  const t37 = at.word("37.5", 1, 2.0);
  const t2 = at.word("2", 1, t37 + 1.4);
  const tSlow = at.word("slow", 1, at.dur - 0.5);
  const row = (t0: number, icon: string, label: string, col: string = C.ink) => (
    <Appear at={t0 - 0.1} from="left">
      <div style={{ display: "flex", alignItems: "center", gap: 26, width: 760 }}>
        <Icon name={icon} size={80} color={col} />
        <Text size={56} color={col}>{label}</Text>
      </div>
    </Appear>
  );
  return (
    <>
      <Headline>Test it</Headline>
      <At x={540} y={680}>
        <Card w={900} h={640} border={C.mint}>
          {row(t4, "ScanBarcode", "4 tills")}
          {row(t37, "UserPlus", "a shopper every 37.5 s")}
          {row(t2, "Timer", "2 min each at the till")}
          {row(tSlow, "Snail", "1 in 10 is slow", C.coral)}
        </Card>
      </At>
      <Sfx name="pack/processing" at={tSlow + 0.2} dur={0.6} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 6. results: average, worst 1 in 100
const WaitsBody: React.FC = () => {
  const at = useAt();
  const tQ = at.word("quarter", 1, 1.6);
  const t26 = at.word("26", 1, tQ + 3.0);
  const t17 = at.word("17", 1, at.dur - 0.5);
  return (
    <>
      <Headline out={t26 - 1.4}>Average wait</Headline>
      <Headline at={t26 - 1.2}>Unluckiest 1 in 100</Headline>
      <At x={250} y={500}><Text size={46} font={F.med} color={C.coral}>4 lanes</Text></At>
      <At x={250} y={620}><Text size={46} font={F.med} color={C.mint}>1 line</Text></At>
      <At x={680} y={500}><Bar to={2.85 / 3.2} t0={0.1} t1={0.7} w={560} h={52} color={C.coral} /></At>
      <At x={680} y={620}><Bar to={2.17 / 3.2} t0={tQ - 0.4} t1={tQ + 0.2} w={560} h={52} color={C.mint} /></At>
      <At x={680} y={720}><Appear at={tQ} from="pop"><Chip size={46} color={C.mint}>−25%</Chip></Appear></At>
      <At x={290} y={950}><Appear at={t26 - 0.4} from="up" sfx={null}><Counter from={0} to={26} t0={t26 - 0.4} t1={t26 + 0.1} size={130} color={C.coral} suffix=" min" /></Appear></At>
      <At x={780} y={950}><Appear at={t17 - 0.1} from="slam"><Text size={130} color={C.mint} glow>17 min</Text></Appear></At>
      <At x={540} y={950}><Appear at={t17 - 0.1} from="fade"><Icon name="ArrowRight" size={80} color={C.ink} /></Appear></At>
      <Sfx name="pack/kaching" at={t17} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 7. fairness: overtaken
const FairBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tThree = at.word("three", 1, 1.6);
  const tLater = at.word("later", 1, tThree + 1.6);
  const tNobody = at.word("nobody", 1, at.dur - 0.5);
  const pass = tween(t, tLater - 0.5, tLater + 0.3, 0, 1);
  return (
    <>
      <Headline out={tNobody - 0.3}>Nearly 1 in 3 overtaken</Headline>
      <Headline at={tNobody - 0.2} color={C.mint}>One line: nobody</Headline>
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.04 }]]}>
        {[0, 1, 2].map((i) => (
          <At key={i} x={300 + i * 240} y={560}>
            <Appear at={0.1 + i * 0.15} from="pop" sfx={i === 0 ? undefined : null}>
              <Icon name="User" size={150} color={i === 2 ? C.coral : C.muted} />
            </Appear>
          </At>
        ))}
        {/* a later shopper slides past the coral one */}
        <At x={tween(t, tLater - 0.5, tLater + 0.3, 960, 640)} y={760}>
          <div style={{ opacity: pass > 0 ? 1 : 0 }}><Icon name="UserRound" size={110} color={C.ink} /></div>
        </At>
        <At x={780} y={900}><Appear at={tLater} from="pop" sfx="pack/whoosh-fast"><Chip size={42} color={C.coral} text={C.ink}>came later, served first</Chip></Appear></At>
        <At x={540} y={1070}><Appear at={tNobody - 0.1} from="slam"><Chip size={64} color={C.mint}>first come, first served</Chip></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 8. uh-oh: it looks huge
const UhOhBody: React.FC = () => {
  const at = useAt();
  const tHuge = at.word("huge", 1, 1.4);
  const tDoor = at.word("door", 1, at.dur - 0.5);
  return (
    <>
      <Headline color={C.coral}>Uh-oh: it looks huge</Headline>
      <Shake at={tHuge}>
        {LX.map((x, k) => <At key={k} x={x} y={TILL_Y}><Icon name="ScanBarcode" size={110} color={C.ink} /></At>)}
        <Snake n={14} />
        <At x={540} y={1090}><Appear at={tDoor - 0.2} from="right"><div style={{ display: "flex", alignItems: "center", gap: 20 }}><Icon name="DoorOpen" size={90} color={C.coral} /><Text size={50} color={C.coral}>walks out</Text></div></Appear></At>
      </Shake>
      <Sfx name="pack/wrong" at={tHuge} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 9. show it moving
const MovesBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t30 = at.word("30", 1, 2.4);
  const tScreen = at.word("screen", 1, at.dur - 1.4);
  // the snake steps forward one place every ~0.8 s on screen
  const step = Math.max(0, t - 0.4) / 0.8;
  const frac = step - Math.floor(step);
  const shift = tween(frac, 0, 0.3, 0, 30);
  return (
    <>
      <Headline>Show it moving</Headline>
      {LX.map((x, k) => <At key={k} x={x} y={TILL_Y}><Icon name="ScanBarcode" size={110} color={C.ink} /></At>)}
      <Snake n={14} shift={shift} dim={0.9} />
      <At x={540} y={590}><Appear at={t30 - 0.1} from="pop" sfx="pack/clock" volume={0.3}><Chip size={56}>every 30 seconds</Chip></Appear></At>
      <At x={540} y={1110}>
        <Appear at={tScreen - 0.1} from="up" sfx="pack/notify-idea">
          <div style={{ background: "#070C14", border: `4px solid ${C.mint}`, borderRadius: 18, padding: "10px 36px", fontFamily: F.mono, fontSize: 56, color: C.mint }}>NEXT: TILL 3 →</div>
        </Appear>
      </At>
    </>
  );
};

// ---------------------------------------------------------------- 10. result
const ResultBody: React.FC = () => {
  const at = useAt();
  const tShort = at.word("shorter", 1, 1.0);
  const tLanes = at.word("lanes", 1, tShort + 1.0);
  const tCut = at.word("cutting", 1, at.dur - 0.6);
  return (
    <>
      <Headline color={C.mint}>A happy checkout</Headline>
      <At x={540} y={540}><Appear at={0} from="pop" sfx="pack/kaching"><Icon name="ShoppingCart" size={220} color={C.amber} glow /></Appear></At>
      <At x={540} y={800}><Appear at={tShort - 0.1} from="up"><Chip size={52} color={C.mint}>shorter waits</Chip></Appear></At>
      <At x={540} y={910}><Appear at={tLanes - 0.2} from="up"><Chip size={52} color={C.mint}>no unlucky lanes</Chip></Appear></At>
      <At x={540} y={1020}><Appear at={tCut - 0.2} from="up" sfx="pack/win"><Chip size={52}>nobody cuts ahead</Chip></Appear></At>
      <Riser from={at.dur - 1.4} to={at.dur} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 11. reveal
const RevealBody: React.FC = () => {
  const at = useAt();
  const tErl = at.word("erlang", 1, 1.6);
  const tPhone = at.word("phone", 1, tErl + 1.6);
  const tBanks = at.word("banks", 1, at.dur - 1.6);
  return (
    <>
      <Punch at={0.05}>
        <At x={540} y={380}><Appear at={0.05} from="slam" sfx={null}><Text size={110} color={C.amber} font={F.display} glow>Queueing theory</Text></Appear></At>
        <At x={540} y={560}><Appear at={tErl - 0.1} from="up"><Text size={60} font={F.med}>Agner Erlang, 1909</Text></Appear></At>
        <At x={540} y={720}><Appear at={tPhone - 0.1} from="pop" sfx="pack/switch"><div style={{ display: "flex", gap: 20, alignItems: "center" }}><Icon name="Phone" size={100} color={C.mint} /><Text size={48} font={F.med}>Copenhagen phones</Text></div></Appear></At>
        <At x={360} y={950}><Appear at={tBanks - 0.1} from="pop"><Icon name="Landmark" size={140} color={C.ink} /></Appear></At>
        <At x={720} y={950}><Appear at={tBanks + 0.3} from="pop"><Icon name="Plane" size={140} color={C.ink} /></Appear></At>
      </Punch>
      <Sfx name="reveal" at={0.05} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 12. question
const L5 = [170, 355, 540, 725, 910];
const CtaBody: React.FC = () => {
  const at = useAt();
  const tHow = at.word("how", 1, 2.0);
  const tSub = at.word("subscribe", 1, at.dur - 1.6);
  return (
    <>
      {L5.map((x, k) => (
        <React.Fragment key={k}>
          <At x={x} y={420}><Appear at={0.05 + k * 0.08} from="up" sfx={k === 0 ? undefined : null}><Icon name="ScanBarcode" size={100} color={C.ink} /></Appear></At>
          {[0, 1, 2].map((i) => (
            <At key={i} x={x} y={530 + i * 68}><Appear at={0.2 + k * 0.08} from="fade"><div style={{ width: P, height: P, borderRadius: "50%", background: k === 2 && i === 2 ? C.amber : C.muted }} /></Appear></At>
          ))}
        </React.Fragment>
      ))}
      <At x={540} y={900}>
        <Appear at={tHow - 0.1} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}><You size={100} /><Chip size={42}>how often do you lose?</Chip></div>
        </Appear>
      </At>
      <At x={540} y={1110}><Appear at={tSub} from="fade"><Text size={40} color={C.muted} font={F.med}>two a day</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="lines" to="slow"><LinesBody /></Span>
    <Span from="fix"><FixBody /></Span>
    <Span from="sim"><SimBody /></Span>
    <Span from="waits"><WaitsBody /></Span>
    <Span from="fair"><FairBody /></Span>
    <Span from="uhoh"><UhOhBody /></Span>
    <Span from="moves"><MovesBody /></Span>
    <Span from="result"><ResultBody /></Span>
    <Span from="reveal"><RevealBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
