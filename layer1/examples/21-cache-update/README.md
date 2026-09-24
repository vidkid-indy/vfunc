# 21 cache-update — new releases without a reload button / 새로고침 버튼 없이 새 버전 반영

Web views, kiosks, installed PWAs and in-app browsers never reload by themselves. Four layers solve it (plan section O, D-013). / 앱 웹뷰, 키오스크, PWA, 인앱 브라우저는 스스로 새로고침하지 않습니다.

| # | Layer / 대책 | Here / 이 예제 |
|---|---|---|
| ① | `index.html` and `version.json` with `Cache-Control: no-cache` / 캐시 헤더 | a server setting (examples come with the starter) / 서버 설정 |
| ② | Version folders (`/app/1.0.3/…`) so sub-modules change too / 버전 폴더 배포 | `tools/release.mjs` in the starter / 스타터 제공 |
| ③ | **`vf.ext.update`** reads `version.json` and replaces the page / 실행 중 감지 | this sample / 이 예제 |
| ④ | Exact CDN versions + SRI for vfunc itself / 라이브러리 버전 고정 | see 01 hello |

```html
<script src="…/dist/vfunc.min.js"></script>
<script src="…/dist/plugins/update.min.js"></script>   <!-- global vfUpdate; ES module: import vfUpdate from 'vfunc/plugins/update' -->
```

```js
const update = vf.use(vfUpdate, {
  url: './version.json', current: APP_VERSION,
  policy: 'next-navigation',          // or 'prompt' (with onAvailable) or 'immediate'
  interval: 10,                       // minutes
  onAvailable: (info, apply) => showMyToast(info, apply)
});
```

- **next-navigation** (default): the page is replaced on the next route change, so nothing typed on the current screen is lost. / 다음 화면 이동 때 교체합니다.
- **prompt**: the app shows its own notice (`onAvailable`); "Update now" calls `apply()`. / 앱이 안내를 그립니다.
- **immediate**: replace at once (security fixes). / 즉시 교체.
- Checks run on start, when the tab becomes visible, every `interval` minutes and on route changes; requests carry `?t=` because IE caches GET. / IE 캐시를 피하려고 `?t=`를 붙입니다.
- Service Workers are the most common cause of "the update never arrives"; do not add one unless you decided to. / Service Worker는 명시적으로 결정한 경우에만.

Try it / 해 보기: open the page, change `version.json` to `{ "version": "1.0.1" }`, press "Check now", then click "Settings". With `?policy=prompt` a toast appears instead. / 페이지를 연 채 version.json을 바꾸고 확인 → 화면 이동.
