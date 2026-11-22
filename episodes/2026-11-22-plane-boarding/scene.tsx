// "Why boarding back to front is the slow way" (Steffen & Hotchkiss 2011). Versus hook.
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Text, tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- the cabin, seen from above
// Row 12 at the top, row 1 at the bottom (the door is below row 1). Seats A B C | aisle | D E F.
const ROWY = (r: number) => 1130 - (r - 1) * 54;
const COLX: Record<string, number> = { A: 342, B: 402, C: 462, D: 618, E: 678, F: 738 };
const AISLE = 540;
type P = { row: number; color?: string; bag?: boolean; x?: number; dy?: number };

const Cabin: React.FC<{ seated?: string[]; people?: P[]; hiRows?: number[]; dim?: number; seatColor?: string }> = ({ seated = [], people = [], hiRows = [], dim = 1, seatColor = C.mint }) => {
  const t = useT();
  const set = new Set(seated);
  const rows = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: dim }}>
      {/* hull */}
      <div style={{ position: "absolute", left: 290, top: ROWY(12) - 40, width: 500, height: ROWY(1) - ROWY(12) + 80, borderRadius: 60, border: `4px solid ${C.dim}`, background: `${C.panel}cc` }} />
      {rows.map((r) => (
        <React.Fragment key={r}>
          {Object.entries(COLX).map(([s, x]) => {
            const on = set.has(`${r}${s}`);
            return <div key={s} style={{ position: "absolute", left: x - 25, top: ROWY(r) - 22, width: 50, height: 44, borderRadius: 10,
              background: on ? seatColor : C.dim, boxShadow: on ? `0 0 14px ${seatColor}66` : "none" }} />;
          })}
          {hiRows.includes(r) ? (
            <div style={{ position: "absolute", left: 200, top: ROWY(r) - 26, width: 70, textAlign: "right", fontFamily: F.bold, fontSize: 42, color: C.amber }}>{r}</div>
          ) : null}
        </React.Fragment>
      ))}
      {people.map((p, i) => {
        const x = p.x ?? AISLE;
        const y = ROWY(p.row) + (p.dy ?? 0);
        const lift = p.bag ? 10 * Math.sin(t * 7 + i) : 0;
        const col = p.color ?? C.ink;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x - 21, top: y - 21, width: 42, height: 42, borderRadius: 21, background: col, boxShadow: `0 0 16px ${col}88` }} />
            {p.bag ? (
              <div style={{ position: "absolute", left: x + 26, top: y - 50 + lift }}><Icon name="Luggage" size={46} color={C.amber} stroke={2.4} /></div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const seats = (rows: number[], letters: string) => rows.flatMap((r) => letters.split("").map((s) => `${r}${s}`));
const range = (a: number, b: number) => Array.from({ length: Math.abs(b - a) + 1 }, (_, i) => (a < b ? a + i : a - i));
// back-to-front jam: rows 12 and 11 seated, the lead stowing at row 10, a line behind
const JAM_SEATED = seats([12, 11], "ABCDEF");
const jamPeople = (t: number, t0: number): P[] => {
  const creep = Math.max(0, Math.min(1, (t - t0) / 1.2));
  return [{ row: 10, color: C.coral, bag: true }, ...range(9, 1).map((r) => ({ row: r, color: C.coral, dy: 20 * (1 - creep) }))];
};

// ---------------------------------------------------------------- hook + rule-out
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRandom = at.word("random", 2, 2.2);
  return (
    <>
      <HookText y={290} size={88}>{"Back to front **6:11**\nRandom **4:44**"}</HookText>
      <Riser to={tRandom} volume={0.5} />
      <Camera keys={[[0, { zoom: 1.0 }], [at.dur, { zoom: 1.04 }]]}>
        <Cabin seated={JAM_SEATED} people={jamPeople(t, 0)} />
      </Camera>
      <Sfx name="pack/whoosh-fast" at={tRandom - 0.2} volume={0.35} />
    </>
  );
};

const RuleOutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSmart = at.word("smart", 1, 0.6);
  const tNobody = at.word("nobody", 1, 1.2);
  const tChaos = at.word("chaos", 1, 3.0);
  return (
    <>
      <Headline out={tChaos - 0.3}>Sounds smart</Headline>
      <At y={330}><Appear at={tNobody} out={tChaos - 0.3} from="up"><Chip color={C.mint} size={50}>nobody walks past anyone</Chip></Appear></At>
      <At y={290}><Appear at={tChaos} from="slam"><Text size={96} color={C.coral} glow>slower than chaos</Text></Appear></At>
      <Shake at={tChaos}>
        <Cabin seated={JAM_SEATED} people={jamPeople(t, tSmart)} />
      </Shake>
      <Sfx name="error" at={tChaos} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- context
const ContextBody: React.FC = () => {
  const at = useAt();
  const t72 = at.word("72", 1, 0.6);
  const t12 = at.word("12", 1, 1.3);
  const tAisle = at.word("aisle", 1, 2.0);
  const tTimed = at.word("timed", 1, 3.4);
  const t = useT();
  const fillN = Math.floor(tween(t, t72, t72 + 0.7, 0, 72));
  const all = seats(range(12, 1), "ABCDEF");
  return (
    <>
      <At x={250} y={300}><Appear at={t72} from="pop"><Chip size={50}>72 people</Chip></Appear></At>
      <At x={540} y={300}><Appear at={t12} from="pop"><Chip size={50} color={C.mint}>12 rows</Chip></Appear></At>
      <At x={820} y={300}><Appear at={tAisle} from="pop"><Chip size={50} color={C.ink}>1 aisle</Chip></Appear></At>
      <Camera keys={[[0, { zoom: 1 }], [tTimed, { zoom: 1 }], [at.dur, { zoom: 1.05, x: 540, y: 760 }]]}>
        <Cabin seated={t < tTimed ? all.slice(0, fillN) : []} hiRows={t >= t12 && t < tTimed ? [12, 1] : []} />
        <At x={540} y={760}><Appear at={tTimed} from="pop"><Icon name="Timer" size={260} color={C.amber} glow stroke={1.8} /></Appear></At>
      </Camera>
      <Sfx name="pack/clock" at={tTimed} dur={1.2} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- back to front
const BackFrontBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tBag = at.word("bag", 1, 1.4);
  const tWaits = at.word("waits", 1, 2.4);
  const t71 = at.word("71", 1, 3.6);
  const t6 = at.word("6", 1, 5.2);
  const people: P[] = [{ row: 12, color: C.coral, bag: t >= tBag - 0.3 }, ...range(11, 1).map((r) => ({ row: r, color: C.coral }))];
  return (
    <>
      <Headline out={t6 - 0.3}>Back to front</Headline>
      <Camera keys={[[0, { zoom: 1.06, x: 540, y: 520 }], [tWaits, { zoom: 1.06, x: 540, y: 520 }], [t71, { zoom: 1 }]]}>
        <Cabin people={people} hiRows={[12]} />
      </Camera>
      <At x={900} y={520}>
        <Appear at={tWaits} out={t6 - 0.2} from="right">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Counter from={0} to={71} t0={t71 - 0.6} t1={t71 + 0.2} size={96} color={C.coral} />
            <Text size={44} color={C.muted}>waits</Text>
          </div>
        </Appear>
      </At>
      <Punch at={t6 + 0.2}>
        <At y={330}><Appear at={t6} from="slam"><Text size={150} color={C.coral} glow>6:11</Text></Appear></At>
      </Punch>
      <Sfx name="pack/thud-heavy" at={tBag} volume={0.4} />
      <Sfx name="pack/clock" at={tWaits} dur={1.6} volume={0.3} />
      <Sfx name="stamp" at={t6} volume={0.5} />
    </>
  );
};

// ---------------------------------------------------------------- random
const RandomBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t12 = at.word("12", 1, 0.6);
  const t3 = at.word("3", 1, 1.0);
  const t8 = at.word("8", 1, 1.4);
  const tSame = at.word("same", 1, 2.6);
  const t4 = at.word("4", 1, 3.4);
  const seated = ["11A", "9F", "7C", "5E", "2B", "6D", "10E", "4A", "1F"];
  const people: P[] = [];
  if (t >= t12) people.push({ row: 12, color: C.amber, bag: true });
  if (t >= t3) people.push({ row: 3, color: C.amber, bag: true });
  if (t >= t8) people.push({ row: 8, color: C.amber, bag: true });
  return (
    <>
      <Headline out={t4 - 0.3} color={C.amber}>Random</Headline>
      <Cabin seated={seated} people={people} hiRows={[12, 8, 3].filter((r, i) => t >= [t12, t8, t3][i])} />
      <At x={900} y={640}><Appear at={tSame} out={t4 - 0.2} from="right"><Chip size={46}>3 at once</Chip></Appear></At>
      <Punch at={t4 + 0.2}>
        <At y={330}><Appear at={t4} from="slam"><Text size={150} color={C.amber} glow>4:44</Text></Appear></At>
      </Punch>
      <Sfx name="pop" at={t12} volume={0.4} />
      <Sfx name="pop" at={t3} volume={0.4} />
      <Sfx name="pop" at={t8} volume={0.4} />
      <Sfx name="pack/ding" at={t4} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const at = useAt();
  const tPurpose = at.word("purpose", 1, 1.6);
  return (
    <>
      <Headline out={tPurpose - 0.3} color={C.muted}>Random is luck</Headline>
      <Headline at={tPurpose} color={C.mint}>Do it on purpose</Headline>
      <Cabin dim={0.5} />
      <At y={760}><Appear at={0.1} from="pop"><Text size={220} color={C.amber} glow>?</Text></Appear></At>
      <Sfx name="pack/whoosh-fast" at={tPurpose - 0.1} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- the Steffen order
const EVEN = [12, 10, 8, 6, 4, 2];
const SteffenBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tTwo = at.word("two", 1, 1.0);
  const t12 = at.word("12", 1, 1.8);
  const t10 = at.word("10", 1, 2.5);
  const t8 = at.word("8", 1, 3.2);
  const tSix = at.word("Six", 1, 4.2);
  const tNobody = at.word("nobody", 1, 5.6);
  const shown = (r: number) => (r === 12 ? t >= t12 : r === 10 ? t >= t10 : r === 8 ? t >= t8 : t >= t8 + 0.3 + (8 - r) * 0.12);
  const people: P[] = EVEN.filter(shown).map((r) => ({ row: r, color: C.mint, bag: true }));
  const window = EVEN.filter(shown).map((r) => `${r}F`);
  return (
    <>
      <Headline out={tSix - 0.3} color={C.mint}>Two rows apart</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tTwo, { zoom: 1.2, x: 600, y: 560 }], [tSix, { zoom: 1 }]]}>
        <Cabin seated={window} seatColor={C.amber} people={people} hiRows={EVEN.filter(shown)} />
      </Camera>
      <At y={300}><Appear at={tSix} from="slam"><Text size={92} color={C.mint} glow>6 bags at once</Text></Appear></At>
      <At x={900} y={760}><Appear at={tNobody} from="right"><Icon name="CircleCheck" size={110} color={C.mint} glow /></Appear></At>
      <Sfx name="pop" at={t12} volume={0.4} />
      <Sfx name="pop" at={t10} volume={0.4} />
      <Sfx name="pop" at={t8} volume={0.4} />
      <Sfx name="pack/ding" at={tSix} volume={0.45} />
    </>
  );
};

const FillBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tWin = at.word("windows", 1, 0.8);
  const tMid = at.word("middles", 1, 1.8);
  const tAis = at.word("aisles", 1, 2.6);
  const step = (list: string[], t0: number, t1: number) => list.slice(0, Math.floor(tween(t, t0, t1, 0, list.length)));
  const s = [
    ...seats(EVEN, "F"),
    ...step([...seats(range(11, 1).filter((r) => r % 2), "F"), ...seats(range(12, 1), "A")], tWin - 0.3, tWin + 0.7),
    ...step(seats(range(12, 1), "EB"), tMid - 0.2, tMid + 0.6),
    ...step(seats(range(12, 1), "DC"), tAis - 0.2, tAis + 0.6),
  ];
  return (
    <>
      <Headline color={C.mint}>{t < tMid ? "windows" : t < tAis ? "middles" : "aisles"}</Headline>
      <Cabin seated={s} />
      <Sfx name="pack/whoosh-fast" at={tWin - 0.2} volume={0.3} />
      <Sfx name="pack/whoosh-fast" at={tMid - 0.2} volume={0.3} />
      <Sfx name="pack/whoosh-fast" at={tAis - 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- payoff + CTA
const BARS: [string, number, string, string][] = [["back to front", 371, "6:11", C.coral], ["random", 284, "4:44", C.ink], ["two rows apart", 216, "3:36", C.mint]];
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tOrder = at.word("order", 1, 2.0);
  const tOnce = at.word("once", 1, 4.4);
  return (
    <>
      <Punch at={0.2}>
        <At y={320}><Appear at={0} from="slam"><Text size={170} color={C.mint} glow>3:36</Text></Appear></At>
      </Punch>
      <At y={700}>
        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          {BARS.map(([label, s, txt, col], i) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Text size={42} color={col} style={{ textAlign: "left" }}>{label}  {txt}</Text>
              <div style={{ width: tween(t, 0.2 + i * 0.25, 0.8 + i * 0.25, 0, (s / 371) * 760), height: 44, borderRadius: 12, background: col, opacity: 0.9 }} />
            </div>
          ))}
        </div>
      </At>
      <At y={1060}><Appear at={tOnce - 0.2} from="up"><Chip size={50} color={C.amber}>bags up at once</Chip></Appear></At>
      <Sfx name="pack/boom-short" hit={0.15} volume={0.5} />
      <Sfx name="ding" at={tOnce} volume={0.4} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const tAfter = at.word("after", 1, 1.6);
  return (
    <>
      <At y={420}><Appear at={0} from="up"><Chip size={64} color={C.mint}>30 rows</Chip></Appear></At>
      <At y={680}>
        <Appear at={tAfter} from="pop">
          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <Text size={120} font={F.mono} color={C.ink}>30F</Text>
            <Icon name="ArrowRight" size={110} color={C.muted} />
            <Text size={140} color={C.amber} glow>?</Text>
          </div>
        </Appear>
      </At>
      <Sfx name="pop" at={tAfter} volume={0.4} />
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="backfront"><BackFrontBody /></Span>
    <Span from="random"><RandomBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="steffen"><SteffenBody /></Span>
    <Span from="fill"><FillBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
