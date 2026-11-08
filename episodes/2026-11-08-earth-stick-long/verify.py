"""Every number in the earth-stick-long episode (Eratosthenes measures the Earth, long-form).
Sources: https://en.wikipedia.org/wiki/Eratosthenes , https://en.wikipedia.org/wiki/Earth%27s_circumference ,
https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes . Coordinates: Alexandria 31.20 N 29.92 E, Aswan 24.09 N 32.90 E."""
import json
from math import atan, atan2, cos, degrees, radians, sin, sqrt, tan
from pathlib import Path
import numpy as np

ok = True
results = {}
def check(name, got, want):
    global ok
    good = bool(got == want)
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

POLAR = 40_007.863       # km, Wikipedia
check("7.2 degrees is 1/50 of a circle", 360 / 7.2, 50.0)
check("5,000 x 50 = 250,000 stadia", 5000 * 50, 250_000)
check("240 BC is about 2,200 years ago (2,265, rounded down to the hundred)", (2026 + 239) // 100 * 100, 2200)

# parallel rays
sun = 149.6e6; d = 800
check("rays differ by about 3 ten-thousandths of a degree", f"{degrees(d / sun):.5f}", "0.00031")

# flat Earth with a close sun
h = d / tan(radians(7.2))
check("flat Earth: sun about 6,300 km above Syene", round(h, -2), 6300.0)
check("flat Earth: Alexandria 800 km away sees 7.2", f"{degrees(atan(d / h)):.1f}", "7.2")
R = 40_000 / (2 * np.pi)
check("ball: 5,000 km north of the well -> 45 degrees (40,000 km Earth)", round(5000 / 40_000 * 360), 45)
check("flat: 5,000 km from the well -> 38 degrees", round(degrees(atan(5000 / h))), 38)
check("ball vs flat gap widens with distance", [round(x / 40_000 * 360 - degrees(atan(x / h)), 1) for x in (800, 2000, 5000)], [0.0, 0.5, 6.7])

# real geography
lat_a, lon_a, lat_s, lon_s = 31.20, 29.92, 24.09, 32.90
check("cities 7.1 degrees of latitude apart", round(lat_a - lat_s, 1), 7.1)
check("Syene about 3 degrees east", round(lon_s - lon_a), 3)
check("about 790 km north to south", round((lat_a - lat_s) / 360 * POLAR, -1), 790.0)

# stadion lengths
for m, want in ((160, 40_000), (185, 46_250), (210, 52_500)):
    check(f"250,000 x {m} m = {want:,} km", 250_000 * m / 1000, float(want))
check("46,250 is 16% too big", round((46_250 / POLAR - 1) * 100), 16)
check("52,500 is almost a third too big (31%)", round((52_500 / POLAR - 1) * 100), 31)
check("2012 repeat 40,074 km: 66 km off the polar value", round(40_074 - POLAR), 66)

# Posidonius
check("7.5 degrees = 1/48 circle", 360 / 7.5, 48.0)
check("5,000 x 48 = 240,000", 5000 * 48, 240_000)
check("3,750 x 48 = 180,000", 3750 * 48, 180_000)
check("180,000 is 28% below 250,000 (a third too small vs the true size per Wikipedia: ~33%)", round((1 - 180_000 / 250_000) * 100), 28)

# metre
check("quarter meridian 10,000,000 m -> 40,000 km around", 4 * 10_000_000 / 1000, 40_000.0)

# sieve
nums = list(range(2, 31)); left = [n for n in nums if all(n == p or n % p for p in (2, 3, 5))]
check("sieve to 30 crossing 2, 3, 5 leaves the 10 primes", (len(left), left), (10, [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]))
check("these are all primes below 30", left == [n for n in range(2, 31) if all(n % k for k in range(2, n))], True)

# DIY
check("shadow 0.5 m on a 1 m stick -> 26.6 degrees from vertical", f"{degrees(atan(0.5)):.1f}", "26.6")
check("equinox at 45 N: 1 m stick casts 1 m shadow", f"{tan(radians(45)):.3f}", "1.000")
check("1,000 km south -> about 9 degrees", round(1000 / POLAR * 360, 1), 9.0)
check("9 degrees = 1/40 circle; 1,000 x 40 = 40,000", (360 / 9, 1000 * 40), (40.0, 40_000))
check("CTA: 3.6 degrees -> 400 km", round(3.6 / 360 * POLAR), 400)

# simulation: noisy shadow angles and distances -> estimate, 100,000 trials
g = np.random.default_rng(240)
T = 100_000
ang = 7.11 + g.normal(0, 0.1, T); dist = 790 + g.normal(0, 30, T)
est = dist * 360 / ang
print(f"simulated {T:,} measurements (angle +-0.1 deg, distance +-30 km): median {np.median(est):,.0f} km, 90% within {np.percentile(est, 5):,.0f}-{np.percentile(est, 95):,.0f}")
results["sim_median_km"] = f"{np.median(est):.0f}"
check("simulation: method centres on the real size (within 1%)", abs(np.median(est) / POLAR - 1) < 0.01, True)

print("ALL OK" if ok else "SOME CHECKS FAILED")
Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
raise SystemExit(0 if ok else 1)
