# Conversion record — `prompt-html-to-vfunc.md` on `before/index.html`

This is the output of the prompt, in its own format (sections 1–7), for the dashboard in `before/`. The result is `after/`.
프롬프트를 `before/index.html`에 적용한 결과를 프롬프트의 출력 형식(1~7) 그대로 적은 기록입니다. 결과물은 `after/`입니다.

`BEHAVIOUR` given: the user menu opens and closes; KPIs come from the server; the summary tabs switch text; the orders table is filtered by status and by the search box; sign out signs out.

## 1. Area table / 영역 판별표

| Area (selector) | Static / dynamic | Why | Tool | Data | Events |
|---|---|---|---|---|---|
| `.topbar__logo`, `.sidebar`, `.content__title`, `.footer` | static | never change | none | — | — |
| `.topbar__search` → `#order-search` | dynamic | filters the orders table | `vf.attach` without `render` (adopt) | — | `input` |
| `.topbar__user` → `#user-menu` | dynamic | open/close, sign out | `vf.attach` without `render` (adopt) + document listeners in `onMount`/`onDestroy` | — | `click`, `keydown` (Escape), outside click |
| `.kpis` → `#kpis` | dynamic | numbers come from the server | `vf.attach` **with** `render` (the section stays, its inside is rendered; `aria-busy` set in `onMount`/`onUpdate`) | `dashboard.json` `kpis` | — |
| summary panel → `#summary-panel` | dynamic | tabs switch the text | `vf.attach` without `render` (adopt); text set with `textContent` | `summary` | `click` on tabs |
| orders `<tbody>` → `#orders-body` | dynamic | rows come from the server and are filtered | `vf.attach` **with** `render` (the `<tbody>` stays; rows are parsed as its content) | `orders` | — |
| orders filter → `#orders-panel` | dynamic | status filter | `vf.attach` without `render` (adopt) | — | `change` |

## 2. HTML changes (added attributes and script tags only) / HTML 변경

```diff
+ <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; …">
- <input class="topbar__search" type="search" placeholder="Search orders…">
+ <input class="topbar__search" type="search" placeholder="Search orders…" id="order-search" data-action="search" aria-label="Search orders">
- <div class="topbar__user">
+ <div class="topbar__user" id="user-menu">
- <button class="topbar__user-btn" type="button" onclick="toggleMenu()">
+ <button class="topbar__user-btn" type="button" data-action="menu" data-ref="menu-button" aria-expanded="false" aria-controls="userMenu">
- <ul class="topbar__menu" id="userMenu" style="display:none">
+ <ul class="topbar__menu" id="userMenu" hidden>
- <a href="javascript:void(0)" onclick="alert('Signed out')">Sign out</a>
+ <a href="#" data-action="sign-out">Sign out</a>
- <section class="kpis">
+ <section class="kpis" id="kpis">
- <section class="panel">                                     (summary)
+ <section class="panel" id="summary-panel">
- <div class="tabs">
+ <div class="tabs" role="tablist">
- <button class="tabs__tab tabs__tab--active" type="button" onclick="showTab('week')">
+ <button class="tabs__tab tabs__tab--active" type="button" data-action="tab" data-tab="week" role="tab" aria-selected="true">
- <button class="tabs__tab" type="button" onclick="showTab('month')">
+ <button class="tabs__tab" type="button" data-action="tab" data-tab="month" role="tab" aria-selected="false">
- <div class="panel__body" id="summary">
+ <div class="panel__body" id="summary" role="tabpanel">
- <p>Orders are up this week. …</p>
+ <p data-ref="summary-text">Orders are up this week. …</p>
- <section class="panel">                                     (orders)
+ <section class="panel" id="orders-panel">
- <select class="panel__filter">
+ <select class="panel__filter" id="order-status" data-action="filter" aria-label="Status">
- <tbody>
+ <tbody id="orders-body">
- <script> function toggleMenu() { … } function showTab(name) { … } </script>
+ <script type="module" src="./app.js"></script>
```

`dashboard.css` is byte-for-byte the publisher's file. Our unit test checks that `after/index.html` equals `before/index.html` once these changes are undone.
`dashboard.css`는 퍼블리셔 파일과 바이트 단위로 같습니다. 단위 테스트가 위 변경을 되돌리면 두 HTML이 같은지 확인합니다.

