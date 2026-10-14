"""Every number in the flat-hunting (secretary problem / 37% rule) episode, computed and simulated."""
import math
import random

ok = True
def check(name, got, want, tol=0):
    global ok
    good = abs(got - want) <= tol if isinstance(want, (int, float)) and not isinstance(want, bool) else got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def p_best(n, r):
    """Exact chance of ending with the very best when you skip the first r and then take the first record."""
    if r == 0:
        return 1 / n
    return (r / n) * sum(1 / (i - 1) for i in range(r + 1, n + 1))

N = 20
# 1. Take one at random / the first decent one: 1 in 20 = 5% for the very best
check("random pick gets the best (%)", round(100 / N), 5)
# 2. Best cutoff for 20 flats: skip 7
best_r = max(range(N), key=lambda r: p_best(N, r))
check("best number to skip of 20", best_r, 7)
check("20/e rounds to", round(N / math.e), 7)
check("skip 7 of 20 -> best flat (%)", round(100 * p_best(N, 7)), 38)
# 3. Simulate 1,000,000 months of flat hunting
rng = random.Random(14)
T = 1_000_000
got_best = top3 = stuck_last = 0
for _ in range(T):
    ranks = list(range(N)); rng.shuffle(ranks)  # rank 0 = best
    bar = min(ranks[:7])
    pick = next((x for x in ranks[7:] if x < bar), None)
    if pick is None:
        pick = ranks[-1]; stuck_last += 1
    got_best += pick == 0
    top3 += pick < 3
check("sim: best flat (%)", round(100 * got_best / T), 38)
check("sim: a top-3 flat (%)", round(100 * top3 / T), 63)
check("sim: best was in the first 7, stuck with the last (%)", round(100 * stuck_last / T), 35)
check("first 7 contain the best: 7/20 (%)", round(100 * 7 / 20), 35)
# 4. Random pick top-3: 3/20 = 15%
check("random pick top-3 (%)", round(100 * 3 / N), 15)
# 5. More flats, same rule (skip 37%): still ~37%
for n in (100, 1000):
    r = max(range(n), key=lambda r: p_best(n, r))
    print(f"    n={n}: skip {r}, best {100 * p_best(n, r):.1f}%")
    check(f"n={n}: still 37%", round(100 * p_best(n, r)), 37)
check("1/e (%)", round(100 / math.e, 1), 36.8)
# 6. Sourced: https://en.wikipedia.org/wiki/Secretary_problem (fetched 2026-10-14):
#    skip ~n/e, then take the first better than all seen; success -> 1/e; Martin Gardner, Scientific American, Feb 1960.
print("ALL OK" if ok else "SOMETHING FAILED")
raise SystemExit(0 if ok else 1)
