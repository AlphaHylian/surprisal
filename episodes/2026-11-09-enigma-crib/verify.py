"""Every number in the enigma-crib episode (Enigma never enciphers a letter as itself; crib dragging;
the bombe). Sources: https://en.wikipedia.org/wiki/Cryptanalysis_of_the_Enigma (reflector: no letter to
itself, used to eliminate crib positions; WETTER crib; 17,576 scrambler positions; 60 wheel orders;
plugboard with ten leads 150,738,274,937,250), https://en.wikipedia.org/wiki/Bombe (Turing 1939, first
bombe March 1940, ~20 minutes for all 17,576 positions of one rotor order, a self-match is a 'crash')."""
import json, random
from math import factorial, perm
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = bool(got == want)
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
# Enigma I rotors I-V and reflector B (standard wirings), notches
ROT = {"I": ("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q"), "II": ("AJDKSIRUXBLHWTMCQGZNPYFVOE", "E"),
       "III": ("BDFHJLCPRTXVZNYEIWGAKMUSQO", "V"), "IV": ("ESOVPZJAYQUIRHXLNFTGKDCMWB", "J"),
       "V": ("VZBRGITYUPSDNHLXAWMJQOFECK", "Z")}
REF_B = "YRUHQSLDPXNGOKMIEBFZCWVJAT"

class Enigma:
    def __init__(self, rotors, pos, rings="AAA", plugs=""):
        self.w = [ROT[r][0] for r in rotors]; self.n = [ROT[r][1] for r in rotors]
        self.p = [A.index(c) for c in pos]; self.r = [A.index(c) for c in rings]
        self.pb = {c: c for c in A}
        for pair in plugs.split():
            a, b = pair; self.pb[a] = b; self.pb[b] = a
    def step(self):
        l, m, r = 0, 1, 2
        if A[self.p[m]] == self.n[m]:
            self.p[m] = (self.p[m] + 1) % 26; self.p[l] = (self.p[l] + 1) % 26
        elif A[self.p[r]] == self.n[r]:
            self.p[m] = (self.p[m] + 1) % 26
        self.p[r] = (self.p[r] + 1) % 26
    def through(self, i, c, back):
        sh = self.p[i] - self.r[i]
        x = (c + sh) % 26
        x = self.w[i].index(A[x]) if back else A.index(self.w[i][x])
        return (x - sh) % 26
    def key(self, ch):
        self.step()
        c = A.index(self.pb[ch])
        for i in (2, 1, 0): c = self.through(i, c, False)
        c = A.index(REF_B[c])
        for i in (0, 1, 2): c = self.through(i, c, True)
        return self.pb[A[c]]
    def run(self, text): return "".join(self.key(ch) for ch in text)

# sanity check against the well-known test vector: rotors I-II-III, AAA, rings AAA: AAAAA -> BDZGO
check("Enigma model matches the standard test vector (AAAAA -> BDZGO)", Enigma(["I", "II", "III"], "AAA").run("AAAAA"), "BDZGO")
e1 = Enigma(["II", "IV", "V"], "BLA", "BUL", "AV BS CG DL FU HZ IN KM OW RX")
msg = "WETTERVORHERSAGEBISKAYA"
ct = e1.run(msg)
check("decrypting with the same settings gives the message back", Enigma(["II", "IV", "V"], "BLA", "BUL", "AV BS CG DL FU HZ IN KM OW RX").run(ct), msg)

# the flaw: a letter never comes out as itself (100,000 random settings x a letter each)
rng = random.Random(1940)
selfs = 0
T = 100_000
for _ in range(T):
    rs = rng.sample(list(ROT), 3)
    letters = list(A); rng.shuffle(letters)
    plugs = " ".join(letters[2*i] + letters[2*i+1] for i in range(10))
    e = Enigma(rs, "".join(rng.choice(A) for _ in range(3)), "".join(rng.choice(A) for _ in range(3)), plugs)
    for _ in range(rng.randrange(0, 50)): e.step()
    ch = rng.choice(A)
    selfs += e.key(ch) == ch
check(f"{T:,} random settings: a letter never came out as itself", selfs, 0)

# brute force is hopeless
plug10 = factorial(26) // (factorial(6) * factorial(10) * 2 ** 10)
check("plugboard with 10 cables: 150,738,274,937,250", f"{plug10:,}", "150,738,274,937,250")
check("rotor positions: 26 x 26 x 26 = 17,576", 26 ** 3, 17576)
check("wheel orders: 3 of 5 rotors = 60", perm(5, 3), 60)
total = 60 * 26 ** 3 * plug10
check("all settings: 158,962,555,217,826,360,000 (about 159 billion billion)", f"{total:,}", "158,962,555,217,826,360,000")
yrs = total / 1e6 / (365.25 * 86400)
check("a million settings a second: about 5 million years", round(yrs / 1e6), 5)
results["brute_force_years_at_1e6_per_s"] = f"{yrs:,.0f}"

# crib dragging on a real ciphertext: the stock phrase KEINEBESONDERENEREIGNISSE ('nothing to report',
# 25 letters) at every position of a 30-letter stretch
CRIB = "KEINEBESONDERENEREIGNISSE"
check("crib is 25 letters", len(CRIB), 25)
def crib_demo(seed):
    r = random.Random(seed)
    rs = r.sample(list(ROT), 3)
    letters = list(A); r.shuffle(letters)
    plugs = " ".join(letters[2*i] + letters[2*i+1] for i in range(10))
    pos = "".join(r.choice(A) for _ in range(3))
    pre = "".join(r.choice(A) for _ in range(3))   # unknown letters before the crib
    plain = pre + CRIB + "XX"
    c = Enigma(rs, pos, "AAA", plugs).run(plain)[:30]
    crash = []
    for k in range(len(c) - len(CRIB) + 1):
        crash.append([i for i in range(len(CRIB)) if c[k + i] == CRIB[i]])
    return c, crash, len(pre)
# the demo shown on screen: the first seed, not cherry-picked
seed = 0
c, crash, true = crib_demo(seed)
check("demo: the true position never crashes", crash[true], [])
results.update(demo_seed=seed, demo_ciphertext=c, demo_true_position=true, demo_crashes=crash)
print("demo ciphertext", c, "true position", true, "crash pattern", crash)
p_survive = (25 / 26) ** 6
print(f"a wrong position of a 6-letter crib survives with chance (25/26)^6 = {p_survive:.3f}; 25 letters: {(25/26)**25:.3f}")
results["p_wrong_survives_6"] = f"{p_survive:.3f}"

# a bombe: 17,576 positions in ~20 minutes -> 60 wheel orders = 20 hours for one machine
check("one bombe, all 60 wheel orders at 20 minutes each: 20 hours", 60 * 20 / 60, 20)

Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
