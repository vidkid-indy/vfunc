# 확장, 플러그인, IE

## 확장 규칙

vfunc 소스를 고치지 않고 공개 API로 확장합니다. 그래야 vfunc를 올려도 확장이 계속 동작합니다.

| 수준 | 방법 |
|---|---|
| 설정 | `vf.config({ strict: true })`, 메시지, 토큰 |
| 스타일 | 토큰 파일 뒤에서 `--vf-*` 덮어쓰기 |
| 조합 | 컴포넌트를 만들어 주는 함수, `childs` |
| 서드파티 | `onMount` + `data-vf-keep` + `onDestroy` |
| 플러그인 | `vf.use(plugin)` → `vf.ext.<이름>` |

- `vf.*`의 공식 멤버는 읽기 전용이고, 확장은 `vf` 루트에 멤버를 더하지 않습니다.
- 네이티브 prototype(`Event.prototype` 등)을 고치지 않습니다.

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

## IE11·Edge IE 모드

엔진은 하나이고 배포 파일만 다릅니다. `vfunc.legacy.min.js`는 ES5로 변환되고 Promise 폴리필 하나를 담습니다(gzip 약 10KB).

- **앱 코드도 ES5여야 합니다.** 화살표 함수, `const`/`let`, 템플릿 리터럴, 클래스를 쓰지 않습니다. 마크업은 `vf.tpl('<b>{name}</b>', data)`로 만듭니다.
- 라우터는 `hash` 모드를 쓰고, CSS는 고정값으로(IE11은 CSS 변수가 없음) 씁니다.
- 앱에 필요한 다른 기능(`fetch`, `Object.assign` 등)은 직접 폴리필합니다.
- 공개 사이트는 `<script type="module">`과 `<script nomodule>`을 함께 두는 패턴을 씁니다. 예제 16을 Edge IE 모드에서 열어 확인할 수 있습니다.
