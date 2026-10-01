"""Every number in the Penney's game episode, computed exactly and simulated."""
import random
from fractions import Fraction
from itertools import product

SEQS = ["".join(p) for p in product("HT", repeat=3)]


def p_first(a, b):
    """Exact chance that a appears before b in fair flips (Conway's leading numbers)."""
    def corr(x, y):
        return sum(2 ** (len(x) - 1 - i) for i in range(len(x)) if y.startswith(x[i:]))
    aa, ab, ba, bb = corr(a, a), corr(a, b), corr(b, a), corr(b, b)
    # odds b beats a = (aa - ab) : (bb - ba)
    return Fraction(bb - ba, (aa - ab) + (bb - ba))


def response(a):
    """The rule from the video: flip your middle, put it in front, drop your last."""
    flip = {"H": "T", "T": "H"}
    return flip[a[1]] + a[:2]


def simulate(a, b, n, rng):
    wins = 0
    for _ in range(n):
        s = ""
        while True:
            s = s[-2:] + rng.choice("HT")
            if s == a:
                break
            if s == b:
                wins += 1
                break
    return wins / n


checks = {
    "each 3-flip run has chance 1/8": (Fraction(1, 2) ** 3, Fraction(1, 8)),
    "8 possible runs of 3 flips": (len(SEQS), 8),
    "THH is the rule's answer to HHH": (response("HHH"), "THH"),
    "THH beats HHH 7 in 8": (1 - p_first("HHH", "THH"), Fraction(7, 8)),
    "HHH only wins if the first 3 flips are HHH (1/8)": (p_first("HHH", "THH"), Fraction(1, 8)),
    "rule beats every choice at least 2 in 3": (min(1 - p_first(a, response(a)) for a in SEQS) >= Fraction(2, 3), True),
    "rule's answer to HTH is HHT": (response("HTH"), "HHT"),
    "HHT beats HTH 2 in 3": (1 - p_first("HTH", "HHT"), Fraction(2, 3)),
}
for a in SEQS:
    print(f"  {a} -> {response(a)} wins {1 - p_first(a, response(a))}")

rng = random.Random(0)
N = 200_000
sim = simulate("HHH", "THH", N, rng)
checks["simulated THH vs HHH within 0.5% of 7/8"] = (abs(sim - 7 / 8) < 0.005, True)
sim2 = simulate("HTH", "HHT", 100_000, rng)
checks["simulated HHT vs HTH within 0.5% of 2/3"] = (abs(sim2 - 2 / 3) < 0.005, True)
checks["simulated percentage shown on screen, 87.4% (1 d.p.)"] = (round(sim * 100, 1), 87.4)
checks["7 in 8 as a percentage"] = (float(Fraction(7, 8) * 100), 87.5)

ok = True
for name, (got, want) in checks.items():
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")
print(f"simulated THH beats HHH: {sim:.4f} over {N:,} games; HHT beats HTH: {sim2:.4f}")
print("ALL OK" if ok else "SOME CHECKS FAILED")
