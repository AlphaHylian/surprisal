"""Why picking the better of 2 beats checking all 100. Long-form, 16:9, Manim.

Expands the 11 Oct Short (two-choices). Chapters: one server or two? / why random piles up (wobble,
square root, coins, 100 on 100) / taking turns, asking everyone / the power of two choices (102, a
worked example, the squaring ladder, a million servers, the proof) / two myths (three picks; more
information) / when asking everyone backfires (herding, the stale-information simulation) / where it
runs (nginx, Envoy, hashing, cuckoo hashing) / the whole idea. Every number is computed in verify.py.
"""
import json
import os

from kit.brand import *
from kit.visuals import *

SAY = {b["id"]: b["say"] for b in json.load(open(os.path.join(EP, "script.json")))["beats"]}
BARS = json.load(open(os.path.join(EP, "bars.json")))
STAGE_Y = 0.15
BASE_Y = -2.1           # bottom of the server bars
K = 0.034               # bar height per job (130 jobs -> 4.4 units)


def T(s, size=44, color=INK, bold=True):
    return Text(s, font=FONT_BOLD if bold else FONT_MED, color=color, font_size=size)


def mono(s, size=40, color=INK):
    return Text(s, font=FONT_MONO, color=color, font_size=size)


def big(s, color=AMBER, size=150):
    return Text(s, font=FONT_BOLD, color=color, font_size=size)


def labelled_icon(name, text, color=MINT, h=1.3, size=34):
    i = icon(name, color, h)
    return VGroup(i, T(text, size, INK, bold=False).next_to(i, DOWN, buff=0.25))


def server_bars(loads, width=11.0, color=MINT, hi=None, k=K, base=BASE_Y):
    """One thin bar per server, bottom-aligned; the busiest one in `hi` colour."""
    n = len(loads)
    step = width / n
    top = max(loads)
    out = VGroup()
    for i, v in enumerate(loads):
        c = hi if (hi and v == top) else color
        r = Rectangle(width=step * 0.72, height=max(0.02, v * k), fill_color=c, fill_opacity=1, stroke_width=0)
        r.move_to([-width / 2 + step * (i + 0.5), base + v * k / 2, 0])
        out.add(r)
    return out


def level_line(v, width=11.4, color=INK, k=K, base=BASE_Y, text=None):
    l = DashedLine([-width / 2, base + v * k, 0], [width / 2, base + v * k, 0], color=color, dash_length=0.12, stroke_width=3)
    if text:
        lab = T(text, 30, color, False).next_to(l, RIGHT, buff=0.15)
        return VGroup(l, lab)
    return l


