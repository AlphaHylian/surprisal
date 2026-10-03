# Topic backlog (story format, from 2026-10-04)

Each line: **who the viewer is** / the problem and stakes / the math that solves it. Read
docs/STYLE.md "The four rules" first. The two videos of a day should be different kinds
(history, everyday, tech, nature). When a topic is used, move its line to **Used** with the
date, slot and video ID. Add new ideas at the bottom of their kind, including topic requests
from comments (mark them `[requested]`).

`[check]` = the story rests on facts you must confirm today from a fetched source (Wikipedia is
fine) before writing; if the source disagrees with the line below, the source wins. Lines without
it still need every number computed in verify.py.

## History (real people, real dates)
- ZIP: you're a programmer in 1988, sued over your own file-shrinking app and banned from
  shipping it. You need a new way to make files smaller: store repeats as "go back N, copy M".
  A finished episode exists in episodes/_example-zip (built 2026-10-04); if it hasn't been
  published (check videos.csv), copy it to a dated folder, rebuild and use it.
- You're an engineer in WW2, bombers come back full of bullet holes. Where do you add armor?
  Survivorship bias: armor where the returning planes have NO holes (Abraham Wald). [check]
- You're an Allied spy chief, 1940s. How many tanks is Germany building? Use the serial numbers
  on captured tanks (German tank problem; stats estimate vs real production). [check]
- You're a codebreaker at Bletchley Park. Enigma never turns a letter into itself, and that one
  flaw rules out most settings (cribs). [check]
- You're a math professor at a Las Vegas blackjack table in 1962. The deck has a memory: once
  cards are gone the odds shift, and you can tell when to bet big (Ed Thorp, card counting). [check]
- You found a lottery that, on certain weeks, pays out more than it takes in (Massachusetts
  Cash WinFall roll-downs, MIT students). Expected value. [check]
- You're a YouTube engineer in 2014 and a video is about to break the view counter
  (Gangnam Style, 2,147,483,647 = 2^31 - 1, signed 32-bit integers). [check]
- You maintain the servers. On 19 January 2038 their clocks run out (Year 2038 problem,
  seconds since 1970 in 32 bits). [check]
- You're the engineer on Ariane 5's first launch, 1996. One number is too big for its box and
  the rocket self-destructs 37 seconds in (64-bit float -> 16-bit integer overflow). [check]
- You're a navigator in 1707 and you don't know where you are. 4 minutes of clock error = 1
  degree of longitude (Earth turns 15 degrees an hour; Harrison's clocks). [check]
- You're Eratosthenes, 240 BC, with a stick and a shadow. Measure the whole Earth: a 7.2 degree
  shadow means the cities are 1/50 of the way around. [check]
- You're a contestant on Let's Make a Deal. Switch doors? 2 out of 3. In 1990 Marilyn vos Savant
  said switch and thousands of readers, many with PhDs, told her she was wrong. [check]
- You're Spotify in 2014 and users say shuffle isn't random. It was. Real randomness clumps,
  so they made it less random. [check]
- You're the general manager of the 2002 Oakland A's with the smallest budget in baseball.
  Find the stat everyone else undervalues (on-base percentage, Moneyball). [check]
- You're a fraud investigator. Made-up numbers start with 1 too rarely: in real data about 30%
  start with 1 (Benford's law, log10 2). [check]
- You're launching GPS. Satellite clocks gain 38 microseconds a day; ignore it and positions drift
  about 10 km a day (relativity, distance = speed of light x time). [check]

## Everyday (no history needed, real numbers from verify.py)
- You're a casino owner. People hate losing money to you, so how do you win anyway? The house
  edge: one green zero makes roulette keep 2.7% of every bet, and over thousands of spins
  that's near-certain (law of large numbers).
- You run an airline with 150 seats. 1 in 10 passengers doesn't show. How many tickets can you
  sell before you have to bump someone? (binomial, simulate)
- You run a pizza place. One 18-inch pizza has more pizza than two 12-inch ones (area, pi r^2).
- You manage a supermarket. One long snake line beats separate lines for each till (queues,
  simulate waiting times).
- You're organizing Secret Santa for 10 friends. Chance someone draws their own name: about 63%
  (derangements, 1 - 1/e).
- You're collecting all 50 stickers in an album. Expect to buy about 225 (coupon collector,
  n x (1 + 1/2 + ... + 1/n)).
- You're a cashier typing a card number by hand. One wrong digit and the card is rejected
  instantly: the last digit is a check digit (Luhn algorithm). [check the history if you use it]
- You're the security team. A hacker guesses 10 billion passwords a second. Is "Tr0ub4dor" or
  four random words stronger? (count the possibilities, 26^n vs words^4)
- You're a teacher with 23 students. Bet the class two share a birthday: you win 50.7% of the
  time (birthday paradox, pairs not people; a reframe of the 2026-09-30 video).
- You're a game designer. Players complain your 90% hit chance misses too often (they remember
  streaks; chance of at least one miss in 10 tries is 65%).

## Tech
- You run a factory and the QR codes on your parts get dirty. Design a code that still scans with
  30% of it torn off (error correction; QR codes, Denso Wave 1994). [check]
- You're building Google in 1998 with a garage of computers. Which page is most important?
  Count the links, then weigh them (PageRank as a random surfer). [check]
- You run a delivery company with thousands of trucks. Cutting left turns saves fuel and time
  (route planning, UPS). [check the numbers carefully]

## Nature
- You're a cicada. Predators come every 2, 3, 4 or 5 years. Sleep 13 or 17 years, a prime, and
  you rarely meet them (least common multiples). [check]
- You're a bee building a honeycomb with the least wax. Hexagons tile the plane with the shortest
  walls. [check]

## Used
- 2026-09-30  birthday-paradox (sounds-fake)  eQS8gtimpvA  first public video, 9pm Tallinn
- 2026-10-01  quarters-make-a-third (visual-proof)  YrD3-RjdX58  9pm Tallinn 1 Oct (scheduled after test upload; subscribers not notified)
- 2026-10-01  penneys-game (sounds-fake)  KVKRfzUtTE8  9pm Tallinn 1 Oct, LIVE scheduled, first hook-card opening
- 2026-10-02  clock-hands-meet (puzzle)  r92Byr0zgdQ  9pm Tallinn 2 Oct, LIVE scheduled, opening-card #2
- 2026-10-03  rope-around-earth (sounds-fake)  gaTzSWBn-dA  9pm Tallinn 3 Oct, LIVE scheduled, opening-card #3
