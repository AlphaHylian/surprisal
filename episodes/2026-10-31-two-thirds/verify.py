"""Every number in the two-thirds game episode (guess 2/3 of the average, level-k), computed and checked."""
import json
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

# random pickers 0..100: average 50
levels = [50 * (2 / 3) ** k for k in range(1, 6)]
check("level 1 (2/3 of 50)", round(levels[0]), 33)
check("level 2", round(levels[1]), 22)
check("level 3", round(levels[2]), 15)
check("level 4", round(levels[3]), 10)
k0 = next(k for k in range(1, 200) if 50 * (2 / 3) ** k < 0.5)
print("steps until under 0.5:", k0)
check("the chain heads to 0 (fixed point of x = 2/3 x)", 0 * 2 / 3 == 0, True)
# Politiken 2005: 19,196 entries, winning number 21.6 -> the average was 21.6 * 3/2
check("Politiken implied average", round(21.6 * 1.5, 1), 32.4)
check("21.6 sits between level 2 (22.2) and level 3 (14.8)", levels[2] < 21.6 < levels[1], True)
check("21.6 is about one step past 33 (33 x 2/3 = 22)", round(33 * 2 / 3), 22)

# simulation: 100,000 crowds of 1,000 players, a level-k mix (k=0 random, k=1 33, k=2 22, k=3 15, k=inf 0)
rng = random.Random(7)
mix = [(0.25, None), (0.35, 33.3), (0.25, 22.2), (0.10, 14.8), (0.05, 0.0)]
win33 = win0 = win22 = 0
targets = []
TR = 100_000
for _ in range(TR):
    # sample counts quickly: crowd of 1,000
    total = 0.0
    n = 1000
    for share, val in mix:
        c = int(share * n)
        if val is None:
            total += rng.gauss(50, (100 / 12 ** 0.5) / c ** 0.5) * c  # mean of c uniform picks (CLT)
        else:
            total += val * c
    target = 2 / 3 * total / n
    targets.append(target)
    d = {g: abs(g - target) for g in (33, 22, 0)}
    best = min(d, key=d.get)
    win33 += best == 33; win22 += best == 22; win0 += best == 0
mt = sum(targets) / TR
print(f"sim: mean winning number {mt:.1f}; 22 closest {win22/TR:.3f}, 33 {win33/TR:.3f}, 0 {win0/TR:.3f}")
check("sim: 33 never closest", win33, 0)
check("sim: 0 never closest", win0, 0)
check("sim: a 1-2 step crowd lands near Politiken's 21.6", 18 < mt < 25, True)

Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
