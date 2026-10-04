"""Every number in the zip how-to episode, computed or sourced."""
import heapq
import zlib

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# 1. "to be or not to be": the second "to be" is a copy -> note "go back 13, copy 5"
s = "to be or not to be"
check("second 'to be' starts at", s.rfind("to be"), 13)
check("go back", s.rfind("to be") - s.find("to be"), 13)
check("copy", len("to be"), 5)

# 2. Bits (Deflate fixed Huffman codes, RFC 1951 3.2.6):
#    literals 0-143 are 8 bits; length 5 = length code 259, which is in 256-279 -> 7 bits, 0 extra;
#    distance 13 = distance code 7 (13-16), fixed 5-bit code + 2 extra bits.
literal_bits = 5 * 8
note_bits = 7 + 0 + 5 + 2
check("5 letters as literals (bits)", literal_bits, 40)
check("the note (bits)", note_bits, 14)

# 3. Window: Deflate looks back at most 32K = 32,768 bytes (RFC 1951)
check("window", 32 * 1024, 32768)

# 4. Letter frequencies in English texts (Wikipedia, Letter frequency, 'Texts' column, %)
freq = {"a": 8.2, "b": 1.5, "c": 2.8, "d": 4.3, "e": 12.7, "f": 2.2, "g": 2.0, "h": 6.1, "i": 7.0, "j": 0.16,
        "k": 0.77, "l": 4.0, "m": 2.4, "n": 6.7, "o": 7.5, "p": 1.9, "q": 0.12, "r": 6.0, "s": 6.3, "t": 9.1,
        "u": 2.8, "v": 0.98, "w": 2.4, "x": 0.15, "y": 2.0, "z": 0.074}
check("e is ~172x as common as z", round(freq["e"] / freq["z"]), 172)

def huffman(fr):
    h = [[w, [sym, ""]] for sym, w in fr.items()]
    heapq.heapify(h)
    while len(h) > 1:
        a, b = heapq.heappop(h), heapq.heappop(h)
        for p in a[1:]: p[1] = "0" + p[1]
        for p in b[1:]: p[1] = "1" + p[1]
        heapq.heappush(h, [a[0] + b[0]] + a[1:] + b[1:])
    return {sym: code for sym, code in h[0][1:]}

codes = huffman(freq)
check("e gets 3 bits", len(codes["e"]), 3)
check("z gets 9 bits", len(codes["z"]), 9)
avg = sum(freq[c] * len(codes[c]) for c in freq) / sum(freq.values())
check("average bits per letter, rounded", round(avg, 1), 4.2)
print("codes shown on screen: e =", codes["e"], " z =", codes["z"], " t =", codes["t"], " a =", codes["a"], " o =", codes["o"])

# 5. Prefix property: no code is the start of another, so the table decodes unambiguously
vals = list(codes.values())
check("prefix-free", all(not b.startswith(a) for a in vals for b in vals if a != b), True)

# 6. "a page of English drops to about a third" (Deflate via zlib on 5 English documents)
ratios = []
for f in ["GPL-3", "Apache-2.0", "MPL-2.0", "GFDL-1.3", "LGPL-2.1"]:
    b = open(f"/usr/share/common-licenses/{f}", "rb").read()
    ratios.append(len(zlib.compress(b, 6)) / len(b))
print("   ratios:", [f"{r:.0%}" for r in ratios])
check("all between 30% and 36%", all(0.30 <= r <= 0.36 for r in ratios), True)
check("48 MB at 34% is about 16 MB", round(48 * 0.34), 16)

print("ALL OK" if ok else "SOME CHECKS FAILED")
