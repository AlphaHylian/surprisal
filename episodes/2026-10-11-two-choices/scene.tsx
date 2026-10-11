// "How checking just 2 servers stops overload". Versus hook (one random server or the emptier of two?)
// -> rule out "random is fair on average" -> 100 servers, 10,000 jobs -> random: busiest 126, quietest 75
// -> re-hook: asking all 100 costs 100 questions per job -> pick two, send to the emptier -> busiest 102
// -> why: both picks must be busy (10% -> 1 in 100) -> a third pick: 101 -> power of two choices, nginx
// "random two" -> CTA: subscribe if you thought you had to check all 100.
import React from "react";
import {
  Appear, Arrow, At, C, Camera, Card, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Terminal, Text,
  tween, useAt, useT,
} from "../kit";

// one real simulated run each (verify.py writes bars.json): 100 servers, 10,000 jobs
const RANDOM = [89, 96, 92, 91, 107, 106, 91, 101, 94, 106, 115, 91, 106, 94, 92, 102, 96, 107, 101, 107, 121, 117, 83, 94, 81, 112, 99, 113, 93, 101, 90, 96, 98, 95, 95, 90, 105, 105, 110, 91, 115, 76, 88, 104, 100, 109, 97, 113, 103, 106, 99, 75, 102, 104, 100, 112, 92, 98, 121, 105, 115, 104, 99, 106, 86, 88, 105, 97, 89, 95, 79, 114, 101, 113, 99, 92, 103, 126, 90, 97, 100, 105, 104, 116, 110, 113, 96, 95, 94, 114, 91, 104, 86, 109, 77, 92, 111, 83, 103, 107];
const TWO = [100, 100, 100, 101, 99, 102, 101, 99, 100, 101, 101, 99, 100, 99, 98, 101, 101, 100, 101, 100, 99, 100, 100, 99, 100, 98, 100, 101, 100, 98, 100, 99, 101, 101, 100, 101, 100, 100, 100, 101, 99, 99, 101, 97, 100, 100, 100, 100, 98, 101, 101, 101, 101, 99, 100, 100, 100, 98, 101, 99, 100, 100, 99, 100, 100, 101, 101, 101, 101, 101, 100, 101, 99, 100, 100, 99, 101, 101, 101, 100, 99, 101, 98, 100, 100, 99, 101, 99, 100, 99, 101, 101, 101, 97, 101, 99, 100, 100, 101, 101];
const IMAX = RANDOM.indexOf(Math.max(...RANDOM));
const IMIN = RANDOM.indexOf(Math.min(...RANDOM));

/** 100 servers as bars from 0; `grow` 0..1 fills them in left to right, `morph` 0..1 turns RANDOM into TWO. */
const Servers: React.FC<{ w?: number; h?: number; grow?: number; morph?: number; mark?: boolean; avg?: boolean }> =
  ({ w = 940, h = 520, grow = 1, morph = 0, mark = false, avg = false }) => {
    const bw = w / 100;
    const scale = h / 135;
    return (
      <div style={{ position: "relative", width: w, height: h }}>
        <div style={{ position: "absolute", left: 0, bottom: 0, width: w, height: h, display: "flex", alignItems: "flex-end" }}>
          {RANDOM.map((r, i) => {
            const v = r + (TWO[i] - r) * morph;
            const g = Math.max(0, Math.min(1, grow * 1.3 - (i / 100) * 0.3));
            const hot = mark && morph < 0.5 && i === IMAX;
            const cold = mark && morph < 0.5 && i === IMIN;
            const col = hot ? C.coral : cold ? C.ink : C.mint;
            return <div key={i} style={{ width: bw - 2, marginRight: 2, height: v * scale * g, background: col, borderRadius: 3,
              boxShadow: hot ? `0 0 24px ${C.coral}` : "none", opacity: hot || cold || !mark ? 1 : 0.75 }} />;
          })}
        </div>
        {avg ? <div style={{ position: "absolute", left: -10, width: w + 20, bottom: 100 * scale, borderTop: `4px dashed ${C.amber}` }} /> : null}
      </div>
    );
  };

