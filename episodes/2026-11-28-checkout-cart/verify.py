"""checkout-cart: one full cart vs four baskets.
Source: Dan Meyer's 2009 checkout timing, as summarised at the time (ScienceBlogs, 13 Sep 2009):
"Each item adds 2.9 seconds on average, but each person adds 48 seconds on average."
https://scienceblogs.com/principles/2009/09/13/grocery-store-science
Other reports of the same work give 2.8 s per item (Consumerist 2013, Chowhound); Meyer later cited
41 s per shopper and ~3 s per item (Yahoo Finance / NYT). The video uses round numbers: 48 s per person, 3 s per item."""
import random, json

PER = 48.0   # seconds per shopper (hello, pay, bag, receipt, goodbye)
ITEM = 3.0   # seconds per scanned item

def lane(shoppers):  # list of item counts
    return sum(PER + ITEM * n for n in shoppers)

cart = lane([50]); baskets = lane([10] * 4)
assert cart == 198, cart                      # 3 min 18 s
assert baskets == 312, baskets                # 5 min 12 s
assert baskets - cart == 114                  # almost 2 minutes
assert round(PER / ITEM) == 16                # one shopper = 16 items of time
# biggest cart that still beats four baskets
n_max = max(n for n in range(0, 300) if lane([n]) < baskets)
assert n_max == 87, n_max                     # strictly faster up to 87 items, tie at 88
assert lane([88]) == baskets
# in item-units: cart 16 + 50 = 66, baskets 4*16 + 40 = 104
assert 16 + 50 == 66 and 4 * 16 + 40 == 104
# same check with the source's exact numbers (48 s, 2.9 s) and Meyer's later numbers (41 s, 3 s)
for per, item in [(48, 2.9), (48, 2.8), (41, 3.0)]:
    c, b = per + 50 * item, 4 * per + 40 * item
    assert c < b, (per, item)
    print(f"per={per} item={item}: cart {c:.0f}s, baskets {b:.0f}s, break-even {per/item:.1f} items per person")

# simulation: noisy shoppers. Per-shopper overhead ~ gamma(mean 48, sd ~20), per item ~ gamma(mean 3, sd 1.5)
random.seed(1)
def g(mean, sd):
    k = (mean / sd) ** 2; th = sd * sd / mean
    return random.gammavariate(k, th)
def noisy(shoppers):
    return sum(g(PER, 20) + sum(g(ITEM, 1.5) for _ in range(n)) for n in shoppers)
T = 100_000
wins = 0; ct = 0.0; bt = 0.0
for _ in range(T):
    c = noisy([50]); b = noisy([10] * 4); ct += c; bt += b
    wins += c < b
p = wins / T
print(f"simulated {T}: cart first {p:.3f}, mean cart {ct/T:.0f}s, mean baskets {bt/T:.0f}s")
assert p > 0.9 and abs(ct / T - 198) < 2 and abs(bt / T - 312) < 2
res = {"cart_s": cart, "baskets_s": baskets, "diff_s": baskets - cart, "items_per_person": 16,
       "max_cart_items_still_faster": n_max, "tie_at": 88, "sim_cart_first": round(p, 3)}
print(json.dumps(res))
print("ALL CHECKS PASSED")
