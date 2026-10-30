"""Every number in the needle-pi how-to episode (Buffon's needle, Lazzarini 1901), computed and checked."""
import json
import math
import random
from fractions import Fraction

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

L, T = Fraction(5, 2), Fraction(3)        # needle 2.5 cm, lines 3 cm apart (5/6)
check("needle/gap", L / T, Fraction(5, 6))
p = 2 * float(L / T) / math.pi             # P(cross) = 2l/(pi t) = 5/(3 pi)
check("chance of a crossing, %", round(100 * p), 53)
check("100 needles: about this many cross", round(100 * p), 53)
N, X = 3408, 1808
est = Fraction(2) * L / T * N / X
check("Lazzarini: 3,408 throws, 1,808 crossings ->", est, Fraction(355, 113))
check("355/113 to 7 digits", f"{355/113:.7f}", "3.1415929")
check("pi to 7 digits", f"{math.pi:.7f}", "3.1415927")
check("355/113 right to six decimals", round(355/113, 6) == round(math.pi, 6), True)
check("3,408 = 16 x 213", 16 * 213, 3408)
check("213 throws, 113 crossings ->", Fraction(2) * L / T * 213 / 113, Fraction(355, 113))
check("expected crossings in 213 throws", round(213 * p), 113)
# honest spread of the estimate after 3,408 throws
sd = math.pi * math.sqrt((1 - p) / (N * p))
print(f"sd of honest estimate: {sd:.4f}")
check("honest 3,408: typically off by about 0.05", round(sd, 2), 0.05)
# throws needed for an error as small as 355/113's
err = abs(355 / 113 - math.pi)
need = N * (sd / err) ** 2
print(f"355/113 error {err:.2e}; throws for that spread: {need:.3e}")
check("about 100 trillion throws (order)", 5e13 < need < 2e14, True)

# simulate needle drops: 200,000 honest runs of 3,408? too slow; do 100,000 runs via binomial counts
rng = random.Random(2026)
def drop():
    y = rng.uniform(0, 1.5)              # centre distance to nearest line (t/2)
    th = rng.uniform(0, math.pi / 2)
    return y <= 1.25 * math.sin(th)      # l/2 sin
hits = sum(drop() for _ in range(1_000_000))
print(f"1,000,000 simulated drops: crossing rate {hits/1e6:.4f} (theory {p:.4f})")
check("sim crossing rate ~53%", round(hits / 1e6, 2), 0.53)
runs, within6, within1, exact = 100_000, 0, 0, 0
import numpy as np
cnt = np.random.default_rng(2026).binomial(N, p, size=runs)
ests = 2 * 5 / 6 * N / cnt
within1 = float(np.mean(np.abs(ests - math.pi) < 0.05))
exact = float(np.mean(cnt == X))
sixdig = float(np.mean(np.abs(ests - math.pi) < 5e-7))
print(f"{runs} honest 3,408-throw runs: |err|<0.05 {within1:.3f}, exactly 1,808 crossings {exact:.4f}, 6 digits right {sixdig:.4f}")
check("sim: most honest runs only get 3.1 (2 sig. digits)", within1 > 0.6, True)
check("sim: 6 digits right only when crossings = 1,808 exactly (~1 in 70)", round(1 / exact / 10) * 10, 70)

json.dump(results, open(__file__.replace("verify.py", "results.json"), "w"), indent=1)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
