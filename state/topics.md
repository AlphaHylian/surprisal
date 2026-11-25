# Topic backlog (how-to format, from 2026-10-04)

Each line: **You're a ... and you have a problem** / the problem in one line / the steps that fix
it (the real mechanism) / the reveal at the end. Read docs/STYLE.md first ("The model script").
The two videos of a day should be different areas. When a topic is used, move its line to
**Used** with the date, slot and video ID. Add new ideas at the bottom, including topic requests
from comments (mark them `[requested]`).

`[check]` = facts to confirm today from a fetched source before writing. Every number still goes
through verify.py.

## Ready to go
- You're Spotify and users say shuffle is broken because songs repeat. Steps: true randomness
  clumps, show clusters, spread artists out on purpose. Reveal: Spotify changed shuffle. [check] (2026-10-09: the Feb 2014 Spotify engineering post "How to shuffle songs?" now 404s; 2026-11-05: still 404 with and without trailing slash, web.archive.org not reachable from the run; find another solid source first)
- You're taking a penalty and the keeper guesses your side. Steps: never be predictable, mix
  sides in exact proportions so the keeper gains nothing by guessing. Reveal: pro penalty data
  matches game theory (Palacios-Huerta). [check] (everyday/sport) (2026-10-15: the paper's cell-by-cell scoring table couldn't be fetched (PDF mirrors 403); find a readable source with the 2x2 numbers first)




- Your phone guesses the next word: a bigram table from counts, why 'the' is followed by a noun, how much a typed letter narrows it (bits per letter). (tech) [check] (added 2026-11-16)
- Your parking meter / bus ticket: why a 'pay for 2 hours, average stay 40 min' price beats per-minute pricing; expected revenue with a stay distribution. (everyday) [check] (added 2026-11-17)
- Eratosthenes measured Earth with a shadow and a camel route: 7.2 degrees at Alexandria, 5,000 stadia to Syene, so 250,000 stadia around (history) [check: compare with 2026-10-16 earth-stick to avoid a repeat; pick a different angle, e.g. how big the stadion uncertainty is] (added 2026-11-17)
- Your phone's battery percentage: why it jumps from 20% to 5%, coulomb counting vs voltage curves. (tech) [check] (added 2026-11-17)
- Your Wi-Fi password QR / phone hotspot: why a 4-word passphrase beats 'P@ssw0rd1' (entropy in bits, 7,776-word list: 51.7 bits vs a guessable pattern). (tech) [check: compare with 2026-10-08 password-length and 2026-10-11 password-long; needs a clearly new angle] (added 2026-11-19)
- Your two-player game night: why rock-paper-scissors bots beat people (humans repeat after a win, switch after a loss; a frequency table predicts the next throw). (everyday) [check: a published study with the win-stay/lose-shift numbers] (added 2026-11-19) (2026-11-20: Wang, Xu & Zhou, Sci. Rep. 2014, arXiv 1404.5199: 360 Zhejiang students, 300 rounds; winners repeat more, losers shift 'clockwise' R->S; exact rates only in figures, no table found)


- Ideas added 2026-11-23: your phone's 'storage full' with 128 GB (system share + binary units, follow-up to drive-gigabytes) (tech) [check]; Black Friday 'was $X' anchor prices and how a % off hides the base (everyday) [check]; why 10% tip then 10% tax isn't the same as 20% (everyday).

