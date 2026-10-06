// "How to run Secret Santa so nobody draws themselves": derangements and the circle trick as a how-to.
import React from "react";
import {
  Appear, At, C, Camera, Card, Chip, Counter, Emoji, F, Headline, Icon, Punch, Riser, Sfx, Shake,
  Span, Stamp, Text, You, tween, useAt, useT,
} from "../kit";

const NAMES = ["Ana", "Ben", "Cara", "Dev", "Eli", "Fay", "Gus", "Hana", "Ivo", "Jo"];

/** A folded paper slip with a name on it. */
const Slip: React.FC<{ name: string; color?: string; size?: number }> = ({ name, color = C.ink, size = 44 }) => (
  <div style={{ background: "#F7F2E4", color: C.bg, fontFamily: F.bold, fontSize: size, padding: `${size * 0.2}px ${size * 0.5}px`,
    borderRadius: 10, border: `4px solid ${color}`, boxShadow: "0 12px 26px #0009", transform: "rotate(-3deg)", whiteSpace: "nowrap" }}>{name}</div>
);

// deterministic "random" draws for the 100-hat grid: 63 bad, 37 clean
const rnd = (i: number) => { const x = Math.sin(i * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };
const BAD = (() => {
  const idx = Array.from({ length: 100 }, (_, i) => i).sort((a, b) => rnd(a) - rnd(b));
  return new Set(idx.slice(0, 63));
})();

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tOwn = at.word("own", 1, 2.6);
  return (
    <>
      <Riser from={0} to={tOwn} volume={0.5} />
      <Shake at={tOwn}>
        <Camera keys={[[0, { zoom: 1.08 }], [tOwn, { zoom: 1 }], [at.dur, { zoom: 1.06, y: 640 }]]}>
          <At x={230} y={460}><Appear at={0} from="pop"><You role="organizer" size={200} /></Appear></At>
          <At x={720} y={460}>
            <Appear at={0.1} from="right" dist={140}>
              <Card w={460} h={330} border={C.coral}>
                <Icon name="Gift" size={150} color={C.ink} />
                <Text size={42} color={C.muted} font={F.med}>office draw</Text>
              </Card>
            </Appear>
          </At>
          <At x={330} y={830}><Appear at={0.3} from="up"><Text size={54} font={F.med}>Ben draws…</Text></Appear></At>
          <At x={720} y={830}><Appear at={Math.max(0.6, tOwn - 0.5)} from="drop"><Slip name="Ben" size={70} color={C.coral} /></Appear></At>
          <At x={540} y={1060}><Appear at={tOwn} from="slam"><Stamp size={84}>OWN NAME</Stamp></Appear></At>
        </Camera>
      </Shake>
      <Sfx name="pack/paper-flip" at={0.4} volume={0.4} />
      <Sfx name="pack/wrong" hit={tOwn + 0.05} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 2. 10 names in a hat: 63% bad, 37% clean
const HatBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tHat = at.word("hat", 1, 1.4);
  const t63 = at.word("63%", 1, at.beat("why") - 1.0);
  const tWhy = at.beat("why");
  const tOne = at.word("one", 1, tWhy + 0.6);
  const t37 = at.word("37%", 1, tWhy + 5.0);
  const gridOn = t63 - 1.6;
  const DOT = 46, GAP = 14, GX = 540 - (10 * DOT + 9 * GAP) / 2 + DOT / 2, GY = 650;
  return (
    <>
      <Headline out={tWhy - 0.3}>10 names, one hat</Headline>
      <Headline at={tWhy} color={C.mint}>Only 37% come out clean</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t37 - 0.3, { zoom: 1 }], [t37 + 0.3, { zoom: 1.05 }]]}>
        {/* the hat and the slips (before the grid) */}
        <At x={540} y={520}><Appear at={0} out={gridOn - 0.2} from="pop"><Emoji char="🎩" size={260} /></Appear></At>
        {NAMES.map((n, i) => (
          <At key={n} x={140 + (i % 5) * 200} y={760 + Math.floor(i / 5) * 110}>
            <Appear at={tHat + i * 0.06} out={gridOn - 0.2} from="drop" sfx={i % 3 === 0 ? "pack/paper-slide" : null} volume={0.2}><Slip name={n} size={40} /></Appear>
          </At>
        ))}
        {/* 100 draws: coral = someone drew their own */}
        {Array.from({ length: 100 }, (_, i) => {
          const x = GX + (i % 10) * (DOT + GAP), y = GY - 4.5 * (DOT + GAP) + Math.floor(i / 10) * (DOT + GAP);
          const t0 = gridOn + i * 0.012;
          if (t < t0) return null;
          const bad = BAD.has(i);
          const colorOn = t >= t63 - 0.3;
          const dim = t >= tWhy + 0.2 && bad && t >= t37 - 0.3;
          const col = colorOn ? (bad ? C.coral : C.mint) : C.muted;
          return <div key={i} style={{ position: "absolute", left: x - DOT / 2, top: y - DOT / 2, width: DOT, height: DOT, borderRadius: 10,
            background: col, opacity: dim ? 0.25 : tween(t, t0, t0 + 0.15, 0, 1), boxShadow: `0 0 12px ${col}55` }} />;
        })}
        <Ticks100 t0={gridOn} />
        <At x={540} y={1060}>
          <Appear at={t63 - 0.3} out={tWhy - 0.2} from="up">
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Counter from={0} to={63} t0={t63 - 0.3} t1={t63 + 0.2} size={110} color={C.coral} suffix="%" />
              <Text size={44} font={F.med}>someone pulls<br />their own</Text>
            </div>
          </Appear>
        </At>
        <At x={540} y={1040}><Appear at={tOne} out={t37 - 0.2} from="pop"><Chip size={50} color={C.amber}>each person: 1 in 10</Chip></Appear></At>
        <At x={540} y={1070}>
          <Appear at={t37} from="slam">
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Text size={110} color={C.mint}>37%</Text><Text size={44} font={F.med}>nobody<br />does</Text>
            </div>
          </Appear>
        </At>
      </Camera>
    </>
  );
};
const Ticks100: React.FC<{ t0: number }> = ({ t0 }) => <Sfx name="pack/loading" at={t0} dur={1.2} volume={0.18} />;

