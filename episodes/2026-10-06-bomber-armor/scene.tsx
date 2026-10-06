// "Where to armor a bomber: where the holes aren't": survivorship bias as a how-to.
import React from "react";
import {
  Appear, At, C, Camera, Card, Chip, F, Headline, Icon, Punch, Riser, Sfx, Shake,
  Span, Stamp, Text, You, tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- the bomber, top-down, nose up
// Drawn in a 760 x 640 box. Sections: wings, tail, body, engines.
const PW = 760, PH = 640;
const ENGINES = [150, 255, 505, 610]; // engine x centres, on the wing at y ~300
type Sec = "wings" | "tail" | "body" | "engines";

// deterministic pseudo-random
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const holesIn = (sec: Sec, n: number, seed: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; out.length < n && i < n * 20; i++) {
    const a = rnd(seed * 1000 + i * 2), b = rnd(seed * 1000 + i * 2 + 1);
    let x = 0, y = 0;
    if (sec === "wings") {
      x = 40 + a * 680; y = 275 + b * 60;
      if (Math.abs(x - 380) < 45) continue;                       // body
      if (ENGINES.some((e) => Math.abs(x - e) < 36)) continue;     // engines
    } else if (sec === "body") { x = 362 + a * 36; y = 70 + b * 480; if (y > 262 && y < 345) continue; }
    else if (sec === "tail") { x = 255 + a * 250; y = 560 + b * 32; if (Math.abs(x - 380) < 40) continue; }
    else { const e = ENGINES[Math.floor(a * 4)]; x = e - 14 + rnd(seed * 7 + i) * 28; y = 255 + b * 70; }
    out.push([x, y]);
  }
  return out;
};

const Plane: React.FC<{
  holes?: Partial<Record<Sec, number>>; showAt?: Partial<Record<Sec, number>>; t?: number;
  tint?: Partial<Record<Sec, string>>; ghost?: boolean; armor?: number; scale?: number;
}> = ({ holes = {}, showAt = {}, t = 99, tint = {}, ghost, armor = -1, scale = 1 }) => {
  const stroke = ghost ? C.muted : C.ink;
  const fill = (s: Sec) => ghost ? "none" : (tint[s] ? `${tint[s]}55` : C.panel);
  const sw = ghost ? 4 : 5;
  const dash = ghost ? "14 12" : undefined;
  const seeds: Record<Sec, number> = { wings: 1, tail: 2, body: 3, engines: 4 };
  const armorK = armor >= 0 ? tween(t, armor, armor + 0.5, 0, 1) : 0;
  return (
    <svg width={PW * scale} height={PH * scale} viewBox={`0 0 ${PW} ${PH}`} style={{ overflow: "visible", filter: "drop-shadow(0 20px 30px #0009)" }}>
      {/* wings */}
      <path d="M 30 300 L 380 255 L 730 300 L 730 345 L 380 330 L 30 345 Z" fill={fill("wings")} stroke={tint.wings ?? stroke} strokeWidth={sw} strokeDasharray={dash} strokeLinejoin="round" />
      {/* tail plane */}
      <path d="M 245 575 L 380 550 L 515 575 L 515 600 L 380 592 L 245 600 Z" fill={fill("tail")} stroke={tint.tail ?? stroke} strokeWidth={sw} strokeDasharray={dash} strokeLinejoin="round" />
      {/* body */}
      <rect x={350} y={40} width={60} height={570} rx={30} fill={fill("body")} stroke={tint.body ?? stroke} strokeWidth={sw} strokeDasharray={dash} />
      {/* engines */}
      {ENGINES.map((e, i) => (
        <g key={i}>
          <rect x={e - 24} y={240} width={48} height={95} rx={20} fill={fill("engines")} stroke={tint.engines ?? stroke} strokeWidth={sw} strokeDasharray={dash} />
          {armorK > 0 ? <rect x={e - 32} y={232} width={64} height={111} rx={24} fill="none" stroke={C.mint} strokeWidth={10 * armorK}
            style={{ filter: `drop-shadow(0 0 14px ${C.mint})` }} opacity={armorK} /> : null}
        </g>
      ))}
      {/* bullet holes */}
      {(Object.keys(holes) as Sec[]).map((s) => holesIn(s, holes[s] ?? 0, seeds[s]).map(([x, y], i) => {
        const t0 = (showAt[s] ?? -1) + i * 0.035;
        if (t < t0) return null;
        const k = tween(t, t0, t0 + 0.15, 1.8, 1);
        return <circle key={`${s}${i}`} cx={x} cy={y} r={7 * k} fill={C.bg} stroke={C.coral} strokeWidth={3} />;
      }))}
    </svg>
  );
};

