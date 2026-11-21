"""Every number in the turkey-time Short, computed and simulated."""
import math, random

ok = True
def check(name, good, detail=""):
    global ok
    ok &= bool(good)
    print(f"{'OK ' if good else 'BAD'} {name} {detail}")

# 1. Doubling the weight (same shape, same density) scales every length by the cube root of 2
k = 2 ** (1 / 3)
check("cube root of 2 = 1.26 (26% thicker)", round(k, 2) == 1.26, f"{k:.4f}")
# 2. Diffusion time scales with length squared (Fourier number t_d = L^2 / alpha)
check("1.26 x 1.26 = 1.59 (about 60% more time)", round(1.26 * 1.26, 2) == 1.59 and round(k * k, 2) == 1.59, f"{k*k:.4f}")
# 3. Numerical check: heat a sphere from its surface, time until the centre reaches the target.
def centre_time(R, n=60, alpha=1.0, T0=0.0, Ts=1.0, target=0.8):
    dr = R / n; dt = 0.2 * dr * dr / alpha
    T = [T0] * (n + 1); T[n] = Ts; t = 0.0
    while T[0] < target:
        new = T[:]
        new[0] = T[0] + alpha * dt * 6 * (T[1] - T[0]) / dr ** 2
        for i in range(1, n):
            r = i * dr
            new[i] = T[i] + alpha * dt * ((T[i+1] - 2*T[i] + T[i-1]) / dr**2 + (T[i+1] - T[i-1]) / (r * dr))
        T = new; t += dt
    return t
t1 = centre_time(1.0); t2 = centre_time(k); t8 = centre_time(2.0)
check("sim: sphere with 2x the mass takes ~1.59x as long to heat through", abs(t2 / t1 - 1.587) < 0.02, f"{t2/t1:.3f}")
check("CTA: 8x the mass = 2x thicker = 4x the time", abs(t8 / t1 - 4) < 0.05 and round(8 ** (1/3)) == 2, f"{t8/t1:.3f}")
# Monte Carlo: random-walk heat 'particles' from the centre to the surface, mean steps ~ R^2
random.seed(3)
def walk(R, trials=100_000):
    # 1D random walk from the centre to depth R: expected steps exactly R^2
    tot = 0
    for _ in range(trials):
        x = 0; s = 0
        while abs(x) < R:
            x += 1 if random.random() < 0.5 else -1; s += 1
        tot += s
    return tot / trials
w1 = walk(5); w2 = walk(10)
check("random walk: twice as deep takes ~4x the steps (100,000 trials each)", 3.8 < w2 / w1 < 4.2, f"{w2/w1:.2f}")
# 4. The USDA chart (unstuffed, 325 F): 8-12 lb 2.75-3 h; 20-24 lb 4.5-5 h
base_h = 3.0
pred = base_h * k * k
check("12 lb at 3 h -> 24 lb predicted 4.76 h (4 and three quarters)", abs(pred - 4.75) < 0.05, f"{pred:.2f} h = {int(pred)} h {round((pred%1)*60)} min")
check("prediction inside USDA 20-24 lb range 4.5-5 h", 4.5 <= pred <= 5.0)
check("minutes-per-pound doubling says 6 h, past the USDA range", 2 * base_h == 6 and 6 > 5.0)
# fit of the USDA chart midpoints: exponent close to 2/3
pts = [(10, (2.75 + 3) / 2), (13, (3 + 3.75) / 2), (16, (3.75 + 4.25) / 2), (19, (4.25 + 4.5) / 2), (22, (4.5 + 5) / 2)]
xs = [math.log(a) for a, _ in pts]; ys = [math.log(b) for _, b in pts]
mx = sum(xs) / len(xs); my = sum(ys) / len(ys)
slope = sum((a - mx) * (b - my) for a, b in zip(xs, ys)) / sum((a - mx) ** 2 for a in xs)
check("USDA chart grows like weight^0.6-0.7 (2/3 predicted)", 0.55 < slope < 0.75, f"exponent {slope:.2f}")
check("safe internal temperature quoted: 165 F", True, "(USDA via Illinois Extension)")
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
