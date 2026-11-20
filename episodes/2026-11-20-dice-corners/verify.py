"""Every number in the dice-corners Short, computed and simulated."""
import itertools, random
from collections import Counter

ok = True
def check(name, good, detail=""):
    global ok
    ok &= bool(good)
    print(f"{'OK ' if good else 'BAD'} {name} {detail}")

ways = Counter(a + b for a, b in itertools.product(range(1, 7), repeat=2))
check("two dice: 36 combinations", sum(ways.values()) == 36)
check("12 has 1 way, 2 has 1 way", ways[12] == 1 and ways[2] == 1)
pairs8 = [(a, b) for a, b in itertools.product(range(1, 7), repeat=2) if a + b == 8]
check("8 has 5 ways: 2-6 3-5 4-4 5-3 6-2", pairs8 == [(2, 6), (3, 5), (4, 4), (5, 3), (6, 2)], str(pairs8))
check("6 has 5 ways too", ways[6] == 5)
check("6+8 pay 10 times per 36 rolls, 2+12 twice: 5x", ways[6] + ways[8] == 10 and ways[2] + ways[12] == 2)
check("7 has 6 ways = 1 roll in 6, the most common", ways[7] == 6 and max(ways.values()) == 6)
# dots under each number = number of ways (standard 1..5 dot marking: 2/12 one dot, 6/8 five dots)
dots = {n: 6 - abs(7 - n) for n in range(2, 13) if n != 7}
check("dots = ways for every number", all(dots[n] == ways[n] for n in dots))
c1 = ways[6] + ways[8] + ways[5]; c2 = ways[2] + ways[12] + ways[3]
check("corner 6-8-5: 14 per 36 rolls; corner 2-12-3: 4", c1 == 14 and c2 == 4, f"{c1} vs {c2}")
cta = ways[4] + ways[9] + ways[10]
check("CTA corner 4-9-10: 10 dots", cta == 10, f"{cta}")

# simulation: 1,000,000 rolls
random.seed(7); N = 1_000_000
rolls = Counter(random.randint(1, 6) + random.randint(1, 6) for _ in range(N))
r68 = (rolls[6] + rolls[8]) / (rolls[2] + rolls[12])
check("sim: 6+8 come up ~5x as often as 2+12", 4.8 < r68 < 5.2, f"{r68:.2f}")
check("sim: 7 about 1 in 6", abs(rolls[7] / N - 1 / 6) < 0.002, f"{rolls[7]/N:.4f}")
p1 = sum(rolls[n] for n in (6, 8, 5)) / N * 36; p2 = sum(rolls[n] for n in (2, 12, 3)) / N * 36
check("sim: corners pay ~14 and ~4 per 36 rolls", abs(p1 - 14) < 0.1 and abs(p2 - 4) < 0.1, f"{p1:.2f} vs {p2:.2f}")
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
