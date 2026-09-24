### Convert a published dashboard

`SOURCE`: the publisher's `index.html` and `dashboard.css` below. Convert the page with the prompt. There is no server: keep the three published orders and the KPI values as they are.

`BEHAVIOUR` (hooks to add in parentheses; the grader uses them):
1. **User menu.** The name button (`data-action="menu"`, with `aria-expanded`) opens and closes the menu `<ul id="userMenu">`, which uses the `hidden` attribute and starts closed. Escape and a click outside the menu close it.
2. **Sign out.** The "Sign out" link (`data-action="sign-out"`) closes the menu and changes the name button's text to `Signed out`. No real request, no alert, no `javascript:` URL.
3. **Summary tabs.** The two tab buttons (`data-action="tab"`, `data-tab="week"` / `data-tab="month"`, with `aria-selected`) show the texts of the original script in `#summary`. The active tab also keeps the class `tabs__tab--active` for looks.
4. **Search.** The search box in the top bar (`data-action="search"`) filters the table rows while you type, by order number (`1041` or `#1041`) or customer name, ignoring case. The focus stays in the box.
5. **Status filter.** The select (`data-action="filter"`) filters the rows by status. Search and status filter combine.
6. **No match.** When no row matches, the table body shows one row whose text is `No orders match.`
7. `dashboard.css` must stay byte-for-byte the same, and all visible texts and classes of the page stay.
