# V3 AI LIVE 产品演示 Demo · 研发包

可点击的前端原型，用于对齐 V3 商家端 / 平台端页面方案、数据契约与演示动线。**纯静态 HTML + JS + mock 数据**，无需后端部署、VPN 或内网凭证。

## 环境要求

| 项 | 要求 |
|---|---|
| Python | 3.x（macOS 自带即可） |
| 浏览器 | Chrome / Safari / Edge 等现代浏览器 |
| 网络 | 本地 `localhost` 即可；**不需要** VPN / 内网 AK |

## 安装

```bash
unzip v3-ai-live-product-demo.zip
cd v3-ai-live-product-demo   # 解压后的目录名以实际 zip 为准
```

若从本仓库直接使用，进入 `V3最终版本方案讨论-FINAL/` 目录即可。

## 启动

```bash
bash start_demo.sh
```

macOS 也可双击 `start_demo.command`。

脚本会：

1. 检测 `python3`
2. 从端口 `8012` 起找可用端口（被占用则递增）
3. 以**本目录为根**启动 `python3 -m http.server`
4. 自动打开浏览器到 Demo 落地页

指定端口：

```bash
PORT=8013 bash start_demo.sh
```

停止服务：在启动脚本的终端按 `Ctrl+C`，或执行 `kill $(cat .demo_server.pid 2>/dev/null)`。

## 入口一览

| 页面 | 路径 | 说明 |
|------|------|------|
| 落地页 | `/demo/index.html` | 5 句 pitch + 选商家端 / 平台端 |
| 商家端 | `/demo/seller/index.html` | V2 五步向导 + 双模式 + 智能剧本 Storyboard |
| 平台端 | `/demo/platform/index.html` | Material / Script / 监控看板 / Workflow |
| 方案阅读版 | `/docs/V3页面级方案-阅读版.html` | 完整方案（含批注层） |
| 商家端方案 md | `/docs/V3商家端页面级方案（基于V2链路迭代）.md` | 页面级 PRD |
| 平台端方案 md | `/docs/V3平台端内部工作台页面级方案.md` | 页面级 PRD |
| 算法对齐稿 | `/docs/脚本生产与测评Pipeline-算法研发对齐稿.html` | 平台端 iframe 挂载 |

默认地址示例：`http://localhost:8012/demo/index.html`

## 3 分钟演示动线

**商家端**

1. 落地页 → 进入商家端
2. Step1：选数字人形象 + Market/Language
3. Step2：选品（coco shop 盲盒商品）
4. 双模式：模式一（数字人背景）或模式二（Use your video）
5. 模式二：进入 Storyboard，查看 9:16 多轨时间轴实时合成

**平台端**

1. Material Studio：按商品维度看 clip 详情（缩略图、match_score、推荐用途）
2. Script Studio：6 轨时间轴 + 渲染契约
3. AI LIVE 直播监控看板：分钟级归因示例
4. 脚本优化生产 & 测评：iframe 加载算法对齐稿

## 数据说明

- 全部为**前端 mock + 预解析 JSON**，非生产 API
- Clip Bank 样例：`demo-assets/clip-bank-samples/`（真实视频经 gemini 预解析的结构化 JSON + 抽帧缩略图）
- 商品图：`demo-assets/products/`
- 数字人形象：`demo-assets/avatars/`（Demo 用到的 8 张）
- **可选 AI 代理**：`tools/video_parse_proxy.py` + `tools/start_parse_proxy.sh`（8789）
  - 视频上传解析 → Gemini ModelHub
  - 话术生成 / 重新生成 → GPT-5.5（Aicolate）
  - 译成中文参考 → GPT-5.5 fast 模式
  - 需办公网/VPN + 本机 `~/.config/gemini-modelhub` 与 `~/.config/aicolate` 凭证；无凭证时 Demo 仍可用预置数据 + 本地话术兜底

## 目录结构

```
.
├── README.md / PREVIEW.md
├── start_demo.sh / start_demo.command / pack_for_rd.sh
├── demo/                    # 可点击页面
├── demo-assets/             # 样例资产（avatars / clip-bank / products）
├── tools/                   # 可选：video_parse_proxy + 启动脚本
└── docs/                    # 方案文档
```

## 常见问题

**形象图或 clip 缩略图破图**

- 必须从包根目录起 HTTP 服务，不要用 `file://` 直接打开 HTML

**端口被占用**

```bash
PORT=8013 bash start_demo.sh
```

**平台端「脚本优化生产 & 测评」iframe 空白**

- 确认 `docs/脚本生产与测评Pipeline-算法研发对齐稿.html` 存在
- 确认通过 `http://localhost:PORT/...` 访问，而非本地文件路径

## 产品侧重新打包

在本目录执行：

```bash
bash pack_for_rd.sh
```

产出：

- 包内：`v3-ai-live-product-demo.zip`
- 桌面副本：`~/Desktop/AI-LIVE-V3-Demo-商家端+平台端.zip`（方便直接发给设计师/研发）

解压后先看 **`PREVIEW.md`**（30 秒启动 + 双端入口），完整说明见 **`README.md`**。
