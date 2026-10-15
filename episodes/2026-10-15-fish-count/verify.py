"""Every number in the fish-count (mark and recapture) episode, computed and simulated."""
import numpy as np

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def lincoln_petersen(marked, caught, recaught):
    return marked * caught / recaught

# The worked example: mark 200, catch 200 again, 20 of them tagged
check("20 out of 200 is one in", 200 // 20, 10)
check("estimate: 200 marked x 200 caught / 20 tagged", lincoln_petersen(200, 200, 20), 2000.0)

# Simulate the lake: 2,000 fish, 200 tagged, second trip catches 200 at random (hypergeometric)
rng = np.random.default_rng(1)
TRIALS = 200_000
N = 2000
k = rng.hypergeometric(200, N - 200, 200, size=TRIALS)
check("average tagged fish in the second catch (rounded)", round(k.mean()), 20)
lo, hi = np.percentile(k, [5, 95])
check("9 trips in 10: tagged count between", (int(lo), int(hi)), (14, 27))
est = 200 * 200 / k
elo, ehi = np.percentile(est, [5, 95])
print(f"   9 in 10 estimates between {elo:.0f} and {ehi:.0f}")
check("9 in 10 estimates between (to the nearest 100)", (int(round(elo, -2)), int(round(ehi, -2))), (1500, 2900))

# Catch 500 each trip instead
k5 = rng.hypergeometric(500, N - 500, 500, size=TRIALS)
est5 = 500 * 500 / k5
lo5, hi5 = np.percentile(est5, [5, 95])
print(f"   with 500 per trip: 9 in 10 estimates between {lo5:.0f} and {hi5:.0f}")
check("500 per trip: 9 in 10 within (to the nearest 100)", (int(round(lo5, -2)), int(round(hi5, -2))), (1800, 2300))

# Trap-shy tagged fish: if tagged fish are half as likely to be caught, you count fewer and overestimate
w = np.r_[np.full(200, 0.5), np.ones(N - 200)]
p = w / w.sum()
shy = []
for _ in range(20_000):
    idx = rng.choice(N, 200, replace=False, p=p)
    shy.append((idx < 200).sum())
shy = np.array(shy)
print(f"   trap-shy: average tagged {shy.mean():.1f}, estimate {200*200/shy.mean():.0f}")
check("trap-shy tagged fish -> count too few (fewer than 20)", shy.mean() < 15, True)
check("trap-shy (half as catchable): estimate almost twice the real 2,000", 1.7 < 200 * 200 / shy.mean() / N < 2.0, True)

# CTA: mark 50 frogs, catch 40, 8 are marked
check("frogs: 50 x 40 / 8", lincoln_petersen(50, 40, 8), 250.0)

print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
