// "Why a secret key used twice is a key given away": the one-time pad, how-to format.
// versus hook (once: unbreakable, twice: broken) -> rule out a faster computer -> encrypt ATTACK with a
// 6-letter key -> the spy tries keys: ATTACK, DEFEND, anything (unbreakable) -> re-hook: you reuse it
// -> subtract: the key cancels -> guess ATTACK: RETIRE and the key drop out -> Venona, 1942 -> CTA subscribe.
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp, Text,
  tween, useAt, useT,
} from "../kit";

const KEY = "XMCKLQ";
const SENT1 = "XFVKNA"; // ATTACK + KEY
const SENT2 = "OQVSCU"; // RETIRE + KEY
const DIFF = "JPASLG";  // SENT1 - SENT2 = ATTACK - RETIRE

// ---------------------------------------------------------------- a row of letter tiles
const Row: React.FC<{ text: string; color?: string; size?: number; show?: number; stagger?: number; label?: string; labelColor?: string; strike?: number }> =
  ({ text, color = C.ink, size = 104, show = -1, stagger = 0.08, label, labelColor = C.muted, strike }) => {
    const t = useT();
    const sk = strike === undefined ? 0 : tween(t, strike, strike + 0.3, 0, 100);
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        {label ? <Text size={42} color={labelColor} font={F.med}>{label}</Text> : null}
        <div style={{ position: "relative", display: "flex", gap: 10 }}>
          {text.split("").map((ch, i) => {
            const p = show < 0 ? 1 : tween(t, show + i * stagger, show + i * stagger + 0.22, 0, 1);
            return (
              <div key={i} style={{ width: size, height: size * 1.12, borderRadius: size * 0.14, display: "flex", alignItems: "center", justifyContent: "center",
                background: `${color}1F`, border: `5px solid ${color}`, color, fontFamily: F.mono, fontSize: size * 0.62,
                opacity: p, transform: `translateY(${(1 - p) * 18}px)`, boxShadow: "0 8px 18px #0006" }}>{ch}</div>
            );
          })}
          {strike !== undefined ? (
            <div style={{ position: "absolute", left: -16, top: "50%", width: `${sk * 1.05}%`, height: 14, background: C.coral, borderRadius: 7, transform: "rotate(-4deg)" }} />
          ) : null}
        </div>
      </div>
    );
  };

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tTwice = at.word("Twice:", 1, 1.6);
  const tBroken = at.word("broken.", 1, 2.4);
  return (
    <>
      <HookText>{"Key used once: **unbreakable**.\nUsed twice: **broken**."}</HookText>
      <Riser to={tBroken} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06 }]]}>
        <At x={290} y={720}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Icon name="Lock" size={230} color={C.mint} glow />
            <Chip size={64} color={C.mint}>1 message</Chip>
          </div>
        </At>
        <Shake at={tBroken}>
          <At x={790} y={720}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <Icon name={t >= tBroken - 0.05 ? "LockOpen" : "Lock"} size={230} color={t >= tTwice ? C.coral : C.ink} glow={t >= tBroken} />
              <Chip size={64} color={C.coral}>2 messages</Chip>
            </div>
          </At>
        </Shake>
        <At x={540} y={1040}><Appear at={0} from="fade"><Text size={52} color={C.muted}>same secret key</Text></Appear></At>
      </Camera>
      <Sfx name="pack/glitch" at={tBroken} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out a faster computer
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tFaster = at.word("faster", 1, 0.8);
  const tSecond = at.word("two", 1, 1.6);
  const tAway = at.word("away.", 1, 3.2);
  const strike = tween(t, tFaster + 0.5, tFaster + 0.8, 0, 100);
  return (
    <>
      <At x={540} y={430}>
        <Appear at={0.02} from="pop">
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 24 }}>
            <Icon name="Cpu" size={130} color={C.muted} />
            <Text size={72}>faster computer</Text>
            <div style={{ position: "absolute", left: -20, top: "50%", width: `${strike * 1.1}%`, height: 14, background: C.coral, borderRadius: 7, transform: "rotate(-4deg)" }} />
          </div>
        </Appear>
      </At>
      <At x={540} y={760}>
        <Appear at={tSecond - 0.1} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <Icon name="Mail" size={150} color={C.ink} />
            <Icon name="Mail" size={150} color={C.amber} />
          </div>
        </Appear>
      </At>
      <At x={540} y={1000}><Appear at={tAway - 0.3} from="slam"><Chip size={68} color={C.amber}>message 2 leaks the key</Chip></Appear></At>
      <Sfx name="pack/wrong" at={tFaster + 0.5} volume={0.25} />
      <Sfx name="pack/suspense-sting" at={tAway - 0.3} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 3. encrypt
const EncryptBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tMsg = at.word("attack.", 1, 0.8);
  const tKey = at.word("key:", 1, 1.8);
  const tShift = at.word("Shift", 1, 3.6);
  const tFwd = at.word("forward", 1, tShift + 0.8);
  // highlight one column at a time while the letters shift
  const col = Math.floor(tween(t, tShift, at.dur - 0.2, 0, 6));
  return (
    <>
      <Headline out={at.dur - 0.3}>Shift by the key</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tShift, { zoom: 1 }], [tFwd, { zoom: 1.06, y: 720 }], [at.dur, { zoom: 1.06, y: 720 }]]}>
        <At x={540} y={480}><Row text="ATTACK" label="your message" show={tMsg - 0.2} /></At>
        <At x={540} y={700}><Row text={KEY} label="+ key (random)" color={C.amber} labelColor={C.amber} show={tKey + 0.2} stagger={0.12} /></At>
        <At x={540} y={950}><Row text={SENT1} label="= what you send" color={C.mint} labelColor={C.mint} show={tShift} stagger={(at.dur - tShift - 0.4) / 6} /></At>
        {t >= tFwd ? (
          <At x={540} y={1110}>
            <Text size={46} color={C.muted} font={F.mono}>{["A+X=X", "T+M=F", "T+C=V", "A+K=K", "C+L=N", "K+Q=A"][Math.min(col, 5)]}</Text>
          </At>
        ) : null}
      </Camera>
      <Sfx name="pack/hacking" at={tShift} volume={0.25} dur={1.6} />
    </>
  );
};

