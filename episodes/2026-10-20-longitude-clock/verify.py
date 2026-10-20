"""Every number in the longitude-by-clock how-to episode (Harrison's sea watch)."""
import math
import random

ok = True
def check(name, got, want, tol=0.0):
    global ok
    good = got == want if isinstance(want, bool) else abs(got - want) <= tol
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

deg_per_hour = 360 / 24
check("Earth turns degrees an hour", deg_per_hour, 15)
check("3 hours behind home = degrees west", 3 * deg_per_hour, 45)
deg_per_min = deg_per_hour / 60
check("one minute of clock error = degrees", deg_per_min, 0.25)
# one degree of longitude at the equator: WGS84 equatorial radius 6,378.137 km
km_per_deg = 2 * math.pi * 6378.137 / 360
km_per_min = deg_per_min * km_per_deg
print(f"1 degree at the equator = {km_per_deg:.2f} km; 1 minute of time = {km_per_min:.2f} km")
check("one minute wrong = km off at the equator (said 28)", round(km_per_min), 28)
# Longitude Act 1714: GBP 20,000 for within 30 minutes of arc = half a degree
half_deg_in_min = 0.5 / deg_per_min
check("half a degree = minutes of clock error", half_deg_in_min, 2)
# H4 to Jamaica: 81 days 5 hours, 5 seconds slow at Kingston (after its known daily rate)
err_s = 5
check("H4 error vs the prize's 2 minutes: times better (said 24)", 120 / err_s, 24)
check("H4 5 s = minutes of arc (Wikipedia: 1.25)", err_s / 60 * deg_per_hour * 60 / 60, 1.25)
# CTA: home clock says 9 pm at your noon -> 9 hours ahead of you -> 135 degrees west
check("CTA answer: 9 hours = degrees west", 9 * deg_per_hour, 135)

# simulate: 100,000 ships whose clock error is uniform in +-1 minute; position error is linear in clock error
rng = random.Random(2026)
N = 100_000
worst = max(abs(rng.uniform(-60, 60)) / 3600 * deg_per_hour * km_per_deg for _ in range(N))
print(f"sim {N:,} ships with clocks up to 1 minute off: worst position error {worst:.2f} km at the equator")
check("sim: a 1-minute clock never puts you more than 28 km off", worst <= 27.84, True)
print("ALL OK" if ok else "SOME CHECKS FAILED")
