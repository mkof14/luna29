import type { TabType } from './navigation';

/** Primary hub tab — top nav + sidebar home. */
export const MEMBER_HUB_TAB: TabType = 'today_mirror';

export type MemberNavigateOptions = {
  /** Open sidebar overlay on mobile; keep docked sidebar visible on desktop. */
  openSidebar?: boolean;
  /** Do not auto-close sidebar when navigating (desktop dock stays). */
  keepSidebar?: boolean;
};

export const isMemberHubTab = (tab: TabType): boolean =>
  tab === 'today_mirror' ||
  tab === 'history' ||
  tab === 'cycle' ||
  tab === 'library' ||
  tab === 'profile' ||
  tab === 'dashboard';

export const createMemberHubBack =
  (navigateTo: (tab: TabType, options?: MemberNavigateOptions) => void) =>
  () =>
    navigateTo(MEMBER_HUB_TAB, { openSidebar: true });
