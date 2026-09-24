# Prompt: scaffold a vfunc.js SPA from requirements

**How to use.** Start from the starter template (`layer1/starter`), paste everything below the line into your AI, then describe the app. Give the AI `llms.txt` and the project's `AGENTS.md`. The structure is the one of sample 10 (`layer1/examples/10-spa-app`).

---

You are creating a single-page app with vfunc.js on top of the starter template. Follow `AGENTS.md` and `llms.txt`. Do not add a build step, a bundler or a framework.

## Inputs
- `REQUIREMENTS`: screens, data, roles, and anything the user must be able to do.
- `DESIGN` (optional): `design/DESIGN.md`. Without it, keep the neutral tokens and follow the design separation rules so a design can be applied later.
- `API` (optional): endpoints and payloads. Unknown ones are marked `VERIFY:` and backed by a local JSON file in `data/`.

## Steps
1. **Screen list.** A table: route (`/orders/:id`), page file, purpose, data it needs, actions. Include a not-found page.
2. **State map.** What is shared (goes to `store.js` with named change functions) and what is local to a page (component `state`). Never put tokens or secrets in the store.
3. **Messages.** Every visible text as a key (`orders.empty`, `orders.count` with plural forms) in `locales/en.json` and `locales/ko.json`.
4. **Files.** Write, in this order: `api.js`, `store.js`, `components/*.js`, `pages/*.js`, then the routes in `app.js`. A page is `export default function page(ctx, router) { return vf.vfunc({ … }); }` and loads its data in `onMount`, with `loading` / `error` / `empty` / `ready` states.
5. **Styles.** Component CSS in `styles/components/*.css` and page CSS in `styles/pages/*.css`, reading only `var(--vf-*)`. State via `aria-*` / `data-state`.
6. **Check** with the checklist.

## Rules that matter most here
- Links: `<a data-link href="${router.href('/orders')}">`. Navigation in code: `router.go('/orders')`.
- One delegated listener per event type per page; rows carry `data-id`.
- Pages release store subscriptions in `onDestroy`.
- Keep `vf.ext.update` installed in `app.js` and bump `APP_VERSION` / `version.json` on release.
- Client routes are not access control: every protected API call is checked on the server.

## Output format
1. Screen list and state map
2. Message keys (both locales)
3. Every new or changed file, in full
4. Assumptions and `VERIFY:` items
5. Checklist result

## Checklist
- [ ] Every route has a page, including not found
- [ ] Data pages show loading, error and empty states
- [ ] Shared state changes only through `store.js` functions
- [ ] No hard-coded visible text; both locale files have every key
- [ ] No colors or sizes in JS; CSS uses tokens only
- [ ] No console errors or warnings when you click through every screen
