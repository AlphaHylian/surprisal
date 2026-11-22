# Corrections

Viewer reports of mistakes. The daily run adds new ones, checks them with code, and
marks each one confirmed or not. Confirmed errors go in the morning summary so a correction
comment can be pinned by hand (the API can't pin comments).

| date | video | report (short) | verdict | action |
|------|-------|----------------|---------|--------|
| 2026-10-24 | bent-coin (aVdSbOfUA7E) | "it will never take exactly 5 flips; flips come in pairs, an even number, most likely 4 or 6" | not an error: the video says "about 5 flips" per answer, which is the average, 2 / 0.42 = 4.76 (simulated 4.77). The count of flips is always even, as the viewer says, but the most likely count is 2 (42%), median 4, mean 4.76. Optional clarifying pin, not a correction | none required; optional pin: "Good point: the flips always come in pairs, so one answer takes 2, 4, 6... flips. 'About 5' is the average: 2 / 0.42 = 4.76. Most often (42% of the time) you're done after the first 2." |
| 2026-10-24 | average-speed (sKsrfEgTi4Y) | viewer redoes 5 km in 150 s = 120 km/h | agrees with the video (not an error report) | none |
| 2026-11-22 | bad-commit (NsmVJmrIdHU) | "All good unless PR 33 caused the bug but PR 985 exposed it" | not an error: bisect finds the first change where the test fails, which can be the one that exposed an older bug; the video says "find the change that broke it" for a test that passed before | none required; optional pin: "Good catch: bisect finds the first change where your test starts failing. If an old bug only shows up after a later change, that later change is what it finds, and you dig back from there." |
