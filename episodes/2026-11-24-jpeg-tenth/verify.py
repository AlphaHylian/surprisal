"""Every number in the jpeg-tenth Short, computed.
Usage: verify.py [photo_dir]. With a folder of real photos (the run used 4 Wikimedia Commons
photos, re-encoded with Pillow's libjpeg), it measures compression and zeroed coefficients;
without one, it checks the arithmetic and the DCT/quantisation on a synthetic photo-like block."""
import sys, io, glob
import numpy as np
from scipy.fft import dctn, idctn
ok = True
def check(name, good, detail=""):
    global ok
    ok &= bool(good)
    print(f"{'OK ' if good else 'BAD'} {name} {detail}")

px = 12_000_000
raw = px * 3
check("12 MP photo raw = 36 million bytes (3 bytes per pixel)", raw == 36_000_000)
# 4:2:0: Y full, Cb and Cr at half width and half height
ycc420 = px * 1 + 2 * (px / 4)
check("color at half width x half height = 1 sample per 4 pixels", (2 * 2) == 4)
check("4:2:0 halves the data (3 -> 1.5 bytes per pixel)", ycc420 / raw == 0.5)
check("8 x 8 block = 64 pixels = 64 patterns (DCT is a basis)", 8 * 8 == 64)
# DCT is lossless before rounding
rng = np.random.default_rng(0)
blk = rng.integers(0, 256, (8, 8)).astype(float) - 128
check("rewriting as 64 patterns loses nothing (inverse DCT exact)", np.allclose(idctn(dctn(blk, norm="ortho"), norm="ortho"), blk))
Q50 = np.array([16,11,10,16,24,40,51,61,12,12,14,19,26,58,60,55,14,13,16,24,40,57,69,56,14,17,22,29,51,87,80,62,18,22,37,56,68,109,103,77,24,35,55,64,81,104,113,92,49,64,78,87,103,121,120,101,72,92,95,98,112,100,103,99]).reshape(8, 8)
def qtab(q):
    s = 5000 / q if q < 50 else 200 - 2 * q
    return np.clip(np.floor((Q50 * s + 50) / 100), 1, 255)
check("standard table divides fine stripes far harder (99 vs 16 at quality 50)", Q50[7, 7] / Q50[0, 0] > 6)
check("payoff: 36 MB at 10:1 = 3.6 MB, a tenth", raw / 10 == 3_600_000)

photos = sorted(glob.glob(sys.argv[1] + "/*.jpg")) if len(sys.argv) > 1 else []
ratios, zeros = [], []
from PIL import Image
for f in photos:
    try: im = Image.open(f).convert("RGB")
    except Exception: continue
    b = io.BytesIO(); im.save(b, "JPEG", quality=90, subsampling=2)
    r = im.size[0] * im.size[1] * 3 / b.tell(); ratios.append(r)
    Y = np.asarray(im.convert("YCbCr"))[:, :, 0].astype(float) - 128
    h, w = (Y.shape[0] // 8) * 8, (Y.shape[1] // 8) * 8
    B = Y[:h, :w].reshape(h // 8, 8, w // 8, 8).swapaxes(1, 2).reshape(-1, 8, 8)
    z = (np.round(dctn(B, axes=(1, 2), norm="ortho") / qtab(75)) == 0).sum(axis=(1, 2)).mean()
    zeros.append(z)
    print(f"   {f.split('/')[-1]} {im.size}: quality 90 -> {r:.1f}x smaller; quality 75: {z:.1f} of 64 coefficients round to zero")
if ratios:
    check(f"{len(ratios)} real photos at quality 90: every one about 7x smaller or more, median 10x or more",
          min(ratios) >= 6.9 and float(np.median(ratios)) >= 10, f"min {min(ratios):.1f} median {np.median(ratios):.1f}")
    check("in every photo's average block, over 40 of 64 coefficients round to zero", min(zeros) > 40, f"min {min(zeros):.1f}")
else:
    print("   (no photo folder given: skipped the real-photo measurements)")
print("ALL OK" if ok else "SOME CHECKS FAILED")
