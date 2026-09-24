// SPDX-License-Identifier: Apache-2.0
//
// Turns results.json into results.md, a table a person can read (maintainer decision D-024).

const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** The markdown report of a graded run. */
export function report(results) {
  const run = results.run || {};
  const tasks = (run.tasks || {});
  const lines = [
    '# Evaluation results — ' + (run.model || 'unknown model'),
    '',
    '| | |',
    '|---|---|',
    '| Model | ' + cell((run.model || '?') + (run.modelVersion ? ' (' + run.modelVersion + ')' : '')) + ' |',
    '| Service | ' + cell(run.service || '?') + ' |',
    '| Run date | ' + cell(run.date || '?') + ' |',
    '| Language | ' + cell(run.lang || '?') + ' |',
    '| Kit version (run) | ' + cell(run.kit || '?') + ' |',
    '| Graded | ' + results.graded + ' with vfunc.js ' + results.kit + ' in ' + results.engines.join(', ') + ' |',
    '| Settings | ' + cell(run.settings || '—') + ' |',
    '',
    '**' + results.summary.tasksPassed + ' / ' + results.summary.tasks + ' tasks passed · ' +
      results.summary.checksPassed + ' / ' + results.summary.checks + ' checks passed**',
    '',
    '| Task | Checks | Static errors | Follow-ups | Pass |',
    '|---|---|---|---|---|'
  ];
  for (const t of results.tasks) {
    const info = tasks[t.id.slice(0, 2)] || {};
    lines.push('| ' + cell(t.id) + ' | ' + t.checks.passed + ' / ' + t.checks.total + ' | ' + t.staticErrors + ' | ' +
      (info.followUps === undefined ? '—' : info.followUps) + ' | ' + (t.pass ? 'yes' : '**no**') + ' |');
  }
  for (const t of results.tasks) {
    const info = tasks[t.id.slice(0, 2)] || {};
    lines.push('', '## ' + t.id + ' — ' + t.title, '');
    if (t.answer) lines.push('Answer: `' + t.answer + '` · files: ' + (t.files.length ? t.files.map((f) => '`' + f + '`').join(', ') : 'none'), '');
    const failed = t.results.filter((c) => !c.pass);
    if (failed.length) {
      lines.push('Failed checks:', '');
      for (const c of failed) lines.push('- ' + c.name + (c.failed.length ? ': ' + c.failed.map(cell).join('; ') : ''));
      lines.push('');
    } else {
      lines.push('All checks passed.', '');
    }
    if (t.static.length) {
      lines.push('Static findings:', '');
      for (const f of t.static) {
        const at = f.lines && f.lines.length > 1 ? ' lines ' + f.lines.join(', ') : (f.line ? ':' + f.line : '');
        lines.push('- ' + f.severity + ' `' + f.rule + '` ' + f.file + at + ' — ' + cell(f.text));
      }
      lines.push('');
    }
    if (t.notes.length) {
      lines.push('Output format notes:', '');
      for (const n of t.notes) lines.push('- ' + cell(n));
      lines.push('');
    }
    if (info.manual || info.notes) {
      lines.push('Manual review:', '');
      for (const key of Object.keys(info.manual || {})) lines.push('- ' + key + ': ' + info.manual[key]);
      if (info.notes) lines.push('- notes: ' + cell(info.notes));
      lines.push('');
    }
  }
  return lines.join('\n').replace(/\n+$/, '') + '\n';
}
