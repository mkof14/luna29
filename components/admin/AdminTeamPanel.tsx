import React, { useState } from 'react';
import { Language, getLang } from '../../constants';
import { AdminRole } from '../../types';
import { adminService, AdminRecord } from '../../services/adminService';
import { ADMIN_WORKSPACE_COPY } from '../../utils/adminWorkspaceI18n';
import { useAdminTheme } from './AdminThemeContext';
import { adminBtnPrimary, adminCardInner, adminHeading, adminInput, adminLabel, adminMuted, adminSubheading } from './adminStyles';

type AdminTeamPanelProps = {
  lang: Language;
  admins: AdminRecord[];
  onAdminsChange: (admins: AdminRecord[]) => Promise<void>;
  onFeedback?: (message: string) => void;
};

const ROLES: AdminRole[] = ['viewer', 'operator', 'content_manager', 'finance_manager', 'super_admin'];

export const AdminTeamPanel: React.FC<AdminTeamPanelProps> = ({ lang, admins, onAdminsChange, onFeedback }) => {
  const { mode } = useAdminTheme();
  const ws = getLang(ADMIN_WORKSPACE_COPY, lang);
  const [assignEmail, setAssignEmail] = useState('');
  const [assignRole, setAssignRole] = useState<AdminRole>('operator');
  const [busy, setBusy] = useState(false);

  const toggleActive = async (id: string) => {
    const next = admins.map((row) => (row.id === id ? { ...row, active: !row.active } : row));
    await onAdminsChange(next);
    onFeedback?.('Team roster updated.');
  };

  const submitRoleAssignment = async () => {
    const email = assignEmail.trim().toLowerCase();
    if (!email.includes('@')) return onFeedback?.('Valid email required.');
    setBusy(true);
    try {
      await adminService.assignRole(email, assignRole);
      onFeedback?.(`Role ${assignRole} assigned to ${email}.`);
      setAssignEmail('');
    } catch (e) {
      onFeedback?.(e instanceof Error ? e.message : 'Role assignment failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3">
        {admins.map((row) => (
          <div key={row.id} className={`p-4 flex flex-wrap items-center justify-between gap-3 ${adminCardInner(mode)}`}>
            <div>
              <p className={`font-bold ${adminHeading(mode)}`}>{row.name}</p>
              <p className={`text-sm ${adminMuted(mode)}`}>{row.email}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full ${mode === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}>{row.role}</span>
              <span className={`text-xs ${row.active ? 'text-emerald-600' : adminMuted(mode)}`}>{row.active ? 'Active' : 'Inactive'}</span>
              <button type="button" className={adminBtnPrimary} onClick={() => void toggleActive(row.id)}>
                {row.active ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className={`p-5 space-y-3 ${adminCardInner(mode)}`}>
        <p className={`text-sm font-black ${adminSubheading(mode)}`}>Assign role to existing member</p>
        <p className={`text-xs ${adminMuted(mode)}`}>The account must already exist — use Invites for new admins.</p>
        <input className={`w-full ${adminInput(mode)}`} placeholder="member@email.com" value={assignEmail} onChange={(e) => setAssignEmail(e.target.value)} />
        <select className={`w-full ${adminInput(mode)}`} value={assignRole} onChange={(e) => setAssignRole(e.target.value as AdminRole)}>
          {ROLES.map((role) => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
        <button type="button" className={adminBtnPrimary} disabled={busy} onClick={() => void submitRoleAssignment()}>
          {busy ? ws.loading : 'Assign role'}
        </button>
      </div>
    </div>
  );
};
