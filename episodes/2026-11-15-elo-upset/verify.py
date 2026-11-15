"""Every number in the elo-upset Short. Elo: E_A = 1/(1+10^((R_B-R_A)/400)), R' = R + K(S-E), K=32."""
import json, random

K = 32
E = lambda ra, rb: 1 / (1 + 10 ** ((rb - ra) / 400))
res = {}
res["equal_E"] = E(1500, 1500)
res["equal_gain"] = K * (1 - E(1500, 1500))                  # 16
res["up400_E"] = E(1500, 1900)                               # 1/11 = 0.0909
res["up400_gain"] = K * (1 - E(1500, 1900))                  # 29.09
res["opp_loss"] = K * (0 - E(1900, 1500))                    # -29.09 (zero-sum)
res["odds_400"] = E(1900, 1500) / E(1500, 1900)              # 10
res["down400_E"] = E(1500, 1100)                             # 0.909
res["down400_win"] = K * (1 - E(1500, 1100))                 # 2.9
res["down400_loss"] = K * (0 - E(1500, 1100))                # -29.1
res["cta_E"] = E(1700, 1500)                                 # 0.76
res["cta_gain"] = K * (1 - E(1700, 1500))                    # 7.7 -> 8
assert round(res["equal_gain"]) == 16 and round(res["up400_gain"]) == 29
assert abs(res["odds_400"] - 10) < 1e-9 and round(res["down400_win"]) == 3 and round(res["cta_gain"]) == 8

# Simulation: does the 1/11 prediction hold? Model strength gap so P(win) = E (no draws), 200,000 games.
random.seed(1)
N = 200_000
wins = sum(random.random() < E(1500, 1900) for _ in range(N))
res["sim_upset_rate"] = wins / N
assert abs(res["sim_upset_rate"] - 1 / 11) < 0.003
# Simulation 2: ratings converge. 10 players, true strengths spread 1100..1900, all start at 1500, random pairings.
true = [1100 + 800 * i / 9 for i in range(10)]
r = [1500.0] * 10
for g in range(100_000):
    a, b = random.sample(range(10), 2)
    s = 1.0 if random.random() < E(true[a], true[b]) else 0.0
    e = E(r[a], r[b])
    r[a] += K * (s - e); r[b] -= K * (s - e)
res["sim_final_ratings"] = [round(x) for x in r]
res["sim_true"] = [round(x) for x in true]
res["sim_sum_conserved"] = round(sum(r), 6)
order_ok = sorted(range(10), key=lambda i: r[i]) == list(range(10))
res["sim_order_recovered"] = order_ok
assert abs(sum(r) - 15000) < 1e-6
print(json.dumps(res, indent=1))
json.dump(res, open("verify_results.json", "w"), indent=1)
print("OK")
