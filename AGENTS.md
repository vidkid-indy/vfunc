# AGENTS.md — vfunc.js

Entry point for AI agents other than Claude Code (Codex, Cursor, OpenCode, …). The rules live in **`CLAUDE.md`** (Korean); read it before you start. If an `internal/` folder exists, also read `internal/CLAUDE.md` (maintainer only, not in the public repository).

Claude Code 이외의 AI 에이전트를 위한 진입점입니다. 규칙 정본은 **`CLAUDE.md`**입니다. `internal/` 폴더가 있으면 `internal/CLAUDE.md`(메인테이너 전용, 공개 저장소에 없음)도 읽으세요.

## Summary / 요약

- Source comments and engine console messages in English; public docs in Korean and English.
- Layer direction: layer1 ← layer2 ← layer3. layer2 and above use only the public API of layer1 (`layer1/types/vfunc.d.ts`).
- `vs*` always returns a string, `vf*` always an instance. No auto-sensing functions.
- Dynamic HTML only through `vf.html` / `vf.tpl`. Bind events to `data-action` / `data-ref` / `id`, never to CSS classes.
- CSS uses `var(--vf-*)` tokens only. No colors, fonts or spacing in JavaScript.
- No `eval`, `new Function`, string `setTimeout`, or monkey-patching of native prototypes.
- Allowed tools only: esbuild, Babel + es-check (legacy build), happy-dom, Playwright.
- Before a pull request: `npm test`, `npm run build:check`, `npm run test:examples`. Sign off your commits (`git commit -s`).

## Where to look / 어디서 찾아볼지

- Rules → `CLAUDE.md`
- API reference → `site/content/en/api.md` (Korean: `site/content/ko/api.md`), `layer1/types/vfunc.d.ts`, `layer1/ai/llms.txt`
- Extending → `EXTENDING.md` · Contributing → `CONTRIBUTING.md` · Security → `SECURITY.md`
