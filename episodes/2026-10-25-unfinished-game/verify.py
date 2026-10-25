"""Every number in the unfinished-game how-to episode (problem of points, Pascal and Fermat 1654), computed and simulated."""
import json
import random
from fractions import Fraction as Fr
from functools import lru_cache
from itertools import product
from math import comb

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

POT, TARGET = 64, 3   # 32 pistoles each, first to 3 rounds (Pascal's letter, 29 July 1654)

@lru_cache(None)
def share(r, s):
    """Pascal's way: your fair share of the pot when you need r more rounds and they need s (fair rounds)."""
    if r == 0:
        return Fr(POT)
    if s == 0:
        return Fr(0)
    return (share(r - 1, s) + share(r, s - 1)) / 2

def fermat(r, s):
    """Fermat's way: play out all r+s-1 remaining rounds, count the endings you win."""
    n = r + s - 1
    wins = sum(1 for seq in product("WL", repeat=n) if seq.count("W") >= r)
    return wins, 2 ** n

# Hook / rule out: the score split (Pacioli 1494: by rounds won) vs the fair split
check("score split 2 to 1: your share", Fr(POT * 2, 3), Fr(128, 3))   # 42.67
check("score split rounded", round(POT * 2 / 3), 43)
check("Pacioli 1494 -> Pascal 1654: years", 1654 - 1494, 160)
check("pot 64 = 32 each", POT // 2, 32)

# Steps: count what's still needed at 2 to 1, first to 3
r, s = TARGET - 2, TARGET - 1
check("you need", r, 1)
check("they need", s, 2)
check("win the next round: you take", share(r - 1, s), 64)
check("lose it: 2 to 2, you take", share(r, s - 1), 32)
check("sure of 32 either way", min(share(r - 1, s), share(r, s - 1)), 32)
check("the other 32 in doubt, half is yours", (share(r - 1, s) - share(r, s - 1)) / 2, 16)
check("your share", share(r, s), 48)
check("their share", POT - share(r, s), 16)
check("ratio 3 to 1", share(r, s) / (POT - share(r, s)), 3)

# Payoff: Fermat's count, 2 more imagined rounds, 4 endings, you win 3
w, n = fermat(r, s)
check("Fermat: endings", n, 4)
check("Fermat: endings you win", w, 3)
check("Fermat agrees with Pascal", Fr(w, n) * POT, share(r, s))

# CTA: you lead 1 to 0 -> you need 2, they need 3: share 44 of 64 (11/16)
check("CTA 1-0: Pascal", share(2, 3), 44)
check("CTA 1-0: Fermat", fermat(2, 3), (11, 16))
check("closed form", Fr(sum(comb(4, k) for k in range(2, 5)), 16) * POT, 44)

# Simulate: finish the interrupted game with fair coin rounds, 200,000 times each
random.seed(1654)
def sim(a, b, trials=200_000):
    won = 0
    for _ in range(trials):
        x, y = a, b
        while x < TARGET and y < TARGET:
            if random.random() < 0.5: x += 1
            else: y += 1
        won += x == TARGET
    return won / trials
p21 = sim(2, 1); p10 = sim(1, 0)
print(f"sim 2-1: you win {p21:.4f} -> {p21*POT:.2f} coins (want 0.75 / 48)")
print(f"sim 1-0: you win {p10:.4f} -> {p10*POT:.2f} coins (want 0.6875 / 44)")
check("sim 2-1 within 0.005 of 3/4", abs(p21 - 0.75) < 0.005, True)
check("sim 1-0 within 0.005 of 11/16", abs(p10 - 0.6875) < 0.005, True)
results["sim_2_1"] = p21; results["sim_1_0"] = p10

json.dump(results, open(__file__.replace("verify.py", "results.json"), "w"), indent=1)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
