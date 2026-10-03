# Learnings

The daily run reads this before planning and updates it after the review.
Keep it short: rules that the data supports, the one experiment running now, and a
dated log. Rewrite rules when the data changes; don't let this file grow forever.

## How to judge
- YouTube analytics lag 24 to 48 hours. Judge a video on its numbers once it's 2+ days old,
  and compare videos at the same age (day 2 vs day 2, day 7 vs day 7).
- For Shorts, first look at `hook_hold` (engaged views / views; the API's version of Studio's
  "viewed vs swiped away"). Under 0.6 means the opening is losing people; aim for 0.7+.
- Then, in order: average view percentage (Shorts: above 80% is good, above 100% means
  rewatches), engaged views, subscribers gained per 1,000 views, comments per 1,000 views.
- With under ~500 views per video, most differences are noise. Only act on big gaps or on
  patterns across 5+ videos.
- Change one thing at a time. Run an experiment for about a week (5 to 7 videos) before judging.

## Rules we trust (with evidence)
- (none yet; the channel has no public videos)

## Current experiment
- **Opening style** (started 2026-10-02). The owner saw the birthday paradox Short at 44% "viewed vs
  swiped away" a few hours after release (old opening: small headline on an empty frame, setup
  sentence "Put 23 people in a room..."). From 2 Oct every Short opens with a full-screen
  `hook_card` on frame 1 and speaks the claim first (STYLE.md). Compare `hook_hold` of the first 5
  new-style Shorts against the two old-style ones (birthday-paradox, quarters-make-a-third) at the
  same age. Keep everything else as normal meanwhile.

## Experiment ideas, in rough priority
1. Within the card opening: "claim" vs "question" ("How many people until two share a birthday?").
2. Length: ~45 s vs ~65 s.
3. Series: which of the five holds viewers best.
4. Ending: comment question vs loop back to the opening line.
5. Voice speed 1.0 vs 1.1.