// ---------------------------------------------------------------- 4. the spy tries keys
const JUNK = ["ZQWERT", "MONKEY", "BRIDGE", "RETIRE", "PLKSJD", "SILVER", "GARDEN", "HXQUVN", "CASTLE", "WINTER"];
const SpyBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tTries = at.word("tries", 1, 1.4);
  const tAttack = at.word("attack.", 1, 3.0);
  const tDefend = at.word("defend.", 1, 4.4);
  const tEvery = at.word("Every", 1, 5.4);
  const tUnb = at.word("Unbreakable.", 1, 8.8);
  let key = "??????", out = "??????", good = C.muted;
  if (t >= tAttack - 0.3) { key = KEY; out = "ATTACK"; good = C.ink; }
  if (t >= tDefend - 0.3) { key = "UBQGAX"; out = "DEFEND"; }
  if (t >= tEvery) { const i = Math.floor((t - tEvery) / 0.22) % JUNK.length; out = JUNK[i]; key = JUNK[(i + 3) % JUNK.length].split("").reverse().join(""); }
  return (
    <>
      <Headline out={tEvery - 0.3}>The spy tries keys</Headline>
      <Headline at={tEvery} out={at.dur - 0.3} color={C.mint}>Every message fits</Headline>
      <At x={540} y={460}><Appear at={0.05} from="down"><Row text={SENT1} label="what the spy sees" color={C.mint} labelColor={C.mint} size={96} /></Appear></At>
      <At x={540} y={690}><Appear at={tTries - 0.1} from="left"><Row text={key} label="− a key" color={C.muted} size={96} /></Appear></At>
      <At x={540} y={920}><Appear at={tTries} from="left"><Row text={out} label="= reads" color={good} size={96} /></Appear></At>
      <At x={540} y={1100}><Appear at={tEvery + 0.3} out={tUnb - 0.1} from="up"><Text size={50} color={C.muted}>308 million messages, all equally likely</Text></Appear></At>
      <Punch at={tUnb}>
        <At x={540} y={1090}><Appear at={tUnb - 0.05} from="slam"><Stamp color={C.mint} size={92} rotate={-6}>UNBREAKABLE</Stamp></Appear></At>
      </Punch>
      <Sfx name="pack/ding-short" at={tAttack - 0.3} volume={0.3} />
      <Sfx name="pack/ding-short" at={tDefend - 0.3} volume={0.3} />
      <Sfx name="pack/counting-digital" at={tEvery} volume={0.25} dur={tUnb - tEvery} />
      <Sfx name="pack/slam-metal" at={tUnb} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 5-6. re-hook: reuse it, then subtract
const CancelBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tSlow = at.word("slow", 1, 1.0);
  const tReuse = at.word("reuse", 1, 2.4);
  const tC = at.beat("cancel");
  const tSub = at.word("subtracts", 1, tC + 0.6);
  const tCancel = at.word("cancels", 1, tC + 2.8);
  return (
    <>
      <Headline out={tC - 0.3} color={C.amber}>Reuse it. Just once.</Headline>
      <Headline at={tC} out={at.dur - 0.3}>Subtract the two</Headline>
      <At x={540} y={1100}><Appear at={tSlow - 0.1} out={tReuse} from="up"><Text size={50} color={C.muted}>random keys are slow to make</Text></Appear></At>
      <Camera keys={[[0, { zoom: 1 }], [tSub, { zoom: 1 }], [at.dur, { zoom: 1.05, y: 700 }]]}>
        <At x={540} y={460}><Appear at={0.05} from="left"><Row text={SENT1} label="message 1 = ATTACK + key" color={C.mint} labelColor={C.mint} size={96} /></Appear></At>
        <At x={540} y={700}><Appear at={tReuse} from="right"><Row text={SENT2} label="message 2 = ??? + same key" color={C.coral} labelColor={C.coral} size={96} /></Appear></At>
        {t >= tSub - 0.1 ? (
          <At x={540} y={940}><Row text={DIFF} label="1 − 2 = ATTACK − ??? (no key)" color={C.amber} labelColor={C.amber} size={96} show={tSub} stagger={0.07} /></At>
        ) : null}
      </Camera>
      <Punch at={tCancel}>
        <At x={540} y={1110}><Appear at={tCancel - 0.05} from="slam"><Chip size={66} color={C.coral}>key − key = nothing</Chip></Appear></At>
      </Punch>
      <Sfx name="pack/whoosh-fast" at={tReuse - 0.1} volume={0.3} />
      <Sfx name="pack/wrong" at={tCancel} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 7. guess one word
const GuessBody: React.FC = () => {
  const at = useAt();
  const tGuess = at.word("attack.", 1, 1.6);
  const tRetire = at.word("retire.", 1, 3.6);
  const tKey = at.word("key.", 1, 5.2);
  return (
    <>
      <Headline out={at.dur - 0.3}>Guess one word</Headline>
      <At x={540} y={420}><Row text={DIFF} label="ATTACK − ???" color={C.amber} labelColor={C.amber} size={92} /></At>
      <At x={540} y={630}><Appear at={tGuess - 0.4} from="left"><Row text="ATTACK" label="guess: message 1 is ATTACK" color={C.ink} size={92} /></Appear></At>
      <Punch at={tRetire}>
        <At x={540} y={850}><Appear at={tRetire - 0.3} from="slam"><Row text="RETIRE" label="message 2" color={C.coral} labelColor={C.coral} size={92} /></Appear></At>
      </Punch>
      <Shake at={tKey}>
        <At x={540} y={1060}><Appear at={tKey - 0.3} from="slam"><Row text={KEY} label="and your key" color={C.amber} labelColor={C.amber} size={80} /></Appear></At>
      </Shake>
      <Sfx name="pack/access-granted" at={tRetire - 0.2} volume={0.35} />
      <Sfx name="pack/boom-short" hit={tKey} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- 8. Venona
const VenonaBody: React.FC = () => {
  const at = useAt();
  const tDup = at.word("duplicated", 1, 1.6);
  const tCode = at.word("codebreakers", 1, 3.6);
  const t3000 = at.word("3,000", 1, 5.0);
  const tSpies = at.word("caught", 1, 6.2);
  const tAtom = at.word("atom", 1, 6.6);
  return (
    <>
      <Headline out={at.dur - 0.3}>1942: duplicate pages</Headline>
      <Camera keys={[[0, { zoom: 1 }], [tCode, { zoom: 1 }], [at.dur, { zoom: 1.06, y: 650 }]]}>
        <At x={540} y={500}>
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <Appear at={0.1} from="drop"><Icon name="FileText" size={190} color={C.ink} /></Appear>
            <Appear at={tDup - 0.1} from="pop"><Text size={110} color={C.coral}>=</Text></Appear>
            <Appear at={tDup} from="drop"><Icon name="FileText" size={190} color={C.coral} /></Appear>
          </div>
        </At>
        <At x={540} y={790}>
          <Appear at={tCode - 0.1} from="up">
            <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
              <Counter from={0} to={3000} t0={t3000 - 0.6} t1={t3000 + 0.4} size={110} color={C.amber} comma />
              <Text size={56}>messages read</Text>
            </div>
          </Appear>
        </At>
        <At x={540} y={1030}>
          <Appear at={Math.min(tSpies - 0.1, t3000 + 0.7)} from="up">
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Icon name="Atom" size={120} color={C.mint} glow />
              <Text size={58}>atom bomb spies caught</Text>
            </div>
          </Appear>
        </At>
      </Camera>
      <Sfx name="pack/paper-flip" at={tDup} volume={0.4} />
      <Sfx name="pack/ding" at={tAtom} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 9. CTA (loops back to the hook)
const CtaBody: React.FC = () => {
  const at = useAt();
  const tKey = at.word("key.", 1, 1.6);
  return (
    <>
      <At x={290} y={640}>
        <Appear at={0.05} from="pop">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Icon name="Lock" size={180} color={C.mint} glow />
            <Text size={50} color={C.mint}>once</Text>
          </div>
        </Appear>
      </At>
      <At x={790} y={640}>
        <Appear at={0.25} from="pop">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <Icon name="LockOpen" size={180} color={C.coral} glow />
            <Text size={50} color={C.coral}>twice</Text>
          </div>
        </Appear>
      </At>
      <At x={540} y={960}><Appear at={tKey - 0.4} from="up"><Text size={46} color={C.muted}>subscribe for the next one</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="encrypt"><EncryptBody /></Span>
    <Span from="spy"><SpyBody /></Span>
    <Span from="rehook" to="cancel"><CancelBody /></Span>
    <Span from="guess"><GuessBody /></Span>
    <Span from="venona"><VenonaBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
