// SPDX-License-Identifier: Apache-2.0
//
// The grader of the LLM evaluation set (layer1/ai/eval, maintainer decision D-024) in a real
// browser (VF_BROWSER, default Chromium): every reference answer passes every check, and an
// answer that changes nothing fails the checks it should. Task 08 loads Chart.js from the CDN.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ENGINE } from './browser.mjs';
import { ROOT } from './serve.mjs';
import { loadTasks } from '../../ai/eval/tools/extract.mjs';
import { gradeAnswers } from '../../ai/eval/tools/grade.mjs';

const work = (name) => join(ROOT, 'build', 'out', 'eval', 'test-' + ENGINE + '-' + name);

test('every reference answer passes in ' + ENGINE, async () => {
  const answers = loadTasks().map((task) => ({ task: task.id, markdown: readFileSync(join(task.dir, 'reference', 'answer.md'), 'utf8') }));
  const results = await gradeAnswers(answers, { engines: [ENGINE], work: work('reference') });
  const failed = results.tasks.filter((t) => !t.pass).map((t) => ({
    task: t.id,
    checks: t.results.filter((c) => !c.pass).map((c) => c.name + ': ' + c.failed.join('; ')),
    static: t.static.filter((f) => f.severity === 'error').map((f) => f.rule + ' ' + f.file + ':' + f.line)
  }));
  assert.deepEqual(failed, []);
});

test('an unchanged project fails the bug checks of task 10 in ' + ENGINE, async () => {
  const results = await gradeAnswers([{ task: '10', markdown: '### REPORT.md\n\nNo changes.\n' }], { engines: [ENGINE], work: work('unchanged') });
  const t = results.tasks[0];
  const bugs = t.results.filter((c) => /^bug \d/.test(c.name));
  assert.equal(bugs.length, 7);
  assert.deepEqual(bugs.filter((c) => c.pass).map((c) => c.name), [], 'every seeded bug is caught');
  assert.equal(t.pass, false);
  assert.deepEqual(t.static.filter((f) => f.severity === 'error').map((f) => f.rule).sort(), ['aria-value', 'class-selector', 'html-string', 'instance-property']);
});
