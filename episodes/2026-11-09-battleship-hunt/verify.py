"""Every number in the battleship-hunt episode (hunt/target with checkerboard parity).
Source: https://www.datagenetics.com/blog/december32011/index.html (fleet 5,4,3,3,2 = 17 squares;
random ~96 shots for half the games; parity hunt/target median 64; parity: every ship covers a
square of each colour because the smallest is 2 long)."""
import json, random
from math import comb
from pathlib import Path
from statistics import median, mean

ok = True
results = {}
def check(name, got, want):
    global ok
    good = bool(got == want)
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

N = 10
FLEET = [5, 4, 3, 3, 2]
check("17 squares of ship", sum(FLEET), 17)

def placements(L):
    out = []
    for r in range(N):
        for c in range(N - L + 1):
            out.append([(r, c + i) for i in range(L)])
            out.append([(c + i, r) for i in range(L)])
    return out

# random shooting: shots needed = position of the last of 17 ship squares in a random order of 100
cdf = lambda n: comb(n, 17) / comb(100, 17)
median_random = min(n for n in range(17, 101) if cdf(n) >= 0.5)
check("random shots: half the games need 97 (exact; DataGenetics rounds to ~96)", median_random, 97)
results["random_P_done_by_95"] = f"{cdf(95):.3f}"

# checkerboard
dark = {(r, c) for r in range(N) for c in range(N) if (r + c) % 2 == 0}
check("checkerboard: 50 dark squares", len(dark), 50)
check("every 2-long ship covers a dark square", all(any(s in dark for s in p) for p in placements(2)), True)
third = {(r, c) for r in range(N) for c in range(N) if (r + c) % 3 == 0}
check("CTA: smallest left 3 long -> every third diagonal, 34 squares", len(third), 34)
check("CTA: every 3-long ship covers one of them", all(any(s in third for s in p) for p in placements(3)), True)
check("CTA: with every third diagonal, a 2-long ship can slip through", all(any(s in third for s in p) for p in placements(2)), False)

def place_fleet(rng):
    occ = {}
    for k, L in enumerate(FLEET):
        while True:
            p = rng.choice(PL[L])
            if not any(s in occ for s in p):
                for s in p: occ[s] = k
                break
    return occ
PL = {L: placements(L) for L in set(FLEET)}

def play(rng, parity):
    occ = place_fleet(rng)
    left = {k: FLEET[k] for k in range(len(FLEET))}
    shot = set(); stack = []; hits_needed = 17; n = 0
    hunt = [s for s in ((r, c) for r in range(N) for c in range(N)) if (not parity or s in dark)]
    rng.shuffle(hunt)
    rest = [s for s in ((r, c) for r in range(N) for c in range(N)) if s not in dark] if parity else []
    rng.shuffle(rest)
    while hits_needed:
        s = None
        while stack:
            cand = stack.pop()
            if cand not in shot: s = cand; break
        if s is None:
            while hunt and hunt[-1] in shot: hunt.pop()
            if hunt: s = hunt.pop()
            else:
                while rest[-1] in shot: rest.pop()
                s = rest.pop()
        shot.add(s); n += 1
        if s in occ:
            hits_needed -= 1
            r, c = s
            for d in ((r-1, c), (r+1, c), (r, c-1), (r, c+1)):
                if 0 <= d[0] < N and 0 <= d[1] < N and d not in shot: stack.append(d)
    return n

rng = random.Random(1931)
T = 100_000
par = list([play(rng, True) for _ in range(T)])
nopar = list([play(rng, False) for _ in range(T)])
# random by simulation too
def rnd(rng):
    occ = place_fleet(rng); order = list(occ.keys()) + [s for s in ((r, c) for r in range(N) for c in range(N)) if s not in occ]
    pos = list(range(100)); rng.shuffle(pos)
    return max(pos[:17]) + 1
rsim = list([rnd(rng) for _ in range(T)])
mp, mn, mr = int(median(par)), int(median(nopar)), int(median(rsim))
print(f"simulated {T:,} games each: parity hunt/target median {mp}, mean {mean(par):.1f}; plain hunt/target median {mn}; random median {mr}")
results.update(sim_parity_median=mp, sim_parity_mean=f"{mean(par):.1f}", sim_plain_median=mn, sim_random_median=mr,
               sim_parity_done_by_62=f"{sum(x <= 62 for x in par) / T:.3f}")
check("simulation: random median 97", mr, 97)
check("simulation: checkerboard + follow-up, half the games done by 62 (DataGenetics: 64)", mp, 62)
check("simulation: plain hunt/target is worse than with the checkerboard", mn > mp, True)

Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
