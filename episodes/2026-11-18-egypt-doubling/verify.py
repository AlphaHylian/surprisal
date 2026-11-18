"""Every number in the egypt-doubling Short, computed and checked."""
import random

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def egyptian(a, b):
    """Doubling table for b, pick the rows whose left side adds to a (largest first)."""
    rows = []
    l, r = 1, b
    while l <= a:
        rows.append((l, r)); l, r = 2 * l, 2 * r
    rest, ticked = a, []
    for l, r in reversed(rows):
        if l <= rest:
            ticked.append((l, r)); rest -= l
    assert rest == 0
    return rows, ticked, sum(r for _, r in ticked)

rows, ticked, total = egyptian(13, 24)
check("doubling table", rows, [(1, 24), (2, 48), (4, 96), (8, 192)])
check("next left value would pass 13", 2 * rows[-1][0], 16)
check("ticked rows", sorted(l for l, _ in ticked), [1, 4, 8])
check("8 + 4 + 1", 8 + 4 + 1, 13)
check("192 + 96 + 24", 192 + 96 + 24, 312)
check("13 x 24", 13 * 24, 312)
check("method result", total, 312)

# CTA: 11 x 15 -> rows 8, 2, 1 -> 120 + 30 + 15 = 165
_, t2, tot2 = egyptian(11, 15)
check("CTA ticked rows", sorted(l for l, _ in t2), [1, 2, 8])
check("CTA product", tot2, 165)
check("CTA 11 x 15", 11 * 15, 165)

# 'every number splits into doubles exactly one way' (binary): exhaustive to 10,000
uniq = True
for n in range(1, 10001):
    # count subsets of powers of two summing to n (each power at most once)
    ways = {0: 1}
    p = 1
    while p <= n:
        new = dict(ways)
        for s, c in ways.items():
            if s + p <= n:
                new[s + p] = new.get(s + p, 0) + c
        ways = new; p *= 2
    if ways.get(n, 0) != 1:
        uniq = False; break
check("every n <= 10,000 has exactly one split into distinct doubles", uniq, True)

# the method always gives the right product: 200,000 random pairs
random.seed(1)
good = all(egyptian(a, b)[2] == a * b for a, b in ((random.randint(1, 10**6), random.randint(1, 10**6)) for _ in range(200000)))
check("200,000 random pairs multiply correctly", good, True)
check("over 3,500 years ago (Rhind papyrus ~1550 BC, now 2026)", 1550 + 2026 > 3500, True)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
