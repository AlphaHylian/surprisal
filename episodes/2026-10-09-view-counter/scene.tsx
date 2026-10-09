// "Why YouTube's view counter had a limit of 2,147,483,647". Question hook -> rule out "computers
// can't count that high" -> 32 switches -> doubling -> sign bit -> the max -> re-hook (+1 view) ->
// every switch flips -> Gangnam Style, 2014 -> 64 bits -> payoff -> CTA tied to the ruled-out guess.
import React from "react";
import {
  Appear, At, C, Camera, Card, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Text,
  tween, useAt, useT,
} from "../kit";

/** A grid of on/off switches. `bits` is a string of 0/1; index 0 is the first (sign) switch. */
const Switches: React.FC<{ bits: string; size?: number; perRow?: number; sign?: boolean; t0?: number; dimFrom?: number }> =
  ({ bits, size = 52, perRow = 16, sign = false, t0 = 0, dimFrom }) => {
    const t = useT();
    return (
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${perRow}, ${size}px)`, gap: size * 0.18 }}>
        {bits.split("").map((b, i) => {
          const show = t >= t0 + i * 0.015;
          const on = b === "1";
          const isSign = sign && i === 0;
          const col = isSign ? C.coral : C.mint;
          const dim = dimFrom !== undefined && i >= dimFrom;
          return (
            <div key={i} style={{ width: size, height: size * 1.3, borderRadius: size * 0.2, opacity: show ? (dim ? 0.25 : 1) : 0,
              background: on ? col : C.dim, border: `3px solid ${isSign ? C.coral : on ? col : C.muted + "55"}`,
              boxShadow: on ? `0 0 14px ${col}99` : "none", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: F.mono, fontSize: size * 0.55, color: on ? C.bg : C.muted }}>{isSign ? (on ? "−" : "+") : b}</div>
          );
        })}
      </div>
    );
  };

const ones = (n: number, total: number) => "0".repeat(total - n) + "1".repeat(n);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCount = at.word("count", 1, 2.0);
  // the counter ticks up toward the limit from frame 1
  const v = Math.round(tween(t, 0, at.dur, 2147483000, 2147483647, (x) => x));
  return (
    <>
      <HookText>{"YouTube's view limit:\n**2,147,483,647**"}</HookText>
      <Riser to={tCount} volume={0.5} />
      <Camera keys={[[0, { zoom: 1.0 }], [at.dur, { zoom: 1.08 }]]}>
        <At x={540} y={790}>
          <Appear at={0} from="pop">
            <Card w={860} h={480} border={C.coral}>
              <Icon name="MonitorPlay" size={190} color={C.ink} stroke={1.6} />
              <Text size={78} font={F.mono} color={C.amber} style={{ fontVariantNumeric: "tabular-nums" }}>{v.toLocaleString("en-US")}</Text>
              <Text size={46} color={C.muted}>views</Text>
            </Card>
          </Appear>
        </At>
      </Camera>
      <Sfx name="pack/counting-digital" at={0.05} dur={at.dur} volume={0.2} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tHigh = at.word("high", 1, 1.0);
  const tSwitches = at.word("switches", 1, 3.6);
  return (
    <>
      <At y={430}>
        <Appear at={0.02} from="left">
          <div style={{ position: "relative" }}>
            <Chip color={C.panel} text={C.ink} size={54}>computers can't count that high</Chip>
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%" }}>
              <Appear at={tHigh + 0.2} from="slam"><div style={{ height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-3deg)", boxShadow: `0 0 20px ${C.coral}` }} /></Appear>
            </div>
          </div>
        </Appear>
      </At>
      <Punch at={tSwitches}>
        <At x={540} y={800}><Appear at={tSwitches - 0.5} from="up"><Switches bits={"0".repeat(8)} size={90} perRow={8} t0={tSwitches - 0.5} /></Appear></At>
        <At x={540} y={1040}><Appear at={tSwitches} from="pop" sfx="pack/suspense-sting" volume={0.4}><Chip size={56}>a fixed number of switches</Chip></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 3. 32 switches, doubling, sign, max
const BitsBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tDouble = at.beat("double");
  const t10 = at.word("1,023", 1, tDouble + 2.8);
  const t20 = at.word("20", 1, tDouble + 4.0);
  const tSign = at.beat("sign");
  const tMinus = at.word("minus", 1, tSign + 1.8);
  const t31 = at.word("31", 1, tSign + 3.0);
  const tMax = at.beat("max");
  const tTop = at.word("top", 1, tMax + 1.0);
  // which switches are on
  let bits = "0".repeat(32);
  let nOn = 0;
  if (t >= tDouble + 0.4 && t < t20 - 0.3) nOn = Math.min(10, Math.floor(tween(t, tDouble + 0.4, t10 - 0.2, 0, 10, (x) => x)));
  if (t >= t20 - 0.3 && t < tSign) nOn = Math.min(20, 10 + Math.floor(tween(t, t20 - 0.3, t20 + 0.4, 0, 10, (x) => x)));
  if (t >= tMax) nOn = Math.min(31, Math.floor(tween(t, tMax, tTop + 0.3, 0, 31, (x) => x)));
  bits = ones(nOn, 32);
  const showSign = t >= tMinus - 0.1;
  const count = 2 ** nOn - 1;
  return (
    <>
      <Headline out={tDouble - 0.3}>32 switches</Headline>
      <Headline at={tDouble} out={tSign - 0.3} color={C.mint}>Each one doubles</Headline>
      <Headline at={tSign} out={tMax - 0.3} color={C.coral}>One is the sign</Headline>
      <Headline at={tMax} color={C.amber}>The limit</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tMinus - 0.2, { zoom: 1 }], [tMinus + 0.3, { zoom: 1.5, x: 210, y: 600 }], [t31 - 0.2, { zoom: 1.5, x: 210, y: 600 }], [t31 + 0.3, { zoom: 1 }]]}>
        <At x={540} y={600}><Switches bits={bits} size={50} perRow={16} sign={showSign} t0={0.05} /></At>
      </Camera>
      <At x={540} y={360}><Appear at={0.3} out={tDouble - 0.2} from="up"><Text size={50} color={C.muted}>on or off: 1 or 0</Text></Appear></At>
      <At x={540} y={900}>
        <Appear at={tDouble + 0.4} out={tSign - 0.2} from="up">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Text size={130} color={C.mint} font={F.mono} style={{ fontVariantNumeric: "tabular-nums" }}>{count.toLocaleString("en-US")}</Text>
            <Text size={46} color={C.muted}>{nOn} switches on</Text>
          </div>
        </Appear>
      </At>
      <At x={540} y={900}><Appear at={t31} out={tMax - 0.2} from="pop"><Chip color={C.mint} size={60}>31 left for the count</Chip></Appear></At>
      <Punch at={tTop + 0.3}>
        <At x={540} y={920}>
          <Appear at={tMax + 0.1} from="up">
            <Text size={104} color={C.amber} font={F.mono} glow style={{ fontVariantNumeric: "tabular-nums" }}>{count.toLocaleString("en-US")}</Text>
          </Appear>
        </At>
      </Punch>
      <Sfx name="ding" at={t10} volume={0.35} />
      <Sfx name="ding" at={t20 + 0.4} volume={0.35} />
      <Sfx name="pack/hit-low" at={tMinus} volume={0.4} />
      <Sfx name="pack/counting-digital" at={tMax} dur={tTop + 0.3 - tMax} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 4. re-hook + overflow
const FlipBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFlip = at.beat("flip");
  const tFlips = at.word("flips", 1, tFlip + 0.8);
  const tSignOn = at.word("sign", 1, tFlip + 1.4);
  const tReads = at.word("reads", 1, tFlip + 2.6);
  const flipped = t >= tFlips;
  const bits = flipped ? "1" + "0".repeat(31) : "0" + "1".repeat(31);
  return (
    <>
      <Headline out={tFlip - 0.3} color={C.amber}>One more view</Headline>
      <Headline at={tFlip} color={C.coral}>Overflow</Headline>
      <Shake at={tFlips}>
        <At x={540} y={600}><Switches bits={bits} size={50} perRow={16} sign t0={-1} /></At>
        <At x={540} y={880}>
          {!flipped ? (
            <Text size={104} color={C.amber} font={F.mono} style={{ fontVariantNumeric: "tabular-nums" }}>2,147,483,647</Text>
          ) : null}
        </At>
        <At x={540} y={1060}><Appear at={0.3} out={tFlip - 0.2} from="pop"><Chip color={C.mint} size={70}>+1 view</Chip></Appear></At>
        <At x={540} y={880}><Appear at={tReads - 0.1} from="slam"><Text size={98} color={C.coral} font={F.mono} glow>−2,147,483,648</Text></Appear></At>
        <At x={540} y={1060}><Appear at={tSignOn} out={tReads - 0.3} from="up"><Chip color={C.coral} size={54}>sign switch: ON</Chip></Appear></At>
      </Shake>
      <Sfx name="pack/glitch" hit={tFlips} volume={0.5} />
      <Sfx name="error" at={tReads} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 5. Gangnam Style + the fix
const FixBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tPassed = at.word("passed", 1, 1.8);
  const tFix = at.beat("fix");
  const t64 = at.word("64", 1, tFix + 2.0);
  const tQ = at.word("9.2", 1, tFix + 3.6);
  const v = Math.round(tween(t, 0.2, tPassed + 0.3, 2147400000, 2147483647, (x) => x));
  const bits64 = "0" + "1".repeat(Math.min(63, Math.floor(tween(t, t64, t64 + 0.8, 0, 63, (x) => x)))).padStart(63, "0");
  return (
    <>
      <Headline out={tFix - 0.3}>December 2014</Headline>
      <Headline at={tFix} color={C.mint}>64 switches</Headline>
      <At x={540} y={640}>
        <Appear at={0.05} out={tFix - 0.2} from="pop">
          <Card w={860} h={440} border={C.amber}>
            <Icon name="Music" size={150} color={C.amber} glow />
            <Text size={60}>Gangnam Style</Text>
            <Text size={72} font={F.mono} color={t >= tPassed ? C.coral : C.ink} style={{ fontVariantNumeric: "tabular-nums" }}>{v.toLocaleString("en-US")}</Text>
          </Card>
        </Appear>
      </At>
      {t >= tFix ? (
        <Camera keys={[[tFix, { zoom: 1 }], [tQ, { zoom: 1.04 }]]}>
          <At x={540} y={600}><Switches bits={bits64} size={46} perRow={16} sign t0={tFix} /></At>
          <At x={540} y={960}>
            <Appear at={tQ - 0.1} from="slam">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <Text size={58} color={C.amber} font={F.mono}>9,223,372,036,854,775,807</Text>
                <Chip size={58}>9.2 quintillion</Chip>
              </div>
            </Appear>
          </At>
        </Camera>
      ) : null}
      <Sfx name="pack/hit-low" at={tPassed} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 6. payoff + CTA
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tBillion = at.word("billion", 1, 2.4);
  return (
    <>
      <At x={540} y={560}><Appear at={0.02} from="pop"><div style={{ transform: `rotate(${t * 20}deg)` }}><Icon name="Globe" size={360} color={C.mint} stroke={1.4} glow /></div></Appear></At>
      <At x={540} y={880}><Appear at={0.3} from="up"><Text size={60}>8.3 billion people</Text></Appear></At>
      <Punch at={tBillion}>
        <At x={540} y={1040}><Appear at={tBillion - 0.2} from="slam"><Chip size={64}>× 1 billion views each</Chip></Appear></At>
      </Punch>
      <Sfx name="pack/boom-short" hit={tBillion} volume={0.5} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const tForever = at.word("forever", 1, 2.4);
  return (
    <>
      <At y={560}><Appear at={0} from="up"><Text size={76}>Subscribe if you thought</Text></Appear></At>
      <At y={720}>
        <Appear at={tForever - 0.6} from="pop">
          <div style={{ position: "relative" }}>
            <Chip color={C.panel} text={C.ink} size={60}>the internet counts forever</Chip>
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-4deg)" }} />
          </div>
        </Appear>
      </At>
      <At x={540} y={960}><Appear at={0.2} from="fade"><Text size={56} font={F.mono} color={C.amber}>2,147,483,647</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="context" to="max"><BitsBody /></Span>
    <Span from="rehook" to="flip"><FlipBody /></Span>
    <Span from="psy" to="fix"><FixBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
