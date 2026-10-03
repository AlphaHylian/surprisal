from kit.brand import *
from kit.visuals import *

ROW1, ROW2 = "TO BE OR ", "NOT TO BE"


class Episode(SurprisalScene):
    def construct(self):
        # ---------------- hook: frame 1 is the whole situation: you, 1988, a lawsuit
        with self.beat("hook"):
            yr = year_stamp("1988", MUTED, 130).move_to(UP * 5.9)
            you = you_tag("programmer", height=2.0).move_to(LEFT * 2.1 + UP * 2.7)
            gav = icon("gavel", CORAL, 3.0).move_to(RIGHT * 2.1 + UP * 3.1)
            sued = stamp("SUED", size=130).move_to(DOWN * 0.3)
            self.open_with(VGroup(yr, you, gav, sued), hold=0.5)
            for _ in range(2):  # the gavel comes down twice
                self.play(Rotate(gav, -35 * DEGREES, about_point=gav.get_corner(DR)), run_time=0.18)
                self.play(Rotate(gav, 35 * DEGREES, about_point=gav.get_corner(DR)), run_time=0.22)
            self.wait(self.rt(0.6, 0.4))

        # ---------------- problem: your fast app, a deadline, banned
        with self.beat("problem"):
            term = terminal(["C:\\> PKARC NOTES.TXT", "shrinking... done", "C:\\>"], width=8.2,
                            title="1988", font_size=44).move_to(UP * 3.0)
            self.play(FadeOut(gav), FadeOut(sued), FadeOut(you), FadeOut(yr, shift=UP * 0.3),
                      FadeIn(term.submobjects[0]), FadeIn(term.submobjects[1]), run_time=0.5)
            self.play(AddTextLetterByLetter(term.lines[0]), run_time=self.rt(0.9))
            fast = chip("much faster than theirs", MINT, size=50).move_to(DOWN * 0.2)
            self.play(AddTextLetterByLetter(term.lines[1]), FadeIn(fast, shift=UP * 0.2),
                      run_time=self.rt(0.8))
            self.add(term.lines[2])
            self.wait(self.rt(0.9, 0.2))
            deadline = chip("STOP BY  31 JAN 1989", CORAL, BG, size=54).move_to(DOWN * 0.2)
            banned = stamp("BANNED", size=130).move_to(UP * 3.0)
            self.play(FadeOut(fast, shift=UP * 0.3), FadeIn(deadline, shift=UP * 0.3), run_time=self.rt(0.5))
            self.play(slam(banned), term.animate.set_opacity(0.35), run_time=0.35)
            self.wait(self.rt(1.5, 0.35))
            need = Text("a new way to shrink files", font=FONT_BOLD, color=AMBER, font_size=58)
            fit(need, VIS_W, 1.2).move_to(UP * 5.9)
            self.play(FadeIn(need, shift=DOWN * 0.2), run_time=self.rt(0.6))

        # ---------------- the trick: files repeat themselves
        with self.beat("trick"):
            head = headline("Files repeat themselves")
            t = tiles(ROW1 + ROW2, size=0.92, per_row=9).move_to(UP * 2.2)
            self.play(FadeOut(VGroup(term, banned, deadline)), ReplacementTransform(need, head),
                      run_time=self.rt(0.5))
            self.play(LaggedStart(*[FadeIn(x, shift=DOWN * 0.2) for x in t], lag_ratio=0.06),
                      run_time=self.rt(1.6))

        # ---------------- example: the second TO BE is a copy
        with self.beat("example"):
            first, second = VGroup(*t[0:5]), VGroup(*t[13:18])
            self.play(*[x[0].animate.set_stroke(MINT, width=4) for x in first],
                      *[x[1].animate.set_color(MINT) for x in first], run_time=self.rt(0.6))
            self.play(*[x[0].animate.set_stroke(AMBER, width=4) for x in second],
                      *[x[1].animate.set_color(AMBER) for x in second], run_time=self.rt(0.6))
            copy = chip("exact copy", AMBER).next_to(t, DOWN, buff=0.45)
            self.play(FadeIn(copy, shift=UP * 0.2), Indicate(second, color=AMBER, scale_factor=1.08),
                      run_time=self.rt(0.9))

        # ---------------- pointer: store a note instead
        with self.beat("pointer"):
            arrow = CurvedArrow(second.get_left() + LEFT * 0.1, first.get_bottom() + DOWN * 0.08,
                                angle=-1.2, color=AMBER, stroke_width=6, tip_length=0.25)
            self.play(Create(arrow), FadeOut(copy), run_time=self.rt(0.9))
            note = chip("back 13, copy 5", AMBER, size=38)
            note.next_to(t[12], RIGHT, buff=0.15)
            self.wait(self.rt(0.8, 0.3))
            self.play(FadeTransform(second, note), FadeOut(arrow), run_time=self.rt(0.9))
            self.play(Circumscribe(note, color=AMBER), run_time=self.rt(0.8))

        # ---------------- scale: your way out, real files repeat everywhere
        with self.beat("scale"):
            out = headline("That's your way out", AMBER)
            mini = you_tag(None, height=1.0).move_to(LEFT * 3.5 + UP * 4.1)
            self.play(ReplacementTransform(head, out), FadeOut(VGroup(*t[0:13], note)),
                      FadeIn(mini, shift=RIGHT * 0.3), run_time=self.rt(0.7))
            doc = icon("file-text", INK, 2.2)
            words = VGroup(*[label(w, INK, 44, bold=True) for w in ("spaces", "common words", "lines of code")])
            words.arrange(DOWN, buff=0.25, aligned_edge=LEFT).next_to(doc, RIGHT, buff=0.4)
            fit(VGroup(doc, words), 6.4, 2.6).move_to(RIGHT * 0.9 + UP * 4.0)
            self.play(FadeIn(doc, shift=UP * 0.2), LaggedStart(*[FadeIn(w, shift=LEFT * 0.2) for w in words],
                                                              lag_ratio=0.5), run_time=self.rt(2.6))
            frac = ValueTracker(1.0)
            bar = always_redraw(lambda: size_bar(7.8, 0.85, frac.get_value(), MINT).move_to(UP * 1.4))
            pct = always_redraw(lambda: Text(f"{frac.get_value() * 100:.0f}%", font=FONT_BOLD,
                                             color=INK if frac.get_value() > 0.5 else AMBER, font_size=96)
                                .move_to(UP * 0.0))
            cap = label("a page of English", MUTED, 40).move_to(UP * 2.4)
            self.play(FadeIn(bar), FadeIn(pct), FadeIn(cap), run_time=self.rt(0.4))
            self.play(frac.animate.set_value(0.34), run_time=self.rt(2.0), rate_func=rate_functions.ease_in_out_cubic)
            bar.clear_updaters(); pct.clear_updaters()
            third = chip("about a third", AMBER, size=44).next_to(pct, DOWN, buff=0.3)
            self.play(FadeIn(third, shift=LEFT * 0.2), run_time=self.rt(0.5))

        # ---------------- release: Valentine's Day 1989, ZIP
        with self.beat("release"):
            date = year_stamp("14 FEB 1989", INK, 84)
            heart = icon("heart", CORAL, 0.8).next_to(date, RIGHT, buff=0.25)
            fit(VGroup(date, heart), VIS_W, 1.2).move_to(UP * 5.9)
            zipf = icon("file-archive", AMBER, 3.8).move_to(UP * 2.7)
            name = Text(".ZIP", font=FONT_MONO, color=AMBER, font_size=130).move_to(DOWN * 0.3)
            self.play(FadeOut(VGroup(out, mini, doc, words, bar, pct, cap, third)),
                      FadeIn(date, shift=DOWN * 0.2), run_time=self.rt(0.6))
            self.play(GrowFromCenter(heart), run_time=self.rt(0.4))
            self.wait(self.rt(1.2, 0.3))
            self.play(Create(zipf), run_time=self.rt(1.0))
            self.play(slam(name), run_time=0.35)

        # ---------------- win: free for everyone, ARC fades, Windows builds it in
        with self.beat("win"):
            free = chip("free for anyone to use", MINT, size=46).move_to(UP * 6.0)
            grid = VGroup(*[icon("file-archive", AMBER, 0.72) for _ in range(20)])
            grid.arrange_in_grid(rows=4, cols=5, buff=(0.6, 0.3)).move_to(UP * 3.3)
            self.play(FadeOut(VGroup(date, heart)), FadeIn(free, shift=DOWN * 0.2),
                      ReplacementTransform(zipf, grid[7]), FadeOut(name), run_time=self.rt(0.6))
            self.play(LaggedStart(*[FadeIn(g, scale=0.5) for i, g in enumerate(grid) if i != 7], lag_ratio=0.08),
                      run_time=self.rt(1.8))
            arc = Text("ARC", font=FONT_MONO, color=CORAL, font_size=110).move_to(DOWN * 0.3)
            cross = Line(arc.get_left() + LEFT * 0.2, arc.get_right() + RIGHT * 0.2, color=CORAL, stroke_width=10)
            self.play(FadeIn(arc), run_time=self.rt(0.4))
            self.play(Create(cross), arc.animate.set_opacity(0.4), run_time=self.rt(0.6))
            self.wait(self.rt(0.6, 0.3))
            pc = icon("monitor", INK, 2.6).move_to(UP * 3.0 + LEFT * 1.6)
            y2k = year_stamp("2000", AMBER, 120).next_to(pc, RIGHT, buff=0.5)
            builtin = chip("built into Windows", MINT, size=50).move_to(UP * 0.3)
            self.play(FadeOut(VGroup(grid, arc, cross, free)), FadeIn(pc, shift=UP * 0.2),
                      FadeIn(y2k, shift=UP * 0.2), FadeIn(builtin), run_time=self.rt(0.8))

        # ---------------- close: never store anything twice; banana?
        with self.beat("close"):
            rule = headline("Never store anything twice", AMBER)
            self.play(FadeOut(VGroup(pc, y2k, builtin)), FadeIn(rule, shift=DOWN * 0.2), run_time=self.rt(0.6))
            self.wait(self.rt(1.6, 0.35))
            b = tiles("BANANA", size=1.25).move_to(UP * 3.4)
            q = chip("how would you shrink it?", AMBER, size=40)
            mini2 = you_tag(None, height=0.9).next_to(q, LEFT, buff=0.3)
            grp = VGroup(mini2, q)
            fit(grp, VIS_W, 2.0).move_to(UP * 0.8)
            self.play(LaggedStart(*[FadeIn(x, shift=DOWN * 0.2) for x in b], lag_ratio=0.1), run_time=self.rt(1.0))
            self.play(FadeIn(grp, shift=UP * 0.2), run_time=self.rt(0.6))
            self.play(Indicate(VGroup(*b[1:6]), color=AMBER, scale_factor=1.06), run_time=self.rt(1.0))
