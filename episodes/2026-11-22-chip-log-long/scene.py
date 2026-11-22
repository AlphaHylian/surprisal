"""How a knotted rope told sailors their speed (and where they were). Long-form, 16:9, Manim.

Expands the 17 Nov Short (chip-log). Chapters: the rope / why 47 feet 3 inches / from speed to
position / the current you can't see / when the guess ran out / knots today / your turn.
Every number is computed in verify.py.
"""
import json
import math
import os
import random

from kit.brand import *
from kit.visuals import *

SAY = {b["id"]: b["say"] for b in json.load(open(os.path.join(EP, "script.json")))["beats"]}


def T(s, size=44, color=INK, bold=True):
    return Text(s, font=FONT_BOLD if bold else FONT_MED, color=color, font_size=size)


def big(s, color=AMBER, size=150):
    return Text(s, font=FONT_BOLD, color=color, font_size=size)


def row(*mobs, buff=0.6):
    return VGroup(*mobs).arrange(RIGHT, buff=buff)


def col(*mobs, buff=0.35):
    return VGroup(*mobs).arrange(DOWN, buff=buff)


def labelled_icon(name, text, color=MINT, h=1.3, size=34):
    i = icon(name, color, h)
    return VGroup(i, T(text, size, INK, bold=False).next_to(i, DOWN, buff=0.25))


def log_board(r=1.0, color=AMBER):
    """The chip: a quarter circle with a lead strip on its arc."""
    sec = AnnularSector(inner_radius=0, outer_radius=r, angle=PI / 2, start_angle=PI / 4 + PI, fill_color="#8B5A2B",
                        fill_opacity=1, stroke_color=color, stroke_width=4)
    lead = Arc(radius=r, start_angle=PI / 4 + PI, angle=PI / 2, color=MUTED, stroke_width=14)
    return VGroup(sec, lead)


def knot_line(n=9, gap=1.2, color=INK, knot_color=AMBER):
    """A horizontal line with n knots, `gap` apart, starting one gap in."""
    ln = Line(ORIGIN, RIGHT * gap * (n + 0.5), color=color, stroke_width=4)
    knots = VGroup(*[Dot(RIGHT * gap * (i + 1), radius=0.11, color=knot_color) for i in range(n)])
    return VGroup(ln, knots)


def traverse_board(r=2.2, rings=8):
    g = VGroup()
    g.add(Circle(radius=r + 0.25, color=DIM, stroke_width=3).set_fill(PANEL, 1))
    holes = []
    for k in range(rings):
        rr = 0.6 + k * (r - 0.6) / (rings - 1)
        ring = VGroup(*[Dot(rr * (math.cos(PI / 2 - j * 2 * PI / 32) * RIGHT + math.sin(PI / 2 - j * 2 * PI / 32) * UP),
                            radius=0.035, color=MUTED) for j in range(32)])
        holes.append(ring)
        g.add(ring)
    for j, lab in ((0, "N"), (8, "E"), (16, "S"), (24, "W")):
        a = PI / 2 - j * 2 * PI / 32
        g.add(T(lab, 30, AMBER).move_to((r + 0.55) * (math.cos(a) * RIGHT + math.sin(a) * UP)))
    g.holes = holes
    return g


def chart_grid(w=9, h=5, step=1.0):
    g = VGroup()
    for i in range(int(w / step) + 1):
        g.add(Line(UP * h / 2, DOWN * h / 2, color=DIM, stroke_width=2).shift(RIGHT * (-w / 2 + i * step)))
    for j in range(int(h / step) + 1):
        g.add(Line(LEFT * w / 2, RIGHT * w / 2, color=DIM, stroke_width=2).shift(UP * (-h / 2 + j * step)))
    return g


