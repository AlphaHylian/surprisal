// "How Voltaire beat the lottery with its cheapest tickets": the 1729 French bond lottery.
// claim hook (1-livre ticket, 500,000 prize) -> rule out luck/cheating -> Paris 1729, lottery to sell bonds ->
// rule 1: ticket = 1/1000 of the bond (100 vs 1 livre) -> rule 2: same chance, 500,000 jackpot ->
// re-hook: the price grows, the chance doesn't -> small bonds: 100 livres = 100 tickets, 100x the chance ->
// team up: La Condamine, Voltaire and 11 friends -> payoff: won month after month, half a million, shut down ->
// CTA checkable question: 5,000-livre bonds, tickets for 100 livres (20).
import React from "react";
import {
  Appear, At, C, Camera, Chip, Counter, F, HookText, Headline, Icon, Punch, Riser, Sfx, Shake, Span, Stamp,
  Text, tween, useAt, useT,
} from "../kit";

// a lottery ticket with its price
const Ticket: React.FC<{ price: string; color?: string; size?: number }> = ({ price, color = C.amber, size = 1 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 * size }}>
    <Icon name="Ticket" size={190 * size} color={color} />
    <Text size={Math.round(52 * size)} color={color} font={F.bold}>{price}</Text>
  </div>
);
// a grid of small tickets, the first n lit
const TicketGrid: React.FC<{ n: number; lit: number; color?: string; y0?: number; cols?: number; size?: number }> = ({
  n, lit, color = C.mint, y0 = 520, cols = 10, size = 70,
}) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <At key={i} x={540 - ((cols - 1) * (size + 14)) / 2 + (i % cols) * (size + 14)} y={y0 + Math.floor(i / cols) * (size + 10)}>
        <div style={{ opacity: i < lit ? 1 : 0 }}><Icon name="Ticket" size={size} color={color} /></div>
      </At>
    ))}
  </>
);

