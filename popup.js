const DEFAULT_SYSTEM_INSTRUCTION =
  "Ответь на вопрос правильно и максимально коротко. Сначала определи, является ли изображение тестом. Если это не тест или случайный скриншот, верни только !. Если варианты ответа представлены только текстом и не имеют букв или номеров, обязательно пронумеруй их сверху вниз как 1, 2, 3 и так далее; никогда не возвращай текст варианта вместо его номера. Радиокнопки обычно означают один ответ, checkbox и формулировки \"выберите несколько\", \"все подходящие\" и аналогичные признаки означают несколько ответов. Сложность вопроса сама по себе не означает несколько ответов. Внимательно проверь отрицания, слова \"не\", \"кроме\", \"неверно\", \"все, кроме\", а также формулы и мелкий текст. Верни только буквы или номера правильных вариантов через запятую, без решения и объяснений.";
const DEFAULT_OPACITY = 0.45;
const DEFAULT_LANGUAGE = "uk";
const TRANSLATIONS = {
  uk: {
    tagline: "Найшвидші скріншоти — чесно!!!)", connection: "Підключення", apiKey: "Gemini API Key", hideApiKey: "Сховати API ключ", apiHelpTitle: "Як отримати API-ключ?", apiHelpStep1: "Увійдіть у Google-акаунт.", apiHelpStep2: "Відкрийте Google AI Studio та розділ API keys.", apiHelpStep3: "Натисніть Create API key і скопіюйте ключ.", apiHelpStep4: "Вставте ключ сюди та збережіть налаштування.", apiHelpOpen: "Відкрити Google AI Studio", apiHelpWarning: "Не передавайте API-ключ іншим і не публікуйте його в інтернеті.", systemInstruction: "Системна інструкція", automation: "Автоматизація", workMode: "Режим роботи", manualShort: "Ручний", automaticShort: "Автоматичний", manualMode: "Ручний — за гарячою клавішею", automaticMode: "Автоматичний — за інтервалом", interval: "Інтервал скриншота, секунд", response: "Відповідь", opacity: "Прозорість тексту", controls: "Керування", shortcut: "Гаряча клавіша", shortcutPlaceholder: "Ctrl+Shift+Q", shortcutHelp: "Ручне введення. Приклади: Ctrl+Shift+Q, Alt+Shift+A, Ctrl+Alt+P або F2.", applyShortcut: "Застосувати гарячу клавішу", save: "Зберегти налаштування", shortcutSettings: "Перейти до налаштувань", saved: "Збережено", saveError: "Помилка збереження", shortcutHint: "Натисніть Ctrl/Alt + клавішу", shortcutFormat: "Формат: Ctrl+Shift+Q або F2", shortcutApplied: "Гарячу клавішу встановлено", shortcutFallback: "Відкрийте about:addons → Керування сполученнями клавіш", loadError: "Не вдалося завантажити налаштування", notAssigned: "Не призначена"
  },
  ru: {
    tagline: "Самые быстрые скриншоты — честно!!!)", connection: "Подключение", apiKey: "Gemini API Key", hideApiKey: "Скрыть API ключ", apiHelpTitle: "Как получить API-ключ?", apiHelpStep1: "Войдите в Google-аккаунт.", apiHelpStep2: "Откройте Google AI Studio и раздел API keys.", apiHelpStep3: "Нажмите Create API key и скопируйте ключ.", apiHelpStep4: "Вставьте ключ сюда и сохраните настройки.", apiHelpOpen: "Открыть Google AI Studio", apiHelpWarning: "Не передавайте API-ключ другим и не публикуйте его в интернете.", systemInstruction: "Системная инструкция", automation: "Автоматизация", workMode: "Режим работы", manualShort: "Ручной", automaticShort: "Автоматический", manualMode: "Ручной — по горячей клавише", automaticMode: "Автоматический — по интервалу", interval: "Интервал скриншота, секунд", response: "Ответ", opacity: "Прозрачность текста", controls: "Управление", shortcut: "Горячая клавиша", shortcutPlaceholder: "Ctrl+Shift+Q", shortcutHelp: "Ручной ввод. Примеры: Ctrl+Shift+Q, Alt+Shift+A, Ctrl+Alt+P или F2.", applyShortcut: "Применить горячую клавишу", save: "Сохранить настройки", shortcutSettings: "Перейти в настройки", saved: "Сохранено", saveError: "Ошибка сохранения", shortcutHint: "Нажмите Ctrl/Alt + клавишу", shortcutFormat: "Формат: Ctrl+Shift+Q или F2", shortcutApplied: "Горячую клавішу встановлено", shortcutFallback: "Откройте about:addons → Управление сочетаниями клавиш", loadError: "Не удалось загрузить настройки", notAssigned: "Не назначена"
  },
  en: {
    tagline: "The fastest screenshots — honestly!!!)", connection: "Connection", apiKey: "Gemini API Key", hideApiKey: "Hide API key", apiHelpTitle: "How to get an API key?", apiHelpStep1: "Sign in to your Google account.", apiHelpStep2: "Open Google AI Studio and the API keys section.", apiHelpStep3: "Click Create API key and copy the key.", apiHelpStep4: "Paste the key here and save the settings.", apiHelpOpen: "Open Google AI Studio", apiHelpWarning: "Do not share your API key or publish it online.", systemInstruction: "System instruction", automation: "Automation", workMode: "Working mode", manualShort: "Manual", automaticShort: "Automatic", manualMode: "Manual — with a shortcut", automaticMode: "Automatic — by interval", interval: "Screenshot interval, seconds", response: "Response", opacity: "Text opacity", controls: "Controls", shortcut: "Keyboard shortcut", shortcutPlaceholder: "Ctrl+Shift+Q", shortcutHelp: "Manual input. Examples: Ctrl+Shift+Q, Alt+Shift+A, Ctrl+Alt+P or F2.", applyShortcut: "Apply keyboard shortcut", save: "Save settings", shortcutSettings: "Open settings", saved: "Saved", saveError: "Save error", shortcutHint: "Press Ctrl/Alt + a key", shortcutFormat: "Format: Ctrl+Shift+Q or F2", shortcutApplied: "Keyboard shortcut applied", shortcutFallback: "Open about:addons → Manage Extension Shortcuts", loadError: "Could not load settings", notAssigned: "Not assigned"
  }
};
Object.assign(TRANSLATIONS.uk, { precisionMode: "Точність аналізу", fastPrecision: "Швидкий режим", precisionPrecision: "Точний режим", selectionHint: "Використовувати виділений текст як підказку" });
Object.assign(TRANSLATIONS.ru, { precisionMode: "Точность анализа", fastPrecision: "Быстрый режим", precisionPrecision: "Точный режим", selectionHint: "Использовать выделенный текст как подсказку" });
Object.assign(TRANSLATIONS.en, { precisionMode: "Analysis accuracy", fastPrecision: "Fast mode", precisionPrecision: "Precision mode", selectionHint: "Use selected text as a hint" });
Object.assign(TRANSLATIONS.uk, { winterVibe: "Режим зимового вайбу", snowflakeHint: "Відкрити режим зимового вайбу" });
Object.assign(TRANSLATIONS.ru, { winterVibe: "Режим зимнего вайба", snowflakeHint: "Открыть режим зимнего вайба" });
Object.assign(TRANSLATIONS.en, { winterVibe: "Winter vibe mode", snowflakeHint: "Unlock winter vibe mode" });
const apiKeyInput = document.getElementById("api-key");
const hideApiKeyInput = document.getElementById("hide-api-key");
const instructionInput = document.getElementById("system-instruction");
const captureModeInput = document.getElementById("capture-mode");
const captureIntervalInput = document.getElementById("capture-interval");
const intervalField = document.getElementById("interval-field");
const modeButtons = [...document.querySelectorAll(".mode-button")];
const precisionModeInput = document.getElementById("precision-mode");
const selectionHintInput = document.getElementById("selection-hint");
const opacityInput = document.getElementById("opacity");
const opacityValue = document.getElementById("opacity-value");
const shortcutInput = document.getElementById("shortcut");
const applyShortcutButton = document.getElementById("apply-shortcut");
const saveButton = document.getElementById("save");
const shortcutSettingsButton = document.getElementById("shortcut-settings");
const languageInput = document.getElementById("language");
const status = document.getElementById("status");
const systemInstructionLabel = document.getElementById("system-instruction-label");
const snowflakeTrigger = document.getElementById("snowflake-trigger");
const winterVibeRow = document.getElementById("winter-vibe-row");
const winterVibeInput = document.getElementById("winter-vibe");
const snowLayer = document.getElementById("snow-layer");
const commandsApi = globalThis.browser?.commands ?? chrome.commands;
let isCapturingShortcut = false;
let snowflakeRevealed = false;
let snowDrainTimer = 0;
let snowCleanupTimer = 0;
const SNOWFLAKE_POSITION = { top: "auto", right: "auto", left: "18px", bottom: "12px" };
const buttonFeedbackTimers = new WeakMap();

