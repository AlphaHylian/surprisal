"""Checks every number in 'small-world' (Milgram's letter chains, Travers & Milgram 1969).
Source: Travers & Milgram, 'An Experimental Study of the Small World Problem', Sociometry 32(4), 1969
(https://www.cse.cuhk.edu.hk/~cslui/CMSC5734/travers69smallworld.pdf): 296 starters (196 Nebraska,
100 Boston), target a Boston stockbroker living in Sharon, Mass.; document sent only to a first-name
acquaintance; 217 sent it on; 64 reached the target; mean 5.2 intermediaries; 16 of the 64 came through
one clothing merchant in Sharon. Also https://en.wikipedia.org/wiki/Small-world_experiment"""
import json, math, random
from collections import deque
r = {}
r["starters"] = 296; r["nebraska"] = 196; r["boston"] = 100; assert r["nebraska"] + r["boston"] == 296
r["arrived"] = 64; r["arrived_pct_of_296"] = round(100 * 64 / 296, 1); r["arrived_pct_of_217_sent"] = round(100 * 64 / 217, 1)
r["mean_intermediaries"] = 5.2
r["via_one_merchant"] = 16; r["merchant_share_pct"] = 100 * 16 / 64; assert r["merchant_share_pct"] == 25
r["one_in_four"] = 16 / 64 == 1 / 4
# 'say you know 100 people by first name': reach after k hops, ignoring overlap
r["reach"] = {k: 100 ** k for k in range(1, 6)}
assert r["reach"][2] == 10_000 and r["reach"][3] == 1_000_000 and r["reach"][5] == 10_000_000_000
r["world_pop_2026_approx"] = 8_300_000_000; assert r["reach"][5] > r["world_pop_2026_approx"]
# Omaha to Boston, great-circle distance
def hav(a, b):
    (la1, lo1), (la2, lo2) = [(math.radians(x), math.radians(y)) for x, y in (a, b)]
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))
km = hav((41.2565, -95.9345), (42.3601, -71.0589)); r["omaha_boston_km"] = round(km); r["omaha_boston_miles"] = round(km / 1.609)
assert 1150 < r["omaha_boston_miles"] < 1350
# overlap vs long links: 100,000 people on a ring, each knowing their 10 nearest (all local, heavy overlap),
# then 1% of friendships rewired to a random far-away person (Watts-Strogatz). Average handoffs between random pairs.
def avg_dist(n, k, p, seed, sources=20):
    rng = random.Random(seed); adj = [set() for _ in range(n)]
    for i in range(n):
        for d in range(1, k // 2 + 1):
            j = (i + d) % n
            if rng.random() < p:
                j = rng.randrange(n)
                while j == i or j in adj[i]: j = rng.randrange(n)
            adj[i].add(j); adj[j].add(i)
    tot = cnt = 0
    for _ in range(sources):
        s = rng.randrange(n); dist = [-1] * n; dist[s] = 0; q = deque([s])
        while q:
            u = q.popleft()
            for v in adj[u]:
                if dist[v] < 0: dist[v] = dist[u] + 1; q.append(v)
        tot += sum(x for x in dist if x > 0); cnt += sum(1 for x in dist if x > 0)
    return tot / cnt
r["ring_100k_local_only_avg_hops"] = round(avg_dist(100_000, 10, 0.0, 1), 1)
r["ring_100k_1pct_far_friends_avg_hops"] = round(avg_dist(100_000, 10, 0.01, 2), 1)
assert r["ring_100k_local_only_avg_hops"] > 1000 and r["ring_100k_1pct_far_friends_avg_hops"] < 20
print(json.dumps(r, indent=1)); json.dump(r, open("verify_results.json", "w"), indent=1); print("OK")
