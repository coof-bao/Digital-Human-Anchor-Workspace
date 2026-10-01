/* Real conversations. Model replies also populate the existing outfit preview. */
icons.close = '<path d="m6 6 12 12M18 6 6 18"/>';
icons.bag = '<path d="M5 7h14l1 14H4L5 7Zm4 0V5a3 3 0 0 1 6 0v2"/>';

const tweedJacket = ["Cropped Tweed Jacket", "Cream · textured weave", "",
  "cream cropped collarless tweed jacket with small gold buttons, front view isolated product photograph on warm white background, realistic woven wool texture, no text, no logos"];
const conversations = {
  chat: { history:[], turns:[], pending:null },
  item: { history:[], turns:[], pending:null }
};
let itemInitialized = false;
let itemSheetReturnFocus = null;
let voiceSession = null;
let nextTurn = 0;
const deviceStatus = () => `<div class="device-status conversation-status" aria-hidden="true"><span>8:00</span><span>${icon("signal")}${icon("wifi")}${icon("battery")}</span></div>`;
const tryPill = () => `<span class="try-pill">${icon("sparkle")}Try it on</span>`;
const questionBubble = query => `<p class="question-bubble">${escapeHTML(query)}</p>`;
const homeIndicator = () => '<div class="home-indicator" aria-hidden="true"></div>';
const paragraphs = text => String(text).split(/\n+/).filter(Boolean).map(p => `<p>${escapeHTML(p)}</p>`).join("");
const apiBase = (window.FASHION_API_BASE ||
  (location.hostname.endsWith(".github.io") ? "http://127.0.0.1:8790" : location.origin)).replace(/\/$/, "");

function conversationFooter(kind) {
  const isItem = kind === "item";
  return `<footer class="conversation-footer">
    <form class="conversation-composer" id="${kind}Form">
      ${isItem ? "" : icon("sparkle").replace('class="ui-icon', 'class="input-sparkle ui-icon')}
      <input id="${kind}Input" placeholder="${isItem ? "Send a message..." : "Tell me what to change..."}" aria-label="${isItem ? "Ask about this jacket" : "Tell me what to change"}" maxlength="2000" autocomplete="off">
      <button class="composer-action voice-message" type="button" data-action="voice" aria-label="Use voice input">${icon("mic")}</button>
      <button class="composer-action send-message" type="submit" aria-label="Send message">${icon("arrow")}</button>
    </form>
    <p class="voice-status" role="status"></p>
    ${homeIndicator()}
  </footer>`;
}

function registerLook(look, id, query) {
  const garments = look.items.map(item => item.search_query).join(", ");
  const products = {};
  look.items.forEach(item => {
    products[item.category] = [[item.name, item.color, "",
      `${item.search_query}, isolated garment product photograph on warm ivory background, realistic fabric texture, soft studio light, no people, no text, no logos`,
      item.search_query]];
  });
  const trend = {
    id, generated:true, title:look.title, tab:look.title, ask:query,
    answer:look.description, article:look.description,
    reasons:look.items.map(item => item.reason).filter(Boolean), products,
    hero:`full body realistic fashion editorial photograph of an adult model wearing ${garments}, head to toe, natural daylight, neutral studio backdrop, accurate fabrics, no text, no logos`,
    flatlay:`top down realistic studio flat lay photograph of a complete outfit: ${garments}, neatly arranged on warm ivory linen, natural soft light, realistic fabric texture, no people, no text, no labels`
  };
  trends.push(trend);
  return trend;
}