def crossing_paths(n=40, current=0.0, seed=3, hours=240, scale=0.018):
    """Reckoned path is a straight line east; true endpoints scatter (random errors) or march (current)."""
    rng = random.Random(seed)
    ends = []
    for _ in range(n):
        ex = ey = 0.0
        for _h in range(hours):
            se = rng.gauss(0, 0.04)
            he = math.radians(rng.gauss(0, 3))
            ex += 6 * (1 + se) * math.cos(he) - 6
            ey += 6 * (1 + se) * math.sin(he) + current
        ends.append((ex, ey))
    return ends


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
        card_ = Text(title, font=FONT_DISPLAY, color=AMBER, font_size=96)
        fit(card_, 12, 2)
        self.play(FadeIn(card_, scale=1.1), run_time=self.rt(0.5))
        self.wait(self.rt(0.6, 0.2))
        new = headline(title, INK, size=60)
        self.play(ReplacementTransform(card_, new), run_time=self.rt(0.5))
        self._head = new

    def drift(self, mob, scale=1.03):
        rt = max(0.3, self.left() - 0.1)
        self.play(mob.animate.scale(scale), run_time=rt, rate_func=rate_functions.linear)

    def ship_scene(self, n=7, y=-0.6):
        """Ship at left, line streaming back to the board at right, with n knots."""
        ship = icon("sailboat", INK, 1.8).move_to(LEFT * 5.2 + UP * (y + 0.6))
        line = knot_line(n, 1.15).move_to(RIGHT * 0.4 + UP * y)
        board = log_board(0.55).move_to(line[0].get_end() + RIGHT * 0.45)
        water = VGroup(*[Line(LEFT * 7 + UP * (y - 0.45 - k * 0.35), RIGHT * 7 + UP * (y - 0.45 - k * 0.35), color=DIM, stroke_width=3) for k in range(3)])
        return VGroup(water, line, board, ship)

    # ------------------------------------------------------------ the episode
    def construct(self):
        # ======================= 1. the rope
        with self.beat("hook"):
            scene = self.ship_scene(7, y=-1.3)
            top = col(T("Count the knots for 28 seconds:", 60, INK), big("that's your speed", AMBER, 110), buff=0.25).move_to(UP * 1.9)
            fit(top, 13, 2.6)
            grp = VGroup(top, scene)
            self.open_with(grp)
            self.drift(grp, 1.02)

        with self.beat("promise"):
            self.play(FadeOut(grp), run_time=self.rt(0.4))
            items = row(labelled_icon("ruler", "why it works", MINT), labelled_icon("map", "speed → position", AMBER),
                        labelled_icon("waves", "the hidden current", CORAL), buff=1.6).move_to(UP * 0.2)
            self.to_word("why that works")
            self.show(items[0])
            self.to_word("position")
            self.show(items[1])
            self.to_word("current")
            self.show(items[2])
            self.to_word("wrecked")
            self.play(Indicate(items[2], color=CORAL), run_time=self.rt(0.6))

        with self.beat("r1"):
            self.clear()
            self.head("Mid-Atlantic, 400 years ago")
            ship = icon("sailboat", INK, 2.2).move_to(DOWN * 0.2)
            waves = VGroup(*[icon("waves", DIM, 1.0).move_to(RIGHT * x + DOWN * 1.6) for x in (-5, -2.5, 0, 2.5, 5)])
            self.show(ship, waves)
            self.to_word("No GPS")
            nos = row(chip("no GPS", CORAL), chip("no radio", CORAL), chip("no land", CORAL), buff=0.5).move_to(UP * 2.0)
            self.show(nos)
            self.to_word("how fast")
            q = row(chip("how fast?", AMBER), chip("for how long?", AMBER), buff=0.6).move_to(DOWN * 2.6)
            self.show(q)

        with self.beat("r2"):
            self.clear()
            self.head("The log")
            board = log_board(1.6).move_to(LEFT * 3)
            self.to_word("quarter")
            self.play(FadeIn(board, scale=0.8), run_time=self.rt(0.6))
            self.to_word("radius")
            rlab = T("radius ≈ 6 in", 40, MINT).next_to(board, DOWN, buff=0.4)
            self.show(rlab)
            self.to_word("lead")
            self.show(T("lead", 40, MUTED).next_to(board, LEFT, buff=0.3))
            self.to_word("line")
            reel = VGroup(Circle(radius=0.8, color=INK, stroke_width=5), Circle(radius=0.2, color=INK, stroke_width=4)).move_to(RIGHT * 3.6)
            ln = Line(board.get_right(), reel.get_left(), color=INK, stroke_width=4)
            self.play(Create(ln), FadeIn(reel), run_time=self.rt(0.8))
            self.to_word("throw")
            self.play(Rotate(reel, -2 * PI), run_time=self.rt(1.0))

        with self.beat("r3"):
            self.clear(keep_head=False)
            scene = self.ship_scene(3, y=-0.4)
            water, line, board, ship = scene
            self.show(water, board, ship)
            self.play(Create(line[0]), run_time=self.rt(0.8))
            self.to_word("grips")
            self.play(Indicate(board, color=AMBER), run_time=self.rt(0.6))
            self.to_word("sails away")
            self.play(ship.animate.shift(LEFT * 1.0), line[0].animate.put_start_and_end_on(line[0].get_start() + LEFT * 1.0, line[0].get_end()),
                      run_time=self.rt(1.6), rate_func=rate_functions.linear)
            self.show(chip("board stays put, ship pulls line", MINT).move_to(UP * 2.4))

        with self.beat("r4"):
            self.clear()
            self.head("28 seconds of sand")
            glass = icon("hourglass", AMBER, 2.2).move_to(LEFT * 5)
            self.show(glass)
            self.play(Rotate(glass, PI), run_time=self.rt(0.6))
            line = knot_line(7, 1.1).move_to(RIGHT * 1.0 + DOWN * 0.4)
            self.to_word("knots tied")
            self.play(Create(line[0]), run_time=self.rt(0.6))
            self.to_word("counts")
            cnt = VGroup()
            for i, k in enumerate(line[1]):
                n = T(str(i + 1), 40, AMBER).next_to(k, UP, buff=0.25)
                self.play(FadeIn(k, scale=1.6), FadeIn(n), run_time=self.rt(0.3, 0.2))
                cnt.add(n)
            self.to_word("7 knots")
            self.play(FadeIn(big("7", AMBER, 160).move_to(RIGHT * 1.0 + UP * 1.9), scale=1.3), run_time=self.rt(0.5))

        with self.beat("r5"):
            self.clear(keep_head=False)
            eqn = row(T("7 knots counted", 70, INK), T("=", 70, MUTED), T("7 knots of speed", 70, AMBER), buff=0.5).move_to(UP * 0.6)
            fit(eqn, 13, 2)
            self.show(eqn)
            self.to_word("no arithmetic")
            self.show(chip("no arithmetic", MINT).move_to(DOWN * 1.0))
            self.to_word("tied the knots")
            self.show(T("…it was done once, by whoever tied the knots", 44, MUTED).move_to(DOWN * 2.3))

        # ======================= 2. why 47 ft 3 in
        with self.beat("w1"):
            self.chapter("Why 47 feet 3 inches")
            line = knot_line(2, 4.2).move_to(DOWN * 0.3)
            self.show(line)
            self.to_word("47 feet")
            br = BraceBetweenPoints(line[1][0].get_center(), line[1][1].get_center(), DOWN, color=AMBER)
            self.play(GrowFromCenter(br), FadeIn(T("47 ft 3 in", 60, AMBER).next_to(br, DOWN, buff=0.2)), run_time=self.rt(0.6))
            self.to_word("isn't random")
            self.show(T("?", 120, MINT).move_to(UP * 1.6))

        with self.beat("w2"):
            self.clear()
            d = row(T("1 knot", 64, AMBER), T("=", 64, MUTED), T("1 nautical mile per hour", 64, INK), buff=0.4).move_to(UP * 1.4)
            fit(d, 13, 1.5)
            self.show(d)
            self.to_word("6,080")
            m = row(T("1 nautical mile", 54, INK), T("=", 54, MUTED), T("6,080 ft", 54, MINT), buff=0.4).move_to(UP * 0.0)
            self.show(m)
            self.to_word("3,600")
            h = row(T("6,080 ft", 54, MINT), T("in", 54, MUTED), T("3,600 s", 54, AMBER), buff=0.4).move_to(DOWN * 1.4)
            self.show(h)

        with self.beat("w3"):
            self.clear()
            frac = MathTex(r"6080 \times \frac{28}{3600}", font_size=110, color=INK).move_to(UP * 1.0)
            self.show(frac)
            self.to_word("47.3")
            res = big("= 47.3 ft", AMBER, 110).move_to(DOWN * 0.8)
            self.play(FadeIn(res, scale=1.2), run_time=self.rt(0.5))
            self.to_word("half an inch")
            self.show(chip("47 ft 3 in  (off by 0.47 in)", MINT).move_to(DOWN * 2.4))

        with self.beat("w4"):
            self.clear()
            rows_ = VGroup()
            for k, y in ((1, 1.4), (2, 0.0), (7, -1.4)):
                lab = T(f"{k} knot{'s' if k > 1 else ''}", 44, AMBER).move_to(LEFT * 5.4 + UP * y)
                ln = knot_line(k, 1.05, knot_color=AMBER).next_to(lab, RIGHT, buff=0.4)
                rows_.add(VGroup(lab, ln))
            self.show(rows_[0])
            self.to_word("2 knots")
            self.show(rows_[1])
            self.to_word("At 7")
            self.show(rows_[2])
            self.to_word("matched")
            self.show(chip("spacing ÷ time = 1 knot", MINT).move_to(DOWN * 2.7))

        with self.beat("w5"):
            self.clear()
            a = col(T("the rope's knot", 44, MUTED), big("1.85166", AMBER, 120), T("km/h", 40, MUTED), buff=0.2).move_to(LEFT * 3.4)
            b = col(T("today's knot", 44, MUTED), big("1.852", MINT, 120), T("km/h", 40, MUTED), buff=0.2).move_to(RIGHT * 3.4)
            self.show(a)
            self.to_word("1.852")
            self.show(b)
            self.to_word("2 parts")
            self.play(FadeIn(chip("off by < 2 in 10,000", AMBER, size=48).move_to(DOWN * 2.3), scale=1.2), run_time=self.rt(0.5))

        with self.beat("w6"):
            self.clear()
            self.head("Getting there")
            t1 = col(year_stamp("1574", INK, 80), T("Bourne: ½-minute glass", 38, INK), T("5,000 ft mile → 42 ft", 38, MUTED), buff=0.2).move_to(LEFT * 3.4)
            t2 = col(year_stamp("later", INK, 80), T("8 fathoms = 48 ft", 38, INK), T("28 s glass", 38, AMBER), buff=0.2).move_to(RIGHT * 3.4)
            self.to_word("Bourne")
            self.show(t1)
            self.to_word("8 fathoms")
            self.show(t2)
            self.to_word("28 second")
            self.play(Indicate(t2[2], color=AMBER), run_time=self.rt(0.6))

        with self.beat("w7"):
            self.clear()
            pairs = VGroup(
                row(icon("hourglass", AMBER, 1.0), T("28 s", 56, AMBER), T("→", 56, MUTED), T("47 ft 3 in", 56, INK), buff=0.4),
                row(icon("hourglass", MINT, 1.0), T("30 s", 56, MINT), T("→", 56, MUTED), T("50 ft 8 in", 56, INK), buff=0.4),
            ).arrange(DOWN, buff=0.7).move_to(UP * 0.4)
            self.show(pairs[0])
            self.to_word("30 second glass")
            self.show(pairs[1])
            self.to_word("Any pair")
            self.show(chip("spacing ÷ time = 1 knot", AMBER).move_to(DOWN * 2.2))

        with self.beat("w8"):
            self.clear()
            g = row(icon("hourglass", MINT, 1.4), T("14 s", 72, MINT), T("→", 64, MUTED), T("half the line", 56, INK), buff=0.5).move_to(UP * 1.0)
            self.show(g)
            self.to_word("counts for two")
            self.play(FadeIn(row(T("1 knot of line", 56, INK), T("=", 56, MUTED), T("2 knots of speed", 56, AMBER), buff=0.4).move_to(DOWN * 1.0), scale=1.2), run_time=self.rt(0.5))

        with self.beat("sub"):
            self.clear(keep_head=False)
            s = col(icon("anchor", AMBER, 1.6), T("Subscribe: the math inside old tools,", 50, INK), T("twice a day", 50, MINT), buff=0.35)
            self.show(s)

        # ======================= 3. from speed to position
        with self.beat("d1"):
            self.chapter("From speed to position")
            g = row(icon("gauge", AMBER, 1.6), T("→", 80, MUTED), icon("map-pin", MINT, 1.6), buff=1.0).move_to(UP * 0.2)
            self.show(g)
            self.to_word("dead reckoning")
            self.show(T("dead reckoning", 70, AMBER).move_to(DOWN * 2.0))

        with self.beat("d2"):
            self.clear()
            grid = chart_grid(10, 5).move_to(DOWN * 0.4)
            self.show(grid)
            self.to_word("fix")
            fix = VGroup(Dot(RIGHT * 3.5 + DOWN * 0.4, radius=0.16, color=MINT), T("noon fix", 36, MINT).move_to(RIGHT * 3.5 + DOWN * 1.0))
            self.play(FadeIn(fix, scale=1.5), run_time=self.rt(0.5))
            self.to_word("half hour")
            self.show(chip("every ½ h: heading", AMBER).move_to(LEFT * 2.4 + UP * 1.4))
            self.to_word("every hour")
            self.show(chip("every hour: speed", MINT).move_to(LEFT * 2.4 + DOWN * 2.2))

        with self.beat("d3"):
            self.clear()
            self.head("The traverse board")
            tb = traverse_board(2.0).move_to(LEFT * 2.6 + DOWN * 0.3)
            self.to_word("compass rose")
            self.play(FadeIn(tb), run_time=self.rt(0.8))
            self.to_word("32")
            self.show(T("32 points", 40, AMBER).move_to(RIGHT * 2.4 + UP * 1.6))
            self.to_word("8 rings")
            self.show(T("8 rings", 40, MINT).move_to(RIGHT * 2.4 + UP * 0.7))
            self.to_word("a peg")
            pegs = VGroup(*[Dot(tb.holes[k][24].get_center(), radius=0.09, color=AMBER) for k in range(8)])
            self.play(LaggedStart(*[FadeIn(p, scale=2) for p in pegs], lag_ratio=0.2), run_time=self.rt(1.4))
            self.to_word("Underneath")
            speed = VGroup(*[VGroup(*[Dot(RIGHT * (1.2 + i * 0.28) + DOWN * (0.6 + r * 0.4), radius=0.05, color=MUTED) for i in range(14)]) for r in range(4)])
            self.show(speed)
            for r in range(4):
                self.play(FadeIn(Dot(speed[r][6].get_center(), radius=0.1, color=MINT), scale=2), run_time=self.rt(0.25, 0.2))

        with self.beat("d4"):
            self.clear(keep_head=False)
            grid = chart_grid(10, 5).move_to(DOWN * 0.4)
            fix = Dot(RIGHT * 3.5 + DOWN * 0.4, radius=0.16, color=MINT)
            self.show(grid, fix)
            self.to_word("7 knots")
            arr = Arrow(fix.get_center(), fix.get_center() + LEFT * 5.6, buff=0, color=AMBER, stroke_width=8)
            self.play(GrowArrow(arr), run_time=self.rt(1.4))
            self.to_word("7 times 4")
            self.show(T("7 × 4 = 28", 64, AMBER).move_to(UP * 1.6))
            self.to_word("28 nautical")
            here = VGroup(Dot(arr.get_end(), radius=0.16, color=AMBER), T("28 nm west", 40, AMBER).next_to(arr.get_end(), DOWN, buff=0.3))
            self.play(FadeIn(here, scale=1.5), run_time=self.rt(0.5))

        with self.beat("d5"):
            self.clear()
            o = LEFT * 1.2 + DOWN * 2.4
            s = 0.22
            n_arr = Arrow(o, o + UP * 18 * s, buff=0, color=MINT, stroke_width=8)
            e_arr = Arrow(o + UP * 18 * s, o + UP * 18 * s + RIGHT * 16 * s, buff=0, color=AMBER, stroke_width=8)
            self.show(Dot(o, radius=0.14, color=INK))
            self.to_word("3 hours")
            self.play(GrowArrow(n_arr), run_time=self.rt(0.8))
            self.show(T("3 h × 6 kn = 18 N", 40, MINT).next_to(n_arr, LEFT, buff=0.3))
            self.to_word("2 hours")
            self.play(GrowArrow(e_arr), run_time=self.rt(0.8))
            self.show(T("2 h × 8 kn = 16 E", 40, AMBER).next_to(e_arr, UP, buff=0.3))
            self.to_word("24 miles")
            d = DashedLine(o, e_arr.get_end(), color=INK, stroke_width=5)
            self.play(Create(d), run_time=self.rt(0.6))
            self.show(T("≈ 24 nm", 56, INK).move_to(RIGHT * 2.6 + DOWN * 0.6))

        with self.beat("d6"):
            self.clear()
            f = col(T("each leg = speed × time", 60, INK), T("in the heading's direction", 46, MUTED), buff=0.3).move_to(UP * 1.0)
            self.show(f)
            self.to_word("Add the legs")
            self.show(T("add the legs → position", 60, AMBER).move_to(DOWN * 0.6))
            self.to_word("just the rope")
            tools = row(icon("hourglass", MINT, 1.0), icon("compass", MINT, 1.0), log_board(0.5), buff=1.0).move_to(DOWN * 2.3)
            self.show(tools)

        with self.beat("d7"):
            self.clear()
            plane = icon("plane", INK, 1.4).move_to(LEFT * 5 + UP * 0.8)
            self.show(plane)
            self.to_word("1919")
            leg = Arrow(LEFT * 4 + UP * 0.8, RIGHT * 4 + UP * 0.8, buff=0, color=AMBER, stroke_width=6)
            self.play(GrowArrow(leg), plane.animate.move_to(RIGHT * 5 + UP * 0.8), run_time=self.rt(1.4))
            self.show(T("1919  Newfoundland → Ireland", 46, AMBER).move_to(DOWN * 0.4))
            self.to_word("Galway")
            self.show(T("by dead reckoning", 40, MINT).move_to(DOWN * 1.3))
            self.to_word("1927")
            self.show(T("1927  Lindbergh → Paris", 46, INK).move_to(DOWN * 2.4))

        # ======================= 4. the current
        with self.beat("c1"):
            self.chapter("The current you can't see")
            seabed = T("speed over the seabed", 48, MUTED).move_to(LEFT * 3.2 + UP * 0.4)
            water = T("speed through the water", 48, AMBER).move_to(RIGHT * 3.2 + UP * 0.4)
            self.to_word("seabed")
            self.show(seabed)
            self.to_word("through the water")
            self.show(water)
            self.play(Indicate(water, color=AMBER), seabed.animate.set_opacity(0.4), run_time=self.rt(0.6))

        with self.beat("c2"):
            self.clear()
            scene = self.ship_scene(4, y=-0.2)
            self.show(scene)
            self.to_word("whole ocean")
            cur = VGroup(*[Arrow(LEFT * 0.6, RIGHT * 0.6, buff=0, color=CORAL, stroke_width=6).move_to(RIGHT * x + UP * y)
                           for x in (-4.5, -1.5, 1.5, 4.5) for y in (-1.6, 1.6)])
            self.play(LaggedStart(*[GrowArrow(a) for a in cur], lag_ratio=0.1), run_time=self.rt(1.0))
            self.to_word("board moves")
            self.play(scene.animate.shift(RIGHT * 0.8), cur.animate.shift(RIGHT * 0.8), run_time=self.rt(1.2))
            self.to_word("24 miles")
            self.play(FadeIn(chip("1 knot × 24 h = 24 nm, on no peg", CORAL, size=44).move_to(UP * 2.6), scale=1.2), run_time=self.rt(0.5))

        with self.beat("c3"):
            self.clear()
            dots = VGroup(*[Arrow(ORIGIN, (math.cos(a) * RIGHT + math.sin(a) * UP) * 1.3, buff=0, color=MINT, stroke_width=5)
                            for a in [0.3, 2.1, 3.9, 5.2, 1.0, 2.9, 4.6]]).move_to(UP * 0.2)
            self.to_word("misread")
            self.play(LaggedStart(*[GrowArrow(a) for a in dots], lag_ratio=0.15), run_time=self.rt(1.4))
            self.to_word("cancel")
            self.show(chip("random errors partly cancel", MINT).move_to(DOWN * 2.2))

        with self.beat("c4"):
            self.clear()
            self.head("10 days at 6 knots, 20,000 times")
            start = LEFT * 5.5 + DOWN * 0.3
            end = RIGHT * 3.5 + DOWN * 0.3
            route = Line(start, end, color=INK, stroke_width=5)
            self.show(Dot(start, color=MINT, radius=0.14), route, Dot(end, color=INK, radius=0.14))
            self.to_word("off by")
            ends = crossing_paths(60, 0.0)
            sc = 0.1
            pts = VGroup(*[Dot(end + RIGHT * ex * sc + UP * ey * sc, radius=0.06, color=MINT) for ex, ey in ends])
            self.play(LaggedStart(*[FadeIn(p) for p in pts], lag_ratio=0.02), run_time=self.rt(1.6))
            self.to_word("5 miles")
            self.show(T("typical error ≈ 5 nm", 50, MINT).move_to(RIGHT * 2.8 + DOWN * 2.0))
            self.pts_c4, self.end_c4 = pts, end

        with self.beat("c4b"):
            self.to_word("four times")
            t40 = col(T("40 days at sea:", 40, INK), T("≈ 13 nm, not 20", 50, MINT), buff=0.15).move_to(LEFT * 3.8 + DOWN * 2.2)
            self.show(t40)
            self.to_word("not to 20")
            self.play(Indicate(t40[1], color=MINT), run_time=self.rt(0.6))
            self.play(FadeOut(t40), run_time=self.rt(0.3))

        with self.beat("c5"):
            self.to_word("half knot")
            ends = crossing_paths(60, 0.5)
            sc = 0.1 * 0.018 / 0.018
            end = self.end_c4
            cur = VGroup(*[Dot(end + RIGHT * ex * 0.1 * 0.25 + UP * ey * 0.018, radius=0.06, color=CORAL) for ex, ey in ends])
            arr = Arrow(end, end + UP * 120 * 0.018, buff=0, color=CORAL, stroke_width=6)
            self.play(GrowArrow(arr), LaggedStart(*[FadeIn(p) for p in cur], lag_ratio=0.02), run_time=self.rt(1.6))
            self.to_word("120 miles")
            self.show(T("≈ 120 nm", 64, CORAL).next_to(arr, LEFT, buff=0.4))
            self.to_word("Random errors wander")
            self.show(row(chip("random errors wander", MINT), chip("a current marches", CORAL), buff=0.5).move_to(DOWN * 2.8))

        with self.beat("c6"):
            self.clear()
            fixes = row(labelled_icon("landmark", "a landmark", MINT), labelled_icon("anchor", "a depth sounding", MINT),
                        labelled_icon("sun", "noon sun: latitude", AMBER), buff=1.4).move_to(UP * 0.6)
            self.to_word("landmark")
            self.show(fixes[0])
            self.to_word("depth")
            self.show(fixes[1])
            self.to_word("sun")
            self.show(fixes[2])
            self.to_word("wipes")
            self.show(chip("every fix: error back to 0", AMBER).move_to(DOWN * 2.2))

        # ======================= 5. Scilly 1707
        with self.beat("s1"):
            self.chapter("When the guess ran out")
            yr = year_stamp("October 1707", INK, 90).move_to(UP * 1.2)
            self.show(yr)
            self.to_word("21 ships")
            fleet = VGroup(*[icon("sailboat", INK, 0.55) for _ in range(21)]).arrange_in_grid(3, 7, buff=0.3).move_to(DOWN * 1.2)
            self.play(LaggedStart(*[FadeIn(s) for s in fleet], lag_ratio=0.05), run_time=self.rt(1.4))
            self.to_word("Gibraltar")
            self.show(T("Gibraltar → home", 40, MUTED).move_to(DOWN * 2.9))
            self.fleet = fleet

        with self.beat("s2"):
            self.clear(keep_head=True)
            sea = Rectangle(width=12, height=5.4, stroke_color=DIM, fill_color=PANEL, fill_opacity=0.6).move_to(DOWN * 0.3)
            land = Polygon(RIGHT * 2.5 + UP * 0.9, RIGHT * 6 + UP * 0.9, RIGHT * 6 + UP * 2.4, RIGHT * 2.5 + UP * 2.4, color=MUTED, fill_opacity=0.5)
            land_lab = T("England", 34, INK).move_to(land)
            scilly = VGroup(*[Dot(RIGHT * x + UP * y, radius=0.09, color=INK) for x, y in ((0.9, 0.4), (1.1, 0.25), (0.75, 0.2), (1.0, 0.55))])
            sc_lab = T("Scilly", 32, INK).next_to(scilly, LEFT, buff=0.2)
            self.show(sea, land, land_lab, scilly, sc_lab)
            self.to_word("21st")
            sight = VGroup(icon("sun", AMBER, 0.8), T("last latitude: 21st", 34, AMBER)).arrange(RIGHT, buff=0.3).move_to(LEFT * 3.4 + UP * 2.0)
            self.show(sight)
            self.to_word("dead reckoning")
            believed = Dot(LEFT * 1.2 + DOWN * 1.6, radius=0.14, color=MINT)
            b_lab = T("where they thought", 32, MINT).next_to(believed, DOWN, buff=0.2)
            self.show(believed, b_lab)
            self.to_word("east")
            path = Arrow(believed.get_center(), believed.get_center() + RIGHT * 5.0 + UP * 0.6, buff=0, color=MINT, stroke_width=6)
            self.play(GrowArrow(path), run_time=self.rt(1.0))
            self.to_word("safely south")
            self.show(chip("safely south of Scilly?", MINT, size=36).move_to(RIGHT * 3.6 + DOWN * 0.6))
            self.map = VGroup(sea, land, land_lab, scilly, sc_lab, believed, b_lab, path)

        with self.beat("s3"):
            self.to_word("wasn't")
            actual = Dot(LEFT * 0.4 + UP * 0.0, radius=0.14, color=CORAL)
            a_path = Arrow(actual.get_center(), scilly_center := RIGHT * 0.9 + UP * 0.35, buff=0.05, color=CORAL, stroke_width=6)
            self.play(FadeIn(actual, scale=1.5), GrowArrow(a_path), run_time=self.rt(1.0))
            self.to_word("Four ships")
            self.play(slam(stamp("4 SHIPS LOST", CORAL, size=54).move_to(LEFT * 3.2 + DOWN * 0.2)))
            self.to_word("1,400")
            self.show(T("1,400 – 2,000 sailors died", 48, CORAL).move_to(LEFT * 3.0 + DOWN * 2.4))

        with self.beat("s4"):
            self.clear()
            self.head("Why?")
            reasons = VGroup(
                row(icon("map", AMBER, 0.9), T("charts: islands up to 15 miles off", 42, INK), buff=0.4),
                row(icon("compass", AMBER, 0.9), T("compasses: only 4 of 112 fit for use", 42, INK), buff=0.4),
                row(icon("waves", CORAL, 0.9), T("a northward current, described ~100 years later", 42, INK), buff=0.4),
            ).arrange(DOWN, aligned_edge=LEFT, buff=0.55).move_to(DOWN * 0.3)
            fit(reasons, 13, 4.8)
            self.to_word("Charts")
            self.show(reasons[0])
            self.to_word("Compasses")
            self.show(reasons[1])
            self.to_word("current")
            self.show(reasons[2])

        with self.beat("s5"):
            self.clear(keep_head=False)
            q = col(T("“much to ye Northward of what was expected,", 48, INK, bold=False),
                    T("and likewise more to the Eastward”", 48, INK, bold=False), buff=0.25).move_to(UP * 0.8)
            fit(q, 12.5, 2.5)
            self.show(q)
            self.show(T("— captain of HMS Torbay", 36, MUTED).next_to(q, DOWN, buff=0.4))
            self.to_word("unseen current")
            arr = Arrow(LEFT * 1 + DOWN * 2.4, RIGHT * 1 + DOWN * 1.6, buff=0, color=CORAL, stroke_width=8)
            self.play(GrowArrow(arr), run_time=self.rt(0.6))

        with self.beat("s6"):
            self.clear()
            yr = year_stamp("1714", AMBER, 110).move_to(UP * 1.6)
            self.show(yr, T("Longitude Act", 56, INK).next_to(yr, DOWN, buff=0.2))
            self.to_word("20,000")
            self.play(FadeIn(row(icon("coins", AMBER, 1.0), big("£20,000", AMBER, 100), buff=0.4).move_to(DOWN * 0.9), scale=1.2), run_time=self.rt(0.5))
            self.to_word("half a degree")
            self.show(T("within ½ degree  (30 nm at the equator)", 42, MINT).move_to(DOWN * 2.5))

        # ======================= 6. knots today
        with self.beat("k1"):
            self.chapter("Knots today")
            g = row(icon("clock", MUTED, 1.4), icon("satellite", MUTED, 1.4), T("→", 80, MUTED), T("kn", 120, AMBER), buff=0.8).move_to(DOWN * 0.2)
            self.to_word("clocks")
            self.show(g[0])
            self.to_word("satellites")
            self.show(g[1])
            self.to_word("unit")
            self.show(g[2], g[3])

        with self.beat("k2"):
            self.clear()
            self.show(year_stamp("1929", INK, 80).move_to(LEFT * 4 + UP * 1.6), T("1 nm = 1,852 m exactly", 52, AMBER).move_to(RIGHT * 1.6 + UP * 1.6))
            self.to_word("minute of latitude")
            arc = Arc(radius=2.2, start_angle=PI / 6, angle=PI / 3, color=MINT, stroke_width=6).move_to(LEFT * 2.5 + DOWN * 1.0)
            self.play(Create(arc), run_time=self.rt(0.6))
            self.show(T("1′ of latitude ≈ 1 nm", 44, MINT).move_to(RIGHT * 2.8 + DOWN * 0.2))
            self.to_word("60 of them")
            self.show(T("60′ = 1°", 44, INK).move_to(RIGHT * 2.8 + DOWN * 1.0))
            self.to_word("every hour")
            self.show(chip("60 knots north = 1° of latitude an hour", AMBER, size=40).move_to(DOWN * 2.6))

        with self.beat("k3"):
            self.clear()
            plane = icon("plane", INK, 1.6).move_to(LEFT * 4.5 + UP * 0.6)
            self.show(plane)
            self.to_word("250 knots")
            arr = Arrow(LEFT * 3.4 + UP * 0.6, RIGHT * 4.2 + UP * 0.6, buff=0, color=AMBER, stroke_width=8)
            self.play(GrowArrow(arr), plane.animate.shift(RIGHT * 8.4), run_time=self.rt(1.6))
            self.show(T("250 kn × 2 h = 500 nm", 60, AMBER).move_to(DOWN * 0.8))
            self.to_word("latitude scale")
            scale_bar = VGroup(*[Line(UP * 0.0, UP * (0.4 if i % 5 == 0 else 0.2), color=MUTED, stroke_width=3).shift(RIGHT * (-5 + i * 0.25)) for i in range(41)]).move_to(DOWN * 2.4)
            self.play(Create(scale_bar), run_time=self.rt(0.8))

        with self.beat("k4"):
            self.clear()
            wrong = T("knots per hour", 80, CORAL)
            self.show(wrong)
            cross = Line(wrong.get_left(), wrong.get_right(), color=CORAL, stroke_width=10)
            self.play(Create(cross), run_time=self.rt(0.4))
            self.to_word("already a speed")
            self.show(T("a knot is already a speed", 50, MINT).move_to(DOWN * 1.4))
            self.to_word("acceleration")
            self.show(T("per hour again = acceleration", 44, MUTED).move_to(DOWN * 2.4))

        # ======================= 7. your turn
        with self.beat("y1"):
            self.chapter("Your turn")
            steps = VGroup(
                row(log_board(0.35), T("throw the board", 44, INK), buff=0.4),
                row(icon("hourglass", AMBER, 0.8), T("28 s glass: count the knots = speed", 44, INK), buff=0.4),
                row(icon("compass", MINT, 0.8), T("speed × time along the heading = position", 44, INK), buff=0.4),
                row(icon("map-pin", MINT, 0.8), T("a fix wipes the current's error", 44, INK), buff=0.4),
            ).arrange(DOWN, aligned_edge=LEFT, buff=0.4).move_to(DOWN * 0.4)
            fit(steps, 13, 5)
            for w, s in zip(("Throw", "turn", "Speed times", "fix"), steps):
                self.to_word(w)
                self.show(s, rt=0.4)

        with self.beat("y2"):
            self.clear()
            g = row(icon("hourglass", CORAL, 2.0), col(T("glass runs", 50, MUTED), big("30 s", CORAL, 120), buff=0.1),
                    col(T("you count", 50, MUTED), big("7", AMBER, 120), buff=0.1), buff=1.2).move_to(UP * 0.4)
            self.to_word("30 seconds")
            self.show(g[0], g[1])
            self.to_word("count 7")
            self.show(g[2])
            self.to_word("more than 7")
            self.show(T("more than 7 knots, or less?", 64, INK).move_to(DOWN * 2.2))

        with self.beat("y3"):
            self.to_word("comments")
            self.show(chip("answer in the comments", AMBER, size=44).move_to(DOWN * 3.2))
            self.to_word("short")
            self.play(FadeOut(self._head), run_time=self.rt(0.3))
            self._head = None
            self.show(T("…and a glass that runs short?", 44, MUTED).move_to(UP * 2.7))


class Thumbnail(Scene):
    def construct(self):
        line = knot_line(7, 1.3).move_to(DOWN * 1.9 + RIGHT * 0.3)
        board = log_board(0.6).move_to(line[0].get_end() + RIGHT * 0.5)
        ship = icon("sailboat", INK, 1.8).move_to(LEFT * 5.6 + DOWN * 1.3)
        top = fit(Text("7 knots = 7 knots", font=FONT_BOLD, color=AMBER, font_size=130), 13, 2).move_to(UP * 2.0)
        sub = Text("speed from a rope", font=FONT_BOLD, color=INK, font_size=84).move_to(UP * 0.4)
        self.add(line, board, ship, top, sub)
