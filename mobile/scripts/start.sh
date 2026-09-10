#!/usr/bin/env bash
# Start Expo with higher FD limits and a clean Metro port.
set -euo pipefail
cd "$(dirname "$0")/.."

ulimit -n 65536 2>/dev/null || true

# Free stale Metro/Expo from a previous run (common cause of port + EMFILE issues)
for port in 8081 8082; do
  if command -v lsof >/dev/null 2>&1; then
    pids=$(lsof -ti:"$port" 2>/dev/null || true)
    if [ -n "${pids:-}" ]; then
      echo "Stopping process(es) on port $port: $pids"
      # shellcheck disable=SC2086
      kill -9 $pids 2>/dev/null || true
    fi
  fi
done

if ! command -v watchman >/dev/null 2>&1; then
  echo ""
  echo "Watchman not found — starting without file watching (avoids EMFILE)."
  echo "App works; auto-reload is off. Shake device to reload after code changes."
  echo "Later (optional): brew install watchman"
  echo ""
  export CI=1
fi

export EXPO_NO_TELEMETRY=1

MODE="${1:-start}"
shift || true

case "$MODE" in
  tunnel)
    exec npx expo start --tunnel --clear "$@"
    ;;
  android)
    exec npx expo start --android --clear "$@"
    ;;
  ios)
    exec npx expo start --ios --clear "$@"
    ;;
  *)
    exec npx expo start --clear "$@"
    ;;
esac