function answerHTML(turn, kind) {
  const { answer, looks } = turn;
  const followups = `<div class="quick-followups" aria-label="Continue the conversation">
    ${answer.followups.map(text => `<button data-action="followup" data-kind="${kind}">${escapeHTML(text)}</button>`).join("")}
  </div>`;
  if (kind === "item") {
    return `<article class="item-principle"><h3>${icon("sparkle")}Styling notes</h3>${paragraphs(answer.reply)}</article>
      <div class="item-suggestions">${looks.map(look => `<article class="item-suggestion">
        <h3><span class="option-swatch" aria-hidden="true"></span>${escapeHTML(look.title)}</h3>
        <div class="suggestion-detail">
          <button class="outfit-flatlay item-outfit" data-action="tryon" data-trend="${look.id}" aria-label="Try on ${escapeHTML(look.title)}">
            ${img(look.flatlay, "square", look.title, "eager")}${tryPill()}
          </button><p>${escapeHTML(look.article)}</p>
        </div></article>`).join("")}</div>${followups}`;
  }
  return `<article class="stylist-answer">
    <h2><span class="answer-sparkle">${icon("sparkle")}</span>Your AI stylist</h2>
    ${paragraphs(answer.reply)}
    ${looks.map(look => `<section class="generated-look">
      <h3>${escapeHTML(look.title)}</h3>
      <button class="outfit-flatlay" data-action="tryon" data-trend="${look.id}" aria-label="Try on ${escapeHTML(look.title)}">
        ${img(look.flatlay, "square", look.title, "eager")}${tryPill()}
      </button><p>${escapeHTML(look.article)}</p>
    </section>`).join("")}</article>${followups}`;
}

function renderTurn(kind, turn) {
  const node = $(turn.id);
  if (!node) return;
  const isChinese = /[\u3400-\u9fff]/.test(turn.query);
  let content;
  if (turn.status === "pending") {
    content = `<div class="reply-state" role="status"><span class="thinking-dot"></span>
      <span>${isChinese ? "正在整理适合你的搭配…" : "Thinking through your look…"}</span>
      <button data-action="cancel-reply" data-kind="${kind}">${isChinese ? "停止等待" : "Stop"}</button></div>`;
  } else if (turn.status === "done") {
    content = answerHTML(turn, kind);
  } else {
    content = `<div class="reply-state reply-error" role="status">
      <span>${escapeHTML(turn.error || (isChinese ? "已停止等待回复。" : "Stopped waiting for this reply."))}</span>
      <button data-action="retry-reply" data-kind="${kind}" data-turn="${turn.id}">${isChinese ? "重试" : "Retry"}</button></div>`;
  }
  node.innerHTML = questionBubble(turn.query) + content;
}

function setBusy(kind, busy) {
  const form = $(kind + "Form");
  form?.setAttribute("aria-busy", String(busy));
  form?.querySelectorAll("button").forEach(button => { button.disabled = busy; });
  // Input remains editable while waiting; sending is locked to avoid crossed replies.
}

function revealNewTurn(container) {
  const turn = container.lastElementChild;
  if (turn) container.scrollTop += turn.getBoundingClientRect().top - container.getBoundingClientRect().top;
}

async function requestAnswer(kind, turn) {
  const state = conversations[kind];
  if (state.pending) return;
  const controller = new AbortController();
  state.pending = { turn, controller };
  turn.status = "pending";
  turn.error = "";
  renderTurn(kind, turn);
  setBusy(kind, true);
  let timedOut = false;
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 90000);
  try {
    // Fresh application session on each call also recovers after server restarts.
    const sessionResponse = await fetch(apiBase + "/api/session", { signal:controller.signal, cache:"no-store" });
    if (!sessionResponse.ok) throw new Error("对话服务尚未连接，请启动 Fashion Lab 对话服务后重试。");
    const session = await sessionResponse.json();
    const response = await fetch(apiBase + "/api/chat", {
      method:"POST", signal:controller.signal,
      headers:{ "Content-Type":"application/json", "X-Fashion-Session":session.token },
      body:JSON.stringify({ mode:kind, messages:turn.messages })
    });
    const answer = await response.json();
    if (!response.ok) throw new Error(answer.error || "暂时无法回复，请重试。");
    if (state.pending?.controller !== controller) return;
    if (typeof answer.reply !== "string" || !Array.isArray(answer.looks) || !Array.isArray(answer.followups)) {
      throw new Error("回复内容不完整，请重试。");
    }
    turn.answer = answer;
    turn.looks = answer.looks.map((look, index) => registerLook(look, `${turn.id}-look-${index}`, turn.query));
    turn.status = "done";
    state.history = [...turn.messages, { role:"assistant", content:JSON.stringify(answer) }];
    renderTurn(kind, turn);
  } catch (error) {
    if (state.pending?.controller !== controller) return;
    turn.status = "error";
    turn.error = timedOut ? "回复超时，请重试。" : error.name === "AbortError" ? "" :
      error instanceof TypeError ? "暂时无法连接对话服务，请确认服务已启动后重试。" : error.message;
    renderTurn(kind, turn);
  } finally {
    clearTimeout(timeout);
    if (state.pending?.controller === controller) {
      state.pending = null;
      setBusy(kind, false);
    }
  }
}

