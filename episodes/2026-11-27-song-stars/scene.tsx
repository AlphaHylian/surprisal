// "How Shazam finds a song in a loud bar": constellation fingerprints (Wang 2003).
// claim hook -> doesn't listen to the tune, throws sound away -> a few seconds vs millions of songs ->
// spectrogram -> keep the loudest points (stars) -> re-hook: one star = one pitch of 1,024 -> pair with the next 10:
// 1 in a billion -> look up: song + second -> right song's hits agree on one moment -> 1-2 in 100 survive -> CTA
import React from "react";
import { Appear, Arrow, At, C, Camera, Chip, F, Headline, HookText, Icon, Riser, Sfx, Span, Text, tween, useAt, useT } from "../kit";

const useW = () => {
  const at = useAt();
  return (words: string[], nth: number, fb: number) => {
    for (const w of words) { const v = at.word(w, nth, -1); if (v >= 0) return v; }
    return fb;
  };
};

// deterministic pseudo-random numbers
const rnd = (seed: number) => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

// the star map: song stars (fixed) and noise stars, in a box of MAPW x MAPH
const MAPW = 900, MAPH = 560;
const r1 = rnd(11);
const SONG: [number, number][] = Array.from({ length: 34 }, (_, i) => [30 + i * 25 + r1() * 14, 40 + r1() * (MAPH - 80)]);
const r2 = rnd(29);
const NOISE: [number, number][] = Array.from({ length: 60 }, () => [20 + r2() * (MAPW - 40), 20 + r2() * (MAPH - 40)]);

const Spectro: React.FC<{ heat: number; stars: number; noise: number; songColor?: string; dimSong?: number;
  pairs?: number; anchor?: number; surv?: number }> =
  ({ heat, stars, noise, songColor = C.amber, dimSong = 1, pairs = 0, anchor = 12, surv = 0 }) => {
    const cols = 30, rows = 18, cw = MAPW / cols, ch = MAPH / rows;
    const r = rnd(5);
    const cells = [];
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const v = r();
      cells.push(<rect key={`${i}-${j}`} x={i * cw} y={j * ch} width={cw + 0.5} height={ch + 0.5}
        fill={v > 0.8 ? "#3a6f8f" : v > 0.5 ? "#24465c" : "#162c3b"} opacity={heat} />);
    }
    const a = SONG[anchor];
    const nPairs = Math.floor(pairs * 10 + 0.0001);
    return (
      <svg width={MAPW} height={MAPH} style={{ overflow: "visible" }}>
        <rect width={MAPW} height={MAPH} rx={16} fill="#0a121c" stroke={C.muted} strokeWidth={3} />
        {cells}
        {SONG.slice(anchor + 1, anchor + 1 + nPairs).map(([x, y], i) =>
          <line key={`p${i}`} x1={a[0]} y1={a[1]} x2={x} y2={y} stroke={C.mint} strokeWidth={4} opacity={0.9} />)}
        {NOISE.slice(0, Math.floor(noise * NOISE.length)).map(([x, y], i) =>
          <circle key={`n${i}`} cx={x} cy={y} r={9} fill={C.coral} opacity={0.85} />)}
        {SONG.slice(0, Math.floor(stars * SONG.length)).map(([x, y], i) => {
          const lit = surv > 0 ? (i % 9 === 3 ? 1 : 0.25) : dimSong;
          return <circle key={`s${i}`} cx={x} cy={y} r={i === anchor && pairs > 0 ? 16 : surv > 0 && lit === 1 ? 16 : 11} fill={songColor} opacity={lit} />;
        })}
      </svg>
    );
  };

