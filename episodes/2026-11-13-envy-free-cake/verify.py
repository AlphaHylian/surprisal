"""Checks every number in 'envy-free-cake' (Selfridge-Conway envy-free division for three).
Source: https://en.wikipedia.org/wiki/Selfridge%E2%80%93Conway_procedure (Selfridge 1960, Conway
independently; at most 5 cuts). Compared with the Dubins-Spanier moving knife (proportional only):
https://en.wikipedia.org/wiki/Dubins%E2%80%93Spanier_moving-knife_procedure"""
import bisect, json, random
M = 30  # the cake is [0,1] in M strips; each player values each strip at random (piecewise-constant density)

class Player:
    def __init__(self, rng):
        w = [rng.expovariate(1) for _ in range(M)]; s = sum(w)
        self.cum = [0.0]
        for x in w: self.cum.append(self.cum[-1] + x / s)
    def F(self, x):                       # value of [0, x]
        x = min(max(x, 0.0), 1.0); i = min(int(x * M), M - 1)
        return self.cum[i] + (self.cum[i + 1] - self.cum[i]) * (x * M - i)
    def Finv(self, v):                    # point x with F(x) = v
        v = min(max(v, 0.0), 1.0); i = bisect.bisect_right(self.cum, v) - 1; i = min(max(i, 0), M - 1)
        d = self.cum[i + 1] - self.cum[i]
        return (i + (v - self.cum[i]) / d) / M if d > 0 else i / M
    def val(self, piece):                 # piece = list of intervals
        return sum(self.F(b) - self.F(a) for a, b in piece)

EPS = 1e-9
STAGE1 = []; TRIM_TO_P1 = []
def selfridge_conway(P):
    p1, p2, p3 = P
    a = p1.Finv(1 / 3); b = p1.Finv(2 / 3); cuts = 2
    pieces = [[(0, a)], [(a, b)], [(b, 1)]]
    order = sorted(range(3), key=lambda k: -p2.val(pieces[k]))
    big, second = order[0], order[1]
    alloc = {}
    if p2.val(pieces[big]) - p2.val(pieces[second]) < EPS:
        rem = [0, 1, 2]
        for pl in (2, 1, 0):
            k = max(rem, key=lambda k: P[pl].val(pieces[k])); alloc[pl] = list(pieces[k]); rem.remove(k)
        return alloc, cuts
    (lo, hi), = pieces[big]
    target = p2.val(pieces[second])
    t = p2.Finv(p2.F(hi) - target); cuts += 1     # trim from the left end so [t, hi] ties the second piece
    trimmed, trimmings = [(t, hi)], (lo, t)
    pieces[big] = trimmed
    rem = [0, 1, 2]
    k3 = max(rem, key=lambda k: p3.val(pieces[k])); alloc[2] = list(pieces[k3]); rem.remove(k3)
    k2 = big if big in rem else max(rem, key=lambda k: p2.val(pieces[k])); alloc[1] = list(pieces[k2]); rem.remove(k2)
    alloc[0] = list(pieces[rem[0]])
    STAGE1.append(envy(P, {k: list(v) for k, v in alloc.items()}))
    TRIM_TO_P1.append(rem[0] != big)
    pa = 2 if k3 == big else 1; pb = 1 if pa == 2 else 2
    lo2, hi2 = trimmings; cutter = P[pb]
    base = cutter.F(lo2); tot = cutter.F(hi2) - base
    x1 = cutter.Finv(base + tot / 3); x2 = cutter.Finv(base + 2 * tot / 3); cuts += 2
    parts = [(lo2, x1), (x1, x2), (x2, hi2)]
    for pl in (pa, 0, pb):
        k = max(range(len(parts)), key=lambda k: P[pl].val([parts[k]])); alloc[pl].append(parts.pop(k))
    return alloc, cuts

def moving_knife(P):
    left = [0, 1, 2]; x0 = 0.0; alloc = {}
    while len(left) > 1:
        need = {i: P[i].Finv(P[i].F(x0) + (P[i].F(1) - P[i].F(x0)) / len(left)) for i in left}
        i = min(left, key=lambda i: need[i]); alloc[i] = [(x0, need[i])]; x0 = need[i]; left.remove(i)
    alloc[left[0]] = [(x0, 1.0)]
    return alloc

def envy(P, alloc, tol=1e-7):
    return any(P[i].val(alloc[j]) > P[i].val(alloc[i]) + tol for i in range(3) for j in range(3) if i != j)

rng = random.Random(13); N = 100_000
sc_envy = mk_envy = mk_prop_fail = 0; maxcuts = 0; covered_bad = 0
for _ in range(N):
    P = [Player(rng) for _ in range(3)]
    a, c = selfridge_conway(P); maxcuts = max(maxcuts, c)
    sc_envy += envy(P, a)
    tot = sum(b - x for k in a for x, b in a[k]); covered_bad += abs(tot - 1) > 1e-9
    m = moving_knife(P); mk_envy += envy(P, m)
    mk_prop_fail += any(P[i].val(m[i]) < 1 / 3 - 1e-7 for i in range(3))
r = {"trials": N, "selfridge_conway_envy_cases": sc_envy, "selfridge_conway_max_cuts": maxcuts,
     "whole_cake_handed_out_failures": covered_bad,
     "moving_knife_someone_envious_pct": round(100 * mk_envy / N, 1), "moving_knife_below_third": mk_prop_fail}
r['stage1_envy_cases'] = sum(STAGE1); r['stage1_trials_with_trim'] = len(STAGE1); r['trimmed_piece_never_yours'] = all(TRIM_TO_P1)
r['moving_knife_envy_count'] = mk_envy
assert sum(STAGE1) == 0 and all(TRIM_TO_P1) and mk_envy == N
assert sc_envy == 0 and maxcuts == 5 and covered_bad == 0 and mk_prop_fail == 0
# player 1's argument: trimmed piece + all trimmings = one of P1's thirds
r["p1_view_trimmed_plus_trimmings"] = "1/3 (it is one of the three pieces P1 cut)"
print(json.dumps(r, indent=1)); json.dump(r, open("verify_results.json", "w"), indent=1); print("OK")
