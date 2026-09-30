from kit.brand import *

S = 6.2                      # side of the big square
C = UP * 2.4                 # its centre
X0, Y0 = -S / 2, 2.4 - S / 2  # bottom-left corner
LEVELS = 7


def level_box(k):
    """Bottom-left corner and side of the square being split at level k (recursing to the top right)."""
    s = S / 2 ** k
    x = X0 + (S - s)
    y = Y0 + (S - s)
    return x, y, s


def quad(k, which, color, opacity=1.0):
    x, y, s = level_box(k)
    h = s / 2
    off = {"bl": (0, 0), "tl": (0, h), "br": (h, 0), "tr": (h, h)}[which]
    sq = Square(h, stroke_width=0, fill_color=color, fill_opacity=opacity)
    sq.move_to(np.array([x + off[0] + h / 2, y + off[1] + h / 2, 0]))
    return sq


def cuts(k):
    x, y, s = level_box(k)
    w = max(1.0, 4 - k * 0.5)
    return VGroup(Line([x + s / 2, y, 0], [x + s / 2, y + s, 0], color=MINT, stroke_width=w),
                  Line([x, y + s / 2, 0], [x + s, y + s / 2, 0], color=MINT, stroke_width=w))


class Episode(SurprisalScene):
    def construct(self):
        # ---------------- hook
        with self.beat("hook"):
            head = headline("Quarters, forever")
            self.add(head)
            series = MathTex(r"\frac{1}{4}", "+", r"\frac{1}{16}", "+", r"\frac{1}{64}", "+", r"\cdots",
                             font_size=96).move_to(UP * 4.0)
            fit(series, VIS_W, 2.0)
            self.add(series[0])
            self.play(FadeIn(series[1:3], shift=LEFT * 0.2), run_time=self.rt(0.6))
            self.play(FadeIn(series[3:], shift=LEFT * 0.2), run_time=self.rt(0.6))
            ans = MathTex(r"=", r"\frac{1}{3}", font_size=150).move_to(UP * 1.2)
            ans[1].set_color(AMBER)
            self.play(Write(ans), run_time=self.rt(1.0))
            self.play(Circumscribe(ans[1], color=AMBER), run_time=self.rt(0.8))

        # ---------------- doubt: quarters build halves and wholes
        with self.beat("doubt"):
            head2 = headline("A third, from quarters?")
            bw = 7.2
            segs = VGroup(*[Rectangle(width=bw / 4, height=1.1, stroke_color=MUTED, stroke_width=3,
                                      fill_color=DIM, fill_opacity=1) for _ in range(4)]).arrange(RIGHT, buff=0)
            segs.move_to(UP * 3.6)
            self.play(FadeOut(series), FadeOut(ans), ReplacementTransform(head, head2), FadeIn(segs),
                      run_time=self.rt(0.7))
            half = MathTex(r"\frac{1}{2}", font_size=80, color=MINT).next_to(segs[:2], DOWN, buff=0.35)
            self.play(segs[:2].animate.set_fill(MINT, 0.8), FadeIn(half), run_time=self.rt(0.7))
            whole = MathTex(r"1", font_size=80, color=MINT).next_to(segs, DOWN, buff=0.35).shift(RIGHT * 1.6)
            self.play(segs[2:].animate.set_fill(MINT, 0.8), FadeIn(whole), run_time=self.rt(0.7))
            third = MathTex(r"\frac{1}{3}\,?", font_size=120, color=CORAL).move_to(UP * 0.4)
            self.play(Write(third), run_time=self.rt(0.8))
            self.play(Wiggle(third), run_time=self.rt(0.8))

        # ---------------- square: cut into four, one corner is a quarter
        with self.beat("square"):
            head3 = headline("One square")
            outline = Square(S, stroke_color=INK, stroke_width=4).move_to(C)
            self.play(FadeOut(segs), FadeOut(half), FadeOut(whole), FadeOut(third),
                      ReplacementTransform(head2, head3), Create(outline), run_time=self.rt(1.0))
            c0 = cuts(0)
            self.play(Create(c0), run_time=self.rt(0.8))
            a0 = quad(0, "bl", AMBER)
            q_lbl = MathTex(r"\frac{1}{4}", font_size=90, color=BG).move_to(a0)
            self.play(FadeIn(a0), run_time=self.rt(0.6))
            self.play(Write(q_lbl), run_time=self.rt(0.6))

        # ---------------- trick: three colours, fourth empty
        with self.beat("trick"):
            head4 = headline("Three colours")
            m0, g0 = quad(0, "tl", MINT), quad(0, "br", MUTED)
            self.bring_to_front(c0)
            self.play(ReplacementTransform(head3, head4), FadeOut(q_lbl), run_time=self.rt(0.6))
            self.play(FadeIn(m0), run_time=self.rt(0.6))
            self.play(FadeIn(g0), run_time=self.rt(0.6))
            x, y, s = level_box(1)
            empty = Square(s, stroke_color=AMBER, stroke_width=5).move_to([x + s / 2, y + s / 2, 0])
            self.play(Create(empty), run_time=self.rt(0.7))
            self.play(Indicate(empty, color=AMBER, scale_factor=1.05), run_time=self.rt(0.8))
            self.remove(empty)
            self.add(empty)

        # ---------------- repeat: recurse into the empty corner
        ambers, mints, greys, cutlines = [a0], [m0], [g0], [c0]
        with self.beat("repeat"):
            head5 = headline("Again, and again")
            self.play(ReplacementTransform(head4, head5), FadeOut(empty), run_time=self.rt(0.5))
            for k in range(1, LEVELS):
                a, m, g, c = quad(k, "bl", AMBER), quad(k, "tl", MINT), quad(k, "br", MUTED), cuts(k)
                ambers.append(a); mints.append(m); greys.append(g); cutlines.append(c)
                t = 0.9 if k <= 2 else 0.45
                self.play(Create(c), run_time=self.rt(t * 0.5))
                self.play(FadeIn(a), FadeIn(m), FadeIn(g), run_time=self.rt(t * 0.6))
                self.bring_to_front(c)
            self.bring_to_front(*cutlines)

        A, M, G = VGroup(*ambers), VGroup(*mints), VGroup(*greys)

        # ---------------- match: the three colours tie at every size
        with self.beat("match"):
            head6 = headline("Always a tie")
            sw = VGroup(Square(0.7, fill_color=AMBER, fill_opacity=1, stroke_width=0),
                        MathTex("=", font_size=70),
                        Square(0.7, fill_color=MINT, fill_opacity=1, stroke_width=0),
                        MathTex("=", font_size=70),
                        Square(0.7, fill_color=MUTED, fill_opacity=1, stroke_width=0)).arrange(RIGHT, buff=0.35)
            sw.move_to(DOWN * 1.2)
            self.play(ReplacementTransform(head5, head6), FadeIn(sw, shift=UP * 0.2), run_time=self.rt(0.7))
            for k in range(3):
                trio = VGroup(ambers[k], mints[k], greys[k])
                self.play(Indicate(trio, color=INK, scale_factor=1.06), run_time=self.rt(0.7))

        # ---------------- third: each colour covers one third
        with self.beat("third"):
            head7 = headline("Each colour: one third")
            third_lbl = VGroup(Square(0.7, fill_color=AMBER, fill_opacity=1, stroke_width=0),
                               MathTex(r"=\frac{1}{3}", font_size=80, color=AMBER)).arrange(RIGHT, buff=0.3)
            third_lbl.move_to(DOWN * 1.2)
            self.play(ReplacementTransform(head6, head7), ReplacementTransform(sw, third_lbl), run_time=self.rt(0.8))
            self.play(M.animate.set_fill(opacity=0.18), G.animate.set_fill(opacity=0.18), run_time=self.rt(1.0))
            self.play(Indicate(A, color=AMBER, scale_factor=1.03), run_time=self.rt(0.9))

        # ---------------- sum: the amber squares are the series
        with self.beat("sum"):
            head8 = headline("That's our sum", color=AMBER)
            labels = VGroup()
            for k, (tex, fs) in enumerate(((r"\frac{1}{4}", 90), (r"\frac{1}{16}", 52), (r"\frac{1}{64}", 30))):
                labels.add(MathTex(tex, font_size=fs, color=BG).move_to(ambers[k]))
            self.play(ReplacementTransform(head7, head8), run_time=self.rt(0.5))
            self.play(LaggedStart(*[Write(l) for l in labels], lag_ratio=0.5), run_time=self.rt(1.8))
            full = MathTex(r"\frac{1}{4}+\frac{1}{16}+\frac{1}{64}+\cdots", r"=\frac{1}{3}", font_size=64)
            full[1].set_color(AMBER)
            fit(full, 7.0, 1.0).move_to(DOWN * 1.2)
            self.play(ReplacementTransform(third_lbl, full), run_time=self.rt(1.0))
            self.play(Circumscribe(full[1], color=AMBER), run_time=self.rt(0.8))

        # ---------------- creep: partial sums approach 1/3 from below
        with self.beat("creep"):
            head_c = headline("Creeping up on one third")
            nl = NumberLine(x_range=[0, 0.5, 0.25], length=7.6, color=MINT, include_ticks=True, tick_size=0.2,
                            stroke_width=5).move_to(UP * 1.4)
            third_x = nl.n2p(1 / 3)
            mark = DashedLine(third_x + UP * 0.7, third_x + DOWN * 0.7, color=AMBER, dash_length=0.12, stroke_width=4)
            mark_lbl = MathTex(r"\frac{1}{3}", font_size=80, color=AMBER).next_to(mark, UP, buff=0.12)
            self.play(*[FadeOut(m) for m in self.mobjects if m is not head8], ReplacementTransform(head8, head_c),
                      FadeIn(nl), Create(mark), FadeIn(mark_lbl), run_time=self.rt(0.8))
            k = ValueTracker(1)
            total = lambda: sum(0.25 ** i for i in range(1, int(k.get_value()) + 1))
            dot = always_redraw(lambda: Dot(nl.n2p(total()), radius=0.2, color=INK))
            val = always_redraw(lambda: Text(f"{int(total() * 1000) / 1000:.3f}", font=FONT_BOLD, color=INK,
                                             font_size=120).move_to(UP * 4.9))
            steps = always_redraw(lambda: Text(f"{int(k.get_value())} steps", font=FONT_MED, color=MUTED,
                                               font_size=48).next_to(nl, DOWN, buff=0.9))
            self.add(dot, val, steps)
            self.play(k.animate.set_value(5), run_time=self.rt(2.4), rate_func=linear)
            dot.clear_updaters(); val.clear_updaters(); steps.clear_updaters()
            self.play(val.animate.set_color(AMBER), Flash(dot, color=AMBER, line_length=0.3), run_time=self.rt(0.8))
            head8 = head_c

        # ---------------- close: nine pieces gives 1/8; sixteen?
        with self.beat("close"):
            head9 = headline("Cut into nine")
            self.play(*[FadeOut(m) for m in self.mobjects if m is not head8], ReplacementTransform(head8, head9),
                      run_time=self.rt(0.6))
            side = 5.4
            grid = VGroup()
            origin = np.array([-side / 2, 2.9 - side / 2, 0])
            for lvl in range(3):
                s = side / 3 ** lvl
                base = origin + np.array([side - s, side - s, 0])
                c = s / 3
                for i in range(3):
                    for j in range(3):
                        if i == 2 and j == 2:
                            continue
                        is_amber = (i, j) == (0, 0)
                        shade = AMBER if is_amber else (MINT if (i + j) % 2 else MUTED)
                        sq = Square(c, stroke_color=BG, stroke_width=max(1, 3 - lvl),
                                    fill_color=shade, fill_opacity=1 if is_amber else 0.55)
                        sq.move_to(base + np.array([c * i + c / 2, c * j + c / 2, 0]))
                        grid.add(sq)
            self.play(LaggedStart(*[FadeIn(q) for q in grid], lag_ratio=0.04), run_time=self.rt(1.8))
            eight = MathTex(r"\frac{1}{9}+\frac{1}{81}+\cdots=", r"\frac{1}{8}", font_size=64)
            eight[1].set_color(AMBER)
            fit(eight, 7.0, 1.0).move_to(DOWN * 0.8)
            self.play(Write(eight), run_time=self.rt(1.0))
            head10 = headline("What about sixteen?", color=AMBER)
            self.play(ReplacementTransform(head9, head10), run_time=self.rt(0.6))
