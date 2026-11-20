"""Every number in the fingerprint-odds Short, computed and simulated."""
import random

ok = True
def check(name, good, detail=""):
    global ok
    ok &= bool(good)
    print(f"{'OK ' if good else 'BAD'} {name} {detail}")

WORLD = 8.3e9           # UN WPP 2024, mid-2026 estimate (~8.30 billion)
TOUCH = 1 / 50_000      # Apple: random person unlocks Touch ID, one enrolled finger
FACE = 1 / 1_000_000    # Apple: Face ID, less than 1 in 1,000,000
TRIES = 5               # both lock to the passcode after 5 failed attempts

fingers = WORLD * TOUCH
check("8.3 billion / 50,000 ~ 166,000 people", round(fingers, -3) == 166_000, f"{fingers:,.0f}")
faces = WORLD * FACE
check("8.3 billion / 1,000,000 ~ 8,300 people", round(faces, -2) == 8_300, f"{faces:,.0f}")
p5 = 1 - (1 - TOUCH) ** TRIES
check("thief, 5 random fingers: about 1 in 10,000", round(1 / p5, -2) == 10_000, f"1 in {1/p5:,.0f}")
check("same as guessing a 4-digit PIN in one try (1 in 10,000)", abs(p5 - 1e-4) / 1e-4 < 0.001)
f5 = 1 - (1 - FACE) ** TRIES
check("face, 5 tries: about 1 in 200,000", round(1 / f5, -3) == 200_000, f"1 in {1/f5:,.0f}")
check("face bar is 20x higher than finger", round(TOUCH / FACE) == 20)

# simulation: 2,000,000 thieves, each with 5 random strangers' fingers
random.seed(11); N = 2_000_000
hits = sum(any(random.random() < TOUCH for _ in range(TRIES)) for _ in range(N))
check("sim: 5 tries opens it ~1 in 10,000", 0.8e-4 < hits / N < 1.2e-4, f"{hits} of {N:,} = 1 in {N/max(hits,1):,.0f}")
# simulation: a city of 1,000,000 strangers try your phone -> ~20 get in
random.seed(5); city = sum(random.random() < TOUCH for _ in range(1_000_000))
print(f"   sim: of 1,000,000 strangers, {city} would pass (expected 20)")
print("ALL OK" if ok else "FAILED")
raise SystemExit(0 if ok else 1)
