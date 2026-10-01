/* Curated demo conversations. Outfit IDs also drive the existing try-on view. */
icons.close = '<path d="m6 6 12 12M18 6 6 18"/>';
icons.bag = '<path d="M5 7h14l1 14H4L5 7Zm4 0V5a3 3 0 0 1 6 0v2"/>';

const copyProducts = (trend) => Object.fromEntries(
  Object.entries(trend.products).map(([category, products]) => [category, products.map(p => [...p])])
);
const dailyProducts = copyProducts(byId("city"));
dailyProducts.Coat[0] = ["Relaxed Cotton Overshirt", "Sand beige", "$28.50", "sand beige relaxed cotton button up overshirt, front view flat lay product photography on ivory background, realistic fabric, no text"];
dailyProducts.Top.reverse();
trends.push({
  ...byId("city"), id:"daily", products:dailyProducts,
  hero:"full body realistic editorial photograph of a young adult woman in a relaxed beige cotton overshirt over a white crew neck tee, light wash straight jeans and white sneakers, casual city sidewalk, soft daylight, head to toe, no text",
  flatlay:"top down realistic studio flat lay photograph of a complete casual outfit, white cotton crew neck tee at upper left, beige cotton overshirt at upper right, light blue straight jeans at lower left, pair of white sneakers at lower right, neatly arranged on warm ivory linen, natural soft light, accurate fabric texture, no people, no text, no labels",
  article:"浅色棉质衬衫与白色 T 恤叠穿，搭配浅蓝直筒牛仔裤和白色运动鞋。适合需要轻便外搭的日常出行。",
  reasons:["敞开衬衫，让内外两层形成自然层次。","直筒牛仔裤保留活动空间，也让腿部线条更利落。","白色鞋子呼应内搭，保持整套造型的清爽感。"]
});
trends.push({
  ...byId("city"), id:"daily-layers", title:"A Little More Layering",
  products:{ ...copyProducts(byId("city")), Top:dailyProducts.Top.map(p => [...p]) },
  hero:"full body realistic editorial photograph of a young adult woman in a beige trench coat over a white tee, light blue straight jeans and white sneakers, relaxed city outfit, natural daylight, head to toe, no text"
});

const tweedJacket = ["Cropped Tweed Jacket", "Cream · textured weave", "$48.00",
  "cream cropped collarless tweed jacket with small gold buttons, front view isolated product photograph on warm white background, realistic woven wool texture, no text, no logos"];