/** A server rack with its job count. */
const Rack: React.FC<{ n: number | React.ReactNode; color?: string; size?: number; label?: string }> = ({ n, color = C.mint, size = 300, label }) => (
  <Card w={size} h={size * 1.15} border={color}>
    <Icon name="Server" size={size * 0.42} color={color} stroke={1.8} glow />
    <div style={{ fontFamily: F.bold, fontSize: size * 0.24, color: C.ink, lineHeight: 1 }}>{n}</div>
    <Text size={size * 0.12} color={C.muted}>{label ?? "jobs"}</Text>
  </Card>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tTwo = at.word("two", 1, 2.0);
  const morph = tween(t, tTwo - 0.5, tTwo + 0.4, 0, 1);
  return (
    <>
      <HookText>{"1 random server\nvs **the emptier of 2**"}</HookText>
      <Riser to={tTwo} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06 }]]}>
        <At x={540} y={790}><Servers h={500} morph={morph} mark /></At>
        <At x={540} y={1110}><Text size={46} color={morph > 0.5 ? C.mint : C.coral}>{morph > 0.5 ? "busiest: 102 jobs" : "busiest: 126 jobs"}</Text></At>
      </Camera>
      <Sfx name="pack/warp-slide" at={tTwo - 0.5} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out + context
const FairBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFair = at.word("fair", 1, 0.6);
  const tHide = at.word("hide", 1, 3.6);
  const tCtx = at.beat("context");
  const t10k = at.word("10,000", 1, tCtx + 1.8);
  const tWait = at.word("wait", 1, tCtx + 4.4);
  return (
    <>
      <Headline out={tCtx - 0.3}>Random sounds fair</Headline>
      <Headline at={tCtx}>100 servers, 10,000 jobs</Headline>
      {t < tCtx ? (
        <>
          <At x={540} y={600}><Appear at={tFair} from="pop"><Icon name="Dices" size={260} color={C.mint} stroke={1.6} glow /></Appear></At>
          <At x={540} y={880}><Appear at={tFair + 0.8} from="up"><Chip color={C.panel} text={C.ink} size={58}>same on average</Chip></Appear></At>
          <At x={540} y={1050}><Appear at={tHide} from="slam" sfx="pack/suspense-sting" volume={0.35}><Text size={64} color={C.coral}>but the worst one?</Text></Appear></At>
        </>
      ) : (
        <>
          <At x={540} y={690}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 60px)", gap: 8 }}>
              {Array.from({ length: 100 }, (_, i) => (
                <div key={i} style={{ opacity: t >= tCtx + 0.1 + i * 0.012 ? 1 : 0 }}><Icon name="Server" size={56} color={C.mint} stroke={1.6} /></div>
              ))}
            </div>
          </At>
          <Sfx name="pack/loading" at={tCtx + 0.1} dur={1.2} volume={0.25} />
          <At x={540} y={1120}><Appear at={t10k - 0.2} from="pop"><Counter from={0} to={10000} t0={t10k - 0.2} t1={t10k + 0.8} size={70} color={C.amber} suffix=" jobs" /></Appear></At>
          <Sfx name="pack/hit-low" at={tWait} volume={0.3} />
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------- 3. random: 126 vs 75
const RandomBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSend = at.word("random", 1, 1.0);
  const t100 = at.word("100", 1, 2.6);
  const tWorst = at.beat("worst");
  const t126 = at.word("126", 1, tWorst + 1.2);
  const t75 = at.word("75", 1, tWorst + 2.6);
  const grow = tween(t, tSend - 0.4, tSend + 1.6, 0, 1);
  const bw = 940 / 100;
  const xOf = (i: number) => 540 - 470 + i * bw + bw / 2;
  return (
    <>
      <Headline out={tWorst - 0.3}>Each job: a random server</Headline>
      <Headline at={tWorst} color={C.coral}>Averages hide the worst</Headline>
      <Sfx name="pack/data-transfer" at={tSend - 0.4} dur={2} volume={0.25} />
      <Camera keys={[[0, { zoom: 1 }], [t126 - 0.2, { zoom: 1 }], [t126 + 0.5, { zoom: 1.08, x: xOf(IMAX) * 0.4 + 540 * 0.6, y: 700 }], [t75, { zoom: 1 }]]}>
        <At x={540} y={760}><Servers grow={grow} mark={t >= t126 - 0.2} avg={t >= t100 - 0.2} /></At>
        <At x={200} y={420}><Appear at={t100 - 0.2} from="pop"><Chip size={44}>average 100</Chip></Appear></At>
        <At x={xOf(IMAX)} y={430}><Appear at={t126 - 0.1} from="slam" sfx="pack/wrong" volume={0.45}><Chip color={C.coral} size={56}>126</Chip></Appear></At>
        <At x={Math.min(780, xOf(IMIN))} y={1090}><Appear at={t75 - 0.1} from="pop"><Chip color={C.panel} text={C.ink} size={50}>75</Chip></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 4. re-hook: ask all 100?
const AskAllBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tAll = at.word("all", 1, 0.6);
  const tQ = at.word("questions", 1, 2.6);
  const tCheap = at.word("cheaper", 1, 4.4);
  return (
    <>
      <Headline color={C.amber}>Ask all 100?</Headline>
      <At x={540} y={690}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 60px)", gap: 8 }}>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i}><Icon name={t >= tAll + i * 0.015 ? "MessageCircleQuestion" : "Server"} size={56} color={t >= tAll + i * 0.015 ? C.amber : C.mint} stroke={1.6} /></div>
          ))}
        </div>
      </At>
      <Sfx name="pack/hacking" at={tAll} dur={1.5} volume={0.2} />
      <At x={540} y={1100}><Appear at={tQ - 0.1} from="up"><Chip color={C.coral} size={54}>100 questions per job</Chip></Appear></At>
      <At x={540} y={690}><Appear at={tCheap - 0.1} from="slam"><Stamp size={120} rotate={-8}>TOO SLOW</Stamp></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 5. pick two, send to the emptier
const TwoBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tPick = at.word("two", 1, 0.6);
  const tAsk = at.word("busy", 1, 2.4);
  const tSend = at.word("emptier", 1, 4.0);
  const jobX = tween(t, tSend - 0.3, tSend + 0.3, 540, 290);
  const jobY = tween(t, tSend - 0.3, tSend + 0.3, 1060, 820);
  return (
    <>
      <Headline>Pick two. Ask both.</Headline>
      <At x={290} y={620}><Appear at={tPick} from="left"><Rack n={t >= tAsk ? 97 : "?"} color={t >= tSend ? C.amber : C.mint} /></Appear></At>
      <At x={790} y={620}><Appear at={tPick + 0.2} from="right"><Rack n={t >= tAsk ? 104 : "?"} color={t >= tSend ? C.muted : C.mint} /></Appear></At>
      <Sfx name="pack/ding" at={tAsk} volume={0.35} />
      <At x={jobX} y={jobY}><Appear at={tPick + 0.4} from="pop"><Chip size={52}>new job</Chip></Appear></At>
      <Sfx name="pack/whoosh-fast" hit={tSend} volume={0.4} />
      <At x={290} y={1060}><Appear at={tSend + 0.3} from="pop" sfx="pack/correct" volume={0.4}><Text size={48} color={C.amber}>the emptier one</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 6. effect: 126 -> 102
const EffectBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t102 = at.word("102", 1, 1.6);
  const t26 = at.word("26", 1, 3.2);
  const morph = tween(t, 0.1, t102, 0, 1);
  return (
    <>
      <Headline color={C.mint}>Busiest server: 102</Headline>
      <Sfx name="pack/warp-slide" at={0.1} volume={0.35} />
      <At x={540} y={700}><Servers h={460} morph={morph} avg /></At>
      <Punch at={t26 + 0.4}>
        <At x={540} y={1080}>
          <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
            <Appear at={t26 - 0.2} from="pop"><Chip color={C.coral} size={52}>+26 extra</Chip></Appear>
            <Appear at={t26 + 0.2} from="pop"><Text size={64} color={C.muted}>→</Text></Appear>
            <Appear at={t26 + 0.4} from="slam" sfx="pack/punch" volume={0.45}><Chip size={60}>+2</Chip></Appear>
          </div>
        </At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 7. why: both picks must be busy
const WhyBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tBoth = at.word("both", 1, 1.6);
  const t10 = at.word("10%", 1, 3.2);
  const t100 = at.word("100", 1, 4.6);
  return (
    <>
      <Headline>Both picks must be busy</Headline>
      <At x={540} y={540}>
        <div style={{ display: "flex", gap: 10 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <Icon key={i} name="Server" size={84} color={i === 3 && t >= t10 - 0.2 ? C.coral : C.mint} stroke={1.6} glow={i === 3 && t >= t10 - 0.2} />
          ))}
        </div>
      </At>
      <At x={540} y={680}><Appear at={t10 - 0.1} from="up"><Text size={50} color={C.coral}>1 in 10 busy</Text></Appear></At>
      <At x={540} y={860}>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Appear at={tBoth} from="pop"><Chip color={C.coral} size={54}>pick 1 busy</Chip></Appear>
          <Appear at={tBoth + 0.3} from="pop"><Text size={64} color={C.muted}>and</Text></Appear>
          <Appear at={tBoth + 0.5} from="pop"><Chip color={C.coral} size={54}>pick 2 busy</Chip></Appear>
        </div>
      </At>
      <Punch at={t100}>
        <At x={540} y={1060}><Appear at={t100 - 0.15} from="slam"><Text size={120} font={F.bold} color={C.amber} glow>1 job in 100</Text></Appear></At>
      </Punch>
    </>
  );
};

