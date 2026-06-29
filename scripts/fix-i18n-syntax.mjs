#!/usr/bin/env node
/** Repair common syntax issues after fill-i18n-locales.mjs */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === 'mobile') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
};

const files = ['components', 'utils', 'hooks'].map((d) => join(ROOT, d)).flatMap((d) => walk(d));

let fixed = 0;
for (const file of files) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  text = text.replace(/,\s*,/g, ',');
  text = text.replace(/\},\s*\};/g, '},');
  text = text.replace(/,\s*\};/g, '};');
  text = text.replace(/(\}|'|"|`|\])\n(\s+(?:ar|he|uk|es|fr|de|zh|ja|pt|ru|en):)/g, '$1,\n$2');
  text = text.replace(/(\d)\n(\s+(?:ar|he):)/g, '$1,\n$2');
  if (text !== before) {
    writeFileSync(file, text);
    fixed += 1;
  }
}
console.log(`Repaired ${fixed} file(s).`);
