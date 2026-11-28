// "How your spell checker fixes a typo it's never seen": Norvig's corrector (edits at distance 1 + word counts).
// claim hook -> no list of typos, it makes every mistake on purpose -> 80% are one slip (Damerau) -> teh -> undo every slip
// -> 187 guesses -> 8 real words -> re-hook: ten, tea? -> the 79,809 vs ten 219 -> bet on the common one -> recap, 7 in 10 -> CTA acress?
import React from "react";
import { Appear, At, C, Chip, Counter, F, Headline, HookText, Icon, Riser, Sfx, Span, Text, Tiles, tween, useAt, useT } from "../kit";

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tFix = at.word("fixes", 1, 2.0);
  return (
    <>
      <Riser to={tFix} volume={0.45} />
      <HookText y={290} size={100}>{"**teh** → the\nno list of typos"}</HookText>
      <At x={540} y={660}><Tiles text="teh" size={170} hi={{ 1: C.coral, 2: C.coral }} sfx={false} /></At>
      <At x={540} y={830}><Icon name="ArrowDown" size={100} color={C.muted} /></At>
      <At x={540} y={1010}><Appear at={0} from="pop"><Tiles text="the" size={170} hi={{ 0: C.mint, 1: C.mint, 2: C.mint }} sfx={false} /></Appear></At>
      <Sfx name="pack/correct" at={tFix} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const at = useAt();
  const tEvery = at.word("every", 2, 2.6), tPurpose = at.word("purpose", 1, 4.4);
  return (
    <>
      <Headline>No list of mistakes</Headline>
      <At x={540} y={560}><Appear at={0.05} from="pop"><Icon name="ListX" size={240} color={C.coral} /></Appear></At>
      <At x={540} y={860}><Appear at={tEvery - 0.4} from="up"><Text size={68}>it makes <span style={{ color: C.amber }}>every</span> mistake</Text></Appear></At>
      <At x={540} y={1010}><Appear at={tPurpose - 0.4} from="slam"><Chip color={C.amber} size={60}>on purpose</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- context: 80% one slip
const ContextBody: React.FC = () => {
  const at = useAt();
  const t80 = at.word("80%", 1, 0.8);
  const rows: [string, string, string][] = [["missing", "cat → ct", "missing"], ["extra", "cat → caat", "extra"], ["wrong", "cat → cst", "wrong"], ["swapped", "cat → act", "swapped"]];
  return (
    <>
      <At x={540} y={320}><Appear at={t80 - 0.4} from="slam"><Text size={120} color={C.amber}>80%+ <span style={{ fontSize: 64, color: C.ink }}>are one slip</span></Text></Appear></At>
      {rows.map(([label, ex, word], i) => {
        const tw = at.word(word, 1, 2.0 + i * 0.8);
        return (
          <At key={label} x={540} y={540 + i * 150}><Appear at={tw - 0.25} from="left">
            <div style={{ display: "flex", alignItems: "center", gap: 30, width: 760 }}>
              <div style={{ width: 280, fontFamily: F.med, fontSize: 52, color: C.muted }}>{label}</div>
              <div style={{ fontFamily: F.mono, fontSize: 64, color: C.ink, whiteSpace: "nowrap" }}>{ex}</div>
            </div></Appear></At>
        );
      })}
      <At x={540} y={1130}><Text size={40} color={C.muted}>Damerau, 1964</Text></At>
    </>
  );
};

// ---------------------------------------------------------------- example
const ExampleBody: React.FC = () => (
  <>
    <Headline>You typed</Headline>
    <At x={540} y={660}><Tiles text="teh" size={220} hi={{ 0: C.coral, 1: C.coral, 2: C.coral }} show={0.05} stagger={0.15} /></At>
  </>
);

// ---------------------------------------------------------------- undo every slip
const GUESSES = ["eh", "th", "te", "eth", "the", "aeh", "beh", "tah", "tbh", "tea", "ten", "ted", "tez", "tzh", "xeh", "teb", "ateh", "taeh", "tehq", "steh", "tegh", "heh", "tey", "toh",
  "twh", "tem", "tehs", "teah", "tqh", "veh", "teo", "tehy"];
const UndoBody: React.FC = () => {
  const t = useT();
  const at = useAt();
  const tDrop = at.word("drop", 1, 1.6), tSwap = at.word("swap", 1, 2.8), tTry = at.word("try", 1, 4.0);
  const shown = (i: number) => (i < 3 ? tDrop + i * 0.15 : i < 5 ? tSwap + (i - 3) * 0.15 : Math.min(tSwap + 0.7, tTry - 0.3) + (i - 5) * 0.09);
  return (
    <>
      <Headline>Undo every slip</Headline>
      <At x={540} y={360}><Tiles text="teh" size={100} hi={{ 0: C.coral, 1: C.coral, 2: C.coral }} sfx={false} /></At>
      <At x={540} y={790}><div style={{ display: "grid", gridTemplateColumns: "repeat(4, 200px)", gap: 14, justifyContent: "center" }}>
        {GUESSES.map((g, i) => (
          <div key={i} style={{ height: 62, borderRadius: 12, background: C.panel, border: `3px solid ${g === "the" ? C.mint : C.dim}`, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: F.mono, fontSize: 44, color: g === "the" ? C.mint : C.ink, opacity: tween(t, shown(i) - 0.1, shown(i) + 0.1, 0, 1) }}>{g}</div>))}
      </div></At>
      <Sfx name="pack/typing" at={Math.min(tSwap + 0.7, tTry - 0.3)} dur={2.6} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 187 guesses
const CountBody: React.FC = () => {
  const at = useAt();
  const t187 = at.word("187", 1, 0.8), tJunk = at.word("junk", 1, 2.4);
  return (
    <>
      <At x={540} y={480}><Counter from={0} to={187} t0={0.05} t1={t187 + 0.2} size={220} color={C.amber} /></At>
      <At x={540} y={650}><Text size={64} color={C.muted}>guesses</Text></At>
      <At x={540} y={880}><Appear at={tJunk - 0.4} from="up"><div style={{ display: "flex", gap: 24 }}>
        {["tzh", "tehq", "xeh", "tqh"].map((g) => <div key={g} style={{ fontFamily: F.mono, fontSize: 60, color: C.coral, textDecoration: "line-through" }}>{g}</div>)}</div></Appear></At>
      <At x={540} y={1040}><Appear at={tJunk - 0.2} from="slam"><Chip color={C.coral} size={56}>almost all junk</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- keep only real words: 8 left
const KEEP = ["the", "ten", "tea", "eh", "th", "ted", "heh", "te"];
const FilterBody: React.FC = () => {
  const t = useT();
  const at = useAt();
  const tOut = at.word("throw", 1, 0.3), t8 = at.word("8", 1, 3.4);
  const fade = tween(t, tOut + 0.2, t8 - 0.2, 1, 0.08);
  const keepIdx = new Set([4, 30, 55, 80, 101, 122, 150, 176]);
  return (
    <>
      <Headline>Keep only real words</Headline>
      <At x={540} y={620}><div style={{ display: "grid", gridTemplateColumns: "repeat(17, 46px)", gap: 6 }}>
        {Array.from({ length: 187 }).map((_, i) => <div key={i} style={{ width: 46, height: 46, borderRadius: 8,
          background: keepIdx.has(i) ? C.mint : C.muted, opacity: keepIdx.has(i) ? 1 : fade }} />)}</div></At>
      <At x={540} y={1000}><Appear at={t8 - 0.4} from="up"><div style={{ display: "flex", gap: 12, flexWrap: "wrap", width: 900, justifyContent: "center" }}>
        {KEEP.map((k) => <Chip key={k} color={C.mint} size={46}>{k}</Chip>)}</div></Appear></At>
      <Sfx name="pack/ding" at={t8} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const at = useAt();
  const tTen = at.word("ten", 1, 0.6), tTea = at.word("tea", 1, 1.0), tMean = at.word("mean", 1, 3.0);
  return (
    <>
      <Headline color={C.amber}>Which did you mean?</Headline>
      <At x={540} y={520}><Tiles text="the" size={120} sfx={false} /></At>
      <At x={540} y={720}><Appear at={tTen - 0.3} from="left"><Tiles text="ten" size={120} sfx={false} /></Appear></At>
      <At x={540} y={920}><Appear at={tTea - 0.3} from="left"><Tiles text="tea" size={120} sfx={false} /></Appear></At>
      <At x={860} y={720}><Appear at={tMean - 0.5} from="pop"><Text size={200} color={C.amber}>?</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- word counts
const CountsBody: React.FC = () => {
  const t = useT();
  const at = useAt();
  const tThe = at.word("79,809", 1, 3.6), tTen = at.word("219", 1, 5.4);
  const bar = (label: string, v: number, tt: number, y: number, color: string) => (
    <div style={{ position: "absolute", left: 90, top: y }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
        <div style={{ fontFamily: F.mono, fontSize: 60, color }}>{label}</div>
        <Appear at={tt - 0.1} from="pop"><Text size={56} color={C.muted}>{v.toLocaleString("en-US")}</Text></Appear>
      </div>
      <div style={{ width: Math.max(8, 880 * (v / 79809)) * tween(t, tt - 0.7, tt + 0.1, 0, 1), height: 70, background: color, borderRadius: 10 }} />
    </div>
  );
  return (
    <>
      <Headline>In a million words of books</Headline>
      <At x={540} y={380}><Appear at={0.05} from="pop"><Icon name="BookOpen" size={110} color={C.muted} /></Appear></At>
      {bar("the", 79809, tThe, 500, C.mint)}
      {bar("ten", 219, tTen, 720, C.coral)}
      {bar("tea", 107, tTen + 0.4, 900, C.coral)}
    </>
  );
};

// ---------------------------------------------------------------- pick
const PickBody: React.FC = () => {
  const at = useAt();
  const tThe = at.word("the", 2, 1.4);
  return (
    <>
      <Headline>Bet on the common one</Headline>
      <At x={540} y={500}><Tiles text="teh" size={110} hi={{ 0: C.coral, 1: C.coral, 2: C.coral }} sfx={false} /></At>
      <At x={540} y={800}><Appear at={tThe - 0.4} from="slam"><Tiles text="the" size={190} hi={{ 0: C.mint, 1: C.mint, 2: C.mint }} sfx={false} /></Appear></At>
      <Sfx name="pack/correct" at={tThe - 0.2} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tUndo = at.word("undo", 1, 0.2), tKeep = at.word("keep", 1, 1.2), tPick = at.word("pick", 1, 2.2), tHalf = at.word("half", 1, 5.0), t7 = at.word("7", 1, 7.6);
  const step = (n: string, label: string, tt: number, y: number) => (
    <At x={540} y={y}><Appear at={tt - 0.2} from="left"><div style={{ display: "flex", alignItems: "center", gap: 26, width: 800 }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: C.mint, color: C.bg, fontFamily: F.bold, fontSize: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
      <Text size={58}>{label}</Text></div></Appear></At>
  );
  return (
    <>
      {step("1", "undo every slip", tUndo, 330)}
      {step("2", "keep the real words", tKeep, 470)}
      {step("3", "pick the most common", tPick, 610)}
      <At x={540} y={820}><Appear at={tHalf - 0.4} from="up"><Text size={52} color={C.muted}>Peter Norvig: half a page of code</Text></Appear></At>
      <At x={540} y={1010}><Appear at={t7 - 0.4} from="slam"><Chip color={C.amber} size={64}>7 in 10 real typos fixed</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const tA = at.word("actress", 1, 3.0), tPick = at.word("pick", 1, 6.0);
  const opts = ["actress", "across", "access", "acres"];
  return (
    <>
      <Headline>Your turn</Headline>
      <At x={540} y={460}><Tiles text="acress" size={120} hi={{ 0: C.coral, 1: C.coral, 2: C.coral, 3: C.coral, 4: C.coral, 5: C.coral }} show={0.1} stagger={0.12} /></At>
      <At x={540} y={800}><div style={{ display: "grid", gridTemplateColumns: "repeat(2, 380px)", gap: 24 }}>
        {opts.map((o, i) => <Appear key={o} at={at.word(o, 1, tA + i * 0.6) - 0.2} from="pop"><div style={{ height: 110, borderRadius: 18, background: C.panel, border: `4px solid ${C.dim}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontSize: 60, color: C.ink }}>{o}</div></Appear>)}</div></At>
      <At x={540} y={1080}><Appear at={tPick - 0.5} from="up"><Text size={56} color={C.amber}>which does it pick?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="example"><ExampleBody /></Span>
    <Span from="undo"><UndoBody /></Span>
    <Span from="count"><CountBody /></Span>
    <Span from="filter"><FilterBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="counts"><CountsBody /></Span>
    <Span from="pick"><PickBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
