declare const __LUNA_APP_RELEASE__: string;

const FALLBACK_VERSION = 'hero2';

function resolveStaticAssetVersion(): string {
  if (typeof __LUNA_APP_RELEASE__ !== 'undefined') {
    const release = String(__LUNA_APP_RELEASE__ || '').trim();
    if (release) return release.slice(0, 12);
  }
  return FALLBACK_VERSION;
}

export const STATIC_ASSET_VERSION = resolveStaticAssetVersion();

/** Cache-bust same-path static files under /images/ and /brand/. */
export function versionedStaticAsset(path: string): string {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) {
    const sep = path.includes('?') ? '&' : '?';
    return `${path}${sep}v=${encodeURIComponent(STATIC_ASSET_VERSION)}`;
  }
  if (!path.startsWith('/')) return path;
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}v=${encodeURIComponent(STATIC_ASSET_VERSION)}`;
}

export function versionedAbsoluteAsset(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return versionedStaticAsset(`${base}${normalized}`);
}
