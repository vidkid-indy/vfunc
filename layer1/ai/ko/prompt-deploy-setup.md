# 프롬프트: 배포와 캐시 갱신 설정

**사용법.** 아래 줄 밑의 내용을 AI에 붙여 넣고 서버 종류(Apache, Nginx, IIS, Tomcat, GitHub Pages, Netlify 등)를 알려 주세요. 스타터의 `deploy/` 폴더에 출발점이 되는 예시가 있습니다.

---

당신은 vfunc.js 앱(정적 파일, 빌드 없음)을 배포할 수 있게 준비합니다. 스스로 새로고침하지 않는 웹뷰와 키오스크를 포함해 **모든 사용자에게 모든 릴리스가 전달되게** 합니다.

## 입력
- `SERVER`: 웹 서버나 호스팅, 앱이 루트에 있는지 경로 아래(`/app/`)에 있는지.
- `CURRENT`: 지금 배포하는 방식(복사, CI, FTP 등).

## 만들 것 (대책 4겹)
1. `SERVER`용 **캐시 헤더**:
   - `index.html`과 `version.json`: `Cache-Control: no-cache`(매번 재확인, 바뀌지 않았으면 304).
   - 버전 폴더를 쓰면(2단계) `/<버전>/` 아래 전부: `Cache-Control: public, max-age=31536000, immutable`.
   - 버전 폴더를 쓰지 않으면 JS·CSS도 `no-cache`.
   - 서버가 허용하면 보안 헤더: `Content-Security-Policy`(`script-src`에 `'unsafe-inline'` 없이), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
2. **버전 폴더**: `node tools/release.mjs <버전>`이 앱을 `dist/<버전>/`에 복사하고, `index.html`이 그 폴더를 가리키게 고치고, `version.json`을 쓰고, 최근 N개 폴더만 남깁니다. 그러면 상대 경로 import가 모든 모듈의 새 버전을 불러옵니다.
3. **update 플러그인**: `app.js`에 `vf.use(vfUpdate, { url: './version.json', current: APP_VERSION })`. 정책을 고릅니다(기본 `next-navigation`, 사용자 확인이 필요하면 `prompt`, 보안 패치는 `immediate`).
4. **라이브러리 버전 고정**: 다른 도메인의 파일은 정확한 버전 + SRI.

## 규칙
- 팀이 오프라인 사용을 요청하지 않았다면 Service Worker를 넣지 않습니다. 요청했다면 HTML은 network-first, `skipWaiting` + `clients.claim`, `version.json`과 연동하고, 해제 방법(kill switch)을 문서로 남깁니다.
- 웹뷰: 네이티브 팀에 기본 캐시 모드 유지와 앱 업데이트 시 캐시 삭제를 알려 줍니다.
- 지시어를 지어내지 않습니다. 확실하지 않은 서버 지시어는 `VERIFY:`로 표시합니다.

## 출력 형식
1. 서버 설정 파일 전체와 둘 위치
2. 릴리스 절차를 짧은 확인 목록으로(`APP_VERSION`과 `version.json` 올리기, `tools/release.mjs` 실행, 업로드, 헤더 확인)
3. 확인 방법: `index.html`, `version.json`, 버전 폴더 파일 하나에 대한 `curl -I` 명령과 기대 헤더
4. `VERIFY:` 항목
