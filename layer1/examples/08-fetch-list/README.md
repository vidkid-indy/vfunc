# 08 fetch-list

- One `status` value (`idle` / `loading` / `error` / `ready`) decides the screen, so every state is visible and testable. / 상태 값 하나로 화면이 정해집니다.
- `async` methods work as usual: `this.setState(...)` after `await`. / `await` 뒤에 `setState`를 부릅니다.
- Data from the server is escaped like any other value (the 4th user is a `<script>` string). / 서버 데이터도 이스케이프됩니다.
- "Load broken data" fetches invalid JSON → the error state with a retry button. / 깨진 JSON → 에러 상태와 다시 시도 버튼.
- "Crash render" throws inside `render`. The engine logs the error, calls `onError`, and does **not** recover; this app's `onError` resets the state. / 엔진은 알리기만 하고 복구는 `onError`에서 앱이 합니다.

Production CDN and ESM lines: see [01 hello](../01-hello/README.md).
