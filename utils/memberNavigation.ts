import type { TabType } from './navigation';

/**
 * Member Zone navigation ownership (Task 10):
 * - Hub tab constant: this file (MEMBER_HUB_TAB)
 * - Tab union + nav item lists: utils/navigation.ts
 * - ?tab= URL sync: utils/urlRouting.ts
 * - pathname → tab (signed-in SPA entry): utils/memberFooterNavigation.ts
 * - Tab → view: components/MainContentRouter.tsx
 * - navigateTo state owner: App.tsx
 */

/** Primary hub tab — top nav + sidebar home. */
export const MEMBER_HUB_TAB: TabType = 'today_mirror';

export type MemberNavigateOptions = {
  /** Open sidebar overlay on mobile; keep docked sidebar visible on desktop. */
  openSidebar?: boolean;
  /** Do not auto-close sidebar when navigating (desktop dock stays). */
  keepSidebar?: boolean;
};

/** Single back-to-hub helper — prefer this over inlining MEMBER_HUB_TAB navigations. */
export const createMemberHubBack =
  (navigateTo: (tab: TabType, options?: MemberNavigateOptions) => void) =>
  () =>
    navigateTo(MEMBER_HUB_TAB, { openSidebar: true });
