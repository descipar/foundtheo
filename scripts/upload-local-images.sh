#!/bin/bash
# Lädt alle Bilder aus test-images/ in den lokalen R2-Emulator
# Verwendung: ./scripts/upload-local-images.sh

set -e

IMAGES_DIR="./test-images"
R2_PREFIX="dogs/theo"

if [ ! -d "$IMAGES_DIR" ]; then
  echo "❌ Ordner '$IMAGES_DIR' nicht gefunden."
  exit 1
fi

FILES=$(find "$IMAGES_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" \))

if [ -z "$FILES" ]; then
  echo "❌ Keine Bilder in '$IMAGES_DIR' gefunden (jpg, jpeg, png, webp)."
  exit 1
fi

echo "📤 Lade Bilder in lokalen R2-Emulator (IMAGES/$R2_PREFIX/)..."
echo ""

for FILE in $FILES; do
  FILENAME=$(basename "$FILE")
  KEY="$R2_PREFIX/$FILENAME"
  echo "  → $KEY"
  npx wrangler r2 object put "theo-badges-images/$KEY" --file "$FILE" --local
done

echo ""
echo "✅ Fertig! Bilder sind jetzt lokal verfügbar."
echo "   Starte den Dev-Server mit: npm run dev"
