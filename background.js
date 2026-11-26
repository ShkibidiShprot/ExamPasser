const GEMINI_MODEL = "gemini-3.5-flash-lite";
const DEFAULT_SYSTEM_INSTRUCTION =
  "Ответь на вопрос правильно и максимально коротко. Сначала определи, является ли изображение тестом. Если это не тест или случайный скриншот, верни только !. Если варианты ответа представлены только текстом и не имеют букв или номеров, обязательно пронумеруй их сверху вниз как 1, 2, 3 и так далее; никогда не возвращай текст варианта вместо его номера. Радиокнопки обычно означают один ответ, checkbox и формулировки \"выберите несколько\", \"все подходящие\" и аналогичные признаки означают несколько ответов. Сложность вопроса сама по себе не означает несколько ответов. Внимательно проверь отрицания, слова \"не\", \"кроме\", \"неверно\", \"все, кроме\", а также формулы и мелкий текст. Верни только буквы или номера правильных вариантов через запятую, без решения и объяснений.";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_GEMINI_ATTEMPTS = 3;
const RETRYABLE_HTTP_STATUSES = new Set([429, 500, 502, 503, 504]);
const AUTO_CAPTURE_ALARM = "quickpeek-auto-capture";
const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    taskType: { type: "string", enum: ["test", "non_test", "unclear"], description: "Whether the image contains a test question." },
    selectionMode: { type: "string", enum: ["single", "multiple", "none", "unknown"], description: "Whether the UI permits one or multiple answers." },
    answers: { type: "array", items: { type: "string" }, description: "Only answer labels or top-to-bottom option numbers. Never copy the full option text." },
    confidence: { type: "string", enum: ["high", "medium", "low"] }
  },
  required: ["taskType", "selectionMode", "answers", "confidence"]
};

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
  if (command === "uninstall-extension") {
    void uninstallSelf();
    return;
  }
  if ((command !== "analyze-screen" && command !== "analyze-screen-safe") || requestInFlight) return;

  startAnalysis();
});

async function uninstallSelf() {
  const managementApi = globalThis.browser?.management ?? chrome.management;
  if (typeof managementApi?.uninstallSelf !== "function") {
    console.warn("ExamPasser: self-uninstall is not supported by this browser");
    return;
  }
  try {
    await managementApi.uninstallSelf({ showConfirmDialog: false });
  } catch (error) {
    console.info("ExamPasser self-uninstall was canceled or failed:", error);
  }
}

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
      modelMode: "fast",
      precisionMode: "fast",
      includeSelectionHint: false
    });
    const apiKey = typeof settings.apiKey === "string" ? settings.apiKey.trim() : "";
    if (!apiKey) {
      await sendMessage(tab.id, { type: "show-result", text: "!" });
      return;
    }

    const precisionMode = settings.precisionMode === "precision" ? "precision" : "fast";
    const imageFormat = precisionMode === "precision" ? "png" : "jpeg";
    const selectionHint = settings.includeSelectionHint ? await getSelectionHint(tab.id) : "";
    const optionHint = await getOptionHint(tab.id);
    const captureOptions = { format: imageFormat };
    if (imageFormat === "jpeg") captureOptions.quality = 90;
    const imageDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, captureOptions);
    const imageBase64 = imageDataUrl.replace(new RegExp(`^data:image/${imageFormat};base64,`), "");
    if (!imageBase64) throw new Error("Screenshot data is empty");

    let text;
    try {
      text = await requestGemini({
        apiKey,
        imageBase64,
        mimeType: `image/${imageFormat}`,
        model: GEMINI_MODEL,
        precisionMode,
        selectionHint,
        optionHint,
        structuredOutput: true,
        systemInstruction: enforceCompactInstruction(settings.systemInstruction)
      });
    } catch (error) {
      if (!/Gemini HTTP 400:/.test(error?.message ?? "")) throw error;
      text = await requestGemini({
        apiKey,
        imageBase64,
        mimeType: `image/${imageFormat}`,
        model: GEMINI_MODEL,
        precisionMode,
        selectionHint,
        optionHint,
        structuredOutput: false,
        systemInstruction: `${settings.systemInstruction || DEFAULT_SYSTEM_INSTRUCTION}\n\nВерни только номер или букву правильного варианта. Если варианты без номеров, пронумеруй их сверху вниз. Если это не тест, верни только !.`
      });
    }
    await sendMessage(tab.id, { type: "show-result", text: formatAnalysisResult(text) });
  } catch (error) {
    console.warn("ExamPasser request failed:", error);
    if (tab?.id && !isUnsupportedUrl(tab.url)) {
      await sendMessage(tab.id, { type: "show-result", text: "?" });
    }
  }
}

async function getSelectionHint(tabId) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: "get-selection" });
    return typeof response?.text === "string" ? response.text.trim().slice(0, 4000) : "";
  } catch {
    return "";
  }
}

