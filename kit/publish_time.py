"""Which publish slots the next videos go to, from state/schedule.json.

    ~/.surprisal_venv/bin/python -m kit.publish_time            # one video per daily slot (2)
    ~/.surprisal_venv/bin/python -m kit.publish_time --count 1

Slots are local times on the owner's clock (Europe/Tallinn, summer and winter time handled).
A slot is free if it's at least `min_lead_minutes` away and no row in state/videos.csv has that
publish_at_utc. Prints one block per video, in order, for example:

    SLOT1_PUBLISH_AT_UTC=2026-10-04T09:00:00Z   -> Zapier upload_video publish_at
    SLOT1_DATE=2026-10-04                       -> episode folder name and videos.csv date
    SLOT1_LOCAL=Sun 4 Oct 2026, 12:00 PM EEST
    SLOT1_FORMAT=short                          -> short or long (see schedule.json "longform")

PUBLISH_AT_UTC / PUBLISH_DATE / PUBLISH_WEEKDAY / PUBLISH_LOCAL repeat slot 1 for older tooling.
"""
import argparse
import csv
import json
import os
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo

KIT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONF = json.load(open(os.path.join(KIT_ROOT, "state", "schedule.json")))
TZ = ZoneInfo(CONF["timezone"])
SLOTS = sorted(time.fromisoformat(s) for s in CONF["slots"])
MIN_LEAD = timedelta(minutes=CONF.get("min_lead_minutes", 90))


def utc_str(dt):
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def taken_slots():
    path = os.path.join(KIT_ROOT, "state", "videos.csv")
    if not os.path.exists(path):
        return set()
    with open(path) as f:
        return {row.get("publish_at_utc", "") for row in csv.DictReader(f)} - {""}


def slot_format(dt):
    lf = CONF.get("longform") or {}
    if not lf.get("starting"):
        return "short"
    if (dt.date() >= date.fromisoformat(lf["starting"]) and dt.strftime("%A") == lf.get("weekday", "Sunday")
            and dt.strftime("%H:%M") == lf.get("slot")):
        return "long"
    return "short"


def next_slots(count=None, now=None):
    count = count or len(SLOTS)
    now = (now or datetime.now(timezone.utc)).astimezone(TZ)
    taken = taken_slots()
    out, day = [], now.date()
    while len(out) < count:
        for t in SLOTS:
            dt = datetime.combine(day, t, tzinfo=TZ)  # zoneinfo picks the right offset per date
            if dt - now >= MIN_LEAD and utc_str(dt) not in taken:
                out.append(dt)
                if len(out) == count:
                    break
        day += timedelta(days=1)
    return out


def next_slot(now=None):
    return next_slots(1, now)[0]


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--count", type=int, default=None)
    a = ap.parse_args()
    slots = next_slots(a.count)
    for i, s in enumerate(slots, 1):
        print(f"SLOT{i}_PUBLISH_AT_UTC={utc_str(s)}")
        print(f"SLOT{i}_DATE={s.date().isoformat()}")
        print(f"SLOT{i}_WEEKDAY={s.strftime('%A')}")
        print(f"SLOT{i}_LOCAL={s.strftime('%a %-d %b %Y, %-I:%M %p %Z')}")
        print(f"SLOT{i}_FORMAT={slot_format(s)}")
    s = slots[0]
    print(f"PUBLISH_AT_UTC={utc_str(s)}")
    print(f"PUBLISH_DATE={s.date().isoformat()}")
    print(f"PUBLISH_WEEKDAY={s.strftime('%A')}")
    print(f"PUBLISH_LOCAL={s.strftime('%a %-d %b %Y, %-I:%M %p %Z')}")
