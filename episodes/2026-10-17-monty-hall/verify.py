"""Every number in the Monty Hall how-to episode, computed or simulated."""
import random
from fractions import Fraction

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

def exact(doors):
    # you pick one door; the host, who knows where the car is, opens every other door but one,
    # never the car. Stick wins iff your first pick was the car.
    stick = Fraction(1, doors)
    return stick, 1 - stick

s3, w3 = exact(3)
check("3 doors, stick", s3, Fraction(1, 3))
check("3 doors, switch", w3, Fraction(2, 3))
check("switch wins twice as often", w3 / s3, 2)
s100, w100 = exact(100)
check("100 doors, stick", s100, Fraction(1, 100))
check("100 doors, switch", w100, Fraction(99, 100))
check("host opens on 100 doors", 100 - 2, 98)

def play(doors, switch, rng):
    car = rng.randrange(doors)
    pick = rng.randrange(doors)
    # host leaves one other door shut: the car if you missed it, else a random goat door
    if pick != car:
        left = car
    else:
        left = rng.choice([d for d in range(doors) if d != pick])
    final = left if switch else pick
    return final == car

rng = random.Random(2026)
N = 100_000
stick = sum(play(3, False, rng) for _ in range(N)) / N
swit = sum(play(3, True, rng) for _ in range(N)) / N
print(f"sim 3 doors, {N:,} games: stick {stick:.3%}, switch {swit:.3%}")
check("sim stick rounds to 33%", round(stick * 100), 33)
check("sim switch rounds to 67%", round(swit * 100), 67)
s = sum(play(100, True, rng) for _ in range(N)) / N
print(f"sim 100 doors, switch {s:.3%}")
ok &= abs(s - 0.99) < 0.003

# The host's door is never the car (he always can open a goat): with 3 doors and your pick fixed,
# at least one of the other two is a goat.
check("other two doors always hold at least 1 goat", min(2 - (c != 0) for c in range(3)), 1)

# Sourced: Parade, 1990, Marilyn vos Savant; ~10,000 readers wrote in, nearly 1,000 with PhDs,
# most saying she was wrong (https://en.wikipedia.org/wiki/Monty_Hall_problem)
print("ALL OK" if ok else "SOMETHING FAILED")
raise SystemExit(0 if ok else 1)