## 3. Removed unsafe items / 제거한 위험 요소

| Item | Where | Replaced by |
|---|---|---|
| inline `<script>` (`toggleMenu`, `showTab`) | end of `<body>` | `app.js` (module) |
| `onclick="toggleMenu()"` | user button | `data-action="menu"` + delegate |
| `onclick="showTab(…)"` ×2 | tabs | `data-action="tab"` + `data-tab` |
| `href="javascript:void(0)"` + `onclick="alert(…)"` | sign-out link | `href="#"` + `data-action="sign-out"` |
| `innerHTML` with markup strings in `showTab` | inline script | `textContent` of `data-ref="summary-text"` |
| inline `style="display:none"` (blocked by the CSP) | user menu | the `hidden` attribute |

## 4. New files / 새 파일

`after/app.js` (the six dynamic areas), `after/api.js` (`loadDashboard`), `after/data/dashboard.json` (sample data, including a customer name that is an `<img onerror>` string to prove escaping).

## 5. Suggested token replacements (not applied) / 토큰 치환 제안(적용 안 함)

| Publisher value | Token |
|---|---|
| `#1e293b` text | `--vf-color-text` (`#0f172a`, close) |
| `#f4f6fb` page | `--vf-color-bg` |
| `#ffffff` panels | `--vf-color-surface` |
| `#64748b` labels | `--vf-color-text-muted` (`#475569`: better contrast) |
| `#e2e8f0` lines | `--vf-color-border` |
| `#cbd5e1` inputs | `--vf-color-border-strong` |
| `#1d4ed8` active tab | `--vf-color-primary-hover` or a brand token |
| `#047857` / `#ecfdf5` | `--vf-color-success-text` / `--vf-color-success-soft` |
| `#b91c1c` / `#fef2f2` | `--vf-color-danger-text` / `--vf-color-danger-soft` |
| `#eff6ff` / `#1d4ed8` badges | `--vf-color-info-soft` / `--vf-color-info-text` |
| `6px`, `10px`, `999px` radii | `--vf-radius-md`, `--vf-radius-lg`, `--vf-radius-full` |
| `12px`, `16px`, `24px` spacing | `--vf-space-3`, `--vf-space-4`, `--vf-space-5` |
| `.tabs__tab--active`, `.kpi__delta--up/--down`, `.badge--*` | state classes: suggest `[aria-selected="true"]`, `[data-state="up"]`, `[data-state="paid"]` selectors (the markup already carries these attributes) |

## 6. Assumptions and `VERIFY:` / 가정과 확인 필요

- The search box filters the orders on this page only (no server search). / 검색은 이 페이지의 주문만 거릅니다.
- `VERIFY:` the dashboard API (the sample reads `data/dashboard.json`) and the sign-out endpoint.
- Profile and Settings links stay placeholders (`href="#"`), as delivered.

## 7. Checklist result / 확인 목록 결과

- [x] Static areas unchanged apart from added hook attributes (unit test)
- [x] No selector uses a publisher class (behaviour on `id`, `data-action`, `data-ref`)
- [x] Every dynamic value inside `vf.html`; the tab text through `textContent`
- [x] No inline scripts, inline handlers, `javascript:` URLs or inline styles; CSP without `'unsafe-inline'`
- [x] The search box and the filter keep their values (adopted, not re-rendered)
- [x] Document listeners of the menu released in `onDestroy`
- [x] No console errors or warnings (browser test)

## What this run changed in the prompt / 이번 실행으로 고친 프롬프트

Running the prompt on this page showed two gaps, now fixed in `prompt-html-to-vfunc.md` (both languages):
1. **Inline `style` attributes** are blocked by the CSP like inline scripts. The rules now list them: show/hide styles become the `hidden` attribute, other styles move to the CSS file, and each change is reported.
2. **State shown with the publisher's classes** (`tabs__tab--active`, `badge--paid`). The CSS must not change, so the class is toggled for looks, the state is also written to `aria-*` / `data-state`, and selectors never use the class; attribute selectors are suggested in the token list.

It also exposed an engine behaviour worth knowing: markup for table rows must be parsed inside a table. Since 1.0.0-rc.5 `vf.attach` keeps the target element and parses `render` as its content, so attaching to the `<tbody>` is enough; `tag: 'table'` is still needed for a new `vf.vfunc` that renders rows.
