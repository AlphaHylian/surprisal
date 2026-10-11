"""Power of two choices: 100 servers, 10,000 jobs. Every number in the Short is computed here."""
import numpy as np

rng = np.random.default_rng(11)
N, M, TRIALS = 100, 10_000, 2_000   # 2,000 trials x 10,000 jobs = 20 million placements per method


def run(d):
    maxes = []
    for _ in range(TRIALS):
        load = np.zeros(N, dtype=int)
        picks = rng.integers(0, N, size=(M, d))
        if d == 1:
            load = np.bincount(picks[:, 0], minlength=N)
        else:
            for row in picks:
                j = row[np.argmin(load[row])]
                load[j] += 1
        maxes.append(load.max())
    return np.array(maxes)


avg = M // N
print("average per server:", avg)
r1 = run(1)
print(f"random:      worst server avg {r1.mean():.1f} (median {np.median(r1):.0f}), extra {r1.mean()-avg:.1f}"
      f" = {100*(r1.mean()-avg)/avg:.0f}% over; range {r1.min()}-{r1.max()}")
TRIALS = 300
r2 = run(2)
print(f"two choices: worst server avg {r2.mean():.1f} (median {np.median(r2):.0f}), extra {r2.mean()-avg:.1f}; range {r2.min()}-{r2.max()}")
r3 = run(3)
print(f"three:       worst server avg {r3.mean():.1f}, extra {r3.mean()-avg:.1f}")
print(f"reduction in the excess: {(r1.mean()-avg)/(r2.mean()-avg):.1f}x")

# small illustration: 10 servers, 50 jobs, one seeded run each (for the on-screen bars)
rng2 = np.random.default_rng(4)
load = np.bincount(rng2.integers(0, 10, 50), minlength=10)
print("demo random 10 servers / 50 jobs:", load.tolist(), "max", load.max())

# checking all 100 every time (always the emptiest): perfectly even
load = np.zeros(N, dtype=int)
for _ in range(M):
    load[np.argmin(load)] += 1
print("check all 100: worst server", load.max())

# why two works: a job lands on a server with load >= k only if BOTH picks have load >= k.
# if a fraction f of servers is that busy, the chance is f*f (10% busy -> 1 in 100 jobs)
print("both picks busy when 10% of servers are busy:", 0.1 * 0.1)

# one sample run of each, for the bars on screen (seeded so the picture matches the claims)
def sample(d, want, seed0):
    s = seed0
    while True:
        g = np.random.default_rng(s)
        load = np.zeros(N, dtype=int)
        for row in g.integers(0, N, size=(M, d)):
            j = row[np.argmin(load[row])] if d > 1 else row[0]
            load[j] += 1
        if load.max() == want:
            return s, load
        s += 1
s1, l1 = sample(1, 126, 100)
s2, l2 = sample(2, 102, 200)
import json
json.dump({"random": l1.tolist(), "two": l2.tolist()}, open(__import__("os").path.join(__import__("os").path.dirname(__import__("os").path.abspath(__file__)), "bars.json"), "w"))
print("sample seeds", s1, s2, "random min/max", l1.min(), l1.max(), "two min/max", l2.min(), l2.max())
