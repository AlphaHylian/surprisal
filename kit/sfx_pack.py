"""Import the owner's sound-effects pack into the Remotion studio.

    ~/.surprisal_venv/bin/python -m kit.sfx_pack "<folder with the original files>"

Each kept file is trimmed (no silence before the sound starts, so it lands exactly when the scene
asks for it), cut to at most MAX_LEN seconds with a fade, loudness-matched, and written as
studio/public/sfx/pack/<name>.mp3. It also writes:
  studio/src/kit/sfx_catalog.ts  names, durations and "hit" times for the kit (type-checked names)
  docs/SFX.md                     the catalogue the daily run reads to choose sounds
The originals are not kept in the repo. Files left out of MANIFEST (game/brand sounds that can
draw copyright claims, Epidemic Sound files that need a subscription, music, compilations, and
unlabelled files) are listed under SKIPPED.
"""
import json
import os
import subprocess
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "studio", "public", "sfx", "pack")
SR = 48000
MAX_LEN = 8.0

# file -> (name, category, description). Category order is the order in docs/SFX.md.
MANIFEST = {
    # whooshes and transitions
    "Fast Whoosh Sound Effect.mp3": ("whoosh-fast", "whoosh", "quick airy whoosh, the default for things sliding in"),
    "fast-whoosh-118248.mp3": ("whoosh-fast-2", "whoosh", "quick whoosh, a little heavier"),
    "whoosh-6316.mp3": ("whoosh-tiny", "whoosh", "very short flick, for small labels and chips"),
    "Whoosh 2.mp3": ("whoosh-short", "whoosh", "short whoosh"),
    "whoosh sound effect.mp3": ("whoosh-mid", "whoosh", "medium whoosh"),
    "Swoosh.mp3": ("swoosh", "whoosh", "swoosh, a bit longer"),
    "clean-fast-swooshaiff-14784.mp3": ("swoosh-clean", "whoosh", "clean fast swoosh"),
    "Short Whoosh.mp3": ("whoosh-soft", "whoosh", "soft whoosh with a tail"),
    "rm whoosh.wav": ("whoosh-punchy", "whoosh", "punchy whoosh, good for scene changes"),
    "swinging-staff-whoosh-strong-08-44658.mp3": ("whoosh-swing", "whoosh", "strong swing, for something swung or thrown"),
    "Rake Swing Whoosh Close.mp3": ("whoosh-close", "whoosh", "close swing past the mic"),
    "29 Swing A.wav": ("whoosh-swing-2", "whoosh", "swing whoosh"),
    "mixkit-arrow-whoosh-1491.wav": ("whoosh-arrow", "whoosh", "arrow flying past, for arrows and pointers"),
    "arrow sounds.mp3": ("arrow", "whoosh", "arrow shot and thunk"),
    "mixkit-cinematic-transition-wind-swoosh-1468.wav": ("transition-wind", "whoosh", "cinematic wind swoosh, scene change"),
    "mixkit-cinematic-wind-swoosh-1471.wav": ("transition-wind-2", "whoosh", "cinematic wind swoosh, scene change"),
    "mixkit-metal-hit-woosh-1485.wav": ("whoosh-metal", "whoosh", "whoosh ending in a metallic hit"),
    "Short Transition _2 Sound .mp3": ("transition-short", "whoosh", "short transition sweep"),
    "Lens flare transition sound effect.mp3": ("transition-flare", "whoosh", "bright shimmer sweep, light flare"),
    "WHOOSH FIRE TRANSITION.mp3": ("transition-fire", "whoosh", "fiery whoosh transition"),
    "Long whoosh sound effect.mp3": ("whoosh-long", "whoosh", "long whoosh (cut to 8 s)"),
    "mixkit-in-and-out-zoom-sound-2622.wav": ("zoom-in-out", "whoosh", "zoom in and out, for camera zooms"),
    "mixkit-warping-slide-1531.wav": ("warp-slide", "whoosh", "warping slide, for something morphing"),
    "mixkit-fast-tape-rewind-cinematic-transition-1092.wav": ("rewind-tape", "whoosh", "fast tape rewind, for going back"),
    "08 Rewinding.wav": ("rewind", "whoosh", "rewind sound"),
    "15 Fast Forward.wav": ("fast-forward", "whoosh", "fast forward"),
    "Fast Forward Sound Effect(MP3_160K).mp3": ("fast-forward-2", "whoosh", "fast forward, cartoonish"),
    "06 Portal Hop.wav": ("portal", "whoosh", "sci-fi portal hop, teleport"),
    # risers and build-ups
    "BUILD-UP.mp3": ("riser-short", "riser", "short build-up (about 2 s) into a reveal"),
    "Ascending sound effect.mp3": ("riser-ascend", "riser", "ascending tone, things going up"),
    "woosh-building-109596.mp3": ("riser-whoosh", "riser", "building whoosh into a hit"),
    "Sudden suspense Sound effect.mp3": ("suspense-sting", "riser", "sudden suspense sting"),
    "01 Evolve_Brassy Swell.wav": ("swell-brass", "riser", "big brassy swell, trailer-style build"),
    "10 Evolve_Riser Robo Drums.wav": ("riser-drums", "riser", "robotic drum riser, long build (cut to 8 s)"),
    "mixkit-electricity-static-power-up-2600.wav": ("power-up", "riser", "electric power-up"),
    "06 Drum Roll.wav": ("drum-roll", "riser", "drum roll, before announcing a number"),
    # impacts and booms
    "boom sound effect.mp3": ("boom-short", "impact", "short boom, punchy"),
    "01 Boom.wav": ("boom", "impact", "deep boom with a tail"),
    "02 Deep.wav": ("boom-deep", "impact", "very deep sub boom"),
    "05 Impact.wav": ("impact", "impact", "cinematic impact"),
    "03 Grand Hit A.wav": ("hit-grand", "impact", "grand orchestral hit"),
    "04 Grand Hit B.wav.wav": ("hit-grand-2", "impact", "grand orchestral hit, second take"),
    "07 Subsonic A.wav": ("subsonic", "impact", "subsonic drop, felt more than heard"),
    "08 Subsonic B.wav.wav": ("subsonic-2", "impact", "subsonic drop"),
    "11 Universe Boom A.wav": ("boom-universe", "impact", "huge spacey boom, the biggest reveal"),
    "12 Universe Boom B.wav": ("boom-universe-2", "impact", "huge spacey boom"),
    "13 Metal Slam.wav": ("slam-metal", "impact", "metal slam, a door shutting"),
    "09 Struck Down.wav": ("struck-down", "impact", "heavy downward hit"),
    "11 Low Quick.wav": ("hit-low", "impact", "quick low hit"),
    "10 Dark Drop.wav": ("drop-dark", "impact", "dark drop, the bad news"),
    "Drop Disto Sub 1.wav": ("drop-sub", "impact", "distorted sub drop"),
    "onlymp3.to - bass drop sound effect-H9CWQaMYXiI-192k-1688370057.mp3": ("bass-drop", "impact", "bass drop"),
    "03 Evolve_Boom Brass D.wav": ("boom-brass", "impact", "brass boom"),
    "05 Evolve_Boom Shot.wav": ("boom-shot", "impact", "boom shot"),
    "06 Evolve_Boom Hint of Metal.wav": ("boom-metal", "impact", "boom with metallic ring"),
    "mixkit-big-cinematic-impact-788.mp3": ("impact-cinematic", "impact", "big cinematic impact"),
    "mixkit-space-impact-774.wav": ("impact-space", "impact", "spacey impact"),
    "mixkit-cinematic-glass-hit-suspense-677.wav": ("hit-glass-suspense", "impact", "glassy suspense hit"),
    "boom-geomorphism-cinematic-trailer-sound-effects-123876.mp3": ("boom-trailer", "impact", "trailer boom (cut to 8 s)"),
    "Heavy object Hit and body thud sound effect.mp3": ("thud-heavy", "impact", "heavy object landing"),
    "Hit 1.mp3": ("hit-swell", "impact", "swell into a hit"),
    "punch.mp3": ("punch", "impact", "punch"),
    "Cartoon Splat.wav": ("splat", "impact", "cartoon splat"),
    # clicks and UI
    "Mouse Click.mp3": ("click-mouse", "click", "single mouse click, short"),
    "mouse-click-153941.mp3": ("click-mouse-2", "click", "mouse click"),
    "Mouse click 2.mp3": ("click-mouse-3", "click", "mouse click"),
    "Click.wav": ("click", "click", "UI click"),
    "Click - Sound Effect (HD).mp3": ("click-2", "click", "click"),
    "click sound by 90 Creators.mp3": ("click-3", "click", "click"),
    "rm click (1).wav": ("click-soft", "click", "soft click"),
    "rm click (2).wav": ("click-soft-2", "click", "soft click"),
    "rm click (3).wav": ("click-soft-3", "click", "soft click"),
    "mixkit-hard-pop-click-2364.wav": ("click-hard", "click", "hard pop click"),
    "keyboard press.mp3": ("key-press", "click", "one keyboard key"),
    "futuristic metal keyboard .wav": ("key-futuristic", "click", "futuristic metal key press"),
    "Game Menu Select Sound Effect.mp3": ("menu-select", "click", "game menu select blip"),
    "mixkit-gun-click-1123.wav": ("click-mech", "click", "mechanical click (gun click)"),
    "mixkit-gun-metal-click-1121.wav": ("click-metal", "click", "metal click"),
    "13 Restart Switch.wav": ("switch", "click", "switch flipped"),
    "Message sound.mp3": ("message", "click", "message notification"),
    "Pop up Sound effect ( 256kbps cbr ).mp3": ("popup", "click", "pop-up notification"),
    "Mountain Audio - New Idea Notification.mp3": ("notify-idea", "click", "new-idea notification chime"),
    # pops
    "Pop 1.mp3": ("pop", "pop", "short pop, default for icons appearing"),
    "Pop.mp3": ("pop-2", "pop", "pop"),
    "Pop 9.mp3": ("pop-3", "pop", "pop"),
    "Pop Bubble Sound Effect.mp3": ("pop-bubble", "pop", "bubble pop"),
    "Pop sound effect.mp3": ("pop-4", "pop", "pop"),
    "Bloop Cartoon Sound Effect (MP3_160K) (1).mp3": ("bloop", "pop", "cartoon bloop"),
    "bottle cork.mp3": ("cork", "pop", "bottle cork pop"),
    # typing, writing, paper
    "keyboard-typing-5997.mp3": ("typing", "typing", "keyboard typing (cut to 8 s)"),
    "Writing on keyboard Sound Effect.mp3": ("typing-2", "typing", "keyboard typing (cut to 8 s)"),
    "Typewriter.mp3": ("typewriter", "typing", "typewriter"),
    "WRITING Sound Effect 2.mp3": ("writing", "typing", "pen writing"),
    "Writing Sound Effect 1.mp3": ("writing-2", "typing", "pen writing"),
    "smooth_pencil_sfx.MP3": ("pencil", "typing", "pencil stroke"),
    "Paper Flip Sound Effect.mp3": ("paper-flip", "typing", "paper flip, page turn"),
    "Paper Slide 03.wav": ("paper-slide", "typing", "paper sliding across a table"),
    "Paper Ripping.mp3": ("paper-rip", "typing", "paper ripping"),
    "crumpled paper sound fx.mp3": ("paper-crumple", "typing", "paper crumpled"),
    # tech, data, glitch
    "Glitch Sound Effect.mp3": ("glitch", "tech", "digital glitch"),
    "Sound Effect Glitch.mp3": ("glitch-2", "tech", "digital glitch"),
    "18 Termainal Glitch.wav": ("glitch-terminal", "tech", "terminal glitch"),
    "01 Processing.wav": ("processing", "tech", "computer processing"),
    "02 Dial-up.wav": ("dial-up", "tech", "dial-up modem"),
    "03 RF Switcher.wav": ("rf-switch", "tech", "radio switching"),
    "04 Erased Data.wav": ("data-erased", "tech", "data erased"),
    "05 Reboot Failure.wav": ("reboot-fail", "tech", "reboot failure"),
    "07 Line Break.wav": ("line-break", "tech", "signal line break"),
    "09 Data Transfer.wav": ("data-transfer", "tech", "data transfer chatter"),
    "10 Access Denied.wav": ("access-denied", "tech", "access denied"),
    "11 Access Granted.wav": ("access-granted", "tech", "access granted"),
    "12 Intermodulation.wav": ("intermod", "tech", "electronic intermodulation hum"),
    "14 Disc Read.wav": ("disc-read", "tech", "disc reading"),
    "16 Network Connect.wav": ("network-connect", "tech", "network connected"),
    "17 Disconnected.wav": ("disconnected", "tech", "disconnected"),
    "19 Download.wav": ("download", "tech", "download"),
    "UI Data Loading Sound Effect.mp3": ("loading", "tech", "UI data loading (cut to 8 s)"),
    "Hacking Sound Effect .MP3 (MOST VIEWED VIDEO).mp3": ("hacking", "tech", "hacking beeps (cut to 8 s)"),
    "Digital counting.mp3": ("counting-digital", "tech", "digital counter running"),
    "Display Digits 1.wav": ("digits", "tech", "digital display digits"),
    "Display Digits 2.wav": ("digits-2", "tech", "digital display digits"),
    "Display Digits 3.wav": ("digits-3", "tech", "digital display digits"),
    "Display Digits 4.wav": ("digits-4", "tech", "digital display digits"),
    "shot light energy.mp3": ("energy-shot", "tech", "light energy shot"),
    "censorship .mp3": ("censor", "tech", "censor beep"),
    "Censor beep sound effect.mp3": ("censor-2", "tech", "censor beep, short"),
    # money
    "Cash Register.mp3": ("cash-register", "money", "cash register"),
    "Cash Register (Kaching) - Sound Effect (HD).mp3": ("kaching", "money", "ka-ching"),
    "Cash Register sounds effects No Copyright free use.mp3": ("cash-register-2", "money", "cash register"),
    "cash-register-purchase-87313.mp3": ("purchase", "money", "purchase ka-ching"),
    "cash ting.mp3": ("cash-ting", "money", "short cash ting"),
    # right and wrong
    "Ding Sound Effect.mp3": ("ding", "result", "ding, a number landing"),
    "Ding.mp3": ("ding-short", "result", "short ding"),
    "correct sfx.mp3": ("correct", "result", "correct answer"),
    "quick-win.mp3": ("win", "result", "quick win jingle"),
    "good-idea.mp3": ("idea", "result", "good idea"),
    "Wrong Answer.mp3": ("wrong", "result", "wrong answer buzz"),
    "Wine Glass Shatter.mp3": ("shatter", "result", "glass shattering, a belief breaking"),
    "NO COPYRIGHT BOXING BELL SOUND EFFECT.mp3": ("bell-boxing", "result", "boxing bell"),
    "party horn.mp3": ("party-horn", "result", "party horn"),
    # time
    "Clock Ticking Sound Effect.mp3": ("clock", "time", "clock ticking (cut to 8 s)"),
    "Clock ticking fast.mp3": ("clock-fast", "time", "fast clock ticking (cut to 8 s)"),
    "Clock Tick.mp3": ("clock-2", "time", "clock ticking (cut to 8 s)"),
    "GEARS_TURNING_SOUND_EFFECT_FREE_FWOSt38lbFE_137.mp4": ("gears", "time", "gears turning (cut to 8 s)"),
    # camera
    "camera-shutter-6305.mp3": ("shutter", "camera", "camera shutter"),
    "camera-13695.mp3": ("shutter-2", "camera", "camera shutter"),
    "-camera-shutter.wav": ("shutter-3", "camera", "camera shutter"),
    "camera shutter 2.mp3": ("shutter-4", "camera", "camera shutter"),
    "camera-shutter-sound-effect.wav": ("shutter-5", "camera", "camera shutter"),
    "camera shot flash 2.wav": ("flash", "camera", "camera flash"),
    "camera shot flash 4.wav": ("flash-2", "camera", "camera flash"),
    "Shutter Click sound effect (no copyright ).mp3": ("shutter-6", "camera", "shutter click"),
    # people
    "crowd shocked.mp3": ("crowd-gasp", "people", "crowd gasps"),
    "awww.mp3": ("crowd-aww", "people", "crowd awww"),
    "kids yeyy.mp3": ("kids-yay", "people", "kids cheering"),
    "hmmm.mp3": ("hmm", "people", "thinking hmmm"),
    "Applause.wav": ("applause", "people", "applause (cut to 8 s)"),
    # ambience and misc
    "Spooky Wind.wav": ("wind-spooky", "misc", "spooky wind"),
    "01 Beating.wav": ("heartbeat", "misc", "heartbeat (cut to 8 s)"),
    "14 Incoming Crash.wav": ("incoming-crash", "misc", "incoming crash (cut to 8 s)"),
    "02 Evolve_Brassy Drop.2.wav": ("drop-brass", "misc", "brassy drop (cut to 8 s)"),
    "04 Evolve_Boom Feedback E.wav": ("boom-feedback", "misc", "boom with feedback"),
    "mixkit-cartoon-toy-whistle-616.wav": ("whistle", "misc", "cartoon toy whistle"),
    "mixkit-bike-wheel-spinning-1613.wav": ("wheel-spin", "misc", "wheel spinning (cut to 8 s)"),
    "projector-spinning-1444.wav": ("projector", "misc", "film projector running (cut to 8 s)"),
}
SKIPPED = {
    "brand or game sounds (copyright claims)": ["Animal Crossing Menu", "Apple Notification", "Iphone Receive/Send",
        "Discord_Join/Leave", "Mario Coin", "Windows XP Error", "Minecraft Hurt"],
    "Epidemic Sound (needs a subscription)": ["ES_Jump Swish", "ES_Riser Suction 5", "ES_Suction Pop 5"],
    "music tracks": ["Podcast Background Music", "mixkit music (21, driving-ambition, eyes-in-the-puddle, purple-js, trap, we-own-the-night, zay-zay)"],
    "compilations (many sounds in one file)": ["All type of sound in this video.mp4", "Cinematic Sounds", "Sci Fi UI Sounds",
        "SciFi Sound Effects", "Whoosh Sound Effects", "Swish Swoosh Cutscene", "Paper Sound Effects", "swipes", "Goofy 1, 2 and 3"],
    "unlabelled (can't tell what they are)": ["001-010.wav", "SOUND 1-10", "Racks", "Upset Pulses"],
    "off-tone for the channel": ["farts", "dog barking", "bone breaking", "person blows"],
}


