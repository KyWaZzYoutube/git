#!/usr/bin/env bash
# Chaîne complète d'une composition : animation → bande-son → vidéo finale + variante muette + affiche.
#   ./scripts/build.sh google-ads             (qualité finale : 1080p, 30 i/s, flou de mouvement adaptatif)
#   ./scripts/build.sh demo --sub 1           (aperçu rapide sans flou de mouvement)
#   SKIP_RENDER=1 ./scripts/build.sh facebook (réutilise l'image déjà rendue : seul le son est refait)
set -euo pipefail
cd "$(dirname "$0")/.."

COMP=${1:-google-ads}
shift || true
case "$COMP" in
  demo)       NAME=premiere-immo-demo;       POSTER=23 ;;
  google-ads) NAME=premiere-immo-google-ads; POSTER=8.78 ;;
  facebook)   NAME=premiere-immo-facebook;   POSTER=2.4 ;;
  agence)     NAME=premiere-immo-agence-publicite; POSTER=9 ;;
  realty)     NAME=realty-logiciel-immobilier; POSTER=16.6 ;;
  *) echo "composition inconnue : $COMP" >&2; exit 1 ;;
esac

FFMPEG=${FFMPEG:-$(command -v ffmpeg || python3 -c 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())')}
export FFMPEG
OUT=video/$COMP
mkdir -p "build/$COMP" "$OUT"

if [[ -n "${SKIP_RENDER:-}" && -f "build/$COMP/video.mp4" ]]; then
  echo "1/4  Rendu de l'animation : réutilise build/$COMP/video.mp4"
else
  echo "1/4  Rendu de l'animation ($COMP)"
  node scripts/render.mjs video --comp "$COMP" --out "build/$COMP/video.mp4" "$@"
fi

echo "2/4  Synthèse de la bande-son"
rm -f "build/$COMP/audio_sans_voix.wav"   # réécrite par la partition seulement si la vidéo a une voix off
python3 "scripts/score_${COMP//-/_}.py"

echo "3/4  Mixage final (loudness web : -14 LUFS, crête -1,5 dBTP)"
LIMIT="alimiter=limit=0.7:attack=2:release=40:level=false:latency=true"   # crêtes à -3 dBFS avant la normalisation
mux() {   # mux <audio.wav> <sortie.mp4> : limiteur + normalisation linéaire en deux passes, puis assemblage avec l'image
  read -r I TP LRA THRESH OFFSET < <("$FFMPEG" -hide_banner -nostats -i "$1" \
    -af "$LIMIT,loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json" -f null - 2>&1 |
    python3 -c "import sys, json, re; d = json.loads(re.findall(r'\{[^{}]*\}', sys.stdin.read(), re.S)[-1]); print(d['input_i'], d['input_tp'], d['input_lra'], d['input_thresh'], d['target_offset'])")
  "$FFMPEG" -y -loglevel error -i "build/$COMP/video.mp4" -i "$1" -map 0:v -map 1:a -c:v copy \
    -af "$LIMIT,loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$I:measured_TP=$TP:measured_LRA=$LRA:measured_thresh=$THRESH:offset=$OFFSET:linear=true" \
    -c:a aac -b:a 192k -cutoff 18000 -ar 48000 -shortest -movflags +faststart "$2"
}
mux "build/$COMP/audio.wav" "$OUT/$NAME.mp4"
if [[ -f "build/$COMP/audio_sans_voix.wav" ]]; then   # variante musique seule quand la vidéo a une voix off
  mux "build/$COMP/audio_sans_voix.wav" "$OUT/$NAME-sans-voix.mp4"
fi
"$FFMPEG" -y -loglevel error -i "build/$COMP/video.mp4" -c copy -an -movflags +faststart "$OUT/$NAME-muet.mp4"

echo "4/4  Image d'affiche"
"$FFMPEG" -y -loglevel error -ss "$POSTER" -i "build/$COMP/video.mp4" -frames:v 1 -q:v 2 "$OUT/poster.jpg"

ls -lh "$OUT"
