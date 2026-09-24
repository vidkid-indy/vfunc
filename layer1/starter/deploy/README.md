# deploy — cache headers for every release / 배포와 캐시 헤더

The goal: `index.html` and `version.json` are checked on every visit, version folders are cached forever, and `vf.ext.update` (installed in `app.js`) replaces open pages on the next screen change. Background: plan section O, prompt `prompt-deploy-setup.md`.
목표: `index.html`과 `version.json`은 매번 확인하고, 버전 폴더는 영구 캐시하며, 열려 있는 페이지는 `vf.ext.update`가 다음 화면 이동 때 교체합니다.

| Path | Cache-Control |
|---|---|
| `/index.html`, `/version.json` | `no-cache` (revalidate every time; unchanged files answer 304) |
| `/<version>/…` (from `tools/release.mjs`) | `public, max-age=31536000, immutable` |
| everything else | `no-cache` |

Also recommended / 함께 권장: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. The page's CSP is already in `index.html`; a server CSP header may replace it (keep `script-src` without `'unsafe-inline'`).

| Server / 서버 | File / 파일 |
|---|---|
| Apache 2.4 | `apache/.htaccess` |
| Nginx | `nginx/vfunc-app.conf` |
| IIS | `iis/web.config` + `iis/version-folder.web.config` |
| Tomcat | `tomcat/README.md` |
| Netlify | `netlify/_headers` |
| GitHub Pages | `github-pages/README.md` (headers cannot be set) |

## Release steps / 릴리스 절차

1. Bump `APP_VERSION` in `config.js`, and `version.json` to the same value (it is used when you serve the project folder directly). / `config.js`와 `version.json`의 버전을 같은 값으로 올립니다.
2. `node tools/release.mjs 1.0.1` → `dist/1.0.1/`, `dist/index.html`, `dist/version.json`.
3. Upload `dist/` (the old version folders stay until `--keep` removes them, so open pages keep working). / `dist/`를 올립니다.
4. Check the headers: / 헤더 확인:

```bash
curl -sI https://example.com/app/index.html | grep -i cache-control      # no-cache
curl -sI https://example.com/app/version.json | grep -i cache-control    # no-cache
curl -sI https://example.com/app/1.0.1/app.js | grep -i cache-control    # public, max-age=31536000, immutable
```

These files are starting points: check them against your server version before production (`VERIFY:` marks the parts that depend on it). / 운영 전에 서버 버전에 맞는지 확인하세요(`VERIFY:` 표시).
