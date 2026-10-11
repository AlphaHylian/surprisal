"""How hackers crack passwords (and the 6 words that stop them). Long-form, 16:9, Manim.

Expands the 8 Oct Short (password-length). Chapters: the 2-second password / what the hacker really
has (hashes, offline guessing, 100 billion a second) / counting the guesses (26^8, 95^8, length, bits)
/ humans aren't random (RockYou, dictionary + rules, NIST) / how the site slows them down (salt,
LinkedIn 2012, bcrypt) / six words and five dice (Diceware, xkcd 936) / the whole thing in one line /
what to do. Every number is computed in verify.py.
"""
import json
import math
import os

from kit.brand import *
from kit.visuals import *

SAY = {b["id"]: b["say"] for b in json.load(open(os.path.join(EP, "script.json")))["beats"]}
STAGE_Y = 0.15          # centre of the visual zone (between the headline and the captions)


def T(s, size=44, color=INK, bold=True):
    return Text(s, font=FONT_BOLD if bold else FONT_MED, color=color, font_size=size)


def mono(s, size=40, color=INK):
    return Text(s, font=FONT_MONO, color=color, font_size=size)


def pw_field(text, width=6.4, color=MINT, size=54):
    """A password input box with its contents."""
    t = mono(text, size, INK)
    box = RoundedRectangle(corner_radius=0.18, width=max(width, t.width + 0.8), height=t.height + 0.7,
                           fill_color=PANEL, fill_opacity=1, stroke_color=color, stroke_width=4)
    t.move_to(box)
    lock = icon("lock-keyhole", color, 0.6).next_to(box, LEFT, buff=0.25)
    return VGroup(box, t, lock)


def big(s, color=AMBER, size=150):
    return Text(s, font=FONT_BOLD, color=color, font_size=size)


def labelled_icon(name, text, color=MINT, h=1.3, size=34):
    i = icon(name, color, h)
    return VGroup(i, T(text, size, INK, bold=False).next_to(i, DOWN, buff=0.25))


def log_bar_rows(rows, width=8.0, lo=-3, hi=20):
    """Horizontal bars on a log scale of seconds. rows: (label, seconds, color, readout)."""
    out = VGroup()
    for lab, sec, col, txt in rows:
        frac = (math.log10(max(sec, 10 ** lo)) - lo) / (hi - lo)
        l = T(lab, 34, MUTED, bold=False)
        l.width = min(l.width, 3.2)
        bar = RoundedRectangle(corner_radius=0.08, width=max(0.12, width * frac), height=0.42,
                               fill_color=col, fill_opacity=1, stroke_width=0)
        r = T(txt, 34, col)
        out.add(VGroup(l, bar, r))
    for i, g in enumerate(out):
        l, bar, r = g
        y = -i * 0.75
        l.move_to([-4.6, y, 0]).align_to([-3.0, 0, 0], RIGHT)
        bar.move_to([0, y, 0]).align_to([-2.75, 0, 0], LEFT)
        r.next_to(bar, RIGHT, buff=0.25)
    return out


