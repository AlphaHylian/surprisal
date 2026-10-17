// "Stick or switch? Why switching doors wins 2 in 3": the Monty Hall problem, how-to format.
// versus hook -> rule out 50/50 (the host isn't guessing) -> 3 doors, 1 in 3 vs 2 in 3 -> host opens a goat
// -> the 2 in 3 slides onto the shut door -> re-hook: 100 doors -> 1 vs 99 -> 100,000 games -> payoff -> CTA.
import React from "react";
import {
  Appear, At, Bar, C, Camera, Chip, Counter, Emoji, F, Headline, HookText, Icon, Punch, Riser, Sfx,
  Span, Text, tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- a door
// openAt: time it swings open (shows what's behind). pick: amber frame.
const Door: React.FC<{ n?: number; w?: number; prize?: "car" | "goat"; openAt?: number; pick?: boolean; glow?: string; dim?: boolean }> =
  ({ n, w = 240, prize = "goat", openAt, pick, glow, dim }) => {
    const t = useT();
    const h = w * 1.5;
    const open = openAt === undefined ? 0 : tween(t, openAt, openAt + 0.4, 0, 1);
    const border = pick ? C.amber : glow ?? C.muted;
    return (
      <div style={{ position: "relative", width: w, height: h, borderRadius: w * 0.08, background: C.bg, border: `${Math.max(3, w * 0.025)}px solid ${border}`,
        boxShadow: pick || glow ? `0 0 30px ${border}88` : "0 20px 40px #0008", opacity: dim ? 0.45 : 1, perspective: 800 }}>
        {open > 0 ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Emoji char={prize === "car" ? "🚗" : "🐐"} size={w * 0.6} />
          </div>
        ) : null}
        <div style={{ position: "absolute", inset: 0, borderRadius: w * 0.06, background: `linear-gradient(160deg, ${C.panel}, ${C.dim})`,
          transformOrigin: "left center", transform: `rotateY(${-open * 80}deg)`, opacity: 1 - open * 0.6,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          {n !== undefined ? <Text size={w * 0.42} font={F.bold} color={pick ? C.amber : C.ink}>{n}</Text> : null}
          <div style={{ position: "absolute", right: w * 0.12, top: "52%", width: w * 0.07, height: w * 0.07, borderRadius: "50%", background: C.muted }} />
        </div>
      </div>
    );
  };

const DOOR_X = [220, 540, 860];

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tTwice = at.word("twice", 1, 1.8);
  return (
    <>
      <HookText>{"Stick or switch?\nOne wins **2×**"}</HookText>
      <Riser to={tTwice} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05 }]]}>
        <At x={DOOR_X[0]} y={760}><Appear at={0} from="pop"><Door n={1} pick /></Appear></At>
        <At x={DOOR_X[1]} y={760}><Appear at={0} from="pop"><Door n={2} glow={C.mint} /></Appear></At>
        <At x={DOOR_X[2]} y={760}><Appear at={0} from="pop"><Door n={3} openAt={0.3} /></Appear></At>
        <At x={DOOR_X[0]} y={1080}><Appear at={0} from="up"><Chip size={50}>STICK</Chip></Appear></At>
        <At x={DOOR_X[1]} y={1080}><Appear at={0} from="up"><Chip size={50} color={C.mint}>SWITCH</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/slam-metal" hit={0.4} volume={0.2} dur={0.8} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out 50/50
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCoin = at.word("coin", 1, 1.2);
  const tIsnt = at.word("isn't", 1, 2.2);
  const tHost = at.word("host", 1, 3.0);
  const strike = tween(t, tIsnt, tIsnt + 0.25, 0, 100);
  return (
    <>
      <At x={540} y={480}>
        <Appear at={tCoin - 0.2} from="pop">
          <div style={{ position: "relative" }}>
            <Text size={150} color={C.ink}>50 / 50</Text>
            <div style={{ position: "absolute", left: -10, top: "50%", width: `${strike}%`, height: 16, background: C.coral, borderRadius: 8,
              transform: "rotate(-6deg)", boxShadow: `0 0 20px ${C.coral}` }} />
          </div>
        </Appear>
      </At>
      <At x={540} y={850}>
        <Appear at={tHost - 0.2} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <Icon name="UserRound" size={170} color={C.amber} />
            <Icon name="Eye" size={130} color={C.amber} glow />
          </div>
        </Appear>
      </At>
      <At x={540} y={1090}><Appear at={tHost + 0.4} from="up"><Text size={56} color={C.amber}>the host knows</Text></Appear></At>
      <Sfx name="pack/wrong" at={tIsnt} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 3-6. three doors
const ThreeBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tPick = at.word("1", 1, 2.4);                // "You pick door 1"
  const tSplit = at.beat("split");
  const tYour = at.word("3", 1, tSplit + 1.2);       // "a 1 in 3 chance" ("Three doors" is a word, not a digit)
  const tOther = at.word("2", 1, tSplit + 3.6);      // "hold 2 in 3"
  const tHost = at.beat("host");
  const tOpen = at.word("opens", 1, tHost + 0.8);
  const tSlide = at.beat("slide");
  const tSlid = at.word("slides", 1, tSlide + 2.0);
  const tShut = at.word("shut", 1, tSlide + 3.4);
  // the 2/3 label: over doors 2+3, then slides onto door 2
  const labelX = tween(t, tSlid, tSlid + 0.6, (DOOR_X[1] + DOOR_X[2]) / 2, DOOR_X[1]);
  const bracketW = tween(t, tSlid, tSlid + 0.6, 600, 260);
  return (
    <>
      <Headline out={tSplit - 0.3}>3 doors. 1 car.</Headline>
      <Headline at={tSplit} out={tHost - 0.3} color={C.mint}>Split the chances</Headline>
      <Headline at={tHost} out={tSlide - 0.3} color={C.amber}>The host never shows the car</Headline>
      <Headline at={tSlide} color={C.mint}>The 2 in 3 moves</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tSlide, { zoom: 1 }], [tShut, { zoom: 1.06, x: 620, y: 700 }]]}>
        <At x={DOOR_X[0]} y={680}><Appear at={0.05} from="pop"><Door n={1} pick={t >= tPick} prize="goat" /></Appear></At>
        <At x={DOOR_X[1]} y={680}><Appear at={0.15} from="pop"><Door n={2} prize="car" glow={t >= tShut ? C.mint : undefined} /></Appear></At>
        <At x={DOOR_X[2]} y={680}><Appear at={0.25} from="pop"><Door n={3} prize="goat" openAt={tOpen} /></Appear></At>
        <At x={DOOR_X[0]} y={1000}>
          <Appear at={tYour - 0.1} from="slam"><Text size={80} color={C.amber} glow>1/3</Text></Appear>
        </At>
        {t >= tOther - 0.1 ? (
          <>
            <At x={labelX} y={960}>
              <Appear at={tOther - 0.1} from="up"><div style={{ width: bracketW, height: 14, borderRadius: 7, background: C.mint, boxShadow: `0 0 20px ${C.mint}` }} /></Appear>
            </At>
            <At x={labelX} y={1040}>
              <Appear at={tOther - 0.1} from="slam"><Text size={80} color={C.mint} glow>2/3</Text></Appear>
            </At>
          </>
        ) : null}
      </Camera>
      <Sfx name="pack/click-hard" at={tPick} volume={0.35} />
      <Sfx name="pack/slam-metal" hit={tOpen + 0.1} volume={0.25} dur={0.8} />
      <Sfx name="pack/whoosh-short" hit={tSlid + 0.3} volume={0.4} />
      <Sfx name="pack/ding" at={tShut} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 7-9. a hundred doors
