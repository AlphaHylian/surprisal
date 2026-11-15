// "Why beating a stronger player earns you 29 points, not 16": the Elo update.
// versus hook (+16 vs +29) -> not bravery, surprise -> Elo since 1960, you 1500 vs 1900 -> predict: 400 gap = 10x, 1 in 11
// -> surprise 1 - 0.09 = 0.91 -> x32 = +29 / -29 -> re-hook: beat someone you should -> vs 1100: +3 / -29
// -> payoff: a rating is a prediction -> CTA: 1700 beats 1500? (8)
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// a player card: name + rating
const Player: React.FC<{ name: string; rating: React.ReactNode; color?: string; icon?: string; w?: number }> = ({ name, rating, color = C.ink, icon = "User", w = 360 }) => (
  <div style={{ width: w, padding: "22px 0", borderRadius: 28, background: "#ffffff0d", border: `4px solid ${color}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Icon name={icon} size={56} color={color} />
      <div style={{ fontFamily: F.bold, fontSize: 46, color }}>{name}</div>
    </div>
    <div style={{ fontFamily: F.mono, fontSize: 76, color: C.ink }}>{rating}</div>
  </div>
);

const Big: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = C.ink, size = 96 }) => (
  <div style={{ fontFamily: F.bold, fontSize: size, color, whiteSpace: "nowrap" }}>{children}</div>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const t29 = w(["29"], 1, 2.6);
  return (
    <>
      <HookText y={290} size={92}>{"Beat an equal: **+16**\nBeat a giant: **+29**"}</HookText>
      <Riser to={t29} volume={0.45} />
      <At x={540} y={640} style={{ width: "max-content" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <Player name="You" rating="1500" color={C.mint} w={300} />
          <Big color={C.muted} size={60}>vs</Big>
          <Player name="Equal" rating="1500" w={300} />
        </div>
      </At>
      <At x={540} y={930} style={{ width: "max-content" }}>
        <Punch at={t29}>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <Player name="You" rating="1500" color={C.mint} w={300} />
            <Big color={C.muted} size={60}>vs</Big>
            <Player name="Giant" rating="1900" color={C.amber} icon="Crown" w={300} />
          </div>
        </Punch>
      </At>
      <Sfx name="pack/ding" at={t29} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- not bravery: surprise
const RuleoutBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tBrave = w(["brave"], 1, 1.2), tSurp = w(["surprise"], 1, 3.0);
  const strike = tween(t, tBrave + 0.2, tBrave + 0.5, 0, 1);
  return (
    <>
      <Headline>Not a bravery bonus</Headline>
      <At x={540} y={560}><Appear at={0.05} from="pop">
        <div style={{ position: "relative" }}>
          <Chip color={C.coral} size={56}>bonus for being brave</Chip>
          <div style={{ position: "absolute", left: -10, top: "50%", height: 8, width: `${strike * 104}%`, background: C.ink, borderRadius: 4 }} />
        </div>
      </Appear></At>
      <At x={540} y={820}><Appear at={tSurp - 0.25} from="slam"><Text size={92} color={C.amber} glow>size of the surprise</Text></Appear></At>
      <Sfx name="pack/wrong" at={tBrave + 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- context: you 1500 vs 1900
const ContextBody: React.FC = () => {
  const w = useW();
  const tYou = w(["You're"], 1, 2.4), tThey = w(["They're"], 1, 3.6);
  return (
    <>
      <Headline>Elo, since 1960</Headline>
      <At x={540} y={450}><Appear at={0.1} from="fade" sfx={null}><Icon name="Crown" size={150} color={C.ink} /></Appear></At>
      <At x={290} y={760}><Appear at={tYou - 0.1} from="left"><Player name="You" rating="1500" color={C.mint} w={340} /></Appear></At>
      <At x={790} y={760}><Appear at={tThey - 0.1} from="right"><Player name="Them" rating="1900" color={C.amber} icon="Crown" w={340} /></Appear></At>
      <At x={540} y={1010}><Appear at={tThey + 0.4} from="up"><Chip color={C.ink} size={48}>gap: 400 points</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- step 1: predict
const PredictBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tGap = w(["400"], 1, 1.6), tTen = w(["10"], 1, 3.4), tEleven = w(["11"], 1, 6.4);
  const cells = Array.from({ length: 11 }, (_, i) => i);
  return (
    <>
      <Headline>Step 1: predict</Headline>
      <At x={540} y={430}><Appear at={tGap - 0.2} from="down"><Chip color={C.ink} size={50}>+400 points = 10× the favourite</Chip></Appear></At>
      <Camera keys={[[0, { zoom: 1 }], [tEleven - 0.3, { zoom: 1 }], [tEleven + 0.4, { zoom: 1.12, x: 540, y: 700 }]]}>
        <At x={540} y={700} style={{ width: "max-content" }}>
          <div style={{ display: "flex", gap: 10 }}>
            {cells.map((i) => {
              const on = t >= tTen - 0.2 + i * 0.07;
              const you = i === 0;
              return <div key={i} style={{ width: 74, height: 150, borderRadius: 14, background: on ? (you ? C.mint : C.amber) : "#ffffff14",
                boxShadow: on && you ? `0 0 26px ${C.mint}` : "none" }} />;
            })}
          </div>
        </At>
        <At x={136} y={835}><Appear at={tTen} from="up" sfx={null}><Text size={44} color={C.mint}>you</Text></Appear></At>
        <At x={610} y={835}><Appear at={tTen + 0.4} from="up" sfx={null}><Text size={44} color={C.amber}>them: 10</Text></Appear></At>
      </Camera>
      <At x={540} y={1040}><Appear at={tEleven - 0.2} from="slam"><Big color={C.mint} size={84}>1 in 11 = 0.09</Big></Appear></At>
      <Sfx name="pack/pop-2" at={tTen - 0.2} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- step 2: surprise
const SurpriseBody: React.FC = () => {
  const w = useW();
  const tWin = w(["win"], 1, 0.4), tHap = w(["1"], 1, 1.8), tMinus = w(["0.09"], 1, 3.6), tSurp = w(["surprise"], 1, 5.4);
  return (
    <>
      <Headline>Step 2: the surprise</Headline>
      <At x={540} y={440}><Appear at={tWin - 0.1} from="slam"><Chip color={C.mint} size={64}>You win!</Chip></Appear></At>
      <At x={540} y={700} style={{ width: "max-content" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 34 }}>
          <Appear at={tHap - 0.1} from="up"><div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Big size={120}>1</Big><Text size={40} color={C.muted}>happened</Text></div></Appear>
          <Appear at={tMinus - 0.5} from="fade" sfx={null}><Big size={120} color={C.muted}>−</Big></Appear>
          <Appear at={tMinus - 0.1} from="up"><div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Big size={120}>0.09</Big><Text size={40} color={C.muted}>predicted</Text></div></Appear>
        </div>
      </At>
      <At x={540} y={980}><Punch at={tSurp}><Appear at={tSurp - 0.3} from="slam"><Big size={110} color={C.amber}>= 0.91</Big></Appear></Punch></At>
      <Sfx name="pack/correct" at={tWin} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- step 3: times 32
const TimesBody: React.FC = () => {
  const w = useW();
  const t32 = w(["32"], 1, 0.6), tPlus = w(["Plus"], 1, 1.4), tLose = w(["lose"], 1, 2.8);
  return (
    <>
      <Headline>Step 3: times 32</Headline>
      <At x={540} y={440}><Appear at={t32 - 0.2} from="pop"><Big size={84}>0.91 × 32 = <span style={{ color: C.amber }}>29</span></Big></Appear></At>
      <At x={290} y={760}><Player name="You" color={C.mint} w={340} rating={<Counter from={1500} to={1529} t0={tPlus} t1={tPlus + 0.7} size={76} color={C.ink} comma={false} />} /></At>
      <At x={790} y={760}><Player name="Them" color={C.amber} icon="Crown" w={340} rating={<Counter from={1900} to={1871} t0={tLose} t1={tLose + 0.7} size={76} color={C.ink} comma={false} />} /></At>
      <At x={290} y={980}><Appear at={tPlus} from="up"><Big size={80} color={C.mint}>+29</Big></Appear></At>
      <At x={790} y={980}><Appear at={tLose} from="up"><Big size={80} color={C.coral}>−29</Big></Appear></At>
      <Sfx name="pack/kaching" at={tPlus + 0.2} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const w = useW();
  const tSup = w(["supposed"], 1, 1.8);
  return (
    <>
      <Headline color={C.amber}>But the easy win?</Headline>
      <At x={290} y={700}><Appear at={0.1} from="left"><Player name="You" rating="1500" color={C.mint} w={340} /></Appear></At>
      <At x={790} y={700}><Appear at={tSup - 0.3} from="right"><Player name="Them" rating="1100" icon="Baby" w={340} /></Appear></At>
      <At x={540} y={960}><Appear at={tSup + 0.1} from="pop"><Text size={110} color={C.amber} glow>?</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- step 4: down
const DownBody: React.FC = () => {
  const w = useW();
  const t3 = w(["3"], 1, 2.2), tLoss = w(["loss"], 1, 3.4), t29 = w(["29"], 1, 4.2);
  return (
    <>
      <Headline>Expected 0.91</Headline>
      <At x={540} y={460}><Appear at={0.1} from="fade" sfx={null}><Text size={46} color={C.muted}>you vs 1100</Text></Appear></At>
      <At x={300} y={720}><Appear at={t3 - 0.3} from="pop"><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <Text size={50} color={C.mint}>win</Text><Big size={150} color={C.mint}>+3</Big></div></Appear></At>
      <Shake at={t29}><At x={780} y={720}><Appear at={tLoss - 0.1} from="pop"><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <Text size={50} color={C.coral}>lose</Text><Big size={150} color={C.coral}>−29</Big></div></Appear></At></Shake>
      <At x={540} y={1000}><Appear at={t29 + 0.3} from="fade" sfx={null}><Text size={44} color={C.muted}>no surprise, no points</Text></Appear></At>
      <Sfx name="pack/wrong" at={t29} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const tPred = w(["prediction"], 1, 2.0), tWrong = w(["wrong"], 1, 4.0);
  return (
    <>
      <At x={540} y={420}><Appear at={0.05} from="fade" sfx={null}><Text size={64} color={C.muted}>your rating isn't a score</Text></Appear></At>
      <At x={540} y={640}><Punch at={tPred}><Appear at={tPred - 0.3} from="slam"><Big size={130} color={C.amber}>it's a prediction</Big></Appear></Punch></At>
      <At x={540} y={880}><Appear at={tWrong - 0.3} from="up"><Chip color={C.mint} size={54}>points move = it was wrong</Chip></Appear></At>
      <Sfx name="pack/hit-grand" at={tPred} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tBeat = w(["beat"], 1, 1.6), tHow = w(["How"], 1, 3.0);
  return (
    <>
      <At x={290} y={640}><Appear at={0.05} from="left"><Player name="You" rating="1700" color={C.mint} w={340} /></Appear></At>
      <At x={790} y={640}><Appear at={tBeat - 0.2} from="right"><Player name="Them" rating="1500" w={340} /></Appear></At>
      <At x={540} y={900}><Appear at={tHow - 0.1} from="pop"><Big size={120} color={C.amber}>+ ?</Big></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="predict"><PredictBody /></Span>
    <Span from="surprise"><SurpriseBody /></Span>
    <Span from="times"><TimesBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="down"><DownBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
