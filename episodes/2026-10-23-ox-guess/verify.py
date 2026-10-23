"""Every number in the ox-guess how-to episode (Galton's Vox Populi, Nature 75, 450, 1907), checked and simulated."""
import random, statistics

ok = True
def check(name, got, want, tol=1e-9):
    global ok
    good = abs(got - want) <= tol if isinstance(want, float) else got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# Galton's published table (pounds): centile -> estimate, 787 legible tickets
TICKETS = 787
CENTILES = {5: 1074, 10: 1109, 15: 1126, 20: 1148, 25: 1162, 30: 1174, 35: 1181, 40: 1188, 45: 1197,
            50: 1207, 55: 1214, 60: 1219, 65: 1225, 70: 1230, 75: 1236, 80: 1243, 85: 1254, 90: 1267, 95: 1293}
TRUE = 1198
MEDIAN = CENTILES[50]

check("tickets", TICKETS, 787)
check("middle guess (lb)", MEDIAN, 1207)
check("middle guess off by (lb)", MEDIAN - TRUE, 9)
check("off by, percent (under 1%)", round(100 * (MEDIAN - TRUE) / TRUE, 1), 0.8)

# 'half the tickets missed by more than about 37 lb': quartiles 1162 / 1236 sit 36 and 38 lb from the true weight,
# so the middle half lies within ~37 lb of the truth and the other half is further out
q1, q3 = CENTILES[25], CENTILES[75]
check("lower quartile distance from truth", TRUE - q1, 36)
check("upper quartile distance from truth", q3 - TRUE, 38)
check("Galton's probable error (lb)", round((q3 - MEDIAN + MEDIAN - q1) / 2), 37)

# interpolate the centile table to estimate the share of tickets off by more than 37 lb from the truth
xs = sorted(CENTILES)
def cdf(w):
    pts = [(CENTILES[c], c / 100) for c in xs]
    if w <= pts[0][0]: return pts[0][1]
    if w >= pts[-1][0]: return pts[-1][1]
    for (a, pa), (b, pb) in zip(pts, pts[1:]):
        if a <= w <= b: return pa + (pb - pa) * (w - a) / (b - a)
share_far = cdf(TRUE - 37) + (1 - cdf(TRUE + 37))
print(f"    share of tickets more than 37 lb from 1198: {share_far:.3f}")
check("about half missed by more than 37 lb", round(share_far, 1), 0.5)

# CTA: five friends guess 10, 12, 30, 14, 11 -> middle guess 12 (the mean would be 15.4, dragged by the 30)
cta = [10, 12, 30, 14, 11]
check("CTA middle guess", statistics.median(cta), 12)
check("CTA mean (the wrong answer)", statistics.mean(cta), 15.4)

# Simulation: 787 independent guessers, each the truth plus an error with probable error 37 lb (sigma = 37/0.6745).
# 'the errors cancel': the middle guess is far closer than a typical single guess.
rng = random.Random(23)
sigma = 37 / 0.6745
TRIALS = 2000
single, middle, middle_copy = [], [], []
for _ in range(TRIALS):
    g = [TRUE + rng.gauss(0, sigma) for _ in range(TICKETS)]
    single.append(abs(g[0] - TRUE))
    middle.append(abs(statistics.median(g) - TRUE))
    # 'only if nobody copies': everyone shares one common mistake (e.g. a loud guess everyone hears) plus a small own error
    shared = rng.gauss(0, sigma)
    gc = [TRUE + 0.8 * shared + 0.6 * rng.gauss(0, sigma) for _ in range(TICKETS)]
    middle_copy.append(abs(statistics.median(gc) - TRUE))
n_guesses = TRIALS * TICKETS
s_single = statistics.median(single)
s_mid = statistics.median(middle)
s_copy = statistics.median(middle_copy)
print(f"    simulated ({n_guesses:,} guesses): typical single miss {s_single:.1f} lb, middle of 787 independent {s_mid:.1f} lb, "
      f"middle of 787 who copy {s_copy:.1f} lb")
check("simulation: >=100,000 guesses", n_guesses >= 100_000, True)
check("simulation: typical single guess misses by ~37 lb", round(s_single / 10) * 10, 40)
check("simulation: independent middle guess within a few lb", s_mid < 5, True)
check("simulation: copying crowd's middle guess no better than one person", s_copy > 25, True)

print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
