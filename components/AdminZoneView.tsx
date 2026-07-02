import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Language, getLang } from '../constants';
import { AdminRole, AuthSession } from '../types';
import { adminService, type AdminRecord, type AdminInviteRecord } from '../services/adminService';
import { AdminWorkspaceTab, ADMIN_WORKSPACE_COPY } from '../utils/adminWorkspaceI18n';
import { ADMIN_ZONE_COPY } from '../utils/adminZoneCopy';
import { ADMIN_EMAIL_TEMPLATES, getTemplateById } from '../utils/adminTemplatesCatalog';
import { buildBrandedAdminEmailHtml, buildBrandedAdminEmailPreviewHtml } from '../utils/adminEmailBranding';
import { AdminActionBar } from './admin/AdminActionBar';
import { AdminAnalyticsPanel } from './admin/AdminAnalyticsPanel';
import { AdminContactsPanel } from './admin/AdminContactsPanel';
import { AdminIntegrationsPanel } from './admin/AdminIntegrationsPanel';
import { AdminRetentionPanel } from './admin/AdminRetentionPanel';
import { AdminMarketingVault, parseMarketingItems, type MarketingItem } from './admin/AdminMarketingVault';
import { AdminTeamPanel } from './admin/AdminTeamPanel';
import { AdminTemplateEditor } from './admin/AdminTemplateEditor';
import { AdminVoicePanel } from './admin/AdminVoicePanel';
import { AdminTemplatePicker } from './admin/AdminTemplatePicker';
import { useAdminTheme } from './admin/AdminThemeContext';
import {
  adminBtnPrimary,
  adminCard,
  adminCardInner,
  adminHeading,
  adminInput,
  adminLabel,
  adminMuted,
  adminStatHealthy,
  adminStatWarn,
  adminSubheading,
} from './admin/adminStyles';
import { AdminMemberLookup } from './admin/AdminMemberLookup';
import { mergeTemplateLocalized, parseTemplateOverrides, type TemplateOverride } from '../utils/adminTemplateMerge';

type AdminZoneViewProps = {
  lang: Language;
  session: AuthSession | null;
  activeSection: AdminWorkspaceTab;
  onFeedback?: (message: string) => void;
};

type InviteRow = { id: string; email: string; kind: 'site' | 'admin'; role?: AdminRole; at: string };

