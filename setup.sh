#!/usr/bin/env bash
# One-time setup for a fresh workspace. Safe to re-run: every step skips work already done.
# Usage: bash setup.sh
set -euo pipefail
CACHE="${SURPRISAL_CACHE:-$HOME/.surprisal_cache}"
VENV="${SURPRISAL_VENV:-$HOME/.surprisal_venv}"
mkdir -p "$CACHE" "$HOME/.fonts"
log(){ echo "[setup] $*"; }

# 1. System packages: Pango/Cairo for Manim text, LaTeX + dvisvgm for MathTex, ffmpeg for assembly.
PKGS="libpango1.0-dev libcairo2-dev pkg-config ffmpeg dvisvgm texlive-latex-extra texlive-fonts-recommended texlive-extra-utils"
if ! (pkg-config --exists pangocairo && command -v dvisvgm >/dev/null && command -v ffmpeg >/dev/null && kpsewhich standalone.cls >/dev/null 2>&1); then
  log "installing system packages (a few minutes)"
  export DEBIAN_FRONTEND=noninteractive
  apt-get install -y -q $PKGS >/tmp/apt.log 2>&1 || { apt-get update -q >/dev/null 2>&1; apt-get install -y -q $PKGS >/tmp/apt.log 2>&1; }
fi

# 2. Python environment. A venv avoids a build failure in the system Python's setuptools.
if [ ! -x "$VENV/bin/manim" ]; then
  log "creating Python environment"
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -q --upgrade pip
  "$VENV/bin/pip" install -q manim kokoro-onnx soundfile faster-whisper num2words fonttools numpy
fi

# 2b. OmniVoice (the channel voice). CPU build of PyTorch first so pip doesn't pull CUDA wheels.
if ! "$VENV/bin/python" -c "import omnivoice" 2>/dev/null; then
  log "installing OmniVoice (CPU)"
  "$VENV/bin/pip" install -q torch torchaudio --index-url https://download.pytorch.org/whl/cpu
  "$VENV/bin/pip" install -q omnivoice
fi

# 3. Brand fonts (Google Fonts, OFL). Static instances are cut from the variable fonts so
#    libass (captions) and Pango (Manim) both get real weights instead of faux bold.
if [ ! -f "$HOME/.fonts/SpaceGrotesk-Bold.ttf" ]; then
  log "installing fonts"
  GF=https://raw.githubusercontent.com/google/fonts/main/ofl
  curl -sfL -o "$CACHE/SpaceGrotesk-VF.ttf" "$GF/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf"
  curl -sfL -o "$CACHE/Fraunces-VF.ttf" "$GF/fraunces/Fraunces%5BSOFT,WONK,opsz,wght%5D.ttf"
  "$VENV/bin/python" - "$CACHE" "$HOME/.fonts" <<'PY'
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
cache, out = sys.argv[1], sys.argv[2]
def cut(src, axes, dst, family, style):
    f = instantiateVariableFont(TTFont(f"{cache}/{src}"), axes)
    n = f["name"]
    for rec in list(n.names):
        if rec.nameID in (1, 2, 4, 6, 16, 17, 21, 22, 25):
            n.removeNames(nameID=rec.nameID)
    full = family
    n.setName(family, 1, 3, 1, 0x409); n.setName("Regular", 2, 3, 1, 0x409)
    n.setName(full, 4, 3, 1, 0x409); n.setName(full.replace(" ", ""), 6, 3, 1, 0x409)
    f.save(f"{out}/{dst}")
cut("SpaceGrotesk-VF.ttf", {"wght": 700}, "SpaceGrotesk-Bold.ttf", "Space Grotesk Bold", "")
cut("SpaceGrotesk-VF.ttf", {"wght": 500}, "SpaceGrotesk-Medium.ttf", "Space Grotesk Medium", "")
cut("Fraunces-VF.ttf", {"wght": 600, "opsz": 144, "SOFT": 50, "WONK": 1}, "Fraunces-SemiBold.ttf", "Fraunces SemiBold", "")
PY
  fc-cache -f >/dev/null 2>&1 || true
fi

# 3b. Monospace font for terminals/code (JetBrains Mono, OFL) and the Lucide icon set (ISC).
if [ ! -f "$HOME/.fonts/JetBrainsMono-Bold.ttf" ]; then
  log "installing monospace font"
  curl -sfL -o "$CACHE/JetBrainsMono-VF.ttf" "https://raw.githubusercontent.com/google/fonts/main/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf"
  "$VENV/bin/python" - "$CACHE" "$HOME/.fonts" <<'PY'
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
cache, out = sys.argv[1], sys.argv[2]
f = instantiateVariableFont(TTFont(f"{cache}/JetBrainsMono-VF.ttf"), {"wght": 700})
n = f["name"]
for rec in list(n.names):
    if rec.nameID in (1, 2, 4, 6, 16, 17, 21, 22, 25):
        n.removeNames(nameID=rec.nameID)
for nid, v in ((1, "JetBrains Mono Bold"), (2, "Regular"), (4, "JetBrains Mono Bold"), (6, "JetBrainsMonoBold")):
    n.setName(v, nid, 3, 1, 0x409)
f.save(f"{out}/JetBrainsMono-Bold.ttf")
PY
  fc-cache -f >/dev/null 2>&1 || true
fi
if [ ! -d "$CACHE/icons" ]; then
  log "installing icons"
  (cd "$CACHE" && npm pack lucide-static@1.51.0 --silent >/dev/null 2>&1 \
     && tar xzf lucide-static-1.51.0.tgz package/icons && mv package/icons icons && rm -rf package lucide-static-1.51.0.tgz) \
    || log "WARNING: could not install icons; kit.visuals.icon() will draw a placeholder"
fi

# 4. Voice model (Kokoro, Apache-2.0). The caption aligner downloads its own small model on first use.
[ -f "$CACHE/kokoro.onnx" ] || { log "downloading voice model"; curl -sfL -o "$CACHE/kokoro.onnx" https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/onnx/model_quantized.onnx; }
[ -f "$CACHE/voices.bin" ] || curl -sfL -o "$CACHE/voices.bin" https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

# 5. Fetch the OmniVoice weights now (about 3 GB, cached by Hugging Face) so the voice step doesn't wait on them.
"$VENV/bin/python" -c "from huggingface_hub import snapshot_download; snapshot_download('k2-fsa/OmniVoice')" >/dev/null 2>&1 \
  || log "WARNING: could not pre-download OmniVoice weights; the voice step will try again (Kokoro is the fallback)"

"$VENV/bin/python" -c "import manim, kokoro_onnx, faster_whisper, omnivoice" && log "ready. Run tools with $VENV/bin/python"
