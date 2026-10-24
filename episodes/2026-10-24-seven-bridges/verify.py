"""Every number in the seven-bridges how-to episode (Euler, Königsberg 1736), computed and brute-forced."""
from collections import Counter

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# Land: K = Kneiphof island, L = Lomse island, A = Altstadt (north bank), V = Vorstadt (south bank)
BRIDGES_1736 = [("K", "A"), ("K", "A"), ("K", "V"), ("K", "V"), ("K", "L"), ("A", "L"), ("V", "L")]
# Today (Kaliningrad): two destroyed in WWII, two replaced by a highway; five crossings left: degrees 3, 3, 2, 2
BRIDGES_NOW = [("K", "A"), ("K", "V"), ("K", "L"), ("A", "L"), ("V", "L")]

def degrees(edges):
    d = Counter()
    for a, b in edges:
        d[a] += 1; d[b] += 1
    return d

def longest_walk(edges):
    """Brute force: try every walk from every start that never reuses a bridge; return (longest, number of full walks)."""
    best, full = 0, 0
    def go(node, used, n):
        nonlocal best, full
        best = max(best, n)
        if n == len(edges):
            full += 1
        for i, (a, b) in enumerate(edges):
            if not used >> i & 1 and node in (a, b):
                go(b if node == a else a, used | 1 << i, n + 1)
    for s in "KLAV":
        go(s, 0, 0)
    return best, full

walks_tried = 0
def count_walks(edges):
    """How many different bridge-by-bridge walks (no bridge twice, any start, any length >= 1) exist."""
    total = 0
    def go(node, used):
        nonlocal total
        for i, (a, b) in enumerate(edges):
            if not used >> i & 1 and node in (a, b):
                total += 1
                go(b if node == a else a, used | 1 << i)
    for s in "KLAV":
        go(s, 0)
    return total

check("7 bridges", len(BRIDGES_1736), 7)
check("4 pieces of land", len(degrees(BRIDGES_1736)), 4)
d = degrees(BRIDGES_1736)
check("bridges at each piece: 5, 3, 3, 3", sorted(d.values(), reverse=True), [5, 3, 3, 3])
check("bridges at the island Kneiphof: 5", d["K"], 5)
odd = sum(v % 2 for v in d.values())
check("odd pieces of land in 1736: 4", odd, 4)
best, full = longest_walk(BRIDGES_1736)
check("brute force: no walk crosses all 7 once", full, 0)
check("brute force: the best walk crosses 6", best, 6)
print(f"    different walks (no bridge twice) in 1736: {count_walks(BRIDGES_1736):,}")

def stuck_walks(edges):
    """Every walk you could take, going until no unused bridge is left at your feet: Counter of its length."""
    lengths = Counter()
    def go(node, used, n):
        nxt = [i for i, (a, b) in enumerate(edges) if not used >> i & 1 and node in (a, b)]
        if not nxt:
            lengths[n] += 1; return
        for i in nxt:
            a, b = edges[i]
            go(b if node == a else a, used | 1 << i, n + 1)
    for s in "KLAV":
        go(s, 0, 0)
    return lengths
sw = stuck_walks(BRIDGES_1736)
print("    walks by length until stuck:", dict(sorted(sw.items())))
check("hook: 372 walks to try", sum(sw.values()), 372)
check("256 of them get stuck one bridge short (6 of 7)", sw[6], 256)
# the walk shown on screen: A -K -A -L -K -V -K, stuck with V-L unused
shown = [0, 1, 5, 4, 2, 3]
node = "A"
for i in shown:
    a, b = BRIDGES_1736[i]
    assert node in (a, b); node = b if node == a else a
check("the walk on screen ends stuck at Kneiphof after 6", (node, len(shown)), ("K", 6))

# Pass-through rule: every visit to a middle node uses one bridge in and one out -> even degree, except start and end
check("a pass-through uses 2 bridges", 2, 2)

dn = degrees(BRIDGES_NOW)
check("today: 5 crossings", len(BRIDGES_NOW), 5)
check("today: degrees 3, 3, 2, 2", sorted(dn.values(), reverse=True), [3, 3, 2, 2])
check("today: the odd ones are the two islands", sorted(k for k, v in dn.items() if v % 2), ["K", "L"])
best_n, full_n = longest_walk(BRIDGES_NOW)
check("today: a walk over every bridge once exists", full_n > 0, True)
# every full walk today starts on one island and ends on the other
ends = set()
def go(node, used, start):
    if used == (1 << len(BRIDGES_NOW)) - 1:
        ends.add((start, node)); return
    for i, (a, b) in enumerate(BRIDGES_NOW):
        if not used >> i & 1 and node in (a, b):
            go(b if node == a else a, used | 1 << i, start)
for s in "KLAV":
    go(s, 0, s)
check("today: full walks run island to island", ends, {("K", "L"), ("L", "K")})

# Euler's general rule, checked on 2,000 random multigraphs: full walk exists <=> connected and 0 or 2 odd nodes
import random
random.seed(1736)
agree = 0
T = 2000
for _ in range(T):
    n = random.randint(2, 5)
    nodes = "ABCDE"[:n]
    edges = [tuple(random.sample(nodes, 2)) for _ in range(random.randint(1, 8))]
    dg = Counter()
    for a, b in edges:
        dg[a] += 1; dg[b] += 1
    # connected (among touched nodes)
    adj = {}
    for a, b in edges:
        adj.setdefault(a, set()).add(b); adj.setdefault(b, set()).add(a)
    seen, stack = set(), [edges[0][0]]
    while stack:
        x = stack.pop()
        if x in seen: continue
        seen.add(x); stack.extend(adj[x])
    rule = len(seen) == len(adj) and sum(v % 2 for v in dg.values()) in (0, 2)
    found = False
    def g(node, used):
        global found
        if found: return
        if used == (1 << len(edges)) - 1:
            found = True; return
        for i, (a, b) in enumerate(edges):
            if not used >> i & 1 and node in (a, b):
                g(b if node == a else a, used | 1 << i)
    for s in adj:
        g(s, 0)
    agree += rule == found
check(f"Euler's rule matches brute force on {T} random bridge maps", agree, T)

print("ALL OK" if ok else "SOMETHING FAILED")
raise SystemExit(0 if ok else 1)
