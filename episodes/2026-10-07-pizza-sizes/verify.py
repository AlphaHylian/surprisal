"""Every number in the pizza-size how-to episode."""
import math, random

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

area = lambda d: math.pi * (d / 2) ** 2
check("two 12s: 24 inches across", 12 + 12, 24)
check("18-inch: 254 square inches", round(area(18)), 254)
check("12-inch: 113 square inches", round(area(12)), 113)
check("two 12-inch: 226 square inches", round(2 * area(12)), 226)
check("18 x 18", 18 * 18, 324)
check("12 x 12", 12 * 12, 144)
check("twice 144", 2 * 144, 288)
check("one 18 is an eighth more than two 12s", area(18) / (2 * area(12)), 1 + 1 / 8)
# crust: one inch off every edge -> diameters 16 and 10
check("16-inch middle: 201 sq in", round(area(16)), 201)
check("two 10-inch middles: 157 sq in", round(2 * area(10)), 157)
check("big middle is 28% more", round(100 * (area(16) / (2 * area(10)) - 1)), 28)
check("over a quarter more topping", area(16) / (2 * area(10)) > 1.25, True)
# rim length: one 18-inch rim vs two 12-inch rims
print(f"   crust rim: one 18-inch {math.pi*18:.1f} in, two 12-inch {2*math.pi*12:.1f} in")
check("two pizzas have more rim", 2 * math.pi * 12 > math.pi * 18, True)
# TV: same shape, double the diagonal -> 4x the screen
check("64-inch TV vs 32-inch: 4x screen", (64 / 32) ** 2, 4.0)
# CTA: 14-inch vs two 10-inch -> 196 vs 200, two 10s win by a hair
check("CTA 14^2", 14 * 14, 196)
check("CTA 2 x 10^2", 2 * 10 * 10, 200)
check("CTA: two 10s are (slightly) more", 2 * area(10) > area(14), True)
# Monte Carlo: throw 200,000 random points into an 18x18 square, compare hits inside the pizzas
random.seed(1)
N = 200_000
big = sum((random.uniform(-9, 9) ** 2 + random.uniform(-9, 9) ** 2) <= 81 for _ in range(N)) / N * 324
small = sum((random.uniform(-6, 6) ** 2 + random.uniform(-6, 6) ** 2) <= 36 for _ in range(N)) / N * 144
print(f"   Monte Carlo: 18-inch {big:.1f}, 12-inch {small:.1f}, ratio {big/(2*small):.3f}")
check("Monte Carlo ratio ~1.125", abs(big / (2 * small) - 1.125) < 0.01, True)
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
