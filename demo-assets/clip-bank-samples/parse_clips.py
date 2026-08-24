#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
预解析样例脚本：把 1fps 抽出的视频帧喂给 gemini-3-pro-preview-new（AIDP ModelHub 内网网关），
做"镜头边界检测候选 + 语义聚合"切分成 clip，并按 V3 Clip Bank schema 输出结构化 JSON。

- ASR / has_speech 本版占位（基线规则：ASR 不走该 gemini 网关）。
- 运行前需：source ~/.config/gemini-modelhub/{env,models.env}，且连办公网/VPN。
用法：python3 parse_clips.py <source> <frames_dir> <duration_sec> <out_json> <original_filename>
"""
import base64
import json
import os
import sys
from urllib import request, error

API_KEY = os.environ.get("GEMINI_MODELHUB_API_KEY", "")
BASE_URL = os.environ.get(
    "GEMINI_MODELHUB_BASE_URL",
    "https://aidp-i18ntt-sg.tiktok-row.net/api/modelhub/online/v2",
)
ENDPOINT = os.environ.get("GEMINI_MODELHUB_CRAWL_URL") or f"{BASE_URL}/crawl?ak={API_KEY}"
MODEL = os.environ.get("GEMINI_MODEL_GEMINI_3_PRO_PREVIEW_NEW", "gemini-3-pro-preview-new")

PROMPT = """You are the platform-side video understanding module for a TikTok Shop US digital-human LIVE product (V3 "Material Studio").
You will receive a sequence of frames sampled at 1 frame per second from one merchant product video. Each frame is labeled with its timestamp in seconds (t=0 is the first frame).

TASK — emulate "shot-boundary detection + semantic aggregation + scoring":
1. Segment the video into CLIPS by shot / semantic change (group consecutive similar frames into one clip). Aim for natural, reusable segments (typically 3-12s each). Do NOT output one clip per frame.
2. For EACH clip output structured fields below.

Return STRICT JSON only (no markdown), shape:
{
  "clips": [
    {
      "clip_index": 1,
      "start_sec": <number>,
      "end_sec": <number>,
      "clip_type": "strong" | "bg" | "risk",      // strong=可直接用于讲解的强片段; bg=适合做背景的氛围/空镜; risk=有风险不可用
      "visual": "<one English sentence describing what is on screen>",
      "visual_zh": "<同一句的中文描述>",
      "tags": ["<category/sellingpoint/scene tags, mix EN ok>"],
      "recommend_use": "background" | "foreground" | "none",
      "recommend_reason": "<why this layer, EN short>",
      "match_score": <0-100 integer estimate of how relevant this clip is to the MAIN product shown>,
      "highlight": <true|false whether this is a strong sellable highlight moment>
    }
  ],
  "summary": {
    "main_product_guess": "<what product the video is selling, EN>",
    "main_product_guess_zh": "<中文>",
    "overall_tags": ["..."],
    "shot_count": <int>
  }
}
Be concise. Output JSON object only."""


def build_content(frames_dir):
    files = sorted(f for f in os.listdir(frames_dir) if f.lower().endswith(".jpg"))
    content = [{"type": "text", "text": PROMPT}]
    for i, fn in enumerate(files):
        ts = i  # 1fps → frame i is at t=i seconds
        with open(os.path.join(frames_dir, fn), "rb") as fh:
            b64 = base64.b64encode(fh.read()).decode("ascii")
        content.append({"type": "text", "text": f"t={ts}s:"})
        content.append({"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}})
    return content, len(files)


def main():
    source, frames_dir, duration_sec, out_json, original = sys.argv[1:6]
    content, nframes = build_content(frames_dir)
    body = json.dumps({
        "stream": False,
        "model": MODEL,
        "max_tokens": 16000,
        "response_format": {"type": "json_object"},
        "messages": [{"role": "user", "content": content}],
    }).encode("utf-8")
    req = request.Request(ENDPOINT, data=body, method="POST",
                          headers={"Content-Type": "application/json",
                                   "X-TT-LOGID": f"clip-parse-{source}"})
    print(f"[{source}] posting {nframes} frames ({len(body)//1024}KB) ...", flush=True)
    try:
        with request.urlopen(req, timeout=300) as up:
            raw = up.read().decode("utf-8")
    except error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode('utf-8','replace')[:1500]}")
        sys.exit(1)
    resp = json.loads(raw)
    model_text = resp["choices"][0]["message"]["content"]
    parsed = json.loads(model_text)

    # 包装成最终样例 JSON（补 asset 元信息 + 占位字段 + 缩略图引用）
    rel_frames = os.path.relpath(frames_dir, os.path.dirname(out_json))
    for c in parsed.get("clips", []):
        mid = int((c.get("start_sec", 0) + c.get("end_sec", 0)) // 2)
        c["thumbnail"] = f"{rel_frames}/f_{mid+1:03d}.jpg"
        c["asr"] = None            # 占位：本版不做 ASR
        c["asr_lang"] = None       # 占位：en/es，仅 has_speech=true 时由 ASR 识别；与 shared_context.language 做一致性校验
        c["asr_status"] = "placeholder_no_asr_this_version"
        layer = c.get("recommend_use", "none")
        c["visual_layer"] = layer if layer in ("background", "foreground", "none") else "none"
    out = {
        "asset": {
            "source": source,
            "original_filename": original,
            "duration_sec": float(duration_sec),
            "format": "MP4 / 1080x1920 / 30fps / H.264",
            "has_speech": None,
            "has_speech_status": "placeholder_no_asr_this_version",
            "frame_sample_fps": 1,
            "parsed_by": MODEL,
            "method": "1fps frame sampling -> gemini shot-boundary + semantic aggregation",
        },
        "summary": parsed.get("summary", {}),
        "clips": parsed.get("clips", []),
        "_usage": resp.get("usage", {}),
    }
    with open(out_json, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=2)
    print(f"[{source}] OK -> {out_json}  clips={len(out['clips'])}")


if __name__ == "__main__":
    main()
