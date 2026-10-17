"""Every number in the PIN how-to episode, computed or sourced."""
import random
from datetime import date, timedelta

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# Sourced (DataGenetics PIN analysis, 2012, via HuffPost UK coverage fetched 2026-10-17):
# 3.4 million four-digit codes from leaked password tables; "almost 11%" are 1234;
# top 20 codes cover 26.83%; 1234, 1111, 0000 are the top 3 of the published top 10.
P_1234 = 0.10713   # DataGenetics figure; HuffPost: "almost 11%"
TOP20 = 0.2683
check("1234 share rounds to 11%", round(P_1234 * 100), 11)
check("top 20 share rounds to 27%", round(TOP20 * 100), 27)

# All four-digit codes
codes = [f"{i:04d}" for i in range(10000)]
check("possible codes", len(codes), 10000)

# Random PIN, 3 tries before the card locks: 3 in 10,000
check("3 tries on a random PIN, chances in 10,000", 3 * 10000 // len(codes), 3)

# Month+day codes (MMDD), including 29 Feb
mmdd = set()
d = date(2024, 1, 1)
while d.year == 2024:
    mmdd.add(d.strftime("%m%d")); d += timedelta(days=1)
check("month-and-day codes", len(mmdd), 366)

# Years starting with 19
years = [c for c in codes if c.startswith("19")]
check("codes starting with 19", len(years), 100)
check("3 tries on a 19xx code, chances in 100", 3 * 100 // len(years), 3)
check("100x worse than random", (3 / 100) / (3 / 10000), 100.0)

# Simulation: attacker tries 3 codes against random PINs and against 19xx PINs
rng = random.Random(17)
N = 200_000
hits_random = sum(rng.randrange(10000) in (1234, 1111, 0) for _ in range(10 * N))
hits_year = sum(f"19{rng.randrange(100):02d}" in ("1990", "1985", "1980") for _ in range(N))
print(f"sim random PIN, 3 tries: {hits_random / (10 * N) * 10000:.2f} in 10,000 (want ~3)")
print(f"sim 19xx PIN, 3 tries:   {hits_year / N * 100:.2f} in 100 (want ~3)")
ok &= abs(hits_random / (10 * N) * 10000 - 3) < 1.0
ok &= abs(hits_year / N * 100 - 3) < 0.3

print("ALL OK" if ok else "SOMETHING FAILED")
raise SystemExit(0 if ok else 1)
