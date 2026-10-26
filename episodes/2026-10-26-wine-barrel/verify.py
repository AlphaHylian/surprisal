"""Every number in the wine-barrel how-to episode (Kepler, Linz 1613, Nova stereometria 1615), computed and checked."""
import json
import random
from math import pi, sqrt

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

D = 1.0  # the rod: 1 metre, from the top hole (middle of the barrel) to the far edge of the lid
def height(width, d=D):
    """rod^2 = width^2 + (height/2)^2"""
    return 2 * sqrt(d * d - width * width)
def litres(width, d=D):
    return pi * (width / 2) ** 2 * height(width, d) * 1000

thin, wide = 0.50, 0.95
check("thin barrel 50 cm wide: litres", round(litres(thin)), 340)
check("thin barrel height cm", round(height(thin) * 100), 173)
best_w = sqrt(2 / 3) * D
best_h = 2 * D / sqrt(3)
check("best width cm", round(best_w * 100), 82)
check("best height cm", round(best_h * 100), 115)
check("best litres", round(litres(best_w)), 605)
check("best: height = width x root 2", abs(best_h / best_w - sqrt(2)) < 1e-12, True)
check("hook rounds 605 to 600", round(litres(best_w), -2), 600)
check("wide barrel 95 cm: litres", round(litres(wide)), 443)
# brute force: the best width really is the maximum
grid = [i / 10000 for i in range(1, 10000)]
w_star = max(grid, key=litres)
check("brute-force best width cm", round(w_star * 100), 82)
check("thin holds a bit over half", round(litres(thin) / litres(best_w) * 100), 56)

# Flat near the top: a barrel whose height/width ratio is 10% off root 2 loses about 1%
def litres_ratio(r, d=D):
    # height = r * width, rod^2 = w^2 + (r w / 2)^2
    w = d / sqrt(1 + r * r / 4)
    return pi * (w / 2) ** 2 * (r * w) * 1000
peak = litres_ratio(sqrt(2))
check("ratio form agrees at the peak", abs(peak - litres(best_w)) < 1e-9, True)
loss_hi = 1 - litres_ratio(sqrt(2) * 1.1) / peak
loss_lo = 1 - litres_ratio(sqrt(2) * 0.9) / peak
print(f"10% taller: -{loss_hi*100:.2f}%, 10% squatter: -{loss_lo*100:.2f}%")
check("10% off the shape costs under 1%", max(loss_hi, loss_lo) < 0.01, True)
# random barrels within 10% of the ideal shape, 100,000 of them: worst loss under 1.5%
random.seed(1613)
losses = [1 - litres_ratio(sqrt(2) * random.uniform(0.9, 1.1)) / peak for _ in range(100_000)]
print(f"100,000 barrels within 10%: mean loss {sum(losses)/len(losses)*100:.2f}%, worst {max(losses)*100:.2f}%")
check("sim: worst loss within 10% under 1%", max(losses) < 0.01, True)
# versus thin barrel: same rod, 50 cm wide is ratio ~3.5, loses 44%
check("thin barrel's ratio", round(height(thin) / thin, 1), 3.5)
check("thin barrel loses vs best (%)", round((1 - litres(thin) / litres(best_w)) * 100), 44)
check("years 1613 -> 1615", 1615 - 1613, 2)
check("best ratio said as 1.4", round(best_h / best_w, 1), 1.4)
# graph band: widths where the shape is within 10% of root 2
print(f"band widths: {1/sqrt(1+(sqrt(2)*1.1)**2/4):.4f} .. {1/sqrt(1+(sqrt(2)*0.9)**2/4):.4f}")

json.dump(results, open(__file__.replace("verify.py", "results.json"), "w"), indent=1)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
