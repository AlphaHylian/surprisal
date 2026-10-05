"""Every number in the enemy-tanks how-to episode, computed or sourced."""
import random

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# Example: you captured 4 tanks with serials 19, 40, 42, 60
seen = [19, 40, 42, 60]
k, m = len(seen), max(seen)
check("captured", k, 4)
check("biggest serial", m, 60)
unseen_below = m - k
check("unseen numbers below 60", unseen_below, 56)
gap = unseen_below / k
check("average gap", gap, 14)
est = m + gap
check("estimate m + (m-k)/k", est, 74)
check("same as m + m/k - 1", m + m / k - 1, 74)

# Simulation: true production N, capture 4 at random; the biggest alone vs the formula
random.seed(1)
N, T = 250, 200_000
mx = fm = 0.0
for _ in range(T):
    s = random.sample(range(1, N + 1), k)
    a = max(s)
    mx += a
    fm += a + a / k - 1
mx /= T; fm /= T
print(f"   N={N}: biggest alone averages {mx:.1f} ({mx/N:.0%}), formula averages {fm:.1f}")
check("biggest alone is about 80% of the truth (a fifth too low)", round(mx / N, 1), 0.8)
check("formula is right on average (within 1%)", abs(fm - N) / N < 0.01, True)

# History (Wikipedia, German tank problem): June 1940 - Sept 1942 monthly
check("statistical estimate per month", 246, 246)
check("intelligence estimate per month", 1400, 1400)
check("German records per month", 245, 245)
check("spies were off by more than 5x", 1400 / 245 > 5, True)

# CTA: serials 3, 7, 12 -> 12 + 12/3 - 1 = 15
c = [3, 7, 12]
check("CTA answer", max(c) + max(c) / len(c) - 1, 15)

print("ALL OK" if ok else "SOME CHECKS FAILED")
