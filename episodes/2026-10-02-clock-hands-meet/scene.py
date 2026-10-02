from kit.brand import *

C = UP * 2.6   # clock centre
R = 2.6        # clock radius
RING = R + 0.32  # where the meeting dots sit


def ang(turns):
    """Clock angle (12 at the top, clockwise) for a fraction of a full turn."""
    return PI / 2 - TAU * turns


def rim(turns, r=RING):
    return C + r * np.array([np.cos(ang(turns)), np.sin(ang(turns)), 0])


def clock_face():
    face = Circle(radius=R, fill_color=PANEL, fill_opacity=1, stroke_color=MINT, stroke_width=6).move_to(C)
    ticks = VGroup(*[Line(rim(i / 60, R - (0.28 if i % 5 == 0 else 0.12)), rim(i / 60, R - 0.02),
                          color=INK if i % 5 == 0 else DIM, stroke_width=5 if i % 5 == 0 else 3)
                     for i in range(60)])
    nums = VGroup(*[Text(str(h), font=FONT_BOLD, color=MUTED, font_size=40).move_to(rim(h / 12, R - 0.62))
                    for h in range(1, 13)])
    return VGroup(face, ticks, nums), nums


def meet_dot(k):
    return Dot(rim(k / 11), radius=0.14, color=AMBER)


