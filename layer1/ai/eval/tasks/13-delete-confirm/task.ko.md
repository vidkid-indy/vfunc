### 확인을 거치는 삭제

`REQUEST`: `FILES`(`app.js`)의 파일을 목록으로 보이고, layer2 오버레이(`components.md`)로 확인을 받은 뒤 삭제하게 하세요. 페이지는 이미 `lib/vfunc-ui.js`와 `lib/vfunc-ui.css`를 불러옵니다.

**목록**
- `ul#files`에 파일마다 `<li>`를 두고, 이름과 버튼 하나를 넣습니다. 버튼 글자는 `Delete`, 속성은 `id="delete-<id>"`, `data-action="delete"`, `aria-label="Delete <name>"`입니다.
- `[data-ref="count"]`는 `<n> files`를 보입니다(하나면 `1 file`).

**삭제**
- Delete 버튼은 `vf.vfConfirm`을 엽니다. 변형 `danger`, 제목 `Delete <name>?`, 메시지 `This cannot be undone.`, 확인 버튼 글자 `Delete`(취소 버튼은 기본 글자 `Cancel` 그대로).
- 취소, Escape, 닫기 버튼은 아무것도 바꾸지 않고, 포커스는 그 Delete 버튼으로 돌아갑니다.
- 확인하면 목록에서 파일을 지우고 수를 갱신하며, 페이지에 한 번 만든 `vf.vfToast`로 알림 `Deleted <name>`을 띄웁니다. 그다음 포커스는 다음 파일의 Delete 버튼, 없으면 앞 파일의 Delete 버튼, 그것도 없으면 제목 `#files-title`(`tabindex="-1"`이 있음)로 옮깁니다.
- `window.confirm`은 쓰지 않습니다.
