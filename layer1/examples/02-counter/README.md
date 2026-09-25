# 02 counter

`state`, `render` and `setState`. / 상태, 렌더, setState.

- `e.sender.count += 1` and `setState({ count })` both schedule a render. / 둘 다 렌더를 예약합니다.
- Changes made in the same tick are rendered **once**: "+10" changes the state ten times and renders one time. / 같은 tick의 변경은 **한 번만** 렌더합니다.
- The value's state is written to `data-state`, and CSS colors it. JS has no colors. / 상태는 `data-state`로, 색은 CSS가 정합니다.

Production: `<script src="https://cdn.jsdelivr.net/npm/vfunc@1.0.0-rc.7/dist/vfunc.min.js" integrity="sha384-VcX1hu8m+g9DMkbKU9OAHkF7vifW5Iglb4xlRfgvyrGtRUPpIRsnOMxzohR4Mt5N" crossorigin="anonymous"></script>` · ESM: `import vf from 'vfunc'`
