"""How a camera that never saw you speeding proves you did. Long-form, 16:9, Manim.

Expands the 21 Oct Short (average-speed). Chapters: the fine / how the cameras time you (plates,
clocks, the division, braking at the end) / why you hit 120 (area under the speed curve, speed can't
jump) / the ghost car (Rolle, the mean value theorem, the parallel line) / every stretch? (Lévy's
universal chord theorem and a drive that's too fast on every 2 km stretch) / what the camera knows /
your turn. Every number is computed in verify.py.
"""
import json
import math
import os

from kit.brand import *
from kit.visuals import *

SAY = {b["id"]: b["say"] for b in json.load(open(os.path.join(EP, "script.json")))["beats"]}
STAGE_Y = 0.15

# the drive from the Short: 95 at both cameras, averages 120 over 150 s
T_TRIP, CAM_V, AVG = 150.0, 95.0, 120.0
AMP = (AVG - CAM_V) * math.pi / 2
def speed(t):
    return CAM_V + AMP * math.sin(math.pi * t / T_TRIP)
def dist_m(t):
    # integral of speed (km/h -> m/s)
    return (CAM_V * t + AMP * T_TRIP / math.pi * (1 - math.cos(math.pi * t / T_TRIP))) / 3.6
def gap_m(t):
    return dist_m(t) - AVG / 3.6 * t   # you minus the ghost (negative = behind)

# Lévy's counterexample: time to reach fraction x of the 5 km (r = 0.4 -> waves every 2 km)
R, A_W = 0.4, 0.03
def t_of_x(x):
    return T_TRIP * (x + A_W * (math.sin(math.pi * x / R) ** 2 - x))
def v_of_x(x):
    return AVG / (1 + A_W * (math.pi / R * math.sin(2 * math.pi * x / R) - 1))


def T(s, size=44, color=INK, bold=True):
    return Text(s, font=FONT_BOLD if bold else FONT_MED, color=color, font_size=size)


def mono(s, size=40, color=INK):
    return Text(s, font=FONT_MONO, color=color, font_size=size)


def big(s, color=AMBER, size=150):
    return Text(s, font=FONT_BOLD, color=color, font_size=size)


def labelled_icon(name, text, color=MINT, h=1.3, size=34):
    i = icon(name, color, h)
    return VGroup(i, T(text, size, INK, bold=False).next_to(i, DOWN, buff=0.25))


ROAD_L, ROAD_R, ROAD_Y = -5.6, 5.6, -0.9


def road(y=ROAD_Y, left=ROAD_L, right=ROAD_R):
    body = Rectangle(width=right - left + 0.6, height=0.7, fill_color=DIM, fill_opacity=1, stroke_width=0).move_to([(left + right) / 2, y, 0])
    dash = DashedLine([left, y, 0], [right, y, 0], color=MUTED, dash_length=0.25, stroke_width=3)
    return VGroup(body, dash)


def camera_post(x, y=ROAD_Y, label=None, color=INK):
    pole = Line([x, y + 0.35, 0], [x, y + 1.6, 0], color=MUTED, stroke_width=5)
    cam = icon("cctv", color, 0.8).move_to([x, y + 1.95, 0])
    g = VGroup(pole, cam)
    if label:
        g.add(T(label, 30, MUTED, False).next_to(cam, UP, buff=0.12))
    return g


def car_icon(x, y=ROAD_Y, color=AMBER, h=0.7):
    return icon("car", color, h).move_to([x, y + 0.05, 0])


def plate(text="SP3 C5", color=AMBER):
    t = mono(text, 34, BG)
    box = RoundedRectangle(corner_radius=0.08, width=t.width + 0.4, height=t.height + 0.25, fill_color=color, fill_opacity=1, stroke_width=0)
    t.move_to(box)
    return VGroup(box, t)