## Log
- 2026-09-30: channel created. The private pipeline-test upload (QpmmGQsbLv8) was deleted.
- 2026-09-30: first public video: birthday paradox (eQS8gtimpvA), Sam voice, music "Digital Lemonade" 8 dB under the voice, speech from 0.0 s, live at 21:00 Tallinn. Baseline, no experiment.
- 2026-09-30 (run for 1 Oct, TEST): review had nothing to judge yet: birthday paradox went live 18:00 UTC, 17 min before the run; analytics had no rows, no comments. Built 1/4 + 1/16 + ... = 1/3 (visual-proof; closing question with a checkable answer, 16 pieces -> 1/15, to see if it draws comments). NOT UPLOADED: the environment's network policy blocks huggingface.co and download.pytorch.org, so there's no OmniVoice (Sam) and no faster-whisper model for captions or report.json. verify.py passes and the scene renders cleanly (checked with a Kokoro draft, 47.9 s); episode is ready to build once those hosts are allowed.
- 2026-09-30 (retry): huggingface.co now reachable; setup finished. Built with OmniVoice, fixed two QA fails (onset 0.09 s from the soft 'Add' opening, now 'Take'; 82% word match from fraction captions and British 'colour', now no captions that differ from speech and US spelling). Uploaded TEST private YrD3-RjdX58, 50.4 s, music Somewhere Sunny. Tip: captions are matched against speech, so only add a caption when it uses the same words.
- 2026-09-30: owner asked to publish the test upload: YrD3-RjdX58 scheduled for 2026-10-01T18:00:00Z (9pm Tallinn). Subscribers won't be notified (set at upload), so compare its early views with that in mind.
- 2026-09-30: owner reported 44% viewed-vs-swiped on the birthday paradox after a few hours. Added hook_card + open_with to the kit and new opening rules to STYLE.md; opening style is now the running experiment.
- 2026-09-30: owner manually moved quarters-make-a-third (YrD3-RjdX58) to 12:00 Tallinn on 1 Oct, as a one-off. The regular 9pm slot on 1 Oct is free for the next run. When comparing it, remember it went out at a different time of day.
- 2026-10-01 (run for 1 Oct 9pm, LIVE): review: Analytics API returned no rows yet for either video (lag; birthday paradox ~9 h live, quarters not yet live), so nothing to judge and nothing added to stats.csv. 3 comments, all on the birthday paradox: one viewer wished the 253 pairs had been explained (they explained it themselves: 22+21+...+1); a teacher reports 5 matches in 47 classes of 22-26, 4 of them twins (anecdote, not an error report); one musing on why it sounds wrong. No error reports, no topic requests. Takeaway: when a number is the pivot (253 pairs), show where it comes from in one line.
- 2026-10-01: published Penney's game (sounds-fake, KVKRfzUtTE8, 53.1 s, music Wallpaper, live 21:00 Tallinn 1 Oct): THH beats HHH 7 in 8. First Short built under the new opening rules (full-screen hook_card on frame 1, claim spoken first), so it counts as new-style #1 in the opening-style experiment even though the log said it starts 2 Oct; ending is a checkable comment question (what beats HTH? answer HHT) plus a one-line 'new one every day' subscribe nudge.
- 2026-10-01 build note: the full render regenerated the voice and the soft 'Pick' onset came in at 0.07 s (fail); one `--from voice` retry gave 0.01 s. Plosive first words can drift; just retry once.
- 2026-10-02 (run for 2 Oct 9pm, LIVE): review: Analytics API still returned no rows for any video (birthday paradox ~33 h live, quarters ~16 h, Penney's ~9 h), so stats.csv stays empty and no retention check (nothing is 2+ days old). No new comments since the last run (still the same 3 on the birthday paradox). Nothing to judge yet.
- 2026-10-02: published clock hands meet 11 times in 12 hours (puzzle, r92Byr0zgdQ, 47.5 s, music Investigations, live 21:00 Tallinn 2 Oct). New-style opening #2 (hook card "CLOCK HANDS MEET / 11 / times in 12 hours", claim spoken first, onset 0.01 s). Series rotated to puzzle (yesterday sounds-fake). Ending: checkable comment question (right angles in 12 hours; answer 22, hint 'not 24'); no subscribe line, since yesterday had one. First draft ran 44 s, under the 45 s floor: added '22 a day' and the hint line.
- 2026-10-03 (run for 3 Oct 9pm, LIVE): review: first analytics rows. Birthday paradox (old opening, day 2): 732 views, 347 engaged, hook_hold 0.47, avg 33 s / 59%, 9 likes, 3 comments, 1 share, 0 subs. Quarters (old opening, day 1): 5 views, hook_hold 0.80, 38%. Penney's (new card, day 1): 2 views, 62%. Clock hands (~9 h live): no rows yet. The day-1 numbers are too small to judge and probably lagging; compare at day 2+. Birthday retention (only video 2+ days old): 1.26 at the start (rewatches), then the steepest fall is 8-20% of the video (about 5-11 s, from 1.08 to 0.72): by word-count timing that's the end of the setup hook and the "doubt" beat ("That sounds wrong. There are 365 days..."), so the restated objection is where people leave. A smaller drop at 60-67% (about 33-37 s, the "keep multiplying"/"falls below one half" stretch). Ends at 0.32. No new comments since the last run (still the same 3). Experiment continues (2 new-style videos so far, none at day 2).
- 2026-10-03 takeaway: keep the "doubt" beat short and moving; today's doubt beat is one short objection with a number appearing on screen, not a restatement.
- 2026-10-03: published rope around the Earth (sounds-fake, gaTzSWBn-dA, 51.6 s, music Chill Wave, live 21:00 Tallinn 3 Oct). New-style opening #3 (hook card "+1 METER OF ROPE / 16 cm / off the ground, all round"). Angle: the square proof (sides need no extra rope, 4 quarter-circle corners make one circle of radius = gap; a circle is all corners), then football / Earth / Sun all +16 cm. Series rotated to sounds-fake (yesterday puzzle). Doubt beat kept to one short objection with "40,000 km + 1 m" on screen, per the birthday retention dip. Ending: checkable question (extra rope to lift it 1 m: 2π ≈ 6.28 m) plus a one-line subscribe ask (yesterday had none).
- 2026-10-03 build note: the full render's voice started at 0.16 s, then 0.07 s on a retry, with "1 extra meter" (spoken "One", a soft vowel). Changing the first word to "Just" gave 0.02 s. Prefer a consonant first word; vowel openers drift.
