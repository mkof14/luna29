import React, { useMemo, useState } from 'react';
import { Language, getLang } from '../../constants';
import { adminService, CampaignQueueItem } from '../../services/adminService';
import { ADMIN_WORKSPACE_COPY } from '../../utils/adminWorkspaceI18n';
import { ADMIN_ZONE_COPY, AdminZoneCopy } from '../../utils/adminZoneCopy';
import { getTemplateById, getTemplateLocalized } from '../../utils/adminTemplatesCatalog';
import { buildBrandedAdminEmailHtml, buildBrandedAdminEmailPreviewHtml } from '../../utils/adminEmailBranding';
import { downloadTextFile } from '../../utils/adminDocumentActions';
import { versionedStaticAsset } from '../../utils/staticAssetUrl';
import { AdminActionBar } from './AdminActionBar';
import { AdminHeroPicker, AdminTemplatePicker } from './AdminTemplatePicker';
import { useAdminTheme } from './AdminThemeContext';
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminCard,
  adminCardInner,
  adminHeading,
  adminInput,
  adminLabel,
  adminMuted,
} from './adminStyles';

export type MarketingItem = {
  id: string;
  name: string;
  channel: string;
  subject: string;
  body: string;
  hero: string;
  templateId: string;
  updatedAt: string;
};

type AdminMarketingVaultProps = {
  lang: Language;
  items: MarketingItem[];
  onItemsChange: (items: MarketingItem[]) => void;
  onFeedback?: (message: string) => void;
};

const normalizeItem = (raw: Partial<MarketingItem>, index: number): MarketingItem => ({
  id: raw.id || `mkt-${index}`,
  name: String(raw.name || 'Campaign'),
  channel: String(raw.channel || 'Email'),
  subject: String(raw.subject || raw.name || 'Luna29'),
  body: String(raw.body || ''),
  hero: String(raw.hero || 'library.webp'),
  templateId: String(raw.templateId || 'tpl-newsletter'),
  updatedAt: String(raw.updatedAt || new Date().toISOString().slice(0, 10)),
});

export const parseMarketingItems = (value: unknown): MarketingItem[] => {
  if (!Array.isArray(value)) return [];
  return value.map((row, i) => normalizeItem(row as Partial<MarketingItem>, i)).slice(0, 40);
};