const itemOptions = [
  {
    id:"tweed-black", swatch:"black", title:"Black Cigarette Pants / Tailored Trousers",
    description:"Great for a polished work or smart-casual look. Black balances the texture of the tweed jacket, while the clean cut makes the outfit look sleek and refined.",
    pants:["Slim Tailored Trousers", "Classic black", "$34.00", "black slim ankle length tailored cigarette trousers, flat lay product photography on ivory background, realistic fabric, no text"],
    shoes:["Leather Loafers", "Black", "$34.00", "pair of black slim leather loafers, isolated product photo on ivory background, realistic leather, no text"],
    outfit:"cream cropped tweed jacket with gold buttons, simple white tee, black slim tailored ankle length trousers, black leather loafers and small black leather bag",
    article:"黑色烟管裤平衡粗花呢的纹理感。短外套与利落裤型突出腰线，适合工作日或稍正式的聚会。",
    reasons:["白色内搭让粗花呢纹理成为上半身重点。","九分裤脚露出脚踝，减少整套造型的厚重感。","黑色鞋包与长裤呼应，统一视觉线条。"]
  },
  {
    id:"tweed-denim", swatch:"denim", title:"High-Waisted Straight-Leg Jeans",
    description:"Perfect for a more casual and youthful style. Jeans soften the formal feel of the tweed jacket, while the straight-leg cut keeps the look neat.",
    pants:["High-rise Straight Jeans", "Vintage blue", "$35.90", "vintage blue high waisted straight leg jeans, flat lay product photography on ivory background, realistic denim, no text"],
    shoes:["Suede Ballet Flats", "Warm tan", "$24.90", "pair of warm tan suede ballet flats, isolated product photo on ivory background, realistic suede, no text"],
    outfit:"cream cropped tweed jacket with gold buttons, simple white tee, vintage blue high waisted straight leg jeans, tan suede ballet flats and small brown leather shoulder bag",
    article:"高腰直筒牛仔裤降低粗花呢外套的正式感。棕色芭蕾鞋与小包保留柔和质感，适合咖啡约会或周末出行。",
    reasons:["高腰直筒剪裁延伸下半身比例。","水洗蓝与奶油色形成轻松的颜色过渡。","简洁鞋包减少装饰，让外套纹理更突出。"]
  },
  {
    id:"tweed-ivory", swatch:"ivory", title:"Off-White Wide-Leg Pants / Straight-Leg Pants",
    description:"Ideal for a soft, clean, and elegant look. Off-white keeps the outfit fresh, while the relaxed silhouette helps elongate the proportions.",
    pants:["Fluid Wide-leg Trousers", "Off-white", "$33.10", "off white high waisted wide leg tailored trousers, flat lay product photography on ivory background, realistic fabric, no text"],
    shoes:["Low Slingback Heels", "Ivory", "$31.00", "pair of ivory low heel slingback shoes, isolated product photo on ivory background, realistic leather, no text"],
    outfit:"cream cropped tweed jacket with gold buttons, simple white tee, off white high waisted wide leg trousers, ivory low heel slingback shoes and small taupe leather bag",
    article:"米白色阔腿裤与奶油色粗花呢构成同色系搭配。用不同材质建立层次，保留柔和、干净的整体轮廓。",
    reasons:["短外套搭配高腰阔腿裤，拉长下半身比例。","粗花呢与顺滑裤料形成细腻的材质对比。","低跟鞋略微抬高裤脚，让宽松裤型保持利落。"]
  }
];
itemOptions.forEach(option => {
  const products = copyProducts(byId("daily"));
  products.Coat = [[...tweedJacket]];
  products.Pants = [[...option.pants]];
  products.Shoes = [[...option.shoes]];
  trends.push({
    id:option.id, tab:"Tweed, styled your way", title:option.title,
    ask:"What pants go with a Chanel-style jacket?",
    answer:option.description, mood:"One jacket, a new way to wear it",
    hero:`full length realistic editorial photograph of an adult woman wearing ${option.outfit}, standing on a quiet Parisian street, natural daylight, head to toe, realistic fabric details, no text, no logos`,
    flatlay:`top down realistic studio photograph of ${option.outfit}, complete outfit neatly arranged as a flat lay on warm ivory linen, natural soft light, realistic fabric texture, no people, no text, no labels`,
    products, article:option.article, reasons:option.reasons
  });
});

const chatTurns = [];
let itemInitialized = false;
let itemSheetReturnFocus = null;
let voiceSession = null;
const deviceStatus = () => `<div class="device-status conversation-status" aria-hidden="true"><span>8:00</span><span>${icon("signal")}${icon("wifi")}${icon("battery")}</span></div>`;
const tryPill = () => `<span class="try-pill">${icon("sparkle")}Try it on</span>`;
const questionBubble = query => `<p class="question-bubble">${escapeHTML(query)}</p>`;
const homeIndicator = () => '<div class="home-indicator" aria-hidden="true"></div>';

function conversationFooter(kind) {
  const isItem = kind === "item";
  return `<footer class="conversation-footer">
    <form class="conversation-composer" id="${kind}Form">
      ${isItem ? "" : icon("sparkle").replace('class="ui-icon', 'class="input-sparkle ui-icon')}
      <input id="${kind}Input" placeholder="${isItem ? "Send a message..." : "Tell me what to change..."}" aria-label="${isItem ? "Ask about this jacket" : "Tell me what to change"}" maxlength="500" autocomplete="off">
      <button class="composer-action voice-message" type="button" data-action="voice" aria-label="Use voice input">${icon("mic")}</button>
      <button class="composer-action send-message" type="submit" aria-label="Send message">${icon("arrow")}</button>
    </form>
    <p class="voice-status" role="status"></p>
    ${homeIndicator()}
  </footer>`;
}

