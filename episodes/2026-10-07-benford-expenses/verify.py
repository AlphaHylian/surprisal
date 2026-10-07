"""Every number in the Benford's-law expenses how-to episode, computed exactly and simulated."""
import math, random

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

benford = {d: math.log10(1 + 1 / d) for d in range(1, 10)}
for d in range(1, 10):
    print(f"   Benford P(first digit {d}) = {benford[d]:.4f}")
check("first digit 1: about 30%", round(100 * benford[1]), 30)
check("first digit 9: about 5%", round(100 * benford[9]), 5)
check("first digit 4: under 10%", benford[4] < 0.10, True)
check("CTA answer: first digit 2 ~ 18%", round(100 * benford[2]), 18)
check("$1,280 -> first digit 1", int(str(1280)[0]), 1)

# Why: from 100 to 200 is doubling; from 900 to 1,000 is 11% more
check("100 -> 200 is x2", 200 / 100, 2.0)
check("900 -> 1,000 is 11% more", round(100 * (1000 / 900 - 1)), 11)

def first(x): return int(f"{x:e}"[0])

# Honest books, simulated two ways: amounts from $10 to $10,000 growing by percent (log-uniform),
# and a lognormal spread. 200,000 amounts each.
random.seed(7)
N = 200_000
lu = [10 ** random.uniform(1, 4) for _ in range(N)]
ln = [math.exp(random.gauss(math.log(400), 1.6)) for _ in range(N)]
for name, xs in (("log-uniform $10-$10,000", lu), ("lognormal", ln)):
    c = [0] * 10
    for x in xs: c[first(x)] += 1
    print(f"   sim {name}: 1s {c[1]/N:.4f}, 4s {c[4]/N:.4f}, 9s {c[9]/N:.4f}")
    check(f"sim {name}: about 30% start with 1", round(100 * c[1] / N), 30)
    check(f"sim {name}: about 5% start with 9", round(100 * c[9] / N), 5)

# Heights (narrow range) do NOT follow it: the caveat in the script ("tens to thousands")
hs = [random.gauss(170, 10) for _ in range(N)]
check("heights in cm: almost all start with 1 (not Benford)", sum(first(h) == 1 for h in hs) / N > 0.9, True)

# The clerk: approval limit $5,000. 200 claims: 150 honest + 50 faked just under the limit
LIMIT, HONEST, FAKE = 5000, 150, 50
exp_share_4 = (HONEST * benford[4] + FAKE) / (HONEST + FAKE)
print("   clerk expected share starting with 4:", exp_share_4)
check("clerk: almost a third start with 4", round(100 * exp_share_4), 32)
# simulate 100,000 clerks: honest claims log-uniform $10-$10,000 (but under the limit they need no approval either way),
# fakes uniform $4,800-$4,999
shares = []
for _ in range(100_000 // 10):
    claims = [10 ** random.uniform(1, 4) for _ in range(HONEST)] + [random.uniform(4800, 4999) for _ in range(FAKE)]
    shares.append(sum(first(x) == 4 for x in claims) / len(claims))
m = sum(shares) / len(shares)
print(f"   sim clerk share of 4s (10,000 clerks): {m:.4f}")
check("sim clerk: ~32% fours", round(100 * m), 32)
for amt in (4850, 4920, 4975):
    check(f"{amt} just under the limit", 4800 <= amt < LIMIT, True)
check("10,000 expenses minus the 50 you open", 10_000 - 50, 9_950)
# How unlikely is ~32% fours from an honest clerk? binomial tail P(X >= 64 | n=200, p=0.0969)
n, p, k = 200, benford[4], round(exp_share_4 * 200)
tail = sum(math.comb(n, i) * p**i * (1 - p)**(n - i) for i in range(k, n + 1))
print(f"   P(honest clerk has >= {k} fours out of 200) = {tail:.2e}")
check("an honest clerk almost never looks like this", tail < 1e-15, True)

print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
