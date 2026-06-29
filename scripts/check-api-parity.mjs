#!/usr/bin/env node
/** Ensures api/index.mjs and server/index.mjs both delegate to server/core/apiHandler.mjs */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const apiIndex = await fs.readFile(path.join(root, 'api/index.mjs'), 'utf8');
const serverIndex = await fs.readFile(path.join(root, 'server/index.mjs'), 'utf8');

const errors = [];
if (!apiIndex.includes("from '../server/core/apiHandler.mjs'")) {
  errors.push('api/index.mjs must import buildApiHandler from server/core/apiHandler.mjs');
}
if (!serverIndex.includes("from './core/apiHandler.mjs'")) {
  errors.push('server/index.mjs must import buildApiHandler from ./core/apiHandler.mjs');
}
if (apiIndex.length > 2000) {
  errors.push(`api/index.mjs should be a thin wrapper (got ${apiIndex.length} chars)`);
}
if (serverIndex.length > 2000) {
  errors.push(`server/index.mjs should be a thin wrapper (got ${serverIndex.length} chars)`);
}

if (errors.length) {
  console.error('[api-parity] FAILED');
  errors.forEach((e) => console.error(' -', e));
  process.exit(1);
}

console.log('[api-parity] OK — single shared handler via server/core/apiHandler.mjs');