function resolveStyle(query, fallback = "daily") {
  if (/office|work|suit|tailor|通勤|办公|西装/i.test(query)) return "tailored";
  if (/soft|柔|周末|约会|cream/i.test(query)) return "soft";
  if (/layer|warm|叠穿|保暖/i.test(query)) return "daily-layers";
  if (/leather|皮衣|夜晚|酷/i.test(query)) return "night";
  if (/daily|today|outfit|牛仔|日常|今天/i.test(query)) return "daily";
  return fallback;
}

function answerCopy(id) {
  if (id === "daily") return [
    'For <strong>cool mornings and a warmer midday</strong>, go for light layers.',
    'A crisp white tee, relaxed overshirt, and light-wash straight jeans <strong>keep things fresh and easy</strong>, while white sneakers give the look a <strong>clean finish</strong>. Breathable for midday, just covered enough for the cooler hours.'
  ];
  if (id === "soft") return [
    'Keep the palette soft and let the <strong>textures do the work</strong>.',
    'Swap structured layers for a creamy knit vest and a fluid ivory skirt. Suede ballet flats add warmth without extra weight — <strong>relaxed, light, and still put together</strong>.'
  ];
  if (id === "daily-layers") return [
    'Keep the white tee and light denim, then add a <strong>lightweight trench coat</strong> for a little more coverage.',
    'Wear it open to keep a long, easy line. White sneakers hold onto the casual mood, while the coat adds <strong>structure without bulk</strong>.'
  ];
  if (id === "tailored") return [
    'For an office-friendly version, choose <strong>soft tailoring and clean lines</strong>.',
    'A taupe blazer and matching wide-leg trousers make an easy set. Keep the white tee underneath and finish with black loafers. It feels <strong>polished enough for work</strong>, with room to move.'
  ];
  return [escapeHTML(byId(id).answer)];
}

function chatTurnHTML(turn) {
  const trend = byId(turn.trendId);
  const heading = turn.trendId === "soft" ? "A Softer Everyday Look" : turn.trendId === "tailored" ? "An Easy Office-Friendly Look" : trend.title;
  return `<section class="conversation-turn">
    ${questionBubble(turn.query)}
    <article class="stylist-answer">
      <h2><span class="answer-sparkle">${icon("sparkle")}</span>${escapeHTML(heading)}</h2>
      ${answerCopy(turn.trendId).map(p => `<p>${p}</p>`).join("")}
      <button class="outfit-flatlay" data-action="tryon" data-trend="${trend.id}" aria-label="Try on ${escapeHTML(heading)}">
        ${img(trend.flatlay, "square", heading + " outfit flat lay", "eager")}${tryPill()}
      </button>
    </article>
    <div class="quick-followups" aria-label="Refine this outfit">
      <button data-action="followup" data-trend="soft">Make it softer</button>
      <button data-action="followup" data-trend="daily-layers">Add more layers</button>
      <button data-action="followup" data-trend="tailored">Make it office-friendly</button>
    </div>
  </section>`;
}

function startStylist(query, trendId = "daily", infer = false) {
  const cleanQuery = query.trim().slice(0, 500) || byId(trendId).ask;
  chatTurns.length = 0;
  chatTurns.push({ query:cleanQuery, trendId:infer ? resolveStyle(cleanQuery, trendId) : trendId });
  $("chatView").innerHTML = `${deviceStatus()}
    <header class="ask-heading"><button class="nav-btn" data-action="back" aria-label="Back to Fashion Lab">${icon("back")}</button><h1>${icon("sparkle")}Ask AI</h1></header>
    <div class="conversation-scroll" id="chatMessages" role="region" aria-label="Styling conversation" tabindex="0">${chatTurnHTML(chatTurns[0])}</div>
    ${conversationFooter("chat")}`;
  show("chat");
}

