// "How to count enemy tanks from 4 serial numbers": the German tank problem as a how-to.
import React from "react";
import {
  Appear, At, Bar, C, Camera, Card, Chip, Counter, Emoji, F, Headline, Icon, Punch, Riser, Sfx, Shake,
  Span, Stamp, Text, You, tween, useAt, useT,
} from "../kit";

// Number line 0..80 from x=110 to x=970 at y=LY.
const X0 = 110, X1 = 970, MAXV = 80, LY = 660;
const lx = (v: number) => X0 + (v / MAXV) * (X1 - X0);
const SEEN = [19, 40, 42, 60];

const Line: React.FC<{ show?: number }> = ({ show = 0 }) => {
  const t = useT();
  const w = tween(t, show, show + 0.5, 0, X1 - X0);
  return (
    <>
      <div style={{ position: "absolute", left: X0, top: LY - 4, width: w, height: 8, borderRadius: 4, background: C.dim }} />
      {[0, 20, 40, 60, 80].map((v) => (
        <At key={v} x={lx(v)} y={LY + 56}><Appear at={show + 0.1} from="fade"><Text size={40} color={C.muted} font={F.mono}>{v}</Text></Appear></At>
      ))}
    </>
  );
};

const Dot: React.FC<{ v: number; at: number; color?: string }> = ({ v, at, color = C.mint }) => (
  <At x={lx(v)} y={LY}>
    <Appear at={at} from="pop">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: 18, background: color, boxShadow: `0 0 20px ${color}` }} />
      </div>
    </Appear>
  </At>
);

// ---------------------------------------------------------------- 1. the problem
const HookBody: React.FC = () => {
  const at = useAt();
  const tNum = at.word("1400", 1, 2.2);
  const tReal = at.word("real", 1, tNum + 1.2);
  return (
    <>
      <Riser from={0} to={tReal} volume={0.5} />
      <Shake at={tReal}>
        <Camera keys={[[0, { zoom: 1.08 }], [tReal, { zoom: 1 }], [at.dur, { zoom: 1.08, y: 620 }]]}>
          <At x={250} y={540}><Appear at={0} from="pop"><You role="war analyst" size={220} /></Appear></At>
          <At x={730} y={540}>
            <Appear at={0.12} from="right" dist={140}>
              <Card w={460} h={460} border={C.coral}>
                <Text size={44} color={C.muted} font={F.med}>spies say</Text>
                <Counter from={0} to={1400} t0={0.3} t1={Math.max(0.8, tNum + 0.3)} size={120} color={C.coral} />
                <Text size={44} font={F.med}>tanks a month</Text>
              </Card>
            </Appear>
          </At>
          <At x={730} y={860}><Appear at={tReal} from="slam"><Stamp size={80}>REALLY?</Stamp></Appear></At>
        </Camera>
      </Shake>
      <Sfx name="whoosh" at={at.dur - 0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 2. serial numbers on captured tanks
const SerialBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tGear = at.word("gearbox", 1, 2.0);
  const tFour = at.beat("four");
  const nums = [["19", 1], ["40", 1], ["42", 1], ["60", 1]] as const;
  const times = nums.map(([n], i) => at.word(n, 1, tFour + 1.2 + i * 0.5));
  const gearOut = tween(t, tFour - 0.2, tFour + 0.2, 1, 0);
  return (
    <>
      <Headline out={tFour - 0.3}>Ignore the spies</Headline>
      <Headline at={tFour} color={C.mint}>Read the serial numbers</Headline>
      {gearOut > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: gearOut }}>
          <At x={540} y={560}>
            <Appear at={0.1} from="pop">
              <Card w={620} h={500} border={C.mint}>
                <Icon name="Cog" size={220} color={C.ink} />
                <Appear at={tGear} from="slam"><Chip size={60}>No. 00019</Chip></Appear>
              </Card>
            </Appear>
          </At>
          <At x={540} y={950}><Appear at={at.word("order", 1, tGear + 1.4)} from="up"><Text size={48} color={C.mint}>stamped in order: 1, 2, 3 …</Text></Appear></At>
        </div>
      ) : null}
      <Camera keys={[[tFour, { zoom: 1.06 }], [at.dur, { zoom: 1 }]]}>
        {SEEN.map((v, i) => (
          <At key={v} x={180 + i * 240} y={640}>
            <Appear at={times[i]} from="drop">
              <Card w={200} h={250} pad={14} border={C.mint}>
                <Icon name="Cog" size={90} color={C.muted} />
                <Text size={72} font={F.mono} color={C.mint}>{v}</Text>
              </Card>
            </Appear>
          </At>
        ))}
        <At x={540} y={940}><Appear at={times[3] + 0.4} from="fade"><Text size={46} color={C.muted}>4 captured tanks</Text></Appear></At>
      </Camera>
      <Sfx name="whoosh" at={tFour - 0.1} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 3. the biggest is a floor, not the answer
const FloorBody: React.FC = () => {
  const at = useAt();
  const tLeast = at.word("least", 1, 1.0);
  const tUh = at.word("uh", 1, 2.6);
  const tFifth = at.word("fifth", 1, tUh + 3.5);
  return (
    <>
      <Headline out={tUh - 0.2}>At least 60</Headline>
      <Headline at={tUh} color={C.coral}>Uh-oh</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tUh, { zoom: 1 }], [tUh + 1.2, { zoom: 1.15, x: 700, y: 660 }], [tFifth, { zoom: 1 }]]}>
        <Line show={0} />
        {SEEN.map((v, i) => <Dot key={v} v={v} at={0.1 + i * 0.12} color={v === 60 ? C.amber : C.mint} />)}
        <At x={lx(60)} y={LY - 110}><Appear at={tLeast} from="pop"><Chip size={46}>at least 60</Chip></Appear></At>
        <At x={720} y={LY + 160}>
          <Appear at={tUh + 0.6} from="up"><Text size={48} color={C.coral}>the last one built?</Text></Appear>
        </At>
        <At x={lx(74)} y={LY}><Appear at={tUh + 0.6} from="pop"><Text size={90} color={C.coral} font={F.bold}>?</Text></Appear></At>
        <At x={540} y={1000}><Appear at={tFifth} from="slam"><Stamp size={70}>20% TOO LOW</Stamp></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 4. gaps -> one more gap -> 74
const GapsBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t56 = at.word("56", 1, 1.6);
  const t14 = at.word("14", 1, t56 + 2.2);
  const tAdd = at.beat("add");
  const tAns = at.word("74", 1, tAdd + 3.6);
  const edges = [0, ...SEEN];
  const extra = tween(t, tAdd + 0.6, tAdd + 1.6, 0, lx(74) - lx(60));
  return (
    <>
      <Headline out={tAdd - 0.3}>Look at the gaps</Headline>
      <Headline at={tAdd} color={C.amber}>Add one more gap</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tAdd + 0.4, { zoom: 1 }], [tAdd + 1.2, { zoom: 1.12, x: 760, y: 680 }], [tAns + 0.6, { zoom: 1 }]]}>
        <Line show={0} />
        {edges.slice(1).map((v, i) => {
          const a = edges[i];
          return (
            <At key={v} x={(lx(a) + lx(v)) / 2} y={LY}>
              <Appear at={t56 + i * 0.15} from="fade">
                <div style={{ width: lx(v) - lx(a) - 40, height: 26, borderRadius: 13, background: `${C.mint}55`, border: `3px solid ${C.mint}` }} />
              </Appear>
            </At>
          );
        })}
        {SEEN.map((v) => <Dot key={v} v={v} at={0} color={v === 60 ? C.amber : C.mint} />)}
        <div style={{ position: "absolute", left: lx(60) + 20, top: LY - 13, width: Math.max(0, extra - 20), height: 26, borderRadius: 13,
          background: `${C.amber}66`, border: extra > 1 ? `3px solid ${C.amber}` : "none" }} />
        {t >= tAdd + 1.6 ? <Dot v={74} at={tAdd + 1.6} color={C.amber} /> : null}
        <At x={540} y={360}>
          <Appear at={t56} out={tAdd - 0.2} from="up">
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <Counter from={0} to={56} t0={t56} t1={t56 + 0.7} size={96} color={C.mint} />
              <Text size={50}>unseen ÷ 4 gaps =</Text>
              <Appear at={t14} from="pop"><Text size={96} color={C.amber} font={F.bold}>14</Text></Appear>
            </div>
          </Appear>
        </At>
        <At x={(lx(60) + lx(74)) / 2} y={LY - 90}><Appear at={tAdd + 1.0} from="pop"><Chip size={44}>+14</Chip></Appear></At>
        <At x={540} y={960}>
          <Appear at={tAns - 0.1} from="slam">
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Text size={64} font={F.mono}>60 + 14 =</Text>
              <Text size={130} color={C.amber} font={F.bold} glow>74</Text>
            </div>
          </Appear>
        </At>
      </Camera>
      <Sfx name="ding" at={t14} volume={0.4} />
      <Sfx name="swoosh" at={tAdd + 0.6} volume={0.4} />
      <Riser from={tAns - 1.6} to={tAns} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 5. the war: you vs the spies vs the records
