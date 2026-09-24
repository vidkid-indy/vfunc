### 컴포넌트 안의 Chart.js

`REQUEST`: `<section id="sales">` 안에 월별 매출을 Chart.js 선 차트로 보여 주세요. Chart.js 4.5.1은 `index.html`이 전역 `Chart`로 이미 불러옵니다(그 태그는 바꾸지 마세요). 데이터는 이것을 씁니다(`app.js`에).

```js
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SERIES = {
  revenue: { label: 'Revenue', values: [120, 135, 150, 142, 168, 181, 175, 190, 205, 198, 220, 236] },
  orders: { label: 'Orders', values: [30, 32, 35, 33, 40, 44, 41, 46, 50, 48, 53, 57] }
};
```

**매출 컴포넌트**
- `revenue` 계열과 처음 6개월로 시작합니다.
- `data-action="series"`이고 `data-series="revenue"` / `"orders"`인 버튼 두 개(문구 `Revenue`, `Orders`)가 계열을 바꿉니다. 현재 계열의 버튼은 `aria-pressed="true"`, 다른 버튼은 `"false"`입니다.
- `data-action="add-month"` 버튼(문구 `Add month`)이 한 달을 더 보여 줍니다. 12개월을 모두 보이면 `disabled` 속성을 가집니다.
- `data-ref="summary"`인 요소가 `<label>: <n> months, last <값>`을 보여 줍니다(예: `Revenue: 6 months, last 181`).
- 차트는 `<canvas data-ref="chart">`에 그립니다. 레이블은 보이는 달들이고, 데이터셋 하나가 계열의 `label`과 보이는 값을 가집니다. 선 색(`borderColor`)은 revenue면 토큰 `--vf-chart-1`, orders면 `--vf-chart-2`의 값입니다.
- 갱신은 기존 차트를 바꿉니다. 컴포넌트가 살아 있는 동안 같은 canvas 요소와 같은 Chart.js 인스턴스가 유지됩니다.

**숨기기와 보이기**
- 페이지 머리의 `data-action="toggle-chart"` 버튼은 매출 컴포넌트를 destroy해서 차트를 숨깁니다. 차트 canvas와 Chart.js 인스턴스가 남지 않고, 버튼 문구는 `Show chart`가 됩니다. 다시 누르면 처음 상태(revenue, 6개월)의 새 컴포넌트를 만들고 문구는 `Hide chart`로 돌아갑니다.
