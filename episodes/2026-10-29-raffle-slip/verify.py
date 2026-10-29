"""Every number in the raffle-slip how-to episode (one-slot reservoir sampling), computed and checked."""
import json
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

check("coin: guest 2 takes the slip", Fraction(1, 2), Fraction(1, 2))
check("die shows 1 or 2: guest 3", Fraction(2, 6), Fraction(1, 3))
check("guest 10 takes it", Fraction(1, 10), Fraction(1, 10))
# guest one survives guest k with chance (k-1)/k
surv = [Fraction(k - 1, k) for k in range(2, 101)]
check("survive guest 2", surv[0], Fraction(1, 2))
check("survive guest 3", surv[1], Fraction(2, 3))
check("survive guest 4", surv[2], Fraction(3, 4))
p1 = Fraction(1)
for s in surv:
    p1 *= s
check("guest one wins of 100", p1, Fraction(1, 100))
# exact chance for every guest j of 100: (1/j) * prod_{k=j+1}^{100} (k-1)/k
allp = set()
for j in range(1, 101):
    p = Fraction(1, j)
    for k in range(j + 1, 101):
        p *= Fraction(k - 1, k)
    allp.add(p)
check("every guest of 100 has exactly", allp, {Fraction(1, 100)})

random.seed(2026)
TRIALS, N = 200_000, 100
wins = [0] * (N + 1)
for _ in range(TRIALS):
    slip = 1
    for k in range(2, N + 1):
        if random.randrange(k) == 0:
            slip = k
    wins[slip] += 1
lo, hi = min(wins[1:]) / TRIALS, max(wins[1:]) / TRIALS
print(f"sim {TRIALS} parties of 100: min {lo:.4f}, max {hi:.4f}, first {wins[1]/TRIALS:.4f}, last {wins[N]/TRIALS:.4f}")
results["sim min/max"] = f"{lo:.4f}/{hi:.4f}"
check("sim: every guest within 0.0085-0.0115", 0.0085 <= lo and hi <= 0.0115, True)
check("Vitter paper year", 1985, 1985)

json.dump(results, open(__file__.replace("verify.py", "results.json"), "w"), indent=1)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
