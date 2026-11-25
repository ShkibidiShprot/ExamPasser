const DEFAULT_SYSTEM_INSTRUCTION =
  "Ответь на вопрос. Дай максимально короткий ответ. Каждый раз присматривайся к оформлению задачь, ведь они могут быть с двойным или более ответом. Только букву/вариант ответа без самого решения, только ответ. Иначе, если в варианте ответа есть 2 и более ответов, пиши сразу все ответы через запятую, а не только один. Если на картинке нету варианта ответа, то номеруй его сам от 1 и до скольки хочешь. Даже если очень хочется НИКОГДА не отправляй больше чем просто ответ одной или больше буквами.Если ты видишь не тесты или что-то другое, то отправляй только \"!\". ЗАПОМНИ НИКОГДА никогда нельзя отправлять ничего кроме ответа на тесты.";
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
const apiKeyInput = document.getElementById("api-key");
const hideApiKeyInput = document.getElementById("hide-api-key");
const instructionInput = document.getElementById("system-instruction");
const captureModeInput = document.getElementById("capture-mode");
const captureIntervalInput = document.getElementById("capture-interval");
const intervalField = document.getElementById("interval-field");
const modeButtons = [...document.querySelectorAll(".mode-button")];
const opacityInput = document.getElementById("opacity");
const opacityValue = document.getElementById("opacity-value");
const shortcutInput = document.getElementById("shortcut");
const applyShortcutButton = document.getElementById("apply-shortcut");
const saveButton = document.getElementById("save");
const shortcutSettingsButton = document.getElementById("shortcut-settings");
const languageInput = document.getElementById("language");
const status = document.getElementById("status");
const commandsApi = globalThis.browser?.commands ?? chrome.commands;
let isCapturingShortcut = false;
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
captureModeInput.addEventListener("change", updateCaptureModeState);
modeButtons.forEach((button) => button.addEventListener("click", () => {
  captureModeInput.value = button.dataset.mode;
  updateCaptureModeState();
}));

saveButton.addEventListener("click", async () => {
  saveButton.disabled = true;
  try {
    await chrome.storage.local.set({ apiKey: apiKeyInput.value.trim(), apiKeyHidden: hideApiKeyInput.checked, language: languageInput.value === "en" ? "en" : languageInput.value === "ru" ? "ru" : DEFAULT_LANGUAGE, systemInstruction: instructionInput.value.trim() || DEFAULT_SYSTEM_INSTRUCTION, captureMode: captureModeInput.value === "automatic" ? "automatic" : "manual", captureIntervalSeconds: normalizeInterval(captureIntervalInput.value), modelMode: "fast", opacity: normalizeOpacity(opacityInput.value) });
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
    const settings = await chrome.storage.local.get({ apiKey: "", apiKeyHidden: false, language: DEFAULT_LANGUAGE, systemInstruction: DEFAULT_SYSTEM_INSTRUCTION, captureMode: "manual", captureIntervalSeconds: 60, modelMode: "fast", opacity: DEFAULT_OPACITY });
    apiKeyInput.value = typeof settings.apiKey === "string" ? settings.apiKey : "";
    hideApiKeyInput.checked = settings.apiKeyHidden === true;
    apiKeyInput.type = hideApiKeyInput.checked ? "password" : "text";
    languageInput.value = settings.language === "en" || settings.language === "ru" ? settings.language : DEFAULT_LANGUAGE; applyLanguage(languageInput.value);
    instructionInput.value = typeof settings.systemInstruction === "string" ? settings.systemInstruction : DEFAULT_SYSTEM_INSTRUCTION;
    resizeInstructionInput();
    captureModeInput.value = settings.captureMode === "automatic" ? "automatic" : "manual";
    const savedInterval = (settings.captureIntervalSeconds ?? (Number(settings.captureIntervalMinutes) * 60)) || 60;
    captureIntervalInput.value = String(normalizeInterval(savedInterval)); updateCaptureModeState();
    opacityInput.value = String(normalizeOpacity(settings.opacity)); opacityValue.textContent = Number(opacityInput.value).toFixed(2);
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
