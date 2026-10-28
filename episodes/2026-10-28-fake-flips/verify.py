"""Every number in the fake-flips how-to episode (spotting made-up coin flips by the longest streak), computed and checked."""
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

def p_no_streak(n, k):
    """Exact chance that n fair flips have no run of k or more identical sides."""
    # state: length of the current run (1..k-1); the first flip starts a run of 1
    dist = {1: Fraction(1)}
    for _ in range(n - 1):
        new = {}
        for r, pr in dist.items():
            new[1] = new.get(1, 0) + pr / 2             # switch sides
            if r + 1 < k:
                new[r + 1] = new.get(r + 1, 0) + pr / 2  # same side again
        dist = new
    return sum(dist.values())

N = 200
p6 = 1 - p_no_streak(N, 6)
print(f"P(streak of 6+ in {N} flips) = {float(p6):.4f}")
check("real lists with a streak of 6+, percent", round(float(p6) * 100), 97)
p7 = 1 - p_no_streak(N, 7)
print(f"P(streak of 7+ in {N} flips) = {float(p7):.4f}")
check("streak of 7+, more often than not", p7 > Fraction(1, 2), True)
check("one start position, 5 matches in a row: one in", 2 ** 5, 32)
check("places a streak of 6 can start in 200 flips", N - 6 + 1, 195)

random.seed(200)
TRIALS = 100_000
hits, longest_sum, heads_near = 0, 0, 0
for _ in range(TRIALS):
    flips = random.getrandbits(N)
    s = [(flips >> i) & 1 for i in range(N)]
    best = run = 1
    for i in range(1, N):
        run = run + 1 if s[i] == s[i - 1] else 1
        best = max(best, run)
    hits += best >= 6
    longest_sum += best
    heads_near += abs(sum(s) - 100) <= 10
sim = hits / TRIALS
results["sim streak 6+ in 200"] = f"{sim:.4f}"
results["sim mean longest streak"] = f"{longest_sum / TRIALS:.2f}"
print(f"sim: streak 6+ in {sim:.1%}; mean longest {longest_sum / TRIALS:.2f}; heads within 90-110 in {heads_near / TRIALS:.1%}")
check("simulation agrees with the exact value (within 0.5 points)", abs(sim - float(p6)) < 0.005, True)
check("heads count lands within 90-110 most of the time ('about 100')", heads_near / TRIALS > 0.85, True)

# The on-screen sample lists (first 40 flips of each) and their longest streaks
REAL = "HTTHHHHHHTHTTHTTTHHTHHTTTHTHHHTTHTHTTTTH"
FAKE = "HTHHTHTTHTHHTHTTHTHTHHTHTTHTHTHHTTHTHTHT"
def longest(s):
    best = run = 1
    for i in range(1, len(s)):
        run = run + 1 if s[i] == s[i - 1] else 1
        best = max(best, run)
    return best
check("on-screen real sample length", len(REAL), 40)
check("on-screen fake sample length", len(FAKE), 40)
check("on-screen real sample longest streak", longest(REAL), 6)
check("on-screen fake sample longest streak", longest(FAKE), 2)
# switches: a fair coin switches about half the time; the fake switches far more
sw = lambda s: sum(s[i] != s[i - 1] for i in range(1, len(s)))
results["switches real/fake out of 39"] = f"{sw(REAL)}/{sw(FAKE)}"
print("switches real/fake:", sw(REAL), sw(FAKE))
check("fake sample switches more than the real one", sw(FAKE) > sw(REAL), True)

# CTA: 20 flips, typical longest streak
p20 = {k: float(p_no_streak(20, k + 1) - p_no_streak(20, k)) for k in range(1, 21)}
mode20 = max(p20, key=p20.get)
results["20 flips most likely longest streak"] = str(mode20)
print("20 flips: most likely longest streak", mode20, {k: round(v, 3) for k, v in p20.items() if v > 0.01})
check("20 flips: most likely longest streak is 4", mode20, 4)

json.dump(results, open(__file__.replace("verify.py", "results.json"), "w"), indent=1)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
