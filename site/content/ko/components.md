# 컴포넌트

layer 2(`vfunc-ui`)는 엔진 위에 만든 클래스 없는 컴포넌트입니다. 수고를 덜어 주는 곳에만 쓰고, 나머지는 HTML 그대로 두면 됩니다. 1.0.0부터 `vfunc` 패키지에 함께 들어 있습니다.

## 불러오기

```html
<link rel="stylesheet" href="css/vfunc.tokens.css">
<link rel="stylesheet" href="css/vfunc-ui.css">

<script src="dist/vfunc.min.js"></script>
<script src="dist/vfunc-ui.min.js"></script>
<!-- 그리드·차트가 필요할 때 -->
<script src="dist/vfunc-ui-data.min.js"></script>
<!-- 한국어 기본 문구 -->
<script src="dist/vfunc-ui.locale.ko.js"></script>
```

- ES 모듈은 `import vf from 'vfunc'` 다음에 `import 'vfunc/ui'`(그리드·차트는 `import 'vfunc/ui/data'`)를 쓰면 `vf`에 멤버가 붙습니다.
- IE11은 `vfunc-ui.legacy.min.js`·`vfunc-ui-data.legacy.min.js`·`vfunc-ui.legacy.css`를 씁니다. 엔진·코어·데이터를 한 파일로 묶은 `vfunc-all.legacy.min.js`도 있습니다.

## 쓰는 법

- `vf.vs*(props)`는 마크업(SafeHtml)을 돌려줍니다. `vf.html`이나 `render`에 그대로 넣으면 되고 두 번 이스케이프되지 않습니다.
- `vf.vf*(props)`는 인스턴스를 돌려줍니다. `.mount(el)`로 붙이거나 부모 컴포넌트의 `childs`에 넣습니다. 콜백은 `{ sender, event, data }`를 받습니다.
- 모든 `vs*`는 `id`, `ref`(`data-ref`), `action`(`data-action`), `className`, `describedBy`를 받습니다. 폼 컨트롤에 `label`·`hint`·`error`를 주면 연결된 필드로 감쌉니다.
- 문자열 props는 모두 이스케이프합니다. 마크업은 `vf.html`로 넘깁니다.
- `vs*`의 슬롯(vsCard `body` 등)은 마크업만 받습니다. 그 안에 동작하는 컴포넌트가 필요하면 `id`를 가진 빈 요소를 두고 내 컴포넌트의 `childs`에 `{ targetId, component }`로 넣습니다. vfTabs·vfAccordion·vfCarousel·vfPopover·vfModal·vfDrawer의 content는 인스턴스를 그대로 받아 다시 그려도 살려 둡니다.
- 이벤트는 `data-action`에 위임하고, `vf-*` 클래스는 디자인에만 씁니다.
- 기본 문구는 메시지 키입니다. props나 `vf.i18n.add`로 바꿉니다.

```js
const save = vf.vfunc({
  render: () => vf.html`
    ${vf.vsInput({ name: 'email', type: 'email', label: '이메일', required: true })}
    ${vf.vsButton({ label: '저장', variant: 'primary', action: 'save' })}`,
  delegates: [{ selector: '[data-action="save"]', eventType: 'click', onEvent: async () => {
    if (await confirmSave.open()) toast.show({ message: '저장했습니다', variant: 'success' });
  } }]
});
const confirmSave = vf.vfConfirm({ title: '저장할까요?' });
const toast = vf.vfToast();
save.mount('#app');
```

## 목록

Tier는 S(`vs*`만), P(`vs*` + `vf*`, `vf*`가 `vs*`로 그림), F(`vf*`만)입니다.

{{components}}

## 갤러리

모든 컴포넌트를 한 페이지에서 조작해 볼 수 있습니다: [컴포넌트 갤러리](../layer2/examples/gallery/index.html). 한국어·영어를 바꿔 볼 수 있고, 다크 테마는 OS 설정을 따릅니다.

## AI용 목록

props와 메서드까지 담은 전체 목록은 [ai/ko/components.md](../ai/ko/components.md)입니다. catalog와 타입 선언에서 빌드가 생성하므로 항상 코드와 같습니다. AI 도구에 이 파일과 llms.txt를 함께 주세요.

## 다른 라이브러리

AG Grid·Tabulator·Chart.js·ECharts는 공식 어댑터가 있습니다. 목록에 없는 라이브러리는 [서드파티 통합](third-party.md)의 절차대로 가져옵니다.
