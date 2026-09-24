# 17 i18n

- `vf.i18n.setup({ locales, fallback, load, persist })`: the first locale is the saved one, then the browser language, then `fallback`. Only locales in the allow-list are loaded. / 허용 목록의 로케일만 불러옵니다.
- `vf.t('cart.items', { count })` fills `{count}` and picks the plural form (`zero` / `one` / `other`). The result is plain text, escaped by `vf.html`. / 치환과 복수형, 결과는 평문입니다.
- Published markup is translated with `data-i18n="key"` (text only, never HTML) and `data-i18n-attr="placeholder:key; aria-label:key"` (allowed attributes only). / 퍼블리싱 HTML은 속성으로 번역합니다.
- `vf.fmt.currency` / `vf.fmt.date` follow the current locale through `Intl`. / 날짜·숫자는 현재 로케일로 포맷합니다.
- On a locale change: re-render components and call `vf.i18n.apply()` again. `<html lang>` is updated for you. / 로케일이 바뀌면 다시 렌더하고 apply를 부릅니다.
- ⚠️ A component renders when it is **created**. Create components that call `vf.t` after `setup()` resolves, or they render missing keys (the development build warns). / 컴포넌트는 **만들 때** 렌더합니다. `vf.t`를 쓰는 컴포넌트는 setup 이후에 만드세요.
