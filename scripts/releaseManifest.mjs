#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';

const manifestPath = path.join(process.cwd(), 'release', 'version.json');

/** @typedef {{ semver: string; release: string; cacheKey: string; status: string; completedAt: string; label?: string }} ReleaseManifest */

/** @returns {ReleaseManifest} */
export const readReleaseManifest = () => {
  const raw = readFileSync(manifestPath, 'utf8');
  return JSON.parse(raw);
};

/** @param {ReleaseManifest} manifest */
export const resolveReleaseTag = (manifest) => {
  const fromEnv = String(
    process.env.VITE_APP_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA || '',
  ).trim();
  if (fromEnv) return fromEnv.slice(0, 64);
  return manifest.release || manifest.cacheKey || manifest.semver || 'dev';
};

/** Short tag for SW cache busting (max 12 chars in appShellVersion). */
/** @param {ReleaseManifest} manifest */
export const resolveCacheKey = (manifest) => {
  const tag = resolveReleaseTag(manifest);
  if (tag.length <= 12) return tag;
  return String(manifest.cacheKey || manifest.semver || tag).trim().slice(0, 12);
};
