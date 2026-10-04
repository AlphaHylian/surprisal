"""Voiceover (Fish Audio or OmniVoice cloning the channel voice, Kokoro as last resort), caption alignment
(faster-whisper) and background music."""
import json
import os
import re
import time
from difflib import SequenceMatcher

import numpy as np
import soundfile as sf

CACHE = os.environ.get("SURPRISAL_CACHE", os.path.expanduser("~/.surprisal_cache"))
KIT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE_SR = 24000

# The channel voice: "Sam", an OmniVoice-generated voice. Every clip clones this reference so the
# narrator sounds the same in every beat and every video.
REF_AUDIO = os.path.join(KIT_ROOT, "assets", "voice", "sam_ref.wav")
REF_TEXT = os.path.join(KIT_ROOT, "assets", "voice", "sam_ref.txt")
OMNI_STEPS = {"short": 32, "long": 16}   # quality steps; ~12x / ~6.5x real time on 2 CPU cores

# Fallback only: used automatically if OmniVoice fails, and reported in report.json.
KOKORO_VOICE = "af_heart"
KOKORO_SPEED = 1.05


# ---------------------------------------------------------------- text -> spoken words
def spoken(text):
    """Turn digits into words the way a narrator would say them ('23rd' -> 'twenty-third',
    '97%' -> 'ninety-seven percent', '200,000' -> 'two hundred thousand', '99.9' -> 'ninety-nine
    point nine', '1988' -> 'nineteen eighty-eight': plain 4-digit numbers from 1500 to 2099 are read as
    years, so write other numbers in that range with a comma, '1,600'). OmniVoice reads raw digits
    unreliably."""
    from num2words import num2words

    def us(words):  # American style: "three hundred sixty-five", no "and"
        return words.replace(" and ", " ")

    def ordinal(m):
        return us(num2words(int(m.group(1).replace(",", "")), to="ordinal"))

    def number(m):
        s = m.group(0).replace(",", "")
        if "." in s:
            whole, frac = s.split(".", 1)
            return us(num2words(int(whole))) + " point " + " ".join(num2words(int(d)) for d in frac)
        n = int(s)
        if "," not in m.group(0) and len(s) == 4 and 1500 <= n <= 2099:   # a year: "1988" -> nineteen eighty-eight
            return num2words(n, to="year")
        return us(num2words(n))

    t = text.replace("%", " percent")
    t = re.sub(r"\b(\d[\d,]*)(st|nd|rd|th)\b", ordinal, t)
    t = re.sub(r"\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?", number, t)
    return re.sub(r"\s+", " ", t).strip()


# ---------------------------------------------------------------- voice
def _synth_omnivoice(script, out):
    import torch
    torch.set_num_threads(os.cpu_count() or 2)
    from omnivoice import OmniVoice
    model = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
    prompt = model.create_voice_clone_prompt(ref_audio=REF_AUDIO, ref_text=open(REF_TEXT).read().strip())
    steps = script.get("voice_steps", OMNI_STEPS.get(script.get("format", "short"), 32))
    speed = script.get("speed")
    durations = {}
    for b in script["beats"]:
        text = spoken(b["say"])
        audio = model.generate(text=text, language="English", voice_clone_prompt=prompt, num_step=steps,
                               speed=b.get("speed", speed), pad_duration=0.0, fade_duration=0.01)[0]
        if model.sampling_rate != VOICE_SR:
            raise RuntimeError(f"unexpected sample rate {model.sampling_rate}")
        sf.write(f"{out}/{b['id']}.wav", audio.astype(np.float32), VOICE_SR)
        durations[b["id"]] = round(len(audio) / VOICE_SR, 3)
        print(f"  voice {b['id']}: {durations[b['id']]}s", flush=True)
    return durations


FISH_URL = "https://api.fish.audio/v1/tts"
FISH_MODEL = os.environ.get("FISH_MODEL", "s2.1-pro-free")  # free (fair use) until 2026-11-30, then "s2.1-pro" is paid


