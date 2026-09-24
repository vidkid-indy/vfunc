### SPA 뼈대: 라우터, store, 두 언어

이 평가에는 스타터 템플릿이 없습니다. `AGENTS.md` 2절의 구조(`index.html`, `app.js`, `store.js`, `api.js`, `pages/*.js`, `components/*.js`, `locales/en.json`, `locales/ko.json`, `styles/`)로 프로젝트를 처음부터 만드세요. 업데이트 플러그인은 없으므로 `vf.ext.update`와 `version.json`은 빼세요. `data/servers.json`은 주어집니다(서버 `{ id, name, region, status, url }`).

`REQUIREMENTS`: 영어와 한국어로 된 작은 앱 "Status board"

**라우트**(해시 모드)

| 라우트 | 페이지 | 페이지의 `<h1>` |
|---|---|---|
| `#/` | 홈 | `home.title` |
| `#/servers` | `data/servers.json`의 서버 목록. 로딩·오류·빈 상태가 있고, 서버 하나는 `data-id`를 가진 요소이며 그 안에 이름을 문구로 하는 `#/servers/<id>` 링크 `a[data-link]`가 있음 | `servers.title` |
| `#/servers/<id>` | 서버 하나. `aria-pressed`가 있는 `data-action="favorite"` 버튼이 즐겨찾기에 넣거나 뺌 | 서버 이름, 없는 id면 `server.missing` |
| 그 밖 | 찾을 수 없음 | `notFound.title` |

**레이아웃**
- 헤더에 nav 링크 `a[data-link]` 두 개: `nav.home` → `#/`, `nav.servers` → `#/servers`. 현재 링크에 `aria-current="page"`가 있고(`#/servers/<id>`에서도 서버 링크), 다른 링크에는 `aria-current`가 없거나 `aria-current="false"`입니다.
- 헤더는 `data-ref="fav-count"`인 요소에 즐겨찾기 수(숫자만)를 보여 주고, 레이블은 `favorites.label`입니다.
- `data-action="locale"`이고 `data-locale="en"` / `"ko"`인 버튼 두 개(문구 `English`, `한국어`)가 언어를 바꿉니다. 현재 언어의 버튼은 `aria-pressed="true"`, 다른 버튼은 `"false"`입니다. 선택은 새로 고침 뒤에도 유지되고 `<html lang>`도 따라 바뀝니다. 저장된 선택이 없으면 브라우저 언어를 따릅니다(한국어가 아니면 영어).
- 페이지는 `<main id="view">` 안에 그리고, 이동할 때마다 이 요소가 포커스를 받습니다.

**상태**
- 즐겨찾기는 `store.js`의 공유 상태입니다. 페이지 이동과 언어 전환 뒤에도 유지됩니다(새로 고침은 아님).

**메시지**(보이는 문구는 모두 로케일 파일에서)

| 키 | en | ko |
|---|---|---|
| `nav.home` | Home | 홈 |
| `nav.servers` | Servers | 서버 |
| `favorites.label` | Favorites | 즐겨찾기 |
| `home.title` | Status board | 상태 보드 |
| `home.intro` | Watch your servers in one place. | 서버를 한곳에서 살펴봅니다. |
| `servers.title` | Servers | 서버 목록 |
| `servers.loading` | Loading… | 불러오는 중… |
| `servers.error` | Could not load servers. | 서버 목록을 불러오지 못했습니다. |
| `servers.empty` | No servers yet. | 아직 서버가 없습니다. |
| `server.favorite.add` | Add to favorites | 즐겨찾기에 추가 |
| `server.favorite.remove` | Remove from favorites | 즐겨찾기에서 빼기 |
| `server.missing` | Server not found | 서버를 찾을 수 없습니다 |
| `notFound.title` | Page not found | 페이지를 찾을 수 없습니다 |

즐겨찾기 버튼은 `server.favorite.add` 또는 `server.favorite.remove`를 보여 줍니다.