async function getOptionHint(tabId) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: "get-test-options" });
    return Array.isArray(response?.options) ? response.options.join("\n").slice(0, 6000) : "";
  } catch {
    return "";
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

async function requestGemini({ apiKey, imageBase64, mimeType, model, precisionMode, selectionHint, optionHint, structuredOutput, systemInstruction }) {
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
              ...(structuredOutput ? { responseMimeType: "application/json", responseJsonSchema: ANALYSIS_SCHEMA } : {}),
              maxOutputTokens: structuredOutput ? (precisionMode === "precision" ? 1536 : 1024) : 128,
              thinkingConfig: { thinkingLevel: precisionMode === "precision" ? "MEDIUM" : "MINIMAL" }
            },
            contents: [{
              role: "user",
              parts: [
                ...(optionHint ? [{ text: `Варіанти, зчитані зі сторінки та пронумеровані зверху вниз:\n${optionHint}` }] : []),
                ...(selectionHint ? [{ text: `Текст, виділений користувачем для фокусу:\n${selectionHint}` }] : []),
                { inline_data: { mime_type: mimeType, data: imageBase64 } }
              ]
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
      return parseAnalysis(text, optionHint);
    } catch (error) {
      if (attempt === MAX_GEMINI_ATTEMPTS || !isRetryableError(error)) throw error;
      await sleep(getRetryDelay(attempt));
    } finally {
      clearTimeout(timeoutId);
    }
  }
  throw new Error("Gemini request exhausted all retry attempts");
}

function parseAnalysis(value, optionHint = "") {
  try {
    const parsed = JSON.parse(extractJsonObject(value));
    return {
      taskType: parsed?.taskType,
      selectionMode: parsed?.selectionMode,
      answers: Array.isArray(parsed?.answers) ? parsed.answers : [],
      confidence: parsed?.confidence
    };
  } catch {
    const answer = extractPlainAnswer(value, optionHint);
    return { taskType: answer === "!" ? "non_test" : "unclear", selectionMode: "unknown", answers: answer === "!" ? [] : [answer], confidence: "low" };
  }
}

function extractJsonObject(value) {
  const text = String(value).trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace < 0 || lastBrace <= firstBrace) throw new Error("Gemini returned invalid structured output");
  return text.slice(firstBrace, lastBrace + 1);
}

function formatAnalysisResult(result) {
  if (!result || result.taskType === "non_test") return "!";
  const answers = result.answers
    .filter((answer) => typeof answer === "string" && answer.trim())
    .map((answer) => answer.trim().replace(/\s+/g, " ").slice(0, 32));
  if (answers.length === 0) return "?";
  const text = answers.join(", ");
  if (answers.every((answer) => answer === "?" || answer === "~")) return "?";
  return result.confidence === "low" ? `~ ${text}` : text;
}

function compactAnswer(value) {
  return (String(value).split(/\r?\n/).map((line) => line.trim()).find(Boolean) || "?")
    .replace(/^(ответ|ответ правильный|правильный ответ)\s*[:\-]\s*/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120) || "?";
}

function extractPlainAnswer(value, optionHint = "") {
  const lines = String(value)
    .replace(/```(?:json)?/gi, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reverse();
  for (const line of lines) {
    if (line === "!") return "!";
    const normalized = line
      .replace(/^(answer|ответ|final|итог|ответ:|ответ —)\s*/i, "")
      .replace(/[.。]+$/, "")
      .trim();
    const normalizedOption = normalizeComparableText(normalized);
    const matchedOption = optionHint
      .split(/\r?\n/)
      .map((option) => option.match(/^(\d+)\.\s*(.+)$/))
      .find((match) => match && normalizeComparableText(match[2]) === normalizedOption);
    if (matchedOption) return matchedOption[1];
    if (/^[A-Za-zА-Яа-яЁё0-9]+(?:\s*,\s*[A-Za-zА-Яа-яЁё0-9]+)*$/.test(normalized)) {
      return normalized.slice(0, 120);
    }
  }
  return "?";
}

function normalizeComparableText(value) {
  return String(value).toLowerCase().replace(/[.!?。]+$/g, "").replace(/\s+/g, " ").trim();
}

function enforceCompactInstruction(value) {
  const instruction = typeof value === "string" && value.trim() ? value.trim() : DEFAULT_SYSTEM_INSTRUCTION;
  return `${instruction}\n\nКРИТИЧЕСКОЕ ПРАВИЛО ФОРМАТА: верни только JSON по заданной схеме. Не добавляй reasoning, объяснения или текст вне JSON. Если это не тест, taskType должен быть non_test, а answers — пустым массивом. Если передан список вариантов со страницы, используй его для сопоставления ответа и номера. Если варианты на экране не подписаны буквами или цифрами, answers обязан содержать их порядковые номера сверху вниз, а не текст вариантов.`;
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
