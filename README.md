# Surprisal

Toolkit and memory for the [@surprisalmath](https://www.youtube.com/@surprisalmath) channel:
math that sounds wrong but is true. A scheduled Claude task runs `docs/RUNBOOK.md` every
morning: it reviews how earlier videos did, picks a topic, verifies the math in code,
animates it with Manim, voices it with Kokoro, burns in captions, and uploads through Zapier.

- `setup.sh`: installs everything in a fresh workspace (about 3 to 5 minutes)
- `kit/`: brand + timing layer for Manim (`brand.py`), voice/captions/music (`audio.py`),
  the build (`make.py`), and publishing to the `renders` branch (`stage_video.sh`)
- `episodes/`: one folder per video (`script.json`, `scene.py`, `verify.py`, `report.json`)
- `state/`: topic backlog, video log, stats, learnings, corrections
- `docs/`: the daily runbook, the style guide, the scheduled task prompt
- `brand/`: profile picture, banner, watermark, and the script that draws them
- `assets/music/`: drop royalty-free tracks here (mp3/wav) and they're rotated in; until
  then each video gets a generated ambient pad

The `renders` branch holds only the latest video file; it is overwritten every day.

Build one episode by hand:
```bash
bash setup.sh
~/.surprisal_venv/bin/python -m kit.make episodes/_example-birthday-paradox --draft
```
