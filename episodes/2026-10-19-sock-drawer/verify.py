"""Every number in the sock-drawer (pigeonhole) how-to episode, by exhaustive worst case and simulation."""
import itertools
import math
import random

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def worst_case(drawer, done):
    """Smallest k such that EVERY order of pulling socks has `done` true after k socks.
    The worst case over orders = the largest set of socks that is not yet done, plus one."""
    colors = sorted(set(drawer))
    counts = {c: drawer.count(c) for c in colors}
    best = 0
    # every multiset you could be holding: how many of each colour
    for held in itertools.product(*[range(counts[c] + 1) for c in colors]):
        h = dict(zip(colors, held))
        if not done(h):
            best = max(best, sum(held))
    return best + 1

drawer = ["black"] * 10 + ["white"] * 10
check("socks in the drawer", len(drawer), 20)
any_pair = lambda h: any(v >= 2 for v in h.values())
black_pair = lambda h: h.get("black", 0) >= 2
check("grabs that guarantee a matching pair (2 colours)", worst_case(drawer, any_pair), 3)
check("grabs that guarantee a black pair", worst_case(drawer, black_pair), 12)
check("2 grabs can fail (one of each)", any_pair({"black": 1, "white": 1}), False)
# CTA: add 10 red -> black pair needs all 20 others first, plus 2
drawer3 = drawer + ["red"] * 10
check("CTA answer: black pair with red added", worst_case(drawer3, black_pair), 22)
check("any pair with 3 colours (colours plus one)", worst_case(drawer3, any_pair), 4)

# simulate: shuffle the drawer and pull until done; the max over many shuffles never beats the guarantee
rng = random.Random(2026)
N = 100_000
def pulls_until(dr, done):
    d = dr[:]
    rng.shuffle(d)
    h = {}
    for k, s in enumerate(d, 1):
        h[s] = h.get(s, 0) + 1
        if done(h):
            return k
mx_any = max(pulls_until(drawer, any_pair) for _ in range(N))
mx_black = max(pulls_until(drawer, black_pair) for _ in range(N))
print(f"simulated {N:,} dark mornings: worst any pair {mx_any}, worst black pair {mx_black}")
check("sim: never more than 3 for any pair", mx_any, 3)
check("sim: never more than 12 for a black pair", mx_black <= 12, True)

# London hairs: hair counts 0..1,000,000 (nobody has more than a million: Wikipedia's upper bound)
holes = 1_000_001
for pop in (9_002_000, 9_122_909):
    print(f"London {pop:,}: at least {math.ceil(pop / holes)} share a hair count")
check("London 9,122,909 people (Wikipedia infobox, 2025): at least 10 share an exact hair count", math.ceil(9_122_909 / holes), 10)
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
