# 확장, 플러그인, IE

## 확장 규칙

vfunc 소스를 고치지 않고 공개 API로 확장합니다. 그래야 vfunc를 올려도 확장이 계속 동작합니다.

| 수준 | 방법 |
|---|---|
| 설정 | `vf.config({ strict: true })`, 메시지, 토큰 |
| 스타일 | 토큰 파일 뒤에서 `--vf-*` 덮어쓰기 |
| 조합 | 컴포넌트를 만들어 주는 함수, `childs`, 공식 [컴포넌트](components.md)를 감싼 내 컴포넌트(아래) |
| 서드파티 | `onMount` + `data-vf-keep` + `onDestroy`, 수준 L0·L1·L2는 [서드파티 통합](third-party.md) |
| 플러그인 | `vf.use(plugin)` → `vf.ext.<이름>` |

- `vf.*`의 공식 멤버는 읽기 전용이고, 확장은 `vf` 루트에 멤버를 더하지 않습니다.
- 네이티브 prototype(`Event.prototype` 등)을 고치지 않습니다.

## 내 컴포넌트

공식 컴포넌트로 내 컴포넌트를 만들 때도 layer2 규칙을 따르면 나머지 코드와 같은 모양이 됩니다. 샘플은 `layer2/examples/custom-component`입니다.

```js
// shop-ui.js — vf 루트가 아닌 내 모듈
export function vsPriceTag({ amount, was, currency = 'USD' }) {
  const off = was > amount ? Math.round((1 - amount / was) * 100) : 0;
  return vf.html`<span class="price-tag">${vf.fmt.currency(amount, currency)}${
    off ? vf.vsBadge({ label: '-' + off + '%', variant: 'danger' }) : ''}</span>`;
}
```

- `vs*`는 `vf.html`로 만든 SafeHtml을, `vf*`는 `getValue()` / `setValue(v)`를 가진 인스턴스를 돌려줍니다. 콜백은 `{ sender, event, data }`를 받습니다.
- 안에서 쓰는 공식 `vf*`는 `childs`(`{ targetId, component }`)에 넣습니다. 다시 그려도 유지되고 함께 정리됩니다.
- 훅은 `id`·`data-ref`·`data-action`, 클래스는 내 블록 이름(`vf-*`는 공식), CSS는 토큰만 씁니다.
- 여러 앱에서 쓰려면 `vf.ext.<이름>` 플러그인으로 묶습니다.

## 플러그인 — `vf.use`

```js
vf.use({
  name: 'company', version: '1.0.0', requires: '^1.0.0',
  install(vf, options) { return { toast: (message) => { /* … */ } }; }
}, { duration: 3000 });
vf.ext.company.toast('saved');
```

## 공식 플러그인 — `vf.ext.update`

새로고침 버튼이 없는 환경(앱 웹뷰, 키오스크, PWA, 인앱 브라우저)에서 새 배포를 반영합니다.

```js
import vfUpdate from 'vfunc/plugins/update';     // <script>는 dist/plugins/update.min.js → 전역 vfUpdate
vf.use(vfUpdate, { url: './version.json', current: APP_VERSION, policy: 'next-navigation' });
```

| 정책 | 동작 |
|---|---|
| `next-navigation`(기본) | 다음 화면 이동 때 교체. 작업 중인 내용을 잃지 않습니다 |
| `prompt` | `onAvailable(info, apply)`로 앱이 안내를 그리고, 사용자가 누르면 교체 |
| `immediate` | 즉시 교체(보안 패치) |

자세한 배포 방법은 [배포와 캐시](deploy.md)에 있습니다.

## 공식 플러그인 — `vf.ext.shortcut`

페이지 전체의 키보드 단축키입니다. 입력칸에서 누른 키는 허용하지 않으면 무시하고, IME 조합 중인 키도 무시합니다. 그래서 한글·일본어·중국어를 입력하는 동안에는 단축키가 실행되지 않습니다.

```js
import vfShortcut from 'vfunc/plugins/shortcut';   // <script>는 dist/plugins/shortcut.min.js → 전역 vfShortcut
const keys = vf.use(vfShortcut);
const off = keys.add('mod+k', () => search.focus(), { label: '검색' });   // mod는 Apple 기기에서 ⌘, 그 밖에서는 Ctrl
keys.add('escape', closeDialog, { allowInInput: true });
keys.list();   // [{ combo: 'ctrl+k', label: '검색' }, …] 도움말 화면은 앱이 그립니다
off();         // 단축키 하나 해제. keys.destroy()는 모두 해제
```

같은 조합은 가장 나중에 등록한 단축키가 실행됩니다. 대화상자가 열려 있는 동안 `escape`를 가져갔다가 `off()`로 돌려줄 수 있습니다. 플러그인은 화면을 그리지 않습니다.

## IE11·Edge IE 모드

엔진은 하나이고 배포 파일만 다릅니다. `vfunc.legacy.min.js`는 ES5로 변환되고 Promise 폴리필 하나를 담습니다(gzip 약 10KB).

- **앱 코드도 ES5여야 합니다.** 화살표 함수, `const`/`let`, 템플릿 리터럴, 클래스를 쓰지 않습니다. 마크업은 `vf.tpl('<b>{name}</b>', data)`로 만듭니다.
- 라우터는 `hash` 모드를 쓰고, CSS는 고정값으로(IE11은 CSS 변수가 없음) 씁니다.
- 앱에 필요한 다른 기능(`fetch`, `Object.assign` 등)은 직접 폴리필합니다.
- 공개 사이트는 `<script type="module">`과 `<script nomodule>`을 함께 두는 패턴을 씁니다. 예제 16을 Edge IE 모드에서 열어 확인할 수 있습니다.