// ---------------------------------------------------------------- 3. more people: still 63%
const BiggerBody: React.FC = () => {
  const at = useAt();
  const t100 = at.word("100", 1, 1.6);
  const t1000 = at.word("1,000", 1, t100 + 1.6);
  const rows: [string, number][] = [["10 people", 0.2], ["100 people", t100], ["1,000 people", t1000]];
  return (
    <>
      <Headline>Invite more people?</Headline>
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06 }]]}>
        {rows.map(([label, t0], i) => (
          <At key={label} x={540} y={520 + i * 200}>
            <Appear at={t0} from="left" dist={120}>
              <div style={{ display: "flex", alignItems: "center", gap: 30, width: 900 }}>
                <Text size={52} font={F.med} style={{ width: 380, textAlign: "right" }}>{label}</Text>
                <div style={{ width: 300, height: 60, borderRadius: 30, background: C.dim, overflow: "hidden" }}>
                  <div style={{ width: "63%", height: "100%", background: C.coral, borderRadius: 30 }} />
                </div>
                <Text size={64} color={C.coral}>63%</Text>
              </div>
            </Appear>
          </At>
        ))}
        <At x={540} y={1100}><Appear at={t1000 + 0.6} from="pop" sfx="pack/ding-short"><Chip size={44} color={C.amber}>it never drops: 1 − 1/e</Chip></Appear></At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 4. redraw: almost 3 rounds
