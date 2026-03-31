#!/usr/bin/env bash
# Generates store-listing assets from the processed source images in assets/images/.
# Requires: ImageMagick (convert / identify)
#
# Outputs (all written to store-assets/):
#   play-store-icon.png          512x512  – Google Play store listing icon
#   app-store-icon.png           1024x1024 opaque – Apple App Store icon (no alpha)
#   play-store-feature-graphic.png  1024x500 – Google Play feature graphic

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/assets/images"
OUT="$ROOT/store-assets"

mkdir -p "$OUT"

echo "▸ Google Play store listing icon (512×512)…"
convert \
  "$SRC/app-icon.png" \
  -resize 512x512 \
  "$OUT/play-store-icon.png"

echo "▸ Apple App Store icon (1024×1024, opaque)…"
convert \
  "$SRC/app-icon.png" \
  -background "#f5f3ff" \
  -flatten \
  "$OUT/app-store-icon.png"

echo "▸ Google Play feature graphic (1024×500)…"
# Scale splash logo to 960 px wide (preserves ~2.33:1 ratio → ~411 px tall),
# then centre on a 1024×500 brand-colour canvas.
convert \
  -size 1024x500 xc:"#f5f3ff" \
  \( "$SRC/splash-transparent.png" -resize 960x \) \
  -gravity center \
  -composite \
  "$OUT/play-store-feature-graphic.png"

echo ""
echo "✓ Store assets written to $OUT:"
identify -format "  %f  %wx%h\n" "$OUT"/*.png

