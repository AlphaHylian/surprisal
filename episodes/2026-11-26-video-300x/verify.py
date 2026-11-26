"""Every number in the video-300x Short (how streaming shrinks a 4K movie ~300x).
Raw size: 3840 x 2160 pixels, 3 bytes (8-bit R, G, B) per pixel, 24 frames a second, 2 hours.
Netflix: Ultra HD (4K) uses up to 7 GB per hour (https://help.netflix.com/en/node/87).
Inter-frame coding: 16x16 macroblocks, motion vectors to the matching block in a reference frame, the
prediction error is sent (https://en.wikipedia.org/wiki/Inter_frame).
Measured on real footage: Big Buck Bunny (Blender Foundation, CC BY 3.0), 720p transcode from Wikimedia Commons,
re-encoded with x264 two ways: every frame on its own (all keyframes, like a JPEG per frame) and normally
(a keyframe every 2 s, the rest predicted from the frame before)."""
import json, os, subprocess, sys, urllib.request

ok = True
def check(name, got, want, tol):
    global ok
    good = abs(got - want) <= tol
    ok &= good
    print(f"{'OK ' if good else 'BAD'} {name}: {got:.4g} (script: {want})")

W, H, BPP, FPS, SEC = 3840, 2160, 3, 24, 2 * 3600
px = W * H
check("pixels per 4K frame: about 8 million", px / 1e6, 8, 0.3)
frame = px * BPP
check("bytes per frame: about 25 MB", frame / 1e6, 25, 0.5)
raw = frame * FPS * SEC
check("2-hour 4K movie, raw: about 4 TB", raw / 1e12, 4, 0.35)
netflix = 7e9 * 2
check("Netflix 4K, 2 hours: 14 GB", netflix / 1e9, 14, 0)
check("raw / Netflix: about 300x", raw / netflix, 300, 10)
jpeg = raw / 10
check("step 1, each frame squeezed ~10x like a JPEG (jpeg-tenth: 7-26x on 4 photos): about 400 GB", jpeg / 1e9, 400, 35)
check("re-hook: still about 30 times too big", jpeg / netflix, 30, 2)

# ---- measure on real footage
clip = os.environ.get("CLIP", os.path.join(os.path.dirname(__file__), "build", "bbb.webm"))
if not os.path.exists(clip):
    os.makedirs(os.path.dirname(clip), exist_ok=True)
    url = "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.720p.vp9.webm"
    req = urllib.request.Request(url, headers={"User-Agent": "SurprisalBot/1.0"})
    open(clip, "wb").write(urllib.request.urlopen(req, timeout=300).read())
tmp = os.path.join(os.path.dirname(clip), "_x264")
os.makedirs(tmp, exist_ok=True)
SS, DUR = "60", "60"   # one minute of the film, from 1:00
def enc(name, extra):
    out = os.path.join(tmp, name + ".mp4")
    if not os.path.exists(out):
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", SS, "-t", DUR, "-i", clip, "-an", "-r", "24", "-c:v", "libx264",
                        "-preset", "medium", "-crf", "20", *extra, out], check=True)
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "frame=pict_type,pkt_size", "-of", "json", out],
                       capture_output=True, text=True, check=True)
    return [(f["pict_type"], int(f["pkt_size"])) for f in json.loads(r.stdout)["frames"]]
intra = enc("intra", ["-x264-params", "keyint=1:scenecut=0"])
inter = enc("inter", ["-bf", "0", "-x264-params", "keyint=48:min-keyint=48:scenecut=0"])
n = len(inter)
w0, h0 = 1280, 720
raw_clip = w0 * h0 * 3 * n
s_intra, s_inter = sum(s for _, s in intra), sum(s for _, s in inter)
I = [s for t, s in inter if t == "I"]; P = [s for t, s in inter if t == "P"]
P_sorted = sorted(P)
print(f"   {n} frames; raw {raw_clip/1e6:.0f} MB; every frame alone {s_intra/1e6:.1f} MB ({raw_clip/s_intra:.1f}x); "
      f"predicted {s_inter/1e6:.1f} MB ({raw_clip/s_inter:.1f}x); keyframes {len(I)} avg {sum(I)/len(I)/1e3:.0f} KB; "
      f"predicted frames avg {sum(P)/len(P)/1e3:.1f} KB, median {P_sorted[len(P)//2]/1e3:.1f} KB")
ratio_frame = raw_clip / s_intra
check("step 1: squeezing every frame alone, like a JPEG: at least 10x smaller", ratio_frame >= 10, True, 0)
check("predicted frames vs keyframes: a predicted frame is about a tenth (or less) of a full one",
      (sum(P) / len(P)) / (sum(I) / len(I)) <= 0.12, True, 0)
check("sending what changed shrinks the clip several times more than frame-by-frame", s_intra / s_inter >= 3, True, 0)
check("keyframe ~130 KB", sum(I)/len(I)/1e3, 130, 5)
check("predicted frame ~8 KB", sum(P)/len(P)/1e3, 8, 0.5)
check("16 times less", (sum(I)/len(I))/(sum(P)/len(P)), 16, 0.6)
print(f"   frame-by-frame / predicted = {s_intra/s_inter:.1f}x; P/I = {(sum(P)/len(P))/(sum(I)/len(I)):.3f}")
print("ALL OK" if ok else "SOME CHECKS FAILED")
raise SystemExit(0 if ok else 1)
