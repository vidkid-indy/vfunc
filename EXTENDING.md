# Extending vfunc.js / vfunc.js 확장하기

> Plugins (`vf.use`, `vf.ext`), your own components on top of layer 2 (C3) and third-party adapters (C4) are described here.
> 플러그인(`vf.use`, `vf.ext`), layer2 위의 내 컴포넌트(C3), 서드파티 어댑터(C4)를 다룹니다.

## Writing a plugin / 플러그인 작성

```js
vf.use({
  name: 'company',          // stored in vf.ext.company
  version: '1.2.0',
  requires: '^1.0.0',       // supported vfunc range; a mismatch prints a warning
  install(vf, options) {
    // Use only the public API here. Do not add or replace vf.* root members.
    return { toast: (message) => { /* ... */ } };
  }
}, { theme: 'dark' });

vf.ext.company.toast('Saved');
```

Official `vf.*` members are read-only: assigning `vf.html = ...` throws in strict mode.
공식 `vf.*` 멤버는 읽기 전용이라 `vf.html = ...` 같은 대입은 strict 모드에서 오류가 납니다.

## Principle / 원칙

Extend vfunc through its **public API only** — never by editing vfunc's source. Your extensions then keep working when you update vfunc. The official layer 2 is built the same way, using only the public API of layer 1.

vfunc 소스를 고치지 말고 **공개 API만으로** 확장하세요. 그래야 vfunc를 업데이트해도 확장이 깨지지 않습니다. 공식 layer2도 layer1의 공개 API만으로 만듭니다.

## Levels / 확장 수준 (try the simplest first / 쉬운 것부터)

| Level | How / 방법 | Example / 예 |
|---|---|---|
| C1 Configure / 설정 | props, i18n messages, CSS tokens (`--vf-*`) | brand colors, labels |
| C2 Style / 스타일 | Official CSS ships in `@layer vf.base, vf.components`; your CSS outside the layer wins (the legacy CSS has no layers: load yours after it) | button shape |
| C3 Compose / 조합 | Wrap official components in your own (below) | `vsPriceTag` = `vsBadge` + formatting |
| C4 Third-party / 서드파티 | Integration kit, levels L0 / L1 / L2 (below) | a Leaflet map |
| C5 Plugin / 플러그인 | `vf.use(plugin)` → `vf.ext.<name>` | shared company helpers |
| C6 Fork / 포크 | Allowed by Apache-2.0, but you stop receiving updates. Ask in Discussions first. | — |

## Rules / 규칙

1. **Names / 이름** — The `vf.*` root is reserved for official APIs. Put plugins under `vf.ext.<name>` and app code in your own modules. Follow the `vs*` = string / `vf*` = instance rule; no functions whose return type depends on props. Adapters: `vf` + kind + vendor. npm names: `vfunc-plugin-*`, `vfunc-adapter-*`.
2. **Public API only / 공개 API만** — The public API is what `types/vfunc.d.ts` and the docs describe. Members starting with `_` are internal. Do not monkeypatch vfunc or native prototypes.
3. **Compatibility / 호환성** — Declare the supported vfunc range in `requires` (e.g. `'^1.0.0'`). Semver applies to the public API only.
4. **Lifecycle / 라이프사이클** — Use `onMount` / `onUpdate` / `onDestroy`, and release your listeners and timers in `onDestroy`. Instances in `childs` get `onMount` with their parent and are destroyed with it; instances you create outside `childs` are yours to destroy. / `childs`의 인스턴스는 부모와 함께 `onMount`를 받고 함께 정리됩니다. `childs` 밖에서 만든 인스턴스는 직접 정리합니다.
   Components that ship messages add them with `vf.i18n.add(locale, messages, { defaults: true })` so the app can override them. / 메시지를 가진 컴포넌트는 `vf.i18n.add(locale, messages, { defaults: true })`로 넣어 앱이 덮어쓸 수 있게 합니다.
5. **Security / 보안** — HTML containing user data must go through `vf.html`, `vf.tpl` or `vf.esc`. URLs go through `vf.safeUrl`.
6. **i18n and theme / 다국어와 테마** — Use `vf.t` keys for visible text and `--vf-*` tokens for colors and spacing.
7. **IE** — If your extension supports IE, write ES5 or transpile it yourself, and state support in your README.
8. **License / 라이선스** — You choose your extension's license. If you redistribute vfunc, keep its LICENSE and NOTICE. Do not use names or logos that suggest your extension is the official vfunc.js.

