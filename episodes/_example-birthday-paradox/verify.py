"""Every number in the birthday-paradox episode, computed and simulated."""
import random
from math import comb, prod

def p_shared(n):
    return 1 - prod((365 - i) / 365 for i in range(n))

checks = {
    "pairs among 23 people": (comb(23, 2), 253),
    "P(shared) at 23, rounded to 0.1%": (round(p_shared(23) * 100, 1), 50.7),
    "P(no match) at 23, rounded to 0.1%": (round((1 - p_shared(23)) * 100, 1), 49.3),
    "P(shared) at 50, whole %": (round(p_shared(50) * 100), 97),
    "P(shared) at 70, rounded to 0.1%": (round(p_shared(70) * 100, 1), 99.9),
    "P(shared) at 30, whole %": (round(p_shared(30) * 100), 71),
    "23 is the smallest n with P > 1/2": (min(n for n in range(1, 100) if p_shared(n) > 0.5), 23),
}
random.seed(0)
N = 200_000
sim = sum(len(set(random.randrange(365) for _ in range(23))) < 23 for _ in range(N)) / N
checks["simulation at 23 within 0.5% of formula"] = (abs(sim - p_shared(23)) < 0.005, True)

ok = True
for name, (got, want) in checks.items():
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")
print(f"simulated P(shared, 23) = {sim:.4f}")
print("ALL OK" if ok else "SOME CHECKS FAILED")