function cancelReply(kind) {
  const state = conversations[kind];
  if (!state.pending) return;
  const { turn, controller } = state.pending;
  state.pending = null; // Ignore any late response, even if fetch just completed.
  controller.abort();
  turn.status = "cancelled";
  turn.error = "";
  renderTurn(kind, turn);
  setBusy(kind, false);
}

function sendMessage(kind, query) {
  const state = conversations[kind];
  const clean = query.trim().slice(0, 2000);
  if (!clean || state.pending) return;
  const container = $(kind + "Messages");
  container.querySelectorAll(".quick-followups, [data-action='retry-reply']").forEach(el => el.remove());
  // Retain the initial preferences and the seven most recent exchanges.
  const history = state.history.length > 16 ? [...state.history.slice(0, 2), ...state.history.slice(-14)] : state.history;
  const turn = { id:`turn-${++nextTurn}`, query:clean, status:"pending",
    messages:[...history, { role:"user", content:clean }] };
  state.turns.push(turn);
  container.insertAdjacentHTML("beforeend", `<section class="conversation-turn" id="${turn.id}"></section>`);
  $(kind + "Input").value = "";
  requestAnswer(kind, turn);
  revealNewTurn(container);
}

function startStylist(query) {
  cancelReply("chat");
  conversations.chat.history = [];
  conversations.chat.turns = [];
  $("chatView").innerHTML = `${deviceStatus()}
    <header class="ask-heading"><button class="nav-btn" data-action="back" aria-label="Back to Fashion Lab">${icon("back")}</button><h1>${icon("sparkle")}Ask AI</h1></header>
    <div class="conversation-scroll" id="chatMessages" role="region" aria-label="Styling conversation" tabindex="0"></div>
    ${conversationFooter("chat")}`;
  show("chat");
  sendMessage("chat", query || "Inspirations for today's outfit");
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
        <div class="conversation-scroll" id="itemMessages" role="region" aria-label="Jacket styling conversation" tabindex="0"></div>
        ${conversationFooter("item")}
      </section>`;
    itemInitialized = true;
  }
  show("item");
  setItemSheet(true);
  if (!conversations.item.turns.length) sendMessage("item", "What pants go with this tweed jacket? Give me two different outfits.");
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
    footer.querySelector("input").value = event.results[0][0].transcript.slice(0, 2000);
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
  const { action, kind } = target.dataset;
  if (action === "followup") sendMessage(kind, target.textContent);
  if (action === "cancel-reply") cancelReply(kind);
  if (action === "retry-reply") {
    const state = conversations[kind], turn = state.turns.at(-1);
    if (turn?.id === target.dataset.turn && !state.pending) requestAnswer(kind, turn);
  }
  if (action === "close-item-sheet") setItemSheet(false);
  if (action === "open-item-sheet") setItemSheet(true);
  if (action === "voice") startVoiceInput(target);
});

document.addEventListener("submit", event => {
  const form = event.target;
  if (!["homeAsk", "chatForm", "itemForm"].includes(form.id)) return;
  event.preventDefault();
  stopVoiceInput();
  const query = form.querySelector("input").value;
  if (!query.trim()) { form.querySelector("input").focus(); return; }
  if (form.id === "homeAsk") { startStylist(query); form.reset(); }
  else sendMessage(form.id === "chatForm" ? "chat" : "item", query);
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
