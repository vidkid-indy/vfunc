# Changelog

All notable changes to this project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Repository foundation: license (Apache-2.0), NOTICE, contribution and security policies, agent rules, decision records.
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
