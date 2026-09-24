# 배포와 캐시

## 배포 파일

| 파일 | 용도 |
|---|---|
| `vfunc.js` / `vfunc.min.js` | `<script>`용 개발 / 운영(전역 `vf`) |
| `vfunc.esm.js` / `vfunc.esm.min.js` | ES 모듈 개발 / 운영 |
| `vfunc.legacy.min.js` | IE11·Edge IE 모드 |
| `plugins/update.min.js`, `plugins/update.esm.js` | update 플러그인 |
| `css/vfunc.tokens.css` | 선택형 토큰 |

모든 파일에 소스맵이 있고, 미니파이만 하고 난독화는 하지 않습니다.

## CDN은 정확한 버전 + SRI

{{install}}

`integrity` 값은 버전과 파일마다 다릅니다. 위 값은 이 사이트가 만들어진 버전의 값입니다. 폴리필을 외부 CDN에서 불러오지 마세요.

## "배포했는데 반영이 안 된다" 막기

빌드가 없으면 파일 이름에 해시가 붙지 않고, `app.js?v=2`는 그 안의 `import`에 전달되지 않습니다. 네 가지를 함께 씁니다.

1. **캐시 헤더**: `index.html`과 `version.json`은 `Cache-Control: no-cache`.
2. **버전 폴더**: 릴리스마다 `/1.0.3/…` 폴더에 복사하고 `index.html`이 그 폴더를 가리킵니다. 하위 모듈까지 한 번에 새 버전이 됩니다. 스타터의 `node tools/release.mjs 1.0.3`이 복사만 해서 만들어 줍니다.
3. **update 플러그인**: 열려 있는 페이지는 다음 화면 이동 때 새 버전으로 바뀝니다.
4. **버전 고정**: 다른 도메인의 파일은 모두 정확한 버전 + SRI.

| 경로 | Cache-Control |
|---|---|
| `/index.html`, `/version.json` | `no-cache` |
| `/<버전>/…` | `public, max-age=31536000, immutable` |

Apache, Nginx, IIS, Tomcat, Netlify, GitHub Pages 설정 예시는 스타터의 `deploy/`에 있습니다.

## Service Worker

"업데이트가 안 된다"의 가장 흔한 원인입니다. 오프라인이 꼭 필요할 때만, HTML은 network-first로 두고 해제 방법을 함께 준비하세요.

## 보안 체크리스트

- 페이지에 CSP 메타 태그를 두고 `script-src`에 `'unsafe-inline'`을 넣지 않습니다. 스크립트와 스타일은 파일로.
- 권한은 서버에서 검사합니다. 비밀값을 프론트엔드에 두지 않습니다.
- 사용자 입력과 서버 데이터는 `vf.html`로만 마크업에 넣습니다.
