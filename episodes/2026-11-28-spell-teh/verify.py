"""spell-teh: how a spell checker fixes 'teh' without a list of typos (Norvig's corrector).
Source: Peter Norvig, "How to Write a Spelling Corrector", https://norvig.com/spell-correct.html
  - edits of a word of length n: n deletions, n-1 transpositions, 26n alterations, 26(n+1) insertions = 54n+25
  - word counts from big.txt (~a million words of Project Gutenberg books + Wiktionary/BNC frequency lists)
  - 75% of 270 (development set), 68% of 400 (final test set) corrected
Damerau (1964, CACM): "more than 80% were a result of a single error of one of the four types"
  (https://en.wikipedia.org/wiki/Damerau%E2%80%93Levenshtein_distance)
big.txt is downloaded to build/ if missing (sha256 checked)."""
import hashlib, json, os, random, re, sys, urllib.request
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
BIG = os.environ.get("BIG_TXT", os.path.join(HERE, "build", "big.txt"))
SHA = "fa066c7d40f0f201ac4144e652aa62430e58a6b3805ec70650f678da5804e87b"
if not os.path.exists(BIG):
    os.makedirs(os.path.dirname(BIG), exist_ok=True)
    urllib.request.urlretrieve("https://norvig.com/big.txt", BIG)
data = open(BIG, "rb").read()
assert hashlib.sha256(data).hexdigest() == SHA, "big.txt changed"
WORDS = Counter(re.findall(r"\w+", data.decode("latin-1").lower()))
N = sum(WORDS.values())
print("words in big.txt:", N, "distinct:", len(WORDS))
assert 1_000_000 < N < 1_200_000   # "a million words"

L = "abcdefghijklmnopqrstuvwxyz"
def edits(w):
    s = [(w[:i], w[i:]) for i in range(len(w) + 1)]
    d = [a + b[1:] for a, b in s if b]
    t = [a + b[1] + b[0] + b[2:] for a, b in s if len(b) > 1]
    r = [a + c + b[1:] for a, b in s if b for c in L]
    i = [a + c + b for a, b in s for c in L]
    return d, t, r, i

d, t, r, i = edits("teh")
assert (len(d), len(t), len(r), len(i)) == (3, 2, 78, 104)
allx = d + t + r + i
assert len(allx) == 187 == 54 * 3 + 25            # "187 guesses"
assert "the" in t                                   # 'the' is one swap
assert "tzh" in r and "tehq" in i                   # junk examples shown on screen
known = sorted(((WORDS[x], x) for x in set(allx) if x in WORDS), reverse=True)
print("known:", known)
assert len(known) == 8                              # "only 8 are in its word list"
assert known[0] == (79809, "the")                   # "the: 79,809 times"
assert dict((w, c) for c, w in known)["ten"] == 219 and dict((w, c) for c, w in known)["tea"] == 107
assert round(79809 / 219) == 364

def correction(w):
    if w in WORDS: return w
    c = [x for x in set(sum(edits(w), [])) if x in WORDS]
    return max(c, key=WORDS.get) if c else w
assert correction("teh") == "the"
# the comment question: acress -> actress, across, access, acres?
ac = {x: WORDS[x] for x in ["actress", "across", "access", "acres"]}
print("acress candidates:", ac, "->", correction("acress"))
assert correction("acress") == "across" and ac["across"] == 220 and ac["actress"] == 7

# simulation: make 100,000 random single-slip typos of common words and see how often the corrector
# gets the original back (this is NOT the 68% figure, which is Norvig's test on real typos; it's a sanity check)
random.seed(2)
common = [w for w, c in WORDS.most_common(5000) if w.isalpha() and len(w) >= 3]
ok = 0; T = 100_000
for _ in range(T):
    w = random.choice(common)
    k = random.randrange(4); p = random.randrange(len(w))
    if k == 0: typo = w[:p] + w[p + 1:]
    elif k == 1 and p < len(w) - 1: typo = w[:p] + w[p + 1] + w[p] + w[p + 2:]
    elif k == 2: typo = w[:p] + random.choice(L) + w[p + 1:]
    else: typo = w[:p] + random.choice(L) + w[p:]
    ok += correction(typo) == w
print(f"random single-slip typos of common words fixed: {ok / T:.3f}")
res = {"edits_teh": 187, "known_teh": 8, "the": 79809, "ten": 219, "tea": 107, "acress": "across",
       "norvig_dev": "75% of 270", "norvig_test": "68% of 400", "sim_fixed": round(ok / T, 3)}
print(json.dumps(res))
print("ALL CHECKS PASSED")
