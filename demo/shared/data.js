/* =====================================================================
   Demo mock data — 引用 demo-assets/ 真实样例（gemini-3-pro-preview-new 解析）
   路径相对 seller/ 与 platform/ 页面（同深度）。落地页不渲染图片。
   ===================================================================== */
window.DEMO = (function () {
  const ASSET = window.ASSET_PREFIX || "../../demo-assets/clip-bank-samples";
  const AVA   = window.AVATAR_PREFIX || "../../demo-assets/avatars";

  // ---------- 商家信息（真实 shop_profile） ----------
  const SHOP = {
    shop_id: "7494386460125857294",
    shop_name: "coco shop",
    handle: "7colorsbunny",
    author_id: "7341325938133500970",
  };

  // ---------- 数字人画廊（真实形象图 + 出厂人格卡：性格/口音语速/人设描述/品类定位） ----------
  const AVATARS = [
    { id:"0001", name:"Emma Carter", zh:"艾玛·卡特", eth:"主流美式", tagline:"邻家姐姐 · 治愈陪伴", langs:["en"], voice:["cheerful","bright"],
      persona:"温柔治愈型", accent:"标准美音 · 语速适中", rate:"1.0x",
      desc:"邻家姐姐感的主播，说话轻柔不吵闹，擅长把潮玩/盲盒讲成「陪伴感」故事，适合治愈系、女性向选品。",
      cat:["潮玩盲盒","美妆护肤","母婴"], file:"0001 - Emma Carter - 艾玛·卡特 - 主流美式 - 邻家姐姐 美妆护肤.jpg" },
    { id:"0002", name:"Camila Reyes", zh:"卡米拉·雷耶斯", eth:"拉丁裔", tagline:"闺蜜风 · 高能种草", langs:["en","es"], voice:["warm","friendly"],
      persona:"热情闺蜜型", accent:"美音/西语双语 · 语速偏快", rate:"1.05x",
      desc:"闺蜜带逛风，情绪饱满、互动密，最会用「你也想要吧」式种草，适合潮玩、彩妆、快时尚。双语可服务拉丁裔人群。",
      cat:["潮玩盲盒","彩妆","快时尚"], file:"0002 - Camila Reyes - 卡米拉·雷耶斯 - 拉丁裔 - 闺蜜风 彩妆.jpg" },
    { id:"0003", name:"Jasmine Powell", zh:"茉莉·鲍威尔", eth:"非裔", tagline:"都市潮酷 · 收藏控", langs:["en"], voice:["confident","cool"],
      persona:"自信潮酷型", accent:"都市美音 · 语速明快", rate:"1.0x",
      desc:"都市潮人设定，自信直接、品味在线，讲「成套收藏/限量」最有说服力，适合潮玩、护肤美甲、配饰。",
      cat:["潮玩盲盒","护肤美甲","配饰"], file:"0003 - Jasmine Powell - 茉莉·鲍威尔 - 非裔 - 都市潮酷 护肤美甲.jpg" },
    { id:"0004", name:"Mia Novak", zh:"米娅·诺瓦克", eth:"东欧裔", tagline:"青春活力 · 开箱惊喜", langs:["en"], voice:["energetic","lively"],
      persona:"元气活力型", accent:"轻欧美音 · 语速偏快", rate:"1.1x",
      desc:"元气少女感，节奏快、惊喜感强，开盲盒「哇」式反应自然，适合潮玩开箱、快时尚、学生向品类。",
      cat:["潮玩盲盒","快时尚","学生好物"], file:"0004 - Mia Novak - 米娅·诺瓦克 - 东欧裔 - 青春活力 快时尚.jpg" },
    { id:"0010", name:"Madison Cole", zh:"麦迪逊·科尔", eth:"主流美式", tagline:"健身辣妹 · 干脆利落", langs:["en"], voice:["upbeat","sporty"],
      persona:"阳光运动型", accent:"标准美音 · 语速明快", rate:"1.05x",
      desc:"阳光直爽、节奏紧凑，催单干脆不墨迹，适合 Athleisure、运动周边，也能 hold 住快节奏潮玩促销。",
      cat:["运动健身","潮玩盲盒","快消"], file:"0010 - Madison Cole - 麦迪逊·科尔 - 主流美式 - 健身辣妹 Athleisure.jpg" },
    { id:"0015", name:"Diego Morales", zh:"迭戈·莫拉莱斯", eth:"拉丁裔", tagline:"稳重大哥 · 信任感", langs:["en","es"], voice:["deep","steady"],
      persona:"沉稳可靠型", accent:"低沉美音/西语 · 语速沉稳", rate:"0.95x",
      desc:"低音稳重、值得信赖，讲质量/保障最有分量，适合户外、3C、家居；双语覆盖拉丁裔男性受众。",
      cat:["户外","3C数码","家居"], file:"0015 - Diego Morales - 迭戈·莫拉莱斯 - 拉丁裔 - 健身大哥 户外.jpg" },
    { id:"0017", name:"Connor O'Brien", zh:"康纳·奥布莱恩", eth:"爱尔兰裔", tagline:"邻家哥哥 · 暖心讲解", langs:["en"], voice:["warm","calm"],
      persona:"温和暖男型", accent:"轻爱尔兰口音 · 语速舒缓", rate:"0.95x",
      desc:"温和耐心、讲解细致，适合家居、生活方式类慢节奏讲解，也能把潮玩讲出「礼物感」。",
      cat:["家居","生活方式","礼品"], file:"0017 - Connor OBrien - 康纳·奥布莱恩 - 爱尔兰裔 - 邻家哥哥 家居.jpg" },
    { id:"0018", name:"Tyler Brooks", zh:"泰勒·布鲁克斯", eth:"主流美式", tagline:"校园风 · 玩梗带节奏", langs:["en"], voice:["youthful","fun"],
      persona:"幽默校园型", accent:"年轻美音 · 语速快", rate:"1.1x",
      desc:"年轻爱玩梗、弹幕互动强，适合潮流、潮玩、学生向；靠玩梗和「今日份惊喜」拉停留。",
      cat:["潮玩盲盒","潮流","学生好物"], file:"0018 - Tyler Brooks - 泰勒·布鲁克斯 - 主流美式 - 校园风 潮流.jpg" },
  ];
  const avatarImg = (a) => `${AVA}/${a.file}`;

  // ---------- 选品（coco shop · 虚拟玩偶 / 盲盒潮玩，真实商品 from 虚拟IP直播项目策划方案.xlsx） ----------
  const PROD = window.PRODUCT_PREFIX || "../../demo-assets/products";
  const PRODUCTS = [
    { id:"1732323410271768766", name:"Gismow Little Bean-Bag-League Vinyl Face Plush Toy Blind Box", ip:"Gismow 小憨包", price:"$14.99", img:`${PROD}/gismow-beanbag.jpeg`, stock:680, soldsale:true,
      cat:"Toys & Hobbies / Stuffed Toys", points:["治愈系陪伴感","暹罗猫灵感·辨识度高","表情安静不吵闹","适合压力大时入手"],
      story:"Gismow 是设计师打造的「奇幻小生物宇宙」，灵感源自暹罗猫并融合多种动物特质——圆脸大眼、毛茸茸、很乖，放一堆潮玩里也认得出。" },
    { id:"1732348610950435006", name:"Gismow Fantasy Forest Friends Vinyl Face Plush Toy Blind Box", ip:"Gismow 奇幻森友", price:"$15.99", img:`${PROD}/gismow-forest.jpeg`, stock:540, soldsale:true,
      cat:"Toys & Hobbies / Stuffed Toys", points:["每只造型表情不同","手感Q弹·耳朵刺绣·背部翅膀","越看越耐看","可挂包做饰品/陪伴宠物"],
      story:"森友系列每款灵感取自不同植物与动物，外形可爱手感Q弹，耳朵有刺绣、背部有翅膀，适合放桌面、挂包，也是有个性的陪伴小宠物。" },
    { id:"1732348677774282942", name:"Tarti Ghost in Hotel Desk Decoration Blind Box", ip:"Tarti 幽灵旅馆", price:"$16.99", img:`${PROD}/tarti-ghost.jpeg`, stock:300, soldsale:true,
      cat:"Toys & Hobbies / Action Figures", points:["暗黑叙事·9款角色剧情","桌面摆件·氛围感强","收藏向·剧情解谜","透明首图·画风高级"],
      story:"幽灵旅馆里住着渡鸦、红酒晚宴、恶魔之友、学者烛光等 9 位角色，每只都有自己的暗黑小故事，是适合桌面摆放的剧情向收藏盲盒。" },
    { id:"1732350078065021118", name:"Calor Girl Desk Decoration Blind Box, Bag Accessory", ip:"Calor 卡路里女孩", price:"$13.99", img:`${PROD}/calor-girl.jpeg`, stock:460, soldsale:true,
      cat:"Toys & Hobbies / Action Figures", points:["甜品×女孩主题","马卡龙配色·拍照好看","成套甜点人设·收集感强","女生共鸣度高"],
      story:"把「卡路里焦虑」变成可爱角色的甜品女孩系列：每只是不同甜点人设，配色高级、拍照好看，越怕胖越想买，女生一看就会点头。" },
    { id:"1732348897347932350", name:"Calor Angel's Kitchen Plush Toy Blind Box, Pendant", ip:"Calor 天使厨房", price:"$13.99", img:`${PROD}/calor-kitchen.jpeg`, stock:520, soldsale:false,
      cat:"Toys & Hobbies / Stuffed Toys", points:["甜美呆萌·治愈","把甜蜜/四季/回忆烹成食物","可做挂件装饰","礼品场景适用"],
      story:"天使厨房把世间的甜蜜、四季、天气、快乐、回忆与梦烹饪成不寻常的食物，甜美呆萌、治愈柔软，适合自留也适合送礼。" },
  ];

  // ---------- Clip Bank（真实解析结果，缩略图为真实帧） ----------
  // 字段对齐 商家配置数字人V3版本/直播脚本生成流程Demo.html：
  // id/type/title/source_index/start_time_sec/duration_sec/visual_content/asr_content/selling_point/layer/relevance/product_match_score/match_reason
  const SP_MAP = { strong:"对应卖点", bg:"泛展示", risk:"不推荐" };
  const REASON = {
    strong:"画面直接展示核心卖点/动作，能作为强购买理由证据，建议前景重点呈现。",
    bg:"与商品/场景相关但非强购买理由，适合做背景、转场、氛围铺垫。",
    risk:"画面模糊/手挡镜头/无法识别，存在不可用风险，建议剔除。",
  };
  // 视频规格（商家端片段预览 / 平台端 clip 详情展示；样例统一竖屏 9:16）
  const SPEC = { resolution: "1080×1920", fps: 30, codec: "H.264" };
  const withThumb = (c, srcIdx, bank) => {
    const rawDur = Math.max(0, c.end - c.start);
    const duration_sec = c.clip_type === "risk" ? rawDur : Math.max(30, rawDur);
    const pid = bank.product_id || "1732323410271768766";
    return {
    ...c,
    thumbUrl: `${ASSET}/${c.thumbnail}`,
    clip_id: `clip_${String(c.clip_index).padStart(3,"0")}`,
    product_id: c.product_id || pid,
    source_index: srcIdx,
    start_time_sec: c.start,
    duration_sec,
    visual_content: c.visual_zh,
    asr_content: c.asr_lang ? "" : "（无人声）",
    selling_point: SP_MAP[c.clip_type] || "泛展示",
    relevance: +(c.match_score / 100).toFixed(2),
    product_match_score: +(c.match_score / 100).toFixed(2),
    match_reason: REASON[c.clip_type] || "",
    clip_source: bank.src_kind,
    clip_source_label: bank.src_label,
    // 视频规格 + 来源（来源用于平台端 clip 详情下沉展示）
    resolution: SPEC.resolution, fps: SPEC.fps, codec: SPEC.codec,
    size_mb: +((duration_sec * 3.2)).toFixed(1),   // 估算：~3.2MB/s（demo 占位）
  };};

  const CLIPS_M1 = { // 方式1 background 57s（7 clips）
    source:"method1_background", original:"background短视频_勺取深红珠装盒_A1-A8紫底_57s.mp4",
    src_kind:"local_upload", src_label:"商家本地上传", src_icon:"⬆️",
    product_id:"1732323410271768766",
    duration:57, parsed_by:"gemini-3-pro-preview-new", shot_count:7,
    main:"Custom Bead Mix / 'Bead Scoop' Service", main_zh:"定制珠子混合/挖珠服务",
    clips:[
      {clip_index:1,start:0,end:2,clip_type:"bg",visual_zh:"广角展示多盒彩色珠子",tags:["beads","variety"],recommend_use:"background",match_score:80,highlight:false,thumbnail:"frames/method1_background_57s/f_002.jpg",asr_lang:null,visual_layer:"background"},
      {clip_index:2,start:3,end:9,clip_type:"bg",visual_zh:"举起空的透明分装盒",tags:["packaging","setup"],recommend_use:"background",match_score:60,highlight:false,thumbnail:"frames/method1_background_57s/f_007.jpg",asr_lang:null,visual_layer:"background"},
      {clip_index:3,start:10,end:24,clip_type:"strong",visual_zh:"从A5舀深红珠倒入隔间并展示（核心动作）",tags:["bead scoop","ASMR","order filling"],recommend_use:"foreground",match_score:95,highlight:true,thumbnail:"frames/method1_background_57s/f_018.jpg",asr_lang:null,visual_layer:"foreground"},
      {clip_index:4,start:25,end:36,clip_type:"strong",visual_zh:"再加一勺红珠装满并展示",tags:["bead scoop","topping up"],recommend_use:"foreground",match_score:85,highlight:false,thumbnail:"frames/method1_background_57s/f_031.jpg",asr_lang:null,visual_layer:"foreground"},
      {clip_index:5,start:37,end:50,clip_type:"strong",visual_zh:"第二隔间装入A2彩色混珠展示",tags:["bead mix","customization"],recommend_use:"foreground",match_score:95,highlight:true,thumbnail:"frames/method1_background_57s/f_044.jpg",asr_lang:null,visual_layer:"foreground"},
      {clip_index:6,start:51,end:54,clip_type:"strong",visual_zh:"两盒成品并排对比（极佳收尾）",tags:["comparison","reveal"],recommend_use:"foreground",match_score:100,highlight:true,thumbnail:"frames/method1_background_57s/f_053.jpg",asr_lang:null,visual_layer:"foreground"},
      {clip_index:7,start:55,end:56,clip_type:"risk",visual_zh:"结尾画面模糊、手挡镜头（不可用）",tags:["blurry","obstructed"],recommend_use:"none",match_score:0,highlight:false,thumbnail:"frames/method1_background_57s/f_056.jpg",asr_lang:null,visual_layer:"none"},
    ].map(c=>withThumb(c,0, { src_kind:"local_upload", src_label:"本地上传", product_id:"1732323410271768766" })),
  };

  const CLIPS_M2 = { // 方式2 Use your video 29s（3 clips）
    source:"method2_use_your_video", original:"user your video短视频_手持桃黄混珠小盒_A1-A7_29s.mp4",
    src_kind:"tiktok_post", src_label:"已发布视频", src_icon:"🔗",
    product_id:"1732323410271768766",
    duration:29, parsed_by:"gemini-3-pro-preview-new", shot_count:3,
    main:"DIY bead kit with storage box", main_zh:"DIY串珠套装（含收纳盒）",
    clips:[
      {clip_index:1,start:0,end:4,clip_type:"strong",visual_zh:"彩珠背景前展示空的多格收纳盒",tags:["storage box","intro"],recommend_use:"foreground",match_score:85,highlight:false,thumbnail:"frames/method2_uyv_29s/f_003.jpg",asr_lang:null,visual_layer:"foreground"},
      {clip_index:2,start:5,end:20,clip_type:"strong",visual_zh:"用小勺舀粉/奶油/透明珠装入收纳盒（ASMR）",tags:["DIY","crafting","ASMR"],recommend_use:"foreground",match_score:95,highlight:true,thumbnail:"frames/method2_uyv_29s/f_013.jpg",asr_lang:null,visual_layer:"foreground"},
      {clip_index:3,start:21,end:28,clip_type:"strong",visual_zh:"举起装满精选珠的收纳盒成品展示",tags:["final result","display"],recommend_use:"foreground",match_score:100,highlight:true,thumbnail:"frames/method2_uyv_29s/f_025.jpg",asr_lang:null,visual_layer:"foreground"},
    ].map(c=>withThumb(c,1, { src_kind:"tiktok_post", src_label:"已发布视频", product_id:"1732323410271768766" })),
  };

  const CLIPS_LIVE = { // 历史直播录屏切片（3 clips）
    source:"live_replay_highlights", original:"Gismow_治愈陪伴专场_录屏切片_20260615.mp4",
    src_kind:"live_replay", src_label:"直播录屏", src_icon:"📺",
    product_id:"1732323410271768766",
    duration:38, parsed_by:"gemini-3-pro-preview-new", shot_count:3,
    main:"Live replay highlight — unboxing reaction", main_zh:"直播录屏高光 · 开箱反应",
    clips:[
      {clip_index:1,start:0,end:12,clip_type:"strong",visual_zh:"录屏：主播开箱 Gismow 盲盒，观众互动高峰",tags:["unboxing","live replay"],recommend_use:"foreground",match_score:88,highlight:true,thumbnail:"frames/method1_background_57s/f_018.jpg",asr_lang:null,visual_layer:"foreground"},
      {clip_index:2,start:12,end:24,clip_type:"strong",visual_zh:"录屏：特写展示软萌表情，弹幕求链接",tags:["close-up","engagement"],recommend_use:"foreground",match_score:92,highlight:true,thumbnail:"frames/method2_uyv_29s/f_013.jpg",asr_lang:null,visual_layer:"foreground"},
      {clip_index:3,start:24,end:36,clip_type:"bg",visual_zh:"录屏：多盒并排展示收尾",tags:["comparison","replay"],recommend_use:"background",match_score:78,highlight:false,thumbnail:"frames/method1_background_57s/f_053.jpg",asr_lang:null,visual_layer:"background"},
    ].map(c=>withThumb(c,2, { src_kind:"live_replay", src_label:"直播录屏", product_id:"1732323410271768766" })),
  };

  const OVERLAY_DIR = "../../demo-assets/overlays/maas";
  const OVERLAY_RECOMMENDS = [
    { id:"rec_price", label:"直播价", type:"price", img:`${OVERLAY_DIR}/price.png`, text:"$12.99 LIVE" },
    { id:"rec_ship", label:"包邮", type:"ship", img:`${OVERLAY_DIR}/ship.png`, text:"Free Shipping" },
    { id:"rec_selling", label:"卖点字", type:"selling", img:`${OVERLAY_DIR}/selling.png`, text:"Soft & Squishy" },
    { id:"rec_flash", label:"活动公告", type:"announce", img:`${OVERLAY_DIR}/flash.png`, text:"LIVE DEAL · 对标真人直播间公告栏（调研中）" },
    { id:"rec_logo", label:"店铺标识", type:"logo", img:`${OVERLAY_DIR}/logo.png`, text:"coco shop" },
    { id:"rec_sale", label:"全场满减", type:"sale", img:`${OVERLAY_DIR}/sale.png`, text:"$3 OFF" },
    { id:"rec_warranty", label:"售后保障", type:"aftersale", img:`${OVERLAY_DIR}/warranty.png`, text:"7-day return" },
    { id:"rec_bogo", label:"买赠优惠", type:"flash", img:`${OVERLAY_DIR}/bogo.png`, text:"Buy 2 Get 1" },
  ];

  // ---------- 直播大脑 JSON · 多轨并发时间轴样例（D-S7 与 D-P2 共用） ----------
  // 严格对齐平台端 §3 schema：products/scenes/tracks + render_contract
  const LIVEBRAIN = {
    mode:"smart_storyboard",
    shared_context:{ market:"US", language:"en", avatar_id:"0002", product_id:"1732323410271768766" },
    timeline:{
      total_duration_sec:42,
      products:[
        { product_id:"1732323410271768766", start_sec:0, end_sec:42, scenes:[
          { scene_id:"S1", start_sec:0,  end_sec:12 },
          { scene_id:"S2", start_sec:12, end_sec:30 },
          { scene_id:"S3", start_sec:30, end_sec:42 },
        ]},
      ],
      tracks:{
        speech:[
          { atom_id:"sp1", scene_id:"S1", start_sec:0,  end_sec:12, segment:"hook", text:"Hey loves! Today we're opening YOUR Gismow box LIVE — let's see which little buddy you get!" },
          { atom_id:"sp2", scene_id:"S2", start_sec:12, end_sec:30, segment:"body", text:"Look at this face — calm, quiet, soft. It's like a little buddy that just gets you on a hard day." },
          { atom_id:"sp3", scene_id:"S3", start_sec:30, end_sec:42, segment:"cta",  text:"Tap the basket now — limited mix of designs, grab your buddy before this batch is gone!" },
        ],
        visual:[
          { atom_id:"v1", start_sec:0,  end_sec:12, layer:"none",       clip_id:"m1-1", avatar_pos:{x:0.58,y:0.62,scale:0.42}, label:"数字人+背景同框（开场展示样品）" },
          { atom_id:"v2", start_sec:12, end_sec:30, layer:"background", clip_id:"m1-3", avatar_pos:{x:0.62,y:0.64,scale:0.38}, label:"画中画：商家素材铺背景(细节ASMR)+数字人中景" },
          { atom_id:"v3", start_sec:30, end_sec:42, layer:"foreground", clip_id:"m1-6", avatar_pos:null,                     label:"素材全屏覆盖（成品对比收尾）" },
        ],
        interaction:[
          { atom_id:"i1", start_sec:4,  end_sec:9,  scope:"product", type:"comment", label:"主动评论：问大家想要什么配色" },
          { atom_id:"i2", start_sec:33, end_sec:40, scope:"product", type:"qa",      label:"问答楔子：库存还剩多少？" },
        ],
        operation:[
          { atom_id:"o1", start_sec:0,  end_sec:42, overlay:[
            { type:"product_image", x:0.06, y:0.10, scale:0.9, label:"商品实拍图" },
            { type:"price_tag",     x:0.06, y:0.56, scale:1.0, label:"$14.99" },
          ]},
          { atom_id:"o2", start_sec:30, end_sec:42, overlay:[
            { type:"flash_sale", x:0.06, y:0.46, scale:1.0, label:"FLASH SALE" },
            { type:"countdown",  x:0.06, y:0.66, scale:1.0, label:"00:30" },
          ]},
        ],
        voice:[
          { atom_id:"vo1", start_sec:0, end_sec:42, voice_id:"camila_warm", rate:1.0, label:"主播音色 · Camila warm/friendly" },
        ],
        offscreen:[
          { atom_id:"os1", start_sec:8,  end_sec:12, kind:"sfx", payload:"bell", gain_db:-6, duck_bgm:true, label:"上新铃声🔔（BGM duck）" },
          { atom_id:"os2", start_sec:34, end_sec:40, kind:"tts", payload:"Only a few mixes left, grab yours!", gain_db:0, duck_bgm:true, label:"场外音第二人声 · 催单" },
        ],
      },
      render_contract:{
        visual_zorder:["operation_overlay","foreground_sticker","avatar","scene_clip","global_background"],
        audio_priority:["speech","offscreen_tts","sfx_bell","bgm"],
        ducking:"higher-priority active → attenuate lower（口播/场外音起 → BGM 自动压低）",
      },
    },
  };

  // ---------- 平台端：直播任务（按 shop_id × live_task_id 组织一切） ----------
  const LIVE_TASKS = [
    { task_id:"LT-20260615-001", room_id:"7491220033550", name:"Gismow 小憨包 · 治愈陪伴专场", product_id:"1732323410271768766", mode:"smart",   date:"2026-06-15", status:"已开播", score:85 },
    { task_id:"LT-20260612-007", room_id:"7490880127733", name:"幽灵旅馆 · 暗黑收藏夜场",     product_id:"1732348677774282942", mode:"classic", date:"2026-06-12", status:"已开播", score:79 },
    { task_id:"LT-20260610-013", room_id:null,            name:"卡路里女孩 · 甜品女生向",     product_id:"1732350078065021118", mode:"classic", date:"2026-06-10", status:"草稿",   score:null },
  ];

  // ---------- 平台端 Material：原始素材池（区分来源），每条产出 clips ----------
  const ORIGINALS = [
    { id:"RAW-001", source:"local_upload", source_label:"商家本地上传", file:"勺取深红珠装盒_A1-A8紫底_57s.mp4", duration:57, has_speech:false,
      uploaded:"2026-06-14", note:"商家工作台「My assets · 本地上传」入口提交", bank:"method1_background", clip_count:7 },
    { id:"RAW-002", source:"tiktok_post", source_label:"关联 TikTok 账号已发布", file:"@7colorsbunny / 手持桃黄混珠小盒_A1-A7_29s.mp4", duration:29, has_speech:true,
      uploaded:"2026-06-13", note:"商家授权后自动同步其 TikTok 主页已发布短视频", bank:"method2_use_your_video", clip_count:3 },
    { id:"RAW-003", source:"history_live", source_label:"近30天销量 TOP 直播录屏", file:"LIVE_replay_20260605_盲盒开箱高光段.mp4", duration:1820, has_speech:true,
      uploaded:"2026-06-06", note:"近 30 天销售量最好的直播录屏 · 平台自动切片沉淀高光段", bank:null, clip_count:0 },
  ];

  // ---------- 平台端 Material：三类素材源的汇总统计（来源维度聚合） ----------
  const SOURCE_SUMMARY = [
    { source:"local_upload", icon:"⬆️", label:"商家本地上传",        unit:"个素材",       total:8,  parsed:5,  pending:3, clips:34, extra:"最近提交 2026-06-14" },
    { source:"tiktok_post",  icon:"🔗", label:"关联 TikTok 已发布",   unit:"个已发布视频", total:23, parsed:14, pending:9, clips:61, extra:"@7colorsbunny 主页同步" },
    { source:"history_live", icon:"⏪", label:"近30天销量 TOP 直播录屏", unit:"场高销量直播", total:6,  parsed:2,  pending:4, clips:18, extra:"近30天 GMV TOP 场次 · 累计 9.4h" },
  ];

  // ---------- 平台端 Script：shared_context 结构（主-子 Agent 共享的全场上下文） ----------
  const SHARED_CTX = {
    desc:"L0 主 Agent 与 6 个职能 subagent 共享的全场上下文；作为字节稳定前缀供 fork 复用缓存；各 subagent 仅有白名单读权限，只交换产物、不偷看彼此中间过程。",
    fields:[
      { k:"market",        v:"US",                         note:"直播国家，决定合规/指标口径", read:"全部" },
      { k:"language",      v:"en",                         note:"一场一种语言，驱动口播/素材/字幕语言", read:"全部" },
      { k:"mode",          v:"smart_storyboard",           note:"经典分步 classic / 智能剧本 smart，贯穿埋点·归因分桶", read:"全部" },
      { k:"avatar",        v:"0002 Camila · 闺蜜风/双语",  note:"形象+人格+音色绑定", read:"脚本·画面·声音" },
      { k:"products",      v:"[1732323410271768766] 小憨包", note:"选品集 = 匹配/match_score 比对基准", read:"选品·脚本·画面" },
      { k:"selling_points",v:"治愈陪伴/暹罗猫灵感/表情安静", note:"商家强调卖点", read:"脚本·互动" },
      { k:"forbidden",     v:"禁讲：绝对化/夸大/未成年带货", note:"商家禁讲内容 + 平台红线（合规左移注入）", read:"全部" },
      { k:"merchant_note", v:"多强调「陪伴感」少强调价格战",  note:"商家悄悄话 / 备注", read:"脚本·运营" },
      { k:"flow",          v:"Opening→品讲解×N→互动→Closing", note:"整场直播流程/节奏定义", read:"L0 主 Agent" },
      { k:"memory",        v:"历史高分话术 / 上一场归因结论", note:"跨场记忆，驱动越播越好", read:"L0·脚本" },
    ],
  };

  // ---------- 平台端 Attribution：S1 测评 / S2 diff / S3 分钟级 / 风控 ----------
  const ATTR = {
    s1:{ total:85, market:"US", task:"LT-20260615-001",
      dims:[
        { l1:"内容质量", score:88, children:[
          { l2:"卖点覆盖", score:90, basis:"4 个核心卖点全部讲到，治愈陪伴卖点出现 6 次" },
          { l2:"脚本流畅", score:86, basis:"Hook/Body/CTA 衔接自然，无明显断点" },
        ]},
        { l1:"真人感(#15)", score:84, children:[
          { l2:"在场信号", score:82, basis:"互动+场外音并发，强化真人在场，规避 NN_Strong_Live" },
          { l2:"画面真实", score:86, basis:"多轨叠加，非干念稿；数字人与素材同框自然" },
        ]},
        { l1:"合规安全", score:83, children:[
          { l2:"违禁词", score:80, basis:"命中『guaranteed best price』1 处，已 highlight 待改" },
          { l2:"未成年", score:100, basis:"无 UCB 风险" },
        ]},
      ]},
    // S2：商品维度 → N 个卖点 → 每个卖点的 Hook/Body/CTA「平台初稿 vs 商家确认稿」对照
    // prompt_before / prompt_after = 可直接粘贴的提示词修改前→后原句（不做模糊定性）
    s2:{
      product:"Gismow 小憨包（1732323410271768766）",
      points:[
        { point:"治愈陪伴感（核心卖点）", segs:[
          { seg:"HOOK", platform:"Welcome! Today we open the Gismow blind box together.",
            merchant:"Hey loves! Today we're opening YOUR Gismow box LIVE — let's see who you get!",
            attr:"商家加强第二人称 + 开箱悬念，前 3s 停留 ↑12%",
            prompt_before:"Write a friendly welcome line introducing the blind box.",
            prompt_after:"Write the HOOK in 2nd person ('you/your') + an open-box suspense question (e.g. 'let's see who YOU get'); must say LIVE and spark curiosity in one sentence." },
          { seg:"BODY", platform:"This plush is soft and cute, inspired by a Siamese cat.",
            merchant:"Look at this face — calm, quiet, like a little buddy that just gets you on a hard day.",
            attr:"卖点从『可爱』改为『情绪陪伴』，更打中目标人群",
            prompt_before:"Describe the plush: soft, cute, Siamese-cat inspired.",
            prompt_after:"Describe the plush through EMOTIONAL COMPANIONSHIP (a quiet buddy that comforts on a hard day), not generic 'cute'; tie one physical trait (calm face / soft touch) to that emotion." },
          { seg:"CTA", platform:"Buy now, best price guaranteed.",
            merchant:"Tap the basket — limited mix, grab your buddy before it's gone!",
            attr:"删『best price guaranteed』规避误导价格(#16)，改稀缺催单，转化 ↑",
            prompt_before:"End with a strong CTA, e.g. 'best price guaranteed'.",
            prompt_after:"CTA must NOT use absolute price claims (best/lowest/guaranteed price). Use scarcity/urgency ('limited mix', 'while supplies last', 'before it's gone') and always include 'tap the basket'." },
        ]},
        { point:"暹罗猫灵感 · 辨识度高", segs:[
          { seg:"HOOK", platform:"It's inspired by a Siamese cat.",
            merchant:"You'll spot this one in any toy pile — that Siamese-cat face is unreal.",
            attr:"强调『一眼认出/辨识度』，强化收藏冲动",
            prompt_before:"Mention the Siamese-cat inspiration.",
            prompt_after:"Frame the Siamese-cat design as HIGH RECOGNIZABILITY ('spot it in any pile') to trigger collector desire; avoid flat 'it's inspired by…'." },
          { seg:"BODY", platform:"Round face, big eyes, fluffy.",
            merchant:"Round cheeks, big calm eyes, fluffy all over — and it actually holds its shape.",
            attr:"补『保形/做工』细节，降低质量顾虑",
            prompt_before:"List appearance: round face, big eyes, fluffy.",
            prompt_after:"After appearance, add ONE quality-reassurance detail (holds shape / embroidery / sturdy seams) to reduce quality hesitation." },
          { seg:"CTA", platform:"Grab one now.",
            merchant:"Want the Siamese one? Tap now — this face sells out first every drop.",
            attr:"用『热门款先售罄』制造从众 + 稀缺",
            prompt_before:"Encourage purchase of this design.",
            prompt_after:"Add social-proof scarcity for popular designs ('sells out first every drop') + 'tap now'; never use absolute price words." },
        ]},
      ],
    },
    s3:[
      { min:"00–03'", signal:[{t:"停留",d:"up"}], locate:"speech/hook + visual 数字人同框", suggest:"保持开箱悬念 hook 句式",
        prompt:"沿用 HOOK after：2nd person + open-box suspense（见 S2 卖点1 HOOK）" },
      { min:"03–08'", signal:[{t:"互动率",d:"up"}], locate:"interaction 主动评论『你想抽到哪只』", suggest:"互动楔子前移到每品 0–5s",
        prompt:"interaction subagent prompt：在每个品的 0–5s 注入一条互动楔子（'Which one do you want to pull? Comment below.'）" },
      { min:"12–14'", signal:[{t:"转化",d:"down"}], locate:"operation overlay 缺价格牌/规格", suggest:"price_tag 提前到品开始 0s 常驻",
        prompt:"operation subagent prompt：price_tag 在每个品 start=0s 起常驻至品结束，并同播规格牌（spec overlay）" },
      { min:"28–30'", signal:[{t:"风控",d:"warn"}], locate:"speech/cta 命中误导价格词", suggest:"见下方风控归因，改 CTA 话术", risk:true,
        prompt:"见风控：CTA 加入绝对化价格词黑名单（best/lowest/guaranteed price → block）" },
      { min:"30–42'", signal:[{t:"GMV",d:"up"}], locate:"offscreen 催单 + countdown 并发", suggest:"沉淀为正向 prompt 复用",
        prompt:"正向复用 prompt：CTA 段让 offscreen_tts 催单与 countdown 并发（audio_priority: offscreen_tts > bgm，自动 ducking）" },
    ],
    risk:[
      { min:"28–30'", code:"#16 误导价格", rule:"禁止『best price guaranteed』等绝对化/最高级价格承诺",
        reason:"CTA 出现『best price guaranteed』，触发误导价格信号", fix:"改为『limited mix / while supplies last』稀缺话术",
        prompt_before:"End with a strong CTA, e.g. 'best price guaranteed'.",
        prompt_after:"Add to system prompt — BANNED price words: best/lowest/cheapest/guaranteed price, #1 price. Replace with scarcity ('limited mix', 'while supplies last'). Validator rejects any output containing banned words." },
    ],
  };

  return { SHOP, AVATARS, avatarImg, PRODUCTS, PROD, CLIPS_M1, CLIPS_M2, CLIPS_LIVE, OVERLAY_RECOMMENDS, REASON, LIVEBRAIN, LIVE_TASKS, ORIGINALS, SOURCE_SUMMARY, SHARED_CTX, ATTR, ASSET, AVA };
})();
