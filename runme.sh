#!/usr/bin/env bash
set -e

# ============================================================
# explore_ai — everything you need to run this project
# ============================================================
# Usage:
#   ./runme.sh install    install dependencies (npm ci)
#   ./runme.sh typecheck  type-check the code (tsc)
#   ./runme.sh test       run the demo-mode logic tests
#   ./runme.sh web        start dev server, open browser
#   ./runme.sh stop       stop a background dev server
#   ./runme.sh           (no args) install + typecheck + test
# ============================================================

case "${1:-}" in
  install)
    echo "== installing dependencies =="
    npm ci
    ;;

  typecheck)
    echo "== type checking =="
    npm run typecheck
    ;;

  test)
    echo "== running demo-mode tests =="
    npm test
    ;;

  web)
    echo "== starting dev server at http://localhost:8081 =="
    CI=1 nohup ./node_modules/.bin/expo start --web --port 8081 > /tmp/expo-dev.log 2>&1 &
    echo $! > /tmp/expo-dev.pid
    echo "started pid $!  (logs: /tmp/expo-dev.log, stop with: ./runme.sh stop)"
    ;;

  stop)
    if [ -f /tmp/expo-dev.pid ]; then
      PID=$(cat /tmp/expo-dev.pid)
      if kill -0 "$PID" 2>/dev/null; then
        kill "$PID" && echo "stopped pid $PID"
      else
        echo "process $PID not running"
      fi
      rm -f /tmp/expo-dev.pid
    else
      echo "no pid file (server not started via runme.sh)"
    fi
    ;;

  *)
    ./runme.sh install
    ./runme.sh typecheck
    ./runme.sh test
    echo ""
    echo "Start the app:    ./runme.sh web"
    echo "Phone (local):    npx expo start   then scan QR in Expo Go"
    ;;
esac
