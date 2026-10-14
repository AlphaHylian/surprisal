"""Every number in the GPS how-to episode, computed or sourced."""
import numpy as np

ok = True
def check(name, got, want, tol=0):
    global ok
    good = abs(got - want) <= tol if isinstance(want, (int, float)) else got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

c = 299_792_458.0  # m/s
alt = 20_200e3     # m, GPS orbit altitude (Wikipedia: ~20,200 km; 20,180-20,184 km)

# 1. Signal from a satellite straight overhead takes ~67 thousandths of a second
check("travel time overhead (ms)", round(alt / c * 1000), 67)
# 2. A clock off by a millionth of a second -> ~300 m
check("1 microsecond of clock error (m)", round(1e-6 * c), 300, tol=1)
# 3. Relativity: satellite clocks gain 38 microseconds/day -> ~11 km/day uncorrected
check("38 us/day -> km/day", round(38e-6 * c / 1000), 11)

# 4. Solve a fix: phone at a real spot, 4 satellites, phone clock off by 1 microsecond.
rng = np.random.default_rng(1)
R = 6_371e3
me = np.array([0.0, 0.0, R])
def sat_positions(k):
    out = []
    for _ in range(k):
        while True:
            v = rng.normal(size=3); v /= np.linalg.norm(v)
            p = v * (R + alt)
            if (p - me) @ me / np.linalg.norm(me) > 0.3 * np.linalg.norm(p - me):  # above ~17 deg elevation
                out.append(p); break
    return np.array(out)

def solve(sats, pr, unknown_clock):
    x = np.array([0.0, 0.0, 0.0, 0.0])
    for _ in range(50):
        d = np.linalg.norm(sats - x[:3], axis=1)
        res = pr - (d + x[3])
        J = np.hstack([-(sats - x[:3]) / d[:, None], np.ones((len(sats), 1))])
        if not unknown_clock:
            J = J[:, :3]
        dx = np.linalg.lstsq(J, res, rcond=None)[0]
        x[:len(dx)] += dx
    return x

bias = 1e-6 * c  # cheap clock off by 1 microsecond
errs3, errs4 = [], []
for _ in range(2000):
    s4 = sat_positions(4)
    pr4 = np.linalg.norm(s4 - me, axis=1) + bias
    x4 = solve(s4, pr4, True)
    errs4.append(np.linalg.norm(x4[:3] - me))
    # 3 satellites + assume the clock is right: the 3 spheres meet in the wrong place
    x3 = solve(s4[:3], pr4[:3], False)
    errs3.append(np.linalg.norm(x3[:3] - me))
check("4 satellites, clock solved: error (m)", round(float(np.median(errs4)), 3), 0.0, tol=0.01)
check("4 satellites recover the 1 us clock error (us)", round(float(x4[3] / c * 1e6), 3), 1.0, tol=0.001)
print(f"    3 satellites, clock ignored: median error {np.median(errs3):.0f} m (min {np.min(errs3):.0f})")
check("3 satellites + clock off 1 us: hundreds of metres off", bool(np.median(errs3) > 300), True)

# 5. Sourced facts (https://en.wikipedia.org/wiki/Global_Positioning_System, fetched 2026-10-14):
#    receive-only; 4 satellites for x, y, z and clock offset; 31 operational; phones ~4.9 m or better;
#    full constellation 1993; relativity 38 microseconds/day.
print("ALL OK" if ok else "SOMETHING FAILED")
raise SystemExit(0 if ok else 1)
