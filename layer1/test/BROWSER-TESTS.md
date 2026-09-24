# Browser tests / 브라우저 테스트

`browser.html` runs 22 checks against a built file in `layer1/dist/` inside a real browser. It is the only way to verify IE11 / Edge IE mode: Playwright cannot drive IE mode, so this run is manual. `npm test` runs the same page in an IE-like simulation (no `Promise`, no `Element.closest`), but only a real IE engine can confirm the result.

`browser.html`은 `layer1/dist/`의 빌드 파일을 실제 브라우저에서 22개 항목으로 검사합니다. IE11·Edge IE 모드를 확인하는 방법은 이것뿐입니다. Playwright는 IE 모드를 조작할 수 없어서 수동으로 실행합니다. `npm test`도 같은 페이지를 IE와 비슷한 환경(`Promise`·`Element.closest` 없음)에서 실행하지만, 최종 확인은 실제 IE 엔진에서만 할 수 있습니다.

## 1. Serve the repository / 저장소 서빙

```bash
# repository root / 저장소 루트에서
python -m http.server 8080
# or from any folder / 어느 폴더에서든
python -m http.server 8080 --directory path/to/vfunc
```

If the page shows `404 File not found`, the server was started in another folder (for example `build/out/npm` after publishing). Stop it and start it from the repository root.
페이지가 `404 File not found`이면 서버를 다른 폴더(예: 게시 후의 `build/out/npm`)에서 띄운 것입니다. 끄고 저장소 루트에서 다시 띄우세요.

| URL | File under test / 검사 대상 |
|---|---|
| http://localhost:8080/layer1/test/browser.html | `vfunc.legacy.min.js` (default / 기본) |
| http://localhost:8080/layer1/test/browser.html?file=vfunc.min.js | `vfunc.min.js` |
| http://localhost:8080/layer1/test/browser.html?file=vfunc.js | `vfunc.js` (development / 개발용) |

## 2. Open in Edge IE mode / Edge IE 모드로 열기 (Windows 10·11)

1. Edge → **Settings / 설정** → **Default browser / 기본 브라우저**
2. **Allow sites to be reloaded in Internet Explorer mode (IE mode) / Internet Explorer 모드(IE 모드)에서 사이트를 다시 로드하도록 허용** → **Allow / 허용** → **Restart / 다시 시작**
3. Open the first URL above. / 위 표의 첫 번째 주소를 엽니다.
4. Menu **…** → **Reload in Internet Explorer mode / Internet Explorer 모드에서 다시 로드**. An IE icon appears in the address bar. / 주소 표시줄에 IE 아이콘이 나타납니다.
   - No such menu item? Step 2 needs an Edge restart. You can also add the URL under **Internet Explorer mode pages / Internet Explorer 모드 페이지** in the same settings page; it then always opens in IE mode (for 30 days). / 메뉴가 없으면 2단계 후 Edge를 다시 시작해야 합니다. 같은 설정 화면의 **Internet Explorer 모드 페이지**에 주소를 추가하면 항상 IE 모드로 열립니다(30일).
5. The second line of the page must show **`documentMode: 11`**. If it shows `-`, the page is not in IE mode. / 페이지 둘째 줄에 **`documentMode: 11`**이 보여야 합니다. `-`이면 IE 모드가 아닙니다.

## 3. Expected result / 기대 결과

- **`PASS 22/22 — vfunc.legacy.min.js`** in green, and the tab title `PASS 22/22`. / 초록색 **`PASS 22/22 — vfunc.legacy.min.js`**, 탭 제목 `PASS 22/22`.
- In a modern browser, all three files must pass. / 모던 브라우저에서는 세 파일 모두 통과해야 합니다.
- In IE mode, `?file=vfunc.min.js` is expected to fail to load (it is not ES5). That is why the legacy file exists. / IE 모드에서 `?file=vfunc.min.js`는 불러오지 못하는 것이 정상입니다(ES5가 아님). 그래서 legacy 파일이 있습니다.

## 4. What to report / 보고할 것

- The `documentMode` line and the summary line. / `documentMode` 줄과 요약 줄
- Every `FAIL` line with its detail text (copy and paste). / 모든 `FAIL` 줄과 그 아래 설명(복사해서 붙여 넣기)
- Errors in the developer tools console (F12 works in IE mode). / 개발자 도구 콘솔의 오류(IE 모드에서도 F12 사용 가능)

## 5. What the page checks / 검사 항목

Loading and `window.vf`, read-only members, `Promise` (native or polyfill), no unexpected globals, `vf.tpl` escaping and URL/handler blocking, `vf.html` called as a function, `vf.el` safety, mount and render, batched `setState`, delegates through the `closest()` fallback, events and the event object, `childs` slots across refresh, `data-vf-keep`, focus and caret restore, lifecycle hooks, `vf.attach` and form helpers, hash router with link interception and refusal of outside URLs, `vf.store`, `vf.i18n` (text-only `apply`), `vf.fmt`, `vf.use`.

불러오기와 `window.vf`, 읽기 전용 멤버, `Promise`(네이티브 또는 폴리필), 예상 밖 전역 없음, `vf.tpl` 이스케이프와 URL·핸들러 차단, 함수로 부르는 `vf.html`, `vf.el` 안전 규칙, mount·render, `setState` 묶음 처리, `closest()` 대체 경로를 쓰는 위임, events와 이벤트 객체, refresh 후 `childs` 슬롯, `data-vf-keep`, 포커스·커서 복원, 라이프사이클 훅, `vf.attach`와 폼 헬퍼, 해시 라우터(링크 가로채기, 외부 주소 거부), `vf.store`, `vf.i18n`(텍스트 전용 `apply`), `vf.fmt`, `vf.use`.
