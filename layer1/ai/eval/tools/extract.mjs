// SPDX-License-Identifier: Apache-2.0
//
// Turns a saved model answer (answer.md) into a project folder (maintainer decision D-024).
// The answer lists files as `### relative/path` followed by one fenced code block. The folder
// gets the task's project files first, then the answer's files on top, then lib/ from layer1/dist
// (and layer2/dist for a layer 2 task).
//
//   node layer1/ai/eval/tools/extract.mjs <answer.md> <task id> <out dir>

import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = fileURLToPath(new URL('../../../../', import.meta.url));
export const EVAL = fileURLToPath(new URL('../', import.meta.url));

/** Files the grader puts in lib/ (the models are told they exist). */
export const LIB = {
  'lib/vfunc.js': 'layer1/dist/vfunc.js',
  'lib/vfunc.esm.js': 'layer1/dist/vfunc.esm.js',
  'lib/vfunc.tokens.css': 'layer1/css/vfunc.tokens.css'
};

/** More lib/ files for a layer 2 task ("layer": 2 in task.json, decision D-039). */
export const LIB_LAYER2 = {
  'lib/vfunc-ui.js': 'layer2/dist/vfunc-ui.js',
  'lib/vfunc-ui-data.js': 'layer2/dist/vfunc-ui-data.js',
  'lib/vfunc-ui.locale.ko.js': 'layer2/dist/vfunc-ui.locale.ko.js',
  'lib/vfunc-ui.esm.js': 'layer2/dist/vfunc-ui.esm.js',
  'lib/vfunc-ui-data.esm.js': 'layer2/dist/vfunc-ui-data.esm.js',
  'lib/vfunc-ui.css': 'layer2/dist/vfunc-ui.css'
};

/** The lib/ files of a task: { 'lib/…': repository path }. */
export function libFor(task) {
  return task && task.layer === 2 ? Object.assign({}, LIB, LIB_LAYER2) : LIB;
}

/** The kit prompt of a task in a language: layer1/ai/<lang>/<prompt>, else layer2/ai/<lang>/<prompt>. */
export function promptPath(task, lang) {
  const l1 = join(ROOT, 'layer1/ai', lang, task.prompt);
  return existsSync(l1) ? l1 : join(ROOT, 'layer2/ai', lang, task.prompt);
}

const lf = (s) => s.replace(/\r\n/g, '\n');

/** Loads tasks/<id>/task.json; `id` may be the full folder name or its number ("03"). */
export function loadTask(id) {
  const tasks = JSON.parse(readFileSync(join(EVAL, 'tasks', 'index.json'), 'utf8'));
  const name = tasks.filter((t) => t === id || t.slice(0, 2) === String(id).padStart(2, '0'))[0];
  if (!name) throw new Error('Unknown task "' + id + '"');
  const dir = join(EVAL, 'tasks', name);
  const task = JSON.parse(readFileSync(join(dir, 'task.json'), 'utf8'));
  task.dir = dir;
  return task;
}

/** Every task, in order. */
export function loadTasks() {
  return JSON.parse(readFileSync(join(EVAL, 'tasks', 'index.json'), 'utf8')).map(loadTask);
}

/** Resolves a task input source: "@/path" is relative to the repository, anything else to the task folder. */
export function inputPath(task, source) {
  return source.indexOf('@/') === 0 ? join(ROOT, source.slice(2)) : join(task.dir, source);
}

/** Reads the task's project or reference files as { path, content }[]. */
export function readInputs(task, kind) {
  const map = task[kind] || {};
  return Object.keys(map).map((path) => ({ path: path, content: lf(readFileSync(inputPath(task, map[path]), 'utf8')) }));
}

const PATH_OK = /^[A-Za-z0-9_][\w.\-]*(\/[\w.\-]+)*\.[A-Za-z0-9]+$/;