function askStylist(query, trendId) {
  const cleanQuery = query.trim().slice(0, 500);
  if (!cleanQuery) return;
  const turn = { query:cleanQuery, trendId:trendId || resolveStyle(cleanQuery, chatTurns.at(-1)?.trendId || "daily") };
  chatTurns.push(turn);
  const messages = $("chatMessages");
  messages.querySelector(".quick-followups")?.remove();
  messages.insertAdjacentHTML("beforeend", chatTurnHTML(turn));
  $("chatInput").value = "";
  revealNewTurn(messages);
}

function revealNewTurn(container) {
  const turn = container.lastElementChild;
  container.scrollTop += turn.getBoundingClientRect().top - container.getBoundingClientRect().top;
}

function itemTurnHTML(query, options = itemOptions) {
  return `<section class="conversation-turn">
    ${questionBubble(query)}
    <article class="item-principle">
      <h3>${icon("sparkle")}Overall Styling Principle</h3>
      <p>A tweed jacket is already refined and elegant, so it pairs best with <strong>clean silhouettes, simple colors, and textured fabrics</strong>. This keeps the look polished without feeling too busy.</p>
    </article>
    <div class="item-suggestions">
      ${options.map(option => `<article class="item-suggestion">
        <h3><span class="option-swatch ${option.swatch}" aria-hidden="true"></span>${option.title}</h3>
        <div class="suggestion-detail">
          <button class="outfit-flatlay item-outfit" data-action="tryon" data-trend="${option.id}" data-cat="Pants" aria-label="Try on ${option.title}">
            ${img(byId(option.id).flatlay, "square", option.title + " with a cream tweed jacket", "eager")}${tryPill()}
          </button>
          <p>${option.description}</p>
        </div>
      </article>`).join("")}
    </div>
  </section>`;
}

function openItemStylist() {
  if (!itemInitialized) {
    $("itemView").innerHTML = `
      <div class="item-store" id="itemStore">
        ${deviceStatus()}
        <nav class="store-nav" aria-label="Product navigation">
          <button class="nav-btn" data-action="back" aria-label="Back to Fashion Lab">${icon("back")}</button>
          <strong>Fashion Lab</strong><span aria-hidden="true">${icon("bag")}</span>
        </nav>
        <article class="store-product">
          <div class="store-product-photo">${img(tweedJacket[3], "square", tweedJacket[0], "eager")}</div>
          <p class="eyebrow">The everyday edit</p><h1>${tweedJacket[0]}</h1>
          <p>Cream · textured weave<br>A timeless cropped shape, finished with gold-tone buttons.</p>
          <button class="item-style-button" data-action="open-item-sheet">${icon("item")}Style this item</button>
        </article>
      </div>
      <div class="item-dimmer" id="itemDimmer" hidden></div>
      <section class="item-sheet" id="itemSheet" role="dialog" aria-modal="true" aria-labelledby="itemAssistantTitle" tabindex="-1" hidden>
        <div class="sheet-handle" aria-hidden="true"></div>
        <header class="sheet-heading"><h2 id="itemAssistantTitle">${icon("item")}AI assistant</h2><button class="sheet-close" data-action="close-item-sheet" aria-label="Close AI assistant">${icon("close")}</button></header>
        <div class="conversation-scroll" id="itemMessages" role="region" aria-label="Jacket styling conversation" tabindex="0">
          ${itemTurnHTML("What pants go with a Chanel-style jacket?")}
        </div>
        ${conversationFooter("item")}
      </section>`;
    itemInitialized = true;
  }
  show("item");
  setItemSheet(true);
}

