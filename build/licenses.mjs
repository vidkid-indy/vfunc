// SPDX-License-Identifier: Apache-2.0
//
// Third-party license notices, generated from third-party.json (CLAUDE.md rule 23, D-010).
//
//   node build/licenses.mjs           write THIRD_PARTY_LICENSES.txt, the NOTICE section, site data
//   node build/licenses.mjs --check   fail when a generated file is out of date
//
// build.mjs also calls checkBundledInputs() so that a bundle containing code which is neither
// ours nor listed in third-party.json fails the build.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const REQUIRED_FIELDS = ['name', 'version', 'license', 'copyright', 'url', 'usedIn', 'bundled'];

/** Paths (relative to the repository root, "/" separated) that hold our own code. */
const OWN_CODE = ['layer1/src/', 'layer1/plugins/', 'layer2/src/', 'build/'];

/** Where bundled third-party code may come from: node_modules/<name>/ or vendor/<name>/. */
const THIRD_PARTY_DIRS = /^(?:.*\/)?(?:node_modules|vendor)\/((?:@[^/]+\/)?[^/]+)\//;

export const OUTPUTS = {
  text: 'THIRD_PARTY_LICENSES.txt',
  notice: 'NOTICE',
  site: 'site/data/licenses.json'
};

const NOTICE_HEADING = 'Third-party software\n--------------------\n';

export function readThirdParty() {
  return JSON.parse(readFileSync(join(ROOT, 'third-party.json'), 'utf8'));
}

/** Returns a list of problems in third-party.json (empty when valid). */
export function validate(data) {
  const errors = [];
  const allowed = data.allowedLicenses || [];
  const seen = {};
  (data.entries || []).forEach((entry, index) => {
    const label = entry.name || '#' + index;
    for (const field of REQUIRED_FIELDS) {
      if (entry[field] === undefined || entry[field] === '') errors.push(label + ': missing "' + field + '"');
    }
    if (typeof entry.bundled !== 'boolean') errors.push(label + ': "bundled" must be true or false');
    if (entry.license && allowed.indexOf(entry.license) < 0) {
      errors.push(label + ': license "' + entry.license + '" is not in allowedLicenses (CLAUDE.md rule 23)');
    }
    if (entry.bundled) {
      if (!entry.licenseFile) errors.push(label + ': a bundled entry needs "licenseFile"');
      else if (!existsSync(join(ROOT, entry.licenseFile))) errors.push(label + ': licenseFile not found: ' + entry.licenseFile);
    }
    if (seen[label]) errors.push(label + ': listed twice');
    seen[label] = true;
  });
  return errors;
}

/**
 * Checks the inputs of a bundle (esbuild metafile paths, relative to the repository root).
 * Every input must be our own code or come from a third-party directory with a bundled entry.
 */
export function checkBundledInputs(inputs, data) {
  const bundled = {};
  for (const entry of data.entries || []) if (entry.bundled) bundled[entry.name] = true;
  const errors = [];
  for (const input of inputs) {
    const path = relative(ROOT, join(ROOT, input)).split(sep).join('/');
    if (OWN_CODE.some((prefix) => path.indexOf(prefix) === 0)) continue;
    const match = THIRD_PARTY_DIRS.exec(path);
    if (match && bundled[match[1]]) continue;
    errors.push(match
      ? 'bundled "' + match[1] + '" (' + path + ') is not listed as bundled in third-party.json'
      : 'bundled file is neither our code nor a listed third-party module: ' + path);
  }
  return errors;
}

function bundledEntries(data) {
  return (data.entries || []).filter((entry) => entry.bundled);
}

function renderText(data) {
  const entries = bundledEntries(data);
  let out = 'vfunc.js - third-party licenses\n' +
    '(Generated from third-party.json by build/licenses.mjs. Do not edit.)\n\n';
  if (!entries.length) return out + 'The distributed files of vfunc.js bundle no third-party code.\n';
  for (const entry of entries) {
    out += '='.repeat(78) + '\n' +
      entry.name + ' ' + entry.version + '\n' +
      'License: ' + entry.license + '\n' +
      entry.copyright + '\n' +
      entry.url + '\n' +
      'Used in: ' + [].concat(entry.usedIn).join(', ') + '\n' +
      '='.repeat(78) + '\n\n' +
      readFileSync(join(ROOT, entry.licenseFile), 'utf8').replace(/\r\n/g, '\n').trim() + '\n\n';
  }
  return out;
}

function renderNotice(current, data) {
  const index = current.indexOf(NOTICE_HEADING);
  if (index < 0) throw new Error('NOTICE: the "Third-party software" heading is missing.');
  const entries = bundledEntries(data);
  let section = NOTICE_HEADING;
  if (!entries.length) {
    section += 'The distributed files of this project currently bundle no third-party code.\n' +
      'When third-party code is bundled, its notices are listed below and its full\n' +
      'license texts are provided in THIRD_PARTY_LICENSES.txt.\n';
  } else {
    section += 'The distributed files of this project bundle the following third-party code.\n' +
      'Full license texts are provided in THIRD_PARTY_LICENSES.txt.\n\n';
    for (const entry of entries) {
      section += '- ' + entry.name + ' ' + entry.version + ' (' + entry.license + ')\n' +
        '  ' + entry.copyright + '\n  ' + entry.url + '\n';
    }
  }
  section += '(This section is generated from third-party.json by the build script.)\n';
  return current.slice(0, index) + section;
}

function renderSite(data) {
  const entries = (data.entries || []).map((entry) => ({
    name: entry.name,
    version: entry.version,
    license: entry.license,
    copyright: entry.copyright,
    url: entry.url,
    usedIn: [].concat(entry.usedIn),
    bundled: entry.bundled
  }));
  return JSON.stringify({ $comment: 'Generated from third-party.json by build/licenses.mjs. Do not edit.', entries: entries }, null, 2) + '\n';
}

/** Generated file contents: { [relative path]: text }. Throws when third-party.json is invalid. */
export function generate(data) {
  const errors = validate(data);
  if (errors.length) throw new Error('third-party.json:\n  ' + errors.join('\n  '));
  const notice = readFileSync(join(ROOT, OUTPUTS.notice), 'utf8').replace(/\r\n/g, '\n');
  return {
    [OUTPUTS.text]: renderText(data),
    [OUTPUTS.notice]: renderNotice(notice, data),
    [OUTPUTS.site]: renderSite(data)
  };
}

/** Writes (or, with check, compares) the generated files. Returns the paths that were stale. */
export function writeLicenses(options) {
  const check = !!(options && options.check);
  const files = generate(readThirdParty());
  const stale = [];
  for (const path of Object.keys(files)) {
    const full = join(ROOT, path);
    const current = existsSync(full) ? readFileSync(full, 'utf8') : null;
    if (current === files[path]) continue;
    stale.push(path);
    if (!check) {
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, files[path]);
    }
  }
  return stale;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const check = process.argv.indexOf('--check') >= 0;
  try {
    const stale = writeLicenses({ check: check });
    if (check && stale.length) {
      console.error('Out of date (run npm run licenses): ' + stale.join(', '));
      process.exit(1);
    }
    console.log(check ? 'licenses: up to date' : 'licenses: ' + (stale.length ? 'wrote ' + stale.join(', ') : 'up to date'));
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
