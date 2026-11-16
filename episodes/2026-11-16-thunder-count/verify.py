"""Every number in the thunder-count Short (flash-to-bang distance)."""
import json, random

res = {}
c_light = 299_792.458      # km/s
v_sound = 0.343            # km/s, dry air at 20 C (Wikipedia, Thunder / Speed of sound)
res["light_s_per_km"] = 1 / c_light                     # 3.3e-6 s -> "3 millionths"
res["sound_s_per_km"] = 1 / v_sound                     # 2.92 s -> "3 seconds"
res["sound_s_per_mile"] = 1.609344 / v_sound            # 4.69 s -> "5 seconds"
assert round(res["light_s_per_km"] * 1e6) == 3 and round(res["sound_s_per_km"]) == 3 and round(res["sound_s_per_mile"]) == 5

# Step 1-2: count 15 s
res["km_15s_rule"] = 15 / 3                             # 5
res["km_15s_exact"] = 15 * v_sound                      # 5.1
res["miles_15s_rule"] = 15 / 5                          # 3
# Rumble: near end 2 km, far end 5 km -> hear it from 6 s to 15 s
res["rumble_start_s"] = 2 * 3
res["rumble_end_s"] = 5 * 3
res["rumble_len_s"] = res["rumble_end_s"] - res["rumble_start_s"]   # 9
# Step 3: two minutes later, 12 s -> 4 km; moved 1 km in 2 min; 4 km left -> 8 min
res["km_12s"] = 12 / 3
res["closing_km_per_min"] = (res["km_15s_rule"] - res["km_12s"]) / 2
res["minutes_to_overhead"] = res["km_12s"] / res["closing_km_per_min"]
res["closing_kmh"] = res["closing_km_per_min"] * 60                 # 30 km/h, a typical storm speed
assert res["minutes_to_overhead"] == 8 and res["rumble_len_s"] == 9
# CTA: 21 s -> 7 km
res["cta_km"] = 21 / 3
assert res["cta_km"] == 7

# Simulation: how good is "divide by 3"? Random strikes 1-15 km away, air 0-30 C
# (v = 331.3 + 0.606 T m/s), a human count rounded to the nearest second.
random.seed(3)
N = 200_000
errs = []
for _ in range(N):
    dist = random.uniform(1, 15)
    T = random.uniform(0, 30)
    v = (331.3 + 0.606 * T) / 1000
    count = round(dist / v)
    errs.append(abs(count / 3 - dist))
errs.sort()
res["sim_median_err_km"] = errs[N // 2]
res["sim_p95_err_km"] = errs[int(0.95 * N)]
print("p95", res["sim_p95_err_km"], "median", res["sim_median_err_km"])
assert res["sim_p95_err_km"] < 0.6

print(json.dumps(res, indent=2))
