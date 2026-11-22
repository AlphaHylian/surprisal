"""Every number in the plane-boarding Short, computed or sourced.

Measured times come from Steffen & Hotchkiss, "Experimental test of airplane boarding methods",
J. Air Transport Management 2012 (arXiv 1108.5211, Table 1, 'Official' column): 72 passengers,
12 rows of 6 seats, one aisle. The simulation below is a simple aisle model (one passenger per
row-space of aisle, walking one row per tick, stopping to stow a bag, then sitting; seat
shuffles when someone nearer the aisle is already seated). It isn't meant to reproduce the
seconds, only the ranking and the size of the gaps, over 100,000+ boardings in total.
"""
import random

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def secs(m, s): return 60 * m + s
measured = {"back-front": secs(6, 11), "blocks": secs(6, 54), "wilma": secs(4, 13), "steffen": secs(3, 36), "random": secs(4, 44)}
ROWS, SEATS = 12, "ABCDEF"
check("passengers", ROWS * len(SEATS), 72)
check("random beats back-to-front by (s)", measured["back-front"] - measured["random"], 87)
check("Steffen beats back-to-front by (s)", measured["back-front"] - measured["steffen"], 155)
check("Steffen vs back-to-front, % faster (rounded)", round(100 * (1 - measured["steffen"] / measured["back-front"])), 42)
check("aisle waits in strict back-to-front (72 people, each waits for the one before)", 72 - 1, 71)

# Seat letters: A/F window, B/E middle, C/D aisle.
COL = {"A": 0, "B": 1, "C": 2, "D": 2, "E": 1, "F": 0}   # 0 window .. 2 aisle
SIDE = {"A": 0, "B": 0, "C": 0, "D": 1, "E": 1, "F": 1}

def order(method, rng):
    seats = [(r, s) for r in range(1, ROWS + 1) for s in SEATS]
    if method == "random":
        rng.shuffle(seats); return seats
    if method == "back-front":   # the paper's: back row windows, middles, aisles, then the next row forward
        return sorted(seats, key=lambda x: (-x[0], COL[x[1]], SIDE[x[1]]))
    if method == "wilma":
        out = []
        for c in (0, 1, 2):
            g = [x for x in seats if COL[x[1]] == c]; rng.shuffle(g); out += g
        return out
    if method == "steffen":      # 12F 10F 8F ... 2F, 12A 10A ..., 11F 9F ..., 11A ..., then middles, aisles
        out = []
        for c in (0, 1, 2):
            for parity in (0, 1):
                for side in (1, 0):
                    out += [x for x in sorted(seats, key=lambda x: -x[0])
                            if COL[x[1]] == c and SIDE[x[1]] == side and (ROWS - x[0]) % 2 == parity]
        return out
    raise ValueError(method)

def board(method, rng):
    q = order(method, rng)
    # aisle positions 0 (door, in front of row 1) .. ROWS; each holds at most one passenger
    stow = {p: rng.uniform(3, 9) for p in q}        # ticks to stow a bag (1 tick ~ 1 row of walking)
    seated = set()
    aisle = {}            # position -> [passenger, remaining work or None while walking]
    queue = list(q)
    t = 0
    done = 0
    while done < len(q):
        t += 1
        # process from the back of the plane forward so people can step into freed spaces
        for pos in sorted(aisle, reverse=True):
            p, work = aisle[pos]
            row, seat = p
            if pos == row:
                if work is None:
                    blockers = sum(1 for s in SEATS if SIDE[s] == SIDE[seat] and COL[s] > COL[seat] and (row, s) in seated)
                    work = stow[p] + 4 * blockers
                work -= 1
                if work <= 0:
                    del aisle[pos]; seated.add(p); done += 1
                else:
                    aisle[pos] = [p, work]
            elif pos + 1 not in aisle:
                del aisle[pos]; aisle[pos + 1] = [p, None]
        if queue and 1 not in aisle and 0 not in aisle:
            aisle[0] = [queue.pop(0), None]
            if aisle[0][0][0] == 0: pass
    return t

rng = random.Random(1)
N = 25_000
res = {}
for m in ("back-front", "random", "wilma", "steffen"):
    ts = [board(m, rng) for _ in range(50_000 if m in ("random", "wilma") else 2000)]
    res[m] = sum(ts) / len(ts)
    print(f"sim {m:11s} mean {res[m]:7.1f} ticks  (relative to back-front {res[m] / res['back-front'] if 'back-front' in res else 1:.2f})")
print("simulated boardings:", 2 * 50_000 + 2 * 2000)
check("sim ranking steffen < wilma < random < back-front", res["steffen"] < res["wilma"] < res["random"] < res["back-front"], True)
meas_rank = sorted(["back-front", "random", "wilma", "steffen"], key=lambda m: measured[m])
check("measured ranking matches", meas_rank, ["steffen", "wilma", "random", "back-front"])
check("CTA: 30-row plane, after 30F comes", f"{30 - 2}F", "28F")
print("ALL OK" if ok else "SOME CHECKS FAILED")
