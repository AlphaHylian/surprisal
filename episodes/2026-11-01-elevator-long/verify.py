"""Every number in the elevator long-form (Gamow-Stern elevator paradox), computed and simulated."""
import json
import random
from fractions import Fraction as Fr
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def p_down(floors_below, floors_above, k):
    """first car (of k independent, never-resting cars) arrives going down. One car: above/(above+below);
    k cars: 1/2 + 1/2 (1 - 2q)^k with q = below/(total)."""
    q = Fr(floors_below, floors_below + floors_above)
    return Fr(1, 2) + Fr(1, 2) * (1 - 2 * q) ** k

# our building: lobby + 10 floors, you on floor 1 -> 1 floor below you, 9 above
check("floors above you", 10 - 1, 9)
check("one car: wrong way (9 in 10)", p_down(1, 9, 1), Fr(9, 10))
check("long gap (up 9, back 9)", 2 * 9, 18)
check("short gap (down 1, up 1)", 2 * 1, 2)
check("long gap is 9 times the short", 18 // 2, 9)
check("land in a long gap: 18 of 20", Fr(18, 20), Fr(9, 10))
check("two cars", round(float(p_down(1, 9, 2)) * 100), 82)
check("three cars", round(float(p_down(1, 9, 3)) * 100), 76)
check("ten cars", round(float(p_down(1, 9, 10)) * 100), 55)
check("per car, chance per floor-time of a down pass next (9/10 x 1/18)", Fr(9, 10) * Fr(1, 18), Fr(1, 20))
check("per car, chance per floor-time of an up pass next (1/10 x 1/2)", Fr(1, 10) * Fr(1, 2), Fr(1, 20))
# Gamow & Stern: seven-storey building, Gamow on 2 (1 floor below, 5 above), Stern on 6 (5 below, 1 above)
check("Gamow one car down", p_down(1, 5, 1), Fr(5, 6))
check("Stern one car up", 1 - p_down(5, 1, 1), Fr(5, 6))
check("Gamow two cars (Knuth 13/18)", p_down(1, 5, 2), Fr(13, 18))
check("5/6 as 18ths", Fr(5, 6) * 18, 15)
check("Gamow 5/6 percent", round(5 / 6 * 100), 83)
check("Gamow 13/18 percent", round(13 / 18 * 100), 72)
# average wait for one car from floor 1, in floor-travel times: gaps 18 and 2, random arrival
w = Fr(18 ** 2 + 2 ** 2, 2 * 20)
check("average wait, gaps 18 and 2", float(w), 8.2)
# bus: a bus every 10 minutes on average but gaps of 2 and 18 minutes
check("bus average gap", (2 + 18) / 2, 10)
check("bus average wait", float(Fr(2 ** 2 + 18 ** 2, 2 * 20)), 8.2)
check("bus share of time in the 18-minute gap", Fr(18, 20), Fr(9, 10))
check("even 10-minute gaps: wait 5", 10 / 2, 5)
# classes of 10 and 50
check("school's average class", (10 + 50) / 2, 30)
check("students in the big class", 50, 50)
check("average student's class", round((10 * 10 + 50 * 50) / 60), 43)
# CTA: friend on floor 9 (one below the top), two cars: first comes going up
check("CTA: floor 9, two cars, up (mirror of floor 1)", round(float(p_down(1, 9, 2)) * 100), 82)

# simulation: cars ride 0..H..0 at one floor per time unit, random phases; press at random time
def sim(H, floor, k, trials, rng):
    down = 0
    cyc = 2 * H
    for _ in range(trials):
        best = None
        for _ in range(k):
            ph = rng.random() * cyc   # position on the cycle: 0..H going up, H..2H going down
            # time until the car is at `floor` going up / going down
            t_up = (floor - ph) % cyc
            t_dn = ((2 * H - floor) - ph) % cyc
            t, d = (t_dn, True) if t_dn < t_up else (t_up, False)
            if best is None or t < best[0]:
                best = (t, d)
        down += best[1]
    return down / trials
rng = random.Random(3)
N = 200_000
s1, s2, s3, s10 = (sim(10, 1, k, N, rng) for k in (1, 2, 3, 10))
g1, g2 = sim(6, 1, 1, N, rng), sim(6, 1, 2, N, rng)   # seven storeys = floors 0..6, Gamow's "2nd floor" = 1 above the bottom
print(f"sim: 1 car {s1:.3f}, 2 {s2:.3f}, 3 {s3:.3f}, 10 {s10:.3f}; Gamow 1 car {g1:.3f}, 2 cars {g2:.3f}")
check("sim 1 car ~ 0.90", abs(s1 - 0.9) < 0.005, True)
check("sim 2 cars ~ 0.82", abs(s2 - 0.82) < 0.005, True)
check("sim 3 cars ~ 0.756", abs(s3 - 0.756) < 0.005, True)
check("sim 10 cars ~ 0.554", abs(s10 - 0.5537) < 0.005, True)
check("sim Gamow 1 car ~ 5/6", abs(g1 - 5 / 6) < 0.005, True)
check("sim Gamow 2 cars ~ 13/18", abs(g2 - 13 / 18) < 0.005, True)
f9 = 1 - sim(10, 9, 2, N, rng)
print(f"sim floor 9, two cars, up: {f9:.3f}")
check("sim CTA floor 9 two cars up ~ 0.82", abs(f9 - 0.82) < 0.005, True)
check("any floor: floor 5 of 10 down", p_down(5, 5, 1), Fr(1, 2))
check("floor 8 of 10: up 8 in 10", 1 - Fr(2, 10), Fr(8, 10))
check("lean, 1 car (points over 50)", round(float(p_down(1, 9, 1) - Fr(1, 2)) * 100, 1), 40.0)
check("lean, 2 cars", round(float(p_down(1, 9, 2) - Fr(1, 2)) * 100, 1), 32.0)
check("lean, 3 cars", round(float(p_down(1, 9, 3) - Fr(1, 2)) * 100, 1), 25.6)
check("each car keeps 8 tenths", (p_down(1, 9, 2) - Fr(1, 2)) / (p_down(1, 9, 1) - Fr(1, 2)), Fr(8, 10))
check("six cars, floor 1", round(float(p_down(1, 9, 6)) * 100), 63)
check("eight cars, floor 1", round(float(p_down(1, 9, 8)) * 100), 58)
check("floor 3 of 30: share above", Fr(27, 30), Fr(9, 10))
check("simulated presses", N, 200_000)
# passes over a long day: equal up and down
ups = downs = 0
for step in range(0, 20 * 500):
    pos = step % 20
    ups += pos == 1; downs += pos == 19
check("one car, 500 round trips: passes up = passes down", (ups, downs), (500, 500))
# bus simulation: random arrival, gaps alternate 2 and 18
waits = []
for _ in range(N):
    t = rng.random() * 20
    waits.append(2 - t if t < 2 else 20 - t)
check("sim bus wait ~ 8.2", abs(sum(waits) / N - 8.2) < 0.05, True)

Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