def server_box(label, load=None, color=MINT, w=1.2):
    box = RoundedRectangle(corner_radius=0.12, width=w, height=w * 1.25, fill_color=PANEL, fill_opacity=1, stroke_color=color, stroke_width=3)
    name = T(label, 26, MUTED, False).next_to(box, DOWN, buff=0.15)
    g = VGroup(box, name)
    if load is not None:
        g.add(T(str(load), 44, color).move_to(box))
    return g


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

    def bars_in(self, loads, hi=CORAL, color=MINT, rt=1.2):
        b = server_bars(loads, color=color, hi=hi)
        self.play(LaggedStart(*[GrowFromEdge(r, DOWN) for r in b], lag_ratio=0.01), run_time=self.rt(rt))
        return b

    # ------------------------------------------------------------ the episode
    def construct(self):
        # ======================= 1. one server or two?
        with self.beat("hook"):
            card = hook_card("126 vs 102", "1 RANDOM SERVER", "or the emptier of 2?")
            self.open_with(card)
            self.to_word("drowning")
            self.play(Indicate(card[1][0:3], color=CORAL, scale_factor=1.08), run_time=self.rt(0.8))

        with self.beat("promise"):
            self.play(FadeOut(card), run_time=self.rt(0.4))
            items = VGroup(labelled_icon("server", "2 ≈ all of them"),
                           labelled_icon("trophy", "2 beats all of them", AMBER),
                           labelled_icon("file-code", "one line of config", MINT)).arrange(RIGHT, buff=1.0)
            fit(items, 12.0, 4)
            items.move_to(UP * STAGE_Y)
            self.show(items[0])
            self.to_word("even beat")
            self.show(items[1])
            self.to_word("config")
            self.show(items[2])

        with self.beat("setup"):
            self.clear()
            grid = VGroup(*[icon("server", MINT, 0.42) for _ in range(100)]).arrange_in_grid(5, 20, buff=0.14).move_to(DOWN * 0.6)
            self.play(LaggedStart(*[FadeIn(s, scale=1.3) for s in grid], lag_ratio=0.01), run_time=self.rt(1.0))
            self.to_word("pour")
            jobs = VGroup(*[labelled_icon(n, t, AMBER, 0.8, 28) for n, t in (("globe", "web pages"), ("video", "uploads"), ("credit-card", "payments"))])
            jobs.arrange(RIGHT, buff=1.4).move_to(UP * 1.9)
            self.play(LaggedStart(*[FadeIn(j, shift=DOWN * 0.3) for j in jobs], lag_ratio=0.3), run_time=self.rt(1.0))
            self.to_word("instant")
            self.play(Indicate(grid, color=AMBER, scale_factor=1.02), run_time=self.rt(0.6))
            self.stage = grid

        with self.beat("stakes"):
            self.clear()
            b = self.bars_in(BARS["random"], hi=CORAL)
            self.to_word("average")
            avg = level_line(100, text="average")
            self.play(Create(avg), run_time=self.rt(0.5))
            self.to_word("worst server")
            top = max(range(100), key=lambda i: BARS["random"][i])
            ar = Arrow(b[top].get_top() + UP * 1.0, b[top].get_top() + UP * 0.1, color=CORAL, buff=0)
            self.play(GrowArrow(ar), Indicate(b[top], color=CORAL, scale_factor=1.3), run_time=self.rt(0.6))
            self.show(T("the worst one", 36, CORAL).next_to(ar, UP, buff=0.1))

        with self.beat("stakes2"):
            self.to_word("asking every")
            self.play(slam(stamp("A TRAP?", CORAL, -8, 64).move_to(UP * 2.4 + LEFT * 3)))

        # ======================= 2. why random piles up
        with self.beat("random_rule"):
            self.chapter("Why random piles up")
            dice = labelled_icon("dices", "pick any server", AMBER, 1.6, 36).move_to(LEFT * 3 + UP * STAGE_Y)
            self.show(dice)
            self.to_word("no questions")
            chips = VGroup(chip("no questions", MINT), chip("no bookkeeping", MINT)).arrange(DOWN, buff=0.35).move_to(RIGHT * 3 + UP * STAGE_Y)
            self.show(chips)

        with self.beat("avg"):
            self.clear()
            n = big("10,000 jobs", INK, 90).move_to(UP * 1.2)
            self.show(n)
            self.to_word("average")
            r = VGroup(T("÷ 100 servers =", 54, MUTED, False), big("100 each", MINT, 90)).arrange(RIGHT, buff=0.4).move_to(DOWN * 0.6)
            self.show(r)

        with self.beat("worst"):
            self.clear()
            b = self.bars_in(BARS["random"], hi=CORAL)
            avg = level_line(100, text="100")
            self.play(Create(avg), run_time=self.rt(0.4))
            self.to_word("126")
            hi = level_line(126, color=CORAL, text="126")
            self.play(Create(hi), run_time=self.rt(0.5))
            self.to_word("76")
            lo = level_line(min(BARS["random"]), color=AMBER, text=str(min(BARS["random"])))
            self.play(Create(lo), run_time=self.rt(0.5))
            self.to_word("gap of 50")
            self.show(chip("a gap of 50 jobs", CORAL).move_to(UP * 2.5))
            self.stage = VGroup(b, avg, hi, lo)

        with self.beat("wobble"):
            self.clear()
            d = labelled_icon("dice-5", "1 in 100 per job", AMBER, 1.4, 34).move_to(LEFT * 4 + UP * STAGE_Y)
            self.show(d)
            self.to_word("10,000 times")
            x = T("× 10,000 jobs", 50, INK).move_to(UP * 0.6)
            self.show(x)
            self.to_word("wobbles")
            w = VGroup(big("100", INK, 110), T("± 10", 70, AMBER)).arrange(RIGHT, buff=0.4).move_to(RIGHT * 2.2 + DOWN * 1.0)
            self.play(FadeIn(w, scale=1.2), run_time=self.rt(0.5))
            self.play(w[1].animate.shift(UP * 0.15), rate_func=there_and_back, run_time=self.rt(0.6))

        with self.beat("worst_of"):
            self.clear()
            xs = [-4, -2.7, -1.4, -0.1]
            # bell curve of one server's count, with the 126 marked
            ax = Axes(x_range=[60, 140, 10], y_range=[0, 0.045, 0.01], x_length=11, y_length=3.6,
                      axis_config={"color": MUTED, "stroke_width": 2}, tips=False).move_to(DOWN * 0.4)
            curve = ax.plot(lambda v: np.exp(-((v - 100) ** 2) / 200) / (10 * np.sqrt(2 * np.pi)), color=MINT, stroke_width=5)
            self.play(Create(ax), Create(curve), run_time=self.rt(1.0))
            lab = VGroup(*[T(str(v), 30, MUTED, False).next_to(ax.c2p(v, 0), DOWN, buff=0.15) for v in (80, 100, 110, 126)])
            self.show(lab)
            self.to_word("normal")
            m110 = DashedLine(ax.c2p(110, 0), ax.c2p(110, 0.03), color=INK)
            self.play(Create(m110), run_time=self.rt(0.4))
            self.to_word("unluckiest")
            m126 = DashedLine(ax.c2p(126, 0), ax.c2p(126, 0.03), color=CORAL, stroke_width=5)
            self.play(Create(m126), run_time=self.rt(0.4))
            self.show(T("2.5 wobbles high", 40, CORAL).next_to(ax.c2p(126, 0.03), UP, buff=0.15))
            self.to_word("126")
            self.play(Indicate(lab[3], color=CORAL, scale_factor=1.5), run_time=self.rt(0.6))
            del xs

        with self.beat("share"):
            self.clear()
            dots = VGroup(*[Dot(radius=0.16, color=CORAL if i % 7 == 3 else DIM) for i in range(98)]).arrange_in_grid(7, 14, buff=0.22)
            dots.move_to(UP * 0.3)
            self.play(LaggedStart(*[FadeIn(d_) for d_ in dots], lag_ratio=0.005), run_time=self.rt(0.8))
            self.to_word("1 server in 7")
            self.show(T("1 in 7 servers: 10+ over", 48, CORAL).move_to(DOWN * 2.0))

        with self.beat("grows"):
            self.clear()
            a = VGroup(T("10,000 jobs", 44, INK, False), T("+26 over", 70, CORAL)).arrange(DOWN, buff=0.3).move_to(LEFT * 3 + UP * STAGE_Y)
            self.show(a)
            self.to_word("million")
            b = VGroup(T("1,000,000 jobs", 44, INK, False), T("+250 over", 90, CORAL)).arrange(DOWN, buff=0.3).move_to(RIGHT * 3 + UP * STAGE_Y)
            arr = Arrow(a.get_right(), b.get_left(), color=MUTED, buff=0.3)
            self.play(GrowArrow(arr), FadeIn(b, scale=1.2), run_time=self.rt(0.7))
            self.stage = VGroup(a, b, arr)

        with self.beat("sqrt"):
            self.clear()
            eq = VGroup(T("100× the jobs", 60, INK), T("→", 60, MUTED), T("10× the pile-up", 60, CORAL)).arrange(RIGHT, buff=0.4).move_to(UP * 0.8)
            self.show(eq[0])
            self.to_word("ten times")
            self.show(eq[1], eq[2])
            self.to_word("never")
            self.show(T("random never settles down", 44, MUTED, False).move_to(DOWN * 1.2))

        with self.beat("coins"):
            self.clear()
            c1 = VGroup(icon("coins", AMBER, 1.0), T("100 flips", 40, INK, False), T("50 ± 5", 64, AMBER)).arrange(DOWN, buff=0.3).move_to(LEFT * 3 + UP * STAGE_Y)
            self.show(c1)
            self.to_word("10,000")
            c2 = VGroup(icon("coins", AMBER, 1.4), T("10,000 flips", 40, INK, False), T("5,000 ± 50", 64, AMBER)).arrange(DOWN, buff=0.3).move_to(RIGHT * 3 + UP * STAGE_Y)
            self.show(c2)
            self.stage = VGroup(c1, c2)

        with self.beat("coins2"):
            self.to_word("share")
            s1 = T("as a share: 5% → 1%", 40, MINT).move_to(DOWN * 2.1 + LEFT * 3)
            self.show(s1)
            self.to_word("actual jobs")
            s2 = T("in heads: 5 → 50", 40, CORAL).move_to(DOWN * 2.1 + RIGHT * 3)
            self.show(s2)
            self.to_word("busiest")
            self.play(Indicate(s2, color=CORAL), run_time=self.rt(0.6))

        with self.beat("one_each"):
            self.clear()
            loads = [0] * 100
            g = np.random.default_rng(3)
            for j in g.integers(0, 100, 100):
                loads[j] += 1
            k = 0.38
            b = server_bars(loads, k=k, base=-1.6, color=MINT, hi=CORAL)
            self.play(LaggedStart(*[GrowFromEdge(r, DOWN) for r in b], lag_ratio=0.01), run_time=self.rt(1.0))
            base = Line([-5.6, -1.6, 0], [5.6, -1.6, 0], color=MUTED, stroke_width=2)
            self.add(base)
            self.to_word("37")
            empties = VGroup(*[Dot(b[i].get_bottom() + DOWN * 0.18, radius=0.05, color=AMBER) for i, v in enumerate(loads) if v == 0])
            self.play(FadeIn(empties), run_time=self.rt(0.4))
            self.show(T("about 37 get nothing", 40, AMBER).move_to(DOWN * 2.3))
            self.to_word("unluckiest")
            self.show(T("the unluckiest: 4", 44, CORAL).move_to(UP * 2.2))

        # ======================= 3. taking turns, asking everyone
        with self.beat("turns"):
            self.chapter("Taking turns, asking everyone")
            boxes = VGroup(*[server_box(f"server {i}", color=MINT) for i in (1, 2, 3, 4)]).arrange(RIGHT, buff=0.9).move_to(UP * 0.1)
            self.show(boxes)
            for i in range(4):
                self.play(Indicate(boxes[i][0], color=AMBER, scale_factor=1.1), run_time=self.rt(0.35))
            self.stage = boxes

        with self.beat("turns_fail"):
            self.to_word("never")
            self.show(T("jobs are never the same size", 40, MUTED, False).move_to(UP * 2.3))
            self.to_word("video")
            v1 = icon("video", CORAL, 0.7).next_to(self.stage[2][0], UP, buff=0.1).shift(DOWN * 1.0)
            self.play(FadeIn(v1, scale=1.3), run_time=self.rt(0.4))
            self.to_word("stuck")
            vs = VGroup(*[icon("video", CORAL, 0.55) for _ in range(3)]).arrange(DOWN, buff=0.08).move_to(self.stage[2][0])
            self.play(ReplacementTransform(v1, vs), Indicate(self.stage[2][0], color=CORAL), run_time=self.rt(0.6))
            self.show(T("still gets its turn", 36, CORAL).next_to(self.stage, DOWN, buff=0.5))

        with self.beat("ask_all"):
            self.clear()
            bal = labelled_icon("split", "balancer", AMBER, 1.2, 30).move_to(LEFT * 5 + UP * 0.2)
            grid = VGroup(*[icon("server", MINT, 0.34) for _ in range(100)]).arrange_in_grid(5, 20, buff=0.1).move_to(RIGHT * 1.6 + UP * 0.2)
            self.show(bal, grid)
            self.to_word("ask every")
            rays = VGroup(*[Line(bal.get_right(), grid[i].get_center(), color=AMBER, stroke_width=1.5, stroke_opacity=0.6) for i in range(0, 100, 3)])
            self.play(LaggedStart(*[Create(r) for r in rays], lag_ratio=0.02), run_time=self.rt(1.0))
            self.to_word("emptiest")
            self.play(Indicate(grid[47], color=AMBER, scale_factor=1.8), run_time=self.rt(0.6))

        with self.beat("ask_all_works"):
            self.clear()
            b = self.bars_in(BARS["all"], hi=None)
            self.play(Create(level_line(100, text="100")), run_time=self.rt(0.4))
            self.to_word("exactly")
            self.show(chip("perfectly even", MINT).move_to(UP * 2.5))

        with self.beat("cost"):
            self.clear()
            q = VGroup(big("100", AMBER, 130), T("questions per job", 44, INK, False)).arrange(DOWN, buff=0.2).move_to(LEFT * 3 + UP * STAGE_Y)
            self.show(q)
            self.to_word("million")
            m = VGroup(big("1,000,000", CORAL, 110), T("questions for 10,000 jobs", 40, INK, False)).arrange(DOWN, buff=0.2).move_to(RIGHT * 3 + UP * STAGE_Y)
            self.show(m)

        with self.beat("cost_report"):
            self.clear()
            srvs = VGroup(*[icon("server", MINT, 0.6) for _ in range(6)]).arrange(DOWN, buff=0.15).move_to(LEFT * 4 + UP * 0.2)
            bal = labelled_icon("split", "balancer", AMBER, 1.2, 30).move_to(RIGHT * 3.5 + UP * 0.2)
            self.show(srvs, bal)
            msgs = VGroup(*[mono("load: %d" % v, 26, INK).move_to(srvs[i].get_right() + RIGHT * 0.9) for i, v in enumerate((3, 7, 2, 5, 4, 6))])
            self.play(LaggedStart(*[m.animate.move_to(bal.get_left() + LEFT * 0.8) for m in msgs], lag_ratio=0.15), run_time=self.rt(1.6))
            self.to_word("all the time")
            self.show(T("all the time", 44, CORAL).move_to(DOWN * 2.2))

        with self.beat("cost2"):
            self.clear()
            grid = VGroup(*[icon("server", MUTED, 0.22) for _ in range(400)]).arrange_in_grid(10, 40, buff=0.06).move_to(UP * 0.4)
            self.play(FadeIn(grid, lag_ratio=0.002), run_time=self.rt(1.0))
            self.to_word("too slow")
            self.play(slam(stamp("TOO SLOW", CORAL, -8, 72).move_to(UP * 0.4)))

        # ======================= 4. the power of two choices
        with self.beat("two_rule"):
            self.chapter("The power of two choices")
            grid = VGroup(*[icon("server", MUTED, 0.34) for _ in range(100)]).arrange_in_grid(5, 20, buff=0.1).move_to(DOWN * 0.3)
            self.show(grid)
            self.to_word("two servers")
            a, b = grid[23], grid[71]
            self.play(a.animate.set_color(AMBER).scale(1.6), b.animate.set_color(AMBER).scale(1.6), run_time=self.rt(0.5))
            self.to_word("emptier")
            self.play(b.animate.set_color(MINT).scale(1.3), run_time=self.rt(0.5))
            self.show(T("→ the emptier one", 40, MINT).move_to(DOWN * 2.3))

        with self.beat("two_cost"):
            self.clear()
            g = VGroup(big("2", MINT, 160), T("vs", 50, MUTED), big("100", CORAL, 160)).arrange(RIGHT, buff=0.6).move_to(UP * 0.4)
            self.show(g)
            self.show(T("questions per job", 40, INK, False).move_to(DOWN * 1.6))

        with self.beat("example"):
            self.clear()
            loads = [3, 5, 4, 2, 2, 5, 3, 6, 1, 4]
            boxes = VGroup(*[server_box(f"{i + 1}", loads[i], MINT, 0.85) for i in range(10)]).arrange(RIGHT, buff=0.3).move_to(DOWN * 0.2)
            self.show(boxes)
            self.to_word("server 3")
            self.play(boxes[2][0].animate.set_stroke(AMBER, 6), run_time=self.rt(0.3))
            self.to_word("server 8")
            self.play(boxes[7][0].animate.set_stroke(AMBER, 6), run_time=self.rt(0.3))
            self.to_word("goes to")
            job = icon("package", AMBER, 0.6).move_to(UP * 2.2)
            self.play(FadeIn(job), run_time=self.rt(0.3))
            new = T("5", 44, MINT).move_to(boxes[2][0])
            self.play(job.animate.move_to(boxes[2][0]).scale(0.3), run_time=self.rt(0.5))
            self.play(FadeOut(job), Transform(boxes[2][2], new), run_time=self.rt(0.3))
            self.stage = boxes

        with self.beat("example2"):
            boxes = self.stage
            self.play(boxes[2][0].animate.set_stroke(MINT, 3), run_time=self.rt(0.2))
            self.to_word("server 5")
            self.play(boxes[4][0].animate.set_stroke(AMBER, 6), run_time=self.rt(0.3))
            self.to_word("goes to")
            job = icon("package", AMBER, 0.6).move_to(UP * 2.2)
            self.play(FadeIn(job), run_time=self.rt(0.3))
            self.play(job.animate.move_to(boxes[4][0]).scale(0.3), run_time=self.rt(0.5))
            self.play(FadeOut(job), Transform(boxes[4][2], T("3", 44, MINT).move_to(boxes[4][0])), run_time=self.rt(0.3))
            self.to_word("keeps losing")
            self.play(boxes[7][0].animate.set_stroke(CORAL, 6), Indicate(boxes[7][2], color=CORAL), run_time=self.rt(0.5))
            self.show(T("busy servers lose almost every comparison", 36, CORAL).move_to(DOWN * 2.2))

        with self.beat("example3"):
            self.clear()
            a = VGroup(T("never needed:", 40, MUTED, False), T("the full list of loads", 48, CORAL)).arrange(DOWN, buff=0.2).move_to(LEFT * 3 + UP * STAGE_Y)
            self.show(a)
            self.to_word("two numbers")
            b = VGroup(mono("4 < 6 ?", 72, MINT), T("just which is smaller", 40, INK, False)).arrange(DOWN, buff=0.3).move_to(RIGHT * 3 + UP * STAGE_Y)
            self.show(b)

        with self.beat("two_result"):
            self.clear()
            b = self.bars_in(BARS["two"], hi=AMBER)
            self.play(Create(level_line(100, text="100")), run_time=self.rt(0.4))
            self.to_word("102")
            self.play(Create(level_line(102, color=AMBER, text="102")), run_time=self.rt(0.4))
            self.to_word("26 extra")
            ghost = level_line(126, color=CORAL, text="126 (random)")
            self.play(Create(ghost), run_time=self.rt(0.5))
            self.to_word("down to 2")
            self.show(chip("26 extra → 2 extra", MINT).move_to(UP * 2.6))

        with self.beat("subscribe"):
            self.clear()
            self.show(T("the actual numbers behind the tech you use", 44, INK, False).move_to(UP * 0.6))
            self.to_word("subscribe")
            self.show(chip("subscribe", AMBER, size=48).move_to(DOWN * 0.8))

        with self.beat("why_intro"):
            self.clear()
            self.show(big("why?", AMBER, 160).move_to(UP * STAGE_Y))

        with self.beat("why_one"):
            self.clear()
            dots = VGroup(*[Dot(radius=0.2, color=CORAL if i < 10 else DIM) for i in range(100)]).arrange_in_grid(5, 20, buff=0.18)
            dots.move_to(UP * 0.4)
            self.show(dots)
            self.show(T("10% busy", 40, CORAL).move_to(UP * 2.3))
            self.to_word("10% of the time")
            self.show(T("one pick: lands busy 1 time in 10", 44, INK).move_to(DOWN * 1.9))
            self.stage = dots

        with self.beat("why_two"):
            self.clear()
            sq = Square(4.0, stroke_color=MUTED, stroke_width=3).move_to(DOWN * 0.1)
            corner = Square(0.4, fill_color=CORAL, fill_opacity=1, stroke_width=0).move_to(sq.get_corner(UL) + np.array([0.2, -0.2, 0]))
            colb = Rectangle(width=0.4, height=4.0, fill_color=CORAL, fill_opacity=0.25, stroke_width=0).move_to(sq.get_left() + RIGHT * 0.2)
            rowb = Rectangle(width=4.0, height=0.4, fill_color=CORAL, fill_opacity=0.25, stroke_width=0).move_to(sq.get_top() + DOWN * 0.2)
            l1 = T("pick 1", 32, MUTED, False).next_to(sq, DOWN, buff=0.2)
            l2 = T("pick 2", 32, MUTED, False).rotate(PI / 2).next_to(sq, LEFT, buff=0.2)
            self.play(Create(sq), FadeIn(l1), FadeIn(l2), run_time=self.rt(0.6))
            self.to_word("both")
            self.play(FadeIn(colb), FadeIn(rowb), run_time=self.rt(0.5))
            self.play(FadeIn(corner, scale=1.5), run_time=self.rt(0.4))
            self.to_word("one job in 100")
            self.show(VGroup(T("10% × 10% =", 48, INK, False), T("1 in 100", 64, CORAL)).arrange(DOWN, buff=0.25).move_to(RIGHT * 4.3))

        with self.beat("ladder_intro"):
            self.clear()
            dots = VGroup(*[Dot(radius=0.2, color=MINT if i % 2 else DIM) for i in range(100)]).arrange_in_grid(5, 20, buff=0.18).move_to(UP * 0.4)
            self.show(dots)
            self.to_word("half")
            self.show(T("half have 1 job", 44, MINT).move_to(DOWN * 1.9))

        with self.beat("ladder"):
            self.clear()
            steps = VGroup(*[T(s, 60, c) for s, c in (("1 in 2", INK), ("1 in 4", AMBER), ("1 in 16", AMBER), ("1 in 256", CORAL), ("1 in 65,536", CORAL))])
            steps.arrange(RIGHT, buff=0.6)
            fit(steps, 12.8, 2)
            steps.move_to(UP * 0.3)
            self.show(steps[0])
            self.to_word("1 in 4")
            self.show(steps[1])
            self.stage = steps

        with self.beat("ladder2"):
            steps = self.stage
            self.to_word("1 in 16")
            self.show(steps[2])
            self.to_word("1 in 256")
            self.show(steps[3])
            self.to_word("65,536")
            self.play(FadeIn(steps[4], scale=1.3), run_time=self.rt(0.5))

        with self.beat("ladder3"):
            sq = VGroup(*[T("²", 50, MUTED).next_to(VGroup(self.stage[i], self.stage[i + 1]), DOWN, buff=0.4) for i in range(1, 4)])
            self.to_word("square")
            self.show(sq)
            self.to_word("few levels")
            self.show(T("the pile-up stops after a few levels", 44, MINT).move_to(DOWN * 2.1))

        with self.beat("million"):
            self.clear()
            t = T("1,000,000 jobs → 1,000,000 servers", 48, INK).move_to(UP * 1.7)
            self.show(t)
            self.to_word("8 or 9")
            a = VGroup(T("random", 40, MUTED, False), big("8–9", CORAL, 130)).arrange(DOWN, buff=0.2).move_to(LEFT * 3 + DOWN * 0.6)
            self.show(a)
            self.to_word("4")
            b = VGroup(T("two choices", 40, MUTED, False), big("4", MINT, 130)).arrange(DOWN, buff=0.2).move_to(RIGHT * 3 + DOWN * 0.6)
            self.show(b)

        with self.beat("proof"):
            self.clear()
            names = T("Azar · Broder · Karlin · Upfal", 54, AMBER).move_to(UP * 1.8)
            self.show(names)
            self.show(T("“Balanced Allocations”", 40, MUTED, False).next_to(names, DOWN, buff=0.3))
            self.to_word("random picks")
            ax = Axes(x_range=[0, 9, 3], y_range=[0, 10, 2], x_length=7, y_length=2.6, tips=False,
                      axis_config={"color": MUTED, "stroke_width": 2}).move_to(DOWN * 1.1)
            xl = T("servers: 10 → 1 billion", 28, MUTED, False).next_to(ax, DOWN, buff=0.1)
            self.play(Create(ax), FadeIn(xl), run_time=self.rt(0.5))
            r = ax.plot(lambda e: np.log(10 ** (e + 1)) / np.log(np.log(10 ** (e + 1))) * 1.0, x_range=[0, 9], color=CORAL, stroke_width=5)
            self.play(Create(r), run_time=self.rt(0.8))
            self.to_word("two picks")
            tw = ax.plot(lambda e: np.log(np.log(10 ** (e + 1))) / np.log(2) + 1, x_range=[0, 9], color=MINT, stroke_width=5)
            self.play(Create(tw), run_time=self.rt(0.8))
            self.to_word("handful")
            self.show(T("random", 30, CORAL).next_to(r.get_end(), RIGHT, buff=0.15), T("two", 30, MINT).next_to(tw.get_end(), RIGHT, buff=0.15))

        with self.beat("heavy"):
            self.clear()
            t = T("100 servers, 1,000,000 jobs", 48, INK).move_to(UP * 1.7)
            self.show(t)
            a = VGroup(T("random", 40, MUTED, False), big("+250", CORAL, 120)).arrange(DOWN, buff=0.2).move_to(LEFT * 3 + DOWN * 0.5)
            self.show(a)
            self.to_word("still about 2")
            b = VGroup(T("two choices", 40, MUTED, False), big("+2", MINT, 120)).arrange(DOWN, buff=0.2).move_to(RIGHT * 3 + DOWN * 0.5)
            self.show(b)
            self.to_word("at all")
            self.play(Indicate(b, color=MINT), run_time=self.rt(0.6))

        # ======================= 5. two myths
        with self.beat("three"):
            self.chapter("Two myths")
            m = T("Myth 1: more looks, more balance", 48, CORAL).move_to(UP * 1.6)
            self.show(m)
            self.to_word("three picks")
            r = VGroup(T("3 picks:", 50, INK, False), big("101", AMBER, 110)).arrange(RIGHT, buff=0.4).move_to(DOWN * 0.4)
            self.show(r)

        with self.beat("three2"):
            self.clear()
            rows = [("1 pick (random)", 26, CORAL), ("2 picks", 2, MINT), ("3 picks", 1, MINT), ("ask all 100", 0, MINT)]
            g = VGroup()
            for i, (lab, v, c) in enumerate(rows):
                l = T(lab, 36, INK, False)
                bar = Rectangle(width=max(0.05, v * 0.2), height=0.5, fill_color=c, fill_opacity=1, stroke_width=0)
                n = T(f"+{v}", 40, c)
                g.add(VGroup(l, bar, n))
            for i, row in enumerate(g):
                y = 1.4 - i * 0.95
                row[0].move_to([-3.4, y, 0]).align_to([-1.4, 0, 0], RIGHT)
                row[1].move_to([0, y, 0]).align_to([-1.1, 0, 0], LEFT)
                row[2].next_to(row[1], RIGHT, buff=0.25)
            self.play(LaggedStart(*[FadeIn(r, shift=RIGHT * 0.3) for r in g], lag_ratio=0.4), run_time=self.rt(2.0))
            self.to_word("24 of the 26")
            self.show(chip("the first extra look removes 24 of 26", AMBER).move_to(DOWN * 2.3))

        with self.beat("three3"):
            self.clear()
            self.show(VGroup(T("1 → 2:", 60, INK), T("the giant leap", 60, AMBER)).arrange(RIGHT, buff=0.4).move_to(UP * 0.8))
            self.to_word("small change")
            self.show(VGroup(T("2 → more:", 50, MUTED), T("small change, more questions", 50, MUTED, False)).arrange(RIGHT, buff=0.4).move_to(DOWN * 0.8))

        with self.beat("myth2"):
            self.clear()
            self.show(T("Myth 2: more information, better balance", 48, CORAL).move_to(UP * 0.8))
            self.to_word("wrong too")
            self.play(slam(stamp("WRONG", CORAL, -8, 72).move_to(DOWN * 1.0)))

        # ======================= 6. when asking everyone backfires
        with self.beat("stale_intro"):
            self.clear(keep_head=False)
            self.head("When asking everyone backfires")
            g = VGroup(icon("crown", AMBER, 1.2), T("ask everyone", 44, INK)).arrange(DOWN, buff=0.25).move_to(LEFT * 3 + UP * STAGE_Y)
            self.show(g)
            self.to_word("never live")
            c = VGroup(icon("clock", CORAL, 1.2), T("numbers are never live", 44, CORAL)).arrange(DOWN, buff=0.25).move_to(RIGHT * 3 + UP * STAGE_Y)
            self.show(c)

        with self.beat("stale_why"):
            self.clear()
            srv = labelled_icon("server", "server", MINT, 1.2, 30).move_to(LEFT * 4.5 + UP * 0.2)
            bal = labelled_icon("split", "balancer", AMBER, 1.2, 30).move_to(RIGHT * 4.5 + UP * 0.2)
            self.show(srv, bal)
            rep = VGroup(icon("file-text", INK, 0.6), mono("load: 3", 32, INK)).arrange(RIGHT, buff=0.15).move_to(LEFT * 2.6 + UP * 0.2)
            self.to_word("reports")
            self.play(FadeIn(rep), run_time=self.rt(0.3))
            self.play(rep.animate.move_to(RIGHT * 2.4 + UP * 0.2), run_time=self.rt(1.4), rate_func=linear)
            self.to_word("come and gone")
            real = mono("really: 9", 36, CORAL).next_to(srv, DOWN, buff=0.4)
            self.show(real)

        with self.beat("herd"):
            self.clear()
            n = 10
            loads = [7, 8, 6, 9, 7, 1, 8, 7, 9, 6]
            boxes = VGroup(*[server_box("", loads[i], MUTED if i != 5 else MINT, 0.85) for i in range(n)]).arrange(RIGHT, buff=0.3).move_to(DOWN * 0.3)
            self.show(boxes)
            self.to_word("except one")
            self.play(Indicate(boxes[5], color=MINT, scale_factor=1.15), run_time=self.rt(0.5))
            self.to_word("every new job")
            jobs = VGroup(*[icon("package", AMBER, 0.4).move_to(UP * 2.2 + RIGHT * (i - 3) * 0.7) for i in range(7)])
            self.play(FadeIn(jobs), run_time=self.rt(0.3))
            self.play(*[j.animate.move_to(boxes[5][0].get_center()).scale(0.4) for j in jobs], run_time=self.rt(0.9))
            self.play(FadeOut(jobs), Transform(boxes[5][2], T("8", 44, CORAL).move_to(boxes[5][0])), boxes[5][0].animate.set_stroke(CORAL, 5), run_time=self.rt(0.3))
            self.to_word("swamped")
            self.play(slam(stamp("SWAMPED", CORAL, -8, 52).next_to(boxes[5], UP, buff=0.3)))

        with self.beat("herd2"):
            self.clear()
            self.show(big("herding", CORAL, 130).move_to(UP * 0.8))
            self.to_word("emptiest")
            chain = VGroup(T("emptiest", 40, MINT), T("→", 40, MUTED), T("fullest", 40, CORAL), T("→ the next one", 40, MUTED, False)).arrange(RIGHT, buff=0.3).move_to(DOWN * 1.2)
            self.play(LaggedStart(*[FadeIn(c) for c in chain], lag_ratio=0.4), run_time=self.rt(1.6))

        with self.beat("sim_setup"):
            self.clear()
            t = terminal(["$ python verify.py", "servers  = 100", "load     = 90%", "jobs arrive and finish, every tick"], width=9.0, title="simulation")
            t.move_to(UP * STAGE_Y)
            self.play(FadeIn(t), run_time=self.rt(1.0))

        with self.beat("sim_fresh"):
            self.clear()
            self.show(T("fresh numbers: jobs ahead of a new job", 40, MUTED, False).move_to(UP * 2.3))
            rows = [("ask all", 0.67, MINT, "0.7"), ("two choices", 1.20, MINT, "1.2"), ("random", 6.99, CORAL, "7")]
            g = VGroup()
            for lab, v, c, txt in rows:
                g.add(VGroup(T(lab, 38, INK, False), Rectangle(width=v * 0.5, height=0.5, fill_color=c, fill_opacity=1, stroke_width=0), T(txt, 40, c)))
            for i, row in enumerate(g):
                y = 1.0 - i * 1.0
                row[0].move_to([-3.4, y, 0]).align_to([-1.4, 0, 0], RIGHT)
                row[1].move_to([0, y, 0]).align_to([-1.1, 0, 0], LEFT)
                row[2].next_to(row[1], RIGHT, buff=0.25)
            self.to_word("asking everyone")
            self.show(g[0])
            self.to_word("two choices")
            self.show(g[1])
            self.to_word("random")
            self.show(g[2])
            self.stage = g

        with self.beat("sim_stale"):
            self.clear()
            c = VGroup(icon("clock", AMBER, 1.4), T("numbers as old as 10 jobs take", 48, AMBER)).arrange(DOWN, buff=0.3).move_to(UP * STAGE_Y)
            self.show(c)

        with self.beat("sim_result"):
            self.clear()
            self.show(T("old numbers: jobs ahead of a new job", 40, MUTED, False).move_to(UP * 2.3))
            rows = [("ask all", 22.03, CORAL, "22"), ("random", 6.99, MUTED, "7"), ("two choices", 3.43, MINT, "3.4")]
            g = VGroup()
            for lab, v, c, txt in rows:
                g.add(VGroup(T(lab, 38, INK, False), Rectangle(width=v * 0.3, height=0.5, fill_color=c, fill_opacity=1, stroke_width=0), T(txt, 40, c)))
            for i, row in enumerate(g):
                y = 1.0 - i * 1.0
                row[0].move_to([-4.0, y, 0]).align_to([-2.4, 0, 0], RIGHT)
                row[1].move_to([0, y, 0]).align_to([-2.1, 0, 0], LEFT)
                row[2].next_to(row[1], RIGHT, buff=0.25)
            self.show(g[0])
            self.to_word("three times")
            self.show(g[1])
            self.to_word("two choices")
            self.show(g[2])
            self.play(Indicate(g[2], color=MINT), run_time=self.rt(0.6))

        with self.beat("sim_worse"):
            self.clear()
            a = VGroup(icon("shuffle", MUTED, 1.2), T("random: mistakes spread out", 40, INK, False)).arrange(DOWN, buff=0.3).move_to(LEFT * 3.4 + UP * STAGE_Y)
            self.show(a)
            self.to_word("same mistake")
            b = VGroup(icon("target", CORAL, 1.2), T("old numbers: same mistake,", 40, CORAL), T("same time, same server", 40, CORAL)).arrange(DOWN, buff=0.25).move_to(RIGHT * 3.4 + UP * STAGE_Y)
            self.show(b)

        with self.beat("sim_why"):
            self.clear()
            bal = VGroup(*[icon("split", AMBER, 0.6) for _ in range(5)]).arrange(DOWN, buff=0.25).move_to(LEFT * 4.5 + UP * 0.2)
            srv = VGroup(*[icon("server", MINT, 0.5) for _ in range(8)]).arrange(DOWN, buff=0.12).move_to(RIGHT * 4.5 + UP * 0.2)
            self.show(bal, srv)
            pairs = [(0, 1), (2, 6), (3, 4), (7, 0), (5, 2)]
            lines = VGroup()
            for i, (a, b) in enumerate(pairs):
                for s_ in (a, b):
                    lines.add(Line(bal[i].get_right(), srv[s_].get_left(), color=AMBER, stroke_width=2, stroke_opacity=0.7))
            self.play(LaggedStart(*[Create(l) for l in lines], lag_ratio=0.05), run_time=self.rt(1.2))
            self.to_word("herd never")
            self.show(chip("no herd", MINT, size=48).move_to(UP * 2.4))
            self.to_word("protects")
            self.show(T("a little randomness protects you", 40, INK, False).move_to(DOWN * 2.3))

        with self.beat("mitz"):
            self.clear()
            self.show(T("Michael Mitzenmacher", 56, AMBER).move_to(UP * 1.2))
            self.to_word("title")
            self.show(T("“How useful is old information?”", 54, INK).move_to(DOWN * 0.4))

        # ======================= 7. where it runs
        with self.beat("nginx"):
            self.chapter("Where it runs")
            cfg = terminal(["upstream backend {", "    random two least_conn;", "    server app1;  server app2;  ...", "}"], width=9.0, title="nginx.conf")
            cfg.move_to(UP * STAGE_Y)
            self.play(FadeIn(cfg), run_time=self.rt(0.8))
            self.to_word("fewer connections")
            self.show(chip("pick 2, fewer connections wins", MINT).move_to(DOWN * 2.3))

        with self.beat("envoy"):
            self.clear()
            e = VGroup(icon("network", MINT, 1.4), T("Envoy: least request", 48, INK)).arrange(RIGHT, buff=0.5).move_to(UP * 1.5)
            self.show(e)
            self.to_word("samples 2")
            self.show(T("samples 2 hosts (default), picks the less busy", 40, INK, False).move_to(UP * 0.0))
            self.to_word("resists herding")
            q = T("“resists herding”", 70, AMBER).move_to(DOWN * 1.5)
            self.show(q)
            self.stage = q

        with self.beat("envoy2"):
            self.to_word("on purpose")
            self.play(Indicate(self.stage, color=AMBER), run_time=self.rt(0.6))

        with self.beat("hashing"):
            self.clear()
            lists = VGroup(*[VGroup(*[Square(0.35, fill_color=MINT, fill_opacity=1, stroke_width=0) for _ in range(h)]).arrange(DOWN, buff=0.06)
                             for h in (2, 1, 3, 2, 2, 1, 2, 3, 2, 1)]).arrange(RIGHT, buff=0.3, aligned_edge=UP).move_to(UP * 0.4)
            key = mono("key", 40, AMBER).move_to(UP * 2.4 + LEFT * 2)
            self.show(lists, key)
            self.to_word("two possible")
            a1 = Arrow(key.get_bottom(), lists[2].get_top(), color=AMBER, buff=0.1)
            a2 = Arrow(key.get_bottom(), lists[5].get_top(), color=AMBER, buff=0.1)
            self.play(GrowArrow(a1), GrowArrow(a2), run_time=self.rt(0.5))
            self.to_word("emptier")
            self.play(Indicate(lists[5], color=AMBER, scale_factor=1.3), run_time=self.rt(0.5))
            self.to_word("tiny")
            self.show(T("the longest list stays tiny", 40, MINT).move_to(DOWN * 2.2))

        with self.beat("cuckoo"):
            self.clear()
            self.show(T("cuckoo hashing", 60, AMBER).move_to(UP * 2.2), T("Pagh & Rodler, 2001", 34, MUTED, False).move_to(UP * 1.5))
            h1 = server_box("home 1", None, MINT, 1.4).move_to(LEFT * 2 + DOWN * 0.6)
            h2 = server_box("home 2", None, MINT, 1.4).move_to(RIGHT * 2 + DOWN * 0.6)
            old = mono("old", 40, INK).move_to(h1[0])
            new = mono("new", 40, AMBER).move_to(UP * 0.6 + LEFT * 5)
            self.show(h1, h2, old)
            self.to_word("kicks")
            self.play(FadeIn(new), run_time=self.rt(0.3))
            self.play(new.animate.move_to(h1[0]), old.animate.move_to(h2[0]), run_time=self.rt(0.9))
            self.to_word("other home")
            self.play(Indicate(old, color=MINT), run_time=self.rt(0.5))

        with self.beat("cuckoo2"):
            self.to_word("two places")
            self.show(chip("find any key: check 2 places", MINT).move_to(DOWN * 2.4))
            self.to_word("half full")
            self.show(T("keep it under half full", 34, MUTED, False).move_to(UP * 0.7))

        # ======================= 8. the whole idea
        with self.beat("wrap1"):
            self.chapter("The whole idea")
            rows = VGroup(
                VGroup(T("random", 44, CORAL), T("cheap, but piles up", 40, INK, False)).arrange(RIGHT, buff=0.5),
                VGroup(T("ask everyone", 44, CORAL), T("slow, herds on old numbers", 40, INK, False)).arrange(RIGHT, buff=0.5),
                VGroup(T("two random picks", 44, MINT), T("cheap, even, robust", 40, INK, False)).arrange(RIGHT, buff=0.5),
            ).arrange(DOWN, buff=0.6, aligned_edge=LEFT).move_to(UP * 0.1)
            self.show(rows[0])
            self.stage = rows

        with self.beat("wrap2"):
            self.show(self.stage[1])

        with self.beat("wrap3"):
            self.show(self.stage[2])
            self.to_word("26")
            self.show(chip("26 extra → 2", AMBER).move_to(DOWN * 2.3))

        with self.beat("wrap4"):
            self.clear()
            self.play(FadeIn(big("one extra look", AMBER, 120).move_to(UP * STAGE_Y), scale=1.2), run_time=self.rt(0.6))

        with self.beat("cta"):
            self.clear()
            q = VGroup(T("a fifth of your servers are busy", 50, INK),
                       T("how often does a two-choice job hit one?", 50, AMBER)).arrange(DOWN, buff=0.45).move_to(UP * 0.4)
            self.show(q[0])
            self.to_word("how often")
            self.show(q[1])


class Thumbnail(Scene):
    def construct(self):
        bars = server_bars(BARS["random"], width=12.5, color=DIM, hi=CORAL, k=0.012, base=-3.7)
        top = Text("2 > 100", font=FONT_BOLD, color=AMBER, font_size=210).move_to(UP * 1.3)
        sub = Text("servers to check", font=FONT_BOLD, color=INK, font_size=80).move_to(DOWN * 0.7)
        self.add(bars, top, sub)
