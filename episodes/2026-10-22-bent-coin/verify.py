"""Every number in the bent-coin how-to episode (von Neumann's trick), computed and simulated."""
import random

ok = True
def check(name, got, want, tol=1e-9):
    global ok
    good = abs(got - want) <= tol if isinstance(want, float) else got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

P = 0.7                      # the bent coin lands heads 70% of the time
Q = 1 - P

# setup: a friend calling tails on one flip loses 7 times in 10
check("tails caller loses (single flip)", round(P, 9), 0.7)

# why: HT and TH have the same chance
ht, th = P * Q, Q * P
check("heads then tails", round(ht, 9), 0.21)
check("tails then heads", round(th, 9), 0.21)
check("HH", round(P * P, 9), 0.49)
check("TT", round(Q * Q, 9), 0.09)

# cost: share of pairs that count, flips per answer
useful = 2 * P * Q
check("share of pairs that count", round(useful, 9), 0.42)
flips = 2 / useful                       # = 1 / (p q), Wikipedia's E(F)
check("expected flips per answer (about 5)", round(flips), 5)
print(f"    exact: {flips:.3f} flips, {1/useful:.3f} pairs")

# CTA: a 90% coin
p9 = 0.9
f9 = 1 / (p9 * (1 - p9))
check("CTA: flips per answer at 90% heads (about 11)", round(f9), 11)
print(f"    exact: {f9:.3f}")

# Simulation, 200,000 answers each: the 70% coin, the 90% coin, and an unknown random bias
def von_neumann(rng, p):
    n = 0
    while True:
        a, b = rng.random() < p, rng.random() < p
        n += 2
        if a != b:
            return a, n

rng = random.Random(22)
for p, label in [(0.7, "70%"), (0.9, "90%")]:
    N = 200_000
    heads = flips_total = 0
    for _ in range(N):
        h, n = von_neumann(rng, p)
        heads += h
        flips_total += n
    print(f"    sim {label}: heads share {heads/N:.4f}, flips per answer {flips_total/N:.3f}")
    check(f"sim {label} fair within 0.005", abs(heads / N - 0.5) < 0.005, True)
    check(f"sim {label} flips match 1/(pq) within 2%", abs(flips_total / N - 1 / (p * (1 - p))) / (1 / (p * (1 - p))) < 0.02, True)

# unknown bias: a different random bias each time, still fair
N = 200_000
heads = 0
for _ in range(N):
    p = rng.uniform(0.05, 0.95)
    heads += von_neumann(rng, p)[0]
print(f"    sim random bias: heads share {heads/N:.4f}")
check("sim unknown bias fair within 0.005", abs(heads / N - 0.5) < 0.005, True)

print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
