"""Every number in the roulette house-edge Short, computed or simulated."""
import math
import random

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

# European wheel: 0-36, 18 red, 18 black, 1 green (https://en.wikipedia.org/wiki/Roulette)
red, black, green = 18, 18, 1
pockets = red + black + green
check("pockets", pockets, 37)

# $10 on red, 37 spins on average: 18 wins, 19 losses
bet = 10
check("wins per 37 spins", red, 18)
check("won", red * bet, 180)
check("losses per 37 spins", pockets - red, 19)
check("lost", (pockets - red) * bet, 190)
check("net per 37 spins", red * bet - (pockets - red) * bet, -10)
edge = 1 / pockets
check("edge (%)", round(edge * 100, 1), 2.7)

# Straight-up: $1 on every number, 37 dollars down, the winner pays 35 to 1 + stake back = 36
check("dollars down", pockets * 1, 37)
check("paid back", 35 + 1, 36)
check("lost per round", pockets - 36, 1)
check("straight-up edge same (%)", round((pockets - 36) / pockets * 100, 1), 2.7)
# pays as if 36 pockets: fair payout for 1 in 36 is 35 to 1
check("fair odds on 36 pockets", 36 - 1, 35)

# One player: 100 spins of $10 on red. Chance to be ahead (exact binomial + sim)
p = red / pockets
n = 100
p_ahead = sum(math.comb(n, k) * p**k * (1 - p)**(n - k) for k in range(51, n + 1))
print(f"one player, 100 spins: P(ahead) = {p_ahead:.3f}")
random.seed(1)
T = 200_000
ahead = sum(sum(random.random() < p for _ in range(n)) > 50 for _ in range(T))
print(f"  simulated ({T:,} players): {ahead / T:.3f}")
# (not said in the video: about 1 in 3 players is ahead after 100 spins)

# Casino: a million $10 bets on red in a night
N = 1_000_000
mean = N * bet * ((pockets - red) - red) / pockets  # casino's side
sd = bet * math.sqrt(N * (1 - ((red - (pockets - red)) / pockets) ** 2))
print(f"casino, 1M bets: mean {mean:,.0f}, sd {sd:,.0f}, z of a losing night {mean / sd:.1f}")
check("casino keeps ~270,000", round(mean, -4), 270_000)
check("give or take 20,000 (2 sd, rounded)", round(2 * sd, -4), 20_000)
# simulate 100,000 nights by normal sums of 1,000 tables x 1,000 bets (binomial draw per night)
import numpy as np
rng = np.random.default_rng(2)
wins = rng.binomial(N, p, size=100_000)
nightly = bet * ((N - wins) - wins)
print(f"  simulated 100,000 nights: worst night +{nightly.min():,}, losing nights {int((nightly < 0).sum())}")
check("losing nights in 100,000", int((nightly < 0).sum()), 0)
inside = np.mean(np.abs(nightly - mean) <= 20_000)
print(f"  share of nights within 270k +- 20k: {inside:.3f}")

# American wheel: 38 pockets, same payouts -> 2/38
check("American edge (%)", round(2 / 38 * 100, 2), 5.26)
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
