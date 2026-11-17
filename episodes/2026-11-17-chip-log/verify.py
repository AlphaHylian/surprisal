"""Every number in the chip-log Short."""
import random
ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

admiralty_mile_ft = 6080          # Admiralty nautical mile (Wikipedia, Knot (unit))
glass_s = 28
spacing_ft = admiralty_mile_ft * glass_s / 3600
print("spacing ft:", spacing_ft)
check("knot spacing 47 ft 3 in (to the inch)", round(spacing_ft * 12), 47 * 12 + 3)
knot_m = (47 * 12 + 3) * 0.0254
check("47 ft 3 in in metres", round(knot_m, 4), 14.4018)
check("one knot passing per 28 s = km/h (1.85166)", round(knot_m / glass_s * 3.6, 5), 1.85166)
check("within 0.02% of 1.852", abs(knot_m / glass_s * 3.6 - 1.852) / 1.852 < 0.0002, True)
check("28 s is 1/128.6 of an hour", round(3600 / 28, 1), 128.6)

# Simulate the log: ship at v knots, count knots passing in 28 s
random.seed(0)
errs = []
for _ in range(100_000):
    v = random.uniform(1, 12)
    paid_out_ft = v * admiralty_mile_ft / 3600 * glass_s
    count = paid_out_ft / spacing_ft
    errs.append(abs(count - v))
check("100,000 simulated casts: knots counted = speed in knots", max(errs) < 1e-9, True)

# Example: 7 knots
check("7 knots counted -> 7 nautical miles an hour", 7 * spacing_ft * 3600 / glass_s / admiralty_mile_ft, 7.0)
# Dead reckoning: 7 knots for 4 hours west
check("7 knots x 4 h", 7 * 4, 28)
# A 1-knot current you can't see, 24 hours
check("1-knot current over a day: miles off", 1 * 24, 24)
# CTA: 9 knots for 3 hours
check("CTA 9 knots x 3 h", 9 * 3, 27)
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
