"""Every number in the bomber-armor (survivorship bias) how-to episode, computed and simulated.

The video's scenario (said as "say"): 100 bombers, each takes one hit, landing evenly over
4 equal sections (wings, tail, body, engines). A hit anywhere but the engines, the plane gets
home; an engine hit brings it down 3 times in 5.
"""
import random

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

PLANES, SECTIONS = 100, ["wings", "tail", "body", "engines"]
P_LOSS = {"wings": 0, "tail": 0, "body": 0, "engines": 3 / 5}

# Expected values
expected_hits = PLANES / len(SECTIONS)
check("hits per section if fire is even", expected_hits, 25)
seen = {s: expected_hits * (1 - P_LOSS[s]) for s in SECTIONS}
check("holes seen on returning planes", [round(seen[s]) for s in SECTIONS], [25, 25, 25, 10])
missing = expected_hits - seen["engines"]
lost = sum(expected_hits * P_LOSS[s] for s in SECTIONS)
check("engine hits missing", round(missing), 15)
check("planes lost", round(lost), 15)
check("planes back", PLANES - round(lost), 85)

# Simulation: 100,000 missions of 100 planes
random.seed(7)
N = 100_000
tot_seen = {s: 0 for s in SECTIONS}; tot_lost = 0
for _ in range(N):
    for _ in range(PLANES):
        s = random.choice(SECTIONS)
        if random.random() < P_LOSS[s]:
            tot_lost += 1
        else:
            tot_seen[s] += 1
avg = {s: tot_seen[s] / N for s in SECTIONS}
print("   simulated holes per mission:", {s: round(v, 2) for s, v in avg.items()}, "lost", round(tot_lost / N, 2))
check("sim: engines ~10", round(avg["engines"]), 10)
check("sim: other sections ~25", [round(avg[s]) for s in SECTIONS[:3]], [25, 25, 25])
check("sim: lost ~15", round(tot_lost / N), 15)
check("sim: missing engine holes == lost planes", round(25 - avg["engines"]), round(tot_lost / N))

# After armoring the engines (engine hits now survivable): more planes return, with engine holes
check("after armor: engine holes seen", round(expected_hits * (1 - 0)), 25)

print("ALL OK" if ok else "SOMETHING FAILED")
raise SystemExit(0 if ok else 1)
