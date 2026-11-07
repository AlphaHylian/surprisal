"""Every number in the batting-average episode (Simpson's paradox, Jeter vs Justice 1995-96).
Source: https://en.wikipedia.org/wiki/Simpson%27s_paradox (Ken Ross, A Mathematician at the Ballpark, 2004;
stats from Baseball-Reference.com)."""
import json
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

avg = lambda h, ab: f"{h / ab:.3f}".lstrip("0")
J = {"1995": (12, 48), "1996": (183, 582)}
D = {"1995": (104, 411), "1996": (45, 140)}
check("Jeter 1995 .250", avg(*J["1995"]), ".250")
check("Justice 1995 .253", avg(*D["1995"]), ".253")
check("Jeter 1996 .314", avg(*J["1996"]), ".314")
check("Justice 1996 .321", avg(*D["1996"]), ".321")
jh, jab = sum(h for h, _ in J.values()), sum(a for _, a in J.values())
dh, dab = sum(h for h, _ in D.values()), sum(a for _, a in D.values())
check("Jeter combined 195/630 = .310", (jh, jab, avg(jh, jab)), (195, 630, ".310"))
check("Justice combined 149/551 = .270", (dh, dab, avg(dh, dab)), (149, 551, ".270"))
check("Justice wins both years", all(D[y][0] / D[y][1] > J[y][0] / J[y][1] for y in J), True)
check("Jeter wins combined", jh / jab > dh / dab, True)
# where their at-bats fell
check("Jeter: 582 of 630 at-bats in 1996 (92%)", f"{J['1996'][1] / jab:.0%}", "92%")
check("Justice: 411 of 551 at-bats in 1995 (75%)", f"{D['1995'][1] / dab:.0%}", "75%")
# same mix: equal weight to each season
jm = (J["1995"][0] / J["1995"][1] + J["1996"][0] / J["1996"][1]) / 2
dm = (D["1995"][0] / D["1995"][1] + D["1996"][0] / D["1996"][1]) / 2
check("same at-bats each year: Jeter .282", f"{jm:.3f}".lstrip("0"), ".282")
check("same at-bats each year: Justice .287", f"{dm:.3f}".lstrip("0"), ".287")
# Justice's mix with Jeter's rates, and vice versa
check("Justice given Jeter's 1996-heavy at-bats: .316", avg(round(48 * D["1995"][0] / D["1995"][1] + 582 * D["1996"][0] / D["1996"][1]), 630), ".316")

# simulation: replay both seasons 100,000 times, every at-bat a hit with that season's rate
T = 100_000
import numpy as np
g = np.random.default_rng(7)
jh95 = g.binomial(48, 12 / 48, T); jh96 = g.binomial(582, 183 / 582, T)
dh95 = g.binomial(411, 104 / 411, T); dh96 = g.binomial(140, 45 / 140, T)
justice_both = (dh95 / 411 > jh95 / 48) & (dh96 / 140 > jh96 / 582)
jeter_total = (jh95 + jh96) / 630 > (dh95 + dh96) / 551
print(f"simulated {T:,} replays of both seasons: Justice wins both years {justice_both.mean():.1%}, Jeter wins the total {jeter_total.mean():.1%}, both at once {(justice_both & jeter_total).mean():.1%}")
results["sim_jeter_total"] = f"{jeter_total.mean():.3f}"
check("simulation: same at-bat mix gives Jeter the total almost always", jeter_total.mean() > 0.9, True)

# CTA: a team can win more home AND away games and still have the worse record (example)
A = {"home": (9, 10), "away": (30, 90)}   # 90%, 33%
B = {"home": (80, 90), "away": (3, 10)}   # 89%, 30%
check("CTA example: A better home and away", all(A[k][0] / A[k][1] > B[k][0] / B[k][1] for k in A), True)
check("CTA example: B better overall (83% vs 39%)", (f"{sum(v[0] for v in B.values()) / 100:.0%}", f"{sum(v[0] for v in A.values()) / 100:.0%}"), ("83%", "39%"))

print("ALL OK" if ok else "SOME CHECKS FAILED")
Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
raise SystemExit(0 if ok else 1)
