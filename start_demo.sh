#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
PORT="${PORT:-8012}"
PID_FILE="$ROOT/.demo_server.pid"
URL_PATH="/demo/index.html"

echo "V3 AI LIVE 产品演示 Demo"
echo "目录: $ROOT"

if ! command -v python3 >/dev/null 2>&1; then
  echo "未找到 python3，请先安装 Python 3。"
  exit 1
fi

# 若已有本包启动的 server，先提示
if [ -f "$PID_FILE" ]; then
  OLD_PID="$(cat "$PID_FILE" 2>/dev/null || true)"
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    DEMO_URL="http://localhost:${PORT}${URL_PATH}"
    # 尝试从进程参数读实际端口
    ACTUAL_PORT="$(ps -p "$OLD_PID" -o args= 2>/dev/null | sed -n 's/.*http\.server \([0-9][0-9]*\).*/\1/p' | head -1)"
    if [ -n "$ACTUAL_PORT" ]; then
      DEMO_URL="http://localhost:${ACTUAL_PORT}${URL_PATH}"
    fi
    echo "Demo 服务已在运行 (pid $OLD_PID)。"
    echo "地址: $DEMO_URL"
    if command -v open >/dev/null 2>&1; then
      open "$DEMO_URL" 2>/dev/null || true
    fi
    exit 0
  fi
fi

while lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done

cd "$ROOT"
nohup python3 -m http.server "$PORT" > "$ROOT/.demo_server.log" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > "$PID_FILE"
sleep 0.5

if ! kill -0 "$SERVER_PID" 2>/dev/null; then
  echo "启动失败，请查看日志: $ROOT/.demo_server.log"
  rm -f "$PID_FILE"
  exit 1
fi

DEMO_URL="http://localhost:${PORT}${URL_PATH}"
echo "已启动: $DEMO_URL"
echo "日志: $ROOT/.demo_server.log"
echo "停止: kill $SERVER_PID  或  Ctrl+C 后 rm $PID_FILE"

if command -v open >/dev/null 2>&1; then
  if open -a "Google Chrome" "$DEMO_URL" >/dev/null 2>&1; then
    :
  elif open -a "Safari" "$DEMO_URL" >/dev/null 2>&1; then
    :
  else
    open "$DEMO_URL" 2>/dev/null || true
  fi
fi
