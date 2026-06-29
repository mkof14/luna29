import { describe, expect, it } from 'vitest';
import { readLangFromUrl, readTabFromUrl } from '../../utils/urlRouting';

describe('urlRouting', () => {
  it('reads supported lang from URL', () => {
    window.history.replaceState({}, '', '/?lang=ru&tab=faq');
    expect(readLangFromUrl()).toBe('ru');
  });

  it('reads member tab from URL', () => {
    window.history.replaceState({}, '', '/?tab=reflections&lang=en');
    expect(readTabFromUrl()).toBe('reflections');
  });

  it('ignores invalid tab values', () => {
    window.history.replaceState({}, '', '/?tab=not-a-tab');
    expect(readTabFromUrl()).toBeNull();
  });
});