// ---------------------------------------------------------------- 1. hook: planes keep getting shot down
const HookBody: React.FC = () => {
  const at = useAt();
  const tDown = at.word("down", 1, 2.2);
  const tArmor = at.word("armor", 1, at.dur - 0.8);
  const t = useT();
  const fleet = [0, 1, 2, 3, 4, 5, 6, 7];
  const lostIdx = [1, 4, 6];
  return (
    <>
      <Riser from={0} to={tDown} volume={0.5} />
      <Shake at={tDown}>
        <Camera keys={[[0, { zoom: 1.08 }], [tDown, { zoom: 1 }], [at.dur, { zoom: 1.06, y: 640 }]]}>
          <At x={230} y={450}><Appear at={0} from="pop"><You role="bomber engineer" size={200} /></Appear></At>
          <At x={720} y={450}>
            <Appear at={0.1} from="right" dist={140}>
              <Card w={460} h={330} border={C.coral}>
                <Icon name="Plane" size={150} color={C.ink} />
                <Text size={42} color={C.muted} font={F.med}>your bombers</Text>
              </Card>
            </Appear>
          </At>
          {fleet.map((i) => {
            const lost = lostIdx.includes(i);
            const k = lost ? tween(t, tDown + i * 0.05, tDown + 0.6 + i * 0.05, 0, 1) : 0;
            return (
              <At key={i} x={130 + i * 117} y={790 + k * 90} rotate={-45 + k * 120}>
                <Appear at={0.2 + i * 0.06} from="pop" sfx={i === 0 ? "pop" : null}>
                  <div style={{ opacity: 1 - k * 0.5 }}><Icon name="Plane" size={90} color={lost && k > 0 ? C.coral : C.ink} /></div>
                </Appear>
              </At>
            );
          })}
          <At x={540} y={1060}><Appear at={tDown} from="slam"><Stamp size={80}>SHOT DOWN</Stamp></Appear></At>
        </Camera>
      </Shake>
      <Sfx name="pack/boom-shot" hit={tDown} volume={0.45} />
      <Sfx name="whoosh" at={tArmor - 0.2} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 2. map the holes; command wants armor on them
const MapBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tWings = at.word("wings", 1, 2.2);
  const tTail = at.word("tail", 1, tWings + 0.6);
  const tBody = at.word("body", 1, tTail + 0.6);
  const tEng = at.word("engines", 1, tBody + 1.2);
  const tCmd = at.beat("command");
  const tHeavy = at.word("heavy", 1, tCmd + 2.0);
  const tSpot = at.word("spot", 1, tCmd + 3.2);
  const cmd = t >= tCmd;
  return (
    <>
      <Headline out={tCmd - 0.3}>Mark every hole</Headline>
      <Headline at={tCmd} color={C.coral}>"Armor the holes!"</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tEng - 0.2, { zoom: 1 }], [tEng + 0.4, { zoom: 1.35, x: 380, y: 620 }], [tCmd - 0.2, { zoom: 1.35, x: 380, y: 620 }], [tCmd + 0.4, { zoom: 1 }]]}>
        <At x={540} y={660}>
          <Appear at={0} from="up">
            <Plane t={t} holes={{ wings: 26, tail: 12, body: 18, engines: 2 }}
              showAt={{ wings: tWings, tail: tTail, body: tBody, engines: tEng - 0.6 }}
              tint={cmd ? { wings: C.coral, tail: C.coral, body: C.coral } : {}} />
          </Appear>
        </At>
        <At x={380} y={540}><Appear at={tEng} out={tCmd - 0.2} from="pop" sfx="pack/ding-short"><Chip size={40} color={C.mint}>engines: almost clean</Chip></Appear></At>
      </Camera>
      <At x={290} y={1080}><Appear at={tHeavy} from="drop"><div style={{ display: "flex", alignItems: "center", gap: 18 }}><Icon name="Weight" size={100} color={C.coral} /><Text size={52}>heavy</Text></div></Appear></At>
      <At x={700} y={1080}><Appear at={tSpot} from="slam"><Chip size={56}>you get 1 spot</Chip></Appear></At>
      <Sfx name="pack/click-mech" at={tWings - 0.1} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 3. where are the missing planes?