## Used
- (new, not in Ready) One slow phone drags every device on your Wi-Fi down: equal turns not equal time (802.11 performance anomaly, Heusse et al. 2003); 11 vs 1 Mb/s, 1 ms vs 12 ms per packet, 3 fast + 1 slow: everyone 0.6 Mb/s vs 1.9; airtime fairness fix. (tech, claim) — built 2026-11-25 12:00, wifi-slow-phone, not uploaded by the bot (Zapier 429), sent to the owner
- (new, not in Ready) Switch lanes or stay put: the next lane looks faster 2/3 of the time in 20/40 mph waves, 30 pass you vs you pass 30 (Redelmeier & Tibshirani, Nature 1999; 70% of students). (everyday, versus) — built 2026-11-25 20:00, lane-switch, not uploaded by the bot (Zapier 429), sent to the owner
- (new, not in Ready) How JPEG deletes ~90% of a photo: 4:2:0 color (half the data), 8x8 blocks as 64 DCT patterns, rounding zeroes 40+ of 64, end-of-block code; 36 MB -> 3.6 MB (10:1, Wikipedia); measured 7-26x on 4 photos. (tech, claim) — used 2026-11-24 20:00, jpeg-tenth, 71frkpkuoK0
- (new, not in Ready) Walk or run in the rain: top catches rain per second, front sweeps the same drops either way; 100 m heavy rain walk 43 mL vs run 30 mL, 29% drier, infinite speed still 24 mL (Bocci 2012). (everyday, versus) — used 2026-11-24 12:00, rain-run, lBDQbYcFjWk
- Your recipe for 4 needs to feed 10: why you can't just multiply cooking time (volume grows with the cube, surface with the square; a turkey's time grows ~ weight^(2/3)). (everyday) [check] (added 2026-11-19) — used 2026-11-21 12:00 (as turkey-time: 2x the weight = 26% thicker, diffusion time ~ distance^2, +59%; 12 lb 3 h -> 24 lb 4 h 45, USDA 4.5-5 h), 7BIKpNqHhqs
- (new, not in Ready) Find the 1 bad change in 1,000 with 10 tests: binary search / git bisect, 500 250 ... 1, a million 20, a billion 30. (tech, versus) — used 2026-11-21 20:00, bad-commit, NsmVJmrIdHU
- Your phone's face unlock says 1 in 1,000,000 false match vs 1 in 50,000 for a fingerprint: what those rates mean across 1 billion unlock attempts. (tech) [check: Apple's published Face ID / Touch ID numbers] (added 2026-11-19) — used 2026-11-20 20:00 (as fingerprint-odds: 1 in 50,000 x 8.3 billion = 166,000, 5 tries = 1 in 10,000), ASpG0e59fFY
- (new, not in Ready) Two-dice board-game corners: 6 and 8 five ways each vs 2 and 12 one way, 10 vs 2 per 36 rolls, 7 = 1 in 6 pays nobody, token dots = ways, corner 6-8-5 14 vs 2-12-3 4; CTA 4-9-10 (10). (everyday) — used 2026-11-20 12:00, dice-corners, MHLj33EiKn4
- Your group of friends needs to know who owes whom after a trip: minimise the number of payments (net balances, at most n-1 transfers; greedy settle-up as Splitwise does). (everyday) [check] (added 2026-11-16) — used 2026-11-17 12:00, settle-up, Fk2O3iS4MN0
- Ships at sea before GPS: dead reckoning with speed, heading and time, and how the error grows each hour (log line knots: 47 ft 3 in per 28 s). (history) [check] (added 2026-11-16) — used 2026-11-17 20:00 (as chip-log: the knotted log line + dead reckoning), RwuL1iVRgn4
- (long-form) doomsday-long: long-form of doomsday-rule (10 Nov) — used 2026-11-15 20:00, 1CMjJkdDRfA
- You're ranking chess players who never played each other. Steps: Elo, expected score from the rating gap (400 points = 10:1), update by K times the surprise. Arpad Elo, adopted by FIDE 1970. (history) [check] (added 2026-11-13) — used 2026-11-15 12:00 (as everyday), elo-upset, EPvta1rA0_U
- (follow-up idea) Envy-free cake for three: Selfridge-Conway (1960), at most 5 cuts; the moving knife (27 Oct) is only proportional, and its first taker always thinks someone else got at least as much. (everyday) [check] — used 2026-11-13 20:00, envy-free-cake, GrE00f8SBrQ
- You need a letter to reach a stranger in Boston through friends only. Steps: Milgram 1967 small-world letters, how many hops the arriving ones took, why it works (friends of friends grow fast). (history) [check] — used 2026-11-13 12:00, small-world, 76CPM7qLyZo
- You're bidding in a sealed auction and don't know whether to bid your true value. Steps: second-price rule (Vickrey 1961), why shading your bid can only lose, eBay proxy bidding. (everyday) [check] -> used 2026-11-12 12:00 (proxy-bid, J8smfHtRiyM)
- (not in Ready) Hamming (7,4) code, three circles, 3 extra bits fix any single flip; Bell Labs Model V, 1950. (history) -> used 2026-11-12 20:00 (hamming-code, CrjDwSi85bs)
- You're running the medical-residency / school match and people keep breaking deals. Steps: deferred acceptance (Gale-Shapley 1962), no pair wants to swap, proposers get their best stable match; Roth/Shapley Nobel 2012. (everyday) [check] -> used 2026-11-10 12:00 (stable-match, w2J2Njoulyg)
- You want the weekday of any date in your head. Steps: Conway's Doomsday rule: 4/4, 6/6, 8/8, 10/10, 12/12 all share a weekday, plus the year's anchor. (everyday) [check] -> used 2026-11-10 20:00 (doomsday-rule, Vc4UioAfA7g)
- 2026-09-30  birthday-paradox (sounds-fake)  eQS8gtimpvA  first public video, 9pm Tallinn
- 2026-10-01  quarters-make-a-third (visual-proof)  YrD3-RjdX58  9pm Tallinn 1 Oct (scheduled after test upload; subscribers not notified)
- 2026-10-01  penneys-game (sounds-fake)  KVKRfzUtTE8  9pm Tallinn 1 Oct, LIVE scheduled, first hook-card opening
- 2026-10-02  clock-hands-meet (puzzle)  r92Byr0zgdQ  9pm Tallinn 2 Oct, LIVE scheduled, opening-card #2
- 2026-10-03  rope-around-earth (sounds-fake)  gaTzSWBn-dA  9pm Tallinn 3 Oct, LIVE scheduled, opening-card #3
- 2026-10-04  zip-how-to (tech, how-to)  R-daCCuG7e0  12:00 Tallinn 4 Oct, the owner's approved test video; first how-to + first Remotion video
- 2026-10-04  airline-overbooking (everyday, how-to)  Vew58AvSCqw  20:00 Tallinn 4 Oct, LIVE scheduled
- 2026-10-05  enemy-tanks (history, how-to)  zPGqWMiqTHc  12:00 Tallinn 5 Oct, LIVE scheduled
- 2026-10-05  card-typos (everyday, how-to)  9p3WtZl3RHk  20:00 Tallinn 5 Oct, LIVE scheduled
- 2026-10-06  bomber-armor (history, how-to)  -0VQd4nuBH8  12:00 Tallinn 6 Oct, LIVE scheduled
- 2026-10-06  secret-santa (everyday, how-to)  GDP9HkAVWFE  20:00 Tallinn 6 Oct, LIVE scheduled
- 2026-10-07  benford-expenses (tech, how-to)  ID unknown  12:00 Tallinn 7 Oct, uploaded by hand by the owner (Zapier task limit)
- 2026-10-07  pizza-sizes (everyday, how-to)  ID unknown  20:00 Tallinn 7 Oct, uploaded by hand by the owner (Zapier task limit)
- 2026-10-08  password-length (tech, how-to)  not uploaded by the bot (Zapier task limit): sent to the owner for 12:00 Tallinn 8 Oct
- 2026-10-08  one-line (everyday, how-to)  not uploaded by the bot (Zapier task limit): sent to the owner for 20:00 Tallinn 8 Oct
- 2026-10-09  roulette-edge (everyday, how-to, hook claim)  not uploaded by the bot (Zapier task limit): sent to the owner for 12:00 Tallinn 9 Oct
- 2026-10-09  view-counter (tech, how-to, hook question)  not uploaded by the bot (Zapier task limit): sent to the owner for 20:00 Tallinn 9 Oct
- 2026-10-10  qr-torn (tech, how-to, hook claim)  M3rmRETDAA8  12:00 Tallinn 10 Oct, LIVE scheduled
- 2026-10-10  true-hit (everyday, how-to, hook stakes)  UOAZvsmDHTM  20:00 Tallinn 10 Oct, LIVE scheduled
- 2026-10-11  two-choices (tech, how-to, hook versus)  TvXEXHRzfRI  12:00 Tallinn 11 Oct, LIVE scheduled
- 2026-10-11  password-long (tech, LONG-FORM 9:53, expands password-length)  FyapqYYFcaA  20:00 Tallinn 11 Oct, LIVE scheduled
- 2026-10-14  gps-fix (tech, how-to, hook question)  PeBsQcn5-1E  12:00 Tallinn 14 Oct, LIVE scheduled
- 2026-10-14  flat-hunt (everyday, how-to, hook mistake; secretary problem / 37% rule)  aUlvzZ4vwSE  20:00 Tallinn 14 Oct, LIVE scheduled
- 2026-10-15  wordle-opener (everyday, how-to, hook versus; RAISE 61 vs AUDIO 184 words left)  xSIugs3JUrI  12:00 Tallinn 15 Oct, LIVE scheduled
- 2026-10-15  fish-count (nature, how-to, hook stakes; mark and recapture, Lincoln-Petersen)  i2n0PSXZANc  20:00 Tallinn 15 Oct, LIVE scheduled
- 2026-10-16  sticker-album (everyday, how-to, hook mistake; coupon collector, 670-sticker album)  Ks_zISXypSU  12:00 Tallinn 16 Oct, LIVE scheduled
- 2026-10-16  earth-stick (history, how-to, hook question; Eratosthenes)  cXkg5XjvpxM  20:00 Tallinn 16 Oct, LIVE scheduled
- 2026-10-17  pin-guess (tech, how-to, hook claim; human-picked PINs, 1234 ~11%, dates 366/100)  cG7V4oZAT_w  12:00 Tallinn 17 Oct, LIVE scheduled
- 2026-10-17  monty-hall (everyday, how-to, hook versus; switch wins 2 in 3, 100 doors)  bWxBLz3KmEY  20:00 Tallinn 17 Oct, LIVE scheduled
- 2026-10-18  bus-bunching (everyday, how-to, hook claim; inspection paradox, bunched buses 5 -> 8.2 min, hold the early bus)  BmojS3ODdzA  12:00 Tallinn 18 Oct, LIVE scheduled
- 2026-10-18  two-choices-long (tech, LONG-FORM 8:33, expands two-choices; balls into bins, herding with stale info, nginx/Envoy, cuckoo hashing)  18S_z368-_o  20:00 Tallinn 18 Oct, LIVE scheduled
- 2026-10-19  sock-drawer (everyday, how-to, hook versus; pigeonhole: 3 for any pair, 12 for a black pair, London hair counts)  2xKKSv5WUQc  12:00 Tallinn 19 Oct, LIVE scheduled
- 2026-10-19  file-fingerprint (tech, how-to, hook claim; SHA-256 checksums, avalanche, byte-sum swap, pigeonhole twins, 2^128 / trillion years)  JjETWGaWEA0  20:00 Tallinn 19 Oct, LIVE scheduled
- 2026-10-20  escalator-stand (everyday, how-to, hook versus; TfL Holborn pilot: stand on both sides 12,745 -> 16,220 (+27%), 56 vs 62 a minute, 4 in 10 walk at 24 m, short escalators -10%)  e5N-MQARAD8  12:00 Tallinn 20 Oct, LIVE scheduled
- 2026-10-20  longitude-clock (history, how-to, hook claim; longitude by clock, 15 degrees an hour, 1 minute = 28 km, Longitude Act half a degree = 2 minutes, Harrison H4 5 s in 81 days)  oBozMJ4TtQU  20:00 Tallinn 20 Oct, LIVE scheduled
- 2026-10-21  key-twice (history, how-to, hook versus; one-time pad: ATTACK + XMCKLQ = XFVKNA, any 6-letter message fits, reuse cancels the key, guess ATTACK -> RETIRE; Venona: 1942 duplicate pages, ~3,000 messages)  kPA9NEn4qJ0  12:00 Tallinn 21 Oct, LIVE scheduled (made by the late 20 Oct run)
- (dropped from Ready) snake line vs 4 tills: already made as one-line (8 Oct, -JjFieXeoUA)
- 2026-10-21  average-speed (everyday, how-to, hook claim; average speed cameras: 5 km in 150 s = 120 km/h, braked to 95 at both, mean value theorem: passes 120 exactly; at 100 it takes 3 min, 30 s saved; SPECS since 1999)  sKsrfEgTi4Y  20:00 Tallinn 21 Oct, LIVE scheduled
- 2026-10-22  bent-coin (tech, how-to, hook versus; von Neumann trick: 70% coin, HT/TH 21% each, 42% of pairs count, ~5 flips per answer)  aVdSbOfUA7E  12:00 Tallinn 22 Oct, LIVE scheduled
- 2026-10-22  elevator-wrong-way (everyday, how-to, hook claim; Gamow-Stern elevator paradox: floor 1 of 10, 9 in 10 down, 2 cars 82%, 3 cars 76%, 10 cars 55%)  8pdijeBZDjA  20:00 Tallinn 22 Oct, LIVE scheduled
- 2026-10-23  ox-guess (history, how-to, hook versus; Galton's Vox Populi: 787 tickets, middle 1,207 vs 1,198 lb, off by 9, half missed by 37+, mistakes cancel; CTA 10/12/30/14/11 -> 12)  KMzRmP5Lnoc  12:00 Tallinn 23 Oct, LIVE scheduled
- 2026-10-23  seven-shuffles (everyday, how-to, hook claim; Bayer-Diaconis: one riffle = 2 rising runs, at most doubles, random deck ~26 runs, distance from random 4->100%, 5->92%, 6->61%, 7->33%, then halves)  PWJztpbkW_k  20:00 Tallinn 23 Oct, LIVE scheduled
- 2026-10-24  taxi-split (everyday, how-to, hook claim; Shapley value / airport game: meter 6/18/30, even split 10 vs 6 alone, stretch rule 2/8/20 = average over 6 join orders; runways, Littlechild & Owen 1973; CTA 12/24/36/48 -> 25)  2vqcXg477nE  12:00 Tallinn 24 Oct, LIVE scheduled
- 2026-10-24  seven-bridges (history, how-to, hook versus; Euler 1736: degrees 5/3/3/3, 4 odd, 372 stuck walks (256 at 6 of 7), pass-through needs even, Kaliningrad today 3/3/2/2 island to island)  b1YS0s1pq4c  20:00 Tallinn 24 Oct, LIVE scheduled
- 2026-10-25  unfinished-game (history, how-to, hook versus; problem of points, Pascal to Fermat 29 July 1654: first to 3 for 64, stopped 2-1, score split 43/21 (Pacioli 1494) vs 48/16; need 1 vs 2, one more round: 64 or 32, Fermat's 4 endings win 3; CTA 1-0 -> 44)  4ySChUoTpKU  12:00 Tallinn 25 Oct, LIVE scheduled
- 2026-10-25  average-speed-long (long-form of average-speed; SPECS division, mean value theorem via the ghost car, Rolle 1691 / Cauchy 1823, Lévy's universal chord theorem: every 2 km at 123.7 while 5 km at 120)  6y7_jF92mn0  20:00 Tallinn 25 Oct, LIVE scheduled
- 2026-10-26  friends-friends (everyday, how-to, hook claim; friendship paradox: Max/Ana/Ben/Cleo/Dev/Eli 5,2,2,1,1,1, Cleo 1 vs 5, Ana 2 vs 3.5, 5 of 6 lose, average person 2 vs average friend 3; Facebook 2011 92.7% of 721M; Feld 1991; CTA line A-B-C: 2 lose)  KQIN9dOPpRk  12:00 Tallinn 26 Oct, LIVE scheduled
- 2026-10-26  wine-barrel (history, how-to, hook versus; Kepler Linz 1613: 1 m rod, 50 cm wide 340 L vs 82 cm 605 L (44% less), rod^2 = width^2 + (length/2)^2, best length = width x sqrt 2, Austrian barrels close, 10% off loses under 1%; Nova stereometria 1615)  4JiFd97cbUo  20:00 Tallinn 26 Oct, LIVE scheduled
- 2026-10-27  letter-e (history, how-to, hook claim; frequency analysis: 26! = 403 septillion keys, a billion a second = 13 billion years, E = 1 letter in 8, top symbol = E 94% at 500 letters, THE gives T and H; Mary, Queen of Scots, beer barrel 1586, Phelippes, beheaded 1587)  ID pending: sent to the owner for 12:00 Tallinn 27 Oct (Zapier task limit)
- 2026-10-27  cake-three (everyday, how-to, hook versus; fair division: cut and choose for 2, the naive 3-way cut leaves Mia 1/4, Dubins-Spanier moving knife 1961 + cut and choose guarantees 1/3 by your own measure; CTA 4 friends -> yell at 1/4)  ID pending: sent to the owner for 20:00 Tallinn 27 Oct (Zapier task limit)
- 2026-10-28  fake-flips (everyday, how-to, hook versus; longest streak in 200 flips: 6+ in 96.5%, 1 in 32, 195 start places, fakers switch too often (Theodore Hill's homework); CTA longest streak in 20 flips (most likely 4))  not uploaded by the bot (Zapier task limit): sent to the owner for 12:00 Tallinn 28 Oct
- 2026-10-28  tea-test (history, how-to, hook claim; Fisher's lady tasting tea, Muriel Bristol at Rothamsted: C(8,4) = 70, 3+ right 17/70 about 1 in 4, all-or-nothing rule, The Design of Experiments 1935)  not uploaded by the bot (Zapier task limit): sent to the owner for 20:00 Tallinn 28 Oct
- 2026-10-29  voltaire-lottery (history, how-to, hook claim; 1729 French bond lottery: ticket = 1/1000 of the bond (100,000 -> 100 livres, 1,000 -> 1), same chance at the 500,000-livre jackpot, 100 livres = 100 small tickets = 100x the chance; La Condamine, Voltaire + 11; Voltaire ~half a million; CTA 5,000-livre bonds -> 20 tickets)  not uploaded by the bot (Zapier task limit): sent to the owner for 12:00 Tallinn 29 Oct
- 2026-10-29  raffle-slip (everyday, how-to, hook versus; one-slot reservoir sampling: guest k takes the slip with 1 in k (coin, die 1-2, 1 in 10), guest one survives 1/2 x 2/3 x ... = 1/100, everyone 1/100, count never needed; Algorithm R / Vitter 1985)  not uploaded by the bot (Zapier task limit): sent to the owner for 20:00 Tallinn 29 Oct
- 2026-10-30  pizza-cuts (everyday, how-to, hook versus; lazy caterer: 4 cuts 8 through the middle vs 11, cut 3: 6 vs 7, new cut adds 1 + crossings, 10 cuts 56 vs 20; CTA 5 cuts -> 16)  not uploaded by the bot (Zapier task limit): sent to the owner for 12:00 Tallinn 30 Oct
- 2026-10-30  needle-pi (history, how-to, hook claim; Buffon's needle: lines 3 cm, needle 2.5 cm, chance 5/(3 pi) = 53%; Lazzarini 1901 3,408 drops -> 355/113, honest spread 0.05, 3,408 = 16 x 213, 213 drops/113 crossings = 355/113, ~100 trillion drops for six honest digits; CTA 100 needles -> 53)  not uploaded by the bot (Zapier task limit): sent to the owner for 20:00 Tallinn 30 Oct
- 2026-10-31  gold-crown (history, how-to, hook claim; Archimedes' crown: gold 19.3 / silver 10.5 g/cm3, 1,000 g gold 52 cm3 vs 700+300 g 65 cm3, overflow in a 20 cm bowl 0.41 mm, balance in water 948.2 vs 935.2 g = 13 g tip; Vitruvius, Galileo La Bilancetta 1586; CTA 100 g swapped -> ~4 g)  not uploaded by the bot (Zapier task limit): sent to the owner for 12:00 Tallinn 31 Oct
- 2026-10-31  two-thirds (everyday, how-to, hook versus; guess 2/3 of the average: 50 -> 33 -> 22 -> 15 -> 10 -> 0, Politiken 2005 19,196 readers, winner 21.6, players stop at 1-2 steps (Nagel 1995); CTA your number in the comments)  not uploaded by the bot (Zapier task limit): sent to the owner for 20:00 Tallinn 31 Oct
- 2026-11-01  shortcut-traffic (everyday, how-to, hook versus; Braess's paradox, Wikipedia's network: 4,000 drivers, bridges 45 min, town roads cars/100; 2,000/2,000 = 65 min; zero-minute shortcut: first driver 40, everyone 80, switch back alone 85, +15 min for all; Stuttgart 1969 closed a new road; CTA subscribe if you'd have taken it)  not uploaded by the bot (Zapier task limit): sent to the owner for 12:00 Tallinn 1 Nov
- 2026-11-01  elevator-long (long-form of elevator-wrong-way; Gamow-Stern elevator paradox: floor 1 of 10, 9 in 10, gaps 18 vs 2, any floor = share above; Gamow 2nd / Stern 6th of seven storeys, 5 in 6, Puzzle Math 1958 "remain the same", Knuth 1969 13/18; 2/3/10 cars 82/76/55%, lean x0.8 per car, 6 cars 63%, 8 cars 58%; bus gaps 2/18 -> wait 8.2 vs 5; classes 10 and 50 -> 30 vs 43; real-building complications; CTA floor 9 two cars -> up 82%)  not uploaded by the bot (Zapier task limit): sent to the owner for 20:00 Tallinn 1 Nov
- 2026-11-02 12:00: Galileo's three dice, 9 vs 10 (25 vs 27 of 216) (galileo-dice; pending hand upload, Zapier task limit)
- 2026-11-02 20:00: green wave, faster bike = more red lights (green-wave; pending hand upload, Zapier task limit)
- 2026-11-03 12:00: tennis scoring, 54% of points -> 60% games, 76% sets, 86% best-of-3 matches; Federer 80% of 1,526 matches on 54% of points (Dartmouth 2024); CTA 51% -> 61% (tennis-points; pending hand upload, Zapier task limit)
- 2026-11-03 20:00: Franklin's codicil (1789), 1,000 pounds at 5%: 50, 52.50, doubles every 14 years, x131.5 per century, 131,000, spend 100,000, 31,000 x 131 = 4,061,000; Boston almost $5M by 1990; CTA 300 years -> ~2.3 billion (franklin-will; pending hand upload, Zapier task limit)
- 2026-11-04 12:00: Newton-Pepys problem (1693): one six from 6 dice 67%, two from 12 62%, three from 18 60%; misses (5/6)^6 = 33%; 18 dice fail on 0/1/2 = 40% (pepys-dice; pending hand upload, Zapier task limit)
- 2026-11-04 20:00: book stacking / harmonic overhang: 24 cm books out 12, 6, 4, 3 = 25 cm, 1 cm past the table; 31 books for 2 lengths, 227 for 3 (book-stack; pending hand upload, Zapier task limit)
- 2026-11-05 12:00: Shallit's 18-cent coin: 1-5-10-25 averages 4.7 coins over 0-99, 1-5-18-25 3.89 (-17%); 36 = two 18s, biggest-first gives 25+5+5+1 and fails on 37 of 100 amounts; CTA 72 cents -> four 18s (coin-18; pending hand upload, Zapier task limit)
- 2026-11-05 20:00: Lanchester's square law and Nelson's Trafalgar plan (Lanchester 1916 ch. 6): 40 vs 46 line up 1,600 vs 2,116 lose, 23 left; 32 on 23 1,024 vs 529, 22 left, +8 = 30 vs 23, ~20 afloat; Trafalgar 27 vs 33, 18 taken, none lost (nelson-split; pending hand upload, Zapier task limit)
- 2026-11-06 12:00: Blackett's convoy size: four 5x5 convoys edge 80 vs one 10x10 edge 40, same escorts twice as close; once inside a U-boat sinks a few either way; records: ~32 ships 2.5% lost, ~54 ships 1.1%; spring 1943 convoys of 100; CTA 400 ships -> twice the edge (convoy-size; pending hand upload, Zapier task limit)
- 2026-11-06 20:00: two eggs, 100 floors: halving 50, steps of 10 worst 19, shrinking jumps 14/27/39/50... worst 14, 14+...+1 = 105, 13 -> 91; CTA 200 floors -> 20 (two-eggs; pending hand upload, Zapier task limit)
- 2026-11-07 12:00: Simpson's paradox, Jeter vs Justice 1995-96: .250/.253, .314/.321, total .310/.270; at-bats 48/582 vs 411/140; equal weights .282 vs .287; CTA better home and away, worse overall? (yes) (batting-average; pending hand upload, Zapier task limit)
- 2026-11-07 20:00: Julian drift and the Gregorian fix: 365 d + 5 h 49 m, 365.25 is 11 min long, a day per 128 years, spring on 11 March by 1582, Thu 4 Oct -> Fri 15 Oct, drop 3 leap days per 400 (1700/1800/1900 skipped, 2000 kept), 27 s a year, a day per ~3,200 years; CTA 2100 leap? (no) (lost-days; pending hand upload, Zapier task limit)

- 2026-11-08 12:00: St. Petersburg paradox: pot $2 doubling on tails, every round adds $1, average infinite; a million games: half pay $2, 1 in 32 pays more than $32; round 30 pot $1,073,741,824; billionaire bank covers 30 rounds = about $30, world economy under $50; CTA millionaire -> about $20 (petersburg-pot; pending hand upload, Zapier task limit)
- 2026-11-08 20:00: earth-stick-long (LONG-FORM 8:50, expands earth-stick; parallel rays 0.0003 deg, flat-Earth close sun 6,300 km gives the same two shadows, third stick 45 vs 38, Syene 7.1 deg / 790 km, stadion 160-210 m: 40,000-52,500 km, 2012 repeat 40,074, Posidonius 240,000 / 180,000, Ptolemy and Columbus, leap day and sieve, the metre 40,000 by definition and 40,008, DIY 1,000 km -> 9 deg; CTA 3.6 deg -> 400 km) (pending hand upload, Zapier task limit)
- 2026-11-09  battleship-hunt (everyday, how-to, hook versus; checkerboard hunt + neighbour targeting, 97 -> 62 shots)  not uploaded by the bot (Zapier task limit): sent to the owner for 12:00 Tallinn 9 Nov
- 2026-11-09  enigma-crib (history, how-to, hook claim; no letter to itself, crib dragging, bombe 17,576 / 20 min)  not uploaded by the bot (Zapier task limit): sent to the owner for 20:00 Tallinn 9 Nov
- 2026-11-16 12:00: snell-triangles (history, how-to, hook claim; Snellius 1615 triangulation, 5 km baseline -> 130 km, 107 km per degree, 38,653 km, 3.5% low)  uYMaq2BKPgs
- 2026-11-16 20:00: thunder-count (everyday, how-to, hook versus; flash-to-bang, divide by 3, rumble = bolt length, second count gives arrival time)  TmpGGYSNJck
- 2026-11-18 12:00: egypt-doubling (history, how-to, hook claim; Egyptian doubling multiplication 13 x 24 = 192 + 96 + 24, unique split into doubles = binary, shift-and-add)  bgMJmPeWIOQ
- 2026-11-18 20:00: mpg-flip (everyday, how-to, hook versus; MPG illusion, 10->20 saves 500 gal vs 25->50 saves 200 per 10,000 miles, flip to gallons, Europe L/100 km)  7VEsgv1zrEM
- 2026-11-19 12:00 (Gs3sWT06SKo): Your delivery van has 20 stops: more routes than seconds since the Big Bang. Nearest stop first (24% too long on the demo), then uncross crossings (2-opt), within 3%; UPS ORION. (everyday, claim)
- 2026-11-19 20:00 (-Wg9h33pYeA): Check a billion usernames in 1.2 GB instead of 16: Bloom filter, 7 hashes, 9.6 bits per name, 1% false alarms; Chrome once used one. (tech, versus) [was: library / million books Bloom filter idea]
- 2026-11-22 12:00 (75h_8MAvL2s): plane-boarding (everyday, versus): back to front 6:11 vs random 4:44 vs Steffen two-rows-apart 3:36 (Steffen & Hotchkiss 2011, 72 passengers, 12 rows); CTA 30 rows, who boards after 30F? (28F)
- 2026-11-22 20:00 (_lCoJruFhYQ): chip-log-long (LONG-FORM 8:05, expands chip-log; 47 ft 3 in = 6,080 x 28/3,600, 1.85166 vs 1.852 km/h, Bourne 1574, traverse board, dead reckoning 7 kn x 4 h, 18 N + 16 E = 24 nm, Alcock & Brown 1919, current 1 kn = 24 nm/day, simulated 10-day crossing 5 nm vs 120 nm with a half-knot current, Scilly 1707, Longitude Act 1714, 1,852 m since 1929; CTA 30 s glass + 7 knots -> 6.5)
- 2026-11-23 12:00 (5YfqqaebBs0): drive-gigabytes (tech, claim): 1 TB shows 931 GB; makers count in 1,000s, Windows in 1,024s; 2.4/4.9/7.4/~10% per prefix; 10^12 / 1,024^3 = 931; Mac shows 1 TB; Western Digital settled 2006; CTA 500 GB -> 465.
- 2026-11-23 20:00 (SB_GeUgKnYc): stacked-discount (everyday, versus): half off + 20% more vs 70% off on a $200 coat: $80 vs $60; order doesn't matter (160 -> 80); 0.5 x 0.8 = 0.4 = 60% off; short by 50% x 20% = 10 points; CTA 30% + 30% = 51%. Timed for Black Friday (27 Nov).
