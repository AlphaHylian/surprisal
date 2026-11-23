"""Every number in the drive-gigabytes Short, computed."""
import random
ok = True
def check(name, good, detail=""):
    global ok
    ok &= bool(good)
    print(f"{'OK ' if good else 'BAD'} {name} {detail}")

TB = 10**12
gib = TB / 2**30
check("1 TB (10^12 bytes) / 1,024^3 = 931 'GB' in Windows", int(gib) == 931, f"{gib:.2f}")
check("69 'gigabytes' look missing (1,000 - 931)", 1000 - int(gib) == 69, f"{1000-gib:.1f}")
check("1,024 is 2.4% more than 1,000", round((1024/1000 - 1)*100, 1) == 2.4)
for name, k, want in [("mega", 2, 4.9), ("giga", 3, 7.4), ("tera", 4, 10.0)]:
    d = (1024**k / 1000**k - 1) * 100
    check(f"{name}: binary unit {want}% bigger", round(d, 1) == want, f"{d:.2f}%")
# shown size shrinks by 1/1.024^k
for k, want in [(3, 6.9), (4, 9.1)]:
    s = (1 - 1000**k / 1024**k) * 100
    print(f"   shown number smaller by {s:.1f}% at k={k}")
check("dividing a trillion by 1,024 three times gives 931.3", abs(TB/1024/1024/1024 - 931.32) < 0.01)
check("same drive in TiB: 0.909", round(TB/2**40, 3) == 0.909)
# simulated: random drive sizes, the ratio is always the same
random.seed(1)
check("100,000 random drive sizes: shown/labelled always 0.9313", all(abs((n*1e9/2**30)/n - 0.93132) < 1e-4 for n in (random.randint(1, 20000) for _ in range(100_000))))
half = 500e9 / 2**30
check("CTA: a 500 GB drive shows as 465 GB in Windows", int(half) == 465, f"{half:.2f}")
check("Seagate suit: overstated by ~7% (giga level 7.4%)", 7 <= (2**30/1e9 - 1)*100 < 8)
print("ALL OK" if ok else "SOME CHECKS FAILED")
