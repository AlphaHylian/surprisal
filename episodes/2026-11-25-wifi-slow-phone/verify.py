"""Every number in the wifi-slow-phone Short (one slow device drags every device on the network down).
Model and constants: Heusse, Rousseau, Berger-Sabbatel, Duda, "Performance anomaly of 802.11b", INFOCOM 2003,
Eqs. 1-9 (https://www.csd.uoc.gr/~hy439/reading/list_2011/10.1.1.12.3822.pdf)."""
import random

ok = True
def check(name, got, want, tol=0.0):
    global ok
    good = abs(got - want) <= tol
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got:.4g} (script: {want})")

# 802.11b constants from the paper (seconds)
SLOT, SIFS, DIFS = 20e-6, 10e-6, 50e-6
CWMIN = 31
DATA_BITS = 1500 * 8          # useful payload
MPDU_BITS = 1534 * 8          # frame on the air
def t_ov(rate):               # DIFS + preamble/header + SIFS + preamble/header + MAC ACK
    tpr = 192e-6 if rate == 1e6 else 96e-6
    tack = 112 / rate
    return DIFS + tpr + SIFS + tpr + tack
def Pc(N): return 1 - (1 - 1 / CWMIN) ** (N - 1)
def tcont(N): return SLOT * (1 + Pc(N)) / (2 * N) * CWMIN / 2
def T(rate, N): return t_ov(rate) + MPDU_BITS / rate + tcont(N)

R, r = 11e6, 1e6
# airtime of one packet (no contention): "about a millisecond" at 11, "12" at 1 (frame time alone)
check("frame time at 11 Mb/s (ms)", MPDU_BITS / R * 1e3, 1.1, 0.06)
check("frame time at 1 Mb/s (ms)", MPDU_BITS / r * 1e3, 12, 0.3)
check("whole packet slot at 11 Mb/s incl. overhead (ms)", T(R, 4) * 1e3, 1.5, 0.1)
check("whole packet slot at 1 Mb/s incl. overhead (ms)", T(r, 4) * 1e3, 12.8, 0.2)
check("slow device holds the air ~ 11x longer per frame", MPDU_BITS / r / (MPDU_BITS / R), 11)

def X_mixed(N):               # Eq. 7: every host's throughput with N-1 fast + 1 slow
    Tf, Ts = T(R, N), T(r, N)
    tjam = 2 / N * Ts + (1 - 2 / N) * Tf
    return DATA_BITS / ((N - 1) * Tf + Ts + Pc(N) * tjam * N)
def X_fast(N):                # all N fast: same formula with Ts = Tf
    Tf = T(R, N)
    return DATA_BITS / (N * Tf + Pc(N) * Tf * N)

N = 4
xm, xf = X_mixed(N), X_fast(N)
print(f"4 devices all fast: {xf/1e6:.2f} Mb/s each; 3 fast + 1 slow: {xm/1e6:.3f} Mb/s each")
check("4 fast devices alone: each ~1.9 Mb/s", xf / 1e6, 1.9, 0.05)
check("with the slow phone: each ~0.6 Mb/s", xm / 1e6, 0.6, 0.02)
check("that is below the slow phone's own 1 Mb/s", xm < 1e6, True)
check("your laptop loses ~70% (more than two thirds)", 1 - xm / xf, 0.69, 0.02)
check("one round (3 fast + 1 slow), ms ~16", (3 * T(R, N) + T(r, N)) * 1e3, 17, 0.5)
check("slow phone's share of the air ~3/4", T(r, N) / (3 * T(R, N) + T(r, N)), 0.75, 0.03)
# airtime fairness (equal time): each device gets 1/4 of the air
eq_time_fast = 0.25 / T(R, N) * DATA_BITS
check("equal-time fix: laptop gets more than 3x the 0.6 (no collisions counted)", eq_time_fast / xm, 3.5, 0.5)

# Simulation of CSMA/CA-style access: each round every saturated station draws a backoff uniformly in
# [0, CW]; the smallest wins the channel (ties = collision, both double CW). 200,000 transmissions.
random.seed(1)
rates = [R, R, R, r]
cw = [CWMIN] * 4
backoff = [random.randint(0, CWMIN) for _ in range(4)]
sent = [0] * 4
clock = 0.0
events = 0
while events < 200_000:
    m = min(backoff)
    clock += m * SLOT
    winners = [i for i in range(4) if backoff[i] == m]
    for i in range(4):
        if i not in winners: backoff[i] -= m
    if len(winners) == 1:
        i = winners[0]
        clock += t_ov(rates[i]) + MPDU_BITS / rates[i]
        sent[i] += 1
        cw[i] = CWMIN
        backoff[i] = random.randint(0, cw[i])
    else:
        clock += max(t_ov(rates[i]) + MPDU_BITS / rates[i] for i in winners)
        for i in winners:
            cw[i] = min(2 * cw[i] + 1, 1023)
            backoff[i] = random.randint(0, cw[i])
    events += 1
thr = [s * DATA_BITS / clock / 1e6 for s in sent]
print("simulated throughput per device (Mb/s):", [round(x, 3) for x in thr])
check("simulation: fast laptop ~ same as slow phone (ratio)", thr[0] / thr[3], 1.0, 0.05)
check("simulation: each ~0.6 Mb/s", max(thr), 0.6, 0.03)

print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
