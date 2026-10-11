#!/usr/bin/env bash
# Chaîne complète d'une composition : animation → bande-son → vidéo finale + variante muette + affiche.
#   ./scripts/build.sh google-ads             (qualité finale : 1080p, 30 i/s, flou de mouvement adaptatif)
#   ./scripts/build.sh demo --sub 1           (aperçu rapide sans flou de mouvement)
set -euo pipefail
cd "$(dirname "$0")/.."

COMP=${1:-google-ads}
shift || true
case "$COMP" in
  demo)       NAME=premiere-immo-demo;       POSTER=23 ;;
  google-ads) NAME=premiere-immo-google-ads; POSTER=8.78 ;;
  facebook)   NAME=premiere-immo-facebook;   POSTER=2.4 ;;
  *) echo "composition inconnue : $COMP" >&2; exit 1 ;;
esac

FFMPEG=${FFMPEG:-$(command -v ffmpeg || python3 -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')}
export FFMPEG
OUT=video/$COMP
mkdir -p "build/$COMP" "$OUT"

echo "1/4  Rendu de l'animation ($COMP)"
node scripts/render.mjs video --comp "$COMP" --out "build/$COMP/video.mp4" "$@"

echo "2/4  Synthèse de la bande-son"
python3 "scripts/score_${COMP//-/_}.py"

echo "3/4  Mixage final (loudness web : -14 LUFS, crête -1,5 dBTP)"
read -r I TP LRA THRESH OFFSET < <("$FFMPEG" -hide_banner -nostats -i "build/$COMP/audio.wav" \
  -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 |
  python3 -c "import sys, json, re; d = json.loads(re.findall(r'\{[^{}]*\}', sys.stdin.read(), re.S)[-1]); print(d['input_i'], d['input_tp'], d['input_lra'], d['input_thresh'], d['target_offset'])")
"$FFMPEG" -y -loglevel error -i "build/$COMP/video.mp4" -i "build/$COMP/audio.wav" -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$THRESH:offset=$OFFSET:linear=true" \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$OUT/$NAME.mp4"
"$FFMPEG" -y -loglevel error -i "build/$COMP/video.mp4" -c copy -an -movflags +faststart "$OUT/$NAME-muet.mp4"

echo "4/4  Image d'affiche"
"$FFMPEG" -y -loglevel error -ss "$POSTER" -i "build/$COMP/video.mp4" -frames:v 1 -q:v 2 "$OUT/poster.jpg"

ls -lh "$OUT"
