// "How to cut a cake so nobody's jealous": Selfridge-Conway envy-free division for three.
// versus hook (fair: 2 cuts / no jealousy: 5 cuts) -> fair isn't envy-free: knife left someone jealous in 100,000 of 100,000
// -> you cut three -> Ben trims his favourite to tie his second -> Mia, Ben (trimmed if left), you -> re-hook: trimmings
// -> non-owner cuts trimmings in 3, owner, you, cutter -> payoff: trimmed + crumbs = one of your thirds -> CTA subscribe
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// ---- the cake: a long bar, positions u in [0,1] map to x = L + W*u
const L = 90, W = 900;
const X = (u: number) => L + W * u;
const CAKE = "linear-gradient(180deg, #F7D6E0 0%, #F7D6E0 26%, #C98B5A 27%, #B0703F 60%, #F2E3C6 61%, #F2E3C6 70%, #A9673A 71%, #8E5530 100%)";

const Seg: React.FC<{ u0: number; u1: number; y: number; h?: number; dx?: number; dy?: number; ring?: string; dim?: boolean; scale?: number }> =
  ({ u0, u1, y, h = 170, dx = 0, dy = 0, ring, dim, scale = 1 }) => (
    <div style={{ position: "absolute", left: X(u0) + dx, top: y - h / 2 + dy, width: (X(u1) - X(u0)) * scale - 6, height: h, background: CAKE, borderRadius: 18,
      border: ring ? `6px solid ${ring}` : "3px solid #00000033", boxShadow: ring ? `0 0 30px ${ring}` : "0 16px 30px #0008", opacity: dim ? 0.35 : 1 }} />
  );

const Cut: React.FC<{ u: number; y: number; h?: number; at?: number; color?: string; dx?: number }> = ({ u, y, h = 230, at = 0, color = C.amber, dx = 0 }) => {
  const t = useT();
  const k = at <= 0 ? 1 : tween(t, at, at + 0.18, 0, 1);
  return <div style={{ position: "absolute", left: X(u) - 4 + dx, top: y - h / 2, width: 8, height: h * k, background: color, borderRadius: 4, boxShadow: `0 0 16px ${color}` }} />;
};

// piece positions on the main bar
const A: [number, number] = [0, 0.30], B: [number, number] = [0.30, 0.62], Cc: [number, number] = [0.62, 1];
const TRIM = 0.69; // Ben trims Cc to [TRIM, 1]; trimmings [0.62, TRIM]

