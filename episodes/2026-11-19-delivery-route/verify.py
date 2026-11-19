"""Every number in the delivery-route Short, computed or simulated."""
import math, random, itertools

ok = True
def check(name, good, detail=""):
    global ok
    ok &= bool(good)
    print(f"{'OK ' if good else 'BAD'} {name} {detail}")

# 1. Depot + 20 stops, round trip: 20! orderings, each loop counted twice (both directions)
routes = math.factorial(20) // 2
check("20 stops -> 20!/2 loops", routes == 1_216_451_004_088_320_000, f"{routes:.3e} (script: 1.2 quintillion)")
age_s = 13.787e9 * 365.25 * 86400           # Planck 2018 age of the universe
check("more loops than seconds since the Big Bang", routes > age_s, f"{age_s:.3e} s, ratio {routes/age_s:.1f}")
years = routes / 1e9 / (365.25 * 86400)
check("a billion loops a second -> about 38 years", round(years) == 39 or 37 <= years <= 39, f"{years:.1f} years (script: 38)")

def length(pts, tour):
    return sum(math.dist(pts[tour[i]], pts[tour[(i + 1) % len(tour)]]) for i in range(len(tour)))

def nearest(pts):
    left = set(range(1, len(pts))); tour = [0]
    while left:
        nxt = min(left, key=lambda j: math.dist(pts[tour[-1]], pts[j])); tour.append(nxt); left.remove(nxt)
    return tour

def two_opt(pts, tour):
    tour = tour[:]; n = len(tour); improved = True
    while improved:
        improved = False
        for i in range(n - 1):
            for j in range(i + 2, n if i else n - 1):
                a, b, c, d = pts[tour[i]], pts[tour[i + 1]], pts[tour[j]], pts[tour[(j + 1) % n]]
                if math.dist(a, c) + math.dist(b, d) < math.dist(a, b) + math.dist(c, d) - 1e-12:
                    tour[i + 1:j + 1] = reversed(tour[i + 1:j + 1]); improved = True
    return tour

def held_karp(pts):
    n = len(pts); D = [[math.dist(p, q) for q in pts] for p in pts]
    best = {(1 << k, k): D[0][k] for k in range(1, n)}
    for size in range(2, n):
        for sub in itertools.combinations(range(1, n), size):
            S = sum(1 << k for k in sub)
            for k in sub:
                best[(S, k)] = min(best[(S ^ (1 << k), m)] + D[m][k] for m in sub if m != k)
    full = sum(1 << k for k in range(1, n))
    return min(best[(full, k)] + D[k][0] for k in range(1, n))

# 2. Uncrossing two crossing roads always makes the loop shorter (triangle inequality): 100,000 random crossings
def crosses(a, b, c, d):
    o = lambda p, q, r: (q[0]-p[0])*(r[1]-p[1]) - (q[1]-p[1])*(r[0]-p[0])
    return o(a, b, c) * o(a, b, d) < 0 and o(c, d, a) * o(c, d, b) < 0
random.seed(1); n_cross = 0; worse = 0
while n_cross < 100_000:
    a, b, c, d = [(random.random(), random.random()) for _ in range(4)]
    if crosses(a, b, c, d):
        n_cross += 1
        if math.dist(a, c) + math.dist(b, d) >= math.dist(a, b) + math.dist(c, d): worse += 1
check("100,000 random crossings: uncrossing (a-c, b-d) is always shorter", worse == 0, f"({worse} failures)")

# 4. On 12-stop maps, solved exactly: nearest neighbour vs nearest neighbour + uncrossing (2-opt)
random.seed(3); g_nn = []; g_2 = []
for _ in range(300):
    pts = [(random.random(), random.random()) for _ in range(12)]
    opt = held_karp(pts); t = nearest(pts)
    g_nn.append(length(pts, t) / opt - 1); g_2.append(length(pts, two_opt(pts, t)) / opt - 1)
print(f"   12 stops, 300 maps: nearest neighbour {sum(g_nn)/300:.1%} over best, after uncrossing {sum(g_2)/300:.1%}")
check("uncrossing closes most of the gap", sum(g_2) < sum(g_nn) / 2)

# 5. The demo map in the scene: 9 stops + depot; nearest-neighbour tour has a crossing that uncrossing removes
DEMO = [(540, 1040), (300, 900), (240, 700), (380, 520), (600, 430), (820, 560), (860, 800), (700, 930), (480, 720), (650, 700)]
t = nearest(DEMO); t2 = two_opt(DEMO, t)
def n_crossings(pts, tour):
    e = [(pts[tour[i]], pts[tour[(i+1) % len(tour)]]) for i in range(len(tour))]
    return sum(crosses(*e[i], *e[j]) for i in range(len(e)) for j in range(i+2, len(e)) if not (i == 0 and j == len(e)-1))
print("   demo nearest-neighbour tour:", t, f"length {length(DEMO, t):.0f}, crossings {n_crossings(DEMO, t)}")
print("   demo after uncrossing:     ", t2, f"length {length(DEMO, t2):.0f}, crossings {n_crossings(DEMO, t2)}, best {held_karp(DEMO):.0f}")
check("demo: nearest neighbour tour crosses itself", n_crossings(DEMO, t) >= 1)
check("demo: after uncrossing, no crossings and shorter", n_crossings(DEMO, t2) == 0 and length(DEMO, t2) < length(DEMO, t))
best = held_karp(DEMO)
over_nn = length(DEMO, t) / best - 1; over_2 = length(DEMO, t2) / best - 1
check("demo: nearest neighbour is 24% longer than the best loop", round(over_nn * 100) == 24, f"({over_nn:.1%})")
check("demo: after uncrossing, within 3% of the best", round(over_2 * 100) == 3, f"({over_2:.1%})")
# the two flips shown in the scene, one crossing at a time
A = [0, 7, 6, 5, 4, 1, 2, 3, 8, 9]; B = [0, 7, 6, 5, 4, 3, 2, 1, 8, 9]
check("flip 1 (6-9 x 5-depot) removes one crossing", n_crossings(DEMO, A) == 1 and round(length(DEMO, A)) == 2646, f"({length(DEMO, A):.0f})")
check("after flip 1: 16% over the best", round((length(DEMO, A) / best - 1) * 100) == 16)
check("flip 2 (4-1 x 3-8) removes the last", n_crossings(DEMO, B) == 0 and round(length(DEMO, B)) == 2357)

# 6. CTA: depot + 5 stops? No: 5 stops in a loop -> 4!/2 = 12 distinct loops
check("CTA: 5 stops -> 12 loops", math.factorial(4) // 2 == 12)
loops = {min(tuple(p), tuple(reversed(p))) for p in itertools.permutations(range(1, 5))}
check("CTA brute force: 12", len(loops) == 12, f"({len(loops)})")
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
