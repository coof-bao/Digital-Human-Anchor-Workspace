# AI LIVE V3 Demo · 设计师 & 研发预览包

> 商家端 + 平台端可点击原型 · 纯静态 · 无需 VPN / 内网凭证

## 30 秒启动

```bash
unzip AI-LIVE-V3-Demo-商家端+平台端.zip
cd v3-ai-live-product-demo   # 解压目录名以实际为准
bash start_demo.sh
```

浏览器会自动打开落地页。若未自动打开，访问终端里打印的 `http://localhost:8012/demo/index.html`。

macOS 可双击 `start_demo.command`。

## 入口（对齐用）

| 角色 | 入口 | 路径 |
|------|------|------|
| 所有人 | 落地页 | `/demo/index.html` |
| 设计师 / 商家 PM | **商家端** | `/demo/seller/index.html` |
| 研发 / 运营 / 算法 | **平台端** | `/demo/platform/index.html` |
| 方案评审（可批注） | 阅读版 | `/docs/V3页面级方案-阅读版.html` |

## 近期 Demo 能力（2026-06）

**商家端**

- V2 五步向导 + 双模式（分步引导 / 智能剧本）
- My assets：我的片段 · 整段视频 · 上传（整段使用 / 解析成片段）
- Build：卖点可编辑 · 预览拖拽布局 · 话术 **GPT-5.5 真生成**（生成/重新生成/方式2 自动出稿）
- 「译成中文参考」：fast 翻译 + 生成后后台预译缓存
- 片段详情「反馈给平台」+ 仍可用到 Scene

**平台端 · Material Studio**

- 商品 → clips 树 · 双搜索 · clip 改归属 · 批量采纳 strong
- 顶部 **整店素材** scope · ① 店铺维度 · ② 整体解析 · ③ 商品 clips · ④ Pipeline

## 可选：完整 AI 能力（研发/有内网凭证）

静态 Demo 主线**不需要** VPN。若要体验上传解析 / 话术 GPT-5.5 / 中文翻译：

```bash
# 终端 1：Demo 页面
bash start_demo.sh

# 终端 2：本地代理（需 source gemini-modelhub + aicolate 凭证，办公网/VPN）
bash tools/start_parse_proxy.sh
```

代理地址 `localhost:8789`：`/parse-video` · `/generate-script` · `/translate-script`

## 注意

1. **必须用 HTTP 起服务**，不要用 `file://` 直接打开 HTML（否则图片/iframe 会破）
2. 无代理时：预置 Clip Bank 可完整演示；话术会降级为本地演示稿（有黄色提示）
3. 端口占用时：`PORT=8013 bash start_demo.sh`

## 方案文档（包内）

- `docs/V3商家端页面级方案（基于V2链路迭代）.md`
- `docs/V3平台端内部工作台页面级方案.md`
- `docs/脚本生产与测评Pipeline-算法研发对齐稿.html`

完整说明见 `README.md`。
