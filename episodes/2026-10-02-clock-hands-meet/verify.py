"""Every number in the clock-hands episode, computed exactly and simulated."""
import random
from fractions import Fraction as F

# Positions in turns (0..1) at time t hours: minute hand t mod 1, hour hand t/12 mod 1.
def gap(t):
    return (t - t / 12) % 1  # how far the minute hand is ahead, in turns

# Exact meeting times in [0, 12): minute - hour = whole number of turns -> t*11/12 = k
meets = [F(12 * k, 11) for k in range(11)]
assert all(gap(m) == 0 for m in meets)

def count_events(target):
    """count times in [0,12) where (minute - hour) mod 1 == target (in turns)"""
    # exact: t*11/12 = k + target -> t = 12(k+target)/11
    return len([k for k in range(-1, 13) if 0 <= F(12) * (k + target) / 11 < 12])

def hms(hours):
    s = float(hours) * 3600
    h = int(s // 3600); m = int(s % 3600 // 60); sec = s % 60
    return h, m, sec

rng = random.Random(0)
N = 200_000
# Simulation: pick random moments; the minute hand is ahead of the hour hand by u turns.
# Distribution of the next meeting gap must be uniform on [0, 12/11): check mean = 6/11 h.
waits = []
for _ in range(N):
    t = rng.uniform(0, 12)
    ahead = gap(t)
    waits.append((1 - ahead) * 12 / 11 if ahead else 0)
mean_wait = sum(waits) / N
# Simulation 2: step the clock in 1-second ticks over 12 h and count overlaps (minute passes hour)
ticks = 12 * 3600
cnt = 0
prev = 0.0
for s in range(1, ticks + 1):
    t = s / 3600
    g = (t - t / 12) % 1
    if g < prev:  # wrapped: minute hand caught the hour hand
        cnt += 1
    prev = g
overlaps_ticks = cnt  # passes during (0,12]; the one at 12:00 closes the cycle = the one at 0:00

h3, m3, s3 = hms(meets[3])
hg, mg, sg = hms(F(12, 11))
checks = {
    "hands meet 11 times in 12 hours": (len(meets), 11),
    "count via laps: 12 minute laps - 1 hour lap": (12 - 1, 11),
    "1-second tick simulation counts 11 passes in 12 hours": (overlaps_ticks, 11),
    "meetings per day": (2 * len(meets), 22),
    "only meeting between 11:00 and 1:00 is 12:00": ([m for m in meets if m < 1 or m > 11], [F(0)]),
    "meeting after 3 o'clock at 3:16 (h, min)": ((h3, m3), (3, 16)),
    "... and 22 seconds (rounded)": (round(s3), 22),
    "not at a quarter past three": (meets[3] != F(13, 4), True),
    "gap between meetings 1 h 5 min (h, min)": ((hg, mg), (1, 5)),
    "... and 27 seconds (rounded)": (round(sg), 27),
    "11 equal gaps fill 12 hours": (11 * F(12, 11), 12),
    "simulated mean wait to next meeting within 0.5% of 6/11 h": (abs(mean_wait - 6 / 11) / (6 / 11) < 0.005, True),
    "right angles in 12 hours (closing answer)": (count_events(F(1, 4)) + count_events(F(3, 4)), 22),
    "naive guess for right angles (2 per hour) is 24, not the answer": (2 * 12 != 22, True),
    "opposite in 12 hours": (count_events(F(1, 2)), 11),
}
ok = True
for name, (got, want) in checks.items():
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")
print("meetings:", ["%d:%02d:%05.2f" % hms(m) for m in meets])
print(f"simulated mean wait {mean_wait:.5f} h over {N:,} random moments (exact {6/11:.5f})")
print("ALL OK" if ok else "SOME CHECKS FAILED")