const Name: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.ink }) => (
  <div style={{ fontFamily: F.bold, fontSize: 46, color, whiteSpace: "nowrap" }}>{children}</div>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const t5 = w(["5", "five"], 1, 2.4);
  const t = useT();
  const cuts5 = [0.18, 0.37, 0.55, 0.72, 0.88];
  return (
    <>
      <HookText y={300} size={96}>{"Fair: **2 cuts**\nNo jealousy: **5 cuts**"}</HookText>
      <Riser to={t5} volume={0.45} />
      <At x={540} y={490}><Text size={44} color={C.muted}>fair</Text></At>
      <Seg u0={0} u1={1} y={590} h={140} />
      <Cut u={1 / 3} y={590} h={190} color={C.mint} />
      <Cut u={2 / 3} y={590} h={190} color={C.mint} />
      <At x={540} y={720}><Text size={44} color={C.amber}>no jealousy</Text></At>
      <Punch at={t5}><div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920 }}>
        <Seg u0={0} u1={1} y={820} h={140} />
        {cuts5.map((u, i) => <Cut key={i} u={u} y={820} h={190} at={i === 0 ? 0 : 0.12 * i} />)}
      </div></Punch>
      <At x={540 + Math.sin(t * 3) * 300} y={1000}><Icon name="Slice" size={90} color={C.ink} /></At>
      <Sfx name="pack/whoosh-swing" at={0.1} volume={0.3} />
      <Sfx name="pack/ding" at={t5} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- fair is not envy-free
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tThird = w(["third"], 1, 1.6), tKnife = w(["sliding-knife", "sliding"], 1, 2.6), tJeal = w(["jealous"], 1, 4.4), tCakes = w(["cakes"], 1, 6.6);
  const people: [string, number][] = [["Mia", 220], ["Ben", 540], ["You", 860]];
  return (
    <>
      <Headline>Fair isn't enough</Headline>
      {people.map(([n, x], i) => (
        <At key={n} x={x} y={500}><Appear at={0.1 + i * 0.15} out={tCakes - 0.8} from="pop">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <Icon name="CakeSlice" size={110} color={C.ink} /><Name>{n}</Name>
            <Appear at={tThird - 0.1 + i * 0.1} from="pop" sfx={null}><Chip color={C.mint} size={42}>⅓ ✓</Chip></Appear>
          </div></Appear></At>
      ))}
      <At x={540} y={800}><Appear at={tJeal - 0.2} out={tCakes - 0.8} from="slam"><Chip color={C.coral} size={52}>"Ben's looks bigger"</Chip></Appear></At>
      <At x={540} y={640}><Appear at={tCakes - 0.6} from="up"><Counter from={0} to={100000} t0={tCakes - 0.6} t1={tCakes + 0.4} size={130} color={C.coral} /></Appear></At>
      <At x={540} y={760}><Appear at={tCakes - 0.4} from="fade" sfx={null}><Text size={46} color={C.muted}>sliding knife: jealous every time</Text></Appear></At>
      <At x={540} y={1100}><Appear at={tKnife - 0.2} from="fade" sfx={null}><Text size={42} color={C.muted}>(the 2-cut method)</Text></Appear></At>
      <Sfx name="pack/wrong" at={tJeal} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- step 1: you cut three
const CutBody: React.FC = () => {
  const w = useW();
  const tYou = w(["you"], 1, 0.4), tCut = w(["cut"], 1, 2.2), tEq = w(["equal"], 1, 3.8);
  const people: [string, number, string][] = [["You", 220, C.mint], ["Ben", 540, C.ink], ["Mia", 860, C.ink]];
  return (
    <>
      <Headline>Step 1: you cut</Headline>
      {people.map(([n, x, col], i) => (
        <At key={n} x={x} y={430}><Appear at={tYou + i * 0.2} from="pop"><div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Icon name="User" size={70} color={col} /><Name color={col}>{n}</Name></div></Appear></At>
      ))}
      <Seg u0={0} u1={1} y={720} />
      <Cut u={0.30} y={720} at={tCut} />
      <Cut u={0.62} y={720} at={tCut + 0.5} />
      {[A, B, Cc].map(([a, b], i) => (
        <At key={i} x={X((a + b) / 2)} y={880}><Appear at={tEq + i * 0.12} from="up" sfx={i ? null : undefined}><Text size={56} color={C.mint}>⅓</Text></Appear></At>
      ))}
      <At x={540} y={1000}><Appear at={tEq + 0.4} from="fade" sfx={null}><Text size={42} color={C.muted}>to you, all three are equal</Text></Appear></At>
      <Sfx name="pack/whoosh-swing" at={tCut} volume={0.35} />
      <Sfx name="pack/whoosh-swing" at={tCut + 0.5} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- step 2: Ben trims his favourite
const TrimBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tFav = w(["favourite"], 1, 1.0), tTies = w(["ties"], 1, 2.4), tAside = w(["aside"], 1, 4.4);
  const k = tween(t, tAside - 0.4, tAside + 0.2, 0, 1);
  return (
    <>
      <Headline>Step 2: Ben trims</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tFav, { zoom: 1 }], [tFav + 0.6, { zoom: 1.15, x: 760, y: 720 }], [tAside - 0.2, { zoom: 1.15, x: 760, y: 720 }], [tAside + 0.4, { zoom: 1 }]]}>
        <Seg u0={A[0]} u1={A[1]} y={720} />
        <Seg u0={B[0]} u1={B[1]} y={720} ring={t >= tTies ? C.mint : undefined} />
        <Seg u0={t >= tTies ? TRIM : Cc[0]} u1={Cc[1]} y={720} ring={t >= tFav - 0.1 ? C.amber : undefined} />
        {t >= tTies ? <Seg u0={Cc[0]} u1={TRIM} y={720} dy={k * 330} dx={-k * 200} /> : null}
        <Cut u={TRIM} y={720} at={tTies - 0.1} color={C.ink} />
        <At x={X(0.81)} y={540}><Appear at={tFav - 0.1} from="down"><Chip color={C.amber} size={44}>Ben's favourite</Chip></Appear></At>
        <At x={X(0.46)} y={540}><Appear at={tTies} from="down"><Chip color={C.mint} size={44}>2nd favourite</Chip></Appear></At>
        <At x={X(0.81)} y={890}><Appear at={tTies + 0.2} from="up" sfx={null}><Text size={44} color={C.amber}>now a tie</Text></Appear></At>
      </Camera>
      <At x={720} y={1050}><Appear at={tAside} from="fade" sfx={null}><Text size={44} color={C.muted}>trimmings</Text></Appear></At>
      <Sfx name="pack/whoosh-swing" at={tTies - 0.1} volume={0.4} />
      <Sfx name="pack/whoosh-soft" at={tAside - 0.3} volume={0.3} />
    </>
  );
};

