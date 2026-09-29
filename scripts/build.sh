#!/usr/bin/env bash
# Chaîne complète : animation → bande-son → vidéo finale + variante muette + affiche.
#   ./scripts/build.sh                 (qualité finale : 1080p, 30 i/s, flou de mouvement ×5)
#   ./scripts/build.sh --sub 1         (aperçu rapide sans flou de mouvement)
set -euo pipefail
cd "$(dirname "$0")/.."

FFMPEG=${FFMPEG:-$(command -v ffmpeg || python3 -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')}
export FFMPEG
mkdir -p build video

echo "1/4  Rendu de l'animation"
node scripts/render.mjs video --out build/video.mp4 --crf 18 "$@"

echo "2/4  Synthèse de la bande-son"
python3 scripts/audio.py

echo "3/4  Mixage final (loudness web : -14 LUFS, crête -1,5 dBTP)"
read -r I TP LRA THRESH OFFSET < <("$FFMPEG" -hide_banner -nostats -i build/audio.wav \
  -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 |
  python3 -c "import sys, json, re; d = json.loads(re.findall(r'\{[^{}]*\}', sys.stdin.read(), re.S)[-1]); print(d['input_i'], d['input_tp'], d['input_lra'], d['input_thresh'], d['target_offset'])")
"$FFMPEG" -y -loglevel error -i build/video.mp4 -i build/audio.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$THRESH:offset=$OFFSET:linear=true" \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart video/premiere-immo-demo.mp4
"$FFMPEG" -y -loglevel error -i build/video.mp4 -c copy -an -movflags +faststart video/premiere-immo-demo-muet.mp4

echo "4/4  Image d'affiche"
"$FFMPEG" -y -loglevel error -ss 23 -i build/video.mp4 -frames:v 1 -q:v 2 video/poster.jpg

ls -lh video/