def _synth_fish(script, out):
    """Fish Audio cloud TTS, cloning Sam zero-shot from the same reference clip: a few seconds per
    beat instead of minutes on CPU. The key comes from the FISH_API_KEY environment variable, or is
    attached to api.fish.audio by the environment's proxy (an API credential on the cloud
    environment); it never goes in the repo. Raises on any failure so the caller can fall back."""
    import io

    import msgpack
    import requests
    ref = {"audio": open(REF_AUDIO, "rb").read(), "text": open(REF_TEXT).read().strip()}
    headers = {"Content-Type": "application/msgpack", "model": script.get("fish_model", FISH_MODEL)}
    if os.environ.get("FISH_API_KEY"):
        headers["Authorization"] = f"Bearer {os.environ['FISH_API_KEY']}"
    speed = script.get("speed")
    durations = {}
    for b in script["beats"]:
        body = {"text": spoken(b["say"]), "references": [ref], "format": "wav", "sample_rate": VOICE_SR,
                "latency": "normal", "normalize": True, "temperature": 0.7, "top_p": 0.7}
        if b.get("speed", speed):
            body["prosody"] = {"speed": b.get("speed", speed)}
        for attempt in range(3):
            r = requests.post(FISH_URL, data=msgpack.packb(body), headers=headers, timeout=120)
            if r.status_code == 200 or r.status_code in (401, 402, 403):
                break
            time.sleep(3 * (attempt + 1))
        if r.status_code != 200:
            raise RuntimeError(f"Fish Audio HTTP {r.status_code}: {r.text[:200]}")
        audio, sr = sf.read(io.BytesIO(r.content), dtype="float32")
        if audio.ndim > 1:
            audio = audio.mean(axis=1)
        if sr != VOICE_SR:
            raise RuntimeError(f"unexpected sample rate {sr}")
        sf.write(f"{out}/{b['id']}.wav", audio, VOICE_SR)
        durations[b["id"]] = round(len(audio) / VOICE_SR, 3)
        print(f"  voice {b['id']}: {durations[b['id']]}s (fish)", flush=True)
    return durations


def _synth_kokoro(script, out):
    from kokoro_onnx import Kokoro
    k = Kokoro(f"{CACHE}/kokoro.onnx", f"{CACHE}/voices.bin")
    durations = {}
    for b in script["beats"]:
        samples, sr = k.create(b["say"], voice=KOKORO_VOICE, speed=b.get("speed", KOKORO_SPEED), lang="en-us")
        sf.write(f"{out}/{b['id']}.wav", samples, sr)
        durations[b["id"]] = round(len(samples) / sr, 3)
    return durations


def synth_voice(ep, only=None):
    """Voice every beat, or only the beat ids in `only` (keeps the other clips as they are)."""
    script = json.load(open(f"{ep}/script.json"))
    ids = [b["id"] for b in script["beats"]]
    if len(ids) != len(set(ids)):
        raise ValueError("beat ids in script.json must be unique")
    out = f"{ep}/build/voice"
    os.makedirs(out, exist_ok=True)
    if only:
        unknown = set(only) - set(ids)
        if unknown:
            raise ValueError(f"no such beat ids: {sorted(unknown)}")
        script = dict(script, beats=[b for b in script["beats"] if b["id"] in only])
    t0 = time.time()
    # Order of preference: Fish Audio (fast), OmniVoice (same voice, slow, local), Kokoro (last resort).
    engine = script.get("engine", "fish")
    if only and os.path.exists(f"{out}/engine.json"):  # keep one voice across the video
        prev = json.load(open(f"{out}/engine.json"))["engine"]
        engine = prev.split(" ")[0]
    if engine == "fish":
        try:
            durations = _synth_fish(script, out)
        except Exception as e:
            print(f"[voice] Fish Audio failed ({type(e).__name__}: {e}); using OmniVoice", flush=True)
            engine = "omnivoice"
    if engine == "omnivoice":
        try:
            durations = _synth_omnivoice(script, out)
        except Exception as e:  # never lose the day's video over the voice model
            print(f"[voice] OmniVoice failed ({type(e).__name__}: {e}); falling back to Kokoro", flush=True)
            engine = "kokoro (fallback)"
    if engine.startswith("kokoro"):
        durations = _synth_kokoro(script, out)
    json.dump({"engine": engine, "seconds": round(time.time() - t0)}, open(f"{out}/engine.json", "w"))
    return trim_all(ep)


def _speech_start(x, sr):
    """Index of the first sample of speech: the first 10 ms frame above -20 dB (relative to the
    clip's peak), extended back through touching frames above -29 dB so soft consonants
    (s, f, h) stay, while breaths and noise before the word are dropped."""
    hop = int(sr * 0.01)
    n = len(x) // hop
    if n == 0:
        return 0
    frames = np.abs(x[: n * hop]).reshape(n, hop).max(axis=1)
    peak = frames.max()
    strong = np.nonzero(frames > peak * 0.10)[0]
    if len(strong) == 0:
        return 0
    i = strong[0]
    while i > 0 and frames[i - 1] > peak * 0.035:
        i -= 1
    return i * hop


