### React 컴포넌트 이식

`SOURCE`: 아래 `ProductFilter.jsx`와 `ProductFilter.css`(참고 파일이며 프로젝트에는 없음). 이 컴포넌트를 vfunc.js로 다시 써서 독립 페이지로 만드세요: `index.html`, `app.js`, CSS 파일. 데이터 파일 `data/products.json`은 프로젝트에 있습니다(상품 `{ id, name, category, price, stock }`).

원본의 동작을 모두 유지합니다: 로딩·오류 상태, 입력하는 동안 검색(이름, 대소문자 무시), 카테고리, "In stock only", 정렬 세 가지, 개수, 빈 메시지, "Sold out" 배지, USD 가격(`$49.00`). 앱은 한 언어입니다. 원본의 영어 문구를 그대로 쓰세요(i18n 설정 없음). CSS는 원시 값 대신 토큰을 씁니다.

채점기가 쓰는 훅:

| 요소 | 훅 |
|---|---|
| 로딩 / 오류 메시지 | `data-ref="status"`(원본의 문구) |
| 검색 입력칸 | `data-action="search"`, 입력하는 동안 포커스 유지 |
| 카테고리 선택 | `data-action="category"`(값 `all`, `keyboard`, `mouse`, `monitor`) |
| "In stock only" 체크박스 | `data-action="in-stock"` |
| 정렬 선택 | `data-action="sort"`(값 `name`, `price-asc`, `price-desc`) |
| 개수 | `data-ref="count"`(`1 product`, `4 products`) |
| 목록 | `data-ref="list"`. 상품 하나가 요소 하나이고 `data-id` = 상품 id, `data-state="in"` 또는 `"out"`(재고 0) |
| 상품마다 | 이름 `data-ref="name"`, 가격 `data-ref="price"`, 재고가 없을 때만 배지 문구 `Sold out` |
| 빈 메시지 | `data-ref="empty"`(`No products found.`), 상품이 있으면 없거나 숨김 |