/** Marketing vault — save materials, pick template/hero, preview branded email, full document actions. */
export const AdminMarketingVault: React.FC<AdminMarketingVaultProps> = ({
  lang,
  items,
  onItemsChange,
  onFeedback,
}) => {
  const { mode } = useAdminTheme();
  const ws = getLang(ADMIN_WORKSPACE_COPY, lang);
  const zone = getLang(ADMIN_ZONE_COPY, lang);

  const [name, setName] = useState('');
  const [channel, setChannel] = useState('Email');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [hero, setHero] = useState('library.webp');
  const [templateId, setTemplateId] = useState('tpl-newsletter');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sendEmail, setSendEmail] = useState('');
  const [queue, setQueue] = useState<CampaignQueueItem[]>([]);
  const [scheduleAt, setScheduleAt] = useState('');
  const [scheduleRecipients, setScheduleRecipients] = useState('');

  const loadQueue = async () => {
    try {
      const result = await adminService.getCampaignQueue();
      setQueue(result.queue || []);
    } catch {
      setQueue([]);
    }
  };

  React.useEffect(() => {
    void loadQueue();
  }, []);

  const notify = (msg: string) => onFeedback?.(msg);

  const scheduleDraft = async () => {
    const recipients = scheduleRecipients.split(/[\n,;]+/).map((row) => row.trim()).filter(Boolean);
    if (!subject.trim() || !body.trim() || recipients.length === 0) {
      notify(zone.marketingScheduleNeedFields);
      return;
    }
    try {
      const tpl = getTemplateById(templateId) || getTemplateById('tpl-newsletter')!;
      const loc = getTemplateLocalized({ ...tpl, hero: hero.replace(/^.*\//, '') }, lang);
      await adminService.scheduleCampaign({
        name: name.trim() || subject.trim(),
        subject: subject.trim(),
        preheader: loc.preheader,
        body: body.trim(),
        templateId,
        hero,
        ctaLabel: loc.ctaLabel,
        recipients,
        sendAt: scheduleAt || undefined,
      });
      notify(zone.marketingCampaignScheduled);
      setScheduleRecipients('');
      await loadQueue();
    } catch (e) {
      notify(e instanceof Error ? e.message : zone.marketingScheduleFailed);
    }
  };

  const processDue = async () => {
    try {
      const result = await adminService.processDueCampaigns();
      setQueue(result.queue || []);
      notify(zone.marketingProcessResult
        .replace('{processed}', String(result.processed))
        .replace('{sent}', String(result.sent))
        .replace('{failed}', String(result.failed)));
    } catch (e) {
      notify(e instanceof Error ? e.message : zone.marketingProcessFailed);
    }
  };

  const persist = async (next: MarketingItem[]) => {
    onItemsChange(next);
    await adminService.saveState({ content: next }).catch(() => undefined);
  };

  const buildItemEmail = (item: MarketingItem) => {
    const tpl = getTemplateById(item.templateId) || getTemplateById('tpl-newsletter')!;
    const customTpl = { ...tpl, hero: item.hero.replace(/^.*\//, '') };
    return buildBrandedAdminEmailHtml({
      lang,
      template: customTpl,
      subjectOverride: item.subject,
      bodyOverride: item.body,
    });
  };

  const buildItemPreview = (item: MarketingItem) => {
    const tpl = getTemplateById(item.templateId) || getTemplateById('tpl-newsletter')!;
    const customTpl = { ...tpl, hero: item.hero.replace(/^.*\//, '') };
    return buildBrandedAdminEmailPreviewHtml({
      lang,
      template: customTpl,
      subjectOverride: item.subject,
      bodyOverride: item.body,
    });
  };

  const draftPreview = useMemo(() => {
    const tpl = getTemplateById(templateId) || getTemplateById('tpl-newsletter')!;
    return buildBrandedAdminEmailPreviewHtml({
      lang,
      template: { ...tpl, hero },
      subjectOverride: subject || name || tpl.subject.en,
      bodyOverride: body,
    });
  }, [lang, templateId, hero, subject, name, body]);

  const saveDraft = async () => {
    if (!name.trim()) return notify(zone.marketingNameRequired);
    const item: MarketingItem = {
      id: `mkt-${Date.now()}`,
      name: name.trim(),
      channel: channel.trim() || 'Email',
      subject: subject.trim() || name.trim(),
      body: body.trim(),
      hero,
      templateId,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    const next = [item, ...items].slice(0, 40);
    await persist(next);
    setName('');
    setSubject('');
    setBody('');
    notify(zone.marketingSaved);
  };

  const removeItem = async (id: string) => {
    const next = items.filter((i) => i.id !== id);
    await persist(next);
    if (expandedId === id) setExpandedId(null);
    notify(zone.marketingDeleted);
  };

  const duplicateItem = async (item: MarketingItem) => {
    const copy: MarketingItem = {
      ...item,
      id: `mkt-${Date.now()}`,
      name: `${item.name} (copy)`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    await persist([copy, ...items].slice(0, 40));
    notify(zone.marketingDuplicated);
  };

  const sendItemMail = async (item: MarketingItem) => {
    const to = sendEmail.trim().toLowerCase();
    if (!to.includes('@')) return notify(zone.marketingSendNeedEmail);
    const built = buildItemEmail(item);
    const tpl = getTemplateById(item.templateId) || getTemplateById('tpl-newsletter')!;
    const loc = getTemplateLocalized({ ...tpl, hero: item.hero.replace(/^.*\//, '') }, lang);
    try {
      const result = await adminService.sendMail({
        to,
        subject: built.subject,
        preheader: built.preheader,
        body: item.body,
        ctaLabel: loc.ctaLabel,
        templateId: item.templateId,
        hero: item.hero,
      });
      notify(result.delivered
        ? zone.mailSendDelivered.replace('{email}', to)
        : zone.mailSendNotDelivered);
    } catch (e) {
      notify(e instanceof Error ? e.message : zone.mailSendFailed);
    }
  };

  const exportAll = () => {
    downloadTextFile('luna-marketing-vault.json', JSON.stringify(items, null, 2), 'application/json');
    notify(zone.marketingExported);
  };

  return (
    <div className="space-y-6">
      <section className={`p-6 md:p-8 space-y-5 ${adminCard(mode)}`}>
        <div>
          <h2 className={`text-xl md:text-2xl ${adminHeading(mode)}`}>{zone.marketingTitle}</h2>
          <p className={`text-sm mt-1 ${adminMuted(mode)}`}>{zone.marketingHint}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input className={`w-full ${adminInput(mode)}`} placeholder={zone.marketingName} value={name} onChange={(e) => setName(e.target.value)} />
            <input className={`w-full ${adminInput(mode)}`} placeholder={zone.marketingSubject} value={subject} onChange={(e) => setSubject(e.target.value)} />
            <input className={`w-full ${adminInput(mode)}`} placeholder={zone.marketingChannel} value={channel} onChange={(e) => setChannel(e.target.value)} />
            <AdminTemplatePicker lang={lang} selectedId={templateId} onSelect={setTemplateId} zone={zone} label={zone.marketingSelectTemplate} />
            <AdminHeroPicker lang={lang} value={hero} onChange={setHero} />
            <textarea
              className={`w-full min-h-[120px] ${adminInput(mode)}`}
              placeholder={zone.marketingBody}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <button type="button" className={adminBtnPrimary} onClick={() => void saveDraft()}>{zone.marketingAdd}</button>
          </div>

          <div className={`p-4 space-y-3 ${adminCardInner(mode)}`}>
            <p className={adminLabel(mode)}>{zone.marketingDraftPreview}</p>
            <iframe title="marketing-draft" srcDoc={draftPreview} className="w-full h-[360px] rounded-xl border bg-white" sandbox="allow-same-origin" />
            <AdminActionBar
              copy={zone}
              title={subject || name || 'draft'}
              html={draftPreview}
              text={body}
              filename="marketing-draft"
              onFeedback={notify}
              compact
            />
          </div>
        </div>
      </section>

      <section className={`p-6 md:p-8 space-y-4 ${adminCard(mode)}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={`text-lg font-black ${adminHeading(mode)}`}>{zone.marketingStored}</p>
            <p className={`text-xs ${adminMuted(mode)}`}>{items.length} {zone.marketingItemsLabel}</p>
          </div>
          <button type="button" className={adminBtnSecondary(mode)} onClick={exportAll} disabled={items.length === 0}>
            {zone.marketingExportAll}
          </button>
        </div>

        {items.length === 0 ? (
          <p className={`text-sm py-8 text-center ${adminMuted(mode)}`}>{zone.marketingEmpty}</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const built = buildItemEmail(item);
              const preview = buildItemPreview(item);
              const open = expandedId === item.id;
              return (
                <article key={item.id} className={`overflow-hidden ${adminCardInner(mode)}`}>
                  <div className="p-4 flex flex-wrap gap-4">
                    <img
                      src={versionedStaticAsset(`/images/heroes/r2/${item.hero}`)}
                      alt=""
                      className="w-20 h-14 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-[200px]">
                      <p className={`font-bold ${adminHeading(mode)}`}>{item.name}</p>
                      <p className={`text-xs ${adminMuted(mode)}`}>{item.channel} · {item.updatedAt}</p>
                      <p className={`text-sm mt-1 line-clamp-2`}>{item.body || item.subject}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-start">
                      <button type="button" className={adminBtnSecondary(mode)} onClick={() => setExpandedId(open ? null : item.id)}>
                        {open ? zone.actionsClose : zone.actionsPreview}
                      </button>
                      <button type="button" className={adminBtnSecondary(mode)} onClick={() => void duplicateItem(item)}>{zone.marketingDuplicate}</button>
                      <button type="button" className={adminBtnSecondary(mode)} onClick={() => void removeItem(item.id)}>{zone.marketingDelete}</button>
                    </div>
                  </div>

                  {open && (
                    <div className={`px-4 pb-4 space-y-3 border-t ${mode === 'dark' ? 'border-white/10' : 'border-slate-200'}`}>
                      <iframe title={`mkt-${item.id}`} srcDoc={preview} className="w-full h-[320px] rounded-xl border bg-white" sandbox="allow-same-origin" />
                      <AdminActionBar
                        copy={zone}
                        title={item.name}
                        html={built.html}
                        text={built.text}
                        filename={item.id}
                        onFeedback={notify}
                      />
                      <div className="flex flex-wrap gap-2 items-center">
                        <input
                          className={`flex-1 min-w-[200px] ${adminInput(mode)}`}
                          placeholder={zone.invitesEmail}
                          value={sendEmail}
                          onChange={(e) => setSendEmail(e.target.value)}
                        />
                        <button type="button" className={adminBtnPrimary} onClick={() => void sendItemMail(item)}>
                          {zone.marketingSend}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className={`p-6 md:p-8 space-y-4 ${adminCard(mode)}`}>
        <p className={`text-lg font-black ${adminHeading(mode)}`}>Campaign scheduler</p>
        <p className={`text-xs ${adminMuted(mode)}`}>Queue sends on server — run “Process due” when send time passes.</p>
        <input className={`w-full ${adminInput(mode)}`} type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
        <textarea className={`w-full min-h-[80px] ${adminInput(mode)}`} placeholder="Recipients (one email per line)" value={scheduleRecipients} onChange={(e) => setScheduleRecipients(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className={adminBtnPrimary} onClick={() => void scheduleDraft()}>Schedule draft</button>
          <button type="button" className={adminBtnSecondary(mode)} onClick={() => void processDue()}>Process due</button>
        </div>
        {queue.length > 0 && (
          <ul className={`text-sm space-y-2 ${adminMuted(mode)}`}>
            {queue.slice(0, 12).map((row) => (
              <li key={row.id} className={`p-3 ${adminCardInner(mode)}`}>
                <strong>{row.name}</strong> · {row.status} · {row.recipients.length} recipients · {new Date(row.sendAt).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
