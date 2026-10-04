# Surprisal repo

If you are the daily scheduled task: follow `docs/RUNBOOK.md` step by step, and read
`docs/STYLE.md` before writing a script or scene. `episodes/_example-zip/`
is the reference episode in the current how-to format (script.json, scene.tsx, verify.py).
Shorts render with Remotion (`studio/`); long-form still uses Manim (`scene.py`).

Tools run with `~/.surprisal_venv/bin/python` after `bash setup.sh`.
Commit as "Surprisal bot" <bot@surprisal.invalid>; always `git pull --rebase` before pushing main.
Never push anything to `renders` except through `kit/stage_video.sh`.
