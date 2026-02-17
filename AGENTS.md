#+#+#+#+----------------------------------------------
# AGENTS.md (For Agentic Coding Assistants)
#+#+#+#+----------------------------------------------

Project: tools-site / abm48 工具箱
Stack: Vue 3 (Composition API) + Vite + Element Plus + FFmpeg WASM + JSZip

This file is meant for coding agents. Keep changes small, follow existing patterns,
and be careful with deployment requirements (COOP/COEP for FFmpeg).

## Cursor/Copilot Rules

- Cursor rules: none found (`.cursor/rules/` and `.cursorrules` do not exist)
- Copilot rules: none found (`.github/copilot-instructions.md` does not exist)

## Build / Lint / Test Commands

Install deps:

- `npm install`

Dev server:

- `npm run dev`

Production build:

- `npm run build`

Preview built app:

- `npm run preview`

Lint:

- No linter configured (no ESLint/Prettier config in repo).
- If you add linting later, prefer adding scripts in `package.json` and documenting here.

Tests:

- No test runner configured (no Vitest/Jest/Playwright/Cypress config).
- If you add Vitest later, typical patterns:
  - all tests: `npx vitest run`
  - single test file: `npx vitest run path/to/file.test.js`
  - single test by name: `npx vitest run -t "test name"`
  (Only use these after adding Vitest to the project.)

## Repo Layout (Where To Look)

- App bootstrap: `src/main.js`
- Root layout + nav + background + favicon logic: `src/App.vue`
- Router + document title guard: `src/router/index.js`
- Tool pages:
  - Home: `src/views/Home.vue`
  - APK download/admin upload: `src/views/Download.vue`, `src/views/MemberArchive.vue`
  - FFmpeg batch clipper: `src/views/Clip.vue`
  - About/links/contact: `src/views/About.vue`
- Vite config (COOP/COEP + ffmpeg optimizeDeps exclude): `vite.config.js`
- Static assets:
  - FFmpeg core: `public/ffmpeg/ffmpeg-core.js`, `public/ffmpeg/ffmpeg-core.wasm`
  - APK distribution + PHP endpoints: `public/apks/`

## Project-Specific Constraints (FFmpeg WASM)

- `/clip` uses `@ffmpeg/ffmpeg` and requires `SharedArrayBuffer`.
- Production MUST send headers (Cross-Origin Isolation):
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
- Dev server headers are set in `vite.config.js` under `server.headers`.
- FFmpeg core is loaded from `/ffmpeg` (see `src/views/Clip.vue`). Ensure the deployed
  site serves those files from the same path.

## Security / Secrets

- Do NOT commit secrets.
- `public/apks/config.php` contains upload passwords and must remain git-ignored.
  - Template: `public/apks/config.example.php`
  - Apache protection example exists: `public/apks/.htaccess`
  - If deploying on Nginx, implement an equivalent deny rule for `config.php`.
- APK binaries are intentionally NOT tracked by git:
  - ignored via `.gitignore`: `public/apks/**/*.apk`

## Code Style Guidelines (Match Existing Code)

General:

- Language: JavaScript (no TypeScript). Keep changes compatible with current setup.
- Use Vue SFCs with `<script setup>` (Composition API).
- Prefer small, readable functions. Avoid clever abstractions.
- When touching a file, match its existing style (semicolons vary across files).

Imports:

- Prefer single quotes for JS imports and strings.
- Group imports in this order (blank lines between groups when it helps):
  1) Vue / Vue Router
  2) Third-party libs (Element Plus, FFmpeg, JSZip)
  3) Local modules/assets (`@/..` or relative paths)
- Import Element Plus icons from `@element-plus/icons-vue` and keep icon usage consistent.

Naming:

- Components: PascalCase filenames under `src/views/`.
- Variables/functions: `camelCase`.
- Reactive refs: `something` / `somethingRef` is acceptable; be consistent within file.
- Booleans: `isX`, `hasX`, `readyToX` (matches existing patterns like `isProcessing`).

Formatting:

- No formatter enforced; keep diffs minimal.
- Prefer 2-space indentation in JS/JSON/Vue blocks (matches existing).
- Keep template attributes one per line when they get long (existing style in views).

Error handling + UX:

- For async actions: `try/catch/finally`, keep UI state consistent (`loading` flags).
- Log to console for debugging AND surface user-facing feedback via Element Plus:
  - `ElMessage` for non-blocking hints
  - `ElMessageBox.alert` for blocking errors
- Never swallow errors silently; add a log line or message.

Routing + titles:

- Add routes in `src/router/index.js` using lazy imports.
- Set `meta.title` for every route; title guard formats as: `工具箱 ✽ <title>`.

CSS:

- Use scoped styles inside views (`<style scoped>`), global layout styles live in `src/App.vue`.
- Prefer simple responsive rules; current code uses `@media (max-width: 768px)`.

## Changes Checklist (Before You Finish)

- Run at least: `npm run dev` (manual quick smoke check) when possible.
- If you touch `/clip` or headers-related code, verify `window.crossOriginIsolated` behavior.
- If you modify APK upload logic, verify it still reads passwords from `public/apks/config.php`
  and updates the correct `version.json` files.
