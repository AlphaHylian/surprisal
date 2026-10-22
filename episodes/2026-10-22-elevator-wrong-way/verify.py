"""Every number in the elevator-paradox how-to episode (Gamow and Stern), computed and simulated.

Model (as in the Wikipedia article): one elevator runs nonstop up and down a shaft at constant speed,
lobby (height 0) to the top floor (height 10). You wait on floor 1. You press the button at a random moment.
"""
import random

ok = True
def check(name, got, want, tol=1e-9):
    global ok
    good = abs(got - want) <= tol if isinstance(want, float) else got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

TOP, YOU = 10, 1
CYCLE = 2 * TOP                # one round trip, in "floor-times"

check("floors above you", TOP - YOU, 9)
check("share of the shaft above you (9 in 10)", (TOP - YOU) / TOP, 0.9)

def next_arrival(phase, h):
    """phase in [0, CYCLE): 0..TOP going up (height = phase), TOP..CYCLE going down.
    Returns (wait, direction) of the next time the car passes height h."""
    up_at, down_at = h, CYCLE - h
    w_up = (up_at - phase) % CYCLE
    w_down = (down_at - phase) % CYCLE
    return (w_up, "up") if w_up < w_down else (w_down, "down")

# exact: the car arrives going down iff it is currently above you (either direction) -> 9/10
# simulation with 1, 2, 3, 10 elevators (independent random phases)
rng = random.Random(22)
N = 200_000
res = {}
for k in (1, 2, 3, 10):
    down = 0
    ups = downs = 0
    for _ in range(N):
        arrivals = [next_arrival(rng.uniform(0, CYCLE), YOU) for _ in range(k)]
        down += min(arrivals)[1] == "down"
    res[k] = down / N
    print(f"    sim {k} elevator(s): first car going down {down / N:.4f}")
check("sim 1 elevator: down 9 in 10 (within 0.005)", abs(res[1] - 0.9) < 0.005, True)
check("more elevators move it toward 50/50", res[1] > res[2] > res[3] > res[10] > 0.5, True)
print(f"    two elevators: about {round(res[2]*100)}% down")
check("two elevators: 82% down (sim, within 0.005)", abs(res[2] - 0.82) < 0.005, True)
# closed form for k independent cars (each above you with chance 0.9): 1/2 + 1/2 (1 - 2*0.1)^k
for k in (1, 2, 3, 10):
    exact = 0.5 + 0.5 * (1 - 2 * YOU / TOP) ** k
    check(f"closed form {k} car(s) {exact:.4f} matches sim within 0.005", abs(exact - res[k]) < 0.005, True)

# 'as many cars go up past you as down': count passes over a long run of one elevator
passes_up = passes_down = 0
step = 0.01
h_prev = 0.0
t = 0.0
for i in range(1, int(CYCLE * 50 / step) + 1):
    ph = (i * step) % CYCLE
    h = ph if ph <= TOP else CYCLE - ph
    if h_prev < YOU <= h:
        passes_up += 1
    if h_prev > YOU >= h:
        passes_down += 1
    h_prev = h
check("passes going up = passes going down over 50 round trips", passes_up == passes_down == 50, True)

# CTA: friend on the top floor (floor 9 of 10: one floor below the top) -> up 9 in 10
FRIEND = 9
check("CTA: friend one floor below the top, car below them (arrives going up) 9 in 10", FRIEND / TOP, 0.9)

print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
