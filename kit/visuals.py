"""Story visuals: icons, the viewer marker, stamps, terminals, letter tiles, chips.

    from kit.brand import *
    from kit.visuals import *

Everything here is a plain Manim Mobject in the brand palette, so it can be moved, scaled,
transformed and animated like anything else. Icons come from Lucide (ISC license, 2,100+ line
icons: https://lucide.dev/icons). Pick names from that site, e.g. "gavel", "user", "file-archive",
"dice-5", "plane", "landmark", "coins", "shield-alert", "radio-tower", "calendar".
"""
import hashlib
import os
import re

from manim import (Arc, Circle, CurvedArrow, DecimalNumber, Dot, FadeIn, Line, Rectangle,
                   RoundedRectangle, SVGMobject, Text, VGroup, DOWN, LEFT, RIGHT, UP, DEGREES,
                   rate_functions)

from kit.brand import AMBER, BG, CORAL, DIM, FONT_BOLD, FONT_MED, INK, MINT, MUTED, PANEL

FONT_MONO = "JetBrains Mono Bold"
ICON_DIR = os.path.join(os.environ.get("SURPRISAL_CACHE", os.path.expanduser("~/.surprisal_cache")), "icons")
_TMP = os.path.join(os.environ.get("SURPRISAL_CACHE", os.path.expanduser("~/.surprisal_cache")), "icons_tinted")


def icon(name, color=INK, height=1.2, stroke=None):
    """A Lucide line icon as a Manim mobject. stroke: line width (default scales with size)."""
    src = os.path.join(ICON_DIR, f"{name}.svg")
    if not os.path.exists(src):
        box = RoundedRectangle(corner_radius=0.15, width=height, height=height, stroke_color=color)
        return VGroup(box, Text("?", font=FONT_BOLD, color=color).scale_to_fit_height(height * 0.5))
    os.makedirs(_TMP, exist_ok=True)
    svg = open(src).read().replace("currentColor", "#FFFFFF")
    # Lucide draws dots as zero-length strokes ("M8 8h.01"), which Manim can't render: make them circles
    svg = re.sub(r'<path d="M([\d.]+) ([\d.]+)h\.01"\s*/>', r'<circle cx="\1" cy="\2" r="0.9" />', svg)
    key = hashlib.md5(svg.encode()).hexdigest()[:10]
    tinted = os.path.join(_TMP, f"{name}-{key}.svg")
    if not os.path.exists(tinted):
        open(tinted, "w").write(svg)
    m = SVGMobject(tinted, height=height)
    m.set_fill(opacity=0)
    m.set_stroke(color=color, width=stroke if stroke is not None else max(2.5, height * 5.5), opacity=1)
    return m


def you_tag(role=None, color=AMBER, height=1.4):
    """The viewer in the story: a person icon labelled YOU, with an optional role underneath
    ("programmer, 1988", "casino owner")."""
    person = icon("user", color, height)
    tag = Text("YOU", font=FONT_BOLD, color=BG, font_size=40)
    pill = RoundedRectangle(corner_radius=0.18, width=tag.width + 0.5, height=tag.height + 0.3,
                            fill_color=color, fill_opacity=1, stroke_width=0)
    tag.move_to(pill)
    badge = VGroup(pill, tag).next_to(person, DOWN, buff=0.2)
    g = VGroup(person, badge)
    if role:
        g.add(Text(role, font=FONT_MED, color=INK, font_size=34).next_to(badge, DOWN, buff=0.2))
    return g


def stamp(text, color=CORAL, angle=-10, size=64):
    """A rubber stamp ("SUED", "BANNED", "REJECTED"). Bring it in with slam(stamp)."""
    t = Text(text, font=FONT_BOLD, color=color, font_size=size)
    box = RoundedRectangle(corner_radius=0.12, width=t.width + 0.6, height=t.height + 0.45,
                           stroke_color=color, stroke_width=8, fill_opacity=0)
    box.move_to(t)
    return VGroup(box, t).rotate(angle * DEGREES)


def slam(mob, run_time=0.35):
    """Animation: mob drops onto the screen from larger, like a stamp or a verdict."""
    return FadeIn(mob, scale=1.8, run_time=run_time, rate_func=rate_functions.ease_out_back)


def year_stamp(text, color=INK, size=120):
    """A big year or date ("1988", "14 FEB 1989") in the monospace face."""
    return Text(text, font=FONT_MONO, color=color, font_size=size)


