"""Direct YouTube API access (no Zapier tasks).

Credentials come from three environment variables, set once in the routine's environment:
    YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN
See docs/YOUTUBE_SETUP.md for how to get them (the `auth` command below prints the refresh token).

Commands (run with ~/.surprisal_venv/bin/python -m kit.youtube ...):
    check                                   are the credentials there and working? prints the channel
    get <url> [key=value ...]               any GET (Analytics reports, commentThreads, videos), prints JSON
    upload <episode folder> [--publish-at <UTC ISO>] [--privacy private|public|unlisted]
           [--notify true|false] [--thumbnail <png>]
                                            uploads build/final.mp4 with the title, description (+ music
                                            credit) and tags from script.json; prints VIDEO_ID=...
    status <video id> [--privacy private|public] [--publish-at <UTC ISO>]
                                            replaces the video's status block (all five fields)
    auth --client-secrets <client_secret.json>
                                            run on YOUR computer once: opens a browser, prints the refresh token

Uploads: Google locks videos uploaded through an unaudited API project as private. Until the project
passes YouTube's API audit, the runbook keeps uploads on Zapier and uses this module for reads only.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

try:
    import requests  # the venv has it; `auth` works without it
except ImportError:  # pragma: no cover
    requests = None

TOKEN_URL = "https://oauth2.googleapis.com/token"
AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
UPLOAD_URL = "https://www.googleapis.com/upload/youtube/v3/videos"
API = "https://www.googleapis.com/youtube/v3"
SCOPES = [
    "https://www.googleapis.com/auth/youtube",              # read, upload, update status
    "https://www.googleapis.com/auth/yt-analytics.readonly",
]
FOOTER_MUSIC = "\n\nMusic:\n"


class YouTubeError(RuntimeError):
    pass


def creds_present() -> bool:
    return all(os.environ.get(k) for k in ("YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN"))


_token: tuple[str, float] | None = None


def access_token() -> str:
    global _token
    if _token and _token[1] > time.time() + 60:
        return _token[0]
    if requests is None:
        raise YouTubeError("the requests package is missing: use ~/.surprisal_venv/bin/python")
    if not creds_present():
        raise YouTubeError("YT_CLIENT_ID / YT_CLIENT_SECRET / YT_REFRESH_TOKEN are not set (docs/YOUTUBE_SETUP.md)")
    r = requests.post(TOKEN_URL, data={
        "client_id": os.environ["YT_CLIENT_ID"], "client_secret": os.environ["YT_CLIENT_SECRET"],
        "refresh_token": os.environ["YT_REFRESH_TOKEN"], "grant_type": "refresh_token"}, timeout=30)
    if r.status_code != 200:
        raise YouTubeError(f"token refresh failed: HTTP {r.status_code} {r.text[:300]}")
    j = r.json()
    _token = (j["access_token"], time.time() + int(j.get("expires_in", 3600)))
    return _token[0]


def _headers(extra: dict | None = None) -> dict:
    h = {"Authorization": f"Bearer {access_token()}"}
    h.update(extra or {})
    return h


def get(url: str, params: dict | None = None) -> dict:
    h = _headers()
    r = requests.get(url, params=params or {}, headers=h, timeout=60)
    if r.status_code != 200:
        raise YouTubeError(f"GET {url} failed: HTTP {r.status_code} {r.text[:500]}")
    return r.json()


def set_status(video_id: str, privacy: str, publish_at: str | None) -> dict:
    """Replace the status block (all five fields, as the runbook requires)."""
    status = {"privacyStatus": privacy, "selfDeclaredMadeForKids": False, "embeddable": True, "publicStatsViewable": True}
    if publish_at:
        status["publishAt"] = publish_at
    r = requests.put(f"{API}/videos", params={"part": "status"}, headers=_headers({"Content-Type": "application/json"}),
                     data=json.dumps({"id": video_id, "status": status}), timeout=60)
    if r.status_code != 200:
        raise YouTubeError(f"status update failed: HTTP {r.status_code} {r.text[:500]}")
    return r.json()


def description_for(folder: Path, extra: str = "") -> str:
    s = json.loads((folder / "script.json").read_text())
    desc = s["description"].rstrip()
    if extra:
        desc += "\n\n" + extra.strip()
    credit = folder / "build" / "music_credit.txt"
    if credit.exists():
        desc += FOOTER_MUSIC + credit.read_text().strip()
    return desc


def upload(folder: Path, privacy: str = "private", publish_at: str | None = None, notify: bool = True,
           thumbnail: Path | None = None, extra_description: str = "") -> dict:
    s = json.loads((folder / "script.json").read_text())
    video = folder / "build" / "final.mp4"
    if not video.exists():
        raise YouTubeError(f"{video} not found; render first")
    report = folder / "build" / "report.json"
    if not report.exists() or not json.loads(report.read_text()).get("ok"):
        raise YouTubeError("report.json is missing or not ok: refusing to upload")
    status = {"privacyStatus": privacy, "selfDeclaredMadeForKids": False, "embeddable": True, "publicStatsViewable": True}
    if publish_at:
        status["privacyStatus"] = "private"
        status["publishAt"] = publish_at
    body = {
        "snippet": {"title": s["title"], "description": description_for(folder, extra_description), "tags": s.get("tags", []),
                    "categoryId": "27", "defaultLanguage": "en", "defaultAudioLanguage": "en"},
        "status": status,
    }
    size = video.stat().st_size
    init = requests.post(UPLOAD_URL, params={"uploadType": "resumable", "part": "snippet,status",
                                             "notifySubscribers": "true" if notify else "false"},
                         headers=_headers({"Content-Type": "application/json; charset=UTF-8",
                                           "X-Upload-Content-Type": "video/mp4", "X-Upload-Content-Length": str(size)}),
                         data=json.dumps(body), timeout=60)
    if init.status_code != 200 or "Location" not in init.headers:
        raise YouTubeError(f"upload init failed: HTTP {init.status_code} {init.text[:500]}")
    loc = init.headers["Location"]
    for attempt in range(4):
        with open(video, "rb") as f:
            r = requests.put(loc, data=f, headers={"Authorization": f"Bearer {access_token()}", "Content-Type": "video/mp4",
                                                   "Content-Length": str(size)}, timeout=1800)
        if r.status_code in (200, 201):
            break
        if r.status_code in (500, 502, 503, 504) and attempt < 3:
            time.sleep(2 ** (attempt + 2))
            continue
        raise YouTubeError(f"upload failed: HTTP {r.status_code} {r.text[:500]}")
    res = r.json()
    if thumbnail:
        t = requests.post(f"https://www.googleapis.com/upload/youtube/v3/thumbnails/set", params={"videoId": res["id"]},
                          headers=_headers({"Content-Type": "image/png"}), data=thumbnail.read_bytes(), timeout=120)
        if t.status_code != 200:
            print(f"warning: thumbnail failed: HTTP {t.status_code} {t.text[:300]}", file=sys.stderr)
    return res


# ------------------------------------------------------------------ one-time auth (owner's computer)
def auth(client_secrets: Path, port: int = 8765) -> None:
    import http.server
    import webbrowser
    cfg = json.loads(client_secrets.read_text())
    cfg = cfg.get("installed") or cfg.get("web") or cfg
    redirect = f"http://127.0.0.1:{port}/"
    url = AUTH_URL + "?" + urllib.parse.urlencode({
        "client_id": cfg["client_id"], "redirect_uri": redirect, "response_type": "code",
        "scope": " ".join(SCOPES), "access_type": "offline", "prompt": "consent"})
    got: dict = {}

    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            got.update({k: v[0] for k, v in q.items()})
            self.send_response(200); self.end_headers()
            self.wfile.write(b"Done. You can close this tab and go back to the terminal.")

        def log_message(self, *a):
            pass

    print("Opening the browser. Sign in with the account that owns @surprisalmath and allow access.\nIf it doesn't open, visit:\n" + url)
    webbrowser.open(url)
    srv = http.server.HTTPServer(("127.0.0.1", port), H)
    while "code" not in got and "error" not in got:
        srv.handle_request()
    if "error" in got:
        sys.exit(f"Google returned an error: {got['error']}")
    data = urllib.parse.urlencode({"code": got["code"], "client_id": cfg["client_id"], "client_secret": cfg["client_secret"],
                                   "redirect_uri": redirect, "grant_type": "authorization_code"}).encode()
    try:
        with urllib.request.urlopen(urllib.request.Request(TOKEN_URL, data=data), timeout=30) as resp:
            j = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        sys.exit(f"Token exchange failed: HTTP {e.code} {e.read()[:300]!r}")
    if "refresh_token" not in j:
        sys.exit(f"No refresh token in the response: {j}")
    print("\nSet these three environment variables in the routine's environment:\n")
    print(f"YT_CLIENT_ID={cfg['client_id']}\nYT_CLIENT_SECRET={cfg['client_secret']}\nYT_REFRESH_TOKEN={j['refresh_token']}")


def main() -> None:
    ap = argparse.ArgumentParser(prog="kit.youtube")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check")
    g = sub.add_parser("get"); g.add_argument("url"); g.add_argument("params", nargs="*")
    u = sub.add_parser("upload"); u.add_argument("folder", type=Path)
    u.add_argument("--privacy", default="private", choices=["private", "public", "unlisted"])
    u.add_argument("--publish-at"); u.add_argument("--notify", default="true", choices=["true", "false"])
    u.add_argument("--thumbnail", type=Path); u.add_argument("--extra-description", default="")
    st = sub.add_parser("status"); st.add_argument("video_id"); st.add_argument("--privacy", default="private", choices=["private", "public", "unlisted"])
    st.add_argument("--publish-at")
    a = sub.add_parser("auth"); a.add_argument("--client-secrets", type=Path, required=True); a.add_argument("--port", type=int, default=8765)
    args = ap.parse_args()
    try:
        if args.cmd == "check":
            j = get(f"{API}/channels", {"part": "snippet", "mine": "true"})
            items = j.get("items", [])
            print("OK " + ", ".join(f"{i['id']} ({i['snippet']['title']})" for i in items) if items else "OK, but no channel on this account")
        elif args.cmd == "get":
            params = dict(p.split("=", 1) for p in args.params)
            print(json.dumps(get(args.url, params), indent=1))
        elif args.cmd == "upload":
            res = upload(args.folder, args.privacy, args.publish_at, args.notify == "true", args.thumbnail, args.extra_description)
            st = res.get("status", {})
            print(f"VIDEO_ID={res['id']}\nPRIVACY={st.get('privacyStatus')}\nPUBLISH_AT={st.get('publishAt', '')}")
        elif args.cmd == "status":
            res = set_status(args.video_id, args.privacy, args.publish_at).get("status", {})
            print(f"PRIVACY={res.get('privacyStatus')}\nPUBLISH_AT={res.get('publishAt', '')}")
        elif args.cmd == "auth":
            auth(args.client_secrets, args.port)
    except YouTubeError as e:
        sys.exit(f"ERROR: {e}")


if __name__ == "__main__":
    main()
