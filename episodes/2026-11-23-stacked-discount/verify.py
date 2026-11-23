"""Every number in the stacked-discount Short, computed and simulated."""
import random, datetime, calendar
ok = True
def check(name, good, detail=""):
    global ok
    ok &= bool(good)
    print(f"{'OK ' if good else 'BAD'} {name} {detail}")

p = 200
a = p * 0.5; b = a * 0.8
check("half off $200 = $100", a == 100)
check("20% of 100 = 20, pay $80", a * 0.2 == 20 and b == 80)
check("70% off $200 = $60, $20 less", p * 0.3 == 60 and b - 60 == 20)
check("swap: 200 -20% = 160, half = 80", p * 0.8 == 160 and p * 0.8 * 0.5 == 80)
check("0.5 x 0.8 = 0.4 -> 60% off", abs(0.5 * 0.8 - 0.4) < 1e-12 and round((1 - 0.4) * 100) == 60)
# simulate: random discount pairs, stacked is always below the sum (for both > 0), order irrelevant
random.seed(7)
below = same = 0; N = 100_000
for _ in range(N):
    x, y = random.uniform(0.01, 0.99), random.uniform(0.01, 0.99)
    s1 = 1 - (1 - x) * (1 - y); s2 = 1 - (1 - y) * (1 - x)
    below += s1 < x + y; same += abs(s1 - s2) < 1e-12
check("100,000 random pairs: stacked < sum every time", below == N)
check("100,000 random pairs: order never matters", same == N)
# shortfall is exactly x*y
check("shortfall = 50% x 20% = 10 points", round(0.5 * 0.2 * 100) == 10)
cta = 1 - 0.7 * 0.7
check("CTA: 30% then 30% = 51% off", round(cta * 100) == 51, f"{cta:.2f}")
# Black Friday 2026: day after the fourth Thursday of November
thursdays = [d for d in range(1, 31) if datetime.date(2026, 11, d).weekday() == 3]
bf = datetime.date(2026, 11, thursdays[3] + 1)
check("Black Friday 2026 is 27 Nov", bf == datetime.date(2026, 11, 27), str(bf))
print("ALL OK" if ok else "SOME CHECKS FAILED")
