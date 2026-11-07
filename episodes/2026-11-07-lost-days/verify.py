"""Every number in the lost-days episode (Julian vs Gregorian calendar, 1582).
Source: https://en.wikipedia.org/wiki/Gregorian_calendar (mean tropical year 365.24219 days; Julian 365.25;
Gregorian 365 + 97/400; 4 Oct 1582 followed by 15 Oct; Inter gravissimas; Britain 1752, 11 days)."""
import json, random
from datetime import date
from fractions import Fraction
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

TROP = 365.24219
check("365 days: short by about 6 hours a year", round((TROP - 365) * 24, 1), 5.8)
check("365 days: a full day off every 4 years", round(1 / (TROP - 365), 1), 4.1)
jul_err_min = (365.25 - TROP) * 24 * 60
check("Julian 365.25: about 11 minutes too long", round(jul_err_min), 11)
check("Julian: one day every 128 years", round(1 / (365.25 - TROP)), 128)
drift = (1582 - 325) * (365.25 - TROP)
check("325 to 1582: about 10 days", round(drift), 10)
check("21 March - 10 days = 11 March", 21 - 10, 11)
gap = (date(1582, 10, 15) - date(1582, 10, 4)).days - 1
check("Thursday 4 Oct -> Friday 15 Oct skips 10 dates", gap, 10)
def is_leap(y): return y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)
leaps = sum(is_leap(y) for y in range(2000, 2400))
check("97 leap years in every 400", leaps, 97)
check("skipped: 1700, 1800, 1900; kept 2000", [is_leap(y) for y in (1700, 1800, 1900, 2000)], [False, False, False, True])
greg = 365 + Fraction(97, 400)
check("Gregorian average year 365.2425", float(greg), 365.2425)
err_s = (float(greg) - TROP) * 86400
check("Gregorian: about 27 seconds a year too long", round(err_s), 27)
check("Gregorian: a day every ~3,200 years", round(1 / (float(greg) - TROP), -2), 3200)
check("Britain 1752: 11 days (1700 Julian leap day added one more)", 10 + 1, 11)
check("CTA: 2100 is not a leap year", is_leap(2100), False)

# simulate: count Julian leap days vs Gregorian over random 400-year windows and the drift of 21 March
rng = random.Random(3)
T = 100_000
diffs = set()
for _ in range(T):
    y0 = rng.randint(1600, 9999)
    j = sum(1 for y in range(y0, y0 + 400) if y % 4 == 0)
    g = sum(1 for y in range(y0, y0 + 400) if is_leap(y))
    diffs.add(j - g)
check("simulated 100,000 400-year windows: Gregorian always drops exactly 3 leap days", diffs, {3})

print("ALL OK" if ok else "SOME CHECKS FAILED")
Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
raise SystemExit(0 if ok else 1)