applyLanguage(DEFAULT_LANGUAGE);
void loadSettings();
void loadShortcut();

languageInput.addEventListener("change", async () => {
  const language = languageInput.value === "en" ? "en" : languageInput.value === "ru" ? "ru" : DEFAULT_LANGUAGE;
  applyLanguage(language);
  await chrome.storage.local.set({ language });
});

hideApiKeyInput.addEventListener("change", async () => {
  apiKeyInput.type = hideApiKeyInput.checked ? "password" : "text";
  await chrome.storage.local.set({ apiKeyHidden: hideApiKeyInput.checked });
});

opacityInput.addEventListener("input", () => { opacityValue.textContent = Number(opacityInput.value).toFixed(2); });
instructionInput.addEventListener("input", resizeInstructionInput);
systemInstructionLabel.addEventListener("click", revealSnowflake);
systemInstructionLabel.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  revealSnowflake();
});
snowflakeTrigger.addEventListener("click", unlockWinterVibe);
winterVibeInput.addEventListener("change", () => {
  if (winterVibeInput.checked) startSnow();
  else {
    winterVibeRow.hidden = true;
    snowflakeTrigger.hidden = true;
    snowflakeRevealed = false;
    systemInstructionLabel.setAttribute("aria-expanded", "false");
    drainSnow();
  }
  void chrome.storage.local.set({ winterVibe: winterVibeInput.checked });
});
captureModeInput.addEventListener("change", updateCaptureModeState);
modeButtons.forEach((button) => button.addEventListener("click", () => {
  captureModeInput.value = button.dataset.mode;
  updateCaptureModeState();
}));

