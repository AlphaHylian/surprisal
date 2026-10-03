"""Every number in the rope-around-the-Earth episode, computed and checked numerically."""
import math
import random

EXTRA = 1.0                      # metres of rope added
GAP = EXTRA / (2 * math.pi)      # the lift: circumference grows by 2*pi*gap

EARTH_C = 40_075_017.0           # equatorial circumference, m (WGS-84)
SUN_R = 696_000_000.0            # solar radius, m
BALL_C = 0.69                    # size-5 football circumference, m (FIFA: 68-70 cm)


def lift(circumference, extra=EXTRA):
    r0 = circumference / (2 * math.pi)
    r1 = (circumference + extra) / (2 * math.pi)
    return r1 - r0


def offset_perimeter(poly, h):
    """Perimeter of the curve at distance h outside a convex polygon:
    the sides, shifted out, plus a circular arc at each corner (turning angles add to 2*pi)."""
    n = len(poly)
    sides = sum(math.dist(poly[i], poly[(i + 1) % n]) for i in range(n))
    turn = 0.0
    for i in range(n):
        a, b, c = poly[i - 1], poly[i], poly[(i + 1) % n]
        u = (b[0] - a[0], b[1] - a[1]); v = (c[0] - b[0], c[1] - b[1])
        turn += abs(math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]))
    return sides + h * turn, sides


def offset_perimeter_sampled(poly, h, samples=400_000):
    """Independent check: measure the offset curve by sampling it as the boundary of
    the Minkowski sum (support function method): perimeter = integral of support function."""
    total = 0.0
    for k in range(samples):
        th = 2 * math.pi * k / samples
        total += max(p[0] * math.cos(th) + p[1] * math.sin(th) for p in poly) + h
    return total * 2 * math.pi / samples  # Cauchy: perimeter = integral of support function


square = [(0, 0), (4, 0), (4, 4), (0, 4)]
per_sq, sides_sq = offset_perimeter(square, 0.5)

rng = random.Random(1)
# random convex polygons of wildly different sizes: extra rope for gap h is always 2*pi*h
def random_convex(scale):
    angs = sorted(rng.uniform(0, 2 * math.pi) for _ in range(rng.randint(3, 12)))
    return [(scale * math.cos(a), scale * math.sin(a)) for a in angs]

worst = 0.0
for _ in range(100_000):
    poly = random_convex(10 ** rng.uniform(-1, 9))
    h = rng.uniform(0.01, 2)
    per, sides = offset_perimeter(poly, h)
    worst = max(worst, abs((per - sides) - 2 * math.pi * h))

sampled_sq = offset_perimeter_sampled(square, 0.5, samples=20_000)

checks = {
    "gap from 1 m of extra rope is 16 cm (rounded)": (round(GAP * 100), 16),
    "gap is 15.9 cm to 1 decimal": (round(GAP * 100, 1), 15.9),
    "Earth: lift with 1 m extra rope, cm (rounded)": (round(lift(EARTH_C) * 100), 16),
    "football: lift with 1 m extra rope, cm (rounded)": (round(lift(BALL_C) * 100), 16),
    "Sun: lift with 1 m extra rope, cm (rounded)": (round(lift(2 * math.pi * SUN_R) * 100), 16),
    "Earth's rope is about 40,000 km": (round(EARTH_C / 1e7) * 10_000, 40_000),
    "square: straight sides add no length (sum of sides = 16 for side 4)": (sides_sq, 16),
    "square: four quarter-circle corners = one circle of radius 0.5": (round(per_sq - sides_sq, 9), round(2 * math.pi * 0.5, 9)),
    "square: support-function measurement agrees (to 1e-3)": (abs(sampled_sq - per_sq) < 1e-3, True),
    "100,000 random convex shapes, sizes 0.1 to 1e9: extra rope = 2*pi*gap (abs err < 1e-5 m)": (worst < 1e-5, True),
    "a circle 1 m around has radius 16 cm (rounded)": (round(1 / (2 * math.pi) * 100), 16),
    "closing answer: extra rope to lift 1 m is 2*pi = 6.28 m": (round(2 * math.pi, 2), 6.28),
}
ok = True
for name, (got, want) in checks.items():
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")
print(f"gap = {GAP*100:.4f} cm; Earth lift = {lift(EARTH_C)*100:.4f} cm (float), worst random-shape error {worst:.2e}")
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
