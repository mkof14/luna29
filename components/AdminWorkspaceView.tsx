import React, { useEffect, useMemo, useState } from 'react';
import { Language } from '../constants';
import { AdminRole, AuthSession } from '../types';
import { AdminShell } from './admin/AdminShell';
import { pickDefaultAdminTab } from './admin/AdminSidebar';
import { AdminWorkspaceTab } from '../utils/adminWorkspaceI18n';
import { AdminZoneView } from './AdminZoneView';

const roleOptions: AdminRole[] = ['viewer', 'operator', 'content_manager', 'finance_manager', 'super_admin'];

type AdminWorkspaceViewProps = {
  session: AuthSession | null;
  lang: Language;
  setLang: (lang: Language) => void;
  onBack: () => void;
  onLogout: () => void;
  onRoleChange: (role: AdminRole) => void;
};

export const AdminWorkspaceView: React.FC<AdminWorkspaceViewProps> = ({
  session,
  lang,
  setLang,
  onBack,
  onLogout,
  onRoleChange,
}) => {
  const [activeTab, setActiveTab] = useState<AdminWorkspaceTab>(() =>
    pickDefaultAdminTab(session?.permissions || [], session?.role),
  );
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const roleLabel = useMemo(() => {
    const map: Record<Language, Record<AdminRole, string>> = {
      en: { viewer: 'Observer', operator: 'Coordinator', content_manager: 'Content Lead', finance_manager: 'Finance Lead', super_admin: 'Super Admin' },
      ru: { viewer: 'Наблюдатель', operator: 'Координатор', content_manager: 'Контент-лид', finance_manager: 'Финансовый лид', super_admin: 'Супер админ' },
      uk: { viewer: 'Спостерігач', operator: 'Координатор', content_manager: 'Контент-лід', finance_manager: 'Фінансовий лід', super_admin: 'Супер адмін' },
      es: { viewer: 'Observador', operator: 'Coordinador', content_manager: 'Lider de contenido', finance_manager: 'Lider financiero', super_admin: 'Super Admin' },
      fr: { viewer: 'Observateur', operator: 'Coordinateur', content_manager: 'Responsable contenu', finance_manager: 'Responsable finance', super_admin: 'Super Admin' },
      de: { viewer: 'Beobachter', operator: 'Koordinator', content_manager: 'Content Lead', finance_manager: 'Finance Lead', super_admin: 'Super Admin' },
      zh: { viewer: '观察者', operator: '协调员', content_manager: '内容负责人', finance_manager: '财务负责人', super_admin: '超级管理员' },
      ja: { viewer: 'オブザーバー', operator: 'コーディネーター', content_manager: 'コンテンツ担当', finance_manager: '財務担当', super_admin: 'スーパー管理者' },
      pt: { viewer: 'Observador', operator: 'Coordenador', content_manager: 'Lider de conteudo', finance_manager: 'Lider financeiro', super_admin: 'Super Admin' },
      ar: { viewer: 'مراقبة', operator: 'منسّقة', content_manager: 'مسؤولة المحتوى', finance_manager: 'مسؤولة المالية', super_admin: 'مسؤولة عليا' },
      he: { viewer: 'צופה', operator: 'רכזת', content_manager: 'אחראית תוכן', finance_manager: 'אחראית כספים', super_admin: 'מנהלת-על' },
    };
    return (role: AdminRole) => map[lang]?.[role] || map.en[role] || role;
  }, [lang]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <AdminShell
      session={session}
      lang={lang}
      setLang={setLang}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onBack={onBack}
      onLogout={onLogout}
      onRoleChange={onRoleChange}
      roleLabel={roleLabel}
      roleOptions={roleOptions}
      actionFeedback={actionFeedback}
    >
      <AdminZoneView
        lang={lang}
        session={session}
        activeSection={activeTab}
        onFeedback={setActionFeedback}
      />
    </AdminShell>
  );
};
