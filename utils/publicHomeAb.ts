const HERO_AB_KEY = 'luna_hero_ab_v1';

export type HeroAbVariant = 'a' | 'b';

export function resolveHeroAbVariant(): HeroAbVariant {
  if (typeof window === 'undefined') return 'a';
  try {
    const saved = localStorage.getItem(HERO_AB_KEY);
    if (saved === 'a' || saved === 'b') return saved;
    const variant: HeroAbVariant = Math.random() < 0.5 ? 'a' : 'b';
    localStorage.setItem(HERO_AB_KEY, variant);
    return variant;
  } catch {
    return 'a';
  }
}