def load(path):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                       capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.float32).reshape(-1, 2).copy()


def process(x):
    mono = np.abs(x).max(axis=1)
    peak = mono.max()
    if peak <= 0:
        raise ValueError("silent")
    hop = SR // 200
    n = len(mono) // hop
    fr = mono[: n * hop].reshape(n, hop).max(axis=1)
    on = np.nonzero(fr > peak * 0.05)[0]
    a = max(0, on[0] * hop - int(0.003 * SR)) if len(on) else 0
    loud = np.nonzero(fr > peak * 0.01)[0]
    b = min(len(x), (loud[-1] + 1) * hop + int(0.05 * SR)) if len(loud) else len(x)
    y = x[a:b]
    if len(y) > MAX_LEN * SR:
        y = y[: int(MAX_LEN * SR)].copy()
        f = int(0.6 * SR)
        y[-f:] *= np.linspace(1, 0, f)[:, None]
    # loudness: the loudest 300 ms window at -14 dBFS RMS, peaks capped at -1 dBFS
    w = int(0.3 * SR)
    sq = (y ** 2).mean(axis=1)
    c = np.convolve(sq, np.ones(min(w, len(sq))) / min(w, len(sq)), mode="valid")
    rms = np.sqrt(c.max()) + 1e-9
    g = min(10 ** (-14 / 20) / rms, 10 ** (-1 / 20) / (np.abs(y).max() + 1e-9))
    y = y * g
    # the "hit": where the energy peaks (a riser's top, a boom's thump), for <Sfx hit={t}>
    e = np.sqrt(np.convolve(sq * g * g, np.ones(SR // 50) / (SR // 50), mode="same"))
    hit = float(e.argmax() / SR)
    return y.astype(np.float32), round(len(y) / SR, 2), round(hit, 2)


def main(src):
    os.makedirs(OUT, exist_ok=True)
    cat = {}
    for f, (name, kind, desc) in MANIFEST.items():
        p = os.path.join(src, f)
        if not os.path.exists(p):
            print("missing:", f)
            continue
        y, dur, hit = process(load(p))
        r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                            "-b:a", "160k", os.path.join(OUT, f"{name}.mp3")], input=y.tobytes())
        if r.returncode:
            raise SystemExit(f"encode failed: {f}")
        cat[name] = {"kind": kind, "dur": dur, "hit": hit, "desc": desc}
    names = sorted(cat)
    ts = ("// Generated by kit/sfx_pack.py. Do not edit by hand.\n"
          f"export const PACK = {json.dumps(cat, indent=1)} as const;\n"
          "export type PackName = keyof typeof PACK;\n")
    open(os.path.join(ROOT, "studio", "src", "kit", "sfx_catalog.ts"), "w").write(ts)
    kinds = []
    for v in MANIFEST.values():
        if v[1] not in kinds:
            kinds.append(v[1])
    md = ["# Sound effects catalogue", "",
          "Generated by `kit/sfx_pack.py` from the owner's pack. Use any of these in a scene as",
          "`<Sfx name=\"pack/<name>\" at={t} />`, or `hit={t}` to line up the sound's loudest moment",
          "(a riser's top, a boom's thump) with time t. Every file starts on its sound (no silence) and",
          "has matched loudness, so volume 0.4 to 0.7 suits most. `dur` and `hit` are in seconds.",
          "Keep it tasteful: one sound per event, the big impacts at most twice a video.", ""]
    for k in kinds:
        md += [f"## {k}", "", "| name | dur | hit | what it is |", "|---|---|---|---|"]
        md += [f"| `pack/{n}` | {cat[n]['dur']} | {cat[n]['hit']} | {cat[n]['desc']} |" for n in names if cat[n]["kind"] == k]
        md.append("")
    md += ["## Left out of the pack", ""] + [f"- {k}: {', '.join(v)}" for k, v in SKIPPED.items()]
    open(os.path.join(ROOT, "docs", "SFX.md"), "w").write("\n".join(md) + "\n")
    print(f"{len(cat)} sounds -> {OUT}")


if __name__ == "__main__":
    main(sys.argv[1])
