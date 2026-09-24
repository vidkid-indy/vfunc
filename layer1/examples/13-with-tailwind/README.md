# 13 with-tailwind

- Tailwind utility classes for looks, `data-action` for behaviour. / 모양은 유틸리티 클래스, 동작은 data-action.
- **Classes do not change with state.** State is written to `aria-pressed` and `data-state`, and Tailwind variants (`aria-pressed:bg-primary`, `group-data-[state=done]:line-through`) style it. / 상태는 속성으로 쓰고 Tailwind 변형이 꾸밉니다.
- `@theme` maps Tailwind colors onto `--vf-*` tokens, so a new `tokens.css` restyles Tailwind screens and vfunc components together (plan K-4, Tailwind track). In this track a design change may edit classes in `render`, but never the logic. / `@theme`로 토큰에 연결합니다. 이 트랙에서는 디자인 적용 때 render의 클래스를 고쳐도 되지만 로직은 고치지 않습니다.
- `@tailwindcss/browser@4.3.3` (MIT) builds CSS in the browser and injects a `<style>` element, so this page's CSP needs `style-src 'unsafe-inline'` (scripts stay strict). **For production, build a CSS file with the Tailwind CLI** and drop `'unsafe-inline'`. / 운영에서는 Tailwind CLI로 CSS를 빌드하세요.
