# Changelog

All notable changes to this project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Repository foundation: license (Apache-2.0), NOTICE, contribution and security policies, agent rules (`CLAUDE.md`, `AGENTS.md`).
- `layer1/src/vfunc.js`: the engine `vf.vfunc` (callable without `new`) and helpers `vf.$`, `vf.$$`, `vf.el`, `vf.node`, `vf.frag`, `vf.idMap`, `vf.form.values`, `vf.form.reset`, `vf.esc`, `vf.nl2br`, `vf.safeUrl`, `vf.version`.
- Unit tests for the engine, helpers and security rules (`npm test`).
- `vf.html` tagged template with context-aware escaping (text, quoted attributes, URL attributes; refuses event handler attributes, `srcdoc`, unquoted values, `<script>`/`<style>` content), `vf.tpl` for ES5 code, `vf.unsafeHtml`, `vf.SafeHtml`.
- `vf.attach` to adopt or replace markup that is already in the page.
- Lifecycle options `onMount`, `onUpdate`, `onDestroy`; instance `refs` (`data-ref`); `data-vf-keep` to keep elements across refreshes; focus and caret restore after a refresh.
- `vf.router` (hash and history modes, params, query, wildcard, link interception, focus after navigation; only same-origin app paths).
- `vf.store` with batched subscriptions.
- `vf.i18n` (`setup`, `set`, `locale`, `add`, `subscribe`, `apply`), `vf.t` with placeholders and plurals, `vf.fmt` (`number`, `currency`, `date`, `relative`).
- `vf.use` and `vf.ext` for extensions; `vf.config({ strict, strictRender })`.
- Official `vf` members are read-only.
- Distributed files in `dist/`: `vfunc.js` and `vfunc.min.js` for `<script>` (they join `window.vf` without replacing existing members), `vfunc.esm.js` and `vfunc.esm.min.js` for ES modules, each with a source map. The version is stamped in the banner and in `vf.version`.
- Type declarations: `types/vfunc.d.ts` (the public API boundary) and `types/global.d.ts` (the global `vf` of the `<script>` build).
- `THIRD_PARTY_LICENSES.txt` and the third-party section of `NOTICE`, generated from `third-party.json`.
- `llms.txt` (English) and `llms.ko.txt` (Korean) drafts for AI code generation.
- Minified files do not contain development warnings. Security checks work the same in every build; the minified files report a blocked value with one short message.
- `vf.config({ strictRender })` warns only in the development builds.
- `dist/vfunc.legacy.min.js` for IE11 and Edge IE mode: the same engine transpiled to ES5, with a small Promise polyfill written for this project (installed only when `window.Promise` is missing).
- `layer1/test/browser.html`: a browser test page for the built files, including manual runs in Edge IE mode.
- `css/vfunc.tokens.css`: optional design tokens (`--vf-*`) with light and dark themes; the token names are public API. The default skin meets WCAG AA contrast for its main pairs.
- Official plugin `vf.ext.update` (`dist/plugins/update.min.js` → global `vfUpdate`, `vfunc/plugins/update` for ES modules): reads `version.json` and replaces the page on the next navigation, on the user's confirmation, or at once. Works in IE11.
- 21 runnable examples in `layer1/examples/` (hello to cache-update), each checked in Chromium, Firefox and WebKit by `npm run test:examples`. Sample 14 is a published dashboard converted with the AI prompt, with its conversion record.
- Starter template `layer1/starter/`: router, store, i18n, tokens, update plugin, `design/`, `AGENTS.md`, `tools/release.mjs` (version-folder releases, copy only) and `deploy/` cache header examples for Apache, Nginx, IIS, Tomcat, Netlify and GitHub Pages.
- Website (`site/`, built by `npm run site`): Korean and English pages generated from Markdown by a small dependency-free converter, with vfunc islands for the theme switch, copy buttons, search, navigation and a live demo. Getting started, compare, guides, API reference, examples, AI prompts with copy buttons, FAQ with limits, licenses (from `third-party.json`) and privacy. A GitHub Pages workflow (manual, actions pinned to commit SHAs), issue templates and a code of conduct.
- AI prompt kit in English and Korean (`layer1/ai/en`, `layer1/ai/ko`, and `ai/` in the npm package): `AGENTS.template.md`, prompts for converting published HTML, scaffolding, migrating from React/Vue, adding features, debugging and deployment, anti-patterns, a `DESIGN.md` template and four design prompts. `llms-full.txt` is generated from `llms.txt`, the English website pages and the type declarations.
- Continuous integration: unit tests, build check, `npm audit`, browser tests in Chromium, Firefox and WebKit, and a gitleaks scan of the whole history. A test keeps every CDN example on the package version and the SRI of the committed files.
- Browser support table in the README and the FAQ.
- npm releases are published from GitHub Actions with trusted publishing (no stored token) and provenance, after the maintainer approves the run.
- LLM evaluation set in the repository (`layer1/ai/eval`, not in the npm package): ten tasks in English and Korean, one paste-ready bundle per task (kit + task + inputs), extraction of saved answers, and a grader that runs each task's checks, a console check and static rule checks in Chromium, Firefox and WebKit. Results are published on the website (Working with AI).