/** Cleans a heading or label into a file path, or returns null. */
export function pathFrom(label) {
  let s = label.trim()
    .replace(/^\*\*(.*)\*\*$/, '$1')
    .replace(/^`(.*)`$/, '$1')
    .replace(/^(file|파일)\s*[:：]\s*/i, '')
    .replace(/^`(.*)`$/, '$1')
    .replace(/\s+\((new|changed|updated|새 파일|수정)\)$/i, '')
    .replace(/\\/g, '/')
    .replace(/^\.\//, '');
  return PATH_OK.test(s) && s.split('/').indexOf('..') < 0 ? s : null;
}

/**
 * Parses an answer. Returns { files: [{ path, content }], report, notes }. `notes` lists every
 * deviation from the output rules (the manual review reads them).
 */
export function parseAnswer(markdown) {
  const lines = lf(markdown).split('\n');
  const files = [];
  const notes = [];
  for (let i = 0; i < lines.length; i++) {
    const heading = /^#{2,4}\s+(.+?)\s*#*\s*$/.exec(lines[i]);
    const label = heading ? heading[1] : (/^(\*\*[^*]+\*\*|`[^`]+`)\s*:?\s*$/.exec(lines[i]) || [])[1];
    if (!label) continue;
    const path = pathFrom(label.replace(/:$/, ''));
    if (!path) continue;
    let j = i + 1;
    while (j < lines.length && j <= i + 3 && !/^\s*(`{3,}|~{3,})/.test(lines[j])) j++;
    const open = /^\s*(`{3,}|~{3,})(.*)$/.exec(lines[j] || '');
    if (!open && heading && /^report\.md$/i.test(path)) {
      // A report written as plain markdown after its heading: take the text up to the next file.
      let k = i + 1;
      while (k < lines.length && !(/^#{2,4}\s+(.+?)\s*#*\s*$/.test(lines[k]) && pathFrom(/^#{2,4}\s+(.+?)\s*#*\s*$/.exec(lines[k])[1]))) k++;
      files.push({ path: path, content: lines.slice(i + 1, k).join('\n').trim() + '\n' });
      i = k - 1;
      continue;
    }
    if (!open) {
      if (heading) notes.push('"' + path + '": heading without a code block');
      continue;
    }
    if (!heading) notes.push('"' + path + '": file name not written as a ### heading');
    const fence = open[1];
    const close = new RegExp('^\\s*' + (fence[0] === '`' ? '`' : '~') + '{' + fence.length + ',}\\s*$');
    const body = [];
    let k = j + 1;
    while (k < lines.length && !close.test(lines[k])) body.push(lines[k++]);
    if (k >= lines.length) notes.push('"' + path + '": code block not closed');
    const content = body.join('\n') + '\n';
    if (/^\s*(\.\.\.|…|\/\/ \.\.\.|<!-- \.\.\. -->)\s*$/m.test(content)) notes.push('"' + path + '": contains an elision ("...")');
    const previous = files.findIndex((f) => f.path === path);
    if (previous >= 0) { notes.push('"' + path + '": given twice, the last one is used'); files.splice(previous, 1); }
    files.push({ path: path, content: content });
    i = k;
  }
  const reportIndex = files.findIndex((f) => /^report\.md$/i.test(f.path));
  const report = reportIndex >= 0 ? files.splice(reportIndex, 1)[0].content : null;
  if (report === null) notes.push('no REPORT.md');
  const kept = files.filter((f) => {
    if (f.path.indexOf('lib/') !== 0) return true;
    notes.push('"' + f.path + '": files in lib/ are provided and were ignored');
    return false;
  });
  return { files: kept, report: report, notes: notes };
}

/**
 * Builds the project folder for `task` from `markdown` in `outDir` (emptied first).
 * Returns { files, report, notes, keepViolations, workFiles } where `workFiles` is every file of
 * the folder except lib/ ({ path, content }).
 */
export function extractAnswer(markdown, task, outDir) {
  const parsed = parseAnswer(markdown);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const work = {};
  for (const f of readInputs(task, 'project')) work[f.path] = f.content;
  const original = Object.assign({}, work);
  for (const f of parsed.files) work[f.path] = f.content;
  const keepViolations = (task.mustKeep || []).filter((p) => original[p] !== undefined && lf(work[p]) !== original[p]);
  for (const path of Object.keys(work)) {
    mkdirSync(dirname(join(outDir, path)), { recursive: true });
    writeFileSync(join(outDir, path), work[path]);
  }
  if (parsed.report !== null) writeFileSync(join(outDir, 'REPORT.md'), parsed.report);
  const lib = libFor(task);
  for (const path of Object.keys(lib)) {
    mkdirSync(dirname(join(outDir, path)), { recursive: true });
    copyFileSync(join(ROOT, lib[path]), join(outDir, path));
  }
  return {
    files: parsed.files.map((f) => f.path),
    report: parsed.report,
    notes: parsed.notes,
    keepViolations: keepViolations,
    workFiles: Object.keys(work).sort().map((p) => ({ path: p, content: work[p] }))
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [answer, id, out] = process.argv.slice(2);
  if (!answer || !id || !out || !existsSync(answer)) {
    console.error('usage: node layer1/ai/eval/tools/extract.mjs <answer.md> <task id> <out dir>');
    process.exit(2);
  }
  const result = extractAnswer(readFileSync(answer, 'utf8'), loadTask(id), out);
  console.log('files: ' + result.files.join(', '));
  for (const note of result.notes) console.log('note: ' + note);
  for (const path of result.keepViolations) console.log('changed a file that must stay the same: ' + path);
}
