"""Checks every number in 'doomsday-rule' (Conway's Doomsday rule).
Source: https://en.wikipedia.org/wiki/Doomsday_rule"""
import datetime as dt, json
D = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
def wd(y, m, d): return D[dt.date(y, m, d).weekday()]
def leap(y): return y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)
ANCHOR = {1800: "Friday", 1900: "Wednesday", 2000: "Tuesday", 2100: "Sunday"}
def doomsday(y):
    yy = y % 100; a = D.index(ANCHOR[y - yy])
    return D[(a + yy + yy // 4) % 7]
def doomsday_conway(y):
    yy = y % 100; q, r = divmod(yy, 12)
    return D[(D.index(ANCHOR[y - yy]) + q + r + r // 4) % 7]
def anchors(y):
    return [(1, 4 if leap(y) else 3), (2, 29 if leap(y) else 28), (3, 14), (4, 4), (5, 9), (6, 6), (7, 11),
            (8, 8), (9, 5), (10, 10), (11, 7), (12, 12)]
# every year 1800-2199: all anchor dates share one weekday, and the formula gives it
bad = 0
for y in range(1800, 2200):
    days = {wd(y, m, d) for m, d in anchors(y)}
    assert len(days) == 1, (y, days)
    assert doomsday(y) == days.pop() == doomsday_conway(y), y
print("anchor dates share a weekday and the y + y//4 formula matches, every year 1800-2199")
# every date in those years, by the full mental method
n = 0
for y in range(1800, 2200):
    for m in range(1, 13):
        am = dict(anchors(y))[m]
        for d in range(1, 32):
            try: true = wd(y, m, d)
            except ValueError: continue
            got = D[(D.index(doomsday(y)) + d - am) % 7]
            assert got == true; n += 1
print(f"method correct on all {n:,} dates 1800-2199")
r = {}
r["doomsday_2026"] = doomsday(2026)
r["christmas_2026"] = wd(2026, 12, 25); r["dec12_2026"] = wd(2026, 12, 12); r["dec26_2026"] = wd(2026, 12, 26)
r["today"] = wd(2026, 11, 10); r["nov7_2026"] = wd(2026, 11, 7)
r["1969"] = {"yy": 69, "yy//4": 69 // 4, "sum": 69 + 69 // 4, "mod7": (69 + 69 // 4) % 7, "doomsday": doomsday(1969),
             "jul11": wd(1969, 7, 11), "jul18": wd(1969, 7, 18), "jul20": wd(1969, 7, 20)}
r["jan1_2000"] = wd(2000, 1, 1); r["jan4_2000"] = wd(2000, 1, 4); r["doomsday_2000"] = doomsday(2000)
r["dates_checked"] = n
print(json.dumps(r, indent=1))
assert r["christmas_2026"] == "Friday" and r["1969"]["jul20"] == "Sunday" and r["jan1_2000"] == "Saturday"
json.dump(r, open("verify_results.json", "w"), indent=1)
# each even-month anchor is exactly 9 weeks after the previous one (any year)
gaps = [(dt.date(2026, m + 2, m + 2) - dt.date(2026, m, m)).days for m in (4, 6, 8, 10)]
print("gaps 4/4->6/6->8/8->10/10->12/12:", gaps); assert gaps == [63] * 4
