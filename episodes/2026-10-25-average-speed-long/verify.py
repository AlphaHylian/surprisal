"""Every number in the average-speed long-form (cameras, mean value theorem, ghost car, universal chord theorem)."""
import json
import math
import os
import random

ok = True
results = {}
def check(name, got, want, tol=1e-9):
    global ok
    good = abs(got - want) <= tol if isinstance(want, float) else got == want
    ok &= good
    results[name] = got
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

KM, T, LIMIT, CAM = 5.0, 150.0, 100.0, 95.0
avg = KM / (T / 3600)

# ---- chapter 1-2: the fine and the division
check("5 km in 150 s = 120 km/h", round(avg, 9), 120.0)
check("over the limit by 20", round(avg - LIMIT, 9), 20.0)
check("legal time for 5 km at 100: 180 s", round(KM / LIMIT * 3600, 9), 180.0)
check("time saved: 30 s", round(KM / LIMIT * 3600 - T, 9), 30.0)
check("m/s to km/h: 5000 m / 150 s = 33.3 m/s x 3.6", round(5000 / 150 * 3.6, 9), 120.0)
# braking myth: 4 km at 120 = 120 s; to finish in 180 s the last km must take 60 s = 60 km/h
first4 = 4 / 120 * 3600
check("4 km at 120 takes 120 s", round(first4, 9), 120.0)
check("last km in 60 s", round(180 - first4, 9), 60.0)
check("= 60 km/h for the last km", round(1 / ((180 - first4) / 3600), 9), 60.0)
# a 10 km pair: same 120 needs 300 s = 5 min (the Short's CTA answer)
check("10 km in 5 min = 120", round(10 / (300 / 3600), 9), 120.0)
# a 75 m pair (shortest SPECS set) at 120 km/h: 2.25 s
check("75 m at 120 km/h takes 2.25 s", round(75 / (120 / 3.6), 9), 2.25)

# ---- chapter 3: the on-screen speed curve, 95 at both cameras, average 120
A = (avg - CAM) * math.pi / 2
check("curve peak = 95 + 25 x pi / 2, about 134", round(CAM + A), 134)
n = 150_000
v = [CAM + A * math.sin(math.pi * (i + 0.5) / n) for i in range(n)]
check("curve averages 120", round(sum(v) / n, 6), 120.0)
# where it crosses 120 (two moments): sin(pi t/T) = 25/A
s0 = math.asin((avg - CAM) / A) / math.pi * T
check("first moment at exactly 120, s", round(s0), 33)
check("second moment at exactly 120, s", round(T - s0), 117)
above = sum(1 for x in v if x > avg) / n * T
check("seconds above 120", round(above), 84)

# ---- chapter 4: the ghost car (Rolle / mean value theorem) on the same curve
# gap(t) = your distance - ghost's distance (ghost drives exactly 120 the whole way)
dt = T / n
pos = 0.0; gap = []; 
for i, x in enumerate(v):
    pos += x / 3.6 * dt
    gap.append(pos - avg / 3.6 * (i + 1) * dt)
check("gap at the end, m (you finish together)", round(gap[-1], 3), 0.0, tol=0.01)
imin = min(range(n), key=lambda i: gap[i])
check("furthest behind, m", round(-gap[imin]), 110)
check("...at second", round((imin + 0.5) * dt), 33)
check("...your speed then = 120", round(v[imin], 1), 120.0, tol=0.15)
imax = max(range(n), key=lambda i: gap[i])
check("furthest ahead, m", round(gap[imax]), 110)
check("...at second", round((imax + 0.5) * dt), 117)
check("...your speed then = 120 again", round(v[imax], 1), 120.0, tol=0.15)
# random check of the theorem: 100,000 random smooth trips, each passes its own average speed
rng = random.Random(2510)
hits = 0
for _ in range(100_000):
    k = rng.randint(1, 5)
    cs = [(rng.uniform(-1, 1), rng.uniform(0, 2 * math.pi), j) for j in range(1, k + 1)]
    xs = [i / 200 for i in range(201)]
    ys = [3 + sum(c * math.sin(2 * math.pi * j * x + p) for c, p, j in cs) for x in xs]
    m = sum((ys[i] + ys[i + 1]) / 2 for i in range(200)) / 200
    hits += any((ys[i] - m) * (ys[i + 1] - m) <= 0 for i in range(200))
