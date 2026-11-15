"""Every number in the doomsday-long video, checked against Python's proleptic Gregorian calendar."""
import datetime as dt, json, random
from collections import Counter

D = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
wd = lambda y, m, d: D[dt.date(y, m, d).weekday()]
leap = lambda y: y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)
R = {}

def doomsday_dates(y):
    jan = 4 if leap(y) else 3
    feb = 29 if leap(y) else 28
    return [(1, jan), (2, feb), (3, 14), (4, 4), (5, 9), (6, 6), (7, 11), (8, 8), (9, 5), (10, 10), (11, 7), (12, 12)]

# 1. all doomsday dates share a weekday, every year 1583-2999
for y in range(1583, 3000):
    assert len({wd(y, m, d) for m, d in doomsday_dates(y)}) == 1, y
R["doomsday_2026"] = wd(2026, 4, 4)
assert R["doomsday_2026"] == "Saturday"
# 9 weeks apart
gaps = [(dt.date(2026, m + 2, m + 2) - dt.date(2026, m, m)).days for m in (4, 6, 8, 10)]
R["even_gaps_days"] = gaps; assert gaps == [63] * 4
R["may9_to_sep5"] = (dt.date(2026, 9, 5) - dt.date(2026, 5, 9)).days      # 119 = 17 weeks
R["jul11_to_nov7"] = (dt.date(2026, 11, 7) - dt.date(2026, 7, 11)).days   # 119
R["pi_to_apr4"] = (dt.date(2026, 4, 4) - dt.date(2026, 3, 14)).days       # 21
R["mar0_to_mar14"] = 14
R["xmas_2026"] = wd(2026, 12, 25); assert R["xmas_2026"] == "Friday"

# 2. year step: doomsday moves +1 a year, +2 into a leap year
def dd(y): return dt.date(y, 4, 4).weekday()
for y in range(1583, 2999):
    assert (dd(y + 1) - dd(y)) % 7 == (2 if leap(y + 1) else 1)
R["2027"] = D[dd(2027)]; R["2028"] = D[dd(2028)]   # Sunday, Tuesday
assert R["2027"] == "Sunday" and R["2028"] == "Tuesday"

# 3. methods for the last two digits
def m_quarter(yy): return (yy + yy // 4) % 7
def m_dozen(yy): a, b = divmod(yy, 12); return (a + b + b // 4) % 7
def m_odd11(yy):
    t = yy + 11 if yy % 2 else yy
    t //= 2
    if t % 2: t += 11
    return (7 - t % 7) % 7
for yy in range(100):
    assert m_quarter(yy) == m_dozen(yy) == m_odd11(yy), yy
anchor = {1800: 4, 1900: 2, 2000: 1, 2100: 6, 2200: 4, 2300: 2}   # Mon=0: Fri, Wed, Tue, Sun, Fri, Wed
for c, a in anchor.items():
    assert dd(c) == a, c
    for yy in range(100):
        assert (a + m_quarter(yy)) % 7 == dd(c + yy)
R["anchors"] = {c: D[a] for c, a in anchor.items()}
R["1969_quarter"] = (69, 69 // 4, 69 + 69 // 4, (69 + 69 // 4) % 7)  # 69, 17, 86, 2
R["1969_dozen"] = (69 // 12, 69 % 12, (69 % 12) // 4, 69 // 12 + 69 % 12 + (69 % 12) // 4)  # 5, 9, 2, 16 -> 2
R["1969_odd11"] = (69 + 11, 80 // 2, 40 % 7, 7 - 40 % 7)  # 80, 40, 5, 2
R["dozen_days"] = (dt.date(2038, 4, 4) - dt.date(2026, 4, 4)).days  # 4383 = 626*7 + 1
assert R["dozen_days"] % 7 == 1
R["moon_landing"] = wd(1969, 7, 20); assert R["moon_landing"] == "Sunday"
R["y2k"] = wd(2000, 1, 1); assert R["y2k"] == "Saturday"
R["wall"] = (D[dd(1989)], (89 + 22) % 7, wd(1989, 11, 9)); assert R["wall"][2] == "Thursday" and D[dd(1989)] == "Tuesday"
R["2001_doomsday"] = D[dd(2001)]
R["jan1_2100"] = wd(2100, 1, 1); assert R["jan1_2100"] == "Friday" and not leap(2100)

# 4. centuries: 100 years = 36,524 or 36,525 days
R["days_1900_2000"] = (dt.date(2000, 1, 1) - dt.date(1900, 1, 1)).days  # 36524 (1900 not leap)
R["shift_1900_2000"] = (100 + sum(leap(y) for y in range(1901, 2001))) % 7   # 6 = back 1
R["shift_2000_2100"] = (100 + sum(leap(y) for y in range(2001, 2101))) % 7   # 5 = back 2
R["days_400"] = (dt.date(2400, 1, 1) - dt.date(2000, 1, 1)).days
assert R["days_400"] == 146097 and R["days_400"] % 7 == 0
R["weeks_400"] = R["days_400"] // 7  # 20,871
R["leaps_400"] = sum(leap(y) for y in range(2000, 2400))  # 97

# 5. Friday the 13th over one 400-year cycle
c = Counter(wd(y, m, 13) for y in range(2000, 2400) for m in range(1, 13))
R["thirteenths"] = dict(c); R["total_13ths"] = sum(c.values())
assert c.most_common(1)[0] == ("Friday", 688) and R["total_13ths"] == 4800
R["13th_min"] = min(c.values())  # 684
R["fri13_2026"] = [m for m in range(1, 13) if wd(2026, m, 13) == "Friday"]  # Feb, Mar, Nov
R["fri13_every_year"] = all(any(wd(y, m, 13) == "Friday" for m in range(1, 13)) for y in range(1583, 3000))
R["fri13_max_per_year"] = max(sum(wd(y, m, 13) == "Friday" for m in range(1, 13)) for y in range(1583, 3000))

# 6. 1752: Julian Wednesday 2 September -> Gregorian Thursday 14 September
R["sep14_1752"] = wd(1752, 9, 14); assert R["sep14_1752"] == "Thursday"
# Julian 2 Sep 1752 = Gregorian 13 Sep 1752
R["sep2_1752_julian_as_greg13"] = wd(1752, 9, 13); assert R["sep2_1752_julian_as_greg13"] == "Wednesday"

# 7. random-date test of the full mental method, 100,000 dates 1800-2199
random.seed(7)
ok = 0
start, end = dt.date(1800, 1, 1).toordinal(), dt.date(2199, 12, 31).toordinal()
for _ in range(100_000):
    d = dt.date.fromordinal(random.randint(start, end))
    a = anchor[d.year // 100 * 100]
    doom = (a + m_quarter(d.year % 100)) % 7
    m, ddm = doomsday_dates(d.year)[d.month - 1]
    ok += (doom + d.day - ddm) % 7 == d.weekday()
R["mental_method_correct"] = ok; assert ok == 100_000

# 8. birthdays example in CTA: none. Practice date: your own.
print(json.dumps(R, indent=1, default=str))
json.dump(R, open("verify_results.json", "w"), indent=1, default=str)
print("OK")
