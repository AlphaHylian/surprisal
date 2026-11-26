"""Every number in the heating-off Short (heating on all day vs off while you're out).
Model (Newton's law of cooling, the standard one-node house model): heat leaks out at k * (T_in - T_out),
k = 0.2 kW per degree C (a modest, reasonably insulated house). Thermal mass C = k * tau. Outside 0 C,
thermostat 20 C, you're out 9 hours. tau chosen so the house cools from 20 to 15 C in those 9 hours.
Sources: heat loss depends on the indoor-outdoor difference (https://www.energyvanguard.com/blog/do-programmable-thermostats-save-energy/);
US DOE Energy Saver: reheating-costs-more is 'a common misconception'; up to 10% a year from turning back
7-10 F for 8 hours a day (https://www.energy.gov/energysaver/thermostats)."""
import math, random

ok = True
def check(name, got, want, tol=0.5):
    global ok
    good = abs(got - want) <= tol
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got:.4g} (script: {want})")

k, T_in, T_out, hours = 0.2, 20.0, 0.0, 9.0
tau = hours / math.log(20 / 15)
C = k * tau
check("leak with heating on: 4 kW", k * (T_in - T_out), 4, 1e-9)
on = k * (T_in - T_out) * hours
check("heating on, 9 hours: 36 kWh", on, 36, 1e-9)
T_end = T_out + (T_in - T_out) * math.exp(-hours / tau)
check("heating off: house cools to 15 C", T_end, 15, 1e-6)
check("leak when it's at 15: 3 kW", k * (T_end - T_out), 3, 1e-6)
leaked_off = k * (T_in - T_out) * tau * (1 - math.exp(-hours / tau))
reheat = C * (T_in - T_end)
check("warm-up energy = what leaked while you were out", reheat - leaked_off, 0, 1e-9)
check("warm-up: about 31 kWh", reheat, 31, 0.5)
check("saved: about 5 kWh", on - reheat, 5, 0.5)
check("saved: 13% of those 9 hours", 100 * (on - reheat) / on, 13, 0.5)
print(f"   tau = {tau:.1f} h, C = {C:.2f} kWh/C, warm-up {reheat:.2f} kWh, saved {on-reheat:.2f} kWh")

# CTA: out twice as long (18 h): do you save twice as much? No, more than twice (savings are convex in time).
def saved(d):
    return k * (T_in - T_out) * d - k * (T_in - T_out) * tau * (1 - math.exp(-d / tau))
r = saved(18) / saved(9)
print(f"   CTA: 18 h off saves {saved(18):.1f} kWh = {r:.2f}x the 9-hour saving")
check("CTA: twice as long saves more than twice (ratio > 2)", r > 2, True, 0)

# Simulation: a thermostat with a finite boiler (time steps of 1 minute) over a whole day, for 100,000 random
# houses (k, tau, boiler power, outdoor temp, time away). Off-while-away never uses more heat than always-on,
# including the slow warm-up afterwards.
random.seed(1)
worst = 1e9
for trial in range(100_000):
    kk = random.uniform(0.05, 0.5); tt = random.uniform(5, 80); P = kk * random.uniform(25, 60)
    To = random.uniform(-20, 12); away = random.uniform(1, 14)
    dt = 1 / 30
    def run(setback):
        T, used, t = 20.0, 0.0, 0.0
        while t < 24:
            target = 20.0 if not (setback and t < away) else -99
            need = kk * (T - To)  # leak
            heat = 0.0
            if T < target - 1e-9: heat = P
            elif T >= target and target > -99: heat = min(P, need)  # hold the setpoint
            if target > -99 and T < target and T + (heat - need) * dt / (kk * tt) > target:
                heat = need + (target - T) * kk * tt / dt
            T += (heat - need) * dt / (kk * tt); used += heat * dt; t += dt
        return used, T
    u_on, _ = run(False); u_off, Tend = run(True)
    worst = min(worst, u_on - u_off)
check("100,000 random houses: switching off never uses more (min saving >= 0)", worst >= -1e-6, True, 0)
print(f"   smallest saving over 100,000 houses: {worst:.4f} kWh")
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
