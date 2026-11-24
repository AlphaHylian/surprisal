"""Every number in the rain-run Short, computed and simulated.
Model (standard walk-or-run-in-the-rain model; Bocci 2012, Eur. J. Phys. 33, 1321):
a person is a box, rain falls straight down at the drops' terminal speed.
Top catches (rain rate) x (top area) x (time); front sweeps the drops hanging in the air
along the path: (water per m^3 of air) x (front area) x (distance), whatever the speed."""
import random, math
ok = True
def check(name, good, detail=""):
    global ok
    ok &= bool(good)
    print(f"{'OK ' if good else 'BAD'} {name} {detail}")

D = 100.0                 # m to home
R = 10e-3 / 3600          # heavy rain, 10 mm/h, in m/s (m^3 of water per m^2 per s)
u = 8.0                   # drop fall speed, 3 mm drops ~8 m/s (Wikipedia, Raindrop)
A_top, A_front = 0.40 * 0.25, 1.75 * 0.40   # m^2: shoulders 40 x 25 cm, body 1.75 m x 40 cm
v_walk, v_run = 1.5, 4.5  # m/s

def wet(v):
    top = R * A_top * D / v
    front = (R / u) * A_front * D
    return top * 1e6, front * 1e6   # millilitres

tw, fw = wet(v_walk); tr, fr = wet(v_run)
print(f"walk: top {tw:.1f} front {fw:.1f} total {tw+fw:.1f} mL | run: top {tr:.1f} front {fr:.1f} total {tr+fr:.1f} mL")
check("walk 100 m at 1.5 m/s = 67 s", round(D / v_walk) == 67)
check("run 3x faster = 22 s", round(D / v_run) == 22 and v_run / v_walk == 3)
check("top: 19 mL walking, 6 running (a third)", round(tw) == 19 and round(tr) == 6 and abs(tr / tw - 1 / 3) < 1e-9)
check("front: 24 mL either way", round(fw) == 24 and abs(fw - fr) < 1e-9)
check("total: walk 43, run 30", round(tw + fw) == 43 and round(tr + fr) == 30)
drier = 1 - (tr + fr) / (tw + fw)
check("running is about 29% drier", round(drier * 100) == 29, f"{drier:.3f}")
inf = fw / (tw + fw)
check("infinite speed still 57% as wet as walking (more than half)", round(inf * 100) == 57 and inf > 0.5, f"{inf:.3f}")
check("front is 7x the top area", round(A_front / A_top) == 7)
# CTA: twice as far, does running save more? No: both terms scale with distance
def ratio(Dd):
    t = lambda v: R * A_top * Dd / v + (R / u) * A_front * Dd
    return 1 - t(v_run) / t(v_walk)
check("CTA: twice as far, still 29% (same share)", abs(ratio(200) - ratio(100)) < 1e-12)

# Monte Carlo: drops in a column of air, a box walking through it; count hits on top and front.
# Drops are uniform in space with density n (per m^3), all falling at u. In the walker's frame
# a drop moves at (-v, -u). Count drops whose path crosses the top face or the front face.
random.seed(1)
def simulate(v, n_drops=400_000):
    T = D / v
    # world: x along the path. Drops at time 0 at (x, z); x in [-1, D+1+u*0], z in [0, H + u*T]
    H = 1.75; W = 0.25            # depth of the box along the path (top face is W x 0.40)
    X0, X1 = -1.0, D + 1.0
    Z1 = H + u * T + 0.01
    vol_per_width = (X1 - X0) * Z1   # m^2 per metre of width; width of box = 0.40 m
    n = R / u / 1e-6 * 0 + 1.0       # we scale by counts, see below
    top = front = 0
    for _ in range(n_drops):
        x = random.uniform(X0, X1); z = random.uniform(0, Z1)
        # box occupies x in [v t, v t + W] (front face at v t + W), z in [0, H]
        # top face hit: drop reaches z = H at t = (z - H)/u, must be inside box then
        hit = False
        if z >= H:
            t = (z - H) / u
            if t <= T and v * t <= x <= v * t + W:
                top += 1; hit = True
        if not hit:
            # front face at x_f(t) = v t + W meets drop (fixed x) when t = (x - W)/v
            t = (x - W) / v
            if 0 <= t <= T and 0 <= z - u * t <= H:
                front += 1
    # convert counts to volume: each drop represents (vol_per_width * 0.40 / n_drops) m^3 of air,
    # air holds R/u m^3 of water per m^3
    water_per_drop = (vol_per_width * 0.40 / n_drops) * (R / u) * 1e6
    return top * water_per_drop, front * water_per_drop
st, sf = simulate(v_walk); rt, rf = simulate(v_run)
print(f"simulated walk: top {st:.1f} front {sf:.1f} | run: top {rt:.1f} front {rf:.1f}")
check("simulation (800,000 drops): front same walking and running (within 5%)", abs(sf - rf) / fw < 0.05)
check("simulation: top matches 19 / 6 (within 7%)", abs(st - tw) / tw < 0.07 and abs(rt - tr) / tr < 0.07)
check("simulation: running ~29% drier (within 3 points)", abs((1 - (rt + rf) / (st + sf)) - drier) < 0.03)
print("ALL OK" if ok else "SOME CHECKS FAILED")
