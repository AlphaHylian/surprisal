"""Every number in the friends-friends how-to episode (the friendship paradox, Feld 1991), computed and simulated."""
import json
import random
from fractions import Fraction as Fr

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# The six-person group on screen: Max knows everyone, Ana-Ben know each other, Cleo/Dev/Eli only know Max
EDGES = [("Max", p) for p in ["Ana", "Ben", "Cleo", "Dev", "Eli"]] + [("Ana", "Ben")]
PEOPLE = ["Max", "Ana", "Ben", "Cleo", "Dev", "Eli"]
friends = {p: set() for p in PEOPLE}
for a, b in EDGES:
    friends[a].add(b); friends[b].add(a)
deg = {p: len(friends[p]) for p in PEOPLE}
favg = {p: Fr(sum(deg[q] for q in friends[p]), deg[p]) for p in PEOPLE}

check("Max has", deg["Max"], 5)
check("Ana has", deg["Ana"], 2)
check("Ben has", deg["Ben"], 2)
check("Cleo/Dev/Eli have", (deg["Cleo"], deg["Dev"], deg["Eli"]), (1, 1, 1))
check("Cleo's only friend has", favg["Cleo"], 5)
check("Ana's friends average", favg["Ana"], Fr(7, 2))
check("Max's friends average", favg["Max"], Fr(7, 5))
losers = [p for p in PEOPLE if deg[p] < favg[p]]
check("people who lose the comparison", len(losers), 5)
check("only Max wins", [p for p in PEOPLE if deg[p] > favg[p]], ["Max"])
check("Max is on friend lists", sum("Max" in friends[p] for p in PEOPLE), 5)
check("Cleo is on friend lists", sum("Cleo" in friends[p] for p in PEOPLE), 1)
mean_deg = Fr(sum(deg.values()), len(PEOPLE))
check("average person has", mean_deg, 2)
# average friend = pick a friendship, then one end: sum d^2 / sum d (Feld; mu + sigma^2/mu)
mean_friend = Fr(sum(d * d for d in deg.values()), sum(deg.values()))
check("average friend has", mean_friend, 3)
var = Fr(sum((d - mean_deg) ** 2 for d in deg.values()), len(PEOPLE))
check("mu + var/mu", mean_deg + var / mean_deg, 3)

# Facebook, Ugander et al. 2011 (arXiv 1111.4503): 721 million users, 92.7% fewer than friends' average
check("92.7% said as 93%", round(92.7), 93)

# CTA: three in a line A-B-C: A and C lose (their friend B has 2), B wins: 2 of 3
line = {"A": {"B"}, "B": {"A", "C"}, "C": {"B"}}
lose = sum(len(line[p]) < Fr(sum(len(line[q]) for q in line[p]), len(line[p])) for p in line)
check("CTA line of 3: how many lose", lose, 2)

# Simulate: 200,000 random 'pick a friendship, look at one end' draws in the group
random.seed(1991)
N = 200_000
tot = 0
for _ in range(N):
    a, b = random.choice(EDGES)
    tot += deg[a if random.random() < 0.5 else b]
sim = tot / N
print(f"sim average friend: {sim:.4f} (want 3)")
check("sim avg friend within 0.02 of 3", abs(sim - 3) < 0.02, True)
results["sim_avg_friend"] = sim

# Simulate on random networks: the average friend always has at least as many friends as the average person
worse = 0; frac_lose = []
for trial in range(2000):
    n = 60
    p = random.uniform(0.03, 0.15)
    g = {i: set() for i in range(n)}
    for i in range(n):
        for j in range(i + 1, n):
            if random.random() < p:
                g[i].add(j); g[j].add(i)
    ds = [len(g[i]) for i in range(n)]
    if sum(ds) == 0:
        continue
    mf = sum(d * d for d in ds) / sum(ds)
    md = sum(ds) / n
    worse += mf < md - 1e-12
    active = [i for i in range(n) if ds[i] > 0]
    frac_lose.append(sum(ds[i] < sum(ds[j] for j in g[i]) / ds[i] for i in active) / len(active))
check("random networks where average friend < average person", worse, 0)
print(f"random networks: share who lose the comparison {sum(frac_lose)/len(frac_lose):.3f}")

json.dump(results, open(__file__.replace("verify.py", "results.json"), "w"), indent=1)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
