# 14 before-after-conversion

The AI prompt kit in action: `layer1/ai/en/prompt-html-to-vfunc.md` (Korean: `ko/`) applied to a publisher's dashboard. / AI 프롬프트 킷의 실제 적용 예입니다.

| Folder / 폴더 | What / 내용 |
|---|---|
| `before/` | the page as delivered: inline `<script>`, `onclick`, `javascript:` link, inline style, hard-coded numbers / 전달받은 그대로 |
| `after/` | the same markup with hook attributes, a CSP meta tag and `app.js`; data from `data/dashboard.json` / 훅 속성, CSP, app.js |
| `CONVERSION.md` | the prompt's output: area table, HTML diff, removed unsafe items, token suggestions, assumptions, checklist / 프롬프트 출력 |

- Six dynamic areas (see the area table); everything else is untouched. The unit test undoes the listed HTML changes and checks that `after/index.html` equals `before/index.html`, and that `dashboard.css` is the same file. / 단위 테스트가 HTML 변경을 되돌려 원본과 같은지 확인합니다.
- **Adopted** (markup and values kept): user menu, summary tabs, status filter, search box. **Replaced** with `render`: KPI cards, table body. / 채택 4곳, 대체 2곳을 함께 보여 줍니다.
- The publisher's CSS keeps its raw values and state classes; `CONVERSION.md` lists the token replacements to agree on. / 퍼블리셔 CSS는 그대로 두고 토큰 치환을 제안만 합니다.
- This run found two gaps in the prompt (inline styles, state classes) and they were fixed in the prompt — see the end of `CONVERSION.md`. / 이번 실행으로 프롬프트의 빈틈 두 가지를 찾아 고쳤습니다.

Note: the conversion was done by the vfunc maintainers' AI assistant following the prompt step by step, not by an independent model run. / 변환은 프롬프트 단계를 그대로 따른 것이며, 독립된 모델 실행 결과는 아닙니다.
