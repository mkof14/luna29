#!/usr/bin/env node
/**
 * Adds missing locale keys to LangCopy literals by cloning the `en` entry.
 * Usage: node scripts/fill-i18n-locales.mjs [--write]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = new URL('..', import.meta.url).pathname;
const LANGS = ['en', 'ru', 'uk', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'ar', 'he'];
const WRITE = process.argv.includes('--write');
const INDENT = '  ';

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

const extractValue = (text, start) => {
  let i = start;
  while (i < text.length && /\s/.test(text[i])) i += 1;
  const ch = text[i];
  if (ch === '{' || ch === '[') {
    let depth = 0;
    const begin = i;
    for (; i < text.length; i += 1) {
      if (text[i] === ch) depth += 1;
      else if (text[i] === (ch === '{' ? '}' : ']')) {
        depth -= 1;
        if (depth === 0) return text.slice(begin, i + 1);
      }
    }
    throw new Error('unbalanced');
  }
  if (ch === "'" || ch === '"') {
    for (i += 1; i < text.length; i += 1) {
      if (text[i] === ch && text[i - 1] !== '\\') return text.slice(start, i + 1).trim();
    }
  }
  if (ch === '`') {
    for (i += 1; i < text.length; i += 1) {
      if (text[i] === '`' && text[i - 1] !== '\\') return text.slice(start, i + 1).trim();
    }
  }
  let j = i;
  while (j < text.length && text[j] !== ',' && text[j] !== '\n') j += 1;
  return text.slice(i, j).trim();
};


const processFile = (filePath) => {
  const text = readFileSync(filePath, 'utf8');
  const re = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*(?::\s*LangCopy[^=]*)?=\s*\{/g;
  const patches = [];
  let m;
  while ((m = re.exec(text))) {
    const name = m[1];
    const ctx = text.slice(m.index, m.index + 160);
    if (!/Lang|lang|Copy|copy|ByLang|i18n|I18n|COPY|I18N|UI_BY_LANG|DATA/.test(name + ctx)) continue;

    const open = m.index + m[0].length - 1;
    let depth = 1;
    let close = open + 1;
    while (close < text.length && depth > 0) {
      if (text[close] === '{') depth += 1;
      else if (text[close] === '}') depth -= 1;
      close += 1;
    }
    const blockStart = open;
    const blockEnd = close - 1;
    const block = text.slice(blockStart, blockEnd + 1);
    const found = new Set();
    for (const lm of block.matchAll(/^\s{2,}(en|ru|uk|es|fr|de|zh|ja|pt|ar|he):/gm)) found.add(lm[1]);
    if (!found.has('en')) continue;
    const missing = LANGS.filter((l) => !found.has(l));
    if (!missing.length) continue;

    const enLine = block.match(/^\s{2,}en:/m);
    if (!enLine) continue;
    const enValue = extractValue(block, enLine.index + enLine[0].length);
    const insertPos = blockEnd;
    const additions = missing.map((lang) => `${INDENT}${lang}: ${enValue},`).join('\n');
    patches.push({ insertPos, text: `\n${additions}`, name, missing });
  }

  if (!patches.length) return false;
  patches.sort((a, b) => b.insertPos - a.insertPos);
  let out = text;
  for (const p of patches) {
    let before = out.slice(0, p.insertPos).replace(/\s+$/, '');
    if (!before.endsWith(',')) before += ',';
    out = before + p.text + out.slice(p.insertPos);
    console.log(`${relative(ROOT, filePath)} :: ${p.name} +${p.missing.join(',')}`);
  }
  if (WRITE) writeFileSync(filePath, out);
  return true;
};

let n = 0;
for (const f of files) if (processFile(f)) n += 1;
console.log(WRITE ? `Updated ${n} file(s).` : `Dry run — ${n} file(s) would change. Use --write.`);

if (WRITE && n > 0) {
  execSync('node scripts/fix-i18n-closers.mjs', { cwd: ROOT, stdio: 'inherit' });
}
