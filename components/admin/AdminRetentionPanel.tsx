import React, { useCallback, useEffect, useState } from 'react';
import { Language, getLang } from '../../constants';
import { adminService, RetentionSnapshot } from '../../services/adminService';
import { ADMIN_WORKSPACE_COPY } from '../../utils/adminWorkspaceI18n';
import { useAdminTheme } from './AdminThemeContext';
import { adminCardInner, adminHeading, adminLabel, adminMuted, adminStatHealthy, adminStatWarn, adminSubheading } from './adminStyles';

type AdminRetentionPanelProps = {
  lang: Language;
};

export const AdminRetentionPanel: React.FC<AdminRetentionPanelProps> = ({ lang }) => {
  const { mode } = useAdminTheme();
  const ws = getLang(ADMIN_WORKSPACE_COPY, lang);
  const [data, setData] = useState<RetentionSnapshot | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await adminService.getRetention());
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!data) {
    return <p className={`text-sm ${adminMuted(mode)}`}>{ws.loading}</p>;
  }

  const stat = (label: string, value: string | number, tone: 'ok' | 'warn' | 'neutral' = 'neutral') => (
    <div className={`p-4 rounded-2xl border ${tone === 'ok' ? adminStatHealthy(mode) : tone === 'warn' ? adminStatWarn(mode) : adminCardInner(mode)}`}>
      <p className={adminLabel(mode)}>{label}</p>
      <p className={`mt-2 text-2xl font-black ${adminHeading(mode)}`}>{value}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stat('Signups', data.funnel.signups)}
        {stat('Trials', data.funnel.trials)}
        {stat('Paid', data.funnel.paid, 'ok')}
        {stat('Active 7d', data.activeLast7Days, 'ok')}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {stat('Inactive 7d+', data.inactiveOver7Days, 'warn')}
        {stat('At-risk shortlist', data.atRisk.length, data.atRisk.length ? 'warn' : 'ok')}
      </div>
      {data.atRisk.length > 0 && (
        <div className={`p-4 space-y-2 ${adminCardInner(mode)}`}>
          <p className={`text-sm font-black ${adminSubheading(mode)}`}>At-risk members</p>
          <ul className={`text-sm space-y-1 ${adminMuted(mode)}`}>
            {data.atRisk.map((row) => (
              <li key={row.email}>
                {row.email} · {row.daysSinceLogin}d idle · {row.billingStatus}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
