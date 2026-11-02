"""Every number in the green-wave episode, computed and simulated.
Road (an example, stated as one): you ride through a green light, then 10 more lights, 250 m apart (2.5 km, the length of
Copenhagen's Norrebrogade green wave). All lights run a 60 s cycle: 30 s green, 30 s red. Each light turns green
45 s after the one before: the time a bike at 20 km/h needs for 250 m (offset = distance / wave speed, Wikipedia
'Green wave'). Starting instantly from a stop is assumed (generous to the fast rider).
Sources: https://en.wikipedia.org/wiki/Green_wave (Copenhagen: ~20 km/h over 2.5 km on Norrebrogade)."""
import json
import random
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

GAP, LIGHTS, CYCLE, GREEN = 250.0, 10, 60.0, 30.0
def secs(kmh):
    return GAP / (kmh / 3.6)
OFF = secs(20)
check("offset: 250 m at 20 km/h (s)", round(OFF, 6), 45.0)
check("250 m at 30 km/h (s)", round(secs(30), 6), 30.0)
check("road length (km)", GAP * LIGHTS / 1000, 2.5)
check("no lights: 2.5 km at 20 (min)", round(GAP * LIGHTS / (20 / 3.6) / 60, 6), 7.5)
check("no lights: 2.5 km at 30 (min)", round(GAP * LIGHTS / (30 / 3.6) / 60, 6), 5.0)
check("no lights, 30 would save (min)", 7.5 - 5.0, 2.5)

def is_green(k, t):
    # light k (0 = the one you pass at t in its green window) is green when (t - k*OFF) mod CYCLE < GREEN
    return ((t - k * OFF) % CYCLE) < GREEN - 1e-9
def wait_until_green(k, t):
    ph = (t - k * OFF) % CYCLE
    return 0.0 if ph < GREEN - 1e-9 else CYCLE - ph

def ride(kmh, phase0):
    """start through light 0 at time phase0 (0 <= phase0 < 30 = how far into its green). returns (arrival time past last light, stops)"""
    t, stops = phase0, 0
    for k in range(1, LIGHTS + 1):
        t += secs(kmh)
        w = wait_until_green(k, t)
        if w > 0:
            stops += 1
            t += w
    return t - phase0, stops

# the slow rider never stops, whatever their phase
for ph in [0, 7.5, 15, 29.9]:
    tt, s = ride(20, ph)
    check(f"20 km/h from phase {ph}: stops", s, 0)
    check(f"20 km/h from phase {ph}: time (s)", round(tt, 6), 450.0)
# fast rider through the light as it turns green: stops at all 10, saves nothing
tt, s = ride(30, 0.0)
check("30 km/h, through as it turns green: stops", s, 10)
check("30 km/h, through as it turns green: saved (s)", round(450 - tt, 6), 0.0)
# halfway through the green
tt, s = ride(30, 15.0)
check("30 km/h, halfway into green: stops", s, 9)
check("30 km/h, halfway into green: saved (s)", round(450 - tt, 6), 15.0)
# the best case: saved never reaches 30 s (one green)
rng = random.Random(3)
N = 200_000
saved, stops = [], []
for _ in range(N):
    ph = rng.uniform(0, GREEN)
    tt, s = ride(30, ph)
    saved.append(450 - tt); stops.append(s)
check("random start: saved always under 30 s", max(saved) < 30, True)
check("random start: saved = how far into the green you were (avg ~15 s)", round(sum(saved) / N), 15)
check("random start: at least 9 stops", min(stops) >= 9, True)
check("random start: average stops (about 9.5)", round(sum(stops) / N, 1), 9.5)
print(f"sim {N:,} random starts at 30 km/h: avg saved {sum(saved)/N:.2f} s, max {max(saved):.2f}, avg stops {sum(stops)/N:.2f}")
# any faster speed (that still arrives during the red) also stops: check 25, 40 km/h
for v in (25, 40):
    tt, s = ride(v, 10.0)
    print(f"{v} km/h from phase 10: {s} stops, saved {450 - tt:.1f} s")
    check(f"{v} km/h saved = phase (10 s)", round(450 - tt, 6), 10.0)
# the stop at each light lasts 15 s (30 - 45 = arrive 15 s before green)
t = 0.0 + secs(30)
check("first wait at 30 km/h from green start (s)", round(wait_until_green(1, t), 6), 15.0)

print("ALL OK" if ok else "SOME CHECKS FAILED")
Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
raise SystemExit(0 if ok else 1)
