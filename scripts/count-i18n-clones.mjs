#!/usr/bin/env node
/** Count ar/he string leaves that still match en (English clones). */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const LANGS = ['ar', 'he'];
const DIRS = ['components', 'utils', 'hooks'];

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === 'mobile') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(tsx?|mjs)$/.test(name)) out.push(p);
  }
  return out;
};

const files = DIRS.flatMap((d) => walk(join(ROOT, d)));
let clones = 0;
let real = 0;
const byFile = {};

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  if (!text.includes('ar:') && !text.includes('he:')) continue;
  let fileClones = 0;
  for (const loc of LANGS) {
    const re = new RegExp(`\\b${loc}:\\s*['"\`]([^'"\`]*?)['"\`]`, 'g');
    let m;
    while ((m = re.exec(text))) {
      const val = m[1];
      const before = text.slice(Math.max(0, m.index - 800), m.index);
      const enMatch = [...before.matchAll(/\ben:\s*['"`]([^'"`]*?)['"`]/g)].pop();
      if (enMatch && enMatch[1] === val) {
        clones++;
        fileClones++;
      } else if (val.length > 0) real++;
    }
  }
  if (fileClones) byFile[file.replace(ROOT + '/', '')] = fileClones;
}

console.log(`ar/he clones (simple string match): ${clones}`);
console.log(`ar/he non-clone strings (approx): ${real}`);
console.log('\nTop files with clones:');
Object.entries(byFile)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 25)
  .forEach(([f, n]) => console.log(`  ${n}\t${f}`));
