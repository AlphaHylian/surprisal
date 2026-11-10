"""Checks every number in 'stable-match' (Gale-Shapley deferred acceptance).
Source: https://en.wikipedia.org/wiki/Gale%E2%80%93Shapley_algorithm"""
import itertools, json, random

STU = ["Ana", "Ben", "Cy", "Dee"]
SCH = ["Oak", "Elm", "Ash", "Fir"]
# demo preferences (fixed; chosen so the run shows a hold, a rejection and a bump)
SP = {"Ana": ["Oak", "Elm", "Ash", "Fir"], "Ben": ["Oak", "Ash", "Elm", "Fir"],
      "Cy": ["Elm", "Oak", "Fir", "Ash"], "Dee": ["Ash", "Fir", "Oak", "Elm"]}
CP = {"Oak": ["Ben", "Ana", "Cy", "Dee"], "Elm": ["Ana", "Cy", "Dee", "Ben"],
      "Ash": ["Dee", "Cy", "Ben", "Ana"], "Fir": ["Cy", "Dee", "Ana", "Ben"]}

def gs(sp, cp, log=None):
    nxt = {s: 0 for s in sp}; hold = {}; free = list(sp); props = 0; rnd = 0
    while free:
        rnd += 1
        apps = {}
        for s in free:
            c = sp[s][nxt[s]]; nxt[s] += 1; props += 1
            apps.setdefault(c, []).append(s)
        free = []
        for c, ss in apps.items():
            cand = ss + ([hold[c]] if c in hold else [])
            best = min(cand, key=cp[c].index)
            for s in cand:
                if s != best: free.append(s)
            if log is not None: log.append((rnd, c, sorted(ss), hold.get(c), best))
            hold[c] = best
    return {s: c for c, s in hold.items()}, props, rnd

def blocking(m, sp, cp):
    inv = {c: s for s, c in m.items()}
    out = []
    for s in sp:
        for c in cp:
            if m[s] == c: continue
            if sp[s].index(c) < sp[s].index(m[s]) and cp[c].index(s) < cp[c].index(inv[c]):
                out.append((s, c))
    return out

log = []
m, props, rnds = gs(SP, CP, log)
print("demo run:"); [print("  ", l) for l in log]
print("demo match", m, "proposals", props, "rounds", rnds, "blocking", blocking(m, SP, CP))
assert blocking(m, SP, CP) == []
# the random pairing shown in the hook/ruleout
RANDOM_DEMO = {"Ana": "Oak", "Ben": "Ash", "Cy": "Fir", "Dee": "Elm"}
bd = blocking(RANDOM_DEMO, SP, CP)
print("random demo pairing blocking pairs:", bd)
# average over all 24 pairings of the demo
allb = [len(blocking(dict(zip(STU, p)), SP, CP)) for p in itertools.permutations(SCH)]
print("demo: mean blocking over all 24 pairings", sum(allb) / 24, "stable pairings", allb.count(0))

# random instances: random pairing vs deferred acceptance
rng = random.Random(1)
N = 4; T = 100_000
tot_rand = 0; any_rand = 0; tot_gs = 0; maxprops = 0
for _ in range(T):
    sp = {s: rng.sample(SCH, N) for s in STU}; cp = {c: rng.sample(STU, N) for c in SCH}
    rp = dict(zip(STU, rng.sample(SCH, N)))
    b = len(blocking(rp, sp, cp)); tot_rand += b; any_rand += b > 0
    g, p, _ = gs(sp, cp); tot_gs += len(blocking(g, sp, cp)); maxprops = max(maxprops, p)
print(f"4x4, {T} random setups: random pairing mean breakaway pairs {tot_rand/T:.3f} (exact 12/4 = 3), "
      f"at least one {any_rand/T:.3f}; deferred acceptance breakaways total {tot_gs}; max proposals {maxprops} (bound n^2-n+1 = 13)")
# bigger: 1000 x 1000 one run
n = 1000
S = list(range(n)); Cc = [f"c{i}" for i in range(n)]
sp = {s: rng.sample(Cc, n) for s in S}; cp = {c: rng.sample(S, n) for c in Cc}
g, p, r = gs(sp, cp)
# blocking check, efficient
rank_s = {s: {c: i for i, c in enumerate(sp[s])} for s in S}; rank_c = {c: {s: i for i, s in enumerate(cp[c])} for c in Cc}
inv = {c: s for s, c in g.items()}
b = sum(1 for s in S for c in sp[s][:rank_s[s][g[s]]] if rank_c[c][s] < rank_c[c][inv[c]])
print(f"1000x1000: proposals {p}, rounds {r}, breakaway pairs {b}")
json.dump({"demo_match": m, "demo_blocking_random": bd, "rand_mean": tot_rand / T, "rand_any": any_rand / T, "gs_blocking": tot_gs,
           "maxprops4": maxprops, "big_props": p, "big_block": b}, open("verify_results.json", "w"), indent=1)
