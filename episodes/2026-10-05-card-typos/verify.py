"""Every number in the card-typos (Luhn) how-to episode, computed or exhaustively checked."""
import random

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def luhn_sum(digits):
    """Sum with every second digit doubled, starting from the rightmost (the check digit is not doubled)."""
    tot = 0
    for i, d in enumerate(reversed(digits)):
        if i % 2 == 1:
            d *= 2
            if d > 9: d -= 9
        tot += d
    return tot

def valid(digits): return luhn_sum(digits) % 10 == 0
def check_digit(payload):
    return (10 - luhn_sum(payload + [0]) % 10) % 10

# Wikipedia worked example: 1789372997 -> 4
check("Wikipedia example check digit", check_digit([int(c) for c in "1789372997"]), 4)

# Our on-screen card: 15 digits + check digit
payload = [int(c) for c in "453914880343646"]
cd = check_digit(payload)
card = payload + [cd]
print("   card:", "".join(map(str, card)))
check("check digit", cd, 7)
check("valid", valid(card), True)
total = luhn_sum(card)
check("total of the valid card", total, 80)
# doubled digit over 9: 8 doubled is 16 -> 7
check("8 doubled, minus 9", 16 - 9, 7)

# Typo: 4th digit (a 9) typed as a 7
typo = card.copy(); typo[3] = 7
print("   typo card:", "".join(map(str, typo)), "sum", luhn_sum(typo))
check("typo rejected", valid(typo), False)
check("typo total", luhn_sum(typo), 78)

# Every single-digit error is caught (exhaustive over positions and digits, 100,000 random cards)
random.seed(1)
caught = total_err = 0
for _ in range(100_000):
    p = [random.randrange(10) for _ in range(15)]
    c = p + [check_digit(p)]
    pos = random.randrange(16)
    new = random.choice([d for d in range(10) if d != c[pos]])
    e = c.copy(); e[pos] = new
    total_err += 1; caught += not valid(e)
check("single-digit errors caught (simulated)", caught / total_err, 1.0)
# exhaustive reason: changing one digit changes its contribution by 1..9 (doubling map is a permutation)
dbl = [(2 * d) - 9 if 2 * d > 9 else 2 * d for d in range(10)]
check("doubling map is a permutation of 0-9", sorted(dbl), list(range(10)))

# Adjacent swaps: which unordered pairs a != b are missed?
missed = []
for a in range(10):
    for b in range(a + 1, 10):
        # pair in positions (doubled, plain) -> swapped
        if (dbl[a] + b) % 10 == (dbl[b] + a) % 10:
            missed.append((a, b))
check("missed adjacent swaps", missed, [(0, 9)])
check("swap pairs caught", 45 - len(missed), 44)

# Swap example on screen: digits 3 and 8 (positions 9-10 of our card, "0343" area) -> pick an actual neighbour pair
swap = card.copy()
j = 2  # "39" at positions 2,3 -> "93"
check("digits at 3rd,4th place", (card[j], card[j + 1]), (3, 9))
swap[j], swap[j + 1] = swap[j + 1], swap[j]
print("   swapped card:", "".join(map(str, swap)), "sum", luhn_sum(swap))
check("swap rejected", valid(swap), False)

# CTA: check digit for 1234 -> 4
check("CTA: check digit for 1234", check_digit([1, 2, 3, 4]), 4)

print("ALL OK" if ok else "SOME CHECKS FAILED")
