# Tomcat

Tomcat has no per-file `Cache-Control` setting for static files out of the box. Choose one: / Tomcat은 정적 파일별 `Cache-Control` 설정이 기본으로 없습니다. 하나를 고르세요.

1. **Put Apache or Nginx in front** (common in production) and use `../apache/.htaccess` or `../nginx/vfunc-app.conf` there. / 앞단에 Apache·Nginx를 두고 그쪽 설정을 씁니다(운영에서 흔한 구성).
2. **A small servlet `Filter`** mapped to `/*` that sets `Cache-Control: no-cache` by default and `public, max-age=31536000, immutable` when the path starts with a version folder (`/1.2.3/`). / 버전 폴더 경로면 영구 캐시, 아니면 no-cache를 설정하는 작은 Filter.
3. Tomcat's built-in `HttpHeaderSecurityFilter` adds `X-Content-Type-Options: nosniff` (`blockContentTypeSniffingEnabled`). `ExpiresFilter` sets `max-age` by type but cannot tell version folders from `index.html`. / 내장 필터는 nosniff에는 쓸 수 있지만 버전 폴더를 구분하지 못합니다.

`VERIFY:` filter class names and parameters against your Tomcat version's documentation before use. / 사용 전 Tomcat 버전 문서로 필터 이름과 매개변수를 확인하세요.

Whatever you choose, the update plugin in `app.js` still detects new versions through `version.json`; the headers decide how fast. / 어떤 방법이든 update 플러그인이 새 버전을 감지하며, 헤더는 그 속도를 정합니다.