const RedrawBody: React.FC = () => {
  const at = useAt();
  const t3 = at.word("3", 1, 2.4);
  return (
    <>
      <Headline>Redraw until it works</Headline>
      <Camera keys={[[0, { zoom: 1.04 }], [at.dur, { zoom: 1 }]]}>
        {[0, 1, 2].map((i) => (
          <At key={i} x={250 + i * 290} y={600}>
            <Appear at={0.3 + i * 0.45} from="pop" sfx="pack/paper-crumple" volume={0.3}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <Emoji char="🎩" size={150} />
                <Text size={44} font={F.med} color={i < 2 ? C.coral : C.mint}>round {i + 1}</Text>
              </div>
            </Appear>
          </At>
        ))}
        <At x={540} y={900}>
          <Appear at={t3 - 0.4} from="up">
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Text size={50} font={F.med}>average</Text>
              <Counter from={1} to={2.72} t0={t3 - 0.4} t1={t3 + 0.1} decimals={2} size={110} color={C.amber} />
              <Text size={50} font={F.med}>rounds</Text>
            </div>
          </Appear>
        </At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 5. even a clean draw: Ben and Cara drew each other
const PairBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tBen = at.word("ben", 1, 2.0);
  const tCara = at.word("cara", 2, tBen + 1.2);
  const t2 = at.word("2", 1, at.dur - 2.0);
  const p1 = tween(t, tBen, tBen + 0.5, 0, 1), p2 = tween(t, tCara, tCara + 0.5, 0, 1);
  return (
    <>
      <Headline color={C.coral}>Uh-oh</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tCara + 0.4, { zoom: 1.12, y: 620 }], [t2 - 0.2, { zoom: 1 }]]}>
        <At x={250} y={600}><Appear at={0.2} from="left"><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}><Icon name="User" size={160} /><Text size={52}>Ben</Text></div></Appear></At>
        <At x={830} y={600}><Appear at={0.35} from="right"><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}><Icon name="User" size={160} /><Text size={52}>Cara</Text></div></Appear></At>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <path d="M 360 540 Q 540 440 720 540" fill="none" stroke={C.amber} strokeWidth={10} strokeLinecap="round" strokeDasharray={420} strokeDashoffset={420 * (1 - p1)} />
          {p1 > 0.97 ? <polygon points="0,-18 34,0 0,18" fill={C.amber} transform="translate(720,540) rotate(30)" /> : null}
          <path d="M 720 680 Q 540 780 360 680" fill="none" stroke={C.amber} strokeWidth={10} strokeLinecap="round" strokeDasharray={420} strokeDashoffset={420 * (1 - p2)} />
          {p2 > 0.97 ? <polygon points="0,-18 34,0 0,18" fill={C.amber} transform="translate(360,680) rotate(210)" /> : null}
        </svg>
        <At x={540} y={460}><Appear at={tBen + 0.3} from="pop" sfx={null}><Emoji char="🎁" size={80} /></Appear></At>
        <At x={540} y={760}><Appear at={tCara + 0.3} from="pop" sfx={null}><Emoji char="🎁" size={80} /></Appear></At>
        <At x={540} y={940}><Appear at={tCara + 0.7} out={t2 - 0.2} from="slam"><Stamp size={70}>THEY BOTH KNOW</Stamp></Appear></At>
        <At x={540} y={1000}><Appear at={t2} from="up"><Chip size={50} color={C.coral} text={C.ink}>2 in 5 clean draws</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/whoosh-arrow" hit={tBen + 0.3} volume={0.35} />
      <Sfx name="pack/whoosh-arrow" hit={tCara + 0.3} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 6. the circle
