# Roadmap

| Stage | Contents | Status |
|---|---|---|
| Stage 1 | the `vf.vfunc` engine and helpers, router, store, i18n, IE legacy file, tokens, update plugin, examples, starter, AI prompt kit, this site | 1.0 |
| Stage 2 | class-free components `vf.vs*` (markup) and `vf.vf*` (instances), a basic grid and chart, third-party adapters (AG Grid, Tabulator, Chart.js, ECharts), a component gallery, `design-check` | 1.0 (a theme builder comes later) |
| Stage 3 | the class-based `vf.VClass` family, templates, tools | planned |

## Naming

Under one global `vf`, the shape of a name tells you what it is.

| Shape | Meaning | Example |
|---|---|---|
| lowercase | stage 1 features | `vf.vfunc`, `vf.attach`, `vf.router` |
| `vs*` | components that always return a string (stage 2) | `vf.vsButton` |
| `vf*` | components that always return an instance (stage 2) | `vf.vfButton` |
| `vf` + kind + vendor | third-party adapters (stage 2) | `vf.vfGridAg`, `vf.vfChartEcharts` |
| PascalCase | classes (stage 3) | `vf.VClass` |
| `vf.ext.*` | user extensions | `vf.ext.company` |

## Taking part

- Questions and ideas go to GitHub Discussions (once the repository is public); bugs and feature requests to Issues.
- `CONTRIBUTING.md` explains how to contribute and `EXTENDING.md` the extension rules.
