# 12 with-bootstrap

Existing Bootstrap markup keeps its classes; vfunc only adds behaviour. / 기존 Bootstrap 마크업의 클래스는 그대로 두고 동작만 더합니다.

- Selectors (`delegates`, `ids`, `refs`) use `data-action`, `id` and `data-ref` — never Bootstrap classes. Renaming or restyling classes cannot break behaviour. / 셀렉터는 Bootstrap 클래스에 걸지 않습니다.
- Bootstrap expresses state with classes (`is-invalid`, `d-none`, `btn-primary`), so this sample toggles them. That is styling, not behaviour; `aria-*` is set as well. / Bootstrap은 상태를 클래스로 표현하므로 토글하되, `aria-*`도 함께 둡니다.
- Loaded from jsDelivr with an exact version and SRI (`bootstrap@5.3.8`, MIT). Not bundled or redistributed; listed in `third-party.json`. / 정확한 버전과 SRI로 불러오며 재배포하지 않습니다.
- The page CSP allows the CDN for styles and fonts only; no inline `style` attributes. / CSP는 CDN을 스타일·글꼴에만 허용합니다.
