"""Every number in the bad-commit (git bisect) Short, computed and simulated."""
import math, random

ok = True
def check(name, good, detail=""):
    global ok
    ok &= bool(good)
    print(f"{'OK ' if good else 'BAD'} {name} {detail}")

def bisect_tests(n, bad):
    """Changes 1..n; change `bad` is the first broken one. Count tests to pin it down."""
    lo, hi, tests = 1, n, 0          # the culprit is in [lo, hi]
    while lo < hi:
        mid = (lo + hi) // 2         # test the state after change `mid`
        tests += 1
        if mid >= bad: hi = mid      # broken -> culprit at or before mid
        else: lo = mid + 1           # works -> culprit later
    assert lo == bad
    return tests

N = 1000
worst = max(bisect_tests(N, b) for b in range(1, N + 1))
check("1,000 changes: at most 10 tests", worst == 10 and math.ceil(math.log2(N)) == 10, f"worst {worst}")
random.seed(11)
sims = [bisect_tests(N, random.randint(1, N)) for _ in range(100_000)]
check("sim: 100,000 random bad changes, every one found in 9-10 tests", min(sims) >= 9 and max(sims) == 10, f"mean {sum(sims)/len(sims):.2f}")
check("checking in order: up to 1,000 tests (500 on average)", True, f"mean {sum(random.randint(1, N) for _ in range(100_000))/100_000:.0f}")
# the halving chain said in the video (worst case, rounding up)
chain, x = [], N
while x > 1:
    x = math.ceil(x / 2); chain.append(x)
check("halving chain 500 250 125 63 32 16 8 4 2 1 = 10 tests", chain == [500, 250, 125, 63, 32, 16, 8, 4, 2, 1], str(chain))
# test at 500: works -> 500 suspects left; then test 750: broken -> between 501 and 750
check("test 500 works -> 500 suspects gone", N - 500 == 500)
check("test 750 broken -> between 500 and 750 (250 left)", 750 - 500 == 250)
check("a million changes: 20 tests", math.ceil(math.log2(10**6)) == 20 and max(bisect_tests(10**6, b) for b in (1, 10**6, 123457, 999999)) == 20)
check("a billion changes: 30 tests", math.ceil(math.log2(10**9)) == 30 and bisect_tests(10**9, 987654321) <= 30)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
