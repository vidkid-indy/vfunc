# 18 extend-plugin

Extend vfunc without editing it (plan section I, `EXTENDING.md`). / vfunc를 고치지 않고 확장합니다.

| Level / 수준 | Here / 이 예제 |
|---|---|
| C1 settings / 설정 | `vf.config({ strict: true })`: unsafe interpolation throws during development / 개발 중 위험한 보간에서 예외 |
| C2 styles / 스타일 | `brand.css` overrides `--vf-*` tokens after `vfunc.tokens.css`; the plugin's toast is styled with tokens / 토큰 덮어쓰기 |
| C5 plugin / 플러그인 | `vf.use(companyPlugin, { duration })` → `vf.ext.company.toast()`, `.saved()`, `.failed()` |

- A plugin is `{ name, version, requires, install(vf, options) }`; what `install` returns becomes `vf.ext[name]`. / 반환값이 `vf.ext[name]`이 됩니다.
- The plugin registers default messages with `vf.i18n.add`; the app overrides `company.saved` afterwards (deep merge, later wins). / 플러그인 기본 메시지를 앱이 덮어씁니다.
- Official members are read-only (`vf.html = …` throws in strict code), and extensions must not add members to the `vf` root. / 공식 멤버는 읽기 전용이고, 확장은 `vf` 루트에 멤버를 추가하지 않습니다.
- The plugin builds markup with `vf.html`, uses classes and `data-state` for styling, and holds no design values. / 플러그인도 디자인 값을 넣지 않습니다.
