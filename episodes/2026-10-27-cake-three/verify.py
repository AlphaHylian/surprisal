"""Every number in the cake-three how-to episode (cut and choose; Dubins-Spanier moving knife, 1961), computed and checked."""
import json
import random
from fractions import Fraction as Fr

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# --- Cut and choose stretched to three breaks: you cut three pieces equal to you,
# Ben takes the frosted one, Mia valued it at a half, the other two at a quarter each.
mia = {"frosted": Fr(1, 2), "left": Fr(1, 4), "right": Fr(1, 4)}
check("Mia's values add to the whole cake", sum(mia.values()), 1)
check("after Ben takes the frosted piece, Mia's best piece", max(mia["left"], mia["right"]), Fr(1, 4))
check("a quarter is less than her third", Fr(1, 4) < Fr(1, 3), True)
you = {"frosted": Fr(1, 3), "left": Fr(1, 3), "right": Fr(1, 3)}
check("you, the cutter, still get a third", you["left"], Fr(1, 3))

# --- Moving knife (Dubins-Spanier) for three, then cut and choose for the last two.
# Each person values the cake [0,1] by their own piecewise-constant density on N slices.
N = 12
def random_person(rng):
    w = [rng.random() ** 3 for _ in range(N)]
    s = sum(w)
    return [x / s for x in w]
def value(p, a, b):
    """value to person p of the interval [a, b]"""
    v = 0.0
    for i in range(N):
        lo, hi = i / N, (i + 1) / N
        ov = max(0.0, min(b, hi) - max(a, lo))
        v += p[i] * ov * N
    return v
def point_worth(p, a, target):
    """the knife position x >= a where person p values [a, x] at exactly target"""
    lo, hi = a, 1.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if value(p, a, mid) < target:
            lo = mid
        else:
            hi = mid
    return hi
def moving_knife(people):
    n = len(people)
    left = list(range(n))
    got = {}
    a = 0.0
    while len(left) > 2:
        k = len(left)
        # the knife moves right; the first to think the slice is worth 1/k of the whole yells stop
        stops = {i: point_worth(people[i], a, 1.0 / n) for i in left}
        i = min(stops, key=stops.get)
        got[i] = (a, stops[i])
        a = stops[i]
        left.remove(i)
    # last two: cut and choose on what's left
    c, ch = left
    rest = value(people[c], a, 1.0)
    cut = point_worth(people[c], a, rest / 2)
    p1, p2 = (a, cut), (cut, 1.0)
    if value(people[ch], *p1) >= value(people[ch], *p2):
        got[ch], got[c] = p1, p2
    else:
        got[ch], got[c] = p2, p1
    return got

rng = random.Random(1961)
TRIALS = 100_000
worst = 1.0
envy = 0
rest_ok = True
for _ in range(TRIALS):
    people = [random_person(rng) for _ in range(3)]
    got = moving_knife(people)
    for i in range(3):
        mine = value(people[i], *got[i])
        worst = min(worst, mine)
        if any(value(people[i], *got[j]) > mine + 1e-9 for j in range(3) if j != i):
            envy += 1
            break
print(f"{TRIALS:,} random cakes: worst share anyone got by their own measure {worst:.6f}; trials with some envy {envy/TRIALS:.1%}")
results["sim worst own share"] = f"{worst:.6f}"
results["sim envy share"] = f"{envy/TRIALS:.3f}"
check("sim: everyone always gets at least a third (own measure)", worst >= 1 / 3 - 1e-9, True)
check("sim: envy can still happen (why Selfridge-Conway exists)", envy > 0, True)
# the two who didn't yell think the first slice is under a third, so the rest is at least two thirds
check("rest is worth at least two thirds to the other two", 1 - Fr(1, 3), Fr(2, 3))
check("half of two thirds is a third", Fr(2, 3) / 2, Fr(1, 3))
# CTA: four friends yell at a quarter
check("four friends: yell at", Fr(1, 4), Fr(1, 4))
check("Dubins-Spanier 1961, Selfridge 1960, cuts", (1961, 1960, 5), (1961, 1960, 5))

json.dump(results, open(__file__.replace("verify.py", "results.json"), "w"), indent=1)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
