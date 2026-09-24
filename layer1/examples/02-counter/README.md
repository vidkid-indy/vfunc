# 02 counter

`state`, `render` and `setState`. / 상태, 렌더, setState.

- `e.sender.count += 1` and `setState({ count })` both schedule a render. / 둘 다 렌더를 예약합니다.
- Changes made in the same tick are rendered **once**: "+10" changes the state ten times and renders one time. / 같은 tick의 변경은 **한 번만** 렌더합니다.
- The value's state is written to `data-state`, and CSS colors it. JS has no colors. / 상태는 `data-state`로, 색은 CSS가 정합니다.

Production: `<script src="https://cdn.jsdelivr.net/npm/vfunc@1.0.0-rc.6/dist/vfunc.min.js" integrity="sha384-GwVQoCmhF6sXRB5A1yeptmNyn17sMVNzWH5DgQIA+mvG54Y4TMKMvctz4Kus4Jtd" crossorigin="anonymous"></script>` · ESM: `import vf from 'vfunc'`
