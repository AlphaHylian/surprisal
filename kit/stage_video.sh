#!/usr/bin/env bash
# Publish an episode's final.mp4 (and thumbnail.png if present) to the `renders` branch and
# print the public URLs Zapier's YouTube upload can fetch.
# The branch is recreated from scratch each time and force-pushed, so it only ever holds the
# current video and the repository does not grow by a video per day.
# Usage: bash kit/stage_video.sh episodes/<folder>
set -euo pipefail
EP="$(cd "$1" && pwd)"
ROOT="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
REMOTE="$(git -C "$ROOT" remote get-url origin)"
SLUG="$(basename "$EP")"
[ -f "$EP/build/final.mp4" ] || { echo "no $EP/build/final.mp4" >&2; exit 1; }

TMP="$(mktemp -d)"
cp "$EP/build/final.mp4" "$TMP/$SLUG.mp4"
[ -f "$EP/build/thumbnail.png" ] && cp "$EP/build/thumbnail.png" "$TMP/$SLUG-thumb.png"
cd "$TMP"
git init -q -b renders
git -c user.name="Surprisal bot" -c user.email="bot@surprisal.invalid" add .
git -c user.name="Surprisal bot" -c user.email="bot@surprisal.invalid" commit -q -m "render $SLUG"
git push -q -f "$REMOTE" renders:renders

BASE="https://raw.githubusercontent.com/$(echo "$REMOTE" | sed -E 's#.*github.com[/:]##; s#\.git$##')/renders"
echo "VIDEO_URL=$BASE/$SLUG.mp4"
[ -f "$TMP/$SLUG-thumb.png" ] && echo "THUMB_URL=$BASE/$SLUG-thumb.png"
# wait until the file is actually served (raw.githubusercontent can lag a few seconds)
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -I "$BASE/$SLUG.mp4" || true)
  [ "$code" = "200" ] && { echo "SERVED=yes"; exit 0; }
  sleep 4
done
echo "SERVED=no (the push worked but the file is not public yet; wait a minute and retry the upload)"
