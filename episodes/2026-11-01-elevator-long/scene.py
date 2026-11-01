"""Why your elevator comes the wrong way 9 times in 10. Long-form, 16:9, Manim.

Expands the 22 Oct Short (elevator-wrong-way). Chapters: the wrong way / where the car spends its
time (zigzag, gaps 18 vs 2, any floor) / two physicists (Gamow, Stern, Puzzle Math, Knuth) / add more
elevators (82, 76, 55, the 0.8 lean, the first instant) / the same trick elsewhere (bus 8.2, trains,
class sizes) / real buildings / your turn. Every number is computed in verify.py.
"""
import json
import os

from kit.brand import *
from kit.visuals import *

SAY = {b["id"]: b["say"] for b in json.load(open(os.path.join(EP, "script.json")))["beats"]}
STAGE_Y = 0.15


def T(s, size=44, color=INK, bold=True):
    return Text(s, font=FONT_BOLD if bold else FONT_MED, color=color, font_size=size)


def big(s, color=AMBER, size=150):
    return Text(s, font=FONT_BOLD, color=color, font_size=size)


def labelled_icon(name, text, color=MINT, h=1.3, size=34):
    i = icon(name, color, h)
    return VGroup(i, T(text, size, INK, bold=False).next_to(i, DOWN, buff=0.25))


# ------------------------------------------------------------ the building
FLOORS = 10


class Building(VGroup):
    """A shaft from the lobby (0) to floor `floors`, with a car. y of floor f: floor_y(f)."""

    def __init__(self, x=0.0, bottom=-2.2, height=5.0, floors=FLOORS, you=1, labels=(0, 1, 5, 10), you_color=AMBER, car_floor=6):
        super().__init__()
        self.bx, self.bottom, self.bh, self.floors = x, bottom, height, floors
        shaft = Rectangle(width=1.3, height=height, stroke_color=MUTED, stroke_width=3, fill_color=PANEL, fill_opacity=0.8).move_to([x, bottom + height / 2, 0])
        lines = VGroup(*[Line([x - 0.65, self.fy(f), 0], [x + 0.65, self.fy(f), 0], color=DIM, stroke_width=2) for f in range(floors + 1)])
        labs = VGroup(*[T("L" if f == 0 else str(f), 24, MUTED, False).move_to([x + 1.0, self.fy(f) + self.step / 2, 0]) for f in labels])
        self.car = RoundedRectangle(corner_radius=0.06, width=1.0, height=self.step * 0.85, fill_color=INK, fill_opacity=1, stroke_width=0)
        self.car.move_to(self.car_pos(car_floor))
        self.add(shaft, lines, labs, self.car)
        if you is not None:
            self.you = VGroup(Dot(radius=0.12, color=you_color), T("you", 28, you_color)).arrange(LEFT, buff=0.15)
            self.you.move_to([x - 1.25, self.fy(you) + self.step / 2, 0])
            self.add(self.you)

    @property
    def step(self):
        return self.bh / (self.floors + 1)

    def fy(self, f):
        return self.bottom + f * self.step

    def car_pos(self, f):
        return [self.bx, self.fy(f) + self.step / 2, 0]


def tri(t, H=FLOORS):
    """height of a never-resting car at time t (one floor per time unit), lobby at t=0"""
    p = t % (2 * H)
    return p if p <= H else 2 * H - p


def zigzag_axes(width=11.5, height=4.2, center=DOWN * 0.3, t_max=40):
    ax = Axes(x_range=[0, t_max, 10], y_range=[0, FLOORS, 5], x_length=width, y_length=height,
              axis_config={"color": MUTED, "stroke_width": 2, "include_ticks": False}, tips=False).move_to(center)
    xl = T("time", 28, MUTED, False).next_to(ax.x_axis, DOWN, buff=0.15).align_to(ax.x_axis, RIGHT)
    yl = T("floor", 28, MUTED, False).next_to(ax.y_axis, UP, buff=0.1).align_to(ax.y_axis, LEFT)
    ticks = VGroup(*[T(s, 24, MUTED, False).next_to(ax.c2p(0, v), LEFT, buff=0.15) for v, s in ((0, "L"), (10, "10"))])
    return ax, VGroup(ax, xl, yl, ticks)


