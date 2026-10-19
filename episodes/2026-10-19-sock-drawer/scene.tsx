// "How many socks to grab in the dark for a pair": the pigeonhole principle, how-to format.
// versus hook (any pair 3, black pair 12) -> rule out luck -> the drawer, lights off -> grab 2: one of each
// -> the third must match -> re-hook: you need black -> worst case 10 white first, then 2 -> 12
// -> payoff (colors + 1, others + 2) -> London hair counts -> CTA (add 10 red: how many?).
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- a sock
const FILL: Record<string, string> = { black: "#24262C", white: C.ink, red: C.coral, unknown: "#3A4660" };
const Sock: React.FC<{ color: "black" | "white" | "red" | "unknown"; size?: number; ring?: string; flip?: boolean; rot?: number }> =
  ({ color, size = 120, ring, flip, rot = 0 }) => (
    <svg width={size * 0.8} height={size} viewBox="0 0 100 125"
      style={{ transform: `${flip ? "scaleX(-1) " : ""}rotate(${rot}deg)`, overflow: "visible",
        filter: ring ? `drop-shadow(0 0 14px ${ring})` : "drop-shadow(0 8px 14px #0008)" }}>
      <path d="M26 4 H66 V70 L90 84 Q104 94 97 109 Q89 123 72 115 L32 96 Q22 90 24 78 Z"
        fill={FILL[color]} stroke={ring ?? (color === "black" || color === "unknown" ? C.muted : "#0000")} strokeWidth={ring ? 6 : 4} strokeLinejoin="round" />
      <rect x={26} y={4} width={40} height={12} fill={color === "white" ? "#D9D4C7" : "#0003"} />
      {color === "unknown" ? <text x={46} y={64} textAnchor="middle" fontSize={44} fontFamily="Space Grotesk Bold" fill={C.ink}>?</text> : null}
    </svg>
  );

