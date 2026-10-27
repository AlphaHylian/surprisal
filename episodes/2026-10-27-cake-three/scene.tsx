// "How to cut a cake fairly for three people": cut and choose, and the Dubins-Spanier moving knife (1961).
// versus hook (2 friends: fair / 3 friends: robbed) -> rule out cheating -> two: you cut, friend picks -> three:
// Ben grabs the frosted piece Mia wanted, a quarter each left for her -> re-hook: nobody under a third? ->
// moving knife, yell stop at a third -> the quiet ones value the rest at 2/3+ -> last two cut and choose ->
// payoff: everyone a third or more by their own eyes -> CTA: four friends, when do you yell? (a quarter).
import React from "react";
import {
  Appear, At, C, Camera, Chip, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- the cake (top view of a sheet cake)
const X0 = 140, W = 800, H = 300;
const cx = (f: number) => X0 + f * W;
type Shade = { a: number; b: number; color: string };
const Cake: React.FC<{ cy?: number; cuts?: number[]; shade?: Shade[]; frost?: [number, number]; knife?: number; knifeColor?: string }> =
  ({ cy = 680, cuts = [], shade = [], frost, knife, knifeColor = C.ink }) => {
    const y0 = cy - H / 2;
    return (
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <rect x={X0} y={y0} width={W} height={H} rx={26} fill="#5a3a2a" stroke="#c89a6a" strokeWidth={6} />
        {shade.map((s, i) => (
          <rect key={i} x={cx(s.a)} y={y0} width={cx(s.b) - cx(s.a)} height={H} fill={s.color} opacity={0.35} />
        ))}
        {frost ? (
          <g>
            {Array.from({ length: 9 }).map((_, i) => {
              const fx = cx(frost[0]) + ((i % 3) + 0.5) * ((cx(frost[1]) - cx(frost[0])) / 3);
              const fy = y0 + (Math.floor(i / 3) + 0.5) * (H / 3);
              return <circle key={i} cx={fx} cy={fy} r={26} fill="#f6c1d9" stroke="#fff" strokeWidth={4} />;
            })}
          </g>
        ) : null}
        {cuts.map((f) => (
          <line key={f} x1={cx(f)} y1={y0 - 10} x2={cx(f)} y2={y0 + H + 10} stroke="#fff" strokeWidth={7} />
        ))}
        {knife !== undefined ? (
          <g>
            <line x1={cx(knife)} y1={y0 - 70} x2={cx(knife)} y2={y0 + H + 30} stroke={knifeColor} strokeWidth={10} strokeLinecap="round" />
            <rect x={cx(knife) - 14} y={y0 - 130} width={28} height={70} rx={8} fill={C.dim} stroke={knifeColor} strokeWidth={4} />
          </g>
        ) : null}
      </svg>
    );
  };

const Person: React.FC<{ name: string; color: string; size?: number }> = ({ name, color, size = 110 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
    <div style={{ width: size, height: size, borderRadius: "50%", border: `5px solid ${color}`, background: `${color}22`,
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon name="User" size={size * 0.6} color={color} />
    </div>
    <Text size={42} color={color} font={F.bold}>{name}</Text>
  </div>
);
const People: React.FC<{ y?: number; two?: boolean; at?: number }> = ({ y = 1010, two = false, at = 0 }) => (
  <At x={540} y={y}>
    <Appear at={at} from="up">
      <div style={{ display: "flex", gap: 120 }}>
        <Person name="You" color={C.mint} />
        {two ? <Person name="Friend" color={C.amber} /> : (<><Person name="Ben" color={C.ink} /><Person name="Mia" color={C.coral} /></>)}
      </div>
    </Appear>
  </At>
);

// ---------------------------------------------------------------- 1-2. hook + rule out
const HookBody: React.FC = () => {
  const at = useAt();
  const tRobbed = at.word("broken", 1, 1.6);
  return (
    <>
      <HookText size={84} y={270} out={at.dur - 0.3}>{"2 friends: fair\n3 friends: **robbed**"}</HookText>
      <Riser to={tRobbed} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05, y: 720 }]]}>
        <Cake cy={720} cuts={[1 / 3, 2 / 3]} frost={[2 / 3, 1]} shade={[{ a: 0, b: 1 / 3, color: C.coral }]} />
        <At x={cx(1 / 6)} y={720}><Appear at={0} from="pop"><Text size={84} color={C.ink} font={F.bold}>1/4</Text></Appear></At>
        <At x={cx(5 / 6)} y={920}><Appear at={0} from="pop"><Text size={44} color={C.muted}>taken</Text></Appear></At>
      </Camera>
      <At x={540} y={1060}><Appear at={tRobbed - 0.1} from="slam"><Stamp size={80} rotate={-6}>ROBBED</Stamp></Appear></At>
    </>
  );
};

