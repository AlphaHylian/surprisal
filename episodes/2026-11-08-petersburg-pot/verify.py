"""Every number in the petersburg-pot episode (St. Petersburg paradox, Nicolaus Bernoulli 1713).
Source: https://en.wikipedia.org/wiki/St._Petersburg_paradox (rules: pot starts at $2, doubles on
every tails, first heads ends the game and pays the pot; finite-bank table; Hacking's $25)."""
import json
from fractions import Fraction
from math import floor, log2
from pathlib import Path
import numpy as np

ok = True
results = {}
def check(name, got, want):
    global ok
    good = bool(got == want)
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# game ends on flip k (k-1 tails then heads) with chance 1/2^k and pays 2^k
pay = lambda k: 2 ** k
p = lambda k: Fraction(1, 2 ** k)
check("half the time you win $2", (p(1), pay(1)), (Fraction(1, 2), 2))
check("a quarter of the time $4", (p(2), pay(2)), (Fraction(1, 4), 4))
check("every round adds $1 to the average", all(p(k) * pay(k) == 1 for k in range(1, 200)), True)
check("first N rounds give $N (N=100)", sum(p(k) * pay(k) for k in range(1, 101)), 100)
check("1 game in 32 pays more than $32", sum(p(k) for k in range(6, 400)) + Fraction(1, 2 ** 399) == Fraction(1, 32), True)
check("round 30 pot passes a billion", (pay(29) < 10 ** 9 < pay(30), f"{pay(30):,}"), (True, "1,073,741,824"))

def capped(W):
    """average payout when the bank can pay at most W (a pot bigger than W pays W)"""
    L = floor(log2(W))
    return L + W / 2 ** L   # rounds 1..L pay in full ($1 each), the rest pays W with chance 1/2^L
check("billionaire bank ($1,075,000,000, Wikipedia's row): $30", round(sum(1 for k in range(1, 100) if pay(k) <= 1.075e9)), 30)
check("bank of exactly $1 billion: about $30 (30.86)", f"{capped(1e9):.2f}", "30.86")
check("world economy 2020 ($83.8 trillion): under $50 (47.19 with the capped tail)", (f"{capped(83.8e12):.2f}", capped(83.8e12) < 50), ("47.19", True))
check("world economy: 46 full rounds", floor(log2(83.8e12)), 46)
check("CTA millionaire ($1,050,000, Wikipedia's row): 20 full rounds = $20", floor(log2(1.05e6)), 20)
check("CTA bank of exactly $1 million: about $21 (20.91 with the capped tail)", f"{capped(1e6):.2f}", "20.91")

# simulate 1,000,000 games
g = np.random.default_rng(1713)
N = 1_000_000
k = g.geometric(0.5, N)            # flip on which the first heads lands
pot = 2.0 ** k
r2 = (pot == 2).mean(); big = (pot > 32).mean()
print(f"simulated {N:,} games: pays $2 {r2:.3%}, pays >$32 {big:.3%} (1/32 = {1/32:.3%}), median ${np.median(pot):.0f}, "
      f"mean ${pot.mean():.1f}, mean capped at $1bn ${np.minimum(pot, 1e9).mean():.2f}")
results.update(sim_pays2=f"{r2:.4f}", sim_over32=f"{big:.4f}", sim_capped_mean=f"{np.minimum(pot, 1e9).mean():.2f}")
check("simulation: half the games pay $2", abs(r2 - 0.5) < 0.003, True)
check("simulation: 1 in 32 pays more than $32", abs(big - 1 / 32) < 0.001, True)
check("exact sum, bank $1 billion: rounds 1-29 pay in full, the rest pays the bank", f"{sum(min(pay(k), 1e9) / 2 ** k for k in range(1, 200)):.2f}", "30.86")

print("ALL OK" if ok else "SOME CHECKS FAILED")
Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
raise SystemExit(0 if ok else 1)
