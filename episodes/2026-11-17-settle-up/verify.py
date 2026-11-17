"""Every number in the settle-up Short, computed or simulated."""
import itertools, random

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

people = ["You", "Ana", "Tom", "Max", "Zoe"]
paid = {"You": 400, "Ana": 150, "Tom": 200, "Max": 50, "Zoe": 0}   # hotel, car, dinners, fuel
total = sum(paid.values())
share = total / len(people)
check("trip total", total, 800)
check("share each", share, 160)

# IOUs: everyone who didn't pay an expense owes its payer their fifth
ious = [(p, q, paid[q] / 5) for q in people if paid[q] for p in people if p != q]
check("IOUs (one per person per expense they didn't pay)", len(ious), 16)

net = {p: paid[p] - share for p in people}
check("net You", net["You"], 240); check("net Ana", net["Ana"], -10)
check("net Tom", net["Tom"], 40); check("net Max", net["Max"], -110); check("net Zoe", net["Zoe"], -160)
check("nets sum to zero", sum(net.values()), 0)

def greedy(net):
    n = {k: v for k, v in net.items() if abs(v) > 1e-9}
    pays = []
    while n:
        d = min(n, key=n.get); c = max(n, key=n.get)
        amt = min(-n[d], n[c]); pays.append((d, c, amt))
        n[d] += amt; n[c] -= amt
        n = {k: v for k, v in n.items() if abs(v) > 1e-9}
    return pays
pays = greedy(net)
print("greedy payments:", pays)
check("payments", len(pays), 4)
check("Zoe pays You", ("Zoe", "You", 160) in pays, True)
check("Max pays You 80", ("Max", "You", 80) in pays, True)
check("Max pays Tom 30", ("Max", "Tom", 30) in pays, True)
check("Ana pays Tom 10", ("Ana", "Tom", 10) in pays, True)

# Minimum = n - (max number of disjoint zero-sum groups). Any proper subset summing to zero?
zero_subsets = [s for r in range(1, 5) for s in itertools.combinations(people, r) if abs(sum(net[p] for p in s)) < 1e-9]
check("no smaller group balances on its own -> 4 is the minimum", zero_subsets, [])

# Each greedy payment zeroes at least one person, so never more than n-1. Simulate random trips.
random.seed(1)
worst = 0
for _ in range(100_000):
    n = random.randint(2, 10)
    v = [random.randint(-500, 500) for _ in range(n - 1)]; v.append(-sum(v))
    worst = max(worst, len(greedy(dict(enumerate(v)))) - (n - 1))
check("100,000 random trips: greedy never needs more than n-1", worst <= 0, True)

# CTA: You +50, Ana -20, Tom -30 -> 2 payments
check("CTA answer", len(greedy({"You": 50, "Ana": -20, "Tom": -30})), 2)
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
