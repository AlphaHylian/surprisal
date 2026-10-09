// "How the casino wins at a game that's almost 50/50". Claim hook -> rule out rigging -> $10 on red
// over 37 spins -> re-hook (the long shot) -> $1 on all 37 -> the rule (pays like 36, has 37) -> a
// million bets a night -> short payoff -> question CTA (double zero).
import React from "react";
import {
  Appear, At, C, Camera, Card, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Text,
  tween, useAt, useT,
} from "../kit";

// European wheel order, so the wheel looks like the real thing (0 is green)
const ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const BLACK = "#4A5670";
const pocketColor = (n: number) => (n === 0 ? C.green : REDS.has(n) ? C.coral : BLACK);

/** A roulette wheel drawn in SVG. `rot` in degrees; `extraGreen` adds a 00 pocket (38 pockets). */
const Wheel: React.FC<{ size?: number; rot?: number; glowZero?: number; extraGreen?: boolean }> = ({ size = 560, rot = 0, glowZero = 0, extraGreen }) => {
  const nums = extraGreen ? [...ORDER.slice(0, 19), -1, ...ORDER.slice(19)] : ORDER;
  const n = nums.length, r = size / 2, ri = r * 0.62;
  const wedge = (i: number) => {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const p = (a: number, rr: number) => `${r + rr * Math.cos(a)},${r + rr * Math.sin(a)}`;
    return `M${p(a0, ri)} L${p(a0, r - 6)} A${r - 6},${r - 6} 0 0 1 ${p(a1, r - 6)} L${p(a1, ri)} A${ri},${ri} 0 0 0 ${p(a0, ri)} Z`;
  };
  return (
    <svg width={size} height={size} style={{ transform: `rotate(${rot}deg)`, filter: "drop-shadow(0 30px 50px #000a)" }}>
      <circle cx={r} cy={r} r={r - 2} fill={C.panel} stroke={C.amber} strokeWidth={6} />
      {nums.map((num, i) => {
        const green = num <= 0;
        return <path key={i} d={wedge(i)} fill={green ? C.green : pocketColor(num)} stroke={C.bg} strokeWidth={2}
          style={{ filter: green && glowZero > 0 ? `drop-shadow(0 0 ${24 * glowZero}px ${C.green})` : undefined }} />;
      })}
      <circle cx={r} cy={r} r={ri - 4} fill={C.bg2} stroke={C.dim} strokeWidth={4} />
      <circle cx={r} cy={r} r={ri * 0.28} fill={C.amber} opacity={0.85} />
    </svg>
  );
};

