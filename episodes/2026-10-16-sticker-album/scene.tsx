// "Why your sticker album costs 7 albums of stickers": coupon collector's problem, how-to format.
// mistake hook -> rule out rare stickers -> 670 slots -> half fills fast -> last 10 slots crawl
// -> re-hook (last 10 cost twice the first 500) -> fix: swap -> fix: order the last 50 -> payoff -> CTA.
import React from "react";
import {
  Appear, At, Bar, C, Camera, Card, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake,
  Span, Text, You, tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- the album: 670 slots, 30 per row
const N = 670, COLS = 30, CELL = 26, GAP = 4;
const ROWS = Math.ceil(N / COLS);
const GW = COLS * CELL + (COLS - 1) * GAP, GH = ROWS * CELL + (ROWS - 1) * GAP;
// Fixed pseudo-random fill order, so the same slots stay filled from beat to beat.
const ORDER: number[] = (() => {
  const a = [...Array(N).keys()];
  let s = 12345;
  for (let i = N - 1; i > 0; i--) { s = (s * 1103515245 + 12345) % 2147483648; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
})();
const RANK: number[] = (() => { const r = Array(N).fill(0); ORDER.forEach((slot, k) => (r[slot] = k)); return r; })();

// filled = how many slots are filled (0..670); gapColor marks the empty ones near the end.
const Album: React.FC<{ filled: number; gapColor?: string; dimFilled?: boolean; scale?: number }> = ({ filled, gapColor, dimFilled, scale = 1 }) => (
  <div style={{ width: GW, height: GH, position: "relative", transform: `scale(${scale})` }}>
    {[...Array(N)].map((_, i) => {
      const on = RANK[i] < filled;
      const x = (i % COLS) * (CELL + GAP), y = Math.floor(i / COLS) * (CELL + GAP);
      const bg = on ? (dimFilled ? C.dim : C.mint) : gapColor ?? C.panel;
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: CELL, height: CELL, borderRadius: 5, background: bg,
        border: on ? "none" : `2px solid ${gapColor ?? C.dim}`, boxShadow: !on && gapColor ? `0 0 14px ${gapColor}` : "none", opacity: on && !dimFilled ? 0.85 : 1 }} />;
    })}
  </div>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSeven = at.word("seven", 1, 2.2);
  const filled = tween(t, 0, at.dur, 640, 668);
  return (
    <>
      <HookText>{"670 slots.\n**4,700** stickers."}</HookText>
      <Riser to={tSeven} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06 }]]}>
        <At x={540} y={730}><Appear at={0} from="pop"><Album filled={filled} gapColor={C.amber} scale={0.78} /></Appear></At>
        <At x={540} y={1050}>
          <Appear at={0} from="up">
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Icon name="Package" size={64} color={C.coral} />
              <Counter from={3900} to={4700} t0={0} t1={tSeven} size={64} color={C.coral} comma suffix=" bought" />
            </div>
          </Appear>
        </At>
      </Camera>
      <Sfx name="pack/kaching" at={tSeven} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out rare stickers
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRare = at.word("rare", 1, 0.4);
  const tEqual = at.word("equally", 1, 1.6);
  const tTrap = at.word("trap", 1, 2.8);
  const lastRowGlow = t >= tTrap;
  return (
    <>
      <At y={330}>
        <Appear at={0.05} from="left">
          <div style={{ position: "relative" }}>
            <Chip color={C.panel} text={C.ink} size={70}>rare stickers</Chip>
            <div style={{ position: "absolute", left: 0, right: 0, top: "50%" }}>
              <Appear at={tRare + 0.4} from="slam"><div style={{ height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-4deg)", boxShadow: `0 0 20px ${C.coral}` }} /></Appear>
            </div>
          </div>
        </Appear>
      </At>
      <At y={470}>
        <Appear at={tEqual} from="up">
          <div style={{ display: "flex", gap: 22 }}>
            {[...Array(5)].map((_, i) => (
              <Card key={i} w={140} h={160} pad={8} border={C.mint}>
                <Icon name="User" size={60} color={C.mint} />
                <Text size={40} font={F.mono} color={C.ink}>×1</Text>
              </Card>
            ))}
          </div>
        </Appear>
      </At>
      <At x={540} y={850}>
        <Appear at={tTrap - 0.2} from="pop">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <Album filled={lastRowGlow ? 660 : 670} gapColor={C.amber} scale={0.6} />
          </div>
        </Appear>
      </At>
      <At x={540} y={1120}><Appear at={tTrap + 0.2} from="slam"><Chip size={50}>the last page</Chip></Appear></At>
      <Sfx name="pack/suspense-sting" at={tTrap} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 3-4. setup + first half
const StartBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t670 = at.word("670", 1, 1.4);
  const tPacks = at.word("packs", 1, 2.4);
  const tStart = at.beat("start");
  const tHalf = at.word("half", 1, tStart + 2.4);
  const t460 = at.word("460", 1, tHalf + 1.3);
  const filled = tween(t, tStart + 0.3, t460 + 0.4, 0, 335);
  return (
    <>
      <Headline out={tStart - 0.3}>Your album</Headline>
      <Headline at={tStart} color={C.mint}>Almost every sticker is new</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tStart, { zoom: 1 }], [t460 + 0.5, { zoom: 1.05 }]]}>
        <At x={540} y={670}><Appear at={0.05} from="pop"><Album filled={filled} scale={0.9} /></Appear></At>
        <At x={300} y={1050}>
          <Appear at={t670} out={tStart - 0.1} from="up"><Chip size={56} color={C.ink}>670 slots</Chip></Appear>
        </At>
        <At x={760} y={1050}>
          <Appear at={tPacks} out={tStart - 0.1} from="up">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}><Icon name="Package" size={80} color={C.amber} /><Text size={54} color={C.amber}>5 per pack</Text></div>
          </Appear>
        </At>
        <At x={300} y={1050}>
          <Appear at={tStart + 0.2} from="up"><Counter from={0} to={460} t0={tStart + 0.3} t1={t460 + 0.4} size={52} color={C.amber} suffix=" bought" /></Appear>
        </At>
        <At x={760} y={1050}>
          <Appear at={tStart + 0.2} from="up"><Counter from={0} to={335} t0={tStart + 0.3} t1={t460 + 0.4} size={52} color={C.mint} suffix=" filled" /></Appear>
        </At>
      </Camera>
      <Sfx name="ding" at={t460 + 0.4} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 5-6. the last slots crawl
const LateBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t67 = at.word("67", 1, 2.2);
  const tLast = at.beat("last");
  const t670 = at.word("670", 1, tLast + 1.6);
  const filled = t < tLast ? 660 : 669;
  return (
    <>
      <Headline out={tLast - 0.3}>10 slots left</Headline>
      <Headline at={tLast} color={C.coral}>The very last slot</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tLast, { zoom: 1 }], [tLast + 0.6, { zoom: 1.08 }]]}>
        <At x={540} y={640}><Appear at={0.05} from="fade"><Album filled={filled} gapColor={C.amber} dimFilled scale={0.9} /></Appear></At>
        <At x={540} y={1050}>
          <Appear at={t67} out={tLast - 0.1} from="slam">
            <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
              <Text size={96} color={C.amber} glow>1 in 67</Text><Text size={48} color={C.muted}>is new</Text>
            </div>
          </Appear>
        </At>
      </Camera>
      <Shake at={t670 + 0.5}>
        <At x={540} y={1050}>
          <Appear at={tLast + 0.2} from="up">
            <Counter from={0} to={670} t0={tLast + 0.3} t1={t670 + 0.5} size={84} color={C.coral} suffix=" stickers" />
          </Appear>
        </At>
      </Shake>
      <Sfx name="pack/clock" at={tLast + 0.3} dur={Math.max(0.5, t670 - tLast)} volume={0.3} />
      <Sfx name="pack/wrong" at={t670 + 0.5} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 7. re-hook: last 10 vs first 500
