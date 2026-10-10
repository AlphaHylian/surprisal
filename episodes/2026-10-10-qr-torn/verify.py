"""Every number in the QR-code Short: the line through 3 and 5, erasures, errors outvoted, QR levels."""
import itertools
import random
from fractions import Fraction

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# Message 3, 5 -> line f(x) = 3 + 5x, printed at x = 0..3 (and 0..5 with more spares)
def f(x): return 3 + 5 * x
pts4 = [f(x) for x in range(4)]
check("four points", pts4, [3, 8, 13, 18])

def line_through(p, q):
    (x1, y1), (x2, y2) = p, q
    m = Fraction(y2 - y1, x2 - x1)
    return y1 - m * x1, m   # (start, step)

# Scratch out 3 and 13: 8 (x=1) and 18 (x=3) remain
start, step = line_through((1, 8), (3, 18))
check("rebuilt start", start, 3)
check("rebuilt step", step, 5)
check("rebuilt points", [start + step * x for x in range(4)], [3, 8, 13, 18])
# any 2 of 4 rebuild it
ok &= all(line_through((a, f(a)), (b, f(b))) == (3, 5) for a, b in itertools.combinations(range(4), 2))
print("any 2 of 4 points rebuild 3 and 5:", ok)

# Errors at unknown places: 6 points, 2 changed. The true line hits 4; any other line at most 3.
def decode(points):
    """Majority line: the line agreeing with the most points (brute force over pairs)."""
    best, votes = None, -1
    for (x1, y1), (x2, y2) in itertools.combinations(points, 2):
        L = line_through((x1, y1), (x2, y2))
        v = sum(1 for x, y in points if L[0] + L[1] * x == y)
        if v > votes:
            best, votes = L, v
    return best, votes

random.seed(10)
trials, good = 100_000, 0
for _ in range(trials):
    pts = [(x, f(x)) for x in range(6)]
    for i in random.sample(range(6), 2):
        x, y = pts[i]
        pts[i] = (x, y + random.choice([v for v in range(-50, 51) if v]))
    L, v = decode(pts)
    good += (L == (3, 5))
check("6 points, 2 smudged: decoded right in every trial", good, trials)
# The on-screen example: 3, 8, 13, 18, 23, 28 with 13 -> 9 and 28 -> 20
shown = [(0, 3), (1, 8), (2, 9), (3, 18), (4, 23), (5, 20)]
L, votes = decode(shown)
check("on-screen example decodes to", L, (3, 5))
check("true line votes", votes, 4)
others = max(sum(1 for x, y in shown if line_through(p, q)[0] + line_through(p, q)[1] * x == y)
             for p, q in itertools.combinations(shown, 2) if line_through(p, q) != (3, 5))
check("best wrong line votes (at most 3)", others <= 3, True)
check("spare points needed per wrong number", (6 - 2) // 2, 2)
# with 3 smudged out of 6, it can fail
fails = 0
for _ in range(20_000):
    pts = [(x, f(x)) for x in range(6)]
    for i in random.sample(range(6), 3):
        x, y = pts[i]
        pts[i] = (x, y + random.choice([v for v in range(-50, 51) if v]))
    fails += decode(pts)[0] != (3, 5)
print(f"3 smudged of 6: wrong or ambiguous in {fails / 20000:.1%} of trials (not guaranteed)")

# QR levels (https://en.wikipedia.org/wiki/QR_code): L 7, M 15, Q 25, H 30 percent of bytes
levels = {"L": 7, "M": 15, "Q": 25, "H": 30}
check("strongest level (%)", levels["H"], 30)
# Version 1-H (smallest code, strongest level): 9 data + 17 EC codewords, one block
# (https://www.thonky.com/qr-code-tutorial/error-correction-table)
data_cw, ec_cw = 9, 17
check("1-H total bytes", data_cw + ec_cw, 26)
check("1-H wrong bytes fixed", ec_cw // 2, 8)
check("1-H share fixable (%)", round(ec_cw // 2 / (data_cw + ec_cw) * 100), 31)
# Version 40-H: 30 EC codewords per block -> 15 errors per block
check("max errors corrected per block", 30 // 2, 15)
# Reed-Solomon 1960 (https://en.wikipedia.org/wiki/Reed%E2%80%93Solomon_error_correction); QR 1994
check("Reed-Solomon year", 1960, 1960)
check("QR year", 1994, 1994)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