function setItemSheet(open) {
  stopVoiceInput();
  if (open) itemSheetReturnFocus = $("itemStore").querySelector(".item-style-button");
  $("itemSheet").hidden = !open;
  $("itemDimmer").hidden = !open;
  $("itemStore").inert = open;
  if (open) focusItemSheet();
  else itemSheetReturnFocus?.focus({ preventScroll:true });
}

function focusItemSheet() {
  $("itemSheet").querySelector(".sheet-close").focus({ preventScroll:true });
}

function askAboutItem(query) {
  const cleanQuery = query.trim().slice(0, 500);
  if (!cleanQuery) return;
  let options = itemOptions;
  if (/black|work|office|黑|办公|通勤/i.test(cleanQuery)) options = [itemOptions[0]];
  else if (/jeans|denim|casual|牛仔|休闲/i.test(cleanQuery)) options = [itemOptions[1]];
  else if (/white|soft|wide|白|柔|阔腿/i.test(cleanQuery)) options = [itemOptions[2]];
  $("itemMessages").insertAdjacentHTML("beforeend", itemTurnHTML(cleanQuery, options));
  $("itemInput").value = "";
  revealNewTurn($("itemMessages"));
}

function stopVoiceInput() {
  if (voiceSession) {
    voiceSession.abort();
    voiceSession = null;
  }
}

function startVoiceInput(button) {
  if (voiceSession) { stopVoiceInput(); return; }
  const footer = button.closest(".conversation-footer");
  const status = footer.querySelector(".voice-status");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    status.textContent = "Voice input isn't available in this browser. Type your message below.";
    footer.querySelector("input").focus();
    return;
  }
  const recognition = new SpeechRecognition();
  voiceSession = recognition;
  recognition.lang = navigator.language || "en-US";
  recognition.interimResults = false;
  recognition.onstart = () => {
    button.classList.add("is-recording");
    button.setAttribute("aria-label", "Stop voice input");
    status.textContent = "Listening… Tap the microphone to stop.";
  };
  recognition.onresult = event => {
    footer.querySelector("input").value = event.results[0][0].transcript.slice(0, 500);
    status.textContent = "Ready to send. You can edit your message first.";
  };
  recognition.onerror = event => {
    status.textContent = event.error === "aborted" ? "" : "Voice input couldn't start. You can type your message below.";
  };
  recognition.onend = () => {
    button.classList.remove("is-recording");
    button.setAttribute("aria-label", "Use voice input");
    if (status.textContent.startsWith("Listening")) status.textContent = "";
    if (voiceSession === recognition) voiceSession = null;
  };
  try { recognition.start(); }
  catch { voiceSession = null; status.textContent = "Voice input isn't available. Type your message below."; }
}

document.addEventListener("click", event => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  if (target.dataset.action === "followup") askStylist(target.textContent, target.dataset.trend);
  if (target.dataset.action === "close-item-sheet") setItemSheet(false);
  if (target.dataset.action === "open-item-sheet") setItemSheet(true);
  if (target.dataset.action === "voice") startVoiceInput(target);
});

document.addEventListener("submit", event => {
  const form = event.target;
  if (!["homeAsk", "chatForm", "itemForm"].includes(form.id)) return;
  event.preventDefault();
  stopVoiceInput();
  const query = form.querySelector("input").value;
  if (!query.trim()) { form.querySelector("input").focus(); return; }
  if (form.id === "homeAsk") { startStylist(query, "daily", true); form.reset(); }
  if (form.id === "chatForm") askStylist(query);
  if (form.id === "itemForm") askAboutItem(query);
  form.closest(".conversation-footer")?.querySelector(".voice-status").replaceChildren();
});

document.addEventListener("keydown", event => {
  if (currentView !== "item" || $("itemSheet").hidden) return;
  if (event.key === "Escape") { event.preventDefault(); setItemSheet(false); return; }
  if (event.key !== "Tab") return;
  const focusable = [...$("itemSheet").querySelectorAll('button, input, [tabindex="0"]')]
    .filter(el => !el.disabled && el.getClientRects().length);
  const first = focusable[0], last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
