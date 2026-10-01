#!/usr/bin/env python3
"""Fashion Lab: local static app + real, non-streaming model conversations."""
import argparse
import json
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import tempfile
import threading
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
import webbrowser

APP = Path(__file__).resolve().parents[1] / "demo" / "fashion-assistant"
PREFIX = "/demo/fashion-assistant/"
MODEL_TIMEOUT = 75
MAX_BODY = 100_000
CATEGORIES = {"Coat", "Top", "Pants", "Skirt", "Dress", "Shoes", "Bag", "Accessory"}
SYSTEM = """You are Fashion Lab, a helpful personal stylist having a real conversation.
Reply naturally in the user's latest language. Remember earlier preferences, constraints,
and the outfit under discussion. Answer the actual question, including short follow-ups.
Be concise, specific, and kind. Ask at most one clarifying question when essential.
For outfit requests, provide 1 complete outfit, or up to 3 only when alternatives are
requested. For explanations, greetings, or clarification, looks may be empty.
Do not force every answer into an outfit. Do not invent live weather, location, prices,
stock, brands, current trends, links, or claim to see the user or perform a personal
virtual try-on. Images are generated outfit illustrations. Do not claim to have searched
shops. Budget suggestions are estimates, never verified prices.
Return ONLY a JSON object, no markdown fences:
{"reply":"natural response (plain text, max 1600 characters)",
 "looks":[{"title":"short title","description":"why this outfit works",
 "items":[{"category":"Coat|Top|Pants|Skirt|Dress|Shoes|Bag|Accessory",
 "name":"concrete garment","color":"color","reason":"styling reason",
 "search_query":"short English color and garment phrase for image and shopping search"}]}],
 "followups":["up to 3 short messages the user could send next"]}
Each look has 2-6 items, at most one per category, and contains a complete wearable outfit.
Reflect all user constraints in BOTH reply and every item. Do not place skirts under Pants.
Use real garment descriptions, no HTML. Followups must be relevant, in the reply language.
The assistant's previous messages are structured JSON in this same format."""
ITEM_CONTEXT = """The user opened Style an item for a cream cropped collarless tweed
jacket with gold-tone buttons. This product description is provided by the application,
not from image recognition. Keep that jacket in every proposed outfit unless the user
explicitly replaces it. The user can ask for pants, shoes, color changes, or explanations."""


class ChatError(Exception):
    def __init__(self, message, status=502, code="model_error"):
        super().__init__(message)
        self.status, self.code = status, code


def text_field(value, limit, required=False):
    if not isinstance(value, str) or (required and not value.strip()):
        raise ChatError("模型返回的内容不完整，请重试。", code="invalid_response")
    return value.strip()[:limit]


def normalize_answer(raw):
    try:
        content = raw["choices"][0]["message"]["content"]
        value = json.loads(content)
        reply = text_field(value.get("reply"), 4000, True)
        looks, followups = value.get("looks", []), value.get("followups", [])
        if not isinstance(looks, list) or not isinstance(followups, list):
            raise ValueError("invalid lists")
        clean_looks = []
        for look in looks[:3]:
            items, seen = [], set()
            for item in look["items"][:6]:
                cat = item["category"]
                if cat not in CATEGORIES or cat in seen:
                    continue
                seen.add(cat)
                items.append({
                    "category": cat,
                    "name": text_field(item["name"], 100, True),
                    "color": text_field(item.get("color", ""), 80),
                    "reason": text_field(item.get("reason", ""), 300),
                    "search_query": text_field(item["search_query"], 180, True),
                })
            if len(items) < 2:
                raise ValueError("incomplete outfit")
            clean_looks.append({
                "title": text_field(look["title"], 120, True),
                "description": text_field(look["description"], 600, True),
                "items": items,
            })
        return {"reply": reply, "looks": clean_looks,
                "followups": [text_field(s, 100, True) for s in followups[:3]]}
    except (KeyError, IndexError, TypeError, ValueError, AttributeError):
        raise ChatError("模型未返回完整的搭配内容，请重试。", code="invalid_response") from None


