"""Every number in the taxi-split how-to episode (Shapley value / airport game, Littlechild & Owen 1973), computed and simulated."""
import random
from fractions import Fraction as Fr
from itertools import permutations

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# The meter reading at each stop (euros). A shared cab's cost for any group = the meter at its farthest stop.
METER = {"you": 6, "Ben": 18, "Mia": 30}
def cost(group):
    return max((METER[p] for p in group), default=0)

# Hook: split evenly, your 6 euro ride costs 10
check("even split, 30 / 3", Fr(cost(METER), 3), 10)
check("your ride alone", cost(["you"]), 6)
# Rule out: paying the meter at your stop = the full first stretch, ridden by all three
check("meter at your stop", METER["you"], 6)

# Steps: split each stretch only among those still in the car
stops = sorted(METER.items(), key=lambda kv: kv[1])
share = {p: Fr(0) for p in METER}
prev = 0
stretches = []
for i, (p, m) in enumerate(stops):
    riders = [q for q, _ in stops[i:]]
    stretches.append((m - prev, len(riders)))
    for q in riders:
        share[q] += Fr(m - prev, len(riders))
    prev = m
check("stretch 1: 6 euros, 3 riders", stretches[0], (6, 3))
check("stretch 2: 12 euros, 2 riders", stretches[1], (12, 2))
check("stretch 3: 12 euros, Mia alone", stretches[2], (12, 1))
check("2 each on stretch 1", Fr(6, 3), 2)
check("6 each on stretch 2", Fr(12, 2), 6)
check("you pay 2", share["you"], 2)
check("Ben pays 8", share["Ben"], 8)
check("Mia pays 20", share["Mia"], 20)
check("shares add to the fare", sum(share.values()), 30)

# Proof: every order the three could join the ride (6), each pays the extra driving they add, averaged = Shapley value
orders = list(permutations(METER))
check("number of orders", len(orders), 6)
shap = {p: Fr(0) for p in METER}
for o in orders:
    for i, p in enumerate(o):
        shap[p] += Fr(cost(o[:i + 1]) - cost(o[:i]), len(orders))
check("Shapley = stretch rule", shap == share, True)
print("    Shapley:", {k: str(v) for k, v in shap.items()})

# Everyone pays less than alone; nobody pays less than... (core check: no group pays more than it would alone)
from itertools import combinations
core = all(sum(share[p] for p in g) <= cost(g) for r in (1, 2, 3) for g in combinations(METER, r))
check("no person or pair pays more than riding without the others", core, True)

# Simulation: random join orders (Monte Carlo estimate of the Shapley value)
random.seed(24)
T = 200_000
acc = {p: 0 for p in METER}
names = list(METER)
for _ in range(T):
    random.shuffle(names)
    seen = 0
    for p in names:
        m = max(seen, METER[p])
        acc[p] += m - seen
        seen = m
est = {p: acc[p] / T for p in METER}
print(f"    simulated {T:,} random orders:", {p: round(v, 3) for p, v in est.items()})
check("simulation you ~2", abs(est["you"] - 2) < 0.05, True)
check("simulation Ben ~8", abs(est["Ben"] - 8) < 0.05, True)
check("simulation Mia ~20", abs(est["Mia"] - 20) < 0.05, True)

# CTA: four riders, meter 12, 24, 36, 48: the last one pays 12/4 + 12/3 + 12/2 + 12 = 25
m4 = [12, 24, 36, 48]
pays, prev = [Fr(0)] * 4, 0
for i, m in enumerate(m4):
    for j in range(i, 4):
        pays[j] += Fr(m - prev, 4 - i)
    prev = m
print("    CTA shares:", [str(x) for x in pays])
check("CTA: last one out pays 25", pays[3], 25)
check("CTA shares add to 48", sum(pays), 48)

print("ALL OK" if ok else "SOMETHING FAILED")
raise SystemExit(0 if ok else 1)
