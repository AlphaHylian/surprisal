"""Every number in the two-eggs episode (two-egg drop puzzle, 100 floors), computed by brute force and simulated.
Source: https://en.wikipedia.org/wiki/Dynamic_programming#Egg_dropping_puzzle (the rules: a broken egg is gone,
a survivor can be reused, an egg that breaks from one floor breaks from any higher one; the recurrence W(n, k))."""
import json, random
from functools import lru_cache
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

FLOORS = 100
# "breaks at floor b" means the egg survives b-1 and breaks at b; b = 101 means it never breaks (safe floor 100).

def drops(plan, b, floors=FLOORS):
    """first egg tries the floors in `plan` (rising); when it breaks, the second egg climbs from the last safe floor + 1."""
    n, last_safe = 0, 0
    for f in plan:
        n += 1
        if f >= b:  # breaks
            for g in range(last_safe + 1, f):
                n += 1
                if g >= b:
                    return n
            return n
        last_safe = f
    for g in range(last_safe + 1, floors + 1):
        n += 1
        if g >= b:
            return n
    return n

def worst(plan, floors=FLOORS):
    return max(drops(plan, b, floors) for b in range(1, floors + 2))

tens = list(range(10, 101, 10))
check("every 10 floors: worst case 19 drops", worst(tens), 19)
check("worst case: breaks at 100 -> 10 drops + floors 91..99 = 19", drops(tens, 100), 19)
check("halving: drop from 50 first, breaks -> climb 1..49: 50 drops", drops([50], 50), 50)
smart = []
f, step = 0, 14
while f < FLOORS:
    f = min(FLOORS, f + step); smart.append(f); step -= 1
print("smart plan:", smart)
check("smart plan floors", smart[:5], [14, 27, 39, 50, 60])
check("smart plan: worst case 14 drops", worst(smart), 14)
check("breaks at 14: 1 + floors 1..13 = 14", drops(smart, 14), 14)
check("breaks at 27: 2 + floors 15..26 = 14", drops(smart, 27), 14)
check("14+13+...+1 = 105", sum(range(1, 15)), 105)
check("13 drops reach only 91", sum(range(1, 14)), 91)

@lru_cache(None)
def W(n, k):  # fewest drops that always work with n floors, k eggs
    if n == 0: return 0
    if k == 1: return n
    return 1 + min(max(W(x - 1, k - 1), W(n - x, k)) for x in range(1, n + 1))
check("no plan beats 14 (dynamic programming, 100 floors, 2 eggs)", W(100, 2), 14)
check("CTA: 200 floors needs 20", W(200, 2), 20)
check("CTA: 20+...+1 = 210, 19 reaches only 190", (sum(range(1, 21)), sum(range(1, 20))), (210, 190))

rng = random.Random(2)
T = 100_000
bs = [rng.randint(1, 101) for _ in range(T)]
avg_t = sum(drops(tens, b) for b in bs) / T
avg_s = sum(drops(smart, b) for b in bs) / T
mx_t, mx_s = max(drops(tens, b) for b in bs), max(drops(smart, b) for b in bs)
print(f"simulated over {T:,} random breaking floors: tens avg {avg_t:.2f} max {mx_t}; smart avg {avg_s:.2f} max {mx_s}")
results.update(sim_avg_tens=f"{avg_t:.2f}", sim_avg_smart=f"{avg_s:.2f}")
check("simulated worst cases 19 vs 14", (mx_t, mx_s), (19, 14))

print("ALL OK" if ok else "SOME CHECKS FAILED")
Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
raise SystemExit(0 if ok else 1)
