// "Why your elevator always comes the wrong way": the Gamow-Stern elevator paradox.
// claim hook (wrong way 9 times in 10) -> rule out luck: as many cars pass up as down -> you're on floor 1,
// 9 floors above you -> the car spends the same time at every height -> random press: 9 in 10 it's above
// you -> a car above can only arrive going down -> re-hook: a second elevator, still 82% -> payoff: both
// directions pass equally, you meet the first one; Gamow -> CTA: friend one floor below the top.
import React from "react";
import {
  Appear, At, Bar, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- the shaft
const TOP = 10, FH = 66, Y0 = 1110;
const fy = (h: number) => Y0 - h * FH;                 // canvas y of height h (floors above the lobby)
const tri = (t: number, period = 6) => {               // nonstop up-and-down run: [height, going up?]
  const p = ((t % period) + period) % period / period;
  return p < 0.5 ? [p * 2 * TOP, true] as const : [(1 - p) * 2 * TOP, false] as const;
};
const Shaft: React.FC<{ x?: number; car?: number; up?: boolean; you?: number; shadeAbove?: number; label?: boolean; youLabel?: string }> =
  ({ x = 300, car, up, you = 1, shadeAbove = 0, label = true, youLabel = "you" }) => (
    <>
      <div style={{ position: "absolute", left: x - 60, top: fy(TOP) - 40, width: 120, height: TOP * FH + 80, borderRadius: 14,
        border: `4px solid ${C.dim}`, background: `${C.panel}aa` }} />
      {shadeAbove > 0 ? <div style={{ position: "absolute", left: x - 56, top: fy(TOP) - 36, width: 112, height: (TOP - you) * FH + 36,
        background: C.amber, opacity: 0.22 * shadeAbove, borderRadius: 10 }} /> : null}
      {Array.from({ length: TOP + 1 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: x - 90, top: fy(i), width: 30, height: 4, background: i === you ? C.amber : C.muted, opacity: i === you ? 1 : 0.6 }} />
      ))}
      {label ? <At x={x - 150} y={fy(0)}><Text size={40} color={C.muted} font={F.med}>lobby</Text></At> : null}
      {label ? <At x={x - 150} y={fy(TOP)}><Text size={40} color={C.muted} font={F.med}>top</Text></At> : null}
      {youLabel === "" ? null : <At x={x + 150} y={fy(you)}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="User" size={70} color={C.amber} />
          <Text size={44} color={C.amber}>{youLabel}</Text>
        </div>
      </At>}
      {car !== undefined ? (
        <At x={x} y={fy(car)}>
          <div style={{ width: 96, height: 60, borderRadius: 10, background: C.ink, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 20px #000a" }}>
            {up === undefined ? null : <Icon name={up ? "ArrowUp" : "ArrowDown"} size={46} color={up ? C.mint : C.coral} stroke={3} />}
          </div>
        </At>
      ) : null}
    </>
  );
const Arrows: React.FC<{ show: number; down?: number; total?: number; size?: number }> = ({ show, down = 9, total = 10, size = 70 }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, auto)", gap: 10 }}>
    {Array.from({ length: total }, (_, i) => (
      <Appear key={i} at={show + 0.06 * i} from="pop" sfx={i === 0 ? "pack/pop" : null}>
        <Icon name={i < down ? "ArrowDown" : "ArrowUp"} size={size} color={i < down ? C.coral : C.mint} stroke={3} />
      </Appear>
    ))}
  </div>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tWrong = at.word("wrong", 1, 1.0);
  const t9 = at.word("9", 1, 1.8);
  return (
    <>
      <HookText size={92}>{"Wrong way,\n**9 times in 10**"}</HookText>
      <Riser to={tWrong} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06 }]]}>
        <Shaft car={tween(t, 0, at.dur, 7.5, 5.5)} up={false} youLabel="you want ↑" />
        <At x={780} y={850}><Arrows show={0} size={78} /></At>
      </Camera>
      <Sfx name="pack/ding" at={tWrong} volume={0.4} />
      <Sfx name="pack/wrong" at={t9} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out: equal traffic both ways
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tLuck = at.word("luck.", 1, 0.8);
  const tUp = at.word("up", 1, 2.4);
  const tDown = at.word("down.", 1, 3.0);
  return (
    <>
      <Headline>Passing your floor, all day</Headline>
      <At x={540} y={500}><Appear at={0.05} out={tUp - 0.4} from="pop"><Icon name="Dice5" size={200} color={C.muted} /></Appear></At>
      <At x={540} y={700}><Appear at={tLuck - 0.2} out={tUp - 0.4} from="slam"><Stamp size={70} rotate={-5}>NOT LUCK</Stamp></Appear></At>
      <At x={330} y={800}>
        <Appear at={tUp - 0.3} from="up">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Icon name="ArrowUp" size={150} color={C.mint} stroke={3} />
            <Counter from={0} to={50} t0={tUp - 0.2} t1={tDown + 0.6} size={100} color={C.mint} />
          </div>
        </Appear>
      </At>
      <At x={750} y={800}>
        <Appear at={tDown - 0.3} from="up">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Icon name="ArrowDown" size={150} color={C.coral} stroke={3} />
            <Counter from={0} to={50} t0={tDown - 0.2} t1={tDown + 0.6} size={100} color={C.coral} sfx={false} />
          </div>
        </Appear>
      </At>
      <At x={540} y={1080}><Appear at={tDown + 0.4} from="fade"><Text size={46} color={C.muted}>cars passing you, both ways</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 3-4. you, the shaft, equal time at every height
const ShaftBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t9 = at.word("9", 1, 2.0);
  const tUp = at.word("up.", 1, 3.6);
  const tHeight = at.beat("height");
  const tRuns = at.word("runs", 1, tHeight + 0.4);
  const tSame = at.word("same", 1, tHeight + 2.6);
  const moving = t >= tRuns - 0.2;
  const [h, goingUp] = moving ? tri(t - tRuns + 0.2 + 0.6) : [5, true];
  const filled = tween(t, tSame - 0.2, tSame + 1.2, 0, 1);
  return (
    <>
      <Headline out={tHeight - 0.3}>Floor 1, 9 floors above you</Headline>
      <Headline at={tHeight} color={C.amber}>Same time at every height</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t9, { zoom: 1.03, y: 780 }], [tHeight, { zoom: 1 }]]}>
        <Shaft car={moving ? h : undefined} up={moving ? goingUp : undefined} youLabel={t >= tUp - 0.2 ? "you want ↑" : "you"} />
        <At x={160} y={(fy(TOP) + fy(1)) / 2}>
          <Appear at={t9 - 0.2} out={tHeight - 0.3} from="pop">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: (TOP - 1) * FH, background: C.amber, borderRadius: 4 }} />
            </div>
          </Appear>
        </At>
        <At x={760} y={600}><Appear at={t9 - 0.2} out={tHeight - 0.3} from="left"><Chip size={58}>9 floors above</Chip></Appear></At>
        <At x={600} y={fy(0) + 40}><Appear at={t9 + 0.3} out={tHeight - 0.3} from="left"><Chip size={44} color={C.panel} text={C.muted}>1 below</Chip></Appear></At>
        {/* time spent at each floor: equal bars */}
        <At x={760} y={(fy(TOP) + fy(0)) / 2}>
          <Appear at={tSame - 0.3} from="fade">
            <div style={{ display: "flex", flexDirection: "column", gap: FH - 40 }}>
              {Array.from({ length: TOP }, (_, i) => (
                <div key={i} style={{ width: 300 * filled, height: 40, borderRadius: 20, background: TOP - 1 - i < 1 ? C.mint : C.amber, opacity: 0.85 }} />
              ))}
            </div>
          </Appear>
        </At>
      </Camera>
      <Sfx name="pack/whoosh-mid" at={tRuns} volume={0.3} />
      <Sfx name="pack/counting-digital" at={tSame - 0.1} dur={1.2} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 5-6. press: 9 in 10 above you, so it comes down
const PressBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tPress = at.word("Press", 1, 0.2);
  const t9 = at.word("9", 1, 2.2);
  const tDown = at.beat("down");
  const tArrive = at.word("down.", 1, tDown + 2.0);
  const shade = tween(t, t9 - 0.2, t9 + 0.4, 0, 1);
  const frozen = 6.2;
  const car = t < tDown ? frozen : tween(t, tDown + 0.3, tArrive + 0.3, frozen, 1);
  return (
    <>
      <Headline out={tDown - 0.3}>Press at a random moment</Headline>
      <Headline at={tDown} color={C.coral}>Above you = coming down</Headline>
      <Shaft car={t >= tPress ? car : undefined} up={t >= tDown ? false : undefined} shadeAbove={shade} />
      <At x={780} y={520}><Appear at={tPress} from="pop" sfx="pack/click-hard"><Icon name="CircleArrowUp" size={150} color={C.ink} /></Appear></At>
      <Punch at={t9}>
        <At x={700} y={760}><Appear at={t9 - 0.1} from="slam"><Chip size={58}>above you: 9 in 10</Chip></Appear></At>
      </Punch>
      <At x={640} y={fy(0) + 5}><Appear at={t9 + 0.4} from="fade"><Text size={42} color={C.mint}>below: 1 in 10</Text></Appear></At>
      <At x={700} y={920}><Appear at={tArrive - 0.2} from="pop"><Icon name="ArrowDown" size={120} color={C.coral} stroke={3} /></Appear></At>
      <Sfx name="pack/ding" at={tArrive + 0.3} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 7. re-hook: a second elevator, still 82%
const SecondBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSecond = at.word("second", 1, 0.6);
  const t82 = at.word("82%", 1, 2.0);
  const tLot = at.word("lot", 1, 3.8);
  const tFlip = at.word("flip.", 1, 5.0);
  const [h1, u1] = tri(t + 1.1, 5);
  const [h2, u2] = tri(t + 3.7, 5);
  return (
    <>
      <Headline>Add a second elevator</Headline>
      <Shaft x={190} car={h1} up={u1} label={false} youLabel="" />
      <Sfx name="pack/pop" at={tSecond - 0.2} volume={0.45} />
      {t >= tSecond - 0.2 ? <Shaft x={400} car={h2} up={u2} label={false} youLabel="you" /> : null}
      <Punch at={t82}>
        <At x={760} y={540}>
          <Appear at={t82 - 0.2} from="slam">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Counter from={90} to={82} t0={t82 - 0.2} t1={t82 + 0.5} size={130} color={C.coral} suffix="%" />
              <Text size={44} color={C.coral}>still wrong way</Text>
            </div>
          </Appear>
        </At>
      </Punch>
      <At x={760} y={750}>
        <Appear at={tLot - 0.3} from="up">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, fontFamily: F.bold }}>
            <Text size={42} color={C.muted}>3 cars: 76%</Text>
            <Text size={42} color={C.muted}>10 cars: 55%</Text>
          </div>
        </Appear>
      </At>
      <At x={740} y={890}><Appear at={tFlip - 0.3} from="pop"><Chip size={50} color={C.mint}>coin flip: 50%</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 8. payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tFirst = at.word("first", 1, 3.0);
  const tGamow = at.word("Gamow", 1, 4.6);
  return (
    <>
      <Camera keys={[[0, { zoom: 1.04 }], [at.dur, { zoom: 1 }]]}>
        <At x={330} y={520}><Appear at={0.05} from="pop"><Icon name="ArrowUp" size={160} color={C.mint} stroke={3} /></Appear></At>
        <At x={540} y={520}><Appear at={0.2} from="pop"><Text size={110} color={C.ink}>=</Text></Appear></At>
        <At x={750} y={520}><Appear at={0.35} from="pop"><Icon name="ArrowDown" size={160} color={C.coral} stroke={3} /></Appear></At>
        <At x={540} y={760}><Appear at={tFirst - 0.2} from="slam"><Chip size={70}>you only meet the first one</Chip></Appear></At>
        <At x={540} y={1000}><Appear at={tGamow - 0.2} from="up"><Text size={50} color={C.muted}>George Gamow, office near the bottom</Text></Appear></At>
      </Camera>
      <Sfx name="reveal" at={tFirst - 0.2} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 9. CTA: friend one floor below the top (loops to the hook)
const CtaBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tTop = at.word("top.", 1, 1.6);
  const tWay = at.word("way", 1, 2.4);
  const [h, u] = tri(t + 0.4, 6);
  return (
    <>
      <Shaft car={h} up={u} you={9} youLabel="your friend" />
      <Punch at={tWay}>
        <At x={760} y={820}><Appear at={tWay - 0.2} from="pop"><Text size={110} color={C.amber} glow>↑ or ↓ ?</Text></Appear></At>
      </Punch>
      <At x={760} y={fy(9) + 110}><Appear at={tTop - 0.3} from="fade"><Text size={44} color={C.muted}>1 floor below the top</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="setup" to="height"><ShaftBody /></Span>
    <Span from="press" to="down"><PressBody /></Span>
    <Span from="second"><SecondBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