// ---------------------------------------------------------------- 1. hook
const HookBody: React.FC = () => {
  const at = useAt();
  const tCheap = at.word("cheapest", 1, 1.8);
  return (
    <>
      <HookText size={92} y={290} out={at.dur - 0.3}>{"1-livre ticket.\n**500,000** prize."}</HookText>
      <Riser to={tCheap} volume={0.5} />
      <Camera keys={[[0, { zoom: 1 }], [at.dur, { zoom: 1.06, y: 760 }]]}>
        <At x={300} y={760}><Ticket price="1 livre" color={C.amber} /></At>
        <At x={540} y={760}><Text size={80} color={C.muted} font={F.bold}>→</Text></At>
        <At x={790} y={760}><Icon name="Landmark" size={210} color={C.mint} /></At>
        <At x={790} y={930}><Text size={52} color={C.mint} font={F.bold}>the jackpot</Text></At>
      </Camera>
      <Sfx name="pack/kaching" at={tCheap} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 2. rule out
const RuleOutBody: React.FC = () => {
  const at = useAt();
  const tCheat = at.word("cheating.", 1, 1.0);
  const tRules = at.word("rules", 1, 2.4);
  return (
    <>
      <Headline>Not luck. Not cheating.</Headline>
      <At x={360} y={620}><Appear at={0.05} from="pop"><Icon name="Clover" size={170} color={C.coral} /></Appear></At>
      <At x={720} y={620}><Appear at={tCheat - 0.3} from="pop"><Icon name="EyeOff" size={170} color={C.coral} /></Appear></At>
      <At x={540} y={940}>
        <Appear at={tRules - 0.3} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Icon name="ScrollText" size={150} color={C.amber} />
            <Text size={60} color={C.amber} font={F.bold}>the rules</Text>
          </div>
        </Appear>
      </At>
      <Sfx name="pack/paper-slide" at={tRules - 0.3} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 3. setup: Paris 1729
const SetupBody: React.FC = () => {
  const at = useAt();
  const tFrance = at.word("France", 1, 1.4);
  const tOnly = at.word("bonds.", 1, 3.0);
  return (
    <>
      <Headline>Paris, 1729</Headline>
      <At x={540} y={560}><Appear at={tFrance - 0.3} from="drop"><Icon name="Landmark" size={220} color={C.ink} /></Appear></At>
      <At x={540} y={800}><Appear at={tFrance + 0.4} from="pop"><Chip size={52}>a lottery to sell bonds</Chip></Appear></At>
      <At x={540} y={1000}>
        <Appear at={tOnly - 0.2} from="up"><Text size={54} color={C.mint} font={F.bold}>only bondholders play</Text></Appear>
      </At>
      <Sfx name="pack/paper-flip" at={tFrance + 0.4} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 4. rule one: price = bond / 1000
const PriceBody: React.FC = () => {
  const at = useAt();
  const tThousandth = at.word("thousandth", 1, 1.6);
  const tBig = at.word("100,000", 1, 3.0);
  const tSmall = at.word("1,000", 1, 5.2);
  return (
    <>
      <Headline>Rule 1: ticket = bond ÷ 1,000</Headline>
      <At x={540} y={440}><Appear at={tThousandth - 0.2} from="pop"><Text size={50} color={C.muted}>a thousandth of your bond</Text></Appear></At>
      <At x={290} y={640}><Appear at={tBig - 0.2} from="left"><Chip size={46}>100,000 bond</Chip></Appear></At>
      <At x={290} y={880}><Appear at={tBig + 0.4} from="pop"><Ticket price="100 livres" color={C.coral} size={0.9} /></Appear></At>
      <At x={790} y={640}><Appear at={tSmall - 0.2} from="right"><Chip size={46}>1,000 bond</Chip></Appear></At>
      <At x={790} y={880}><Appear at={tSmall + 0.4} from="pop"><Ticket price="1 livre" color={C.amber} size={0.9} /></Appear></At>
      <Sfx name="pack/cash-ting" at={tBig + 0.4} volume={0.3} />
      <Sfx name="pack/cash-ting" at={tSmall + 0.4} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 5. rule two: same chance, 500,000
const ChanceBody: React.FC = () => {
  const at = useAt();
  const tSame = at.word("same", 1, 1.4);
  const tJack = at.word("500,000", 1, 3.4);
  return (
    <>
      <Headline>Rule 2: same chance</Headline>
      <At x={290} y={560}><Ticket price="100 livres" color={C.coral} size={0.8} /></At>
      <At x={790} y={560}><Ticket price="1 livre" color={C.amber} size={0.8} /></At>
      <At x={540} y={560}><Appear at={tSame - 0.2} from="pop"><Text size={90} color={C.mint} font={F.bold}>=</Text></Appear></At>
      <At x={540} y={900}>
        <Appear at={tJack - 0.3} from="slam">
          <Counter from={0} to={500000} t0={tJack - 0.3} t1={tJack + 0.5} size={110} color={C.amber} suffix=" livres" />
        </Appear>
      </At>
      <At x={540} y={1040}><Appear at={tJack + 0.2} from="up"><Text size={46} color={C.muted}>the jackpot</Text></Appear></At>
      <Sfx name="pack/kaching" at={tJack} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 6. re-hook: spot the flaw
const ReHookBody: React.FC = () => {
  const at = useAt();
  const tPrice = at.word("price", 1, 1.0);
  const tChance = at.word("chance", 1, 2.6);
  return (
    <>
      <Headline color={C.amber}>Spot the flaw?</Headline>
      <At x={540} y={600}><Appear at={tPrice - 0.2} from="left"><Text size={64} font={F.bold}>price: <span style={{ color: C.coral }}>× 100</span></Text></Appear></At>
      <Shake at={tChance}>
        <At x={540} y={820}><Appear at={tChance - 0.2} from="right"><Text size={64} font={F.bold}>chance: <span style={{ color: C.mint }}>× 1</span></Text></Appear></At>
      </Shake>
      <Sfx name="pack/hmm" at={tChance} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 7. small bonds: 100 tickets for 100 livres
const SmallBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tRich = at.word("rich", 1, 1.8);
  const tBuys = at.word("buys", 1, 3.2);
  const tTimes = at.word("times", 1, 5.6);
  const lit = Math.round(tween(t, tBuys - 0.2, tBuys + 1.2, 0, 100));
  return (
    <>
      <Headline out={tTimes - 0.4}>Same 100 livres</Headline>
      <Headline at={tTimes - 0.3} color={C.amber}>100× the chance</Headline>
      <At x={540} y={420}>
        <Appear at={0.1} from="pop">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Icon name="Crown" size={80} color={C.coral} />
            <Text size={48} color={C.coral} font={F.bold}>rich player: 1 ticket</Text>
          </div>
        </Appear>
      </At>
      <Punch at={tTimes} amount={0.04}>
        <TicketGrid n={100} lit={lit} y0={500} size={52} />
      </Punch>
      <At x={540} y={1130}><Appear at={tBuys + 1.0} from="up"><Text size={48} color={C.mint} font={F.bold}>you: 100 tickets</Text></Appear></At>
      <Sfx name="pack/counting-digital" at={tBuys - 0.2} volume={0.25} dur={1.4} />
      <Sfx name="pack/correct" at={tTimes} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 8. team up
const ScaleBody: React.FC = () => {
  const at = useAt();
  const tTeam = at.word("team", 1, 0.4);
  const tLa = at.word("La", 1, 2.2);
  const t11 = at.word("11", 1, 3.6);
  return (
    <>
      <Headline>Buy up the small bonds</Headline>
      <At x={540} y={560}><Appear at={tTeam - 0.2} from="pop"><Icon name="Users" size={230} color={C.mint} /></Appear></At>
      <At x={540} y={800}><Appear at={tLa - 0.2} from="left"><Text size={56} font={F.bold}>La Condamine + Voltaire</Text></Appear></At>
      <At x={540} y={910}><Appear at={t11 - 0.2} from="right"><Text size={56} color={C.amber} font={F.bold}>+ 11 friends</Text></Appear></At>
      <Sfx name="pack/pop" at={tLa - 0.2} volume={0.3} />
      <Sfx name="pack/pop-2" at={t11 - 0.2} volume={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- 9. payoff
const PayoffBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tMonth = at.word("month", 1, 0.5);
  const tHalf = at.word("half", 1, 2.4);
  const tShut = at.word("shut", 1, 4.8);
  const months = Math.min(7, Math.max(0, Math.floor((t - tMonth + 0.2) / 0.25)));
  return (
    <>
      <Headline>Won month after month</Headline>
      <At x={540} y={480}>
        <div style={{ display: "flex", gap: 18 }}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} style={{ opacity: i < months ? 1 : 0.15 }}><Icon name="Trophy" size={96} color={C.amber} /></div>
          ))}
        </div>
      </At>
      <At x={540} y={720}>
        <Appear at={tHalf - 0.2} from="slam"><Text size={74} color={C.amber} font={F.bold}>Voltaire: ~500,000 livres</Text></Appear>
      </At>
      <At x={540} y={980}>
        <Appear at={tShut - 0.2} from="slam"><Stamp size={84} color={C.coral} rotate={-5}>LOTTERY SHUT DOWN</Stamp></Appear>
      </At>
      <Sfx name="pack/cash-register" at={tHalf - 0.2} volume={0.35} />
      <Sfx name="stamp" at={tShut} />
    </>
  );
};

// ---------------------------------------------------------------- 10. CTA: checkable question
const CtaBody: React.FC = () => {
  const at = useAt();
  const t5 = at.word("5,000", 1, 1.2);
  const t100 = at.word("100", 1, 3.4);
  return (
    <>
      <Headline color={C.amber}>Quick check</Headline>
      <At x={540} y={560}><Appear at={t5 - 0.2} from="pop"><Chip size={56}>5,000 bonds</Chip></Appear></At>
      <Punch at={t100} amount={0.06}>
        <At x={540} y={780}>
          <Appear at={t100 - 0.2} from="pop"><div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}><Text size={64} font={F.bold}>100 livres buys</Text><Text size={80} color={C.amber} font={F.bold}>? tickets</Text></div></Appear>
        </At>
      </Punch>
      <Sfx name="pack/ding-short" at={t100} volume={0.3} />
    </>
  );
};

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="ruleout"><RuleOutBody /></Span>
    <Span from="setup"><SetupBody /></Span>
    <Span from="price"><PriceBody /></Span>
    <Span from="chance"><ChanceBody /></Span>
    <Span from="rehook"><ReHookBody /></Span>
    <Span from="small"><SmallBody /></Span>
    <Span from="scale"><ScaleBody /></Span>
    <Span from="payoff"><PayoffBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
