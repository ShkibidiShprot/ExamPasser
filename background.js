const GEMINI_MODEL = "gemini-3.5-flash-lite";
const DEFAULT_SYSTEM_INSTRUCTION =
  "Ответь на вопрос. Дай максимально короткий ответ. Каждый раз присматривайся к оформлению задачь, ведь они могут быть с двойным или более ответом. Только букву/вариант ответа без самого решения, только ответ. Иначе, если в варианте ответа есть 2 и более ответов, пиши сразу все ответы через запятую, а не только один. Если на картинке нету варианта ответа, то номеруй его сам от 1 и до скольки хочешь. Даже если очень хочется НИКОГДА не отправляй больше чем просто ответ одной или больше буквами.Если ты видишь не тесты или что-то другое, то отправляй только \"!\". ЗАПОМНИ НИКОГДА никогда нельзя отправлять ничего кроме ответа на тесты.";
// Image understanding on the current Flash model can exceed 15 seconds,
// especially on a free-tier project. Keep a bounded but usable deadline.
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_GEMINI_ATTEMPTS = 3;
const RETRYABLE_HTTP_STATUSES = new Set([429, 500, 502, 503, 504]);
const AUTO_CAPTURE_ALARM = "quickpeek-auto-capture";

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason !== "install") return;
  const settings = await chrome.storage.local.get(["captureMode", "captureIntervalSeconds", "language"]);
  const defaults = {};
  if (settings.captureMode === undefined) defaults.captureMode = "manual";
  if (settings.captureIntervalSeconds === undefined) defaults.captureIntervalSeconds = 60;
  if (settings.language === undefined) defaults.language = "uk";
  if (Object.keys(defaults).length > 0) await chrome.storage.local.set(defaults);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== AUTO_CAPTURE_ALARM) return;
  console.info("ExamPasser: automatic capture alarm fired");
  if (!requestInFlight) startAnalysis();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && (changes.captureMode || changes.captureIntervalSeconds || changes.captureIntervalMinutes)) {
    void syncAutoSchedule();
  }
});

void syncAutoSchedule();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "update-shortcut" || typeof message.shortcut !== "string") return;
  updateCommandShortcut(message.shortcut)
    .then(() => sendResponse({ ok: true, shortcut: message.shortcut }))
    .catch((error) => sendResponse({ ok: false, error: error?.message || "Не удалось изменить shortcut" }));
  return true;
});

let requestInFlight = false;

chrome.commands.onCommand.addListener((command) => {
  if ((command !== "analyze-screen" && command !== "analyze-screen-safe") || requestInFlight) return;

  startAnalysis();
});

chrome.action.onClicked.addListener(() => {
  if (requestInFlight) return;
  startAnalysis();
});

function startAnalysis() {
  requestInFlight = true;
  analyzeActiveTab().finally(() => {
    requestInFlight = false;
  });
}

async function syncAutoSchedule() {
  try {
    await chrome.alarms.clear(AUTO_CAPTURE_ALARM);
    const settings = await chrome.storage.local.get({
      captureMode: "manual",
      captureIntervalSeconds: 60,
      captureIntervalMinutes: 1
    });
    if (settings.captureMode !== "automatic") {
      console.info("ExamPasser: automatic mode disabled");
      return;
    }
    const legacySeconds = Number(settings.captureIntervalMinutes) * 60;
    const rawInterval = Number(settings.captureIntervalSeconds ?? legacySeconds);
    const intervalSeconds = Number.isFinite(rawInterval) ? Math.min(86400, Math.max(20, rawInterval)) : 60;
    await chrome.alarms.create(AUTO_CAPTURE_ALARM, {
      delayInMinutes: intervalSeconds / 60,
      periodInMinutes: intervalSeconds / 60
    });
    console.info(`ExamPasser: automatic capture scheduled every ${intervalSeconds}s`);
  } catch (error) {
    console.error("ExamPasser: failed to schedule automatic capture", error);
  }
}

