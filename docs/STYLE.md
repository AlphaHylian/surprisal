# Surprisal style guide

The channel: math that sounds wrong but is true. Every video takes one result that
fights intuition and shows *why* it holds, with a picture doing most of the work.

## What every video must have

1. **One surprise.** A single claim a smart viewer would bet against. Not a list of facts.
2. **The reason, shown.** The animation carries the argument. If the picture could be
   deleted and the video would still make sense as audio, the visuals are decoration: redo them.
3. **Correctness you can prove.** Every number said or shown is computed in the episode's
   `verify.py`. Probabilities are also simulated. Nothing goes in the script that isn't
   in `facts_checked`.
4. **A fresh angle.** Famous topics (Monty Hall, 0.999…) have been done many times.
   Before writing, decide what this version shows that the usual one doesn't: a
   different visual, a variant, a real-world case, a surprising number. Write that
   angle in `script.json` as `"angle"`.

## Shorts (Monday to Saturday)

- 45 to 70 seconds. 1080x1920. 7 to 11 beats.
- **The first word is spoken at 0.00 s and the first frame already shows the headline.**
  `with self.beat("hook"):` is the first thing in `construct()`, and inside it `self.add(headline)`
  comes before any `play()`. The kit trims silence from every voice clip and the report fails
  the video if speech starts later than 0.05 s.
- **Frame 1 is a full-screen hook card, not a headline on an empty screen.** Viewers decide to
  stay or swipe in about a second, and a mostly empty dark frame reads as "nothing here". Start
  the hook beat with `self.open_with(hook_card(big, above, below))`: the surprising claim itself,
  huge, readable in half a second with the sound off (e.g. "ONLY 23 PEOPLE / > 50% / share a
  birthday", "1/4 + 1/16 + ... / = 1/3 / exactly"). Then transform the card into the first visual.
- **The first spoken words are the surprise, not setup.** Never open with "Put", "Imagine",
  "Take", "Let's", "Have you ever", "So". The claim, with its number, is said within ~1.5 s:
  "Only 23 people, and it's better than a coin flip that two share a birthday."
- **Beat 1 is the hook and must land in under 3 seconds of speech.** State the
  surprising claim plainly with a concrete number. No "Did you know", no "In this video",
  no greeting, no channel name.
- Structure that works: claim → why it feels wrong → the key idea → the picture that
  proves it → the number → one line that sends it home (a question to viewers, a
  bigger case, or a loop back to the start). Vary this; don't make every video identical.
- **Calls to action: one natural ask, woven into the content, after the payoff.** Asking viewers
  to comment or subscribe is allowed; what YouTube's spam policies forbid is rewarding engagement
  (giveaways, "sub for sub", "comment to win") and misleading asks. So:
  - **Comment (most videos):** end on a genuine question the video has set up, ideally one with a
    checkable answer: "Does your class have a match? Say how many people and whether you found
    one." / "What do you get with 16 pieces? Answer below." Never a generic "let me know in the
    comments".
  - **Subscribe (about every other Short, varied wording, one sentence, at most ~2 s):** tie it to
    what the channel actually delivers, e.g. "There's one of these every day. Subscribe and
    tomorrow's finds you." You may tease the next video only if you write that topic to
    `state/next_up.md` so the next run really makes it: "Tomorrow: why 0.999... is exactly 1."
  - Put it after the payoff, in the last few seconds, and keep the final line short so the Short
    still loops cleanly. It can sit in the same beat as the closing question.
  - On screen, at most a small label (`label("subscribe for tomorrow's", color=MINT)`) under the
    last visual. No flashing buttons, no fake UI, no arrows pointing at YouTube's buttons.
  - Never: in the first 10 seconds, "like and subscribe" chants, fake urgency, promising a part 2
    that doesn't exist, rewards of any kind, or asking for likes/subs in exchange for anything.
- Long-form: one subscribe line after the first big payoff (roughly a third of the way in), a
  comment question at the end, and the same rules.

## Long-form (Sunday)

- 8 to 12 minutes, 1920x1080, 30fps. Expands the week's best Short.
- Opens with the same hook, then goes further: the proof in full, a variant, the
  history of who found it, where it shows up for real, a common misunderstanding.
- 4 to 7 chapters. Mark the first beat of each with `"chapter": "Title"`. YouTube
  needs the first chapter at 0:00, at least 3 chapters, each at least 10 seconds.
- Needs a `class Thumbnail(Scene)` in scene.py: a single still, 1280x720, one big
  number or equation plus at most 4 words, high contrast, readable at phone size.

## Voice script (`say`)

- Written to be heard. Short sentences. One idea per sentence.
- Plain words: "chance" not "probability" unless the word itself matters.
- Numbers: write digits in `say` for plain numbers, ordinals, decimals and percentages
  ("23 people", "the 23rd person", "99.9%", "200,000"). The kit converts them to words before
  the voice reads them. Write in words anything else: fractions ("one in 365", "364 out of 365"),
  powers ("two to the 64"), years ("twenty twenty-six"), symbols. Put the on-screen version
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

- Title: under 60 characters, states the surprise or asks it. Examples:
  "Why 23 people is enough to share a birthday", "This shape holds paint but can't be painted".
  No clickbait the video doesn't pay off, no ALL CAPS, at most one emoji (prefer none).
- Description: 2 to 4 sentences expanding the idea with the exact numbers, then a line
  saying how the numbers were checked, then the standard footer:

```
New math that sounds wrong but is true, every day. Subscribe so tomorrow's finds you.
Found an error? Comment and it gets pinned.
#math #mathematics #shorts
```
(Long-form: drop `#shorts`, add the chapters list above the footer.)
- Tags: 6 to 10, topic first, then broad ones (math, maths, probability…).
