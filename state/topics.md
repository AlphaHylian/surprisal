# Topic backlog (how-to format, from 2026-10-04)

Each line: **You're a ... and you have a problem** / the problem in one line / the steps that fix
it (the real mechanism) / the reveal at the end. Read docs/STYLE.md first ("The model script").
The two videos of a day should be different areas. When a topic is used, move its line to
**Used** with the date, slot and video ID. Add new ideas at the bottom, including topic requests
from comments (mark them `[requested]`).

`[check]` = facts to confirm today from a fetched source before writing. Every number still goes
through verify.py.

## Ready to go
- ZIP: you're a programmer, your file is too big to send. Steps: find repeats, replace them
  with "go back 13, copy 5" notes, keep a 32 KB window, give common letters short codes
  (Huffman), ship the code table with the file. Reveal: this is how every zip file works (Phil
  Katz, 1989). episodes/_example-zip is being rebuilt in this format; until its script.json has
  "hook_style": "how-to", don't publish it or copy its script (its scene code is still a fine
  example of the visual kit).
- You're a casino owner and people hate losing money to you. Steps: the house edge (one green
  zero = you keep 2.7% of every roulette bet), law of large numbers, chips instead of cash, comps
  scaled to losses. Reveal: the math of every real casino. (the owner's example; keep it about
  how the business works, never encourage gambling)
- You run an airline: 1 in 10 passengers never shows up, so your planes fly with empty paid
  seats. Steps: sell more tickets than seats, calculate the risk of bumping someone (binomial),
  pay volunteers to switch flights. Reveal: every airline overbooks. [check]
- You're an Allied analyst and you need to know how many tanks the enemy is building. Steps:
  collect serial numbers from captured tanks, use the biggest one, correct for the gap
  (m + m/k - 1). Reveal: the German tank problem; estimates beat spies. [check]
- You're an engineer: bombers come back full of bullet holes and command wants armor where the
  holes are. Steps: map the holes, ask where the missing planes were hit, armor the clean spots.
  Reveal: Abraham Wald, survivorship bias. [check]
- You're a cashier and people mistype card numbers all day. Steps: make the last digit a check
  digit, double every second digit, sum, mod 10 (Luhn). Reveal: every credit card number. [check]
- You run a supermarket and customers rage about picking the slow line. Steps: one snake line
  for all tills, simulate wait times, show the variance drop. Reveal: why banks and airports
  use one line.
- You run a factory and dirty QR codes on your parts won't scan. Steps: add error-correction
  bytes (Reed-Solomon), spread them across the code, recover up to 30%. Reveal: QR codes, Denso
  Wave 1994. [check]
- You're a game designer and players swear your 90% hit chance is rigged. Steps: show the real
  odds of misses in a row, then fake it (pseudo-random distribution) so it feels fair. Reveal:
  many games really do this. [check]
- You're the security team and a hacker can try 10 billion passwords a second. Steps: count
  the possibilities, length beats symbols, four random words. Reveal: why "correct horse
  battery staple" works. [check numbers]
- You're a pizza place owner and customers think two mediums beat one large. Steps: area, not
  diameter (pi r^2): one 18-inch has more pizza than two 12-inch. Reveal: price per square inch.
- You're running Secret Santa and people keep drawing their own name. Steps: count the bad
  draws, 63% chance of a redraw (1 - 1/e), the fix (derangements / cycle trick).
- You're YouTube's engineer and a video is about to break the view counter. Steps: how numbers
  are stored in bits, 2,147,483,647, switch to 64-bit. Reveal: Gangnam Style, 2014. [check]
- You're Spotify and users say shuffle is broken because songs repeat. Steps: true randomness
  clumps, show clusters, spread artists out on purpose. Reveal: Spotify changed shuffle. [check]
- You're a fraud investigator with a spreadsheet of expenses. Steps: count first digits,
  real numbers start with 1 about 30% of the time (log10 2), fakes don't. Reveal: Benford's law
  in real audits. [check]

## Used
- 2026-09-30  birthday-paradox (sounds-fake)  eQS8gtimpvA  first public video, 9pm Tallinn
- 2026-10-01  quarters-make-a-third (visual-proof)  YrD3-RjdX58  9pm Tallinn 1 Oct (scheduled after test upload; subscribers not notified)
- 2026-10-01  penneys-game (sounds-fake)  KVKRfzUtTE8  9pm Tallinn 1 Oct, LIVE scheduled, first hook-card opening
- 2026-10-02  clock-hands-meet (puzzle)  r92Byr0zgdQ  9pm Tallinn 2 Oct, LIVE scheduled, opening-card #2
- 2026-10-03  rope-around-earth (sounds-fake)  gaTzSWBn-dA  9pm Tallinn 3 Oct, LIVE scheduled, opening-card #3
