/**
 * Member Zone pathname → tab mapping (Task 10).
 * Owner of public URL path → TabType when a signed-in session loads the SPA.
 * Complementary to utils/urlRouting.ts (?tab= sync) — do not duplicate path maps there.
 */
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
    '/': 'today_mirror',
    '/learning': 'learning',
    '/training': 'learning',
    '/pricing': 'pricing',
    '/luna-balance': 'cycle',
    '/ritual-path': 'ritual_path',
    '/the-bridge': 'bridge',
    '/rhythm-calendar': 'rhythm_calendar',
    '/how-it-works': 'how_it_works',
    '/faq': 'faq',
    '/about': 'about',
    '/privacy': 'privacy',
    '/terms': 'terms',
    '/disclaimer': 'medical',
    '/cookies': 'cookies',
    '/data-rights': 'data_rights',
    '/legal': 'privacy',
  };
  return map[path] ?? null;
};