def zig_parts(ax, floor=1, t_max=40, H=FLOORS):
    """the zigzag split into the bits below `floor` (mint) and above it (coral)"""
    below, above = VGroup(), VGroup()
    cuts = sorted({0, t_max} | {c for k in range(0, t_max // (2 * H) + 2) for c in (2 * H * k + floor, 2 * H * k + 2 * H - floor) if 0 < c < t_max})
    for a, b in zip(cuts, cuts[1:]):
        mid = (a + b) / 2
        seg = ax.plot(lambda t: tri(t, H), x_range=[a, b, 0.25], color=MINT if tri(mid, H) < floor else CORAL, stroke_width=6)
        (below if tri(mid, H) < floor else above).add(seg)
    return below, above


def gap_strip(gaps, unit=0.28, y=0.0, h=0.7, colors=None, labels=True, label_size=30):
    """a timeline of gaps; each gap a box `unit` wide per floor of travel"""
    g = VGroup()
    for i, (n, kind) in enumerate(gaps):
        col = (colors or {}).get(kind, CORAL if kind == "down" else MINT)
        box = Rectangle(width=n * unit, height=h, fill_color=col, fill_opacity=0.85, stroke_color=BG, stroke_width=4)
        g.add(box)
    g.arrange(RIGHT, buff=0).move_to([0, y, 0])
    labs = VGroup()
    if labels:
        for box, (n, kind) in zip(g, gaps):
            if n >= 6:
                labs.add(T(f"{n}", label_size, BG).move_to(box))
    return g, labs


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

    def ride(self, b, f, rt=1.0):
        self.play(b.car.animate.move_to(b.car_pos(f)), run_time=self.rt(rt), rate_func=rate_functions.linear)

    def arrival(self, b, down=True, x=None):
        a = icon("arrow-down" if down else "arrow-up", CORAL if down else MINT, 0.9)
        a.next_to(b.you, LEFT, buff=0.25)
        return a

    # ------------------------------------------------------------ the episode
    def construct(self):
        # ======================= 1. the wrong way
        with self.beat("hook"):
            b = Building(x=4.2, bottom=-2.4, height=5.6, car_floor=7)
            card = VGroup(big("9 in 10", AMBER, 140), T("the wrong way", 64, CORAL)).arrange(DOWN, buff=0.3).move_to(LEFT * 2.2 + UP * 0.3)
            down = icon("arrow-down", CORAL, 1.4).next_to(b, LEFT, buff=0.3).shift(UP * 1.2)
            grp = VGroup(card, b, down)
            self.open_with(grp)
            self.to_word("9")
            self.play(Indicate(card[0], color=AMBER, scale_factor=1.08), run_time=self.rt(0.5))

        with self.beat("promise"):
            self.play(FadeOut(grp), run_time=self.rt(0.4))
            items = VGroup(labelled_icon("arrow-down", "exactly why", CORAL),
                           labelled_icon("building-2", "why a 2nd elevator\nbarely helps", AMBER),
                           labelled_icon("bus", "why your bus\nis late", MINT)).arrange(RIGHT, buff=1.2)
            fit(items, 12.0, 4)
            items.move_to(UP * STAGE_Y)
            self.show(items[0])
            self.to_word("second elevator")
            self.show(items[1])
            self.to_word("bus")
            self.show(items[2])

        with self.beat("recap1"):
            self.clear()
            b = Building(x=0, bottom=-2.4, height=5.6, you=1, car_floor=0)
            self.show(VGroup(*[m for m in b if m is not b.car and m is not b.you]))
            self.add(b.car)
            self.to_word("floor 1")
            self.show(b.you)
            self.to_word("press")
            btn = VGroup(Circle(radius=0.32, color=MINT, stroke_width=5), icon("arrow-up", MINT, 0.4)).next_to(b.you, LEFT, buff=0.4)
            self.play(FadeIn(btn, scale=1.4), run_time=self.rt(0.4))
            self.stage = (b, btn)

        with self.beat("recap2"):
            b, btn = self.stage
            self.ride(b, 6, rt=0.2)
            self.ride(b, 1, rt=1.0)
            a = self.arrival(b, True)
            self.play(FadeOut(btn), FadeIn(a, scale=1.4), run_time=self.rt(0.4))
            self.to_word("tally")
            tally = VGroup(*[icon("arrow-down" if i != 4 else "arrow-up", CORAL if i != 4 else MINT, 0.55) for i in range(10)]).arrange(RIGHT, buff=0.15)
            tally.move_to(RIGHT * 4.0 + UP * 1.2)
            self.play(LaggedStart(*[FadeIn(m, shift=DOWN * 0.2) for m in tally], lag_ratio=0.15), run_time=self.rt(1.6))
            self.to_word("9 times")
            self.show(T("9 of 10: down", 48, CORAL).next_to(tally, DOWN, buff=0.4))

        with self.beat("recap3"):
            self.clear()
            q = T("Is the building against you?", 56, INK).move_to(UP * 1.6)
            self.show(q)
            self.to_word("It isn't")
            self.play(q.animate.set_color(MUTED).scale(0.8), run_time=self.rt(0.3))
            self.to_word("Count")
            cnt = VGroup(VGroup(icon("arrow-up", MINT, 1.2), big("50", MINT, 110)).arrange(RIGHT, buff=0.3),
                         T("=", 90, MUTED),
                         VGroup(icon("arrow-down", CORAL, 1.2), big("50", CORAL, 110)).arrange(RIGHT, buff=0.3)).arrange(RIGHT, buff=0.8).move_to(DOWN * 0.6)
            self.show(cnt)
            self.show(T("cars passing your floor in a day", 32, MUTED, False).next_to(cnt, DOWN, buff=0.35))

        with self.beat("recap4"):
            self.clear()
            left = VGroup(T("pass you", 40, MUTED, False), T("up = down", 64, MINT)).arrange(DOWN, buff=0.3).move_to(LEFT * 3.4 + UP * 0.4)
            right = VGroup(T("first car you meet", 40, MUTED, False), T("down, 9 in 10", 64, CORAL)).arrange(DOWN, buff=0.3).move_to(RIGHT * 3.4 + UP * 0.4)
            self.show(left)
            self.to_word("And yet")
            self.show(right)
            self.to_word("Both")
            self.show(chip("both true", AMBER).move_to(DOWN * 1.6))

        # ======================= 2. where the car spends its time
        with self.beat("time1"):
            self.chapter("Where the car spends its time")
            b = Building(x=0, bottom=-2.4, height=5.2, you=None, car_floor=0)
            self.show(b)
            self.to_word("rides")
            self.ride(b, 10, rt=1.2)
            self.ride(b, 0, rt=1.2)
            self.ride(b, 6, rt=self.left() * 0.8)
            self.stage = b

        with self.beat("time2"):
            b = self.stage
            self.play(b.animate.scale(0.75).move_to([-5.6, -0.1, 0]), run_time=self.rt(0.5))
            ax, axg = zigzag_axes(width=9.4, height=4.0, center=RIGHT * 1.3 + DOWN * 0.3)
            self.play(Create(axg), run_time=self.rt(0.5))
            self.to_word("Up to")
            curve = ax.plot(lambda t: tri(t), x_range=[0, 40, 0.25], color=INK, stroke_width=6)
            self.play(Create(curve), run_time=self.rt(2.2), rate_func=rate_functions.linear)
            self.to_word("zigzag")
            self.show(T("a zigzag", 36, MUTED, False).move_to(ax.c2p(30, 9.3)))
            self.stage = (b, ax, axg, curve)

        with self.beat("time3"):
            b, ax, axg, curve = self.stage
            you_line = DashedLine(ax.c2p(0, 1), ax.c2p(40, 1), color=AMBER, stroke_width=5)
            self.play(Create(you_line), run_time=self.rt(0.7))
            lab = T("your floor (1)", 30, AMBER).next_to(ax.c2p(40, 1), UP, buff=0.12).align_to(ax.c2p(40, 1), RIGHT)
            self.show(lab)
            self.stage = (b, ax, axg, curve, you_line, lab)

        with self.beat("time4"):
            b, ax, axg, curve, you_line, lab = self.stage
            below, above = zig_parts(ax)
            self.to_word("above your line")
            self.play(FadeOut(curve), FadeIn(below), FadeIn(above), run_time=self.rt(0.7))
            self.to_word("9 are above")
            self.play(Indicate(above, color=CORAL, scale_factor=1.02), run_time=self.rt(0.6))
            self.to_word("9 tenths")
            self.show(chip("above you 9/10 of the time", CORAL, BG, 36).move_to(ax.c2p(20, 11.2)))
            self.stage = (b, ax, axg, below, above, you_line, lab)

        with self.beat("time5"):
            b, ax, axg, below, above, you_line, lab = self.stage
            self.to_word("press")
            ts = [7.0, 23.5, 14.0, 33.0, 0.5, 27.0, 11.0, 36.5, 19.6, 4.0]
            marks = VGroup()
            for tt in ts:
                h = tri(tt)
                col = CORAL if h > 1 else MINT
                marks.add(VGroup(DashedLine(ax.c2p(tt, 0), ax.c2p(tt, h), color=col, stroke_width=3), Dot(ax.c2p(tt, h), radius=0.1, color=col)))
            self.play(LaggedStart(*[FadeIn(m, scale=1.5) for m in marks], lag_ratio=0.25), run_time=self.rt(2.6))
            self.to_word("9 times")
            self.show(T("9 of 10 presses: car above you", 34, CORAL).move_to(ax.c2p(20, -1.6)))

        with self.beat("time6"):
            self.clear()
            b = Building(x=-3.0, bottom=-2.4, height=5.2, you=1, car_floor=7)
            self.show(b)
            self.to_word("on its way down")
            self.ride(b, 1, rt=1.0)
            self.play(FadeIn(self.arrival(b, True), scale=1.4), run_time=self.rt(0.3))
            self.to_word("not about")
            r1 = T("not where it goes", 48, MUTED).move_to(RIGHT * 3.0 + UP * 0.8)
            self.show(r1)
            self.to_word("where it is")
            r2 = T("where it is when you arrive", 48, AMBER).move_to(RIGHT * 3.0 + DOWN * 0.4)
            self.show(r2)

        with self.beat("time6b"):
            self.clear()
            no = VGroup(*[VGroup(labelled_icon(n, s, MUTED, 1.2, 32)) for n, s in (("cpu", "a program"), ("clock", "a schedule"), ("circle-help", "where it's headed"))]).arrange(RIGHT, buff=1.4).move_to(UP * 0.6)
            self.show(no)
            crosses = VGroup(*[Cross(m[0][0], stroke_color=CORAL, stroke_width=6) for m in no])
            self.play(Create(crosses), run_time=self.rt(0.5))
            self.to_word("9 tenths")
            self.show(T("just: 9/10 of its time above you", 46, AMBER).move_to(DOWN * 1.6))

        with self.beat("time7"):
            self.clear()
            b = Building(x=-5.2, bottom=-2.4, height=5.2, you=1, car_floor=1)
            self.show(b)
            g, labs = gap_strip([(18, "down"), (2, "up")], unit=0.42, y=0.4, h=0.8)
            g.shift(RIGHT * 1.6)
            self.to_word("climbs")
            self.ride(b, 10, rt=1.2)
            self.to_word("comes back")
            self.ride(b, 1, rt=1.2)
            self.to_word("long gap")
            self.play(GrowFromEdge(g[0], LEFT), run_time=self.rt(0.6))
            self.show(labs[0])
            self.to_word("18")
            self.show(T("18 floors, ends with a down car", 32, CORAL).next_to(g[0], UP, buff=0.3))
            self.stage = (b, g, labs)

        with self.beat("time8"):
            b, g, labs = self.stage
            self.to_word("drops")
            self.ride(b, 0, rt=0.5)
            self.ride(b, 1, rt=0.5)
            self.play(GrowFromEdge(g[1], LEFT), run_time=self.rt(0.4))
            self.to_word("short gap")
            self.show(T("2", 34, MINT).next_to(g[1], DOWN, buff=0.25), T("ends with an up car", 30, MINT).next_to(g[1], DOWN, buff=0.75).shift(LEFT * 1.0))

        with self.beat("time9"):
            self.clear()
            gaps = [(18, "down"), (2, "up")] * 3
            g, labs = gap_strip(gaps, unit=0.2, y=0.3, h=0.8)
            arrows = VGroup(*[icon("arrow-down" if k == "down" else "arrow-up", CORAL if k == "down" else MINT, 0.5).next_to(box, UP, buff=0.15).align_to(box, RIGHT)
                              for box, (n, k) in zip(g, gaps)])
            self.play(LaggedStart(*[GrowFromEdge(x, LEFT) for x in g], lag_ratio=0.5), run_time=self.rt(1.6))
            self.to_word("Up, down")
            self.play(LaggedStart(*[FadeIn(a, shift=DOWN * 0.2) for a in arrows], lag_ratio=0.2), run_time=self.rt(1.2))
            self.to_word("Equal")
            self.show(T("3 up, 3 down", 36, INK).move_to(UP * 1.9))
            self.to_word("9 times")
            self.show(T("down gaps 9× as long", 44, CORAL).move_to(DOWN * 1.3))
            self.stage = (g, labs, arrows)

        with self.beat("time10"):
            g, labs, arrows = self.stage
            import random as _r
            rng = _r.Random(5)
            xs = [rng.uniform(g.get_left()[0] + 0.05, g.get_right()[0] - 0.05) for _ in range(20)]
            dots = VGroup(*[Dot([x, 0.3, 0], radius=0.09, color=INK) for x in xs])
            self.play(LaggedStart(*[FadeIn(d, scale=2) for d in dots], lag_ratio=0.1), run_time=self.rt(1.6))
            self.to_word("18 out of")
            self.show(T("18 of every 20 moments: inside a long gap", 38, CORAL).move_to(DOWN * 2.1))
            self.to_word("Wrong way")
            self.play(slam(stamp("WRONG WAY", CORAL, -8, 60).move_to(UP * 1.9 + RIGHT * 3.6)))

        with self.beat("time10b"):
            self.clear()
            sw = icon("timer", AMBER, 1.4).move_to(LEFT * 5.0 + UP * 0.4)
            self.show(sw)
            self.to_word("up car passes")
            r1 = VGroup(icon("arrow-up", MINT, 0.7), T("passes →", 36, MUTED, False), T("down car in 18", 44, CORAL)).arrange(RIGHT, buff=0.3).move_to(RIGHT * 1.0 + UP * 0.9)
            self.show(r1)
            self.to_word("After a down")
            r2 = VGroup(icon("arrow-down", CORAL, 0.7), T("passes →", 36, MUTED, False), T("up car in 2", 44, MINT)).arrange(RIGHT, buff=0.3).move_to(RIGHT * 1.0 + DOWN * 0.6)
            self.show(r2)

        with self.beat("time11"):
            self.clear()
            rows = VGroup()
            for f in (1, 5, 8):
                pdn = (10 - f) / 10
                bar_d = Rectangle(width=8 * pdn + 0.001, height=0.55, fill_color=CORAL, fill_opacity=0.9, stroke_width=0)
                bar_u = Rectangle(width=8 * (1 - pdn) + 0.001, height=0.55, fill_color=MINT, fill_opacity=0.9, stroke_width=0)
                bars = VGroup(bar_d, bar_u).arrange(RIGHT, buff=0)
                rows.add(VGroup(T(f"floor {f}", 38, INK), bars, T(f"down {int(pdn*10)} in 10", 32, MUTED, False)).arrange(RIGHT, buff=0.4))
            rows.arrange(DOWN, buff=0.55, aligned_edge=LEFT).move_to(DOWN * 0.1)
            fit(rows, 12.6, 4.4)
            self.show(T("chance of a down car = share of the building above you", 34, AMBER).move_to(UP * 2.3))
            self.show(rows[0])
            self.to_word("Floor 5")
            self.show(rows[1])
            self.to_word("Floor 8")
            self.show(rows[2])

        with self.beat("time12"):
            self.clear()
            b = Building(x=0, bottom=-2.4, height=5.2, you=5, labels=(0, 5, 10), car_floor=8)
            self.show(b)
            self.show(chip("fair", MINT).next_to(b.you, LEFT, buff=0.3))
            self.to_word("Every other")
            self.play(Rotate(b, angle=-6 * DEGREES), run_time=self.rt(0.8))

        with self.beat("sub"):
            self.clear()
            self.show(T("first answer: where the car spends its time", 44, AMBER).move_to(UP * 0.9))
            self.to_word("subscribe")
            self.show(T("new one twice a day", 40, MUTED, False).move_to(DOWN * 0.5))

        # ======================= 3. two physicists
        with self.beat("hist1"):
            self.chapter("Two physicists and a puzzle")
            b = Building(x=0, bottom=-2.3, height=4.6, floors=6, you=None, labels=(), car_floor=3)
            g1 = T("George Gamow", 40, INK).move_to(LEFT * 4.2 + UP * 0.4)
            s1 = T("Marvin Stern", 40, INK).move_to(RIGHT * 4.2 + UP * 0.4)
            self.show(g1)
            self.to_word("Stern")
            self.show(s1)
            self.to_word("seven-storey")
            self.show(b, T("7 storeys", 32, MUTED, False).next_to(b, UP, buff=0.2))
            self.stage = (b, g1, s1)

        with self.beat("hist2"):
            b, g1, s1 = self.stage
            gm = VGroup(Dot(radius=0.12, color=AMBER), T("Gamow, 2nd floor", 30, AMBER)).arrange(LEFT, buff=0.15).next_to([b.bx - 0.65, b.fy(1) + b.step / 2, 0], LEFT, buff=0.3)
            self.play(FadeOut(g1), FadeIn(gm), run_time=self.rt(0.4))
            self.to_word("first elevator")
            self.ride(b, 1, rt=0.9)
            dn = icon("arrow-down", CORAL, 0.7).next_to(gm, UP, buff=0.2)
            self.show(dn)
            self.to_word("5 times")
            self.show(T("down, 5 in 6", 40, CORAL).move_to(LEFT * 4.6 + UP * 1.2))
            self.stage = (b, gm, s1)

        with self.beat("hist3"):
            b, gm, s1 = self.stage
            sm = VGroup(T("Stern, 6th floor", 30, MINT), Dot(radius=0.12, color=MINT)).arrange(RIGHT, buff=0.15).next_to([b.bx + 0.65, b.fy(5) + b.step / 2, 0], RIGHT, buff=0.3)
            self.play(FadeOut(s1), FadeIn(sm), run_time=self.rt(0.4))
            self.to_word("first elevator")
            self.ride(b, 5, rt=0.9)
            up = icon("arrow-up", MINT, 0.7).next_to(sm, UP, buff=0.2)
            self.show(up)
            self.to_word("5 times")
            self.show(T("up, 5 in 6", 40, MINT).move_to(RIGHT * 4.6 + DOWN * 1.6))
            self.stage = (b, gm, sm)

        with self.beat("hist4"):
            b, gm, sm = self.stage
            self.to_word("Neither")
            self.show(chip("same elevator", INK, BG, 36).move_to(RIGHT * 4.6 + DOWN * 0.4))
            self.to_word("lopsided")
            self.play(Indicate(gm, color=AMBER), Indicate(sm, color=MINT), run_time=self.rt(0.8))

        with self.beat("hist4b"):
            self.clear()
            self.show(T("a paradox, not a fault", 56, AMBER).move_to(UP * 1.2))
            self.to_word("Nothing")
            self.show(VGroup(icon("cpu", MUTED, 1.0), T("the machine: no favorite", 40, INK, False)).arrange(RIGHT, buff=0.3).move_to(DOWN * 0.2))
            self.to_word("where you stand")
            self.show(VGroup(icon("user", AMBER, 1.0), T("the bias: where you stand", 40, AMBER)).arrange(RIGHT, buff=0.3).move_to(DOWN * 1.5))

        with self.beat("hist5"):
            self.clear()
            def split(below, above, who, col):
                bar_b = Rectangle(width=0.9, height=0.5 * below, fill_color=MINT, fill_opacity=0.85, stroke_width=0)
                bar_a = Rectangle(width=0.9, height=0.5 * above, fill_color=CORAL, fill_opacity=0.85, stroke_width=0)
                col_ = VGroup(bar_a, bar_b).arrange(DOWN, buff=0.08)
                return VGroup(col_, T(f"{below} below · {above} above", 32, INK), T(who, 36, col)).arrange(DOWN, buff=0.25)
            gg = split(1, 5, "Gamow", AMBER).move_to(LEFT * 3.2 + DOWN * 0.1)
            ss = split(5, 1, "Stern", MINT).move_to(RIGHT * 3.2 + DOWN * 0.1)
            self.show(gg)
            self.to_word("opposite")
            self.show(ss)
            self.to_word("flipped")
            self.show(T("same zigzag, flipped", 40, AMBER).move_to(UP * 2.3))

        with self.beat("hist6"):
            self.clear()
            book = VGroup(RoundedRectangle(corner_radius=0.1, width=2.6, height=3.4, fill_color=PANEL, fill_opacity=1, stroke_color=AMBER, stroke_width=4),
                          T("Puzzle-Math", 36, AMBER), T("1958", 32, MUTED, False))
            book[1].move_to(book[0].get_center() + UP * 0.5)
            book[2].next_to(book[1], DOWN, buff=0.3)
            book.move_to(LEFT * 4.2 + UP * 0.2)
            self.show(book)
            self.to_word("one more line")
            q = VGroup(T("“with more elevators, the situation", 38, INK, False), T("will, of course, remain the same”", 38, INK, False)).arrange(DOWN, buff=0.2, aligned_edge=LEFT).move_to(RIGHT * 2.2 + UP * 0.2)
            self.play(Write(q), run_time=self.rt(2.0))
            self.stage = q

        with self.beat("hist7"):
            q = self.stage
            self.play(slam(stamp("IT DOESN'T", CORAL, -8, 56).move_to(RIGHT * 2.2 + DOWN * 1.3)))
            self.to_word("1969")
            self.clear()
            kn = VGroup(T("Donald Knuth, 1969", 46, INK), T("“The Gamow-Stern Elevator Problem”", 32, MUTED, False)).arrange(DOWN, buff=0.2).move_to(UP * 1.6)
            self.show(kn)
            self.to_word("15 in 18")
            fr = VGroup(T("2 elevators:", 44, INK, False), big("15/18", MUTED, 90), T("→", 70, MUTED), big("13/18", AMBER, 90)).arrange(RIGHT, buff=0.4).move_to(DOWN * 0.5)
            self.show(fr[0], fr[1])
            self.to_word("13 in 18")
            self.play(FadeIn(fr[2]), FadeIn(fr[3], scale=1.3), run_time=self.rt(0.5))
            self.add(Line(fr[1].get_left(), fr[1].get_right(), color=CORAL, stroke_width=6))

        # ======================= 4. more elevators
        with self.beat("multi1"):
            self.chapter("Add more elevators")
            b1 = Building(x=-1.0, bottom=-2.4, height=5.0, you=1, car_floor=7)
            b2 = Building(x=1.6, bottom=-2.4, height=5.0, you=None, car_floor=3)
            self.show(b1)
            self.to_word("second car")
            self.show(b2)
            self.play(b1.car.animate.move_to(b1.car_pos(4)), b2.car.animate.move_to(b2.car_pos(0)), run_time=self.rt(1.2), rate_func=rate_functions.linear)
            self.to_word("first")
            self.show(T("which one first?", 40, AMBER).move_to(RIGHT * 4.8 + UP * 0.4))

        with self.beat("multi2"):
            self.clear()
            vals = [(1, 90), (2, 82), (3, 76), (10, 55)]
            bars = VGroup()
            for k, v in vals:
                bar = Rectangle(width=0.1 * v, height=0.6, fill_color=CORAL, fill_opacity=0.9, stroke_width=0)
                bars.add(VGroup(T(f"{k} car" + ("s" if k > 1 else ""), 36, INK), bar, T(f"{v}%", 40, CORAL)).arrange(RIGHT, buff=0.35))
            bars.arrange(DOWN, buff=0.4, aligned_edge=LEFT).move_to(LEFT * 0.6 + DOWN * 0.2)
            half = DashedLine([bars[0][1].get_left()[0] + 5.0, 2.0, 0], [bars[0][1].get_left()[0] + 5.0, -2.4, 0], color=MINT, stroke_width=4)
            self.show(bars[0])
            self.play(Create(half), run_time=self.rt(0.3))
            self.show(T("coin flip", 28, MINT).next_to(half, UP, buff=0.1))
            self.to_word("82")
            self.show(bars[1])
            self.to_word("Three")
            self.show(bars[2])
            self.to_word("10 cars")
            self.show(bars[3])
            self.stage = bars

        with self.beat("multi2b"):
            self.clear()
            leans = VGroup(*[VGroup(T(s, 36, MUTED, False), big(v, AMBER, 96)).arrange(DOWN, buff=0.2) for s, v in (("1 car", "+40"), ("2 cars", "+32"), ("3 cars", "+25.6"))]).arrange(RIGHT, buff=1.6).move_to(UP * 0.5)
            self.show(T("points past a coin flip", 36, MUTED, False).move_to(UP * 2.3))
            self.to_word("One car")
            self.show(leans[0])
            self.to_word("32")
            self.show(leans[1])
            self.to_word("25.6")
            self.show(leans[2])
            self.to_word("8 tenths")
            self.show(chip("each car keeps × 0.8", MINT, BG, 40).move_to(DOWN * 1.6))

        with self.beat("multi3"):
            self.clear()
            ax = NumberLine(x_range=[0, 20, 2], length=11, color=MUTED, include_numbers=False).move_to(DOWN * 0.3)
            self.show(ax, T("time after you press", 30, MUTED, False).next_to(ax, DOWN, buff=0.3))
            self.to_word("next second")
            win = Rectangle(width=11 / 20, height=1.4, fill_color=AMBER, fill_opacity=0.35, stroke_color=AMBER).move_to(ax.n2p(0.5) + UP * 0.2)
            self.play(FadeIn(win, scale=1.5), run_time=self.rt(0.5))
            self.show(T("just the next moment", 36, AMBER).next_to(win, UP, buff=0.3).shift(RIGHT * 1.5))

        with self.beat("multi4"):
            self.clear()
            g, labs = gap_strip([(18, "down")], unit=0.5, y=1.0, h=0.9)
            self.show(T("car above you: likely (9/10)", 40, CORAL).move_to(UP * 2.0))
            self.play(GrowFromEdge(g, LEFT), run_time=self.rt(0.8))
            self.to_word("spread")
            dots = VGroup(*[Dot(g.get_left() + RIGHT * (0.25 + 0.5 * i), radius=0.08, color=INK) for i in range(18)])
            self.play(LaggedStart(*[FadeIn(d) for d in dots], lag_ratio=0.05), run_time=self.rt(0.8))
            self.show(T("arrival spread over 18 floors", 34, MUTED, False).next_to(g, DOWN, buff=0.35))
            self.stage = (g, dots)

        with self.beat("multi5"):
            g, dots = self.stage
            g2, _ = gap_strip([(2, "up")], unit=0.5, y=-1.5, h=0.9)
            g2.align_to(g, LEFT)
            self.show(T("car below you: rare (1/10)", 40, MINT).move_to(DOWN * 0.6))
            self.to_word("squeezed")
            self.play(GrowFromEdge(g2, LEFT), run_time=self.rt(0.5))
            self.show(T("squeezed into 2", 34, MUTED, False).next_to(g2, RIGHT, buff=0.35))

        with self.beat("multi6"):
            self.clear()
            l = VGroup(T("9/10 ÷ 18", 60, CORAL), T("= 1/20", 60, AMBER)).arrange(RIGHT, buff=0.4).move_to(UP * 1.0)
            r = VGroup(T("1/10 ÷ 2", 60, MINT), T("= 1/20", 60, AMBER)).arrange(RIGHT, buff=0.4).move_to(DOWN * 0.4)
            self.to_word("9 tenths")
            self.show(l[0])
            self.to_word("1 tenth")
            self.show(r[0])
            self.to_word("one in 20")
            self.show(l[1], r[1])
            self.show(T("per floor of travel", 32, MUTED, False).move_to(DOWN * 1.6))

        with self.beat("multi7"):
            self.clear()
            coin = VGroup(icon("arrow-up", MINT, 1.3), T("=", 80, MUTED), icon("arrow-down", CORAL, 1.3)).arrange(RIGHT, buff=0.6).move_to(UP * 1.2)
            self.show(coin)
            self.show(T("in the first instant", 36, AMBER).next_to(coin, UP, buff=0.25))
            self.to_word("one car")
            one = VGroup(T("1 car:", 40, INK), T("you wait, the far side wins", 38, CORAL, False)).arrange(RIGHT, buff=0.3).move_to(DOWN * 0.5)
            self.show(one)
            self.to_word("many cars")
            many = VGroup(T("many cars:", 40, INK), T("someone arrives at once, a fair coin", 38, MINT, False)).arrange(RIGHT, buff=0.3).move_to(DOWN * 1.5)
            self.show(many)

        with self.beat("multi8"):
            self.clear()
            self.show(T("what Gamow and Stern missed", 46, AMBER).move_to(UP * 1.8))
            self.to_word("One car")
            self.show(VGroup(icon("building-2", CORAL, 1.2), T("one car: the big side wins", 40, INK, False)).arrange(RIGHT, buff=0.4).move_to(UP * 0.2))
            self.to_word("Many cars")
            self.show(VGroup(icon("users", MINT, 1.2), T("many cars: only next to you matters", 40, INK, False)).arrange(RIGHT, buff=0.4).move_to(DOWN * 1.3))

        with self.beat("multi9"):
            self.clear()
            bank = VGroup(*[Building(x=0, bottom=-2.2, height=4.4, you=None, labels=(), car_floor=f) for f in (2, 7, 9, 4, 0, 6)]).arrange(RIGHT, buff=0.35).move_to(LEFT * 2.6 + DOWN * 0.1)
            for bb in bank:
                bb.scale(0.75)
            bank.arrange(RIGHT, buff=0.3).move_to(LEFT * 2.6 + DOWN * 0.2)
            self.show(bank)
            self.to_word("63%")
            self.show(VGroup(T("6 cars, floor 1", 38, INK), big("63%", CORAL, 120), T("still down first", 34, MUTED, False)).arrange(DOWN, buff=0.25).move_to(RIGHT * 4.2))

        with self.beat("multi9b"):
            self.clear()
            self.show(VGroup(T("8 cars, floor 1", 38, INK), big("58%", CORAL, 120)).arrange(DOWN, buff=0.25).move_to(UP * 0.9))
            self.to_word("one old")
            self.show(VGroup(icon("building-2", CORAL, 1.0), T("1 slow car: every day", 38, INK, False)).arrange(RIGHT, buff=0.3).move_to(LEFT * 3.4 + DOWN * 1.4))
            self.to_word("bank of eight")
            self.show(VGroup(icon("building-2", MINT, 1.0), T("8 cars: still, just less", 38, INK, False)).arrange(RIGHT, buff=0.3).move_to(RIGHT * 3.4 + DOWN * 1.4))

        # ======================= 5. elsewhere
        with self.beat("else1"):
            self.chapter("The same trick, elsewhere")
            self.show(VGroup(T("random arrival", 48, AMBER), T("+", 60, MUTED), T("uneven gaps", 48, CORAL)).arrange(RIGHT, buff=0.4).move_to(UP * 0.3))

        with self.beat("else2"):
            self.clear()
            bus = icon("bus", AMBER, 1.6).move_to(LEFT * 5.0 + UP * 1.0)
            self.show(bus, T("every 10 min", 44, INK).next_to(bus, RIGHT, buff=0.4))
            self.to_word("bunch up")
            g, labs = gap_strip([(2, "up"), (18, "down")] * 2, unit=0.28, y=-0.8, h=0.8, colors={"up": MINT, "down": CORAL})
            self.play(LaggedStart(*[GrowFromEdge(x, LEFT) for x in g], lag_ratio=0.4), run_time=self.rt(1.4))
            self.to_word("2 minute")
            self.show(T("2 min", 30, MINT).next_to(g[0], DOWN, buff=0.2))
            self.to_word("18 minute")
            self.show(labs, T("18 min", 30, CORAL).next_to(g[1], DOWN, buff=0.2))
            self.stage = g

        with self.beat("else3"):
            g = self.stage
            self.to_word("9 tenths")
            self.play(Indicate(VGroup(g[1], g[3]), color=CORAL, scale_factor=1.03), run_time=self.rt(0.6))
            self.to_word("isn't 5")
            no5 = T("not 5 min", 44, MUTED).move_to(RIGHT * 3.0 + UP * 1.0)
            self.show(no5)
            self.to_word("8.2")
            self.play(FadeIn(VGroup(T("average wait", 34, MUTED, False), big("8.2 min", CORAL, 90)).arrange(DOWN, buff=0.15).move_to(RIGHT * 3.0 + UP * 1.0), scale=1.2), FadeOut(no5), run_time=self.rt(0.5))

        with self.beat("else3b"):
            self.clear()
            g, labs = gap_strip([(10, "even")] * 4, unit=0.28, y=-1.3, h=0.8, colors={"even": MINT})
            self.show(T("same buses, evenly spaced", 44, INK).move_to(UP * 1.8))
            self.to_word("evenly")
            self.play(LaggedStart(*[GrowFromEdge(x, LEFT) for x in g], lag_ratio=0.3), run_time=self.rt(1.2))
            self.to_word("falls to 5")
            self.show(VGroup(T("average wait", 34, MUTED, False), big("5 min", MINT, 90)).arrange(DOWN, buff=0.15).move_to(UP * 0.6 + RIGHT * 4.2))

        with self.beat("else4"):
            self.clear()
            b = Building(x=-4.8, bottom=-2.4, height=5.0, you=1, car_floor=6)
            self.show(b)
            row = VGroup(VGroup(icon("building-2", INK, 0.9), T("gaps 18 and 2 → wait 8.2 floors", 38, INK, False)).arrange(RIGHT, buff=0.3),
                         VGroup(icon("bus", INK, 0.9), T("gaps 18 and 2 → wait 8.2 minutes", 38, INK, False)).arrange(RIGHT, buff=0.3)).arrange(DOWN, buff=0.6, aligned_edge=LEFT).move_to(RIGHT * 1.6)
            self.to_word("8.2")
            self.show(row[0])
            self.to_word("same numbers")
            self.show(row[1])

        with self.beat("else5"):
            self.clear()
            line = Line(LEFT * 5.5, RIGHT * 5.0, color=MUTED, stroke_width=8).shift(DOWN * 0.2)
            stops = VGroup(*[Dot(line.point_from_proportion(p), radius=0.16, color=INK) for p in (0, 0.25, 0.5, 0.75, 1.0)])
            end = T("end of line", 32, AMBER).next_to(stops[-1], UP, buff=0.3)
            you = VGroup(Dot(radius=0.12, color=AMBER), T("you", 28, AMBER)).arrange(DOWN, buff=0.1).next_to(stops[3], DOWN, buff=0.3)
            self.show(line, stops, end)
            self.to_word("next train")
            self.show(you)
            tr = icon("train-front", CORAL, 1.0).move_to(line.point_from_proportion(0.6) + UP * 0.9)
            self.play(FadeIn(tr), tr.animate.shift(RIGHT * 1.4), run_time=self.rt(1.0))
            self.show(T("usually heading to the end", 36, CORAL).move_to(DOWN * 2.0))

        with self.beat("else5b"):
            self.clear()
            ics = VGroup(*[icon(n, INK, 1.1) for n in ("train-front", "bus", "building-2")]).arrange(RIGHT, buff=1.2).move_to(UP * 1.4)
            self.show(ics)
            self.to_word("uneven")
            g, labs = gap_strip([(3, "up"), (14, "down"), (2, "up"), (11, "down")], unit=0.32, y=-0.4, h=0.7)
            self.play(LaggedStart(*[GrowFromEdge(x, LEFT) for x in g], lag_ratio=0.3), run_time=self.rt(1.0))
            self.to_word("long ones")
            self.show(T("random arrivals land in the long gaps", 38, CORAL).move_to(DOWN * 1.6))

        with self.beat("else6"):
            self.clear()
            def room(n, cols, col):
                ds = VGroup(*[Dot(radius=0.11, color=col) for _ in range(n)]).arrange_in_grid(cols=cols, buff=0.12)
                return VGroup(SurroundingRectangle(ds, color=MUTED, buff=0.2, corner_radius=0.1), ds)
            a = room(10, 5, MINT).move_to(LEFT * 4.6 + DOWN * 0.1)
            bcls = room(50, 10, CORAL).move_to(RIGHT * 0.4 + DOWN * 0.1)
            self.show(icon("school", INK, 1.0).move_to(LEFT * 6.0 + UP * 2.0))
            self.to_word("10")
            self.show(a, T("10", 36, MINT).next_to(a, DOWN, buff=0.2))
            self.to_word("50")
            self.show(bcls, T("50", 36, CORAL).next_to(bcls, DOWN, buff=0.2))
            self.to_word("30")
            self.show(chip("school: average class 30", INK, BG, 36).move_to(UP * 2.1 + RIGHT * 2.0))
            self.stage = (a, bcls)

        with self.beat("else7"):
            a, bcls = self.stage
            self.to_word("50 of the 60")
            self.play(Indicate(bcls, color=CORAL, scale_factor=1.04), run_time=self.rt(0.6))
            self.to_word("43")
            self.show(VGroup(T("average student's", 32, MUTED, False), T("class", 32, MUTED, False), big("43", AMBER, 100)).arrange(DOWN, buff=0.12).move_to(RIGHT * 5.0 + DOWN * 0.3))
            self.to_word("because they're big")
            self.show(T("you sample big things more often", 34, AMBER).move_to(DOWN * 2.1))

        with self.beat("else8"):
            self.clear()
            self.show(VGroup(icon("users", CORAL, 1.3), T("students: “crowded”", 40, INK, False)).arrange(DOWN, buff=0.3).move_to(LEFT * 3.4 + UP * 0.4))
            self.to_word("school says")
            self.show(VGroup(icon("school", MINT, 1.3), T("school: “average 30”", 40, INK, False)).arrange(DOWN, buff=0.3).move_to(RIGHT * 3.4 + UP * 0.4))
            self.to_word("Both")
            self.show(chip("both true", AMBER).move_to(DOWN * 1.6))

        # ======================= 6. real buildings
        with self.beat("real1"):
            self.chapter("Real buildings")
            self.show(VGroup(*[labelled_icon(n, s, MUTED, 1.1, 32) for n, s in (("clock", "they stop"), ("users", "they wait"), ("ban", "they get full"))]).arrange(RIGHT, buff=1.4).move_to(UP * 0.2))

        with self.beat("real2"):
            self.clear()
            items = VGroup(*[VGroup(icon(n, INK, 0.8), T(s, 36, INK, False)).arrange(RIGHT, buff=0.35) for n, s in
                             (("building-2", "idle cars go back to the lobby"), ("clock", "rush hour: everyone down at once"),
                              ("footprints", "low floors take the stairs"), ("ban", "full cars skip your floor"))]).arrange(DOWN, buff=0.35, aligned_edge=LEFT).move_to(DOWN * 0.1)
            self.show(items[0])
            self.to_word("Rush hour")
            self.show(items[1])
            self.to_word("stairs")
            self.show(items[2])
            self.to_word("Full cars")
            self.show(items[3])

        with self.beat("real3"):
            self.clear()
            self.show(T("shifts the numbers, doesn't remove it", 46, INK).move_to(UP * 1.8))
            self.to_word("near the top")
            b = Building(x=0, bottom=-2.4, height=4.0, you=9, labels=(0, 10), car_floor=3, you_color=MINT)
            self.show(b)
            self.show(T("cars rarely above you", 36, MINT).move_to(RIGHT * 3.8 + UP * 0.3))

        with self.beat("real3b"):
            self.clear()
            b = Building(x=-3.6, bottom=-2.4, height=5.2, floors=30, you=3, labels=(0, 3, 30), car_floor=20)
            self.show(b)
            self.to_word("27")
            self.show(T("27 of 30 floors above you", 44, CORAL).move_to(RIGHT * 2.6 + UP * 0.8))
            self.to_word("9 times")
            self.show(T("down first 9 in 10", 52, AMBER).move_to(RIGHT * 2.6 + DOWN * 0.5))

        with self.beat("myth1"):
            self.clear()
            self.show(T("wrong explanation #1", 36, CORAL).move_to(UP * 2.0))
            self.to_word("programmed")
            self.show(VGroup(icon("cpu", MUTED, 1.2), T("“programmed to favor the lobby”", 40, INK, False)).arrange(RIGHT, buff=0.4).move_to(UP * 0.6))
            self.to_word("no program")
            self.show(T("our zigzag car has no program and still does it", 36, MINT).move_to(DOWN * 1.0))

        with self.beat("myth2"):
            self.clear()
            self.show(T("wrong explanation #2", 36, CORAL).move_to(UP * 2.0))
            self.to_word("remember")
            self.show(T("“you only remember the bad days”", 42, INK, False).move_to(UP * 0.8))
            self.to_word("200,000")
            self.show(VGroup(T("200,000 simulated presses", 36, MUTED, False), big("90% down", CORAL, 100)).arrange(DOWN, buff=0.2).move_to(DOWN * 1.0))

        with self.beat("real4"):
            self.clear()
            b = Building(x=-3.0, bottom=-2.4, height=5.0, you=1, car_floor=1)
            self.show(b, self.arrival(b, True))
            self.to_word("nothing is rigged")
            self.show(T("nothing is rigged", 52, MINT).move_to(RIGHT * 3.0 + UP * 0.8))
            self.to_word("end of the line")
            self.show(T("you're near the end of the line", 40, AMBER).move_to(RIGHT * 3.0 + DOWN * 0.5))

        with self.beat("real5"):
            self.clear()
            parts = VGroup(labelled_icon("building-2", "one car", MINT, 1.3, 34), labelled_icon("user", "a lopsided spot", AMBER, 1.3, 34),
                           labelled_icon("clock", "a random moment", CORAL, 1.3, 34)).arrange(RIGHT, buff=1.4).move_to(UP * 0.3)
            self.show(parts[0])
            self.to_word("lopsided")
            self.show(parts[1])
            self.to_word("random moment")
            self.show(parts[2])

        with self.beat("real6"):
            self.clear()
            pts = VGroup(*[T(x, 40, c, False) for x, c in (("1. up and down pass you equally", INK), ("2. one car lives on the big side", CORAL),
                          ("3. you arrive at a random moment", AMBER), ("4. more cars help, slowly", MINT))]).arrange(DOWN, buff=0.4, aligned_edge=LEFT).move_to(UP * 0.1)
            self.show(pts[0])
            self.to_word("single car")
            self.show(pts[1])
            self.to_word("random moment")
            self.show(pts[2])
            self.to_word("More cars")
            self.show(pts[3])

        # ======================= 7. your turn
        with self.beat("cta"):
            self.chapter("Your turn")
            b1 = Building(x=-2.0, bottom=-2.4, height=4.8, you=9, labels=(0, 9, 10), car_floor=4, you_color=AMBER)
            b2 = Building(x=0.6, bottom=-2.4, height=4.8, you=None, labels=(), car_floor=8)
            self.show(b1, b2)
            self.to_word("two elevators")
            self.play(b1.car.animate.move_to(b1.car_pos(7)), b2.car.animate.move_to(b2.car_pos(5)), run_time=self.rt(1.0))
            self.to_word("Which way")
            self.show(VGroup(T("floor 9, two cars:", 38, INK), T("which way, how often?", 44, AMBER)).arrange(DOWN, buff=0.25).move_to(RIGHT * 4.6 + UP * 0.4))


class Thumbnail(Scene):
    def construct(self):
        b = Building(x=5.0, bottom=-3.4, height=6.8, you=1, labels=(), car_floor=7)
        down = icon("arrow-down", CORAL, 2.0).move_to([2.9, 0.4, 0])
        top = Text("9 in 10", font=FONT_BOLD, color=AMBER, font_size=170).move_to(LEFT * 2.6 + UP * 1.0)
        sub = Text("the wrong way", font=FONT_BOLD, color=INK, font_size=76).move_to(LEFT * 2.6 + DOWN * 0.9)
        self.add(b, down, top, sub)
