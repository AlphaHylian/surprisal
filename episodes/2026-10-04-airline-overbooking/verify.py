"""Every number in the airline overbooking how-to, computed (binomial) and simulated."""
import random
from math import comb

ok = True
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

SEATS, SHOW = 180, 0.9          # scenario: 180 seats, 1 in 10 ticket holders never turns up

def pmf(n, k, p=SHOW): return comb(n, k) * p**k * (1 - p)**(n - k)
def p_over(n, seats=SEATS, p=SHOW): return sum(pmf(n, k, p) for k in range(seats + 1, n + 1))
def empty(n): return sum(pmf(n, k) * max(0, SEATS - k) for k in range(n + 1))
def filled(n): return sum(pmf(n, k) * min(SEATS, k) for k in range(n + 1))
def bumped(n): return sum(pmf(n, k) * max(0, k - SEATS) for k in range(n + 1))

# 1. Sell exactly 180: on average 18 empty seats
check("empty seats selling 180", round(empty(180)), 18)
# 2. Sell 200 (the naive 'average' fix): almost half of flights are over full
print(f"    P(over full | sell 200) = {p_over(200):.4f}")
check("selling 200: 'almost half' (40-50%)", 0.40 < p_over(200) < 0.50, True)
check("selling 200: average show-ups", round(200 * SHOW), 180)
# 3. Sell 193: 1 flight in 22 over full; empty seats about 6
print(f"    P(over full | sell 193) = {p_over(193):.4f} -> 1 in {1 / p_over(193):.1f}")
check("selling 193: 1 flight in N", round(1 / p_over(193)), 22)
check("193 is the most you can sell with risk under 1 in 20", max(n for n in range(180, 260) if p_over(n) < 0.05), 193)
check("selling 193: empty seats", round(empty(193)), 6)
check("selling 193: extra paying passengers per flight", round(filled(193) - filled(180)), 12)
print(f"    average people bumped per flight at 193: {bumped(193):.3f}")
# 4. Example over-full day: 182 show up for 180 seats -> 2 volunteers needed
check("volunteers needed when 182 show", 182 - SEATS, 2)
# 5. When over full at 193, how many extra? P(1 or 2 | over)
p12 = (pmf(193, 181) + pmf(193, 182)) / p_over(193)
print(f"    P(only 1 or 2 too many | over full) = {p12:.3f}")
check("when over full, usually just 1 or 2 too many (>70%)", p12 > 0.7, True)
# 6. CTA answer: 100 seats, same 1 in 10 no-shows, risk under 1 in 20
ans = max(n for n in range(100, 140) if p_over(n, 100) < 0.05)
print(f"    CTA answer (100 seats): sell {ans}, risk {p_over(ans, 100):.4f}")

# 7. Simulation, 200,000 flights each
random.seed(1)
T = 200_000
for n, want in [(200, p_over(200)), (193, p_over(193))]:
    over = emp = 0
    for _ in range(T):
        k = sum(random.random() < SHOW for _ in range(n))
        over += k > SEATS
        emp += max(0, SEATS - k)
    print(f"    sim sell {n}: over-full {over / T:.4f} (exact {want:.4f}), empty {emp / T:.2f} (exact {empty(n):.2f})")
    check(f"sim agrees for {n}", abs(over / T - want) < 0.005 and abs(emp / T - empty(n)) < 0.05, True)

print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
