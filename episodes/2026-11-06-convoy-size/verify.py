"""Every number in the convoy-size episode (Blackett's convoy-size analysis, 1943), computed and simulated.
Sources: https://warhistory.org/2020/09/06/may-1943-climax-in-the-atlantic-i/ (Blackett's figures: convoys under
40 ships, average 32, lost 2.5%; larger ones, average 54, lost 1.1%; Admiralty optimum ~40, max 60; sighting about
the same for any size; penetration depends on escorts per mile of perimeter; once inside, sinkings about the same;
spring 1943 new orders, convoys of up to 100 ships) and https://en.wikipedia.org/wiki/Operations_research
(losses depended on the number of escorts, not convoy size; a few large convoys are more defensible than many small)."""
import json, math, random
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def edge(n):  # ships in a k x k square, 1 unit apart: the edge escorts guard has length 4k
    k = math.isqrt(n); assert k * k == n
    return 4 * k

check("25 ships = 5 by 5, edge 20", edge(25), 20)
check("four convoys of 25: edge 80", 4 * edge(25), 80)
check("one convoy of 100 = 10 by 10, edge 40", edge(100), 40)
check("same 100 ships: half the edge", edge(100) / (4 * edge(25)), 0.5)
check("so the same escorts stand twice as close", (4 * edge(25)) // edge(100), 2)
check("CTA: 400 ships = 20 by 20, edge 80, twice the edge of 100", (edge(400), edge(400) // edge(100)), (80, 2))
check("4x the ships, 2x the edge (edge grows like the square root)", edge(400) / edge(100) == math.sqrt(400 / 100), True)

check("illustration: 3 ships lost of 100 = 3%, of 25 = 12%", (round(300/100), round(300/25)), (3, 12))

# Blackett's records (as published): average 32 ships lost 2.5%, average 54 lost 1.1%
small, big = 32 * 0.025, 54 * 0.011
print(f"ships lost per convoy: small {small:.2f}, big {big:.2f}")
check("a big convoy lost fewer ships per convoy, not just a smaller share", big < small, True)
check("2.5% vs 1.1%: big convoys lost less than half the share", 1.1 / 2.5 < 0.5, True)

# simulation of the model: a U-boat attacks a random point of the edge; escorts spaced evenly along it
# each guard covers 2 units of edge either side (radius r); the U-boat slips in if it's farther than r
# from every escort. Once in, it sinks 1-3 ships (same for any size). 12 escorts total in both plans.
rng = random.Random(1943)
def run(n_convoys, ships_each, escorts_total, trials=100_000, r=1.0):
    per = escorts_total // n_convoys
    E = edge(ships_each)
    gap = E / per
    lost = 0
    for _ in range(trials):
        pos = rng.random() * E
        d = min(abs(pos - (i + 0.5) * gap) for i in range(per))
        if d > r:
            lost += rng.randint(1, 3)
    # each convoy is attacked once per trial on average: losses as a share of all 100 ships
    return lost * n_convoys / trials / (n_convoys * ships_each)

s4 = run(4, 25, 16)
s1 = run(1, 100, 16)
print(f"simulated share lost (100,000 attacks per convoy): four of 25 {s4:.3%}, one of 100 {s1:.3%}")
results["sim_four_small"], results["sim_one_big"] = f"{s4:.4f}", f"{s1:.4f}"
check("simulated: one big convoy loses a smaller share than four small", s1 < s4, True)

print("ALL OK" if ok else "SOME CHECKS FAILED")
Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
raise SystemExit(0 if ok else 1)
