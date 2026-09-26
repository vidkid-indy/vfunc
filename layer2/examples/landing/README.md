# landing — landing sections / 랜딩 섹션

A marketing page in plain HTML and CSS, with components only where they add something: cards, figures, a carousel, an FAQ accordion and a sign-up form. / HTML·CSS로 만든 소개 페이지에 카드, 수치, 캐러셀, FAQ 아코디언, 구독 폼만 컴포넌트로 넣습니다.

| Section / 절 | Component |
|---|---|
| Hero buttons / 첫 화면 버튼 | `vsButton` + a `data-action` delegate that scrolls and moves the focus |
| Features, pricing / 기능, 가격 | `vsCard`, `vsBadge`, `vf.fmt.currency` |
| Numbers / 수치 | `vsStatCard` with `Intl` formats |
| Quotes / 후기 | `vfCarousel` |
| Questions / 질문 | `vfAccordion` |
| Sign-up / 구독 | `vsInput` with `error`, `vsButton`, `vfToast` |

- The layout, headings and text stay in `index.html`; `app.js` fills the slots. Swap the page's design in `style.css` and the tokens. / 배치와 문구는 index.html에 두고 app.js는 빈자리만 채웁니다.
