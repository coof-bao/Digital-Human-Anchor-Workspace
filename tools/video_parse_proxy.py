import json
import os
import socket
import traceback
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib import request, error


PORT = 8789
DEMO_TOKEN = os.environ.get("VIDEO_PARSE_DEMO_TOKEN", "live-script-video-parse-demo-token")

# 凭证从系统环境变量读取（见 ~/.config/gemini-modelhub/{env,models.env}）：
#   source ~/.config/gemini-modelhub/env && source ~/.config/gemini-modelhub/models.env
# 再启动本代理。优先用完整 CRAWL_URL；否则用 BASE_URL + API_KEY 拼接。
API_KEY = os.environ.get("GEMINI_MODELHUB_API_KEY", "")
_BASE_URL = os.environ.get(
    "GEMINI_MODELHUB_BASE_URL",
    "https://aidp-i18ntt-sg.tiktok-row.net/api/modelhub/online/v2",
)
ENDPOINT = os.environ.get("GEMINI_MODELHUB_CRAWL_URL") or f"{_BASE_URL}/crawl?ak={API_KEY}"
MODEL = os.environ.get("GEMINI_MODEL_GEMINI_3_PRO_PREVIEW_NEW", "gemini-3-pro-preview-new")

# Aicolate AIGateway 凭证（见 ~/.config/aicolate/{env,models.env}）：代理 serve 页面时注入，
# 避免把 secret_key 明文写进 HTML。直接 file:// 打开则注入为空（安全默认）。
AICOLATE_AUTH_HEADER = os.environ.get("AICOLATE_AUTH_HEADER", "")
AICOLATE_MODEL = os.environ.get("AICOLATE_MODEL", "openai/gpt-5.5")
AICOLATE_CHAT_URL = os.environ.get(
    "AICOLATE_CHAT_URL",
    "https://aicolate.tiktok-row.net/ai-gateway/openai/v1/chat/completions",
)

if not API_KEY and "ak=" not in ENDPOINT:
    raise SystemExit(
        "缺少 Gemini ModelHub 凭证。请先执行：\n"
        "  source ~/.config/gemini-modelhub/env\n"
        "  source ~/.config/gemini-modelhub/models.env\n"
        "再启动本代理。"
    )
MAX_REQUEST_BYTES = 150_000_000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(BASE_DIR, "video_parse_proxy.log")
HTML_FILE = os.path.join(BASE_DIR, "直播脚本生成流程Demo.html")


def write_log(message: str):
    with open(LOG_FILE, "a", encoding="utf-8") as log:
        log.write(message.rstrip() + "\n")


def json_error(message: str, detail: str = "", status: int = 500):
    return status, json.dumps({
        "error": {
            "message": message,
            "detail": detail,
        }
    }, ensure_ascii=False)


def aicolate_chat(messages, *, max_tokens=4096, response_format=None, timeout=90):
    if not AICOLATE_AUTH_HEADER:
        raise RuntimeError("Aicolate gateway not configured (source ~/.config/aicolate/env)")
    body = {
        "model": AICOLATE_MODEL,
        "stream": False,
        "max_tokens": max_tokens,
        "messages": messages,
    }
    if response_format:
        body["response_format"] = response_format
    req = request.Request(
        AICOLATE_CHAT_URL,
        data=json.dumps(body).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": AICOLATE_AUTH_HEADER,
        },
    )
    with request.urlopen(req, timeout=timeout) as upstream:
        data = json.loads(upstream.read().decode("utf-8"))
    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    )
    if not content:
        raise RuntimeError("Empty response from Aicolate gateway")
    return content


