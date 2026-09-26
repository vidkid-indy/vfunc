# vfunc-ui 컴포넌트 — LLM용 레퍼런스

> build/components.mjs가 layer2/catalog.json과 layer2/types/*.d.ts에서 생성합니다. 직접 고치지 마세요.

vfunc.js의 layer2입니다. 엔진(`vf.vfunc`) 위의 클래스 없는 컴포넌트입니다. 수고를 덜어 주는 곳에만 쓰고, 나머지는 HTML 그대로 써도 됩니다.

- **로드:** `vfunc.js` → `vfunc-ui.js`(→ 그리드·차트는 `vfunc-ui-data.js`)(→ `vfunc-ui.locale.ko.js`), CSS는 `vfunc.tokens.css` + `vfunc-ui.css`. ES 모듈은 `import 'vfunc/ui'`(와 `'vfunc/ui/data'`)가 `vf`에 멤버를 더합니다.
- **`vf.vs*`는 SafeHtml을 돌려줍니다:** `vf.html` 템플릿이나 `render`에 그대로 넣습니다(이중 이스케이프 없음). 상태가 없습니다.
- **`vf.vf*`는 인스턴스를 돌려줍니다:** `.mount(el)` 또는 부모의 `childs`. 콜백은 `{ sender, event, data }`를 받으니 `e.data`를 읽습니다. `getValue()` / `setValue(v)`, `setValue`는 `onChange`를 부르지 않습니다.
- **훅:** `id`, `ref`(`data-ref`), `action`(`data-action`) props를 씁니다. `vf-*` 클래스로 찾지 않습니다. 문자열 props는 모두 이스케이프되니 마크업은 `vf.html`로 넘깁니다.
- **문구:** 내장 메시지는 컴포넌트마다 적은 키입니다. props나 `vf.i18n.add(locale, { 키: 문구 })`로 바꿉니다.
- 아래 타입은 주석을 뺀 d.ts 선언입니다. 여러 컴포넌트가 쓰는 타입을 먼저 적습니다.

## 공통 타입

```ts
interface VfUiEvent<D = Record<string, unknown>, I = VfuncInstance> {
  sender: I;
  event: Event | null;
  data: D;
}
type VfValueInstance<V, M = {}> = VfuncInstance & { getValue(): V; setValue(value: V): void; } & M;
type VsContent = string | number | SafeHtml;
interface VsCommonProps {
  id?: string;
  ref?: string;
  action?: string;
  describedBy?: string;
  className?: string;
}
interface VsFieldTextProps {
  label?: VsContent;
  hint?: VsContent;
  error?: VsContent;
  required?: boolean;
}
interface VsControlProps extends VsCommonProps, VsFieldTextProps {
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
}
type VsOption = string | number | { value: string | number; label?: VsContent; disabled?: boolean };
type VsTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type VsSlot = VsContent | VsContent[];
type VfSlot = VsSlot | VfuncInstance;
interface VfMenuItem {
  label?: VsContent;
  action?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
}
type VfPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
interface VfModalMethods {
  open(): void;
  close(reason?: string): void;
  isOpen(): boolean;
}
interface VfToastOptions {
  message: VsContent;
  title?: VsContent;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  duration?: number;
  action?: { label: string; onClick?: (e: VfUiEvent<{ id: string }>) => void };
}
interface VsTableColumn<T = any> {
  key: string;
  label: VsContent;
  align?: 'start' | 'center' | 'end';
  sortable?: boolean;
  render?: (row: T, index: number) => VsSlot;
}
interface VsFieldControlArgs {
  id: string;
  describedBy: string | null;
  invalid: boolean;
  required: boolean;
}
interface VfGridMethods<T = any> {
  setData(data: T[]): void;
  getData(): T[];
  setColumns(columns: Array<VsTableColumn<T>>): void;
  getSelection(): T[];
  clearSelection(): void;
  setPage(page: number): void;
  setQuery(query: string): void;
  setLoading(loading: boolean): void;
  setTotal(total: number): void;
  getValue(): string[];
  setValue(keys: string[]): void;
  readonly instance: unknown;
}
type VfChartType = 'bar' | 'line' | 'area' | 'pie' | 'donut' | 'sparkline';
interface VfChartData {
  labels: Array<string | number>;
  series: Array<{ name: string; data: number[] }>;
}
interface VfChartMethods {
  setData(data: VfChartData): void;
  setType(type: VfChartType): void;
  resize(): void;
  getValue(): VfChartData;
  setValue(data: VfChartData): void;
  readonly instance: unknown;
}
```

## 입력

### `vsField` — S

직접 만든 컨트롤을 라벨·힌트·오류로 감싸고 id와 aria-describedby를 넘겨 줍니다.

```js
vf.vsField({ label: 'Color', control: (a) => vf.html`<input type="color" id="${a.id}" aria-describedby="${a.describedBy}">` })
```

```ts
interface VsFieldProps extends VsFieldTextProps {
  id?: string;
  describedBy?: string;
  className?: string;
  control: (args: VsFieldControlArgs) => SafeHtml;
}
// Label, hint and error around a control you build yourself.
function vsField(props: VsFieldProps): SafeHtml;
```

### `vsInput` — S

텍스트형 <input>. label·hint·error를 주면 연결된 필드가 됩니다.

```js
vf.vsInput({ name: 'email', type: 'email', label: 'Email', error: errors.email })
```

```ts
interface VsInputProps extends VsControlProps {
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'search' | 'password' | 'date' | 'time' | 'datetime-local' | 'month' | 'week';
  value?: string | number;
  placeholder?: string;
  autocomplete?: string;
  inputmode?: string;
  pattern?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  minlength?: number;
  maxlength?: number;
  size?: 'md' | 'sm' | 'lg';
}
// An `<input class="vf-input">`, in a `.vf-field` when label, hint or error is given.
function vsInput(props: VsInputProps): SafeHtml;
```

### `vsTextarea` — S

vsInput과 같은 필드 props를 받는 <textarea>.

```js
vf.vsTextarea({ name: 'memo', label: 'Memo', rows: 4 })
```

```ts
interface VsTextareaProps extends VsControlProps {
  value?: string;
  rows?: number;
  placeholder?: string;
  minlength?: number;
  maxlength?: number;
  size?: 'md' | 'sm' | 'lg';
}
// A `<textarea class="vf-textarea">`.
function vsTextarea(props: VsTextareaProps): SafeHtml;
```

### `vsSelect` — S

옵션 목록으로 만드는 네이티브 <select>. 그룹, placeholder, multiple 지원.

```js
vf.vsSelect({ name: 'role', label: 'Role', options: ['admin', 'user'], value: 'user' })
```

```ts
interface VsSelectProps extends VsControlProps {
  options: Array<VsOption | { label: string; options: VsOption[]; disabled?: boolean }>;
  value?: string | number | Array<string | number>;
  placeholder?: string;
  multiple?: boolean;
  size?: 'md' | 'sm' | 'lg';
}
// A `<select class="vf-select">`.
function vsSelect(props: VsSelectProps): SafeHtml;
```

### `vsCheckbox` — S

라벨이 붙은 네이티브 체크박스.

```js
vf.vsCheckbox({ name: 'agree', label: 'I agree', checked: true })
```

```ts
interface VsCheckboxProps extends VsControlProps {
  label: VsContent;
  checked?: boolean;
  value?: string;
}
// A native checkbox inside its `<label class="vf-check">`.
function vsCheckbox(props: VsCheckboxProps): SafeHtml;
```

### `vsRadioGroup` — S

fieldset과 legend로 묶은 라디오 버튼.

```js
vf.vsRadioGroup({ name: 'plan', label: 'Plan', options: ['free', 'pro'], value: 'free' })
```

```ts
interface VsRadioGroupProps extends VsControlProps {
  options: VsOption[];
  value?: string | number;
  direction?: 'vertical' | 'horizontal';
}
// Radio buttons in a `<fieldset class="vf-radio-group">`; `label` is the legend, `id` the fieldset's.
function vsRadioGroup(props: VsRadioGroupProps): SafeHtml;
```

### `vsSwitch` — S

켜기/끄기 스위치. role="switch"인 네이티브 체크박스.

```js
vf.vsSwitch({ name: 'notify', label: 'Notifications', checked: true })
```

```ts
// An on/off switch: a native checkbox with `role="switch"`.
function vsSwitch(props: VsCheckboxProps): SafeHtml;
```

### `vsSlider` — S

네이티브 범위 슬라이더.

```js
vf.vsSlider({ name: 'volume', label: 'Volume', value: 30 })
```

```ts
interface VsSliderProps extends VsControlProps {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
}
// A native range `<input class="vf-slider">`.
function vsSlider(props: VsSliderProps): SafeHtml;
```

### `vsProgress` — S

네이티브 진행 막대. value가 없으면 진행 중 표시.

```js
vf.vsProgress({ label: 'Upload', value: 42, showValue: true })
```

```ts
interface VsProgressProps extends VsCommonProps {
  value?: number | null;
  max?: number;
  label?: VsContent;
  hint?: VsContent;
  showValue?: boolean;
}
// A native `<progress class="vf-progress">`.
function vsProgress(props: VsProgressProps): SafeHtml;
```

### `vsNumberInput` · `vfNumberInput` — P

감소/증가 버튼이 있는 숫자 입력. vf*는 증감, min/max 보정, step 자릿수 반올림.

메시지: `numberInput.decrement`, `numberInput.increment`

```js
vf.vfNumberInput({ name: 'qty', label: 'Quantity', value: 1, min: 1, max: 99, onChange: (e) => setQty(e.data.value) })
```

```ts
interface VsNumberInputProps extends VsControlProps {
  value?: number | null;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  size?: 'md' | 'sm' | 'lg';
  decrementLabel?: string;
  incrementLabel?: string;
}
// An `<input type="number">` between buttons with data-action "decrement" / "increment".
function vsNumberInput(props: VsNumberInputProps): SafeHtml;
interface VfNumberInputProps extends VsNumberInputProps {
  onChange?: (e: VfUiEvent<{ value: number | null }>) => void;
}
// Steps with the buttons, clamps and rounds on commit.
function vfNumberInput(props: VfNumberInputProps): VfValueInstance<number | null>;
```

### `vsSearchInput` · `vfSearchInput` — P

지우기 버튼이 있는 검색 상자. vf*는 onSearch 디바운스(IME 조합 중 제외), Enter로 즉시 검색.

메시지: `searchInput.clear`, `searchInput.label`, `searchInput.placeholder`

```js
vf.vfSearchInput({ debounce: 300, onSearch: (e) => load(e.data.value) })
```

```ts
interface VsSearchInputProps extends VsControlProps {
  value?: string;
  placeholder?: string;
  ariaLabel?: string;
  clearLabel?: string;
  size?: 'md' | 'sm' | 'lg';
}
// An `<input type="search">` with a clear button (data-action "clear").
function vsSearchInput(props: VsSearchInputProps): SafeHtml;
interface VfSearchInputProps extends VsSearchInputProps {
  debounce?: number;
  onSearch?: (e: VfUiEvent<{ value: string }>) => void;
  onClear?: (e: VfUiEvent<{}>) => void;
}
function vfSearchInput(props: VfSearchInputProps): VfValueInstance<string, { clear(): void; focus(): void }>;
```

### `vsPasswordInput` · `vfPasswordInput` — P

보기/숨기기 버튼(aria-pressed)이 있는 비밀번호 입력.

메시지: `passwordInput.hide`, `passwordInput.show`

```js
vf.vfPasswordInput({ name: 'password', label: 'Password', autocomplete: 'new-password' })
```

```ts
interface VsPasswordInputProps extends VsControlProps {
  value?: string;
  visible?: boolean;
  autocomplete?: string;
  placeholder?: string;
  minlength?: number;
  maxlength?: number;
  size?: 'md' | 'sm' | 'lg';
  showLabel?: string;
  hideLabel?: string;
}
// A password input with a toggle button (data-action "toggle-visibility", aria-pressed).
function vsPasswordInput(props: VsPasswordInputProps): SafeHtml;
interface VfPasswordInputProps extends VsPasswordInputProps {
  onChange?: (e: VfUiEvent<{ value: string }>) => void;
  onToggle?: (e: VfUiEvent<{ visible: boolean }>) => void;
}
function vfPasswordInput(props: VfPasswordInputProps): VfValueInstance<string, { toggle(visible?: boolean): void }>;
```

### `vsChipsInput` · `vfChipsInput` — P

칩(vsTag)과 텍스트 입력. Enter·쉼표로 추가, Backspace로 삭제, 폼 전송용 hidden input.

```js
vf.vfChipsInput({ name: 'tags', label: 'Tags', value: ['ui'], max: 5, onChange: (e) => save(e.data.value) })
```

```ts
interface VsChipsInputProps extends VsControlProps {
  value?: string[];
  placeholder?: string;
  max?: number;
}
// vsTag chips (data-action "remove") and a text input; one hidden input per chip when `name` is set.
function vsChipsInput(props: VsChipsInputProps): SafeHtml;
interface VfChipsInputProps extends VsChipsInputProps {
  onChange?: (e: VfUiEvent<{ value: string[] }>) => void;
}
// Enter or comma adds, Backspace in the empty input removes the last chip.
function vfChipsInput(props: VfChipsInputProps): VfValueInstance<string[], { add(text: string): boolean; remove(text: string): void }>;
```

### `vsRating` · `vfRating` — P

네이티브 라디오 기반 별점(키보드 동작). readonly는 대체 텍스트가 있는 이미지.

메시지: `rating.label`, `rating.value`

```js
vf.vfRating({ name: 'score', value: 3, onChange: (e) => rate(e.data.value) })
```

```ts
interface VsRatingProps extends VsCommonProps {
  value?: number;
  max?: number;
  readonly?: boolean;
  label?: VsContent;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  hint?: VsContent;
  error?: VsContent;
}
// Stars on radios (data-action "rate") in a fieldset; readonly: `role="img"` with "{value} of {max}".
function vsRating(props: VsRatingProps): SafeHtml;
interface VfRatingProps extends VsRatingProps {
  onChange?: (e: VfUiEvent<{ value: number }>) => void;
}
function vfRating(props: VfRatingProps): VfValueInstance<number>;
```

### `vsSelectButton` · `vfSelectButton` — P

aria-pressed 토글 버튼으로 고르는 옵션. 하나 또는 multiple로 여럿.

```js
vf.vfSelectButton({ ariaLabel: 'Period', options: ['day', 'week', 'month'], value: 'week', onChange: (e) => setPeriod(e.data.value) })
```

```ts
interface VsSelectButtonProps extends VsCommonProps {
  options: VsOption[];
  value?: string | number | Array<string | number>;
  multiple?: boolean;
  label?: VsContent;
  ariaLabel?: string;
  name?: string;
  disabled?: boolean;
  hint?: VsContent;
  error?: VsContent;
  size?: 'md' | 'sm' | 'lg';
}
// Toggle buttons (data-action "select", data-value, aria-pressed) in a `role="group"`.
function vsSelectButton(props: VsSelectButtonProps): SafeHtml;
interface VfSelectButtonProps extends VsSelectButtonProps {
  onChange?: (e: VfUiEvent<{ value: string | string[] }>) => void;
}
function vfSelectButton(props: VfSelectButtonProps): VfValueInstance<string | number | Array<string | number>>;
```

### `vsMaskedInput` · `vfMaskedInput` — P

마스크로 서식하는 텍스트 입력(0 숫자, a 문자, * 둘 다). vf*는 커서를 유지하고 원래 값도 줍니다.

```js
vf.vfMaskedInput({ name: 'phone', label: 'Phone', mask: '000-0000-0000', onChange: (e) => save(e.data.raw) })
```

```ts
interface VsMaskedInputProps extends VsControlProps {
  mask: string;
  value?: string;
  placeholder?: string;
  autocomplete?: string;
  size?: 'md' | 'sm' | 'lg';
}
// A text `<input class="vf-input" data-mask>` with the value formatted by the mask.
function vsMaskedInput(props: VsMaskedInputProps): SafeHtml;
interface VfMaskedInputProps extends VsMaskedInputProps {
  onInput?: (e: VfUiEvent<{ value: string; raw: string }>) => void;
  onChange?: (e: VfUiEvent<{ value: string; raw: string }>) => void;
}
function vfMaskedInput(props: VfMaskedInputProps): VfValueInstance<string, { getRawValue(): string }>;
```

### `vsDatePicker` · `vfDatePicker` — P

'YYYY-MM-DD' 값의 네이티브 날짜 입력. vf*는 입력한 글을 정규화(IE11)하고 Date를 줍니다.

메시지: `datePicker.placeholder`

```js
vf.vfDatePicker({ name: 'due', label: 'Due date', min: new Date(), onChange: (e) => setDue(e.data.date) })
```

```ts
interface VsDatePickerProps extends VsControlProps {
  value?: string | Date;
  min?: string | Date;
  max?: string | Date;
  placeholder?: string;
  size?: 'md' | 'sm' | 'lg';
}
// A native `<input type="date" class="vf-input">`.
function vsDatePicker(props: VsDatePickerProps): SafeHtml;
interface VfDatePickerProps extends VsDatePickerProps {
  onChange?: (e: VfUiEvent<{ value: string; date: Date | null }>) => void;
}
// Normalizes typed dates where the input is text; `aria-invalid` for text that is not a date.
function vfDatePicker(props: VfDatePickerProps): VfValueInstance<string, { getDate(): Date | null }>;
```

### `vsTimePicker` · `vfTimePicker` — P

'HH:mm' 값의 네이티브 시간 입력. vf*는 입력한 글을 정규화(IE11).

메시지: `timePicker.placeholder`

```js
vf.vfTimePicker({ name: 'at', label: 'Time', step: 900 })
```

```ts
interface VsTimePickerProps extends VsControlProps {
  value?: string | Date;
  min?: string;
  max?: string;
  step?: number;
  placeholder?: string;
  size?: 'md' | 'sm' | 'lg';
}
// A native `<input type="time" class="vf-input">`.
function vsTimePicker(props: VsTimePickerProps): SafeHtml;
interface VfTimePickerProps extends VsTimePickerProps {
  onChange?: (e: VfUiEvent<{ value: string }>) => void;
}
function vfTimePicker(props: VfTimePickerProps): VfValueInstance<string>;
```

### `vfDateRangePicker` — F

두 네이티브 입력의 시작일·종료일. 종료일이 시작일보다 앞서지 않습니다.

메시지: `datePicker.placeholder`, `dateRangePicker.end`, `dateRangePicker.start`

```js
vf.vfDateRangePicker({ label: 'Period', names: ['from', 'to'], onChange: (e) => search(e.data.start, e.data.end) })
```

```ts
interface VfDateRangePickerProps extends VsCommonProps {
  start?: string | Date;
  end?: string | Date;
  min?: string | Date;
  max?: string | Date;
  names?: [string, string];
  label?: VsContent;
  startLabel?: string;
  endLabel?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  hint?: VsContent;
  error?: VsContent;
  onChange?: (e: VfUiEvent<{ start: string; end: string; startDate: Date | null; endDate: Date | null }>) => void;
}
// Two native date inputs (data-action "start" / "end") in a fieldset; the end never precedes the start.
function vfDateRangePicker(props: VfDateRangePickerProps): VfValueInstance<{ start: string; end: string }>;
```

## 표시

### `vsButton` — S

변형·크기·로딩 상태와 data-action / data-ref 훅을 가진 버튼.

메시지: `common.loading`

```js
vf.vsButton({ label: 'Save', variant: 'primary', action: 'save' })
```

```ts
interface VsButtonProps {
  label: string | SafeHtml;
  variant?: 'secondary' | 'primary' | 'danger' | 'ghost';
  size?: 'md' | 'sm' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  action?: string;
  ref?: string;
  id?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  ariaLabel?: string;
  describedBy?: string;
  aria?: Record<string, string | number | boolean | null | undefined>;
  className?: string;
}
// A `<button class="vf-button">`.
function vsButton(props: VsButtonProps): SafeHtml;
```

### `vsButtonGroup` — S

role="group"로 묶은 나란한 버튼.

```js
vf.vsButtonGroup({ label: 'View', attached: true, buttons: [{ label: 'List', action: 'list' }, { label: 'Grid', action: 'grid' }] })
```

```ts
interface VsButtonGroupProps {
  buttons: VsButtonProps[];
  label?: string;
  size?: 'md' | 'sm' | 'lg';
  attached?: boolean;
  id?: string;
  ref?: string;
  className?: string;
}
// Buttons in a `<div role="group" class="vf-button-group">`.
function vsButtonGroup(props: VsButtonGroupProps): SafeHtml;
```

### `vsBadge` — S

작은 상태 표시나 개수.

```js
vf.vsBadge({ label: 'Active', variant: 'success', dot: true })
```

```ts
interface VsBadgeProps extends VsCommonProps {
  label: VsContent;
  variant?: VsTone;
  dot?: boolean;
}
// A `<span class="vf-badge">`.
function vsBadge(props: VsBadgeProps): SafeHtml;
```

### `vsTag` — S

라벨. 삭제 버튼(data-action, data-value)을 붙일 수 있습니다.

메시지: `tag.remove`

```js
vf.vsTag({ label: 'urgent', value: 'urgent', removable: true, removeAction: 'remove-tag' })
```

```ts
interface VsTagProps {
  label: VsContent;
  variant?: VsTone;
  value?: string;
  removable?: boolean;
  removeAction?: string;
  removeLabel?: string;
  disabled?: boolean;
  id?: string;
  ref?: string;
  className?: string;
}
// A `<span class="vf-tag">`; the app removes it in its own delegate.
function vsTag(props: VsTagProps): SafeHtml;
```

### `vsAvatar` — S

사용자 사진, 또는 이름의 머리글자.

```js
vf.vsAvatar({ name: 'Ada Lovelace', src: user.photo })
```

```ts
interface VsAvatarProps {
  name?: string;
  src?: string;
  alt?: string;
  size?: 'md' | 'sm' | 'lg';
  id?: string;
  ref?: string;
  className?: string;
}
// A `<span class="vf-avatar" role="img">` with an image or initials.
function vsAvatar(props: VsAvatarProps): SafeHtml;
```

### `vsAlert` — S

정보·성공·경고·위험 메시지 상자. 닫기 버튼 선택.

메시지: `alert.dismiss`

```js
vf.vsAlert({ variant: 'warning', title: 'Check', message: 'Unsaved changes', dismissible: true })
```

```ts
interface VsAlertProps {
  message?: VsContent;
  title?: VsContent;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  dismissible?: boolean;
  dismissAction?: string;
  dismissLabel?: string;
  id?: string;
  ref?: string;
  className?: string;
}
// A `<div class="vf-alert">`.
function vsAlert(props: VsAlertProps): SafeHtml;
```

### `vsCard` — S

머리(제목·부제·동작)·본문·바닥을 가진 카드.

```js
vf.vsCard({ title: 'Sales', body: vf.html`<p>${text}</p>`, footer: vf.vsButton({ label: 'More', action: 'more' }) })
```

```ts
interface VsCardProps {
  title?: VsContent;
  subtitle?: VsContent;
  actions?: VsSlot;
  body?: VsSlot;
  footer?: VsSlot;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  id?: string;
  ref?: string;
  className?: string;
}
// A `<div class="vf-card">`.
function vsCard(props: VsCardProps): SafeHtml;
```

### `vsDescriptions` — S

라벨/값 쌍을 1~4열의 <dl>로.

```js
vf.vsDescriptions({ columns: 2, items: [{ label: 'Name', value: user.name }, { label: 'Email', value: user.email }] })
```

```ts
interface VsDescriptionsProps {
  items: Array<{ label: VsContent; value: VsSlot }>;
  columns?: 1 | 2 | 3 | 4;
  title?: VsContent;
  id?: string;
  ref?: string;
  className?: string;
}
// Label/value pairs as a `<dl>`.
function vsDescriptions(props: VsDescriptionsProps): SafeHtml;
```

### `vsStatCard` — S

vf.fmt로 서식한 핵심 수치와 증감(+12.5%).

메시지: `statCard.down`, `statCard.up`

```js
vf.vsStatCard({ label: 'Revenue', value: 1250000, format: { style: 'currency', currency: 'KRW' }, delta: 0.125, deltaLabel: 'vs last month' })
```

```ts
interface VsStatCardProps {
  label: VsContent;
  value: VsContent;
  format?: Intl.NumberFormatOptions;
  delta?: number;
  deltaLabel?: VsContent;
  description?: VsContent;
  icon?: VsSlot;
  id?: string;
  ref?: string;
  className?: string;
}
// A key figure in a `<div class="vf-stat-card">`.
function vsStatCard(props: VsStatCardProps): SafeHtml;
```

### `vsTimeline` — S

시간 순서의 이벤트. 시간은 vf.fmt.date로 서식.

```js
vf.vsTimeline({ items: [{ title: 'Order placed', time: order.createdAt, variant: 'success' }] })
```

```ts
interface VsTimelineProps {
  items: Array<{ title: VsContent; time?: Date | number | string; description?: VsContent; variant?: VsTone }>;
  timeFormat?: Intl.DateTimeFormatOptions;
  id?: string;
  ref?: string;
  className?: string;
}
// Events in an `<ol class="vf-timeline">`.
function vsTimeline(props: VsTimelineProps): SafeHtml;
```

### `vsEmptyState` — S

목록이나 검색 결과가 없을 때의 화면.

메시지: `emptyState.title`

```js
vf.vsEmptyState({ description: 'Try another keyword', action: vf.vsButton({ label: 'Reset', action: 'reset' }) })
```

```ts
interface VsEmptyStateProps {
  title?: VsContent;
  description?: VsContent;
  icon?: VsSlot;
  action?: VsSlot;
  id?: string;
  ref?: string;
  className?: string;
}
// A `<div class="vf-empty-state">`.
function vsEmptyState(props: VsEmptyStateProps): SafeHtml;
```

### `vsSkeleton` — S

로딩 자리 표시(텍스트 줄·사각형·원). 스크린리더에서는 숨김.

```js
vf.vsSkeleton({ lines: 3 })
```

```ts
interface VsSkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  lines?: number;
  id?: string;
  ref?: string;
  className?: string;
}
// Placeholders, `aria-hidden`; mark the loading region with aria-busy.
function vsSkeleton(props: VsSkeletonProps): SafeHtml;
```

### `vsSpinner` — S

숨은 상태 문구가 있는 로딩 표시.

메시지: `common.loading`

```js
vf.vsSpinner({ size: 'sm' })
```

```ts
interface VsSpinnerProps {
  label?: string;
  size?: 'md' | 'sm' | 'lg';
  id?: string;
  ref?: string;
  className?: string;
}
// A `<span class="vf-spinner" role="status">`.
function vsSpinner(props: VsSpinnerProps): SafeHtml;
```

### `vsTooltip` — S

hover·focus 때 보이는 짧은 글. aria-describedby로 연결, CSS만 사용.

```js
vf.vsTooltip({ text: 'Copy link', trigger: (a) => vf.vsButton({ label: 'Copy', action: 'copy', describedBy: a.describedBy }) })
```

```ts
interface VsTooltipProps {
  text: string;
  trigger: ((args: { describedBy: string }) => SafeHtml) | SafeHtml;
  placement?: 'top' | 'bottom' | 'start' | 'end';
  id?: string;
  ref?: string;
  className?: string;
}
// A trigger with a CSS-only tooltip (hover and focus).
function vsTooltip(props: VsTooltipProps): SafeHtml;
```

### `vsListView` · `vfListView` — P

항목 목록. selectable이면 로빙 포커스 listbox(화살표, Space, Enter).

```js
vf.vfListView({ label: 'Users', items: users, selectable: 'single', onSelect: (e) => open(e.data.value) })
```

```ts
interface VsListViewProps<T = any> {
  items: T[];
  render?: (item: T, index: number) => SafeHtml;
  itemKey?: string;
  selectable?: 'none' | 'single' | 'multiple';
  selected?: string | string[];
  label?: string;
  emptyText?: VsContent;
  id?: string;
  ref?: string;
  className?: string;
}
// A `<ul class="vf-list-view">`, or an empty state when there are no items.
function vsListView<T = any>(props: VsListViewProps<T>): SafeHtml;
interface VfListViewProps<T = any> extends VsListViewProps<T> {
  onSelect?: (e: VfUiEvent<{ value: string | string[]; items: T[] }>) => void;
}
// Click, Space or Enter selects; Up, Down, Home, End move the focus.
function vfListView<T = any>(props: VfListViewProps<T>): VfValueInstance<string | string[] | null, { setItems(items: T[]): void }>;
```

### `vfCarousel` — F

이전/다음·점 버튼과 선택적 자동 넘김(hover·focus·reduced-motion에서 멈춤)의 슬라이드.

메시지: `carousel.carousel`, `carousel.goTo`, `carousel.next`, `carousel.pause`, `carousel.play`, `carousel.position`, `carousel.prev`, `carousel.slide`

```js
vf.vfCarousel({ label: 'News', items: [{ src: '/a.jpg', alt: 'Launch' }, { content: vf.html`<p>${text}</p>` }], autoplay: 5000 })
```

```ts
interface VfCarouselProps {
  items: Array<{ content?: VfSlot; src?: string; alt?: string }>;
  label: string;
  index?: number;
  loop?: boolean;
  autoplay?: number;
  showDots?: boolean;
  onChange?: (e: VfUiEvent<{ index: number }>) => void;
  id?: string;
  ref?: string;
  className?: string;
}
// A `<section aria-roledescription="carousel">` (WAI-ARIA carousel pattern).
function vfCarousel(props: VfCarouselProps): VfValueInstance<number, { next(): void; prev(): void; goTo(index: number): void; play(): void; pause(): void; }>;
```

## 내비게이션

### `vsBreadcrumb` — S

현재 페이지까지의 경로. 마지막 항목에 aria-current="page".

메시지: `breadcrumb.label`

```js
vf.vsBreadcrumb({ items: [{ label: 'Home', href: '#/' }, { label: 'Users', href: '#/users' }, { label: user.name }] })
```

```ts
interface VsBreadcrumbProps {
  items: Array<{ label: VsContent; href?: string }>;
  label?: string;
  id?: string;
  ref?: string;
  className?: string;
}
// A `<nav class="vf-breadcrumb">` with an ordered list.
function vsBreadcrumb(props: VsBreadcrumbProps): SafeHtml;
```

### `vsPagination` · `vfPagination` — P

이전/다음과 생략 표시가 있는 페이지 버튼. vf*는 페이지를 바꾸고 onChange 호출.

메시지: `pagination.label`, `pagination.next`, `pagination.page`, `pagination.previous`

```js
vf.vfPagination({ total: 230, pageSize: 20, onChange: (e) => load(e.data.page) })
```

```ts
interface VsPaginationProps {
  total: number;
  page?: number;
  pageSize?: number;
  siblings?: number;
  label?: string;
  id?: string;
  ref?: string;
  className?: string;
}
// Page buttons (data-action "page", data-page) in a `<nav class="vf-pagination">`.
function vsPagination(props: VsPaginationProps): SafeHtml;
interface VfPaginationProps extends VsPaginationProps {
  onChange?: (e: VfUiEvent<{ page: number }>) => void;
}
function vfPagination(props: VfPaginationProps): VfValueInstance<number, { setTotal(total: number): void }>;
```

### `vsTabs` · `vfTabs` — P

탭과 패널(WAI-ARIA). 로빙 tabindex, vf*는 화살표(RTL 반영)·Home·End.

```js
vf.vfTabs({ label: 'Settings', tabs: [{ id: 'profile', label: 'Profile', content: profileHtml }, { id: 'security', label: 'Security', content: securityHtml }] })
```

```ts
interface VsTabsProps {
  tabs: Array<{ id: string; label: VsContent; content?: VsSlot; disabled?: boolean }>;
  active?: string;
  label?: string;
  id?: string;
  ref?: string;
  className?: string;
}
// Tabs (data-action "tab") and their panels; inactive panels are hidden.
function vsTabs(props: VsTabsProps): SafeHtml;
interface VfTabsProps extends Omit<VsTabsProps, 'tabs'> {
  tabs: Array<{ id: string; label: VsContent; content?: VfSlot; disabled?: boolean }>;
  onChange?: (e: VfUiEvent<{ id: string; index: number }>) => void;
}
// Click, arrow keys (following dir="rtl"), Home and End.
function vfTabs(props: VfTabsProps): VfValueInstance<string | null, { select(id: string): void }>;
```

### `vsAccordion` · `vfAccordion` — P

제목 버튼(aria-expanded)과 region 패널의 접이식 섹션. 하나 또는 여럿 열기.

```js
vf.vfAccordion({ items: faq.map((q) => ({ id: q.id, title: q.question, content: q.answer })) })
```

```ts
interface VsAccordionProps {
  items: Array<{ id: string; title: VsContent; content?: VsSlot; open?: boolean; disabled?: boolean }>;
  open?: string[];
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  id?: string;
  ref?: string;
  className?: string;
}
// Heading buttons (data-action "toggle", aria-expanded) with region panels.
function vsAccordion(props: VsAccordionProps): SafeHtml;
interface VfAccordionProps extends Omit<VsAccordionProps, 'items'> {
  items: Array<{ id: string; title: VsContent; content?: VfSlot; open?: boolean; disabled?: boolean }>;
  multiple?: boolean;
  onToggle?: (e: VfUiEvent<{ id: string; open: boolean; openIds: string[] }>) => void;
}
function vfAccordion(props: VfAccordionProps): VfValueInstance<string[], { open(id: string): void; close(id: string): void; toggle(id: string): void; }>;
```

### `vsStepper` · `vfStepper` — P

진행 단계: 완료, 현재(aria-current="step"), 예정.

메시지: `stepper.complete`

```js
vf.vfStepper({ steps: ['Cart', 'Shipping', 'Payment'], active: 1 })
```

```ts
interface VsStepperProps {
  steps: Array<VsContent | { label: VsContent; description?: VsContent }>;
  active?: number;
  clickable?: boolean;
  label?: string;
  id?: string;
  ref?: string;
  className?: string;
}
// An `<ol class="vf-stepper">`: data-state complete / current / upcoming, aria-current="step".
function vsStepper(props: VsStepperProps): SafeHtml;
interface VfStepperProps extends VsStepperProps {
  onChange?: (e: VfUiEvent<{ index: number }>) => void;
}
function vfStepper(props: VfStepperProps): VfValueInstance<number, { next(): void; prev(): void; goTo(index: number): void; }>;
```

### `vsSplitButton` · `vfSplitButton` — P

주 동작과 관련 동작 메뉴(vfDropdown 메뉴 공유).

메시지: `splitButton.more`

```js
vf.vfSplitButton({ label: 'Save', variant: 'primary', items: [{ label: 'Save as draft', action: 'draft' }], onClick: save, onSelect: (e) => run(e.data.action) })
```

```ts
interface VsSplitButtonProps {
  label: string | SafeHtml;
  action?: string;
  items: VfMenuItem[];
  variant?: 'secondary' | 'primary' | 'danger' | 'ghost';
  size?: 'md' | 'sm' | 'lg';
  disabled?: boolean;
  menuLabel?: string;
  id?: string;
  ref?: string;
  className?: string;
}
// A main button and a menu button (data-action "menu") in a `role="group"`, with a hidden menu.
function vsSplitButton(props: VsSplitButtonProps): SafeHtml;
interface VfSplitButtonProps extends VsSplitButtonProps {
  placement?: VfPlacement;
  onClick?: (e: VfUiEvent<{ action: string | undefined }>) => void;
  onSelect?: (e: VfUiEvent<{ action: string | undefined; item: VfMenuItem }>) => void;
}
function vfSplitButton(props: VfSplitButtonProps): VfuncInstance & { open(): void; close(): void; isOpen(): boolean };
```

## 오버레이

### `vfModal` — F

모달 대화상자. 포커스를 안에 가두고 되돌리며, Esc는 가장 위 레이어만, 배경 스크롤 잠금. footer 동작은 onAction.

메시지: `modal.close`

```js
const dialog = vf.vfModal({ title: 'Edit user', content: form, footer: vf.vsButton({ label: 'Save', action: 'save', variant: 'primary' }), onAction: (e) => save() }); dialog.open();
```

```ts
interface VfModalProps {
  title?: VsContent;
  label?: string;
  content?: VfSlot;
  footer?: VsSlot;
  size?: 'md' | 'sm' | 'lg';
  dismissible?: boolean;
  initialFocus?: string;
  closeLabel?: string;
  onOpen?: (e: VfUiEvent<{}>) => void;
  onClose?: (e: VfUiEvent<{ reason: string }>) => void;
  onAction?: (e: VfUiEvent<{ action: string }>) => void;
  id?: string;
  ref?: string;
  className?: string;
}
// A `role="dialog"` with `aria-modal` (no native <dialog>, same path in IE11).
function vfModal(props: VfModalProps): VfuncInstance & VfModalMethods;
```

### `vfDrawer` — F

화면 끝·시작·아래에 붙는 전체 높이 패널 형태의 vfModal.

메시지: `modal.close`

```js
vf.vfDrawer({ title: 'Filters', side: 'end', content: filtersHtml }).open()
```

```ts
interface VfDrawerProps extends VfModalProps {
  side?: 'end' | 'start' | 'bottom';
}
// vfModal as a panel at one side of the screen.
function vfDrawer(props: VfDrawerProps): VfuncInstance & VfModalMethods;
```

### `vfConfirm` — F

예/아니요 alertdialog. open()이 답의 Promise를 돌려주고, danger면 취소 버튼에서 시작.

메시지: `confirm.cancel`, `confirm.ok`

```js
if (await vf.vfConfirm({ title: 'Delete 3 items?', variant: 'danger', confirmLabel: 'Delete' }).open()) remove();
```

```ts
interface VfConfirmProps {
  title: VsContent;
  message?: VsContent;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger';
  id?: string;
  className?: string;
}
// A `role="alertdialog"`; Escape, the backdrop and the close button answer false.
function vfConfirm(props: VfConfirmProps): VfuncInstance & { open(): Promise<boolean>; close(reason?: string): void; isOpen(): boolean; };
```

### `vfToast` — F

알림 영역 하나(라이브 영역). show()로 추가하고 일정 시간 뒤 사라지며, hover·focus 중에는 유지.

메시지: `toast.dismiss`, `toast.region`

```js
const toast = vf.vfToast(); toast.show({ message: 'Saved', variant: 'success' });
```

```ts
interface VfToastProps {
  position?: 'bottom-end' | 'bottom-start' | 'bottom-center' | 'top-end' | 'top-start' | 'top-center';
  duration?: number;
  max?: number;
  label?: string;
}
// The notification region (a live region added to document.body at once). Create it once.
function vfToast(props?: VfToastProps): VfuncInstance & { show(options: VfToastOptions): string; dismiss(id: string): void; clear(): void; };
```

### `vfDropdown` — F

동작 메뉴를 여는 버튼(WAI-ARIA 메뉴 버튼: 화살표, Home, End, 글자, Esc).

```js
vf.vfDropdown({ trigger: { label: 'Actions' }, items: [{ label: 'Rename', action: 'rename' }, { separator: true }, { label: 'Delete', action: 'delete', danger: true }], onSelect: (e) => run(e.data.action) })
```

```ts
interface VfDropdownProps {
  trigger: Omit<VsButtonProps, 'id' | 'action' | 'aria'>;
  items: VfMenuItem[];
  placement?: VfPlacement;
  label?: string;
  onSelect?: (e: VfUiEvent<{ action: string | undefined; item: VfMenuItem }>) => void;
  id?: string;
  ref?: string;
  className?: string;
}
// A menu button (WAI-ARIA): arrows, Home, End, first letters, Escape, Tab.
function vfDropdown(props: VfDropdownProps): VfuncInstance & { open(): void; close(): void; isOpen(): boolean };
```

### `vfPopover` — F

버튼 옆의 비모달 대화상자. Esc, 바깥 클릭, 포커스 이탈로 닫힘.

메시지: `modal.close`

```js
vf.vfPopover({ trigger: { label: 'Help' }, title: 'Shortcuts', content: vf.html`<p>Press / to search.</p>` })
```

```ts
interface VfPopoverProps {
  trigger: Omit<VsButtonProps, 'id' | 'action' | 'aria'>;
  content: VfSlot;
  title?: VsContent;
  label?: string;
  placement?: VfPlacement;
  onOpen?: (e: VfUiEvent<{}>) => void;
  onClose?: (e: VfUiEvent<{ reason: string }>) => void;
  id?: string;
  ref?: string;
  className?: string;
}
// A non-modal `role="dialog"` next to its trigger.
function vfPopover(props: VfPopoverProps): VfuncInstance & { open(): void; close(): void; isOpen(): boolean };
```

## 데이터

### `vsTable` — S

정렬 헤더 버튼(aria-sort, data-action="sort"), 행 키, 빈·로딩 상태를 가진 표. vfPagination과 앱 state로 목록 화면을 만듭니다.

메시지: `common.loading`

```js
vf.vsTable({ caption: 'Users', columns: [{ key: 'name', label: 'Name', sortable: true }, { key: 'age', label: 'Age', align: 'end' }], data: rows, sort: state.sort })
```

```ts
interface VsTableProps<T = any> {
  columns: Array<VsTableColumn<T>>;
  data: T[];
  sort?: { key: string; dir: 'asc' | 'desc' } | null;
  rowKey?: string;
  selected?: string[];
  rowAction?: string;
  caption?: VsContent;
  emptyText?: VsContent;
  loading?: boolean;
  indexBase?: number;
  id?: string;
  ref?: string;
  className?: string;
}
// A `<table>` in a `<div class="vf-table">` (horizontal scroll).
function vsTable<T = any>(props: VsTableProps<T>): SafeHtml;
```

### `vsSparkline` — S

대체 텍스트가 있는 작은 정적 SVG 추세(선·막대). 표와 통계 카드용.

메시지: `sparkline.empty`, `sparkline.summary`

```js
vf.vsSparkline({ data: [3, 5, 4, 8, 7], type: 'line' })
```

```ts
interface VsSparklineProps {
  data: number[];
  type?: 'line' | 'bar';
  label?: string;
  format?: Intl.NumberFormatOptions;
  id?: string;
  ref?: string;
  className?: string;
}
// A small `<svg role="img" class="vf-sparkline">`; color is currentColor, size from CSS.
function vsSparkline(props: VsSparklineProps): SafeHtml;
```

### `vfGrid` — F

데이터 그리드(데이터 파일): 정렬, 페이징, 필터, 행 선택, 서버 모드, 고정 헤더. G-1 그리드 계약.

파일: `vfunc-ui-data.js`(`vfunc-ui.js` 다음에 로드). 메시지: `grid.range`, `grid.select`, `grid.selectAll`, `grid.selectRow`

```js
vf.vfGrid({ columns, data: users, pageSize: 20, selectable: 'multiple', onSelect: (e) => setSelected(e.data.keys) })
```

```ts
interface VfGridProps<T = any> {
  columns: Array<VsTableColumn<T>>;
  data: T[];
  pageSize?: number;
  selectable?: 'none' | 'single' | 'multiple' | boolean;
  height?: number | string;
  rowKey?: string;
  mode?: 'client' | 'server';
  total?: number;
  query?: string;
  sort?: { key: string; dir: 'asc' | 'desc' } | null;
  loading?: boolean;
  caption?: VsContent;
  emptyText?: VsContent;
  onRowClick?: (e: VfUiEvent<{ row: T | null; key: string; index: number }>) => void;
  onSelect?: (e: VfUiEvent<{ keys: string[]; rows: T[] }>) => void;
  onSort?: (e: VfUiEvent<{ key: string; dir: 'asc' | 'desc' }>) => void;
  onPage?: (e: VfUiEvent<{ page: number }>) => void;
  options?: unknown;
  lib?: unknown;
  id?: string;
  ref?: string;
  className?: string;
}
// A data grid on vsTable and vsPagination.
function vfGrid<T = any>(props: VfGridProps<T>): VfuncInstance & VfGridMethods<T>;
```

### `vsChart` · `vfChart` — P

SVG 차트(데이터 파일): 막대·선·영역·원·도넛·스파크라인, 색은 --vf-chart-* 토큰. vfChart는 툴팁, 범례 토글, 폭 추적.

파일: `vfunc-ui-data.js`(`vfunc-ui.js` 다음에 로드). 메시지: `chart.label`, `chart.legend`, `chart.point`

```js
vf.vfChart({ type: 'line', label: 'Monthly sales', data: { labels: ['Jan', 'Feb', 'Mar'], series: [{ name: '2026', data: [12, 19, 15] }] } })
```

```ts
interface VsChartProps {
  type?: VfChartType;
  data: VfChartData;
  label?: string;
  height?: number;
  width?: number;
  valueFormat?: Intl.NumberFormatOptions;
  legend?: boolean;
  dataTable?: boolean;
  id?: string;
  ref?: string;
  className?: string;
}
// A `<figure class="vf-chart">` with an `<svg role="img">`.
function vsChart(props: VsChartProps): SafeHtml;
interface VfChartProps extends VsChartProps {
  onClick?: (e: VfUiEvent<{ series: string | null; index: number; label: string | number; value: number | null }>) => void;
  options?: unknown;
  lib?: unknown;
}
// vsChart with focusable marks and a tooltip, legend toggles, a fade-in on new data, width tracking.
function vfChart(props: VfChartProps): VfuncInstance & VfChartMethods;
```

## 어댑터 (기본 그리드·차트와 같은 props·메서드 + `lib`, `options`)

### `vfChartChartjs`

파일: `vfunc-chart-chartjs.js`

```ts
interface VfChartChartjsProps extends VfChartProps {
  lib?: unknown;
  options?: Record<string, unknown>;
}
function vfChartChartjs(props: VfChartChartjsProps): VfuncInstance & VfChartMethods;
```

### `vfChartEcharts`

파일: `vfunc-chart-echarts.js`

```ts
interface VfChartEchartsProps extends VfChartProps {
  lib?: unknown;
  options?: Record<string, unknown>;
}
function vfChartEcharts(props: VfChartEchartsProps): VfuncInstance & VfChartMethods;
```

### `vfGridAg`

파일: `vfunc-grid-ag.js`

```ts
interface VfGridAgProps<T = any> extends VfGridProps<T> {
  lib?: unknown;
  options?: Record<string, unknown>;
}
function vfGridAg<T = any>(props: VfGridAgProps<T>): VfuncInstance & VfGridMethods<T>;
```

### `vfGridTabulator`

파일: `vfunc-grid-tabulator.js`

```ts
interface VfGridTabulatorProps<T = any> extends VfGridProps<T> {
  lib?: unknown;
  options?: Record<string, unknown>;
}
function vfGridTabulator<T = any>(props: VfGridTabulatorProps<T>): VfuncInstance & VfGridMethods<T>;
```
