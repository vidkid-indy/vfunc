### 서버 목록: 로딩·오류·빈 상태와 신뢰할 수 없는 데이터

`REQUEST`: `<section id="servers">` 안에 서버 목록을 보여 주세요. 데이터는 `./data/servers.json`(상대 URL)에서 옵니다. 운영에서는 다른 팀의 서비스가 이 주소에 응답하므로 모든 필드를 신뢰하지 마세요. 서버 하나는 `{ id, name, region, status, url }`입니다.

**상태**
- 요청 중에는 `#servers`에 `aria-busy="true"`, 그 밖에는 `aria-busy="false"`가 있습니다.
- `data-ref="status"`이고 `role="status"`인 요소가 다음을 보여 줍니다.
  - 불러오는 중: `Loading servers…`
  - 요청 실패(HTTP 오류 또는 네트워크 오류): `Could not load servers.`, 그리고 다시 불러오는 `data-action="retry"` 버튼(문구 `Retry`, 상태 요소 안이나 옆)
  - 목록이 비었을 때: `No servers yet.`
  - 그 밖: `Showing <보이는 수> of <전체 수>`(예: `Showing 1 of 4`)

**목록**
- 목록 요소는 `data-ref="list"`입니다. 서버 하나가 그 안의 요소 하나이고, `data-id`에 서버 id를 둡니다.
- 서버마다: `data-ref="name"` 안의 이름, 텍스트로 된 지역, 배지 `data-ref="badge"`, 문구가 `Open`인 링크 `data-ref="link"`
- 배지의 `data-state`는 `up`, `down`, `maintenance`이고 문구는 `Up`, `Down`, `Maintenance`입니다. 그 밖의 상태는 `data-state="unknown"`, 문구 `Unknown`입니다.
- 링크의 `href`는 `url`이 `http:`나 `https:` URL일 때 그 값입니다. 다른 URL은 동작하는 링크가 되면 안 됩니다.
- 모든 필드는 마크업이 아닌 텍스트로 보입니다.

**필터**
- `data-action="status-filter"`인 선택 상자에 `all`(`All`), `up`(`Up`), `down`(`Down`), `maintenance`(`Maintenance`) 옵션이 있습니다. 목록과 `Showing` 문구를 거릅니다. 기본값은 `all`입니다.
