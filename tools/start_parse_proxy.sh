#!/usr/bin/env bash
# 本地解析 / 话术 / 翻译代理（8789）· 需办公网/VPN + 内网凭证
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if ! command -v python3 >/dev/null 2>&1; then
  echo "未找到 python3"
  exit 1
fi

[ -f "$HOME/.config/gemini-modelhub/env" ] && source "$HOME/.config/gemini-modelhub/env"
[ -f "$HOME/.config/gemini-modelhub/models.env" ] && source "$HOME/.config/gemini-modelhub/models.env"
[ -f "$HOME/.config/aicolate/env" ] && source "$HOME/.config/aicolate/env"
[ -f "$HOME/.config/aicolate/models.env" ] && source "$HOME/.config/aicolate/models.env"

if [ ! -f "$ROOT/video_parse_proxy.py" ]; then
  echo "缺少 video_parse_proxy.py（打包时会从主仓库同步到 tools/）"
  exit 1
fi

PORT="${PORT:-8789}"
PID="$(lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null | head -1 || true)"
if [ -n "$PID" ]; then
  echo "端口 $PORT 已被 pid $PID 占用；如需重启请先 kill $PID"
  curl -sS "http://localhost:$PORT/health" && echo ""
  exit 0
fi

echo "启动 video_parse_proxy @ localhost:$PORT"
echo "  /parse-video      → Gemini 视频解析"
echo "  /generate-script  → GPT-5.5 话术生成"
echo "  /translate-script → GPT-5.5 中文参考（fast 模式更快）"
python3 "$ROOT/video_parse_proxy.py"
