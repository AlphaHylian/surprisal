"""Every number and fact in the zip episode, computed or sourced."""
import glob
import zlib

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# 1. The pointer in "TO BE OR NOT TO BE": the second "TO BE" copies the first.
s = "TO BE OR NOT TO BE"
second = s.rfind("TO BE")
check("second 'TO BE' starts at index", second, 13)
check("distance back to the first copy", second - s.find("TO BE"), 13)
check("length copied", len("TO BE"), 5)
check("characters after the note", s[:second] + "", "TO BE OR NOT ")

# 2. A tiny LZ77 to confirm the note decodes, and the banana answer (overlapping copy)
def lz77(text, window=64):
    out, i = [], 0
    while i < len(text):
        best = (0, 0)
        for j in range(max(0, i - window), i):
            k = 0
            while i + k < len(text) and text[j + k] == text[i + k]:  # may overlap into new text
                k += 1
            if k > best[1]:
                best = (i - j, k)
        if best[1] >= 3:
            out.append(best); i += best[1]
        else:
            out.append(text[i]); i += 1
    return out

def unlz(tokens):
    out = []
    for t in tokens:
        if isinstance(t, tuple):
            for _ in range(t[1]):
                out.append(out[-t[0]])
        else:
            out.append(t)
    return "".join(out)

tok = lz77(s)
check("LZ77 of TO BE OR NOT TO BE", tok[-1], (13, 5))
check("decodes back", unlz(tok), s)
ban = lz77("BANANA")
print("banana ->", ban, "(answer not shown in the video: B, A, N, then 'back 2, copy 3')")
check("banana decodes", unlz(ban), "BANANA")

# 3. 'A page of English shrinks to about a third' (Deflate = the method inside .zip files)
ratios = []
for f in ["GPL-3", "Apache-2.0", "MPL-2.0", "GFDL-1.3", "LGPL-2.1"]:
    b = open(f"/usr/share/common-licenses/{f}", "rb").read()
    r = len(zlib.compress(b, 6)) / len(b)
    ratios.append(r)
    print(f"   {f}: {len(b)} -> {len(zlib.compress(b, 6))} bytes = {r:.0%}")
check("every English sample lands between 30% and 36%", all(0.30 <= r <= 0.36 for r in ratios), True)

print("ALL OK" if ok else "SOME CHECKS FAILED")
