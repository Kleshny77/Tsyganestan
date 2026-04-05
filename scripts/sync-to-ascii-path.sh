#!/usr/bin/env bash
# Синхронизация репозитория в путь только с ASCII — нужно для pod install / Xcode с RN 0.84+.
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
DST="${TSYGANESTAN_ASCII_ROOT:-$HOME/Tsyganestan-ascii-build}"

echo "Источник: $SRC"
echo "Назначение: $DST"

mkdir -p "$DST"
rsync -a --delete \
  --exclude 'front/node_modules' \
  --exclude 'front/ios/Pods' \
  --exclude 'front/ios/build' \
  --exclude 'front/android/build' \
  --exclude 'front/android/.gradle' \
  --exclude 'front/android/app/build' \
  "$SRC/" "$DST/"

cd "$DST/front"
if [[ ! -d node_modules ]]; then
  npm install --legacy-peer-deps
else
  npm install --legacy-peer-deps
fi

cd ios
pod install

echo ""
echo "Готово. Запуск симулятора (Metro в другом терминале: npm start):"
echo "  cd \"$(dirname "$0")/../front\" && npm run ios"
echo "Или вручную из ASCII-копии (если Metro уже на 8081 — добавьте --no-packager):"
echo "  cd \"$DST/front\" && npx react-native run-ios --no-packager"
echo "Xcode: $DST/front/ios/Front.xcworkspace"