def chip(text, color=AMBER, text_color=BG, size=40):
    """A small filled label, e.g. a pointer note "back 13, copy 5" or a price."""
    t = Text(text, font=FONT_BOLD, color=text_color, font_size=size)
    pill = RoundedRectangle(corner_radius=min(0.25, (t.height + 0.3) / 2), width=t.width + 0.5,
                            height=t.height + 0.32, fill_color=color, fill_opacity=1, stroke_width=0)
    t.move_to(pill)
    return VGroup(pill, t)


def terminal(lines, width=7.8, title="", font_size=34, color=MINT):
    """A retro computer window. Returns a VGroup: [window, title bar, *line Texts].
    `.lines` holds the Text rows so you can type them on with AddTextLetterByLetter(term.lines[i])."""
    rows = [Text(l if l else " ", font=FONT_MONO, color=color, font_size=font_size) for l in lines]
    body = VGroup(*rows).arrange(DOWN, aligned_edge=LEFT, buff=0.22)
    h = body.height + 1.2
    win = RoundedRectangle(corner_radius=0.18, width=width, height=h, fill_color="#070C14",
                           fill_opacity=1, stroke_color=DIM, stroke_width=3)
    bar = Rectangle(width=width, height=0.45, fill_color=PANEL, fill_opacity=1, stroke_width=0)
    bar.align_to(win, UP)
    dots = VGroup(*[Dot(radius=0.07, color=c) for c in (CORAL, AMBER, MINT)]).arrange(RIGHT, buff=0.14)
    dots.move_to(bar).align_to(bar, LEFT).shift(RIGHT * 0.25)
    head = VGroup(bar, dots)
    if title:
        head.add(Text(title, font=FONT_MONO, color=MUTED, font_size=22).move_to(bar))
    body.next_to(bar, DOWN, buff=0.35).align_to(win, LEFT).shift(RIGHT * 0.35)
    g = VGroup(win, head, *rows)
    g.lines = rows
    return g


def tiles(text, size=0.78, per_row=None, color=INK, fill=PANEL):
    """Letters in boxes, for showing data byte by byte. Spaces get a faint dot.
    Returns a VGroup of tiles; each tile is VGroup(box, letter)."""
    out = []
    for ch in text:
        box = RoundedRectangle(corner_radius=0.08, width=size, height=size, fill_color=fill,
                               fill_opacity=1, stroke_color=DIM, stroke_width=2)
        if ch == " ":
            glyph = Dot(radius=size * 0.06, color=MUTED)
        else:
            glyph = Text(ch, font=FONT_MONO, color=color, font_size=int(size * 62))
        glyph.move_to(box)
        out.append(VGroup(box, glyph))
    g = VGroup(*out)
    if per_row:
        g.arrange_in_grid(cols=per_row, buff=0.08)
    else:
        g.arrange(RIGHT, buff=0.08)
    return g


def highlight(tile_group, color=AMBER):
    """Recolor a run of tiles (box outline + letter)."""
    for t in tile_group:
        t[0].set_stroke(color, width=4)
        t[1].set_color(color)
    return tile_group


def back_arrow(from_mob, to_mob, color=AMBER, angle=None):
    """A curved arrow over the top, from a later copy back to the earlier original."""
    a = from_mob.get_top() + UP * 0.12
    b = to_mob.get_top() + UP * 0.12
    return CurvedArrow(a, b, angle=angle if angle is not None else 1.1, color=color, stroke_width=6,
                       tip_length=0.25)


def size_bar(width=7.0, height=0.6, frac=1.0, color=MINT):
    """A file-size bar (full width = original size). Returns VGroup(frame, fill)."""
    frame = RoundedRectangle(corner_radius=0.1, width=width, height=height, stroke_color=MUTED,
                             stroke_width=2, fill_opacity=0)
    fill = RoundedRectangle(corner_radius=0.1, width=max(0.02, width * frac), height=height,
                            stroke_width=0, fill_color=color, fill_opacity=1)
    fill.align_to(frame, LEFT)
    return VGroup(frame, fill)


__all__ = ["FONT_MONO", "icon", "you_tag", "stamp", "slam", "year_stamp", "chip", "terminal", "tiles",
           "highlight", "back_arrow", "size_bar"]