const PICK = 23, KEPT = 71;
const HundredBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t100 = at.word("100", 1, 1.6);
  const tHundred = at.beat("hundred");
  const tPickOne = at.word("pick", 1, tHundred + 0.4);
  const tOpens = at.word("98", 1, tHundred + 1.6);
  const tWhich = at.beat("which");
  const tStick = at.word("Stick,", 1, tWhich + 0.1);
  const tSwitch = at.word("Switch,", 1, tWhich + 2.4);
  const openCount = Math.round(tween(t, tOpens, tOpens + 1.4, 0, 100));
  return (
    <>
      <Headline out={tHundred - 0.3} color={C.amber}>Make it 100 doors</Headline>
      <Headline at={tHundred} out={tWhich - 0.3}>The host opens 98</Headline>
      <Headline at={tWhich} color={C.mint}>1 vs 99</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tWhich, { zoom: 1 }]]}>
        <At x={540} y={680}>
          <Appear at={t100 - 0.2} from="pop">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 64px)", gap: 14 }}>
              {[...Array(100)].map((_, i) => {
                const isPick = i === PICK && t >= tPickOne;
                const isKept = i === KEPT && t >= tOpens + 1.4;
                const opened = i !== PICK && i !== KEPT && ((i * 37) % 100) < openCount;
                return <Door key={i} w={64} pick={isPick} glow={isKept ? C.mint : undefined} dim={opened} openAt={opened ? 0 : undefined} />;
              })}
            </div>
          </Appear>
        </At>
        <At x={300} y={1100}><Appear at={tStick} from="slam"><Chip size={56}>stick 1/100</Chip></Appear></At>
        <At x={760} y={1100}><Appear at={tSwitch} from="slam"><Chip size={56} color={C.mint}>switch 99/100</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/click-hard" at={tPickOne + 0.1} volume={0.35} />
      <Sfx name="pack/fast-forward" at={tOpens} volume={0.3} dur={1.4} />
    </>
  );
};

