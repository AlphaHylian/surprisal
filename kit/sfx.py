"""Generate the channel's sound effects procedurally (no licences involved).

    ~/.surprisal_venv/bin/python -m kit.sfx        # writes studio/public/sfx/*.wav

Names (use with <Sfx name="..." /> in scenes):
    whoosh  fast air past the camera (scene changes, things flying in)
    swoosh  shorter, higher whoosh (small elements sliding)
    riser   1.6 s build-up into a reveal (start it 1.6 s before the reveal)
    click   UI click (chips, toggles, cursor)
    pop     bubbly pop (icons/emoji appearing)
    thud    low hit (something heavy landing)
    stamp   thud + paper slap (rubber stamps)
    ding    bright bell (correct answer, a number landing)
    tick    clock tick (one)
    type    ~1 s of keyboard typing
    error   low double buzz (wrong, denied)
    coin    two-note coin (money)
    reveal  shimmer sweep (the big answer)
    boom    deep sub hit (the biggest moment, use once)
"""
import os

import numpy as np
import soundfile as sf

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "studio", "public", "sfx")
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(d * SR)) / SR


def env(x, a=0.005, r=0.2):
    n = len(x)
    e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.linspace(1, 0, nr) ** 2
    return x * e


def lowpass(x, cutoff):
    """One-pole low-pass; cutoff may be an array (sweeps)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, float), x.shape)
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def norm(x, peak=0.7):
    return x / (np.abs(x).max() + 1e-9) * peak


def whoosh(d=0.55, lo=300, hi=3500):
    tt = t(d)
    n = rng.standard_normal(len(tt))
    sweep = lo + (hi - lo) * np.sin(np.pi * tt / d) ** 2
    y = highpass(lowpass(n, sweep), 120)
    shape = np.sin(np.pi * tt / d) ** 1.5
    return norm(y * shape, 0.6)


def riser(d=1.6):
    tt = t(d)
    n = lowpass(rng.standard_normal(len(tt)), 400 + 6000 * (tt / d) ** 2)
    f = 180 * 2 ** (3 * tt / d)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.35
    y = (n * 0.6 + tone) * (tt / d) ** 2.2
    return norm(env(y, 0.01, 0.02), 0.6)


def click():
    tt = t(0.05)
    y = rng.standard_normal(len(tt)) * np.exp(-tt * 300) + np.sin(2 * np.pi * 2400 * tt) * np.exp(-tt * 200)
    return norm(highpass(y, 800), 0.5)


def pop():
    tt = t(0.16)
    f = 900 * np.exp(-tt * 18) + 250
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 30)
    return norm(env(y, 0.002, 0.04), 0.55)


def thud():
    tt = t(0.45)
    f = 120 * np.exp(-tt * 6) + 45
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
    y += lowpass(rng.standard_normal(len(tt)), 600) * np.exp(-tt * 40) * 0.6
    return norm(env(y, 0.002, 0.1), 0.8)


def stamp():
    a = thud()
    tt = t(0.12)
    slap = highpass(rng.standard_normal(len(tt)), 1500) * np.exp(-tt * 60)
    y = a.copy()
    y[: len(slap)] += norm(slap, 0.5)
    return norm(y, 0.8)


def ding(f0=1320):
    tt = t(1.2)
    y = sum(np.sin(2 * np.pi * f0 * k * tt) * np.exp(-tt * (3 + 2 * k)) / k for k in (1, 2.76, 5.4))
    return norm(env(y, 0.002, 0.3), 0.45)


def tick():
    tt = t(0.04)
    y = highpass(rng.standard_normal(len(tt)), 2500) * np.exp(-tt * 250)
    return norm(y, 0.5)


def typing(d=1.0):
    y = np.zeros(int(d * SR))
    pos = 0.0
    while pos < d - 0.06:
        c = click() * rng.uniform(0.3, 0.8)
        i = int(pos * SR)
        y[i:i + len(c)] += c[: len(y) - i]
        pos += rng.uniform(0.06, 0.14)
    return norm(y, 0.45)


def error():
    tt = t(0.42)
    sq = np.sign(np.sin(2 * np.pi * 140 * tt)) * 0.5
    gate = ((tt % 0.21) < 0.16).astype(float)
    return norm(env(lowpass(sq * gate, 1800), 0.005, 0.05), 0.45)


def coin():
    a = ding(1568)[: int(0.09 * SR)]
    b = ding(2093)
    y = np.zeros(int(0.09 * SR) + len(b))
    y[: len(a)] += a
    y[int(0.09 * SR):] += b
    return norm(y, 0.45)


def reveal(d=1.1):
    tt = t(d)
    y = np.zeros_like(tt)
    for k, f in enumerate((1047, 1319, 1568, 2093, 2637)):
        st = k * 0.07
        m = tt >= st
        y[m] += np.sin(2 * np.pi * f * (tt[m] - st)) * np.exp(-(tt[m] - st) * 4)
    y += highpass(rng.standard_normal(len(tt)), 5000) * np.exp(-tt * 5) * 0.2
    return norm(env(y, 0.003, 0.3), 0.45)


def boom():
    tt = t(1.4)
    f = 70 * np.exp(-tt * 2.5) + 32
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 3)
    y += lowpass(rng.standard_normal(len(tt)), 300) * np.exp(-tt * 6) * 0.7
    return norm(env(y, 0.003, 0.4), 0.85)


SOUNDS = {"whoosh": whoosh, "swoosh": lambda: whoosh(0.3, 800, 6000), "riser": riser, "click": click, "pop": pop,
          "thud": thud, "stamp": stamp, "ding": ding, "tick": tick, "type": typing, "error": error, "coin": coin,
          "reveal": reveal, "boom": boom}


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, fn in SOUNDS.items():
        y = fn().astype(np.float32)
        sf.write(os.path.join(OUT, f"{name}.wav"), np.stack([y, y], axis=1), SR, subtype="PCM_16")
        print(f"{name}: {len(y) / SR:.2f}s")


if __name__ == "__main__":
    main()
