"""Every number in the coin-18 episode (Shallit's 18-cent coin), computed and simulated.
Source: https://www.futilitycloset.com/2018/11/20/a-call-for-change/ (Shallit, "What This Country Needs
Is an 18c Piece", Mathematical Intelligencer 25(2), 2003: 1-5-10-25 averages 4.7 coins over 0-99 cents;
1-5-18-25 and 1-5-18-29 average 3.89, about 17% better)."""
import json
import random
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def fewest(coins, n=100):
    best = [0] + [10**9] * (n - 1)
    how = [[]] + [None] * (n - 1)
    for v in range(1, n):
        for c in coins:
            if c <= v and best[v - c] + 1 < best[v]:
                best[v] = best[v - c] + 1
                how[v] = how[v - c] + [c]
    return best, how

def greedy(coins, v):
    out = []
    for c in sorted(coins, reverse=True):
        while v >= c:
            out.append(c)
            v -= c
    return out

US = [1, 5, 10, 25]
NEW = [1, 5, 18, 25]
bu, hu = fewest(US)
bn, hn = fewest(NEW)
avg_us = sum(bu) / 100
avg_new = sum(bn) / 100
check("US average over 0-99 cents: 4.7 coins", round(avg_us, 2), 4.7)
check("1-5-18-25 average: 3.89 coins", round(avg_new, 2), 3.89)
check("1-5-18-29 also 3.89", round(sum(fewest([1, 5, 18, 29])[0]) / 100, 2), 3.89)
check("saving about 17%", round(100 * (1 - avg_new / avg_us)), 17)
check("99 cents in US coins: 9 coins", bu[99], 9)
check("99 cents = 3 quarters, 2 dimes, 4 pennies", sorted(hu[99], reverse=True), [25, 25, 25, 10, 10, 1, 1, 1, 1])
check("36 cents US: quarter, dime, penny (3 coins)", sorted(hu[36], reverse=True), [25, 10, 1])
check("36 cents new: two 18s", sorted(hn[36]), [18, 18])
check("greedy on 36 with 18s: quarter, 2 nickels, penny = 4 coins", greedy(NEW, 36), [25, 5, 5, 1])
check("greedy is optimal for US coins (every amount)", all(len(greedy(US, v)) == bu[v] for v in range(100)), True)
bad = [v for v in range(100) if len(greedy(NEW, v)) != bn[v]]
results["greedy_fails_new"] = bad
print("amounts where biggest-first fails with 1-5-18-25:", bad)
check("72 cents new: four 18s (CTA answer 4)", (bn[72], sorted(hn[72])), (4, [18, 18, 18, 18]))
check("72 cents US: 6 coins", bu[72], 6)
check("biggest-first fails on 37 of the 100 amounts", len(bad), 37)

# brute force: of all 4-coin systems with a penny, nothing beats 3.89
near = min((sum(fewest([1, 5, b, c])[0]), b, c) for b in range(6, 100) for c in range(b + 1, 100))
check("best 1-5-x-y system: 389 coins per 100 amounts", near[0], 389)

# simulation: 200,000 random amounts of change
rng = random.Random(18)
N = 200_000
amts = [rng.randrange(100) for _ in range(N)]
su = sum(bu[a] for a in amts) / N
sn = sum(bn[a] for a in amts) / N
print(f"simulated: US {su:.3f}, 18-cent {sn:.3f} over {N:,} random amounts")
check("simulated US average rounds to 4.7", round(su, 1), 4.7)
check("simulated new average rounds to 3.9", round(sn, 1), 3.9)
results["sim_us"], results["sim_new"] = f"{su:.3f}", f"{sn:.3f}"

print("ALL OK" if ok else "SOME CHECKS FAILED")
Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
raise SystemExit(0 if ok else 1)
