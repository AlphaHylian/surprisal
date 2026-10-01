from kit.brand import *

R = 0.6  # coin radius


def coin(letter, r=R, edge=INK, glyph=None):
    c = Circle(radius=r, fill_color=PANEL, fill_opacity=1, stroke_color=edge, stroke_width=5)
    t = Text(letter, font=FONT_BOLD, color=glyph or edge, font_size=int(r * 110))
    t.move_to(c)
    return VGroup(c, t)


def row(seq, r=R, edge=INK, buff=0.14):
    return VGroup(*[coin(ch, r, edge) for ch in seq]).arrange(RIGHT, buff=buff)


def recolor(c, color):
    return [c[0].animate.set_stroke(color), c[1].animate.set_color(color)]


def bracket(mobs, color, text, up=True):
    b = Brace(VGroup(*mobs), UP if up else DOWN, color=color, buff=0.12)
    t = Text(text, font=FONT_BOLD, color=color, font_size=50)
    t.next_to(b, UP if up else DOWN, buff=0.12)
    return VGroup(b, t)


class Episode(SurprisalScene):
    def construct(self):
        # ---------------- hook
        with self.beat("hook"):
            card0 = hook_card("7 in 8", "YOU PICK HHH", "and I still win")
            self.open_with(card0)
            you = row("HHH", edge=CORAL)
            me = row("THH", edge=AMBER)
            pair = VGroup(you, me).arrange(DOWN, buff=0.9).move_to(UP * 2.4)
            lab_you = label("you", CORAL, 44, True).next_to(you, LEFT, buff=0.5)
            lab_me = label("me", AMBER, 44, True).next_to(me, LEFT, buff=0.5)
            self.play(FadeOut(card0, scale=0.8), FadeIn(you), FadeIn(me), FadeIn(lab_you), FadeIn(lab_me),
                      run_time=self.rt(0.6))

        # ---------------- doubt: all eight runs are 1/8
        with self.beat("doubt"):
            head = headline("Equally likely?")
            from itertools import product
            seqs = ["".join(p) for p in product("HT", repeat=3)]
            cells = VGroup()
            for s in seqs:
                r_ = row(s, r=0.42, edge=MUTED, buff=0.1)
                f = Text("1/8", font=FONT_MED, color=MUTED, font_size=50).next_to(r_, RIGHT, buff=0.25)
                cells.add(VGroup(r_, f))
            cells.arrange_in_grid(rows=4, cols=2, buff=(0.7, 0.45), flow_order="dr")
            fit(cells, VIS_W, 6.4).move_to(UP * 2.4)
            self.play(FadeIn(head), FadeOut(VGroup(you, me, lab_you, lab_me)), run_time=self.rt(0.5))
            self.play(LaggedStart(*[FadeIn(c, shift=UP * 0.15) for c in cells], lag_ratio=0.12),
                      run_time=self.rt(1.6))
            hhh, thh = cells[seqs.index("HHH")], cells[seqs.index("THH")]
            self.play(*recolor(hhh[0][0], CORAL), *recolor(hhh[0][1], CORAL), *recolor(hhh[0][2], CORAL),
                      hhh[1].animate.set_color(CORAL),
                      *recolor(thh[0][0], AMBER), *recolor(thh[0][1], AMBER), *recolor(thh[0][2], AMBER),
                      thh[1].animate.set_color(AMBER), run_time=self.rt(0.8))
            self.play(Wiggle(VGroup(hhh[1], thh[1])), run_time=self.rt(0.9))

        # ---------------- game: flip until one shows up
        with self.beat("game"):
            head2 = headline("First to show up wins")
            stream = row("HTHTTHH", r=0.58, buff=0.12).move_to(UP * 2.6)
            fit(stream, VIS_W)
            self.play(ReplacementTransform(head, head2), FadeOut(cells), run_time=self.rt(0.5))
            for c in stream:
                self.play(FadeIn(c, shift=DOWN * 0.4, scale=0.6), run_time=self.rt(0.35))
            win = bracket(stream[4:], AMBER, "THH: I win", up=False)
            self.play(*[a for c in stream[4:] for a in recolor(c, AMBER)], FadeIn(win), run_time=self.rt(0.7))
            self.play(Indicate(stream[4:], color=AMBER, scale_factor=1.12), run_time=self.rt(0.8))

        # ---------------- pick: you vs me
        with self.beat("pick"):
            head3 = headline("You vs me")
            you = row("HHH", r=0.8, edge=CORAL)
            me = row("THH", r=0.8, edge=AMBER)
            pair = VGroup(you, me).arrange(DOWN, buff=1.2).move_to(UP * 2.4).shift(RIGHT * 0.6)
            lab_you = label("you", CORAL, 64, True).next_to(you, LEFT, buff=0.6)
            lab_me = label("me", AMBER, 64, True).next_to(me, LEFT, buff=0.6)
            self.play(ReplacementTransform(head2, head3), FadeOut(stream), FadeOut(win), run_time=self.rt(0.5))
            self.play(FadeIn(lab_you), LaggedStart(*[GrowFromCenter(c) for c in you], lag_ratio=0.3),
                      run_time=self.rt(1.0))
            self.play(FadeIn(lab_me), LaggedStart(*[GrowFromCenter(c) for c in me], lag_ratio=0.3),
                      run_time=self.rt(1.0))
            self.play(Indicate(me[0], color=AMBER, scale_factor=1.2), run_time=self.rt(0.7))

        # ---------------- before: what came right before the first HHH?
        with self.beat("before"):
            head4 = headline("The first HHH")
            s = VGroup(*[coin(ch, 0.6, DIM, MUTED) for ch in "THT"],
                       coin("?", 0.6, INK),
                       *[coin("H", 0.6, CORAL) for _ in range(3)]).arrange(RIGHT, buff=0.12)
            fit(s, VIS_W).move_to(UP * 2.4)
            q = s[3]
            yours = bracket(s[4:], CORAL, "first HHH", up=False)
            self.play(ReplacementTransform(head3, head4), FadeOut(VGroup(you, me, lab_you, lab_me)),
                      run_time=self.rt(0.5))
            self.play(LaggedStart(*[FadeIn(c, shift=DOWN * 0.3) for c in s], lag_ratio=0.15), run_time=self.rt(1.2))
            self.play(FadeIn(yours), run_time=self.rt(0.6))
            arrow = Arrow(q.get_top() + UP * 1.3, q.get_top() + UP * 0.1, color=INK, buff=0, stroke_width=6)
            self.play(GrowArrow(arrow), run_time=self.rt(0.5))
            self.play(Wiggle(q, scale_value=1.25), run_time=self.rt(1.0))

        # ---------------- tails: if it were heads, HHH came earlier
        with self.beat("tails"):
            head5 = headline("It has to be tails", color=AMBER)
            self.play(ReplacementTransform(head4, head5), run_time=self.rt(0.5))
            hq = coin("H", 0.6, CORAL).scale(s[0].height / coin("H", 0.6).height).move_to(q)
            self.play(Transform(q, hq), run_time=self.rt(0.6))
            early = bracket(s[3:6], CORAL, "earlier!", up=True)
            self.play(FadeOut(arrow), FadeIn(early), run_time=self.rt(0.6))
            cross = Cross(early, stroke_color=CORAL, stroke_width=6)
            self.play(Create(cross), run_time=self.rt(0.5))
            tq = coin("T", 0.6, AMBER).scale(s[0].height / coin("T", 0.6).height).move_to(q)
            self.play(FadeOut(early), FadeOut(cross), Transform(q, tq), run_time=self.rt(0.7))
            self.play(Flash(q, color=AMBER, line_length=0.3), run_time=self.rt(0.6))

        # ---------------- mine: THH was already there
        with self.beat("mine"):
            head6 = headline("One flip ahead")
            self.play(ReplacementTransform(head5, head6), run_time=self.rt(0.5))
            mine = bracket(s[3:6], AMBER, "THH: mine", up=True)
            self.play(*[a for c in s[4:6] for a in recolor(c, AMBER)], FadeIn(mine), run_time=self.rt(0.8))
            self.play(Indicate(s[3:6], color=AMBER, scale_factor=1.12), run_time=self.rt(0.8))
            self.play(s[6].animate.set_opacity(0.35), yours.animate.set_opacity(0.35), run_time=self.rt(0.6))

        # ---------------- odds: you only win if the game opens HHH
        with self.beat("odds"):
            head7 = headline("You win 1 in 8")
            self.play(ReplacementTransform(head6, head7), FadeOut(VGroup(s, mine, yours)), run_time=self.rt(0.5))
            from itertools import product
            seqs = ["".join(p) for p in product("HT", repeat=3)]
            tiles = VGroup()
            for sq in seqs:
                col = CORAL if sq == "HHH" else AMBER
                t = VGroup(RoundedRectangle(corner_radius=0.12, width=1.9, height=1.1, fill_color=col,
                                            fill_opacity=0.9, stroke_width=0),
                           Text(sq, font=FONT_BOLD, color=BG, font_size=50))
                tiles.add(t)
            tiles.arrange_in_grid(rows=2, cols=4, buff=0.2).move_to(UP * 3.7)
            fit(tiles, VIS_W)
            first = label("first three flips", MUTED, 40).next_to(tiles, UP, buff=0.2)
            self.play(FadeIn(first), LaggedStart(*[FadeIn(t, scale=0.7) for t in tiles], lag_ratio=0.1),
                      run_time=self.rt(1.4))
            big = Text("7 in 8", font=FONT_BOLD, color=AMBER, font_size=170).move_to(UP * 0.9)
            pct = label("= 87.5% for me", INK, 48, True).next_to(big, DOWN, buff=0.2)
            self.play(Indicate(tiles[0], color=CORAL, scale_factor=1.15), run_time=self.rt(0.7))
            self.play(FadeIn(big, scale=0.6), run_time=self.rt(0.7))
            self.play(FadeIn(pct), run_time=self.rt(0.5))
            sim = label("200,000 simulated games: 87.4%", MUTED, 36).next_to(pct, DOWN, buff=0.3)
            self.play(FadeIn(sim), run_time=self.rt(0.5))

        # ---------------- rule: flip the middle, put it in front, drop the last
        with self.beat("rule"):
            head8 = headline("Beats any pick")
            self.play(ReplacementTransform(head7, head8), FadeOut(VGroup(tiles, first, big, pct, sim)),
                      run_time=self.rt(0.5))
            yours_r = row("HHH", r=0.75, edge=CORAL).move_to(UP * 4.0)
            self.play(FadeIn(yours_r), run_time=self.rt(0.5))
            mid = yours_r[1].copy()
            self.play(mid.animate.move_to(UP * 1.8 + LEFT * 1.64), run_time=self.rt(0.7))
            t_mid = coin("T", 0.75, AMBER).move_to(mid)
            self.play(Transform(mid, t_mid), run_time=self.rt(0.5))
            rest = VGroup(yours_r[0].copy(), yours_r[1].copy())
            self.play(rest[0].animate.move_to(UP * 1.8), rest[1].animate.move_to(UP * 1.8 + RIGHT * 1.64),
                      yours_r[2].animate.set_opacity(0.25), run_time=self.rt(0.7))
            self.play(*recolor(rest[0], AMBER), *recolor(rest[1], AMBER), run_time=self.rt(0.4))
            steps = label("flip middle · put in front · drop last", MINT, 42).move_to(UP * 0.4)
            fit(steps, VIS_W)
            atleast = Text("at least 2 in 3", font=FONT_BOLD, color=AMBER, font_size=84).move_to(DOWN * 0.9)
            self.play(FadeIn(steps), run_time=self.rt(0.5))
            self.play(FadeIn(atleast, scale=0.7), run_time=self.rt(0.6))

        # ---------------- close: your turn, HTH
        with self.beat("close"):
            head9 = headline("Your turn", color=AMBER)
            self.play(ReplacementTransform(head8, head9),
                      FadeOut(VGroup(yours_r, mid, rest, steps, atleast)), run_time=self.rt(0.5))
            you = row("HTH", r=0.8, edge=CORAL)
            me = VGroup(*[coin("?", 0.8, AMBER) for _ in range(3)]).arrange(RIGHT, buff=0.14)
            VGroup(you, me).arrange(DOWN, buff=1.3).move_to(UP * 2.6).shift(RIGHT * 0.6)
            lab_you = label("you", CORAL, 64, True).next_to(you, LEFT, buff=0.6)
            lab_me = label("me", AMBER, 64, True).next_to(me, LEFT, buff=0.6)
            sub = label("a new one every day", MINT, 42).move_to(DOWN * 0.9)
            self.play(FadeIn(lab_you), LaggedStart(*[GrowFromCenter(c) for c in you], lag_ratio=0.3),
                      FadeIn(sub), run_time=self.rt(1.2))
            self.play(FadeIn(lab_me), LaggedStart(*[GrowFromCenter(c) for c in me], lag_ratio=0.3),
                      run_time=self.rt(1.0))
            self.play(LaggedStart(*[Wiggle(c) for c in me], lag_ratio=0.3), run_time=self.rt(1.4))