def handle_translate_script(payload: dict) -> dict:
    text = (payload.get("text") or "").strip()
    if not text:
        raise ValueError("Empty text")
    fast = bool(payload.get("fast"))
    if fast:
        prompt = (
            "将下面 TikTok Shop 英文直播口播译成自然口语化简体中文。"
            "只输出译文，不要解释。\n\n"
            + text
        )
        max_tokens = min(2048, max(256, len(text) * 2))
        timeout = 45
    else:
        prompt = (
            "你是 TikTok Shop 电商直播话术翻译助手。"
            "请把下面整段英文直播口播完整翻译成自然、口语化的简体中文。"
            "要求：\n"
            "1. 必须全文翻译，禁止只译开头或结尾；禁止中英混杂。\n"
            "2. 保留价格、品牌名等必要英文专名时可夹中文说明，但整句应以中文为主。\n"
            "3. 只输出译文正文，不要解释、不要 Markdown、不要分段标题。\n\n"
            + text
        )
        max_tokens = 4096
        timeout = 90
    zh = aicolate_chat(
        [{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        timeout=timeout,
    )
    return {"translation": zh}


def handle_generate_script(payload: dict) -> dict:
    language = (payload.get("language") or "en").strip().lower()
    target_sec = int(payload.get("target_sec") or 15)
    target_sec = max(10, min(60, target_sec))
    merchant_hint = (payload.get("merchant_hint") or "").strip()
    current_script = (payload.get("current_script") or "").strip()
    scene = payload.get("scene") or {}
    product = payload.get("product") or {}
    avatar = payload.get("avatar") or {}
    method = int(scene.get("method") or 1)

    sp_key = (scene.get("sp_key") or scene.get("title") or "").strip()
    sp_value = (scene.get("sp_value") or "").strip()
    clip = scene.get("clip") or {}
    clip_title = (clip.get("title") or "").strip()
    clip_visual = (clip.get("visual_content") or clip.get("visual") or "").strip()
    clip_asr = (clip.get("asr_content") or clip.get("asr") or "").strip()

    product_name = (product.get("name") or product.get("ip") or "").strip()
    product_ip = (product.get("ip") or "").strip()
    product_price = (product.get("price") or "").strip()

    avatar_name = (avatar.get("name") or "").strip()
    avatar_persona = (avatar.get("persona") or "").strip()
    avatar_desc = (avatar.get("desc") or "").strip()

    lang_label = {"en": "English", "es": "Spanish"}.get(language, language or "English")
    mode_label = "merchant video scene (method 2)" if method == 2 else "digital avatar scene (method 1)"

    user_prompt = f"""你是 TikTok Shop US 数字人直播话术写手。请生成一段可直接口播的直播话术。

## 输出格式
只输出合法 JSON 对象，不要 Markdown，不要解释：
{{"text":"整段口播正文（一整段，不要换行分段标题）","parts":[{{"tag":"","text":"与 text 相同"}}],"est_sec":预估口播秒数}}

## 硬性约束
- 语言：{lang_label}；目标口播时长约 {target_sec} 秒（±3s），口语自然、像真人在直播间讲解。
- 合规：禁止虚假价格/绝对化功效承诺；禁止刷屏诱导互动；禁止未成年人相关表述；保持「真人在场」直播感。
- 结构：开场抓注意力 → 展开卖点/画面 → 轻促单（tap basket / link），不要机械列 bullet。
- 模式：{mode_label}

## 商品
- 名称：{product_name or "（未提供）"}
- 系列/IP：{product_ip or "（未提供）"}
- 价格：{product_price or "（未提供）"}

## 本场卖点
- Key：{sp_key or "（未提供）"}
- Value：{sp_value or "（未提供）"}

## 数字人（方式1）
- 形象：{avatar_name or "（未选）"} · {avatar_persona or ""}
- 人设：{avatar_desc or "（未提供）"}

## 视频片段（方式2，若有 ASR/画面请贴合）
- 片段：{clip_title or "（未提供）"}
- 画面：{clip_visual or "（未提供）"}
- ASR 参考：{clip_asr or "（无）"}

## 商家补充建议
{merchant_hint or "（无）"}

## 当前话术（重新生成时可改写，勿照抄）
{current_script or "（无，首次生成）"}
"""
    raw = aicolate_chat(
        [{"role": "user", "content": user_prompt}],
        max_tokens=2048,
        response_format={"type": "json_object"},
        timeout=120,
    )
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Invalid JSON from model: {exc}") from exc

    text = (parsed.get("text") or "").strip()
    if not text:
        parts = parsed.get("parts") or []
        if parts and isinstance(parts, list):
            text = " ".join(
                (p.get("text") or "").strip()
                for p in parts
                if isinstance(p, dict) and p.get("text")
            ).strip()
    if not text:
        raise RuntimeError("Model returned empty script")

    parts = parsed.get("parts")
    if not parts or not isinstance(parts, list):
        parts = [{"tag": "", "text": text}]
    else:
        parts = [
            {"tag": (p.get("tag") or "").strip(), "text": (p.get("text") or "").strip()}
            for p in parts
            if isinstance(p, dict) and (p.get("text") or "").strip()
        ] or [{"tag": "", "text": text}]

    est_sec = parsed.get("est_sec")
    try:
        est_sec = int(est_sec)
    except (TypeError, ValueError):
        est_sec = target_sec

    return {"text": text, "parts": parts, "est_sec": est_sec}


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", self.headers.get("Origin") or "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type,X-Demo-Token")
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def _send(self, status: int, body: str, content_type: str = "application/json; charset=utf-8"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self._cors()
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body.encode("utf-8"))

    def do_OPTIONS(self):
        self._send(204, "")

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path in ("/health", "/parse-video/health"):
            self._send(200, json.dumps({
                "ok": True,
                "service": "video_parse_proxy",
                "port": PORT,
                "aicolate": bool(AICOLATE_AUTH_HEADER),
                "endpoints": ["/parse-video", "/translate-script", "/generate-script"],
            }, ensure_ascii=False))
            return
        if path in ("/", "/index.html", "/直播脚本生成流程Demo.html"):
            try:
                with open(HTML_FILE, "r", encoding="utf-8") as fh:
                    html = fh.read()
                html = (
                    html.replace("__AICOLATE_AUTH_HEADER__", AICOLATE_AUTH_HEADER)
                        .replace("__AICOLATE_MODEL__", AICOLATE_MODEL)
                        .replace("__AICOLATE_CHAT_URL__", AICOLATE_CHAT_URL)
                )
                data = html.encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self._cors()
                self.send_header("Cache-Control", "no-store")
                self.end_headers()
                self.wfile.write(data)
            except Exception as exc:
                self._send(500, json.dumps({"error": {"message": str(exc)}}, ensure_ascii=False))
            return
        self._send(404, json.dumps({"error": {"message": "Not found"}}, ensure_ascii=False))

    def do_POST(self):
        path = self.path.split("?", 1)[0]
        if self.headers.get("X-Demo-Token") != DEMO_TOKEN:
            self._send(403, json.dumps({"error": {"message": "Invalid demo token"}}, ensure_ascii=False))
            return

        if path == "/translate-script":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                if not AICOLATE_AUTH_HEADER:
                    self._send(503, json.dumps({"error": {"message": "Translation service not configured"}}, ensure_ascii=False))
                    return
                result = handle_translate_script(payload)
                self._send(200, json.dumps(result, ensure_ascii=False))
            except ValueError as exc:
                self._send(400, json.dumps({"error": {"message": str(exc)}}, ensure_ascii=False))
            except error.HTTPError as exc:
                raw = exc.read().decode("utf-8", errors="replace")
                self._send(exc.code, raw)
            except Exception as exc:
                status, body = json_error(str(exc), traceback.format_exc()[:800], 502)
                self._send(status, body)
            return

        if path == "/generate-script":
            try:
                length = int(self.headers.get("Content-Length", "0"))
                payload = json.loads(self.rfile.read(length).decode("utf-8"))
                if not AICOLATE_AUTH_HEADER:
                    self._send(503, json.dumps({"error": {"message": "Script generation service not configured"}}, ensure_ascii=False))
                    return
                result = handle_generate_script(payload)
                self._send(200, json.dumps(result, ensure_ascii=False))
            except ValueError as exc:
                self._send(400, json.dumps({"error": {"message": str(exc)}}, ensure_ascii=False))
            except error.HTTPError as exc:
                raw = exc.read().decode("utf-8", errors="replace")
                self._send(exc.code, raw)
            except Exception as exc:
                status, body = json_error(str(exc), traceback.format_exc()[:800], 502)
                self._send(status, body)
            return

        if path != "/parse-video":
            self._send(404, json.dumps({"error": {"message": "Not found"}}, ensure_ascii=False))
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length > MAX_REQUEST_BYTES:
                status, body = json_error(
                    f"请求体过大：{round(length / 1024 / 1024, 1)}MB。请先压缩视频或换短视频测试。",
                    f"当前代理限制约 {round(MAX_REQUEST_BYTES / 1024 / 1024)}MB；base64 会比原视频大约 33%。",
                    413,
                )
                self._send(status, body)
                return

            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            log_id = payload.get("log_id") or "video_parse_demo"
            prompt = payload.get("prompt") or "请解析视频素材。"
            media = payload.get("media") or []

            content = [{"type": "text", "text": prompt}]
            for item in media:
                content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": item["data_url"]
                    }
                })

            body = json.dumps({
                "stream": False,
                "model": MODEL,
                "max_tokens": 64000,
                "response_format": {"type": "json_object"},
                "messages": [{"role": "user", "content": content}],
            }).encode("utf-8")

            req = request.Request(
                ENDPOINT,
                data=body,
                method="POST",
                headers={
                    "Content-Type": "application/json",
                    "X-TT-LOGID": log_id,
                },
            )

            try:
                with request.urlopen(req, timeout=180) as upstream:
                    self._send(upstream.status, upstream.read().decode("utf-8"))
            except error.HTTPError as exc:
                raw = exc.read().decode("utf-8", errors="replace")
                write_log(f"[{log_id}] upstream HTTP {exc.code}: {raw[:2000]}")
                try:
                    json.loads(raw)
                    self._send(exc.code, raw)
                except Exception:
                    status, body = json_error(
                        f"Gemini 视频解析接口返回 HTTP {exc.code}",
                        raw[:1000],
                        exc.code,
                    )
                    self._send(status, body)
            except Exception as exc:
                detail = traceback.format_exc()
                write_log(f"[{log_id}] upstream request failed: {detail}")
                status, body = json_error(
                    "调用 Gemini 视频解析接口失败，请确认办公网络/VPN、AK 和 endpoint 可用。",
                    str(exc),
                    502,
                )
                self._send(status, body)
        except Exception as exc:
            detail = traceback.format_exc()
            write_log(f"[proxy] request failed: {detail}")
            status, body = json_error(str(exc), detail[:1000], 500)
            self._send(status, body)

    def log_message(self, format, *args):
        return


class DualStackHTTPServer(HTTPServer):
    """Bind on both IPv4 and IPv6 loopback so `localhost` works regardless of
    whether the browser resolves it to 127.0.0.1 or ::1 (common macOS issue)."""

    address_family = socket.AF_INET6

    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except (AttributeError, OSError):
            pass
        super().server_bind()


if __name__ == "__main__":
    try:
        server = DualStackHTTPServer(("::", PORT), Handler)
        bind_info = f"http://localhost:{PORT}/parse-video (IPv4 + IPv6)"
    except OSError:
        server = HTTPServer(("127.0.0.1", PORT), Handler)
        bind_info = f"http://127.0.0.1:{PORT}/parse-video (IPv4 only)"
    print(f"Video parse proxy running at {bind_info}")
    print(f"Log file: {LOG_FILE}")
    server.serve_forever()
