/* =====================================================================
   Demo 通用 JS：弹框 / 二次确认 / 多轨时间轴渲染 / 9:16 预览合成
   纯原生，无依赖。商家端 D-S7 与平台端 D-P2 共用时间轴渲染。
   ===================================================================== */
(function () {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]));
  const url = (p) => encodeURI(p);          // 处理含空格/中文的真实文件路径
  const bg  = (p) => `background-image:url('${encodeURI(p)}')`;

  /* ---------- 弹框 ---------- */
  function modal(title, bodyNode, footerNode, widthCls) {
    let mask = $(".modal-mask.runtime");
    if (!mask) { mask = el("div", "modal-mask runtime"); document.body.appendChild(mask); }
    mask.innerHTML = "";
    const m = el("div", "modal" + (widthCls ? " " + widthCls : ""));
    const h = el("div", "m-h", `<b>${esc(title)}</b><span class="x">&times;</span>`);
    const b = el("div", "m-b");
    if (typeof bodyNode === "string") b.innerHTML = bodyNode; else b.appendChild(bodyNode);
    m.appendChild(h); m.appendChild(b);
    if (footerNode) { const f = el("div", "m-f"); if (typeof footerNode === "string") f.innerHTML = footerNode; else f.appendChild(footerNode); m.appendChild(f); }
    mask.appendChild(m); mask.classList.add("open");
    const close = () => mask.classList.remove("open");
    h.querySelector(".x").onclick = close;
    mask.onclick = (e) => { if (e.target === mask) close(); };
    return { close, body: b, footerEl: m.querySelector(".m-f") };
  }
  function confirmBox(text, onYes, yesLabel) {
    const body = el("div", "", `<p style="margin:0 0 4px">${esc(text)}</p><p class="muted" style="font-size:12px;margin:0">此操作不可撤销。</p>`);
    const foot = el("div");
    foot.innerHTML = `<button class="btn ghost sm" data-no>Cancel</button><button class="btn danger sm" data-yes>${esc(yesLabel || "Confirm")}</button>`;
    const dlg = modal("Please confirm", body, foot, "confirm");
    foot.querySelector("[data-no]").onclick = dlg.close;
    foot.querySelector("[data-yes]").onclick = () => { dlg.close(); onYes && onYes(); };
  }

  /* ---------- 多轨并发时间轴渲染 ----------
     用法：renderTimeline(container, brain, { editable, onPick })
     - 横向绝对时间轴，每条轨道一条 lane，原子按 [start,end] 定位、可重叠
  */
  const TRACKS = [
    { key:"speech",      name:"① Speech 口播",   color:"#0a8a8a" },
    { key:"visual",      name:"② Visual 画面",   color:"#2563eb" },
    { key:"interaction", name:"③ Interaction 互动", color:"#7c3aed" },
    { key:"operation",   name:"④ Operation 运营", color:"#d97706" },
    { key:"voice",       name:"⑤ Voice 声音",    color:"#0891b2" },
    { key:"offscreen",   name:"⑥ Off-screen 场外音", color:"#dc2626" },
  ];
  // 商家视角的轨道名（去技术语，说人话）
  const TRACK_NAME_SELLER = {
    speech:"① 主播说话", visual:"② 画面", interaction:"③ 观众互动",
    operation:"④ 优惠 / 活动", voice:"⑤ 声音", offscreen:"⑥ 场外配音",
  };
  // 商家视角的口播段标签
  const SEG_SELLER = { hook:"开场", body:"讲解", cta:"促单" };
  function atomLabel(track, a, audience) {
    const seller = audience === "seller";
    if (track === "speech") {
      const seg = seller ? (SEG_SELLER[a.segment] || a.segment) : a.segment.toUpperCase();
      return `<b>${esc(seg)}</b> ${esc(a.text.slice(0,46))}…`;
    }
    if (track === "visual")      return seller ? esc(a.label||"") : `layer=${a.layer} · ${esc(a.label||"")}`;
    if (track === "interaction") return seller ? esc(a.label||"") : `${a.type} · ${esc(a.label||"")}`;
    if (track === "operation")   return (a.overlay||[]).map(o=>o.label||o.type).join(" · ");
    if (track === "voice")       return seller ? "主播声音" : esc(a.label||a.voice_id||"");
    if (track === "offscreen")   return seller ? esc(a.label||"") : `${a.kind.toUpperCase()} · ${esc(a.label||"")}${a.duck_bgm?" · BGM duck":""}`;
    return "";
  }
  function renderTimeline(container, brain, opts = {}) {
    const seller = opts.audience === "seller";
    const tl = brain.timeline, total = tl.total_duration_sec;
    container.innerHTML = "";
    const wrap = el("div", "tl");
    // 顶部刻度 + 品/Scene 段
    const ruler = el("div", "tl-ruler");
    let rh = `<div class="tl-lane-h"></div><div class="tl-track" style="position:relative;height:40px">`;
    // 品段
    tl.products.forEach(p => {
      const L = p.start_sec/total*100, W = (p.end_sec-p.start_sec)/total*100;
      const prodObj = (window.DEMO && DEMO.PRODUCTS || []).find(x => x.id === p.product_id);
      const prodLabel = seller ? (prodObj ? esc(prodObj.ip) : "商品") : `品 ${esc(p.product_id)}`;
      rh += `<div class="tl-prod" style="left:${L}%;width:${W}%">${prodLabel}</div>`;
      p.scenes.forEach(s => {
        const sl = s.start_sec/total*100, sw = (s.end_sec-s.start_sec)/total*100;
        rh += `<div class="tl-scene" style="left:${sl}%;width:${sw}%">${esc(s.scene_id)}</div>`;
      });
    });
    // 秒刻度
    for (let t=0; t<=total; t+=6) rh += `<div class="tl-tick" style="left:${t/total*100}%">${t}s</div>`;
    rh += `</div>`;
    ruler.innerHTML = rh;
    wrap.appendChild(ruler);
    // 各轨 lane
    TRACKS.forEach(tr => {
      const lane = el("div", "tl-row");
      const laneName = seller ? (TRACK_NAME_SELLER[tr.key] || tr.name) : tr.name;
      let h = `<div class="tl-lane-h">${laneName}</div><div class="tl-track">`;
      (tl.tracks[tr.key] || []).forEach(a => {
        const L = a.start_sec/total*100, W = (a.end_sec-a.start_sec)/total*100;
        const lbl = atomLabel(tr.key,a,opts.audience);
        h += `<div class="tl-atom" data-track="${tr.key}" data-id="${a.atom_id}" title="${a.start_sec}-${a.end_sec}s ${esc(lbl)}"
                style="left:${L}%;width:${W}%;background:${tr.color}1a;border-color:${tr.color};color:${tr.color}">
                <span>${lbl}</span></div>`;
      });
      h += `</div>`;
      lane.innerHTML = h;
      wrap.appendChild(lane);
    });
    container.appendChild(wrap);
    // 脚注：平台端展示渲染契约（技术语）；商家端展示一句话说明
    const rc = tl.render_contract;
    const foot = seller
      ? el("div", "tl-contract", `💡 同一时间线上，主播说话、画面、和观众互动、优惠、声音会同时发生，像真人直播一样自然。`)
      : el("div", "tl-contract",
          `<b>渲染契约</b> · 视觉 z-order(上→下): ${rc.visual_zorder.join(" › ")} ｜ 音频优先级(高→低): ${rc.audio_priority.join(" › ")} ｜ ${esc(rc.ducking)}`);
    container.appendChild(foot);
    if (opts.onPick) {
      $$(".tl-atom", container).forEach(node => node.onclick = () => {
        const tk = node.dataset.track, id = node.dataset.id;
        const a = (tl.tracks[tk]||[]).find(x => x.atom_id === id);
        opts.onPick(tk, a);
      });
    }
  }

  /* ---------- 9:16 预览合成（按 render_contract 叠加） ----------
     给定时刻 t，挑出活跃 visual/operation/speech/offscreen，按层渲染一帧
  */
  function activeAt(arr, t) { return (arr||[]).filter(a => t >= a.start_sec && t < a.end_sec); }
  function clipThumbById(id) {
    const all = [...DEMO.CLIPS_M1.clips, ...DEMO.CLIPS_M2.clips];
    const map = { "m1-1":all[0], "m1-3":DEMO.CLIPS_M1.clips[2], "m1-6":DEMO.CLIPS_M1.clips[5] };
    const c = map[id] || DEMO.CLIPS_M1.clips[2];
    return c.thumbUrl;
  }
  function renderPreview916(elr, brain, t, avatar) {
    const tl = brain.timeline;
    const v = activeAt(tl.tracks.visual, t)[0];
    const ops = activeAt(tl.tracks.operation, t).flatMap(o => o.overlay || []);
    const sp = activeAt(tl.tracks.speech, t)[0];
    const os = activeAt(tl.tracks.offscreen, t);
    let h = `<div class="livebadge">● LIVE</div>`;
    // 背景：scene_clip 或全局背景
    if (v && (v.layer === "background" || v.layer === "foreground")) {
      h += `<div class="layer" style="${bg(clipThumbById(v.clip_id))}"></div>`;
    } else {
      h += `<div class="layer" style="background:linear-gradient(160deg,#2a1a3a,#3a2a1a)"></div>`;
      if (v) h += `<div class="layer" style="${bg(clipThumbById(v.clip_id))};opacity:.5"></div>`;
    }
    // 数字人（中景画中画）—— foreground 时隐藏
    if (avatar && (!v || v.layer !== "foreground")) {
      h += `<div class="avatar-pip" style="${bg(DEMO.avatarImg(avatar))}"></div>`;
    }
    // 运营 overlay（最上层）
    ops.forEach(o => {
      const cls = o.type === "price_tag" ? "pricetag" : o.type === "countdown" ? "countdown" : o.type === "flash_sale" ? "countdown" : "";
      if (o.type === "product_image") h += `<div class="overlay-el" style="left:6%;top:8%;width:64px;height:64px;padding:0;${bg(DEMO.PRODUCTS[0].img)};background-size:cover"></div>`;
      else h += `<div class="overlay-el ${cls}" style="left:6%;top:${o.type==='price_tag'?'52%':o.type==='flash_sale'?'42%':'62%'}">${esc(o.label||o.type)}</div>`;
    });
    // 口播字幕
    if (sp) h += `<div class="caption">🗣 ${esc(sp.text)}</div>`;
    // 场外音指示
    if (os.length) h += `<div class="overlay-el" style="right:6%;top:8%;background:#dc2626;color:#fff">🔊 ${esc(os.map(x=>x.kind).join("+"))}</div>`;
    elr.innerHTML = h;
  }

  window.UI = { $, $$, el, esc, url, bg, modal, confirmBox, renderTimeline, renderPreview916, TRACKS };
})();