const RehookBody: React.FC = () => {
  const at = useAt();
  const tTwice = at.word("twice", 1, 1.4);
  const tMoney = at.word("money", 1, 3.4);
  return (
    <>
      <Headline color={C.amber}>Where the stickers go</Headline>
      <At x={540} y={560}>
        <Appear at={0.05} from="left">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
            <Text size={46} color={C.mint}>first 500 slots</Text>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Bar from={0} to={0.47} t0={0.1} t1={0.7} w={600} h={56} color={C.mint} />
              <Text size={52} font={F.mono} color={C.mint}>920</Text>
            </div>
          </div>
        </Appear>
      </At>
      <At x={540} y={820}>
        <Appear at={0.5} from="left">
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
            <Text size={46} color={C.coral}>last 10 slots</Text>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Bar from={0} to={1} t0={0.6} t1={tTwice} w={600} h={56} color={C.coral} />
              <Text size={52} font={F.mono} color={C.coral}>1,960</Text>
            </div>
          </div>
        </Appear>
      </At>
      <Punch at={tTwice}><At x={540} y={1060}><Appear at={tTwice} from="slam"><Text size={100} color={C.amber} glow>2×</Text></Appear></At></Punch>
      <Sfx name="pack/cash-register" at={tMoney} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 8. fix: swap with friends
const SwapBody: React.FC = () => {
  const at = useAt();
  const tSwap = at.word("Swap", 1, 0.8);
  const tFive = at.word("Five", 1, 2.6);
  const t1800 = at.word("2,000", 1, 4.6);
  const t4700 = at.word("4,700", 1, 6.0);
  const pos = [[540, 470], [270, 640], [810, 640], [360, 920], [720, 920]];
  return (
    <>
      <Headline color={C.mint}>Swap your doubles</Headline>
      {pos.map(([x, y], i) => (
        <At key={i} x={x} y={y}><Appear at={i === 0 ? tSwap : tFive + i * 0.12} from="pop"><You size={130} color={i === 0 ? C.amber : C.mint} /></Appear></At>
      ))}
      <At x={540} y={720}><Appear at={tFive + 0.6} from="drop"><Icon name="Package" size={120} color={C.amber} glow /></Appear></At>
      <At x={540} y={1110}>
        <Appear at={t1800} from="slam">
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <Chip size={58} color={C.mint}>2,000 each</Chip>
            <Appear at={t4700} from="fade">
              <div style={{ position: "relative" }}>
                <Text size={52} color={C.muted}>4,700</Text>
                <div style={{ position: "absolute", left: -6, right: -6, top: "50%", height: 8, background: C.coral, borderRadius: 4, transform: "rotate(-6deg)" }} />
              </div>
            </Appear>
          </div>
        </Appear>
      </At>
      <Sfx name="pack/paper-flip" at={tSwap} volume={0.5} />
    </>
  );
};

// ---------------------------------------------------------------- 9. fix: order the last 50
const OrderBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t50 = at.word("50", 1, 1.0);
  const tOrder = at.word("order", 1, 1.8);
  const t900 = at.word("Now", 1, 3.2) + 0.4;
  const filled = tween(t, tOrder, tOrder + 1.2, 620, 670);
  return (
    <>
      <Headline color={C.amber}>Order the last 50</Headline>
      <At x={540} y={640}><Appear at={0.05} from="fade"><Album filled={t < t50 ? 620 : filled} gapColor={C.amber} scale={0.9} /></Appear></At>
      <At x={540} y={1050}>
        <Appear at={t900 - 0.4} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Counter from={2000} to={930} t0={t900 - 0.4} t1={t900 + 0.2} size={88} color={C.mint} comma />
            <Text size={52} color={C.mint}>each</Text>
          </div>
        </Appear>
      </At>
      <Sfx name="pack/purchase" at={tOrder} volume={0.45} />
      <Sfx name="ding" at={t900 + 0.2} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 10-11. payoff + CTA
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tLast = at.word("last", 1, 1.6);
  return (
    <>
      <At x={540} y={640}><Appear at={0} from="fade"><Album filled={660} gapColor={C.amber} dimFilled scale={0.9} /></Appear></At>
      <Punch at={tLast}>
        <At x={540} y={1050}><Appear at={tLast} from="slam"><Text size={92} color={C.amber} glow>The last page is.</Text></Appear></At>
      </Punch>
      <At x={540} y={300}><Appear at={0.1} from="up"><Text size={64}>The album isn't expensive.</Text></Appear></At>
      <Sfx name="pack/boom-short" hit={tLast} volume={0.5} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const t10 = at.word("10-slot", 1, 1.4);
  return (
    <>
      <At x={540} y={520}>
        <Appear at={0.05} from="pop">
          <div style={{ display: "flex", gap: 14 }}>
            {[...Array(10)].map((_, i) => <div key={i} style={{ width: 70, height: 90, borderRadius: 10, border: `3px solid ${C.amber}`, background: C.panel }} />)}
          </div>
        </Appear>
      </At>
      <At x={540} y={760}><Appear at={t10} from="up"><Text size={80}>10 slots = <span style={{ color: C.amber }}>? stickers</span></Text></Appear></At>
      <At x={540} y={940}><Appear at={t10 + 0.8} from="fade"><Text size={48} color={C.muted}>guess in the comments</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="setup" to="start"><StartBody /></Span>
    <Span from="late" to="last"><LateBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="swap"><SwapBody /></Span>
    <Span from="order"><OrderBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
