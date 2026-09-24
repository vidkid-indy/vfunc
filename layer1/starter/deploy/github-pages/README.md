# GitHub Pages

GitHub Pages does not let you set response headers; it serves files with a short cache of its own (`VERIFY:` currently `Cache-Control: max-age=600`). / GitHub Pages는 응답 헤더를 바꿀 수 없고 자체의 짧은 캐시로 서빙합니다.

What still works / 그래도 되는 것:
- **Version folders** (`tools/release.mjs`): a new release lives in a new folder, so no stale module is ever mixed with new ones. / 새 릴리스는 새 폴더라 옛 모듈이 섞이지 않습니다.
- **`vf.ext.update`**: once the short cache of `version.json` expires, open pages pick up the new version on the next screen change. / 짧은 캐시가 끝나면 다음 화면 이동 때 새 버전을 받습니다.

Publish `dist/` (for example with a GitHub Actions workflow that runs `node tools/release.mjs <version>` and uploads `dist/` as the Pages artifact). / `dist/`를 게시합니다.
