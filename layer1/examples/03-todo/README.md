# 03 todo

A list with **one delegated listener per event type** for all rows, and escaping of user input. / 모든 행을 **이벤트 종류마다 위임 하나**로 처리하고, 사용자 입력을 이스케이프합니다.

- Rows carry `data-id`; handlers find the row with `closest('[data-id]')`. / 행은 `data-id`를 갖고, 핸들러는 `closest`로 찾습니다.
- Add `<img src=x onerror=alert(1)>`: it shows as text, because `vf.html` escapes it. / 텍스트로 보입니다.
- `${item.done ? 'checked' : ''}` inside a tag is allowed: only bare attribute names can go there. / 태그 안에는 속성 이름만 넣을 수 있습니다.
- Methods (`add`, `toggle`, `remove`) are bound to the instance and callable from outside: `todo.add('milk')`. / 메서드는 밖에서도 호출할 수 있습니다.

Production CDN and ESM lines: see [01 hello](../01-hello/README.md). / 운영용 불러오기는 01 hello 참고.
