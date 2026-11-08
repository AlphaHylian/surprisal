"""How one man measured the whole Earth with a stick. Long-form, 16:9, Manim.

Expands the 16 Oct Short (earth-stick). Chapters: the stick / why the angle works (+ the flat-Earth
catch) / the weak spots / a wrong number that changed history / Beta's other numbers / the Earth
defines the metre / do it yourself / your turn. Every number is computed in verify.py.
Angles on the Earth diagrams are drawn larger than 7.2 degrees so they can be seen (labelled).
"""
import json
import os

import numpy as np

from kit.brand import *
from kit.visuals import *

SAY = {b["id"]: b["say"] for b in json.load(open(os.path.join(EP, "script.json")))["beats"]}
SHOW_ANG = 16 * DEGREES      # drawn slice (the real one is 7.2 degrees)


def T(s, size=44, color=INK, bold=True):
    return Text(s, font=FONT_BOLD if bold else FONT_MED, color=color, font_size=size)


def big(s, color=AMBER, size=150):
    return Text(s, font=FONT_BOLD, color=color, font_size=size)


def labelled_icon(name, text, color=MINT, h=1.3, size=34):
    i = icon(name, color, h)
    return VGroup(i, T(text, size, INK, bold=False).next_to(i, DOWN, buff=0.25))


def row(*mobs, buff=0.6):
    return VGroup(*mobs).arrange(RIGHT, buff=buff)


def col(*mobs, buff=0.35):
    return VGroup(*mobs).arrange(DOWN, buff=buff)


class EarthCut:
    """The Earth cut through both cities: centre c, radius r. Syene at the top, Alexandria `ang` to the left."""

    def __init__(self, c=DOWN * 1.6, r=2.6, ang=SHOW_ANG):
        self.c, self.r, self.ang = np.array(c, dtype=float), r, ang
        self.disk = Circle(radius=r, stroke_color=MINT, stroke_width=4, fill_color=PANEL, fill_opacity=0.9).move_to(self.c)
        self.cen = Dot(self.c, radius=0.06, color=MUTED)

    def pt(self, a, k=1.0):
        """point at angle a from the top (positive = towards Alexandria, to the left), k radii out"""
        return self.c + k * self.r * np.array([-np.sin(a), np.cos(a), 0])

    def stick(self, a, h=0.7, color=INK):
        return Line(self.pt(a), self.pt(a, 1 + h / self.r), color=color, stroke_width=7)

    def city(self, a, name, side=RIGHT):
        d = Dot(self.pt(a), radius=0.09, color=AMBER)
        lab = T(name, 30, INK, False).next_to(self.pt(a, 1.05), side, buff=0.15)
        return VGroup(d, lab)

    def ray(self, a, length=3.0, color=AMBER):
        """a sun ray coming straight down (sun overhead at Syene), ending at the surface point at angle a"""
        end = self.pt(a)
        return Arrow(end + UP * length, end, buff=0, color=color, stroke_width=5, max_tip_length_to_length_ratio=0.08)


