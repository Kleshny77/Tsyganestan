#!/usr/bin/env bash
# Запуск iOS: при не-ASCII пути (кириллица в пути) — rsync в ASCII-копию и run-ios оттуда (RN 0.84 + CocoaPods).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONT="$REPO_ROOT/front"

path_has_non_ascii() {
  python3 -c "import sys; p=sys.argv[1]; sys.exit(0 if any(ord(c) > 127 for c in p) else 1)" "$1"
}

# Если Metro уже слушает 8081, run-ios не должен пытаться поднять второй — иначе интерактив «Use port 8083?».
port_listening() {
  local port="${1:?}"
  if command -v lsof >/dev/null 2>&1; then
    lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1
  else
    return 1
  fi
}

args_contain() {
  local needle="$1"
  shift
  local a
  for a in "$@"; do [[ "$a" == "$needle" ]] && return 0; done
  return 1
}

# Без массива: при set -u пустой "${arr[@]}" в некоторых bash даёт «unbound variable».
invoke_run_ios() {
  if port_listening 8081 && ! args_contain --no-packager "$@"; then
    echo "==> Порт 8081 уже занят (скорее всего npm start) — запуск с --no-packager"
    exec npx react-native run-ios --no-packager "$@"
  fi
  exec npx react-native run-ios "$@"
}

if path_has_non_ascii "$FRONT"; then
  echo "==> iOS: в пути к проекту есть не-ASCII — синхронизация в ASCII-копию и запуск оттуда"
  "$SCRIPT_DIR/sync-to-ascii-path.sh"
  ASCII_FRONT="${TSYGANESTAN_ASCII_ROOT:-$HOME/Tsyganestan-ascii-build}/front"
  cd "$ASCII_FRONT"
  invoke_run_ios "$@"
else
  echo "==> iOS: pod install + run-ios"
  cd "$FRONT/ios"
  pod install
  cd "$FRONT"
  invoke_run_ios "$@"
fi
