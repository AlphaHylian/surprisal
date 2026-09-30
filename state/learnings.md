# Learnings

The daily run reads this before planning and updates it after the review.
Keep it short: rules that the data supports, the one experiment running now, and a
dated log. Rewrite rules when the data changes; don't let this file grow forever.

## How to judge
- YouTube analytics lag 24 to 48 hours. Judge a video on its numbers once it's 2+ days old,
  and compare videos at the same age (day 2 vs day 2, day 7 vs day 7).
- Main signals, in order: average view percentage (Shorts: above 80% is good, above 100% means
  rewatches), engaged views, subscribers gained per 1,000 views, comments per 1,000 views.
- With under ~500 views per video, most differences are noise. Only act on big gaps or on
  patterns across 5+ videos.
- Change one thing at a time. Run an experiment for about a week (5 to 7 videos) before judging.

## Rules we trust (with evidence)
- (none yet; the channel has no public videos)

## Current experiment
- None yet. First week: establish a baseline. Rotate series normally; keep hooks in the
  "claim" style (state the surprising fact with a number in the first sentence).

## Experiment ideas, in rough priority
1. Hook style: "claim" vs "question" ("How many people until two share a birthday?").
2. Length: ~45 s vs ~65 s.
3. Series: which of the five holds viewers best.
4. Ending: comment question vs loop back to the opening line.
5. Voice speed 1.0 vs 1.1.

## Log
- 2026-09-30: channel created. The private pipeline-test upload (QpmmGQsbLv8) was deleted.
- 2026-09-30: first public video: birthday paradox (eQS8gtimpvA), Sam voice, music "Digital Lemonade" 8 dB under the voice, speech from 0.0 s, live at 21:00 Tallinn. Baseline, no experiment.
- 2026-09-30 (run for 1 Oct, TEST): review had nothing to judge yet: birthday paradox went live 18:00 UTC, 17 min before the run; analytics had no rows, no comments. Built 1/4 + 1/16 + ... = 1/3 (visual-proof; closing question with a checkable answer, 16 pieces -> 1/15, to see if it draws comments). NOT UPLOADED: the environment's network policy blocks huggingface.co and download.pytorch.org, so there's no OmniVoice (Sam) and no faster-whisper model for captions or report.json. verify.py passes and the scene renders cleanly (checked with a Kokoro draft, 47.9 s); episode is ready to build once those hosts are allowed.
- 2026-09-30 (retry): huggingface.co now reachable; setup finished. Built with OmniVoice, fixed two QA fails (onset 0.09 s from the soft 'Add' opening, now 'Take'; 82% word match from fraction captions and British 'colour', now no captions that differ from speech and US spelling). Uploaded TEST private YrD3-RjdX58, 50.4 s, music Somewhere Sunny. Tip: captions are matched against speech, so only add a caption when it uses the same words.