saveButton.addEventListener("click", async () => {
  saveButton.disabled = true;
  try {
    await chrome.storage.local.set({ apiKey: apiKeyInput.value.trim(), apiKeyHidden: hideApiKeyInput.checked, language: languageInput.value === "en" ? "en" : languageInput.value === "ru" ? "ru" : DEFAULT_LANGUAGE, systemInstruction: instructionInput.value.trim() || DEFAULT_SYSTEM_INSTRUCTION, captureMode: captureModeInput.value === "automatic" ? "automatic" : "manual", captureIntervalSeconds: normalizeInterval(captureIntervalInput.value), modelMode: "fast", precisionMode: precisionModeInput.value === "precision" ? "precision" : "fast", includeSelectionHint: selectionHintInput.checked, opacity: normalizeOpacity(opacityInput.value), winterVibe: winterVibeInput.checked });
    showButtonSuccess(saveButton);
    status.textContent = t("saved");
    setTimeout(() => { status.textContent = ""; }, 1600);
  } catch { status.textContent = t("saveError"); }
  finally { saveButton.disabled = false; }
});

shortcutSettingsButton.addEventListener("click", async () => {
  try {
    if (typeof chrome.commands?.openShortcutSettings === "function") await chrome.commands.openShortcutSettings();
    else await chrome.tabs.create({ url: globalThis.browser ? "about:addons" : "chrome://extensions/shortcuts" });
    window.close();
  } catch { status.textContent = t("shortcutFallback"); }
});

