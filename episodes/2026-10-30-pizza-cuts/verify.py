"""Every number in the pizza-cuts how-to episode (lazy caterer's sequence), computed and checked."""
import json
import random
from itertools import combinations

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

lazy = lambda n: (n * n + n + 2) // 2
center = lambda n: 2 * n if n else 1
check("4 cuts through the middle", center(4), 8)
check("4 smart cuts", lazy(4), 11)
check("cut 1", lazy(1), 2)
check("cut 2", lazy(2), 4)
check("cut 3 through the middle", center(3), 6)
check("cut 3 off-centre", lazy(3), 7)
check("cut 4 adds", lazy(4) - lazy(3), 4)
check("1+1+2+3+4", 1 + 1 + 2 + 3 + 4, 11)
check("10 smart cuts", lazy(10), 56)
check("10 cuts through the middle", center(10), 20)
check("CTA: 5 cuts", lazy(5), 16)

# count pieces of random chords in a disc by Euler: pieces = 1 + n + (crossings inside the disc)
def chord(rng):
    a, b = rng.uniform(0, 6.283185), rng.uniform(0, 6.283185)
    import math
    return (math.cos(a), math.sin(a)), (math.cos(b), math.sin(b))
def cross(c1, c2):
    (p1, p2), (p3, p4) = c1, c2
    d = lambda a, b, c: (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0])
    return d(p1, p2, p3) * d(p1, p2, p4) < 0 and d(p3, p4, p1) * d(p3, p4, p2) < 0
rng = random.Random(2026)
best = {n: 0 for n in range(1, 6)}
TRIALS = 100_000
for _ in range(TRIALS):
    cs = [chord(rng) for _ in range(5)]
    for n in range(1, 6):
        pieces = 1 + n + sum(cross(a, b) for a, b in combinations(cs[:n], 2))
        best[n] = max(best[n], pieces)
print(f"random chords, best pieces seen in {TRIALS} trials: {best}")
check("sim: random cuts never beat the formula and reach it", best, {n: lazy(n) for n in range(1, 6)})

json.dump(results, open(__file__.replace("verify.py", "results.json"), "w"), indent=1)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
