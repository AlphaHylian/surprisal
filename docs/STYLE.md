# Surprisal style guide

The channel: the math behind real problems. Every Short drops the viewer into a real situation
with real stakes ("You're a programmer in 1988 and you just got sued"), and the math concept is
how the problem gets solved. The math is the payoff, the story is why anyone stays.

This replaced the old "sounds wrong but is true" format on 2026-10-04: the topics were too
niche for viewers to care whether they sounded wrong (owner's verdict, backed by 47% hook hold on
the birthday paradox). See `episodes/_example-zip/` for the reference episode in this format.

## The four rules (every Short)

1. **A real situation with stakes, where the math is the solution.** Pick a moment where
   someone had a problem that the concept solves: real history with real names, dates and
   numbers is best (Phil Katz sued in 1988, inventing ZIP; Abraham Wald and the bombers; the
   German tank problem), an everyday situation is fine too (you run a pizza place, you're
   designing a password, you're an airline overbooking seats). The concept must be the thing
   that fixes the problem, not trivia next to it.
2. **Put the viewer in the story in the first second.** First words: "You're a [role]..." or
   "You just [event]...", e.g. "You're a programmer in 1988, and you just got sued over your own
   app." / "You're a casino owner, and you have a problem." The role must be one a viewer can
   picture being in. Frame 1 shows the situation, not text on an empty screen (see Hook frame).
3. **Say the problem immediately.** Line 2 (by ~4 s) states what's at stake and promises the
   fix: "People hate losing money to you. Here's how you keep them playing." / "You're banned
   from shipping it. You need a new way to shrink files." No background before the problem.
4. **Tie back to the story throughout.** Every 2 or 3 beats, connect the math to the situation
   ("That's your way out of the lawsuit.", "Back to your casino:", "So for your 150 seats...").
   Never go more than ~12 seconds of pure math without referring back to the person and the
   stakes. The ending resolves the story (what actually happened, or what you now do) and lands
   the concept in one sentence.

Also:
- **Correctness you can prove.** Every number said or shown is computed in `verify.py`;
  probabilities are also simulated. Every historical fact (names, dates, amounts, outcomes) comes
  from a source you fetched today (Wikipedia is fine), listed with its URL in `facts_checked`.
  Don't embellish: no invented motives ("out of spite"), no made-up quotes, no "SEA won" when the
  source says "settled". If the source is vague, say it vaguely.
- **Topic choice: would someone who never thought about this still want to know how it ends?**
  If the hook only works for math fans, reframe it or pick another topic.
- Stay away from health/medical decisions, personal financial advice, elections and politics,
  and tragedies used for shock. Gambling topics are fine as math and history (the house edge,
  famous exploits), never as advice to gamble.

## Shorts

- 45 to 65 seconds. 1080x1920. 7 to 11 beats. Two a day (12:00 and 20:00 Tallinn).
- **The first word is spoken at 0.00 s and frame 1 already shows the situation.**
  `with self.beat("hook"):` is the first thing in `construct()`, and everything on screen at
  frame 1 is `self.add`ed before any `play()`. The kit trims silence from every voice clip and
  the report fails the video if speech starts later than 0.05 s. Start on a consonant
  ("You're", "Your", "Twenty") rather than a vowel, which tends to drift.
- **Hook frame:** a full scene, readable with the sound off in half a second: the viewer
  (`you_tag("programmer, 1988")`), the setting (a year stamp, an icon: casino `dice-5`, plane,
  courtroom `gavel`, warehouse `package`), and the stakes in 2 to 4 big words (`stamp("SUED")`,
  "SEATS: 0", "-$2M"). Bring something in with motion inside the first 0.5 s (`slam(stamp)`,
  `self.open_with(group)`). Then turn the hook scene into the first explanation visual.
- Structure: you + situation (beat 1) -> problem and promise (beat 2) -> the idea, shown
  -> the idea applied to your problem, with real numbers -> what happened / what you now do
  -> one line that lands the concept -> call to action. Vary pacing, keep the story spine.
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

- Title: under 60 characters, the story's stakes, not the math term. Examples:
  "He got sued, so he invented the ZIP file", "How casinos keep you playing",
  "The WW2 trick that counted German tanks". No clickbait the video doesn't pay off, no ALL
  CAPS, at most one emoji (prefer none).
- Description: 2 to 4 sentences telling the real story with the exact numbers and dates and the
  math behind it, then a line saying how the numbers were checked and the source, then the
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
