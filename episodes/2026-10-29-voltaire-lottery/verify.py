"""Every number in the voltaire-lottery how-to episode (the 1729 French bond lottery), computed and checked."""
import json
import random

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

PRICE_SHARE = 1000  # a ticket costs 1/1000 of its bond (Smithsonian, Damn Interesting)
JACKPOT = 500_000
big, small = 100_000, 1_000
check("ticket for a 100,000-livre bond", big // PRICE_SHARE, 100)
check("ticket for a 1,000-livre bond", small // PRICE_SHARE, 1)
budget = big // PRICE_SHARE
check("tickets 100 livres buys from 1,000-livre bonds", budget // (small // PRICE_SHARE), 100)
check("chance ratio, 100 small tickets vs 1 big", 100 / 1, 100.0)
check("jackpot / cheapest ticket", JACKPOT // 1, 500_000)
check("syndicate size: Voltaire + La Condamine + 11 others", 2 + 11, 13)
check("CTA: 5,000-livre bonds, tickets for 100 livres", 100 // (5_000 // PRICE_SHARE), 20)

# Simulate draws: 1,000 tickets in the drum, every ticket equally likely; rich player 1 ticket, you 100.
random.seed(1729)
TRIALS, N = 200_000, 1_000
rich = you = 0
for _ in range(TRIALS):
    w = random.randrange(N)
    rich += w == 0
    you += 1 <= w <= 100
print(f"sim: rich wins {rich}, you win {you}, ratio {you / max(rich, 1):.1f}")
results["sim ratio"] = f"{you / max(rich, 1):.1f}"
check("sim: you win about 100x as often (85-115)", 85 <= you / max(rich, 1) <= 115, True)
check("year", 1729, 1729)

json.dump(results, open(__file__.replace("verify.py", "results.json"), "w"), indent=1)
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
