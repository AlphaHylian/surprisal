"""Every number in the franklin-will episode (1,000 pounds at 5% for 200 years), computed.
Sources: Franklin's codicil (1789), https://cs.appstate.edu/sjg/class/1010/wc/finance/benfcodicil.html and
https://cs.appstate.edu/sjg/class/1010/wc/finance/benflab.html; outcome: https://en.wikipedia.org/wiki/Benjamin_Franklin#Bequest"""
import json
import random
from math import log
from pathlib import Path

ok = True
results = {}
def check(name, got, want):
    global ok
    good = got == want
    ok &= good
    results[name] = str(got)
    print(f"{'OK ' if good else 'BAD'} {name}: {got} (script: {want})")

r = 0.05
check("1,000 after 1 year = 1,050", round(1000*(1+r)), 1050)
check("year 2 earns 52.50 (interest on interest)", round(1050*r, 2), 52.5)
check("1,000 after 10 years = 1,629", round(1000*(1+r)**10), 1629)
check("doubles about every 14 years", round(log(2)/log(1+r)), 14)
check("100 years = about 7 doublings", round(100/(log(2)/log(1+r))), 7)
check("7 doublings = 128 times", 2**7, 128)
f100 = (1+r)**100
check("100 years multiplies by 131 and a half", round(f100, 1), 131.5)
check("exact: 131,501", round(1000*f100), 131501)
check("1,000 after 100 years = 131,000 (Franklin's figure, to the thousand)", int(1000*f100 // 1000 * 1000), 131000)
check("spend 100,000, keep 31,000", 131000 - 100000, 31000)
check("31,000 x 131 = 4,061,000 (Franklin's exact number)", 31000*131, 4061000)
check("31,000 x exact factor rounds to 4.1 million", round(31000*f100/1e6, 1), 4.1)
check("CTA: 1,000 for 300 years = about 2.3 billion", round(1000*(1+r)**300/1e9, 1), 2.3)
check("simple interest for comparison: 100 years = 6,000", 1000 + 1000*r*100, 6000.0)

# Simulate the lending scheme yearly: loans repaid a tenth a year with interest, every repayment lent again.
# With everything relent at once the fund grows exactly 5% a year; check the yearly bookkeeping matches.
fund = 1000.0
for year in range(100):
    fund += fund * r
check("year-by-year bookkeeping matches 131,501", round(fund), 131501)
# 100,000 random-order bookkeeping runs are not needed (no chance in the math); deterministic check only.
print("ALL OK" if ok else "SOME CHECKS FAILED")
Path(__file__).with_name("results.json").write_text(json.dumps({"ok": ok, **results}, indent=1))
raise SystemExit(0 if ok else 1)
