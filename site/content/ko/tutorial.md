# 따라하기: 할 일 앱 만들기

처음 쓰는 분을 위한 단계별 안내입니다. 파일 세 개로 할 일 앱을 만들고, 목록 저장과 컴포넌트까지 붙인 뒤 인터넷에 올립니다. 설치할 것은 에디터와 파이썬뿐이고 빌드 도구는 없습니다. 한 단계가 10분 정도 걸립니다.

> 단계마다 **완성본 열기** 링크가 있습니다. 막히면 완성본과 내 파일을 비교해 보세요. 이 페이지의 코드는 테스트를 통과한 그 파일입니다.

## 준비

1. **에디터**: [Visual Studio Code](https://code.visualstudio.com/)를 설치합니다. 메모장도 되지만 색 구분이 있어 편합니다.
2. **파이썬**: 파일을 브라우저로 보여 줄 작은 서버에 씁니다. 터미널(Windows는 PowerShell)에 `python --version`을 입력해 버전이 나오면 준비된 것입니다.
   - 없으면 [python.org](https://www.python.org/downloads/)에서 설치하고, Windows에서는 설치 첫 화면의 **Add python.exe to PATH**를 체크합니다.
3. **폴더**: 바탕화면 등에 `todo` 폴더를 만들고 VS Code에서 **파일 → 폴더 열기**로 엽니다.

서버는 `todo` 폴더 안에서 실행합니다. VS Code에서 **터미널 → 새 터미널**을 열고 아래를 입력한 뒤, 브라우저에서 `http://localhost:8080/`을 엽니다. 끝낼 때는 터미널에서 Ctrl+C를 누릅니다.

```bash
python -m http.server 8080
```

- 파일을 더블클릭해서 열면(`file://`) 브라우저가 일부 기능을 막습니다. 항상 위 주소로 엽니다.
- 브라우저에서 **F12**를 누르면 개발자 도구가 열립니다. **Console** 탭에 빨간 글이 보이면 코드 어딘가가 틀린 것입니다. 개발용 vfunc는 흔한 실수를 노란 경고로 알려 줍니다.

## 1단계: 첫 화면

`todo` 폴더에 파일 세 개를 만듭니다. 먼저 **index.html**입니다. 화면의 뼈대이고, vfunc와 내 코드를 불러옵니다.

{{tutorial-01-html}}

- `Content-Security-Policy` 줄은 보안 설정입니다. 이 페이지와 CDN(jsdelivr)의 파일만 실행하도록 허용합니다. 그대로 두세요.
- `vfunc.tokens.css`는 색·간격·글꼴 같은 **디자인 토큰**입니다. 라이트·다크 테마가 들어 있습니다.
- `vfunc.js`는 개발용 파일입니다. `integrity`는 받은 파일이 바뀌지 않았는지 브라우저가 확인하는 값입니다.
- `<div id="app">`이 앱이 그려질 자리입니다.

**style.css**는 끝까지 이 파일 하나를 씁니다. 복사해 두고 넘어가도 됩니다. 색과 간격은 모두 `var(--vf-…)` 토큰이라 테마가 바뀌면 함께 바뀝니다.

{{tutorial-01-css}}

**app.js**가 vfunc 코드입니다.

{{tutorial-01-js}}

- `vf.vfunc({ … })`가 **컴포넌트**(화면의 한 부분)를 만듭니다.
- `state`는 컴포넌트가 기억하는 값입니다. `render`는 state를 받아 HTML을 돌려주고, state가 바뀌면 다시 불립니다.
- `vf.html`로 만든 HTML은 안전합니다. 이름에 `<b>굵게</b>`를 넣어 보세요. 굵어지지 않고 글자 그대로 보입니다.
- `delegates`는 이벤트 연결입니다. `data-action="rename"`인 요소에서 `input`이 일어나면 `e.sender.name`을 바꾸고, 그러면 화면이 다시 그려집니다.
- `hello.mount('#app')`이 컴포넌트를 `#app` 자리에 붙입니다.

![이름을 입력하면 인사말이 바로 바뀝니다](../tutorial/img/ko/01-hello.png)

[완성본 열기](../tutorial/ko/01-hello/index.html)

## 2단계: 할 일 추가하기

이제 이름 대신 할 일을 받습니다. **app.js**를 아래로 바꿉니다. index.html과 style.css는 그대로입니다.

{{tutorial-02-js}}

- 목록은 `state.items` 배열입니다. `render`에서 `items.map(…)`으로 항목마다 `<li>`를 만듭니다.
- 폼은 제출하면 페이지를 새로 불러오려 합니다. `e.event.preventDefault()`가 그것을 막습니다.
- `data-ref="input"`을 붙인 요소는 `e.sender.refs.input`으로 찾습니다.
- 목록을 바꿀 때는 `concat`으로 **새 배열**을 만들어 대입합니다. 대입하면 vfunc가 다시 그립니다.

![할 일 두 개를 추가한 화면](../tutorial/img/ko/02-add.png)

[완성본 열기](../tutorial/ko/02-add/index.html)

## 3단계: 완료 표시와 삭제

항목마다 체크박스와 삭제 버튼을 붙이고, 남은 일 개수를 보여 줍니다.

{{tutorial-03-js}}

- `row`는 항목 하나를 그리는 함수입니다. 줄마다 `data-id`를 붙여 어느 항목인지 알 수 있게 합니다.
- 버튼마다 이벤트를 걸지 않습니다. 컴포넌트에 `data-action="toggle"`, `data-action="remove"` 위임을 **하나씩만** 두고, `idOf(e)`로 줄의 `data-id`를 읽습니다. 항목이 1000개여도 리스너는 세 개입니다.
- `methods`에 동작을 모았습니다. 안에서 `this`는 컴포넌트이고 `this.items`는 `state.items`입니다.
- 완료된 줄은 `data-state="done"`이고, 줄 긋기는 style.css의 `[data-state="done"]`이 합니다. JS는 모양을 정하지 않습니다.

![첫 항목을 완료하면 줄이 그어지고 남은 일이 2개가 됩니다](../tutorial/img/ko/03-done.png)

[완성본 열기](../tutorial/ko/03-done/index.html)

## 4단계: 저장하기

지금은 새로고침하면 목록이 사라집니다. 브라우저 저장소(localStorage)에 저장합니다.

{{tutorial-04-js}}

- `onUpdate`는 다시 그릴 때마다 불립니다. 목록이 바뀌면 다시 그려지므로 여기서 저장하면 됩니다.
- `load()`는 저장된 글을 읽어 목록으로 되돌립니다. 저장소 값은 바깥에서 바뀔 수 있으므로 필요한 필드(`id`, `text`, `done`)만 골라 씁니다.
- 새 항목 번호(`nextId`)는 저장된 번호 다음부터 매깁니다.
- 저장소는 이 브라우저, 이 주소에만 있습니다. 다른 컴퓨터나 시크릿 창에서는 보이지 않습니다.

![새로고침해도 목록과 완료 표시가 남아 있습니다](../tutorial/img/ko/04-save.png)

[완성본 열기](../tutorial/ko/04-save/index.html)

## 5단계: 컴포넌트 쓰기

vfunc에는 버튼, 빈 화면, 알림, 확인 창 같은 **컴포넌트(vfunc-ui)**가 있습니다. 필요한 곳에만 골라 씁니다. **index.html**에 파일 세 줄을 더합니다(`vfunc-ui.css`, `vfunc-ui.js`, 한국어 문구 `vfunc-ui.locale.ko.js`).

{{tutorial-05-html}}

**app.js**:

{{tutorial-05-js}}

- `vf.vs…`는 HTML 조각을 돌려줍니다. `render` 안에 `${vf.vsButton({ … })}`처럼 그대로 넣습니다. `action: 'remove'`는 `data-action="remove"`가 되어 3단계의 위임이 그대로 동작합니다.
- `vf.vf…`는 살아 있는 컴포넌트를 돌려줍니다. 알림 영역 `vf.vfToast()`는 페이지에 하나만 만들고 `toast.show({ … })`로 씁니다.
- `vf.vfConfirm`의 `open()`은 사용자가 고를 때까지 기다립니다. 그래서 `remove`에 `async`를 붙이고 `await`로 답을 받습니다. 답을 받으면 `destroy()`로 정리합니다.
- `vf.i18n.set('ko')`는 컴포넌트의 기본 문구(취소, 닫기)를 한국어로 바꿉니다. 문구를 불러온 뒤 알림 영역을 만들고 앱을 붙입니다.

![목록이 비었을 때는 안내가 보입니다](../tutorial/img/ko/05-empty.png)

![추가하면 오른쪽 아래에 알림이 나타납니다](../tutorial/img/ko/05-toast.png)

![삭제 전에 확인 창이 뜹니다. Esc나 취소를 누르면 지우지 않습니다](../tutorial/img/ko/05-confirm.png)

![컴퓨터를 다크 모드로 바꾸면 토큰이 다크 색으로 바뀝니다. 코드는 그대로입니다](../tutorial/img/ko/05-dark.png)

[완성본 열기](../tutorial/ko/05-components/index.html)

## 6단계: 인터넷에 올리기

**운영용 파일로 바꿉니다.** 개발용 `vfunc.js`는 경고 문구가 들어 있어 큽니다. 올리기 전에 index.html의 스크립트를 min 파일로 바꿉니다. 아래는 5단계 index.html의 운영용입니다(`integrity`도 파일에 맞게 바뀌었습니다).

{{tutorial-05-html-min}}

**GitHub Pages로 올리기** (무료, 계정만 있으면 됩니다):

1. [github.com](https://github.com/)에 가입하고 오른쪽 위 **+ → New repository**를 누릅니다. 이름(예: `todo`)을 적고 **Public**으로 만듭니다.
2. 저장소 화면에서 **Add file → Upload files**를 누르고 `index.html`, `style.css`, `app.js`를 끌어다 놓은 뒤 **Commit changes**를 누릅니다.
3. **Settings → Pages**에서 Source를 **Deploy from a branch**, Branch를 **main**과 **/ (root)**로 고르고 **Save**를 누릅니다.
4. 1~2분 뒤 같은 화면 위쪽에 주소(`https://<아이디>.github.io/todo/`)가 나타납니다. 그 주소를 다른 사람에게 보내면 됩니다.

- 계정 없이 해 보려면 [Netlify Drop](https://app.netlify.com/drop)에 `todo` 폴더를 끌어다 놓아도 됩니다.
- 파일을 고쳐 다시 올렸는데 예전 화면이 보이면 새로고침(Ctrl+F5)합니다. 서버의 캐시 설정은 [배포](deploy.md)에 있습니다.

## 막힐 때

| 증상 | 확인할 것 |
|---|---|
| 화면이 비어 있음 | F12 → Console의 빨간 글. `vf is not defined`면 index.html의 vfunc 주소나 `<script>` 순서(vfunc가 app.js보다 먼저) |
| 주소가 `file://`로 시작함 | 파일을 더블클릭해서 열었습니다. 서버를 켜고 `http://localhost:8080/`으로 엽니다 |
| `Refused to load` 또는 `Content-Security-Policy` 오류 | index.html의 보안 줄에 `https://cdn.jsdelivr.net`이 있는지, 파일 주소가 맞는지 |
| `integrity` 오류 | 버전과 `integrity` 값이 짝이 맞지 않습니다. 이 페이지의 코드를 다시 복사합니다 |
| 추가를 누르면 페이지가 새로 고쳐짐 | `e.event.preventDefault()`가 빠졌습니다 |
| `onclick="…"`이 동작하지 않음 | 보안 설정이 막습니다. `data-action`과 `delegates`를 씁니다 |
| 새로고침하면 목록이 사라짐 | 시크릿 창이거나 브라우저가 저장소를 막고 있습니다. 4단계 코드의 `onUpdate`도 확인합니다 |

그래도 안 되면 [FAQ](faq.md)를 보거나 [GitHub Discussions](https://github.com/vidkid-indy/vfunc/discussions)에 질문을 남겨 주세요. 콘솔 오류 문구를 함께 적으면 빨리 답할 수 있습니다.

## 다음으로

- [스타터와 AI로 앱 만들기](starter.md): 여러 화면, 한국어/영어, 테마를 갖춘 앱 골격을 받아 AI에게 기능을 시켜 봅니다. 연습 과제 10개가 있습니다.
- [핵심 개념](guide.md): 컴포넌트, 상태, 이벤트, 기존 HTML 제어를 자세히 봅니다.
- [컴포넌트](components.md): 5단계에서 쓴 것 말고도 60여 개가 있습니다.
- [예제](examples.md): 21개 예제의 소스와 실행 화면.
