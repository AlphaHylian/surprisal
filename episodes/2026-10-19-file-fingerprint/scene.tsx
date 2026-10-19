// "How one 64-character code proves your download is real": SHA-256 fingerprints, how-to format.
// claim hook (every file has a twin, nobody's found one) -> rule out rarity -> your 4 GB download
// -> compare fingerprints -> a byte sum misses a swap -> SHA-256: one bit flips half -> re-hook: twins must exist
// -> 2^128 tries -> over a trillion years -> payoff -> CTA.
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

const H1 = "1aa956cbe29fc12c52a383f996fdb44859d3374ec381f53b4cc6ad8780b218b5";
const B1 = "0001101010101001010101101100101111100010100111111100000100101100010100101010001110000011111110011001011011111101101101000100100001011001110100110011011101001110110000111000000111110101001110110100110011000110101011011000011110000000101100100001100010110101";
const B2 = "1010010011010110001111101010000011101000101001100101111101110001001100111101110111101010010010000010010101000000000010010111110101110101101101011111000101011010000010111011011011101110000000111011001110101100111110010010100010111100110001100010000101110101";

// a 64-character fingerprint in two rows of 32; `lit` characters glow (0..64)
const Hash: React.FC<{ hex?: string; size?: number; lit?: number; color?: string; dim?: boolean }> = ({ hex = H1, size = 40, lit = 0, color = C.mint, dim }) => (
  <div style={{ fontFamily: F.mono, fontSize: size, lineHeight: 1.15, width: size * 0.6 * 32 + 4, wordBreak: "break-all", letterSpacing: 0 }}>
    {hex.split("").map((ch, i) => (
      <span key={i} style={{ color: i < lit ? color : dim ? C.muted : C.ink }}>{ch}</span>
    ))}
  </div>
);

const FileTag: React.FC<{ label: string; color?: string; size?: number }> = ({ label, color = C.ink, size = 150 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
    <Icon name="FileText" size={size} color={color} />
    <Text size={44} color={color} font={F.mono}>{label}</Text>
  </div>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tFound = at.word("found.", 1, 2.2);
  return (
    <>
      <HookText>{"Every file has a **twin**.\nNobody's **found one**."}</HookText>
      <Riser to={tFound} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05 }]]}>
        <At x={290} y={640}><FileTag label="your file" /></At>
        <At x={790} y={640}>
          <div style={{ position: "relative" }}>
            <FileTag label="its twin" color={C.amber} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center" }}><Text size={90} color={C.bg}>?</Text></div>
          </div>
        </At>
        <At x={290} y={900}><Hash hex={H1.slice(0, 16) + "…"} size={36} /></At>
        <At x={790} y={900}><Hash hex={H1.slice(0, 16) + "…"} size={36} color={C.amber} lit={17} /></At>
        <At x={540} y={1060}><Appear at={0} from="fade"><Text size={110} color={C.mint}>=</Text></Appear></At>
      </Camera>
      <Sfx name="pack/glitch" at={tFound} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out rarity
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tGuar = at.word("guaranteed.", 1, 1.2);
  const tNobody = at.word("nobody", 1, 3.0);
  return (
    <>
      <At x={540} y={480}><Appear at={tGuar - 0.2} from="slam"><Chip size={80} color={C.mint}>twins: guaranteed</Chip></Appear></At>
      <At x={540} y={720}><Appear at={tNobody - 0.3} from="slam"><Chip size={80} color={C.coral}>finding one: nobody</Chip></Appear></At>
      <At x={540} y={950}><Appear at={tNobody} from="pop"><Icon name="SearchX" size={150} color={C.coral} /></Appear></At>
      <Sfx name="pack/wrong" at={tNobody} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- 3. the download
const DownloadBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tBroken = at.word("broken,", 1, 1.4);
  const tSwapped = at.word("swapped", 1, 2.2);
  const t4b = at.word("4", 1, 3.6);
  const prog = tween(t, 0, tBroken - 0.1, 0.2, 1);
  return (
    <>
      <Headline out={at.dur - 0.3}>Your download</Headline>
      <At x={540} y={500}><Icon name="Download" size={170} color={C.mint} /></At>
      <At x={540} y={680}>
        <div style={{ width: 760, height: 44, borderRadius: 22, background: C.dim, overflow: "hidden" }}>
          <div style={{ width: `${prog * 100}%`, height: "100%", background: C.mint }} />
        </div>
      </At>
      <At x={540} y={760}><Text size={48} color={C.muted} font={F.mono}>{`${(prog * 4).toFixed(1)} / 4.0 GB`}</Text></At>
      <At x={330} y={900}><Appear at={tBroken - 0.1} from="pop"><Text size={70} color={C.coral}>broken?</Text></Appear></At>
      <At x={760} y={900}><Appear at={tSwapped - 0.1} from="pop"><Text size={70} color={C.coral}>swapped?</Text></Appear></At>
      <At x={540} y={1060}>
        <Appear at={t4b - 0.2} from="up">
          <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
            <Counter from={0} to={4000000000} t0={t4b - 0.2} t1={t4b + 0.8} size={56} comma />
            <Text size={52} color={C.muted}>bytes</Text>
          </div>
        </Appear>
      </At>
      <Sfx name="pack/download" at={0.05} volume={0.25} dur={1.2} />
    </>
  );
};