class Episode(SurprisalScene):
    # ------------------------------------------------------------ helpers
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
        """Chapter card: big title for a moment, then it becomes the headline."""
        self.clear(keep_head=False, rt=0.35)
        card = Text(title, font=FONT_DISPLAY, color=AMBER, font_size=96)
        fit(card, 12, 2)
        self.play(FadeIn(card, scale=1.1), run_time=self.rt(0.5))
        self.wait(self.rt(0.6, 0.2))
        new = headline(title, INK, size=60)
        self.play(ReplacementTransform(card, new), run_time=self.rt(0.5))
        self._head = new

    # ------------------------------------------------------------ the episode
    def construct(self):
        # ======================= 1. the 2-second password
        with self.beat("hook"):
            card = hook_card("2 seconds", "YOUR 8-LETTER PASSWORD", "+ symbols? 18 hours")
            self.open_with(card)
            self.to_word("symbols")
            self.play(Indicate(card[2], color=CORAL, scale_factor=1.06), run_time=self.rt(0.8))

        with self.beat("promise"):
            self.play(FadeOut(card), run_time=self.rt(0.4))
            items = VGroup(labelled_icon("cpu", "how they guess"),
                           labelled_icon("x-circle", "why the advice fails", CORAL),
                           labelled_icon("shield-check", "70,000 years", AMBER)).arrange(RIGHT, buff=1.6)
            items.move_to(UP * STAGE_Y)
            self.show(items[0])
            self.to_word("why")
            self.show(items[1])
            self.to_word("build")
            self.show(items[2])

        with self.beat("count_promise"):
            calc = MathTex(r"\text{time} = \frac{\text{guesses}}{\text{speed}}", font_size=84).move_to(UP * STAGE_Y)
            self.play(FadeOut(items, shift=UP * 0.3), Write(calc), run_time=self.rt(1.2))
            self.to_word("count")
            self.play(Circumscribe(calc, color=AMBER), run_time=self.rt(1.0))
            self.stage = calc

        # ======================= 2. what the hacker really has
        with self.beat("not_login"):
            self.chapter("What the hacker really has")
            login = VGroup(icon("log-in", MINT, 1.4), T("your login page", 36, INK, False)).arrange(DOWN, buff=0.3)
            login.move_to(LEFT * 3 + UP * STAGE_Y)
            tries = VGroup(*[T(f"try {i}", 32, MUTED, False) for i in range(1, 6)]).arrange(DOWN, buff=0.15).move_to(RIGHT * 0.5 + UP * STAGE_Y)
            self.show(login)
            self.play(LaggedStart(*[FadeIn(t, shift=LEFT * 0.3) for t in tries], lag_ratio=0.3), run_time=self.rt(1.2))
            self.to_word("lock")
            st = stamp("LOCKED", CORAL, -8, 64).move_to(RIGHT * 3.6 + UP * STAGE_Y)
            self.play(slam(st))

        with self.beat("hash_store"):
            self.clear()
            pw = pw_field("hunter2", 4.6).move_to(LEFT * 3.8 + UP * 0.6)
            db = VGroup(icon("database", MINT, 1.6), T("the site stores", 30, MUTED, False)).arrange(DOWN, buff=0.25)
            db.move_to(RIGHT * 4 + UP * 0.6)
            self.show(pw, db)
            self.to_word("fingerprint")
            fp = icon("fingerprint", AMBER, 1.5).move_to(UP * 0.6)
            arr1 = Arrow(pw.get_right(), fp.get_left(), color=MUTED, buff=0.2)
            arr2 = Arrow(fp.get_right(), db.get_left(), color=MUTED, buff=0.2)
            self.play(GrowArrow(arr1), FadeIn(fp, scale=1.3), GrowArrow(arr2), run_time=self.rt(0.8))
            self.to_word("hash", 1)
            lab = T("a hash", 44, AMBER).next_to(fp, DOWN, buff=0.35)
            self.show(lab)

        with self.beat("hash_oneway"):
            self.clear()
            a = mono("hunter2", 52, INK)
            ha = mono("2ab96390c7dbe3439de74d0c9b0b1767", 40, AMBER)
            row1 = VGroup(a, Arrow(ORIGIN, RIGHT * 1.2, color=MUTED), ha).arrange(RIGHT, buff=0.35).move_to(UP * 1.1)
            fit(row1, 12.5, 1)
            self.play(FadeIn(row1[0]), run_time=self.rt(0.4))
            self.to_word("out comes")
            self.play(GrowArrow(row1[1]), AddTextLetterByLetter(row1[2]), run_time=self.rt(1.2))
            self.to_word("change")
            b = mono("hunter3", 52, INK)
            hb = mono("46b2114265fe361c6020347592d67912", 40, CORAL)
            row2 = VGroup(b, Arrow(ORIGIN, RIGHT * 1.2, color=MUTED), hb).arrange(RIGHT, buff=0.35).move_to(DOWN * 0.3)
            fit(row2, 12.5, 1)
            row2.align_to(row1, LEFT)
            self.play(FadeIn(row2[0]), GrowArrow(row2[1]), FadeIn(row2[2]), run_time=self.rt(0.8))
            self.to_word("backwards")
            back = VGroup(T("hash", 36, MUTED, False), T("→ password?", 36, CORAL)).arrange(RIGHT, buff=0.2).move_to(DOWN * 1.7)
            self.show(back)
            self.play(slam(stamp("ONE WAY", CORAL, -6, 48).next_to(back, RIGHT, buff=0.5)))

        with self.beat("hash_login"):
            self.clear()
            typed = pw_field("hunter2", 4.2).move_to(LEFT * 4 + UP * 0.6)
            h1 = mono("2ab963...1767", 40, AMBER).move_to(UP * 0.6 + RIGHT * 0.6)
            stored = VGroup(T("stored", 30, MUTED, False), mono("2ab963...1767", 40, AMBER)).arrange(DOWN, buff=0.2).move_to(DOWN * 1.2 + RIGHT * 0.6)
            self.show(typed)
            self.play(FadeIn(h1, shift=RIGHT * 0.3), Create(Arrow(typed.get_right(), h1.get_left(), color=MUTED, buff=0.2)), run_time=self.rt(0.7))
            self.to_word("compares")
            self.show(stored)
            self.to_word("match")
            ok = icon("check", MINT, 1.3).move_to(RIGHT * 4.6 + DOWN * 0.3)
            self.play(FadeIn(ok, scale=1.5), Indicate(h1, color=MINT), Indicate(stored[1], color=MINT), run_time=self.rt(0.7))

        with self.beat("breach"):
            self.clear()
            db = icon("database", CORAL, 2.0).move_to(LEFT * 3.5 + UP * 0.3)
            self.show(db)
            self.to_word("leaks")
            rows = VGroup(*[mono(s, 30, AMBER) for s in ("2ab96390c7dbe343...", "5f4dcc3b5aa765d6...", "e10adc3949ba59ab...", "25d55ad283aa400a...")])
            rows.arrange(DOWN, buff=0.2).move_to(RIGHT * 2.2 + UP * 0.3)
            self.play(LaggedStart(*[FadeIn(r, shift=RIGHT * 0.8) for r in rows], lag_ratio=0.2), run_time=self.rt(1.0))
            self.to_word("no lockout")
            chips = VGroup(chip("no lockout", MINT), chip("no time limit", MINT)).arrange(RIGHT, buff=0.4).move_to(DOWN * 1.7)
            self.show(chips)

        with self.beat("guess_loop"):
            self.clear()
            guess = pw_field("aaaaaaaa", 4.6).move_to(LEFT * 4 + UP * 0.5)
            target = VGroup(T("leaked", 30, MUTED, False), mono("2ab963...1767", 40, AMBER)).arrange(DOWN, buff=0.2).move_to(RIGHT * 4 + UP * 0.5)
            self.show(guess, target)
            self.to_word("hash a guess")
            for w in ("aaaaaaab", "aaaaaaac", "aaaaaaad", "aaaaaaae"):
                nw = pw_field(w, 4.6).move_to(guess)
                x = icon("x", CORAL, 0.7).move_to(UP * 0.5)
                self.play(Transform(guess, nw), FadeIn(x), run_time=self.rt(0.35))
                self.play(FadeOut(x), run_time=self.rt(0.15))
            self.to_word("billions")
            self.show(T("billions of times", 52, AMBER).move_to(DOWN * 1.6))

        with self.beat("gpu"):
            self.clear()
            gpu = labelled_icon("cpu", "one RTX 4090", MINT, 1.8, 38).move_to(LEFT * 3.6 + UP * STAGE_Y)
            self.show(gpu)
            self.to_word("156")
            n = big("156 billion", AMBER, 100)
            sub = T("MD5 hashes every second", 38, INK, False)
            g = VGroup(n, sub).arrange(DOWN, buff=0.3).move_to(RIGHT * 2.4 + UP * STAGE_Y)
            self.play(FadeIn(n, scale=1.4), FadeIn(sub), run_time=self.rt(0.6))
            self.to_word("fast")
            self.show(chip("fast = bad here", CORAL).next_to(g, DOWN, buff=0.4))

        with self.beat("round"):
            self.clear()
            n = big("100 billion / s", AMBER, 110).move_to(UP * 0.8)
            self.play(FadeIn(n, scale=1.3), run_time=self.rt(0.6))
            self.show(T("rounded down, one card", 38, MUTED, False).next_to(n, DOWN, buff=0.3))
            self.to_word("rent")
            cards = VGroup(*[icon("cpu", MINT, 0.55) for _ in range(24)]).arrange_in_grid(2, 12, buff=0.2).move_to(DOWN * 1.6)
            self.play(LaggedStart(*[FadeIn(c, scale=1.4) for c in cards], lag_ratio=0.05), run_time=self.rt(1.0))

        with self.beat("offline"):
            self.clear()
            on = VGroup(T("online", 46, MINT), big("10", INK, 120), T("tries, then locked", 34, MUTED, False)).arrange(DOWN, buff=0.25)
            off = VGroup(T("offline", 46, AMBER), big("100 billion", AMBER, 120), T("every second, forever", 34, MUTED, False)).arrange(DOWN, buff=0.25)
            VGroup(on, off).arrange(RIGHT, buff=1.6).move_to(UP * STAGE_Y)
            self.show(on)
            self.to_word("offline")
            self.show(off)

        # ======================= 3. counting the guesses
        with self.beat("count_intro"):
            self.chapter("Counting the guesses")
            calc = MathTex(r"\text{time} = \frac{\text{guesses}}{100\text{ billion / s}}", font_size=72).move_to(UP * STAGE_Y)
            self.play(Write(calc), run_time=self.rt(1.0))

        with self.beat("spots"):
            self.clear()
            spots = tiles("________", 0.9).move_to(UP * 1.2)
            self.show(spots)
            lab = T("26 choices per spot", 40, MINT).next_to(spots, DOWN, buff=0.4)
            self.to_word("26")
            self.show(lab)
            self.to_word("676")
            r2 = MathTex(r"26 \times 26 = 676", font_size=64).move_to(DOWN * 1.0)
            self.play(Write(r2), run_time=self.rt(0.8))
            self.to_word("17,576")
            r3 = MathTex(r"26 \times 26 \times 26 = 17{,}576", font_size=64).move_to(DOWN * 1.0)
            self.play(ReplacementTransform(r2, r3), run_time=self.rt(0.6))
            self.stage = VGroup(spots, lab, r3)

        with self.beat("eight"):
            self.play(FadeOut(self.stage[1]), FadeOut(self.stage[2]), run_time=self.rt(0.3))
            eq = MathTex(r"26^8", font_size=110).move_to(DOWN * 0.4 + LEFT * 2.5)
            self.play(Write(eq), run_time=self.rt(0.6))
            self.to_word("209")
            val = big("209 billion", AMBER, 100).next_to(eq, RIGHT, buff=0.8)
            self.play(FadeIn(val, scale=1.3), run_time=self.rt(0.5))
            self.show(T("passwords", 38, MUTED, False).next_to(val, DOWN, buff=0.2))

        with self.beat("two_sec"):
            self.clear()
            frac = MathTex(r"\frac{209\text{ billion}}{100\text{ billion / s}}", font_size=72).move_to(LEFT * 2.6 + UP * STAGE_Y)
            self.play(Write(frac), run_time=self.rt(0.8))
            self.to_word("2 seconds")
            res = big("2 s", AMBER, 160).move_to(RIGHT * 3 + UP * 0.5)
            self.play(FadeIn(res, scale=1.4), run_time=self.rt(0.5))
            self.to_word("average")
            self.show(T("on average: 1 s", 40, MINT).next_to(res, DOWN, buff=0.4))

        with self.beat("symbols"):
            self.clear()
            sets = VGroup(mono("a-z", 44, INK), mono("A-Z", 44, INK), mono("0-9", 44, INK), mono("!@#$%", 44, INK)).arrange(RIGHT, buff=0.6).move_to(UP * 1.0)
            nums = VGroup(T("26", 34, MUTED), T("+26", 34, MUTED), T("+10", 34, MUTED), T("+33", 34, MUTED))
            for s_, n_ in zip(sets, nums):
                n_.next_to(s_, DOWN, buff=0.25)
            self.play(LaggedStart(*[FadeIn(VGroup(s_, n_), shift=UP * 0.2) for s_, n_ in zip(sets, nums)], lag_ratio=0.3), run_time=self.rt(1.4))
            self.to_word("95")
            res = VGroup(T("95 choices per spot", 54, AMBER)).move_to(DOWN * 1.2)
            self.play(FadeIn(res, scale=1.2), run_time=self.rt(0.5))

        with self.beat("quadrillion"):
            self.clear()
            eq = MathTex(r"95^8", font_size=110).move_to(LEFT * 3.5 + UP * 0.6)
            val = big("6.6 quadrillion", INK, 84).next_to(eq, RIGHT, buff=0.7)
            self.play(Write(eq), run_time=self.rt(0.5))
            self.play(FadeIn(val, scale=1.2), run_time=self.rt(0.5))
            self.to_word("18 hours")
            res = big("18 hours", CORAL, 120).move_to(DOWN * 1.3)
            self.play(FadeIn(res, scale=1.4), run_time=self.rt(0.5))
            self.to_word("gone")
            self.play(Indicate(res, color=CORAL), run_time=self.rt(0.8))

        with self.beat("divide"):
            self.clear()
            frac = MathTex(r"\frac{6.6 \text{ quadrillion}}{100\text{ billion / s}} = 66{,}000 \text{ s}", font_size=66).move_to(UP * 0.6)
            self.play(Write(frac), run_time=self.rt(1.4))
            self.to_word("18 hours")
            self.show(T("≈ 18.4 hours", 56, AMBER).move_to(DOWN * 1.3))

        with self.beat("longer"):
            self.clear()
            short = tiles("abcdefgh", 0.75).move_to(UP * 0.8)
            self.show(short)
            self.to_word("more")
            longer = tiles("abcdefghijklmnop", 0.75).move_to(DOWN * 0.6)
            self.play(LaggedStart(*[FadeIn(t, shift=UP * 0.2) for t in longer], lag_ratio=0.05), run_time=self.rt(1.2))

        with self.beat("ladder"):
            self.clear()
            rows = log_bar_rows([("8 letters", 2.09, MINT, "2 seconds"),
                                 ("12 letters", 11 * 86400, MINT, "11 days"),
                                 ("14 letters", 20.4 * 3.156e7, MINT, "20 years"),
                                 ("16 letters", 13820 * 3.156e7, AMBER, "14,000 years")], width=7.0)
            rows.move_to(UP * 0.35)
            self.show(rows[0], rt=0.4)
            for i, w in ((1, "12"), (2, "14"), (3, "16")):
                self.to_word(w)
                self.play(FadeIn(rows[i][0]), GrowFromEdge(rows[i][1], LEFT), FadeIn(rows[i][2]), run_time=self.rt(0.6))
            self.show(T("log scale: each step is 10x", 28, MUTED, False).move_to(DOWN * 2.2))

        with self.beat("why_length"):
            self.clear()
            a = VGroup(T("symbols", 40, MUTED, False), MathTex(r"\times 3.65", font_size=90, color=INK)).arrange(DOWN, buff=0.3)
            b = VGroup(T("one more spot", 40, MUTED, False), MathTex(r"\times 26", font_size=90, color=AMBER)).arrange(DOWN, buff=0.3)
            VGroup(a, b).arrange(RIGHT, buff=2.5).move_to(UP * STAGE_Y)
            self.show(a)
            self.to_word("one more")
            self.show(b)
            self.to_word("multiplies")
            c = MathTex(r"26 \times 26 \times 26 \times \cdots", font_size=60, color=AMBER).move_to(DOWN * 1.8)
            self.play(Write(c), run_time=self.rt(1.0))

        with self.beat("bits"):
            self.clear()
            rows = VGroup(*[VGroup(T(l, 40, MUTED, False), T(v, 60, c)).arrange(RIGHT, buff=0.6)
                            for l, v, c in (("8 random letters", "38 bits", MINT), ("16 random letters", "75 bits", AMBER))])
            rows.arrange(DOWN, buff=0.6, aligned_edge=RIGHT).move_to(UP * 0.4)
            self.to_word("doubles")
            self.show(chip("1 bit = 2x the guesses", MINT).move_to(UP * 1.9))
            self.to_word("38")
            self.show(rows[0])
            self.to_word("75")
            self.show(rows[1])

        with self.beat("bits_example"):
            self.clear()
            a = MathTex(r"38 \text{ bits} = 2^{38} \text{ guesses}", font_size=72).move_to(UP * 1.2)
            self.play(Write(a), run_time=self.rt(0.8))
            self.to_word("add 1")
            b = T("+1 bit: x2", 50, MINT).move_to(DOWN * 0.3 + LEFT * 2.8)
            self.show(b)
            self.to_word("add 10")
            c = T("+10 bits: x1,024", 50, AMBER).move_to(DOWN * 0.3 + RIGHT * 2.6)
            self.show(c)

        with self.beat("subscribe"):
            self.clear()
            sub = VGroup(T("Subscribe", 72, AMBER), T("2 Shorts a day, a long one every Sunday", 40, INK, False)).arrange(DOWN, buff=0.35)
            sub.move_to(UP * STAGE_Y)
            self.show(sub)

        # ======================= 4. humans aren't random
        with self.beat("not_random"):
            self.chapter("Humans aren't random")
            a = pw_field("qxvhtbne", 4.6).move_to(LEFT * 3.4 + UP * 0.2)
            b = pw_field("monkey12", 4.6, CORAL).move_to(RIGHT * 3.4 + UP * 0.2)
            self.show(a)
            self.to_word("almost never")
            self.show(b)
            self.show(T("what we assumed", 30, MUTED, False).next_to(a, DOWN, buff=0.35), T("what people type", 30, CORAL, False).next_to(b, DOWN, buff=0.35))

        with self.beat("rockyou"):
            self.clear()
            yr = year_stamp("DEC 2009", INK, 90).move_to(UP * 1.2)
            self.show(yr)
            self.to_word("32 million")
            n = big("32 million", CORAL, 100).move_to(DOWN * 0.3)
            self.play(FadeIn(n, scale=1.3), run_time=self.rt(0.5))
            self.to_word("plain text")
            self.play(slam(stamp("PLAIN TEXT", CORAL, -8, 54).move_to(DOWN * 1.8)))

        with self.beat("public"):
            self.clear()
            sheet = terminal(["123456", "12345", "123456789", "password", "iloveyou", "princess", "..."], width=5.2, title="rockyou.txt", font_size=34)
            sheet.move_to(UP * 0.1)
            self.play(FadeIn(sheet[0]), FadeIn(sheet[1]), run_time=self.rt(0.4))
            self.play(LaggedStart(*[AddTextLetterByLetter(l) for l in sheet.lines], lag_ratio=0.3), run_time=self.rt(2.0))
            self.stage = sheet

        with self.beat("top"):
            self.clear()
            top = mono("123456", 120, AMBER).move_to(UP * 1.0 + LEFT * 2.6)
            cnt = VGroup(big("290,731", INK, 90), T("people", 36, MUTED, False)).arrange(DOWN, buff=0.15).move_to(UP * 1.0 + RIGHT * 3.2)
            self.show(top)
            self.to_word("290,731")
            self.play(FadeIn(cnt, scale=1.2), run_time=self.rt(0.5))
            self.to_word("30%")
            bar = size_bar(8, 0.55, 0.3, CORAL).move_to(DOWN * 1.3)
            self.play(FadeIn(bar[0]), GrowFromEdge(bar[1], LEFT), run_time=self.rt(0.7))
            self.show(T("30%: 6 characters or fewer", 36, CORAL).next_to(bar, DOWN, buff=0.25))

        with self.beat("weapon"):
            self.clear()
            parts = VGroup(labelled_icon("scroll-text", "every leaked password", AMBER, 1.4),
                           labelled_icon("book-a", "every dictionary word", MINT, 1.4)).arrange(RIGHT, buff=2.5).move_to(UP * STAGE_Y)
            self.to_word("start with")
            self.show(parts[0])
            self.to_word("dictionary")
            self.show(parts[1])

        with self.beat("ranked"):
            self.clear()
            lst = VGroup(*[VGroup(T(f"{i}.", 34, MUTED, False), mono(w, 38, AMBER if i <= 3 else INK)).arrange(RIGHT, buff=0.3)
                           for i, w in enumerate(("123456", "password", "iloveyou", "monkey12", "dragon"), 1)])
            lst.arrange(DOWN, buff=0.2, aligned_edge=LEFT).move_to(LEFT * 2.8 + UP * 0.2)
            self.play(LaggedStart(*[FadeIn(l, shift=RIGHT * 0.3) for l in lst], lag_ratio=0.2), run_time=self.rt(1.2))
            self.to_word("first second")
            res = VGroup(T("on the list?", 44, INK, False), big("< 1 s", CORAL, 120)).arrange(DOWN, buff=0.3).move_to(RIGHT * 3.4 + UP * 0.2)
            self.play(FadeIn(res, scale=1.2), run_time=self.rt(0.6))

        with self.beat("rules"):
            self.clear()
            steps = VGroup(mono("summer", 60, INK), mono("Summer", 60, INK), mono("Summer24", 60, INK), mono("Summer24!", 60, AMBER))
            for s_ in steps:
                s_.move_to(UP * 0.4)
            self.show(steps[0])
            cur = steps[0]
            for i, w in ((1, "capitalize"), (2, "digits"), (3, "exclamation")):
                self.to_word(w)
                self.play(Transform(cur, steps[i]), run_time=self.rt(0.5))
            self.show(T("follows every rule", 38, MUTED, False).move_to(DOWN * 1.4))

        with self.beat("rules_math"):
            self.clear()
            parts = [("100,000", "words", INK, "100,000"), (r"\times 2", "capital or not", MINT, "times 2"),
                     (r"\times 100", "two digits", MINT, "times 100"), (r"\times 33", "a symbol", MINT, "times 33")]
            g = VGroup(*[VGroup(MathTex(m, font_size=80, color=c), T(l, 30, MUTED, False)).arrange(DOWN, buff=0.25) for m, l, c, _ in parts])
            g.arrange(RIGHT, buff=0.7, aligned_edge=UP).move_to(UP * STAGE_Y)
            for item, (_, _, _, w) in zip(g, parts):
                self.to_word(w)
                self.show(item, rt=0.4)

        with self.beat("rules_total"):
            self.clear()
            n = big("660 million", AMBER, 100).move_to(UP * 1.1)
            self.play(FadeIn(n, scale=1.3), run_time=self.rt(0.5))
            self.to_word("hundredth")
            t_ = big("0.007 s", CORAL, 110).move_to(DOWN * 0.5)
            self.play(FadeIn(t_, scale=1.3), run_time=self.rt(0.5))
            self.to_word("summer24")
            pw = pw_field("Summer24!", 4.6, CORAL, 44).move_to(DOWN * 2.0)
            self.show(pw)
            self.to_word("blink")
            self.play(slam(stamp("CRACKED", CORAL, -8, 44).next_to(pw, RIGHT, buff=0.4)))

        with self.beat("leet"):
            self.clear()
            a = mono("password", 80, INK).move_to(UP * 1.0)
            b = mono("p@ssw0rd", 80, AMBER).move_to(UP * 1.0)
            self.show(a)
            self.to_word("at sign")
            self.play(Transform(a, b), run_time=self.rt(0.7))
            self.to_word("first things")
            self.show(chip("one of the first guesses", CORAL).move_to(DOWN * 0.8))

        with self.beat("mistake"):
            self.clear()
            l = VGroup(T("looks complex", 44, CORAL), mono("Tr0ub4dor&3?", 50, INK)).arrange(DOWN, buff=0.35)
            r = VGroup(T("hard to guess", 44, MINT), T("choices ^ length", 50, AMBER)).arrange(DOWN, buff=0.35)
            neq = MathTex(r"\neq", font_size=110, color=MUTED)
            VGroup(l, neq, r).arrange(RIGHT, buff=1.0).move_to(UP * STAGE_Y)
            self.show(l)
            self.to_word("not the same")
            self.play(FadeIn(neq), run_time=self.rt(0.4))
            self.to_word("what matters")
            self.show(r)

        with self.beat("nist"):
            self.clear()
            org = VGroup(icon("landmark", MINT, 1.3), T("NIST SP 800-63B", 40, INK)).arrange(RIGHT, buff=0.4).move_to(UP * 1.5)
            self.show(org)
            self.to_word("shall not force")
            a = VGroup(icon("ban", CORAL, 0.8), T("forced mix of character types", 38, INK, False)).arrange(RIGHT, buff=0.3)
            b = VGroup(icon("ban", CORAL, 0.8), T("changing passwords on a schedule", 38, INK, False)).arrange(RIGHT, buff=0.3)
            VGroup(a, b).arrange(DOWN, buff=0.4, aligned_edge=LEFT).move_to(DOWN * 0.6)
            self.show(a)
            self.to_word("schedule")
            self.show(b)

        with self.beat("nist2"):
            self.clear()
            a = VGroup(icon("check", MINT, 0.8), T("long passwords", 40, INK, False)).arrange(RIGHT, buff=0.3)
            b = VGroup(icon("check", MINT, 0.8), T("checked against leaked lists", 40, INK, False)).arrange(RIGHT, buff=0.3)
            VGroup(a, b).arrange(DOWN, buff=0.4, aligned_edge=LEFT).move_to(UP * 0.9)
            self.show(a)
            self.to_word("leaked")
            self.show(b)
            self.to_word("15")
            self.show(VGroup(big("15+", AMBER, 110), T("characters", 40, MUTED, False)).arrange(RIGHT, buff=0.4).move_to(DOWN * 1.3))

        # ======================= 5. how the site slows them down
        with self.beat("site_intro"):
            self.chapter("How the site slows them down")
            g = VGroup(labelled_icon("user", "you", MINT), T("vs", 50, MUTED), labelled_icon("skull", "the hacker", CORAL)).arrange(RIGHT, buff=1.2)
            g.move_to(UP * STAGE_Y + LEFT * 2.2)
            self.show(g)
            self.to_word("two tricks")
            site = labelled_icon("server", "the website: 2 tricks", AMBER).move_to(RIGHT * 4.2 + UP * STAGE_Y)
            self.show(site)

        with self.beat("salt"):
            self.clear()
            salt = mono("x7f2q9", 54, MINT)
            plus = T("+", 60, MUTED)
            pw = mono("summer24", 54, INK)
            g = VGroup(salt, plus, pw).arrange(RIGHT, buff=0.3).move_to(UP * 1.0)
            self.show(pw)
            self.to_word("random string")
            self.play(FadeIn(salt, shift=RIGHT * 0.4), FadeIn(plus), run_time=self.rt(0.5))
            self.show(T("random salt, different for every user", 34, MINT, False).next_to(g, DOWN, buff=0.4))
            self.to_word("stores")
            self.show(VGroup(T("stored:", 32, MUTED, False), mono("x7f2q9 : 8c1e...b04a", 38, AMBER)).arrange(RIGHT, buff=0.3).move_to(DOWN * 1.6))

        with self.beat("nosalt"):
            self.clear()
            rows = VGroup(*[VGroup(T(n, 34, INK, False), mono("summer24", 36, INK), mono("e3f1...9a0c", 36, CORAL)).arrange(RIGHT, buff=0.6)
                            for n in ("you", "neighbour", "user 3,107")]).arrange(DOWN, buff=0.35, aligned_edge=LEFT).move_to(UP * 0.6)
            self.show(rows[0], rows[1])
            self.to_word("same hash")
            self.play(*[Indicate(r[2], color=CORAL) for r in rows[:2]], run_time=self.rt(0.7))
            self.to_word("every user")
            self.show(rows[2])
            self.show(chip("1 guess checks everyone", CORAL).move_to(DOWN * 1.7))

        with self.beat("salt_example"):
            self.clear()
            a = VGroup(T("you", 34, INK, False), mono("x7f2q9 + summer24", 36, INK), mono("→ 8c1e...b04a", 36, AMBER)).arrange(RIGHT, buff=0.4)
            b = VGroup(T("neighbour", 34, INK, False), mono("k30zma + summer24", 36, INK), mono("→ 51d7...e6f3", 36, MINT)).arrange(RIGHT, buff=0.4)
            VGroup(a, b).arrange(DOWN, buff=0.5, aligned_edge=LEFT).move_to(UP * 0.5)
            fit(VGroup(a, b), 12.5, 3)
            self.to_word("yours")
            self.show(a)
            self.to_word("theirs")
            self.show(b)
            self.to_word("nothing alike")
            self.show(T("nothing alike", 48, AMBER).move_to(DOWN * 1.6))

        with self.beat("linkedin"):
            self.clear()
            yr = year_stamp("JUNE 2012", INK, 80).move_to(UP * 1.4)
            self.show(yr)
            self.to_word("6.5")
            n = VGroup(big("6.5 million", CORAL, 96), T("hashes leaked", 36, MUTED, False)).arrange(DOWN, buff=0.2).move_to(DOWN * 0.3)
            self.play(FadeIn(n, scale=1.2), run_time=self.rt(0.5))
            self.to_word("salted")
            self.play(slam(stamp("NO SALT", CORAL, -8, 50).next_to(n, RIGHT, buff=0.6)))
            self.to_word("one go")
            self.show(T("one guess, all 6.5 million checked", 36, AMBER).move_to(DOWN * 2.0))

        with self.beat("withsalt"):
            self.clear()
            grid = VGroup(*[icon("user", MINT, 0.5) for _ in range(40)]).arrange_in_grid(4, 10, buff=0.25).move_to(LEFT * 2.2 + UP * 0.4)
            self.play(LaggedStart(*[FadeIn(u, scale=1.3) for u in grid], lag_ratio=0.02), run_time=self.rt(1.0))
            self.to_word("6.5 million separate")
            self.show(VGroup(big("6.5 million", AMBER, 80), T("separate attacks", 36, INK, False)).arrange(DOWN, buff=0.2).move_to(RIGHT * 4.0 + UP * 0.4))

        with self.beat("salt_limit"):
            self.clear()
            a = VGroup(icon("x", CORAL, 0.8), T("your password: just as easy to guess", 38, INK, False)).arrange(RIGHT, buff=0.3)
            b = VGroup(icon("check", MINT, 0.8), T("no more millions for the price of one", 38, INK, False)).arrange(RIGHT, buff=0.3)
            VGroup(a, b).arrange(DOWN, buff=0.5, aligned_edge=LEFT).move_to(UP * 0.3)
            self.show(a)
            self.to_word("stops")
            self.show(b)

        with self.beat("slow"):
            self.clear()
            md5 = VGroup(icon("gauge", CORAL, 1.4), T("MD5: built to be fast", 38, INK, False)).arrange(DOWN, buff=0.3)
            bc = VGroup(icon("hourglass", MINT, 1.4), T("bcrypt: slow on purpose", 38, INK, False)).arrange(DOWN, buff=0.3)
            VGroup(md5, bc).arrange(RIGHT, buff=2.5).move_to(UP * STAGE_Y)
            self.show(md5)
            self.to_word("bcrypt")
            self.show(bc)
            self.to_word("dial")
            self.show(chip("a dial: how slow", MINT).move_to(DOWN * 2.0))

        with self.beat("bcrypt_speed"):
            self.clear()
            rows = VGroup(VGroup(T("MD5", 40, MUTED, False), T("156 billion / s", 54, CORAL)).arrange(RIGHT, buff=0.5),
                          VGroup(T("bcrypt (lightest)", 40, MUTED, False), T("240,000 / s", 54, MINT)).arrange(RIGHT, buff=0.5))
            rows.arrange(DOWN, buff=0.5, aligned_edge=RIGHT).move_to(UP * 0.9)
            self.show(rows[0])
            self.to_word("240,000")
            self.show(rows[1])
            self.to_word("650,000")
            self.play(FadeIn(big("650,000x slower", AMBER, 90).move_to(DOWN * 1.3), scale=1.3), run_time=self.rt(0.5))

        with self.beat("dial"):
            self.clear()
            dial = VGroup(*[VGroup(T(f"{c}", 40, AMBER if c == 10 else INK), T(f"{r}", 30, MUTED, False)).arrange(DOWN, buff=0.15)
                            for c, r in ((5, "240,000/s"), (6, "120,000/s"), (7, "60,000/s"), (8, "30,000/s"), (9, "15,000/s"), (10, "7,500/s"))])
            dial.arrange(RIGHT, buff=0.55).move_to(UP * 0.6)
            self.show(T("setting", 32, MUTED, False).next_to(dial, UP, buff=0.4), rt=0.3)
            self.play(LaggedStart(*[FadeIn(d, shift=UP * 0.2) for d in dial], lag_ratio=0.25), run_time=self.rt(1.6))
            self.to_word("7,500")
            self.play(Circumscribe(dial[-1], color=AMBER), run_time=self.rt(0.8))
            self.show(T("each click: twice the work", 38, MINT).move_to(DOWN * 1.5))

        with self.beat("same_weak"):
            self.clear()
            rows = log_bar_rows([("vs MD5", 2.09, CORAL, "2 seconds"),
                                 ("vs bcrypt 10", 323 * 86400, MINT, "almost 11 months")], width=7.0)
            rows.move_to(UP * 0.2)
            self.show(pw_field("qxvhtbne", 4.0, MINT, 40).move_to(UP * 1.8), rt=0.4)
            self.to_word("md5")
            self.play(FadeIn(rows[0][0]), GrowFromEdge(rows[0][1], LEFT), FadeIn(rows[0][2]), run_time=self.rt(0.6))
            self.to_word("against bcrypt")
            self.play(FadeIn(rows[1][0]), GrowFromEdge(rows[1][1], LEFT), FadeIn(rows[1][2]), run_time=self.rt(0.8))

        with self.beat("your_part"):
            self.clear()
            bank = labelled_icon("landmark", "the bank's hashing: not yours", MUTED, 1.4).move_to(LEFT * 3.2 + UP * STAGE_Y)
            you = labelled_icon("user", "your password: your call", AMBER, 1.4).move_to(RIGHT * 3.2 + UP * STAGE_Y)
            self.show(bank)
            self.to_word("up to you")
            self.show(you)

        # ======================= 6. six words and five dice
        with self.beat("remember"):
            self.chapter("Six words and five dice")
            pw = mono("qxvhtbnezmrwkpja", 64, INK).move_to(UP * 0.4)
            self.show(pw)
            self.to_word("nobody")
            self.play(slam(stamp("FORGOTTEN", CORAL, -6, 54).move_to(DOWN * 1.4)))

        with self.beat("diceware"):
            self.clear()
            book = labelled_icon("book-open", "Diceware list", MINT, 1.6).move_to(LEFT * 3.5 + UP * STAGE_Y)
            self.show(book)
            self.to_word("7,776")
            n = big("7,776 words", AMBER, 96).move_to(RIGHT * 2.4 + UP * 0.8)
            self.play(FadeIn(n, scale=1.2), run_time=self.rt(0.5))
            self.to_word("6 to the")
            self.show(MathTex(r"= 6^5", font_size=90).next_to(n, DOWN, buff=0.4))

        with self.beat("roll"):
            self.clear()
            dice = VGroup(*[VGroup(RoundedRectangle(corner_radius=0.2, width=1.3, height=1.3, fill_color=PANEL, fill_opacity=1,
                                                    stroke_color=AMBER, stroke_width=5), T(str(d), 60, AMBER))
                            for d in (1, 6, 6, 5, 3)]).arrange(RIGHT, buff=0.35).move_to(UP * 1.0)
            for d in dice:
                d[1].move_to(d[0])
            self.play(LaggedStart(*[FadeIn(d, scale=1.5) for d in dice], lag_ratio=0.2), run_time=self.rt(1.2))
            self.to_word("look up")
            entry = VGroup(mono("16653", 52, AMBER), T("→", 52, MUTED), mono("one word", 52, INK)).arrange(RIGHT, buff=0.4).move_to(DOWN * 0.8)
            self.show(entry)
            self.to_word("roll again")
            self.show(T("then roll again for the next word", 34, MUTED, False).move_to(DOWN * 2.0))

        with self.beat("per_word"):
            self.clear()
            a = VGroup(T("each word", 40, MUTED, False), MathTex(r"\times 7{,}776", font_size=80, color=AMBER), T("≈ 12.9 bits", 34, MINT)).arrange(DOWN, buff=0.25)
            a.move_to(LEFT * 4.2 + UP * STAGE_Y)
            self.show(a)
            rows = log_bar_rows([("5 words", 9.0 * 3.156e7, MINT, "9 years"), ("6 words", 70050 * 3.156e7, AMBER, "70,000 years")], width=5.0)
            rows.move_to(RIGHT * 1.8 + UP * 0.2)
            self.to_word("five words")
            self.play(FadeIn(rows[0][0]), GrowFromEdge(rows[0][1], LEFT), FadeIn(rows[0][2]), run_time=self.rt(0.6))
            self.to_word("six words")
            self.play(FadeIn(rows[1][0]), GrowFromEdge(rows[1][1], LEFT), FadeIn(rows[1][2]), run_time=self.rt(0.6))

        with self.beat("behind_bcrypt"):
            self.clear()
            n = VGroup(T("6 words, behind bcrypt 10", 40, MUTED, False), big("900 billion years", AMBER, 96)).arrange(DOWN, buff=0.35).move_to(UP * STAGE_Y)
            self.show(n[0])
            self.to_word("900")
            self.play(FadeIn(n[1], scale=1.3), run_time=self.rt(0.6))

        with self.beat("six_rec"):
            self.clear()
            rows = VGroup(VGroup(T("6 Diceware words", 40, INK, False), T("77.5 bits", 54, AMBER)).arrange(RIGHT, buff=0.5),
                          VGroup(T("16 random letters", 40, INK, False), T("75.2 bits", 54, MINT)).arrange(RIGHT, buff=0.5))
            rows.arrange(DOWN, buff=0.5, aligned_edge=RIGHT).move_to(UP * 0.6)
            self.show(year_stamp("since 2014", MUTED, 50).move_to(UP * 2.2), rt=0.4)
            self.to_word("77.5")
            self.show(rows[0])
            self.to_word("16 random")
            self.show(rows[1])
            self.to_word("easier")
            self.show(chip("and easier to remember", MINT).move_to(DOWN * 1.6))

        with self.beat("dice_matter"):
            self.clear()
            a = VGroup(icon("dices", MINT, 1.4), T("dice pick: random", 36, MINT)).arrange(DOWN, buff=0.3)
            b = VGroup(icon("user", CORAL, 1.4), T("you pick: a phrase", 36, CORAL)).arrange(DOWN, buff=0.3)
            VGroup(a, b).arrange(RIGHT, buff=3.0).move_to(UP * STAGE_Y)
            self.show(a)
            self.to_word("yourself")
            self.show(b)
            self.to_word("first")
            self.show(chip("phrases, lyrics, quotes: tried first", CORAL).move_to(DOWN * 2.0))

        with self.beat("xkcd"):
            self.clear()
            p = mono("correct horse battery staple", 52, INK).move_to(UP * 1.6)
            fit(p, 12.5, 1)
            self.show(p)
            self.to_word("44")
            self.show(T("smaller list: about 44 bits", 40, MUTED, False).move_to(UP * 0.6))
            rows = log_bar_rows([("fast hash", 176, CORAL, "3 minutes"), ("bcrypt 10", 74.5 * 3.156e7, MINT, "74 years")], width=6.0)
            rows.move_to(DOWN * 1.0)
            self.to_word("3 minutes")
            self.play(FadeIn(rows[0][0]), GrowFromEdge(rows[0][1], LEFT), FadeIn(rows[0][2]), run_time=self.rt(0.6))
            self.to_word("74")
            self.play(FadeIn(rows[1][0]), GrowFromEdge(rows[1][1], LEFT), FadeIn(rows[1][2]), run_time=self.rt(0.6))

        with self.beat("four_vs_six"):
            self.clear()
            a = VGroup(T("4 words", 56, MINT), T("fine behind a slow hash", 34, MUTED, False)).arrange(DOWN, buff=0.25)
            b = VGroup(T("6 words", 56, AMBER), T("safe even against a fast one", 34, INK, False)).arrange(DOWN, buff=0.25)
            VGroup(a, b).arrange(RIGHT, buff=2.2).move_to(UP * STAGE_Y)
            self.show(a)
            self.to_word("six words")
            self.show(b)

        # ======================= 7. the whole thing in one line
        with self.beat("one_line"):
            self.chapter("The whole thing in one line")
            g = MathTex(r"\text{guesses} = \text{choices}^{\,\text{spots}}", font_size=76).move_to(UP * 0.9)
            t_ = MathTex(r"\text{time} = \frac{\text{guesses}}{\text{speed}}", font_size=76).move_to(DOWN * 1.0)
            self.play(Write(g), run_time=self.rt(1.0))
            self.to_word("time equals")
            self.play(Write(t_), run_time=self.rt(1.0))
            self.stage = VGroup(g, t_)

        with self.beat("three_numbers"):
            self.clear()
            rows = VGroup(*[VGroup(T(a, 40, c), T(b, 36, INK, False)).arrange(RIGHT, buff=0.5)
                            for a, b, c in (("symbols", "raise the choices a little", MUTED), ("length", "raises the power", AMBER),
                                            ("bcrypt", "cuts the speed", MINT), ("salt", "restarts the work for every user", MINT))])
            rows.arrange(DOWN, buff=0.35, aligned_edge=LEFT).move_to(UP * 0.3)
            for r, w in zip(rows, ("symbols", "length", "bcrypt", "salt")):
                self.to_word(w)
                self.show(r, rt=0.4)

        with self.beat("and_humans"):
            self.clear()
            a = VGroup(icon("user", CORAL, 1.4), T("a human pattern", 40, CORAL)).arrange(DOWN, buff=0.3).move_to(LEFT * 3.2 + UP * STAGE_Y)
            self.show(a)
            self.to_word("shrinks")
            b = VGroup(T("real choices =", 40, MUTED, False), T("the hacker's list", 48, CORAL)).arrange(DOWN, buff=0.3).move_to(RIGHT * 2.8 + UP * STAGE_Y)
            self.show(b)

        # ======================= 8. what to do
        with self.beat("todo"):
            self.chapter("What to actually do")
            a = VGroup(icon("dices", AMBER, 1.3), T("one 6-word passphrase", 38, AMBER), T("for your password manager", 32, INK, False)).arrange(DOWN, buff=0.25)
            a.move_to(UP * STAGE_Y)
            self.to_word("six-word")
            self.show(a)

        with self.beat("manager"):
            self.clear()
            vault = labelled_icon("key-round", "manager", AMBER, 1.4).move_to(LEFT * 4.5 + UP * 0.3)
            sites = VGroup(*[VGroup(icon("globe", MINT, 0.6), mono(s, 30, INK)).arrange(RIGHT, buff=0.25)
                             for s in ("k#9vQ2...Lm8", "Zt4!pW...e0R", "8nH@xc...uY3")]).arrange(DOWN, buff=0.35).move_to(RIGHT * 1.0 + UP * 0.3)
            self.show(vault)
            self.play(LaggedStart(*[FadeIn(s, shift=RIGHT * 0.3) for s in sites], lag_ratio=0.3), run_time=self.rt(1.0))
            self.to_word("never reuse")
            self.show(chip("never reuse one", MINT).move_to(RIGHT * 1.0 + DOWN * 1.6))
            self.to_word("everywhere")
            self.show(T("leaked logins get tried everywhere", 32, CORAL, False).move_to(DOWN * 2.3))

        with self.beat("twofactor"):
            self.clear()
            g = VGroup(pw_field("••••••••", 3.6, MINT, 44), T("+", 60, MUTED), icon("smartphone", AMBER, 1.4)).arrange(RIGHT, buff=0.6).move_to(UP * 0.4)
            self.show(g[0])
            self.to_word("two-factor")
            self.show(g[1], g[2])
            self.to_word("alone")
            self.show(T("a leaked password alone isn't enough", 38, MINT).move_to(DOWN * 1.5))

        with self.beat("wrap"):
            self.clear()
            a = T("hackers don't out-think passwords", 44, INK, False).move_to(UP * 1.4)
            self.show(a)
            self.to_word("counting")
            b = T("they out-count them", 56, AMBER).move_to(UP * 0.2)
            self.show(b)
            self.to_word("70,000")
            self.play(FadeIn(big("70,000 years", AMBER, 110).move_to(DOWN * 1.4), scale=1.3), run_time=self.rt(0.6))

        with self.beat("cta"):
            self.clear()
            q = VGroup(T("hackers get 1,000x faster", 54, INK), T("how many words would you add?", 54, AMBER)).arrange(DOWN, buff=0.4).move_to(UP * 0.5)
            self.show(q[0])
            self.to_word("how many")
            self.show(q[1])
            self.to_word("comments")
            self.play(Indicate(q[1], color=AMBER), run_time=self.rt(0.8))


class Thumbnail(Scene):
    def construct(self):
        pw = pw_field("••••••••", 6.0, CORAL, 70).move_to(UP * 1.9)
        n = Text("2 seconds", font=FONT_BOLD, color=AMBER, font_size=210).move_to(DOWN * 0.6)
        sub = Text("to crack it", font=FONT_BOLD, color=INK, font_size=80).move_to(DOWN * 2.6)
        self.add(pw, n, sub)
