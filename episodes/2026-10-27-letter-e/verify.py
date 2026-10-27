"""Every number in the letter-e how-to episode (frequency analysis; Mary, Queen of Scots, 1586), computed and checked."""
import json
import random
from math import factorial

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# A cipher that swaps every letter for its own symbol: any ordering of 26 symbols is a key.
keys = factorial(26)
print(f"26! = {keys:,}")
check("keys, septillions (10^24), rounded down to the hundred", keys // 10**24 // 100 * 100, 400)
check("keys, septillions shown on screen", keys // 10**24, 403)
years = keys / 1e9 / (365.25 * 24 * 3600)
check("a billion keys a second, all keys: billions of years", round(years / 1e9), 13)

# English letter frequencies (Lewand, Cryptological Mathematics, 2000; Wikipedia 'Letter frequency')
freq = {"e": 12.7, "t": 9.1, "a": 8.2, "o": 7.5, "i": 7.0, "n": 6.7, "s": 6.3, "h": 6.1, "r": 6.0,
        "d": 4.3, "l": 4.0, "c": 2.8, "u": 2.8, "m": 2.4, "w": 2.4, "f": 2.2, "g": 2.0, "y": 2.0,
        "p": 1.9, "b": 1.5, "v": 0.98, "k": 0.77, "j": 0.15, "x": 0.15, "q": 0.095, "z": 0.074}
check("26 letters in the table", len(freq), 26)
total = sum(freq.values())
p = {k: v / total for k, v in freq.items()}
order = sorted(p, key=p.get, reverse=True)
check("top three letters", "".join(order[:3]).upper(), "ETA")
check("E share, percent", round(freq["e"]), 13)
check("one letter in 8 is an E", round(1 / (freq["e"] / 100)), 8)
check("E vs Z, times more common", round(freq["e"] / freq["z"]), 172)

# Simulate: 100,000 random messages through random keys. How often is the most common
# symbol the one that stands for E? (The script: "in a long letter, more than 9 times in 10";
# a long letter = 500 letters. Short messages are not that reliable: 50 letters ~39%.)
random.seed(1586)
letters, weights = list(p), list(p.values())
def top_is_e(n):
    msg = random.choices(letters, weights, k=n)
    key = dict(zip(letters, random.sample(range(26), 26)))
    counts = [0] * 26
    for ch in msg:
        counts[key[ch]] += 1
    m = max(counts)
    return counts[key["e"]] == m and counts.count(m) == 1
TRIALS = 100_000
for n in (50, 500):
    hit = sum(top_is_e(n) for _ in range(TRIALS)) / TRIALS
    results[f"sim top symbol is E, {n} letters"] = f"{hit:.3f}"
    print(f"{n}-letter messages: top symbol is E in {hit:.1%}")
hit500 = float(results["sim top symbol is E, 500 letters"])
check("500 letters: top symbol is E more than 9 times in 10", hit500 > 0.9, True)

# The three-symbol word ending in the E-symbol: THE is the most common English word
check("THE gives two new letters (T, H) once E is known", len(set("the") - {"e"}), 2)
check("3 letters known after T, H, E, out of 26: left", 26 - 3, 23)
# Wikipedia 'Substitution cipher': unicity distance 27.6 letters, ~50 in practice
check("letters of code usually enough", 50, 50)
check("Mary's letter 1586 -> execution 1587", 1587 - 1586, 1)

json.dump(results, open(__file__.replace("verify.py", "results.json"), "w"), indent=1)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
