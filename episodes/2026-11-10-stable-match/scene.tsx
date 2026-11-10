// "The 1962 rule that stops matches falling apart": Gale-Shapley deferred acceptance.
// versus hook (random: 3 breakaways / one rule: 0) -> 1962 -> what a breakaway is -> apply to top school
// -> hold the favourite (a maybe) -> next choice, Cy bumped -> re-hook -> why: schools only trade up
// -> 100,000 setups, 0 breakaways, hospitals since 1952 -> CTA: the side that asks or answers?
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT } from "../kit";

const STU = ["Ana", "Ben", "Cy", "Dee"];
const SCH = ["Oak", "Elm", "Ash", "Fir"];
const SX = 250, KX = 790, ROW = (i: number) => 540 + i * 160;

type Kind = "rand" | "break" | "apply" | "hold" | "no" | "final";
type L = { s: string; c: string; kind: Kind; at: number; out?: number };
const COL: Record<Kind, string> = { rand: C.muted, break: C.coral, apply: C.amber, hold: C.mint, no: C.coral, final: C.mint };

// try several spellings of a spoken word
const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

const Links: React.FC<{ links: L[] }> = ({ links }) => {
  const t = useT();
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      {links.map((l, i) => {
        if (t < l.at) return null;
        const p = l.at <= 0.001 ? 1 : tween(t, l.at, l.at + 0.35, 0, 1);
        const o = l.out !== undefined ? tween(t, l.out, l.out + 0.3, 1, 0) : 1;
        if (o <= 0) return null;
        const y1 = ROW(STU.indexOf(l.s)), y2 = ROW(SCH.indexOf(l.c));
        const x1 = SX + 105, x2 = KX - 120;
        const x = x1 + (x2 - x1) * p, y = y1 + (y2 - y1) * p;
        const dash = l.kind === "break" || l.kind === "hold" || l.kind === "no" ? "18 14" : undefined;
        const wdt = l.kind === "final" ? 12 : l.kind === "rand" ? 6 : 9;
        return <line key={i} x1={x1} y1={y1} x2={x} y2={y} stroke={COL[l.kind]} strokeWidth={wdt} strokeDasharray={dash} strokeLinecap="round" opacity={o} />;
      })}
    </svg>
  );
};

const Nodes: React.FC<{ hiS?: Record<string, string>; hiC?: Record<string, string> }> = ({ hiS = {}, hiC = {} }) => (
  <>
    {STU.map((s, i) => (
      <At key={s} x={SX} y={ROW(i)}>
        <div style={{ width: 200, height: 96, borderRadius: 48, background: hiS[s] ?? C.panel, border: `4px solid ${hiS[s] ? hiS[s] : C.ink}`, display: "flex",
          alignItems: "center", justifyContent: "center", gap: 10, fontFamily: F.bold, fontSize: 48, color: hiS[s] ? C.bg : C.ink, boxShadow: "0 12px 30px #0008" }}>
          <Icon name="User" size={44} color={hiS[s] ? C.bg : C.ink} stroke={2.4} />{s}
        </div>
      </At>
    ))}
    {SCH.map((c, i) => (
      <At key={c} x={KX} y={ROW(i)}>
        <div style={{ width: 230, height: 104, borderRadius: 22, background: hiC[c] ?? C.panel, border: `4px solid ${hiC[c] ? hiC[c] : C.mint}`, display: "flex",
          alignItems: "center", justifyContent: "center", gap: 12, fontFamily: F.bold, fontSize: 48, color: hiC[c] ? C.bg : C.ink, boxShadow: "0 12px 30px #0008" }}>
          <Icon name="School" size={46} color={hiC[c] ? C.bg : C.mint} stroke={2.2} />{c}
        </div>
      </At>
    ))}
  </>
);