def build_messages(payload):
    if not isinstance(payload, dict) or payload.get("mode") not in ("chat", "item"):
        raise ChatError("对话类型无效。", 400, "invalid_request")
    history = payload.get("messages")
    if not isinstance(history, list) or not 1 <= len(history) <= 17 or len(history) % 2 != 1:
        raise ChatError("对话记录格式无效，请重新提问。", 400, "invalid_request")
    clean = []
    for index, msg in enumerate(history):
        role = "user" if index % 2 == 0 else "assistant"
        limit = 2000 if role == "user" else 12000
        if (not isinstance(msg, dict) or msg.get("role") != role
                or not isinstance(msg.get("content"), str)
                or not msg["content"].strip() or len(msg["content"]) > limit):
            raise ChatError("消息过长或对话记录格式无效。", 400, "invalid_request")
        clean.append({"role": role, "content": msg["content"]})
    prompt = SYSTEM + ("\n" + ITEM_CONTEXT if payload["mode"] == "item" else "")
    return [{"role": "system", "content": prompt}] + clean


def invoke_model(messages):
    provider = os.getenv("FASHION_PROVIDER", "maas")
    body = {"messages": messages, "max_tokens": 2200,
            "response_format": {"type": "json_object"}}
    if provider == "maas":
        runner = shutil.which("lumen-ai-infra-maas-runner")
        if not runner:
            raise ChatError("模型服务尚未配置，请按启动说明安装并登录 MaaS Runner。",
                            503, "not_configured")
        # Private request file, never in the repository or a process argument.
        with tempfile.TemporaryDirectory(prefix="fashion-chat-") as folder:
            request_path = Path(folder) / "request.json"
            request_path.touch(mode=0o600)
            request_path.write_text(json.dumps(body, ensure_ascii=False), encoding="utf-8")
            try:
                result = subprocess.run([
                    runner, "--base-url",
                    os.getenv("FASHION_MAAS_BASE_URL", "https://ecom-ai-tools.tiktok-row.net"),
                    "--timeout", str(MODEL_TIMEOUT), "run",
                    os.getenv("FASHION_MODEL", "openai/gpt-5.6-luna"),
                    "--mode", "sync", "--req-json", "@" + str(request_path), "--json",
                ], capture_output=True, text=True, timeout=MODEL_TIMEOUT + 5)
            except subprocess.TimeoutExpired:
                raise ChatError("回复超时，请稍后重试。", 504, "timeout") from None
        if result.returncode:
            # Never expose runner diagnostics, SSO details, or provider response bodies.
            raise ChatError("模型暂时连接失败，请重试；持续失败时请检查 MaaS 登录状态。",
                            502, "provider_unavailable")
        try:
            raw = json.loads(result.stdout)
        except ValueError:
            raise ChatError("模型服务返回异常，请重试。") from None
    elif provider == "openai":
        key, model = os.getenv("FASHION_API_KEY"), os.getenv("FASHION_MODEL")
        base = os.getenv("FASHION_API_BASE", "https://api.openai.com/v1").rstrip("/")
        if not key or not model:
            raise ChatError("模型服务尚未配置。", 503, "not_configured")
        body["model"] = model
        request = urllib.request.Request(
            base + "/chat/completions", json.dumps(body).encode(),
            {"Content-Type": "application/json", "Authorization": "Bearer " + key})
        try:
            with urllib.request.urlopen(request, timeout=MODEL_TIMEOUT) as response:
                raw = json.load(response)
        except urllib.error.HTTPError as error:
            if error.code == 429:
                raise ChatError("模型服务繁忙或额度不足，请稍后重试。", 429, "rate_limited") from None
            raise ChatError("模型服务连接失败，请检查服务端配置。") from None
        except (urllib.error.URLError, TimeoutError, ValueError):
            raise ChatError("模型连接超时或返回异常，请重试。", 504, "timeout") from None
    else:
        raise ChatError("模型服务配置无效。", 503, "not_configured")
    return normalize_answer(raw)