const Row: React.FC<{ label: string; v: number; at: number; color: string }> = ({ label, v, at, color }) => (
  <Appear at={at} from="left">
    <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start", width: 880 }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: 880 }}>
        <Text size={48} font={F.med}>{label}</Text>
        <Counter from={0} to={v} t0={at} t1={at + 0.8} size={64} color={color} />
      </div>
      <Bar to={v / 1400} t0={at} t1={at + 0.8} w={880} h={44} color={color} />
    </div>
  </Appear>
);

const WarBody: React.FC = () => {
  const at = useAt();
  const tMath = at.word("246", 1, 2.6);
  const tSpies = at.word("1400", 1, tMath + 1.4);
  const tRes = at.beat("result");
  const t245 = at.word("245", 1, tRes + 3.2);
  return (
    <>
      <Headline out={tRes - 0.3}>Every tank you capture</Headline>
      <Headline at={tRes} color={C.mint}>After the war</Headline>
      <Camera keys={[[0, { zoom: 1.05 }], [tSpies + 0.8, { zoom: 1 }], [t245 + 0.2, { zoom: 1 }]]}>
        <At x={540} y={460}><Row label="your math" v={246} at={tMath} color={C.amber} /></At>
        <At x={540} y={660}><Row label="the spies" v={1400} at={tSpies} color={C.coral} /></At>
        <At x={540} y={860}><Row label="their own records" v={245} at={t245} color={C.mint} /></At>
        <At x={760} y={1060}><Appear at={t245 + 0.9} from="slam"><Stamp size={64} color={C.mint} rotate={-6}>OFF BY 1</Stamp></Appear></At>
      </Camera>
      <Sfx name="whoosh" at={tRes - 0.1} volume={0.4} />
      <Riser from={t245 - 1.6} to={t245} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 6. reveal + question
const RevealBody: React.FC = () => {
  const at = useAt();
  return (
    <>
      <Punch at={0}>
        <At x={540} y={480}><Appear at={0} from="pop" sfx={null}><Icon name="Cog" size={340} color={C.amber} glow stroke={1.6} /></Appear></At>
        <At x={540} y={790}><Appear at={0.15} from="slam" sfx={null}><Text size={92} font={F.bold} color={C.amber} glow>The German</Text></Appear></At>
        <At x={540} y={900}><Appear at={0.25} from="slam" sfx={null}><Text size={92} font={F.bold} color={C.amber} glow>tank problem</Text></Appear></At>
        <At x={540} y={1060}><Appear at={at.word("allied", 1, 1.8)} from="up"><Text size={48}>Allied statisticians, World War II</Text></Appear></At>
      </Punch>
      <Sfx name="boom" at={0} volume={0.7} />
      <Sfx name="reveal" at={0.05} volume={0.5} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const n = [at.word("3", 2, 1.6), at.word("7", 1, 2.0), at.word("12", 1, 2.4)];
  return (
    <>
      <At x={540} y={520}>
        <div style={{ display: "flex", gap: 40 }}>
          {[3, 7, 12].map((v, i) => (
            <Appear key={v} at={n[i]} from="drop">
              <Card w={220} h={240} pad={14} border={C.mint}>
                <Icon name="Cog" size={80} color={C.muted} />
                <Text size={80} font={F.mono} color={C.mint}>{v}</Text>
              </Card>
            </Appear>
          ))}
        </div>
      </At>
      <At x={540} y={830}>
        <Appear at={at.word("how", 1, 3.0)} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}><You size={110} /><Chip size={48}>how many tanks?</Chip></div>
        </Appear>
      </At>
      <At x={180} y={300}><Appear at={0.1} from="pop"><Emoji char="🤔" size={110} /></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="serial" to="four"><SerialBody /></Span>
    <Span from="floor"><FloorBody /></Span>
    <Span from="gaps" to="add"><GapsBody /></Span>
    <Span from="war" to="result"><WarBody /></Span>
    <Span from="reveal"><RevealBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
