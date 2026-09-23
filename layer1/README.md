# layer1 — vfunc engine

Stage 1. The engine `vf.vfunc` and its helpers, shipped as a single file (`dist/vfunc.min.js`) plus a legacy build for IE11 / Edge IE mode.

1단계. 엔진 `vf.vfunc`와 헬퍼를 단일 파일로 제공합니다. IE11·Edge IE 모드용 legacy 빌드를 함께 제공합니다.

Planned layout / 예정 구조:

```
src/vfunc.js        single source (ESM)
types/vfunc.d.ts    public API boundary
dist/               generated — do not edit
css/                vfunc.tokens.css (optional neutral tokens)
examples/           runnable samples, no build
ai/                 llms.txt, prompts, design templates
starter/            project skeleton for users
plugins/            official plugins (e.g. update)
test/               unit, security and browser tests
```