async function analyzeActiveTab() {
  let tab;
  try {
    [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab?.id || isUnsupportedUrl(tab.url)) return;

    await ensureContentScript(tab.id);
    await sendMessage(tab.id, { type: "show-loading" });

    const settings = await chrome.storage.local.get({
      apiKey: "",
      systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
      modelMode: "fast"
    });
    const apiKey = typeof settings.apiKey === "string" ? settings.apiKey.trim() : "";
    if (!apiKey) {
      await sendMessage(tab.id, { type: "show-result", text: "!" });
      return;
    }

    const imageDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: "jpeg",
      quality: 80
    });
    const imageBase64 = imageDataUrl.replace(/^data:image\/jpeg;base64,/, "");
    if (!imageBase64) throw new Error("Screenshot data is empty");

    const text = await requestGemini({
      apiKey,
      imageBase64,
      model: GEMINI_MODEL,
      systemInstruction:
        enforceCompactInstruction(settings.systemInstruction),
    });
    await sendMessage(tab.id, { type: "show-result", text });
  } catch (error) {
    console.warn("ExamPasser request failed:", error);
    if (tab?.id && !isUnsupportedUrl(tab.url)) {
      await sendMessage(tab.id, { type: "show-result", text: "?" });
    }
  }
}

function isUnsupportedUrl(url = "") {
  return /^(chrome|chrome-extension|edge|about|brave|opera|devtools|view-source):/i.test(url) ||
    /^https?:\/\/chrome\.google\.com\/webstore/i.test(url) ||
    /^https?:\/\/(?:[^/]+\.)?chromewebstore\.google\.com/i.test(url);
}

async function ensureContentScript(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "ping" });
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
  }
}

function sendMessage(tabId, message) {
  return chrome.tabs.sendMessage(tabId, message).catch(() => undefined);
}

async function requestGemini({ apiKey, imageBase64, model, systemInstruction }) {
  for (let attempt = 1; attempt <= MAX_GEMINI_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              maxOutputTokens: 16,
              thinkingConfig: { thinkingLevel: "LOW" }
            },
            contents: [{
              role: "user",
              parts: [{ inline_data: { mime_type: "image/jpeg", data: imageBase64 } }]
            }]
          })
        }
      );
      if (!response.ok) {
        const details = await response.text().catch(() => "");
        const error = new Error(`Gemini HTTP ${response.status}: ${details.slice(0, 500)}`);
        if (!RETRYABLE_HTTP_STATUSES.has(response.status) || attempt === MAX_GEMINI_ATTEMPTS) {
          throw error;
        }
        await sleep(getRetryDelay(attempt));
        continue;
      }
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text !== "string" || !text.trim()) throw new Error("Gemini returned no text");
      return compactAnswer(text);
    } catch (error) {
      if (attempt === MAX_GEMINI_ATTEMPTS || !isRetryableError(error)) throw error;
      await sleep(getRetryDelay(attempt));
    } finally {
      clearTimeout(timeoutId);
    }
  }
  throw new Error("Gemini request exhausted all retry attempts");
}

function compactAnswer(value) {
  const firstLine = String(value).split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "?";
  return firstLine
    .replace(/^(ответ|ответ правильный|правильный ответ)\s*[:\-]\s*/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "?";
}

function enforceCompactInstruction(value) {
  const instruction = typeof value === "string" && value.trim() ? value.trim() : DEFAULT_SYSTEM_INSTRUCTION;
  return `${instruction}\n\nКРИТИЧЕСКОЕ ПРАВИЛО ФОРМАТА: верни только букву или номера вариантов через запятую. Без решения, объяснений, рассуждений и вводных слов. Максимум одна короткая строка.`;
}

function isRetryableError(error) {
  return error?.name === "AbortError" || /Gemini HTTP (429|500|502|503|504):/.test(error?.message ?? "");
}

function getRetryDelay(attempt) {
  return Math.min(4000, 1000 * 2 ** (attempt - 1));
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function updateCommandShortcut(shortcut) {
  const commandsApi = globalThis.browser?.commands ?? chrome.commands;
  if (typeof commandsApi?.update !== "function") {
    throw new Error("Zen не поддерживает программную настройку shortcut");
  }
  const details = { name: "analyze-screen", shortcut };
  if (commandsApi.update.length < 2) return Promise.resolve(commandsApi.update(details));
  return new Promise((resolve, reject) => {
    commandsApi.update(details, () => {
      const runtimeError = chrome.runtime?.lastError;
      if (runtimeError) reject(new Error(runtimeError.message));
      else resolve();
    });
  });
}