const MissingBody: React.FC = () => {
  const at = useAt();
  const tWhere = at.word("where", 1, 1.8);
  return (
    <>
      <Headline>Ask one question</Headline>
      <Camera keys={[[0, { zoom: 1.05 }], [at.dur, { zoom: 0.95 }]]}>
        <At x={540} y={520}><Appear at={0} from="fade"><div style={{ opacity: 0.9 }}><Plane scale={0.75} holes={{ wings: 26, tail: 12, body: 18, engines: 2 }} /></div></Appear></At>
        {[[250, 960], [540, 1000], [830, 960]].map(([x, y], i) => (
          <At key={i} x={x} y={y}>
            <Appear at={tWhere + i * 0.2} from="fade" sfx={null}><Plane scale={0.32} ghost /></Appear>
          </At>
        ))}
        <At x={540} y={840}><Appear at={tWhere + 0.1} from="pop" sfx="pack/whoosh-soft"><Chip size={52} color={C.amber}>the ones that didn't come back?</Chip></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 4. even fire, 25 each; count 25/25/25/10; 15 missing = 15 lost
const SECS: Sec[] = ["wings", "tail", "body", "engines"];
const LABEL: Record<Sec, string> = { wings: "wings", tail: "tail", body: "body", engines: "engines" };
const SEEN: Record<Sec, number> = { wings: 25, tail: 25, body: 25, engines: 10 };
const COL_X = (i: number) => 210 + i * 220;
const BASE_Y = 1000, UNIT = 18; // 25 hits -> 450 px

const CountBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tEven = at.beat("even");
  const t4 = at.word("4", 1, tEven + 2.6);
  const t25 = at.word("25", 1, tEven + 5.6);
  const tCount = at.beat("count");
  const tCol: Record<Sec, number> = {
    wings: at.word("wings", 1, tCount + 2.0),
    tail: at.word("tail", 1, tCount + 3.0),
    body: at.word("body", 1, tCount + 4.0),
    engines: at.word("10", 1, tCount + 5.4) - 0.3,
  };
  const tGap = at.beat("gap");
  const t15b = at.word("15", 2, tGap + 2.2);
  const tSame = at.beat("same");
  return (
    <>
      <Headline out={tCount - 0.3}>Fire lands evenly</Headline>
      <Headline at={tCount} out={tGap - 0.3}>Count the planes that landed</Headline>
      <Headline at={tGap} out={tSame - 0.3} color={C.amber}>15 hits are missing</Headline>
      <Headline at={tSame} color={C.amber}>Same 15 planes</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tGap - 0.2, { zoom: 1 }], [tGap + 0.4, { zoom: 1.15, x: 740, y: 720 }], [tSame + 0.2, { zoom: 1.15, x: 740, y: 720 }], [tSame + 0.8, { zoom: 1 }]]}>
        {/* the four sections */}
        {SECS.map((s, i) => (
          <React.Fragment key={s}>
            <At x={COL_X(i)} y={BASE_Y + 50}>
              <Appear at={0.1 + i * 0.12} from="up" sfx={i === 0 ? undefined : null}><Text size={44} font={F.med}>{LABEL[s]}</Text></Appear>
            </At>
            {/* expected 25: dashed outline */}
            <At x={COL_X(i)} y={BASE_Y - (25 * UNIT) / 2}>
              <Appear at={t4 + i * 0.1} from="up" sfx={i === 0 ? "pack/whoosh-tiny" : null}>
                <div style={{ width: 150, height: 25 * UNIT, borderRadius: 16, border: `4px dashed ${C.muted}`, boxSizing: "border-box" }} />
              </Appear>
            </At>
            {/* seen: solid bar growing */}
            {t >= tCol[s] ? (() => {
              const h = tween(t, tCol[s], tCol[s] + 0.5, 0, SEEN[s] * UNIT);
              const col = s === "engines" ? C.coral : C.mint;
              return <div style={{ position: "absolute", left: COL_X(i) - 75, top: BASE_Y - h, width: 150, height: h, borderRadius: 16,
                background: `linear-gradient(180deg, ${col}, ${col}aa)`, boxShadow: `0 0 26px ${col}66` }} />;
            })() : null}
            <At x={COL_X(i)} y={s === "engines" ? BASE_Y - 90 : BASE_Y - SEEN[s] * UNIT - 45}>
              <Appear at={tCol[s] + 0.4} from="pop" sfx={s === "engines" ? "pack/wrong" : "pack/ding-short"} volume={0.3}>
                <Text size={56} color={s === "engines" ? C.bg : C.ink}>{SEEN[s]}</Text>
              </Appear>
            </At>
          </React.Fragment>
        ))}
        <At x={540} y={440}><Appear at={t25} out={tCount - 0.2} from="pop" sfx="pack/ding"><Chip size={48}>100 planes → 25 hits each</Chip></Appear></At>
        <At x={540} y={360}><Appear at={t4} out={tCount - 0.2} from="up"><Text size={44} color={C.muted}>4 equal sections</Text></Appear></At>
        {/* the gap above the engine bar */}
        {t >= tGap ? (
          <div style={{ position: "absolute", left: COL_X(3) - 75, top: BASE_Y - 25 * UNIT, width: 150, height: 15 * UNIT, borderRadius: 16,
            background: `${C.amber}${Math.round(tween(t, tGap, tGap + 0.4, 0, 0.55) * 255).toString(16).padStart(2, "0")}`, border: `4px solid ${C.amber}` }} />
        ) : null}
        <At x={COL_X(3)} y={BASE_Y - 25 * UNIT + (15 * UNIT) / 2}><Appear at={tGap + 0.2} from="pop"><Text size={64} color={C.bg}>15</Text></Appear></At>
        <At x={720} y={440}>
          <Appear at={t15b} from="slam"><Chip size={44} color={C.coral} text={C.ink}>15 planes lost</Chip></Appear>
        </At>
      </Camera>
      <Sfx name="pack/whoosh-punchy" at={tCount - 0.1} volume={0.35} />
      <Sfx name="reveal" at={tSame} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 5. armor where the holes aren't
const FixBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tStill = at.word("fly", 1, 3.0);
  const tArmor = at.word("armor", 1, at.dur - 2.0);
  const tEng = at.word("engines", 1, at.dur - 0.8);
  return (
    <>
      <Headline out={tArmor - 0.3}>Holes = hits you survive</Headline>
      <Headline at={tArmor} color={C.mint}>Armor where the holes aren't</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tArmor, { zoom: 1 }], [tEng + 0.2, { zoom: 1.2, y: 640 }]]}>
        <At x={540} y={660}>
          <Plane t={t} holes={{ wings: 26, tail: 12, body: 18, engines: 2 }} tint={t < tArmor ? { wings: C.mint, tail: C.mint, body: C.mint } : {}} armor={tEng} />
        </At>
        <At x={540} y={1070}><Appear at={tStill} out={tArmor - 0.2} from="up"><Chip size={46} color={C.mint}>hit here → still flies</Chip></Appear></At>
        <At x={540} y={1070}><Appear at={tEng + 0.2} from="slam"><Stamp size={80} color={C.mint}>ARMOR HERE</Stamp></Appear></At>
      </Camera>
      <Sfx name="pack/slam-metal" hit={tEng + 0.1} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 6. result: planes come home with engine holes
const ResultBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tHoles = at.word("holes", 1, 1.6);
  const tGood = at.word("good", 1, at.dur - 0.8);
  return (
    <>
      <Headline>Your bombers now</Headline>
      <At x={540} y={640}>
        <Plane t={t} holes={{ wings: 14, tail: 6, body: 9, engines: 9 }} showAt={{ engines: tHoles }} armor={-0.5} scale={0.9} />
      </At>
      <At x={540} y={1060}><Appear at={tGood} from="pop" sfx="pack/win"><Chip size={52} color={C.mint}>they made it home</Chip></Appear></At>
      <Riser from={at.dur - 1.6} to={at.dur} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 7. reveal, question
const RevealBody: React.FC = () => {
  const at = useAt();
  return (
    <>
      <Punch at={0}>
        <At x={540} y={460}><Appear at={0} from="pop" sfx={null}><Icon name="Plane" size={300} color={C.amber} glow stroke={1.6} /></Appear></At>
        <At x={540} y={760}><Appear at={0.15} from="slam" sfx={null}><Text size={100} font={F.bold} color={C.amber} glow>Survivorship bias</Text></Appear></At>
        <At x={540} y={930}><Appear at={at.word("abraham", 1, 1.6)} from="up"><Text size={50}>Abraham Wald, World War II</Text></Appear></At>
      </Punch>
      <Sfx name="boom" at={0} volume={0.7} />
      <Sfx name="reveal" at={0.05} volume={0.5} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const tBetter = at.word("better", 1, 3.0);
  return (
    <>
      <At x={540} y={500}>
        <div style={{ display: "flex", gap: 40, alignItems: "flex-end" }}>
          {["Landmark", "Church", "Castle"].map((n, i) => (
            <Appear key={n} at={0.1 + i * 0.15} from="up" sfx={i === 0 ? undefined : null}><Icon name={n} size={200} color={C.ink} /></Appear>
          ))}
        </div>
      </At>
      <At x={540} y={760}><Appear at={0.5} from="pop"><Chip size={48} color={C.mint}>still standing</Chip></Appear></At>
      <At x={540} y={950}>
        <Appear at={tBetter - 0.3} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}><You size={110} /><Chip size={48}>built better?</Chip></div>
        </Appear>
      </At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="map" to="command"><MapBody /></Span>
    <Span from="missing"><MissingBody /></Span>
    <Span from="even" to="same"><CountBody /></Span>
    <Span from="fix"><FixBody /></Span>
    <Span from="result"><ResultBody /></Span>
    <Span from="reveal"><RevealBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
