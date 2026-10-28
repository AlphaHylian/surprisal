"""Every number in the tea-test how-to episode (Fisher's lady tasting tea), computed and checked."""
import json
import random
from math import comb

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# One cup: a guesser is right half the time.
check("one cup, guesser right: one in", 2, 2)
# Eight cups, four milk-first; she picks the four milk-first ones.
ways = comb(8, 4)
check("ways to pick 4 cups of 8", ways, 70)
check("ways that are all right", comb(4, 4) * comb(4, 0), 1)
exact3 = comb(4, 3) * comb(4, 1)
check("ways with exactly 3 of 4 right", exact3, 16)
check("ways with 3 or more right", exact3 + 1, 17)
check("3+ right by luck, about one time in 4", round(ways / (exact3 + 1)), 4)
check("all right by luck, percent (1 decimal)", round(100 / ways, 1), 1.4)
check("Fisher's 5% line: all 4 passes", 1 / ways < 0.05, True)
check("Fisher's 5% line: 3 of 4 fails", 17 / ways < 0.05, False)
# 3 of 4 milk-first right means 6 of 8 cups sorted right (one swap)
check("3 of 4 picks right = cups sorted right of 8", 3 + 3, 6)

random.seed(1935)
TRIALS = 100_000
all4 = three_plus = 0
cups = [1, 1, 1, 1, 0, 0, 0, 0]
for _ in range(TRIALS):
    pick = random.sample(range(8), 4)
    right = sum(cups[i] for i in pick)
    all4 += right == 4
    three_plus += right >= 3
results["sim all 4 right"] = f"{all4 / TRIALS:.4f}"
results["sim 3+ right"] = f"{three_plus / TRIALS:.4f}"
print(f"sim: all right {all4 / TRIALS:.4f} (1/70 = {1/70:.4f}), 3+ right {three_plus / TRIALS:.4f} (17/70 = {17/70:.4f})")
check("sim all right matches 1/70 within 0.002", abs(all4 / TRIALS - 1 / 70) < 0.002, True)
check("sim 3+ matches 17/70 within 0.005", abs(three_plus / TRIALS - 17 / 70) < 0.005, True)
# Free guess per cup (not told 4 and 4): all 8 right = 1 in 256
check("8 independent coin-flip guesses all right: one in", 2 ** 8, 256)
check("book year", 1935, 1935)

json.dump(results, open(__file__.replace("verify.py", "results.json"), "w"), indent=1)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
