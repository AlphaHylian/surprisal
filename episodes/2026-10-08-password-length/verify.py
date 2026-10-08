"""Every number in the password-length how-to episode."""
import random

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

RATE = 100e9                      # guesses per second (one RTX 4090 does ~150 billion MD5/s in hashcat)
YEAR = 365.25 * 24 * 3600
def secs(n): return n / RATE      # time to try every combination

check("8 lowercase: 26^8 ~ 209 billion", round(26**8 / 1e9), 209)
check("... about 2 seconds to try them all", round(secs(26**8)), 2)
check("printable ASCII choices per spot", len([chr(c) for c in range(32, 127)]), 95)
check("8 of 95: 6.6 quadrillion", round(95**8 / 1e15, 1), 6.6)
check("... 18 hours", round(secs(95**8) / 3600), 18)
check("12 lowercase: 11 days", round(secs(26**12) / 86400), 11)
check("16 lowercase: ~14,000 years", round(secs(26**16) / YEAR, -3), 14000)
check("12 lowercase beats 8 of 95", 26**12 > 95**8, True)
check("Diceware list = 6^5 words", 6**5, 7776)
check("six words: ~70,000 years", round(secs(7776**6) / YEAR, -4), 70000)
check("five words: ~9 years", round(secs(7776**5) / YEAR), 9)
check("CTA: 5 words beat 12 letters", 7776**5 > 26**12, True)
check("CTA: 5 words vs 12 letters, ~300x", round(7776**5 / 26**12, -2), 300)

# simulate: brute force on a random 3-letter lowercase password; average guesses = half the space
random.seed(1)
alpha = "abcdefghijklmnopqrstuvwxyz"
N = 100_000
tot = 0
for _ in range(N):
    pw = random.randrange(26**3)
    order = random.randrange(26**3)  # attacker starts at a random point and walks the space
    tot += (pw - order) % 26**3 + 1
avg = tot / N
print(f"   simulated average guesses for 3 letters: {avg:.0f} of {26**3}")
check("average search ~ half the space", abs(avg / 26**3 - 0.5) < 0.01, True)
print("ALL OK" if ok else "SOMETHING FAILED")
raise SystemExit(0 if ok else 1)
