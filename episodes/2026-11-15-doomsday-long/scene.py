"""Find the weekday of any date in your head (the Doomsday rule). Long-form, 16:9, Manim.

Expands the 10 Nov Short (doomsday-rule). Chapters: the five dates / why the dates line up / any year in
your head / why centuries jump / Friday the 13th / when the calendar broke / your turn.
Every number is computed in verify.py.
"""
import json
import os

import numpy as np

from kit.brand import *
from kit.visuals import *

SAY = {b["id"]: b["say"] for b in json.load(open(os.path.join(EP, "script.json")))["beats"]}
DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
MON = ["", "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]


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


def page(month, day, wday=None, color=MINT, w=1.7, h=2.0):
    """A tear-off calendar page: month strip, big day number, optional weekday under it."""
    box = RoundedRectangle(corner_radius=0.16, width=w, height=h, fill_color=PANEL, fill_opacity=1, stroke_color=color, stroke_width=4)
    strip = RoundedRectangle(corner_radius=0.16, width=w, height=h * 0.26, fill_color=color, fill_opacity=1, stroke_width=0)
    strip.move_to(box.get_top() + DOWN * h * 0.13)
    m = T(MON[month] if isinstance(month, int) else month, int(30 * w / 1.7), BG).move_to(strip)
    d = T(str(day), int(76 * w / 1.7), INK).move_to(box.get_center() + DOWN * h * 0.08)
    g = VGroup(box, strip, m, d)
    if wday:
        g.add(T(wday, int(30 * w / 1.7), AMBER).next_to(box, DOWN, buff=0.15))
    return g


def week(hi=None, w=1.25, color=AMBER, labels=DAYS):
    """Seven weekday boxes; hi = index to light up."""
    cells = VGroup()
    for i, name in enumerate(labels):
        on = hi is not None and i == hi
        b = RoundedRectangle(corner_radius=0.12, width=w, height=0.9, fill_color=color if on else PANEL, fill_opacity=1,
                             stroke_color=color if on else DIM, stroke_width=3)
        t = T(name, 34, BG if on else INK).move_to(b)
        cells.add(VGroup(b, t))
    return cells.arrange(RIGHT, buff=0.12)


def light(cells, i, color=AMBER):
    """Animations that light cell i of a week()."""
    b, t = cells[i]
    return [b.animate.set_fill(color, 1).set_stroke(color), t.animate.set_color(BG)]


def unlight(cells, i):
    b, t = cells[i]
    return [b.animate.set_fill(PANEL, 1).set_stroke(DIM), t.animate.set_color(INK)]


def eq(*parts, size=72):
    """A row of (text, color) pairs."""
    return row(*[T(s, size, c) for s, c in parts], buff=0.3)


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

    def five_pages(self, wday="SAT", y=0.0, w=1.7):
        ps = VGroup(*[page(m, m, wday, MINT, w=w) for m in (4, 6, 8, 10, 12)]).arrange(RIGHT, buff=0.45)
        return ps.move_to(UP * y)

    # ------------------------------------------------------------ the episode
    def construct(self):
        # ======================= 1. the five dates
        with self.beat("hook"):
            pages = self.five_pages("SAT", y=-0.9)
            top = fit(col(T("These 5 dates:", 64, INK), big("same weekday. Always.", AMBER, 92), buff=0.25), 13, 2.6).move_to(UP * 2.0)
            grp = VGroup(top, pages)
            self.open_with(grp)
            self.drift(grp, 1.02)

        with self.beat("promise"):
            self.play(FadeOut(grp), run_time=self.rt(0.4))
            items = row(labelled_icon("calendar-days", "any date", MINT), labelled_icon("brain", "in your head", AMBER),
                        labelled_icon("timer", "a few seconds", MINT), buff=1.6).move_to(UP * 0.4)
            self.show(items[0])
            self.to_word("in your head")
            self.show(items[1])
            self.to_word("few seconds")
            self.show(items[2])
            self.to_word("why it works")
            self.show(chip("and why it works", AMBER).move_to(DOWN * 2.0))

        with self.beat("recap1"):
            self.clear()
            self.head("Five dates")
            pages = self.five_pages(None, y=0.0)
            for i, w in enumerate(("April", "June", "August", "October", "December")):
                self.to_word(w)
                self.play(FadeIn(pages[i], shift=UP * 0.3), run_time=self.rt(0.35))
            self.to_word("Four four")
            self.play(Indicate(pages, color=AMBER, scale_factor=1.05), run_time=self.rt(1.0))

        with self.beat("recap2"):
            self.play(FadeOut(pages), run_time=self.rt(0.3))
            sat = self.five_pages("SATURDAY", y=0.6, w=1.6)
            self.show(sat, T("2026", 48, MUTED).move_to(DOWN * 1.9 + LEFT * 3.0))
            self.to_word("Next year")
            sun = self.five_pages("SUNDAY", y=0.6, w=1.6)
            self.play(Transform(sat, sun), run_time=self.rt(0.6))
            self.show(T("2027", 48, MUTED).move_to(DOWN * 1.9 + RIGHT * 3.0))
            self.to_word("together")
            self.play(Indicate(sat, color=AMBER), run_time=self.rt(0.8))

        with self.beat("recap3"):
            self.clear()
            self.head("The year's doomsday")
            name = col(icon("user", INK, 1.3), T("John Conway", 40, INK)).move_to(LEFT * 4.0)
            self.show(name)
            self.to_word("doomsday")
            dd = big("DOOMSDAY", AMBER, 120).move_to(RIGHT * 1.6 + UP * 0.6)
            self.play(FadeIn(dd, scale=1.3), run_time=self.rt(0.5))
            self.to_word("landmark")
            self.show(T("one landmark in every month", 44, MINT).next_to(dd, DOWN, buff=0.6))

        with self.beat("recap4"):
            self.clear()
            self.head("Christmas 2026")
            p12 = page(12, 12, "SAT", MINT).move_to(LEFT * 4.5)
            self.show(p12)
            self.to_word("19th")
            p19 = page(12, 19, "SAT", MINT).move_to(LEFT * 1.6)
            self.show(p19)
            self.to_word("26th")
            p26 = page(12, 26, "SAT", MINT).move_to(RIGHT * 4.5)
            self.show(p26)
            self.to_word("one day before")
            p25 = page(12, 25, "FRI", AMBER).move_to(RIGHT * 1.5)
            self.play(FadeIn(p25, shift=DOWN * 0.3), run_time=self.rt(0.5))
            self.play(Indicate(p25, color=AMBER), run_time=self.rt(0.6))

        with self.beat("recap5"):
            self.clear()
            steps = row(chip("this year ✓", MINT), chip("+ 2 steps", AMBER), chip("any year", AMBER), buff=0.6).move_to(UP * 0.8)
            self.show(steps[0])
            self.to_word("Two more")
            self.show(steps[1], steps[2])
            self.to_word("why")
            q = T("why should five dates agree?", 56, INK).move_to(DOWN * 1.2)
            self.show(q)

        # ======================= 2. why the dates line up
        with self.beat("why1"):
            self.chapter("Why the dates line up")
            a = page(4, 4, None, MINT).move_to(LEFT * 5.0 + DOWN * 0.3)
            b = page(6, 6, None, MINT).move_to(RIGHT * 5.0 + DOWN * 0.3)
            self.show(a, b)
            self.to_word("26 days")
            parts = row(T("26 Apr", 46, INK), T("+ 31 May", 46, INK), T("+ 6 Jun", 46, INK), buff=0.4).move_to(UP * 0.6)
            self.show(parts[0])
            self.to_word("31")
            self.show(parts[1])
            self.to_word("6 in June")
            self.show(parts[2])
            self.to_word("63")
            self.play(FadeIn(big("= 63 days", AMBER, 96).move_to(DOWN * 1.1), scale=1.2), run_time=self.rt(0.5))

        with self.beat("why2"):
            self.clear()
            v = big("63 = 9 × 7", AMBER, 130).move_to(UP * 1.2)
            self.show(v)
            pages = self.five_pages(None, y=-1.3, w=1.4)
            self.to_word("same thing")
            self.show(pages)
            arcs = VGroup(*[CurvedArrow(pages[i].get_top() + UP * 0.1, pages[i + 1].get_top() + UP * 0.1, angle=-0.9, color=MINT) for i in range(4)])
            labs = VGroup(*[T("9 wk", 30, MINT).next_to(arcs[i], UP, buff=0.05) for i in range(4)])
            self.to_word("August")
            self.play(LaggedStart(*[Create(x) for x in arcs], lag_ratio=0.3), FadeIn(labs), run_time=self.rt(1.4))
            self.to_word("on the nose")
            self.play(Indicate(v, color=AMBER), run_time=self.rt(0.6))

        with self.beat("why3"):
            self.clear()
            self.head("Odd months")
            phrase = col(T("I work", 70, INK), row(big("9", AMBER, 140), T("to", 70, INK), big("5", AMBER, 140), buff=0.4),
                         row(T("at the", 70, INK), big("7-Eleven", AMBER, 120), buff=0.4), buff=0.2).move_to(DOWN * 0.2)
            self.to_word("phrase")
            self.show(phrase[0])
            self.to_word("9 to 5")
            self.show(phrase[1])
            self.to_word("7-Eleven")
            self.show(phrase[2])

        with self.beat("why4"):
            self.clear()
            ps = VGroup(page(5, 9, None, MINT), page(9, 5, None, MINT), page(7, 11, None, AMBER), page(11, 7, None, AMBER)).arrange(RIGHT, buff=0.7).move_to(UP * 0.2)
            self.to_word("May 9th")
            self.show(ps[0])
            self.to_word("September")
            self.show(ps[1])
            self.to_word("July")
            self.show(ps[2])
            self.to_word("November")
            self.show(ps[3])
            self.to_word("All doomsdays")
            self.show(T("17 weeks apart, each pair", 40, MUTED, False).move_to(DOWN * 2.0))

        with self.beat("why5"):
            self.clear()
            pi = page(3, 14, None, AMBER).move_to(LEFT * 3.5)
            self.show(pi, T("π Day", 44, AMBER).next_to(pi, UP, buff=0.3))
            self.to_word("three weeks")
            a4 = page(4, 4, None, MINT).move_to(RIGHT * 3.5)
            arr = Arrow(pi.get_right(), a4.get_left(), buff=0.3, color=MINT, stroke_width=6)
            self.play(GrowArrow(arr), FadeIn(a4), run_time=self.rt(0.6))
            self.show(T("21 days", 44, MINT).next_to(arr, UP))

        with self.beat("why6"):
            self.clear()
            self.head("January and February")
            feb = page(2, 28, None, MINT).move_to(LEFT * 2.0 + UP * 0.4)
            self.to_word("February's last")
            self.show(feb)
            self.to_word("leap year")
            feb29 = page(2, 29, None, AMBER).move_to(LEFT * 2.0 + UP * 0.4)
            self.play(Transform(feb, feb29), run_time=self.rt(0.4))
            self.to_word("January")
            jan = page(1, 3, None, MINT).move_to(RIGHT * 2.0 + UP * 0.4)
            self.show(jan)
            self.to_word("the 4th")
            self.play(Transform(jan, page(1, 4, None, AMBER).move_to(RIGHT * 2.0 + UP * 0.4)), run_time=self.rt(0.4))
            self.show(T("normal: 3 / 28    leap: 4 / 29", 40, MUTED, False).move_to(DOWN * 2.0))

        with self.beat("why7"):
            self.clear()
            self.head("Every month covered")
            spec = [(1, "3/4"), (2, "28/29"), (3, 14), (4, 4), (5, 9), (6, 6), (7, 11), (8, 8), (9, 5), (10, 10), (11, 7), (12, 12)]
            grid = VGroup(*[page(m, d, None, AMBER if m in (1, 2, 3) else MINT, w=1.35, h=1.5) for m, d in spec]).arrange_in_grid(2, 6, buff=(0.35, 0.4)).move_to(DOWN * 0.3)
            self.play(LaggedStart(*[FadeIn(p, shift=UP * 0.2) for p in grid], lag_ratio=0.12), run_time=self.rt(2.2))
            self.drift(grid, 1.03)

        with self.beat("sub"):
            self.clear(keep_head=False)
            v = col(icon("bell", AMBER, 1.6), T("subscribe: new math twice a day", 48, INK)).move_to(UP * 0.3)
            self.show(v)
            self.drift(v, 1.03)

        # ======================= 3. any year
        with self.beat("year1"):
            self.chapter("Any year in your head")
            q = row(page(4, 4, "?", MINT), page(4, 4, "?", MINT), page(4, 4, "?", MINT), buff=0.8).move_to(DOWN * 0.3)
            labs = VGroup(*[T(y, 36, MUTED).next_to(q[i], UP, buff=0.2) for i, y in enumerate(("1969", "1989", "2100"))])
            self.show(q, labs)
            self.to_word("without")
            self.show(chip("no calendar", CORAL).move_to(DOWN * 2.3))

        with self.beat("year2"):
            self.clear()
            v = eq(("365", INK), ("=", MUTED), ("52 weeks", MINT), ("+ 1 day", AMBER), size=70).move_to(UP * 1.3)
            self.show(v)
            wk = week(hi=5).move_to(DOWN * 1.0)
            self.to_word("moves forward")
            self.show(wk)
            self.play(*unlight(wk, 5), *light(wk, 6), run_time=self.rt(0.5))
            self.show(T("+1 a year", 44, AMBER).move_to(DOWN * 2.2))

        with self.beat("year3"):
            self.clear()
            wk = week(hi=5).move_to(UP * 0.4)
            ys = VGroup(T("2026", 40, AMBER).next_to(wk[5], UP), )
            self.show(wk, ys)
            self.to_word("jumps two")
            self.show(T("Feb 29 comes before doomsday → +2", 44, MINT).move_to(UP * 2.2))
            self.to_word("2027")
            self.play(*unlight(wk, 5), *light(wk, 6), FadeIn(T("2027", 40, AMBER).next_to(wk[6], UP)), run_time=self.rt(0.5))
            self.to_word("2028")
            self.play(*unlight(wk, 6), *light(wk, 1), FadeIn(T("2028", 40, AMBER).next_to(wk[1], UP)), run_time=self.rt(0.5))
            self.show(T("leap year: skips Monday", 40, MUTED, False).move_to(DOWN * 1.6))

        with self.beat("year4"):
            self.clear()
            self.head("The year step")
            f = eq(("last two digits", MINT), ("+", MUTED), ("a quarter of them", AMBER), size=60).move_to(UP * 0.4)
            self.show(f[0])
            self.to_word("plus one extra")
            self.show(f[1], f[2])
            self.to_word("rounded down")
            self.show(T("(rounded down)", 40, MUTED, False).next_to(f, DOWN, buff=0.5))

        with self.beat("year5"):
            self.clear()
            self.head("1969")
            v = eq(("69", MINT), ("+", MUTED), ("17", AMBER), ("=", MUTED), ("86", INK), size=130).move_to(DOWN * 0.1)
            self.to_word("69")
            self.show(v[0])
            self.to_word("17")
            self.show(v[1], v[2])
            self.to_word("is 86")
            self.show(v[3], v[4])
            self.add(v)

        with self.beat("year6"):
            self.play(v.animate.scale(0.6).move_to(UP * 1.6), run_time=self.rt(0.4))
            w = eq(("86", INK), ("=", MUTED), ("12 × 7", MUTED), ("+", MUTED), ("2", AMBER), size=96).move_to(DOWN * 0.6)
            self.to_word("12 sevens")
            self.show(w[0], w[1], w[2])
            self.to_word("2 left")
            self.show(w[3], w[4])
            self.to_word("two days after")
            self.play(Indicate(w[4], color=AMBER, scale_factor=1.4), run_time=self.rt(0.6))

        with self.beat("year7"):
            self.clear()
            wk = week(hi=2).move_to(DOWN * 0.2)
            self.show(T("1900s start:", 44, MUTED).move_to(UP * 1.6), wk)
            self.to_word("Two days on")
            self.play(*unlight(wk, 2), *light(wk, 3), run_time=self.rt(0.3))
            self.play(*unlight(wk, 3), *light(wk, 4), run_time=self.rt(0.3))
            self.to_word("1969 was")
            self.show(big("1969: Friday", AMBER, 90).move_to(DOWN * 1.9))

        with self.beat("year8"):
            self.clear()
            self.head("Test: the Moon landing")
            p11 = page(7, 11, "FRI", MINT).move_to(LEFT * 4.5)
            self.to_word("11th")
            self.show(p11)
            self.to_word("18th")
            p18 = page(7, 18, "FRI", MINT).move_to(LEFT * 1.4)
            self.show(p18)
            self.to_word("20th is")
            p20 = page(7, 20, "SUN", AMBER).move_to(RIGHT * 1.7)
            self.show(p20)
            self.to_word("It was")
            self.play(FadeIn(icon("rocket", AMBER, 1.6).move_to(RIGHT * 4.8), shift=UP * 0.5), run_time=self.rt(0.5))

        with self.beat("year9"):
            self.clear()
            self.head("Conway's lazier way")
            q = T("“a dozen years is but a day”", 64, AMBER).move_to(DOWN * 0.1)
            self.to_word("dozen")
            self.show(q)

        with self.beat("year10"):
            self.clear()
            v = eq(("12 years", INK), ("=", MUTED), ("4,383 days", MINT), size=76).move_to(UP * 1.0)
            w = eq(("=", MUTED), ("626 weeks", MUTED), ("+ 1 day", AMBER), size=76).move_to(DOWN * 0.6)
            self.show(v)
            self.to_word("626")
            self.show(w)
            self.to_word("moves doomsday")
            self.show(T("one dozen = one step", 44, AMBER).move_to(DOWN * 2.2))

        with self.beat("year11"):
            self.clear()
            self.head("69, by dozens")
            r1 = eq(("69", INK), ("=", MUTED), ("5 dozens", MINT), ("+ 9", INK), size=70).move_to(UP * 1.0)
            self.show(r1)
            self.to_word("quarter of 9")
            r2 = eq(("9 ÷ 4", INK), ("→", MUTED), ("2", AMBER), size=70).move_to(DOWN * 0.3)
            self.show(r2)
            self.to_word("16")
            r3 = eq(("5 + 9 + 2 = 16", INK), ("→", MUTED), ("2", AMBER), size=70).move_to(DOWN * 1.6)
            self.show(r3)

        with self.beat("year12"):
            self.clear()
            self.head("Odd + 11 (2010)")
            steps = col(eq(("69 odd: + 11", INK), ("→ 80", AMBER), size=60), eq(("halve", INK), ("→ 40", AMBER), size=60),
                        eq(("up to 42", INK), ("→ 2", AMBER), size=60), buff=0.4).move_to(DOWN * 0.3)
            for i, w in enumerate(("add 11", "Halve", "next multiple")):
                self.to_word(w)
                self.show(steps[i], rt=0.4)
            self.to_word("No division")
            self.show(chip("no ÷ 4", MINT).move_to(RIGHT * 4.8 + DOWN * 2.0))

        with self.beat("year13"):
            self.clear()
            self.head("Test: the Berlin Wall")
            self.to_word("November 9th")
            wall = icon("brick-wall", MINT, 1.4).move_to(LEFT * 5.0 + UP * 0.6)
            self.show(wall, T("9 Nov 1989", 36, MUTED).next_to(wall, DOWN))
            self.to_word("89 plus 22")
            m = eq(("89 + 22 = 111", INK), ("→", MUTED), ("6", AMBER), size=64).move_to(RIGHT * 1.2 + UP * 1.0)
            self.show(m)
            self.to_word("Wednesday plus 6")
            self.show(T("Wed + 6 = Tue", 54, MINT).move_to(RIGHT * 1.2 + DOWN * 0.2))
            self.to_word("November 7th")
            ps = row(page(11, 7, "TUE", MINT, w=1.3, h=1.5), page(11, 9, "THU", AMBER, w=1.3, h=1.5), buff=0.6).move_to(RIGHT * 1.2 + DOWN * 1.7)
            self.show(ps[0])
            self.to_word("Thursday")
            self.show(ps[1])

        # ======================= 4. centuries
        with self.beat("cent1"):
            self.chapter("Why centuries jump")
            anc = VGroup(*[col(T(c, 44, MUTED), chip(d, AMBER if c == "1900s" else MINT)) for c, d in
                           (("1800s", "Friday"), ("1900s", "Wednesday"), ("2000s", "Tuesday"), ("2100s", "Sunday"))]).arrange(RIGHT, buff=0.7).move_to(DOWN * 0.2)
            for i, w in enumerate(("1900s", "2000s", "1800s", "2100s")):
                self.to_word(w)
                self.show(anc[[1, 2, 0, 3][i]], rt=0.35)
            self.to_word("Why")
            self.play(Indicate(anc, color=AMBER, scale_factor=1.03), run_time=self.rt(0.6))

        with self.beat("cent2"):
            self.clear()
            v = eq(("100 years", INK), ("+", MUTED), ("leap years", AMBER), size=76).move_to(UP * 0.6)
            self.show(v[0])
            self.to_word("each leap year")
            self.show(v[1], v[2])
            self.show(T("steps of doomsday across a century", 40, MUTED, False).move_to(DOWN * 1.2))

        with self.beat("cent3"):
            self.clear()
            self.head("1900 → 2000")
            r = col(eq(("100 + 25 = 125", INK), size=72), eq(("= 17 weeks", MUTED), ("+ 6", AMBER), size=72), buff=0.4).move_to(UP * 0.6)
            self.to_word("25 leap")
            self.show(r[0])
            self.to_word("17 weeks")
            self.show(r[1])
            wk = week(hi=2).move_to(DOWN * 1.8)
            self.to_word("one day back")
            self.show(wk)
            self.play(*unlight(wk, 2), *light(wk, 1), run_time=self.rt(0.5))

        with self.beat("cent4"):
            self.clear()
            self.head("2000 → 2100")
            r = col(eq(("100 + 24 = 124", INK), size=72), eq(("leaves", MUTED), ("5", AMBER), size=72), buff=0.4).move_to(UP * 0.6)
            self.show(r[0])
            self.to_word("124 leaves")
            self.show(r[1])
            wk = week(hi=1).move_to(DOWN * 1.8)
            self.to_word("two back")
            self.show(wk)
            self.play(*unlight(wk, 1), *light(wk, 6), run_time=self.rt(0.5))

        with self.beat("cent5"):
            self.clear()
            self.head("Every 400 years")
            names = [("2000", "Tue"), ("2100", "Sun"), ("2200", "Fri"), ("2300", "Wed"), ("2400", "Tue")]
            cyc = VGroup(*[col(T(y, 40, MUTED), chip(d, AMBER if i in (0, 4) else MINT)) for i, (y, d) in enumerate(names)]).arrange(RIGHT, buff=0.8).move_to(DOWN * 0.2)
            for i, w in enumerate(("Tuesday", "Sunday", "Friday", "Wednesday", "Tuesday again")):
                self.to_word(w)
                self.show(cyc[i], rt=0.3)
            self.to_word("repeats")
            self.play(Indicate(VGroup(cyc[0], cyc[4]), color=AMBER), run_time=self.rt(0.6))

        with self.beat("cent6"):
            self.clear()
            v = col(eq(("400 years", INK), ("=", MUTED), ("146,097 days", MINT), size=70), T("(97 leap days)", 40, MUTED, False), buff=0.3).move_to(UP * 1.4)
            self.to_word("97")
            self.show(v)
            self.to_word("Divide by 7")
            w = eq(("÷ 7 =", MUTED), ("20,871 weeks", AMBER), size=80).move_to(DOWN * 0.4)
            self.show(w)
            self.to_word("left over")
            self.show(chip("0 left over", AMBER).move_to(DOWN * 1.7))
            self.to_word("2426")
            self.show(T("2426 = 2026, weekday for weekday", 40, MINT).move_to(DOWN * 2.6))

        with self.beat("cent7"):
            self.clear()
            self.head("The four anchors")
            anc = VGroup(*[col(T(c, 46, MUTED), chip(d, AMBER, size=46)) for c, d in
                           (("2000s", "Tuesday"), ("1900s", "Wednesday"), ("1800s", "Friday"), ("2100s", "Sunday"))]).arrange(RIGHT, buff=0.7).move_to(DOWN * 0.2)
            for i, w in enumerate(("Tuesday", "Wednesday", "Friday", "Sunday")):
                self.to_word(w)
                self.show(anc[i], rt=0.3)

        # ======================= 5. Friday the 13th
        with self.beat("fri1"):
            self.chapter("Friday the 13th")
            ps = row(page(2, 13, "FRI", MINT), page(3, 13, "FRI", MINT), page(11, 13, "FRI", AMBER), buff=0.9).move_to(DOWN * 0.3)
            self.to_word("November 13th")
            self.show(ps[2])
            self.to_word("February")
            self.show(ps[0])
            self.to_word("March")
            self.show(ps[1])

        with self.beat("fri2"):
            self.clear()
            v = col(eq(("400 years", INK), ("=", MUTED), ("4,800", AMBER), ("thirteenths", INK), size=64), buff=0.3).move_to(UP * 1.2)
            self.show(v)
            self.to_word("686")
            self.show(T("even split: about 686 each", 48, MUTED).move_to(DOWN * 0.6))

        with self.beat("fri3"):
            self.clear()
            self.head("Which weekday is the 13th?")
            counts = [("Mon", 685), ("Tue", 685), ("Wed", 687), ("Thu", 684), ("Fri", 688), ("Sat", 684), ("Sun", 687)]
            base = 680
            bars = VGroup()
            for name, n in counts:
                hgt = 0.5 + (n - base) * 0.45
                b = Rectangle(width=1.1, height=hgt, fill_color=AMBER if name == "Fri" else MINT, fill_opacity=1, stroke_width=0)
                lab = T(name, 34, INK).next_to(b, DOWN, buff=0.15)
                num = T(str(n), 32, AMBER if name == "Fri" else INK).next_to(b, UP, buff=0.12)
                bars.add(VGroup(b, lab, num))
            bars.arrange(RIGHT, buff=0.35, aligned_edge=DOWN).move_to(DOWN * 0.4)
            self.play(LaggedStart(*[FadeIn(b, shift=UP * 0.2) for b in bars], lag_ratio=0.12), run_time=self.rt(1.4))
            self.to_word("Friday gets")
            self.play(Indicate(bars[4], color=AMBER, scale_factor=1.15), run_time=self.rt(0.6))
            self.to_word("684")
            self.play(Indicate(VGroup(bars[3], bars[5]), color=CORAL), run_time=self.rt(0.6))
            self.show(T("(bars start at 680)", 30, MUTED, False).move_to(RIGHT * 5.2 + DOWN * 2.6))

        with self.beat("fri4"):
            self.clear()
            v = col(T("whole number of weeks", 50, MINT), T("→ the count never evens out", 50, INK), big("688", AMBER, 140), T("every 400 years, forever", 40, MUTED, False), buff=0.3).move_to(DOWN * 0.1)
            self.show(v[0])
            self.to_word("never evens")
            self.show(v[1])
            self.to_word("688")
            self.show(v[2], v[3])

        with self.beat("fri5"):
            self.clear()
            v = row(col(T("every year", 44, MUTED), big("≥ 1", MINT, 130)), col(T("never more than", 44, MUTED), big("3", AMBER, 130)), buff=2.0).move_to(UP * 0.1)
            self.to_word("at least one")
            self.show(v[0])
            self.to_word("three")
            self.show(v[1])

        # ======================= 6. when the calendar broke
        with self.beat("hist1"):
            self.chapter("When the calendar broke")
            v = col(icon("scroll", MINT, 1.4), T("Britain, before 1752", 44, INK)).move_to(DOWN * 0.3)
            self.show(v)
            self.to_word("different calendar")
            self.show(chip("a different calendar", CORAL).move_to(DOWN * 2.3))

        with self.beat("hist2"):
            self.clear()
            v = col(T("Julian: a leap day every 4 years", 50, INK), T("no exceptions", 44, CORAL), buff=0.3).move_to(UP * 1.2)
            self.show(v)
            self.to_word("11 days")
            self.show(big("11 days behind", AMBER, 100).move_to(DOWN * 0.9))

        with self.beat("hist3"):
            self.clear()
            self.head("September 1752")
            a = page(9, 2, "WED", MINT, w=2.0, h=2.3).move_to(LEFT * 3.0)
            b = page(9, 14, "THU", AMBER, w=2.0, h=2.3).move_to(RIGHT * 3.0)
            self.to_word("Wednesday")
            self.show(a)
            self.to_word("followed")
            arr = Arrow(a.get_right(), b.get_left(), buff=0.3, color=INK, stroke_width=6)
            self.play(GrowArrow(arr), run_time=self.rt(0.4))
            self.to_word("Thursday")
            self.show(b)
            gone = T("3 … 13 gone", 40, CORAL).next_to(arr, UP, buff=0.2)
            self.show(gone)

        with self.beat("hist4"):
            self.clear()
            wk = week(hi=2).move_to(UP * 1.2)
            self.show(wk)
            self.to_word("didn't skip")
            self.play(*unlight(wk, 2), *light(wk, 3), run_time=self.rt(0.4))
            self.to_word("1700s")
            m = eq(("1700s: Sun", MINT), ("+ 52 + 13", INK), ("→ Tue", AMBER), size=54).move_to(DOWN * 0.4)
            self.show(m)
            self.to_word("Thursday")
            self.show(T("9/5 Tue → 9/12 Tue → 9/14 Thu ✓", 46, AMBER).move_to(DOWN * 1.7))

        with self.beat("hist5"):
            self.clear()
            v = row(col(icon("check", MINT, 1.3), T("modern dates", 40, INK)), col(icon("triangle-alert", CORAL, 1.3), T("Britain before 1752", 36, INK), T("much of Europe before 1582", 36, INK)), buff=2.0).move_to(UP * 0.2)
            self.show(v[0])
            self.to_word("before 1752")
            self.show(v[1])
            self.to_word("its own anchors")
            self.show(T("old calendar, its own anchors", 40, MUTED, False).move_to(DOWN * 2.1))

        with self.beat("hist6"):
            self.clear()
            a = col(icon("user", INK, 1.3), T("Conway, 1973", 40, INK)).move_to(LEFT * 3.5)
            b = col(icon("book-open", MINT, 1.3), T("Lewis Carroll's method", 40, INK)).move_to(RIGHT * 3.5)
            self.show(a)
            self.to_word("Lewis Carroll")
            self.show(b)
            self.to_word("under two")
            self.show(big("< 2 seconds", AMBER, 96).move_to(DOWN * 1.9))

        with self.beat("hist7"):
            self.clear()
            term = terminal(["login: conway", "> what weekday was 14 March 1879?", "> _"], width=9.0, title="every login")
            fit(term, 10, 4.5).move_to(DOWN * 0.1)
            self.to_word("computer")
            self.show(term)
            self.drift(term, 1.02)

        # ======================= 7. your turn
        with self.beat("your1"):
            self.chapter("Your turn")
            steps = col(T("1. the century's anchor", 44), T("2. + last two digits + a quarter of them", 44), T("3. throw away sevens = the year's doomsday", 44, AMBER), buff=0.35).move_to(DOWN * 0.4)
            for i, w in enumerate(("anchor", "last two", "Throw")):
                self.to_word(w)
                self.show(steps[i], rt=0.4)

        with self.beat("your2"):
            self.clear()
            spec = [(1, "3/4"), (2, "28/29"), (3, 14), (4, 4), (5, 9), (6, 6), (7, 11), (8, 8), (9, 5), (10, 10), (11, 7), (12, 12)]
            grid = VGroup(*[page(m, d, None, MINT, w=1.35, h=1.5) for m, d in spec]).arrange_in_grid(2, 6, buff=(0.35, 0.4)).move_to(UP * 0.1)
            order = [3, 5, 7, 9, 11, 4, 8, 6, 10, 2, 1, 0]
            self.play(LaggedStart(*[FadeIn(grid[i], shift=UP * 0.2) for i in order], lag_ratio=0.15), run_time=self.rt(3.0))
            self.to_word("Count")
            self.show(T("4. count to your date", 44, AMBER).move_to(DOWN * 2.3))

        with self.beat("your3"):
            self.clear()
            self.head("Test: 1 January 2000")
            r = col(eq(("2000s: Tue", MINT), ("+ 0 + 0", INK), ("→ Tue", AMBER), size=58), T("leap year → January 4th", 44, INK), buff=0.4).move_to(UP * 1.0)
            self.to_word("Tuesday")
            self.show(r[0])
            self.to_word("leap year")
            self.show(r[1])
            self.to_word("Back three")
            ps = row(page(1, 4, "TUE", MINT, w=1.4, h=1.6), page(1, 1, "SAT", AMBER, w=1.4, h=1.6), buff=1.0).move_to(DOWN * 1.4)
            self.show(ps[0])
            self.to_word("Saturday")
            self.show(ps[1])

        with self.beat("your4"):
            self.clear()
            v = col(big("100,000", AMBER, 140), T("random dates, 1800 to 2199", 44, INK), T("all correct", 54, MINT), buff=0.35).move_to(DOWN * 0.1)
            self.show(v[0], v[1])
            self.to_word("every one")
            self.show(v[2])

        with self.beat("your5"):
            self.clear()
            self.head("Check this one", AMBER)
            q = col(T("2100 is not a leap year", 44, MUTED, False), row(T("New Year's Day", 60, INK), big("2100", AMBER, 110), buff=0.4), T("what weekday?", 60, INK), buff=0.35).move_to(DOWN * 0.1)
            self.show(q[0])
            self.to_word("New Year")
            self.show(q[1])
            self.to_word("comments")
            self.show(q[2], chip("answer in the comments", MINT).move_to(DOWN * 2.4))


class Thumbnail(Scene):
    def construct(self):
        ps = VGroup(*[page(m, m, None, MINT, w=1.6, h=1.9) for m in (4, 6, 8, 10, 12)]).arrange(RIGHT, buff=0.35).move_to(DOWN * 1.6)
        top = fit(Text("Any date's weekday", font=FONT_BOLD, color=AMBER, font_size=120), 13, 2).move_to(UP * 2.2)
        sub = Text("in your head", font=FONT_BOLD, color=INK, font_size=96).move_to(UP * 0.6)
        self.add(ps, top, sub)
