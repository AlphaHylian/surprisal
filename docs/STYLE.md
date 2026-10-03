# Surprisal style guide

The channel: the math behind real problems. Every Short is a **how-to in second person**: the
viewer has a problem right now, and the video tells them, step by step, exactly how to fix it.
The steps ARE the math. At the end, one line reveals it's real ("This is how every zip file
works.").

History, so you don't repeat it:
- "Sounds wrong but is true" (Sep 30 - Oct 3): topics too niche to care about. Dropped.
- "Story" format (Oct 4, one day): 17 seconds of backstory before any math, explanations too
  vague, and a historical problem ("you got sued in 1988") nobody feels. Dropped.

## The model script (the owner's example; study its moves, not its topic)

> You're a casino owner and you have a problem. People don't like losing their money to you.
> Here's how you fix it. Take down all the clocks, block out the windows, and rearrange your
> place to have a maze-like layout. Now, their sense of time and direction starts to blur. But
> this is worth nothing unless you do the critical step of replacing money with chips. It is so
> much harder to keep track of how much you're down when it's just some abstract tokens. But
> people still want to leave. Before they do, give them free drinks. Now they feel valued. Plus,
> the stuff isn't really known for improving risk management. [...] Uh-oh, some high roller just
> dropped six figures and looks devastated. Reward the biggest losers the most. [...] And there
> you have it, a happy casino. Remember, you don't have to beat them. You just need to make sure
> they enjoy losing.

What it does, and what every script must do:
1. **Line 1 puts the viewer in a role with a problem, in under 2 seconds:** "You're a casino
   owner and you have a problem." Present tense, a role anyone can picture being in today.
   Not a historical figure: the problem is happening to *you*, now.
2. **Line 2 says the problem in plain words and promises the fix:** "People don't like losing
   their money to you. Here's how you fix it." **The first concrete step starts by 5 seconds,
   at the latest.** No backstory, no dates, no names before the steps.
3. **The body is a chain of imperative steps** ("Take down all the clocks", "Replace money with
   chips"). Each step is one specific, real mechanism, followed by its effect in one short
   sentence ("Now, their sense of time starts to blur."). 5 to 10 steps.
4. **Be specific, never vague.** Real numbers and real details: "keep a window of the last
   32,768 characters", "give 'e' a 3-bit code and 'z' a 10-bit one", "one green zero: you keep
   2.7% of every bet". If a sentence could appear in a kids' summary, make it sharper. The
   viewer should come away able to explain the actual mechanism.
5. **Escalate with complications.** "But people still want to leave." / "Uh-oh, your friend
   can't open it." Each complication is answered by the next step. This is what holds
   retention: there's always a new problem coming.
6. **Keep tying back to the goal** ("your file", "your casino", "your 150 seats") so the viewer
   never loses track of why this step matters.
7. **End with a punchline line, then the reveal, then (sometimes) the call to action.** "And
   there you have it: a file a third of the size, and not one letter lost." / "This is how
   every zip file works. Phil Katz released the format in 1989." One sentence of history at
   most, only at the end, only to show it's real.
8. **Tone:** confident, dry, a little wry, like the model script. Short sentences. Spoken, not
   written.

## Picking topics

- The problem must be something the viewer can feel in one line: money, time, being lied to,
  losing, waiting, being tricked, things breaking. "Your file is too big to send" works.
  "You're being sued in 1988" does not.
- The fix must be real math or a real system someone actually uses (compression, house edge,
  error correction, overbooking, card counting, check digits, queue design, survivorship bias,
  estimating from serial numbers, A/B testing, how slot machines set payouts, PageRank...).
- **Correctness you can prove.** Every number said or shown is computed in `verify.py`;
  probabilities are also simulated. Every factual claim (names, dates, amounts, how a real
  system works) comes from a source you fetched today, listed with its URL in `facts_checked`.
  Don't invent motives or quotes.
- Stay away from health/medical decisions, personal financial advice, elections and politics.
  Topics like casinos are fine as "how the business works"; never encourage gambling.

## Shorts

- 45 to 90 seconds; longer is fine if every beat earns its place (retention is the test).
  1080x1920. Two a day (12:00 and 20:00 Tallinn).
- **The first word is spoken at 0.00 s and frame 1 already shows the situation.** The report
  fails the video if speech starts later than 0.05 s. Start on a consonant ("You're", "Your").
- **Hook frame:** the role and the problem, readable with the sound off in half a second: the
  viewer (`you_tag("casino owner")`), the setting, and the problem in 2 to 4 big words. Motion
  inside the first 0.5 s.
- **One visual per step**, and every step's visual shows the mechanism itself (the actual
  bytes being replaced, the actual chips, the actual seat map), not a generic icon.
- Something new on screen at least every 1.5 seconds. Use camera moves (zoom in on the detail
  being explained, pull back to show the whole), and sound effects on every reveal.
- **Calls to action: one natural ask, woven into the content, after the payoff.** Asking viewers
  to comment or subscribe is allowed; what YouTube's spam policies forbid is rewarding engagement
  (giveaways, "sub for sub", "comment to win") and misleading asks. So:
  - **Comment (most videos):** end on a genuine question the video has set up, ideally one with a
    checkable answer, or one that puts the viewer back in the role: "How would you shrink the
    word banana?" / "Would you have switched doors?" Never a generic "let me know in the
    comments".
  - **Subscribe (about every other Short, varied wording, one sentence, at most ~2 s):** tie it to
    what the channel delivers, e.g. "Two of these a day. Subscribe and the next one finds you."
    You may tease the next video only if you write that topic to `state/next_up.md` so the next
    run really makes it.
  - After the payoff, in the last few seconds, short enough that the Short still loops.
  - On screen, at most a small label under the last visual. No flashing buttons, no fake UI,
    no arrows pointing at YouTube's buttons.
  - Never: in the first 10 seconds, "like and subscribe" chants, fake urgency, promising a part 2
    that doesn't exist, rewards of any kind.