applyShortcutButton.addEventListener("click", () => void applyShortcut(shortcutInput.value));
shortcutInput.addEventListener("keydown", (event) => {
  const capturedShortcut = getShortcutFromEvent(event);
  if (capturedShortcut) { event.preventDefault(); shortcutInput.value = capturedShortcut; status.textContent = t("shortcutHint"); return; }
  if (event.key === "Enter") { event.preventDefault(); void applyShortcut(shortcutInput.value); }
});
shortcutInput.addEventListener("focus", () => { isCapturingShortcut = true; status.textContent = t("shortcutHint"); });
shortcutInput.addEventListener("blur", () => { isCapturingShortcut = false; });
document.addEventListener("keydown", (event) => {
  if (!isCapturingShortcut) return;
  const capturedShortcut = getShortcutFromEvent(event);
  if (!capturedShortcut) return;
  event.preventDefault(); event.stopPropagation(); shortcutInput.value = capturedShortcut; status.textContent = t("shortcutHint");
}, true);

async function applyShortcut(value) {
  const shortcut = normalizeShortcut(value);
  if (!shortcut) { status.textContent = t("shortcutFormat"); return; }
  try {
    const result = await chrome.runtime.sendMessage({ type: "update-shortcut", shortcut });
    if (!result?.ok) throw new Error(result?.error || t("shortcutFormat"));
    shortcutInput.value = shortcut; showButtonSuccess(applyShortcutButton); status.textContent = t("shortcutApplied");
  } catch (error) { console.error("ExamPasser shortcut update failed:", error); status.textContent = error?.message || t("shortcutFormat"); }
}

async function loadSettings() {
  try {
    const settings = await chrome.storage.local.get({ apiKey: "", apiKeyHidden: false, language: DEFAULT_LANGUAGE, systemInstruction: DEFAULT_SYSTEM_INSTRUCTION, captureMode: "manual", captureIntervalSeconds: 60, modelMode: "fast", precisionMode: "fast", includeSelectionHint: false, opacity: DEFAULT_OPACITY, winterVibe: false });
    apiKeyInput.value = typeof settings.apiKey === "string" ? settings.apiKey : "";
    hideApiKeyInput.checked = settings.apiKeyHidden === true;
    apiKeyInput.type = hideApiKeyInput.checked ? "password" : "text";
    languageInput.value = settings.language === "en" || settings.language === "ru" ? settings.language : DEFAULT_LANGUAGE; applyLanguage(languageInput.value);
    instructionInput.value = typeof settings.systemInstruction === "string" ? settings.systemInstruction : DEFAULT_SYSTEM_INSTRUCTION;
    resizeInstructionInput();
    captureModeInput.value = settings.captureMode === "automatic" ? "automatic" : "manual";
    const savedInterval = (settings.captureIntervalSeconds ?? (Number(settings.captureIntervalMinutes) * 60)) || 60;
    captureIntervalInput.value = String(normalizeInterval(savedInterval)); updateCaptureModeState();
    precisionModeInput.value = settings.precisionMode === "precision" ? "precision" : "fast";
    selectionHintInput.checked = settings.includeSelectionHint === true;
    opacityInput.value = String(normalizeOpacity(settings.opacity)); opacityValue.textContent = Number(opacityInput.value).toFixed(2);
    winterVibeInput.checked = settings.winterVibe === true;
    renderSnow();
  } catch { status.textContent = t("loadError"); }
}

async function loadShortcut() {
  try { const commands = await commandsApi.getAll(); const command = commands.find(({ name }) => name === "analyze-screen"); shortcutInput.value = command?.shortcut || t("notAssigned"); }
  catch { shortcutInput.value = "Alt+Q"; }
}

