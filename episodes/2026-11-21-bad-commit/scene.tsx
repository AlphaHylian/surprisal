// "How to find the 1 bad change in 1,000 with 10 tests": binary search / git bisect.
// versus hook (1,000 vs 10) -> not a debugger, stop checking in order -> 1,000 changes, one broke login
// -> test 500: works, 500 gone -> test 750: broken -> re-hook: how many halvings -> 500..1 = 10
// -> million 20, billion 30 -> git bisect, Linux -> CTA subscribe
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Stamp, Terminal, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// ---------------------------------------------------------------- 1,000 changes as a 40 x 25 grid
const COLS = 40, CELL = 20, GAP = 3, GX = 540 - (COLS * (CELL + GAP) - GAP) / 2, GY = 440;
const BAD = 637;
type GridState = { lo: number; hi: number; test?: number; testOk?: boolean; showBad?: boolean; show?: number };
const Changes: React.FC<GridState> = ({ lo, hi, test, testOk, showBad, show = -1 }) => {
  const t = useT();
  return (
    <>
      {Array.from({ length: 1000 }, (_, i) => {
        const n = i + 1, r = Math.floor(i / COLS), c = i % COLS;
        const inRange = n >= lo && n <= hi;
        let bg: string = inRange ? C.ink : C.dim;
        let op = inRange ? 0.85 : 0.25;
        if (test !== undefined && n === test) { bg = testOk ? C.mint : C.coral; op = 1; }
        if (showBad && n === BAD) { bg = C.coral; op = 1; }
        const o = show < 0 ? 1 : tween(t, show + r * 0.03, show + r * 0.03 + 0.2, 0, 1);
        return <div key={i} style={{ position: "absolute", left: GX + c * (CELL + GAP), top: GY + r * (CELL + GAP), width: CELL, height: CELL, borderRadius: 4, background: bg, opacity: op * o,
          boxShadow: test === n ? `0 0 18px ${bg}` : "none", transform: test === n ? "scale(1.6)" : "none" }} />;
      })}
    </>
  );
};
const rowY = (n: number) => GY + Math.floor((n - 1) / COLS) * (CELL + GAP) + CELL / 2;
const colX = (n: number) => GX + ((n - 1) % COLS) * (CELL + GAP) + CELL / 2;

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const t10 = w(["10"], 1, 2.2);
  return (
    <>
      <HookText y={250} size={90}>{"1,000 changes\nvs **10 tests**"}</HookText>
      <Riser to={t10} volume={0.45} />
      <Camera keys={[[0, { zoom: 1 }], [t10 + 0.6, { zoom: 1.04 }]]}>
        <Changes lo={1} hi={1000} showBad />
        <At x={colX(BAD)} y={rowY(BAD) - 50}><Appear at={0} from="drop"><Icon name="Bug" size={60} color={C.coral} /></Appear></At>
        <At x={540} y={1080}><Appear at={t10 - 0.2} from="slam"><Chip color={C.amber} size={60}>found in 10</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/glitch" at={0.3} volume={0.2} dur={0.5} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tLuck = w(["luck"], 1, 1.6), tOrder = w(["order"], 1, 3.0);
  const scan = Math.floor(tween(t, 0.1, tOrder, 1, 60));
  return (
    <>
      <Headline>Stop checking in order</Headline>
      <At x={300} y={600}><Appear at={0.05} from="pop"><div style={{ display: "flex", alignItems: "center", gap: 14 }}><Icon name="Bug" size={80} color={C.muted} /><Text size={48} color={C.muted}>debugger</Text></div></Appear></At>
      <At x={780} y={600}><Appear at={tLuck - 0.3} from="pop"><div style={{ display: "flex", alignItems: "center", gap: 14 }}><Icon name="Clover" size={80} color={C.muted} /><Text size={48} color={C.muted}>luck</Text></div></Appear></At>
      <At x={300} y={600}><Appear at={tLuck - 0.1} from="slam"><Text size={120} color={C.coral}>✗</Text></Appear></At>
      <At x={780} y={600}><Appear at={tLuck + 0.3} from="slam"><Text size={120} color={C.coral}>✗</Text></Appear></At>
      <At x={540} y={880}><Appear at={tOrder - 1.2} from="up"><div style={{ fontFamily: F.mono, fontSize: 64, color: C.ink }}>test #{scan} of 1,000…</div></Appear></At>
      <Sfx name="tick" at={tOrder - 1.0} volume={0.2} />
    </>
  );
};