class FashionServer(ThreadingHTTPServer):
    daemon_threads = True

    def __init__(self, address):
        super().__init__(address, Handler)
        self.session_token = secrets.token_urlsafe(32)
        self.slots = threading.BoundedSemaphore(3)
        port = self.server_port
        self.allowed_hosts = {f"localhost:{port}", f"127.0.0.1:{port}"}
        self.allowed_origins = {
            f"http://localhost:{port}", f"http://127.0.0.1:{port}",
            "http://localhost:8012", "http://127.0.0.1:8012",
            "https://coof-bao.github.io",
        }
        self.allowed_origins.update(filter(None, os.getenv("FASHION_ALLOWED_ORIGINS", "").split(",")))
        self.allowed_hosts.update(filter(None, os.getenv("FASHION_ALLOWED_HOSTS", "").split(",")))


class Handler(BaseHTTPRequestHandler):
    server_version = "FashionLab"

    def log_message(self, _format, *_args):
        pass  # Do not persist conversations, credentials, or request bodies.

    def setup(self):
        super().setup()
        self.connection.settimeout(MODEL_TIMEOUT + 15)

    def permitted(self):
        origin = self.headers.get("Origin")
        return (self.headers.get("Host") in self.server.allowed_hosts
                and (not origin or origin in self.server.allowed_origins))

    def reply(self, status, body, content_type="application/json; charset=utf-8"):
        data = json.dumps(body, ensure_ascii=False).encode() if isinstance(body, dict) else body
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        origin = self.headers.get("Origin")
        if origin in self.server.allowed_origins:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.end_headers()
        try:
            self.wfile.write(data)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_OPTIONS(self):
        if not self.permitted():
            return self.reply(403, {"error": "不允许的来源。"})
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", self.headers.get("Origin", ""))
        self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Fashion-Session")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        if not self.permitted():
            return self.reply(403, {"error": "不允许的来源。"})
        path = urlsplit(self.path).path
        if path == "/api/session":
            return self.reply(200, {"token": self.server.session_token})
        if path == "/api/health":
            return self.reply(200, {"ok": True, "service": "fashion-chat"})
        name = "index.html" if path in ("/", PREFIX, PREFIX + "index.html") else path.removeprefix(PREFIX).lstrip("/")
        types = {"index.html": "text/html; charset=utf-8", "home.css": "text/css",
                 "chat.css": "text/css", "chat.js": "text/javascript",
                 "api-config.js": "text/javascript"}
        if name not in types:
            return self.reply(404, {"error": "Not found"})
        return self.reply(200, (APP / name).read_bytes(), types[name])

    def do_POST(self):
        if not self.permitted() or not secrets.compare_digest(
                self.headers.get("X-Fashion-Session", ""), self.server.session_token):
            return self.reply(403, {"error": "会话已过期，请重试。", "code": "session_expired"})
        if urlsplit(self.path).path != "/api/chat":
            return self.reply(404, {"error": "Not found"})
        if self.headers.get("Content-Type", "").split(";")[0] != "application/json":
            return self.reply(415, {"error": "需要 JSON 消息。"})
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 0 < length <= MAX_BODY:
                return self.reply(413, {"error": "消息过长。"})
            messages = build_messages(json.loads(self.rfile.read(length)))
        except (ValueError, TimeoutError):
            return self.reply(400, {"error": "消息格式无效。"})
        except ChatError as error:
            return self.reply(error.status, {"error": str(error), "code": error.code})
        if not self.server.slots.acquire(blocking=False):
            return self.reply(429, {"error": "正在处理其他搭配，请稍后重试。", "code": "busy"})
        try:
            self.reply(200, invoke_model(messages))
        except ChatError as error:
            self.reply(error.status, {"error": str(error), "code": error.code})
        except Exception:
            self.reply(500, {"error": "对话服务暂时不可用，请重试。", "code": "server_error"})
        finally:
            self.server.slots.release()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=int(os.getenv("FASHION_PORT", "8790")))
    parser.add_argument("--open", action="store_true")
    args = parser.parse_args()
    try:
        server = FashionServer((args.host, args.port))
    except OSError:
        parser.exit(1, f"端口 {args.port} 不可用。可设置 FASHION_PORT=8791 后重新启动。\n")
    url = f"http://127.0.0.1:{server.server_port}{PREFIX}"
    print(f"Fashion Lab 真实对话已启动：{url}\n按 Ctrl+C 停止。", flush=True)
    if args.open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
