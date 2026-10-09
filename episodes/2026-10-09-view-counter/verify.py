"""Every number in the YouTube view-counter Short, computed."""
import ctypes

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

check("10 switches count to", 2**10 - 1, 1_023)
check("20 switches, about a million", round((2**20 - 1) / 1e6), 1)
check("20 switches exact", 2**20 - 1, 1_048_575)
check("32 bits minus the sign bit", 32 - 1, 31)
check("31 switches top out at", 2**31 - 1, 2_147_483_647)
check("signed 32-bit max (ctypes)", ctypes.c_int32(2**31 - 1).value, 2_147_483_647)
wrapped = ctypes.c_int32(2**31 - 1 + 1).value
check("one more view wraps to", wrapped, -2_147_483_648)
before, after = format(2**31 - 1, "032b"), format((2**31) & 0xFFFFFFFF, "032b")
flips = sum(a != b for a, b in zip(before, after))
print(before, "->", after)
check("switches that flip", flips, 32)
max64 = 2**63 - 1
check("64-bit max", max64, 9_223_372_036_854_775_807)
check("9.2 quintillion", round(max64 / 1e18, 1), 9.2)
world = 8.3e9  # https://en.wikipedia.org/wiki/World_population: about 8.3 billion (2026)
per_person = max64 / world
print(f"views per person: {per_person:,.0f}")
check("over a billion views each", per_person > 1e9, True)
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
