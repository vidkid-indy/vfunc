// SPDX-License-Identifier: Apache-2.0
//
// Writes one paste-ready file per task and language (maintainer decision D-024): the evaluation
// header, the kit (AGENTS.template.md, llms.txt, the task's prompt), the task text and its input
// files. Reference answers and checks are never included. Bundles are generated, not committed.
//
//   node layer1/ai/eval/tools/bundle.mjs [--lang en|ko] [--out <dir>] [task ids…]
//   default: both languages, every task, into build/out/eval/bundles/<lang>/

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, EVAL, loadTask, loadTasks, readInputs } from './extract.mjs';

export const LANGS = ['en', 'ko'];

const lf = (s) => s.replace(/\r\n/g, '\n');
const read = (path) => lf(readFileSync(path, 'utf8'));
const FENCE_LANG = { '.js': 'js', '.mjs': 'js', '.jsx': 'jsx', '.html': 'html', '.css': 'css', '.json': 'json', '.md': 'markdown', '.txt': 'text' };

/** A fenced block that its own content cannot close. */
export function fenced(content, lang) {
  const runs = content.match(/`{3,}/g) || [];
  const size = Math.max(3, ...runs.map((r) => r.length + 1));
  const fence = '`'.repeat(size);
  return fence + (lang || '') + '\n' + content.replace(/\n?$/, '\n') + fence;
}

/** The kit files given with a task, as { name, content }. */
export function kitFiles(task, lang) {
  const kit = join(ROOT, 'layer1/ai');
  const files = [
    { name: 'AGENTS.md', content: read(join(kit, lang, 'AGENTS.template.md')) },
    { name: lang === 'ko' ? 'llms.ko.txt' : 'llms.txt', content: read(join(kit, lang === 'ko' ? 'llms.ko.txt' : 'llms.txt')) }
  ];
  if (task.prompt) {
    const text = read(join(kit, lang, task.prompt));
    const cut = text.indexOf('\n---\n');
    files.push({ name: task.prompt.split('/').pop(), content: cut >= 0 ? text.slice(cut + 5).replace(/^\n+/, '') : text });
  }
  return files;
}

/** Builds the bundle text of one task in one language. */
export function buildBundle(task, lang) {
  const version = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
  const ko = lang === 'ko';
  const header = read(join(EVAL, 'header.' + lang + '.md')).replace(/@VERSION@/g, version);
  const parts = [
    '# ' + (ko ? 'vfunc.js 평가 과제 ' : 'vfunc.js evaluation task ') + task.id + ' — ' + task.title[lang],
    '',
    header.trim(),
    ''
  ];
  parts.push('## ' + (ko ? '킷 파일' : 'Kit files'), '');
  for (const f of kitFiles(task, lang)) parts.push('### ' + f.name, '', fenced(f.content, 'markdown'), '');
  parts.push('## ' + (ko ? '과제' : 'Task'), '', read(join(task.dir, 'task.' + lang + '.md')).trim(), '');
  const project = readInputs(task, 'project');
  if (project.length) {
    parts.push('## ' + (ko ? '프로젝트 파일 (고쳐도 되는 파일)' : 'Project files (you may change these)'), '');
    for (const f of project) parts.push('### ' + f.path, '', fenced(f.content, FENCE_LANG[extname(f.path)]), '');
  }
  const reference = readInputs(task, 'reference');
  if (reference.length) {
    parts.push('## ' + (ko ? '참고 파일 (프로젝트에 없음)' : 'Reference files (not part of the project)'), '');
    for (const f of reference) parts.push('### ' + f.path, '', fenced(f.content, FENCE_LANG[extname(f.path)]), '');
  }
  parts.push('## ' + (ko ? '답변' : 'Your answer'), '', ko
    ? '위 출력 규칙대로 파일을 `### 경로` + 코드 블록으로 내고, 마지막에 `### REPORT.md`를 내세요.'
    : 'Give your files as `### path` + one code block each, as the output rules above say, and end with `### REPORT.md`.', '');
  return parts.join('\n');
}

/** Writes bundles; returns the written paths. */
export function writeBundles(options) {
  const opts = options || {};
  const out = opts.out || join(ROOT, 'build/out/eval/bundles');
  const tasks = opts.tasks && opts.tasks.length ? opts.tasks.map(loadTask) : loadTasks();
  const written = [];
  for (const lang of opts.lang ? [opts.lang] : LANGS) {
    mkdirSync(join(out, lang), { recursive: true });
    for (const task of tasks) {
      const path = join(out, lang, task.id + '.md');
      writeFileSync(path, buildBundle(task, lang));
      written.push(path);
    }
  }
  return written;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const opts = { tasks: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--lang') opts.lang = args[++i];
    else if (args[i] === '--out') opts.out = args[++i];
    else opts.tasks.push(args[i]);
  }
  if (opts.lang && LANGS.indexOf(opts.lang) < 0) {
    console.error('--lang must be en or ko');
    process.exit(2);
  }
  for (const path of writeBundles(opts)) console.log(path);
}
