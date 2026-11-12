"""Checks every number in 'proxy-bid' (eBay automatic bidding = a second-price / Vickrey auction).
Sources: https://www.ebay.com/help/buying/bidding/automatic-bidding?id=4014 (increment table),
https://en.wikipedia.org/wiki/Vickrey_auction (Vickrey 1961, truthful bidding is dominant)."""
import json, random
# eBay bid increments (current price -> step), from eBay's help page
STEPS = [(1, 0.05), (5, 0.25), (25, 0.50), (100, 1.00), (250, 2.50), (500, 5.00), (1000, 10.00),
         (2500, 25.00), (5000, 50.00), (float("inf"), 100.00)]
def step(price):
    for top, s in STEPS:
        if price < top: return s
def outcome(my_max, rival_max, value):
    """You win if your max is higher; you pay one step above the rival's max, capped at your max."""
    if my_max <= rival_max: return 0.0, None
    price = min(my_max, round(rival_max + step(rival_max), 2))
    return round(value - price, 2), price
r = {}
V = 200
r["truthful_vs_150"] = outcome(200, 150, V)           # win, pay 152.50, keep 47.50
r["shade_140_vs_150"] = outcome(140, 150, V)          # lose (rival pays 142.50)
r["rival_price_if_you_shade"] = min(150, 140 + step(140))
r["over_300_vs_250"] = outcome(300, 250, V)           # win, pay 255, lose 55
r["truthful_vs_250"] = outcome(200, 250, V)           # lose, 0
r["cta_200_vs_180"] = outcome(200, 180, V)            # pay 182.50
print(json.dumps(r, indent=1))
assert r["truthful_vs_150"] == (47.5, 152.5)
assert r["shade_140_vs_150"] == (0.0, None) and r["rival_price_if_you_shade"] == 142.5
assert r["over_300_vs_250"] == (-55.0, 255.0)
assert r["cta_200_vs_180"][1] == 182.5
# 100,000 random auctions: random value, random rival max, random other bid.
# Pure second-price rule (pay exactly the rival's max): the honest bid is never worse.
# eBay's rule (pay one step above): another bid can beat the honest one, but only by under one step.
def outcome_pure(my_max, rival_max, value):
    return (round(value - rival_max, 2), rival_max) if my_max > rival_max else (0.0, None)
random.seed(1)
N = 100_000; s = {"auctions": N, "pure_truth_worse": 0, "ebay_truth_worse": 0, "ebay_truth_better": 0, "ebay_max_loss_in_steps": 0.0}
for _ in range(N):
    v, rival, alt = (round(random.uniform(10, 600), 2) for _ in range(3))
    if len({v, rival, alt}) < 3: continue
    if outcome_pure(v, rival, v)[0] < outcome_pure(alt, rival, v)[0] - 1e-9: s["pure_truth_worse"] += 1
    a, b = outcome(v, rival, v)[0], outcome(alt, rival, v)[0]
    if a < b - 1e-9:
        s["ebay_truth_worse"] += 1; s["ebay_max_loss_in_steps"] = max(s["ebay_max_loss_in_steps"], (b - a) / step(rival))
    if a > b + 1e-9: s["ebay_truth_better"] += 1
r["sim"] = s; print(s)
assert s["pure_truth_worse"] == 0 and s["ebay_max_loss_in_steps"] < 1 and s["ebay_truth_better"] > 30_000
json.dump(r, open("verify_results.json", "w"), indent=1)
print("OK")