def speed_axes(x_len=10.0, y_len=4.6, center=DOWN * 0.35):
    ax = Axes(x_range=[0, 150, 30], y_range=[80, 145, 20], x_length=x_len, y_length=y_len,
              axis_config={"color": MUTED, "stroke_width": 2, "include_ticks": False}, tips=False).move_to(center)
    xl = T("time (s)", 28, MUTED, False).next_to(ax.x_axis, DOWN, buff=0.2).align_to(ax.x_axis, RIGHT)
    yl = T("speed (km/h)", 28, MUTED, False).next_to(ax.y_axis, UP, buff=0.15).align_to(ax.y_axis, LEFT)
    ticks = VGroup(*[T(str(v), 26, MUTED, False).next_to(ax.c2p(0, v), LEFT, buff=0.15) for v in (100, 120, 140)])
    return ax, VGroup(ax, xl, yl, ticks)


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

    def drive_scene(self, x0=-4.0, x1=4.0):
        rd = road()
        c1 = camera_post(x0, label="camera 1")
        c2 = camera_post(x1, label="camera 2")
        return rd, c1, c2

    def speed_graph(self, rt=1.0, center=DOWN * 0.35):
        ax, axg = speed_axes(center=center)
        self.play(Create(axg), run_time=self.rt(0.7))
        curve = ax.plot(speed, x_range=[0, 150], color=AMBER, stroke_width=6)
        self.play(Create(curve), run_time=self.rt(rt))
        return ax, axg, curve

    # ------------------------------------------------------------ the episode
    def construct(self):
        # ======================= 1. the fine
        with self.beat("hook"):
            card = hook_card("120", "BRAKED TO 95", "still fined")
            self.open_with(card)
            self.to_word("120")
            self.play(Indicate(card[1], color=CORAL, scale_factor=1.08), run_time=self.rt(0.6))

        with self.beat("promise"):
            self.play(FadeOut(card), run_time=self.rt(0.4))
            items = VGroup(labelled_icon("cctv", "it never saw you", MINT),
                           labelled_icon("scroll-text", "a theorem from 1691", AMBER),
                           labelled_icon("route", "fast on every stretch,\nlegal on the road", CORAL)).arrange(RIGHT, buff=1.0)
            fit(items, 12.0, 4)
            items.move_to(UP * STAGE_Y)
            self.show(items[0])
            self.to_word("theorem")
            self.show(items[1])
            self.to_word("strange twist")
            self.show(items[2])

        with self.beat("recap1"):
            self.clear()
            rd, c1, c2 = self.drive_scene()
            sign = VGroup(Circle(radius=0.45, color=CORAL, stroke_width=8), T("100", 34, INK)).move_to([-5.2, 1.4, 0])
            self.show(rd, sign)
            car = car_icon(-5.6)
            self.add(car)
            self.play(car.animate.move_to([-5.0, ROAD_Y + 0.05, 0]), run_time=self.rt(0.6))
            self.to_word("camera")
            self.show(c1)
            self.to_word("brake")
            sp = chip("95", MINT).next_to(car, UP, buff=0.25)
            self.play(car.animate.move_to([-4.0, ROAD_Y + 0.05, 0]), FadeIn(sp), run_time=self.rt(0.8))
            self.play(sp.animate.next_to([-4.0, ROAD_Y + 0.4, 0], UP, buff=0.2), run_time=0.2)
            self.to_word("5 kilometers")
            self.show(c2)
            br = BraceBetweenPoints([-4, ROAD_Y - 0.45, 0], [4, ROAD_Y - 0.45, 0], DOWN, color=MUTED)
            self.show(br, T("5 km", 40, INK).next_to(br, DOWN, buff=0.15))
            self.to_word("again")
            self.play(car.animate.move_to([4.0, ROAD_Y + 0.05, 0]), sp.animate.next_to([4.0, ROAD_Y + 0.4, 0], UP, buff=0.2),
                      run_time=self.rt(1.2))
            self.stage = VGroup(rd, c1, c2, car, sp, sign, br)

        with self.beat("recap2"):
            self.clear()
            env = icon("mail", INK, 2.2).move_to(LEFT * 3.5 + UP * STAGE_Y)
            self.play(FadeIn(env, shift=UP * 0.5), run_time=self.rt(0.5))
            self.to_word("120")
            fine = VGroup(T("average speed", 40, MUTED, False), big("120 km/h", CORAL, 110)).arrange(DOWN, buff=0.3).move_to(RIGHT * 2.2 + UP * 0.6)
            self.play(slam(fine), run_time=self.rt(0.4))
            self.to_word("95")
            both = VGroup(chip("camera 1: 95", MINT), chip("camera 2: 95", MINT)).arrange(RIGHT, buff=0.4).move_to(RIGHT * 2.2 + DOWN * 1.4)
            self.show(both)
            self.to_word("nobody")
            self.play(Indicate(fine[1], color=CORAL), run_time=self.rt(0.6))

        with self.beat("recap3"):
            self.clear()
            q = T("a speed nobody saw?", 64, INK).move_to(UP * 1.4)
            self.show(q)
            self.to_word("two ideas")
            ideas = VGroup(labelled_icon("divide", "a division", MINT, 1.4, 38),
                           labelled_icon("sigma", "a theorem from calculus", AMBER, 1.4, 38)).arrange(RIGHT, buff=2.0).move_to(DOWN * 0.9)
            self.show(ideas[0])
            self.to_word("theorems")
            self.show(ideas[1])

        # ======================= 2. how the cameras time you
        with self.beat("spec1"):
            self.chapter("How the cameras time you")
            rd, c1, c2 = self.drive_scene()
            self.show(rd, c1, c2)
            self.to_word("SPECS")
            self.specs = chip("SPECS · approved 1999", AMBER).move_to(UP * 2.2)
            self.show(self.specs)
            self.stage = VGroup(rd, c1, c2)

        with self.beat("spec2"):
            rd, c1, c2 = self.stage
            car = car_icon(-5.6)
            self.add(car)
            self.play(car.animate.move_to([-4.0, ROAD_Y + 0.05, 0]), run_time=self.rt(0.8))
            beam = Polygon(c1[1].get_bottom(), [-4.5, ROAD_Y + 0.3, 0], [-3.5, ROAD_Y + 0.3, 0], fill_color=AMBER, fill_opacity=0.25, stroke_width=0)
            self.play(FadeIn(beam), run_time=self.rt(0.3))
            self.to_word("infrared")
            self.play(FadeOut(self.specs), run_time=self.rt(0.2))
            self.show(T("infrared: day and night", 32, MUTED, False).move_to(UP * 2.2))
            self.to_word("plate")
            rec = VGroup(plate(), mono("12:04:10.0", 36, INK)).arrange(DOWN, buff=0.2).move_to([-1.8, 1.2, 0])
            self.play(FadeIn(rec, shift=LEFT * 0.4), FadeOut(beam), run_time=self.rt(0.5))
            self.stage = VGroup(rd, c1, c2, car, rec)

        with self.beat("spec3"):
            rd, c1, c2, car, rec = self.stage
            self.play(car.animate.move_to([4.0, ROAD_Y + 0.05, 0]), run_time=self.rt(1.2))
            rec2 = VGroup(plate(), mono("12:06:40.0", 36, INK)).arrange(DOWN, buff=0.2).move_to([1.8, 1.2, 0])
            self.play(FadeIn(rec2, shift=RIGHT * 0.4), run_time=self.rt(0.5))
            self.to_word("distance")
            br = BraceBetweenPoints([-4, ROAD_Y - 0.45, 0], [4, ROAD_Y - 0.45, 0], DOWN, color=MINT)
            self.show(br, T("5 km", 40, MINT).next_to(br, DOWN, buff=0.15))
            self.stage = VGroup(rd, c1, c2, car, rec, rec2, br)

        with self.beat("spec4"):
            self.clear()
            l1 = VGroup(mono("12:06:40.0", 48), mono("− 12:04:10.0", 48, MUTED), mono("= 150 s", 56, AMBER)).arrange(DOWN, buff=0.25, aligned_edge=RIGHT)
            l1.move_to(LEFT * 4.9 + UP * 0.4)
            self.show(l1)
            self.to_word("33")
            l2 = T("5,000 m ÷ 150 s = 33.3 m/s", 40, INK).move_to(RIGHT * 2.6 + UP * 1.0)
            self.show(l2)
            self.to_word("3.6")
            l3 = VGroup(T("× 3.6 =", 48, MUTED), big("120 km/h", CORAL, 90)).arrange(RIGHT, buff=0.3).move_to(RIGHT * 2.6 + DOWN * 0.6)
            self.play(FadeIn(l3, scale=1.2), run_time=self.rt(0.5))

        with self.beat("spec5"):
            self.clear()
            parts = VGroup(labelled_icon("clock", "two clocks", MINT, 1.5, 38), labelled_icon("ruler", "a ruler", MINT, 1.5, 38)).arrange(RIGHT, buff=2.4).move_to(UP * 0.5)
            self.to_word("never needed")
            gauge = labelled_icon("gauge", "your speed", CORAL, 1.5, 38).move_to(UP * 0.5)
            self.show(gauge)
            x = Cross(gauge[0], stroke_color=CORAL, stroke_width=8)
            self.play(Create(x), run_time=self.rt(0.4))
            self.to_word("two clocks")
            self.play(FadeOut(VGroup(gauge, x)), FadeIn(parts, shift=UP * 0.2), run_time=self.rt(0.5))
            self.to_word("braking")
            self.show(T("braking changes your speed there, not the time between", 36, MUTED, False).move_to(DOWN * 2.0))

        with self.beat("spec6"):
            self.clear()
            bars = VGroup(
                VGroup(T("at 100", 40, MINT), Rectangle(width=9.0 * 180 / 180, height=0.6, fill_color=MINT, fill_opacity=1, stroke_width=0), T("180 s", 40, MINT)).arrange(RIGHT, buff=0.3),
                VGroup(T("you", 40, CORAL), Rectangle(width=9.0 * 150 / 180, height=0.6, fill_color=CORAL, fill_opacity=1, stroke_width=0), T("150 s", 40, CORAL)).arrange(RIGHT, buff=0.3),
            ).arrange(DOWN, buff=0.6, aligned_edge=LEFT).move_to(UP * 0.6)
            fit(bars, 12.4, 3)
            self.play(GrowFromEdge(bars[0], LEFT), run_time=self.rt(0.7))
            self.to_word("150")
            self.play(GrowFromEdge(bars[1], LEFT), run_time=self.rt(0.7))
            self.to_word("30 seconds")
            self.show(chip("30 seconds saved", AMBER).move_to(LEFT * 2.0 + DOWN * 1.4))
            self.to_word("fine")
            self.play(slam(stamp("FINED", CORAL, -8, 60).move_to(RIGHT * 3.4 + DOWN * 1.5)))

        with self.beat("spec7"):
            self.clear()
            rd = road(y=-0.2)
            self.show(rd)
            short = VGroup(camera_post(-5.0, y=-0.2), camera_post(-3.6, y=-0.2))
            self.show(short)
            self.show(T("75 m", 36, MINT).move_to([-4.3, -1.0, 0]))
            self.to_word("10 kilometers")
            far = camera_post(5.0, y=-0.2)
            self.show(far)
            self.show(T("… up to about 10 km", 36, MINT).move_to([1.5, -1.0, 0]))
            self.to_word("Netherlands")
            flags = T("Netherlands · Austria · Italy · Poland", 40, INK, False).move_to(DOWN * 2.2)
            self.show(flags)

        with self.beat("spec8"):
            self.clear()
            mb = icon("motorbike", AMBER, 2.0).move_to(LEFT * 2.6 + UP * 0.4)
            self.show(mb)
            self.show(T("no front plate", 40, CORAL).next_to(mb, DOWN, buff=0.3))
            self.to_word("other way")
            cam = icon("cctv", INK, 1.6).move_to(RIGHT * 2.8 + UP * 0.4).flip(UP)
            self.show(cam, T("reads the back", 40, MINT).next_to(cam, DOWN, buff=0.3))

        with self.beat("myth1"):
            self.clear()
            self.head("Brake hard at the end?", CORAL)
            rd, c1, c2 = self.drive_scene()
            self.show(rd, c1, c2)
            fast = Line([-4, ROAD_Y - 0.6, 0], [2.4, ROAD_Y - 0.6, 0], color=CORAL, stroke_width=12)
            self.to_word("120 for")
            self.play(Create(fast), run_time=self.rt(0.8))
            self.show(T("4 km at 120", 38, CORAL).next_to(fast, DOWN, buff=0.2))
            self.to_word("120 seconds")
            self.show(chip("120 s", CORAL).move_to([-1.5, 2.3, 0]))
            self.stage = VGroup(rd, c1, c2, fast)

        with self.beat("myth2"):
            self.to_word("180")
            self.show(chip("needed: 180 s", MINT).move_to([1.5, 2.3, 0]))
            self.to_word("60")
            slow = Line([2.4, ROAD_Y - 0.6, 0], [4.0, ROAD_Y - 0.6, 0], color=MINT, stroke_width=12)
            self.play(Create(slow), run_time=self.rt(0.5))
            self.show(T("last km: 60 s", 38, MINT).next_to(slow, DOWN, buff=0.2).shift(RIGHT * 0.3))
            self.to_word("60 kilometers an hour")
            self.play(FadeIn(big("60 km/h", AMBER, 80).move_to(UP * 1.1), scale=1.3), run_time=self.rt(0.5))

        with self.beat("myth3"):
            self.clear()
            self.play(FadeIn(T("the average remembers every second", 56, AMBER).move_to(UP * STAGE_Y), scale=1.1), run_time=self.rt(0.6))

        # ======================= 3. why you hit 120
        with self.beat("mvt1"):
            self.chapter("Why you hit 120")
            claim = VGroup(icon("gauge", AMBER, 1.6), T("at some moment: exactly 120", 52, INK)).arrange(RIGHT, buff=0.5).move_to(UP * STAGE_Y)
            self.show(claim)
            self.to_word("fair")
            self.show(T("nobody saw it", 40, CORAL).move_to(DOWN * 1.6))

        with self.beat("mvt2"):
            self.clear()
            ax, axg = speed_axes()
            self.play(Create(axg), run_time=self.rt(0.8))
            self.to_word("start at 95")
            d0 = Dot(ax.c2p(0, 95), color=MINT, radius=0.12)
            self.play(FadeIn(d0, scale=2), run_time=self.rt(0.3))
            self.show(T("95", 32, MINT).next_to(d0, RIGHT, buff=0.15))
            self.to_word("end at 95")
            d1 = Dot(ax.c2p(150, 95), color=MINT, radius=0.12)
            self.play(FadeIn(d1, scale=2), run_time=self.rt(0.3))
            curve = ax.plot(speed, x_range=[0, 150], color=AMBER, stroke_width=6)
            self.play(Create(curve), run_time=self.rt(1.2))
            self.ax, self.curve = ax, curve

        with self.beat("mvt3"):
            ax, curve = self.ax, self.curve
            avg = DashedLine(ax.c2p(0, 120), ax.c2p(150, 120), color=MINT, stroke_width=4)
            self.play(Create(avg), run_time=self.rt(0.5))
            self.show(T("average 120", 30, MINT).next_to(ax.c2p(8, 120), UP, buff=0.1).align_to(ax.c2p(8, 120), LEFT))
            self.to_word("area")
            area = ax.get_area(curve, x_range=[0, 150], color=AMBER, opacity=0.25)
            self.play(FadeIn(area), run_time=self.rt(0.6))
            self.to_word("distance")
            self.show(chip("area = 5 km", AMBER).move_to(ax.c2p(75, 100)))
            self.avg_line = avg

        with self.beat("mvt4"):
            ax = self.ax
            low = ax.plot(lambda t: 95 + 20 * math.sin(math.pi * t / 150), x_range=[0, 150], color=CORAL, stroke_width=5)
            self.to_word("below 120")
            self.play(Create(low), run_time=self.rt(0.8))
            self.to_word("late")
            self.show(T("less than 5 km: late", 36, CORAL).move_to(ax.c2p(75, 88)))
            self.to_word("didn't")
            self.play(FadeOut(low), run_time=self.rt(0.4))

        with self.beat("mvt5"):
            ax = self.ax
            pk = Dot(ax.c2p(75, speed(75)), color=AMBER, radius=0.12)
            self.to_word("above 120")
            self.play(Indicate(self.curve, color=AMBER), run_time=self.rt(0.6))
            self.to_word("134")
            self.play(FadeIn(pk, scale=2), run_time=self.rt(0.3))
            self.show(T("peak ≈ 134", 34, AMBER).next_to(pk, UP, buff=0.15))

        with self.beat("mvt6"):
            self.clear()
            self.head("Speed can't jump")
            nl = NumberLine(x_range=[90, 140, 10], length=11, color=MUTED, include_numbers=False).move_to(DOWN * 0.3)
            labs = VGroup(*[T(str(v), 30, MUTED, False).next_to(nl.n2p(v), DOWN, buff=0.2) for v in (90, 100, 110, 120, 130, 140)])
            self.show(nl, labs)
            self.to_word("110 to 130")
            jump = CurvedArrow(nl.n2p(110) + UP * 0.3, nl.n2p(130) + UP * 0.3, angle=-1.2, color=CORAL, stroke_width=6)
            self.play(Create(jump), run_time=self.rt(0.5))
            x = Cross(scale_factor=0.4, stroke_color=CORAL).move_to(nl.n2p(120) + UP * 1.5)
            self.play(Create(x), run_time=self.rt(0.3))
            self.to_word("95 up")
            self.play(FadeOut(jump), FadeOut(x), run_time=self.rt(0.3))
            dot = Dot(nl.n2p(95), color=AMBER, radius=0.16)
            self.add(dot)
            self.play(dot.animate.move_to(nl.n2p(134)), run_time=self.rt(2.0), rate_func=rate_functions.linear)
            self.stage = VGroup(nl, labs, dot)

        with self.beat("mvt7"):
            nl, labs, dot = self.stage
            self.play(Flash(nl.n2p(120), color=AMBER, line_length=0.4), Indicate(labs[3], color=AMBER, scale_factor=1.6), run_time=self.rt(0.6))
            self.to_word("33 seconds")
            self.clear()
            self.head("Why you hit 120")
            ax, axg = speed_axes()
            curve = ax.plot(speed, x_range=[0, 150], color=AMBER, stroke_width=6)
            avg = DashedLine(ax.c2p(0, 120), ax.c2p(150, 120), color=MINT, stroke_width=4)
            self.play(FadeIn(axg), FadeIn(curve), FadeIn(avg), run_time=self.rt(0.5))
            p1 = Dot(ax.c2p(33, 120), color=AMBER, radius=0.14)
            self.play(FadeIn(p1, scale=2), run_time=self.rt(0.3))
            self.show(T("33 s: 120", 32, AMBER).next_to(p1, UL, buff=0.1))
            self.to_word("117")
            p2 = Dot(ax.c2p(117, 120), color=AMBER, radius=0.14)
            self.play(FadeIn(p2, scale=2), run_time=self.rt(0.3))
            self.show(T("117 s: 120", 32, AMBER).next_to(p2, UR, buff=0.1))
            self.ax, self.curve = ax, curve

        with self.beat("mvt7b"):
            ax = self.ax
            above = ax.get_area(self.curve, x_range=[33, 117], bounded_graph=ax.plot(lambda t: 120, x_range=[33, 117]), color=CORAL, opacity=0.35)
            self.play(FadeIn(above), run_time=self.rt(0.6))
            self.to_word("84")
            self.show(chip("84 s above 120", CORAL).move_to(ax.c2p(75, 92)))
            self.to_word("two moments")
            self.play(*[Flash(ax.c2p(t, 95), color=MINT) for t in (0, 150)], run_time=self.rt(0.6))

        with self.beat("mvt8"):
            self.clear()
            g = VGroup(icon("gauge", AMBER, 1.8), big("120", AMBER, 160)).arrange(RIGHT, buff=0.6).move_to(UP * 0.6)
            self.play(FadeIn(g, scale=1.2), run_time=self.rt(0.5))
            self.to_word("any drive")
            self.show(T("for any drive that averages 120", 44, INK, False).move_to(DOWN * 1.6))

        with self.beat("sub1"):
            self.clear(keep_head=False)
            s = VGroup(icon("bell", AMBER, 1.2), T("the math inside everyday things", 48, INK)).arrange(RIGHT, buff=0.5).move_to(UP * 0.4)
            self.show(s)
            self.to_word("two new")
            self.show(T("two new ones every day", 38, MUTED, False).move_to(DOWN * 1.2))

        # ======================= 4. the ghost car
        with self.beat("ghost1"):
            self.chapter("The ghost car")
            gh = icon("ghost", MINT, 2.2).move_to(UP * STAGE_Y)
            self.play(FadeIn(gh, scale=1.3), run_time=self.rt(0.6))
            self.stage = gh

        with self.beat("ghost2"):
            self.clear()
            rd, c1, c2 = self.drive_scene()
            self.show(rd, c1, c2)
            you = car_icon(-4.0, ROAD_Y + 0.25, AMBER, 0.55)
            gh = icon("ghost", MINT, 0.6).move_to([-4.0, ROAD_Y - 0.15, 0])
            self.show(you, gh)
            self.to_word("exactly 120")
            self.show(chip("ghost: always 120", MINT).move_to(UP * 2.1))
            self.to_word("150 seconds")
            self.play(gh.animate.move_to([4.0, ROAD_Y - 0.15, 0]), run_time=self.rt(1.5), rate_func=rate_functions.linear)
            self.stage = VGroup(rd, c1, c2, you, gh)

        with self.beat("ghost3"):
            rd, c1, c2, you, gh = self.stage
            self.play(gh.animate.move_to([-4.0, ROAD_Y - 0.15, 0]), run_time=self.rt(0.4))
            # race: you and the ghost by their real positions, compressed in time
            tr = ValueTracker(0)
            px = lambda m: -4.0 + 8.0 * m / 5000
            you.add_updater(lambda m: m.move_to([px(dist_m(tr.get_value())), ROAD_Y + 0.25, 0]))
            gh.add_updater(lambda m: m.move_to([px(AVG / 3.6 * tr.get_value()), ROAD_Y - 0.15, 0]))
            self.play(tr.animate.set_value(150), run_time=self.rt(2.2), rate_func=rate_functions.linear)
            you.clear_updaters(); gh.clear_updaters()
            self.show(T("start together, finish together", 38, INK, False).move_to(UP * 2.1))

        with self.beat("ghost4"):
            self.clear()
            ax = Axes(x_range=[0, 150, 30], y_range=[-130, 130, 50], x_length=10, y_length=4.6,
                      axis_config={"color": MUTED, "stroke_width": 2, "include_ticks": False}, tips=False).move_to(DOWN * 0.35)
            labs = VGroup(T("you ahead", 28, AMBER, False).next_to(ax.c2p(0, 125), RIGHT, buff=0.2),
                          T("ghost ahead", 28, MINT, False).next_to(ax.c2p(150, -125), LEFT, buff=0.2),
                          T("time (s)", 28, MUTED, False).next_to(ax.c2p(150, 0), DOWN, buff=0.2))
            self.play(Create(ax), FadeIn(labs), run_time=self.rt(0.6))
            g = ax.plot(gap_m, x_range=[0, 150], color=AMBER, stroke_width=6)
            self.to_word("pulls ahead")
            part = ax.plot(gap_m, x_range=[0, 33], color=AMBER, stroke_width=6)
            self.play(Create(part), run_time=self.rt(1.0))
            self.to_word("110 meters")
            d = Dot(ax.c2p(33, gap_m(33)), color=MINT, radius=0.13)
            self.play(FadeIn(d, scale=2), run_time=self.rt(0.3))
            self.show(T("33 s: ghost 110 m ahead", 32, MINT).next_to(d, DOWN, buff=0.2))
            self.ax, self.gap_curve, self.part = ax, g, part

        with self.beat("ghost5"):
            ax = self.ax
            tan = Line(ax.c2p(13, gap_m(33)), ax.c2p(53, gap_m(33)), color=INK, stroke_width=4)
            self.to_word("stops growing")
            self.play(Create(tan), run_time=self.rt(0.5))
            self.to_word("120")
            self.show(chip("your speed = ghost's = 120", AMBER).move_to(UP * 2.55))
            self.tan1 = tan

        with self.beat("ghost6"):
            ax = self.ax
            self.to_word("reel it in")
            self.play(Create(ax.plot(gap_m, x_range=[33, 117], color=AMBER, stroke_width=6)), run_time=self.rt(1.2))
            self.to_word("110 meters ahead")
            d = Dot(ax.c2p(117, gap_m(117)), color=AMBER, radius=0.13)
            self.play(FadeIn(d, scale=2), run_time=self.rt(0.3))
            self.show(T("117 s: you 110 m ahead", 32, AMBER).next_to(d, LEFT, buff=0.3))
            tan = Line(ax.c2p(97, gap_m(117)), ax.c2p(137, gap_m(117)), color=INK, stroke_width=4)
            self.play(Create(tan), run_time=self.rt(0.4))
            self.play(Create(ax.plot(gap_m, x_range=[117, 150], color=AMBER, stroke_width=6)), run_time=self.rt(0.6))

        with self.beat("ghost7"):
            self.clear()
            ax = Axes(x_range=[0, 10, 1], y_range=[-3, 3, 1], x_length=9, y_length=3.6,
                      axis_config={"color": MUTED, "stroke_width": 2, "include_ticks": False}, tips=False).move_to(DOWN * 0.3)
            self.play(Create(ax), run_time=self.rt(0.4))
            self.to_word("starts at zero")
            z = VGroup(Dot(ax.c2p(0, 0), color=MINT, radius=0.12), Dot(ax.c2p(10, 0), color=MINT, radius=0.12))
            self.play(FadeIn(z, scale=2), run_time=self.rt(0.4))
            curves = [lambda x: 2.2 * math.sin(math.pi * x / 10) * math.cos(x / 2.4),
                      lambda x: -1.8 * math.sin(math.pi * x / 10) ** 2 + 0.8 * math.sin(2 * math.pi * x / 10),
                      lambda x: 2.4 * math.sin(math.pi * x / 10) * math.sin(3 * math.pi * x / 10)]
            c = ax.plot(curves[0], x_range=[0, 10], color=AMBER, stroke_width=5)
            self.to_word("biggest")
            self.play(Create(c), run_time=self.rt(0.8))
            for f in curves[1:]:
                self.play(Transform(c, ax.plot(f, x_range=[0, 10], color=AMBER, stroke_width=5)), run_time=self.rt(0.8))
            self.to_word("same speed")
            self.show(chip("at the peak: same speed", AMBER).move_to(UP * 2.0))

        with self.beat("ghost8"):
            self.clear()
            name = VGroup(T("Rolle's theorem", 64, AMBER), year_stamp("1691", MUTED, 60)).arrange(RIGHT, buff=0.5).move_to(UP * 1.3)
            self.show(name)
            self.to_word("Tilt")
            mvt = VGroup(T("mean value theorem", 56, INK),
                         T("speed at some moment = average speed", 36, MINT, False)).arrange(DOWN, buff=0.3).move_to(DOWN * 1.0)
            self.show(mvt)

        with self.beat("ghost9"):
            self.clear()
            c = VGroup(T("Augustin-Louis Cauchy", 56, INK), year_stamp("1823", AMBER, 80),
                       T("the modern form", 38, MUTED, False)).arrange(DOWN, buff=0.35).move_to(UP * STAGE_Y)
            self.show(c)

        with self.beat("ghost10"):
            self.clear()
            ax = Axes(x_range=[0, 150, 30], y_range=[0, 5200, 1000], x_length=9.5, y_length=4.6,
                      axis_config={"color": MUTED, "stroke_width": 2, "include_ticks": False}, tips=False).move_to(DOWN * 0.35)
            labs = VGroup(T("time", 28, MUTED, False).next_to(ax.c2p(150, 0), DOWN, buff=0.2),
                          T("distance", 28, MUTED, False).next_to(ax.c2p(0, 5200), UP, buff=0.1))
            self.play(Create(ax), FadeIn(labs), run_time=self.rt(0.5))
            d = ax.plot(dist_m, x_range=[0, 150], color=AMBER, stroke_width=6)
            self.play(Create(d), run_time=self.rt(1.0))
            self.to_word("straight line")
            ch = Line(ax.c2p(0, 0), ax.c2p(150, 5000), color=MINT, stroke_width=4)
            self.play(Create(ch), run_time=self.rt(0.6))
            self.to_word("parallel")
            slope = (5000 / 150)
            for tc in (33, 117):
                y = dist_m(tc)
                tl = Line(ax.c2p(tc - 30, y - slope * 30), ax.c2p(tc + 30, y + slope * 30), color=INK, stroke_width=4)
                self.play(Create(tl), FadeIn(Dot(ax.c2p(tc, y), color=INK, radius=0.1)), run_time=self.rt(0.5))

        with self.beat("ghost11"):
            self.clear()
            sm = VGroup(T("needs a smooth trip", 52, INK), T("no teleporting", 44, CORAL)).arrange(DOWN, buff=0.4).move_to(UP * 0.5)
            self.show(sm[0])
            self.to_word("teleporting")
            self.show(sm[1])
            self.to_word("never instantly")
            self.show(chip("real cars qualify", MINT).move_to(DOWN * 1.6))

        # ======================= 5. every stretch?
        with self.beat("chord1"):
            self.chapter("Every stretch?")
            rd = road(y=-0.4)
            self.show(rd)
            self.to_word("1 kilometer")
            win = Rectangle(width=11.2 / 5, height=0.9, stroke_color=AMBER, stroke_width=6).move_to([-5.6 + 11.2 / 10, -0.4, 0])
            self.play(Create(win), run_time=self.rt(0.4))
            q1 = T("some 1 km at exactly 120?", 44, AMBER).move_to(UP * 1.6)
            self.show(q1)
            self.stage = VGroup(rd, win, q1)

        with self.beat("chord2"):
            rd, win, q1 = self.stage
            self.play(FadeOut(win), FadeOut(q1), run_time=self.rt(0.3))
            times = [33.6, 28.0, 26.6, 28.2, 33.6]  # illustrative pieces of 30 average
            cells = VGroup()
            for i, tsec in enumerate([34, 28, 27, 28, 33]):
                r = Rectangle(width=11.2 / 5 - 0.08, height=0.7, fill_color=MINT if tsec < 30 else CORAL, fill_opacity=0.6, stroke_width=0)
                r.move_to([-5.6 + 11.2 / 5 * (i + 0.5), -0.4, 0])
                cells.add(VGroup(r, mono(f"{tsec} s", 32, INK).move_to(r)))
            self.to_word("5 pieces")
            self.play(LaggedStart(*[FadeIn(c) for c in cells], lag_ratio=0.15), run_time=self.rt(1.0))
            self.to_word("at most 30")
            self.show(T("total 150 s: average 30 s per piece", 36, MUTED, False).move_to(DOWN * 1.6))
            self.to_word("all quicker")
            self.show(T("some under 30, some over", 40, INK).move_to(UP * 1.6))
            del times
            self.stage = VGroup(rd, cells)

        with self.beat("chord3"):
            self.clear()
            rd = road(y=-0.4)
            self.add(rd)
            win = Rectangle(width=11.2 / 5, height=0.9, stroke_color=AMBER, stroke_width=6).move_to([-5.6 + 11.2 / 10, -0.4, 0])
            self.show(win)
            tr = ValueTracker(34.0)
            lab = always_redraw(lambda: mono(f"{tr.get_value():.1f} s", 44, AMBER).next_to(win, UP, buff=0.3))
            self.add(lab)
            self.to_word("slide")
            self.play(win.animate.shift(RIGHT * 11.2 / 5 * 1.2), tr.animate.set_value(30.0), run_time=self.rt(1.8))
            self.to_word("exactly 30")
            self.play(Flash(win.get_top(), color=AMBER), run_time=self.rt(0.4))
            self.show(chip("1 km at exactly 120", AMBER).move_to(DOWN * 1.6))

        with self.beat("chord4"):
            self.clear()
            rows = VGroup(*[VGroup(T(lbl, 40, INK), T("✓", 44, MINT)).arrange(RIGHT, buff=0.4) for lbl in
                            ("5 ÷ 2 = 2.5 km", "5 ÷ 3 = 1.67 km", "5 ÷ 4 = 1.25 km", "5 ÷ 5 = 1 km")]).arrange(DOWN, buff=0.35, aligned_edge=LEFT).move_to(UP * 0.1)
            self.to_word("half")
            self.show(rows[0])
            self.to_word("third")
            self.show(rows[1])
            self.to_word("quarter")
            self.show(rows[2], rows[3])

        with self.beat("chord5"):
            self.clear()
            q = T("a 2 km stretch at 120?", 60, INK).move_to(UP * 0.6)
            self.show(q)
            self.to_word("Not necessarily")
            self.play(slam(stamp("NOT NECESSARILY", CORAL, -6, 60).move_to(DOWN * 1.3)))

        with self.beat("chord6"):
            self.clear()
            ax = Axes(x_range=[0, 5, 1], y_range=[90, 170, 20], x_length=10, y_length=4.4,
                      axis_config={"color": MUTED, "stroke_width": 2, "include_ticks": False}, tips=False).move_to(DOWN * 0.35)
            labs = VGroup(T("distance (km)", 28, MUTED, False).next_to(ax.c2p(5, 90), DOWN, buff=0.2),
                          T("speed (km/h)", 28, MUTED, False).next_to(ax.c2p(0, 170), UP, buff=0.1),
                          *[T(str(v), 26, MUTED, False).next_to(ax.c2p(0, v), LEFT, buff=0.15) for v in (100, 120, 160)],
                          *[T(str(k), 26, MUTED, False).next_to(ax.c2p(k, 90), DOWN, buff=0.15) for k in (1, 2, 3, 4, 5)])
            self.play(Create(ax), FadeIn(labs), run_time=self.rt(0.6))
            waves = ax.plot(lambda d: v_of_x(d / 5), x_range=[0, 5, 0.01], color=AMBER, stroke_width=5)
            self.to_word("waves")
            self.play(Create(waves), run_time=self.rt(1.6))
            self.to_word("100 and 163")
            self.show(T("100 to 163", 34, AMBER).move_to(ax.c2p(4.3, 160)))
            self.to_word("Average")
            self.play(Create(DashedLine(ax.c2p(0, 120), ax.c2p(5, 120), color=MINT, stroke_width=4)), run_time=self.rt(0.4))
            self.chip6 = chip("5 km in 150 s: average 120", MINT).move_to(UP * 2.3)
            self.show(self.chip6)
            self.ax6 = ax

        with self.beat("chord7"):
            ax = self.ax6
            self.play(FadeOut(self.chip6), run_time=self.rt(0.2))
            win = Rectangle(width=ax.c2p(2, 0)[0] - ax.c2p(0, 0)[0], height=4.4, stroke_color=CORAL, stroke_width=5,
                            fill_color=CORAL, fill_opacity=0.08).move_to([(ax.c2p(0, 0)[0] + ax.c2p(2, 0)[0]) / 2, ax.c2p(0, 130)[1], 0])
            self.to_word("any 2 kilometer")
            self.play(FadeIn(win), run_time=self.rt(0.4))
            lab = mono("58.2 s", 44, CORAL).next_to(win, UP, buff=0.05)
            self.to_word("58.2")
            self.show(lab)
            self.to_word("Every single")
            self.play(win.animate.shift(RIGHT * (ax.c2p(3, 0)[0] - ax.c2p(0, 0)[0])), lab.animate.shift(RIGHT * (ax.c2p(3, 0)[0] - ax.c2p(0, 0)[0])),
                      run_time=self.rt(2.0), rate_func=there_and_back_with_pause)
            self.to_word("123.7")
            self.show(chip("123.7 km/h", CORAL).move_to(ax.c2p(3.6, 100)))

        with self.beat("chord8"):
            self.clear()
            rd = road(y=-0.5)
            self.show(rd)
            pairs = VGroup(*[VGroup(camera_post(x, y=-0.5, color=CORAL), camera_post(x + 4.48, y=-0.5, color=CORAL)) for x in (-5.6,)])
            self.to_word("every 2")
            self.show(T("every 2 km: over 120", 44, CORAL).move_to(UP * 2.3))
            self.to_word("the whole")
            self.show(T("the whole 5 km: exactly 120", 44, MINT).move_to(DOWN * 1.8))
            self.to_word("fines you")
            self.show(pairs)
            self.play(slam(stamp("FINED", CORAL, -8, 50).move_to([-3.4, 2.4 - 0.9, 0])))
            self.to_word("120")
            self.show(VGroup(camera_post(-5.6, y=-0.5, color=MINT), camera_post(5.6, y=-0.5, color=MINT)))

        with self.beat("chord9"):
            self.clear()
            bar = VGroup(*[Rectangle(width=w, height=0.8, fill_color=c, fill_opacity=0.8, stroke_width=0) for w, c in
                           ((4.4, CORAL), (4.4, CORAL), (2.2, MINT))]).arrange(RIGHT, buff=0.06).move_to(UP * 0.3)
            labs = VGroup(T("2 km", 36, BG).move_to(bar[0]), T("2 km", 36, BG).move_to(bar[1]), T("1 km", 36, BG).move_to(bar[2]))
            self.to_word("don't tile")
            self.play(LaggedStart(*[FadeIn(b) for b in bar], lag_ratio=0.3), FadeIn(labs), run_time=self.rt(0.9))
            self.to_word("116.4")
            br = BraceBetweenPoints(bar[0].get_corner(DL), bar[1].get_corner(DR), DOWN, color=CORAL)
            self.show(br, mono("4 km in 116.4 s", 36, CORAL).next_to(br, DOWN, buff=0.15))
            self.to_word("33.6")
            self.show(mono("33.6 s ≈ 107", 36, MINT).next_to(bar[2], UP, buff=0.3))
            self.to_word("slowness hides")
            self.play(Indicate(bar[2], color=MINT), run_time=self.rt(0.6))

        with self.beat("chord10"):
            self.clear()
            ax = Axes(x_range=[0, 5, 1], y_range=[90, 170, 20], x_length=10, y_length=4.4,
                      axis_config={"color": MUTED, "stroke_width": 2, "include_ticks": False}, tips=False).move_to(DOWN * 0.35)
            self.play(Create(ax), run_time=self.rt(0.4))
            w1 = ax.plot(lambda d: v_of_x(d / 5), x_range=[0, 2, 0.01], color=AMBER, stroke_width=5)
            w2 = ax.plot(lambda d: v_of_x(d / 5), x_range=[2, 4, 0.01], color=AMBER, stroke_width=5)
            w3 = ax.plot(lambda d: v_of_x(d / 5), x_range=[4, 5, 0.01], color=MINT, stroke_width=5)
            self.to_word("repeat")
            self.play(Create(w1), run_time=self.rt(0.6))
            self.play(Create(w2), run_time=self.rt(0.6))
            self.to_word("half wave")
            self.play(Create(w3), run_time=self.rt(0.6))
            self.show(T("the leftover half wave", 34, MINT).move_to(ax.c2p(4.5, 160)))

        with self.beat("chord11"):
            self.clear()
            n = VGroup(T("universal chord theorem", 56, AMBER), VGroup(T("Paul Lévy", 44, INK), year_stamp("1934", MUTED, 56)).arrange(RIGHT, buff=0.4)).arrange(DOWN, buff=0.35).move_to(UP * 1.1)
            self.show(n)
            self.to_word("guaranteed")
            rule = VGroup(T("5 ÷ length is whole → guaranteed", 40, MINT), T("anything else → can fail (2 km, 3 km)", 40, CORAL)).arrange(DOWN, buff=0.3).move_to(DOWN * 1.2)
            self.show(rule[0])
            self.to_word("fail")
            self.show(rule[1])

        with self.beat("chord11b"):
            self.clear()
            run = icon("footprints", AMBER, 1.4).move_to(LEFT * 5 + UP * 1.0)
            self.show(run, T("10 km in 50 min", 44, INK).next_to(run, RIGHT, buff=0.5))
            self.to_word("5 kilometers")
            rows = VGroup(VGroup(T("some 5 km in 25 min", 40, INK), T("✓", 44, MINT)).arrange(RIGHT, buff=0.4),
                          VGroup(T("some 2 km in 10 min", 40, INK), T("✓", 44, MINT)).arrange(RIGHT, buff=0.4),
                          VGroup(T("some 3 km in 15 min", 40, INK), T("?", 44, CORAL)).arrange(RIGHT, buff=0.4)).arrange(DOWN, buff=0.35, aligned_edge=LEFT).move_to(DOWN * 0.9)
            self.show(rows[0])
            self.to_word("2 kilometers")
            self.show(rows[1])
            self.to_word("3 kilometer")
            self.show(rows[2])

        with self.beat("chord12"):
            self.clear()
            two = VGroup(VGroup(T("one moment at 120", 46, MINT), T("certain", 40, INK, False)).arrange(DOWN, buff=0.25),
                         VGroup(T("a stretch of any length", 46, CORAL), T("not certain", 40, INK, False)).arrange(DOWN, buff=0.25)).arrange(DOWN, buff=0.7).move_to(UP * STAGE_Y)
            self.show(two[0])
            self.to_word("stretch")
            self.show(two[1])

        # ======================= 6. what the camera knows
        with self.beat("know1"):
            self.chapter("What the camera knows")
            src = VGroup(plate(), plate(), mono("150 s", 40, INK), mono("5 km", 40, INK)).arrange(RIGHT, buff=0.5).move_to(UP * 0.8)
            self.show(src)

        with self.beat("know2"):
            self.clear()
            rows = VGroup(T("average: 120", 48, INK),
                          T("speedometer: exactly 120 at some moment", 44, AMBER),
                          T("passed both cameras below 120 → at least twice", 38, MUTED, False)).arrange(DOWN, buff=0.4).move_to(UP * 0.2)
            self.show(rows[0])
            self.to_word("Somewhere")
            self.show(rows[1])
            self.to_word("twice")
            self.show(rows[2])

        with self.beat("know3"):
            self.clear()
            rows = VGroup(VGroup(T("some 1 km at 120", 44, INK), T("✓", 44, MINT)).arrange(RIGHT, buff=0.4),
                          VGroup(T("some 2.5 km at 120", 44, INK), T("✓", 44, MINT)).arrange(RIGHT, buff=0.4),
                          VGroup(T("some 2 km at 120", 44, INK), T("no promise", 40, CORAL)).arrange(RIGHT, buff=0.4)).arrange(DOWN, buff=0.4, aligned_edge=LEFT).move_to(UP * 0.2)
            self.show(rows[0])
            self.to_word("2 and a half")
            self.show(rows[1])
            self.to_word("2 kilometer")
            self.show(rows[2])

        with self.beat("know4"):
            self.clear()
            rd, c1, c2 = self.drive_scene()
            self.show(rd, c1, c2)
            self.show(chip("95", MINT).move_to([-4, 2.1, 0]), chip("95", MINT).move_to([4, 2.1, 0]))
            self.to_word("clock")
            self.play(FadeIn(icon("clock", AMBER, 1.3).move_to(UP * 1.0), scale=1.3), run_time=self.rt(0.5))

        with self.beat("know4b"):
            self.clear()
            gh = icon("ghost", MINT, 1.6).move_to(LEFT * 3.5 + UP * STAGE_Y)
            self.show(gh)
            self.to_word("theorem")
            self.show(VGroup(T("not an estimate", 44, MUTED, False), T("a theorem", 70, AMBER)).arrange(DOWN, buff=0.3).move_to(RIGHT * 2 + UP * STAGE_Y))

        with self.beat("know5"):
            self.clear()
            fin = VGroup(labelled_icon("clock", "two clocks", MINT, 1.3, 36), labelled_icon("ruler", "a ruler", MINT, 1.3, 36),
                         labelled_icon("scroll-text", "a theorem from 1691", AMBER, 1.3, 36)).arrange(RIGHT, buff=1.4).move_to(UP * STAGE_Y)
            self.to_word("Two clocks")
            self.show(fin[0])
            self.to_word("ruler")
            self.show(fin[1])
            self.to_word("theorem")
            self.show(fin[2])

        # ======================= 7. your turn
        with self.beat("cta"):
            self.chapter("Your turn")
            rd = road(y=-0.6)
            pair = VGroup(camera_post(-5.0, y=-0.6), camera_post(5.0, y=-0.6))
            self.show(rd, pair, T("6 km · average exactly 120", 40, INK).move_to(UP * 1.9))
            self.to_word("2 kilometer")
            self.show(T("a 2 km stretch at exactly 120?", 44, AMBER).move_to(DOWN * 1.7))
            self.to_word("4 kilometers")
            self.show(T("4 km?", 44, CORAL).move_to(DOWN * 2.5))


class Thumbnail(Scene):
    def construct(self):
        ax = Axes(x_range=[0, 150, 30], y_range=[80, 145, 20], x_length=12.5, y_length=3.0,
                  axis_config={"color": DIM, "stroke_width": 2, "include_ticks": False}, tips=False).move_to(DOWN * 2.3)
        curve = ax.plot(speed, x_range=[0, 150], color=AMBER, stroke_width=10)
        avg = DashedLine(ax.c2p(0, 120), ax.c2p(150, 120), color=MINT, stroke_width=6)
        top = Text("95 → 120", font=FONT_BOLD, color=AMBER, font_size=200).move_to(UP * 1.5)
        sub = Text("never seen, still proven", font=FONT_BOLD, color=INK, font_size=70).move_to(DOWN * 0.3)
        self.add(ax, curve, avg, top, sub)
