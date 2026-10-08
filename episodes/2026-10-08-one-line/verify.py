"""Every number in the supermarket one-line how-to episode (queue simulation)."""
import heapq, random
from collections import deque

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

TILLS = 4
ARRIVE = 1.6          # shoppers per minute (one every 37.5 s)
SLOW = 0.1            # 1 in 10 shoppers is slow (price check, coupons...)
FAST_MEAN, SLOW_MEAN = 1.5, 6.5   # minutes at the till
MEAN = (1 - SLOW) * FAST_MEAN + SLOW * SLOW_MEAN
N = 400_000

def run(mode, seed):
    rnd = random.Random(seed)
    serv = lambda: rnd.expovariate(1 / SLOW_MEAN) if rnd.random() < SLOW else rnd.expovariate(1 / FAST_MEAN)
    t, waits, starts = 0.0, [], []
    if mode == "one line":
        free = [0.0] * TILLS
        for _ in range(N):
            t += rnd.expovariate(ARRIVE)
            f = heapq.heappop(free); s = max(t, f)
            waits.append(s - t); starts.append(s); heapq.heappush(free, s + serv())
    else:  # separate lines: each shopper joins the shortest line and stays in it
        lines, last = [deque() for _ in range(TILLS)], [0.0] * TILLS
        for _ in range(N):
            t += rnd.expovariate(ARRIVE)
            for L in lines:
                while L and L[0] <= t: L.popleft()
            k = min(range(TILLS), key=lambda j: (len(lines[j]), rnd.random()))
            s = max(t, last[k]); d = s + serv(); last[k] = d; lines[k].append(d)
            waits.append(s - t); starts.append(s)
    w = sorted(waits[N // 10:]); m = len(w)        # drop the warm-up
    st = starts[N // 10:]; over, mn = 0, float("inf")
    for x in reversed(st):                        # overtaken = someone who came later reached a till first
        if mn < x: over += 1
        mn = min(mn, x)
    return sum(w) / m, w[int(0.99 * m)], over / len(st)

check("average checkout = 2 minutes", round(MEAN, 2), 2.0)
check("one shopper every 37.5 seconds", 60 / ARRIVE, 37.5)
check("tills busy 80% of the time", round(ARRIVE * MEAN / TILLS, 2), 0.8)
check("4 lines: yours is fastest 1 time in 4 (symmetry)", 1 / TILLS, 0.25)
check("... so 3 times in 4 another line wins", 1 - 1 / TILLS, 0.75)
check("CTA: 5 lanes -> another wins 4 in 5 = 80%", round(100 * (1 - 1 / 5)), 80)
check("one line steps forward every 30 s on average (4 tills, 2 min each)", MEAN / TILLS * 60, 30.0)

# 4 equal lines race (each needs 5 shoppers served): how often is yours (line 0) first?
rnd = random.Random(7); wins = 0; R = 100_000
for _ in range(R):
    times = [sum(rnd.expovariate(1 / FAST_MEAN) if rnd.random() > SLOW else rnd.expovariate(1 / SLOW_MEAN) for _ in range(5)) for _ in range(4)]
    wins += times[0] == min(times)
print(f"   race simulation: your line first {wins / R:.3f}")
check("race sim ~ 1 in 4", abs(wins / R - 0.25) < 0.01, True)

res = {"separate": [], "one line": []}
for seed in (1, 2, 3, 4, 5):
    for mode in res:
        res[mode].append(run(mode, seed))
    print(f"   seed {seed}: separate {res['separate'][-1]} | one line {res['one line'][-1]}")
avg = {m: [sum(r[k] for r in v) / len(v) for k in range(3)] for m, v in res.items()}
sep, one = avg["separate"], avg["one line"]
print(f"   pooled: separate avg {sep[0]:.2f} min, worst 1 in 100 {sep[1]:.1f} min, overtaken {sep[2]:.3f}")
print(f"   pooled: one line avg {one[0]:.2f} min, worst 1 in 100 {one[1]:.1f} min, overtaken {one[2]:.3f}")
check("separate lines: average wait ~3 minutes", round(sep[0]), 3)
check("one line: average wait ~2 minutes", round(one[0]), 2)
check("average wait drops by about a quarter", round(4 * (1 - one[0] / sep[0])), 1)
check("separate lines: worst 1 in 100 wait 26 minutes", round(sep[1]), 26)
check("one line: worst 1 in 100 wait 17 minutes", round(one[1]), 17)
check("worst waits drop by about a third", round(3 * (1 - one[1] / sep[1])), 1)
check("separate lines: nearly 1 in 3 shoppers overtaken", round(3 * sep[2]), 1)
check("... just under a third", sep[2] < 1 / 3, True)
check("one line: nobody overtaken", one[2], 0.0)
print("ALL OK" if ok else "SOMETHING FAILED")
raise SystemExit(0 if ok else 1)
