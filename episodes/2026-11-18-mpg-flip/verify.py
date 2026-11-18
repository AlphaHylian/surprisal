"""Every number in the mpg-flip Short, computed and checked."""
import random
ok = True
def check(name, got, want):
    global ok
    good = abs(got - want) < 1e-9 if isinstance(want, float) else got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

MILES = 10_000
gal = lambda mpg: MILES / mpg
check("truck at 10 mpg, gallons/yr", gal(10), 1000.0)
check("truck at 20 mpg", gal(20), 500.0)
check("truck saving", gal(10) - gal(20), 500.0)
check("car at 25 mpg", gal(25), 400.0)
check("car at 50 mpg", gal(50), 200.0)
check("car saving", gal(25) - gal(50), 200.0)
check("car gains 25 mpg, truck gains 10", (50 - 25, 20 - 10), (25, 10))
check("truck saves 2.5x the car", (gal(10) - gal(20)) / (gal(25) - gal(50)), 2.5)
check("50 -> 100 saves only 100 more", gal(50) - gal(100), 100.0)
# per 100 miles (Soll's framing): 10 -> 5 gallons, 4 -> 2
check("per 100 miles truck", (100 / 10, 100 / 20), (10.0, 5.0))
check("per 100 miles car", (100 / 25, 100 / 50), (4.0, 2.0))
# litres per 100 km: 235.215 / mpg (US gallon)
l100 = lambda mpg: 235.215 / mpg
print("L/100km: 10 mpg %.1f, 20 mpg %.1f, 25 mpg %.1f, 50 mpg %.1f" % (l100(10), l100(20), l100(25), l100(50)))
check("L/100 km truck 23.5 -> 11.8", (round(l100(10), 1), round(l100(20), 1)), (23.5, 11.8))
check("L/100 km car 9.4 -> 4.7", (round(l100(25), 1), round(l100(50), 1)), (9.4, 4.7))
# 'every step up saves less than the one before': each +5 mpg step from 10 to 100 saves less
steps = [gal(m) - gal(m + 5) for m in range(10, 100, 5)]
check("each +5 mpg step saves less than the last", all(a > b for a, b in zip(steps, steps[1:])), True)
# simulate: random pairs of doubling upgrades a->2a vs b->2b with a<b: the lower one always saves more
random.seed(2)
trials = 100000
wins = 0
for _ in range(trials):
    a, b = sorted(random.uniform(5, 80) for _ in range(2))
    wins += (gal(a) - gal(2 * a)) > (gal(b) - gal(2 * b))
check("100,000 random doubling pairs: the lower-mpg one saves more every time", wins, trials)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
