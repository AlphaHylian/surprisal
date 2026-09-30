"""Every number in the quarters-make-a-third episode, computed exactly and simulated."""
import random
from fractions import Fraction as F

def partial(k, n=4):
    return sum(F(1, n ** i) for i in range(1, k + 1))

checks = {
    "1/4 + 1/16 + 1/64 + ... = 1/3 (geometric series a/(1-r))": (F(1, 4) / (1 - F(1, 4)), F(1, 3)),
    "gap to 1/3 after k terms is (1/3)(1/4)^k (k=1..20)": (all(F(1, 3) - partial(k) == F(1, 3) * F(1, 4) ** k for k in range(1, 21)), True),
    "partial sums never exceed 1/3": (all(partial(k) < F(1, 3) for k in range(1, 60)), True),
    "partial sums never reach 1/2": (all(partial(k) < F(1, 2) for k in range(1, 60)), True),
    "terms shown: 1/4, 1/16, 1/64, 1/256": ([F(1, 4 ** i) for i in range(1, 5)], [F(1, 4), F(1, 16), F(1, 64), F(1, 256)]),
    "after 5 steps: 0.333 (3 d.p., truncated)": (int(partial(5) * 1000) / 1000, 0.333),
    "after 5 steps exact value 341/1024": (partial(5), F(341, 1024)),
    "each level: 3 equal squares + 1 to split; each colour gets 1/3 of the level": (F(1, 4) * 3 + F(1, 4), F(1)),
    "nine-way version: 1/9 + 1/81 + ... = 1/8": (F(1, 9) / (1 - F(1, 9)), F(1, 8)),
    "sixteen-way version (closing question answer): 1/15": (F(1, 16) / (1 - F(1, 16)), F(1, 15)),
}

# Simulation: throw random points into the unit square, count the ones landing in an
# amber square of the picture (bottom-left quadrant at every level, recursing into top-right).
def amber(x, y, depth=60):
    for _ in range(depth):
        if x < 0.5 and y < 0.5:
            return True
        if x >= 0.5 and y >= 0.5:
            x, y = 2 * x - 1, 2 * y - 1
            continue
        return False
    return False

random.seed(0)
N = 300_000
sim = sum(amber(random.random(), random.random()) for _ in range(N)) / N
checks["simulated amber share within 0.005 of 1/3"] = (abs(sim - 1 / 3) < 0.005, True)

ok = True
for name, (got, want) in checks.items():
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")
print(f"simulated amber share = {sim:.4f} over {N} points")
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
