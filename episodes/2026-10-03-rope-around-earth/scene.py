from kit.brand import *

C = UP * 2.5      # centre of the main visual
G = 0.6           # drawn gap (exaggerated so it's visible)


def planet(r, center=C, color=MINT):
    return Circle(radius=r, fill_color=PANEL, fill_opacity=1, stroke_color=color, stroke_width=6).move_to(center)


def rope(r, center=C, color=INK, width=7):
    return Circle(radius=r, stroke_color=color, stroke_width=width).move_to(center)


def gap_marker(center, r_in, r_out, color=AMBER, text=None, size=44, angle=PI / 2):
    d = np.array([np.cos(angle), np.sin(angle), 0])
    a = DoubleArrow(center + r_in * d, center + r_out * d, buff=0, color=color, stroke_width=6,
                    tip_length=0.18, max_tip_length_to_length_ratio=0.45)
    g = VGroup(a)
    if text:
        g.add(label(text, color, size, True).next_to(a, -np.sign(d[1] or 1) * UP, buff=0.32))
    return g


class Episode(SurprisalScene):
    def construct(self):
        # ---------------- hook
        with self.beat("hook"):
            card0 = hook_card("16 cm", "+1 METER OF ROPE", "off the ground, all round")
            self.open_with(card0)
            head = headline("+1 meter of rope")
            earth = planet(2.2)
            r0 = rope(2.2)
            self.play(FadeOut(card0, scale=0.8), FadeIn(earth), FadeIn(r0), FadeIn(head), run_time=self.rt(0.6))
            r1 = rope(2.2 + G, color=AMBER)
            self.play(ReplacementTransform(r0, r1), run_time=self.rt(0.8))
            gm = gap_marker(C, 2.2, 2.2 + G, text="16 cm")
            self.play(FadeIn(gm), run_time=self.rt(0.4))

        # ---------------- doubt
        with self.beat("doubt"):
            head2 = headline("Too small to matter?")
            self.play(ReplacementTransform(head, head2), run_time=self.rt(0.5))
            big = label("40,000 km", INK, 64, True)
            plus = label("+ 1 m", CORAL, 64, True)
            row = VGroup(big, plus).arrange(RIGHT, buff=0.35).move_to(DOWN * 1.1)
            self.play(FadeIn(big, shift=UP * 0.2), run_time=self.rt(0.6))
            self.play(FadeIn(plus, scale=0.7), run_time=self.rt(0.5))
            self.play(Indicate(plus, color=CORAL, scale_factor=0.7), Wiggle(gm), run_time=self.rt(1.0))
            self.play(ShowPassingFlash(r1.copy().set_stroke(INK, 14), time_width=0.35),
                      run_time=self.rt(1.4))

        # ---------------- square: sides don't need more rope
        with self.beat("square"):
            head3 = headline("Try a square")
            s = 3.0
            sq = Square(side_length=s, fill_color=PANEL, fill_opacity=1, stroke_color=MINT, stroke_width=6).move_to(C)
            self.play(ReplacementTransform(head2, head3), FadeOut(VGroup(row, gm, r1)),
                      ReplacementTransform(earth, sq), run_time=self.rt(0.7))
            h = s / 2
            dirs = [UP, RIGHT, DOWN, LEFT]
            inner = [Line(C + h * d + h * rotate_vector(d, -PI / 2), C + h * d + h * rotate_vector(d, PI / 2),
                          color=INK, stroke_width=7) for d in dirs]
            self.play(*[Create(l) for l in inner], run_time=self.rt(0.6))
            outer = [l.copy().shift(G * d) for l, d in zip(inner, dirs)]
            self.play(*[ReplacementTransform(l, o) for l, o in zip(inner, outer)], run_time=self.rt(0.9))
            gsq = gap_marker(C + UP * h, 0, G, text="gap", size=40, angle=PI / 2)
            same = label("sides: same length", MINT, 46, True).move_to(DOWN * 1.1)
            self.play(FadeIn(gsq), FadeIn(same), run_time=self.rt(0.5))
            self.play(*[Indicate(o, color=MINT, scale_factor=1.05) for o in outer], run_time=self.rt(0.9))

        # ---------------- corners: four quarter circles make one circle
        with self.beat("corners"):
            head4 = headline("Only the corners")
            corners = [C + h * (UP + RIGHT), C + h * (UP + LEFT), C + h * (DOWN + LEFT), C + h * (DOWN + RIGHT)]
            arcs = VGroup(*[Arc(radius=G, start_angle=k * PI / 2, angle=PI / 2, arc_center=corners[k],
                                color=AMBER, stroke_width=9) for k in range(4)])
            self.play(ReplacementTransform(head3, head4), FadeOut(same), FadeOut(gsq), run_time=self.rt(0.5))
            self.play(LaggedStart(*[Create(a) for a in arcs], lag_ratio=0.3), run_time=self.rt(1.2))
            q = label("4 quarter circles", AMBER, 46, True).move_to(DOWN * 1.1)
            self.play(FadeIn(q), *[Indicate(a, color=AMBER, scale_factor=1.15) for a in arcs], run_time=self.rt(0.8))
            target = DOWN * 0.95
            moved = arcs.copy()
            for k, a in enumerate(moved):
                a.shift(target - corners[k])
            self.play(FadeOut(q), run_time=self.rt(0.3))
            self.play(*[ReplacementTransform(arcs[k].copy(), moved[k]) for k in range(4)], run_time=self.rt(1.4))
            rad = Line(target, target + G * RIGHT, color=AMBER, stroke_width=5)
            rl = label("radius = gap", AMBER, 40, True).next_to(moved, LEFT, buff=0.35)
            self.play(Create(rad), FadeIn(rl), run_time=self.rt(0.6))
            self.play(Flash(moved, color=AMBER, line_length=0.25, flash_radius=G + 0.15), run_time=self.rt(0.6))

        # ---------------- circle: all corners
        with self.beat("circle"):
            head5 = headline("A circle is all corners")
            body = VGroup(sq, *outer, arcs)
            self.play(ReplacementTransform(head4, head5), run_time=self.rt(0.5))
            shapes = [RegularPolygon(n, start_angle=PI / 2 + PI / n) for n in (8, 16)]
            r_draw = 1.9
            prev = body
            for p in shapes:
                p.set_stroke(MINT, 6).set_fill(PANEL, 1).scale_to_fit_width(2 * r_draw).move_to(C)
                ring = p.copy().set_fill(opacity=0).set_stroke(INK, 7).scale((r_draw + G) / r_draw)
                grp = VGroup(p, ring)
                self.play(ReplacementTransform(prev, grp), run_time=self.rt(0.8))
                prev = grp
            circ = VGroup(planet(r_draw), rope(r_draw + G, color=AMBER))
            self.play(ReplacementTransform(prev, circ), run_time=self.rt(0.8))
            self.play(Indicate(VGroup(moved, rad), color=AMBER, scale_factor=1.25), run_time=self.rt(0.9))

        # ---------------- number: 1 m around -> 16 cm radius
        with self.beat("number"):
            head6 = headline("1 meter of extra rope")
            small = VGroup(moved, rad)
            self.play(ReplacementTransform(head5, head6), FadeOut(circ), FadeOut(rl), run_time=self.rt(0.5))
            R2 = 2.0
            big_c = Circle(radius=R2, color=AMBER, stroke_width=10).move_to(C)
            self.play(ReplacementTransform(small, big_c), run_time=self.rt(0.9))
            around = label("1 m around", INK, 56, True).next_to(big_c, UP, buff=0.25)
            self.play(FadeIn(around), ShowPassingFlash(big_c.copy().set_stroke(INK, 16), time_width=0.4),
                      run_time=self.rt(0.9))
            radl = Line(C, C + R2 * RIGHT, color=AMBER, stroke_width=7)
            self.play(Create(radl), run_time=self.rt(0.6))
            ans = label("16 cm", AMBER, 110, True).move_to(DOWN * 0.95)
            self.play(FadeIn(ans, scale=0.6), run_time=self.rt(0.6))
            gapw = label("= the gap", INK, 48, True).next_to(ans, RIGHT, buff=0.3)
            fit(VGroup(ans, gapw).move_to(DOWN * 0.95), 7.4)
            self.play(FadeIn(gapw), Indicate(radl, color=AMBER), run_time=self.rt(0.7))

        # ---------------- size: football, Earth, Sun
        with self.beat("size"):
            head7 = headline("The Earth never showed up")
            self.play(ReplacementTransform(head6, head7), FadeOut(VGroup(big_c, around, radl, gapw)),
                      ans.animate.scale(0.5).move_to(DOWN * 1.25), run_time=self.rt(0.6))
            specs = [("football", 0.35, INK), ("Earth", 0.95, MINT), ("Sun", 1.55, AMBER)]
            items = VGroup()
            for name, r, col in specs:
                p = Circle(radius=r, fill_color=PANEL, fill_opacity=1, stroke_color=col, stroke_width=5)
                rg = Circle(radius=r + 0.22, stroke_color=AMBER, stroke_width=5).move_to(p)
                nm = label(name, col, 40, True).next_to(p, UP, buff=0.4)
                tag = label("+16 cm", AMBER, 36, True).next_to(rg, DOWN, buff=0.2)
                items.add(VGroup(p, rg, nm, tag))
            items.arrange(RIGHT, buff=0.35, aligned_edge=DOWN)
            fit(items, 8.4, 5.5).move_to(UP * 2.6)
            self.play(FadeOut(ans), run_time=self.rt(0.3))
            for it in items:
                self.play(FadeIn(it[0], scale=0.6), FadeIn(it[2]), run_time=self.rt(0.45))
                self.play(Create(it[1]), FadeIn(it[3]), run_time=self.rt(0.5))
            same = label("same 16 cm", AMBER, 64, True).move_to(DOWN * 1.1)
            self.play(FadeIn(same, shift=UP * 0.2), *[Indicate(it[3], color=AMBER) for it in items],
                      run_time=self.rt(0.9))

        # ---------------- close: lift it 1 m?
        with self.beat("close"):
            head8 = headline("Your turn", color=AMBER)
            self.play(ReplacementTransform(head7, head8), FadeOut(items), FadeOut(same), run_time=self.rt(0.5))
            e = planet(1.8)
            ring = rope(1.8, color=INK)
            self.play(FadeIn(e), FadeIn(ring), run_time=self.rt(0.5))
            ring2 = rope(1.8 + 0.8, color=AMBER)
            g1 = gap_marker(C, 1.8, 2.6, text="1 m", size=48)
            self.play(ReplacementTransform(ring, ring2), FadeIn(g1), run_time=self.rt(0.9))
            qtext = label("how much extra rope?", INK, 52, True).move_to(DOWN * 0.95)
            fit(qtext, 7.0)
            self.play(FadeIn(qtext), run_time=self.rt(0.5))
            sub = label("a new one every day", MINT, 36).next_to(qtext, DOWN, buff=0.3)
            self.play(Wiggle(qtext), run_time=self.rt(0.9))
            self.play(FadeIn(sub), run_time=self.rt(0.5))