const fmtMoney = (n: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

/** New Admin Zone — built for clarity, i18n, branded templates, and document actions. */
export const AdminZoneView: React.FC<AdminZoneViewProps> = ({ lang, session, activeSection, onFeedback }) => {
  const { mode } = useAdminTheme();
  const ws = getLang(ADMIN_WORKSPACE_COPY, lang);
  const zone = getLang(ADMIN_ZONE_COPY, lang);

  const [ops, setOps] = useState<Awaited<ReturnType<typeof adminService.getOps>> | null>(null);
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof adminService.getMetrics>> | null>(null);
  const [services, setServices] = useState<Array<{ id: string; name: string; status: string; uptime: string }>>([]);
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [audit, setAudit] = useState<Awaited<ReturnType<typeof adminService.getAudit>>>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTemplateId, setSelectedTemplateId] = useState(ADMIN_EMAIL_TEMPLATES[0]?.id || 'tpl-welcome');
  const [previewHtml, setPreviewHtml] = useState('');
  const [mailTo, setMailTo] = useState('');
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [bulkEmails, setBulkEmails] = useState('');

  const [inviteUserEmail, setInviteUserEmail] = useState('');
  const [inviteAdminEmail, setInviteAdminEmail] = useState('');
  const [inviteAdminRole, setInviteAdminRole] = useState<AdminRole>('operator');
  const [inviteLog, setInviteLog] = useState<InviteRow[]>([]);
  const [serverInvites, setServerInvites] = useState<AdminInviteRecord[]>([]);

  const [marketingItems, setMarketingItems] = useState<MarketingItem[]>([]);
  const [templateOverrides, setTemplateOverrides] = useState<TemplateOverride[]>([]);

  const persistMarketing = useCallback(async (items: MarketingItem[]) => {
    setMarketingItems(items);
    await adminService.saveState({ content: items }).catch(() => undefined);
  }, []);

  const feedback = (msg: string) => onFeedback?.(msg);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [state, auditRows, metricsPayload, opsPayload] = await Promise.all([
        adminService.getState(),
        adminService.getAudit().catch(() => []),
        adminService.getMetrics().catch(() => null),
        adminService.getOps().catch(() => null),
      ]);
      setServices((state.services || []) as typeof services);
      setAdmins((state.admins || []) as AdminRecord[]);
      setAudit(auditRows);
      setMetrics(metricsPayload);
      setOps(opsPayload);
      if (Array.isArray(state.content) && state.content.length > 0) {
        setMarketingItems(parseMarketingItems(state.content));
      }
      setTemplateOverrides(parseTemplateOverrides(state.templates));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (activeSection !== 'invites') return;
    void adminService.getInvites().then((result) => setServerInvites(result.invites || [])).catch(() => undefined);
  }, [activeSection]);

  const selectedTemplate = useMemo(() => getTemplateById(selectedTemplateId) || ADMIN_EMAIL_TEMPLATES[0], [selectedTemplateId]);
  const selectedOverride = useMemo(
    () => templateOverrides.find((row) => row.id === selectedTemplate?.id),
    [templateOverrides, selectedTemplate?.id],
  );
  const selectedLocalized = useMemo(
    () => (selectedTemplate ? mergeTemplateLocalized(selectedTemplate, selectedOverride, lang) : null),
    [selectedTemplate, selectedOverride, lang],
  );

  useEffect(() => {
    if (!selectedTemplate || !selectedLocalized) return;
    setPreviewHtml(
      buildBrandedAdminEmailPreviewHtml({
        lang,
        template: selectedTemplate,
        subjectOverride: selectedLocalized.subject,
        preheaderOverride: selectedLocalized.preheader,
        bodyOverride: selectedLocalized.body,
      }),
    );
    const built = buildBrandedAdminEmailHtml({
      lang,
      template: selectedTemplate,
      subjectOverride: selectedLocalized.subject,
      preheaderOverride: selectedLocalized.preheader,
      bodyOverride: selectedLocalized.body,
    });
    setMailSubject(built.subject);
    setMailBody(built.text.split('\n').slice(2).join('\n').trim());
  }, [selectedTemplate, selectedLocalized, lang]);

  const statCard = (label: string, value: string | number, tone: 'ok' | 'warn' | 'neutral' = 'neutral') => (
    <div className={`p-5 rounded-2xl border ${tone === 'ok' ? adminStatHealthy(mode) : tone === 'warn' ? adminStatWarn(mode) : adminCardInner(mode)}`}>
      <p className={adminLabel(mode)}>{label}</p>
      <p className={`mt-2 text-2xl font-black ${adminHeading(mode)}`}>{value}</p>
    </div>
  );

  const sectionShell = (title: string, hint: string, comment?: string, children?: React.ReactNode) => (
    <section className={`p-6 md:p-8 space-y-5 ${adminCard(mode)}`}>
      <div className="space-y-1">
        <h2 className={`text-xl md:text-2xl ${adminHeading(mode)}`}>{title}</h2>
        <p className={`text-sm ${adminMuted(mode)}`}>{hint}</p>
        {comment ? <p className={`text-xs italic ${adminMuted(mode)}`}>/* {comment} */</p> : null}
      </div>
      {children}
    </section>
  );

  const periodGrid = (joined: number, churned: number, revenue: number) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[zone.periodDay, zone.periodMonth, zone.periodYear].map((label, i) => {
        const factor = i === 0 ? 1 : i === 1 ? 4.2 : 12;
        return (
          <div key={label} className={`p-4 space-y-3 ${adminCardInner(mode)}`}>
            <p className={`text-xs font-black uppercase tracking-widest ${adminSubheading(mode)}`}>{label}</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className={adminMuted(mode)}>{zone.clientsIn}: </span><strong>{Math.round(joined * factor)}</strong></div>
              <div><span className={adminMuted(mode)}>{zone.clientsOut}: </span><strong>{churned}</strong></div>
              <div className="col-span-2"><span className={adminMuted(mode)}>{zone.revenueLabel}: </span><strong>{fmtMoney(revenue * factor)}</strong></div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const sendSiteInvite = async () => {
    const email = inviteUserEmail.trim().toLowerCase();
    if (!email.includes('@')) return feedback('Valid email required.');
    try {
      const result = await adminService.sendSiteInvite({ email });
      setInviteLog((prev) => [{ id: result.inviteLink, email, kind: 'site' as const, at: new Date().toISOString() }, ...prev].slice(0, 20));
      setInviteUserEmail('');
      feedback(result.delivered ? `Site invite sent to ${email}.` : `Invite link copied for ${email} (configure Resend for delivery).`);
      void adminService.getInvites().then((r) => setServerInvites(r.invites || [])).catch(() => undefined);
    } catch (e) {
      feedback(e instanceof Error ? e.message : 'Invite failed.');
    }
  };

  const sendAdminInvite = async () => {
    const email = inviteAdminEmail.trim().toLowerCase();
    if (!email.includes('@')) return feedback('Valid email required.');
    try {
      const result = await adminService.sendAdminInvite({ email, role: inviteAdminRole });
      setInviteLog((prev) => [{ id: result.inviteLink, email, kind: 'admin' as const, role: inviteAdminRole, at: new Date().toISOString() }, ...prev].slice(0, 20));
      setInviteAdminEmail('');
      feedback(result.delivered ? `Admin invite sent to ${email}.` : `Admin link ready for ${email}.`);
      void adminService.getInvites().then((r) => setServerInvites(r.invites || [])).catch(() => undefined);
    } catch (e) {
      feedback(e instanceof Error ? e.message : 'Admin invite failed.');
    }
  };

  const sendSingleMail = async () => {
    if (!mailTo.includes('@')) return feedback('Valid recipient required.');
    try {
      await adminService.sendMail({
        to: mailTo,
        subject: mailSubject,
        body: mailBody,
        templateId: selectedTemplateId,
      });
      feedback(`Email queued for ${mailTo}.`);
    } catch (e) {
      feedback(e instanceof Error ? e.message : 'Send failed.');
    }
  };

  if (loading && activeSection === 'overview') {
    return <div className={`py-20 text-center text-sm ${adminMuted(mode)}`}>{ws.loading}</div>;
  }

  if (activeSection === 'overview') {
    const fin = metrics?.financial;
    return sectionShell(ws.overviewTitle, ws.overviewHint, zone.commentOverview, (
      <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCard(ws.membersTotal, ops?.users.total ?? '—', 'ok')}
          {statCard(zone.periodDay, ops?.users.newToday ?? '—')}
          {statCard(ws.finMrr, fin ? fmtMoney(fin.mrr) : '—', 'ok')}
          {statCard(ws.contactsTotal, ops?.finance.contactLeads ?? '—')}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button type="button" className={adminBtnPrimary} onClick={() => void refresh()}>{ws.refreshOps}</button>
          <button type="button" className={adminBtnPrimary} onClick={() => void adminService.runTechChecks().then(() => refresh())}>{ws.runHealthProbe}</button>
          {fin?.source === 'live' ? (
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${adminStatHealthy(mode)}`}>Live billing data</span>
          ) : (
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${adminStatWarn(mode)}`}>Seeded finance fallback</span>
          )}
        </div>
        <AdminRetentionPanel lang={lang} />
      </>
    ));
  }

  if (activeSection === 'finance') {
    const fin = metrics?.financial;
    const churn = fin?.churn ?? 0;
    return sectionShell(ws.finTitle, ws.finHint, zone.commentFinance, (
      <>
        {metrics?.stripeConfigured === false ? (
          <p className={`text-sm ${adminMuted(mode)}`}>Stripe is not fully configured — finance uses estimates from billing snapshots when available.</p>
        ) : null}
        {fin?.source === 'live' ? (
          <p className={`text-xs font-bold inline-block px-3 py-1 rounded-full ${adminStatHealthy(mode)}`}>Live MRR from member billing</p>
        ) : (
          <p className={`text-xs font-bold inline-block px-3 py-1 rounded-full ${adminStatWarn(mode)}`}>Using seeded finance until billing data exists</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCard(ws.finMrr, fin ? fmtMoney(fin.mrr) : '—', 'ok')}
          {statCard(ws.finArr, fin ? fmtMoney(fin.arr) : '—')}
          {statCard(ws.finSubscribers, fin?.activeSubscribers ?? '—', 'ok')}
          {statCard(ws.finChurn, fin ? `${fin.churn}%` : '—', 'warn')}
        </div>
        {periodGrid(ops?.users.newMonth ?? 0, Math.round(churn), fin?.mrr ?? 0)}
        <AdminActionBar copy={zone} title="finance-export" text={JSON.stringify(fin, null, 2)} filename="luna-finance" onFeedback={feedback} />
      </>
    ));
  }

  if (activeSection === 'analytics') {
    return <AdminAnalyticsPanel lang={lang} onFeedback={feedback} />;
  }

  if (activeSection === 'invites') {
    const tplSite = getTemplateById('tpl-site-invite')!;
    const tplAdmin = getTemplateById('tpl-admin-invite')!;
    const sitePreview = buildBrandedAdminEmailPreviewHtml({ lang, template: tplSite });
    const adminPreview = buildBrandedAdminEmailPreviewHtml({ lang, template: tplAdmin });
    return (
      <div className="space-y-6">
        {sectionShell(zone.invitesTitle, zone.invitesHint, undefined, (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className={`p-5 space-y-4 border-2 border-luna-purple/30 ${adminCardInner(mode)}`}>
              <p className={`text-sm font-black ${adminHeading(mode)}`}>{zone.invitesUserTitle}</p>
              <p className={`text-xs ${adminMuted(mode)}`}>{zone.invitesUserHint}</p>
              <input className={`w-full ${adminInput(mode)}`} placeholder={zone.invitesEmail} value={inviteUserEmail} onChange={(e) => setInviteUserEmail(e.target.value)} />
              <button type="button" className={adminBtnPrimary} onClick={() => void sendSiteInvite()}>{zone.invitesSendUser}</button>
              <iframe title="site-invite-preview" srcDoc={sitePreview} className="w-full h-64 rounded-xl border bg-white" sandbox="allow-same-origin" />
              <AdminActionBar copy={zone} title="site-invite" html={sitePreview} onFeedback={feedback} compact />
            </div>
            <div className={`p-5 space-y-4 ${adminCardInner(mode)}`}>
              <p className={`text-sm font-black ${adminHeading(mode)}`}>{zone.invitesAdminTitle}</p>
              <p className={`text-xs ${adminMuted(mode)}`}>{zone.invitesAdminHint}</p>
              <input className={`w-full ${adminInput(mode)}`} placeholder={zone.invitesEmail} value={inviteAdminEmail} onChange={(e) => setInviteAdminEmail(e.target.value)} />
              <select className={`w-full ${adminInput(mode)}`} value={inviteAdminRole} onChange={(e) => setInviteAdminRole(e.target.value as AdminRole)}>
                {(['viewer', 'operator', 'content_manager', 'finance_manager', 'super_admin'] as AdminRole[]).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button type="button" className={adminBtnPrimary} onClick={() => void sendAdminInvite()}>{zone.invitesSendAdmin}</button>
              <iframe title="admin-invite-preview" srcDoc={adminPreview} className="w-full h-64 rounded-xl border bg-white" sandbox="allow-same-origin" />
              <AdminActionBar copy={zone} title="admin-invite" html={adminPreview} onFeedback={feedback} compact />
            </div>
          </div>
        ))}
        {inviteLog.length > 0 && sectionShell(zone.invitesHistory, '', undefined, (
          <ul className="space-y-2 text-sm">
            {inviteLog.map((row) => (
              <li key={row.id} className={`p-3 flex justify-between gap-2 ${adminCardInner(mode)}`}>
                <span>{row.email}</span>
                <span className={adminMuted(mode)}>{row.kind} · {new Date(row.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ))}
        {serverInvites.length > 0 && sectionShell('Server invite log', 'Persisted invites from admin API.', undefined, (
          <ul className="space-y-2 text-sm">
            {serverInvites.map((row) => (
              <li key={row.id} className={`p-3 flex flex-wrap justify-between gap-2 ${adminCardInner(mode)}`}>
                <span>{row.email} · {row.kind}{row.role ? ` (${row.role})` : ''}</span>
                <span className={adminMuted(mode)}>{new Date(row.createdAt).toLocaleString()} · {row.delivered ? 'delivered' : 'local'}</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    );
  }

  if (activeSection === 'templates') {
    const built = selectedTemplate && selectedLocalized
      ? buildBrandedAdminEmailHtml({
          lang,
          template: selectedTemplate,
          subjectOverride: selectedLocalized.subject,
          preheaderOverride: selectedLocalized.preheader,
          bodyOverride: selectedLocalized.body,
        })
      : null;
    return (
      <div className="space-y-6">
        {sectionShell(zone.templatesTitle, zone.templatesHint, zone.commentTemplates, (
          <p className={`text-xs ${adminMuted(mode)}`}>{zone.templatesBrandNote}</p>
        ))}
        <div className={`p-4 md:p-6 space-y-5 ${adminCard(mode)}`}>
          <AdminTemplatePicker
            lang={lang}
            selectedId={selectedTemplateId}
            onSelect={setSelectedTemplateId}
            zone={zone}
          />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <AdminTemplateEditor
              lang={lang}
              template={selectedTemplate}
              overrides={templateOverrides}
              updatedBy={session?.email || 'Admin'}
              onSave={async (next) => {
                await adminService.saveState({ templates: next });
                setTemplateOverrides(next);
              }}
              onFeedback={feedback}
            />
            <div className={`p-4 space-y-3 ${adminCardInner(mode)}`}>
              <p className={adminLabel(mode)}>{zone.previewPanel}</p>
              <iframe title="template-preview" srcDoc={previewHtml} className="w-full h-[380px] rounded-xl border bg-white" sandbox="allow-same-origin" />
              {built ? (
                <AdminActionBar copy={zone} title={built.subject} html={built.html} text={built.text} filename={selectedTemplateId} onFeedback={feedback} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSection === 'campaigns') {
    return (
      <AdminMarketingVault
        lang={lang}
        items={marketingItems}
        onItemsChange={(items) => void persistMarketing(items)}
        onFeedback={feedback}
      />
    );
  }

  if (activeSection === 'mail') {
    return sectionShell(ws.mailTitle, ws.mailHint, undefined, (
      <>
        <AdminTemplatePicker lang={lang} selectedId={selectedTemplateId} onSelect={setSelectedTemplateId} zone={zone} />
        <input className={`w-full ${adminInput(mode)}`} placeholder="to@email.com" value={mailTo} onChange={(e) => setMailTo(e.target.value)} />
        <input className={`w-full ${adminInput(mode)}`} value={mailSubject} onChange={(e) => setMailSubject(e.target.value)} />
        <textarea className={`w-full min-h-[100px] ${adminInput(mode)}`} value={mailBody} onChange={(e) => setMailBody(e.target.value)} />
        <button type="button" className={adminBtnPrimary} onClick={() => void sendSingleMail()}>{ws.mailSendOne}</button>
        <textarea className={`w-full min-h-[80px] ${adminInput(mode)}`} placeholder={ws.mailBulk} value={bulkEmails} onChange={(e) => setBulkEmails(e.target.value)} />
        <button
          type="button"
          className={adminBtnPrimary}
          onClick={() => {
            const list = bulkEmails.split(/\n/).map((e) => e.trim()).filter((e) => e.includes('@'));
            void Promise.all(list.map((to) => adminService.sendMail({ to, subject: mailSubject, body: mailBody, templateId: selectedTemplateId }))).then(() => feedback(`Bulk sent: ${list.length}`));
          }}
        >
          {ws.mailSendBulk}
        </button>
      </>
    ));
  }

  if (activeSection === 'services') {
    return (
      <div className="space-y-6">
        {sectionShell(ws.servicesTitle, ws.servicesHint, undefined, (
          <div className="grid gap-3">
            {services.map((svc) => (
              <div key={svc.id} className={`p-4 flex flex-wrap justify-between gap-2 ${adminCardInner(mode)}`}>
                <span className={adminSubheading(mode)}>{svc.name}</span>
                <span className={svc.status === 'Healthy' ? adminStatHealthy(mode) : adminStatWarn(mode)}>{svc.status} · {svc.uptime}</span>
              </div>
            ))}
          </div>
        ))}
        {sectionShell('Voice & narrative', 'ElevenLabs personas, account voices, and quick response test.', undefined, (
          <AdminVoicePanel lang={lang} onFeedback={feedback} />
        ))}
      </div>
    );
  }

  if (activeSection === 'audit') {
    return sectionShell(ws.tabAudit, ws.exportAudit, undefined, (
      <>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className={adminMuted(mode)}><th className="text-left p-2">Time</th><th className="text-left p-2">Actor</th><th className="text-left p-2">Action</th></tr></thead>
            <tbody>
              {audit.slice(0, 30).map((row) => (
                <tr key={row.id} className={`border-t ${mode === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                  <td className="p-2">{new Date(row.at).toLocaleString()}</td>
                  <td className="p-2">{row.actorEmail}</td>
                  <td className="p-2">{row.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AdminActionBar
          copy={zone}
          title="audit"
          text={audit.map((r) => `${r.at}\t${r.actorEmail}\t${r.details}`).join('\n')}
          filename="luna-audit"
          onFeedback={feedback}
        />
      </>
    ));
  }

  if (activeSection === 'settings') {
    return sectionShell(ws.settingsTitle, ws.settingsHint, undefined, (
      <div className={`p-4 space-y-2 text-sm ${adminCardInner(mode)}`}>
        <p><strong>{session?.email}</strong></p>
        <p className={adminMuted(mode)}>Role: {session?.role}</p>
        <p className={adminMuted(mode)}>{zone.language}: {lang.toUpperCase()}</p>
      </div>
    ));
  }

  if (activeSection === 'integrations') {
    return sectionShell(ws.integrationsTitle, ws.integrationsHint, undefined, (
      <AdminIntegrationsPanel lang={lang} onFeedback={feedback} />
    ));
  }

  if (activeSection === 'team') {
    return sectionShell(ws.teamTitle, ws.teamHint, undefined, (
      <AdminTeamPanel
        lang={lang}
        admins={admins}
        onAdminsChange={async (next) => {
          await adminService.saveState({ admins: next });
          setAdmins(next);
        }}
        onFeedback={feedback}
      />
    ));
  }

  if (activeSection === 'contacts') {
    return (
      <div className="space-y-6">
        {sectionShell(ws.contactsTitle, ws.contactsHint, undefined, (
          <AdminContactsPanel lang={lang} onFeedback={feedback} />
        ))}
        <AdminMemberLookup lang={lang} onFeedback={feedback} />
      </div>
    );
  }

  return null;
};
