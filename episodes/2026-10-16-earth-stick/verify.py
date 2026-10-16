"""Every number in the Eratosthenes Short (measuring the Earth with a stick's shadow)."""
import math

ok = True
def check(name, got, want, tol=0):
    global ok
    good = abs(got - want) <= tol
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got:.4f} (script: {want})")

# Cleomedes' account (Wikipedia, Eratosthenes): shadow angle at Alexandria 1/50 of a circle,
# Syene no shadow, 5,000 stadia apart -> 250,000 stadia.
angle = 360 / 50
check("1/50 of a circle in degrees", angle, 7.2, 1e-9)
check("50 slices of 7.2 degrees make 360", 360 / 7.2, 50, 1e-9)
C_stadia = 5000 * 360 / angle
check("Earth's circumference in stadia", C_stadia, 250000, 1e-6)

# Stick geometry: a 1 m stick with a 7.2 degree sun-angle-from-vertical casts tan(7.2) m of shadow.
shadow_cm = 100 * math.tan(math.radians(angle))
check("1 m stick: shadow ~12.6 cm", shadow_cm, 12.6, 0.05)

# Stadion length is uncertain: ~160 to ~210 m (Wikipedia). Range of the answer in km:
lo, hi = C_stadia * 160 / 1000, C_stadia * 185 / 1000
check("short stadion 160 m -> 40,000 km", lo, 40000, 1)
check("Attic/Pan-Hellenic stadion ~185 m -> ~46,000 km", hi, 46000, 300)
check("real (polar, meridian) circumference 40,008 km; within 1% at 160 m", abs(lo - 40008) / 40008 * 100, 0.02, 0.05)

# Do it yourself: a friend 1,000 km due north/south, same noon -> shadows differ by ~9 degrees.
C_km = 40008
check("1,000 km apart -> ~9 degrees", 1000 / C_km * 360, 9, 0.05)
check("CTA: 500 km apart -> ~4.5 degrees", 500 / C_km * 360, 4.5, 0.03)
check("each degree of shadow difference = ~111 km", C_km / 360, 111, 0.2)
print("ALL OK" if ok else "SOMETHING FAILED")
raise SystemExit(0 if ok else 1)
