#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../front" && pwd)"
cd "$ROOT/android"

if [[ -d "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home" ]]; then
  export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
elif JDK17="$(/usr/libexec/java_home -v 17 2>/dev/null)"; then
  export JAVA_HOME="$JDK17"
else
  echo "Нужен JDK 17: brew install openjdk@17"
  exit 1
fi

export PATH="$JAVA_HOME/bin:$PATH"
echo "JAVA_HOME=$JAVA_HOME"
exec ./gradlew "$@" --console=plain
