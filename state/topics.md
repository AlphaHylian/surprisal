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
  clumps, show clusters, spread artists out on purpose. Reveal: Spotify changed shuffle. [check] (2026-10-09: the Feb 2014 Spotify engineering post "How to shuffle songs?" now 404s; find another solid source first)
- Your servers keep overloading one at a time. Steps: send each job to a random server (the
  busiest ends up with a pile), then pick 2 at random and use the emptier one: the worst pile
  shrinks dramatically. Reveal: "power of two choices", used in real load balancers. [check] (tech)
- You're taking a penalty and the keeper guesses your side. Steps: never be predictable, mix
  sides in exact proportions so the keeper gains nothing by guessing. Reveal: pro penalty data
  matches game theory (Palacios-Huerta). [check] (everyday/sport)
- Your Wordle opener wastes guesses. Steps: score a guess by how evenly it splits the remaining
  words, pick the one that splits best. Reveal: information theory, bits. [check] (everyday)
- Your phone needs its position from satellites. Steps: each signal gives a distance (a sphere),
  3 spheres meet in a point, the 4th fixes your phone's bad clock. Reveal: GPS. [check] (tech)

## Used
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
