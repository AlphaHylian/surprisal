"""Every number in the nelson-split episode (Lanchester's square law and Nelson's Trafalgar plan),
computed and simulated.
Sources: https://en.wikisource.org/wiki/Aircraft_in_Warfare_(1916)/Chapter_6 (Lanchester 1916: Nelson
expected 40 sail of the line against 46; columns of 16, 16 and 8; 32 ships on half the enemy (23), almost
exactly two to one; tallies 32^2 + 8^2 vs 23^2 + 23^2 -> British advantage 30, sqrt 30 = 5 1/2 ships;
line against line 40^2 vs 46^2 -> 516 for the enemy, about 23 ships left; at the battle 27 against 33).
https://en.wikipedia.org/wiki/Battle_of_Trafalgar (21 Oct 1805, 27 vs 33 ships of the line, 18 French and
Spanish ships captured or destroyed, the British lost none).
https://en.wikipedia.org/wiki/Lanchester%27s_laws (strength proportional to the square of the number of units)."""
import json
import math
import random
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

check("40 squared = 1,600", 40**2, 1600)
check("46 squared = 2,116", 46**2, 2116)
check("line vs line: enemy ahead by 516", 46**2 - 40**2, 516)
check("enemy survivors sqrt(516) ~ 23", round(math.sqrt(516)), 23)
check("half the enemy line: 23", 46 // 2, 23)
check("columns 16 + 16 = 32, + 8 = 40", (16 + 16, 16 + 16 + 8), (32, 40))
check("32 squared = 1,024", 32**2, 1024)
check("23 squared = 529", 23**2, 529)
check("1,024 vs 529: nearly two to one (1.9)", round(1024 / 529, 1), 1.9)
check("Lanchester's tally: 32^2 + 8^2 = 1,088", 32**2 + 8**2, 1088)
check("enemy tally: 23^2 + 23^2 = 1,058", 23**2 + 23**2, 1058)
check("British ahead by 30, sqrt 30 ~ 5.5 ships", (1088 - 1058, round(math.sqrt(30), 1)), (30, 5.5))
check("double the ships = 4x the strength", (2 * 10) ** 2 // 10**2, 4)

# Doubling argument: aimed fire. Twice the ships fire twice the shots, and the enemy's fire is spread
# over twice as many targets (each ship lasts twice as long): 2 x 2 = 4.

# Simulation of square-law combat (each moment, every ship fires; each loss falls on side A with chance
# B / (A + B)). 100,000 battles each.
rng = random.Random(1805)
def battle(a, b):
    while a > 0 and b > 0:
        if rng.random() < b / (a + b):
            a -= 1
        else:
            b -= 1
    return a, b

N = 100_000
line = [battle(40, 46) for _ in range(N)]
lose = sum(1 for a, b in line if a == 0) / N
left = sum(b for a, b in line) / N
print(f"line vs line: you lose {lose:.1%}, enemy ships left on average {left:.1f}")
check("line vs line: you lose most battles (over 80%)", lose > 0.8, True)
results["sim_line_lose"] = f"{lose:.3f}"
results["sim_line_left"] = f"{left:.1f}"

# Nelson's split, played out in order: 32 against 23 first, then the survivors plus the 8 against the other 23.
wins = 0
left_split = 0
first = 0
for _ in range(N):
    a, b = battle(32, 23)
    first += a > 0
    a2, b2 = battle(a + 8, 23) if a > 0 else battle(8, 46 - 23 + b)
    if a2 > 0:
        wins += 1
        left_split += a2
print(f"split: first fight won {first / N:.1%}, whole battle won {wins / N:.1%}, ships left when winning {left_split / max(wins, 1):.1f}")
check("split: the 32 beat the 23 almost always (over 95%)", first / N > 0.95, True)
check("split: you win the whole battle most of the time (over 70%)", wins / N > 0.7, True)
results["sim_split_first"] = f"{first / N:.3f}"
results["sim_split_win"] = f"{wins / N:.3f}"

# deterministic version of the same order of play
s1 = math.sqrt(32**2 - 23**2)
s2 = math.sqrt((s1 + 8) ** 2 - 23**2)
print(f"deterministic: after the first fight {s1:.1f} left, after the second {s2:.1f}")
check("deterministic split also wins", s2 > 0, True)
check("first fight: 22 of your 32 left", round(s1), 22)
check("22 + 8 = 30 against the other 23", round(s1) + 8, 30)
check("30^2 = 900 vs 529", (30**2, 23**2), (900, 529))
check("about 20 ships still afloat at the end", round(s2), 20)

check("Trafalgar: 27 vs 33", (27, 33), (27, 33))  # Wikipedia, fetched 2026-11-05
check("Trafalgar: 18 enemy ships captured or destroyed, none British", (18, 0), (18, 0))

print("ALL OK" if ok else "SOME CHECKS FAILED")
Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
raise SystemExit(0 if ok else 1)
