/* =====================================================================
   Demo 批注层（复用 ~/.cursor/assets/html-annotate-overlay.html 标准片段）
   能力：选中正文文字→写建议→localStorage 持久化→行内高亮→右下面板
        （复制 Markdown / 导出 JSON / 定位 / 删除 / 清空）。
   适配点：① CSS 用 JS 注入；② demo 内容动态渲染/切步重渲 → 加 MutationObserver
          去抖重高亮，让已存批注在重渲后自动恢复 mark。
   分组：给容器加 data-ann-group="商家端/平台端/落地页"，评论会带分组。
   每个页面按 location.pathname 独立存储，互不干扰。
   ===================================================================== */
(function () {
  // ---------- 注入样式 ----------
  var css = `
.ann-pop{position:absolute;z-index:140;background:#15201d;border-radius:9px;padding:9px;box-shadow:0 6px 18px rgba(0,0,0,.32);width:248px}
.ann-pop textarea{width:100%;height:56px;border:none;border-radius:6px;padding:7px;font-size:12.5px;resize:vertical;font-family:inherit;box-sizing:border-box}
.ann-pop .row{display:flex;gap:6px;margin-top:7px;justify-content:flex-end}
.ann-pop button{border:none;border-radius:6px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer}
.ann-pop .save{background:#0E8C7F;color:#fff}
.ann-pop .cancel{background:#3a4a46;color:#cdd6d3}
mark.cm{background:#fff3bf;border-bottom:2px solid #b8860b;cursor:pointer;border-radius:2px;padding:0 1px}
#ann-fab{position:fixed;right:20px;bottom:20px;z-index:130;background:#0E8C7F;color:#fff;border:none;border-radius:26px;padding:11px 18px;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 5px 16px rgba(14,140,127,.42)}
#ann-panel{position:fixed;right:20px;bottom:66px;z-index:130;width:368px;max-height:74vh;display:none;flex-direction:column;background:#fff;border:1px solid #e6e8e7;border-radius:13px;box-shadow:0 10px 34px rgba(0,0,0,.24);overflow:hidden;font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif}
#ann-panel.open{display:flex}
#ann-panel .hd{padding:11px 14px;border-bottom:1px solid #e6e8e7;font-weight:800;display:flex;justify-content:space-between;align-items:center}
#ann-panel .hd span{cursor:pointer;color:#6b6b6b}
#ann-panel .acts{display:flex;gap:6px;flex-wrap:wrap;padding:9px 12px;border-bottom:1px solid #e6e8e7}
#ann-panel .acts button{border:1px solid #e6e8e7;background:#fff;border-radius:6px;padding:5px 10px;font-size:11.5px;font-weight:700;cursor:pointer;color:#0a6b61}
#ann-list{overflow:auto;padding:4px 0}
.ann-item{padding:9px 14px;border-bottom:1px solid #f0f2f2;font-size:12.5px}
.ann-item .sec{color:#0a6b61;font-weight:800;font-size:11.5px;margin-bottom:2px}
.ann-item .q{color:#7a7f7d;font-style:italic;margin:3px 0;border-left:2px solid #b8860b;padding-left:7px}
.ann-item .c{color:#1f2421}
.ann-item .mini{margin-top:5px;display:flex;gap:12px}
.ann-item .mini a{color:#2b6cb0;cursor:pointer;font-size:11px;text-decoration:none}
.ann-empty{padding:22px;text-align:center;color:#6b6b6b;font-size:12.5px;line-height:1.7}`;
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  var ANN_KEY = "ann::v3::" + location.pathname;   // v3：升版本即清空旧评论，基于新页面重新收集（2026-06-17）
  function get(){ try { return JSON.parse(localStorage.getItem(ANN_KEY)) || []; } catch(e){ return []; } }
  function set(a){ localStorage.setItem(ANN_KEY, JSON.stringify(a)); }
  function uid(){ return "c" + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
  function esc(s){ return (s||"").replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function toast(m){ var t=document.createElement("div"); t.textContent=m; t.style.cssText="position:fixed;left:50%;top:18px;transform:translateX(-50%);background:#15201d;color:#fff;padding:9px 16px;border-radius:8px;z-index:120;font-size:12.5px"; document.body.appendChild(t); setTimeout(function(){ t.remove(); },1900); }
  function openPanel(o){ document.getElementById("ann-panel").classList.toggle("open", o); }
  window.__annOpen = openPanel;
  function groupOf(node){ var el=node&&node.nodeType===3?node.parentElement:node; var g=el&&el.closest?el.closest("[data-ann-group]"):null; if(g)return g.getAttribute("data-ann-group"); var def=document.querySelector("[data-ann-group]"); return def?def.getAttribute("data-ann-group"):""; }
  function headingOf(node){ var el=node&&node.nodeType===3?node.parentElement:node; if(!el)return "(顶部)";
    // 弹框（My assets / 换背景 等）内：用弹框标题做归属，便于回流定位
    var mo=el.closest&&el.closest(".modal"); if(mo){ var mt=mo.querySelector(".m-h b"); return (mt?("弹框 · "+mt.textContent.trim()):"弹框").slice(0,60); }
    var scope=(el.closest&&el.closest("[data-ann-group]"))||document.body; var hs=[].slice.call(scope.querySelectorAll("h1,h2,h3,h4,.h-title,.col-h,.seg-pill,.step.active,.tl-lane-h")); var res=null; for(var i=0;i<hs.length;i++){ var p=el.compareDocumentPosition(hs[i]); if(p&Node.DOCUMENT_POSITION_PRECEDING)res=hs[i]; else if(p&Node.DOCUMENT_POSITION_FOLLOWING)break; } return res?res.textContent.trim().slice(0,60):"(顶部)"; }
  function hl(range,id){ try{ var m=document.createElement("mark"); m.className="cm"; m.dataset.cid=id; range.surroundContents(m); m.title="点击查看评论"; m.onclick=function(){ openPanel(true); var el=document.querySelector('.ann-item[data-cid="'+id+'"]'); if(el){ el.scrollIntoView({block:"center"}); el.style.background="#fff8e1"; setTimeout(function(){ el.style.background=""; },1300);} }; return true; }catch(e){ return false; } }
  function reHl(quote,id){ if(document.querySelector('mark.cm[data-cid="'+id+'"]'))return true; var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null),n; while(n=w.nextNode()){ if(n.parentElement&&(n.parentElement.tagName==="MARK"||n.parentElement.closest("#ann-panel,.ann-pop,#ann-fab")))continue; var i=n.nodeValue.indexOf(quote); if(i>-1){ var r=document.createRange(); r.setStart(n,i); r.setEnd(n,i+quote.length); return hl(r,id);} } return false; }
  var pop,curRange,curText;
  function hidePop(){ if(pop){ pop.remove(); pop=null; } }
  document.addEventListener("mousedown",function(e){ if(pop&&!pop.contains(e.target))hidePop(); });
  document.addEventListener("mouseup",function(e){
    if(e.target.closest&&(e.target.closest(".ann-pop")||e.target.closest("#ann-panel")||e.target.closest("#ann-fab")))return;
    setTimeout(function(){ var s=window.getSelection(); var t=s?s.toString().trim():""; if(t.length<2||!s||!s.rangeCount)return; curText=t; curRange=s.getRangeAt(0).cloneRange(); var r=s.getRangeAt(0).getBoundingClientRect(); showPop(r.left+scrollX,r.bottom+scrollY); },1);
  });
  function showPop(x,y){ hidePop(); pop=document.createElement("div"); pop.className="ann-pop"; pop.style.left=Math.max(8,Math.min(x,scrollX+innerWidth-258))+"px"; pop.style.top=(y+6)+"px"; pop.innerHTML='<textarea placeholder="对所选文字的修改建议…"></textarea><div class="row"><button class="cancel">取消</button><button class="save">保存评论</button></div>'; document.body.appendChild(pop); var ta=pop.querySelector("textarea"); ta.focus(); pop.querySelector(".cancel").onclick=hidePop; pop.querySelector(".save").onclick=function(){ var c=ta.value.trim(); if(!c){ ta.focus(); return; } save(c); hidePop(); }; ta.addEventListener("keydown",function(ev){ if((ev.metaKey||ev.ctrlKey)&&ev.key==="Enter"){ var c=ta.value.trim(); if(c){ save(c); hidePop(); } } }); }
  function save(comment){ var id=uid(); var ok=hl(curRange,id); var a=get(); a.push({ id:id, group:groupOf(curRange.startContainer), section:headingOf(curRange.startContainer), quote:curText, comment:comment, ts:Date.now(), hl:ok, page:location.pathname }); set(a); render(); openPanel(true); toast("已记录评论"); }
  function goto(it){ var m=document.querySelector('mark.cm[data-cid="'+it.id+'"]'); if(m){ m.scrollIntoView({block:"center",behavior:"smooth"}); m.style.outline="2px solid #c0392b"; setTimeout(function(){ m.style.outline=""; },1500);} else { toast("该批注所在页面/步骤当前未显示，切回对应步骤即可定位"); } }
  function del(id){ set(get().filter(function(x){ return x.id!==id; })); var m=document.querySelector('mark.cm[data-cid="'+id+'"]'); if(m){ var p=m.parentNode; while(m.firstChild)p.insertBefore(m.firstChild,m); p.removeChild(m); if(p.normalize)p.normalize(); } render(); }
  function render(){ var list=document.getElementById("ann-list"),a=get(); document.getElementById("ann-count").textContent=a.length; if(!a.length){ list.innerHTML='<div class="ann-empty">还没有评论。<br>在页面里<strong>选中任意文字</strong>即可写修改建议（支持跨步骤/双端）。</div>'; return; } list.innerHTML=""; a.forEach(function(it){ var d=document.createElement("div"); d.className="ann-item"; d.dataset.cid=it.id; var tag=it.group?"["+esc(it.group)+"] ":""; d.innerHTML='<div class="sec">'+tag+esc(it.section)+'</div><div class="q">“'+esc(it.quote)+'”</div><div class="c">'+esc(it.comment)+'</div><div class="mini"><a class="go">定位</a><a class="del">删除</a></div>'; d.querySelector(".go").onclick=function(){ goto(it); }; d.querySelector(".del").onclick=function(){ del(it.id); }; list.appendChild(d); }); }
  function toMD(){ var a=get(); if(!a.length)return "（暂无评论）"; var g={}; a.forEach(function(it){ var k=(it.group?it.group+" ｜ ":"")+it.section; (g[k]=g[k]||[]).push(it); }); var o="# 批注汇总（"+a.length+" 条）\n\n"; Object.keys(g).forEach(function(k){ o+="## "+k+"\n"; g[k].forEach(function(it){ o+='- 引文：“'+it.quote+'”\n  - 建议：'+it.comment+"\n"; }); o+="\n"; }); return o; }
  function copyMD(){ var t=toMD(); if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(function(){ toast("已复制 Markdown"); },function(){ prompt("复制以下内容：",t); }); } else { prompt("复制以下内容：",t); } }
  function expJSON(){ var b=new Blob([JSON.stringify(get(),null,2)],{type:"application/json"}); var u=URL.createObjectURL(b); var x=document.createElement("a"); var nm=(document.title||"demo").replace(/[^\w\u4e00-\u9fa5]+/g,"_"); x.href=u; x.download="批注_"+nm+".json"; x.click(); URL.revokeObjectURL(u); }
  function clr(){ if(confirm("清空本页所有评论？")){ set([]); document.querySelectorAll("mark.cm").forEach(function(m){ var p=m.parentNode; while(m.firstChild)p.insertBefore(m.firstChild,m); p.removeChild(m); }); render(); } }
  // 去抖重高亮：demo 切步/重渲后，把仍可匹配到的已存批注重新加 mark
  var rt=null;
  function rehlAll(){ get().forEach(function(it){ if(it.hl!==false) reHl(it.quote,it.id); }); }
  function scheduleRehl(){ clearTimeout(rt); rt=setTimeout(rehlAll,250); }
  function init(){
    var fab=document.createElement("button"); fab.id="ann-fab"; fab.innerHTML='💬 评论 <span id="ann-count">0</span>'; fab.onclick=function(){ openPanel(!document.getElementById("ann-panel").classList.contains("open")); }; document.body.appendChild(fab);
    var p=document.createElement("div"); p.id="ann-panel"; p.innerHTML='<div class="hd">批注 / 修改建议<span>✕</span></div><div class="acts"><button id="b-md">复制 Markdown</button><button id="b-json">导出 JSON</button><button id="b-clr">清空</button></div><div id="ann-list"></div>'; document.body.appendChild(p);
    p.querySelector(".hd span").onclick=function(){ openPanel(false); };
    document.getElementById("b-md").onclick=copyMD; document.getElementById("b-json").onclick=expJSON; document.getElementById("b-clr").onclick=clr;
    rehlAll(); render();
    // 监听 demo 动态渲染（#stage 等），重渲后自动恢复高亮
    var mo=new MutationObserver(function(muts){ for(var i=0;i<muts.length;i++){ if(muts[i].target&&muts[i].target.closest&&muts[i].target.closest("#ann-panel,.ann-pop")) continue; scheduleRehl(); break; } });
    mo.observe(document.body,{ childList:true, subtree:true });
  }
  if(document.readyState!=="loading")init(); else window.addEventListener("DOMContentLoaded",init);
})();
