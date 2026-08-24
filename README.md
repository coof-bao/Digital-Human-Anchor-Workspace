# AI LIVE 数字人直播工作台 Demo

面向商家端与平台端的 AI 数字人直播产品原型，展示从商家配置、素材解析、智能剧本生成到直播归因优化的完整链路。

项目为纯静态前端 Demo，使用 HTML、CSS、JavaScript 与本地 mock 数据实现，可直接通过 GitHub Pages 或本地 HTTP 服务访问。

在线访问：https://coof-bao.github.io/ai-live-product-demo/

## 项目简介

AI LIVE 的核心目标，是将数字人直播从“会念稿的虚拟主播”升级为“可基于商品、素材与直播反馈持续迭代的 AI 直播工作台”。

本 Demo 分为两个视角：

| 视角 | 定位 | 核心用户 |
|---|---|---|
| 商家端 Seller Workbench | 低门槛完成数字人直播配置与脚本确认 | 商家、运营 |
| 平台端 Internal Workbench | 管理素材解析、脚本生产、直播监控与优化闭环 | 产品、运营、算法、研发 |

## 核心功能

### 1. 商家端直播配置

- 数字人形象选择
- Market / Language 配置
- 商品选择与卖点查看
- 两种直播创建模式：
  - 数字人背景模式
  - Use your video 智能剧本模式
- Storyboard 视图展示 9:16 直播画面、多轨时间轴与脚本编排
- 支持脚本保存、片段查看、中文参考翻译等演示交互

### 2. 平台端素材与脚本工作台

- Material Studio：按商品查看素材源、解析进度与 Clip Bank
- Clip 详情抽屉：展示缩略图、ASR、match score、推荐用途与采纳动作
- Script Studio：展示直播大脑 JSON、多轨脚本与渲染契约
- AI LIVE 直播监控看板：展示分钟级归因、异常诊断与优化建议
- 脚本优化生产与测评：挂载算法对齐稿，呈现 prompt 优化与测评链路

### 3. 数据与资产

- 前端 mock 数据集中在 `demo/shared/data.js`
- 商品图位于 `demo-assets/products/`
- 数字人形象位于 `demo-assets/avatars/`
- Clip Bank 样例位于 `demo-assets/clip-bank-samples/`
- 方案文档位于 `docs/`

## 使用方法

### 在线访问

直接打开 GitHub Pages：

```text
https://coof-bao.github.io/ai-live-product-demo/
```

### 本地启动

进入项目根目录后执行：

```bash
bash start_demo.sh
```

脚本会从端口 `8012` 开始寻找可用端口，并自动打开浏览器。

指定端口：

```bash
PORT=8013 bash start_demo.sh
```

停止服务：

```bash
kill $(cat .demo_server.pid 2>/dev/null)
```

也可以在启动服务的终端中按 `Ctrl+C`。

### 页面入口

| 页面 | 路径 | 说明 |
|---|---|---|
| Demo 入口 | `/demo/index.html` | 商家端与平台端入口 |
| 商家端 | `/demo/seller/index.html` | 数字人直播创建流程 |
| 平台端 | `/demo/platform/index.html` | 素材、脚本、归因与测评工作台 |
| 方案阅读版 | `/docs/V3页面级方案-阅读版.html` | 完整方案阅读页 |
| 算法对齐稿 | `/docs/脚本生产与测评Pipeline-算法研发对齐稿.html` | 脚本生产与测评说明 |

## 项目结构

```text
.
├── demo/                    # 可点击前端页面
│   ├── index.html            # Demo 入口
│   ├── seller/               # 商家端页面
│   ├── platform/             # 平台端页面
│   └── shared/               # 公共样式、数据与交互逻辑
├── demo-assets/              # 商品图、数字人形象、Clip Bank 样例
├── docs/                     # 产品方案与算法对齐文档
├── tools/                    # 可选本地 AI 代理脚本
├── index.html                # GitHub Pages 根入口跳转
├── start_demo.sh             # 本地启动脚本
└── pack_for_rd.sh            # 打包脚本
```

## 运行说明

- 推荐通过 HTTP 服务访问，不建议用 `file://` 直接打开 HTML，否则部分相对路径和 iframe 可能不可用。
- Demo 默认使用本地 mock 与预解析数据，不依赖后端服务。
- `tools/video_parse_proxy.py` 为可选代理，仅用于连接内部模型服务；没有凭证时不影响基础 Demo 体验。
