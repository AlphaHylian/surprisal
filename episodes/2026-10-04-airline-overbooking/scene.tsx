// "How airlines sell more tickets than seats": overbooking as a how-to.
import React from "react";
import {
  Appear, At, Bar, C, Camera, Card, Chip, Counter, Emoji, F, Headline, Icon, Punch, Riser, Sfx, Shake,
  Span, Stamp, Text, You, tween, useAt, useT,
} from "../kit";

// ---------------------------------------------------------------- seat map: 180 seats, 18 x 10
const COLS = 18, ROWS = 10, SZ = 40, GAP = 8;
const GW = COLS * SZ + (COLS - 1) * GAP, GH = ROWS * SZ + (ROWS - 1) * GAP;
// Which 18 seats are no-shows (spread out, fixed so every frame agrees).
const EMPTY18 = [3, 14, 22, 37, 41, 55, 62, 78, 83, 97, 104, 116, 125, 133, 148, 151, 166, 177];
const EMPTY6 = [22, 62, 97, 125, 151, 177];

/** 180 seats. Seats in `empty` are drawn as open coral outlines from `emptyAt`; others fill in mint. */
const Seats: React.FC<{ t0?: number; empty?: number[]; emptyAt?: number; color?: string }> = ({ t0 = 0, empty = [], emptyAt = 0, color = C.mint }) => {
  const t = useT();
  return (
    <div style={{ position: "relative", width: GW, height: GH }}>
      {[...Array(COLS * ROWS)].map((_, i) => {
        const r = Math.floor(i / COLS), c = i % COLS;
        const on = tween(t, t0 + c * 0.02 + r * 0.01, t0 + c * 0.02 + r * 0.01 + 0.25, 0, 1);
        const isEmpty = empty.includes(i) && t >= emptyAt;
        return (
          <div key={i} style={{ position: "absolute", left: c * (SZ + GAP), top: r * (SZ + GAP), width: SZ, height: SZ,
            borderRadius: 10, opacity: on, transform: `scale(${0.5 + 0.5 * on})`,
            background: isEmpty ? "transparent" : color, border: isEmpty ? `4px solid ${C.coral}` : "none",
            boxShadow: isEmpty ? `0 0 16px ${C.coral}88` : "none" }} />
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------- 1. the problem
const HookBody: React.FC = () => {
  const at = useAt();
  const tEmpty = at.word("empty", 1, 2.4);
  const tSold = at.word("sold", 1, tEmpty + 0.8);
  return (
    <>
      <Riser from={0} to={tSold} volume={0.5} />
      <Shake at={tSold}>
        <Camera keys={[[0, { zoom: 1.08 }], [tSold, { zoom: 1 }], [at.dur, { zoom: 1.05, y: 640 }]]}>
          <At x={240} y={430}><Appear at={0} from="pop"><You role="airline boss" size={200} /></Appear></At>
          <At x={700} y={400}><Appear at={0.12} from="right" dist={160}><Icon name="Plane" size={300} color={C.ink} /></Appear></At>
          <At x={540} y={830}><Appear at={0.25} from="up"><div style={{ transform: "scale(0.85)" }}><Seats t0={0.25} empty={EMPTY18} emptyAt={tEmpty} /></div></Appear></At>
          <At x={540} y={1110}><Appear at={tSold} from="slam"><Stamp size={58} rotate={-4}>EMPTY, BUT PAID FOR</Stamp></Appear></At>
        </Camera>
      </Shake>
      <Sfx name="error" at={tEmpty} volume={0.35} />
      <Sfx name="whoosh" at={at.dur - 0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 2. count the no-shows
const NoShowBody: React.FC = () => {
  const at = useAt();
  const t1in10 = at.word("10", 1, 1.6);
  const t180 = at.word("180", 1, 3.2);
  const t18 = at.word("18", 1, 4.5);
  return (
    <>
      <Headline>Count the no-shows</Headline>
      <Camera keys={[[0, { zoom: 1 }], [t18, { zoom: 1 }], [t18 + 0.6, { zoom: 1.15, x: 540, y: 700 }]]}>
        <At x={540} y={420}>
          <Appear at={0.3} from="up">
            <div style={{ display: "flex", gap: 10 }}>
              {[...Array(10)].map((_, i) => (
                <Icon key={i} name={i === 9 ? "UserX" : "User"} size={84} color={i === 9 ? C.coral : C.ink} />
              ))}
            </div>
          </Appear>
        </At>
        <At x={540} y={530}><Appear at={t1in10} from="pop"><Chip color={C.coral} size={44}>1 in 10 never turns up</Chip></Appear></At>
        <At x={540} y={810}><Appear at={t180 - 0.2} from="up"><Seats t0={t180 - 0.2} empty={EMPTY18} emptyAt={t18} /></Appear></At>
        <At x={540} y={1100}>
          <Appear at={t18} from="slam">
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Counter from={0} to={18} t0={t18} t1={t18 + 0.5} size={84} color={C.coral} />
              <Text size={52} color={C.coral}>empty seats</Text>
            </div>
          </Appear>
        </At>
      </Camera>
    </>
  );
};

// ---------------------------------------------------------------- 3. sell more tickets / sell 200
const SellBody: React.FC = () => {
  const at = useAt();
  const tNaive = at.beat("naive");
  const t200 = at.word("200", 1, tNaive + 0.4);
  const tAvg = at.word("180", 1, tNaive + 2.2);
  const tHalf = at.word("half", 1, tNaive + 4.4);
  return (
    <>
      <Headline out={tNaive - 0.3}>Oversell</Headline>
      <Headline at={tNaive} out={tHalf - 0.3}>Sell 200?</Headline>
      <Headline at={tHalf} color={C.coral}>Uh-oh</Headline>
      <At x={540} y={480}>
        <Appear at={0.1} from="pop">
          <Card w={640} h={330} border={C.amber}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <Icon name="Ticket" size={120} color={C.amber} />
              <Counter from={180} to={200} t0={t200} t1={t200 + 0.6} size={130} color={C.amber} />
            </div>
            <Text size={46} color={C.muted}>tickets for 180 seats</Text>
          </Card>
        </Appear>
      </At>
      <At x={540} y={760}><Appear at={tAvg} from="up"><Chip color={C.mint} size={46}>average show-ups: 180</Chip></Appear></At>
      <Shake at={tHalf}>
        <At x={540} y={940}>
          <Appear at={tHalf - 0.1} from="up">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
              <Bar from={0} to={0.465} t0={tHalf} t1={tHalf + 0.7} w={760} h={50} color={C.coral} />
              <Text size={46} color={C.coral}>46.5% of flights: too many people</Text>
            </div>
          </Appear>
        </At>
      </Shake>
      <Sfx name="error" at={tHalf + 0.7} volume={0.45} />
    </>
  );
};

// ---------------------------------------------------------------- 4. the odds: coins, then the distribution
const binom = (n: number, k: number, p: number) => {
  let lc = 0;
  for (let i = 1; i <= k; i++) lc += Math.log((n - k + i) / i);
  return Math.exp(lc + k * Math.log(p) + (n - k) * Math.log(1 - p));
};
const OddsBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tCoin = at.word("coin", 1, 2.6);
  const tPick = at.beat("pick");
  const t193 = at.word("193", 1, tPick + 1.4);
  const t22 = at.word("22", 1, tPick + 3.2);
  const KS = [...Array(34)].map((_, i) => 160 + i); // 160..193 people showing up
  const P = KS.map((k) => binom(193, k, 0.9));
  const maxP = Math.max(...P);
  const chartIn = tween(t, t193 - 0.1, t193 + 0.3, 0, 1);
  return (
    <>
      <Headline out={tPick - 0.3}>You need the odds</Headline>
      <Headline at={tPick} color={C.amber}>Sell 193</Headline>
      {t < t193 ? (
        <>
          <At x={540} y={400}><Appear at={0.05} out={tCoin - 0.3} from="pop"><Stamp size={64} color={C.coral} rotate={-4}>AVERAGE: NOT ENOUGH</Stamp></Appear></At>
          <At x={540} y={560}>
            <div style={{ display: "flex", flexWrap: "wrap", width: 760, gap: 20, justifyContent: "center" }}>
              {[...Array(10)].map((_, i) => (
                <Appear key={i} at={tCoin + i * 0.09} from="pop" volume={0.25}>
                  <div style={{ width: 130, height: 130, borderRadius: "50%", border: `6px solid ${i === 6 ? C.coral : C.mint}`, background: `${i === 6 ? C.coral : C.mint}22`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.bold, fontSize: 52, color: i === 6 ? C.coral : C.mint }}>
                    {i === 6 ? "no" : "yes"}
                  </div>
                </Appear>
              ))}
            </div>
          </At>
          <At x={540} y={900}><Appear at={tCoin + 1.0} from="up"><Text size={56} color={C.mint}>shows up: 9 times in 10</Text></Appear></At>
        </>
      ) : (
        <Camera keys={[[t193, { zoom: 1 }], [t22 - 0.2, { zoom: 1 }], [t22 + 0.4, { zoom: 1.15, x: 640, y: 720 }]]}>
          <At x={540} y={700} style={{ opacity: chartIn }}>
            <div style={{ position: "relative", display: "flex", alignItems: "flex-end", gap: 4, height: 560 }}>
              {KS.map((k, i) => {
                const h = tween(t, t193 + i * 0.015, t193 + i * 0.015 + 0.4, 2, (P[i] / maxP) * 480);
                const over = k > 180;
                return <div key={k} style={{ width: 22, height: h, borderRadius: 5, background: over ? C.coral : C.mint, opacity: over ? 1 : 0.7 }} />;
              })}
              <div style={{ position: "absolute", left: 21 * 26 - 2, bottom: 0, width: 4, height: 540, background: C.amber }} />
            </div>
          </At>
          <At x={330} y={1030}><Appear at={t193 + 0.3} from="fade"><Text size={42} color={C.muted}>people who show up</Text></Appear></At>
          <At x={645} y={455}><Appear at={t193 + 0.5} from="pop"><Chip size={40}>180 seats</Chip></Appear></At>
          <At x={820} y={600}><Appear at={t22} from="slam"><Chip color={C.coral} size={40}>1 in 22</Chip></Appear></At>
        </Camera>
      )}
      <Sfx name="whoosh" at={tPick - 0.1} volume={0.35} />
    </>
  );
};

// ---------------------------------------------------------------- 5. the gain
const GainBody: React.FC = () => {
  const at = useAt();
  const t6 = at.word("6", 1, 2.0);
  const t12 = at.word("12", 1, 3.6);
  return (
    <>
      <Headline color={C.mint}>Fuller planes</Headline>
      <At x={540} y={700}><Appear at={0} from="up"><Seats t0={0} empty={EMPTY18} emptyAt={0} /></Appear></At>
      <GainOverlay t6={t6} />
      <At x={540} y={360}>
        <Appear at={0.2} from="up">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Text size={52} color={C.muted}>empty seats</Text>
            <Counter from={18} to={6} t0={t6 - 0.3} t1={t6 + 0.4} size={96} color={C.coral} />
          </div>
        </Appear>
      </At>
      <At x={540} y={1050}><Appear at={t12} from="slam"><Chip color={C.mint} size={58}>+12 paying passengers</Chip></Appear></At>
      <Sfx name="coin" at={t12 + 0.1} volume={0.5} />
    </>
  );
};
/** Mint squares that cover 12 of the 18 empty seats as the counter drops. */
const GainOverlay: React.FC<{ t6: number }> = ({ t6 }) => {
  const t = useT();
  const fillers = EMPTY18.filter((i) => !EMPTY6.includes(i));
  return (
    <At x={540} y={700}>
      <div style={{ position: "relative", width: GW, height: GH }}>
        {fillers.map((i, j) => {
          const s = tween(t, t6 - 0.3 + j * 0.05, t6 - 0.1 + j * 0.05, 0, 1);
          const r = Math.floor(i / COLS), c = i % COLS;
          return <div key={i} style={{ position: "absolute", left: c * (SZ + GAP), top: r * (SZ + GAP), width: SZ, height: SZ, borderRadius: 10,
            background: C.amber, transform: `scale(${s})`, boxShadow: `0 0 18px ${C.amber}aa` }} />;
        })}
      </div>
    </At>
  );
};

// ---------------------------------------------------------------- 6. 182 show up -> auction
const AuctionBody: React.FC = () => {
  const at = useAt();
  const t = useT();
  const tAuc = at.beat("auction");
  const tHold = at.word("auction", 1, tAuc + 1.6);
  const t100 = at.word("100", 1, tAuc + 2.6);
  const t200 = at.word("200", 1, tAuc + 5.0);
  const tYes = at.word("yes", 1, at.dur - 0.6);
  const price = t < t200 ? 100 : t < tYes - 1.0 ? 200 : 300;
  return (
    <>
      <Headline out={tAuc - 0.3} color={C.coral}>182 people, 180 seats</Headline>
      <Headline at={tAuc} color={C.amber}>Hold an auction</Headline>
      {t < tHold ? (
        <Shake at={0.4}>
          <At x={540} y={560}><Appear at={0} from="up"><Seats t0={0} /></Appear></At>
          <At x={540} y={900}>
            <div style={{ display: "flex", gap: 30 }}>
              <Appear at={0.4} from="drop"><Icon name="User" size={130} color={C.amber} /></Appear>
              <Appear at={0.6} from="drop"><Icon name="User" size={130} color={C.amber} /></Appear>
            </div>
          </At>
          <At x={540} y={1080}><Appear at={0.8} from="pop"><Chip color={C.coral} size={44}>2 people, no seat</Chip></Appear></At>
          <Sfx name="error" at={0.5} volume={0.4} />
        </Shake>
      ) : (
        <>
          <At x={540} y={520}>
            <Appear at={tHold} from="pop">
              <Card w={620} h={380} border={C.amber}>
                <Text size={40} color={C.muted}>VOUCHER · later flight</Text>
                <Punch at={t200}>
                  <Text size={170} color={C.amber} font={F.bold} glow>${price}</Text>
                </Punch>
              </Card>
            </Appear>
          </At>
          <At x={540} y={880}>
            <Appear at={t100 + 0.8} from="up">
              <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
                {[0, 1, 2, 3, 4].map((i) => {
                  const yes = t >= tYes - 0.2 && (i === 1 || i === 3);
                  return <Icon key={i} name={yes ? "UserCheck" : "User"} size={110} color={yes ? C.mint : C.muted} glow={yes} />;
                })}
              </div>
            </Appear>
          </At>
          <At x={540} y={1060}><Appear at={tYes} from="slam"><Chip color={C.mint} size={50}>2 volunteers</Chip></Appear></At>
          <Sfx name="ding" at={t200} volume={0.4} />
          <Sfx name="ding" at={tYes - 1.0} volume={0.4} />
          <Sfx name="coin" at={tYes} volume={0.5} />
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------- 7. result, reveal, question
const ResultBody: React.FC = () => {
  const at = useAt();
  const tSold = at.word("sold", 1, at.dur - 1.0);
  return (
    <>
      <Headline color={C.mint}>Your airline now</Headline>
      <At x={540} y={540}><Appear at={0} from="up"><Seats t0={0} empty={EMPTY6} emptyAt={0} /></Appear></At>
      <At x={540} y={880}><Appear at={at.word("planes", 1, 0.8)} from="pop"><Chip color={C.mint} size={50}>fuller planes</Chip></Appear></At>
      <At x={540} y={1040}><Appear at={tSold} from="up"><Text size={48}>left behind: only volunteers</Text></Appear></At>
      <Riser from={at.dur - 1.6} to={at.dur} volume={0.45} />
    </>
  );
};

const RevealBody: React.FC = () => {
  const at = useAt();
  const tSimon = at.word("Simon's", 1, 2.6);
  return (
    <>
      <Punch at={0}>
        <At x={540} y={480}><Appear at={0} from="pop" sfx={null}><Icon name="PlaneTakeoff" size={360} color={C.amber} glow stroke={1.6} /></Appear></At>
        <At x={540} y={760}><Appear at={0.15} from="slam" sfx={null}><Text size={92} color={C.amber} glow font={F.bold}>every airline</Text></Appear></At>
        <At x={540} y={950}><Appear at={tSimon} from="up"><Text size={48} color={C.ink}>paying volunteers: Julian Simon's idea</Text></Appear></At>
      </Punch>
      <Sfx name="boom" at={0} volume={0.7} />
      <Sfx name="reveal" at={0.05} volume={0.5} />
    </>
  );
};

const CtaBody: React.FC = () => (
  <>
    <At x={540} y={500}>
      <Appear at={0} from="pop">
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <Icon name="Plane" size={160} />
          <Text size={96} font={F.bold}>100 seats</Text>
        </div>
      </Appear>
    </At>
    <At x={540} y={720}><Appear at={0.5} from="up"><div style={{ display: "flex", alignItems: "center", gap: 20 }}><Icon name="Ticket" size={110} color={C.amber} /><Text size={110} color={C.amber} font={F.bold}>?</Text></div></Appear></At>
    <At x={540} y={950}><Appear at={1.0} from="up"><div style={{ display: "flex", alignItems: "center", gap: 24 }}><You size={100} /><Chip size={44}>how many would you sell?</Chip></div></Appear></At>
    <At x={160} y={300}><Appear at={0.3} from="pop"><Emoji char="🤔" size={100} /></Appear></At>
  </>
);

const Scene: React.FC = () => (
  <>
    <Span from="hook"><HookBody /></Span>
    <Span from="noshow"><NoShowBody /></Span>
    <Span from="sell" to="naive"><SellBody /></Span>
    <Span from="odds" to="pick"><OddsBody /></Span>
    <Span from="gain"><GainBody /></Span>
    <Span from="over" to="auction"><AuctionBody /></Span>
    <Span from="result"><ResultBody /></Span>
    <Span from="reveal"><RevealBody /></Span>
    <Span from="cta"><CtaBody /></Span>
  </>
);
export default Scene;
