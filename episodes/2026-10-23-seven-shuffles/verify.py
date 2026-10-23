"""Every number in the seven-shuffles how-to episode (Bayer & Diaconis 1992, Gilbert-Shannon-Reeds riffles), computed and simulated."""
import random
from fractions import Fraction
from math import comb, factorial

ok = True
def check(name, got, want, tol=1e-9):
    global ok
    good = abs(got - want) <= tol if isinstance(want, float) else got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

N = 52

def eulerian(n):
    """A[r] = number of permutations of n cards with exactly r rising sequences (r = 1..n)."""
    A = [0, 1]                            # n = 1
    for m in range(2, n + 1):
        B = [0] * (m + 1)
        for r in range(1, m + 1):
            B[r] = (r * (A[r] if r < len(A) else 0)) + ((m - r + 1) * (A[r - 1] if r - 1 < len(A) else 0))
        A = B
    return A
A = eulerian(N)
assert sum(A) == factorial(N)

def tv_distance(k, n=N, A=A):
    """Bayer-Diaconis: after k GSR riffles a permutation with r rising sequences has chance C(2^k + n - r, n) / 2^(kn)."""
    u = Fraction(1, factorial(n))
    tot = Fraction(0)
    for r in range(1, n + 1):
        p = Fraction(comb(2 ** k + n - r, n), 2 ** (k * n))
        tot += A[r] * abs(p - u)
    return float(tot / 2)

tv = {k: tv_distance(k) for k in range(1, 11)}
for k in range(1, 11):
    print(f"    {k} riffles: distance from random {tv[k]:.3f}")
check("4 riffles: still 1.00", round(tv[4], 2), 1.0)
check("5 riffles: 0.92", round(tv[5], 2), 0.92)
check("6 riffles: 0.61", round(tv[6], 2), 0.61)
check("7 riffles: 0.33 (Wikipedia 0.334)", round(tv[7], 3), 0.334)
check("8 riffles: 0.17", round(tv[8], 2), 0.17)
check("after 7, roughly halves each riffle (8/7 and 9/8 ratios ~0.5)", all(0.4 < tv[k + 1] / tv[k] < 0.55 for k in (7, 8, 9)), True)

# rising runs: after k riffles at most 2^k; a random deck has (n+1)/2 = 26.5 on average
check("max runs after 1 riffle", 2 ** 1, 2)
check("max runs after 3 riffles", 2 ** 3, 8)
check("runs in a random deck, on average", (N + 1) / 2, 26.5)
check("5 riffles is the first with room for 26 runs", min(k for k in range(1, 10) if 2 ** k >= 26), 5)

# Simulation: GSR riffles (binomial cut, drop cards in proportion to pile sizes), count rising runs
def riffle(deck, rng):
    cut = sum(rng.random() < 0.5 for _ in deck)
    L, R = deck[:cut], deck[cut:]
    out = []
    i = j = 0
    while i < len(L) or j < len(R):
        a, b = len(L) - i, len(R) - j
        if rng.random() < a / (a + b):
            out.append(L[i]); i += 1
        else:
            out.append(R[j]); j += 1
    return out

def runs(deck):
    """Rising sequences: card v+1 sits before card v starts a new run."""
    pos = {c: i for i, c in enumerate(deck)}
    return 1 + sum(pos[v + 1] < pos[v] for v in range(len(deck) - 1))

rng = random.Random(23)
TRIALS = 100_000
mean_runs = {}
max_runs = {}
for k in (1, 3, 7):
    s = mx = 0
    for _ in range(TRIALS if k == 1 else TRIALS // 5):
        d = list(range(N))
        for _ in range(k):
            d = riffle(d, rng)
        r = runs(d); s += r; mx = max(mx, r)
    n = TRIALS if k == 1 else TRIALS // 5
    mean_runs[k] = s / n; max_runs[k] = mx
    print(f"    simulated {n:,} decks, {k} riffles: mean runs {mean_runs[k]:.2f}, max {mx}")
check("simulation: one riffle never more than 2 runs", max_runs[1] <= 2, True)
check("simulation: 3 riffles never more than 8 runs", max_runs[3] <= 8, True)
rand_runs = sum(runs(rng.sample(range(N), N)) for _ in range(TRIALS)) / TRIALS
print(f"    simulated {TRIALS:,} random decks: mean runs {rand_runs:.2f}")
check("simulation: random deck ~26.5 runs", round(rand_runs), 26)
check("simulation: 7 riffles within 2 runs of a random deck (not claimed on screen)", abs(mean_runs[7] - 26.5) < 2, True)
check("simulation: >=100,000 decks", TRIALS >= 100_000, True)

print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
