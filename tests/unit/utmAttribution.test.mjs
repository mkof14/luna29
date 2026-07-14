import { describe, expect, it, beforeEach, vi } from 'vitest';
import { captureUtmFromLocation, readStoredUtm, utmEventParams } from '../../utils/utmAttribution.ts';

describe('utmAttribution', () => {
  beforeEach(() => {
    const store = new Map();
    vi.stubGlobal('window', {
      location: { search: '?utm_source=ads&utm_campaign=beta&gclid=abc123', pathname: '/' },
      localStorage: {
        getItem: (k) => (store.has(k) ? store.get(k) : null),
        setItem: (k, v) => store.set(k, String(v)),
        removeItem: (k) => store.delete(k),
      },
    });
  });

  it('captures and reuses UTM params', () => {
    const captured = captureUtmFromLocation();
    expect(captured.utm_source).toBe('ads');
    expect(captured.utm_campaign).toBe('beta');
    expect(captured.gclid).toBe('abc123');
    expect(readStoredUtm().utm_source).toBe('ads');
    expect(utmEventParams()).toMatchObject({
      utm_source: 'ads',
      utm_campaign: 'beta',
      gclid: 'abc123',
      landing_path: '/',
    });
  });
});