const R = 330, CX = 540, CY = 680;
const pos = (i: number, n = 10) => {
  const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
  return [CX + R * Math.cos(a), CY + R * Math.sin(a)] as const;
};
const CircleBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tShuffle = at.word("shuffle", 1, 1.4);
  const tCircle = at.word("circle", 1, tShuffle + 1.0);
  const tNext = at.word("next", 1, tCircle + 1.4);
  const tWorks = at.beat("works");
  const tFirst = at.word("first", 1, tWorks + 4.5);
  // the order around the circle (a fixed "shuffle")
  const ORDER = [0, 6, 3, 9, 1, 7, 4, 2, 8, 5];
  return (
    <>
      <Headline out={tWorks - 0.3}>Throw out the hat</Headline>
      <Headline at={tWorks} color={C.mint}>Nobody gets their own</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tWorks, { zoom: 1 }], [tWorks + 0.6, { zoom: 1.04 }], [tFirst, { zoom: 0.97 }]]}>
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {ORDER.map((_, k) => {
            const t0 = tNext + k * 0.12;
            const p = tween(t, t0, t0 + 0.35, 0, 1);
            if (p <= 0) return null;
            const a0 = -Math.PI / 2 + (2 * Math.PI * k) / 10 + 0.2, a1 = -Math.PI / 2 + (2 * Math.PI * (k + 1)) / 10 - 0.2;
            const am = a0 + (a1 - a0) * p;
            const rr = R + 4;
            const x0 = CX + rr * Math.cos(a0), y0 = CY + rr * Math.sin(a0), x1 = CX + rr * Math.cos(am), y1 = CY + rr * Math.sin(am);
            const ang = (am * 180) / Math.PI + 90;
            return (
              <g key={k}>
                <path d={`M ${x0} ${y0} A ${rr} ${rr} 0 0 1 ${x1} ${y1}`} fill="none" stroke={C.mint} strokeWidth={9} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${C.mint})` }} />
                {p > 0.95 ? <polygon points="0,-14 26,0 0,14" fill={C.mint} transform={`translate(${x1},${y1}) rotate(${ang})`} /> : null}
              </g>
            );
          })}
        </svg>
        {ORDER.map((ni, k) => {
          const [x, y] = pos(k);
          // before "circle": the slips sit in a messy pile, then fly to their seat
          const p = tween(t, tCircle + k * 0.04, tCircle + 0.6 + k * 0.04, 0, 1);
          const px = 540 + (rnd(ni) - 0.5) * 420, py = 680 + (rnd(ni + 50) - 0.5) * 360;
          return (
            <At key={ni} x={px + (x - px) * p} y={py + (y - py) * p} rotate={(1 - p) * (rnd(ni + 9) - 0.5) * 50}>
              <Appear at={0.1 + k * 0.05} from="pop" sfx={k === 0 ? "pack/paper-flip" : null}><Slip name={NAMES[ni]} size={40} /></Appear>
            </At>
          );
        })}
        <At x={CX} y={CY}><Appear at={tNext + 1.2} from="pop" sfx={null}><Emoji char="🎁" size={120} /></Appear></At>
        <At x={540} y={1110}><Appear at={tFirst} from="slam"><Stamp size={64} color={C.mint} rotate={-6}>FIRST TRY</Stamp></Appear></At>
      </Camera>
      <Sfx name="pack/paper-slide" at={tShuffle} volume={0.4} />
      <Sfx name="pack/riser-ascend" at={tNext} volume={0.25} dur={1.5} />
    </>
  );
};

// ---------------------------------------------------------------- 7. result, reveal, question
const ResultBody: React.FC = () => {
  const at = useAt();
  const tZero = at.word("zero", 1, 1.6);
  const tLoop = at.word("loop", 1, at.dur - 0.6);
  return (
    <>
      <Headline>Your office party</Headline>
      <At x={540} y={540}><Appear at={0} from="pop"><Emoji char="🎁" size={220} /></Appear></At>
      <At x={540} y={820}><Appear at={0.4} from="up"><Chip size={52} color={C.mint}>1 shuffle</Chip></Appear></At>
      <At x={540} y={940}><Appear at={tZero} from="up"><Chip size={52} color={C.mint}>0 redraws</Chip></Appear></At>
      <At x={540} y={1060}><Appear at={tLoop - 0.2} from="pop" sfx="pack/win"><Chip size={52}>1 big loop</Chip></Appear></At>
      <Riser from={at.dur - 1.6} to={at.dur} volume={0.45} />
    </>
  );
};

const RevealBody: React.FC = () => {
  const at = useAt();
  return (
    <>
      <Punch at={0}>
        <At x={540} y={470}><Appear at={0} from="pop" sfx={null}><Icon name="Shuffle" size={300} color={C.amber} glow stroke={1.6} /></Appear></At>
        <At x={540} y={770}><Appear at={at.word("derangement", 1, 2.4) - 0.1} from="slam" sfx={null}><Text size={110} font={F.bold} color={C.amber} glow>Derangement</Text></Appear></At>
        <At x={540} y={940}><Appear at={at.word("pierre", 1, 3.4)} from="up"><Text size={50}>Pierre de Montmort, 1708</Text></Appear></At>
      </Punch>
      <Sfx name="boom" at={at.word("derangement", 1, 2.4) - 0.1} volume={0.6} />
      <Sfx name="reveal" at={0.05} volume={0.4} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const at = useAt();
  const tSub = at.word("subscribe", 1, at.dur - 1.6);
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => {
        const a = -Math.PI / 2 + (2 * Math.PI * i) / 6;
        return (
          <At key={i} x={540 + 200 * Math.cos(a)} y={560 + 200 * Math.sin(a)}>
            <Appear at={0.1 + i * 0.1} from="pop" sfx={i === 0 ? "pop" : null}><Icon name="User" size={100} /></Appear>
          </At>
        );
      })}
      <At x={540} y={560}><Appear at={0.8} from="pop"><Text size={110} color={C.amber}>?</Text></Appear></At>
      <At x={540} y={900}>
        <Appear at={1.0} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}><You size={110} /><Chip size={48}>how many circles?</Chip></div>
        </Appear>
      </At>
      <At x={540} y={1100}><Appear at={tSub} from="fade"><Text size={40} color={C.muted} font={F.med}>two a day</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="hat" to="why"><HatBody /></Span>
    <Span from="bigger"><BiggerBody /></Span>
    <Span from="redraw"><RedrawBody /></Span>
    <Span from="pair"><PairBody /></Span>
    <Span from="circle" to="works"><CircleBody /></Span>
    <Span from="result"><ResultBody /></Span>
    <Span from="reveal"><RevealBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
