### Server list: loading, error, empty and untrusted data

`REQUEST`: Show the server list inside `<section id="servers">`. The data comes from `./data/servers.json` (a relative URL; in production another team's service answers there, so treat every field as untrusted). Each server is `{ id, name, region, status, url }`.

**States**
- While a request runs, `#servers` has `aria-busy="true"`; otherwise `aria-busy="false"`.
- An element with `data-ref="status"` and `role="status"` shows:
  - `Loading servers…` while loading,
  - `Could not load servers.` when the request fails (HTTP error or network error), together with a button `data-action="retry"` (text `Retry`, inside or next to the status element) that loads again,
  - `No servers yet.` when the list is empty,
  - `Showing <shown> of <total>` otherwise (for example `Showing 1 of 4`).

**List**
- The list element has `data-ref="list"`. Each server is one element inside it with `data-id` set to the server id.
- Inside each server: the name in `data-ref="name"`, the region as text, a badge `data-ref="badge"` and a link `data-ref="link"` with the text `Open`.
- The badge has `data-state` = `up`, `down` or `maintenance`, and the texts `Up`, `Down`, `Maintenance`. Any other status becomes `data-state="unknown"` with the text `Unknown`.
- The link's `href` is the server `url` when it is an `http:` or `https:` URL; any other URL must not become a working link.
- Every field is shown as text, never as markup.

**Filter**
- A select with `data-action="status-filter"` has the options `all` (`All`), `up` (`Up`), `down` (`Down`), `maintenance` (`Maintenance`). It filters the list and the `Showing` text. Default: `all`.
