import type { TabType } from './navigation';

/** Footer explore links in member zone — always in-app tabs, never public hrefs. */
export type MemberFooterExploreLink = {
  id: TabType;
  testId?: string;
};

export const MEMBER_FOOTER_EXPLORE_TABS: MemberFooterExploreLink[] = [
  { id: 'dashboard' },
  { id: 'cycle' },
  { id: 'rhythm_calendar' },
  { id: 'ritual_path' },
  { id: 'bridge' },
  { id: 'pricing' },
  { id: 'about', testId: 'about' },
  { id: 'how_it_works', testId: 'how_it_works' },
  { id: 'faq' },
  { id: 'learning' },
];

/** Map public URL paths to member tabs when a signed-in session loads the SPA. */
export const pathnameToMemberTab = (pathname: string): TabType | null => {
  const path = pathname.replace(/\/+$/, '') || '/';
  const map: Record<string, TabType> = {
    '/': 'dashboard',
    '/learning': 'learning',
    '/training': 'learning',
    '/pricing': 'pricing',
    '/luna-balance': 'cycle',
    '/ritual-path': 'ritual_path',
    '/how-it-works': 'how_it_works',
    '/faq': 'faq',
    '/about': 'about',
  };
  return map[path] ?? null;
};
