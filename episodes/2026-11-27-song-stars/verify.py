"""Every number in the song-stars Short (how Shazam finds a song in a loud bar).
Source: Avery Li-Chun Wang, "An Industrial-Strength Audio Search Algorithm", ISMIR 2003
(https://www.ee.columbia.edu/~dpwe/papers/Wang03-shazam.pdf):
- spectrogram peaks ("constellation map"); a 1024-bin frequency axis gives at most 10 bits per peak;
- each anchor peak is paired with points in a target zone (fan-out F = 10): two frequencies + the time gap,
  10 + 10 + 10 = 30 bits, packed in a 32-bit integer; the specificity is ~a million times (20 extra bits) higher;
- pair survival ~ p^2, but with F = 10 at least one pair per anchor survives with p*[1-(1-p)^F] ~ p;
- matches: the right track's hits line up at one time offset (histogram peak);
- from a heavily corrupted 15 s sample, a match with only ~1-2% of hash tokens surviving;
- 50% recognition at about -9, -6, -3 dB SNR for 15, 10, 5 s samples (noise louder than music: SNR < 0 dB).
This file checks the arithmetic, simulates the survival odds (100,000+ trials), and runs a toy version
of the whole search (random 'songs' as star maps, a noisy 10 s clip with 2% of pairs surviving)."""
import random, math
from collections import Counter, defaultdict

ok = True
def check(name, got, want, tol):
    global ok
    good = abs(got - want) <= tol
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got:.6g} (script: {want})")

# one star: a pitch, one of 1,024
check("one star = one pitch of 1,024 (10 bits)", 2 ** 10, 1024, 0)
# a pair: two pitches + the gap = 30 bits -> one pattern in about a billion
check("a pair = 30 bits: about a billion patterns", 2 ** 30 / 1e9, 1.0, 0.08)
check("a pair is about a million times more specific than one star", 2 ** 20 / 1e6, 1.0, 0.05)
# noise louder than the music: -6 dB SNR (10 s, 50% recognised) means noise power 4x the music
check("-6 dB SNR: noise has ~4x the music's power", 10 ** (6 / 10), 4, 0.02)
check("-9 dB SNR: noise has ~8x the music's power", 10 ** (9 / 10), 8, 0.1)

# CTA: half the stars survive -> a pair needs both -> 1 in 4
rng = random.Random(1)
N = 200_000
p = 0.5
both = sum(1 for _ in range(N) if rng.random() < p and rng.random() < p)
check("CTA: half the stars survive -> pairs that survive (simulated, 200,000)", both / N, 0.25, 0.005)
# but with 10 partners per anchor, at least one pair per anchor survives ~ p
F = 10
hit = 0
for _ in range(N):
    if rng.random() < p and any(rng.random() < p for _ in range(F)):
        hit += 1
check("with 10 partners, anchors with >=1 surviving pair ~ p (simulated)", hit / N, p * (1 - (1 - p) ** F), 0.005)

# ---- toy search: 2,000 songs of 3 minutes, ~10 stars a second, pitch 0..1023, time in 0.1 s ticks
rng = random.Random(7)
SONGS, LEN, RATE = 1000, 180, 10
def song_stars():
    n = LEN * RATE
    return sorted((rng.randrange(LEN * 10), rng.randrange(1024)) for _ in range(n))
def pairs(stars, fan=10, maxgap=40):
    out = []
    for i, (t1, f1) in enumerate(stars):
        k = 0
        for t2, f2 in stars[i + 1:]:
            dt = t2 - t1
            if dt <= 0: continue
            if dt > maxgap or k >= fan: break
            out.append(((f1, f2, dt), t1)); k += 1
    return out
index = defaultdict(list)
db = []
for s in range(SONGS):
    st = song_stars(); db.append(st)
    for h, t in pairs(st):
        index[h].append((s, t))
print(f"toy index: {SONGS} songs, {sum(len(v) for v in index.values()):,} pairs")

def query(s, keep, noise_per_star):
    t0 = rng.randrange(LEN * 10 - 100)
    clip = [(t - t0, f) for t, f in db[s] if t0 <= t < t0 + 100 and rng.random() < keep]
    n_noise = int(noise_per_star * RATE * 10)
    clip += [(rng.randrange(100), rng.randrange(1024)) for _ in range(n_noise)]
    clip.sort()
    qp = pairs(clip)
    true_pairs = set(h for h, _ in pairs([(t - t0, f) for t, f in db[s] if t0 <= t < t0 + 100]))
    surv = sum(1 for h, _ in qp if h in true_pairs) / max(1, len(qp))
    votes = Counter()
    for h, tq in qp:
        for song, tdb in index.get(h, ()):
            votes[(song, tdb - tq)] += 1
    (best, _), score = votes.most_common(1)[0]
    # best score of any wrong song
    wrong = max((v for (song, _), v in votes.items() if song != s), default=0)
    return best == s, surv, score, wrong

# keep 40% of the song's stars and add 3 noise stars for each real one (noise louder than music)
trials = 300
wins = 0; survs = []; margins = []
for _ in range(trials):
    s = rng.randrange(SONGS)
    good, surv, score, wrong = query(s, keep=0.4, noise_per_star=3.0)
    wins += good; survs.append(surv); margins.append((score, wrong))
rate = wins / trials
avg_surv = sum(survs) / trials
print(f"toy: {wins}/{trials} found, pairs surviving {avg_surv:.1%}, median right score "
      f"{sorted(m[0] for m in margins)[trials // 2]}, median best wrong {sorted(m[1] for m in margins)[trials // 2]}")
check("toy: only 1 or 2 pairs in 100 survive the noise", avg_surv * 100, 1.5, 1.0)
check("toy: the right song still wins (share of 300 clips)", rate, 1.0, 0.03)
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
