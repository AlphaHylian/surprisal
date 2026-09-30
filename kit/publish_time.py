"""When the next video should go live: the next 9:00 pm Tallinn time (Europe/Tallinn: EEST in summer,
EET in winter; always 9pm on the owner's clock) that is at least 90 minutes away (time to build)
and doesn't already have a video in state/videos.csv.

    ~/.surprisal_venv/bin/python -m kit.publish_time

Prints, for example:
    PUBLISH_AT_UTC=2026-10-01T18:00:00Z     -> pass to Zapier upload_video as publish_at
    PUBLISH_DATE=2026-10-01                 -> use for the episode folder name and videos.csv
    PUBLISH_WEEKDAY=Thursday                -> Sunday means long-form day
    PUBLISH_LOCAL=Thu 1 Oct 2026, 9:00 PM EEST
"""
import csv
import os
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

TZ = ZoneInfo("Europe/Tallinn")
HOUR = 21
MIN_LEAD = timedelta(minutes=90)  # a full build takes 45-60 min
KIT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def taken_slots():
    path = os.path.join(KIT_ROOT, "state", "videos.csv")
    if not os.path.exists(path):
        return set()
    with open(path) as f:
        return {row.get("publish_at_utc", "") for row in csv.DictReader(f)} - {""}


def next_slot(now=None):
    now = now or datetime.now(timezone.utc)
    local = now.astimezone(TZ)
    slot = local.replace(hour=HOUR, minute=0, second=0, microsecond=0)
    taken = taken_slots()
    while slot - local < MIN_LEAD or slot.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ") in taken:
        slot = (slot + timedelta(days=1)).replace(hour=HOUR)  # replace() keeps 9pm across DST changes
    return slot


if __name__ == "__main__":
    s = next_slot()
    print(f"PUBLISH_AT_UTC={s.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}")
    print(f"PUBLISH_DATE={s.date().isoformat()}")
    print(f"PUBLISH_WEEKDAY={s.strftime('%A')}")
    print(f"PUBLISH_LOCAL={s.strftime('%a %-d %b %Y, %-I:%M %p %Z')}")
