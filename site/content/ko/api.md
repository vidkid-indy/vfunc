# API 레퍼런스

공개 API는 `types/vfunc.d.ts`에 선언된 것이 전부입니다. `_`로 시작하는 멤버는 내부용입니다. `vf`의 공식 멤버는 읽기 전용입니다.

## 컴포넌트

### `vf.vfunc(options)`
컴포넌트를 만듭니다(`new` 선택). 옵션:

| 옵션 | 설명 |
|---|---|
| `tag` | 루트 태그, 기본 `'div'`. 표의 행을 그리면 `'table'` |
| `opts` | 루트 요소 속성. `innerHTML`·`outerHTML`·`srcdoc`과 문자열 `on*`은 거부, URL은 `safeUrl` |
| `innerHTML` | `render`가 없을 때의 고정 마크업(그대로 신뢰) |
| `render(state)` | 현재 상태의 마크업. `vf.html`로 작성, `this`는 인스턴스 |
| `replaceRoot` | `true`: 마크업의 첫 요소가 루트, `false`(기본): `opts`가 적용된 새 `tag` 요소가 마크업을 감쌈 |
| `state`, `methods` | 상태와 메서드. `inst.key`, `inst.method()`로도 접근 |
| `events` | `[{ id?, eventType, onEvent? }]` 루트 안에서 그 `id`를 가진 요소에, `id`가 없으면 루트에 거는 직접 리스너 |
| `delegates` | `[{ selector, eventType, onEvent? }]` 위임 리스너 |
| `childs` | 자식 인스턴스·노드, `{ targetId, component }` 슬롯 |
| `onEvent`, `onError` | 기본 핸들러, 오류 알림(엔진은 복구하지 않음) |
| `onMount`, `onUpdate`, `onDestroy` | 라이프사이클 |

인스턴스: `$node`, `state`, `methods`, `ids`, `refs`, `setState(patch)`, `scheduleRefresh()`, `refresh()`, `mount(parent)` → `Promise`, `destroy()`, `toString()`. 예약어(`state`, `refresh`, `mount` 등과 `_`로 시작하는 이름)는 상태 키·메서드·id의 바로 접근 이름으로 쓸 수 없습니다. 인스턴스에 직접 속성을 붙이지 말고, 리스너 함수와 타이머는 클로저에 둡니다.

### `vf.attach(target, options)`
이미 페이지에 있는 요소를 컴포넌트로 만듭니다. 옵션은 `vf.vfunc`와 같습니다. `render`가 없으면 그 요소를 그대로 채택합니다. `render`가 있으면 새 마크업으로 대체합니다. 기본(`replaceRoot: true`)에서는 `render`가 요소 전체를 돌려주므로 태그·`id`·클래스를 유지해 적고, `replaceRoot: false`면 `tag`와 `opts: { id, className }`을 주고 안쪽만 돌려줍니다. 둘 다에 없는 원래 요소의 속성은 사라집니다. 대상이 없으면 `null`.

## 안전한 HTML

### `vf.html`
태그 템플릿. 값이 들어가는 위치에 맞게 이스케이프하고, 위험한 위치(`on*`, `<script>`, 따옴표 없는 속성)는 거부합니다. 따옴표 속성 안에서 `false`, `null`, `undefined`는 빈 값이 되고 배열은 공백으로 이어 붙이므로 `aria-selected="${on ? 'true' : 'false'}"`처럼 씁니다. `SafeHtml`을 반환합니다. ES5에서는 `vf.html(['<b>', '</b>'], value)`처럼 함수로도 부릅니다.

### `vf.tpl(template, data)`
템플릿 리터럴 없이 `{key}`, `{user.name}`을 `data`의 자기 속성에서 채웁니다. `vf.html`과 같은 보호.

### `vf.unsafeHtml(markup)`
이스케이프하지 않을 마크업으로 표시합니다. 직접 작성한 마크업에만, 이유를 주석으로 남기고 씁니다.

### `vf.esc(value)`
`& < > " '`를 이스케이프한 문자열.

### `vf.nl2br(value)`
이스케이프 후 줄바꿈을 `<br>`로 바꾼 `SafeHtml`.

### `vf.safeUrl(url)`
상대 경로와 `http`·`https`·`mailto`·`tel`만 통과시키고, 그 밖의 스킴은 `'#'`로 바꿉니다.

### `vf.SafeHtml`
`vf.html` 결과를 확인하는 생성자(`value instanceof vf.SafeHtml`).

### `vf.config(options)`
`{ strict, strictRender }`. `strict: true`면 위험한 보간에서 예외를 던집니다. `strictRender`는 개발 빌드에서 render가 일반 문자열을 반환하면 경고합니다.

## DOM과 폼

### `vf.$(selector, root?)`
`querySelector`.

### `vf.$$(selector, root?)`
`querySelectorAll`을 배열로.

### `vf.el(tag, props?)`
요소를 만들고 `opts`와 같은 안전 규칙으로 속성을 넣습니다.

### `vf.node(markup)`
마크업의 첫 요소. 마크업은 그대로 신뢰합니다. `<div>` 안에서 파싱하므로 표의 행에는 쓰지 않습니다.

### `vf.frag(markup)`
모든 최상위 노드를 담은 DocumentFragment.

### `vf.idMap(root)`
하위 요소의 `{ id: element }`.

### `vf.form`
`vf.form.values(target, { skipPassword? })`는 `{ id: value }`(체크박스는 boolean, 다중 select는 배열), `vf.form.reset(target)`은 값을 비우고 결과를 돌려줍니다.

## SPA

### `vf.router(options)`
`{ mode: 'hash' | 'history', base, routes, notFound, onChange, linkSelector, focus }` → `start()`, `stop()`, `go(path, { replace })`, `replace(path)`, `current()`, `href(path)`. `/`로 시작하는 앱 경로만 따릅니다.

### `vf.store(initial)`
`get(key?)`(키가 없으면 전체 상태), `set(patch | (state) => patch)`(얕은 병합: 다른 키는 유지, tick당 한 번 알림), `subscribe(fn)`(새 상태를 받음) → 해제 함수.

## 다국어

### `vf.i18n`
`setup({ locale, fallback, locales, messages, load, persist })` → `Promise<locale>`, `set(locale)`, `locale()`, `add(locale, messages)`, `subscribe(fn)`, `apply(root?)`.

### `vf.t(key, params?)`
메시지를 평문으로. `{name}` 치환, `params.count`로 복수형 선택.

### `vf.fmt`
`number(n, opts)`, `currency(n, code, opts)`, `date(d, opts)`, `relative(n, unit)`. 현재 로케일의 `Intl`을 쓰고, 없으면 단순 문자열.

## 확장

### `vf.use(plugin, options?)`
`{ name, version?, requires?, install(vf, options) }`를 설치하고 `install`의 반환값을 `vf.ext[name]`에 둡니다.

### `vf.ext`
설치된 확장. 사용자 확장은 여기에만 둡니다.

### `vf.version`
빌드 버전(예: `@VERSION@`). 소스를 직접 불러오면 `0.0.0-dev`.

## 공식 플러그인

`vfunc/plugins/update`(`dist/plugins/update.min.js` → 전역 `vfUpdate`): `vf.use(vfUpdate, { url, current, policy, interval, minGap, onAvailable, onError })` → `check(force)`, `status()`, `navigated()`, `apply()`, `stop()`. [확장](extend.md#공식-플러그인-vfextupdate)을 보세요.