def trim_silence(path, pre=0.006, post=0.08):
    """Cut the lead-in (silence and breaths) so a clip starts on its first word, and trailing
    silence after the last sound. Idempotent."""
    x, sr = sf.read(path, dtype="float32")
    if x.ndim > 1:
        x = x.mean(axis=1)
    if len(x) == 0:
        return 0.0
    a = max(0, _speech_start(x, sr) - int(pre * sr))
    hop = int(sr * 0.005)
    n = len(x) // hop
    frames = np.abs(x[: n * hop]).reshape(n, hop).max(axis=1)
    loud = np.nonzero(frames > max(frames.max() * 0.02, 1e-3))[0]
    b = min(len(x), (loud[-1] + 1) * hop + int(post * sr)) if len(loud) else len(x)
    y = x[a:b].copy()
    fade = min(len(y), int(0.004 * sr))
    y[:fade] *= np.linspace(0.3, 1, fade)  # soften the cut without eating the first consonant
    sf.write(path, y, sr)
    return len(y) / sr


def trim_all(ep):
    """Trim every beat clip and rewrite durations.json (safe to run again)."""
    out = f"{ep}/build/voice"
    script = json.load(open(f"{ep}/script.json"))
    marker = f"{out}/trimmed.json"
    done = json.load(open(marker)) if os.path.exists(marker) else {}
    durations = {}
    for b in script["beats"]:
        path = f"{out}/{b['id']}.wav"
        stamp = str(os.path.getmtime(path))
        if done.get(b["id"]) == stamp:              # already trimmed, untouched since
            durations[b["id"]] = round(sf.info(path).duration, 3)
        else:
            durations[b["id"]] = round(trim_silence(path), 3)
            done[b["id"]] = str(os.path.getmtime(path))
    json.dump(done, open(marker, "w"))
    json.dump(durations, open(f"{out}/durations.json", "w"), indent=1)
    return durations


def speech_onset(path):
    """Seconds from the start of a track to the first spoken word (same rule as trimming)."""
    x, sr = sf.read(path, dtype="float32")
    if x.ndim > 1:
        x = x.mean(axis=1)
    if not np.abs(x).max() > 0:
        return None
    return round(_speech_start(x, sr) / sr, 3)


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


def caption_chunks(words, maxchars=15):
    """Group aligned words into short on-screen chunks (max 3 words, break at punctuation/pauses)."""
    chunks, cur = [], []
    for w in words:
        text_len = sum(len(x["text"]) + 1 for x in cur) + len(w["text"])
        gap = w["start"] - cur[-1]["end"] if cur else 0
        if cur and (len(cur) >= 3 or text_len > maxchars or gap > 0.45 or w["beat"] != cur[-1]["beat"]
                    or re.search(r"[.,!?;:]$", cur[-1]["text"])):
            chunks.append(cur); cur = []
        cur.append(w)
    if cur:
        chunks.append(cur)
    return chunks


def write_ass(ep, words, fmt):
    if fmt == "short":
        W, H, size, pos, maxchars = 1080, 1920, 96, (540, 1250), 15
    else:
        W, H, size, pos, maxchars = 1920, 1080, 58, (960, 985), 34
    INK, AMB, NAVY = "&H00E6EFF2", "&H0047B5FF", "&H0026170E"
    chunks = caption_chunks(words, maxchars)
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
            fade = "\\fad(80,0)" if k == 0 and start > 0.1 else ""  # first caption is on screen at frame 1
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
def music_library():
    path = os.path.join(KIT_ROOT, "assets", "music", "tracks.json")
    return json.load(open(path))["tracks"] if os.path.exists(path) else []


def recent_music(n=3):
    import csv
    path = os.path.join(KIT_ROOT, "state", "videos.csv")
    if not os.path.exists(path):
        return []
    rows = list(csv.DictReader(open(path)))
    return [r.get("music", "") for r in rows[-n:]]


def pick_music(ep, script, seconds, seed):
    """Choose a track: script["music"] (file or title) if set, else one matching the mood for this
    format/series that wasn't used in the last 3 videos. Returns (path, title, credit, start_s).
    Falls back to a generated pad if the library is missing."""
    lib = music_library()
    mdir = os.path.join(KIT_ROOT, "assets", "music")
    if lib:
        want = script.get("music")
        track = next((t for t in lib if want and want in (t["file"], t["title"])), None)
        if not track:
            if script.get("format") == "long":
                moods = ["calm", "chill"]
            elif script.get("series") == "puzzle":
                moods = ["curious", "chill", "upbeat"]
            else:
                moods = ["upbeat", "chill"]
            moods = script.get("music_moods", moods)
            cands = [t for t in lib if t["mood"] in moods] or lib
            fresh = [t for t in cands if t["file"] not in recent_music()] or cands
            track = fresh[seed % len(fresh)]
        return os.path.join(mdir, track["file"]), track["title"], track["credit"], track.get("start_s", 0.0)
    return ambient_pad(f"{ep}/build/music.wav", seconds, seed), "generated pad", "", 0.0


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
