"""Every number in the shortcut-traffic episode (Braess's paradox, Wikipedia's 4,000-driver network), computed and checked.
Network: Start->A town road T/100 min, A->End bridge 45 min, Start->B bridge 45 min, B->End town road T/100 min,
optional shortcut A->B taking 0 min."""
import json
import random
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

N = 4000
def times(n_top, n_bot, n_short):
    """minutes on each route given drivers on top (S-A-E), bottom (S-B-E), shortcut (S-A-B-E)."""
    sa = (n_top + n_short) / 100
    be = (n_bot + n_short) / 100
    return {"top": sa + 45, "bot": 45 + be, "short": sa + be}

# before the shortcut: equilibrium is the 2,000 / 2,000 split
t = times(2000, 2000, 0)
check("2,000 cars on a town road", 2000 / 100, 20)
check("route time before (20 + 45)", t["top"], 65)
check("both routes equal at the split", t["top"] == t["bot"], True)
# first shortcut driver: 2,001 on Start-A and on B-End
t1 = times(2000, 1999, 1)
check("first shortcut driver (about 40)", round(t1["short"]), 40)
# everyone on the shortcut
t = times(0, 0, N)
check("4,000 cars on a town road", N / 100, 40)
check("route time after (40 + 40)", t["short"], 80)
# one driver tries to switch back to a bridge route: 4,000 on Start-A (inc. themself) + 45
t_dev = times(1, 0, N - 1)
check("switching back alone (40 + 45)", round(t_dev["top"]), 85)
check("everyone loses (80 - 65)", 80 - 65, 15)

# check it's the unique equilibrium: best-response dynamics from random starts, 100,000 one-driver moves each
rng = random.Random(1)
def settle(with_short, moves=100_000):
    routes = ["top", "bot"] + (["short"] if with_short else [])
    choice = [rng.choice(routes) for _ in range(N)]
    cnt = {r: choice.count(r) for r in ("top", "bot", "short")}
    for _ in range(moves):
        i = rng.randrange(N)
        r0 = choice[i]
        cnt[r0] -= 1
        best = min(routes, key=lambda r: times(cnt["top"] + (r == "top"), cnt["bot"] + (r == "bot"), cnt["short"] + (r == "short"))[r])
        cnt[best] += 1
        choice[i] = best
    tt = times(cnt["top"], cnt["bot"], cnt["short"])
    avg = sum(tt[r] * cnt[r] for r in routes) / N
    return cnt, avg
cnt, avg = settle(False)
print("no shortcut settles at", cnt, round(avg, 2))
check("sim without shortcut: average ~65", round(avg), 65)
cnt, avg = settle(True)
print("with shortcut settles at", cnt, round(avg, 2))
check("sim with shortcut: average ~80", round(avg), 80)
check("sim with shortcut: (almost) everyone takes it", cnt["short"] >= 3990, True)

Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
