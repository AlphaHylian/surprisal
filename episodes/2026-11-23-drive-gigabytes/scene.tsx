// "Why your 1 TB drive only shows 931 GB": decimal vs binary prefixes.
// claim hook (1 TB -> 931 GB) -> not broken, every byte there -> both count bytes, disagree on giga
// -> maker: 1,000s, a trillion bytes -> Windows: 1,024, 2.4% bigger -> re-hook: it stacks
// -> 4.9 / 7.4 / ~10% -> trillion / 1,024 / 1,024 / 1,024 = 931 -> same bytes, bigger buckets; Mac shows 1 TB
// -> Western Digital settled 2006, fine print -> CTA: 500 GB drive? (465)
import React from "react";
import { Appear, At, C, Camera, Chip, Counter, F, Headline, HookText, Icon, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// ---------------------------------------------------------------- pieces
const DriveBox: React.FC<{ label: string; s?: number; color?: string; ls?: number }> = ({ label, s = 1, color = C.mint, ls = 100 }) => (
  <div style={{ width: 330 * s, height: 400 * s, borderRadius: 24 * s, background: "linear-gradient(160deg, #2a3140, #171b24)", border: `6px solid ${color}`,
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18 * s, boxShadow: "0 18px 50px #000a" }}>
    <Icon name="HardDrive" size={150 * s} color={color} />
    <div style={{ fontFamily: F.bold, fontSize: ls * s, color: C.ink, whiteSpace: "nowrap" }}>{label}</div>
  </div>
);
const UsageBar: React.FC<{ value: string; color?: string; w?: number }> = ({ value, color = C.amber, w = 520 }) => (
  <div style={{ width: w, padding: "22px 26px", borderRadius: 18, background: "#11151d", border: `3px solid ${C.muted}66`, display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <Icon name="HardDrive" size={52} color={C.muted} />
      <div style={{ fontFamily: F.med, fontSize: 42, color: C.muted }}>Local Disk (D:)</div>
    </div>
    <div style={{ height: 28, borderRadius: 14, background: C.dim }}><div style={{ width: "4%", height: "100%", borderRadius: 14, background: C.mint }} /></div>
    <div style={{ fontFamily: F.bold, fontSize: 64, color }}>{value}</div>
  </div>
);

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const w = useW();
  const t931 = w(["931"], 1, 1.8);
  return (
    <>
      <HookText y={260} size={92}>{"**1 TB** drive,\nshows **931 GB**"}</HookText>
      <Riser to={t931} volume={0.45} />
      <Camera keys={[[0, { zoom: 1 }], [t931 + 0.8, { zoom: 1.05 }]]}>
        <At x={280} y={790}><Appear at={0} from="pop"><DriveBox label="1 TB" s={0.85} /></Appear></At>
        <At x={760} y={790}><Appear at={0} from="pop" sfx={null}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <Text size={46} color={C.muted}>your PC says</Text>
            <Text size={130} color={C.amber} font={F.bold}>931 GB</Text>
          </div>
        </Appear></At>
        <At x={540} y={1090}><Appear at={t931 + 0.2} from="slam"><Chip color={C.coral} size={52}>69 GB gone?</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/ding" at={t931} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const Out: React.FC<{ t: number; children: string }> = ({ t, children }) => (
  <div style={{ position: "relative" }}>
    <Chip color={C.panel} text={C.ink} size={70}>{children}</Chip>
    <div style={{ position: "absolute", left: 0, right: 0, top: "50%" }}>
      <Appear at={t + 0.4} from="slam"><div style={{ height: 12, background: C.coral, borderRadius: 6, transform: "rotate(-4deg)" }} /></Appear>
    </div>
  </div>
);
const RuleoutBody: React.FC = () => {
  const w = useW();
  const tBroken = w(["broken"], 1, 0.6), tHidden = w(["hidden"], 1, 1.8), tEvery = w(["Every"], 1, 3.2);
  return (
    <>
      <At y={440}><Appear at={0.05} from="left"><Out t={tBroken}>broken drive</Out></Appear></At>
      <At y={640}><Appear at={Math.min(tHidden - 0.3, 1.2)} from="right"><Out t={tHidden}>hidden system files</Out></Appear></At>
      <Punch at={tEvery + 0.3}><At y={920}><Appear at={tEvery - 0.1} from="pop"><Chip color={C.mint} size={70}>every byte is there</Chip></Appear></At></Punch>
      <Sfx name="pack/correct" at={tEvery + 0.3} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- context: both count bytes
const ContextBody: React.FC = () => {
  const w = useW();
  const tComp = w(["computer"], 1, 1.0), tGiga = w(["giga"], 1, 3.6);
  return (
    <>
      <Headline>Same bytes, two rulers</Headline>
      <At x={290} y={680}><Appear at={0.05} from="left"><DriveBox label="1 TB" s={0.7} /></Appear></At>
      <At x={790} y={680}><Appear at={tComp - 0.2} from="right"><Icon name="Monitor" size={300} color={C.ink} /></Appear></At>
      <Punch at={tGiga}><At x={540} y={1040}><Appear at={tGiga - 0.3} from="slam"><div style={{ fontFamily: F.bold, fontSize: 110, color: C.amber }}>giga = ?</div></Appear></At></Punch>
    </>
  );
};

// ---------------------------------------------------------------- maker: thousands
const Ladder: React.FC<{ rows: [string, string][]; t0: number; step: number; color: string }> = ({ rows, t0, step, color }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
    {rows.map(([a, b], i) => (
      <Appear key={a} at={t0 + i * step} from="left">
        <div style={{ display: "flex", gap: 26, alignItems: "baseline", fontFamily: F.mono, fontSize: 60, whiteSpace: "nowrap" }}>
          <span style={{ color: C.ink, width: 200, display: "inline-block" }}>{a}</span><span style={{ color }}>{b}</span>
        </div>
      </Appear>
    ))}
  </div>
);
const MakerBody: React.FC = () => {
  const w = useW();
  const tK = w(["kilobyte"], 1, 1.2), tTril = w(["trillion"], 1, 3.8);
  return (
    <>
      <Headline>The box: thousands</Headline>
      <At x={540} y={640}><Ladder t0={tK - 0.2} step={0.45} color={C.mint} rows={[["1 KB", "1,000 B"], ["1 MB", "1,000 KB"], ["1 GB", "1,000 MB"], ["1 TB", "1,000 GB"]]} /></At>
      <Punch at={tTril}><At x={540} y={1040}><Appear at={tTril - 0.3} from="slam"><Chip color={C.mint} size={56}>1,000,000,000,000 bytes</Chip></Appear></At></Punch>
      <Sfx name="pack/click-hard" at={tTril} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- Windows: 1,024
const WindowsBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tTwos = w(["twos"], 1, 0.9), t1024 = w(["1,024"], 1, 2.4), tBig = w(["2.4%", "2.4"], 1, 3.8);
  const bitsOn = Math.floor(tween(t, tTwos, tTwos + 1.2, 0, 10));
  return (
    <>
      <Headline>Windows: twos</Headline>
      <At x={540} y={540}>
        <div style={{ display: "flex", gap: 10 }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{ width: 70, height: 70, borderRadius: 12, background: i < bitsOn ? C.amber : C.dim, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: F.mono, fontSize: 38, color: i < bitsOn ? "#111" : C.muted }}>2</div>
          ))}
        </div>
      </At>
      <At x={540} y={650}><Appear at={tTwos + 0.6} from="up"><Text size={46} color={C.muted} font={F.mono}>2¹⁰ = 1,024</Text></Appear></At>
      <At x={540} y={820}><Appear at={t1024 - 0.3} from="pop"><div style={{ fontFamily: F.mono, fontSize: 70, color: C.ink, whiteSpace: "nowrap" }}>1 KB = <span style={{ color: C.amber }}>1,024 B</span></div></Appear></At>
      <Punch at={tBig}><At x={540} y={1020}><Appear at={tBig - 0.3} from="slam"><Chip color={C.amber} size={70}>+2.4% bigger</Chip></Appear></At></Punch>
      <Sfx name="pack/click-soft" at={tBig} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook
const RehookBody: React.FC = () => {
  const w = useW();
  const tNothing = w(["nothing"], 1, 0.8), tStacks = w(["stacks"], 1, 2.0);
  return (
    <>
      <Headline color={C.amber}>2.4% is nothing</Headline>
      <At x={540} y={640}><Appear at={tNothing} from="pop"><div style={{ fontFamily: F.bold, fontSize: 150, color: C.muted }}>2.4%</div></Appear></At>
      <At x={540} y={900}><Appear at={tStacks - 0.2} from="slam"><Stamp color={C.coral} size={96}>IT STACKS</Stamp></Appear></At>
      <Sfx name="pack/suspense-sting" at={tStacks} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- stack: 2.4 -> 4.9 -> 7.4 -> 10
const StackBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tM = w(["megabyte"], 1, 0.6), tG = w(["gigabyte"], 1, 2.2), tT = w(["terabyte"], 1, 3.6);
  const rows: [string, number, number][] = [["KB", 2.4, 0.05], ["MB", 4.9, tM], ["GB", 7.4, tG], ["TB", 10, tT]];
  const X0 = 280, PX = 48;
  return (
    <>
      <Headline>Bigger at every step</Headline>
      {rows.map(([u, p, t0], i) => (
        <React.Fragment key={u}>
          <At x={190} y={500 + i * 160}><Appear at={t0} from="left" sfx={null}><Text size={64} font={F.bold}>{u}</Text></Appear></At>
          <div style={{ position: "absolute", left: X0, top: 460 + i * 160, height: 80, borderRadius: 16, width: tween(t, t0, t0 + 0.6, 0, p * PX), background: i === 3 ? C.amber : C.mint }} />
          <At x={X0 + p * PX + 110} y={500 + i * 160}><Appear at={t0 + 0.3} from="pop"><Text size={56} font={F.bold} color={i === 3 ? C.amber : C.ink}>{i === 3 ? "~10%" : `${p}%`}</Text></Appear></At>
        </React.Fragment>
      ))}
      <Sfx name="pack/click-soft" at={tM} volume={0.25} />
      <Sfx name="pack/click-soft" at={tG} volume={0.25} />
      <Sfx name="pack/click-hard" at={tT} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- divide by 1,024 three times
const DivideBody: React.FC = () => {
  const w = useW();
  const tDiv = w(["divide"], 1, 1.4), tThree = w(["three"], 1, 3.0), t931 = w(["931"], 1, 3.9);
  const steps = [["1,000,000,000,000", 0.05], ["÷ 1,024 → 976,562,500", tDiv + 0.2], ["÷ 1,024 → 953,674", tDiv + 0.9], ["÷ 1,024 → 931.3", tThree]] as [string, number][];
  return (
    <>
      <Headline>Do Windows' math</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t931, { zoom: 1.06, y: 700 }]]}>
        {steps.map(([s, t0], i) => (
          <At key={i} x={540} y={470 + i * 130}><Appear at={t0} from="left"><div style={{ fontFamily: F.mono, fontSize: i === 0 ? 62 : 54, color: i === 3 ? C.amber : C.ink, whiteSpace: "nowrap" }}>{s}</div></Appear></At>
        ))}
        <Punch at={t931}><At x={540} y={1020}><Appear at={t931 - 0.3} from="slam"><div style={{ fontFamily: F.bold, fontSize: 140, color: C.amber }}>931 GB</div></Appear></At></Punch>
      </Camera>
      <Sfx name="pack/correct" at={t931} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- payoff: bigger buckets; Mac shows 1 TB
const PayoffBody: React.FC = () => {
  const w = useW();
  const tBuckets = w(["buckets"], 1, 2.0), tMac = w(["Mac"], 1, 3.0), t1 = w(["terabyte"], 1, 5.0);
  return (
    <>
      <Headline>Same bytes, bigger buckets</Headline>
      <At x={290} y={620}><Appear at={0.05} from="pop"><UsageBar value="931 GB" w={430} /></Appear></At>
      <At x={290} y={790}><Appear at={0.2} from="up" sfx={null}><Text size={44} color={C.muted}>Windows ÷ 1,024</Text></Appear></At>
      <At x={790} y={620}><Appear at={tMac - 0.2} from="pop"><UsageBar value="1 TB" color={C.mint} w={430} /></Appear></At>
      <At x={790} y={790}><Appear at={tMac} from="up" sfx={null}><Text size={44} color={C.muted}>Mac ÷ 1,000</Text></Appear></At>
      <Punch at={t1}><At x={540} y={1000}><Appear at={tBuckets - 0.2} from="slam"><Chip color={C.amber} size={60}>nothing missing</Chip></Appear></At></Punch>
    </>
  );
};

// ---------------------------------------------------------------- lawsuit
const LawsuitBody: React.FC = () => {
  const w = useW();
  const tSued = w(["sued"], 1, 1.2), t2006 = w(["2006"], 1, 2.6), tFine = w(["fine"], 1, 3.8);
  return (
    <>
      <Headline>It went to court</Headline>
      <At x={540} y={560}><Appear at={tSued - 0.3} from="drop"><Icon name="Gavel" size={240} color={C.coral} /></Appear></At>
      <At x={540} y={780}><Appear at={t2006 - 0.3} from="up"><Text size={60} font={F.bold}>Settled, 2006</Text></Appear></At>
      <At x={540} y={1000}><Appear at={tFine - 0.3} from="pop">
        <div style={{ padding: "18px 28px", border: `3px solid ${C.muted}`, borderRadius: 12, fontFamily: F.med, fontSize: 40, color: C.muted, maxWidth: 820, textAlign: "center" }}>
          fine print: 1 GB = 1 billion bytes
        </div>
      </Appear></At>
      <Sfx name="pack/click-hard" at={tSued} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- CTA: 500 GB?
const CtaBody: React.FC = () => {
  const w = useW();
  const t500 = w(["500"], 1, 0.8), tHow = w(["How"], 1, 2.0);
  return (
    <>
      <Headline>Your turn</Headline>
      <At x={540} y={640}><Appear at={t500 - 0.2} from="pop"><DriveBox label="500 GB" s={0.9} ls={76} /></Appear></At>
      <At x={540} y={1000}><Appear at={tHow - 0.2} from="slam"><div style={{ fontFamily: F.bold, fontSize: 96, color: C.amber, whiteSpace: "nowrap" }}>Windows: ? GB</div></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="maker"><MakerBody /></Span>
    <Span from="windows"><WindowsBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="stack"><StackBody /></Span>
    <Span from="divide"><DivideBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="lawsuit"><LawsuitBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
