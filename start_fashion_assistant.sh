#!/usr/bin/env bash
set -euo pipefail
FASHION_ROOT="$(cd "$(dirname "$0")" && pwd)"
if ! command -v python3 >/dev/null 2>&1; then
  echo "需要 Python 3.9 或更新版本。"
  exit 1
fi
if [ "${FASHION_PROVIDER:-maas}" = "maas" ] && ! command -v lumen-ai-infra-maas-runner >/dev/null 2>&1; then
  echo "未找到 MaaS Runner。安装与登录方法见 demo/fashion-assistant/README.md。"
  exit 1
fi
exec python3 "$FASHION_ROOT/tools/fashion_chat_server.py" --open "$@"
