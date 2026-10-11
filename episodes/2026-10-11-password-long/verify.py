"""Long-form: how to make a password a hacker can't crack. Every number said or shown is computed here."""
import math
import random

RATE = 100e9                      # guesses per second used in the video (rounded down from one card)
MD5_4090 = 155.9e9                # hashcat v6.2.6 benchmark, RTX 4090, mode 0
BCRYPT5_4090 = 239.6e3            # same benchmark, mode 3200, 32 iterations (cost 5)
YEAR = 365.25 * 86400


def human(s):
    if s < 120: return f"{s:.3g} s"
    if s < 7200: return f"{s/60:.3g} min"
    if s < 2 * 86400: return f"{s/3600:.3g} h"
    if s < YEAR: return f"{s/86400:.3g} days ({s/86400/30.44:.3g} months)"
    return f"{s/YEAR:,.4g} years"


def show(label, n, rate=RATE):
    print(f"{label:38s} {n:.4g} guesses  {math.log2(n):5.1f} bits  full search {human(n/rate)}")


print("26*26 =", 26 * 26, " 26^3 =", 26 ** 3)
show("8 lowercase", 26 ** 8)
print("  exact 26^8 =", f"{26**8:,}", " average hit (half):", human(26 ** 8 / 2 / RATE))
show("8 chars of 95", 95 ** 8)
print("  95/26 =", round(95 / 26, 2))
for n in (12, 14, 16):
    show(f"{n} lowercase", 26 ** n)
show("5 diceware words", 7776 ** 5)
show("6 diceware words", 7776 ** 6)
print("7776 = 6^5:", 6 ** 5 == 7776, " bits per word", round(math.log2(7776), 2))
show("xkcd 936: 44 bits", 2 ** 44)

# dictionary + rules
rules = 100_000 * 2 * 100 * 33
print(f"dictionary rules: 100,000 x 2 x 100 x 33 = {rules:,} -> {rules/RATE:.4f} s (under a hundredth: {rules/RATE < 0.01})")

# hash speeds
print(f"MD5 / bcrypt(cost 5) = {MD5_4090/BCRYPT5_4090:,.0f}x")
b10 = BCRYPT5_4090 / 2 ** 5
print(f"bcrypt cost 10 = {b10:,.0f}/s (32x slower than cost 5)")
print("8 lowercase vs bcrypt 10:", human(26 ** 8 / b10))
print("xkcd 44 bits vs bcrypt 10:", human(2 ** 44 / b10))
print("6 words vs bcrypt 10:", human(7776 ** 6 / b10), "(the Sun has ~5 billion years left)")
print("1,000x faster: 6 words ->", human(7776 ** 6 / (RATE * 1000)), "; 7 words ->", human(7776 ** 7 / (RATE * 1000)))

# simulation: random search finds a random password on average halfway (100,000 trials)
random.seed(1)
space = 26 ** 8
trials = [random.randrange(space) + 1 for _ in range(100_000)]
print(f"simulated mean position of the password in a random-order search: {sum(trials)/len(trials)/space:.4f} of the space")

# simulation: salt. 1,000 users, 50 share a password; unsalted, one hash of the guess checks everyone
import hashlib
users = [f"pw{random.randrange(10**6)}" for _ in range(950)] + ["summer24!"] * 50
unsalted = [hashlib.md5(p.encode()).hexdigest() for p in users]
g = hashlib.md5(b"summer24!").hexdigest()
print("unsalted: one hash of 'summer24!' matches", sum(h == g for h in unsalted), "users")
salts = [f"{random.getrandbits(64):016x}" for _ in users]
salted = [hashlib.md5((s + p).encode()).hexdigest() for s, p in zip(salts, users)]
print("salted: the same single hash matches", sum(h == g for h in salted), "users; checking one guess for all takes", len(users), "hashes")
print("md5('hunter2') =", hashlib.md5(b"hunter2").hexdigest(), " md5('hunter3') =", hashlib.md5(b"hunter3").hexdigest())
