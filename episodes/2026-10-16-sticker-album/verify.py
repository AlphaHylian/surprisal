"""Every number in the sticker-album Short, computed and simulated (coupon collector's problem)."""
import numpy as np

N, PACK = 670, 5          # Panini FIFA World Cup Qatar 2022: 670 stickers, packs of 5
ok = True
def check(name, got, want, tol=0):
    global ok
    good = abs(got - want) <= tol
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got:.2f} (script: {want})")

H = lambda k: sum(1 / i for i in range(1, k + 1))
def cost(missing_from, missing_to):
    """expected stickers to go from `missing_from` empty slots down to `missing_to`"""
    return sum(N / m for m in range(missing_to + 1, missing_from + 1))

total = N * H(N)
check("expected stickers, packs only (~4,700)", total, 4700, 60)
check("that's ~7 albums' worth", total / N, 7, 0.2)
check("packs (~950)", total / PACK, 950, 15)
check("first half of the album (~460 stickers)", cost(N, N // 2), 460, 10)
check("very last sticker alone: 670 on average", cost(1, 0), 670, 0.5)
check("last 10 slots (~1,960 stickers)", cost(10, 0), 1960, 15)
check("first 500 slots (~920 stickers)", cost(N, N - 500), 920, 10)
check("chance next sticker is new with 10 left: 1 in 67", N / 10, 67, 0.01)
order50 = cost(N, 50)
check("packs until 50 missing (~1,730 stickers)", order50, 1730, 10)
check("... plus ordering the 50 (~1,780)", order50 + 50, 1780, 10)
check("CTA: a 10-slot album takes ~29 stickers", 10 * H(10), 29, 0.5)

rng = np.random.default_rng(1)
TRIALS = 100_000
# Model: every sticker equally common, each one an independent draw (Panini says stickers are
# printed in equal numbers). Solo: time to fill = sum of geometric waits, one per empty slot.
solo = np.zeros(TRIALS)
for m in range(1, N + 1):
    solo += rng.geometric(m / N, TRIALS)
check("sim: solo stickers (100,000 trials)", solo.mean(), 4700, 60)
check("sim: unlucky 1 in 10 needs over ~5,850", np.percentile(solo, 90), 5850, 150)

def sim_group(friends, trials, order_at=0, batch=20_000):
    """friends pour every sticker into one shared pile and swap; stop when each album has at most
    `order_at` gaps. Returns stickers bought per person."""
    res = []
    for _ in range(trials // batch):
        counts = np.zeros((batch, N), dtype=np.int16)
        gaps = np.full(batch, N * friends)
        bought = np.zeros(batch)
        live = np.ones(batch, bool)
        rows = np.arange(batch)
        while live.any():
            slot = rng.integers(0, N, batch)
            c = counts[rows, slot]
            need = live & (c < friends)
            gaps -= need
            counts[rows, slot] = c + live
            bought += live
            live &= gaps > order_at * friends
        res.append(bought / friends)
    return np.concatenate(res)

five = sim_group(5, TRIALS)
check("sim: 5 friends swapping, per person (~2,000)", five.mean(), 2000, 60)
five50 = sim_group(5, TRIALS, order_at=50)
check("sim: 5 friends swapping + each orders last 50 (~930 incl. the 50, under 1,000)", five50.mean() + 50, 930, 40)
print("ALL OK" if ok else "SOMETHING FAILED")
raise SystemExit(0 if ok else 1)
