"""Every number in the pepys-dice episode (Newton-Pepys problem, 1693), computed exactly and simulated.
Source: https://en.wikipedia.org/wiki/Newton%E2%80%93Pepys_problem"""
import json
import random
from fractions import Fraction
from math import comb
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def at_least(k, n):
    p = Fraction(1, 6)
    return sum(comb(n, i) * p**i * (1 - p)**(n - i) for i in range(k, n + 1))

A, B, C = at_least(1, 6), at_least(2, 12), at_least(3, 18)
print(f"A {float(A):.4f}  B {float(B):.4f}  C {float(C):.4f}")
check("A: one six from 6 dice 67%", round(100 * float(A)), 67)
check("B: two sixes from 12 dice 62%", round(100 * float(B)), 62)
check("C: three sixes from 18 dice 60%", round(100 * float(C)), 60)
check("all 6 dice miss: (5/6)^6 = 33%", round(100 * float(Fraction(5, 6)**6)), 33)
check("each die misses 5 times in 6", Fraction(5, 6), Fraction(5, 6))
check("18 dice: average sixes = 3", Fraction(18, 6), 3)
check("18 dice: 0, 1 or 2 sixes = 40%", round(100 * float(1 - C)), 40)
check("12 dice: 0 or 1 six = 38%", round(100 * float(1 - B)), 38)
check("18 dice: exactly 0 sixes 4%", round(100 * float(Fraction(5, 6)**18)), 4)
check("18 dice: exactly 1 six 14%", round(100 * float(18 * Fraction(1, 6) * Fraction(5, 6)**17)), 14)
check("18 dice: exactly 2 sixes 23%", round(100 * float(comb(18, 2) * Fraction(1, 6)**2 * Fraction(5, 6)**16)), 23)
check("Wikipedia A 0.6651", round(float(A), 4), 0.6651)
check("Wikipedia B 0.6187", round(float(B), 4), 0.6187)
check("Wikipedia C 0.5973", round(float(C), 4), 0.5973)
check("order A > B > C", A > B > C, True)
# trend toward one half (60 dice, 10 sixes)
check("ten sixes from 60 dice 55% (closer to a coin flip)", round(100 * float(at_least(10, 60))), 55)
check("A beats C by 7 points", round(100 * float(A)) - round(100 * float(C)), 7)

rng = random.Random(1693)
N = 200_000
def trial(k, n):
    return sum(rng.randrange(6) == 5 for _ in range(n)) >= k
sims = {}
for (k, n), exact in (((1, 6), A), ((2, 12), B), ((3, 18), C)):
    s = sum(trial(k, n) for _ in range(N)) / N
    sims[f"{k} of {n}"] = s
    print(f"sim {N:,}: at least {k} sixes from {n}: {s:.4f} (exact {float(exact):.4f})")
    check(f"sim {k} from {n} agrees (within 0.005)", abs(s - float(exact)) < 0.005, True)
results.update({f"sim {k}": f"{v:.4f}" for k, v in sims.items()})

print("ALL OK" if ok else "SOME CHECKS FAILED")
Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
raise SystemExit(0 if ok else 1)
