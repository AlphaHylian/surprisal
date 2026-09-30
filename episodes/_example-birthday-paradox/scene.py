from math import prod
import random

from kit.brand import *

CIRCLE_C = UP * 2.6
R = 2.9


def p_none(n):
    return prod((365 - i) / 365 for i in range(n))


class Episode(SurprisalScene):
    def construct(self):
        random.seed(7)
        pts = [CIRCLE_C + R * np.array([np.cos(a), np.sin(a), 0])
               for a in np.linspace(PI / 2, PI / 2 - TAU, 23, endpoint=False)]
        dots = VGroup(*[Dot(p, radius=0.14, color=INK) for p in pts])

        # ---------------- hook
        with self.beat("hook"):
            head = headline("23 people in a room")
            self.play(FadeIn(head, shift=DOWN * 0.3), LaggedStart(*[GrowFromCenter(d) for d in dots], lag_ratio=0.06),
                      run_time=self.rt(2.2))
            q = Text("same birthday?", font=FONT_BOLD, color=MUTED, font_size=44).move_to(CIRCLE_C + UP * 0.6)
            big = Text("> 50%", font=FONT_BOLD, color=AMBER, font_size=110).move_to(CIRCLE_C + DOWN * 0.5)
            self.play(FadeIn(q), run_time=self.rt(0.6))
            self.play(Write(big), run_time=self.rt(1.0))

        # ---------------- doubt: a year of days, only 23 lit
        with self.beat("doubt"):
            cells = VGroup(*[Square(0.3, stroke_width=0, fill_color=DIM, fill_opacity=1) for _ in range(365)])
            cells.arrange_in_grid(rows=19, cols=20, buff=0.07)
            fit(cells, VIS_W, 6.0).move_to(UP * 2.3)
            head2 = headline("365 days.  23 people.")
            self.play(FadeOut(q), FadeOut(big), FadeOut(dots), ReplacementTransform(head, head2),
                      FadeIn(cells, lag_ratio=0.002), run_time=self.rt(1.6))
            lit = random.sample(range(365), 23)
            self.play(LaggedStart(*[cells[i].animate.set_fill(AMBER) for i in lit], lag_ratio=0.08),
                      run_time=self.rt(2.2))
            sounds = Text("sounds unlikely", font=FONT_BOLD, color=CORAL, font_size=48)
            sounds.next_to(cells, DOWN, buff=0.35)
            self.play(FadeIn(sounds, shift=UP * 0.2), run_time=self.rt(0.6))

        # ---------------- flip: you vs everyone -> everyone vs everyone
        with self.beat("flip"):
            head3 = headline("Not you vs everyone")
            self.play(FadeOut(cells), FadeOut(sounds), ReplacementTransform(head2, head3), FadeIn(dots),
                      run_time=self.rt(1.0))
            you = dots[0]
            spokes = VGroup(*[Line(pts[0], p, stroke_width=2.5, color=MUTED) for p in pts[1:]])
            self.play(you.animate.set_color(AMBER).scale(1.4), Create(spokes, lag_ratio=0.05), run_time=self.rt(1.6))
            head4 = headline("Everyone vs everyone", color=AMBER)
            self.wait(self.rt(0.8, 0.3))
            self.play(ReplacementTransform(head3, head4), FadeOut(spokes), you.animate.set_color(INK).scale(1 / 1.4),
                      run_time=self.rt(0.8))

        # ---------------- pairs: all 253 lines with a counter
        with self.beat("pairs"):
            pairs = [(i, j) for i in range(23) for j in range(i + 1, 23)]
            random.shuffle(pairs)
            lines = VGroup(*[Line(pts[i], pts[j], stroke_width=1.4, color=MINT, stroke_opacity=0.55) for i, j in pairs])
            count = ValueTracker(0)
            num = always_redraw(lambda: Text(f"{int(count.get_value())} pairs", font=FONT_BOLD, color=INK, font_size=64)
                                .move_to(DOWN * 1.0))
            self.add(num)
            self.play(Create(lines, lag_ratio=0.02), count.animate.set_value(253), run_time=self.rt(3.0, 0.85),
                      rate_func=linear)
            num.clear_updaters()
            self.play(num.animate.set_color(AMBER), run_time=self.rt(0.4))

        # ---------------- odds per pair
        with self.beat("odds"):
            per = VGroup(Text("each pair:", font=FONT_BOLD, color=INK, font_size=52),
                         MathTex(r"\frac{1}{365}", font_size=80, color=MINT)).arrange(RIGHT, buff=0.3).move_to(DOWN * 1.0)
            self.play(FadeOut(num, shift=UP * 0.2), FadeIn(per, shift=UP * 0.2), run_time=self.rt(0.8))
            self.play(Indicate(lines, color=MINT, scale_factor=1.0), run_time=self.rt(1.2))
            many = Text("253 chances", font=FONT_BOLD, color=AMBER, font_size=64).move_to(DOWN * 1.0)
            self.wait(self.rt(0.9, 0.35))
            self.play(ReplacementTransform(per, many), lines.animate.set_stroke(opacity=0.9, color=AMBER),
                      run_time=self.rt(1.0))

        # ---------------- product: chance nobody matches, as a shrinking bar
        with self.beat("product"):
            head5 = headline("Chance nobody matches")
            self.play(FadeOut(lines), FadeOut(dots), FadeOut(many), ReplacementTransform(head4, head5),
                      run_time=self.rt(0.8))
            eq = MathTex(r"\frac{365}{365}", r"\cdot", r"\frac{364}{365}", r"\cdot", r"\frac{363}{365}",
                         r"\cdot", r"\cdots", font_size=72).move_to(UP * 4.6)
            fit(eq, VIS_W, 1.6)
            self.play(Write(eq[0]), run_time=self.rt(0.6))
            self.play(FadeIn(eq[1:3], shift=LEFT * 0.2), run_time=self.rt(0.8))
            self.wait(self.rt(0.7, 0.3))
            self.play(FadeIn(eq[3:5], shift=LEFT * 0.2), run_time=self.rt(0.8))
            self.play(FadeIn(eq[5:], shift=LEFT * 0.2), run_time=self.rt(0.6))

            # bar: full width = 100%
            bw, bh = 7.2, 0.9
            frame = RoundedRectangle(corner_radius=0.12, width=bw, height=bh, stroke_color=MUTED, stroke_width=2)
            frame.move_to(UP * 2.3)
            half = DashedLine(frame.get_top() + UP * 0.35, frame.get_bottom() + DOWN * 0.35, color=INK,
                              dash_length=0.12).move_to(frame.get_center())
            half_lbl = Text("50%", font=FONT_BOLD, color=MUTED, font_size=34).next_to(half, UP, buff=0.1)
            n = ValueTracker(1)
            bar = always_redraw(lambda: RoundedRectangle(
                corner_radius=0.12, width=max(0.02, bw * p_none(int(n.get_value()))), height=bh,
                stroke_width=0, fill_color=MINT if p_none(int(n.get_value())) >= 0.5 else AMBER, fill_opacity=1)
                .align_to(frame, LEFT).align_to(frame, UP))
            readout = always_redraw(lambda: VGroup(
                Text(f"{int(n.get_value())} people", font=FONT_MED, color=MUTED, font_size=40),
                Text(f"{p_none(int(n.get_value())) * 100:.1f}%", font=FONT_BOLD, color=INK, font_size=64),
            ).arrange(RIGHT, buff=0.5).next_to(frame, DOWN, buff=0.45))
            self.play(Create(frame), FadeIn(bar), FadeIn(readout), Create(half), FadeIn(half_lbl),
                      run_time=self.rt(0.8))
            self.play(n.animate.set_value(12), run_time=self.rt(1.5), rate_func=linear)

        # ---------------- drop: crosses one half at 23
        with self.beat("drop"):
            self.play(n.animate.set_value(23), run_time=self.rt(2.2), rate_func=linear)
            bar.clear_updaters(); readout.clear_updaters()
            match = VGroup(Text("shared birthday", font=FONT_MED, color=MUTED, font_size=40),
                           Text("50.7%", font=FONT_BOLD, color=AMBER, font_size=96)).arrange(DOWN, buff=0.15)
            match.next_to(readout, DOWN, buff=0.6)
            self.play(Flash(half.get_center(), color=AMBER, line_length=0.4), FadeIn(match, shift=UP * 0.3),
                      run_time=self.rt(1.0))

        # ---------------- curve: 50 -> 97%, 70 -> 99.9%
        with self.beat("curve"):
            ax = Axes(x_range=[0, 80, 10], y_range=[0, 1, 0.5], x_length=6.9, y_length=5.2,
                      axis_config={"color": MUTED, "stroke_width": 2, "include_ticks": True},
                      tips=False).move_to(UP * 2.4 + RIGHT * 0.35)
            xl = VGroup(*[Text(str(v), font=FONT_MED, color=MUTED, font_size=26).next_to(ax.c2p(v, 0), DOWN, 0.15)
                          for v in (23, 50, 70)])
            yl = VGroup(*[Text(t, font=FONT_MED, color=MUTED, font_size=26).next_to(ax.c2p(0, v), LEFT, 0.15)
                          for t, v in (("50%", 0.5), ("100%", 1))])
            curve = ax.plot(lambda x: 1 - p_none(int(round(x))) if x >= 1 else 0, x_range=[1, 80, 0.25],
                            color=AMBER, stroke_width=5)
            head6 = headline("Chance of a shared birthday")
            self.play(*[FadeOut(m) for m in (frame, bar, readout, half, half_lbl, match, eq)],
                      ReplacementTransform(head5, head6), FadeIn(ax), FadeIn(xl), FadeIn(yl), run_time=self.rt(0.5))
            self.play(Create(curve), run_time=self.rt(0.7))
            dot = Dot(ax.c2p(23, 1 - p_none(23)), color=AMBER, radius=0.13)
            self.add(dot)
            for x, txt, side in ((50, "97%", UP + LEFT * 0.6), (70, "99.9%", DOWN)):
                target = ax.c2p(x, 1 - p_none(x))
                tag = Text(txt, font=FONT_BOLD, color=INK, font_size=46).next_to(target, side, buff=0.3)
                self.play(dot.animate.move_to(target), FadeIn(tag), run_time=self.rt(0.7))

        # ---------------- close: a class of 30
        with self.beat("close"):
            head7 = headline("A class of 30")
            self.play(*[FadeOut(m) for m in self.mobjects if m is not head6], ReplacementTransform(head6, head7),
                      run_time=self.rt(0.6))
            desks = VGroup(*[Dot(radius=0.18, color=INK) for _ in range(30)]).arrange_in_grid(5, 6, buff=0.55)
            desks.move_to(UP * 3.7)
            self.play(LaggedStart(*[GrowFromCenter(d) for d in desks], lag_ratio=0.03), run_time=self.rt(1.0))
            pct = Text("71%", font=FONT_BOLD, color=AMBER, font_size=150).move_to(UP * 0.4)
            a, b = desks[7], desks[22]
            link = ArcBetweenPoints(a.get_center(), b.get_center(), angle=-PI / 3, color=AMBER, stroke_width=5)
            self.play(Write(pct), a.animate.set_color(AMBER), b.animate.set_color(AMBER), Create(link),
                      run_time=self.rt(1.0))
