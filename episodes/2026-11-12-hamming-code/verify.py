"""Checks every number in 'hamming-code' (Hamming (7,4) code, three-circle picture).
Source: https://en.wikipedia.org/wiki/Hamming_code (Hamming, Bell Labs, Model V, 1950;
3 parity bits + 4 data bits; triple repetition rate 1/3)."""
import itertools, json, random
# regions of three circles A, B, C. Data in the overlaps, parity in the outer parts.
REG = ["AB", "AC", "BC", "ABC", "A", "B", "C"]          # positions 0..6
DATA = ["AB", "AC", "BC", "ABC"]
def encode(d):
    w = dict(zip(DATA, d))
    for c in "ABC":                                     # make each circle's count of 1s even
        w[c] = sum(w[x] for x in DATA if c in x) % 2
    return [w[x] for x in REG]
def odd_circles(word):
    w = dict(zip(REG, word))
    return "".join(c for c in "ABC" if sum(w[x] for x in REG if c in x) % 2)
def decode(word):
    word = list(word); o = odd_circles(word)
    if o: word[REG.index(o)] ^= 1                        # the one spot inside exactly the odd circles
    w = dict(zip(REG, word)); return [w[x] for x in DATA]
r = {}
msg = [1, 0, 1, 1]
cw = encode(msg); r["message"] = msg; r["codeword"] = dict(zip(REG, cw))
r["parity_A_B_C"] = [r["codeword"][c] for c in "ABC"]
print("1011 ->", r["codeword"])
assert r["parity_A_B_C"] == [0, 1, 0]
bad = cw[:]; bad[REG.index("BC")] ^= 1
r["flip_BC_odd_circles"] = odd_circles(bad)
assert r["flip_BC_odd_circles"] == "BC" and decode(bad) == msg
# exhaustive: every message, every single flip (and no flip) decodes right; each flip gives a different signature
sigs = set()
for d in itertools.product([0, 1], repeat=4):
    c = encode(list(d)); assert decode(c) == list(d) and odd_circles(c) == ""
    for i in range(7):
        e = c[:]; e[i] ^= 1; assert decode(e) == list(d); sigs.add(odd_circles(e))
r["distinct_signatures"] = len(sigs) + 1                 # 7 spots + no error
r["answers_from_3_checks"] = 2 ** 3
assert r["distinct_signatures"] == 8 == r["answers_from_3_checks"]
r["bits_hamming"] = len(cw); r["bits_three_copies"] = 3 * len(msg)
assert (r["bits_hamming"], r["bits_three_copies"]) == (7, 12)
r["two_checks_too_few"] = 2 ** 2 < 7 + 1
# 100,000 random messages with one random flipped bit
random.seed(2); ok = 0; N = 100_000
for _ in range(N):
    d = [random.randint(0, 1) for _ in range(4)]; c = encode(d); c[random.randrange(7)] ^= 1
    ok += decode(c) == d
r["sim_single_flip_fixed"] = f"{ok}/{N}"; assert ok == N
# repetition code also fixes any single flip (majority vote), with 12 bits
for d in itertools.product([0, 1], repeat=4):
    c = [b for b in d for _ in range(3)]
    for i in range(12):
        e = c[:]; e[i] ^= 1
        assert [int(sum(e[3*k:3*k+3]) >= 2) for k in range(4)] == list(d)
r["repetition_fixes_single_flip"] = True
print(json.dumps(r, indent=1)); json.dump(r, open("verify_results.json", "w"), indent=1); print("OK")
