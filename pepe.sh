#!/usr/bin/env bash
# ============================================================
# PEPE NUÔI THÂN — HEADLESS SERVICE CONTROLLER
# ============================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON="$DIR/.venv/bin/python3"

if [ ! -f "$PYTHON" ]; then
  PYTHON="python3"
fi

case "$1" in
  start)
    $PYTHON -m services.daemon start
    ;;
  stop)
    $PYTHON -m services.daemon stop
    ;;
  status)
    $PYTHON -m services.daemon status
    ;;
  run-once)
    $PYTHON -m services.daemon run-once
    ;;
  logs)
    tail -f "$DIR/logs/pepe_daemon.log"
    ;;
  install-service)
    $PYTHON -m services.daemon install-service
    ;;
  uninstall-service)
    $PYTHON -m services.daemon uninstall-service
    ;;
  *)
    echo "🐸 Pepe Nuôi Thân CLI"
    echo "Sử dụng: ./pepe.sh [start|stop|status|run-once|logs|install-service|uninstall-service]"
    exit 1
    ;;
esac