// ---------------------------------------------------------------- 4. compare fingerprints
const CompareBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t64 = at.word("64", 1, 1.6);
  const tRun = at.word("Run", 1, 2.8);
  const tMatch = at.word("Match", 1, 4.6);
  const lit = Math.floor(tween(t, tRun + 0.3, tMatch, 0, 64));
  return (
    <>
      <Headline out={at.dur - 0.3}>Compare fingerprints</Headline>
      <At x={540} y={400}><Appear at={0.1} from="left"><Text size={44} color={C.muted}>the site lists:</Text></Appear></At>
      <At x={540} y={500}><Appear at={0.3} from="left"><Hash size={40} /></Appear></At>
      <At x={860} y={600}><Appear at={t64 - 0.1} from="pop"><Chip size={44} color={C.amber}>64 characters</Chip></Appear></At>
      <At x={540} y={720}><Appear at={tRun - 0.1} from="left"><Text size={44} color={C.muted}>your copy:</Text></Appear></At>
      <At x={540} y={820}><Appear at={tRun} from="left"><Hash size={40} lit={lit} /></Appear></At>
      <Punch at={tMatch}>
        <At x={540} y={1030}><Appear at={tMatch - 0.1} from="slam"><Chip size={84} color={C.mint}>MATCH = same file</Chip></Appear></At>
      </Punch>
      <Sfx name="pack/typing" at={tRun + 0.3} volume={0.2} dur={tMatch - tRun - 0.3} />
      <Sfx name="pack/correct" at={tMatch} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 5. a byte sum misses a swap
const Cheque: React.FC<{ a: string; b: string; hi?: boolean }> = ({ a, b, hi }) => (
  <div style={{ fontFamily: F.mono, fontSize: 56, color: C.ink, background: C.panel, borderRadius: 18, padding: "18px 30px", border: `4px solid ${C.dim}` }}>
    ALICE <span style={{ color: hi ? C.coral : C.ink }}>{a}</span> BOB <span style={{ color: hi ? C.coral : C.ink }}>{b}</span>
  </div>
);
const SumBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSwap = at.word("Swap", 1, 1.4);
  const tBecomes = at.word("becomes", 1, 5.0);
  const tPasses = at.word("passes.", 1, 7.4);
  const swapped = t >= tBecomes;
  return (
    <>
      <Headline out={at.dur - 0.3} color={C.coral}>Not a sum of bytes</Headline>
      <At x={540} y={470}><Appear at={0.1} from="pop"><Cheque a="100" b="900" /></Appear></At>
      <At x={540} y={600}><Appear at={0.5} from="up"><Text size={48} color={C.muted} font={F.mono}>sum of bytes: 955</Text></Appear></At>
      <At x={540} y={780}><Appear at={tBecomes - 0.1} from="slam"><Cheque a="900" b="100" hi /></Appear></At>
      <At x={540} y={910}><Appear at={tBecomes + 0.4} from="up"><Text size={48} color={C.muted} font={F.mono}>sum of bytes: 955</Text></Appear></At>
      <At x={540} y={690}><Appear at={tSwap} out={tBecomes - 0.2} from="pop"><Icon name="ArrowUpDown" size={110} color={C.amber} /></Appear></At>
      <Shake at={tPasses}>
        <At x={540} y={1070}><Appear at={tPasses - 0.15} from="slam"><Stamp color={C.coral} size={80}>PASSES</Stamp></Appear></At>
      </Shake>
      {swapped ? <Sfx name="pack/whoosh-swing" at={tBecomes - 0.1} volume={0.35} /> : null}
      <Sfx name="pack/access-denied" at={tPasses} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 6. SHA-256: one bit flips half
const BitGrid: React.FC<{ a: string; b: string; flipAt: number; t: number }> = ({ a, b, flipAt, t }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(16, 44px)", gap: 6 }}>
    {a.split("").map((bit, i) => {
      const changed = a[i] !== b[i];
      const tf = flipAt + (i % 16) * 0.02 + Math.floor(i / 16) * 0.03;
      const now = t >= tf ? b[i] : bit;
      return <div key={i} style={{ width: 44, height: 44, borderRadius: 8, background: now === "1" ? C.ink : C.dim,
        boxShadow: changed && t >= tf ? `0 0 0 4px ${C.amber}` : "none" }} />;
    })}
  </div>
);
const ShaBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t64 = at.word("64", 1, 2.0);
  const tOne = at.word("one", 1, 3.6);
  const tHalf = at.word("half", 1, 4.8);
  const tFlip = at.word("flip.", 1, 6.4);
  return (
    <>
      <Headline out={at.dur - 0.3} color={C.mint}>Use SHA-256</Headline>
      <At x={540} y={390}>
        <Appear at={t64 - 0.2} from="up">
          <div style={{ display: "flex", gap: 14, alignItems: "baseline" }}>
            <Counter from={1} to={64} t0={t64 - 0.2} t1={t64 + 0.7} size={52} color={C.mint} />
            <Text size={48} color={C.muted}>rounds of stirring</Text>
          </div>
        </Appear>
      </At>
      <Camera keys={[[0, { zoom: 1 }], [tOne, { zoom: 1 }], [tHalf, { zoom: 1.05, y: 720 }]]}>
        <At x={540} y={720}><BitGrid a={B1} b={B2} flipAt={tOne + 0.3} t={t} /></At>
      </Camera>
      <At x={540} y={1090}><Appear at={tOne - 0.1} out={tHalf - 0.1} from="up"><Text size={56}>change <span style={{ color: C.amber }}>1 bit</span> of the file</Text></Appear></At>
      <Punch at={tFlip}>
        <At x={540} y={1090}><Appear at={tHalf} from="slam"><Text size={70} color={C.amber} glow>138 of 256 bits flipped</Text></Appear></At>
      </Punch>
      <Sfx name="pack/gears" at={t64 - 0.2} volume={0.25} dur={1.0} />
      <Sfx name="pack/glitch-2" at={tOne + 0.3} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 7. re-hook: twins must exist
const RehookBody: React.FC = () => {
  const at = useAt();
  const tFinite = at.word("finite", 1, 1.4);
  const tRun = at.word("never", 1, 2.8);
  const tExist = at.word("exist.", 1, 4.4);
  const tWhy = at.word("Why", 1, 5.0);
  return (
    <>
      <Headline out={at.dur - 0.3} color={C.amber}>More files than fingerprints</Headline>
      <At x={290} y={620}><Appear at={tFinite - 0.2} from="pop">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Icon name="Fingerprint" size={170} color={C.mint} />
          <Text size={56} color={C.mint}>2²⁵⁶ prints</Text>
        </div>
      </Appear></At>
      <At x={790} y={620}><Appear at={tRun - 0.2} from="pop">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <Icon name="Files" size={170} color={C.ink} />
          <Text size={56}>∞ files</Text>
        </div>
      </Appear></At>
      <At x={540} y={880}><Appear at={tExist - 0.2} from="slam"><Chip size={70} color={C.amber}>twins must exist</Chip></Appear></At>
      <At x={540} y={1060}><Appear at={tWhy} from="up"><Text size={60} color={C.coral}>so why can't an attacker make one?</Text></Appear></At>
      <Sfx name="pack/suspense-sting" at={tWhy} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 8-9. 2^128 tries, a trillion years
const TriesBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t128 = at.word("128", 1, 2.4);
  const t340 = at.word("340", 1, 3.6);
  const tY = at.beat("years");
  const t8 = at.word("8", 1, tY + 0.6);
  const tBil = at.word("billion", 2, tY + 2.4);
  const tTril = at.word("trillion", 1, tY + 4.4);
  return (
    <>
      <Headline out={tY - 0.3}>To find any twin</Headline>
      <Headline at={tY} out={at.dur - 0.3}>Everyone, nonstop</Headline>
      {t < tY ? (
        <>
          <At x={540} y={520}><Appear at={t128 - 0.2} from="slam"><Text size={150} color={C.amber} glow>2¹²⁸ tries</Text></Appear></At>
          <At x={540} y={790}>
            <Appear at={t340 - 0.1} from="up">
              <div style={{ width: 900, textAlign: "center", fontFamily: F.mono, fontSize: 48, color: C.ink, wordBreak: "break-all", lineHeight: 1.2 }}>
                340,000,000,000,000,000,000,000,000,000,000,000,000
              </div>
            </Appear>
          </At>
        </>
      ) : (
        <>
          <At x={300} y={560}><Appear at={t8 - 0.2} from="pop">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Icon name="Users" size={150} color={C.ink} /><Text size={52}>8 billion people</Text>
            </div>
          </Appear></At>
          <At x={780} y={560}><Appear at={tBil - 0.2} from="pop">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Icon name="Cpu" size={150} color={C.mint} /><Text size={52} color={C.mint}>1 billion / second</Text>
            </div>
          </Appear></At>
          <Punch at={tTril}>
            <At x={540} y={920}><Appear at={tTril - 0.3} from="slam"><Text size={96} color={C.amber} glow>1 trillion+ years</Text></Appear></At>
          </Punch>
        </>
      )}
      <Sfx name="pack/counting-digital" at={t340 - 0.1} volume={0.2} dur={1.2} />
      <Sfx name="pack/boom-short" hit={tTril} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 10-11. payoff + CTA
const PayoffBody: React.FC = () => {
  const at = useAt();
  const tMatching = at.word("matching", 1, 3.6);
  const tExact = at.word("exact", 1, 5.4);
  const tCta = at.beat("cta");
  return (
    <>
      <At x={540} y={420}><Appear at={0.05} from="pop"><Text size={64}>the twin: <span style={{ color: C.amber }}>a trillion years away</span></Text></Appear></At>
      <At x={290} y={700}><Appear at={tMatching - 0.2} from="left"><FileTag label="site" size={130} color={C.mint} /></Appear></At>
      <At x={790} y={700}><Appear at={tMatching} from="right"><FileTag label="yours" size={130} color={C.mint} /></Appear></At>
      <At x={540} y={700}><Appear at={tMatching + 0.3} from="pop"><Text size={100} color={C.mint}>=</Text></Appear></At>
      <Punch at={tExact}>
        <At x={540} y={950}><Appear at={tExact - 0.1} from="slam"><Chip size={80} color={C.mint}>the exact file</Chip></Appear></At>
      </Punch>
      <At x={540} y={1090}><Appear at={tCta} from="up"><Text size={54} color={C.muted}>thought two files could never match?</Text></Appear></At>
      <Sfx name="pack/access-granted" at={tExact} volume={0.35} />
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="download"><DownloadBody /></Span>
    <Span from="compare"><CompareBody /></Span>
    <Span from="sum"><SumBody /></Span>
    <Span from="sha"><ShaBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="tries" to="years"><TriesBody /></Span>
    <Span from="payoff" to="cta"><PayoffBody /></Span>
  </>
);
export default Scene;
