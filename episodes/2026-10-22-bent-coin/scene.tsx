// "How to get a perfect 50/50 from a bent coin": von Neumann's trick.
// versus hook (fair coin vs bent coin: both 50/50) -> rule out fixing it / knowing the bias -> 70% heads,
// tails loses 7 in 10 -> flip twice -> HH/TT: throw away -> HT = heads, TH = tails -> re-hook: still loves
// heads, so how? -> 70% x 30% = 21% both orders -> cost: 42% of pairs count, about 5 flips -> payoff:
// any coin, von Neumann 1951 -> CTA checkable question (90% coin).
import React from "react";
import {
  Appear, At, Bar, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- the coin
const Coin: React.FC<{ face: "H" | "T"; size?: number; bent?: boolean; dim?: boolean }> = ({ face, size = 170, bent, dim }) => {
  const col = face === "H" ? C.amber : C.mint;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, ${col}, ${col}aa 70%)`,
      border: `${size * 0.06}px solid ${C.bg}`, boxShadow: `0 0 0 ${size * 0.03}px ${col}, 0 14px 30px #000a`,
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.bold, fontSize: size * 0.5, color: C.bg,
      transform: bent ? "perspective(400px) rotateY(32deg) skewY(-8deg)" : undefined, opacity: dim ? 0.35 : 1 }}>{face}</div>
  );
};
const Pair: React.FC<{ a: "H" | "T"; b: "H" | "T"; size?: number; dim?: boolean }> = ({ a, b, size = 120, dim }) => (
  <div style={{ display: "flex", gap: 16 }}><Coin face={a} size={size} dim={dim} /><Coin face={b} size={size} dim={dim} /></div>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFifty = at.word("both", 1, 1.6) + 0.3;
  const flip = Math.sin(t * 9);
  return (
    <>
      <HookText size={88}>{"Bent coin vs fair coin:\n**both 50/50**"}</HookText>
      <Riser to={tFifty} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.07 }]]}>
        <At x={290} y={700}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div style={{ transform: `scaleX(${Math.abs(flip) * 0.8 + 0.2})` }}><Coin face={flip > 0 ? "H" : "T"} size={230} /></div>
            <Text size={52} color={C.muted}>fair</Text>
          </div>
        </At>
        <At x={540} y={700}><Text size={70} color={C.muted}>vs</Text></At>
        <At x={790} y={700}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <Coin face="H" size={230} bent />
            <Text size={52} color={C.coral}>70% heads</Text>
          </div>
        </At>
        <Punch at={tFifty}>
          <At x={540} y={1020}><Appear at={0} from="fade"><Chip size={90}>50 / 50</Chip></Appear></At>
        </Punch>
      </Camera>
      <Sfx name="stamp" at={tFifty} volume={0.55} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFix = at.word("fix", 1, 0.5);
  const tKnow = at.word("know", 1, 1.8);
  const tBent = at.word("bent", 1, 2.6);
  const strike = tween(t, tFix + 0.3, tFix + 0.6, 0, 100);
  return (
    <>
      <At x={300} y={640}>
        <Appear at={0.05} from="left">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, position: "relative" }}>
            <Icon name="Hammer" size={200} color={C.muted} />
            <Text size={52} color={C.muted}>fix the coin</Text>
            <div style={{ position: "absolute", left: -20, top: "45%", width: `${strike * 1.1}%`, height: 14, background: C.coral, borderRadius: 7, transform: "rotate(-8deg)" }} />
          </div>
        </Appear>
      </At>
      <At x={780} y={640}>
        <Appear at={tKnow - 0.2} from="pop">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Coin face="H" size={200} bent />
            <Text size={52} color={C.amber}>{t >= tBent ? "bias: ??%" : "bias:"}</Text>
          </div>
        </Appear>
      </At>
      <At x={540} y={1000}><Appear at={tBent} from="up"><Text size={56} color={C.ink}>doesn't matter</Text></Appear></At>
      <Sfx name="error" at={tFix + 0.3} volume={0.3} />
      <Sfx name="pack/hmm" at={tBent} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 3. setup: 70% heads, tails loses 7 in 10
const SetupBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t70 = at.word("70%", 1, 1.0);
  const tTails = at.word("tails,", 1, 2.4);
  const t7 = at.word("7", 1, 3.4);
  const flips = "HHTHHHTHTH".split("") as ("H" | "T")[];
  return (
    <>
      <Headline>Your bent coin</Headline>
      <At x={540} y={560}>
        <Appear at={0.05} from="pop"><Coin face="H" size={220} bent /></Appear>
      </At>
      <At x={540} y={780}>
        <Appear at={t70 - 0.3} from="up">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <Bar to={0.7} t0={t70 - 0.2} t1={t70 + 0.5} w={820} h={56} color={C.amber} />
            <Text size={48} color={C.amber}>heads 70%</Text>
          </div>
        </Appear>
      </At>
      <At x={540} y={990}>
        <Appear at={tTails} from="up">
          <div style={{ display: "flex", gap: 8 }}>
            {flips.map((f, i) => (
              <Appear key={i} at={tTails + 0.1 * i} from="pop" sfx={i % 3 === 0 ? "pack/click-soft" : null}>
                <Coin face={f} size={70} />
              </Appear>
            ))}
          </div>
        </Appear>
      </At>
      <At x={540} y={1120}><Appear at={t7 - 0.1} from="slam"><Text size={58} color={C.coral}>call tails: lose 7 in 10</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 4-6. flip twice: the rule
const RuleBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tTwice = at.word("twice,", 1, 0.6);
  const tSame = at.beat("same");
  const tAway = at.word("away", 1, tSame + 2.0);
  const tDiffer = at.beat("differ");
  const tHeads = at.word("heads", 3, tDiffer + 1.6);
  const tTailsOut = at.word("tails", 4, tDiffer + 3.6);
  const row = ({ y, a, b, show, out, outAt, dim }: { y: number; a: "H" | "T"; b: "H" | "T"; show: number; out?: React.ReactNode; outAt?: number; dim?: number }) => (
      <>
        <At x={330} y={y}><Appear at={show} from="left"><Pair a={a} b={b} dim={dim !== undefined && t >= dim} /></Appear></At>
        {outAt !== undefined ? <At x={760} y={y}><Appear at={outAt} from="pop">{out}</Appear></At> : null}
      </>
    );
  return (
    <>
      <Headline out={tSame - 0.3}>Flip it twice</Headline>
      <Headline at={tSame} out={tDiffer - 0.3}>Same twice? Throw it away</Headline>
      <Headline at={tDiffer} color={C.amber}>Different? The first one wins</Headline>
      <Camera keys={[[0, { zoom: 1.08, y: 600 }], [tSame, { zoom: 1 }], [tDiffer + 0.5, { zoom: 1, y: 760 }]]}>
        <At x={540} y={460}><Appear at={tTwice - 0.3} out={tSame - 0.2} from="pop"><Text size={64} color={C.muted}>×2</Text></Appear></At>
        {row({ y: 560, a: "H", b: "H", show: tTwice, dim: tAway, outAt: tAway, out: <Stamp size={56} rotate={-6}>FLIP AGAIN</Stamp> })}
        {row({ y: 740, a: "T", b: "T", show: tTwice + 0.25, dim: tAway, outAt: tAway + 0.2, out: <Stamp size={56} rotate={-6}>FLIP AGAIN</Stamp> })}
        {row({ y: 920, a: "H", b: "T", show: tDiffer, outAt: tHeads - 0.2, out: <Chip size={66}>= HEADS</Chip> })}
        {row({ y: 1100, a: "T", b: "H", show: at.word("tails", 3, tDiffer + 1.6) - 0.2, outAt: tTailsOut - 0.2, out: <Chip size={66} color={C.mint}>= TAILS</Chip> })}
      </Camera>
      <Sfx name="pack/paper-crumple" at={tAway + 0.1} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 7. re-hook
const ReHookBody: React.FC = () => {
  const at = useAt();
  const tLoves = at.word("loves", 1, 0.8);
  const tFair = at.word("fair?", 1, 2.4);
  return (
    <>
      <At x={540} y={620}><Appear at={0.05} from="pop"><Coin face="H" size={280} bent /></Appear></At>
      <At x={540} y={860}><Appear at={tLoves} from="up"><Text size={60} color={C.amber}>still 70% heads</Text></Appear></At>
      <Punch at={tFair - 0.2}>
        <At x={540} y={1060}><Appear at={tFair - 0.2} from="pop" sfx="pack/suspense-sting" volume={0.45}><Text size={160} color={C.amber} glow>?</Text></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 8. why: 21% = 21%
const WhyBody: React.FC = () => {
  const at = useAt();
  const t21a = at.word("21%.", 1, 2.6);
  const tTH = at.word("tails", 2, 3.2);
  const t21b = at.word("21%.", 2, 6.4);
  const tSame = at.word("same", 1, 5.8);
  const line = ({ a, b, pa, pb, show, res }: { a: "H" | "T"; b: "H" | "T"; pa: string; pb: string; show: number; res: number }) => (
    <Appear at={show} from="left">
      <div style={{ display: "flex", alignItems: "center", gap: 22, whiteSpace: "nowrap" }}>
        <Pair a={a} b={b} size={100} />
        <Text size={60} color={C.ink}>{pa} × {pb} =</Text>
        <Appear at={res} from="pop"><Text size={68} color={C.amber} glow>21%</Text></Appear>
      </div>
    </Appear>
  );
  return (
    <>
      <Headline>Why it's fair</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tSame, { zoom: 1.08, y: 760 }]]}>
        <At x={540} y={560}>{line({ a: "H", b: "T", pa: "70%", pb: "30%", show: 0.1, res: t21a - 0.2 })}</At>
        <At x={540} y={800}>{line({ a: "T", b: "H", pa: "30%", pb: "70%", show: tTH, res: t21b - 0.2 })}</At>
        <At x={540} y={1040}><Appear at={tSame} from="slam"><Stamp size={80} color={C.mint} rotate={-4}>SAME CHANCE</Stamp></Appear></At>
      </Camera>
      <Sfx name="ding" at={t21a - 0.2} volume={0.4} />
      <Sfx name="ding" at={t21b - 0.2} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 9. cost
const CostBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t42 = at.word("42%", 1, 1.6);
  const t5 = at.word("5", 1, 4.0);
  return (
    <>
      <Headline>The price: time</Headline>
      <At x={540} y={560}>
        <Appear at={0.05} from="up">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
            <Bar to={0.42} t0={t42 - 0.3} t1={t42 + 0.4} w={820} h={60} color={C.mint} />
            <Text size={52} color={C.mint}>42% of pairs count</Text>
          </div>
        </Appear>
      </At>
      <At x={540} y={850}>
        <Appear at={t5 - 0.9} from="up">
          <div style={{ display: "flex", gap: 14 }}>
            {(["H", "H", "T", "T", "H"] as const).map((f, i) => (
              <Appear key={i} at={t5 - 0.9 + 0.15 * i} from="pop" sfx={null}><Coin face={f} size={120} /></Appear>
            ))}
          </div>
        </Appear>
      </At>
      <Punch at={t5}>
        <At x={540} y={1060}><Appear at={t5} from="slam"><Chip size={70}>≈ 5 flips per answer</Chip></Appear></At>
      </Punch>
      <Sfx name="pack/clock" at={0.1} dur={1.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 10. payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tPerfect = at.word("perfect", 1, 2.0);
  const tVon = at.word("John", 1, 3.6);
  return (
    <>
      <Camera keys={[[0, { zoom: 1.05 }], [at.dur, { zoom: 1 }]]}>
        <At x={360} y={600}><Appear at={0.05} from="pop"><Coin face="H" size={200} bent /></Appear></At>
        <At x={720} y={600}><Appear at={0.4} from="pop"><Coin face="T" size={200} bent /></Appear></At>
        <At x={540} y={830}><Appear at={tPerfect} from="slam"><Chip size={90}>50 / 50</Chip></Appear></At>
        <At x={540} y={1040}><Appear at={tVon} from="up"><Text size={52} color={C.muted}>John von Neumann, 1951</Text></Appear></At>
      </Camera>
      <Sfx name="reveal" at={tPerfect} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 11. CTA (checkable question, loops to the bent coin)
const CtaBody: React.FC = () => {
  const at = useAt();
  const t90 = at.word("90%", 1, 1.2);
  const tFlips = at.word("flips", 1, 2.8);
  return (
    <>
      <At x={540} y={560}><Appear at={0.05} from="pop"><Coin face="H" size={240} bent /></Appear></At>
      <At x={540} y={790}>
        <Appear at={t90 - 0.3} from="up">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <Bar to={0.9} t0={t90 - 0.2} t1={t90 + 0.4} w={820} h={56} color={C.amber} />
            <Text size={48} color={C.amber}>heads 90%</Text>
          </div>
        </Appear>
      </At>
      <Punch at={tFlips}>
        <At x={540} y={1050}><Appear at={tFlips - 0.2} from="pop"><Text size={84} color={C.amber} glow>How many flips?</Text></Appear></At>
      </Punch>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="setup"><SetupBody /></Span>
    <Span from="twice" to="differ"><RuleBody /></Span>
    <Span from="rehook"><ReHookBody /></Span>
    <Span from="why"><WhyBody /></Span>
    <Span from="cost"><CostBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
