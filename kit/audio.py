"""Voiceover (Kokoro), caption alignment (faster-whisper) and background music."""
import json
import os
import re
from difflib import SequenceMatcher

import numpy as np
import soundfile as sf

CACHE = os.environ.get("SURPRISAL_CACHE", os.path.expanduser("~/.surprisal_cache"))
KIT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_VOICE = "af_heart"   # best-rated Kokoro voice; alternatives: af_bella, bf_emma, am_michael
DEFAULT_SPEED = 1.05
VOICE_SR = 24000


# ---------------------------------------------------------------- voice
def synth_voice(ep):
    script = json.load(open(f"{ep}/script.json"))
    ids = [b["id"] for b in script["beats"]]
    if len(ids) != len(set(ids)):
        raise ValueError("beat ids in script.json must be unique")
    from kokoro_onnx import Kokoro
    k = Kokoro(f"{CACHE}/kokoro.onnx", f"{CACHE}/voices.bin")
    voice = script.get("voice", DEFAULT_VOICE)
    speed = script.get("speed", DEFAULT_SPEED)
    out = f"{ep}/build/voice"
    os.makedirs(out, exist_ok=True)
    durations = {}
    for b in script["beats"]:
        samples, sr = k.create(b["say"], voice=voice, speed=b.get("speed", speed), lang="en-us")
        assert sr == VOICE_SR
        sf.write(f"{out}/{b['id']}.wav", samples, sr)
        durations[b["id"]] = round(len(samples) / sr, 3)
    json.dump(durations, open(f"{out}/durations.json", "w"), indent=1)
    return durations


def build_voice_track(ep, total_seconds):
    """Place each beat's clip at the time the scene actually started that beat."""
    tl = json.load(open(f"{ep}/build/timeline.json"))
    track = np.zeros(int((total_seconds + 1) * VOICE_SR), dtype=np.float32)
    for bid, start in tl["beat_starts"].items():
        clip, sr = sf.read(f"{ep}/build/voice/{bid}.wav", dtype="float32")
        i = int(start * VOICE_SR)
        track[i:i + len(clip)] += clip[: max(0, len(track) - i)]
    track = track[: int(total_seconds * VOICE_SR)]
    sf.write(f"{ep}/build/voice_track.wav", track, VOICE_SR)
    return f"{ep}/build/voice_track.wav"


# ---------------------------------------------------------------- captions
def _norm(word):
    """Word -> list of comparison tokens ('23%' -> ['twenty','three','percent'])."""
    from num2words import num2words
    w = word.lower().replace("%", " percent ").replace("-", " ").replace("’", "'")
    out = []
    for piece in w.split():
        piece = re.sub(r"[^\w.']", "", piece).strip(".'")
        if not piece:
            continue
        if re.fullmatch(r"\d+(\.\d+)?", piece.replace(",", "")):
            try:
                piece = num2words(float(piece) if "." in piece else int(piece.replace(",", "")))
            except Exception:
                pass
            out += re.sub(r"[^a-z ]", " ", piece.replace("-", " ")).split()
        else:
            out.append(piece)
    return out


def align_captions(ep, voice_track):
    """Word timings for the script text, using speech recognition only for the clock."""
    from faster_whisper import WhisperModel
    script = json.load(open(f"{ep}/script.json"))
    tl = json.load(open(f"{ep}/build/timeline.json"))

    # script words, remembering which beat each came from
    words = []
    for b in script["beats"]:
        for w in b.get("caption", b["say"]).split():
            words.append({"text": w, "beat": b["id"]})

    model = WhisperModel("base.en", device="cpu", compute_type="int8")
    segs, _ = model.transcribe(voice_track, word_timestamps=True, language="en")
    heard = [w for s in segs for w in s.words]

    s_tok, s_owner = [], []
    for i, w in enumerate(words):
        for t in _norm(w["text"]):
            s_tok.append(t); s_owner.append(i)
    h_tok, h_owner = [], []
    for j, w in enumerate(heard):
        for t in _norm(w.word):
            h_tok.append(t); h_owner.append(j)

    sm = SequenceMatcher(a=s_tok, b=h_tok, autojunk=False)
    matched = 0
    for a, b, n in sm.get_matching_blocks():
        for k in range(n):
            wi, hj = s_owner[a + k], h_owner[b + k]
            w = words[wi]
            w["start"] = min(w.get("start", 1e9), heard[hj].start)
            w["end"] = max(w.get("end", 0), heard[hj].end)
            matched += 1
    match_ratio = matched / max(1, len(s_tok))

    # fill gaps: unmatched words are spread across the time between matched neighbours,
    # falling back to the beat's start/end when a whole beat went unmatched
    durs = json.load(open(f"{ep}/build/voice/durations.json"))
    i = 0
    while i < len(words):
        if "start" in words[i]:
            i += 1; continue
        j = i
        while j < len(words) and "start" not in words[j]:
            j += 1
        bstart = tl["beat_starts"][words[i]["beat"]]
        lo = words[i - 1]["end"] if i > 0 and words[i - 1]["beat"] == words[i]["beat"] else bstart
        bend = tl["beat_starts"][words[j - 1]["beat"]] + durs[words[j - 1]["beat"]]
        hi = words[j]["start"] if j < len(words) and words[j]["beat"] == words[j - 1]["beat"] else bend
        hi = max(hi, lo + 0.15 * (j - i))
        step = (hi - lo) / (j - i)
        for k in range(i, j):
            words[k]["start"] = lo + step * (k - i)
            words[k]["end"] = lo + step * (k - i + 1)
        i = j
    json.dump({"match_ratio": round(match_ratio, 3),
               "heard": " ".join(w.word.strip() for w in heard),
               "words": words}, open(f"{ep}/build/captions.json", "w"), indent=1)
    return words, match_ratio, " ".join(w.word.strip() for w in heard)


