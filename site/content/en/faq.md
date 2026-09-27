# FAQ

## Can vfunc.js replace React or Vue?

For most business screens, behaviour on published pages, intranet systems and small SPAs it is enough. For screens that update thousands of rows often, large apps built by big teams, or when you need a rich ecosystem, React or Vue may fit better. See [Compare](compare.md).

## What are the limits?

- **Large lists**: a render replaces the inside of a component (no keyed diff). Very long lists that change often are slower. Split lists into smaller components and keep unchanged areas with `data-vf-keep`. The built-in `vfGrid` pages long data instead of scrolling it; for virtual scrolling use a grid adapter (`vfGridAg`, `vfGridTabulator`). For numbers, see [the measurements below](#how-slow-are-large-lists).
- **Focus and caret**: after a render, focus and caret move back to the element with the same `id`, `data-ref` or `name`, else to the same `data-action` at the same position. Scroll positions are not restored. Do not render on every keystroke.
- **Table rows**: a component that renders `<tr>` needs `tag: 'table'`.
- **Ecosystem**: few component libraries and tools so far. Third-party libraries can be attached directly with `onMount` + `data-vf-keep`.

## How slow are large lists?

The operations of js-framework-benchmark, measured three ways. Naive: one component redraws the whole screen. Recommended: as the kit teaches, only the `<tbody>` is redrawn, and selecting a row changes an attribute without a render. Vanilla: hand-written code that touches only the changed rows. The numbers are the time from the click to the end of style and layout after the render; in parentheses, the ratio to vanilla.

{{bench}}

- Creating rows and clearing them are close to vanilla.
- Operations that change a few rows (partial update, swap, remove) redraw the whole list and are several to tens of times slower: the cost of having no keyed diff. At about 0.1 s per operation on 1,000 rows this is fine for occasional changes, but not for screens with many rows that change often.
- Operations that change only attributes (selection, expanding) are as fast as vanilla when you change the attribute without a render.
- The numbers depend on the machine and the browser. How they are measured and how to run them yourself: `layer1/bench/README.md` in the repository. To compare with other frameworks, see the [js-framework-benchmark results](https://krausest.github.io/js-framework-benchmark/).

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
