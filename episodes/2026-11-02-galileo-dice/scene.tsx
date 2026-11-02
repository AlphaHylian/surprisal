// "Why 10 beats 9 with three dice": Galileo's count (Sopra le scoperte dei dadi).
// claim hook (9 and 10: six ways each, 10 wins) -> rule out loaded/luck -> list the six combos each
// -> paint the dice: 1-2-6 lands 6 ways -> 1-4-4 only 3, 3-3-3 one -> re-hook: count landings
// -> 25 vs 27 -> payoff 27 vs 25 of 216, 8% -> CTA 11 or 12?
import React from "react";
import {
  Appear, At, C, Camera, Chip, F, Headline, HookText, Punch, Riser, Sfx, Span, Stamp, Text, tween, useAt, useT,
} from "../kit";

const RED = "#e8655a", BLUE = "#5a8de8", GREEN = "#4fbf8a";
const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]], 6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};
const Die: React.FC<{ n: number; size?: number; color?: string; rot?: number }> = ({ n, size = 120, color = C.ink, rot = 0 }) => {
  const pip = size * 0.17;
  const pipColor = color === C.ink ? C.bg : "#ffffff";
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.18, background: color, position: "relative", transform: `rotate(${rot}deg)`,
      boxShadow: `0 8px 24px #0008`, flex: "none" }}>
      {PIPS[n].map(([r, c], i) => (
        <div key={i} style={{ position: "absolute", width: pip, height: pip, borderRadius: pip / 2, background: pipColor,
          left: size * (0.2 + 0.3 * c) - pip / 2 + size * 0.0, top: size * (0.2 + 0.3 * r) - pip / 2 }} />
      ))}
    </div>
  );
};
const Row: React.FC<{ dice: number[]; size?: number; colors?: string[]; gap?: number; rot?: number[] }> = ({ dice, size = 120, colors, gap = 22, rot }) => (
  <div style={{ display: "flex", gap }}>
    {dice.map((d, i) => <Die key={i} n={d} size={size} color={colors ? colors[i] : C.ink} rot={rot ? rot[i] : 0} />)}
  </div>
);
const RGB = [RED, BLUE, GREEN];
const NINE = [[1, 2, 6], [1, 3, 5], [1, 4, 4], [2, 2, 5], [2, 3, 4], [3, 3, 3]];
const TEN = [[1, 3, 6], [1, 4, 5], [2, 2, 6], [2, 3, 5], [2, 4, 4], [3, 3, 4]];
const W9 = [6, 6, 3, 3, 6, 1], W10 = [6, 6, 3, 6, 3, 3];

// ---------------------------------------------------------------- hook
const HookBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tMore = at.word("wins", 1, 2.4);
  const wob = (k: number) => 6 * Math.sin(t * 5 + k) * Math.exp(-t * 0.6);
  return (
    <>
      <HookText>{"9 and 10: 6 ways each.\n**10 wins.**"}</HookText>
      <Riser to={tMore} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.05 }]]}>
        <At x={390} y={650}><Row dice={[1, 2, 6]} size={150} rot={[wob(0), wob(1), wob(2)]} /></At>
        <At x={850} y={640}><Text size={90} color={C.muted}>= 9</Text></At>
        <At x={390} y={900}><Row dice={[3, 3, 4]} size={150} rot={[wob(3), wob(4), wob(5)]} /></At>
        <At x={850} y={900}><Text size={96} color={C.amber}>= 10</Text></At>
        <At x={540} y={1110}><Appear at={tMore} from="slam"><Chip color={C.amber} size={56}>10 comes up more</Chip></Appear></At>
      </Camera>
      <Sfx name="pack/hit-low" at={tMore} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- rule out
const RuleoutBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tLuck = at.word("luck", 1, 1.8);
  const tYears = at.word("years", 1, 4.5);
  const tWhy = at.word("why", 1, 6.5);
  return (
    <>
      <Headline>Not loaded. Not luck.</Headline>
      <At x={540} y={560}><Row dice={[1, 2, 6]} size={190} rot={[8 * Math.sin(t * 3), -6, 5 * Math.cos(t * 2)]} /></At>
      <At x={540} y={790}><Appear at={tLuck} from="pop"><Text size={56} color={C.muted}>fair dice, every time</Text></Appear></At>
      <At x={540} y={930}><Appear at={tYears} from="up"><Text size={58}>years of throws in Galileo's Italy</Text></Appear></At>
      <At x={540} y={1090}><Appear at={tWhy} from="slam"><Chip color={C.amber} size={60}>he worked out why</Chip></Appear></At>
    </>
  );
};

