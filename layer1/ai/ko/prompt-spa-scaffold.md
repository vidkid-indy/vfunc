# 프롬프트: 요구사항으로 vfunc.js SPA 골격 만들기

**사용법.** 스타터 템플릿(`layer1/starter`)에서 시작해, 아래 줄 밑의 내용을 AI에 붙여 넣고 앱을 설명하세요. `llms.txt`와 프로젝트의 `AGENTS.md`도 함께 주세요. 구조는 샘플 10(`layer1/examples/10-spa-app`)과 같습니다.

---

당신은 스타터 템플릿 위에 vfunc.js로 싱글 페이지 앱을 만듭니다. `AGENTS.md`와 `llms.txt`를 따르세요. 빌드 단계, 번들러, 프레임워크를 추가하지 않습니다.

## 입력
- `REQUIREMENTS`: 화면, 데이터, 역할, 사용자가 할 수 있어야 하는 일.
- `DESIGN`(선택): `design/DESIGN.md`. 없으면 중립 토큰을 유지하고 디자인 분리 규칙을 지켜 나중에 디자인을 적용할 수 있게 합니다.
- `API`(선택): 엔드포인트와 페이로드. 모르는 것은 `VERIFY:`로 표시하고 `data/`의 로컬 JSON으로 대신합니다.

## 단계
1. **화면 목록.** 표로: 라우트(`/orders/:id`), 페이지 파일, 목적, 필요한 데이터, 동작. 없는 페이지(not found)도 포함합니다.
2. **상태 지도.** 공유할 것(`store.js`에 이름 있는 변경 함수와 함께)과 페이지 안에서만 쓰는 것(컴포넌트 `state`)을 나눕니다. 토큰이나 비밀값은 store에 두지 않습니다.
3. **메시지.** 보이는 텍스트는 모두 키로(`orders.empty`, 복수형이 있는 `orders.count`), `locales/en.json`과 `locales/ko.json`에.
4. **파일.** 이 순서로 씁니다: `api.js`, `store.js`, `components/*.js`, `pages/*.js`, 마지막으로 `app.js`의 라우트. 페이지는 `export default function page(ctx, router) { return vf.vfunc({ … }); }`이고, `onMount`에서 데이터를 불러오며 `loading` / `error` / `empty` / `ready` 상태를 둡니다.
5. **스타일.** 컴포넌트 CSS는 `styles/components/*.css`, 페이지 CSS는 `styles/pages/*.css`. `var(--vf-*)`만 읽습니다. 상태는 `aria-*` / `data-state`.
6. **확인 목록**으로 점검합니다.

## 여기서 특히 중요한 규칙
- 링크: `<a data-link href="${router.href('/orders')}">`. 코드에서 이동: `router.go('/orders')`.
- 페이지마다 이벤트 종류당 위임 하나. 행은 `data-id`를 가집니다.
- 페이지는 `onDestroy`에서 store 구독을 해제합니다.
- `app.js`에 `vf.ext.update`를 유지하고, 릴리스 때 `APP_VERSION`/`version.json`을 올립니다.
- 클라이언트 라우트는 접근 제어가 아닙니다. 보호가 필요한 API는 모두 서버에서 검사합니다.

## 출력 형식
1. 화면 목록과 상태 지도
2. 메시지 키(두 로케일)
3. 새로 만들거나 바꾼 파일 전체
4. 가정과 `VERIFY:` 항목
5. 확인 목록 결과

## 확인 목록
- [ ] 모든 라우트에 페이지가 있다(not found 포함)
- [ ] 데이터 페이지는 로딩·에러·빈 상태를 보여 준다
- [ ] 공용 상태는 `store.js`의 함수로만 바뀐다
- [ ] 하드코딩한 표시 텍스트가 없고, 두 로케일 파일에 모든 키가 있다
- [ ] JS에 색·크기가 없고, CSS는 토큰만 쓴다
- [ ] 모든 화면을 눌러 봐도 콘솔 에러·경고가 0개다
