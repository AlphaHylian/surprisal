"""When the next video should go live: the next 2:00 pm in New York (EST/EDT, follows daylight
saving) that is at least 90 minutes away (time to build) and doesn't already have a video in state/videos.csv.

    ~/.surprisal_venv/bin/python -m kit.publish_time

Prints, for example:
    PUBLISH_AT_UTC=2026-10-01T18:00:00Z     -> pass to Zapier upload_video as publish_at
    PUBLISH_DATE=2026-10-01                 -> use for the episode folder name and videos.csv
    PUBLISH_WEEKDAY=Thursday                -> Sunday means long-form day
    PUBLISH_LOCAL=Thu 1 Oct 2026, 2:00 PM EDT
"""
import csv
import os
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

NY = ZoneInfo("America/New_York")
HOUR = 14
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
    local = now.astimezone(NY)
    slot = local.replace(hour=HOUR, minute=0, second=0, microsecond=0)
    taken = taken_slots()
    while slot - local < MIN_LEAD or slot.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ") in taken:
        slot = (slot + timedelta(days=1)).replace(hour=HOUR)  # replace() keeps 2pm across DST changes
    return slot


if __name__ == "__main__":
    s = next_slot()
    print(f"PUBLISH_AT_UTC={s.astimezone(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}")
    print(f"PUBLISH_DATE={s.date().isoformat()}")
    print(f"PUBLISH_WEEKDAY={s.strftime('%A')}")
    print(f"PUBLISH_LOCAL={s.strftime('%a %-d %b %Y, %-I:%M %p %Z')}")
