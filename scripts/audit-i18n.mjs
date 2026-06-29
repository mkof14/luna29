#!/usr/bin/env node
/**
 * Audit LangCopy objects for missing supported languages.
 * Usage: node scripts/audit-i18n.mjs [--strict] [glob...]
 * Default: scans components, utils, hooks for .ts/.tsx (excludes node_modules).
 * --strict: exit 1 when any LangCopy block is missing a supported language (default).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const LANGS = ['en', 'ru', 'uk', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'ar', 'he'];
const STRICT = process.argv.includes('--strict') || !process.argv.includes('--warn');
const paths = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const DEFAULT_GLOBS = ['components', 'utils', 'hooks'];

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === 'mobile') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|mjs)$/.test(name)) out.push(p);
  }
  return out;
};

const files = (paths.length ? paths : DEFAULT_GLOBS.map((d) => join(ROOT, d)))
  .flatMap((p) => (statSync(p).isDirectory() ? walk(p) : [p]));

const LANG_KEY = /^\s{2,}(en|ru|uk|es|fr|de|zh|ja|pt|ar|he):\s/gm;

const auditFile = (filePath) => {
  const text = readFileSync(filePath, 'utf8');
  const issues = [];
  const re = /(?:const|let|var)\s+(\w+)\s*(?::\s*LangCopy[^=]*)?=\s*\{/g;
  let m;
  while ((m = re.exec(text))) {
    const name = m[1];
    if (!/Lang|lang|Copy|copy|ByLang|i18n|I18n/.test(name) && !text.slice(m.index, m.index + 120).includes('LangCopy')) continue;
    const start = m.index + m[0].length;
    let depth = 1;
    let i = start;
    while (i < text.length && depth > 0) {
      const ch = text[i];
      if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
      i += 1;
    }
    const block = text.slice(start, i - 1);
    const found = new Set();
    for (const lm of block.matchAll(LANG_KEY)) found.add(lm[1]);
    if (!found.has('en')) continue;
    const missing = LANGS.filter((l) => !found.has(l));
    if (missing.length) issues.push({ name, missing, line: text.slice(0, m.index).split('\n').length });
  }
  return issues;
};

let total = 0;
for (const file of files) {
  const issues = auditFile(file);
  if (!issues.length) continue;
  console.log(`\n${relative(ROOT, file)}`);
  for (const { name, missing, line } of issues) {
    console.log(`  L${line} ${name}: missing ${missing.join(', ')}`);
    total += 1;
  }
}

if (!total) {
  console.log('All scanned LangCopy-style maps include all 11 languages (or no LangCopy blocks found).');
} else {
  console.log(`\n${total} LangCopy block(s) missing languages.`);
  if (STRICT) process.exitCode = 1;
}