const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tBreaks = at.word("breaks.", 1, 2.6);
  return (
    <>
      <Headline>Nobody cheats</Headline>
      <People y={680} at={0.05} />
      <At x={540} y={960}><Appear at={tBreaks - 0.2} from="slam"><Stamp size={80} rotate={-5} color={C.coral}>STILL BREAKS</Stamp></Appear></At>
      <Sfx name="pack/wrong" at={tBreaks - 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 3. two: you cut, friend picks
const TwoBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCut = at.word("cut", 1, 0.8);
  const tPicks = at.word("picks.", 1, 3.4);
  const tNobody = at.word("Nobody", 1, 4.2);
  return (
    <>
      <Headline>Two: you cut, they pick</Headline>
      <Cake cy={640} cuts={t >= tCut + 0.4 ? [0.5] : []} knife={t < tCut + 0.4 ? tween(t, tCut - 0.2, tCut + 0.4, 0.2, 0.5) : undefined}
        shade={t >= tPicks ? [{ a: 0.5, b: 1, color: C.amber }, { a: 0, b: 0.5, color: C.mint }] : []} />
      <At x={cx(0.25)} y={640}><Appear at={tCut + 0.4} from="pop"><Text size={72} font={F.bold}>1/2</Text></Appear></At>
      <At x={cx(0.75)} y={640}><Appear at={tCut + 0.4} from="pop"><Text size={72} font={F.bold}>1/2</Text></Appear></At>
      <People y={1030} two at={0.1} />
      <At x={540} y={850}><Appear at={tNobody - 0.2} from="pop"><Chip size={46} color={C.mint}>nobody can complain</Chip></Appear></At>
      <Sfx name="pack/whoosh-short" at={tCut - 0.1} volume={0.3} />
      <Sfx name="pack/correct" at={tNobody - 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 4-5. three breaks; re-hook
const ThreeBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCut = at.word("cut", 1, 1.0);
  const tBen = at.word("Ben", 1, 3.0);
  const tMia = at.word("Mia", 1, 4.6);
  const tQuarter = at.word("quarter", 1, 7.4);
  const tRe = at.beat("rehook");
  const tThird = at.word("third?", 1, tRe + 3.2);
  const benTook = t >= tBen + 0.3;
  return (
    <>
      <Headline out={tRe - 0.3}>Three: it breaks</Headline>
      <Headline at={tRe} color={C.amber}>Nobody under 1/3?</Headline>
      <Shake at={tQuarter}>
        <Cake cy={620} cuts={t >= tCut ? [1 / 3, 2 / 3] : []} frost={[2 / 3, 1]}
          shade={benTook ? [{ a: 2 / 3, b: 1, color: C.ink }] : []} />
      </Shake>
      {t >= tCut && t < tMia ? ["1/3", "1/3", "1/3"].map((s, i) => (
        <At key={i} x={cx((i + 0.5) / 3)} y={820}><Text size={60} color={C.mint} font={F.bold}>{s}</Text></At>
      )) : null}
      {t >= tMia ? (
        <>
          <At x={cx(1 / 6)} y={820}><Appear at={tQuarter - 0.2} from="pop"><Text size={64} color={C.coral} font={F.bold}>1/4</Text></Appear></At>
          <At x={cx(1 / 2)} y={820}><Appear at={tQuarter - 0.2} from="pop"><Text size={64} color={C.coral} font={F.bold}>1/4</Text></Appear></At>
          <At x={cx(5 / 6)} y={820}><Appear at={tMia} from="pop"><Text size={64} color={C.coral} font={F.bold}>1/2</Text></Appear></At>
          <At x={540} y={880}><Appear at={tMia} out={tRe - 0.3} from="fade"><Text size={40} color={C.coral}>to Mia</Text></Appear></At>
        </>
      ) : null}
      <People y={1040} at={0.1} />
      {t >= tRe ? <At x={540} y={1150}><Appear at={tThird - 0.3} from="fade"><Text size={40} color={C.muted}>by their own eyes</Text></Appear></At> : null}
      <Sfx name="pack/whoosh-short" at={tCut - 0.1} volume={0.3} />
      <Sfx name="pack/pop" at={tBen + 0.3} volume={0.4} />
      <Sfx name="pack/wrong" at={tQuarter} volume={0.35} />
      <Sfx name="pack/suspense-sting" at={tThird - 0.2} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 6-8. the moving knife
const KnifeBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSlide = at.word("Slide", 1, 0.3);
  const tStop = at.word("stop", 1, 5.0);
  const tQuiet = at.beat("quiet");
  const tTwo = at.word("two", 1, tQuiet + 4.4);
  const tLast = at.beat("last");
  const tChoose = at.word("choose.", 1, tLast + 1.4);
  const tHalf = at.word("Half", 1, tLast + 2.0);
  const STOP = 0.3;  // where Mia yells (a third, to her)
  const CUT2 = 0.66; // the last two cut what's left in half (to the cutter)
  const knife = t < tStop ? tween(t, tSlide, tStop, 0, STOP) : undefined;
  const cuts = [...(t >= tStop ? [STOP] : []), ...(t >= tChoose ? [CUT2] : [])];
  const shade: Shade[] = [
    ...(t >= tStop ? [{ a: 0, b: STOP, color: C.coral }] : []),
    ...(t >= tQuiet && t < tChoose ? [{ a: STOP, b: 1, color: C.mint }] : []),
    ...(t >= tChoose ? [{ a: STOP, b: CUT2, color: C.mint }, { a: CUT2, b: 1, color: C.ink }] : []),
  ];
  return (
    <>
      <Headline out={tQuiet - 0.3}>Slide the knife</Headline>
      <Headline at={tQuiet} out={tLast - 0.3}>The rest: over 2/3</Headline>
      <Headline at={tLast} color={C.mint}>Last two: cut and choose</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tStop - 0.1, { zoom: 1 }], [tStop + 0.3, { zoom: 1.06, x: cx(STOP), y: 640 }], [tQuiet, { zoom: 1, x: 540, y: 640 }]]}>
        <Cake cy={640} cuts={cuts} shade={shade} knife={knife} knifeColor={C.amber} />
      </Camera>
      {t >= tStop - 0.1 ? (
        <At x={cx(STOP / 2)} y={880}><Appear at={tStop - 0.1} from="slam"><Chip size={46} color={C.coral} text={C.bg}>Mia: STOP! 1/3</Chip></Appear></At>
      ) : null}
      {t >= tQuiet ? (
        <At x={cx((1 + STOP) / 2) + 30} y={895}><Appear at={tTwo - 0.3} from="pop"><Text size={56} color={C.mint} font={F.bold}>{t >= tHalf - 0.2 ? "1/2 of 2/3 = 1/3" : "≥ 2/3"}</Text></Appear></At>
      ) : null}
      <At x={540} y={1035}>
        <Appear at={tQuiet + 0.2} from="up">
          <div style={{ display: "flex", gap: 120 }}>
            <Person name="You" color={C.mint} size={90} />
            <Person name="Ben" color={C.ink} size={90} />
          </div>
        </Appear>
      </At>
      <Sfx name="pack/whoosh-long" at={tSlide} volume={0.25} />
      <Sfx name="pack/whistle" at={tStop - 0.1} volume={0.3} />
      <Sfx name="pack/whoosh-short" at={tChoose - 0.2} volume={0.3} />
      <Sfx name="pack/ding-short" at={tHalf} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 9. payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tEyes = at.word("eyes.", 1, 2.4);
  const tDubins = at.word("Dubins", 1, 3.0);
  return (
    <>
      <Headline color={C.amber}>Everyone: 1/3 or more</Headline>
      <Punch at={tEyes}>
        <Cake cy={640} cuts={[0.3, 0.66]} shade={[{ a: 0, b: 0.3, color: C.coral }, { a: 0.3, b: 0.66, color: C.mint }, { a: 0.66, b: 1, color: C.ink }]} />
      </Punch>
      {["Mia ≥ 1/3", "You ≥ 1/3", "Ben ≥ 1/3"].map((s, i) => (
        <At key={s} x={cx([0.15, 0.48, 0.83][i])} y={880}>
          <Appear at={0.2 + i * 0.3} from="pop"><Text size={48} color={[C.coral, C.mint, C.ink][i]} font={F.bold}>{s}</Text></Appear>
        </At>
      ))}
      <At x={540} y={1060}><Appear at={tDubins - 0.2} from="fade"><Text size={44} color={C.muted}>Dubins & Spanier, 1961</Text></Appear></At>
      <Sfx name="pack/hit-swell" hit={tEyes} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 10. CTA
const CtaBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tStop = at.word("stop?", 1, 1.6);
  return (
    <>
      <Headline>4 friends: yell when?</Headline>
      <Cake cy={640} knife={tween(t, 0, at.dur, 0, 0.2)} knifeColor={C.amber} />
      <Punch at={tStop} amount={0.06}><At x={540} y={960}><Text size={110} color={C.amber} font={F.mono}>?</Text></At></Punch>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="two"><TwoBody /></Span>
    <Span from="three" to="rehook"><ThreeBody /></Span>
    <Span from="knife" to="last"><KnifeBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
