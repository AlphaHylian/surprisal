"""Every number in the split-bill Short (split the bill evenly vs each pay your own).
Source: Gneezy, Haruvy & Yafe, "The Inefficiency of Splitting the Bill", The Economic Journal 114 (2004)
265-280 (https://rady.ucsd.edu/_files/faculty-research/uri-gneezy/splitting-bill.pdf): a restaurant near
the Technion, Haifa; groups of six strangers (3 men, 3 women); Table 1 lists every diner's meal cost in NIS:
individual pay (24 diners) avg 37.3, even split (24) avg 50.9, free meal (12) avg 82.3; 19 of 24 (80%)
asked beforehand preferred paying individually.
The dessert example (6 diners, a $12 dessert) is illustrative arithmetic."""
import random

ok = True
def check(name, got, want, tol):
    global ok
    good = abs(got - want) <= tol
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got:.4g} (script: {want})")

ind = [59,54,50,49,47,46,45,45,43,43,40,40,39,39,35,35,35,31,31,30,16,16,15,12]
split = [81,73,71,66,64,62,60,59,59,56,52,47,46,46,45,45,44,40,40,39,37,35,33,22]
free = [168,123,101,94,81,75,69,61,57,59,51,49]
avg = lambda xs: sum(xs) / len(xs)
check("Table 1: paying your own, average (NIS)", avg(ind), 37, 0.5)
check("Table 1: even split, average (NIS)", avg(split), 51, 0.5)
check("Table 1: free meal, average (NIS)", avg(free), 82, 0.5)
check("split vs own: more than a third more", avg(split) / avg(ind) - 1, 0.36, 0.01)
check("paying your own: about a quarter less than splitting", 1 - avg(ind) / avg(split), 0.27, 0.01)
check("4 in 5 preferred paying their own (19 of 24)", 19 / 24, 0.8, 0.01)

# the dessert
n, price = 6, 12
check("pay your own: the dessert costs you 12", price, 12, 0)
check("split six ways: the dessert costs you 2", price / n, 2, 0)
check("split: your friends pay the other 10", price - price / n, 10, 0)
check("everyone orders: 6 desserts = 72", n * price, 72, 0)
check("your share of 6 desserts = 12", n * price / n, 12, 0)

# simulation: each diner values a dessert at a random amount between $0 and $12 (uniform).
# A diner orders when value > what it costs them. Own: cost 12. Split: cost 2.
rng = random.Random(3)
T = 200_000
own_spend = split_spend = 0.0
own_surplus = split_surplus = 0.0
for _ in range(T):
    vals = [rng.uniform(0, 12) for _ in range(n)]
    own = [v for v in vals if v > price]          # nobody values it above 12 here: never ordered
    sp = [v for v in vals if v > price / n]
    own_spend += price * len(own) / n
    split_spend += price * len(sp) / n
    own_surplus += (sum(own) - price * len(own)) / n
    split_surplus += (sum(sp) - price * len(sp)) / n
print(f"sim: desserts worth $0-12 to each diner: split spends ${split_spend / T:.2f} each on dessert, "
      f"gets ${split_surplus / T:.2f} of value net (negative = paid more than it was worth); own: ${own_spend / T:.2f}")
check("sim: under the split, the table pays more for dessert than it's worth to them", split_surplus / T < 0, True, 0)
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
