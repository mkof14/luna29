#!/usr/bin/env node
/** Fix common LangCopy closing-brace issues after locale fill. */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const TARGETS = ['components', 'utils', 'hooks'].map((d) => join(ROOT, d));

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === 'mobile') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
};

const fix = (text) => {
  let t = text;
  // Multiline locale block before export / section comment
  t = t.replace(/(\n  \},\n)(\nexport )/g, '$1};$2');
  t = t.replace(/(\n  \},\n)(\n\/\/ ───)/g, '$1};$2');
  // One-liner locale before export / comment
  t = t.replace(/(\n  [a-z]{2}: [^\n]+,\n)(\nexport )/g, '$1};$2');
  t = t.replace(/(\n  [a-z]{2}: [^\n]+,\n)(\n\/\/ ───)/g, '$1};$2');
  // Array closers
  t = t.replace(/(\n  \],)(\};)/g, '$1\n};');
  t = t.replace(/(\n  \],)(\n\/\/ ───)/g, '$1\n};$2');
  // phases(...) merged with };
  t = t.replace(/(\n  he: phases\([^\n]+\))\};(\n)/g, '$1,\n};$2');
  // string map last entry merged with };
  t = t.replace(/(\n  he: '[^']*')\};(\n)/g, "$1,\n};$2");
  // object one-liner last entry merged with };
  t = t.replace(/(\n  he: \{[^\n]+\})\};(\n)/g, '$1,\n};$2');
  return t;
};

for (const dir of TARGETS) {
  for (const file of walk(dir)) {
    const before = readFileSync(file, 'utf8');
    const after = fix(before);
    if (after !== before) writeFileSync(file, after);
  }
}
console.log('fix-i18n-closers: done');
