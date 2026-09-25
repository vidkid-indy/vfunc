# 16 legacy-ie — IE11 / Edge IE mode

The same engine as everywhere else, from `dist/vfunc.legacy.min.js` (ES5 + a Promise polyfill). / 같은 엔진의 ES5 배포 파일입니다.

- **Your app code must be ES5**: no arrow functions, `const`/`let`, template literals or classes. `app.es5.js` is checked with `es-check es5` in our tests. / 앱 코드도 ES5여야 하며, 테스트가 es-check로 검사합니다.
- Build markup with `vf.tpl('<b>{name}</b>', data)` — the same escaping as `vf.html`. Arrays of `vf.tpl` results are inserted as markup. / `vf.tpl`로 마크업을 만듭니다.
- Use the **hash** router mode. / 라우터는 hash 모드를 쓰세요.
- IE11 has no CSS variables: `style.css` uses the plain light values of the tokens. / IE11은 CSS 변수가 없어 고정값을 씁니다.
- Polyfill anything else your app needs (`Object.assign`, `fetch`, …) yourself. / 그 밖의 기능은 앱이 직접 폴리필합니다.

## Loading pattern for public sites / 공개 사이트용 불러오기

```html
<script type="module" src="./app.js"></script>                 <!-- modern browsers -->
<script nomodule src="https://cdn.jsdelivr.net/npm/vfunc@1.0.0-rc.8/dist/vfunc.legacy.min.js"
        integrity="sha384-83Wd62N+IzkyrLEXYiYOwtBE78AOkY+N5dxu5qwdBa2H5kJRM9J6mkzb9lceysas"
        crossorigin="anonymous"></script>                     <!-- IE11 -->
<script nomodule src="./app.es5.js"></script>
```

For an IE-only intranet, the legacy file alone (as in this sample) works in every browser. / IE 전용 사내 시스템이라면 이 예제처럼 legacy 파일 하나로도 됩니다.

## Check in Edge IE mode / Edge IE 모드 확인

Serve the repository root, open `http://127.0.0.1:8080/layer1/examples/16-legacy-ie/` and reload it in IE mode (see `layer1/test/BROWSER-TESTS.md`). The line under the title shows `documentMode: 11`. Add a task, tick it, open "About". / IE 모드로 열어 할 일 추가·체크·About 이동을 확인합니다.
