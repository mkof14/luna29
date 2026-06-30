#!/usr/bin/env node
/**
 * Compress public hero/brand raster assets to real WebP (many legacy files were PNG mislabeled as .webp).
 * Run: node scripts/optimize-hero-images.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const explicitFiles = [path.join(root, 'public', 'brand', 'luna-hero-banner.webp')];
const targetDirs = [path.join(root, 'public', 'images', 'heroes')];

const MAX_WIDTH = 960;
const WEBP_QUALITY = 78;

const formatKb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

const optimizeFile = async (absPath) => {
  const ext = path.extname(absPath).toLowerCase();
  if (ext !== '.webp') {
    return { file: absPath, before: 0, after: 0, skipped: true, reason: 'not-webp' };
  }

  const before = (await fs.stat(absPath)).size;
  const buffer = await sharp(absPath)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();

  if (buffer.length >= before * 0.98) {
    return { file: absPath, before, after: before, skipped: true };
  }

  await fs.writeFile(absPath, buffer);
  return { file: absPath, before, after: buffer.length, skipped: false };
};

const run = async () => {
  const files = [...explicitFiles];
  for (const dir of targetDirs) {
    let entries = [];
    try {
      entries = await fs.readdir(dir);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (!/\.webp$/i.test(name)) continue;
      files.push(path.join(dir, name));
    }
  }

  let saved = 0;
  for (const file of files.sort()) {
    const result = await optimizeFile(file);
    const rel = path.relative(root, result.file);
    if (result.skipped) {
      const note = result.reason === 'not-webp' ? 'unsupported ext' : formatKb(result.before);
      console.log(`- skip ${rel} (${note})`);
      continue;
    }
    saved += result.before - result.after;
    console.log(`- ${rel}: ${formatKb(result.before)} -> ${formatKb(result.after)}`);
  }

  console.log(`Saved ${formatKb(saved)} across ${files.length} files.`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
