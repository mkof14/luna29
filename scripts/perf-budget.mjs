#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const root = process.cwd();
const assetsDir = path.join(root, 'dist', 'assets');

const MAX_CRITICAL_JS_GZIP = Number(process.env.MAX_CRITICAL_JS_GZIP || 220 * 1024);
const MAX_PUBLIC_LANDING_GZIP = Number(process.env.MAX_PUBLIC_LANDING_GZIP || 38 * 1024);
const MAX_INDEX_CSS_GZIP = Number(process.env.MAX_INDEX_CSS_GZIP || 34 * 1024);
const MAX_LABS_VIEW_GZIP = Number(process.env.MAX_LABS_VIEW_GZIP || 43 * 1024);

const formatKb = (bytes) => `${(bytes / 1024).toFixed(2)} kB`;

const readAssetMap = async () => {
  const files = await fs.readdir(assetsDir);
  const result = [];
  for (const file of files) {
    const abs = path.join(assetsDir, file);
    const stat = await fs.stat(abs);
    if (!stat.isFile()) continue;
    const content = await fs.readFile(abs);
    result.push({
      file,
      size: stat.size,
      gzip: gzipSync(content).length,
    });
  }
  return result;
};

const run = async () => {
  const assets = await readAssetMap();
  const find = (re) => assets.find((a) => re.test(a.file));

  const criticalFiles = [
    find(/^index-.*\.js$/),
    find(/^vendor-react-.*\.js$/),
    find(/^vendor-ui-.*\.js$/),
  ].filter(Boolean);

  const criticalJsGzip = criticalFiles.reduce((sum, item) => sum + item.gzip, 0);
  const publicLanding = find(/^feature-public-landing-.*\.js$/);
  const labsView = find(/^LabsView-.*\.js$/);
  const indexCss = find(/^index-.*\.css$/);

  const failures = [];
  if (criticalJsGzip > MAX_CRITICAL_JS_GZIP) {
    failures.push(`Critical JS gzip ${formatKb(criticalJsGzip)} exceeds ${formatKb(MAX_CRITICAL_JS_GZIP)}`);
  }
  if (publicLanding && publicLanding.gzip > MAX_PUBLIC_LANDING_GZIP) {
    failures.push(`Public landing gzip ${formatKb(publicLanding.gzip)} exceeds ${formatKb(MAX_PUBLIC_LANDING_GZIP)}`);
  }
  if (labsView && labsView.gzip > MAX_LABS_VIEW_GZIP) {
    failures.push(`LabsView gzip ${formatKb(labsView.gzip)} exceeds ${formatKb(MAX_LABS_VIEW_GZIP)}`);
  }
  if (indexCss && indexCss.gzip > MAX_INDEX_CSS_GZIP) {
    failures.push(`index.css gzip ${formatKb(indexCss.gzip)} exceeds ${formatKb(MAX_INDEX_CSS_GZIP)}`);
  }

  console.log('Performance Budget Report');
  console.log(`- Critical JS gzip: ${formatKb(criticalJsGzip)} (limit ${formatKb(MAX_CRITICAL_JS_GZIP)})`);
  if (publicLanding) {
    console.log(`- Public landing gzip: ${formatKb(publicLanding.gzip)} (limit ${formatKb(MAX_PUBLIC_LANDING_GZIP)})`);
  }
  if (labsView) {
    console.log(`- LabsView gzip: ${formatKb(labsView.gzip)} (limit ${formatKb(MAX_LABS_VIEW_GZIP)})`);
  }
  if (indexCss) {
    console.log(`- index.css gzip: ${formatKb(indexCss.gzip)} (limit ${formatKb(MAX_INDEX_CSS_GZIP)})`);
  }

  if (failures.length > 0) {
    console.error('Budget check failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('Budget check passed.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
