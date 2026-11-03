"""Every number in the tennis-points episode (win 54% of points -> 86% of matches), computed and simulated.
Model: every point won independently with the same chance p (standard tennis scoring: games to 4 win by 2,
sets to 6 win by 2 with a 7-point tiebreak at 6-6, best of three sets).
Source for Federer's numbers: Dartmouth 2024 commencement address,
https://home.dartmouth.edu/news/2024/06/2024-commencement-address-roger-federer"""
import json
import random
from functools import lru_cache
from math import comb, log
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def game(p):
    q = 1 - p
    return p**4 * (1 + 4*q + 10*q*q) + 20 * p**3 * q**3 * p*p / (p*p + q*q)

def tiebreak(p):
    @lru_cache(None)
    def f(a, b):
        if a >= 7 and a - b >= 2: return 1.0
        if b >= 7 and b - a >= 2: return 0.0
        if a == b and a >= 6: return p*p / (p*p + (1-p)**2)
        return p*f(a+1, b) + (1-p)*f(a, b+1)
    return f(0, 0)

def set_(p):
    g, t = game(p), tiebreak(p)
    @lru_cache(None)
    def f(a, b):
        if a == 6 and b <= 4: return 1.0
        if b == 6 and a <= 4: return 0.0
        if a == 7: return 1.0
        if b == 7: return 0.0
        if a == 6 and b == 6: return t
        return g*f(a+1, b) + (1-g)*f(a, b+1)
    return f(0, 0)

def best_of(s, n):
    return sum(comb(n, i) * s**i * (1-s)**(n-i) for i in range(n//2 + 1, n + 1))

p = 0.54
g, s = game(p), set_(p)
m = best_of(s, 3)
check("point 54%", round(100*p), 54)
check("game 60%", round(100*g), 60)
check("set 76%", round(100*s), 76)
check("match (best of 3) 86%", round(100*m), 86)
check("lose a point 46%", round(100*(1-p)), 46)
check("lose a game 40%", round(100*(1-g)), 40)
check("lose a set 24%", round(100*(1-s)), 24)
check("lose a match 14%", round(100*(1-m)), 14)
check("game: 4 points, win by 2 (min points)", 4, 4)
check("CTA: 51% of points -> 61% of matches", round(100*best_of(set_(0.51), 3)), 61)
check("Federer matches 1,526 (quoted)", 1526, 1526)

# Monte Carlo of whole matches, point by point
rng = random.Random(11)
def sim_game():
    a = b = 0
    while True:
        if rng.random() < p: a += 1
        else: b += 1
        if a >= 4 and a - b >= 2: return 1
        if b >= 4 and b - a >= 2: return 0
def sim_tb():
    a = b = 0
    while True:
        if rng.random() < p: a += 1
        else: b += 1
        if a >= 7 and a - b >= 2: return 1
        if b >= 7 and b - a >= 2: return 0
def sim_set():
    a = b = 0
    while True:
        if a == 6 and b == 6: return sim_tb()
        if sim_game(): a += 1
        else: b += 1
        if (a == 6 and b <= 4) or a == 7: return 1
        if (b == 6 and a <= 4) or b == 7: return 0
def sim_match():
    a = b = 0
    while a < 2 and b < 2:
        if sim_set(): a += 1
        else: b += 1
    return a == 2
N = 100_000
gw = sum(sim_game() for _ in range(N)) / N
mw = sum(sim_match() for _ in range(N)) / N
print(f"sim {N:,} games: {gw:.4f} (exact {g:.4f}); {N:,} matches: {mw:.4f} (exact {m:.4f})")
check("simulated games agree (within 0.005)", abs(gw - g) < 0.005, True)
check("simulated matches agree (within 0.005)", abs(mw - m) < 0.005, True)
results["sim_game"], results["sim_match"] = f"{gw:.4f}", f"{mw:.4f}"

print("ALL OK" if ok else "SOME CHECKS FAILED")
Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
raise SystemExit(0 if ok else 1)