function applyLanguage(language) {
  const selectedLanguage = TRANSLATIONS[language] ? language : DEFAULT_LANGUAGE;
  languageInput.value = selectedLanguage; document.documentElement.lang = selectedLanguage;
  document.querySelectorAll("[data-i18n]").forEach((element) => { const value = TRANSLATIONS[selectedLanguage][element.dataset.i18n]; if (value) element.textContent = value; });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => { const value = TRANSLATIONS[selectedLanguage][element.dataset.i18nPlaceholder]; if (value) element.placeholder = value; });
  snowflakeTrigger.title = TRANSLATIONS[selectedLanguage].snowflakeHint;
  snowflakeTrigger.setAttribute("aria-label", TRANSLATIONS[selectedLanguage].snowflakeHint);
}

function t(key) { const language = languageInput?.value === "en" ? "en" : languageInput?.value === "ru" ? "ru" : DEFAULT_LANGUAGE; return TRANSLATIONS[language][key] || TRANSLATIONS[DEFAULT_LANGUAGE][key] || key; }
function showButtonSuccess(button) {
  const previousTimer = buttonFeedbackTimers.get(button);
  if (previousTimer) clearTimeout(previousTimer);
  button.classList.remove("pressed");
  button.classList.add("success");
  const timer = setTimeout(() => {
    button.classList.remove("success");
    buttonFeedbackTimers.delete(button);
  }, 900);
  buttonFeedbackTimers.set(button, timer);
}
function updateCaptureModeState() {
  const isAutomatic = captureModeInput.value === "automatic";
  captureIntervalInput.disabled = !isAutomatic;
  intervalField.classList.toggle("hidden", !isAutomatic);
  modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.mode === captureModeInput.value));
}
function resizeInstructionInput() {
  instructionInput.style.height = "auto";
  instructionInput.style.height = `${instructionInput.scrollHeight}px`;
}
function normalizeInterval(value) { const number = Number(value); if (!Number.isFinite(number)) return 60; return Math.min(86400, Math.max(20, Math.round(number))); }

function normalizeShortcut(value) {
  const parts = String(value).split("+").map((part) => part.trim()).filter(Boolean); if (parts.length === 0 || parts.length > 3) return "";
  const key = parts.at(-1).toUpperCase();
  const modifiers = parts.slice(0, -1).map((part) => { const normalized = part.toLowerCase(); return normalized === "ctrl" ? "Ctrl" : normalized === "alt" ? "Alt" : normalized === "shift" ? "Shift" : ""; });
  if (modifiers.some((modifier) => !modifier || modifiers.indexOf(modifier) !== modifiers.lastIndexOf(modifier))) return "";
  const allowedKey = /^[A-Z0-9]$/.test(key) || /^(F[1-9]|F1[0-9]|Home|End|PageUp|PageDown|Space|Insert|Delete|Up|Down|Left|Right|Comma|Period)$/.test(key);
  if (!allowedKey) return "";
  if (modifiers.length === 0) return /^F(?:[1-9]|1[0-9])$/.test(key) ? key : "";
  if (!modifiers.includes("Ctrl") && !modifiers.includes("Alt")) return "";
  return [...modifiers, key].join("+");
}

function getShortcutFromEvent(event) {
  const modifiers = []; if (event.ctrlKey) modifiers.push("Ctrl"); if (event.altKey) modifiers.push("Alt"); if (event.shiftKey) modifiers.push("Shift");
  const keyMap = { " ": "Space", ",": "Comma", ".": "Period", ArrowUp: "Up", ArrowDown: "Down", ArrowLeft: "Left", ArrowRight: "Right" };
  const key = keyMap[event.key] || (event.key.length === 1 ? event.key.toUpperCase() : event.key);
  const isValidKey = /^[A-Z0-9]$/.test(key) || /^(F[1-9]|F1[0-9]|Home|End|PageUp|PageDown|Space|Insert|Delete|Up|Down|Left|Right|Comma|Period)$/.test(key);
  if (!isValidKey || (!modifiers.includes("Ctrl") && !modifiers.includes("Alt"))) return "";
  return [...modifiers, key].join("+");
}

function normalizeOpacity(value) { const number = Number(value); if (!Number.isFinite(number)) return DEFAULT_OPACITY; return Math.min(1, Math.max(0.1, Math.round(number / 0.05) * 0.05)); }

