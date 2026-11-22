"""Every number in chip-log-long, computed or sourced (sources in script.json facts_checked)."""
import math, random, json
ok = True
R = {}
def check(name, got, want, tol=None):
    global ok
    good = (abs(got - want) <= tol) if tol is not None else got == want
    ok &= good
    R[name] = got
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

MILE_FT = 6080          # Admiralty nautical mile
spacing = MILE_FT * 28 / 3600
check("knot spacing for a 28 s glass (ft)", round(spacing, 1), 47.3)
check("47 ft 3 in vs exact, inches off (< 0.5)", (spacing - 47.25) * 12 < 0.5, True)
knot_kmh = 47.25 * 0.3048 / 28 * 3.6
check("chip-log knot (km/h)", round(knot_kmh, 5), 1.85166)
check("off from 1.852 by less than 2 parts in 10,000", (1.852 - knot_kmh) / 1.852 < 2e-4, True)
check("Bourne: 5,000 ft mile, 30 s glass -> ft", round(5000 * 30 / 3600), 42)
check("8 fathoms in ft", 8 * 6, 48)
check("48 ft at a 6,000 ft mile -> glass seconds", round(48 / (6000 / 3600), 1), 28.8)
s30 = MILE_FT * 30 / 3600
check("30 s glass spacing ft", int(s30), 50)
check("30 s glass spacing remaining inches", round((s30 - 50) * 12), 8)

# 100,000 simulated casts: a ship at v knots for 28 s pulls out v knot-spacings of line
rng = random.Random(7)
bad = 0
for _ in range(100_000):
    v = rng.uniform(0.5, 12)
    line_ft = v * MILE_FT / 3600 * 28
    if abs(line_ft / spacing - v) > 1e-9: bad += 1
check("casts where knots counted != speed", bad, 0)

check("7 knots x 4 h", 7 * 4, 28)
n, e = 3 * 6, 2 * 8
check("leg 1 north", n, 18); check("leg 2 east", e, 16)
check("distance from start (nm)", round(math.hypot(n, e)), 24)
check("bearing: between north and north-east (deg east of north)", 0 < math.degrees(math.atan2(e, n)) < 45, True)
check("1 knot current, 24 h", 1 * 24, 24)
check("traverse board: 8 half-hours = 4 hour watch", 8 * 0.5, 4.0)

# 10-day crossing at 6 knots, hourly readings with random errors; then a steady 0.5-knot current
def crossing(current=0.0, rng=rng):
    ex = ey = 0.0          # true minus reckoned position error, nm
    for h in range(240):
        speed_err = rng.gauss(0, 0.04)     # a few percent
        head_err = math.radians(rng.gauss(0, 3))   # a few degrees
        v = 6.0
        # reckoned: v east. true: v*(1+se) at heading error
        tx, ty = v * (1 + speed_err) * math.cos(head_err), v * (1 + speed_err) * math.sin(head_err)
        ex += tx - v; ey += ty
        ey += current       # current set north, unseen by the log
    return math.hypot(ex, ey)
N = 20_000
rand = sorted(crossing() for _ in range(N))
cur = sorted(crossing(0.5) for _ in range(N))
med_r, med_c = rand[N // 2], cur[N // 2]
print(f"median error, random only: {med_r:.1f} nm; with 0.5 kn current: {med_c:.1f} nm")
check("typical error, random only (~5 nm)", round(med_r), 5, tol=1)
check("typical error with current (~120 nm)", round(med_c), 120, tol=3)
r40 = sorted(crossing(0.0) if False else 0 for _ in range(0))
def crossing_h(hours):
    ex = ey = 0.0
    for h in range(hours):
        se = rng.gauss(0, 0.04); he = math.radians(rng.gauss(0, 3))
        ex += 6 * (1 + se) * math.cos(he) - 6; ey += 6 * (1 + se) * math.sin(he)
    return math.hypot(ex, ey)
r40 = sorted(crossing_h(960) for _ in range(5000))
print(f"median error after 40 days: {r40[2500]:.1f} nm")
check("40-day typical error (~13 nm)", round(r40[2500]), 13, tol=1)
check("4x the 10-day error (nm)", 4 * round(med_r), 20)
check("14 s glass: each knot counts", 28 / 14, 2.0)
check("half knot x 240 h", 0.5 * 240, 120.0)
check("Scilly fleet ships", 21, 21)
check("Longitude Act 1714 - 1707", 1714 - 1707, 7)
check("half a degree in nm (equator)", 0.5 * 60, 30.0)
check("60 knots north: degrees per hour", 60 / 60, 1.0)
check("250 knots x 2 h", 250 * 2, 500)
# CTA: a 30 s glass, 7 knots counted
true_v = 7 * 28 / 30
check("CTA true speed (knots, 1 dp)", round(true_v, 1), 6.5)
print("ALL OK" if ok else "SOME CHECKS FAILED")
json.dump({k: (v if isinstance(v, (int, float, bool)) else str(v)) for k, v in R.items()}, open("verify_results.json", "w"), indent=1)
