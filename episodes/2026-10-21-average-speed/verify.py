"""Every number in the average-speed-camera how-to episode, computed and simulated."""
import math
import random

ok = True
def check(name, got, want, tol=1e-9):
    global ok
    good = abs(got - want) <= tol if isinstance(want, float) else got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

KM, SECONDS, LIMIT, AT_CAMERAS = 5, 150, 100, 95

# step 1-2: two plate reads, 5 km apart, 150 s apart
avg = KM / (SECONDS / 3600)
check("5 km in 150 s, km/h", round(avg, 9), 120.0)
check("150 s is 2 min 30 s", (SECONDS // 60, SECONDS % 60), (2, 30))
check("over the limit by", round(avg - LIMIT, 9), 20.0)

# step 5: legal time for 5 km at 100 km/h, and the time 'saved'
legal = KM / LIMIT * 3600
check("legal time for 5 km at 100, s", round(legal, 9), 180.0)
check("legal time is 3 minutes", legal / 60, 3.0)
check("time saved, s", round(legal - SECONDS, 9), 30.0)

# the curve on screen: v(t) = 95 + A sin(pi t / T); mean of sin over [0, T] is 2/pi
A = (avg - AT_CAMERAS) * math.pi / 2
peak = AT_CAMERAS + A
print(f"    on-screen curve: amplitude {A:.2f}, peak {peak:.1f} km/h")
n = 150_000
mean_curve = sum(AT_CAMERAS + A * math.sin(math.pi * (i + 0.5) / n) for i in range(n)) / n
check("on-screen curve averages 120", round(mean_curve, 6), 120.0)

# Simulation: 100,000 random smooth speed profiles that read 95 at both cameras and average 120.
# Claim: every one goes above 120 somewhere, and is at exactly 120 at some moment (crosses it).
def profile(rng, steps=300):
    # random smooth bumps (sum of sines vanishing at both ends) + random wiggle, then shifted to mean 120
    k = rng.randint(1, 6)
    coefs = [(rng.uniform(-1, 1), j) for j in range(1, k + 1)]
    xs = [i / steps for i in range(steps + 1)]
    ys = [sum(c * math.sin(math.pi * j * x) for c, j in coefs) for x in xs]
    # trapezoid mean
    m = sum((ys[i] + ys[i + 1]) / 2 for i in range(steps)) / steps
    if abs(m) < 1e-6:
        return None
    s = (avg - AT_CAMERAS) / m          # scale so the mean is exactly 120
    v = [AT_CAMERAS + s * y for y in ys]
    return v

rng = random.Random(21)
trials = above = crosses = 0
while trials < 100_000:
    v = profile(rng)
    if v is None or min(v) < 0:
        continue
    trials += 1
    if max(v) > avg:
        above += 1
    if any((v[i] - avg) * (v[i + 1] - avg) <= 0 for i in range(len(v) - 1)):
        crosses += 1
check("profiles simulated", trials, 100_000)
check("profiles that go above 120 somewhere", above, trials)
check("profiles that hit exactly 120 at some moment", crosses, trials)

# Any trip at all (no endpoint condition): the speedometer reads the average at least once.
hits = 0
for _ in range(100_000):
    v = [rng.uniform(0, 200)]
    for _ in range(200):
        v.append(max(0, v[-1] + rng.uniform(-8, 8)))
    m = sum((v[i] + v[i + 1]) / 2 for i in range(len(v) - 1)) / (len(v) - 1)
    hits += any((v[i] - m) * (v[i + 1] - m) <= 0 for i in range(len(v) - 1))
check("random trips whose speed equals their average at some moment", hits, 100_000)

# CTA: cameras 10 km apart, 5 minutes -> 120 km/h, fined at a 100 limit
cta = 10 / (5 / 60)
check("CTA: 10 km in 5 min, km/h", round(cta, 9), 120.0)
check("CTA: over 100?", cta > LIMIT, True)

print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