function revealSnowflake() {
  if (!snowflakeTrigger.hidden) return;
  Object.assign(snowflakeTrigger.style, SNOWFLAKE_POSITION);
  snowflakeRevealed = true;
  snowflakeTrigger.hidden = false;
  systemInstructionLabel.setAttribute("aria-expanded", "true");
}

function unlockWinterVibe() {
  winterVibeRow.hidden = false;
  snowflakeTrigger.hidden = true;
  snowflakeRevealed = false;
  winterVibeInput.checked = true;
  startSnow();
  void chrome.storage.local.set({ winterVibe: true });
  winterVibeInput.focus();
}

function renderSnow() {
  if (winterVibeInput.checked) startSnow();
  else drainSnow();
}

function startSnow() {
  const wasDraining = snowLayer.classList.contains("draining") || snowLayer.classList.contains("fading");
  const existingSnowflakes = snowLayer.querySelectorAll(".snowflake");
  clearSnowTimers();
  snowLayer.classList.remove("draining", "fading");
  snowLayer.classList.add("active");
  if (existingSnowflakes.length && wasDraining) {
    appendSnowflakes(12);
    return;
  }
  if (existingSnowflakes.length) return;
  snowLayer.replaceChildren();
  const bank = document.createElement("div");
  bank.className = "snow-bank";
  snowLayer.append(bank);
  appendSnowflakes(26);
}

function appendSnowflakes(count) {
  const fragment = document.createDocumentFragment();
  const snowDuration = 8.5;
  for (let index = 0; index < count; index += 1) {
    const flake = document.createElement("span");
    flake.className = "snowflake";
    flake.textContent = index % 5 === 0 ? "✦" : "❄";
    flake.style.left = `${Math.random() * 100}%`;
    flake.style.setProperty("--snow-drift", `${Math.round(Math.random() * 70 - 35)}px`);
    flake.style.setProperty("--snow-duration", `${snowDuration}s`);
    flake.style.setProperty("--snow-delay", `${(index / count) * snowDuration}s`);
    flake.style.fontSize = `${8 + Math.random() * 8}px`;
    fragment.append(flake);
  }
  snowLayer.append(fragment);
}

function drainSnow() {
  clearSnowTimers();
  if (!snowLayer.childElementCount) {
    snowLayer.classList.remove("active", "draining", "fading");
    return;
  }
  snowLayer.classList.remove("active");
  snowLayer.classList.add("draining");
  drainExistingSnowflakes();
  snowDrainTimer = setTimeout(() => {
    snowLayer.classList.add("fading");
    snowDrainTimer = 0;
    snowCleanupTimer = setTimeout(() => {
      snowLayer.replaceChildren();
      snowLayer.classList.remove("draining", "fading");
      snowCleanupTimer = 0;
    }, 6000);
  }, 15000);
}

function drainExistingSnowflakes() {
  const layerRect = snowLayer.getBoundingClientRect();
  snowLayer.querySelectorAll(".snowflake").forEach((flake) => {
    const rect = flake.getBoundingClientRect();
    const left = rect.left - layerRect.left;
    const top = rect.top - layerRect.top;
    const endTop = Math.max(top, layerRect.height - rect.height + 4);
    const endLeft = left + (Math.random() * 48 - 24);
    const duration = Math.max(900, Math.min(5000, 1200 + (endTop - top) * 8));

    flake.getAnimations().forEach((animation) => animation.cancel());
    flake.style.animation = "none";
    flake.style.left = `${left}px`;
    flake.style.top = `${top}px`;
    flake.style.transform = "none";
    flake.animate(
      [
        { left: `${left}px`, top: `${top}px`, transform: "rotate(0deg)" },
        { left: `${endLeft}px`, top: `${endTop}px`, transform: "rotate(360deg)" }
      ],
      { duration, easing: "ease-in", fill: "forwards" }
    );
  });
}

function clearSnowTimers() {
  if (snowDrainTimer) clearTimeout(snowDrainTimer);
  if (snowCleanupTimer) clearTimeout(snowCleanupTimer);
  snowDrainTimer = 0;
  snowCleanupTimer = 0;
}
