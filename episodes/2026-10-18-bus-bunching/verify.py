"""Every number in the bus-bunching how-to episode, computed exactly and simulated."""
import random
from fractions import Fraction

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def mean_wait(gaps):
    # you arrive at a uniformly random moment; the gap you land in is picked in proportion to its
    # length, and inside it you wait half of it on average: E[G^2] / (2 E[G])
    gaps = [Fraction(g) for g in gaps]
    return sum(g * g for g in gaps) / (2 * sum(gaps))

even = [10] * 6               # six buses an hour, exactly 10 minutes apart
bunched = [2, 18] * 3         # the same six buses, in pairs 2 minutes apart
check("buses per hour, even", len(even), 6)
check("buses per hour, bunched", len(bunched), 6)
check("hour covered, bunched", sum(bunched), 60)
check("average wait, even (min)", mean_wait(even), 5)
w = mean_wait(bunched)
check("average wait, bunched (min)", float(w), 8.2)
check("hook says 'you wait 8' (8.2 rounded down)", int(w), 8)
check("share of the clock in the 18-minute holes", Fraction(18, 20), Fraction(9, 10))
check("average wait if you land in the hole", Fraction(18, 2), 9)
check("extra waiting vs even gaps", round(float(w / 5 - 1) * 100), 64)
# for the description: buses at completely random times (Poisson), mean gap 10 -> wait 10
# exponential gaps: E[G^2] = 2 * 10^2, so E[G^2] / (2 E[G]) = 10

# simulate: riders turn up at random moments over many hours
rng = random.Random(2026)
N = 200_000
def sim(gaps):
    times, t = [], 0.0
    for _ in range(2000):
        for g in gaps:
            t += g
            times.append(t)
    horizon = times[-1] - 60
    import bisect
    total = hole = 0.0
    for _ in range(N):
        a = rng.uniform(0, horizon)
        i = bisect.bisect_right(times, a)
        total += times[i] - a
        prev = times[i - 1] if i else 0.0
        hole += (times[i] - prev) > 10
    return total / N, hole / N
we, _ = sim(even)
wb, share = sim(bunched)
print(f"sim even wait {we:.2f}, bunched wait {wb:.2f}, landed in a hole {share:.3f}")
check("sim even ~5", round(we, 1), 5.0)
check("sim bunched ~8.2", round(wb, 1), 8.2)
check("sim hole share ~9 in 10", round(share, 2), 0.9)
gap_random = []
for _ in range(200_000):
    gap_random.append(rng.expovariate(1 / 10))
er = sum(g * g for g in gap_random) / (2 * sum(gap_random))
print(f"random (Poisson) buses, mean gap 10: wait {er:.2f}")
check("random buses wait ~10", round(er), 10)
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
