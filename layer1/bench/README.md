# Performance benchmark / 성능 벤치마크

Numbers for the limit the FAQ describes in words: a vfunc render replaces the inside of its element (no keyed diff). The operations are those of [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark); for other frameworks, see its [published results](https://krausest.github.io/js-framework-benchmark/). This folder is repository tooling: it is not in the npm package or on the site (the site shows the latest table).

FAQ가 말로 적은 한계(렌더가 요소 안쪽을 통째로 교체, keyed diff 없음)에 수치를 붙입니다. 조작은 js-framework-benchmark와 같고, 다른 프레임워크와의 비교는 그 공개 결과를 보세요. 이 폴더는 저장소 도구이며 npm 패키지와 사이트에 들어가지 않습니다(사이트에는 최신 결과 표만).

## Variants / 변형

| Page | What it does |
|---|---|
| `pages/naive/` | One component draws the toolbar and the table from one state; every operation, even selecting a row, redraws everything. / 컴포넌트 하나가 도구 막대와 표를 모두 그리고, 행 선택까지 모든 조작이 전체를 다시 그림 |
| `pages/recommended/` | What the kit teaches: the toolbar is adopted with `vf.attach` and no render, `render` sits on the `<tbody>` only, and selecting a row changes two `data-state` attributes without a render. / 킷의 안내대로: 도구 막대는 render 없이 `vf.attach`, `render`는 `<tbody>`에만, 행 선택은 render 없이 `data-state` 속성 두 개만 바꿈 |
| `pages/vanilla/` | Hand-written DOM operations that touch only the changed rows (the baseline). / 바뀐 행만 건드리는 손으로 쓴 DOM 조작(기준선) |

The three pages share the markup, `bench.css` (tokens only), the data generator `data.js` (same seed) and a strict CSP. The vfunc pages load `dist/vfunc.min.js`.
세 페이지는 같은 마크업, `bench.css`(토큰만), 같은 시드의 `data.js`, 엄격한 CSP를 씁니다. vfunc 페이지는 `dist/vfunc.min.js`를 불러옵니다.

## Run / 실행

```bash
npx playwright install chromium firefox webkit   # once / 처음 한 번
node layer1/bench/run.mjs [--engines chromium,firefox,webkit] [--runs 10] [--warmup 5] [--env <name>]
```

- Writes `results/<yyyymmdd>-<environment>/results.json` and `results.md` (the environment defaults to the platform and CPU, for example `win32-i5-7200u`). / 결과는 `results/<yyyymmdd>-<환경>/`에 씁니다.
- Each measurement sets the table up (not timed), then clicks in the page: `layout` is the time from the click to the end of the forced style and layout after the render (the reported number), `frame` the time to the second animation frame (also waits for the display). Median, min and max of `--runs` runs after `--warmup` runs. / 표를 준비한 뒤(재지 않음) 클릭부터 렌더 뒤 강제 스타일·레이아웃까지(`layout`, 표의 수치)와 두 번째 프레임까지(`frame`)를 잽니다.
- Also: startup (navigation to the first drawn screen), gzip size of the page's scripts (without the shared `data.js`), and in Chromium the JS heap after creating the rows. / 시작 시간, 스크립트 gzip 크기, Chromium의 JS 힙도 잽니다.
- Close other programs; numbers from different machines are not comparable. CI does not check the numbers; `layer1/test/e2e/bench.e2e.js` checks that every operation works and that the three pages draw the same table. / 다른 기계의 수치끼리는 비교하지 않습니다. CI는 수치 대신 동작과 같은 결과를 검사합니다.
- `?n=100` on a page scales every operation down (the smoke test uses it). / 페이지에 `?n=100`을 붙이면 조작 크기가 줄어듭니다.