// ---------------------------------------------------------------- 10. 100,000 games
const SimBody: React.FC = () => {
  const at = useAt();
  const tPlay = at.word("100,000", 1, 1.6);
  const t33 = at.word("33%", 1, 3.6);
  const t67 = at.word("67%", 1, 5.0);
  return (
    <>
      <Headline color={C.amber}>Play it 100,000 times</Headline>
      <At x={540} y={460}>
        <Appear at={tPlay - 0.2} from="up"><Counter from={0} to={100000} t0={tPlay} t1={t67} size={84} color={C.ink} suffix=" games" /></Appear>
      </At>
      <At x={540} y={700}>
        <Appear at={tPlay + 0.2} from="left">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <Text size={48} color={C.amber}>stick</Text>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Bar from={0} to={0.333} t0={tPlay + 0.3} t1={t33} w={680} h={64} color={C.amber} />
              <Appear at={t33} from="pop"><Text size={60} color={C.amber}>33%</Text></Appear>
            </div>
          </div>
        </Appear>
      </At>
      <At x={540} y={950}>
        <Appear at={tPlay + 0.4} from="left">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
            <Text size={48} color={C.mint}>switch</Text>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Bar from={0} to={0.667} t0={tPlay + 0.5} t1={t67} w={680} h={64} color={C.mint} />
              <Appear at={t67} from="pop"><Text size={60} color={C.mint}>67%</Text></Appear>
            </div>
          </div>
        </Appear>
      </At>
      <Sfx name="pack/ding" at={t67} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 11-12. payoff + CTA
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tWrong = at.word("wrong.", 1, 2.4);
  const t3 = at.word("3.", 1, 4.0);
  return (
    <>
      <At x={DOOR_X[0]} y={600}><Appear at={0.05} from="fade"><Door n={1} pick prize="goat" openAt={0.2} /></Appear></At>
      <At x={DOOR_X[1]} y={600}><Appear at={0.05} from="fade"><Door n={2} prize="car" glow={C.mint} openAt={tWrong} /></Appear></At>
      <At x={DOOR_X[2]} y={600}><Appear at={0.05} from="fade"><Door n={3} prize="goat" openAt={0} dim /></Appear></At>
      <Punch at={t3}>
        <At x={540} y={1030}><Appear at={t3 - 0.1} from="slam"><Text size={100} color={C.amber} glow>wrong 2 times in 3</Text></Appear></At>
      </Punch>
      <Sfx name="pack/win" at={tWrong + 0.2} volume={0.4} />
      <Sfx name="pack/boom-short" hit={t3} volume={0.45} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const tLetters = at.word("10,000", 1, 1.4);
  const tSwitched = at.word("switched?", 1, 4.2);
  return (
    <>
      <At x={540} y={460}>
        <Appear at={0.05} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Icon name="Mail" size={110} color={C.coral} />
            <Counter from={0} to={10000} t0={tLetters - 0.4} t1={tLetters + 0.6} size={84} color={C.coral} suffix=" letters" />
          </div>
        </Appear>
      </At>
      <At x={540} y={640}><Appear at={tLetters + 0.6} from="fade"><Text size={52} color={C.muted}>most said she was wrong (1990)</Text></Appear></At>
      <At x={540} y={900}><Appear at={tSwitched - 0.6} from="up"><Text size={84}>Would you <span style={{ color: C.mint }}>switch?</span></Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="setup" to="slide"><ThreeBody /></Span>
    <Span from="rehook" to="which"><HundredBody /></Span>
    <Span from="sim"><SimBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