const RANDOM: L[] = [["Ana", "Oak"], ["Ben", "Ash"], ["Cy", "Fir"], ["Dee", "Elm"]].map(([s, c]) => ({ s, c, kind: "rand" as Kind, at: 0 }));
const BREAKS: L[] = [["Ben", "Oak"], ["Cy", "Elm"], ["Dee", "Ash"]].map(([s, c]) => ({ s, c, kind: "break" as Kind, at: 0 }));
const FINAL: [string, string][] = [["Ana", "Elm"], ["Ben", "Oak"], ["Cy", "Fir"], ["Dee", "Ash"]];

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const tZero = w(["zero"], 1, 2.4);
  return (
    <>
      <HookText y={300} size={84}>{"Random: **3 breakaways**\nOne rule: **0**"}</HookText>
      <Riser to={tZero} volume={0.45} />
      <Links links={[...RANDOM, ...BREAKS.map((b, i) => ({ ...b, at: i === 0 ? 0 : 0.25 * i }))]} />
      <Nodes />
      <Sfx name="pack/line-break" at={0.25} volume={0.25} />
      <Sfx name="pack/line-break" at={0.5} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 1962
const RuleBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tComp = w(["computer"], 1, 1.0), tRule = w(["rule"], 1, 1.8), t1962 = w(["1962", "nineteen"], 1, 3.2);
  return (
    <>
      <Headline>Not a smarter computer</Headline>
      <At x={540} y={560}><Appear at={tComp - 0.3} from="pop"><div style={{ position: "relative" }}>
        <Icon name="Cpu" size={240} color={C.muted} />
        <div style={{ position: "absolute", left: -20, top: 115, width: 280, height: 14, background: C.coral, borderRadius: 7, transform: "rotate(-35deg)",
          opacity: tween(t, tComp + 0.2, tComp + 0.4, 0, 1) }} />
      </div></Appear></At>
      <At x={540} y={830}><Appear at={tRule - 0.1} from="up"><Text size={60}>a rule</Text></Appear></At>
      <At x={540} y={960} style={{ width: 1000 }}><Appear at={t1962 - 0.2} from="slam"><Chip color={C.amber} size={52}>Gale & Shapley, 1962</Chip></Appear></At>
      <Sfx name="pack/wrong" at={tComp + 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- what a breakaway is
const ContextBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tBreak = w(["breakaway"], 1, 2.6), tBoth = w(["both"], 1, 3.8);
  const pulse = t > tBoth ? 0.5 + 0.5 * Math.sin((t - tBoth) * 8) : 0;
  return (
    <>
      <Headline>A breakaway</Headline>
      <Links links={[...RANDOM, { s: "Cy", c: "Elm", kind: "break", at: tBreak }]} />
      <Nodes hiS={t >= tBreak ? { Cy: C.coral } : {}} hiC={t >= tBreak ? { Elm: C.coral } : {}} />
      <At x={520} y={430} style={{ width: 1000 }}><Appear at={tBoth - 0.2} from="pop"><div style={{ opacity: 0.75 + 0.25 * pulse }}>
        <Text size={48} color={C.coral}>Cy ⇄ Elm: both prefer each other</Text></div></Appear></At>
      <Sfx name="pack/glitch" at={tBreak} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- step 1: apply
const ApplyBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tApp = w(["applies"], 1, 1.6), tAna = w(["Ana"], 1, 3.2), tOak = w(["Oak"], 1, 4.4);
  const links: L[] = [
    { s: "Ana", c: "Oak", kind: "apply", at: tApp }, { s: "Ben", c: "Oak", kind: "apply", at: tApp + 0.12 },
    { s: "Cy", c: "Elm", kind: "apply", at: tApp + 0.24 }, { s: "Dee", c: "Ash", kind: "apply", at: tApp + 0.36 },
  ];
  return (
    <>
      <Headline>1. Apply to your top school</Headline>
      <Camera keys={[[0, { zoom: 1 }]]}>
        <Links links={links} />
        <Nodes hiS={t >= tAna ? { Ana: C.amber, Ben: C.amber } : {}} hiC={t >= tOak ? { Oak: C.amber } : {}} />
      </Camera>
      {links.map((l, i) => <Sfx key={i} name="pack/whoosh-arrow" at={l.at} volume={0.25} />)}
    </>
  );
};

// ---------------------------------------------------------------- step 2: hold
const HoldBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tHold = w(["hold"], 1, 1.4), tMaybe = w(["maybe"], 1, 2.4), tBen = w(["Ben"], 1, 4.0), tDown = w(["down"], 1, 5.0);
  const links: L[] = [
    { s: "Ana", c: "Oak", kind: "apply", at: 0, out: tDown - 0.4 }, { s: "Ana", c: "Oak", kind: "no", at: tDown - 0.4, out: tDown + 0.3 },
    { s: "Ben", c: "Oak", kind: "apply", at: 0, out: tHold }, { s: "Ben", c: "Oak", kind: "hold", at: tHold },
    { s: "Cy", c: "Elm", kind: "apply", at: 0, out: tHold }, { s: "Cy", c: "Elm", kind: "hold", at: tHold },
    { s: "Dee", c: "Ash", kind: "apply", at: 0, out: tHold }, { s: "Dee", c: "Ash", kind: "hold", at: tHold },
  ];
  return (
    <>
      <Headline>2. Hold your favourite</Headline>
      <Links links={links} />
      <Nodes hiC={t >= tBen ? { Oak: C.mint } : {}} />
      <At x={640} y={400}><Appear at={tMaybe - 0.2} from="pop"><Chip color={C.mint} size={50}>on hold = MAYBE</Chip></Appear></At>
      <At x={SX} y={ROW(0) - 95}><Appear at={tDown - 0.3} from="slam"><Stamp size={52} rotate={-8}>NO</Stamp></Appear></At>
      <Sfx name="pack/wrong" at={tDown - 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- step 3: next choice
const NextBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tElm = w(["Elm"], 1, 2.4), tCy = w(["Cy"], 1, 3.6), tBump = w(["bumped"], 1, 4.6);
  const tOak = w(["Oak"], 1, 5.4), tNo = w(["no"], 1, 5.9), tFir = w(["Fir"], 1, 6.5), tDone = w(["Done"], 1, 7.2);
  const links: L[] = [
    { s: "Ben", c: "Oak", kind: "hold", at: 0, out: tDone }, { s: "Dee", c: "Ash", kind: "hold", at: 0, out: tDone },
    { s: "Cy", c: "Elm", kind: "hold", at: 0, out: tBump - 0.1 },
    { s: "Ana", c: "Elm", kind: "apply", at: tElm - 0.2, out: tCy }, { s: "Ana", c: "Elm", kind: "hold", at: tCy, out: tDone },
    { s: "Cy", c: "Oak", kind: "no", at: tOak - 0.2, out: tNo + 0.3 },
    { s: "Cy", c: "Fir", kind: "apply", at: tFir - 0.2, out: tDone },
    ...FINAL.map(([s, c]) => ({ s, c, kind: "final" as Kind, at: tDone })),
  ];
  return (
    <>
      <Headline>3. Turned down? Next choice</Headline>
      <Links links={links} />
      <Nodes hiS={t >= tBump - 0.1 && t < tDone ? { Cy: C.coral } : {}} hiC={t >= tDone ? { Oak: C.mint, Elm: C.mint, Ash: C.mint, Fir: C.mint } : {}} />
      <At x={SX} y={ROW(2) - 95}><Appear at={tBump - 0.1} out={tFir} from="slam"><Stamp size={46} rotate={-8}>BUMPED</Stamp></Appear></At>
      <At x={540} y={400}><Appear at={tDone - 0.1} from="pop"><Chip color={C.mint} size={52}>everyone placed</Chip></Appear></At>
      <Sfx name="pack/whoosh-arrow" at={tElm - 0.2} volume={0.25} />
      <Sfx name="pack/hit-low" at={tBump} volume={0.35} />
      <Sfx name="pack/wrong" at={tNo} volume={0.25} />
      <Sfx name="pack/correct" at={tDone} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const w = useW();
  const tReason = w(["reason"], 1, 2.2);
  return (
    <>
      <Headline color={C.amber}>Bumping is the trick</Headline>
      <Links links={FINAL.map(([s, c]) => ({ s, c, kind: "final" as Kind, at: 0 }))} />
      <Nodes hiS={{ Cy: C.amber }} />
      <At x={540} y={400}><Appear at={tReason - 0.2} from="pop"><Text size={50} color={C.amber}>nobody breaks away. why?</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- why it's stable
const ProofBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tRather = w(["rather"], 1, 0.8), tAsked = w(["asked"], 1, 2.6), tNo = w(["no"], 1, 3.8), tTrade = w(["trade"], 1, 6.2);
  const links: L[] = [
    ...FINAL.map(([s, c]) => ({ s, c, kind: "final" as Kind, at: 0 })),
    { s: "Cy", c: "Elm", kind: "no", at: tRather }, { s: "Cy", c: "Oak", kind: "no", at: tRather + 0.25 },
  ];
  return (
    <>
      <Headline>Schools only trade up</Headline>
      <Links links={links} />
      <Nodes hiS={{ Cy: C.amber }} />
      <At x={KX - 20} y={ROW(0) - 82}><Appear at={tNo - 0.2} from="pop"><Chip color={C.coral} size={36}>said no (kept Ben)</Chip></Appear></At>
      <At x={KX - 20} y={ROW(1) + 68}><Appear at={tNo} from="pop"><Chip color={C.coral} size={36}>said no (kept Ana)</Chip></Appear></At>
      <At x={540} y={400}><Appear at={tAsked - 0.2} out={tTrade - 0.4} from="fade"><Text size={46} color={C.muted}>Cy asked them first</Text></Appear></At>
      <At x={540} y={375}><Appear at={tTrade - 0.2} from="slam"><div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Icon name="TrendingUp" size={60} color={C.amber} /><Chip color={C.amber} size={44}>a no stays a no</Chip></div></Appear></At>
      <Sfx name="pack/ding" at={tTrade} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const tSet = w(["setups"], 1, 1.4), tZero = w(["zero"], 1, 2.2), tHosp = w(["Hospitals"], 1, 3.6), t1952 = w(["1952", "nineteen"], 1, 5.2);
  return (
    <>
      <Headline color={C.amber}>Zero breakaways</Headline>
      <At x={540} y={480}><Counter from={0} to={100000} t0={0} t1={tSet} size={130} color={C.ink} /></At>
      <At x={540} y={590}><Text size={48} color={C.muted}>random setups</Text></At>
      <At x={540} y={770} style={{ width: 1000 }}><Appear at={tZero - 0.1} from="slam"><Punch at={tZero}><Text size={110} color={C.amber}>0 breakaways</Text></Punch></Appear></At>
      <At x={540} y={1010}><Appear at={tHosp - 0.2} from="up"><div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Icon name="Hospital" size={90} color={C.mint} /><Chip color={C.mint} size={50}>doctors matched since 1952</Chip></div></Appear></At>
      <Sfx name="pack/hit-grand" at={tZero} volume={0.35} />
      <Sfx name="pack/paper-flip" at={t1952} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tAsks = w(["asks"], 1, 2.0), tAns = w(["answers"], 1, 3.2);
  return (
    <>
      <Headline>Who comes out ahead?</Headline>
      <At x={540} y={560}><Appear at={Math.min(tAsks - 0.3, 0.4)} from="left"><Chip color={C.amber} size={60}>the side that asks</Chip></Appear></At>
      <At x={540} y={700}><Appear at={tAsks + 0.1} from="fade" sfx={null}><Text size={56} color={C.muted}>or</Text></Appear></At>
      <At x={540} y={840}><Appear at={Math.min(tAns - 0.3, 1.4)} from="right"><Chip color={C.mint} size={60}>the side that answers</Chip></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="apply"><ApplyBody /></Span>
    <Span from="hold"><HoldBody /></Span>
    <Span from="next"><NextBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="proof"><ProofBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
