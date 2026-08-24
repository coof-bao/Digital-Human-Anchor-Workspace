<!-- DOC-CARD
类型：V3 Demo 真实样例 · 视频→Clip Bank 预解析产物
一句话：两条真实商品视频用 gemini-3-pro-preview-new 预解析成的结构化 clip JSON，供商家端/平台端 demo 直接引用（离线读 JSON，不实时调模型）。
何时读：开发 V3 demo 需要"真实视频→clip 解析"样例数据时；引用 Clip Bank / 素材库弹框 / Material Studio clip 详情。
口径：ASR / has_speech 本版为占位（基线规则 ASR 不走该 gemini 网关）；match_score 为模型对"主推商品相关度"的估计（非真实近30天动销集比对）。
-->

# V3 Demo 样例 · 视频 → Clip Bank 预解析产物

两条**真实商品视频**经 `gemini-3-pro-preview-new`（AIDP ModelHub 内网）预解析出的结构化 clip，**供 V3 demo 直接 fetch 引用**，演示"素材 → 平台分镜/画面理解/打标 → Clip Bank"链路，无需 demo 运行时实时调模型。

## 〇、样例商家（`shop_profile.json`）

两份样例素材均归属同一个 demo 商家（平台端 Material Studio「商家维度」筛选字段）：

| 字段 | 值 |
|---|---|
| `shop_id` | `7494386460125857294` |
| `shop_name` | coco shop |
| `handle`（开播账号） | 7colorsbunny |
| `author_id`（TT handle id） | `7341325938133500970` |
| `fans` / `live_count_30d` | 待补（占位） |

> 同一份商家信息已写进两份 `*.clips.json` 的 `asset.merchant`，demo 可演示"按商家筛素材 → 看该商家的 clip"。

## 一、样例清单

| 文件 | 对应商家端入口 | 源视频 | 时长 | 解析 clip 数 |
|---|---|---|---|---|
| `method1_background_57s.clips.json` | **方式1 · Background**（选数字人时的背景视频，`source=method1_background`，layer 默认 background） | `商家配置数字人V3版本/background短视频_勺取深红珠装盒_A1-A8紫底_57s.mp4` | 57s | 7 |
| `method2_uyv_29s.clips.json` | **方式2 · Use your video**（前景素材，`source=method2_use_your_video`，layer 默认 foreground） | `商家配置数字人V3版本/user your video短视频_手持桃黄混珠小盒_A1-A7_29s.mp4` | 29s | 3 |

- `frames/<video>/f_NNN.jpg`：1fps 抽帧（480px 宽），既是解析输入、也是每个 clip 的**缩略图**（clip JSON 里 `thumbnail` 字段引用中间帧）。
- `parse_clips.py`：复跑脚本（需 `source ~/.config/gemini-modelhub/{env,models.env}` + 办公网/VPN）。

## 二、字段 schema（对齐《V3平台端内部工作台页面级方案》§2 Clip 字段）

`asset`（素材级）：`source / original_filename / duration_sec / format / has_speech(占位) / frame_sample_fps / parsed_by / method`
`clips[]`（片段级）：
- `clip_index / start_sec / end_sec`：分镜起止（"镜头边界检测候选 + 语义聚合"切分）
- `clip_type`：`strong`(强可用) / `bg`(背景氛围) / `risk`(风险不可用)
- `visual` / `visual_zh`：画面理解描述（中英）
- `tags`：品类/卖点/场景标签
- `recommend_use` + `recommend_reason`：建议 layer（background/foreground/none）
- `visual_layer`：底层渲染字段（与商家端"三层"对应，商家端不暴露）
- `match_score`：0–100，对主推商品的相关度（**本样例＝模型估计**，非真实近30天动销集比对）
- `highlight`：是否强卖点高光片段
- `thumbnail`：缩略图帧路径
- `asr` / `asr_lang` / `asr_status`：**占位**（本版不做 ASR）。`asr_lang`＝口播语言 `en`/`es`，真实链路由 ASR 识别后**与商家端 Step1 `Market/Language`（`shared_context.language`）做一致性校验**，不一致标 `lang_mismatch`

## 三、Demo 怎么用

1. **平台端 Material Studio · clip 详情抽屉**：直接渲染 `clips[]`（缩略图 + clip_type 色 + match_score meter + tags + recommend_use）。
2. **商家端 §5 素材库弹框 · Tab② Clips**：把 `clip_type!=risk` 的 clip 作为可选卡片（缩略图 + 时长 + 推荐用途 + 匹配度）。
3. **采纳门控**：demo 可演示"运营采纳后才回填商家端"——`risk` 片段（如 method1 clip#7 模糊结尾）默认不采纳。

## 四、已知占位 / 后续

- ⚠️ `has_speech` / `asr` / `asr_lang` 为占位：ASR 不走该 gemini 网关（基线规则），后续接独立 ASR 通道再补（`asr_lang` 届时回填 en/es 并做语言一致性校验）。
- ⚠️ `match_score` 为模型估计：真实链路应对"该商家近30天动销商品全集"逐 clip 比对。
- 分镜方式：因源视频为柔切连续运镜（ffmpeg 直方图无硬切点），改用 **1fps 抽帧 → gemini 镜头/语义切分**，与方案"镜头边界检测 + 语义聚合"白盒原理一致。