class Episode(SurprisalScene):
    _head = None

    def head(self, text, color=INK):
        new = headline(text, color, size=60)
        if self._head is None:
            self.play(FadeIn(new, shift=DOWN * 0.2), run_time=self.rt(0.5))
        else:
            self.play(FadeOut(self._head, shift=UP * 0.2), FadeIn(new, shift=UP * 0.2), run_time=self.rt(0.5))
        self._head = new

    def clear(self, keep_head=True, rt=0.4):
        mobs = [m for m in self.mobjects if not (keep_head and m is self._head)]
        if mobs:
            self.play(*[FadeOut(m) for m in mobs], run_time=self.rt(rt))
        if not keep_head:
            self._head = None

    def show(self, *mobs, rt=0.5, shift=UP * 0.25):
        self.play(*[FadeIn(m, shift=shift) for m in mobs], run_time=self.rt(rt))

    def to_word(self, word, nth=1, lead=0.3):
        """Wait until (roughly) the narrator reaches `word` in the current beat, by its position in the text."""
        if not self._beat:
            return
        bid, start, need = self._beat
        say = SAY[bid].lower()
        idx = -1
        for _ in range(nth):
            idx = say.find(word.lower(), idx + 1)
            if idx < 0:
                return
        target = start + (idx / max(1, len(say))) * (need - self.PAD) - lead
        if target > self.now + 0.05:
            self.wait(target - self.now)

    def chapter(self, title):
        self.clear(keep_head=False, rt=0.35)
        card = Text(title, font=FONT_DISPLAY, color=AMBER, font_size=96)
        fit(card, 12, 2)
        self.play(FadeIn(card, scale=1.1), run_time=self.rt(0.5))
        self.wait(self.rt(0.6, 0.2))
        new = headline(title, INK, size=60)
        self.play(ReplacementTransform(card, new), run_time=self.rt(0.5))
        self._head = new

    def drift(self, mob, rt=None, scale=1.03):
        """slow push-in so the frame keeps moving while the voice talks"""
        self.play(mob.animate.scale(scale), run_time=rt or max(0.3, self.left() - 0.1), rate_func=rate_functions.linear)

    def earth_scene(self, e, alex=True, rays=True, sticks=True):
        parts = VGroup(e.disk, e.cen, e.city(0, "Syene"))
        if alex:
            parts.add(e.city(e.ang, "Alexandria", LEFT))
        if sticks:
            parts.add(e.stick(e.ang))
        if rays:
            parts.add(e.ray(0), e.ray(e.ang))
        return parts

    # ------------------------------------------------------------ the episode
    def construct(self):
        # ======================= 1. the stick
        with self.beat("hook"):
            e = EarthCut(c=RIGHT * 3.6 + DOWN * 1.4, r=2.4)
            pic = self.earth_scene(e)
            card = VGroup(T("measure the", 54, INK), big("whole Earth", AMBER, 110), T("with a stick?", 54, INK)).arrange(DOWN, buff=0.25).move_to(LEFT * 3.0 + UP * 0.3)
            grp = VGroup(card, pic)
            self.open_with(grp)
            self.drift(grp, scale=1.02)

        with self.beat("promise"):
            self.play(FadeOut(grp), run_time=self.rt(0.4))
            items = VGroup(labelled_icon("ruler", "how he did it", MINT),
                           labelled_icon("triangle-alert", "where it\nwent wrong", CORAL),
                           labelled_icon("users", "do it yourself", AMBER)).arrange(RIGHT, buff=1.4)
            fit(items, 12.0, 4).move_to(UP * 0.2)
            self.show(items[0])
            self.to_word("went wrong")
            self.show(items[1])
            self.to_word("yourself")
            self.show(items[2])

        with self.beat("recap1"):
            self.clear()
            self.head("The problem")
            place = col(icon("landmark", MINT, 1.4), T("Alexandria, Egypt", 44), T("around 240 BC", 36, MUTED, False)).move_to(LEFT * 3.2 + UP * 0.1)
            self.show(place)
            self.to_word("how big")
            q = big("How big?", AMBER, 110).move_to(RIGHT * 3.0 + UP * 0.6)
            self.show(q)
            self.to_word("can't walk")
            nos = row(VGroup(icon("footprints", CORAL, 0.9), T("walk", 32, CORAL)).arrange(DOWN), VGroup(icon("plane", CORAL, 0.9), T("fly", 32, CORAL)).arrange(DOWN), buff=1.0).move_to(RIGHT * 3.0 + DOWN * 1.2)
            self.show(nos[0])
            self.to_word("fly")
            self.show(nos[1])

        with self.beat("recap2"):
            self.clear()
            self.head("Watch the sun")
            sun = icon("sun", AMBER, 1.2).move_to(UP * 2.2)
            well = VGroup(Rectangle(width=1.2, height=1.8, stroke_color=MUTED, stroke_width=4), Line(LEFT * 1.2, RIGHT * 1.2, color=MUTED, stroke_width=4).shift(UP * 0.9)).move_to(DOWN * 1.2)
            name = col(T("Syene", 46), T("today: Aswan", 32, MUTED, False)).next_to(well, LEFT, buff=1.0)
            self.show(name, well)
            self.to_word("longest day")
            self.show(sun)
            self.to_word("straight down")
            ray = Arrow(sun.get_bottom(), well.get_bottom() + UP * 0.1, buff=0.1, color=AMBER, stroke_width=6)
            self.play(GrowArrow(ray), run_time=self.rt(0.6))
            self.to_word("No shadow")
            self.show(chip("no shadow", AMBER).next_to(well, RIGHT, buff=0.8))

        with self.beat("recap3"):
            self.clear()
            self.head("Same noon, Alexandria")
            ground = Line(LEFT * 4, RIGHT * 4, color=MUTED, stroke_width=4).move_to(DOWN * 1.8)
            stick = Line(DOWN * 1.8, UP * 0.9, color=INK, stroke_width=9)
            self.show(ground, stick)
            self.to_word("shadow")
            a = 7.2 * DEGREES * 2.2   # drawn wider
            top = stick.get_end()
            ray = Line(top + 3.2 * np.array([-np.sin(a), np.cos(a), 0]), top, color=AMBER, stroke_width=5)
            shadow_end = DOWN * 1.8 + RIGHT * (2.7 * np.tan(a))
            ray2 = Line(top, shadow_end, color=AMBER, stroke_width=5, stroke_opacity=0.6)
            shadow = Line(DOWN * 1.8, shadow_end, color=CORAL, stroke_width=12)
            self.play(Create(ray), Create(ray2), run_time=self.rt(0.6))
            self.play(Create(shadow), run_time=self.rt(0.4))
            self.to_word("angle")
            arc = Arc(radius=1.0, start_angle=PI / 2, angle=a, arc_center=top, color=AMBER, stroke_width=5).rotate(PI, about_point=top)
            lab = big("7.2°", AMBER, 96).move_to(RIGHT * 4.0 + UP * 0.6)
            self.play(Create(arc), FadeIn(lab, scale=1.3), run_time=self.rt(0.5))

        with self.beat("recap4"):
            self.clear()
            self.head("The key step")
            eq = row(big("7.2°", AMBER, 120), T("=", 100, MUTED), big("1/50", MINT, 120), buff=0.5).move_to(UP * 0.9)
            self.show(eq[0])
            self.to_word("fiftieth")
            self.show(eq[1], eq[2])
            self.to_word("distance")
            ring = VGroup(*[AnnularSector(inner_radius=1.0, outer_radius=1.3, angle=TAU / 50 * 0.85, start_angle=TAU / 50 * k + PI / 2,
                                          fill_color=AMBER if k == 0 else DIM, fill_opacity=1, stroke_width=0) for k in range(50)]).move_to(DOWN * 1.35)
            self.play(LaggedStart(*[FadeIn(s) for s in ring], lag_ratio=0.02), run_time=self.rt(1.4))
            self.show(T("one slice of 50", 34, AMBER).next_to(ring, RIGHT, buff=0.6))

        with self.beat("recap5"):
            self.clear()
            self.head("Pace it")
            walk = labelled_icon("footprints", "Syene → Alexandria", MINT, 1.2)
            walk.move_to(LEFT * 3.5 + UP * 0.2)
            self.show(walk)
            self.to_word("5,000")
            d = big("5,000 stadia", INK, 90).move_to(RIGHT * 2.2 + UP * 0.9)
            self.show(d)
            self.to_word("Multiply")
            m = T("× 50", 80, MUTED).next_to(d, DOWN, buff=0.35)
            self.show(m)
            self.to_word("250,000")
            r = big("250,000 stadia", AMBER, 100).next_to(m, DOWN, buff=0.35)
            self.play(slam(r))

        with self.beat("recap6"):
            self.clear()
            self.head("Eratosthenes")
            lib = labelled_icon("library", "head of the Library\nof Alexandria", MINT, 1.6, 34).move_to(LEFT * 3.4 + UP * 0.2)
            self.show(lib)
            self.to_word("Beta")
            beta = col(big("β", AMBER, 200), T("“number two”", 40, MUTED, False)).move_to(RIGHT * 3.0 + UP * 0.4)
            self.show(beta)
            self.to_word("anyway")
            self.play(Indicate(beta[0], color=AMBER), run_time=self.rt(0.6))

        # ======================= 2. why the angle works
        with self.beat("why1"):
            self.chapter("Why the angle works")
            q = T("one shadow → the whole planet?", 48, INK).move_to(UP * 0.3)
            self.show(q)

        with self.beat("why2"):
            self.clear()
            e = EarthCut()
            self.e = e
            self.show(e.disk, e.cen, e.city(0, "Syene"), e.city(e.ang, "Alexandria", LEFT))
            self.to_word("straight down")
            r0 = e.ray(0, 2.0)
            self.play(GrowArrow(r0), run_time=self.rt(0.5))
            self.to_word("Extend")
            l0 = DashedLine(e.pt(0), e.c, color=AMBER, stroke_width=4)
            self.play(Create(l0), run_time=self.rt(0.6))
            self.show(T("(angles drawn bigger)", 26, MUTED, False).to_corner(DR, buff=0.4).shift(UP * 1.4))
            self.why = VGroup(r0, l0)

        with self.beat("why3"):
            e = self.e
            st = e.stick(e.ang, 0.9)
            self.play(Create(st), run_time=self.rt(0.5))
            self.to_word("centre")
            l1 = DashedLine(e.pt(e.ang), e.c, color=INK, stroke_width=4)
            self.play(Create(l1), run_time=self.rt(0.6))
            self.show(T("straight up = away from the centre", 34, MINT).move_to(RIGHT * 4.0 + UP * 1.2))
            self.why.add(st, l1)

        with self.beat("why4"):
            e = self.e
            self.to_word("parallel")
            r1 = e.ray(e.ang, 2.0)
            self.play(GrowArrow(r1), run_time=self.rt(0.5))
            self.show(chip("parallel", AMBER).move_to(LEFT * 4.6 + UP * 1.6))
            self.why.add(r1)

        with self.beat("why5"):
            e = self.e
            top = e.pt(e.ang, 1 + 0.9 / e.r)
            a_top = Arc(radius=0.55, start_angle=PI / 2 + e.ang, angle=-e.ang, arc_center=e.pt(e.ang), color=AMBER, stroke_width=6)
            a_cen = Arc(radius=0.7, start_angle=PI / 2, angle=e.ang, arc_center=e.c, color=AMBER, stroke_width=6)
            self.to_word("angle at the top")
            self.play(Create(a_top), run_time=self.rt(0.5))
            self.to_word("equals")
            self.play(Create(a_cen), run_time=self.rt(0.5))
            self.show(T("same angle", 40, AMBER).move_to(RIGHT * 4.0 + DOWN * 0.2))
            self.to_word("school")
            self.show(T("a line crossing two parallels", 30, MUTED, False).move_to(RIGHT * 4.0 + DOWN * 0.8))

        with self.beat("why6"):
            e = self.e
            sl = Sector(radius=e.r, start_angle=PI / 2, angle=e.ang, arc_center=e.c, fill_color=AMBER, fill_opacity=0.45, stroke_width=0)
            self.play(FadeIn(sl), run_time=self.rt(0.5))
            self.to_word("50")
            self.show(big("× 50", AMBER, 100).move_to(LEFT * 4.6 + DOWN * 0.6))

        with self.beat("why7"):
            self.clear()
            self.head("How parallel?")
            sun = row(icon("sun", AMBER, 1.0), T("150 million km", 44)).move_to(UP * 1.2)
            self.show(sun)
            self.to_word("800")
            cities = T("cities 800 km apart", 44, MINT).move_to(UP * 0.0)
            self.show(cities)
            self.to_word("differ")
            n = big("0.0003°", AMBER, 120).move_to(DOWN * 1.3)
            self.play(slam(n))

        with self.beat("why8"):
            self.clear()
            self.head("The first answer", AMBER)
            s = col(T("shadow angle = slice of the Earth", 50, INK), T("7.2° × 50 = the whole way round", 40, MINT))
            self.show(s)
            self.to_word("subscribe")
            self.show(T("new one twice a day", 34, MUTED, False).move_to(DOWN * 1.8))

        with self.beat("flat1"):
            self.clear()
            self.head("The catch", CORAL)
            two = row(Line(DOWN * 0.8, UP * 0.8, color=INK, stroke_width=8), Line(DOWN * 0.8, UP * 0.8, color=INK, stroke_width=8), buff=2.0).move_to(UP * 0.4)
            self.show(two)
            self.to_word("prove")
            self.play(slam(stamp("PROVES NOTHING", CORAL, size=54).move_to(DOWN * 1.3)))

        with self.beat("flat2"):
            self.clear()
            ground = Line(LEFT * 5.5, RIGHT * 5.5, color=MINT, stroke_width=5).move_to(DOWN * 2.0)
            sx = 3.0
            sun = icon("sun", AMBER, 0.9).move_to([sx, 2.1, 0])
            syene = VGroup(Dot([sx, -2.0, 0], color=AMBER), T("Syene", 28, INK, False).move_to([sx + 0.8, -2.35, 0]))
            self.show(ground, syene)
            self.to_word("close")
            self.show(sun, T("~6,300 km up", 32, AMBER).next_to(sun, LEFT, buff=0.3))
            self.to_word("no shadow")
            self.play(Create(Line(sun.get_bottom(), [sx, -2.0, 0], color=AMBER, stroke_width=4)), run_time=self.rt(0.4))
            self.to_word("Alexandria")
            ax = -2.4
            st = Line([ax, -2.0, 0], [ax, -0.9, 0], color=INK, stroke_width=8)
            alex = T("Alexandria, 800 km", 28, INK, False).move_to([ax, -2.35, 0])
            self.show(st, alex)
            self.play(Create(Line(sun.get_center(), [ax, -0.9, 0], color=AMBER, stroke_width=4)), run_time=self.rt(0.5))
            self.to_word("Exactly")
            self.show(chip("same 7.2°", AMBER).move_to(LEFT * 3.8 + UP * 1.4))

        with self.beat("flat3"):
            self.clear()
            self.head("Already known: a ball")
            moon = VGroup(Circle(radius=1.3, fill_color=INK, fill_opacity=0.85, stroke_width=0),
                          Circle(radius=1.6, fill_color=BG, fill_opacity=0.9, stroke_width=0).shift(LEFT * 1.6)).move_to(LEFT * 2.6 + DOWN * 0.1)
            self.show(T("5th century BC", 40, MUTED, False).move_to(RIGHT * 3.0 + UP * 1.2))
            self.to_word("shadow")
            self.show(moon, T("round shadow on the moon", 34, INK).move_to(RIGHT * 3.0 + DOWN * 0.1))
            self.to_word("measured")
            self.show(chip("so: measure it", MINT).move_to(RIGHT * 3.0 + DOWN * 1.4))

        with self.beat("flat4"):
            self.clear()
            self.head("A third stick")
            tbl = VGroup(
                row(T("5,000 km away", 40, MUTED, False), buff=0.4),
                row(T("ball:", 54, INK), big("45°", MINT, 100), buff=0.4),
                row(T("flat, close sun:", 54, INK), big("38°", CORAL, 100), buff=0.4)).arrange(DOWN, buff=0.4, aligned_edge=LEFT).move_to(UP * 0.1)
            self.show(tbl[0])
            self.to_word("45")
            self.show(tbl[1])
            self.to_word("38")
            self.show(tbl[2])
            self.to_word("farther")
            self.drift(tbl)

        # ======================= 3. the weak spots
        with self.beat("weak1"):
            self.chapter("The weak spots")
            three = row(labelled_icon("footprints", "the distance", CORAL), labelled_icon("map-pin", "the geography", CORAL), labelled_icon("ruler", "the stadion", CORAL), buff=1.5)
            fit(three, 11, 3).move_to(DOWN * 0.3)
            self.play(LaggedStart(*[FadeIn(m, shift=UP * 0.2) for m in three], lag_ratio=0.3), run_time=self.rt(1.2))

        with self.beat("weak2"):
            self.clear()
            n = big("5,000", INK, 160).move_to(UP * 0.6)
            self.show(n)
            self.to_word("round")
            self.play(n.animate.set_color(CORAL), run_time=self.rt(0.3))
            self.to_word("bematists")
            self.show(labelled_icon("footprints", "bematists: counted steps", MINT, 1.0).move_to(DOWN * 1.5))

        with self.beat("weak3"):
            self.clear()
            mp = VGroup(
                Dot([-0.6, 2.0, 0], color=AMBER), T("Alexandria", 30, INK, False).move_to([-2.2, 2.0, 0]),
                Dot([0.3, -1.6, 0], color=AMBER), T("Syene", 30, INK, False).move_to([1.4, -1.6, 0]),
                DashedLine([-5, -2.0, 0], [5, -2.0, 0], color=AMBER, stroke_width=3), T("sun overhead on the longest day", 26, AMBER, False).move_to([-2.8, -2.3, 0]))
            self.show(*mp[:4])
            self.to_word("little north")
            self.show(mp[4], mp[5])
            self.to_word("due south")
            self.play(Create(DashedLine([-0.6, 2.0, 0], [-0.6, -1.6, 0], color=MUTED)), run_time=self.rt(0.4))
            self.to_word("3 degrees east")
            self.show(chip("3° east", CORAL).move_to([3.5, 0.3, 0]))

        with self.beat("weak4"):
            self.clear()
            self.head("Modern maps")
            a = row(T("7.2°", 70, MUTED), T("→", 70, MUTED), big("7.1°", MINT, 110), buff=0.4).move_to(UP * 0.9)
            self.show(a)
            self.to_word("790")
            b = row(T("north-south:", 44, MUTED, False), big("790 km", MINT, 90), buff=0.4).move_to(DOWN * 0.4)
            self.show(b)
            self.to_word("cancel")
            self.show(chip("errors mostly cancel", AMBER).move_to(DOWN * 1.8))

        with self.beat("weak5"):
            self.clear()
            self.head("How long is a stadion?")
            bars = VGroup()
            for m, nm in ((160, "160 m"), (185, "185 m"), (210, "210 m")):
                bars.add(row(T(nm, 40, INK), Rectangle(width=m / 30, height=0.5, fill_color=MINT, fill_opacity=0.8, stroke_width=0), buff=0.4))
            bars.arrange(DOWN, buff=0.5, aligned_edge=LEFT).move_to(DOWN * 0.1)
            self.to_word("different")
            self.play(LaggedStart(*[FadeIn(b, shift=RIGHT * 0.3) for b in bars], lag_ratio=0.3), run_time=self.rt(1.2))

        with self.beat("weak6"):
            self.clear()
            self.head("250,000 stadia is…")
            rows = VGroup(
                row(T("160 m:", 48, INK), big("40,000 km", AMBER, 80), buff=0.5),
                row(T("real:", 48, INK), big("40,008 km", MINT, 80), buff=0.5),
                row(T("185 m:", 48, INK), big("46,250 km", CORAL, 80), T("+16%", 40, CORAL), buff=0.5),
                row(T("210 m:", 48, INK), big("52,500 km", CORAL, 80), buff=0.5)).arrange(DOWN, buff=0.3, aligned_edge=LEFT).move_to(DOWN * 0.3)
            fit(rows, 12, 5.2)
            self.show(rows[0])
            self.to_word("real")
            self.show(rows[1])
            self.to_word("185")
            self.show(rows[2])
            self.to_word("210")
            self.show(rows[3])

        with self.beat("weak7"):
            self.clear()
            v = col(T("method:", 44, MUTED, False), big("perfect", MINT, 110), T("number: nearly exact … almost a third too big", 40, CORAL)).move_to(UP * 0.1)
            self.show(v[0], v[1])
            self.to_word("number")
            self.show(v[2])

        with self.beat("weak8"):
            self.clear()
            self.head("2012: done again")
            n = big("40,074 km", AMBER, 130).move_to(UP * 0.5)
            self.show(n)
            self.to_word("66")
            self.show(T("66 km from the real thing", 44, MINT).move_to(DOWN * 1.1))

        # ======================= 4. a wrong number that changed history
        with self.beat("col1"):
            self.chapter("A wrong number that changed history")
            self.drift(self._head, scale=1.02)

        with self.beat("col2"):
            self.clear()
            self.head("Posidonius: use a star")
            hz = Line(LEFT * 5.5, RIGHT * 5.5, color=MUTED, stroke_width=3).move_to(DOWN * 1.6)
            rh = col(T("Rhodes", 40), T("Canopus on the horizon", 30, MUTED, False)).move_to(LEFT * 3.2 + DOWN * 0.3)
            star_r = icon("star", AMBER, 0.6).move_to(LEFT * 3.2 + DOWN * 1.45)
            self.show(hz, rh, star_r)
            self.to_word("rises")
            al = col(T("Alexandria", 40), T("7.5° up", 44, AMBER)).move_to(RIGHT * 3.2 + DOWN * 0.3)
            star_a = icon("star", AMBER, 0.6).move_to(RIGHT * 3.2 + UP * 1.5)
            self.show(al, star_a)

        with self.beat("col3"):
            self.clear()
            eq = col(row(big("7.5°", AMBER, 100), T("=", 80, MUTED), big("1/48", MINT, 100)), row(T("5,000 × 48 =", 60, INK), big("240,000", AMBER, 90), buff=0.4))
            self.show(eq[0])
            self.to_word("got")
            self.show(eq[1])

        with self.beat("col4"):
            self.clear()
            self.head("But across the sea…")
            a = row(T("5,000 stadia?", 56, MUTED), T("→", 56, MUTED), big("3,750", CORAL, 100), buff=0.4).move_to(UP * 0.7)
            self.show(a)
            self.to_word("48")
            b = row(T("× 48 =", 60, INK), big("180,000", CORAL, 110), buff=0.4).move_to(DOWN * 1.0)
            self.play(slam(b))

        with self.beat("col5"):
            self.clear()
            self.head("Ptolemy's maps")
            mp = labelled_icon("map", "copied for 1,000+ years", MINT, 1.6).move_to(LEFT * 3.0)
            self.show(mp)
            self.to_word("third too small")
            e1 = Circle(radius=1.6, stroke_color=MUTED, stroke_width=4).move_to(RIGHT * 3.2)
            e2 = Circle(radius=1.6 * 0.67, stroke_color=CORAL, stroke_width=5, fill_color=CORAL, fill_opacity=0.15).move_to(RIGHT * 3.2)
            self.show(e1, e2, T("a third too small", 34, CORAL).next_to(e1, DOWN, buff=0.2))

        with self.beat("col6"):
            self.clear()
            self.head("Columbus")
            ship = icon("sailboat", INK, 1.4).move_to(LEFT * 4.0)
            asia = T("Asia", 50, MUTED).move_to(RIGHT * 4.5)
            self.show(ship, asia)
            self.to_word("short sail")
            arr = Arrow(LEFT * 3.0, RIGHT * 3.6, color=CORAL, stroke_width=6)
            self.play(GrowArrow(arr), run_time=self.rt(0.6))
            self.to_word("continent")
            am = col(icon("map-pin", AMBER, 0.9), T("the Americas", 40, AMBER)).move_to(UP * 1.1)
            self.show(am)

        with self.beat("col7"):
            self.clear()
            v = col(T("same method", 50, MINT), T("one bad distance", 50, CORAL), big("planet −⅓", CORAL, 110)).move_to(DOWN * 0.1)
            self.show(v[0])
            self.to_word("bad")
            self.show(v[1])
            self.to_word("shrank")
            self.play(slam(v[2]))

        # ======================= 5. Beta's other numbers
        with self.beat("beta1"):
            self.chapter("Beta's other numbers")
            self.show(big("β", AMBER, 180).move_to(DOWN * 0.4))

        with self.beat("beta2"):
            self.clear()
            grid = VGroup(*[Line([x, -2.0, 0], [x, 2.2, 0], color=DIM, stroke_width=3) for x in np.linspace(-5, -0.6, 6)],
                          *[Line([-5, y, 0], [-0.6, y, 0], color=DIM, stroke_width=3) for y in np.linspace(-2.0, 2.2, 5)])
            dots = VGroup(*[Dot([x, y, 0], radius=0.06, color=AMBER) for x, y in np.random.default_rng(3).uniform([-4.8, -1.8], [-0.8, 2.0], (40, 2))])
            self.play(Create(grid), run_time=self.rt(0.8))
            self.to_word("400")
            self.play(LaggedStart(*[FadeIn(d, scale=2) for d in dots], lag_ratio=0.04), run_time=self.rt(1.2))
            self.show(T("400+ cities", 50, AMBER).move_to(RIGHT * 3.2 + UP * 0.8))
            self.to_word("geography")
            self.show(T("“geography”", 50, MINT).move_to(RIGHT * 3.2 + DOWN * 0.6))

        with self.beat("beta3"):
            self.clear()
            yrs = row(*[col(icon("calendar", MINT if i < 3 else AMBER, 1.0), T("365" if i < 3 else "366", 44, MINT if i < 3 else AMBER)) for i in range(4)], buff=0.8).move_to(UP * 0.4)
            self.play(LaggedStart(*[FadeIn(y, shift=UP * 0.2) for y in yrs], lag_ratio=0.25), run_time=self.rt(1.2))
            self.to_word("Julius")
            self.show(T("Caesar's calendar: same rule, two centuries later", 36, MUTED, False).move_to(DOWN * 1.6))

        with self.beat("beta4"):
            self.clear()
            self.head("The sieve")
            nums = VGroup(*[T(str(n), 40, INK) for n in range(2, 31)])
            cells = VGroup(*[VGroup(Square(0.85, stroke_color=DIM, stroke_width=2, fill_color=PANEL, fill_opacity=1), n) for n in nums])
            for c in cells:
                c[1].move_to(c[0])
            cells.arrange_in_grid(rows=3, cols=10, buff=0.08).move_to(DOWN * 0.4)
            self.to_word("Write")
            self.play(LaggedStart(*[FadeIn(c) for c in cells], lag_ratio=0.02), run_time=self.rt(0.8))
            for p, w in ((2, "2 after"), (3, "of 3"), (5, "of 5")):
                self.to_word(w)
                hits = [cells[n - 2] for n in range(2 * p, 31, p)]
                self.play(*[c[1].animate.set_color(DIM) for c in hits], *[c[0].animate.set_stroke(CORAL, 3) for c in hits], run_time=self.rt(0.4))
            self.to_word("10 primes")
            primes = [cells[n - 2] for n in (2, 3, 5, 7, 11, 13, 17, 19, 23, 29)]
            self.play(*[c[1].animate.set_color(AMBER) for c in primes], *[c[0].animate.set_stroke(AMBER, 4) for c in primes], run_time=self.rt(0.5))

        with self.beat("beta5"):
            self.play(self._head.animate.set_color(AMBER), run_time=self.rt(0.4))
            self.wait(self.rt(0.3))

        # ======================= 6. the Earth defines the metre
        with self.beat("metre1"):
            self.chapter("The Earth defines the metre")

        with self.beat("metre2"):
            self.clear()
            self.show(col(T("1790s France", 50, MUTED, False), T("a length that belongs to nobody", 50, INK)).move_to(UP * 0.4))
            self.to_word("Earth itself")
            self.show(icon("globe", MINT, 1.3).move_to(DOWN * 1.6))

        with self.beat("metre3"):
            self.clear()
            e = EarthCut(c=DOWN * 1.4 + LEFT * 2.5, r=2.4)
            q = Arc(radius=e.r, start_angle=0, angle=PI / 2, arc_center=e.c, color=AMBER, stroke_width=8)
            self.show(e.disk)
            self.to_word("Dunkirk")
            self.show(T("Delambre & Méchain:\nDunkirk → Barcelona", 34, INK).move_to(RIGHT * 3.4 + UP * 1.2))
            self.to_word("North Pole")
            self.play(Create(q), run_time=self.rt(0.8))
            self.show(T("pole → equator = 10,000,000 m", 36, AMBER).move_to(RIGHT * 3.4 + DOWN * 0.4))

        with self.beat("metre4"):
            self.clear()
            v = col(row(T("¼ way round:", 50, INK), big("10,000,000 m", MINT, 80), buff=0.4),
                    row(T("all the way:", 50, INK), big("40,000 km", AMBER, 100), buff=0.4)).move_to(UP * 0.2)
            self.show(v[0])
            self.to_word("whole way")
            self.show(v[1])
            self.to_word("definition")
            self.show(chip("by definition", AMBER).move_to(DOWN * 1.8))

        with self.beat("metre5"):
            self.clear()
            bar = Rectangle(width=8, height=0.4, fill_color=INK, fill_opacity=0.9, stroke_width=0).move_to(UP * 0.8)
            self.show(bar, T("first metre bar", 36, MUTED, False).next_to(bar, UP, buff=0.3))
            self.to_word("short")
            self.show(T("0.2 mm short", 50, CORAL).next_to(bar, DOWN, buff=0.4))
            self.to_word("40,008")
            self.play(slam(big("40,008", AMBER, 120).move_to(DOWN * 1.5)))

        with self.beat("metre6"):
            self.clear()
            v = row(col(T("Eratosthenes, short stadion", 34, MUTED, False), big("40,000", AMBER, 100)), T("=", 80, MUTED),
                    col(T("the metre's definition", 34, MUTED, False), big("40,000", MINT, 100)), buff=0.6).move_to(UP * 0.1)
            self.show(v[0])
            self.to_word("lining up")
            self.show(v[1], v[2])

        # ======================= 7. do it yourself
        with self.beat("diy1"):
            self.chapter("Do it yourself")
            self.show(row(VGroup(icon("ban", CORAL, 0.8), T("no well", 36, CORAL)).arrange(RIGHT), VGroup(icon("ban", CORAL, 0.8), T("any day", 36, MINT)).arrange(RIGHT), buff=1.4).move_to(DOWN * 0.6))

        with self.beat("diy2"):
            self.clear()
            a = col(icon("user", AMBER, 1.2), T("you", 36, AMBER)).move_to(UP * 1.0 + LEFT * 1.0)
            b = col(icon("user", MINT, 1.2), T("friend, south", 36, MINT)).move_to(DOWN * 1.2 + RIGHT * 1.0)
            self.show(a)
            self.to_word("two people")
            self.show(b, Arrow(a.get_bottom(), b.get_top(), color=MUTED, buff=0.2))
            self.to_word("same day")
            self.show(chip("same day, noon", AMBER).move_to(RIGHT * 4.2 + UP * 0.6))

        with self.beat("diy3"):
            self.clear()
            ground = Line(LEFT * 3.5, RIGHT * 4.5, color=MUTED, stroke_width=4).move_to(DOWN * 1.8)
            st = Line(DOWN * 1.8 + LEFT * 1.5, UP * 0.6 + LEFT * 1.5, color=INK, stroke_width=9)
            self.show(ground, st, T("1 m", 36, INK).next_to(st, LEFT, buff=0.2))
            self.to_word("shortest")
            sh = Line(DOWN * 1.8 + LEFT * 1.5, DOWN * 1.8 + RIGHT * 0.3, color=CORAL, stroke_width=12)
            self.play(Create(sh), run_time=self.rt(0.5))
            self.show(T("shadow", 36, CORAL).next_to(sh, DOWN, buff=0.2))
            self.to_word("ratio")
            self.show(T("angle from shadow ÷ stick", 40, AMBER).move_to(RIGHT * 3.2 + UP * 1.4))
            self.diy = VGroup(ground, st, sh)

        with self.beat("diy3b"):
            self.clear()
            v = col(row(T("stick 1 m, shadow 0.5 m", 44, INK)), big("26.6°", AMBER, 130), T("from straight up", 36, MUTED, False)).move_to(UP * 0.1)
            self.show(v[0])
            self.to_word("26.6")
            self.play(slam(v[1]))
            self.show(v[2])

        with self.beat("diy4"):
            self.clear()
            self.head("Equinox, 45° north")
            ground = Line(LEFT * 3, RIGHT * 3, color=MUTED, stroke_width=4).move_to(DOWN * 1.8)
            st = Line(DOWN * 1.8 + LEFT * 1.2, UP * 0.4 + LEFT * 1.2, color=INK, stroke_width=9)
            sh = Line(DOWN * 1.8 + LEFT * 1.2, DOWN * 1.8 + RIGHT * 1.0, color=AMBER, stroke_width=12)
            self.show(ground, st, T("1 m", 36).next_to(st, LEFT))
            self.to_word("shadow")
            self.play(Create(sh), run_time=self.rt(0.5))
            self.show(T("1 m", 36, AMBER).next_to(sh, DOWN))

        with self.beat("diy5"):
            self.clear()
            v = row(col(T("your angle", 36, MUTED, False), big("A", AMBER, 120)), T("−", 90, MUTED), col(T("friend's", 36, MUTED, False), big("B", MINT, 120)), T("=", 90, MUTED), col(T("your slice", 36, MUTED, False), big("A−B", AMBER, 120)), buff=0.5).move_to(UP * 0.1)
            self.show(v[0], v[1], v[2])
            self.to_word("difference")
            self.show(v[3], v[4])

        with self.beat("diy6"):
            self.clear()
            rows = col(row(T("1,000 km south →", 50, INK), big("9°", AMBER, 110), buff=0.4),
                       row(T("9° = 1/40 circle", 50, MINT), buff=0.4),
                       row(T("1,000 × 40 =", 50, INK), big("40,000 km", AMBER, 100), buff=0.4)).move_to(UP * 0.0)
            self.show(rows[0])
            self.to_word("fortieth")
            self.show(rows[1])
            self.to_word("times 40")
            self.show(rows[2])

        with self.beat("diy7"):
            self.clear()
            items = row(labelled_icon("school", "schools", MINT), labelled_icon("mail", "by email", MINT), labelled_icon("ruler", "a ruler", AMBER), buff=1.4).move_to(DOWN * 0.1)
            self.play(LaggedStart(*[FadeIn(m, shift=UP * 0.2) for m in items], lag_ratio=0.35), run_time=self.rt(1.5))

        # ======================= 8. your turn
        with self.beat("end1"):
            self.chapter("Your turn")
            steps = col(T("1. sun's rays arrive parallel", 40), T("2. a stick points from the centre", 40), T("3. shadow angle = slice of the planet", 40),
                        T("4. slice × distance → the whole Earth", 40, AMBER), buff=0.3).move_to(DOWN * 0.4)
            for i, w in enumerate(("parallel", "stick points", "slice", "multiply")):
                self.to_word(w)
                self.show(steps[i], rt=0.4)

        with self.beat("end2"):
            self.clear()
            v = row(labelled_icon("circle-dot", "a well", MINT), labelled_icon("minus", "a stick", MINT), labelled_icon("footprints", "a walker", MINT), buff=1.3).move_to(UP * 0.6)
            self.show(v)
            self.to_word("Columbus")
            self.show(T("…and a worse copy sent Columbus the wrong way", 36, CORAL).move_to(DOWN * 1.5))

        with self.beat("end3"):
            self.clear()
            self.head("Check this one", AMBER)
            q = col(T("same day, noon shadows", 44, MUTED, False), row(T("angles differ by", 56, INK), big("3.6°", AMBER, 110), buff=0.4), T("how far apart are you?", 56, INK)).move_to(DOWN * 0.2)
            self.show(q[0], q[1])
            self.to_word("How far")
            self.show(q[2])
            self.to_word("comments")
            self.show(chip("answer in the comments", MINT).move_to(DOWN * 2.0))


class Thumbnail(Scene):
    def construct(self):
        e = EarthCut(c=RIGHT * 3.9 + DOWN * 1.2, r=2.9, ang=18 * DEGREES)
        pic = VGroup(e.disk, e.stick(e.ang, 1.0, INK), e.ray(0, 2.5), e.ray(e.ang, 2.5),
                     Sector(radius=e.r, start_angle=PI / 2, angle=e.ang, arc_center=e.c, fill_color=AMBER, fill_opacity=0.5, stroke_width=0))
        top = Text("40,000 km", font=FONT_BOLD, color=AMBER, font_size=150).move_to(LEFT * 2.6 + UP * 1.0)
        sub = Text("with a stick", font=FONT_BOLD, color=INK, font_size=84).move_to(LEFT * 2.6 + DOWN * 0.9)
        self.add(pic, top, sub)