// pieces and their plates
const PLATE: Record<string, [number, number]> = { Mia: [220, 740], Ben: [540, 740], You: [860, 740] };
const Plate: React.FC<{ who: string; color?: string; check?: boolean }> = ({ who, color = C.ink, check }) => (
  <At x={PLATE[who][0]} y={PLATE[who][1] + 120}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Name color={color}>{who}</Name>{check ? <Icon name="Check" size={50} color={C.mint} /> : null}
    </div>
  </At>
);
// a piece flying from its bar spot (y 520) to a plate
const Flying: React.FC<{ u: [number, number]; who: string; at: number }> = ({ u, who, at }) => {
  const t = useT();
  const k = tween(t, at - 0.1, at + 0.4, 0, 1);
  const w0 = X(u[1]) - X(u[0]);
  const cx0 = (X(u[0]) + X(u[1])) / 2, cy0 = 470;
  const [px, py] = PLATE[who];
  const cx = cx0 + (px - cx0) * k, cy = cy0 + (py - cy0) * k;
  const s = 1 - 0.25 * k;
  return (
    <div style={{ position: "absolute", left: cx - (w0 * s) / 2, top: cy - 85 * s, width: w0 * s, height: 170 * s, background: CAKE, borderRadius: 18,
      border: "3px solid #00000033", boxShadow: "0 16px 30px #0008" }} />
  );
};

// ---------------------------------------------------------------- step 3: Mia, Ben, you
const PickBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tMia = w(["Mia"], 1, 0.3), tBen = w(["Ben"], 1, 1.4), tMust = w(["trimmed"], 1, 2.6), tYou = w(["last"], 1, 4.8);
  return (
    <>
      <Headline>Step 3: pick</Headline>
      <Flying u={B} who="Mia" at={tMia + 0.2} />
      <Flying u={[TRIM, 1]} who="Ben" at={tMust} />
      <Flying u={A} who="You" at={tYou - 0.2} />
      <Appear at={tMia} from="fade" sfx={null}><Plate who="Mia" /></Appear>
      <Appear at={tBen} from="fade" sfx={null}><Plate who="Ben" /></Appear>
      <Appear at={tYou - 0.3} from="fade" sfx={null}><Plate who="You" color={C.mint} /></Appear>
      <At x={540} y={360}><Appear at={tMust - 0.2} out={tYou - 0.4} from="fade" sfx={null}><Text size={44} color={C.amber}>Ben must take the trimmed one</Text></Appear></At>
      <Seg u0={Cc[0]} u1={TRIM} y={1050} dx={-200} />
      <Sfx name="pack/pop-2" at={tMia + 0.5} volume={0.35} />
      <Sfx name="pack/pop-2" at={tMust + 0.4} volume={0.35} />
      <Sfx name="pack/pop-2" at={tYou + 0.2} volume={0.35} />
    </>
  );
};

const Plated: React.FC<{ checks?: boolean }> = ({ checks }) => (
  <>
    {(["Mia", "Ben", "You"] as const).map((who) => {
      const u = who === "Mia" ? B : who === "Ben" ? ([TRIM, 1] as [number, number]) : A;
      const w0 = (X(u[1]) - X(u[0])) * 0.75;
      return <div key={who} style={{ position: "absolute", left: PLATE[who][0] - w0 / 2, top: PLATE[who][1] - 64, width: w0, height: 128, background: CAKE, borderRadius: 18,
        border: "3px solid #00000033", boxShadow: "0 16px 30px #0008" }} />;
    })}
    <Plate who="Mia" check={checks} /><Plate who="Ben" check={checks} /><Plate who="You" color={C.mint} check={checks} />
  </>
);

