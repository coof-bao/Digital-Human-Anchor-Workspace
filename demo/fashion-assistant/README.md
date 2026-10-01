# Fashion Lab 真实对话

在原有首页点击 OOTD、问答输入框或 Style an item 后，调用真实模型回复。
日常穿搭与单品问答分别保留上下文；支持继续追问、等待提示、停止等待和失败重试。
模型输出的搭配可点击进入原有预览页，查看单品与搭配理由。

## 本地运行

需要 Python 3.9+。本机已验证的默认模型为 MaaS `openai/gpt-5.6-luna`，
通过已登录的 `lumen-ai-infra-maas-runner` 调用，不向前端暴露凭证。

在项目根目录执行：

```bash
bash start_fashion_assistant.sh
```

macOS 也可双击根目录 `start_fashion_assistant.command`。
服务运行在前台，自动打开 http://127.0.0.1:8790/demo/fashion-assistant/ 。
保持终端开启，按 Ctrl+C 停止。端口占用时：

```bash
FASHION_PORT=8791 bash start_fashion_assistant.sh
```

其他具备 MaaS 权限的机器首次使用：

```bash
npm install -g --registry https://bnpm.byted.org @gec-lumen/lumen-ai-infra-maas-runner
lumen-ai-infra-maas-runner auth login --site i18n-tt
```

也支持 OpenAI 兼容服务。在服务端环境中设置以下变量后启动，密钥不写入仓库：

| 变量 | 用途 |
|---|---|
| `FASHION_PROVIDER` | `maas`（默认）或 `openai` |
| `FASHION_MODEL` | MaaS 默认 `openai/gpt-5.6-luna`；OpenAI 模式必须配置实际模型 |
| `FASHION_API_KEY` | OpenAI 兼容服务密钥，仅服务端读取 |
| `FASHION_API_BASE` | OpenAI API base，默认 `https://api.openai.com/v1` |
| `FASHION_MAAS_BASE_URL` | 默认用户机器 ROW 地址 |
| `FASHION_PORT` | 默认 `8790` |

## 页面与部署

- 原有 `start_demo.sh` 只启动静态页面；真实对话使用上面的专用启动脚本。
- GitHub Pages 只能托管前端，不能执行 Python 或安全保存模型密钥。目前没有部署公网模型后端。
- Pages 版本默认尝试连接访问者电脑上的 `127.0.0.1:8790`。本机服务运行时可用，但浏览器可能限制公网页面访问本地网络；直接打开本地地址更可靠。
- 要让其他用户直接在线对话，需要部署独立 HTTPS 后端，或将页面与后端部署在同一服务。将 `api-config.js` 的 `window.FASHION_API_BASE` 设为该服务地址。
- `fashion_chat_server.py` 默认只监听本机。对外部署时需要在反向代理或托管平台提供用户认证、HTTPS、请求限流与额度控制；应用 session token 仅用于本地请求校验，不是用户认证。不要将个人 SSO 本地服务通过隧道直接公开。
- 反向代理需透传准确 Host；通过 `FASHION_ALLOWED_HOSTS` / `FASHION_ALLOWED_ORIGINS` 配置外部域名，多个值用逗号分隔。

## 行为边界

- 同一对话保留首轮偏好和最近七轮交流；返回上页保留对话，刷新页面清空。
- OOTD 每次从首页新提问会开始新对话；Style an item 再次打开继续原会话。
- 单品入口目前围绕页面展示的奶油色短款粗花呢外套，不包含上传图片识别。
- 回复由真实模型生成，不用固定答案兜底。通常需要十几秒到数十秒；超时、服务断开、无效回复会明确提示并可重试。
- “停止等待”中止浏览器请求并丢弃迟到回复，不保证上游模型停止推理或计费。
- 图片通过既有图像生成接口按新搭配生成，属于搭配示意，不是用户本人试穿。
- 模型生成的单品不显示虚构价格；Find similar 打开商品搜索，不代表已接入商品库存。
- 不获取实时天气；不会将预设天气当作实时信息。语音输入依赖浏览器支持。
- 对话仅驻留于浏览器内存及请求处理过程，本地服务不记录正文；请求会发送至配置的模型服务。

## 接口

`GET /api/session` 获取临时应用 session，随后调用 `POST /api/chat`：

```json
{
  "mode": "chat",
  "messages": [
    {"role": "user", "content": "周末去美术馆，不穿裙子和高跟鞋，推荐一套穿搭"}
  ]
}
```

请求头：`Content-Type: application/json`、`X-Fashion-Session: <session token>`。
`mode` 为 `chat` 或 `item`，历史记录按 user / assistant 交替，最后为 user。
返回 `reply`、`looks`、`followups`；assistant 历史内容使用该结果的 JSON 字符串，
让后续追问可以引用具体单品。`GET /api/health` 仅检查本地服务存活，不触发模型计费。
