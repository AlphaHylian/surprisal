"""Every number in the galileo-dice episode (three dice, 9 vs 10), computed and simulated.
Source: Galileo, 'Sopra le scoperte dei dadi' (Opere vol. 8, transl. E. H. Thorne), https://york.ac.uk/depts/maths/histstat/galileo.htm"""
import itertools
import json
import random
from collections import Counter
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

rolls = list(itertools.product(range(1, 7), repeat=3))
check("all throws of three dice", len(rolls), 216)
def combos(s):
    return sorted({tuple(sorted(r)) for r in rolls if sum(r) == s})
c9, c10 = combos(9), combos(10)
check("unordered ways to make 9", len(c9), 6)
check("unordered ways to make 10", len(c10), 6)
check("9 combos", c9, [(1, 2, 6), (1, 3, 5), (1, 4, 4), (2, 2, 5), (2, 3, 4), (3, 3, 3)])
check("10 combos", c10, [(1, 3, 6), (1, 4, 5), (2, 2, 6), (2, 3, 5), (2, 4, 4), (3, 3, 4)])
def arrangements(c):
    return len(set(itertools.permutations(c)))
check("1-2-6 lands 6 ways", arrangements((1, 2, 6)), 6)
check("1-4-4 lands 3 ways", arrangements((1, 4, 4)), 3)
check("3-3-3 lands 1 way", arrangements((3, 3, 3)), 1)
n9 = sum(arrangements(c) for c in c9)
n10 = sum(arrangements(c) for c in c10)
check("9: 6+6+3+3+6+1", [arrangements(c) for c in c9], [6, 6, 3, 3, 6, 1])
check("10: 6+6+3+6+3+3", [arrangements(c) for c in c10], [6, 6, 3, 6, 3, 3])
check("throws making 9", n9, 25)
check("throws making 10", n10, 27)
check("9 in percent (11.6)", round(100 * n9 / 216, 1), 11.6)
check("10 in percent (12.5)", round(100 * n10 / 216, 1), 12.5)
check("10 vs 9: 8% more often", round(100 * (n10 / n9 - 1)), 8)
check("11 and 12 (Galileo's other pair) 27 vs 25", (sum(1 for r in rolls if sum(r) == 11), sum(1 for r in rolls if sum(r) == 12)), (27, 25))
# per 1,000 throws: about 116 nines vs 125 tens
check("per 1,000 throws: nines", round(1000 * n9 / 216), 116)
check("per 1,000 throws: tens", round(1000 * n10 / 216), 125)

rng = random.Random(7)
N = 1_000_000
cnt = Counter(rng.randint(1, 6) + rng.randint(1, 6) + rng.randint(1, 6) for _ in range(N))
p9, p10 = cnt[9] / N, cnt[10] / N
print(f"sim {N:,} throws: 9 -> {p9:.4f} (exact {n9/216:.4f}), 10 -> {p10:.4f} (exact {n10/216:.4f})")
check("simulation agrees on 9 (within 0.002)", abs(p9 - n9 / 216) < 0.002, True)
check("simulation agrees on 10 (within 0.002)", abs(p10 - n10 / 216) < 0.002, True)
results["sim_p9"], results["sim_p10"] = f"{p9:.4f}", f"{p10:.4f}"

print("ALL OK" if ok else "SOME CHECKS FAILED")
Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
raise SystemExit(0 if ok else 1)
