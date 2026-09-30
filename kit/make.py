"""Build one episode end to end.

    ~/.surprisal_venv/bin/python -m kit.make episodes/_example-birthday-paradox [--draft] [--from render]

Episode folder must contain script.json and scene.py (class Episode, optional class Thumbnail).
Outputs in <episode>/build/:
    final.mp4          the upload
    thumbnail.png      long-form only (from class Thumbnail, else a frame)
    contact_sheet.png  grid of frames every few seconds: LOOK AT THIS before uploading
    report.json        automatic checks; "ok": false means do not upload (also copied to <episode>/)
    chapters.txt       long-form only, from beats that have a "chapter" key; paste into the description
"""
import argparse
import glob
import json
import os
import shutil
import subprocess
import sys
import time

KIT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, KIT_ROOT)
from kit import audio  # noqa: E402

VENV_BIN = os.path.dirname(sys.executable)


def sh(cmd, env=None, quiet=True):
    r = subprocess.run(cmd, env=env, capture_output=quiet, text=True)
    if r.returncode != 0:
        print(r.stdout[-4000:] if r.stdout else "", r.stderr[-4000:] if r.stderr else "")
        raise SystemExit(f"command failed: {' '.join(cmd[:4])} ...")
    return r


def probe(path):
    r = sh(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=width,height,codec_type",
            "-of", "json", path])
    return json.loads(r.stdout)


def render(ep, draft):
    env = dict(os.environ, EPISODE_DIR=ep, SURPRISAL_DRAFT="1" if draft else "", PYTHONPATH=KIT_ROOT + os.pathsep + os.environ.get("PYTHONPATH", ""))
    media = f"{ep}/build/media"
    shutil.rmtree(media, ignore_errors=True)
    q = ["-ql"] if draft else ["-qh"]
    fps = ["--fps", "15"] if draft else []
    sh([f"{VENV_BIN}/manim", *q, *fps, "--disable_caching", "--media_dir", media, "-o", "raw",
        f"{ep}/scene.py", "Episode"], env=env)
    raw = glob.glob(f"{media}/videos/**/raw.mp4", recursive=True)
    if not raw:
        raise SystemExit("render produced no video")
    shutil.copy(raw[0], f"{ep}/build/raw.mp4")
    src = open(f"{ep}/scene.py").read()
    if "class Thumbnail" in src:
        sh([f"{VENV_BIN}/manim", "-s", "-r", "1280,720", "--disable_caching", "--media_dir", media,
            "-o", "thumb", f"{ep}/scene.py", "Thumbnail"], env=env)
        th = glob.glob(f"{media}/images/**/thumb*.png", recursive=True)
        if th:
            shutil.copy(th[0], f"{ep}/build/thumbnail.png")


def assemble(ep, script, draft):
    raw = f"{ep}/build/raw.mp4"
    dur = float(probe(raw)["format"]["duration"])
    voice = audio.build_voice_track(ep, dur)
    words, match_ratio, heard = audio.align_captions(ep, voice)
    ass = audio.write_ass(ep, words, script.get("format", "short"))
    seed = sum(map(ord, os.path.basename(ep.rstrip("/"))))
    music, music_src = audio.pick_music(ep, dur + 1, seed)
    mvol = script.get("music_volume", 0.20)
    lp = ",lowpass=f=1400" if music_src == "generated" else ""
    fonts = os.path.expanduser("~/.fonts")
    fc = (f"[1:a]aresample=48000,apad=whole_dur={dur:.3f},asplit=2[v1][v2];"
          f"[2:a]aresample=48000,aloop=loop=-1:size=2e9,atrim=0:{dur:.3f}{lp},volume={mvol},"
          f"afade=t=in:d=1.2,afade=t=out:st={max(0, dur - 2):.3f}:d=2[m];"
          f"[m][v1]sidechaincompress=threshold=0.04:ratio=5:attack=30:release=500[md];"
          f"[v2][md]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a];"
          f"[0:v]ass={ass}:fontsdir={fonts}[vv]")
    out = f"{ep}/build/final.mp4"
    sh(["ffmpeg", "-y", "-v", "error", "-i", raw, "-i", voice, "-i", music, "-filter_complex", fc,
        "-map", "[vv]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast" if draft else "medium",
        "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-t", f"{dur:.3f}",
        "-movflags", "+faststart", out])
    return out, match_ratio, heard, music_src


