import React, { useCallback, useEffect, useState } from 'react';
import { Language, getLang } from '../../constants';
import { adminService, ContactSubmission } from '../../services/adminService';
import { ADMIN_WORKSPACE_COPY } from '../../utils/adminWorkspaceI18n';
import { useAdminTheme } from './AdminThemeContext';
import { adminBtnPrimary, adminCardInner, adminHeading, adminInput, adminLabel, adminMuted, adminSubheading } from './adminStyles';

type AdminContactsPanelProps = {
  lang: Language;
  onFeedback?: (message: string) => void;
};

export const AdminContactsPanel: React.FC<AdminContactsPanelProps> = ({ lang, onFeedback }) => {
  const { mode } = useAdminTheme();
  const ws = getLang(ADMIN_WORKSPACE_COPY, lang);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getContacts();
      setContacts(result.contacts || []);
    } catch (e) {
      onFeedback?.(e instanceof Error ? e.message : 'Unable to load contacts.');
    } finally {
      setLoading(false);
    }
  }, [onFeedback]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = contacts.find((c) => c.id === selectedId) || null;

  useEffect(() => {
    if (!selected) {
      setReplySubject('');
      setReplyBody('');
      return;
    }
    setReplySubject(selected.repliedAt ? `Re: ${selected.subject}` : `Re: ${selected.subject}`);
    setReplyBody('');
  }, [selected]);

  const sendReply = async () => {
    if (!selected || replyBody.trim().length < 4) return;
    setBusy(true);
    try {
      const result = await adminService.replyToContact({
        id: selected.id,
        subject: replySubject.trim(),
        message: replyBody.trim(),
      });
      onFeedback?.(result.delivered ? `Reply sent to ${selected.email}.` : `Reply saved locally for ${selected.email}.`);
      await load();
    } catch (e) {
      onFeedback?.(e instanceof Error ? e.message : 'Reply failed.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <p className={`text-sm ${adminMuted(mode)}`}>{ws.loading}</p>;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="space-y-2 max-h-[520px] overflow-y-auto">
        {contacts.length === 0 ? (
          <p className={`text-sm ${adminMuted(mode)}`}>No inbound messages yet.</p>
        ) : (
          contacts.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setSelectedId(row.id)}
              className={`w-full text-left p-4 rounded-2xl border transition ${selectedId === row.id ? 'border-luna-purple/50 bg-luna-purple/5' : mode === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white'}`}
            >
              <div className="flex justify-between gap-2">
                <span className={`font-bold ${adminSubheading(mode)}`}>{row.name}</span>
                <span className={`text-xs ${adminMuted(mode)}`}>{new Date(row.at).toLocaleString()}</span>
              </div>
              <p className={`text-sm mt-1 ${adminMuted(mode)}`}>{row.email}</p>
              <p className={`text-sm mt-2 font-semibold ${adminHeading(mode)}`}>{row.subject}</p>
              {row.repliedAt ? <p className="text-xs text-emerald-600 mt-2">Replied · {new Date(row.repliedAt).toLocaleString()}</p> : null}
            </button>
          ))
        )}
      </div>

      <div className={`p-5 space-y-4 ${adminCardInner(mode)}`}>
        {selected ? (
          <>
            <div>
              <p className={adminLabel(mode)}>From</p>
              <p className={`text-sm ${adminSubheading(mode)}`}>{selected.name} · {selected.email}</p>
            </div>
            <div className={`text-sm whitespace-pre-wrap ${adminMuted(mode)} max-h-40 overflow-y-auto`}>{selected.message}</div>
            <input className={`w-full ${adminInput(mode)}`} value={replySubject} onChange={(e) => setReplySubject(e.target.value)} placeholder="Subject" />
            <textarea className={`w-full min-h-[120px] ${adminInput(mode)}`} value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Your reply…" />
            <button type="button" className={adminBtnPrimary} disabled={busy} onClick={() => void sendReply()}>
              {busy ? ws.loading : 'Send reply'}
            </button>
          </>
        ) : (
          <p className={`text-sm ${adminMuted(mode)}`}>Select a message to read and reply.</p>
        )}
      </div>
    </div>
  );
};
