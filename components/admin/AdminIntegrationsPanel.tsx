import React, { useCallback, useEffect, useState } from 'react';
import { Language, getLang } from '../../constants';
import { adminService, IntegrationHealth } from '../../services/adminService';
import { ADMIN_WORKSPACE_COPY } from '../../utils/adminWorkspaceI18n';
import { useAdminTheme } from './AdminThemeContext';
import { adminBtnPrimary, adminCardInner, adminHeading, adminLabel, adminMuted, adminStatHealthy, adminStatWarn } from './adminStyles';

type AdminIntegrationsPanelProps = {
  lang: Language;
  onFeedback?: (message: string) => void;
};

export const AdminIntegrationsPanel: React.FC<AdminIntegrationsPanelProps> = ({ lang, onFeedback }) => {
  const { mode } = useAdminTheme();
  const ws = getLang(ADMIN_WORKSPACE_COPY, lang);
  const [items, setItems] = useState<IntegrationHealth[]>([]);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getIntegrationsHealth();
      setItems(result.integrations || []);
      setEmailEnabled(Boolean(result.emailEnabled));
    } catch (e) {
      onFeedback?.(e instanceof Error ? e.message : 'Unable to load integrations.');
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className={`text-sm ${adminMuted(mode)}`}>{ws.loading}</p>;
  }

  return (
    <div className="space-y-4">
      <div className={`p-4 flex flex-wrap justify-between gap-2 ${adminCardInner(mode)}`}>
        <span className={adminLabel(mode)}>Email delivery</span>
        <span className={emailEnabled ? adminStatHealthy(mode) : adminStatWarn(mode)}>
          {emailEnabled ? 'Resend active' : 'Local queue only'}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((item) => (
          <div key={item.id} className={`p-4 space-y-2 ${adminCardInner(mode)}`}>
            <div className="flex justify-between gap-2 items-center">
              <p className={`font-bold ${adminHeading(mode)}`}>{item.name}</p>
              <span className={item.ok ? adminStatHealthy(mode) : adminStatWarn(mode)}>{item.ok ? ws.configured : 'Missing'}</span>
            </div>
            <p className={`text-xs font-mono ${adminMuted(mode)}`}>{item.envKey}</p>
            <p className={`text-sm ${adminMuted(mode)}`}>{item.detail}</p>
          </div>
        ))}
      </div>
      <button type="button" className={adminBtnPrimary} onClick={() => void load()}>{ws.refreshOps}</button>
    </div>
  );
};
