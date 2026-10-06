"""Every number in the Secret Santa (derangements) how-to episode, computed exactly and simulated."""
import math, random
from fractions import Fraction

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def derangements(n):
    d = [1, 0]
    for k in range(2, n + 1):
        d.append((k - 1) * (d[-1] + d[-2]))
    return d[n]

def p_clean(n): return Fraction(derangements(n), math.factorial(n))

# 10 names: chance someone draws their own
p10 = p_clean(10)
print("   P(clean, 10) =", float(p10))
check("10 names: at least one own name, %", round(100 * (1 - float(p10))), 63)
check("10 names: clean draws, %", round(100 * float(p10)), 37)
check("each person: own name 1 in 10", Fraction(1, 10), Fraction(1, 10))
for n in (100, 1000):
    pn = float(p_clean(n)) if n <= 170 else 1 / math.e  # factorial float overflow guard
    if n > 170:
        # exact via the series sum_{k=0}^n (-1)^k/k!
        pn = float(sum(Fraction((-1) ** k, math.factorial(k)) for k in range(n + 1)))
    check(f"{n} names: at least one own name, %", round(100 * (1 - pn)), 63)

# Redraw until clean: expected rounds = 1/p
rounds = 1 / float(p10)
print("   expected rounds:", rounds)
check("about 3 rounds ('almost 3')", 2.5 < rounds < 3, True)

# Among clean draws, chance of at least one mutual pair (2-cycle): count derangements of 10 with no 2-cycle
def count_no_1_or_2_cycles(n):
    # a(n) = (n-1)*a(n-1) + (n-1)(n-2)*a(n-3)   (permutations with all cycles >= 3), a(0)=1,a(1)=a(2)=0
    a = [1, 0, 0]
    for k in range(3, n + 1):
        a.append((k - 1) * a[k - 1] + (k - 1) * (k - 2) * a[k - 3])
    return a[n]
p_pair = 1 - Fraction(count_no_1_or_2_cycles(10), derangements(10))
print("   P(mutual pair | clean draw, 10) =", float(p_pair))
check("about 2 in 5 clean draws have a mutual pair", round(float(p_pair) * 5), 2)

# Simulation, 200,000 hats of 10 names
random.seed(3)
N = 200_000; own = clean = paired = 0
for _ in range(N):
    p = list(range(10)); random.shuffle(p)
    if any(p[i] == i for i in range(10)):
        own += 1
    else:
        clean += 1
        if any(p[p[i]] == i for i in range(10)):
            paired += 1
print(f"   sim: own name {own/N:.4f}, pair among clean {paired/clean:.4f}")
check("sim: own name ~63%", round(100 * own / N), 63)
check("sim: pair ~2 in 5", round(5 * paired / clean), 2)

# The circle: shuffle into a cycle, each gives to the next
for _ in range(100_000):
    order = list(range(10)); random.shuffle(order)
    give = {order[i]: order[(i + 1) % 10] for i in range(10)}
    assert all(give[x] != x for x in give)
    assert all(give[give[x]] != x for x in give)  # no mutual pair with 10 people
check("circle: never own name, never a mutual pair (100,000 shuffles)", True, True)

# CTA: number of different circles with 6 people (direction matters): (6-1)!
check("circles for 6 people", math.factorial(5), 120)
# brute-force the CTA
import itertools
cycles = set()
for perm in itertools.permutations(range(6)):
    give = tuple(perm[(perm.index(i) + 1) % 6] for i in range(6))
    cycles.add(give)
check("circles for 6 people (brute force)", len(cycles), 120)

print("ALL OK" if ok else "SOMETHING FAILED")
raise SystemExit(0 if ok else 1)
