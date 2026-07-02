import React, { useEffect, useMemo, useState } from 'react';
import { Language, getLang } from '../../constants';
import { AdminTemplateDef, getTemplateLocalized } from '../../utils/adminTemplatesCatalog';
import {
  TemplateOverride,
  getTemplateOverride,
  mergeTemplateLocalized,
  patchOverrideField,
} from '../../utils/adminTemplateMerge';
import { ADMIN_ZONE_COPY } from '../../utils/adminZoneCopy';
import { useAdminTheme } from './AdminThemeContext';
import { adminBtnPrimary, adminCardInner, adminInput, adminLabel, adminMuted, adminSubheading } from './adminStyles';

type AdminTemplateEditorProps = {
  lang: Language;
  template: AdminTemplateDef;
  overrides: TemplateOverride[];
  updatedBy: string;
  onSave: (overrides: TemplateOverride[]) => Promise<void>;
  onFeedback?: (message: string) => void;
};

export const AdminTemplateEditor: React.FC<AdminTemplateEditorProps> = ({
  lang,
  template,
  overrides,
  updatedBy,
  onSave,
  onFeedback,
}) => {
  const zone = getLang(ADMIN_ZONE_COPY, lang);
  const { mode } = useAdminTheme();
  const override = useMemo(() => getTemplateOverride(overrides, template.id), [overrides, template.id]);
  const merged = useMemo(() => mergeTemplateLocalized(template, override, lang), [template, override, lang]);
  const catalog = useMemo(() => getTemplateLocalized(template, lang), [template, lang]);

  const [subject, setSubject] = useState(merged.subject);
  const [preheader, setPreheader] = useState(merged.preheader);
  const [body, setBody] = useState(merged.body);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSubject(merged.subject);
    setPreheader(merged.preheader);
    setBody(merged.body);
  }, [merged.subject, merged.preheader, merged.body, template.id, lang]);

  const dirty =
    subject !== merged.subject ||
    preheader !== merged.preheader ||
    body !== merged.body;

  const resetToCatalog = () => {
    setSubject(catalog.subject);
    setPreheader(catalog.preheader);
    setBody(catalog.body);
  };

  const save = async () => {
    setBusy(true);
    try {
      const next = patchOverrideField(override, template.id, lang, { subject, preheader, body }, { updatedBy });
      const without = overrides.filter((row) => row.id !== template.id);
      await onSave([next, ...without]);
      onFeedback?.(`Template saved for ${lang.toUpperCase()}.`);
    } catch (e) {
      onFeedback?.(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`p-5 space-y-4 ${adminCardInner(mode)}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={`text-sm font-black ${adminSubheading(mode)}`}>Edit copy · {lang.toUpperCase()}</p>
        {override?.updatedAt ? (
          <p className={`text-xs ${adminMuted(mode)}`}>Updated {override.updatedAt}{override.updatedBy ? ` · ${override.updatedBy}` : ''}</p>
        ) : null}
      </div>
      <div>
        <p className={adminLabel(mode)}>{zone.templatesTrigger}</p>
        <p className={`text-sm ${adminMuted(mode)}`}>{merged.trigger}</p>
      </div>
      <div>
        <p className={adminLabel(mode)}>Subject</p>
        <input className={`w-full ${adminInput(mode)}`} value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div>
        <p className={adminLabel(mode)}>Preheader</p>
        <input className={`w-full ${adminInput(mode)}`} value={preheader} onChange={(e) => setPreheader(e.target.value)} />
      </div>
      <div>
        <p className={adminLabel(mode)}>Body</p>
        <textarea className={`w-full min-h-[140px] ${adminInput(mode)}`} value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={adminBtnPrimary} disabled={busy || !dirty} onClick={() => void save()}>
          {busy ? 'Saving…' : 'Save override'}
        </button>
        <button type="button" className={adminBtnPrimary} onClick={resetToCatalog}>Reset to catalog</button>
      </div>
    </div>
  );
};