// ---------------------------------------------------------------- list + paint + doubles (one span)
const ListBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tPaint = at.beat("paint");
  const tDoub = at.beat("doubles");
  const tTen = tPaint - 1.9;               // "10 has six too" is the end of the list beat
  const tSix = tTen + 0.6;
  const tRed = at.word("red", 1, tPaint + 1.5);
  const tLand = at.word("land", 1, tPaint + 3.5);
  const tThree = at.word("three", 5, tDoub + 1.4); // "only three ways"
  const tThrees = at.word("threes", 1, tDoub + 4.5);
  const tOne = tLand + 0.5;
  const tRed0 = at.word("red", 1, tPaint + 1.5);
  const listOut = tRed0 - 0.25;
  // the six orderings of 1-2-6 and the three of 1-4-4
  const perm126 = [[1, 2, 6], [1, 6, 2], [2, 1, 6], [2, 6, 1], [6, 1, 2], [6, 2, 1]];
  const perm144 = [[1, 4, 4], [4, 1, 4], [4, 4, 1]];
  return (
    <>
      <Headline out={listOut}>Six ways each</Headline>
      <Headline at={listOut} out={tDoub - 0.3} color={C.amber}>Paint the dice</Headline>
      <Headline at={tDoub} color={C.coral}>Doubles land fewer ways</Headline>
      {/* the two lists */}
      {NINE.map((d, i) => (
        <At key={"n" + i} x={285} y={450 + i * 125}>
          <Appear at={0.15 + i * 0.35} out={listOut} from="left"><Row dice={d} size={96} gap={12} /></Appear>
        </At>
      ))}
      {TEN.map((d, i) => (
        <At key={"t" + i} x={780} y={450 + i * 125}>
          <Appear at={tTen - 0.1 + i * 0.1} out={listOut} from="right"><Row dice={d} size={96} gap={12} /></Appear>
        </At>
      ))}
      <At x={285} y={360}><Appear at={0.05} out={listOut} from="fade" sfx={null}><Text size={48} color={C.muted}>make 9</Text></Appear></At>
      <At x={780} y={360}><Appear at={tTen - 0.2} out={listOut} from="fade" sfx={null}><Text size={48} color={C.muted}>make 10</Text></Appear></At>
      <At x={540} y={1130}><Appear at={tSix} out={listOut} from="slam"><Chip color={C.ink} size={50}>6 ways = 6 ways</Chip></Appear></At>
      {/* paint: 1-2-6 in colour, then its six landings */}
      <Camera keys={[[0, { zoom: 1 }], [tPaint, { zoom: 1 }], [tLand, { zoom: 1 }], [tLand + 1.2, { zoom: 0.98 }]]}>
        <At x={540} y={450}>
          <Appear at={tRed} out={tDoub - 0.2} from="pop"><Row dice={[1, 2, 6]} size={130} colors={RGB} /></Appear>
        </At>
        {perm126.map((p, i) => (
          <At key={"p" + i} x={i % 2 ? 775 : 290} y={660 + Math.floor(i / 2) * 150}>
            <Appear at={tOne + i * 0.3} out={tDoub - 0.2} from="pop"><Row dice={p} size={100} colors={RGB} gap={12} /></Appear>
          </At>
        ))}
        <At x={540} y={1130}><Appear at={tOne + 1.9} out={tDoub - 0.2} from="slam"><Chip color={C.mint} size={52}>1-2-6: 6 landings</Chip></Appear></At>
        {/* doubles */}
        {perm144.map((p, i) => (
          <At key={"q" + i} x={540} y={470 + i * 160}>
            <Appear at={tDoub + 0.4 + i * 0.35} from="left"><Row dice={p} size={120} colors={RGB} gap={16} /></Appear>
          </At>
        ))}
        <At x={540} y={920}><Appear at={tThree} from="slam"><Chip color={C.coral} size={54}>1-4-4: only 3</Chip></Appear></At>
        <At x={400} y={1070}><Appear at={tThrees} from="pop"><Row dice={[3, 3, 3]} size={100} colors={RGB} gap={12} /></Appear></At>
        <At x={760} y={1070}><Appear at={tThrees + 0.2} from="pop"><Text size={60} color={C.coral}>just 1</Text></Appear></At>
      </Camera>
      <Sfx name="pack/ding-short" at={tSix} volume={0.4} />
      <Sfx name="pack/wrong" at={tThree + 0.05} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- re-hook + count
const CountBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCount = at.beat("count");
  const tLand = at.word("landings", 1, 1.8);
  const t25 = at.word("25", 1, tCount + 3.6);
  const t10 = at.word("10", 1, tCount + 4.4);
  const t27 = at.word("27", 1, tCount + 7.6);
  const step9 = (t25 - tCount - 0.3) / 6;
  const step10 = (t27 - t10 - 0.3) / 6;
  return (
    <>
      <Headline out={tCount - 0.3} color={C.amber}>Count the landings</Headline>
      <Headline at={tCount}>9 vs 10</Headline>
      <At x={540} y={640}><Appear at={0.1} out={tCount - 0.2} from="pop"><Stamp size={100} color={C.coral}>6 WAYS?</Stamp></Appear></At>
      <At x={540} y={900}><Appear at={tLand} out={tCount - 0.2} from="up"><Text size={60} color={C.amber}>count how each can land</Text></Appear></At>
      {NINE.map((d, i) => (
        <At key={"n" + i} x={265} y={430 + i * 112}>
          <Appear at={tCount + 0.1 + i * step9} from="left">
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Row dice={d} size={80} gap={8} />
              <Text size={60} color={W9[i] < 6 ? C.coral : C.mint}>{W9[i]}</Text>
            </div>
          </Appear>
        </At>
      ))}
      {TEN.map((d, i) => (
        <At key={"t" + i} x={775} y={430 + i * 112}>
          <Appear at={t10 + 0.1 + i * step10} from="right">
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Row dice={d} size={80} gap={8} />
              <Text size={60} color={W10[i] < 6 ? C.coral : C.mint}>{W10[i]}</Text>
            </div>
          </Appear>
        </At>
      ))}
      <At x={265} y={1120}><Appear at={t25} from="slam"><Chip color={C.ink} size={60}>9: 25</Chip></Appear></At>
      <At x={790} y={1120}><Appear at={t27} from="slam"><Chip color={C.amber} size={60}>10: 27</Chip></Appear></At>
      <Sfx name="pack/ding" at={t27} volume={0.4} />
    </>
  );
};

