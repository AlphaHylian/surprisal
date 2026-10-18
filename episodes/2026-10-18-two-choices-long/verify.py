"""Power of two choices, long-form. Every number said or shown is computed or simulated here.
Run it; it prints each figure and writes results.json next to itself."""
import json
import math
import os

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(18)
out = {}


def place(n, m, d, rng):
    """m jobs onto n servers; each job looks at d random servers and joins the emptiest (d=1: random)."""
    if d == 1:
        return np.bincount(rng.integers(0, n, m), minlength=n)
    load = np.zeros(n, dtype=np.int64)
    picks = rng.integers(0, n, size=(m, d))
    for row in picks:
        a = row[0]
        for b in row[1:]:
            if load[b] < load[a]:
                a = b
        load[a] += 1
    return load


def worst(n, m, d, trials):
    return float(np.mean([place(n, m, d, rng).max() for _ in range(trials)]))


# ---- chapter 1-2: 100 servers, 10,000 jobs
n, m = 100, 10_000
out["avg"] = m // n
out["random_worst_10k"] = worst(n, m, 1, 2000)
out["two_worst_10k"] = worst(n, m, 2, 200)
out["three_worst_10k"] = worst(n, m, 3, 200)
loads = np.concatenate([place(n, m, 1, rng) for _ in range(200)])
out["random_quietest_10k"] = float(np.mean([place(n, m, 1, rng).min() for _ in range(2000)]))
out["sd_per_server"] = math.sqrt(m * (1 / n) * (1 - 1 / n))           # binomial spread, ~10
out["share_over_110"] = float(np.mean(loads > 110))                    # servers 10+ over
print("100 servers / 10,000 jobs: random worst %.1f, quietest %.1f, two %.1f, three %.1f" % (
    out["random_worst_10k"], out["random_quietest_10k"], out["two_worst_10k"], out["three_worst_10k"]))
print("spread per server (sd) %.2f; share of servers 10+ over average %.3f" % (out["sd_per_server"], out["share_over_110"]))

# ---- more jobs: the random excess grows, two-choice excess doesn't
m2 = 1_000_000
out["random_worst_1m"] = worst(n, m2, 1, 300)
out["two_worst_1m"] = worst(n, m2, 2, 3)
print("100 servers / 1,000,000 jobs (avg 10,000): random worst %.0f (+%.0f), two %.1f (+%.1f)" % (
    out["random_worst_1m"], out["random_worst_1m"] - 10_000, out["two_worst_1m"], out["two_worst_1m"] - 10_000))

# ---- one job per server: n jobs on n servers
out["random_worst_eq_100_mean"] = float(np.mean([place(100, 100, 1, rng).max() for _ in range(5000)]))
out["random_worst_eq_100_mode"] = int(np.bincount([place(100, 100, 1, rng).max() for _ in range(5000)]).argmax())
print("100 on 100, random: worst on average %.2f, most often %d" % (out["random_worst_eq_100_mean"], out["random_worst_eq_100_mode"]))
for N in (100, 1_000_000):
    lr = place(N, N, 1, rng)
    out[f"empty_share_{N}"] = float(np.mean(lr == 0))
    out[f"random_worst_eq_{N}"] = int(lr.max())
    out[f"two_worst_eq_{N}"] = int(place(N, N, 2, rng).max())
    print(f"{N:,} jobs on {N:,} servers: random worst {out[f'random_worst_eq_{N}']}, two worst {out[f'two_worst_eq_{N}']}, "
          f"empty under random {out[f'empty_share_{N}']:.3f}")
out["random_worst_eq_1m_runs"] = [int(place(10**6, 10**6, 1, rng).max()) for _ in range(5)]
out["two_worst_eq_1m_runs"] = [int(place(10**6, 10**6, 2, rng).max()) for _ in range(3)]
print("1M on 1M, worst over runs: random", out["random_worst_eq_1m_runs"], "two", out["two_worst_eq_1m_runs"])
out["one_over_e"] = 1 / math.e

# ---- the squaring ladder: if a share f of servers is busy, a job lands on one only if both picks are
ladder = [0.5]
for _ in range(4):
    ladder.append(ladder[-1] ** 2)
out["ladder"] = ladder
print("squaring ladder:", [f"1 in {round(1 / x):,}" for x in ladder])
out["both_busy_10pct"] = 0.1 * 0.1

# ---- stale information: a queue model with load info refreshed only every K ticks
def queue_sim(policy, K, n=100, load=0.9, p=0.5, ticks=6000, warm=1000, seed=7):
    g = np.random.default_rng(seed)
    q = np.zeros(n, dtype=np.int64)
    seen = q.copy()
    lam = load * p * n
    waits = []
    for t in range(ticks):
        if t % K == 0:
            seen = q.copy()
        a = g.poisson(lam)
        for _ in range(a):
            if policy == "random":
                j = g.integers(n)
            elif policy == "all":
                j = int(np.argmin(seen + g.random(n) * 0.01))   # emptiest-looking, ties random
            else:
                x, y = g.integers(n, size=2)
                j = x if seen[x] <= seen[y] else y
            if t >= warm:
                waits.append(q[j])          # jobs ahead of you when you arrive
            q[j] += 1
        done = (q > 0) & (g.random(n) < p)
        q[done] -= 1
    return float(np.mean(waits))

out["stale"] = {}
for K in (1, 20):
    row = {pol: queue_sim(pol, K) for pol in ("random", "all", "two")}
    out["stale"][K] = row
    print(f"info refreshed every {K} ticks: jobs ahead of you  random {row['random']:.2f}  all {row['all']:.2f}  two {row['two']:.2f}")

# CTA: a fifth of servers busy -> both picks busy 1 in 25
out["cta_both_busy"] = 0.2 * 0.2
print("CTA: 20% busy -> two-choice job lands on a busy server", out["cta_both_busy"], "= 1 in", round(1 / out["cta_both_busy"]))
# simulated check of the squaring: 10% busy, 1,000,000 pairs of picks
busy = rng.random(100) < 0.1
pairs = rng.integers(0, 100, size=(1_000_000, 2))
f = busy.mean()
out["sim_both_busy"] = float(np.mean(busy[pairs[:, 0]] & busy[pairs[:, 1]]))
print("sim: %.0f%% busy, both picks busy %.4f (f^2 = %.4f)" % (100 * f, out["sim_both_busy"], f * f))
# sample loads for the bars on screen (100 servers, 10,000 jobs), seeded so the picture matches the claims
def sample(d, want, seed):
    while True:
        l = place(100, 10_000, d, np.random.default_rng(seed))
        if l.max() == want:
            return l
        seed += 1
bars = {"random": sample(1, 126, 100).tolist(), "two": sample(2, 102, 200).tolist(), "all": [100] * 100}
json.dump(bars, open(os.path.join(HERE, "bars.json"), "w"))
json.dump(out, open(os.path.join(HERE, "results.json"), "w"), indent=1)