/** The 37 pockets as a grid: green 0 first, then 1-36 in their real colours. */
const Pockets: React.FC<{ t0?: number; lit?: (n: number) => string | null; size?: number }> = ({ t0 = 0, lit, size = 82 }) => {
  const t = useT();
  const nums = [...Array(37)].map((_, i) => i);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(8, ${size}px)`, gap: 10, justifyContent: "center" }}>
      {nums.map((n) => {
        const show = t >= t0 + n * 0.012;
        const hi = lit ? lit(n) : null;
        return (
          <div key={n} style={{ width: size, height: size * 0.82, borderRadius: 12, background: pocketColor(n), opacity: show ? (hi === "dim" ? 0.25 : 1) : 0,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.bold, fontSize: size * 0.42, color: C.ink,
            border: hi && hi !== "dim" ? `5px solid ${hi}` : `2px solid ${C.bg}`, boxShadow: hi && hi !== "dim" ? `0 0 22px ${hi}` : "none",
            transform: `scale(${show ? 1 : 0.6})` }}>{n}</div>
        );
      })}
    </div>
  );
};

const Crossed: React.FC<{ t: number; children: string }> = ({ t, children }) => (
  <div style={{ position: "relative" }}>
    <Chip color={C.panel} text={C.ink} size={70}>{children}</Chip>
    <div style={{ position: "absolute", left: 0, right: 0, top: "50%" }}>
      <Appear at={t} from="slam"><div style={{ height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-4deg)", boxShadow: `0 0 20px ${C.coral}` }} /></Appear>
    </div>
  </div>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tWins = at.word("wins", 1, 2.2);
  return (
    <>
      <HookText>{"Almost **50/50**.\nThe house **still wins**."}</HookText>
      <Riser to={tWins} volume={0.5} />
      <Sfx name="pack/wheel-spin" at={0.05} dur={at.dur} volume={0.35} />
      <Camera keys={[[0, { zoom: 1.0 }], [at.dur, { zoom: 1.08 }]]}>
        <At x={540} y={800}><Wheel size={600} rot={t * 90} glowZero={tween(t, tWins - 0.3, tWins + 0.2, 0, 1)} /></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out rigging
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRig = at.word("rigged", 1, 0.3);
  const tMag = at.word("magnets", 1, 1.0);
  const tGreen = at.word("green", 1, 1.8);
  return (
    <>
      <At y={420}><Appear at={0.02} from="left"><Crossed t={tRig + 0.35}>rigged wheel</Crossed></Appear></At>
      <At y={600}><Appear at={Math.min(tMag, 0.6)} from="right"><Crossed t={tMag + 0.35}>magnets</Crossed></Appear></At>
      <Punch at={tGreen}>
        <At x={540} y={900}>
          <Appear at={tGreen - 0.1} from="pop" sfx="pack/suspense-sting" volume={0.4}>
            <div style={{ width: 220, height: 220, borderRadius: 30, background: C.green, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: F.bold, fontSize: 150, color: C.ink, boxShadow: `0 0 ${40 + 20 * Math.sin(t * 6)}px ${C.green}` }}>0</div>
          </Appear>
        </At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 3. $10 on red, 37 spins
const RedBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRed = at.word("18", 1, 2.0);
  const tBlack = at.word("18", 2, tRed + 0.8);
  const tZero = at.word("zero", 1, tBlack + 1.0);
  const tSpin = at.beat("spin");
  const tWin = at.word("180", 1, tSpin + 2.6);
  const tLose = at.beat("lose");
  const t190 = at.word("190", 1, tLose + 1.4);
  const tDown = at.beat("down");
  const tPct = at.word("2.7%", 1, tDown + 1.6);
  const lit = (n: number): string | null => {
    if (t >= tSpin) return null;
    if (t >= tZero && n === 0) return C.amber;
    if (t >= tRed && t < tZero && n !== 0 && !REDS.has(n) && t < tBlack) return "dim";
    if (t >= tRed && t < tBlack && REDS.has(n)) return C.amber;
    if (t >= tBlack && t < tZero && n !== 0 && !REDS.has(n)) return C.ink;
    return null;
  };
  const gridUp = tween(t, tSpin - 0.2, tSpin + 0.4, 0, -150);
  return (
    <>
      <Headline out={tSpin - 0.3}>$10 on red</Headline>
      <Headline at={tSpin} out={tDown - 0.3} color={C.amber}>37 spins</Headline>
      <Headline at={tDown} color={C.coral}>You're down</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tZero - 0.2, { zoom: 1 }], [tZero + 0.3, { zoom: 1.08, x: 540, y: 640 }], [tSpin, { zoom: 1 }]]}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${gridUp}px)`, opacity: tween(t, tDown - 0.2, tDown + 0.3, 1, 0.08) }}>
          <At x={540} y={700}><Pockets t0={0.05} lit={lit} size={98} /></At>
        </div>
        <At x={300} y={900}>
          <Appear at={tSpin + 0.3} out={tDown - 0.2} from="left">
            <Card w={420} h={230} border={C.mint}>
              <Text size={44} color={C.muted}>18 wins</Text>
              <Counter from={0} to={180} t0={tWin - 0.6} t1={tWin} size={84} color={C.mint} prefix="+$" />
            </Card>
          </Appear>
        </At>
        <At x={780} y={900}>
          <Appear at={tLose} out={tDown - 0.2} from="right">
            <Card w={420} h={230} border={C.coral}>
              <Text size={44} color={C.muted}>19 losses</Text>
              <Counter from={0} to={190} t0={t190 - 0.6} t1={t190} size={84} color={C.coral} prefix="−$" />
            </Card>
          </Appear>
        </At>
        <At x={540} y={640}><Appear at={tDown + 0.1} from="slam"><Text size={200} color={C.coral} glow>−$10</Text></Appear></At>
        <At x={540} y={900}><Appear at={tPct} from="pop"><Chip size={64}>2.7% of every bet</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/cash-ting" at={tWin} volume={0.45} />
      <Sfx name="error" at={t190} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 4. re-hook: the long shot, $1 on all 37
const LongShotBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t35 = at.word("35", 1, 1.8);
  const tEvery = at.beat("every");
  const tAll = at.word("37", 1, tEvery + 1.6);
  const tWins = at.word("wins", 1, tEvery + 2.6);
  const t36 = at.word("36", 1, tEvery + 3.6);
  const tSame = at.beat("same");
  const tAgain = at.word("again", 1, tSame + 1.4);
  const winner = 17;
  const lit = (n: number): string | null => {
    if (t < tAll) return null;
    if (t >= tWins) return n === winner ? C.amber : "dim";
    return C.mint;
  };
  return (
    <>
      <Headline out={tEvery - 0.3} color={C.amber}>The long shot</Headline>
      <Headline at={tEvery} out={tSame - 0.3}>$1 on every number</Headline>
      <Headline at={tSame} color={C.coral}>Same 2.7%</Headline>
      <At x={540} y={560}>
        <Appear at={0.05} out={tEvery - 0.2} from="pop">
          <Card w={640} h={340} border={C.amber}>
            <Text size={56} color={C.muted}>one number</Text>
            <Appear at={t35 - 0.1} from="slam"><Text size={150} color={C.amber} glow>35 to 1</Text></Appear>
          </Card>
        </Appear>
      </At>
      {t >= tEvery && t < tSame + 0.4 ? (
        <div style={{ position: "absolute", inset: 0, opacity: tween(t, tSame - 0.1, tSame + 0.3, 1, 0) }}>
        <Camera keys={[[tEvery, { zoom: 1 }], [tWins, { zoom: 1 }], [tWins + 0.5, { zoom: 1.06, x: 540, y: 620 }], [tSame, { zoom: 1 }]]}>
          <At x={540} y={640}><Pockets t0={tEvery} lit={lit} size={92} /></At>
          <At x={300} y={1030}><Appear at={tAll} out={tSame - 0.2} from="up"><Chip color={C.coral} size={52}>−$37 in</Chip></Appear></At>
          <At x={760} y={1030}><Appear at={t36 - 0.1} out={tSame - 0.2} from="pop"><Chip color={C.mint} size={52}>+$36 back</Chip></Appear></At>
        </Camera>
        </div>
      ) : null}
      <At x={540} y={640}><Appear at={tSame + 0.1} from="slam"><Card w={620} h={300} border={C.coral}><Text size={170} color={C.coral} glow>−$1</Text></Card></Appear></At>
      <At x={540} y={940}><Appear at={tAgain - 0.2} from="pop"><Chip size={60}>1 in 37 = 2.7%</Chip></Appear></At>
      <Sfx name="pack/kaching" at={t36} volume={0.45} />
      <Sfx name="pack/wheel-spin" at={tWins - 1.0} dur={1.0} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 5. the rule
const RuleBody: React.FC = () => {
  const at = useAt();
  const t36 = at.word("36", 1, 1.8);
  const t37 = at.word("has", 1, 3.0);
  return (
    <>
      <Headline color={C.amber}>The whole trick</Headline>
      <Shake at={t37}>
        <At x={300} y={640}>
          <Appear at={0.1} from="left">
            <Card w={430} h={360} border={C.mint}>
              <Text size={46} color={C.muted}>pays like</Text>
              <Text size={170} color={C.mint}>36</Text>
              <Text size={46} color={C.muted}>pockets</Text>
            </Card>
          </Appear>
        </At>
        <At x={780} y={640}>
          <Appear at={t37 - 0.15} from="slam">
            <Card w={430} h={360} border={C.amber}>
              <Text size={46} color={C.muted}>wheel has</Text>
              <Text size={170} color={C.amber} glow>37</Text>
              <Text size={46} color={C.muted}>pockets</Text>
            </Card>
          </Appear>
        </At>
        <At x={540} y={980}><Appear at={t37 + 0.5} from="up"><Chip color={C.green} text={C.bg} size={56}>the extra one is the green 0</Chip></Appear></At>
      </Shake>
      <Sfx name="ding" at={t36} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 6. a million bets a night
const NightBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tLucky = at.word("lucky", 1, 1.0);
  const tMillion = at.word("million", 1, 2.0);
  const tKeeps = at.word("keeps", 1, 3.8);
  const t270 = at.word("270,000", 1, tKeeps + 0.6);
  const swing = Math.sin(t * 5) * tween(t, 0, tMillion, 1, 0.2);
  return (
    <>
      <Headline out={tMillion - 0.3}>One player: luck</Headline>
      <Headline at={tMillion} color={C.mint}>A million bets: math</Headline>
      <At x={540} y={560}>
        <Appear at={0.05} out={tMillion - 0.2} from="pop">
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <Icon name="User" size={170} color={C.ink} />
            <Text size={110} color={swing > 0 ? C.mint : C.coral}>{swing > 0 ? "+$" : "−$"}{Math.round(Math.abs(swing) * 300)}</Text>
          </div>
        </Appear>
      </At>
      <At x={540} y={760}><Appear at={tLucky} out={tMillion - 0.2} from="up"><Chip color={C.mint} size={50}>could walk out ahead</Chip></Appear></At>
      <At x={540} y={620}>
        <Appear at={tMillion} from="up">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 64px)", gap: 14 }}>
            {[...Array(40)].map((_, i) => <Icon key={i} name="User" size={64} color={C.muted} stroke={2} />)}
          </div>
        </Appear>
      </At>
      <Punch at={t270}>
        <At x={540} y={980}>
          <Appear at={tKeeps - 0.2} from="pop">
            <Card w={820} h={240} border={C.amber}>
              <Counter from={0} to={270000} t0={tKeeps - 0.1} t1={t270 + 0.3} size={110} color={C.amber} prefix="+$" />
              <Text size={42} color={C.muted}>per night, give or take $20,000</Text>
            </Card>
          </Appear>
        </At>
      </Punch>
      <Sfx name="pack/cash-register" hit={t270 + 0.3} volume={0.5} />
    </>
  );
};

// ---------------------------------------------------------------- 7. payoff + CTA
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSpinning = at.word("spinning", 1, 2.4);
  return (
    <>
      <At x={540} y={360}><Appear at={0.05} from="down"><Text size={84}>No luck needed.</Text></Appear></At>
      <At x={540} y={760}><Wheel size={560} rot={t * 120} glowZero={0.8} /></At>
      <At x={540} y={1110}><Appear at={tSpinning - 0.4} from="slam"><Chip size={60}>just more spins</Chip></Appear></At>
      <Sfx name="pack/wheel-spin" at={0.1} dur={at.dur} volume={0.3} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tDouble = at.word("double", 1, 1.0);
  const tKeep = at.word("keep", 1, 3.0);
  return (
    <>
      <Headline color={C.amber}>American wheel</Headline>
      <At x={540} y={700}><Wheel size={560} rot={t * 60} glowZero={1} extraGreen={t >= tDouble} /></At>
      <At x={420} y={1080}><Appear at={0.1} from="left"><Chip color={C.green} text={C.bg} size={60}>0</Chip></Appear></At>
      <At x={660} y={1080}><Appear at={tDouble} from="pop"><Chip color={C.green} text={C.bg} size={60}>00</Chip></Appear></At>
      <At x={860} y={480}><Appear at={tKeep} from="pop"><Text size={180} color={C.amber} glow>?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="context" to="down"><RedBody /></Span>
    <Span from="rehook" to="same"><LongShotBody /></Span>
    <Span from="rule"><RuleBody /></Span>
    <Span from="night"><NightBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
