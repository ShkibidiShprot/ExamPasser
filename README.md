# ExamPasser

> A minimalist cross-browser extension for analyzing the visible area of your screen with the Gemini API.

ExamPasser captures the current tab manually or on a schedule, sends the screenshot to Gemini, and displays a compact answer in the bottom-right corner of the page.

**Languages:** [English](README.md) · [Українська](README.uk.md) · [Русский](README.ru.md)

## Features

- Manifest V3.
- Supports Chrome, Opera/Opera GX, Firefox, and Zen Browser.
- Visible-area screenshot analysis.
- Manual hotkey mode.
- Automatic capture mode with an interval starting at 20 seconds.
- Compact overlay isolated with a closed Shadow DOM.
- Ukrainian, Russian, and English interface.
- Fast `gemini-3.5-flash-lite` model.
- Adjustable answer opacity.
- API key and settings stored locally in the browser.

## Get a Gemini API key

1. Open [Google AI Studio](https://aistudio.google.com/apikey).
2. Sign in with your Google account.
3. Click **Create API key**.
4. Copy the key and paste it into ExamPasser.
5. Click **Save settings**.

Never publish or share your API key. Each user should use their own key.

## Install on Chrome or Opera GX

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome or `opera://extensions` in Opera GX.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the project root containing `manifest.json`.
6. Pin ExamPasser to the browser toolbar.

Keep the selected folder in place because the browser loads the extension directly from it.

## Install on Firefox or Zen Browser

Firefox uses `manifest.firefox.json`. Permanent installation requires a Mozilla-signed `.xpi` package.

1. Submit the Firefox version through the [Mozilla Add-on Developer Hub](https://addons.mozilla.org/developers/addon/submit/).
2. Choose private distribution (**Unlisted**).
3. Download the signed `.xpi` after review.
4. Open `about:addons`.
5. Select the gear menu → **Install Add-on From File**.
6. Choose the `.xpi` file.

## Controls

- Default command: `Alt+Q`.
- Alternative command: `Alt+Shift+Q`.
- Custom shortcuts can be configured from the extension menu or browser settings.
- Manual mode starts an analysis with a hotkey.
- Automatic mode starts analyses at the selected interval.

## Project structure

- `manifest.json` — Chrome manifest.
- `manifest.opera.json` — Opera manifest.
- `manifest.firefox.json` — Firefox/Zen Browser manifest.
- `background.js` — background logic, screenshots, scheduling, and Gemini requests.
- `content.js` — isolated answer overlay.
- `popup.html` — settings UI.
- `popup.js` — settings logic, localization, and persistence.
- `icon.svg` — extension icon.

## Privacy

Screenshots are sent to the Google Gemini API only when an analysis is started. ExamPasser has no own server. The API key, language, work mode, and other settings are stored in the browser's local storage.

## License

ExamPasser is distributed under the [ExamPasser Personal Use License](LICENSE.md).

Personal, non-commercial use of the unmodified extension is allowed. Copying, modifying, redistributing, selling, or publishing the extension requires prior written permission from the copyright holder.
