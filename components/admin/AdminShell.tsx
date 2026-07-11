import React, { useState } from 'react';
import { Language, getLang } from '../../constants';
import { AdminRole, AuthSession } from '../../types';
import { ADMIN_WORKSPACE_COPY, AdminWorkspaceTab, tabLabel } from '../../utils/adminWorkspaceI18n';
import { ADMIN_ZONE_COPY } from '../../utils/adminZoneCopy';
import { AdminSidebar } from './AdminSidebar';
import { AdminThemeProvider, useAdminTheme } from './AdminThemeContext';
import LanguageSelector from '../LanguageSelector';
import { adminBtnSecondary, adminShellBg, adminTopbarBg } from './adminStyles';

type AdminShellInnerProps = {
  session: AuthSession | null;
  lang: Language;
  setLang: (lang: Language) => void;
  activeTab: AdminWorkspaceTab;
  onTabChange: (tab: AdminWorkspaceTab) => void;
  onBack: () => void;
  onLogout: () => void;
  onRoleChange: (role: AdminRole) => void;
  roleLabel: (role: AdminRole) => string;
  roleOptions: AdminRole[];
  actionFeedback: string | null;
  children: React.ReactNode;
};

const AdminShellInner: React.FC<AdminShellInnerProps> = ({
  session,
  lang,
  setLang,
  activeTab,
  onTabChange,
  onBack,
  onLogout,
  onRoleChange,
  roleLabel,
  roleOptions,
  actionFeedback,
  children,
}) => {
  const copy = getLang(ADMIN_WORKSPACE_COPY, lang);
  const zoneCopy = getLang(ADMIN_ZONE_COPY, lang);
  const { mode, toggle } = useAdminTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className={`min-h-screen flex ${adminShellBg(mode)} ${mode === 'dark' ? 'dark' : ''}`}>
      <AdminSidebar
        lang={lang}
        onLangChange={setLang}
        active={activeTab}
        onChange={onTabChange}
        permissions={session?.permissions || []}
        role={session?.role}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className={`sticky top-0 z-40 px-4 md:px-6 py-4 ${adminTopbarBg(mode)}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                className={adminBtnSecondary(mode)}
                aria-label="Toggle sidebar"
              >
                ☰
              </button>
              <div className="min-w-0">
                <h1 className={`text-lg md:text-xl font-black truncate ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {tabLabel(copy, activeTab)}
                </h1>
                <p className={`text-xs truncate ${mode === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>
                  Luna29 Admin
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden sm:block">
                <LanguageSelector current={lang} onSelect={setLang} variant="default" menuAlign="right" />
              </div>
              <button type="button" onClick={toggle} className={adminBtnSecondary(mode)} title={mode === 'dark' ? copy.themeLight : copy.themeDark}>
                {mode === 'dark' ? '☀' : '🌙'}
              </button>
              <button type="button" onClick={onBack} className={adminBtnSecondary(mode)}>
                ← {copy.backToSite}
              </button>
              <button type="button" onClick={onLogout} className={adminBtnSecondary(mode)}>
                {zoneCopy.logout}
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:hidden">
            <LanguageSelector current={lang} onSelect={setLang} variant="footer" menuAlign="left" menuPlacement="bottom" />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'dark' ? 'bg-luna-purple/20 text-luna-purple border border-luna-purple/30' : 'bg-luna-purple/10 text-luna-purple border border-luna-purple/20'}`}>
              {session?.email || '—'}
            </span>
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'dark' ? 'bg-white/5 text-slate-300 border border-white/10' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
              {roleLabel((session?.role || 'member') as AdminRole)}
            </span>
            <select
              value={session?.role || 'member'}
              onChange={(e) => onRoleChange(e.target.value as AdminRole)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${mode === 'dark' ? 'bg-[#0a101c] border-white/10 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>{roleLabel(role)}</option>
              ))}
            </select>
          </div>

          {actionFeedback ? (
            <p className={`mt-3 text-sm font-semibold ${mode === 'dark' ? 'text-luna-teal' : 'text-luna-purple'}`}>
              {actionFeedback}
            </p>
          ) : null}
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export type AdminShellProps = AdminShellInnerProps;

export const AdminShell: React.FC<AdminShellProps> = (props) => (
  <AdminThemeProvider>
    <AdminShellInner {...props} />
  </AdminThemeProvider>
);

export { useAdminTheme };
