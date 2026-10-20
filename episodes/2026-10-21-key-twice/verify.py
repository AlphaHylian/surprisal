"""Every number and letter in the one-time-pad how-to episode, computed and simulated."""
import random
from collections import Counter

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

A = ord("A")
enc = lambda m, k: "".join(chr((ord(a) - A + ord(b) - A) % 26 + A) for a, b in zip(m, k))
sub = lambda c, k: "".join(chr((ord(a) - ord(b)) % 26 + A) for a, b in zip(c, k))

# Wikipedia's own example first (HELLO + XMCKL = EQNVZ; key TQURI makes it read LATER)
check("Wikipedia: HELLO + XMCKL", enc("HELLO", "XMCKL"), "EQNVZ")
check("Wikipedia: EQNVZ - TQURI", sub("EQNVZ", "TQURI"), "LATER")

KEY = "XMCKLQ"            # 6 random-looking letters (Wikipedia's XMCKL plus one)
M1, M2 = "ATTACK", "RETIRE"
C1, C2 = enc(M1, KEY), enc(M2, KEY)
check("message 1 sent as", C1, "XFVKNA")
check("message 2 sent as (same key)", C2, "OQVSCU")

# step 2: the spy's view of C1 alone: some key turns it into any 6-letter message
for alt in ("ATTACK", "DEFEND", "RETIRE"):
    k = sub(C1, alt)
    check(f"key {k} makes {C1} read {alt}", sub(C1, k), alt)
check("6-letter messages a 6-letter ciphertext can be", 26 ** 6, 308_915_776)

# perfect secrecy by simulation: encrypt ATTACK and DEFEND with 100,000 fresh random keys each;
# the ciphertext letters come out uniform either way (the spy can't tell which was sent)
rng = random.Random(2026)
N = 100_000
rk = lambda: "".join(chr(A + rng.randrange(26)) for _ in range(6))
for m in ("ATTACK", "DEFEND"):
    first = Counter(enc(m, rk())[0] for _ in range(N))
    lo, hi = min(first.values()) / N, max(first.values()) / N
    print(f"{m}: first ciphertext letter frequencies {lo:.4f}-{hi:.4f} (uniform = {1/26:.4f})")
    check(f"{m}: all 26 letters equally likely (within 0.4 pt)", hi - lo < 0.008, True)

# step 3: reuse. Subtracting the two sent messages cancels the key, every time
diff = sub(C1, C2)
check("C1 - C2 equals M1 - M2 (no key left)", diff, sub(M1, M2))
cancels = sum(sub(enc(a, k), enc(b, k)) == sub(a, b)
              for a, b, k in ((rk(), rk(), rk()) for _ in range(N)))
check(f"key cancels in {N:,} random reused pairs", cancels, N)

# step 4: guess ATTACK in message 1 -> message 2 and the key fall out
check("guess ATTACK -> message 2", sub(M1, diff), "RETIRE")
check("guess ATTACK -> the key", sub(C1, "ATTACK"), KEY)

# reveal: Venona (Wikipedia, Venona project): duplicates produced in 1942, ~35,000 pages,
# ~3,000 messages decrypted and translated, spies at Los Alamos (Fuchs, the Rosenbergs)
check("duplicate pages printed in", 1942, 1942)
check("messages read (approx.)", 3_000, 3_000)
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