def _ass_time(t):
    t = max(0, t)
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"


def write_ass(ep, words, fmt):
    if fmt == "short":
        W, H, size, pos, maxchars = 1080, 1920, 96, (540, 1250), 15
    else:
        W, H, size, pos, maxchars = 1920, 1080, 58, (960, 985), 34
    INK, AMB, NAVY = "&H00E6EFF2", "&H0047B5FF", "&H0026170E"
    # group words into short chunks
    chunks, cur = [], []
    for i, w in enumerate(words):
        text_len = sum(len(x["text"]) + 1 for x in cur) + len(w["text"])
        gap = w["start"] - cur[-1]["end"] if cur else 0
        if cur and (len(cur) >= 3 or text_len > maxchars or gap > 0.45 or w["beat"] != cur[-1]["beat"]
                    or re.search(r"[.,!?;:]$", cur[-1]["text"])):
            chunks.append(cur); cur = []
        cur.append(w)
    if cur:
        chunks.append(cur)
    lines = []
    for ci, ch in enumerate(chunks):
        nxt = chunks[ci + 1][0]["start"] if ci + 1 < len(chunks) else ch[-1]["end"] + 0.6
        for k, w in enumerate(ch):
            start = w["start"]
            end = ch[k + 1]["start"] if k + 1 < len(ch) else min(nxt, ch[-1]["end"] + 0.35)
            if end <= start:
                continue
            parts = []
            for m, x in enumerate(ch):
                t = x["text"].replace("{", "(").replace("}", ")")
                parts.append(f"{{\\c{AMB}}}{t}{{\\c{INK}}}" if m == k else t)
            fade = "\\fad(80,0)" if k == 0 else ""
            lines.append(f"Dialogue: 0,{_ass_time(start)},{_ass_time(end)},Cap,,0,0,0,,"
                         f"{{\\pos({pos[0]},{pos[1]}){fade}}}" + " ".join(parts))
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Space Grotesk Bold,{size},{INK},{INK},{NAVY},&H64000000,0,0,0,0,100,100,0,0,1,5,0,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    path = f"{ep}/build/captions.ass"
    open(path, "w").write(head + "\n".join(lines) + "\n")
    return path


# ---------------------------------------------------------------- music
def pick_music(ep, seconds, seed):
    """A track from assets/music if any exist (rotated by seed), else a generated ambient pad."""
    mdir = os.path.join(KIT_ROOT, "assets", "music")
    tracks = sorted(f for f in os.listdir(mdir) if f.lower().endswith((".mp3", ".wav", ".m4a", ".ogg"))) \
        if os.path.isdir(mdir) else []
    if tracks:
        return os.path.join(mdir, tracks[seed % len(tracks)]), "library"
    return ambient_pad(f"{ep}/build/music.wav", seconds, seed), "generated"


def ambient_pad(path, seconds, seed=0, sr=48000):
    rng = np.random.default_rng(seed)
    progressions = [
        [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]],   # Am F C G
        [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]],   # Dm Bb F C
        [[52, 55, 59], [48, 52, 55], [55, 59, 62], [50, 54, 57]],   # Em C G D
        [[45, 48, 52], [50, 53, 57], [43, 47, 50], [48, 52, 55]],   # Am Dm G C (low)
    ]
    prog = progressions[seed % len(progressions)]
    chord_len = 5.5 + rng.random() * 2
    n = int(seconds * sr)
    t = np.arange(n) / sr
    out = np.zeros(n, dtype=np.float64)
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)
    for ci in range(int(seconds / chord_len) + 2):
        c0 = ci * chord_len
        chord = prog[ci % len(prog)]
        seg = (t >= c0 - 1.5) & (t < c0 + chord_len + 1.5)
        ts = t[seg] - c0
        env = np.clip((ts + 1.5) / 2.5, 0, 1) * np.clip((chord_len + 1.5 - ts) / 2.5, 0, 1)
        for m in chord + [chord[0] - 12]:
            f = hz(m)
            for det in (-0.12, 0.12):
                out[seg] += env * np.sin(2 * np.pi * (f + det) * t[seg] + rng.random() * 6.28) * (0.5 if m < chord[0] else 0.3)
    # soft low-pass
    a = 0.06
    kernel = a * (1 - a) ** np.arange(160)
    out = np.convolve(np.convolve(out, kernel)[:n], kernel)[:n]
    out *= (1 + 0.08 * np.sin(2 * np.pi * 0.11 * t))
    out = out / (np.abs(out).max() + 1e-9) * 0.25
    sf.write(path, out.astype(np.float32), sr)
    return path
