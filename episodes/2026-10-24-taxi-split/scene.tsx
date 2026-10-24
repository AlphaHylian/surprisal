// "How to split a taxi fare fairly": the Shapley value as stretch-by-stretch sharing (the airport game, Littlechild & Owen 1973).
// claim hook (your 6 euro ride costs 10 split evenly) -> rule out paying the meter at your stop -> meter 6 / 18 / 30 ->
// cut at every stop, split each stretch among who's in the car: 2 each, 6 each, Mia's 12 -> re-hook: 2, 8, 20, "rigged?" ->
// proof: all 6 join orders, each pays the extra driving they add, average 2, 8, 20 -> payoff: Shapley value, runways ->
// CTA comment question (meter 12, 24, 36, 48: what does the last one pay?).
import React from "react";
import {
  Appear, At, C, Camera, Chip, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- the road: x position of a meter reading
const X0 = 120, X1 = 960;
const RIDERS = [
  { name: "You", m: 6, color: C.amber },
  { name: "Ben", m: 18, color: C.ink },
  { name: "Mia", m: 30, color: C.mint },
];
const xOf = (m: number, max = 30) => X0 + ((X1 - X0) * m) / max;

const Road: React.FC<{ y?: number; stops?: number[]; max?: number; show?: number[]; car?: number; labels?: boolean; cuts?: number }> =
  ({ y = 700, stops = [6, 18, 30], max = 30, show, car, labels = true, cuts }) => {
    const t = useT();
    return (
      <>
        <div style={{ position: "absolute", left: X0 - 20, top: y - 9, width: X1 - X0 + 40, height: 18, borderRadius: 9, background: C.dim }} />
        <div style={{ position: "absolute", left: X0, top: y - 2, width: X1 - X0, height: 4, background: `repeating-linear-gradient(90deg, ${C.muted}88 0 26px, transparent 26px 50px)` }} />
        {stops.map((m, i) => {
          const at = show ? show[i] : 0;
          if (t < at - 0.001) return null;
          const o = at <= 0.001 ? 1 : tween(t, at, at + 0.25, 0, 1);
          const cut = cuts !== undefined && t >= cuts;
          return (
            <div key={i} style={{ opacity: o }}>
              <div style={{ position: "absolute", left: xOf(m, max) - (cut ? 5 : 3), top: y - (cut ? 60 : 30), width: cut ? 10 : 6, height: cut ? 120 : 60,
                background: cut ? C.amber : C.ink, borderRadius: 4 }} />
              {labels ? <At x={xOf(m, max)} y={y - 92}><Text size={50} color={C.ink} font={F.mono}>€{m}</Text></At> : null}
            </div>
          );
        })}
        {car !== undefined ? <At x={car} y={y - 4}><Icon name="CarTaxiFront" size={96} color={C.amber} /></At> : null}
      </>
    );
  };

// a person badge: icon + name
const Rider: React.FC<{ name: string; color: string; size?: number }> = ({ name, color, size = 120 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
    <div style={{ width: size, height: size, borderRadius: "50%", border: `5px solid ${color}`, background: `${color}22`,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon name="User" size={size * 0.6} color={color} />
    </div>
    <Text size={size * 0.36} color={color}>{name}</Text>
  </div>
);

// ---------------------------------------------------------------- 1. hook: split evenly, your 6 euro ride costs 10
const HookBody: React.FC = () => {
  const at = useAt();
  const t10 = at.word("10,", 1, 1.6);
  return (
    <>
      <HookText size={100}>{"Your **€6** ride\ncosts you **€10**"}</HookText>
      <Riser to={t10} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06 }]]}>
        <At x={540} y={590}><Appear at={0} from="pop"><Text size={54} color={C.muted}>€30 ÷ 3</Text></Appear></At>
        {RIDERS.map((r, i) => (
          <At key={r.name} x={220 + i * 320} y={790}>
            <Appear at={0} from="up">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <Rider name={r.name} color={r.color} size={130} />
                <Chip size={58} color={i === 0 ? C.coral : C.dim} text={i === 0 ? C.bg : C.ink}>€10</Chip>
              </div>
            </Appear>
          </At>
        ))}
        <At x={220} y={1100}><Appear at={0} from="fade"><Text size={46} color={C.coral}>alone: €6</Text></Appear></At>
      </Camera>
      <Sfx name="pack/cash-register" at={t10 - 0.2} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out: paying the meter at your stop
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tAll = at.word("three", 1, 2.2);
  return (
    <>
      <Headline>Pay the meter at your stop?</Headline>
      <Road stops={[6]} max={30} car={xOf(6)} />
      <div style={{ position: "absolute", left: X0, top: 760, width: xOf(6) - X0, height: 22, borderRadius: 11, background: C.coral }} />
      <At x={xOf(6)} y={860}><Appear at={0.3} from="pop"><Chip size={52} color={C.coral}>You: €6</Chip></Appear></At>
      <At x={540} y={1040}>
        <Appear at={tAll - 0.2} from="up">
          <div style={{ display: "flex", gap: 30 }}>
            {RIDERS.map((r) => <Rider key={r.name} name={r.name} color={r.color} size={100} />)}
          </div>
        </Appear>
      </At>
      <At x={540} y={520}><Appear at={tAll + 0.4} from="fade"><Text size={46} color={C.muted}>all three rode this stretch</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- 3. the meter at each stop
const SetupBody: React.FC = () => {
  const at = useAt();
  const t6 = at.word("6", 1, 1.0);
  const t18 = at.word("18", 1, 2.0);
  const t30 = at.word("30", 1, 3.0);
  const t = useT();
  const car = tween(t, 0, t30 + 0.3, X0 - 40, X1);
  return (
    <>
      <Headline>Three stops</Headline>
      <Road show={[t6 - 0.15, t18 - 0.15, t30 - 0.15]} car={car} />
      {RIDERS.map((r, i) => (
        <At key={r.name} x={xOf(r.m)} y={890}>
          <Appear at={[t6, t18, t30][i] - 0.1} from="up"><Rider name={r.name} color={r.color} size={100} /></Appear>
        </At>
      ))}
      <Sfx name="pack/whoosh-long" at={0} dur={2.5} volume={0.2} />
    </>
  );
};

// ---------------------------------------------------------------- 4-5. cut at every stop, split each stretch among who's in the car
const Stretch: React.FC<{ m0: number; m1: number; riders: number; at: number; label: string; color: string; y?: number }> =
  ({ m0, m1, riders, at, label, color, y = 700 }) => {
    const t = useT();
    if (t < at - 0.001) return null;
    const w = tween(t, at, at + 0.4, 0, 1);
    return (
      <>
        <div style={{ position: "absolute", left: xOf(m0) + 8, top: y + 46, width: (xOf(m1) - xOf(m0) - 16) * w, height: 22, borderRadius: 11, background: color }} />
        {Array.from({ length: riders }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: (xOf(m0) + xOf(m1)) / 2 - (riders * 48) / 2 + i * 48, top: y + 90, opacity: w }}>
            <Icon name="User" size={44} color={color} />
          </div>
        ))}
        <At x={(xOf(m0) + xOf(m1)) / 2} y={y + 200}><Appear at={at + 0.2} from="pop"><Text size={44} color={color}>{label}</Text></Appear></At>
      </>
    );
  };