def contact_sheet(ep, dur):
    every = max(2.0, dur / 24)
    sh(["ffmpeg", "-y", "-v", "error", "-i", f"{ep}/build/final.mp4", "-vf",
        f"fps=1/{every:.2f},scale=-2:480,tile=6x4:padding=6:color=0x0E1726", "-frames:v", "1",
        f"{ep}/build/contact_sheet.png"])
    return every


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--draft", action="store_true", help="low-res 15fps preview, much faster")
    ap.add_argument("--from", dest="start", default="voice", choices=["voice", "render", "assemble"])
    a = ap.parse_args()
    ep = os.path.abspath(a.episode)
    script = json.load(open(f"{ep}/script.json"))
    os.makedirs(f"{ep}/build", exist_ok=True)
    t0 = time.time()
    steps = ["voice", "render", "assemble"]
    todo = steps[steps.index(a.start):]
    if "voice" in todo:
        print("[make] voice"); audio.synth_voice(ep)
    if "render" in todo:
        print("[make] render (Manim)"); render(ep, a.draft)
    print("[make] assemble")
    out, match_ratio, heard, music_src = assemble(ep, script, a.draft)

    info = probe(out)
    dur = float(info["format"]["duration"])
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    tl = json.load(open(f"{ep}/build/timeline.json"))
    every = contact_sheet(ep, dur)
    size_mb = os.path.getsize(out) / 1e6
    fmt = script.get("format", "short")
    problems = []
    if fmt == "short":
        if not (v["width"] == 1080 and v["height"] == 1920) and not a.draft:
            problems.append(f"short must be 1080x1920, got {v['width']}x{v['height']}")
        if dur > 178:
            problems.append(f"short is {dur:.0f}s; Shorts max is 180s, aim for 45-75s")
    else:
        if dur < 480:
            problems.append(f"long-form is {dur/60:.1f} min; aim for 8+ minutes so mid-roll ads are allowed")
    if size_mb > 95:
        problems.append(f"file is {size_mb:.0f}MB; GitHub rejects files over 100MB (raise crf)")
    if match_ratio < 0.85:
        problems.append(f"only {match_ratio:.0%} of script words were recognised in the voiceover; "
                        "a word may be mispronounced. Compare 'heard' with the script and rephrase.")
    if tl["overruns"]:
        problems.append(f"animations ran past their voice clip (s): {tl['overruns']} "
                        "(audio is still in sync; just dead air on screen)")
    report = {"ok": not any(p for p in problems if "overrun" not in p and "ran past" not in p),
              "problems": problems, "duration_s": round(dur, 1), "size_mb": round(size_mb, 1),
              "resolution": f"{v['width']}x{v['height']}", "caption_match_ratio": match_ratio,
              "heard": heard, "music": music_src,
              "voice_engine": json.load(open(f"{ep}/build/voice/engine.json"))["engine"]
              if os.path.exists(f"{ep}/build/voice/engine.json") else "unknown", "contact_sheet_every_s": round(every, 1),
              "build_seconds": round(time.time() - t0), "draft": a.draft}
    # chapters for long-form descriptions: beats with a "chapter" key start a chapter
    chapters = [(tl["beat_starts"][b["id"]], b["chapter"]) for b in script["beats"]
                if b.get("chapter") and b["id"] in tl["beat_starts"]]
    if chapters:
        chapters.sort()
        if chapters[0][0] > 0.5:
            chapters.insert(0, (0.0, "Intro"))
        chapters[0] = (0.0, chapters[0][1])
        lines = [f"{int(t // 60)}:{int(t % 60):02d} {name}" for t, name in chapters]
        open(f"{ep}/build/chapters.txt", "w").write("\n".join(lines) + "\n")
        report["chapters"] = lines
    json.dump(report, open(f"{ep}/build/report.json", "w"), indent=1)
    shutil.copy(f"{ep}/build/report.json", f"{ep}/report.json")  # committed with the episode
    print(json.dumps(report, indent=1))


if __name__ == "__main__":
    main()