check("100,000 random trips: all hit their average speed", hits, 100_000)

# ---- chapter 5: universal chord theorem (Levy 1934)
# Guaranteed: for a 5 km trip at average 120, some stretch of 5/n km has average exactly 120.
check("guaranteed stretches 5/n km", [round(5 / k, 2) for k in range(1, 6)], [5.0, 2.5, 1.67, 1.25, 1.0])
# Counterexample for 2 km (r = 0.4 of the distance): time(d) = T * (x + a * (sin^2(pi x / r) - x sin^2(pi / r))), x = d / 5 km
def build(r, a, m=200_000):
    s2 = math.sin(math.pi / r) ** 2
    tt = lambda x: T * (x + a * (math.sin(math.pi * x / r) ** 2 - x * s2))
    dtdx = lambda x: T * (1 + a * (math.pi / r * math.sin(2 * math.pi * x / r) - s2))
    speeds = [KM / (dtdx(i / m) / 3600) for i in range(m + 1)]
    return tt, speeds, s2
r, a = 0.4, 0.03
tt, sp, s2 = build(r, a)
check("total time still 150 s", round(tt(1.0), 6), 150.0)
check("slowest moment, km/h", round(min(sp)), 100)
check("fastest moment, km/h", round(max(sp)), 163)
# every 2 km window: time = 0.4 T (1 + a sin^2(pi/r))... computed numerically for 2,000 start points
wins = [KM * r / ((tt(x + r) - tt(x)) / 3600) for x in [i / 2000 * (1 - r) for i in range(2001)]]
check("every 2 km stretch averages the same, km/h", round(min(wins), 1), 123.7)
check("(max equals min)", round(max(wins) - min(wins), 6), 0.0)
check("every 2 km stretch takes, s", round(KM * r / min(wins) * 3600, 1), 58.2)
# two 2 km pieces = 4 km in 116.4 s, leaving 33.6 s for the last km (about 107 km/h)
check("two 2 km stretches, s", round(2 * (tt(r) - tt(0)), 1), 116.4)
check("left for the last km, s", round(T - 2 * (tt(r) - tt(0)), 1), 33.6)
check("last km speed, km/h", round(1 / ((T - (tt(0.8) - tt(0))) / 3600)), 107)
check("first km takes the same, s", round(tt(0.2) - tt(0), 1), 33.6)
# and every 1 km and 2.5 km window: one hits exactly 120
for frac, name in [(0.2, "1 km"), (0.5, "2.5 km")]:
    ws = [KM * frac / ((tt(x + frac) - tt(x)) / 3600) for x in [i / 20000 * (1 - frac) for i in range(20001)]]
    check(f"some {name} stretch at exactly 120 (min <= 120 <= max)", min(ws) <= 120 <= max(ws), True)
# 3 km also fails (r = 0.6)
tt3, sp3, _ = build(0.6, 0.03)
w3 = [KM * 0.6 / ((tt3(x + 0.6) - tt3(x)) / 3600) for x in [i / 2000 * 0.4 for i in range(2001)]]
check("3 km counterexample: every 3 km stretch over 120", min(w3) > 120, True)
check("3 km counterexample: speeds stay positive", min(sp3) > 0, True)
# CTA: cameras 6 km apart, average 120: a 2 km stretch at exactly 120? yes (6/3); 4 km? not guaranteed (6/4 not whole)
check("CTA: 6 / 2 = 3 is whole -> guaranteed", 6 % 2 == 0 and (6 / 2).is_integer(), True)
check("CTA: 6 / 4 = 1.5 not whole -> not guaranteed", (6 / 4).is_integer(), False)

# runner: 10 km in 50 min; 5 km and 2 km fit a whole number of times, 3 km doesn't
check("runner 5 km piece: 25 min", 50 * 5 / 10, 25.0)
check("runner 2 km piece: 10 min", 50 * 2 / 10, 10.0)
check("runner: 10/5, 10/2 whole; 10/3 not", ((10 / 5).is_integer(), (10 / 2).is_integer(), (10 / 3).is_integer()), (True, True, False))
# ---- history years
check("Rolle 1691 to Cauchy 1823", 1823 - 1691, 132)
check("SPECS approved 1999", 1999, 1999)

json.dump({k: v for k, v in results.items()}, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "results.json"), "w"), indent=1, default=str)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
