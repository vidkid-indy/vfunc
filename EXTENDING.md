# Extending vfunc.js / vfunc.js 확장하기

> `vf.use` and `vf.ext` are implemented (stage 1, Phase 2). Component and adapter rules (C4) are added in stage 2.
> `vf.use`와 `vf.ext`는 구현되었습니다(1단계 Phase 2). 컴포넌트·어댑터 규칙(C4)은 2단계에서 보강합니다.

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
| C2 Style / 스타일 | Official CSS ships in `@layer vf.base, vf.components`; your CSS outside the layer wins | button shape |
| C3 Compose / 조합 | Wrap official components in your own | `vsPriceTag` = `vsBadge` + formatting |
| C4 Third-party / 서드파티 | Integration kit, levels L0 / L1 / L2 (stage 2) | a Leaflet map |
| C5 Plugin / 플러그인 | `vf.use(plugin)` → `vf.ext.<name>` | shared company helpers |
| C6 Fork / 포크 | Allowed by Apache-2.0, but you stop receiving updates. Ask in Discussions first. | — |

## Rules / 규칙

1. **Names / 이름** — The `vf.*` root is reserved for official APIs. Put plugins under `vf.ext.<name>` and app code in your own modules. Follow the `vs*` = string / `vf*` = instance rule; no functions whose return type depends on props. Adapters: `vf` + kind + vendor. npm names: `vfunc-plugin-*`, `vfunc-adapter-*`.
2. **Public API only / 공개 API만** — The public API is what `types/vfunc.d.ts` and the docs describe. Members starting with `_` are internal. Do not monkeypatch vfunc or native prototypes.
3. **Compatibility / 호환성** — Declare the supported vfunc range in `requires` (e.g. `'^1.0.0'`). Semver applies to the public API only.
4. **Lifecycle / 라이프사이클** — Use `onMount` / `onUpdate` / `onDestroy`, and release your listeners and timers in `onDestroy`.
5. **Security / 보안** — HTML containing user data must go through `vf.html`, `vf.tpl` or `vf.esc`. URLs go through `vf.safeUrl`.
6. **i18n and theme / 다국어와 테마** — Use `vf.t` keys for visible text and `--vf-*` tokens for colors and spacing.
7. **IE** — If your extension supports IE, write ES5 or transpile it yourself, and state support in your README.
8. **License / 라이선스** — You choose your extension's license. If you redistribute vfunc, keep its LICENSE and NOTICE. Do not use names or logos that suggest your extension is the official vfunc.js.

## Our promises / 우리가 지키는 약속

- A public API is removed only in a MAJOR version, after at least one MINOR version of deprecation warnings.
- `vf.ext`, the lifecycle options and the event object shape stay stable throughout 1.x.
