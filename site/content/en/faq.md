# FAQ

## Can vfunc.js replace React or Vue?

For most business screens, behaviour on published pages, intranet systems and small SPAs it is enough. For screens that update thousands of rows often, large apps built by big teams, or when you need a rich ecosystem, React or Vue may fit better. See [Compare](compare.md).

## What are the limits?

- **Large lists**: a render replaces the inside of a component (no keyed diff). Very long lists that change often are slower. Split lists into smaller components and keep unchanged areas with `data-vf-keep`. Virtual scrolling comes with the grid in stage 2.
- **Focus and caret**: after a render, focus and caret move back to the element with the same `id`, `data-ref` or `name`, else to the same `data-action` at the same position. Scroll positions are not restored. Do not render on every keystroke.
- **Table rows**: a component that renders `<tr>` needs `tag: 'table'`.
- **Ecosystem**: few component libraries and tools so far. Third-party libraries can be attached directly with `onMount` + `data-vf-keep`.

## What about server rendering and SEO?

vfunc assumes the HTML already exists. When a server (or static files) produces the HTML and vfunc only adds behaviour, search engines read that HTML. This site is built that way.

## How is security handled?

- `vf.html` escapes by position and refuses interpolation in dangerous places, `javascript:` URLs included.
- `opts` and `vf.el` refuse `innerHTML` and string handlers.
- `setState` and merges ignore dangerous keys such as `__proto__`.
- Permissions must be checked on the server; client code can always be bypassed.

If you find a security issue, follow `SECURITY.md` in the repository instead of opening a public issue.

## Can I use TypeScript?

Type declarations (`types/vfunc.d.ts`) ship with the package. Plain scripts without a build get editor type checking with `// @ts-check` and a reference to `types/global.d.ts`.

## Which browsers are supported?

| Build | Browsers |
|---|---|
| `vfunc.min.js`, ESM | Current Chrome, Edge, Firefox and Safari (desktop and mobile) |
| `vfunc.legacy.min.js` | Internet Explorer 11, Edge IE mode |

The examples, the starter and this site are tested automatically in Chromium, Firefox and WebKit on every change.

## Is IE11 supported?

`vfunc.legacy.min.js` runs in IE11 and Edge IE mode; your app code must be ES5 as well. See [Extensions, plugins, IE](extend.md#ie11-edge-ie-mode).

## What is the license?

Apache-2.0. The distributed files contain no third-party code; the tools and the libraries used by examples are all listed under [Licenses](licenses.md).
