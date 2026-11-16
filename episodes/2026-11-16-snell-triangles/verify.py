"""Every number in the snell-triangles Short (Snellius's 1615 triangulation of Holland)."""
import json, math, random

res = {}
d = math.radians
# Step 2-3: illustrative triangle on the 5 km baseline, angles 60 and 70 degrees at its ends.
base, A, B = 5.0, 60.0, 70.0
C = 180 - A - B
res["third_angle"] = C                                        # 50
res["side_opp_A"] = base * math.sin(d(A)) / math.sin(d(C))     # 5.65 km
res["side_opp_B"] = base * math.sin(d(B)) / math.sin(d(C))     # 6.13 km
assert round(res["side_opp_A"], 1) == 5.7 and round(res["side_opp_B"], 1) == 6.1

# Re-hook: a 0.1 degree error over a 5 km sight line moves the far end sideways by:
res["shift_m_0.1deg_5km"] = 5000 * math.tan(d(0.1))           # 8.7 m
assert round(res["shift_m_0.1deg_5km"]) == 9

# Result: 28,500 Rhineland rods per degree, 1 rod = 3.767358 m.
rod = 3.767358
res["km_per_degree"] = 28500 * rod / 1000                     # 107.37
res["circumference_km"] = res["km_per_degree"] * 360          # 38,653
res["pct_low"] = (1 - res["circumference_km"] / 40075) * 100  # 3.5
assert round(res["km_per_degree"]) == 107 and round(res["circumference_km"]) == 38653
assert round(res["pct_low"], 1) == 3.5

# Simulation: law-of-sines chain. Start from a 5 km base, build 12 triangles leapfrogging south,
# every measured angle off by a random error up to +-0.05 deg (a quadrant read to tenths), and
# force each triangle's angles to sum to 180 (spread the misclosure). How far off is the end?
random.seed(2)
def chain(noise):
    side = 5.0
    total = 0.0
    for k in range(12):
        a, b = 65.0, 65.0                       # true angles at the ends of the current side
        c = 180 - a - b
        ma, mb, mc = (x + random.uniform(-noise, noise) for x in (a, b, c))
        mis = (ma + mb + mc - 180) / 3
        ma, mb, mc = ma - mis, mb - mis, mc - mis
        side = side * math.sin(d(ma)) / math.sin(d(mc))   # new side, becomes the next base
        total += side
    return total
true_total = chain(0.0)
errs = [abs(chain(0.05) - true_total) / true_total * 100 for _ in range(100_000)]
errs.sort()
res["sim_chain_true_km"] = true_total
res["sim_median_err_pct"] = errs[len(errs) // 2]
res["sim_p95_err_pct"] = errs[int(0.95 * len(errs))]
assert res["sim_p95_err_pct"] < 1.0   # angle noise alone stays well under 1%: rounding of tenths isn't what cost him 3.5%

print(json.dumps(res, indent=2))
