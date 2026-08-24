#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
OUT="v3-ai-live-product-demo.zip"
OUT_FRIENDLY="AI-LIVE-V3-Demo-商家端+平台端.zip"
DESKTOP_COPY="${DESKTOP_COPY:-$HOME/Desktop/$OUT_FRIENDLY}"

echo "V3 Demo 预览包 · 商家端 + 平台端 · 打包校验"

AVATAR_DIR="demo-assets/avatars"
EXPECTED_AVATARS=8
ACTUAL_AVATARS="$(find "$AVATAR_DIR" -maxdepth 1 -name '*.jpg' 2>/dev/null | wc -l | tr -d ' ')"
if [ "$ACTUAL_AVATARS" -lt "$EXPECTED_AVATARS" ]; then
  echo "错误: $AVATAR_DIR 应有 $EXPECTED_AVATARS 张 jpg，当前 $ACTUAL_AVATARS"
  exit 1
fi

DOCS=(
  "docs/V3商家端页面级方案（基于V2链路迭代）.md"
  "docs/V3平台端内部工作台页面级方案.md"
  "docs/V3页面级方案-阅读版.html"
  "docs/脚本生产与测评Pipeline-算法研发对齐稿.html"
)
for f in "${DOCS[@]}"; do
  if [ ! -f "$f" ]; then
    echo "错误: 缺少 $f"
    exit 1
  fi
done

for f in demo/index.html demo/seller/index.html demo/platform/index.html PREVIEW.md README.md start_demo.sh start_demo.command; do
  if [ ! -f "$f" ]; then
    echo "错误: 缺少 $f"
    exit 1
  fi
done

OVERLAY_DIR="demo-assets/overlays/maas"
OVERLAY_COUNT="$(find "$OVERLAY_DIR" -maxdepth 1 -name '*.png' 2>/dev/null | wc -l | tr -d ' ')"
if [ "$OVERLAY_COUNT" -lt 8 ]; then
  echo "错误: $OVERLAY_DIR 应有 8 张 png，当前 $OVERLAY_COUNT"
  exit 1
fi

PROD_DIR="demo-assets/products"
PROD_COUNT="$(find "$PROD_DIR" -maxdepth 1 \( -name '*.jpeg' -o -name '*.jpg' \) 2>/dev/null | wc -l | tr -d ' ')"
if [ "$PROD_COUNT" -lt 5 ]; then
  echo "错误: $PROD_DIR 应有 5 张商品图，当前 $PROD_COUNT"
  exit 1
fi

# 同步本地代理（视频解析 + GPT-5.5 话术/翻译）到 tools/
TOOLS_DIR="tools"
PROXY_SRC="../商家配置数字人V3版本/video_parse_proxy.py"
mkdir -p "$TOOLS_DIR"
if [ ! -f "$PROXY_SRC" ]; then
  echo "错误: 缺少 $PROXY_SRC（无法打包解析/话术代理）"
  exit 1
fi
cp -f "$PROXY_SRC" "$TOOLS_DIR/video_parse_proxy.py"
chmod +x "$TOOLS_DIR/start_parse_proxy.sh" 2>/dev/null || true

FRAMES_DIR="demo-assets/clip-bank-samples/frames"
if [ ! -d "$FRAMES_DIR/method1_background_57s" ] || [ ! -d "$FRAMES_DIR/method2_uyv_29s" ]; then
  echo "错误: 缺少 clip 缩略图帧目录 $FRAMES_DIR"
  exit 1
fi

rm -f "$OUT"
zip -r "$OUT" . \
  -x "*.DS_Store" \
  -x "*_playwright-qa*" \
  -x ".git/*" \
  -x "V3最终版本讨论草稿-持续Log.md" \
  -x ".demo_server.pid" \
  -x ".demo_server.log" \
  -x "$OUT"

SIZE="$(du -h "$OUT" | cut -f1)"
echo ""
echo "已生成: $ROOT/$OUT ($SIZE)"
cp -f "$OUT" "$DESKTOP_COPY" 2>/dev/null && echo "已复制到桌面: $DESKTOP_COPY" || echo "提示: 未能复制到桌面，请手动拷贝 $OUT"
if command -v shasum >/dev/null 2>&1; then
  echo "SHA256: $(shasum -a 256 "$OUT" | awk '{print $1}')"
fi
echo ""
echo "发给设计师/研发: 解压后 bash start_demo.sh · 详见 PREVIEW.md"