### Fixed
- AI kit, after two independent runs of the HTML conversion prompt (sample 14): the prompt now allows the state attributes it asks for; `llms.txt` and the API page explain `vf.attach` options, `events` without `id`, keeping the original element with `replaceRoot`, `store.set` merging, importing a copied ESM file, that `false` becomes an empty attribute value in `vf.html`, and not to add properties to instances.
- The README described the planned API of the first draft; it now shows the release candidate, installation with SRI, the files in the package and supported browsers.
- Delegated events and router link interception did nothing in browsers without `Element.closest` (IE11). The engine now falls back to `msMatchesSelector` without patching `Element.prototype`.

### Changed (since 1.0.0-rc.7)
Needed by the layer 2 components (grid, chart, overlays, adapters), which live inside other components and bring their own messages.
- Instances in `childs` get `onMount` once, before their parent, when the parent is put in the page by `mount()` or `vf.attach()`; a refresh does not call it again. `destroy()` destroys the instances in `childs` first. Before, children got neither, and had to be mounted and destroyed by hand.
- `vf.i18n.add(locale, messages, { defaults: true })` adds built-in defaults below the app's messages: the app's messages win whatever the order they are added in, and a locale that has only defaults still calls `load(locale)`. Lookup order: current locale (app, defaults), then the fallback locale (app, defaults), then the key.
- Docs and AI kit: `ids` and `refs` hold elements inside the root only; `vf.i18n.set` returns a Promise and subscribers are the place to re-render; what `persist` stores.

### Changed (since 1.0.0-rc.6)
- AI kit only (no engine change), after the evaluation set showed two mistakes in every run: `llms.txt`, `AGENTS.template.md` and `prompt-html-to-vfunc.md` (both languages) now say that CSS in a page written from scratch uses only `var(--vf-*)` tokens, and that `render` is attached to the smallest element whose content changes, not to a panel with static text or controls.

### Changed (since 1.0.0-rc.5)
Found by the first run of the evaluation set (`layer1/ai/eval`), where each of these made a model's otherwise reasonable code fail.
- `setState` also takes a function `(state) => patch`, like `vf.store`'s `set` (it was ignored without a warning). Any other value that is not an object warns in the development build.
- `destroy()` of a `vf.attach` component keeps the target element in the page: listeners are released and only what `render` / `innerHTML` drew is removed, so the element can be attached again. With `replaceRoot: true` the component's own root is removed as before.
- After a refresh, focus and caret also return to an element without `id`, `data-ref` or `name`: the same `data-action` at the same position.
- A component without `render` (for example published markup adopted with `vf.attach`) now gets `onUpdate` after each state change, once per tick; nothing is drawn again. Before, a state change on such a component did nothing.
- `vf.t('nav.home')` finds a whole dotted key (`{ "nav.home": "…" }`) as well as the nested path (`{ "nav": { "home": "…" } }`); the whole key wins.

### Changed (since 1.0.0-rc.4)
- `vf.attach` with `render` (or `innerHTML`) keeps the target element as the root and renders only its inside, parsed as content of the element's own tag. Its attributes, listeners and `aria-live` role stay across refreshes. `replaceRoot` now defaults to `false` for `vf.attach` as for `vf.vfunc`; pass `replaceRoot: true` for the previous behaviour. The development build warns when `render` returns the target element itself.
- In quoted `aria-*` and `data-*` attributes, `vf.html` and `vf.tpl` write booleans as `"true"` / `"false"` (`aria-selected="${on}"`). Other attributes still drop `false`.

### Changed (compared with the pilot engine)
- State, methods and element ids are exposed through property accessors instead of a `Proxy`, so the engine can run on IE11 after transpiling.
- Configuration (`tag`, `opts`, `events`, …) is no longer exposed as instance properties.
- Event objects: `id` is the id of the bound element and `target` is added.
- `opts` and `vf.el` refuse `innerHTML`/`outerHTML`/`srcdoc` and string `on*` handlers, and pass URL properties through `vf.safeUrl`.
- `setState` ignores `__proto__`, `constructor` and `prototype`.
- `mount` accepts a selector.
- `vf.nl2br` returns `SafeHtml` instead of a string.

### Fixed (compared with the pilot engine)
- Slots (`childs` with `targetId`) in components without state were appended to the root.
- Listeners of elements replaced by a refresh were kept until `destroy()`.
- `form.reset` cleared only text and password inputs.

### Removed (compared with the pilot engine)
- `_vfnode`, `escapeAttr`, and the `window.vf.com` side effect.
