"""Every number in the lane-switch Short (the next lane only looks faster).
Model: two lanes of stop-and-go traffic, alternating 1-mile stretches at 20 mph and 40 mph, the two lanes
out of step (where yours is slow, the next is fast). Same flow in both lanes (cars per hour), so density =
flow / speed. Source for the effect: Redelmeier & Tibshirani, Nature 401, 35 (1999), as reported at
https://sciencedaily.com/releases/1999/08/990830184718.htm and https://magazine.utoronto.ca/leading-edge/perceptions-of-speed-study/"""
import random

ok = True
def check(name, got, want, tol=1e-9):
    global ok
    good = abs(got - want) <= tol
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got:.4g} (script: {want})")

SLOW, FAST, MILE = 20.0, 40.0, 1.0      # mph, mph, miles per stretch
FLOW = 1200.0                           # cars per hour per lane (same in both lanes)
t_slow = MILE / SLOW * 60               # minutes
t_fast = MILE / FAST * 60
check("slow mile takes 3 minutes", t_slow, 3)
check("fast mile takes 90 seconds", t_fast * 60, 90)
check("share of your time in your slow stretch (next lane faster): 2/3", t_slow / (t_slow + t_fast), 2 / 3)
avg = 2 * MILE / ((t_slow + t_fast) / 60)
check("average speed, both lanes: 26.7 mph", round(avg, 1), 26.7)
check("density when slow: 60 cars a mile", FLOW / SLOW, 60)
check("density when fast: 30 cars a mile", FLOW / FAST, 30)
# while you crawl 3 min at 20, the next lane beside you goes 40: relative 20 mph for 3 min = 1 mile of their
# (fast, spread out) traffic slides past you
passed_you = (FAST - SLOW) * t_slow / 60 * (FLOW / FAST)
# while you go 40 for 90 s, the next lane beside you crawls at 20 (packed)
you_pass = (FAST - SLOW) * t_fast / 60 * (FLOW / SLOW)
check("cars that pass you in your slow 3 minutes: 30", passed_you, 30)
check("cars you pass in your fast 90 seconds: 30", you_pass, 30)
# CTA: slow stretch at 10 mph -> 6 minutes slow vs 1.5 fast -> 80% of the time the next lane is faster
t10 = MILE / 10 * 60
check("CTA: at 10 mph the next lane looks faster 80% of the time", t10 / (t10 + t_fast), 0.8)

# Simulation: 100,000 drivers, random start points; a road of 20 alternating stretches; lane B shifted 1 mile.
# 5,000 drivers each drive 4 miles; count time in which the next lane at your position is faster, and net cars
# passed (cars that overtake you minus cars you overtake) using density x relative speed.
random.seed(7)
def speed(lane, x):
    stretch = int(x // MILE) + (1 if lane == 1 else 0)
    return SLOW if stretch % 2 == 0 else FAST
frac_sum, net_sum, trials, dt = 0.0, 0.0, 5_000, 1 / 3600 / 4   # quarter-second steps (hours)
for _ in range(trials):
    lane = random.randint(0, 1)
    x = random.uniform(0, 2 * MILE)
    start = x
    behind_time = total = 0.0
    net = 0.0
    while x - start < 4 * MILE:
        v = speed(lane, x)
        vn = speed(1 - lane, x)
        if vn > v: behind_time += dt
        net += (vn - v) * dt * FLOW / vn
        total += dt
        x += v * dt
    frac_sum += behind_time / total
    net_sum += net
check("simulated drivers: share of time next lane is faster ~2/3", frac_sum / trials, 2 / 3, 0.01)
check("simulated drivers: net cars passed over 4 miles ~0", net_sum / trials, 0, 1.5)

# Monte Carlo glances: 100,000 random moments in a driver's trip; how often does the next lane look faster?
hits = 0
for _ in range(100_000):
    t = random.uniform(0, t_slow + t_fast)
    hits += t < t_slow
check("100,000 random glances: next lane faster ~66.7%", hits / 100_000, 2 / 3, 0.005)

print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