const SplitBody: React.FC = () => {
  const at = useAt();
  const tCut = at.word("Cut", 1, 0.3);
  const tSplit = at.word("Split", 1, 1.6);
  const tEach = at.word("each.", 2, 5.5);
  const tRest = at.beat("rest");
  const t12a = at.word("12:", 1, tRest + 0.4);
  const tLast = at.word("last", 1, tRest + 2.4);
  return (
    <>
      <Headline out={tRest - 0.3}>Cut at every stop</Headline>
      <Headline at={tRest} color={C.amber}>Split among who's in the car</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tSplit, { zoom: 1 }], [tSplit + 0.6, { zoom: 1.35, x: 260, y: 780 }], [t12a - 0.3, { zoom: 1.35, x: 260, y: 780 }], [t12a + 0.4, { zoom: 1, x: 540, y: 740 }]]}>
        <Road y={640} cuts={tCut} />
        <Stretch m0={0} m1={6} riders={3} at={tSplit + 0.3} label="€2 each" color={C.amber} y={640} />
        <Stretch m0={6} m1={18} riders={2} at={t12a - 0.1} label="€6 each" color={C.ink} y={640} />
        <Stretch m0={18} m1={30} riders={1} at={tLast - 0.1} label="€12: Mia" color={C.mint} y={640} />
      </Camera>
      <Sfx name="pack/pencil" at={tCut} volume={0.4} />
      <Sfx name="pack/cash-ting" at={tEach} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 6. re-hook: 2, 8, 20, "rigged?"
const RehookBody: React.FC = () => {
  const at = useAt();
  const t2 = at.word("2.", 1, 0.5);
  const t8 = at.word("8.", 1, 1.2);
  const t20 = at.word("20.", 1, 2.0);
  const tRig = at.word("rigged.", 1, 3.0);
  const amounts = [[2, t2], [8, t8], [20, t20]] as const;
  return (
    <Shake at={tRig}>
      <Headline>Who pays what</Headline>
      {RIDERS.map((r, i) => (
        <At key={r.name} x={220 + i * 320} y={720}>
          <Appear at={amounts[i][1] - 0.15} from="up">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <Rider name={r.name} color={r.color} size={130} />
              <Text size={110} color={i === 2 ? C.mint : i === 0 ? C.amber : C.ink}>€{amounts[i][0]}</Text>
            </div>
          </Appear>
        </At>
      ))}
      <At x={760} y={1040}><Appear at={tRig - 0.2} from="slam"><Stamp size={70} rotate={-6}>RIGGED?</Stamp></Appear></At>
    </Shake>
  );
};

// ---------------------------------------------------------------- 7. proof: every join order, the extra driving each adds, averaged
const ORDERS: string[][] = [["You", "Ben", "Mia"], ["You", "Mia", "Ben"], ["Ben", "You", "Mia"], ["Ben", "Mia", "You"], ["Mia", "You", "Ben"], ["Mia", "Ben", "You"]];
const M: Record<string, number> = { You: 6, Ben: 18, Mia: 30 };
const extra = (o: string[]) => { let s = 0; const r: Record<string, number> = {}; o.forEach((p) => { const m = Math.max(s, M[p]); r[p] = m - s; s = m; }); return r; };

const ProofBody: React.FC = () => {
  const at = useAt();
  const t6 = at.word("6", 1, 1.0);
  const tExtra = at.word("extra", 1, 3.2);
  const tAvg = at.word("Average", 1, 5.2);
  const tShow = [at.word("2,", 1, tAvg + 0.6), at.word("8,", 1, tAvg + 1.0), at.word("20.", 1, tAvg + 1.4)];
  const t = useT();
  const cols = ["You", "Ben", "Mia"];
  const colX = [470, 690, 910];
  return (
    <>
      <Headline out={tAvg - 0.3}>Every order you could join</Headline>
      <Headline at={tAvg} color={C.amber}>Average it</Headline>
      {cols.map((c, j) => (
        <At key={c} x={colX[j]} y={400}><Text size={44} color={RIDERS[j].color}>{c}</Text></At>
      ))}
      {ORDERS.map((o, i) => {
        const e = extra(o);
        const ti = t6 - 0.3 + i * 0.12;
        return (
          <At key={i} x={540} y={480 + i * 86}>
            <Appear at={ti} from="left" sfx={i === 0 ? undefined : null}>
              <div style={{ display: "flex", alignItems: "center", width: 960 }}>
                <Text size={40} color={C.muted} font={F.mono} style={{ width: 300, textAlign: "left" }}>{o.map((p) => p[0]).join(" → ")}</Text>
                {cols.map((c, j) => (
                  <div key={c} style={{ width: 220, opacity: tween(t, tExtra - 0.2 + i * 0.08, tExtra + i * 0.08, 0, 1) }}>
                    <Text size={46} font={F.mono} color={e[c] ? C.ink : C.dim}>{e[c]}</Text>
                  </div>
                ))}
              </div>
            </Appear>
          </At>
        );
      })}
      <div style={{ position: "absolute", left: 340, top: 1000, width: 680, height: 4, background: C.muted, opacity: tween(t, tAvg - 0.2, tAvg, 0, 1) }} />
      {[2, 8, 20].map((v, j) => (
        <Punch key={j} at={tShow[j]} amount={0.03}>
          <At x={colX[j]} y={1070}>
            <Appear at={tShow[j] - 0.12} from="pop"><Text size={72} color={C.amber} glow>{v}</Text></Appear>
          </At>
        </Punch>
      ))}
      <At x={190} y={1070}><Appear at={tAvg + 0.3} from="fade"><Text size={50} color={C.muted}>÷ 6 =</Text></Appear></At>
      <Sfx name="pack/kaching" at={tShow[2]} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 8. payoff: Shapley value, runways
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tRun = at.word("Runways", 1, 1.6);
  const tFirst = at.word("first", 1, 4.0);
  const tJumbo = at.word("jumbos", 1, 5.2);
  const t = useT();
  const y = 860;
  const small = tween(t, tFirst - 0.3, tFirst + 0.6, 140, 360);
  const big = tween(t, tJumbo - 0.3, tJumbo + 0.9, 140, 920);
  return (
    <>
      <At x={540} y={420}><Appear at={0.05} from="pop"><Text size={96} font={F.display} color={C.amber} glow>The Shapley value</Text></Appear></At>
      <Appear at={tRun - 0.2} from="up">
        <div style={{ position: "absolute", left: 120, top: y - 40, width: 840, height: 80, borderRadius: 10, background: C.dim }} />
        <div style={{ position: "absolute", left: 120, top: y - 40, width: 280, height: 80, borderRadius: 10, background: `${C.amber}55` }} />
        <div style={{ position: "absolute", left: 400, top: y - 40, width: 280, height: 80, background: `${C.ink}22` }} />
        <div style={{ position: "absolute", left: 680, top: y - 40, width: 280, height: 80, borderRadius: 10, background: `${C.mint}44` }} />
        <At x={540} y={y + 90}><Text size={44} color={C.muted}>runway</Text></At>
      </Appear>
      {t >= tFirst - 0.3 ? <At x={small} y={y - 120}><Icon name="Plane" size={80} color={C.amber} /></At> : null}
      {t >= tJumbo - 0.3 ? <At x={big} y={y - 210}><Icon name="Plane" size={150} color={C.mint} /></At> : null}
      <At x={540} y={1100}><Appear at={tJumbo + 0.2} from="fade"><Text size={42} color={C.muted}>Littlechild & Owen, 1973</Text></Appear></At>
      <Sfx name="reveal" at={0.05} volume={0.4} />
      <Sfx name="pack/whoosh-long" at={tJumbo - 0.3} dur={1.4} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 9. CTA: four riders, what does the last one pay?
const CtaBody: React.FC = () => {
  const at = useAt();
  const tLast = at.word("last", 1, 3.6);
  return (
    <>
      <Headline>Four riders</Headline>
      <Road stops={[12, 24, 36, 48]} max={48} show={[0.1, 0.4, 0.7, 1.0]} car={X0 - 40} />
      <At x={540} y={900}><Appear at={tLast - 0.2} from="pop"><Chip size={56}>the last one pays: €?</Chip></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="setup"><SetupBody /></Span>
    <Span from="cut" to="rest"><SplitBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="proof"><ProofBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
