### 앱 래퍼로 쓰는 Leaflet(L1)

`LIBRARY`: `leaflet@1.9.4`(`index.html`이 이미 전역 `L`로 불러옴, `index.html`은 고치지 않음). `DOCS`: Leaflet 1.9 API(`L.map`, `L.circleMarker`, `bindTooltip`, `setStyle`, `map.remove()`). `LEVEL`: **L1**(앱 래퍼).

`REQUEST`: `places-map.js`에 지도 컴포넌트를 쓰고, `app.js`에서 `PLACES` 데이터로 쓰세요.

**래퍼**
- `places-map.js`는 앱의 전역 객체 `app`에 팩토리 `app.vfPlacesMap(props)`를 둡니다(`window.app`이 없으면 만듦). `vf`에는 아무것도 더하지 않습니다.
- props: `places`(`[{ id, name, lat, lng }]`)와 `onSelect`. 마커를 누르면 `onSelect({ sender, event, data: { id } })`로 부릅니다.
- vfunc 인스턴스를 돌려줍니다. Leaflet 지도는 `data-vf-keep`이 있는 요소 안에 두고, 인스턴스가 mount될 때 만들며, destroy될 때 제거합니다(`map.remove()`). 인스턴스에는 메서드 `select(id)`가 있습니다.
- 지도는 모든 장소를 보여 줍니다(마커의 경계에 맞춤).
- 장소마다 `L.circleMarker` 하나, 타일 레이어 없음(페이지는 타일용 네트워크를 쓸 수 없음). 마커마다 장소 이름을 **텍스트로** 보이는 툴팁을 붙입니다(이름에 `<`가 있을 수 있음). 마커 색은 토큰 `--vf-color-primary`에서 가져옵니다.
- 선택된 마커는 `fillOpacity: 1`, 나머지는 `fillOpacity: 0.4`입니다(처음에는 선택 없음).

**페이지**(`app.js`)
- 지도를 `#map-slot`에 mount합니다.
- 마커 클릭과 목록 버튼(`data-action="select"`, `data-id`) 모두 그 장소를 선택합니다. 마커가 강조되고 `[data-ref="current"]`에 `Selected: <name>`(텍스트)이 보입니다.
- 머리글 버튼 `data-action="toggle-map"`은 지도 인스턴스를 destroy하고(페이지에 Leaflet 지도가 남지 않음) 글자를 `Show map`으로 바꿉니다. 다시 누르면 선택이 없는 새 인스턴스를 만들고 글자는 `Hide map`으로 돌아갑니다.
