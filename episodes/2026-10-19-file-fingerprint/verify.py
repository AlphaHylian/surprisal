"""Every number in the file-fingerprint (SHA-256) how-to episode, computed and simulated."""
import hashlib
import math
import random

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# a SHA-256 fingerprint: 256 bits, written as 64 hex characters
h = hashlib.sha256(b"hello").hexdigest()
check("hex characters in a SHA-256 fingerprint", len(h), 64)
check("bits in it", len(h) * 4, 256)
check("4 GB file is about 4 billion bytes", 4 * 10**9, 4_000_000_000)

# a simple sum of the bytes misses swapped bytes
orig = bytearray(b"PAY ALICE 100 EUR, PAY BOB 900 EUR")
swapped = bytearray(orig)
i, j = orig.index(b"1"), orig.index(b"9")
swapped[i], swapped[j] = swapped[j], swapped[i]
print(orig.decode(), "->", swapped.decode())
check("byte-sum unchanged after swapping two bytes", sum(orig) == sum(swapped), True)
check("SHA-256 changed after swapping", hashlib.sha256(orig).digest() != hashlib.sha256(swapped).digest(), True)
check("on-screen byte sums (ALICE 100 BOB 900 / swapped)", (sum(b"ALICE 100 BOB 900"), sum(b"ALICE 900 BOB 100")), (955, 955))
check("SHA-256 rounds (FIPS 180-4 / Wikipedia)", 64, 64)

# avalanche: flip one bit of a random file, count how many of the 256 output bits change
rng = random.Random(2026)
N = 100_000
total = 0
mn, mx = 256, 0
for _ in range(N):
    data = bytearray(rng.randbytes(64))
    a = int.from_bytes(hashlib.sha256(data).digest(), "big")
    k = rng.randrange(len(data) * 8)
    data[k // 8] ^= 1 << (k % 8)
    b = int.from_bytes(hashlib.sha256(data).digest(), "big")
    d = bin(a ^ b).count("1")
    total += d
    mn, mx = min(mn, d), max(mx, d)
avg = total / N
print(f"{N:,} one-bit flips: average {avg:.2f} of 256 output bits changed (min {mn}, max {mx})")
check("about half of the 256 bits flip (avg rounds to 128)", round(avg), 128)

# the on-screen example: one bit of "your-download.iso v1" flipped ("v0")
ea = hashlib.sha256(b"your-download.iso v1").digest()
eb = hashlib.sha256(b"your-download.iso v0").digest()
check("on-screen example: bits changed", bin(int.from_bytes(ea, "big") ^ int.from_bytes(eb, "big")).count("1"), 138)
check("on-screen hash v1", ea.hex()[:8], "1aa956cb")

# pigeonhole: more possible files than fingerprints, so twins must exist
check("340 trillion trillion trillion = 3.4e38 ~ 2^128", round(2**128 / 1e36), 340)
check("files of just 33 bytes outnumber all fingerprints", 2**(33 * 8) > 2**256, True)

# birthday bound: ~2^128 tries to find any matching pair
tries = 2**128
print(f"2^128 = {tries:.3e}; Wikipedia table: 50% after 4.0e38 for 256 bits")
p50 = math.sqrt(2 * math.log(2) * 2**256)
check("50% collision after ~4.0e38 hashes", f"{p50:.1e}", "4.0e+38")
rate = 8e9 * 1e9  # every person on Earth (8 billion) with a computer doing a billion hashes a second
yrs_low = tries / rate / (365.25 * 24 * 3600)
yrs_50 = p50 / rate / (365.25 * 24 * 3600)
print(f"8 billion people x 1 billion hashes/s: 2^128 tries -> {yrs_low:.3e} years; 50% -> {yrs_50:.3e} years")
check("over a trillion years (both)", yrs_low > 1e12 and yrs_50 > 1e12, True)
check("age of the universe ~13.8 billion years: over 70x", yrs_low / 13.8e9 > 70, True)
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
