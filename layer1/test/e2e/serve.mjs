// SPDX-License-Identifier: Apache-2.0
//
// A tiny static server for the browser tests (Node's http only; no dependencies).
// Serves the repository root with no caching. `overrides` lets a test replace a response
// (for example version.json in sample 21) without touching files.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const REPO = ROOT;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.md': 'text/markdown; charset=utf-8'
};

/** Starts a server for `root` (default: the repository). Resolves with { origin, overrides, close }. */
export function startServer(root) {
  const ROOT = root ? root.replace(/[\\/]?$/, sep) : REPO;
  const overrides = {};
  const server = createServer(async (request, response) => {
    const url = new URL(request.url, 'http://localhost');
    const path = decodeURIComponent(url.pathname);
    if (Object.prototype.hasOwnProperty.call(overrides, path)) {
      const o = overrides[path];
      response.writeHead(o.status || 200, { 'Content-Type': o.type || TYPES[extname(path)] || 'text/plain', 'Cache-Control': 'no-store' });
      response.end(o.body);
      return;
    }
    let file = normalize(join(ROOT, path));
    if (file !== ROOT.replace(/[\\/]$/, '') && !file.startsWith(ROOT.replace(/[\\/]?$/, sep))) {
      response.writeHead(403).end();
      return;
    }
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const body = await readFile(file);
      response.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      response.end(body);
    } catch (err) {
      response.writeHead(404, { 'Content-Type': 'text/plain' }).end('not found');
    }
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ origin: 'http://127.0.0.1:' + port, overrides: overrides, close: () => new Promise((done) => server.close(done)) });
    });
  });
}