- Long-form: one subscribe line after the first big payoff (roughly a third of the way in), a
  comment question at the end, and the same rules.

## Long-form (Sundays at 20:00, starting 2026-10-11; see state/schedule.json)

- 8 to 12 minutes, 1920x1080, 30fps. Expands the week's best Short, same four rules.
- Opens with the same story hook, then goes further: the full history, the math in full, a
  second real case where the same idea saved (or cost) someone, a common misunderstanding.
- 4 to 7 chapters. Mark the first beat of each with `"chapter": "Title"`. YouTube
  needs the first chapter at 0:00, at least 3 chapters, each at least 10 seconds.
- Needs a `class Thumbnail(Scene)` in scene.py: a single still, 1280x720, one big
  number or equation plus at most 4 words, high contrast, readable at phone size.

## Voice script (`say`)

- Written to be heard. Short sentences. One idea per sentence.
- Plain words: "chance" not "probability" unless the word itself matters.
- Numbers: write digits in `say` for plain numbers, ordinals, decimals and percentages
  ("23 people", "the 23rd person", "99.9%", "200,000"). The kit converts them to words before
  the voice reads them. Years can be digits too: plain 4-digit numbers from 1500 to 2099 are read
  as years ("1988" -> "nineteen eighty-eight", "2000" -> "two thousand"), so write a quantity in
  that range with a comma ("1,600 tanks"). Write in words anything else: fractions ("one in 365",
  "364 out of 365"), powers ("two to the 64"), symbols. Put the on-screen version
  in `caption` when it differs ("2⁶⁴").
- Music: `kit.make` picks a track from `assets/music/tracks.json` by mood (upbeat/chill for
  Shorts, curious for the puzzle series, calm for long-form) and avoids the last 3 used. To choose
  one yourself set `"music": "<file>"` in script.json. Every track is CC BY: the credit in
  `build/music_credit.txt` must go at the end of the description.
- The voice is "Sam" (OmniVoice cloning `assets/voice/sam_ref.wav`). Don't set `voice` or
  `engine` in script.json unless the runbook says to.
- Never read an equation symbol by symbol. Say what it means.
- No filler: "basically", "actually", "essentially", "let's dive in", "mind-blowing",
  "the answer might surprise you". No rhetorical "But here's the thing".
- Don't tell viewers how to feel ("this is amazing"). Show it and move on.

## Visual rules

- **Use the story kit (`from kit.visuals import *`) so videos look like scenes, not slides:**
  `icon(name)` (2,100+ Lucide line icons: https://lucide.dev/icons), `you_tag(role)`,
  `stamp(text)` + `slam()`, `year_stamp("1988")`, `terminal(lines)` for anything computery,
  `tiles(text)` for data letter by letter, `highlight`, `back_arrow`, `chip(text)`,
  `size_bar(frac)`. Combine icons into small scenes (a person, a building, a crowd of 20 user
  icons, a plane with seat dots). Animate them: move, scale, swap, count up. Aim for something
  new on screen every 1 to 2 seconds in the first 10 seconds.
- Palette from `kit/brand.py` only. AMBER marks the surprising thing (the answer,
  the key dot). MINT is structure (axes, lines, guides). CORAL is for the wrong
  intuition, sparingly. INK for everything else on the navy background.
- Fonts: `FONT_DISPLAY` (Fraunces) for the headline row only. `FONT_BOLD` /
  `FONT_MED` (Space Grotesk) for labels and numbers. `MathTex` for real math only;
  don't mix LaTeX text with Grotesk labels in the same line.
- Layout (Shorts): headline at `TITLE_Y`; visuals between y = -1.7 and y = 6.5;
  nothing important below y = -1.8 (captions) or right of x = 3.2 in the lower half
  (YouTube's buttons). Use `fit()` so nothing leaves the frame.
- Something should move at least every 2 seconds. Hold a still frame only to let a
  number land (under 1.5 s).
- One headline at a time; replace it with `ReplacementTransform` when the idea changes.
- Keep it clean: at most ~3 text elements on screen besides the headline.
- Don't copy another channel's look. No pi-creature characters, no 3Blue1Brown
  blue/brown palette, no recreated scenes from other videos.

## Timing API (from kit.brand)

```python
with self.beat("id"):          # lasts at least as long as that beat's voice clip
    self.play(..., run_time=self.rt(1.2))   # 1.2s, or less if the clip is nearly over
    self.wait(self.rt(0.8, 0.3))            # wait, capped at 30% of what's left
```
Plan animations so each beat's visuals finish close to its voice clip. Overruns keep
audio in sync but leave dead air; the report lists them.

## Titles and descriptions

- Title: under 60 characters, the problem or the payoff, not the math term. Examples:
  "How to make any file 3x smaller", "How casinos make you enjoy losing",
  "How to count the enemy's tanks from 5 serial numbers". No clickbait the video doesn't pay off, no ALL
  CAPS, at most one emoji (prefer none).
- Description: 2 to 4 sentences explaining the actual mechanism with the exact numbers (and the
  one-line origin if there is one), then a line saying how the numbers were checked and the source, then the
  standard footer:

```
The math behind real problems, twice a day. Subscribe and the next one finds you.
Found an error? Comment and it gets pinned.
#math #mathematics #shorts
```
(Long-form: drop `#shorts`, add the chapters list above the footer.)
- Then a blank line, `Music:` and the credit from `build/music_credit.txt`.
- Tags: 6 to 10, story first (zip file, phil katz, file compression), then broad ones (math,
  maths, history, computer science...).
