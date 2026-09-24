### SPA scaffold: router, store, two languages

There is no starter template in this evaluation: create the project from scratch with the structure of `AGENTS.md` section 2 (`index.html`, `app.js`, `store.js`, `api.js`, `pages/*.js`, `components/*.js`, `locales/en.json`, `locales/ko.json`, `styles/`). The update plugin is not available: leave `vf.ext.update` and `version.json` out. `data/servers.json` is given (servers `{ id, name, region, status, url }`).

`REQUIREMENTS`: "Status board", a small app in English and Korean.

**Routes** (hash mode)

| Route | Page | `<h1>` of the page |
|---|---|---|
| `#/` | home | `home.title` |
| `#/servers` | server list from `data/servers.json`, with loading, error and empty states; each server is an element with `data-id` holding a link `a[data-link]` to `#/servers/<id>` whose text is the name | `servers.title` |
| `#/servers/<id>` | one server; a button `data-action="favorite"` with `aria-pressed` adds it to or removes it from the favorites | the server name, or `server.missing` for an unknown id |
| anything else | not found | `notFound.title` |

**Layout**
- A header with two nav links `a[data-link]`: `nav.home` → `#/` and `nav.servers` → `#/servers`. The current one has `aria-current="page"` (the servers link also on `#/servers/<id>`); the other has no `aria-current` or `aria-current="false"`.
- The header shows the number of favorites in an element with `data-ref="fav-count"` (a bare number), labelled `favorites.label`.
- Two buttons `data-action="locale"` with `data-locale="en"` / `"ko"` (texts `English`, `한국어`) switch the language; the current one has `aria-pressed="true"`, the other `"false"`. The choice survives a reload, and `<html lang>` follows it. Without a saved choice, follow the browser language (English for anything but Korean).
- Pages render into `<main id="view">`, which gets the focus after each navigation.

**State**
- Favorites are shared state in `store.js`. They survive navigation and a language switch (not a reload).

**Messages** (every visible text comes from the locale files)

| Key | en | ko |
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

The favorite button shows `server.favorite.add` or `server.favorite.remove`.