// ---------------------------------------------------------------- payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const t216 = at.word("216", 1, 1.0);
  const t27 = at.word("27", 1, 2.6);
  const t25 = at.word("25", 1, 4.0);
  const t8 = at.word("8%", 1, 5.0);
  const tGal = at.word("Galileo", 1, 6.5);
  const w27 = tween(t, t27 - 0.2, t27 + 0.6, 0, 27 * 26);
  const w25 = tween(t, t25 - 0.2, t25 + 0.6, 0, 25 * 26);
  return (
    <>
      <Headline color={C.amber}>Out of 216 throws</Headline>
      <At x={540} y={420}><Appear at={t216 - 0.2} from="pop"><Text size={58} color={C.muted}>every way 3 dice can land: 216</Text></Appear></At>
      <Punch at={t8}>
        <div style={{ position: "absolute", left: 150, top: 540 }}>
          <Text size={56} color={C.amber}>10</Text>
        </div>
        <div style={{ position: "absolute", left: 240, top: 545, height: 70, width: w27, background: C.amber, borderRadius: 12 }} />
        <div style={{ position: "absolute", left: 250 + w27, top: 548, opacity: t > t27 ? 1 : 0 }}><Text size={52} color={C.amber}>27</Text></div>
        <div style={{ position: "absolute", left: 165, top: 680 }}>
          <Text size={56} color={C.ink}>9</Text>
        </div>
        <div style={{ position: "absolute", left: 240, top: 685, height: 70, width: w25, background: C.muted, borderRadius: 12 }} />
        <div style={{ position: "absolute", left: 250 + w25, top: 688, opacity: t > t25 ? 1 : 0 }}><Text size={52}>25</Text></div>
      </Punch>
      <At x={540} y={880}><Appear at={t8} from="slam"><Chip color={C.amber} size={62}>8% more often</Chip></Appear></At>
      <At x={540} y={1060}><Appear at={tGal} from="up"><Text size={50} color={C.muted}>Galileo, about 400 years ago</Text></Appear></At>
      <Sfx name="pack/kaching" at={t8} volume={0.35} />
    </>
  );
};

const CtaBody: React.FC = () => {
  const t = useT();
  const at = useAt();
  const t12 = at.word("12", 1, 2.2);
  return (
    <>
      <At x={540} y={360}><Appear at={0} from="pop"><Text size={84} color={C.amber}>11 or 12?</Text></Appear></At>
      <At x={400} y={640}><Row dice={[5, 5, 1]} size={120} rot={[5 * Math.sin(t * 4), -4, 6]} /></At>
      <At x={850} y={640}><Text size={80} color={C.muted}>= 11</Text></At>
      <At x={400} y={880}><Appear at={t12 - 0.4} from="pop"><Row dice={[4, 4, 4]} size={120} rot={[-5, 5 * Math.cos(t * 4), 3]} /></Appear></At>
      <At x={850} y={880}><Appear at={t12 - 0.4} from="pop" sfx={null}><Text size={80} color={C.muted}>= 12</Text></Appear></At>
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleoutBody /></Span>
    <Span from="list" to="doubles"><ListBody /></Span>
    <Span from="rehook" to="count"><CountBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
