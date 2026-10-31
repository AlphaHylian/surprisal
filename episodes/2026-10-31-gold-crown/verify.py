"""Every number in the gold-crown how-to episode (Archimedes' crown, Galileo's balance), computed and checked."""
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

GOLD, SILVER, WATER = 19.3, 10.5, 1.0   # g/cm^3 (densities used by Rorres, NYU Archimedes pages)
M = 1000.0                                # grams of gold handed to the goldsmith (Rorres' hypothetical)
v_gold = M / GOLD
v_crown = 700 / GOLD + 300 / SILVER
check("1,000 g of gold, cm^3 (rounded)", round(v_gold), 52)
check("700 g gold + 300 g silver, cm^3 (rounded)", round(v_crown), 65)
check("extra volume, cm^3 (rounded)", round(v_crown - v_gold), 13)
area = math.pi * 10 ** 2                  # 20 cm wide bowl
rise_mm = (v_crown - v_gold) / area * 10
check("rise difference in a 20 cm bowl under half a millimetre", rise_mm < 0.5, True)
check("rise difference, mm (2 dp)", round(rise_mm, 2), 0.41)
# balance in water: buoyant force = weight of displaced water
up_gold, up_crown = v_gold * WATER, v_crown * WATER
check("water pushes up on the gold, g", round(up_gold), 52)
check("water pushes up on the crown, g", round(up_crown), 65)
check("apparent masses in water", (round(M - up_gold, 1), round(M - up_crown, 1)), (948.2, 935.2))
check("tip of the balance, g", round(up_crown - up_gold), 13)
check("crown side rises (lighter in water)", M - up_crown < M - up_gold, True)
check("silver lighter than gold", SILVER < GOLD, True)
# CTA: only 100 g of silver swapped in
tip100 = (900 / GOLD + 100 / SILVER) - v_gold
check("CTA: 100 g swapped, tip in g (rounded)", round(tip100), 4)

# simulation: 100,000 random fake crowns (5-50% silver) and honest ones, measured with noise.
# overflow: read the overflow volume with +-1 cm^3 error (drips, surface tension, air);
# balance: read the tip with +-0.5 g error. Rule: call it fake if the excess is over half the 100 g-swap signal.
rng = random.Random(1)
N = 100_000
caught_over = caught_bal = 0
for _ in range(N):
    s = rng.uniform(50, 500)
    dv = (M - s) / GOLD + s / SILVER - v_gold
    if dv + rng.gauss(0, 1.0) > 2.2: caught_over += 1
    if dv + rng.gauss(0, 0.5) > 2.2: caught_bal += 1
print(f"sim: overflow catches {caught_over/N:.3f}, balance catches {caught_bal/N:.3f} of fakes with 50-500 g silver")
check("balance catches more fakes than overflow (sim)", caught_bal > caught_over, True)

Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
