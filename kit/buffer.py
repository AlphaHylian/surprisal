"""Publish through Buffer (free plan): YouTube Shorts, TikTok and Instagram Reels from one API.

Buffer is an audited app on all three platforms, so a scheduled Short goes public on time (an
unaudited Google project of our own would be locked to private) and it costs no Zapier tasks.

The key comes from the BUFFER_API_KEY environment variable, or is attached to api.buffer.com by the
environment's proxy (an API credential on the cloud environment). It never goes in the repo.
Get one at https://publish.buffer.com/settings/api (docs/BUFFER_SETUP.md).

    ~/.surprisal_venv/bin/python -m kit.buffer check
        key works? lists the organization and connected channels and saves their ids to
        state/buffer.json
    ~/.surprisal_venv/bin/python -m kit.buffer post <episode folder> --at <UTC ISO> --video-url <url>
        [--only youtube,tiktok,instagram] [--dry-run]
        schedules the video on every connected channel at that time; prints one line per channel
        (BUFFER_<SERVICE>=<post id> or BUFFER_<SERVICE>_ERROR=...) and appends them to
        state/buffer_posts.csv
    ~/.surprisal_venv/bin/python -m kit.buffer status [<post id> ...]
        status of posts (default: the last 12 in state/buffer_posts.csv): scheduled / sent / error,
        with the published link once sent (the YouTube link carries the video id)

Free-plan limits: 3 channels, 10 scheduled posts per channel, 100 API requests per 15 minutes.
A daily run uses about 8 requests.
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

API = "https://api.buffer.com"
ROOT = Path(__file__).resolve().parent.parent
STATE = ROOT / "state" / "buffer.json"
LOG = ROOT / "state" / "buffer_posts.csv"
SERVICES = ("youtube", "tiktok", "instagram")

YT_FOOTER = ("The math behind real problems, twice a day. Subscribe and the next one finds you.\n"
             "Found an error? Comment and it gets pinned.\n#math #mathematics #shorts")
SOCIAL_TAGS = {"tiktok": "#math #maths #learnontiktok #mathtok #science",
               "instagram": "#math #maths #mathematics #learn #science #reels"}


class BufferError(RuntimeError):
    pass


# ------------------------------------------------------------------ transport
def gql(query: str, variables: dict | None = None) -> dict:
    headers = {"Content-Type": "application/json"}
    if os.environ.get("BUFFER_API_KEY"):
        headers["Authorization"] = f"Bearer {os.environ['BUFFER_API_KEY']}"
    for attempt in range(3):
        r = requests.post(API, json={"query": query, "variables": variables or {}}, headers=headers, timeout=60)
        if r.status_code in (429, 502, 503, 504) and attempt < 2:
            time.sleep(10 * (attempt + 1))
            continue
        break
    try:
        body = r.json()
    except ValueError:
        raise BufferError(f"HTTP {r.status_code}: {r.text[:300]}")
    if body.get("errors"):
        raise BufferError("; ".join(e.get("message", str(e)) for e in body["errors"])[:500])
    if r.status_code != 200:
        raise BufferError(f"HTTP {r.status_code}: {r.text[:300]}")
    return body["data"]


# Every query below is checked against Buffer's published schema (tests in kit/buffer_schema_check.py).
Q_ORGS = "query { account { email organizations { id name } } }"
Q_CHANNELS = """query Channels($org: OrganizationId!) {
  channels(input: { organizationId: $org }) { id service name displayName isDisconnected isLocked }
}"""
M_CREATE = """mutation Create($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on PostActionSuccess { post { id status dueAt channelService } }
    ... on MutationError { message }
  }
}"""
Q_POST = """query Post($id: PostId!) {
  post(input: { id: $id }) { id status dueAt sentAt externalLink channelService error { message rawError } }
}"""


# ------------------------------------------------------------------ captions
def _script(folder: Path) -> dict:
    return json.loads((folder / "script.json").read_text())


def _credit(folder: Path) -> str:
    p = folder / "build" / "music_credit.txt"
    return p.read_text().strip() if p.exists() else ""


def _first_sentences(text: str, n: int, limit: int) -> str:
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    out = " ".join(parts[:n])
    return out if len(out) <= limit else out[: limit - 1].rsplit(" ", 1)[0] + "…"


def captions(folder: Path) -> dict[str, dict]:
    """Text and per-network metadata for each service, from script.json."""
    s = _script(folder)
    credit = _credit(folder)
    music = f"\n\nMusic: {credit.splitlines()[0]} (CC BY 4.0)" if credit else ""
    yt_desc = s["description"].rstrip() + "\n\n" + YT_FOOTER + (("\n\nMusic:\n" + credit) if credit else "")
    social = s.get("social_caption") or _first_sentences(s["description"], 2, 400)
    out = {
        "youtube": {"text": yt_desc[:5000],
                    "metadata": {"youtube": {"title": s["title"][:100], "categoryId": "27", "privacy": "public",
                                             "madeForKids": False, "notifySubscribers": True, "embeddable": True}}},
        "tiktok": {"text": f"{s['title']}\n\n{social}\n\n{SOCIAL_TAGS['tiktok']}{music}"[:2200],
                   "metadata": {"tiktok": {"title": s["title"][:90]}}},
        "instagram": {"text": (f"{s['title']}\n\n{social}\n\nThe math behind real problems, twice a day. "
                               f"Follow @surprisalmath.\n\n{SOCIAL_TAGS['instagram']}{music}")[:2200],
                      "metadata": {"instagram": {"type": "reel", "shouldShareToFeed": True}}},
    }
    return out


# ------------------------------------------------------------------ commands
def check() -> dict:
    data = gql(Q_ORGS)
    orgs = data["account"]["organizations"]
    if not orgs:
        raise BufferError("the Buffer account has no organization")
    org = orgs[0]
    chans = gql(Q_CHANNELS, {"org": org["id"]})["channels"]
    state = {"organization_id": org["id"], "channels": {}}
    for c in chans:
        if c["service"] in SERVICES and not c["isDisconnected"] and not c["isLocked"]:
            state["channels"].setdefault(c["service"], {"id": c["id"], "name": c.get("displayName") or c["name"]})
        print(f"{c['service']:10s} {c.get('displayName') or c['name']:25s} id={c['id']}"
              f"{' DISCONNECTED' if c['isDisconnected'] else ''}{' LOCKED' if c['isLocked'] else ''}")
    keep = json.loads(STATE.read_text()) if STATE.exists() else {}
    keep.update(state)
    keep["checked_at"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    STATE.write_text(json.dumps(keep, indent=2) + "\n")
    missing = [s for s in SERVICES if s not in state["channels"]]
    print(f"BUFFER_OK=1 channels={','.join(state['channels'])}" + (f" missing={','.join(missing)}" if missing else ""))
    return state


def post(folder: Path, at: str, video_url: str, only: list[str] | None, dry: bool) -> dict[str, str]:
    st = json.loads(STATE.read_text()) if STATE.exists() else {}
    chans = st.get("channels", {})
    if not chans and not dry:
        raise BufferError("no channels known; run `python -m kit.buffer check` first")
    due = datetime.fromisoformat(at.replace("Z", "+00:00")).astimezone(timezone.utc)
    if due < datetime.now(timezone.utc) and not dry:
        raise BufferError(f"{at} is in the past")
    caps = captions(folder)
    slug = _script(folder).get("slug", folder.name)
    results = {}
    for svc in only or SERVICES:
        if svc not in chans and not dry:
            print(f"BUFFER_{svc.upper()}_SKIPPED=not connected")
            continue
        inp = {"channelId": (chans.get(svc) or {}).get("id", "DRY-RUN"), "text": caps[svc]["text"],
               "schedulingType": "automatic", "mode": "customScheduled",
               "dueAt": due.strftime("%Y-%m-%dT%H:%M:%S.000Z"), "metadata": caps[svc]["metadata"],
               "assets": [{"video": {"url": video_url, "metadata": {"thumbnailOffset": 0}}}]}
        if dry:
            print(json.dumps({svc: inp}, indent=1, ensure_ascii=False))
            continue
        try:
            res = gql(M_CREATE, {"input": inp})["createPost"]
            if "post" in res:
                results[svc] = res["post"]["id"]
                print(f"BUFFER_{svc.upper()}={res['post']['id']} status={res['post']['status']} due={res['post']['dueAt']}")
            else:
                raise BufferError(res.get("message", "unknown error"))
        except BufferError as e:
            results[svc] = ""
            print(f"BUFFER_{svc.upper()}_ERROR={e}")
        _log(slug, svc, results.get(svc, ""), at)
    return results


def _log(slug: str, svc: str, post_id: str, at: str) -> None:
    new = not LOG.exists()
    with LOG.open("a", newline="") as f:
        w = csv.writer(f)
        if new:
            w.writerow(["created_utc", "slug", "service", "post_id", "due_utc"])
        w.writerow([datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), slug, svc, post_id, at])


def status(ids: list[str]) -> None:
    if not ids and LOG.exists():
        ids = [r["post_id"] for r in list(csv.DictReader(LOG.open()))[-12:] if r["post_id"]]
    for pid in ids:
        try:
            p = gql(Q_POST, {"id": pid})["post"]
        except BufferError as e:
            print(f"{pid}: ERROR {e}")
            continue
        link = p.get("externalLink") or ""
        yt = re.search(r"(?:shorts/|v=|youtu\.be/)([\w-]{11})", link) if p["channelService"] == "youtube" else None
        err = (p.get("error") or {}).get("message", "")
        print(f"{pid} {p['channelService']:9s} {p['status']:9s} due={p['dueAt']} link={link}"
              + (f" YOUTUBE_ID={yt.group(1)}" if yt else "") + (f" error={err}" if err else ""))


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check")
    p = sub.add_parser("post")
    p.add_argument("episode")
    p.add_argument("--at", required=True)
    p.add_argument("--video-url", required=True)
    p.add_argument("--only", default="")
    p.add_argument("--dry-run", action="store_true")
    s = sub.add_parser("status")
    s.add_argument("ids", nargs="*")
    a = ap.parse_args()
    try:
        if a.cmd == "check":
            check()
        elif a.cmd == "post":
            only = [x.strip() for x in a.only.split(",") if x.strip()] or None
            post(Path(a.episode).resolve(), a.at, a.video_url, only, a.dry_run)
        else:
            status(a.ids)
    except BufferError as e:
        print(f"BUFFER_ERROR={e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
