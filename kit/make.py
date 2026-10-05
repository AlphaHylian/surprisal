"""Build one episode end to end.

    ~/.surprisal_venv/bin/python -m kit.make episodes/_example-birthday-paradox [--draft] [--from render]

Episode folder must contain script.json and either scene.tsx (Remotion, the current kit: see
studio/src/kit/index.tsx) or scene.py (Manim, older episodes; class Episode, optional Thumbnail).
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


STUDIO = os.path.join(KIT_ROOT, "studio")
BEAT_PAD = 0.2   # seconds of breathing room after each voice clip (script beats can set "pad")
TAIL = 0.6       # seconds after the last beat


def is_remotion(ep):
    return os.path.exists(f"{ep}/scene.tsx")


def plan_remotion(ep, script):
    """Lay beats end to end from their voice clips, build the voice track, align captions,
    and write build/plan.json for the Remotion render."""
    durs = json.load(open(f"{ep}/build/voice/durations.json"))
    beats, t = [], 0.0
    for b in script["beats"]:
        d = durs[b["id"]] + b.get("pad", BEAT_PAD)
        beats.append({"id": b["id"], "start": round(t, 3), "dur": round(d, 3), "say": b["say"]})
        t += d
    total = round(t + TAIL, 3)
    json.dump({"beat_starts": {b["id"]: b["start"] for b in beats}, "overruns": {}, "total": total},
              open(f"{ep}/build/timeline.json", "w"), indent=1)
    voice = audio.build_voice_track(ep, total)
    words, match_ratio, heard = audio.align_captions(ep, voice)
    fmt = script.get("format", "short")
    chunks = []
    for ch in audio.caption_chunks(words, 15 if fmt == "short" else 34):
        chunks.append({"start": round(ch[0]["start"], 3), "end": round(ch[-1]["end"] + 0.12, 3),
                       "words": [{"text": w["text"], "start": round(w["start"], 3), "end": round(w["end"], 3)} for w in ch]})
    for i in range(len(chunks) - 1):  # no gap flicker between chunks, no overlap either
        chunks[i]["end"] = min(max(chunks[i]["end"], chunks[i + 1]["start"] - 0.25), chunks[i + 1]["start"])
    plan = {"fps": 30, "total": total, "beats": beats, "chunks": chunks, "format": fmt}
    json.dump(plan, open(f"{ep}/build/plan.json", "w"), indent=1)
    return voice, match_ratio, heard


def check_spans(ep, script):
    """Every beat must sit in exactly one <Span>, in script order (otherwise its visuals vanish)."""
    import re
    ids = [b["id"] for b in script["beats"]]
    src = open(f"{ep}/scene.tsx").read()
    covered = []
    for a, b in re.findall(r'<Span\s+from="([^"]+)"(?:\s+to="([^"]+)")?', src):
        if a not in ids or (b and b not in ids):
            raise SystemExit(f"scene.tsx: <Span from=\"{a}\" to=\"{b}\"> names a beat that isn't in script.json")
        covered += ids[ids.index(a): ids.index(b or a) + 1]
    if covered != ids:
        missing = [i for i in ids if i not in covered]
        raise SystemExit(f"scene.tsx spans must cover each beat once, in order. Beats: {ids}; "
                         f"spans cover: {covered}" + (f"; missing: {missing}" if missing else ""))


NOISE = ("Detected differing memory", "Memory reported by", "You might have inadvertently", "Using the lower amount")


def render_remotion(ep, draft):
    if not os.path.isdir(os.path.join(STUDIO, "node_modules", "remotion")):
        sh(["npm", "ci", "--silent", "--prefix", STUDIO])
    if not os.path.exists(os.path.join(STUDIO, "public", "sfx", "whoosh.wav")):
        sh([sys.executable, "-m", "kit.sfx"], env=dict(os.environ, PYTHONPATH=KIT_ROOT))
    cmd = ["node", os.path.join(STUDIO, "render.mjs"), ep] + (["--draft"] if draft else [])
    r = subprocess.run(cmd, cwd=STUDIO, capture_output=True, text=True)
    if r.returncode != 0:
        err = "\n".join(l for l in r.stderr.splitlines() if not l.startswith(NOISE))
        print(r.stdout[-3000:], err[-6000:])
        raise SystemExit("Remotion render failed (see the error above; usually a TypeScript/React error in scene.tsx)")
    print(r.stdout.strip().splitlines()[-1] if r.stdout.strip() else "")


def lufs(path, pre_filter=""):
    """Integrated loudness (LUFS) of a file, optionally after a filter such as a trim."""
    af = (pre_filter + "," if pre_filter else "") + "ebur128"
    r = subprocess.run(["ffmpeg", "-v", "info", "-i", path, "-af", af, "-f", "null", "-"],
                       capture_output=True, text=True)
    vals = [l.split()[1] for l in r.stderr.splitlines() if l.strip().startswith("I:")]
    return float(vals[-1]) if vals else -70.0


VOICE_LUFS = -16.0   # voice level before the final loudness pass
FINAL_LUFS = -14.0   # YouTube's playback reference


def assemble(ep, script, draft, pre=None):
    """Mix voice + music (+ the render's own sound effects for Remotion episodes) and burn captions
    (Manim episodes only; Remotion draws its own). `pre` = (voice, match_ratio, heard) if already done."""
    raw = f"{ep}/build/raw.mp4"
    dur = float(probe(raw)["format"]["duration"])
    fmt = script.get("format", "short")
    remotion = pre is not None
    if remotion:
        voice, match_ratio, heard = pre
        ass = None
    else:
        voice = audio.build_voice_track(ep, dur)
        words, match_ratio, heard = audio.align_captions(ep, voice)
        ass = audio.write_ass(ep, words, fmt)
    seed = sum(map(ord, os.path.basename(ep.rstrip("/"))))
    music, music_title, credit, mstart = audio.pick_music(ep, script, dur + 1, seed)
    open(f"{ep}/build/music_credit.txt", "w").write(credit + ("\n" if credit else ""))

    # levels: voice to VOICE_LUFS, music `gap` dB under it; gentle ducking (~3 dB) while speaking
    gap = script.get("music_gap_db", 8.0 if fmt == "short" else 11.0)
    v_gain = VOICE_LUFS - lufs(voice)
    m_gain = (VOICE_LUFS - gap) - lufs(music, f"atrim=start={mstart}:duration={min(dur, 90):.1f}")
    fonts = os.path.expanduser("~/.fonts")
    sfx_gain = script.get("sfx_gain_db", -6.0)  # effects sit just under the voice (checked on the zip episode)
    fc = (f"[1:a]aresample=48000,volume={v_gain:.2f}dB,apad=whole_dur={dur:.3f},asplit=2[v1][v2];"
          f"[2:a]aresample=48000,atrim=0:{dur:.3f},asetpts=PTS-STARTPTS,volume={m_gain:.2f}dB,"
          f"afade=t=in:d=0.03,afade=t=out:st={max(0, dur - 1.5):.3f}:d=1.5[m];"
          f"[m][v1]sidechaincompress=threshold=0.05:ratio=2.5:attack=15:release=350[md];")
    if remotion:  # the render's audio track holds the sound effects
        fc += (f"[0:a]aresample=48000,volume={sfx_gain:.1f}dB,apad=whole_dur={dur:.3f}[fx];"
               f"[v2][md][fx]amix=inputs=3:duration=first:normalize=0,alimiter=limit=0.89:level=false[a];"
               f"[0:v]null[vv]")
    else:
        fc += (f"[v2][md]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.89:level=false[a];"
               f"[0:v]ass={ass}:fontsdir={fonts}[vv]")
    mixed = f"{ep}/build/mixed.mp4"
    sh(["ffmpeg", "-y", "-v", "error", "-i", raw, "-i", voice,
        "-stream_loop", "-1", "-ss", f"{mstart:.2f}", "-i", music, "-filter_complex", fc,
        "-map", "[vv]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast" if draft else "medium",
        "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "pcm_s16le", "-t", f"{dur:.3f}", "-f", "matroska",
        mixed + ".mkv"])
    # final loudness: one linear gain to FINAL_LUFS plus a peak limiter (no pumping)
    f_gain = FINAL_LUFS - lufs(mixed + ".mkv")
    out = f"{ep}/build/final.mp4"
    sh(["ffmpeg", "-y", "-v", "error", "-i", mixed + ".mkv", "-c:v", "copy",
        "-af", f"volume={f_gain:.2f}dB,alimiter=limit=0.89:level=false",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])
    os.remove(mixed + ".mkv")
    return out, match_ratio, heard, {"title": music_title, "gap_db": gap}, voice


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
    ap.add_argument("--redo-beats", default="", help="comma-separated beat ids: re-voice only these, then render")
    a = ap.parse_args()
    ep = os.path.abspath(a.episode)
    script = json.load(open(f"{ep}/script.json"))
    os.makedirs(f"{ep}/build", exist_ok=True)
    t0 = time.time()
    steps = ["voice", "render", "assemble"]
    todo = steps[steps.index(a.start):]
    if a.redo_beats:
        print(f"[make] re-voicing {a.redo_beats}")
        audio.synth_voice(ep, only=[x.strip() for x in a.redo_beats.split(",") if x.strip()])
        todo = ["render", "assemble"]
    elif "voice" in todo:
        print("[make] voice"); audio.synth_voice(ep)
    pre = None
    if is_remotion(ep):
        audio.trim_all(ep)
        print("[make] plan + captions")
        pre = plan_remotion(ep, script)
        if "render" in todo:
            check_spans(ep, script)
            print("[make] render (Remotion)"); render_remotion(ep, a.draft)
    elif "render" in todo:
        audio.trim_all(ep)  # idempotent; makes sure old clips have no lead-in silence
        print("[make] render (Manim)"); render(ep, a.draft)
    print("[make] assemble")
    out, match_ratio, heard, music, voice_track = assemble(ep, script, a.draft, pre)
    onset = audio.speech_onset(voice_track)

    info = probe(out)
    dur = float(info["format"]["duration"])
    v = next(s for s in info["streams"] if s["codec_type"] == "video")
    tl = json.load(open(f"{ep}/build/timeline.json"))
    every = contact_sheet(ep, dur)
    size_mb = os.path.getsize(out) / 1e6
    fmt = script.get("format", "short")
    problems = []
    if fmt == "short":
        if not (v["width"] == 1080 and v["height"] == 1920) and not a.draft:  # drafts are half size
            problems.append(f"short must be 1080x1920, got {v['width']}x{v['height']}")
        if dur > 178:
            problems.append(f"short is {dur:.0f}s; Shorts max is 180s, aim for 45-90s")
    else:
        if dur < 480:
            problems.append(f"long-form is {dur/60:.1f} min; aim for 8+ minutes so mid-roll ads are allowed")
    if onset is None or onset > 0.05:
        problems.append(f"speech starts at {onset}s; the first word must start at 0 "
                        "(check the first beat is the first thing in construct() and nothing plays before it)")
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
              "heard": heard, "music": music["title"], "music_gap_db": music["gap_db"],
              "speech_starts_at_s": onset, "final_lufs": round(lufs(out), 1),
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