// a row/grid of socks laid out left to right
const SockGrid: React.FC<{ colors: string[]; size?: number; perRow?: number; gap?: number; showUpTo?: number; ring?: (i: number) => string | undefined }> =
  ({ colors, size = 90, perRow = 10, gap = 8, showUpTo = 1e9, ring }) => (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${perRow}, ${size * 0.8}px)`, gap }}>
      {colors.map((c, i) => (
        <div key={i} style={{ opacity: i < showUpTo ? 1 : 0 }}>
          <Sock color={c as any} size={size} ring={ring?.(i)} />
        </div>
      ))}
    </div>
  );

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t3 = at.word("3", 1, 0.3);
  const t12 = at.word("12", 1, 1.8);
  const whites = Math.round(tween(t, 0.2, t12, 4, 10));
  return (
    <>
      <HookText>{"Any pair: **3** socks.\nBlack pair: **12**."}</HookText>
      <Riser to={t12} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05 }]]}>
        {/* left: three socks, two of them a pair */}
        <At x={250} y={700}>
          <div style={{ display: "flex", gap: 6 }}>
            <Sock color="white" size={130} ring={C.mint} />
            <Sock color="black" size={130} />
            <Sock color="white" size={130} ring={C.mint} flip />
          </div>
        </At>
        <At x={250} y={930}><Punch at={t3}><Text size={120} color={C.mint} glow>3</Text></Punch></At>
        {/* right: ten white, then the two black */}
        <At x={760} y={700}>
          <SockGrid colors={[...Array(10).fill("white"), "black", "black"]} size={92} perRow={4} gap={6} showUpTo={whites + (t >= t12 - 0.2 ? 2 : 0)}
            ring={(i) => (i >= 10 ? C.amber : undefined)} />
        </At>
        <At x={760} y={1010}><Punch at={t12}><Text size={120} color={C.amber} glow>12</Text></Punch></At>
      </Camera>
      <Sfx name="pack/pop" at={t3} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out luck
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tLuck = at.word("luck.", 1, 0.5);
  const tGuar = at.word("guarantees,", 1, 1.8);
  const tWorst = at.word("worst", 1, 3.0);
  const strike = tween(t, tLuck + 0.1, tLuck + 0.35, 0, 100);
  return (
    <>
      <At x={540} y={380}>
        <Appear at={0.02} from="pop">
          <div style={{ position: "relative" }}>
            <Text size={90}>luck</Text>
            <div style={{ position: "absolute", left: -20, top: "50%", width: `${strike * 1.3}%`, height: 14, background: C.coral, borderRadius: 7, transform: "rotate(-5deg)" }} />
          </div>
        </Appear>
      </At>
      <At x={300} y={650}><Appear at={tGuar - 0.1} from="slam"><Chip size={68} color={C.mint}>3: always</Chip></Appear></At>
      <At x={790} y={650}><Appear at={tGuar + 0.25} from="slam"><Chip size={68} color={C.amber}>12: always</Chip></Appear></At>
      <At x={540} y={900}><Appear at={tWorst - 0.1} from="up"><Icon name="AlarmClock" size={150} color={C.coral} /></Appear></At>
      <At x={540} y={1060}><Appear at={tWorst} from="up"><Text size={56} color={C.muted}>even on your worst morning</Text></Appear></At>
      <Sfx name="pack/wrong" at={tLuck} volume={0.25} />
      <Sfx name="pack/clock" at={tWorst} volume={0.2} dur={1.2} />
    </>
  );
};

// ---------------------------------------------------------------- 3. the drawer, lights off
const DRAWER = [...Array(20)].map((_, i) => ((i * 7) % 20 < 10 ? "black" : "white"));
const DrawerBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t10b = at.word("black", 1, 1.2);
  const t10w = at.word("white.", 1, 2.2);
  const tOff = at.word("Lights", 1, 3.0);
  const dark = tween(t, tOff, tOff + 0.3, 0, 1);
  return (
    <>
      <Headline out={at.dur - 0.3}>Your sock drawer</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tOff, { zoom: 1.04 }], [at.dur, { zoom: 1.1, y: 700 }]]}>
        <At x={540} y={720}>
          <div style={{ position: "relative", padding: 34, borderRadius: 28, background: C.panel, border: `6px solid ${C.dim}` }}>
            <SockGrid colors={DRAWER} size={110} perRow={5} gap={14}
              showUpTo={Math.round(tween(t, 0.1, t10w + 0.3, 0, 20))} />
            <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: "#05080F", opacity: 0.93 * dark }} />
            {dark > 0.5 ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Text size={180} color={C.muted}>?</Text>
              </div>
            ) : null}
          </div>
        </At>
      </Camera>
      <At x={300} y={1100}><Appear at={t10b - 0.1} out={tOff} from="up"><Text size={56} color={C.muted}>10 black</Text></Appear></At>
      <At x={780} y={1100}><Appear at={t10w - 0.1} out={tOff} from="up"><Text size={56}>10 white</Text></Appear></At>
      <Sfx name="pack/switch" at={tOff} volume={0.5} />
    </>
  );
};

// ---------------------------------------------------------------- 4-5. grab 2, then the third
const PairBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tGrab = at.word("Grab", 1, 0.2);
  const tEach = at.word("each.", 1, 1.6);
  const tNo = at.word("No", 1, 2.2);
  const tThree = at.beat("three");
  const tThird = at.word("third.", 1, tThree + 0.6);
  const tTwo = at.word("two", 1, tThree + 1.6);
  const tPair = at.word("Pair.", 2, tThree + 4.0); // the 1st "pair" is "No pair yet"
  // the third sock flickers between the two colors it could be, then lands
  const flick = t >= tTwo && t < tPair ? (Math.floor((t - tTwo) / 0.35) % 2 === 0 ? "black" : "white") : t >= tPair ? "white" : "unknown";
  return (
    <>
      <Headline out={tThree - 0.3}>Grab 2</Headline>
      <Headline at={tThree} out={at.dur - 0.3} color={C.mint}>Grab a third</Headline>
      <At x={320} y={640}><Appear at={tGrab} from="drop"><Sock color="black" size={220} /></Appear></At>
      <At x={560} y={640}><Appear at={tGrab + 0.3} from="drop"><Sock color="white" size={220} ring={t >= tPair ? C.mint : undefined} /></Appear></At>
      <At x={540} y={940}><Appear at={tEach} out={tThree - 0.2} from="up"><Text size={64}>one of each</Text></Appear></At>
      <At x={540} y={1070}><Appear at={tNo - 0.1} out={tThree - 0.2} from="slam"><Chip size={64} color={C.coral}>no pair</Chip></Appear></At>
      <At x={810} y={640}><Appear at={tThird - 0.2} from="drop"><Sock color={flick as any} size={220} ring={t >= tPair ? C.mint : undefined} flip /></Appear></At>
      <At x={540} y={940}><Appear at={tTwo} out={tPair - 0.1} from="up"><Text size={60}>only <span style={{ color: C.amber }}>2 colors</span> to be</Text></Appear></At>
      <Punch at={tPair}>
        <At x={540} y={1000}><Appear at={tPair - 0.1} from="slam"><Chip size={90} color={C.mint}>PAIR, every time</Chip></Appear></At>
      </Punch>
      {t >= tTwo && t < tPair ? <Sfx name="pack/click-soft" at={tTwo} volume={0.25} dur={tPair - tTwo} /> : null}
      <Sfx name="pack/correct" at={tPair} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 6-7. re-hook: you need black -> 12
const BlackBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tBlack = at.word("black.", 1, 1.3);
  const tFights = at.word("fights", 1, 2.4);
  const tB = at.beat("black");
  const tWhite = at.word("white", 1, tB + 1.4);
  const tZero = at.word("zero", 1, tB + 3.2);
  const tNext = at.word("next", 1, tB + 4.2);
  const t12 = at.word("12.", 1, tB + 6.0);
  const whites = Math.floor(tween(t, tWhite - 0.2, tZero - 0.1, 0, 10));
  const blacks = t >= t12 - 0.2 ? 2 : t >= tNext + 0.3 ? 1 : 0;
  const grabs = whites + blacks;
  return (
    <>
      <Headline out={tB - 0.3} color={C.amber}>Today: a black pair</Headline>
      <Shake at={tFights}>
        <At x={540} y={620}><Appear at={0.05} out={tB - 0.2} from="pop"><Sock color="black" size={300} ring={C.amber} /></Appear></At>
      </Shake>
      {t >= tB - 0.2 ? (
        <>
          <At x={540} y={330}>
            <Appear at={tB - 0.2} from="up">
              <div style={{ display: "flex", gap: 50, alignItems: "baseline" }}>
                <Text size={60} font={F.mono}>{`grabs: ${grabs}`}</Text>
                <Text size={60} font={F.mono} color={blacks ? C.amber : C.coral}>{`black: ${blacks}`}</Text>
              </div>
            </Appear>
          </At>
          <Camera keys={[[tB, { zoom: 1 }], [tNext, { zoom: 1 }], [t12, { zoom: 1.08, y: 700 }]]}>
            <At x={540} y={680}>
              <SockGrid colors={[...Array(10).fill("white"), "black", "black"]} size={130} perRow={6} gap={12}
                showUpTo={whites + blacks} ring={(i) => (i >= 10 ? C.amber : undefined)} />
            </At>
          </Camera>
          <Punch at={t12}>
            <At x={540} y={1040}><Appear at={t12 - 0.1} from="slam"><Text size={130} color={C.amber} glow>12</Text></Appear></At>
          </Punch>
        </>
      ) : null}
      {[...Array(10)].map((_, i) => <Sfx key={i} name="pack/pop-3" at={tWhite - 0.2 + (i * (tZero - tWhite + 0.1)) / 10} volume={0.18} />)}
      <Sfx name="pack/boom-short" hit={t12} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 8. payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tAny = at.word("Any", 1, 0.1);
  const tChosen = at.word("chosen", 1, 2.0);
  const tTwo = at.word("two.", 1, 4.4);
  return (
    <>
      <Headline out={at.dur - 0.3}>The rule</Headline>
      <At x={540} y={500}><Appear at={tAny} from="left"><Text size={64}>any pair = colors + 1</Text></Appear></At>
      <At x={540} y={620}><Appear at={tAny + 0.6} from="pop"><Text size={60} color={C.mint} font={F.mono}>2 + 1 = 3</Text></Appear></At>
      <At x={540} y={820}><Appear at={tChosen} from="left"><Text size={64}>one color = others + 2</Text></Appear></At>
      <At x={540} y={940}><Appear at={tTwo - 0.1} from="pop"><Text size={60} color={C.amber} font={F.mono}>10 + 2 = 12</Text></Appear></At>
      <Sfx name="pack/ding" at={tTwo} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 9. London hairs
const HairsBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tMillion = at.word("million", 1, 1.6);
  const tLondon = at.word("London", 1, 2.6);
  const t10 = at.word("10", 1, 5.2);
  const fill = Math.floor(tween(t, tLondon + 0.4, t10 - 0.1, 0, 10));
  const LABELS = ["0", "1", "2", "…", "999,999"];
  return (
    <>
      <Headline out={t10 - 0.4}>Same trick</Headline>
      <At x={540} y={400}><Appear at={tMillion - 0.2} out={t10 - 0.4} from="up"><Text size={54} color={C.muted}>1 million hair counts = 1 million drawers</Text></Appear></At>
      <At x={540} y={740}>
        <div style={{ display: "flex", gap: 22, alignItems: "flex-end" }}>
          {LABELS.map((l, k) => (
            <div key={k} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {l === "…" ? <Text size={70} color={C.muted}>…</Text> : (
                <div style={{ width: 150, height: 330, borderRadius: 16, border: `5px solid ${C.dim}`, background: C.panel,
                  display: "flex", flexWrap: "wrap", alignContent: "flex-end", justifyContent: "center", padding: 6, gap: 2 }}>
                  {[...Array(fill)].map((_, i) => <Icon key={i} name="User" size={44} color={k === 4 ? C.amber : C.ink} />)}
                </div>
              )}
              <Text size={40} color={C.muted} font={F.mono}>{l}</Text>
            </div>
          ))}
        </div>
      </At>
      <At x={540} y={1060}>
        <Appear at={tLondon} from="up">
          <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
            <Counter from={0} to={9.1} t0={tLondon} t1={tLondon + 1.2} size={60} decimals={1} />
            <Text size={56}>million Londoners</Text>
          </div>
        </Appear>
      </At>
      <Punch at={t10}>
        <At x={540} y={330}><Appear at={t10 - 0.1} from="slam"><Chip size={70} color={C.amber}>at least 10 share a count</Chip></Appear></At>
      </Punch>
      <Sfx name="pack/ding" at={t10} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 10. CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRed = at.word("red", 1, 0.8);
  const tHow = at.word("How", 1, 1.8);
  const shown = 20 + Math.floor(tween(t, tRed - 0.1, tRed + 0.5, 0, 10));
  return (
    <>
      <At x={540} y={640}>
        <SockGrid colors={[...Array(10).fill("black"), ...Array(10).fill("white"), ...Array(10).fill("red")]} size={88} perRow={10} gap={10}
          showUpTo={shown} ring={(i) => (i < 10 ? C.amber : undefined)} />
      </At>
      <At x={540} y={1000}><Appear at={tHow - 0.1} from="slam"><Text size={110} color={C.amber} glow>?</Text></Appear></At>
      <At x={540} y={1110}><Appear at={tHow} from="up"><Text size={50} color={C.mint}>grabs for a black pair</Text></Appear></At>
      <Sfx name="pack/whoosh-fast" at={tRed - 0.1} volume={0.3} />
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="drawer"><DrawerBody /></Span>
    <Span from="two" to="three"><PairBody /></Span>
    <Span from="rehook" to="black"><BlackBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="hairs"><HairsBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
