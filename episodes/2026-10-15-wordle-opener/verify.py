"""Every number in the Wordle-opener episode, computed from the original Wordle answer list.

wordle_answers.txt: the 2,315 original answers; wordle_allowed.txt: the other accepted guesses
(both from Wordle's original source, mirrored at gist.github.com/cfreshman).
"""
import collections
import pathlib

HERE = pathlib.Path(__file__).parent
A = [w.strip() for w in open(HERE / "wordle_answers.txt") if w.strip()]
G = sorted(set(A) | {w.strip() for w in open(HERE / "wordle_allowed.txt") if w.strip()})

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def colors(guess, answer):
    """Wordle's tiles: 2 green, 1 yellow, 0 gray (extra copies of a letter go gray)."""
    r = [0] * 5
    left = collections.Counter()
    for i in range(5):
        if guess[i] == answer[i]:
            r[i] = 2
        else:
            left[answer[i]] += 1
    for i in range(5):
        if r[i] == 0 and left[guess[i]] > 0:
            r[i] = 1
            left[guess[i]] -= 1
    return tuple(r)

def piles(guess):
    return collections.Counter(colors(guess, a) for a in A)

def avg_left(guess):
    # answer picked at random from the list: you land in a pile with chance size/N, and size words are left
    p = piles(guess)
    return sum(v * v for v in p.values()) / len(A)

check("possible answers", len(A), 2315)
check("vowels in AUDIO", sum(c in "aeiou" for c in "audio"), 4)

pa, pr = piles("audio"), piles("raise")
check("AUDIO: most common result is one yellow A", pa.most_common(1)[0][0], (1, 0, 0, 0, 0))
check("AUDIO: words left after one yellow A", pa[(1, 0, 0, 0, 0)], 435)
check("AUDIO: piles", len(pa), 89)
check("AUDIO: average words left", round(avg_left("audio")), 184)
check("RAISE: piles", len(pr), 132)
check("RAISE: biggest pile", max(pr.values()), 168)
check("RAISE: average words left", round(avg_left("raise")), 61)
check("184 / 61 = three times", round(avg_left("audio") / avg_left("raise")), 3)
check("SLATE average left", round(avg_left("slate")), 72)
check("CRANE average left", round(avg_left("crane")), 79)
check("example: AUDIO vs STORM -> only O yellow", colors("audio", "storm"), (0, 0, 0, 0, 1))
check("example: RAISE vs STORM -> R and S yellow", colors("raise", "storm"), (1, 0, 0, 1, 0))

# Simulation: pick 200,000 random answers, play AUDIO / RAISE, count words still possible.
import random
random.seed(1)
for g, want in (("audio", 184), ("raise", 61)):
    p = piles(g)
    tot = sum(p[colors(g, random.choice(A))] for _ in range(200_000))
    check(f"simulated average left after {g.upper()} (200,000 games)", round(tot / 200_000 / 10) * 10, round(want / 10) * 10)

# Rank among every accepted guess (12,972 words)
ranked = sorted(G, key=avg_left)
print("best five openers by average words left:", [(w, round(avg_left(w), 1)) for w in ranked[:5]])
check("RAISE rank among all accepted guesses", ranked.index("raise") + 1, 2)
print("accepted guesses:", len(G))
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