class Episode(SurprisalScene):
    def construct(self):
        T = ValueTracker(0.0)  # hours since 12:00

        def hand(length, width, color, per_turn):
            return always_redraw(lambda: Line(C, C + length * np.array(
                [np.cos(ang(T.get_value() / per_turn)), np.sin(ang(T.get_value() / per_turn)), 0]),
                color=color, stroke_width=width, cap_style=CapStyleType.ROUND))

        # ---------------- hook
        with self.beat("hook"):
            card0 = hook_card("11", "CLOCK HANDS MEET", "times in 12 hours")
            self.open_with(card0)
            face, nums = clock_face()
            hour = hand(R * 0.55, 14, MINT, 12)
            minute = hand(R * 0.85, 9, INK, 1)
            pin = Dot(C, radius=0.13, color=INK)
            head = headline("11 times, not 12")
            self.play(FadeOut(card0, scale=0.8), FadeIn(face), FadeIn(hour), FadeIn(minute), FadeIn(pin),
                      FadeIn(head), run_time=self.rt(0.6))
            self.add(pin)

        # ---------------- doubt: once an hour? at 1:00 they don't meet
        with self.beat("doubt"):
            head2 = headline("Once an hour?")
            self.play(ReplacementTransform(head, head2), run_time=self.rt(0.5))
            twelve = Text("12?", font=FONT_BOLD, color=CORAL, font_size=110).move_to(DOWN * 0.9)
            self.play(FadeIn(twelve, scale=0.7), run_time=self.rt(0.5))
            self.play(T.animate.set_value(1.0), run_time=self.rt(2.0), rate_func=smooth)
            miss = label("1:00, no meeting", CORAL, 44, True).move_to(DOWN * 0.9)
            self.play(ReplacementTransform(twelve, miss), Indicate(nums[0], color=CORAL, scale_factor=1.5),
                      run_time=self.rt(0.8))

        # ---------------- race: 12 laps vs 1 lap
        with self.beat("race"):
            head3 = headline("A race on a round track")
            lab_m = label("minute hand laps", INK, 40, True)
            lab_h = label("hour hand laps", MINT, 40, True)
            n_m = always_redraw(lambda: Text(str(int(T.get_value() + 1e-6)), font=FONT_BOLD, color=INK,
                                             font_size=56).next_to(lab_m, RIGHT, buff=0.35))
            n_h = always_redraw(lambda: Text(str(int(T.get_value() / 12 + 1e-6)), font=FONT_BOLD, color=MINT,
                                             font_size=56).next_to(lab_h, RIGHT, buff=0.35))
            VGroup(lab_m, lab_h).arrange(DOWN, buff=0.4, aligned_edge=LEFT).move_to(DOWN * 0.9 + LEFT * 0.4)
            self.play(ReplacementTransform(head2, head3), FadeOut(miss), run_time=self.rt(0.5))
            self.play(FadeIn(lab_m), FadeIn(lab_h), FadeIn(n_m), FadeIn(n_h), run_time=self.rt(0.5))
            self.play(T.animate.set_value(12.0), run_time=self.rt(3.6, 0.7), rate_func=linear)
            self.remove(n_m, n_h)
            n_m, n_h = (Text("12", font=FONT_BOLD, color=INK, font_size=56).next_to(lab_m, RIGHT, buff=0.35),
                        Text("1", font=FONT_BOLD, color=MINT, font_size=56).next_to(lab_h, RIGHT, buff=0.35))
            self.add(n_m, n_h)
            self.play(Indicate(n_m, color=INK, scale_factor=1.3), Indicate(n_h, color=MINT, scale_factor=1.3),
                      run_time=self.rt(0.7))

        # ---------------- lap: run 12 hours, drop a dot at every meeting
        with self.beat("lap"):
            head4 = headline("Every lap = one meeting")
            T.set_value(0.0)
            meets = label("meetings", AMBER, 44, True)
            n_meet = Text("1", font=FONT_BOLD, color=AMBER, font_size=72)
            row = VGroup(meets, n_meet).arrange(RIGHT, buff=0.35).move_to(DOWN * 0.9)
            self.remove(n_m, n_h)
            self.play(ReplacementTransform(head3, head4), FadeOut(VGroup(lab_m, lab_h)), FadeIn(row),
                      run_time=self.rt(0.4))
            dots = VGroup(meet_dot(0))
            self.play(GrowFromCenter(dots[0]), run_time=self.rt(0.3))
            step = max(0.2, (self.left() - 0.9) / 11)
            for k in range(1, 11):
                self.play(T.animate.set_value(12 * k / 11), run_time=step, rate_func=linear)
                d = meet_dot(k)
                dots.add(d)
                self.add(d)
                n_meet.become(Text(str(k + 1), font=FONT_BOLD, color=AMBER, font_size=72)
                              .next_to(meets, RIGHT, buff=0.35))
            self.play(T.animate.set_value(12.0), run_time=step, rate_func=linear)
            self.play(Flash(dots[0], color=AMBER, line_length=0.25), run_time=self.rt(0.5))

        # ---------------- count: 12 - 1 = 11
        with self.beat("count"):
            head5 = headline("12 laps − 1 lap")
            eq = VGroup(Text("12 − 1 =", font=FONT_BOLD, color=INK, font_size=84),
                        Text("11", font=FONT_BOLD, color=AMBER, font_size=104)).arrange(RIGHT, buff=0.35)
            eq.move_to(DOWN * 1.0)
            self.play(ReplacementTransform(head4, head5), FadeOut(row), run_time=self.rt(0.5))
            self.play(FadeIn(eq[0]), run_time=self.rt(0.8))
            self.play(FadeIn(eq[1], scale=0.6), run_time=self.rt(0.6))
            day = headline("11 in 12 hours, 22 a day")
            self.play(LaggedStart(*[Indicate(d, color=AMBER, scale_factor=1.8) for d in dots], lag_ratio=0.12),
                      run_time=self.rt(1.6, 0.6))
            self.play(ReplacementTransform(head5, day), run_time=self.rt(0.5))

        # ---------------- missing: between 11 and 1 only one meeting
        with self.beat("missing"):
            head6 = headline("Which hour loses out?")
            arc = Arc(radius=RING, start_angle=ang(1 / 12), angle=TAU / 6, arc_center=C,
                      color=CORAL, stroke_width=14, stroke_opacity=0.6)
            self.play(ReplacementTransform(day, head6), FadeOut(eq), run_time=self.rt(0.5))
            self.play(Create(arc), nums[10].animate.set_color(CORAL), nums[0].animate.set_color(CORAL),
                      run_time=self.rt(1.0))
            only = label("only one: 12:00", AMBER, 52, True).move_to(DOWN * 0.9)
            self.play(FadeIn(only), Indicate(dots[0], color=AMBER, scale_factor=2.2), run_time=self.rt(1.0))
            self.play(Flash(dots[0], color=AMBER, line_length=0.3), nums[11].animate.set_color(AMBER),
                      run_time=self.rt(0.7))

        # ---------------- late: after 3 o'clock, not 3:15 but 3:16:22
        with self.beat("late"):
            head7 = headline("The meetings drift")
            self.play(ReplacementTransform(head6, head7), FadeOut(only), FadeOut(arc),
                      *[n.animate.set_color(MUTED) for n in (nums[0], nums[10], nums[11])],
                      dots.animate.set_opacity(0.3), run_time=self.rt(0.5))
            self.play(T.animate.set_value(3.0), run_time=self.rt(0.9))
            self.play(T.animate.set_value(3.25), run_time=self.rt(0.9))
            q = label("3:15", CORAL, 64, True).move_to(DOWN * 0.9)
            gap = label("not yet", CORAL, 40).next_to(q, RIGHT, buff=0.4)
            self.play(FadeIn(q), FadeIn(gap), run_time=self.rt(0.5))
            self.play(Indicate(q, color=CORAL), run_time=self.rt(0.5))
            self.play(T.animate.set_value(36 / 11), run_time=self.rt(1.0))
            ans = label("3:16:22", AMBER, 84, True).move_to(DOWN * 0.9)
            self.play(FadeOut(q), FadeOut(gap),
                      FadeIn(ans, scale=0.7), dots[3].animate.set_opacity(1), run_time=self.rt(0.6))
            self.play(Flash(dots[3], color=AMBER, line_length=0.25), run_time=self.rt(0.6))

        # ---------------- close: right angles?
        with self.beat("close"):
            head8 = headline("Your turn", color=AMBER)
            self.play(ReplacementTransform(head7, head8), FadeOut(ans), FadeOut(dots), run_time=self.rt(0.5))
            self.play(T.animate.set_value(3.0), run_time=self.rt(0.8))
            sq = Square(side_length=0.45, color=AMBER, stroke_width=5).move_to(C + 0.225 * (UP + RIGHT))
            self.play(Create(sq), run_time=self.rt(0.4))
            qtext = label("right angles in 12 hours?", INK, 48, True).move_to(DOWN * 0.9)
            fit(qtext, 6.6)
            self.play(FadeIn(qtext), run_time=self.rt(0.5))
            self.play(FadeOut(sq), T.animate.set_value(3.5), run_time=self.rt(1.2))
            hint = label("hint: not 24", CORAL, 40, True).next_to(qtext, DOWN, buff=0.25)
            self.play(FadeIn(hint), run_time=self.rt(0.5))
            self.play(Wiggle(qtext), run_time=self.rt(1.0))