// ---------------------------------------------------------------- hook
const Wave: React.FC<{ y: number; noisy: number }> = ({ y, noisy }) => {
  const t = useT();
  const n = 46;
  return (
    <div style={{ position: "absolute", left: 60, top: y, width: 960, height: 300, display: "flex", alignItems: "center", gap: 6 }}>
      {Array.from({ length: n }).map((_, i) => {
        const song = 60 + 50 * Math.sin(i * 0.5 + t * 6);
        const nz = noisy * (90 + 80 * Math.sin(i * 2.7 + t * 17) * Math.cos(i * 1.3 - t * 11));
        return (
          <div key={i} style={{ width: 15, position: "relative", height: 300 }}>
            <div style={{ position: "absolute", left: 0, width: 15, top: 150 - (song + nz) / 2, height: song + nz, background: C.coral, borderRadius: 6, opacity: 0.85 }} />
            <div style={{ position: "absolute", left: 3, width: 9, top: 150 - song / 2, height: song, background: C.mint, borderRadius: 4 }} />
          </div>
        );
      })}
    </div>
  );
};
const HookBody: React.FC = () => {
  const w = useW();
  const tLoud = w(["louder"], 1, 1.6);
  return (
    <>
      <Riser to={tLoud} volume={0.45} />
      <HookText y={280} size={84}>{"Noise **louder** than song.\nStill found."}</HookText>
      <Wave y={520} noisy={1} />
      <At x={540} y={1000}><Appear at={0} from="pop"><div style={{ display: "flex", alignItems: "center", gap: 20, background: "#0a121cee", border: `4px solid ${C.mint}`, borderRadius: 20, padding: "18px 34px" }}>
        <Icon name="Music" size={80} color={C.mint} /><Text size={64} color={C.mint}>song found</Text></div></Appear></At>
      <Sfx name="pack/whoosh-punchy" at={tLoud - 0.1} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tTune = w(["tune."], 1, 1.0), tAway = w(["away"], 1, 2.8);
  const fade = tween(t, tAway - 0.6, tAway + 0.6, 1, 0.12);
  return (
    <>
      <Headline>It throws sound away</Headline>
      <div style={{ opacity: fade }}><Wave y={420} noisy={0.3} /></div>
      <At x={540} y={570}><Appear at={tTune - 0.2} from="slam" out={tAway - 0.4}><Icon name="X" size={300} color={C.coral} stroke={3} /></Appear></At>
      <At x={540} y={950}><Appear at={tTune - 0.3} from="up"><Text size={60} color={C.muted}>not the tune</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- context
const ContextBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tFew = w(["few"], 1, 0.6), tMil = w(["millions"], 1, 2.8);
  const nTiles = Math.floor(tween(t, tMil - 0.3, tMil + 1.2, 0, 60));
  return (
    <>
      <Headline>A few seconds vs millions</Headline>
      <At x={210} y={640}><Appear at={0.05} from="left"><Icon name="Smartphone" size={240} color={C.ink} /></Appear></At>
      <At x={210} y={860}><Appear at={tFew - 0.2} from="up"><Chip color={C.amber} size={46}>a few seconds</Chip></Appear></At>
      <Arrow x1={330} y1={640} x2={470} y2={640} t0={tMil - 0.6} t1={tMil - 0.2} color={C.muted} />
      <div style={{ position: "absolute", left: 500, top: 420, width: 520, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Array.from({ length: nTiles }).map((_, i) => (
          <div key={i} style={{ width: 56, height: 56, borderRadius: 10, background: i % 7 === 3 ? "#3a6f8f" : "#24465c", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="Music" size={32} color={C.ink} />
          </div>))}
      </div>
      <At x={760} y={1020}><Appear at={tMil} from="up"><Text size={56} color={C.muted}>millions of songs</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- step 1: spectrogram
const PictureBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tPic = w(["picture."], 1, 1.4), tTime = w(["Time"], 1, 2.2), tPitch = w(["pitch"], 1, 3.0);
  return (
    <>
      <Headline>Step 1: sound → picture</Headline>
      <At x={540} y={680}><Appear at={tPic - 0.5} from="pop"><Spectro heat={tween(t, tPic - 0.5, tPic + 0.5, 0, 1)} stars={0} noise={0} /></Appear></At>
      <At x={540} y={1020}><Appear at={tTime - 0.2} from="left"><Text size={52} color={C.mint}>time →</Text></Appear></At>
      <At x={48} y={680} rotate={-90}><Appear at={tPitch - 0.2} from="up"><Text size={52} color={C.mint}>pitch →</Text></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- step 2: stars
const StarsBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tKeep = w(["loudest"], 1, 0.8), tMap = w(["stars."], 1, 3.0), tNoise = w(["noise"], 1, 4.2), tSurv = w(["survive."], 1, 6.4);
  return (
    <>
      <Headline>Step 2: keep the loudest</Headline>
      <At x={540} y={680}>
        <Spectro heat={tween(t, tKeep, tKeep + 0.8, 1, 0.12)} stars={tween(t, tKeep, tMap, 0, 1)} noise={tween(t, tNoise, tNoise + 1.0, 0, 1)} />
      </At>
      <At x={540} y={1060}><Appear at={tMap - 0.3} from="up" out={tNoise - 0.1}><Text size={60} color={C.amber}>a map of stars</Text></Appear></At>
      <At x={540} y={1060}><Appear at={tNoise + 0.1} from="up"><div style={{ display: "flex", gap: 40 }}>
        <Text size={52} color={C.coral}>● noise</Text><Text size={52} color={C.amber}>● song</Text></div></Appear></At>
      <Sfx name="pack/transition-flare" at={tMap - 0.8} volume={0.3} />
      <Sfx name="pack/glitch" at={tNoise} volume={0.2} dur={0.6} />
      <Sfx name="pack/click-soft" at={tSurv} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook: one star = one pitch of 1,024
const RehookBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tNothing = w(["nothing."], 1, 1.2), t1024 = w(["1,024."], 1, 3.0);
  const a = SONG[12];
  return (
    <>
      <Headline color={C.amber}>One star says almost nothing</Headline>
      <At x={540} y={680}><Spectro heat={0.12} stars={1} noise={1} dimSong={tween(t, 0, tNothing, 1, 0.3)} /></At>
      <div style={{ position: "absolute", left: 540 - MAPW / 2 + a[0] - 22, top: 680 - MAPH / 2 + a[1] - 22, width: 44, height: 44, borderRadius: "50%",
        background: C.amber, transform: `scale(${1 + 0.5 * tween(t, tNothing - 0.6, tNothing, 0, 1)})`, boxShadow: `0 0 40px ${C.amber}` }} />
      <At x={540} y={1070}><Appear at={t1024 - 0.6} from="pop"><Chip color={C.ink} size={56}>pitch 417 of 1,024</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- step 3: pairs
const PairsBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tPair = w(["pair"], 1, 0.4), t10 = w(["10"], 1, 1.6), tPlus = w(["gap"], 1, 4.4), tBil = w(["billion."], 1, 6.4);
  return (
    <>
      <Headline>Step 3: pair them up</Headline>
      <At x={540} y={640}><Spectro heat={0.12} stars={1} noise={1} dimSong={0.5} pairs={tween(t, tPair, t10 + 0.6, 0, 1)} /></At>
      <At x={540} y={990}><Appear at={tPlus - 1.6} from="up"><div style={{ whiteSpace: "nowrap", fontFamily: F.mono, fontSize: 46, color: C.ink, background: "#0a121cee", padding: "14px 24px", borderRadius: 14, border: `3px solid ${C.mint}` }}>
        pitch A + pitch B + gap</div></Appear></At>
      <At x={540} y={1110}><Appear at={tBil - 0.8} from="slam"><Chip color={C.amber} size={60}>1 pattern in a billion</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- step 4: look up
const LookupBody: React.FC = () => {
  const w = useW();
  const tLook = w(["Look"], 1, 0.2), tSong = w(["song,"], 1, 2.0), tSec = w(["second."], 1, 2.8);
  const rows = [["417 · 602 · 0.3 s", "song 48,211", "1:02"], ["380 · 911 · 0.1 s", "song 9,330", "0:14"], ["417 · 602 · 0.3 s", "song 777", "2:40"]];
  return (
    <>
      <Headline>Step 4: look up every pair</Headline>
      {rows.map((r, i) => (
        <At key={i} x={540} y={480 + i * 170}><Appear at={tLook + 0.2 + i * 0.5} from="right"><div style={{ display: "flex", gap: 22, alignItems: "center", whiteSpace: "nowrap", fontFamily: F.mono, fontSize: 40, background: "#0a121cee", padding: "16px 24px", borderRadius: 14, border: `3px solid ${C.muted}` }}>
          <span style={{ color: C.mint }}>{r[0]}</span><span style={{ color: C.muted }}>→</span>
          <span style={{ color: C.ink, opacity: 1 }}>{r[1]}</span><span style={{ color: C.amber }}>{r[2]}</span></div></Appear></At>
      ))}
      <At x={540} y={1030}><Appear at={tSong - 0.2} from="up"><Text size={60}>this <span style={{ color: C.ink }}>song</span>, this <span style={{ color: C.amber }}>second</span></Text></Appear></At>
      <Sfx name="pack/click-soft" at={tSec} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- step 5: the hits line up
const LineupBody: React.FC = () => {
  const t = useT();
  const w = useW();
  const tWrong = w(["random"], 1, 1.0), tRight = w(["right"], 1, 2.4), tSame = w(["moment."], 1, 4.2);
  const r = rnd(3);
  const N = 24;
  const bars = Array.from({ length: N }, () => 20 + r() * 60);
  return (
    <>
      <Headline>Step 5: the hits agree</Headline>
      <div style={{ position: "absolute", left: 90, top: 420, width: 900, height: 520, display: "flex", alignItems: "flex-end", gap: 10 }}>
        {bars.map((h, i) => {
          const spike = i === 15;
          const hh = spike ? tween(t, tRight, tSame, h, 500) : h * tween(t, tWrong - 0.6, tWrong + 0.3, 0, 1);
          return <div key={i} style={{ width: 27, height: hh, background: spike ? C.amber : C.muted, borderRadius: 6, opacity: spike ? 1 : 0.7 }} />;
        })}
      </div>
      <At x={540} y={985}><Text size={44} color={C.muted}>hits for each moment in the song</Text></At>
      <At x={760} y={390}><Appear at={tSame - 0.5} from="pop"><Chip color={C.amber} size={52}>1:02</Chip></Appear></At>
      <At x={540} y={1100}><Appear at={tRight - 0.2} from="up"><Text size={56} color={C.amber}>the right song: one moment</Text></Appear></At>
      <Sfx name="pack/ding" at={tSame} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const w = useW();
  const t1 = w(["1"], 1, 0.8), tBar = w(["bar."], 1, 5.0), tPhone = w(["phone"], 1, 4.0);
  return (
    <>
      <At x={540} y={560}><Spectro heat={0.12} stars={1} noise={1} surv={1} /></At>
      <At x={540} y={940}><Appear at={t1 - 0.2} from="slam"><Chip color={C.amber} size={68}>1 or 2 pairs in 100</Chip></Appear></At>
      <At x={540} y={1090}><Appear at={tPhone - 0.4} from="pop"><div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Icon name="Music" size={70} color={C.mint} /><Text size={60} color={C.mint}>song found</Text></div></Appear></At>
      <Sfx name="pack/notify-idea" at={tBar - 0.4} volume={0.25} />
    </>
  );
};

// ---------------------------------------------------------------- CTA
const CtaBody: React.FC = () => {
  const w = useW();
  const tHalf = w(["half"], 1, 0.4), tPairs = w(["pairs"], 1, 1.8);
  return (
    <>
      <At x={540} y={560}><Appear at={tHalf - 0.2} from="pop"><div style={{ display: "flex", gap: 50, alignItems: "center" }}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.amber }} />
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.amber, opacity: 0.3 }} />
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.amber }} />
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.amber, opacity: 0.3 }} /></div></Appear></At>
      <At x={540} y={700}><Appear at={tHalf} from="up"><Text size={60}>half the stars survive</Text></Appear></At>
      <At x={540} y={900}><Appear at={tPairs - 0.2} from="slam"><Text size={110} color={C.amber}>pairs: ?</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="context"><ContextBody /></Span>
    <Span from="picture"><PictureBody /></Span>
    <Span from="stars"><StarsBody /></Span>
    <Span from="rehook"><RehookBody /></Span>
    <Span from="pairs"><PairsBody /></Span>
    <Span from="lookup"><LookupBody /></Span>
    <Span from="lineup"><LineupBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
