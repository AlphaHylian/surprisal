"""Surprisal brand + timing layer for Manim scenes.

An episode's scene.py does:

    from kit.brand import *

    class Episode(SurprisalScene):
        def construct(self):
            with self.beat("hook"):
                self.play(Write(title), run_time=self.rt(1.2))
            with self.beat("setup"):
                ...

Each `with self.beat(id)` block lasts at least as long as that beat's voiceover
(plus a small pad). If the animations inside run longer, the beat just runs long:
the start time of every beat is recorded, and the assembler places each voice clip
at its beat's real start, so sound and picture never drift apart.
"""
import json
import os
from contextlib import contextmanager

from manim import *  # noqa: F401,F403  (re-exported for scene files)
from manim import config, Scene, Text, MathTex, Tex, VGroup, RoundedRectangle, UP, DOWN, LEFT, RIGHT, ORIGIN

# ---------- palette ----------
BG = "#0E1726"      # deep navy background
INK = "#F2EFE6"     # off-white, main strokes and text
AMBER = "#FFB547"   # the surprising thing: answers, highlights, the key dot
MINT = "#4FD1C5"    # structure: axes, guides, secondary highlights
CORAL = "#FF6B6B"   # wrong intuitions, contradictions (use sparingly)
MUTED = "#8A97AB"   # labels, de-emphasised text
DIM = "#22324A"     # grids, faint backgrounds
PANEL = "#16223A"   # card fill

FONT_BOLD = "Space Grotesk Bold"
FONT_MED = "Space Grotesk Medium"
FONT_DISPLAY = "Fraunces SemiBold"

EP = os.environ.get("EPISODE_DIR", ".")
_script = json.load(open(os.path.join(EP, "script.json")))
FORMAT = _script.get("format", "short")

DRAFT = bool(os.environ.get("SURPRISAL_DRAFT"))
config.background_color = BG
config.frame_rate = 15 if DRAFT else (60 if FORMAT == "short" else 30)
if FORMAT == "short":
    config.pixel_width, config.pixel_height = (540, 960) if DRAFT else (1080, 1920)
    config.frame_height, config.frame_width = 16.0, 9.0
else:
    config.pixel_width, config.pixel_height = (960, 540) if DRAFT else (1920, 1080)
    config.frame_height, config.frame_width = 8.0, 8.0 * 16 / 9

Text.set_default(font=FONT_MED, color=INK)
MathTex.set_default(color=INK)
Tex.set_default(color=INK)

# ---------- layout zones (Manim units) ----------
# Shorts: 9 x 16 frame, origin at centre, y from +8 (top) to -8 (bottom).
# The bottom ~20% is covered by YouTube's title/buttons and the captions band sits just
# above it, so visuals live in the upper zone. The right edge below the middle has the
# like/comment buttons: keep important things off x > 3.2 when y < 0.
if FORMAT == "short":
    TITLE_Y = 6.4                 # top headline row (keep clear of y > 6.9: YouTube's top bar)
    VIS_CENTER = UP * 2.4         # centre of the main visual zone
    VIS_W, VIS_H = 8.0, 8.2       # usable size of the visual zone: y from about -1.7 to 6.5
    CAPTION_TOP_Y = -1.9          # captions are centred at y = -2.4; keep visuals above -1.8
else:
    TITLE_Y = 3.3
    VIS_CENTER = UP * 0.25
    VIS_W, VIS_H = 12.5, 5.6
    CAPTION_TOP_Y = -2.6


def fit(mob, w=None, h=None):
    """Scale mob down (never up) to fit inside w x h."""
    w = w or VIS_W
    h = h or VIS_H
    s = min(w / max(mob.width, 1e-6), h / max(mob.height, 1e-6), 1.0)
    return mob.scale(s)


def headline(text, color=INK, size=64):
    """Top-of-frame headline in the display serif."""
    t = Text(text, font=FONT_DISPLAY, color=color, font_size=size)
    fit(t, VIS_W, 1.6)
    return t.move_to(UP * TITLE_Y)


def label(text, color=MUTED, size=36, bold=False):
    return Text(text, font=FONT_BOLD if bold else FONT_MED, color=color, font_size=size)


def card(mob, pad=0.35, color=PANEL, stroke=DIM):
    box = RoundedRectangle(corner_radius=0.2, width=mob.width + 2 * pad, height=mob.height + 2 * pad,
                           fill_color=color, fill_opacity=1, stroke_color=stroke, stroke_width=2)
    box.move_to(mob)
    return VGroup(box, mob)


class SurprisalScene(Scene):
    PAD = 0.25  # seconds of breathing room after each voice clip

    def setup(self):
        dpath = os.path.join(EP, "build", "voice", "durations.json")
        self.durations = json.load(open(dpath)) if os.path.exists(dpath) else {}
        self.beat_starts = {}
        self.overruns = {}
        self._beat = None

    @property
    def now(self):
        return self.renderer.time

    @contextmanager
    def beat(self, bid):
        if bid not in self.durations:
            raise KeyError(f"beat '{bid}' has no voice clip; ids in script.json: {list(self.durations)}")
        start = self.now
        self.beat_starts[bid] = start
        self._beat = (bid, start, self.durations[bid] + self.PAD)
        yield
        elapsed = self.now - start
        need = self._beat[2]
        if elapsed < need - 1e-3:
            self.wait(need - elapsed)
        elif elapsed > need + 0.5:
            self.overruns[bid] = round(elapsed - need, 2)
        self._beat = None

    def left(self):
        """Seconds remaining in the current beat's voice clip."""
        if not self._beat:
            return 0
        bid, start, need = self._beat
        return max(0.0, need - (self.now - start))

    def rt(self, desired, share=1.0):
        """Run time for an animation: `desired`, but no more than `share` of what's left of the beat."""
        return max(0.2, min(desired, self.left() * share)) if self._beat else desired

    def tear_down(self):
        out = os.path.join(EP, "build")
        os.makedirs(out, exist_ok=True)
        json.dump({"beat_starts": self.beat_starts, "overruns": self.overruns, "total": self.now},
                  open(os.path.join(out, "timeline.json"), "w"), indent=1)
