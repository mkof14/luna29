import React, { useState } from 'react';
import { Language, getLang } from '../../constants';
import { adminService, MemberSummary } from '../../services/adminService';
import { ADMIN_WORKSPACE_COPY } from '../../utils/adminWorkspaceI18n';
import { useAdminTheme } from './AdminThemeContext';
import { adminBtnPrimary, adminCardInner, adminHeading, adminInput, adminMuted, adminSubheading } from './adminStyles';

type AdminMemberLookupProps = {
  lang: Language;
  onFeedback?: (message: string) => void;
};

export const AdminMemberLookup: React.FC<AdminMemberLookupProps> = ({ lang, onFeedback }) => {
  const { mode } = useAdminTheme();
  const ws = getLang(ADMIN_WORKSPACE_COPY, lang);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemberSummary[]>([]);
  const [busy, setBusy] = useState(false);

  const search = async () => {
    const q = query.trim();
    if (q.length < 2) return onFeedback?.('Enter at least 2 characters.');
    setBusy(true);
    try {
      const payload = await adminService.searchMembers(q);
      setResults(payload.members || []);
      if (!payload.members?.length) onFeedback?.('No members matched.');
    } catch (e) {
      onFeedback?.(e instanceof Error ? e.message : 'Search failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`p-5 space-y-4 ${adminCardInner(mode)}`}>
      <p className={`text-sm font-black ${adminSubheading(mode)}`}>Member lookup</p>
      <div className="flex flex-wrap gap-2">
        <input className={`flex-1 min-w-[200px] ${adminInput(mode)}`} placeholder="Search by email or name…" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void search()} />
        <button type="button" className={adminBtnPrimary} disabled={busy} onClick={() => void search()}>{busy ? ws.loading : 'Search'}</button>
      </div>
      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={adminMuted(mode)}>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Billing</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.email} className={`border-t ${mode === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                  <td className="p-2 font-mono text-xs">{row.email}</td>
                  <td className="p-2">{row.name || '—'}</td>
                  <td className="p-2">{row.role}</td>
                  <td className="p-2">{row.billingStatus}{row.plan ? ` · ${row.plan}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
