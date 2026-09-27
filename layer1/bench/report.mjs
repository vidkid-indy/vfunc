// SPDX-License-Identifier: Apache-2.0
//
// The benchmark's operations and variants, and the tables made from a results.json:
// results.md (run.mjs) and the site's {{bench}} block (build/site.mjs) use the same rows.

/** Operations in the order of js-framework-benchmark. `rows` is a multiple of the page size. */
export const OPS = [
  { key: 'create', en: 'create rows', ko: '행 만들기', what: { en: 'create {n} rows in an empty table', ko: '빈 표에 {n}행 만들기' } },
  { key: 'createLots', en: 'create many rows', ko: '많은 행 만들기', what: { en: 'create {n10} rows in an empty table', ko: '빈 표에 {n10}행 만들기' } },
  { key: 'append', en: 'append rows', ko: '행 덧붙이기', what: { en: 'append {n} rows to {n} rows', ko: '{n}행 뒤에 {n}행 추가' } },
  { key: 'update', en: 'partial update', ko: '일부 갱신', what: { en: 'change the label of every 10th row of {n}', ko: '{n}행 중 10번째마다 글자 바꾸기' } },
  { key: 'select', en: 'select row', ko: '행 선택', what: { en: 'highlight one row of {n}', ko: '{n}행 중 한 행 강조' } },
  { key: 'swap', en: 'swap rows', ko: '행 교환', what: { en: 'swap two rows of {n}', ko: '{n}행 중 두 행 교환' } },
  { key: 'remove', en: 'remove row', ko: '행 삭제', what: { en: 'remove one row of {n}', ko: '{n}행 중 한 행 삭제' } },
  { key: 'clear', en: 'clear rows', ko: '모두 지우기', what: { en: 'remove all {n} rows', ko: '{n}행 모두 삭제' } }
];

export const VARIANTS = [
  { key: 'naive', en: 'vfunc naive', ko: 'vfunc 단순형' },
  { key: 'recommended', en: 'vfunc recommended', ko: 'vfunc 권장형' },
  { key: 'vanilla', en: 'vanilla', ko: 'vanilla' }
];

export const ENGINES = ['chromium', 'firefox', 'webkit'];

/** Result folder name: <yyyymmdd>-<environment>, lowercase letters, digits and hyphens. */
export const FOLDER_NAME = /^\d{8}-[a-z0-9]+(-[a-z0-9]+)*$/;

/** "Intel(R) Core(TM) i5-7200U CPU @ 2.50GHz" → "i5-7200u" (the default environment part of the folder name). */
export function cpuSlug(model) {
  const short = model.replace(/\(R\)|\(TM\)|@.*$|\bCPU\b|\bIntel\b|\bCore\b|\bAMD\b|\bProcessor\b|\d+-Core/gi, ' ').trim();
  return short.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'cpu';
}

/** Median, min and max of a list of numbers, rounded to 0.1 ms. */
export function stats(samples) {
  const sorted = samples.slice().sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  const round = (x) => Math.round(x * 10) / 10;
  return { median: round(median), min: round(sorted[0]), max: round(sorted[sorted.length - 1]) };
}

const fmtMs = (s) => (s ? s.median.toFixed(1) : '—');
const ratio = (s, base) => (s && base && base.median > 0 ? (s.median / base.median).toFixed(1) + '×' : '—');
const kb = (bytes) => (bytes / 1024).toFixed(2) + ' KB';
const mb = (bytes) => (bytes / 1048576).toFixed(1) + ' MB';

/**
 * Rows of the summary table for one engine: [label, ...per variant "median (ratio to vanilla)"].
 * `lang` is 'en' or 'ko'.
 */
export function summaryRows(results, engine, lang) {
  const e = results.engines[engine];
  const rows = [];
  for (const op of OPS) {
    const byVariant = e.ops[op.key] || {};
    rows.push([op[lang]].concat(VARIANTS.map((v) => {
      const s = byVariant[v.key];
      return v.key === 'vanilla' ? fmtMs(s) : fmtMs(s) + ' (' + ratio(s, byVariant.vanilla) + ')';
    })));
  }
  rows.push([lang === 'ko' ? '시작' : 'startup'].concat(VARIANTS.map((v) => fmtMs(e.startup && e.startup[v.key]))));
  if (e.memory) rows.push([lang === 'ko' ? '메모리(행 만든 뒤)' : 'memory (after create)'].concat(VARIANTS.map((v) => (e.memory[v.key] ? mb(e.memory[v.key]) : '—'))));
  rows.push([lang === 'ko' ? '스크립트 크기(gzip)' : 'script size (gzip)'].concat(VARIANTS.map((v) => kb(results.size[v.key]))));
  return rows;
}

/** One line about where and how it ran. */
export function environmentLine(results, lang) {
  const env = results.environment;
  const s = results.settings;
  return lang === 'ko'
    ? env.os + ', ' + env.cpu + ', vfunc ' + results.vfunc + ', ' + s.size + '행 기준, 예열 ' + s.warmup + '회 + 측정 ' + s.runs + '회의 중앙값(ms)'
    : env.os + ', ' + env.cpu + ', vfunc ' + results.vfunc + ', ' + s.size + ' rows, median of ' + s.runs + ' runs after ' + s.warmup + ' warm-up runs (ms)';
}

/** results.md for a result folder. */
export function renderMarkdown(results) {
  const n = results.settings.size;
  const out = [];
  out.push('# Benchmark results / 벤치마크 결과 — ' + results.date, '');
  out.push('- ' + environmentLine(results, 'en'));
  out.push('- Node ' + results.environment.node + ', Playwright ' + results.environment.playwright + ', ' + results.environment.cores + ' cores, ' + results.environment.memory);
  out.push('- Time: from the click to the end of the forced style and layout after the render (`layout`). The time to the second animation frame (`frame`, includes waiting for the display) is in results.json.');
  out.push('- 시간: 클릭부터 렌더 뒤 강제 스타일·레이아웃이 끝날 때까지(`layout`). 두 번째 애니메이션 프레임까지의 시간(`frame`, 화면 주기 대기 포함)은 results.json에 있습니다.');
  out.push('- In parentheses: the ratio to vanilla. / 괄호 안: vanilla 대비 배수.', '');
  out.push('| Operation / 조작 | What / 내용 |', '|---|---|');
  for (const op of OPS) out.push('| ' + op.en + ' | ' + op.what.en.replace(/\{n\}/g, n).replace(/\{n10\}/g, n * 10) + ' |');
  out.push('');
  for (const engine of ENGINES) {
    const e = results.engines[engine];
    if (!e) continue;
    out.push('## ' + engine + ' ' + e.browser, '');
    out.push('| | ' + VARIANTS.map((v) => v.en).join(' | ') + ' |', '|---|' + VARIANTS.map(() => '---:').join('|') + '|');
    for (const row of summaryRows(results, engine, 'en')) out.push('| ' + row.join(' | ') + ' |');
    out.push('');
    out.push('<details><summary>min – max</summary>', '');
    out.push('| | ' + VARIANTS.map((v) => v.en).join(' | ') + ' |', '|---|' + VARIANTS.map(() => '---:').join('|') + '|');
    for (const op of OPS) {
      out.push('| ' + op.en + ' | ' + VARIANTS.map((v) => {
        const s = e.ops[op.key] && e.ops[op.key][v.key];
        return s ? s.min.toFixed(1) + ' – ' + s.max.toFixed(1) : '—';
      }).join(' | ') + ' |');
    }
    out.push('', '</details>', '');
  }
  return out.join('\n');
}