## Your own components (C3) / 내 컴포넌트

Build them from the official components and keep the layer 2 rules, so they read like the rest of your code. Working sample: `layer2/examples/custom-component`.
공식 컴포넌트로 만들고 layer2 규칙을 지키면 나머지 코드와 같은 모양이 됩니다. 샘플: `layer2/examples/custom-component`.

```js
// shop-ui.js — your module, not the vf root / vf 루트가 아닌 내 모듈
export function vsPriceTag({ amount, was, currency = 'USD' }) {
  const off = was > amount ? Math.round((1 - amount / was) * 100) : 0;
  return vf.html`<span class="price-tag">${vf.fmt.currency(amount, currency)}${
    off ? vf.vsBadge({ label: '-' + off + '%', variant: 'danger' }) : ''}</span>`;
}
```

- **Shape / 모양** — `vs*` returns SafeHtml (build it with `vf.html`); `vf*` returns an instance (`vf.vfunc`) with `getValue()` / `setValue(v)`, and `setValue` does not call `onChange`. Callbacks receive `{ sender, event, data }`. Never one function that returns either. / `vs*`는 SafeHtml, `vf*`는 인스턴스. 콜백은 `{ sender, event, data }`.
- **Where / 위치** — In your module or app namespace. Shared across apps: a plugin under `vf.ext.<name>`. Never on the `vf` root. / 내 모듈이나 앱 네임스페이스, 여러 앱이 쓰면 `vf.ext.<name>` 플러그인.
- **Official children / 공식 자식** — Put `vf*` instances you use inside yours in `childs` (`{ targetId, component }`): they survive your re-renders and are destroyed with you. / 안에서 쓰는 `vf*`는 `childs`에 넣습니다.
- **Markup / 마크업** — Hooks on `id`, `data-ref`, `data-action`; your own class names as `<block>__<element>` (not `vf-*`, which is ours); state in `aria-*` or `data-state`. / 훅은 `id`·`data-ref`·`data-action`, 클래스는 내 블록 이름(`vf-*`는 공식).
- **Design and text / 디자인과 문구** — CSS with `--vf-*` tokens only, no colors or sizes in JS; visible text from `vf.t` keys or props. / CSS는 토큰만, 문구는 `vf.t` 키나 props.

## Third-party adapters (C4) / 서드파티 어댑터

Bring a library (map, editor, chart, grid …) in at the level you need: **L0** direct use in one component, **L1** an app wrapper, **L2** an adapter that keeps a kind's contract so it can replace another by name.
라이브러리를 필요한 수준으로 가져옵니다. L0 컴포넌트에서 직접, L1 앱 래퍼, L2 종류별 계약을 지켜 이름만 바꿔 교체되는 어댑터.

- Start from `layer2/adapters/_template/vfunc-kind-vendor.js` (its `TODO(1)`–`TODO(14)` are the steps) and run the contract suites in `layer2/adapters/_contract` (node with a mock of the library; `contract.html` in browsers with the real one). / 템플릿과 계약 테스트에서 시작합니다.
- The vendor library is never bundled: take it from the `lib` prop or its global. Its DOM lives only inside a `data-vf-keep` element; create it in `onMount`, release it in `onDestroy`. / 벤더는 번들하지 않고, DOM은 `data-vf-keep` 안에만 둡니다.
- If the library injects `<style>` elements, say which CSP the page needs and prefer a nonce option when it has one. / 스타일을 주입하는 라이브러리는 필요한 CSP를 적고, nonce 옵션이 있으면 먼저 씁니다.
- Guide: the website's "Third-party integration" page. AI prompt: `ai/en/prompt-integrate-third-party.md` (Korean: `ai/ko/`). Publish your own as `vfunc-adapter-<vendor>`; official adapters follow CONTRIBUTING.md. / 가이드와 프롬프트. 직접 만든 어댑터는 `vfunc-adapter-<vendor>`로 게시합니다.

## Our promises / 우리가 지키는 약속

- A public API is removed only in a MAJOR version, after at least one MINOR version of deprecation warnings.
- `vf.ext`, the lifecycle options and the event object shape stay stable throughout 1.x.