// ---------------------------------------------------------------- context
const ContextBody: React.FC = () => {
  const w = useW();
  const tWorked = w(["worked"], 1, 0.6), t1000 = w(["1,000"], 1, 2.4), tLogin = w(["login"], 1, 4.6);
  return (
    <>
      <Headline>1,000 changes since</Headline>
      <At x={170} y={360}><Appear at={tWorked - 0.2} from="left"><Chip color={C.mint} size={44}>last week: works</Chip></Appear></At>
      <Changes lo={1} hi={1000} show={Math.max(0.05, t1000 - 0.6)} />
      <At x={540} y={1080}><Appear at={tLogin - 0.3} from="slam"><div style={{ display: "flex", alignItems: "center", gap: 14 }}><Icon name="LockKeyhole" size={70} color={C.coral} /><Text size={56} color={C.coral} font={F.bold}>login broken</Text></div></Appear></At>
      <Sfx name="pack/counting-digital" at={Math.max(0.05, t1000 - 0.6)} volume={0.2} dur={0.9} />
      <Sfx name="pack/reboot-fail" at={tLogin} volume={0.25} dur={0.8} />
    </>
  );
};

// ---------------------------------------------------------------- test 500: works
const HalfBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t500 = w(["500"], 1, 0.8), tWorks = w(["works"], 1, 2.0), tGone = w(["gone"], 1, 5.0);
  const tLater = w(["later"], 1, 3.2);
  return (
    <>
      <Headline>Test change 500</Headline>
      <Changes lo={t > tLater - 0.1 ? 501 : 1} hi={1000} test={t > t500 - 0.2 ? 500 : undefined} testOk={t > tWorks - 0.2} />
      <At x={colX(500)} y={rowY(500) - 60}><Appear at={t500 - 0.2} from="drop"><Icon name="FlaskConical" size={60} color={C.amber} /></Appear></At>
      <At x={540} y={1080}><Appear at={tWorks - 0.2} out={tGone - 0.4} from="pop"><Chip color={C.mint} size={58}>it works ✓</Chip></Appear></At>
      <Punch at={tGone}><At x={540} y={1080}><Appear at={tGone - 0.3} from="slam"><Chip color={C.amber} size={62}>500 suspects gone</Chip></Appear></At></Punch>
      <Sfx name="pack/correct" at={tWorks} volume={0.3} />
      <Sfx name="pack/whoosh-fast" at={tLater} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- test 750: broken
const AgainBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const t750 = w(["750"], 1, 0.5), tBroken = w(["Broken"], 1, 1.4), tBetween = w(["between"], 1, 2.6);
  return (
    <>
      <Headline>Test change 750</Headline>
      <Changes lo={501} hi={t > tBetween - 0.1 ? 750 : 1000} test={t > t750 - 0.2 ? 750 : undefined} testOk={t < tBroken - 0.2} />
      <At x={colX(750)} y={rowY(750) - 60}><Appear at={t750 - 0.2} from="drop"><Icon name="FlaskConical" size={60} color={C.amber} /></Appear></At>
      <At x={540} y={1080}><Appear at={tBroken - 0.2} out={tBetween - 0.2} from="slam"><Chip color={C.coral} size={58}>broken ✗</Chip></Appear></At>
      <At x={540} y={1080}><Appear at={tBetween} from="pop"><Chip color={C.amber} size={58}>between 501 and 750</Chip></Appear></At>
      <Sfx name="pack/wrong" at={tBroken} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tHalf = w(["half"], 1, 1.0), tAnswer = w(["answer"], 1, 2.2), tCuts = w(["cuts"], 1, 3.4);
  const wide = tween(t, tHalf - 0.2, tHalf + 0.5, 800, 400);
  return (
    <>
      <Headline color={C.amber}>Half, every time</Headline>
      <div style={{ position: "absolute", left: 540 - 400, top: 560, width: 800, height: 120, borderRadius: 16, background: C.dim, opacity: 0.4 }} />
      <div style={{ position: "absolute", left: 540 - 400, top: 560, width: wide, height: 120, borderRadius: 16, background: C.ink, opacity: 0.85 }} />
      <At x={330} y={780}><Appear at={tAnswer - 0.4} from="up"><Chip color={C.mint} size={50}>works → right half</Chip></Appear></At>
      <At x={750} y={880}><Appear at={tAnswer - 0.1} from="up"><Chip color={C.coral} size={50}>broken → left half</Chip></Appear></At>
      <At x={540} y={1060}><Appear at={tCuts - 0.2} from="slam"><div style={{ fontFamily: F.bold, fontSize: 100, color: C.amber }}>1,000 → 1 ?</div></Appear></At>
      <Sfx name="pack/suspense-sting" at={tCuts} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 500 .. 1: ten tests
const CHAIN = [500, 250, 125, 63, 32, 16, 8, 4, 2, 1];
const CountBody: React.FC = () => {
  const at = useAt();
  const w = useW();
  const tTen = w(["Ten"], 1, 6.0);
  const times = CHAIN.map((n, k) => { const v = at.word(String(n), n === 2 || n === 4 || n === 8 ? 1 : 1, -1); return v >= 0 ? v : 0.2 + k * 0.5; });
  return (
    <>
      <Headline>Count the cuts</Headline>
      {CHAIN.map((n, k) => (
        <At key={n} x={k < 5 ? 330 : 750} y={420 + (k % 5) * 130}>
          <Appear at={Math.max(0.05, times[k] - 0.15)} from="left"><div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontFamily: F.mono, fontSize: 40, color: C.muted }}>test {k + 1}</div>
            <div style={{ fontFamily: F.bold, fontSize: 72, color: n === 1 ? C.amber : C.ink, width: 140, textAlign: "right" }}>{n}</div>
          </div></Appear>
        </At>
      ))}
      <Punch at={tTen}><At x={540} y={1080}><Appear at={tTen - 0.3} from="slam"><Chip color={C.amber} size={76}>10 tests</Chip></Appear></At></Punch>
      {CHAIN.map((_, k) => <Sfx key={k} name="pack/click-soft" at={Math.max(0.05, times[k] - 0.1)} volume={0.25} />)}
      <Sfx name="pack/kaching" at={tTen} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- it barely grows
const GrowBody: React.FC = () => {
  const w = useW();
  const tMillion = w(["million"], 1, 1.4), t20 = w(["20"], 1, 2.4), tBillion = w(["billion"], 1, 3.4), t30 = w(["30"], 1, 4.0);
  const row = (y: number, a: string, b: number, ta: number, tb: number) => (
    <>
      <At x={330} y={y}><Appear at={ta - 0.2} from="left"><Text size={66} font={F.bold}>{a}</Text></Appear></At>
      <At x={620} y={y}><Appear at={ta} from="fade" sfx={null}><Text size={60} color={C.muted}>→</Text></Appear></At>
      <At x={820} y={y}><Appear at={tb - 0.3} from="slam"><Counter from={0} to={b} t0={tb - 0.3} t1={tb} size={90} color={C.amber} suffix=" tests" /></Appear></At>
    </>
  );
  return (
    <>
      <Headline>It barely grows</Headline>
      {row(520, "1,000", 10, 0.1, 0.4)}
      {row(720, "1,000,000", 20, tMillion, t20)}
      {row(920, "1,000,000,000", 30, tBillion, t30)}
    </>
  );
};

// ---------------------------------------------------------------- payoff: git bisect
const PayoffBody: React.FC = () => {
  const w = useW();
  const tBisect = w(["bisect"], 1, 1.4), tLinux = w(["Linux"], 1, 3.6);
  return (
    <>
      <Headline>git bisect</Headline>
      <At x={540} y={640}><Terminal w={900} title="terminal" typeAt={Math.max(0.1, tBisect - 0.6)} cps={40} size={36}
        lines={["$ git bisect start", "$ git bisect bad", "$ git bisect good v1.4", "Bisecting: 499 revisions left", "(roughly 9 steps)"]} /></At>
      <At x={540} y={1060}><Appear at={tLinux - 0.2} from="up"><div style={{ display: "flex", alignItems: "center", gap: 14 }}><Icon name="Terminal" size={64} color={C.mint} /><Text size={52} color={C.mint} font={F.bold}>how Linux finds bad changes</Text></div></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tOne = w(["one"], 1, 1.4);
  return (
    <>
      <Changes lo={1} hi={1000} test={1} testOk={true} />
      <At x={540} y={1080}><Appear at={tOne - 0.3} from="pop"><Chip color={C.ink} size={52}>change #1?</Chip></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="half"><HalfBody /></Span>
    <Span from="again"><AgainBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="count"><CountBody /></Span>
    <Span from="grow"><GrowBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