// ---------------------------------------------------------------- re-hook: the trimmings
const RehookBody: React.FC = () => {
  const w = useW();
  const tNob = w(["envies"], 1, 0.6), tTrim = w(["trimmings"], 1, 2.4);
  const t = useT();
  return (
    <>
      <Headline color={C.amber}>But the trimmings…</Headline>
      <Plated checks={t >= tNob} />
      <Punch at={tTrim}><Seg u0={Cc[0]} u1={TRIM} y={1050} dx={-200} ring={t >= tTrim - 0.1 ? C.amber : undefined} /></Punch>
      <At x={640} y={1050}><Appear at={tTrim} from="pop"><Text size={90} color={C.amber} glow>?</Text></Appear></At>
      <Sfx name="pack/correct" at={tNob + 0.1} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- step 4: cut the trimmings in three
const CrumbsBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tThree = w(["three"], 1, 2.2), tOwner = w(["owner's"], 1, 3.8), tYou = w(["you"], 1, 5.4), tCutter = w(["cutter"], 1, 6.6);
  const parts: [string, number, string][] = [["Ben", tOwner, C.ink], ["you", tYou, C.mint], ["Mia", tCutter, C.ink]];
  const x0 = 160, x1 = 820, wid = (x1 - x0) / 3;
  return (
    <>
      <Headline>Step 4: the trimmings</Headline>
      <At x={540} y={420}><Appear at={0} from="fade" sfx={null}><Text size={44} color={C.muted}>Mia cuts them</Text></Appear></At>
      {parts.map(([who, at, col], i) => {
        const k = tween(t, at - 0.1, at + 0.3, 0, 1);
        const gap = t >= tThree ? 14 : 0;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x0 + i * wid + gap * (i - 1), top: 560 + k * 200, width: wid - 4, height: 200, background: CAKE, borderRadius: 18,
              border: "3px solid #00000033", boxShadow: "0 16px 30px #0008" }} />
            <At x={x0 + (i + 0.5) * wid + gap * (i - 1)} y={1030}><Appear at={at} from="pop"><Name color={col}>{i + 1}. {who}</Name></Appear></At>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: x0 + wid - 4, top: 520, width: 8, height: 280 * tween(t, tThree - 0.3, tThree - 0.1, 0, 1), background: C.amber, borderRadius: 4 }} />
      <div style={{ position: "absolute", left: x0 + 2 * wid - 4, top: 520, width: 8, height: 280 * tween(t, tThree, tThree + 0.2, 0, 1), background: C.amber, borderRadius: 4 }} />
      <Sfx name="pack/whoosh-swing" at={tThree - 0.3} volume={0.35} />
      <Sfx name="pack/whoosh-swing" at={tThree} volume={0.35} />
      <Sfx name="pack/pop-2" at={tOwner} volume={0.3} />
      <Sfx name="pack/pop-2" at={tYou} volume={0.3} />
      <Sfx name="pack/pop-2" at={tCutter} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const t = useT();
  const tCrumb = w(["crumb"], 1, 3.4), tThirds = w(["thirds"], 1, 4.8), tFive = w(["Five"], 1, 6.0);
  const k = tween(t, tCrumb - 0.3, tCrumb + 0.4, 0, 1);
  return (
    <>
      <Headline>Why you never mind</Headline>
      <At x={540} y={400}><Appear at={0} from="fade" sfx={null}><Text size={46} color={C.muted}>the trimmed piece + every crumb</Text></Appear></At>
      <Seg u0={TRIM} u1={1} y={620} dx={-279} />
      <Seg u0={Cc[0]} u1={TRIM} y={620} dx={-279 - 130 * (1 - k)} dy={(1 - k) * 220} ring={k >= 1 ? undefined : C.amber} />
      <At x={540} y={840}><Appear at={tThirds - 0.2} from="slam"><Text size={70} color={C.amber} glow>= one of your thirds</Text></Appear></At>
      <Punch at={tFive}><At x={540} y={1060}><Appear at={tFive - 0.1} from="pop"><Chip color={C.amber} size={58}>5 cuts, 0 jealousy</Chip></Appear></At></Punch>
      <Sfx name="pack/thud-heavy" at={tCrumb + 0.4} volume={0.3} />
      <Sfx name="pack/hit-grand" at={tFive} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tThree = w(["three"], 1, 1.4);
  return (
    <>
      <Seg u0={0} u1={1} y={640} h={150} />
      <Cut u={1 / 3} y={640} h={200} color={C.mint} at={tThree - 0.2} />
      <Cut u={2 / 3} y={640} h={200} color={C.mint} at={tThree} />
      <At x={540} y={860}><Appear at={tThree + 0.2} from="fade" sfx={null}><Text size={50} color={C.muted}>just three slices?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="cut"><CutBody /></Span>
    <Span from="trim"><TrimBody /></Span>
    <Span from="pick"><PickBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="crumbs"><CrumbsBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
