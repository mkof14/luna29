import React, { useMemo } from 'react';
import { Language, getLang } from '../../constants';
import { AdminPermission } from '../../types';
import {
  ADMIN_NAV,
  ADMIN_WORKSPACE_COPY,
  AdminNavGroup,
  AdminWorkspaceTab,
  groupLabel,
  tabLabel,
} from '../../utils/adminWorkspaceI18n';
import { useAdminTheme } from './AdminThemeContext';
import { getBrandAssetUrl } from '../../utils/lunaBrandAssets';
import { adminNavItem, adminSidebarBg } from './adminStyles';

type AdminSidebarProps = {
  lang: Language;
  active: AdminWorkspaceTab;
  onChange: (tab: AdminWorkspaceTab) => void;
  permissions: AdminPermission[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

const tabAllowed = (tab: AdminWorkspaceTab, permissions: AdminPermission[]): boolean => {
  if (permissions.includes('super_admin' as AdminPermission)) return true;
  switch (tab) {
    case 'overview':
    case 'services':
      return permissions.some((p) => ['manage_services', 'manage_admin_roles', 'view_technical_metrics'].includes(p));
    case 'integrations':
    case 'analytics':
    case 'mail':
      return permissions.some((p) => ['manage_services', 'manage_admin_roles', 'manage_email_templates'].includes(p));
    case 'finance':
      return permissions.some((p) => ['view_financials', 'manage_admin_roles', 'manage_services'].includes(p));
    case 'campaigns':
    case 'templates':
      return permissions.some((p) => ['manage_marketing', 'manage_email_templates'].includes(p));
    case 'team':
    case 'contacts':
      return permissions.some((p) => ['manage_admin_roles', 'manage_services'].includes(p));
    case 'audit':
      return permissions.some((p) => ['manage_services', 'manage_admin_roles', 'view_financials', 'view_technical_metrics'].includes(p));
    case 'settings':
      return permissions.length > 0;
    default:
      return false;
  }
};

const NAV_ICON: Record<AdminWorkspaceTab, string> = {
  overview: '◉',
  services: '⬡',
  integrations: '⚡',
  analytics: '📊',
  finance: '💎',
  mail: '✉',
  campaigns: '✦',
  templates: '✉',
  team: '👥',
  contacts: '💬',
  audit: '📋',
  settings: '⚙',
};

const GROUPS: AdminNavGroup[] = ['main', 'platform', 'content', 'people', 'reports'];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  lang,
  active,
  onChange,
  permissions,
  collapsed = false,
}) => {
  const copy = getLang(ADMIN_WORKSPACE_COPY, lang);
  const { mode } = useAdminTheme();

  const items = useMemo(
    () => ADMIN_NAV.filter((item) => tabAllowed(item.tab, permissions)),
    [permissions],
  );

  return (
    <aside
      className={`${adminSidebarBg(mode)} flex flex-col shrink-0 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      } min-h-screen sticky top-0`}
    >
      <div className={`p-4 border-b ${mode === 'dark' ? 'border-white/[0.08]' : 'border-slate-200/90'}`}>
        <div className="flex items-center gap-3">
          <img
            src={getBrandAssetUrl('icon')}
            alt="Luna29"
            width={40}
            height={40}
            className="w-10 h-10 rounded-xl shrink-0 object-cover"
          />
          {!collapsed ? (
            <div className="min-w-0">
              <p className={`text-sm font-black tracking-tight truncate ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {copy.brandTitle}
              </p>
              <p className={`text-[10px] truncate ${mode === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                {copy.brandSubtitle}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {GROUPS.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;
          return (
            <div key={group}>
              {!collapsed ? (
                <p className={`px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] ${mode === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>
                  {groupLabel(copy, group)}
                </p>
              ) : null}
              <ul className="space-y-1">
                {groupItems.map(({ tab }) => (
                  <li key={tab}>
                    <button
                      type="button"
                      title={tabLabel(copy, tab)}
                      onClick={() => onChange(tab)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-semibold transition-all ${adminNavItem(mode, active === tab)}`}
                    >
                      <span className="text-base w-5 text-center shrink-0 opacity-80">{NAV_ICON[tab]}</span>
                      {!collapsed ? <span className="truncate">{tabLabel(copy, tab)}</span> : null}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export const pickDefaultAdminTab = (permissions: AdminPermission[]): AdminWorkspaceTab => {
  const tabs = ADMIN_NAV.filter((item) => tabAllowed(item.tab, permissions)).map((item) => item.tab);
  return tabs[0] || 'overview';
};

export const tabAllowedForPermissions = tabAllowed;
