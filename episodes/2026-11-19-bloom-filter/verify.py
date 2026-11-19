"""Every number in the bloom-filter Short, computed or simulated."""
import hashlib, math, random

ok = True
def check(name, good, detail=""):
    global ok
    ok &= bool(good)
    print(f"{'OK ' if good else 'BAD'} {name} {detail}")

N = 1_000_000_000
# Plain list: a billion usernames at 16 characters (bytes) each
check("a billion names x 16 bytes = 16 GB", N * 16 / 1e9 == 16)
# Bloom filter sized for 1% false alarms: m/n = -ln(p) / ln(2)^2, k = (m/n) ln 2  (Wikipedia, Bloom filter)
bpn = -math.log(0.01) / math.log(2) ** 2
check("switches per name for 1%: 9.6", round(bpn, 1) == 9.6, f"({bpn:.3f})")
check("9.6 billion switches = 1.2 GB", round(N * bpn / 8 / 1e9, 1) == 1.2, f"({N * bpn / 8 / 1e9:.3f} GB)")
k = bpn * math.log(2)
check("best number of hashes: 7", round(k) == 7, f"({k:.2f})")
fp = (1 - math.exp(-7 / bpn)) ** 7
check("false alarm with 7 hashes, 9.6 per name: about 1 in 100", round(fp * 100) == 1, f"({fp:.4%})")

def positions(name, m, k=7):
    return [int(hashlib.sha256(f"{i}:{name}".encode()).hexdigest(), 16) % m for i in range(k)]

# Simulation: 100,000 names in a filter of 9.6 bits per name, then 200,000 names never added
random.seed(7)
n = 100_000; m = round(n * bpn)
bits = bytearray(m)
added = [f"user{random.getrandbits(48):x}" for _ in range(n)]
for nm in added:
    for p in positions(nm, m): bits[p] = 1
check("no false 'free': every added name has all 7 switches on", all(all(bits[p] for p in positions(nm, m)) for nm in added))
trials = 200_000; alarms = 0
for i in range(trials):
    nm = f"new{i}-{random.getrandbits(40):x}"
    alarms += all(bits[p] for p in positions(nm, m))
rate = alarms / trials
check("simulated false alarms about 1 in 100", 0.008 <= rate <= 0.012, f"({rate:.3%} of {trials:,})")
check("so about 99 in 100 free names never touch the list", round((1 - rate) * 100) == 99)

# The demo in the scene: 40 switches, 3 names added, 7 hashes each
M = 40
names = ["alex", "mia", "noah"]
on = set()
for nm in names:
    ps = positions(nm, M); on |= set(ps); print(f"   {nm}: {ps}")
print("   switches on:", sorted(on), len(on))
check("demo: 3 names light 17 of 40 switches", len(on) == 17)
kai = positions("kai", M); off = [p for p in kai if p not in on]
check("demo: 'kai' has exactly one switch off (14) -> free", off == [14], f"{kai}")
fp = positions("sam197", M)
check("demo: 'sam197' was never added but all 7 switches are on (false alarm)", all(p in on for p in fp) and len(set(fp)) == 7, f"{fp}")
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