// ---------------------------------------------------------------- 8. a third pick barely helps
const ThreeBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t101 = at.word("101", 1, 1.4);
  const tJump = at.word("jump", 1, 2.6);
  const rows: [string, number, string][] = [["1 pick", 126, C.coral], ["2 picks", 102, C.amber], ["3 picks", 101, C.mint]];
  return (
    <>
      <Headline>A third pick?</Headline>
      <At x={540} y={700}>
        <div style={{ display: "flex", flexDirection: "column", gap: 50 }}>
          {rows.map(([lab, v, col], i) => {
            const show = i < 2 ? 0.1 + i * 0.2 : t101 - 0.2;
            const w = tween(t, show, show + 0.5, 0, (v / 130) * 620);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, opacity: t >= show ? 1 : 0 }}>
                <div style={{ width: 200, textAlign: "right" }}><Text size={48} color={C.muted}>{lab}</Text></div>
                <div style={{ width: w, height: 80, background: col, borderRadius: 12, boxShadow: i === 1 && t >= tJump ? `0 0 30px ${C.amber}` : "none" }} />
                <Text size={56}>{v}</Text>
              </div>
            );
          })}
        </div>
      </At>
      <Sfx name="pack/pop" at={0.1} volume={0.3} />
      <Sfx name="pack/pop-2" at={0.3} volume={0.3} />
      <Sfx name="pack/pop-3" at={t101 - 0.2} volume={0.3} />
      <At x={540} y={1080}><Appear at={tJump - 0.1} from="up"><Chip size={54}>the big jump: 1 → 2</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 9. payoff: power of two choices, nginx
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tPower = at.word("power", 1, 0.6);
  const tNginx = at.word("Engine", 1, 2.2);
  const tLine = at.word("random", 1, 3.8);
  return (
    <>
      <Headline color={C.amber}>The power of two choices</Headline>
      <At x={540} y={560}><Appear at={tPower} from="pop"><Text size={200} font={F.bold} color={C.amber} glow>2</Text></Appear></At>
      <At x={540} y={900}>
        <Appear at={tNginx - 0.2} from="up">
          <Terminal title="nginx.conf" w={860} size={46} typeAt={tNginx} lines={["upstream servers {", "    random two;", "}"]} />
        </Appear>
      </At>
      <Sfx name="pack/key-press" at={tLine} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 10. CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const tAll = at.word("all", 1, 1.6);
  return (
    <>
      <At x={540} y={640}><Servers h={460} morph={1} avg /></At>
      <At x={540} y={1060}><Appear at={tAll - 0.2} from="pop"><Chip color={C.panel} text={C.ink} size={54}>check all 100? no: just 2</Chip></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout" to="context"><FairBody /></Span>
    <Span from="random" to="worst"><RandomBody /></Span>
    <Span from="rehook"><AskAllBody /></Span>
    <Span from="two"><TwoBody /></Span>
    <Span from="effect"><EffectBody /></Span>
    <Span from="why"><WhyBody /></Span>
    <Span from="three"><ThreeBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
