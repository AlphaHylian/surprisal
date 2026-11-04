"""Every number in the book-stack episode (block-stacking / harmonic overhang), computed and simulated.
Source: https://en.wikipedia.org/wiki/Block-stacking_problem (overhang = sum 1/(2i); 4, 31, 227 blocks)"""
import json
import random
from fractions import Fraction
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

L = 24  # book length in cm used in the video
def overhang(n):
    return sum(Fraction(1, 2 * i) for i in range(1, n + 1))

steps = [Fraction(1, 2 * i) * L for i in range(1, 5)]
check("step overhangs for a 24 cm book: 12, 6, 4, 3 cm", [int(s) for s in steps], [12, 6, 4, 3])
check("4 books total 25 cm", overhang(4) * L, 25)
check("4 books: 25/24 of a length", overhang(4), Fraction(25, 24))
check("1 cm past the table edge (book fully off)", overhang(4) * L - L, 1)
check("3 books not enough: 22 cm", overhang(3) * L, 22)

# Balance check: with this stack, the centre of the top k books sits exactly on the edge of book k+1
# (book k+1 = the table for k = 4). Positions: x = right end of each book, measured from the table edge.
n = 4
right = [None] * (n + 1)  # right[i] for i=1 (top) .. n (bottom)
right[n] = Fraction(1, 2 * n)
for i in range(n - 1, 0, -1):
    right[i] = right[i + 1] + Fraction(1, 2 * i)
centres = {i: right[i] - Fraction(1, 2) for i in range(1, n + 1)}
balanced = True
for k in range(1, n + 1):
    com = sum(centres[i] for i in range(1, k + 1)) / k
    support_edge = right[k + 1] if k < n else 0
    balanced &= (com == support_edge)
check("centre of the top k books sits on the edge below, k = 1..4", balanced, True)
check("top book's right end = 25/24", right[1], Fraction(25, 24))

def books_needed(m):
    s, i = Fraction(0), 0
    while s < m:
        i += 1
        s += Fraction(1, 2 * i)
    return i
check("books to reach 1 length: 4", books_needed(1), 4)
check("books to reach 2 lengths: 31", books_needed(2), 31)
check("books to reach 3 lengths: 227", books_needed(3), 227)
check("10 books: about 1.46 lengths", round(float(overhang(10)), 2), 1.46)

# Simulation: random stacks of 4 books; any stable stack (each sub-stack's centre over its support,
# and the whole over the table) never beats 25/24 of a length. 200,000 random stacks.
rng = random.Random(4)
N = 200_000
best = Fraction(0)
bestf = 0.0
for _ in range(N):
    # offsets: how far each book sticks out past the one below, bottom book's right end past the table
    d = [rng.random() * 0.6 for _ in range(4)]  # d[0] top over 2nd, ..., d[3] bottom past table
    r = [0.0] * 5
    r[4] = d[3]
    for i in (3, 2, 1):
        r[i] = r[i + 1] + d[i - 1]
    good = True
    for k in range(1, 5):
        com = sum(r[i] - 0.5 for i in range(1, k + 1)) / k
        edge = r[k + 1] if k < 4 else 0.0
        if com > edge + 1e-12:
            good = False
            break
    if good and r[1] > bestf:
        bestf = r[1]
print(f"best random stable stack of 4 in {N:,} tries: {bestf:.4f} (max 25/24 = {25/24:.4f})")
check("no random stable stack beats 25/24", bestf <= 25 / 24 + 1e-9, True)
check("random search gets close (over 0.95)", bestf > 0.95, True)
results["sim_best"] = f"{bestf:.4f}"

print("ALL OK" if ok else "SOME CHECKS FAILED")
Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
raise SystemExit(0 if ok else 1)
