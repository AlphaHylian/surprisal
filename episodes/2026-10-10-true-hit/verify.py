"""Every number in the 'true hit' Short (two dice averaged), computed and simulated."""
import random

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def true_hit(shown):
    """2RN: two numbers 0-99, hit if their average is under the shown rate."""
    hits = sum(1 for a in range(100) for b in range(100) if (a + b) / 2 < shown)
    return hits / 100  # percent

# Honest dice: 90% shot misses 1 in 10; twice in a row 1 in 100
check("double miss at honest 90% (1 in)", round(1 / (0.1 * 0.1)), 100)

# Chance a player sees at least one double miss in n honest 90% shots
def p_double_miss(n, q=0.1):
    # state: last shot missed or not
    a, b = 1.0, 0.0   # prob no double miss yet, last hit / last miss
    for _ in range(n):
        a, b = (a + b) * (1 - q), a * q
    return 1 - (a + b)
for n in (50, 100, 200):
    print(f"P(at least one double miss in {n} shots) = {p_double_miss(n):.3f}")
check("players in 10 who see a double miss in 100 shots", round(p_double_miss(100) * 10), 6)
random.seed(1)
G = 100_000
seen = 0
for _ in range(G):
    prev = False
    for _ in range(100):
        m = random.random() < 0.1
        if m and prev:
            seen += 1
            break
        prev = m
print(f"sim: {seen / G:.3f} of 100-shot games have a double miss (exact {p_double_miss(100):.3f})")
ok &= abs(seen / G - p_double_miss(100)) < 0.01

# Fire Emblem 2RN table (https://fireemblemwiki.org/wiki/True_hit)
check("shown 90 -> true (%)", true_hit(90), 98.1)
check("shown 80 -> true (%)", true_hit(80), 92.2)
check("shown 50 -> true (%)", true_hit(50), 50.5)
check("shown 10 -> true (%)", true_hit(10), 2.1)
miss90 = 1 - true_hit(90) / 100
check("misses per 100 at shown 90", round(miss90 * 100, 1), 1.9)
check("double miss at true 90 (1 in)", round(1 / miss90**2, -1), 2770)

# Simulation, 1,000,000 shots each
random.seed(10)
N = 1_000_000
for shown, want in ((90, 98.1), (10, 2.1), (80, 92.2)):
    h = sum(1 for _ in range(N) if (random.randrange(100) + random.randrange(100)) / 2 < shown)
    print(f"sim shown {shown}: {h / N * 100:.2f}% (exact {want})")
    ok &= abs(h / N * 100 - want) < 0.15

# On-screen example: one roll of 95 misses a 90 shot; 95 and 71 average 83, a hit
check("single 95 misses", 95 < 90, False)
check("average of 95 and 71", (95 + 71) / 2, 83)
check("80% shown -> CTA answer (%)", round(true_hit(80)), 92)
# Binding Blade (first 2RN game): Japan, 29 March 2002
check("years since 2002 (as of 2026)", 2026 - 2002, 24)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
