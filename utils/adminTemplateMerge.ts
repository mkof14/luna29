import { Language } from '../constants';
import { AdminTemplateDef, getTemplateLocalized } from './adminTemplatesCatalog';

export type TemplateFieldMap = Partial<Record<Language, string>>;

export type TemplateOverride = {
  id: string;
  subject?: TemplateFieldMap;
  preheader?: TemplateFieldMap;
  body?: TemplateFieldMap;
  ctaLabel?: TemplateFieldMap;
  updatedAt?: string;
  updatedBy?: string;
};

const pickField = (map: TemplateFieldMap | undefined, lang: Language, fallback: string) =>
  map?.[lang]?.trim() || map?.en?.trim() || fallback;

export const parseTemplateOverrides = (raw: unknown): TemplateOverride[] => {
  if (!Array.isArray(raw)) return [];
  const rows: TemplateOverride[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const id = String(row.id || '').trim();
    if (!id) continue;
    const readMap = (key: string): TemplateFieldMap | undefined => {
      const value = row[key];
      if (!value || typeof value !== 'object') return undefined;
      return value as TemplateFieldMap;
    };
    rows.push({
      id,
      subject: readMap('subject'),
      preheader: readMap('preheader'),
      body: readMap('body'),
      ctaLabel: readMap('ctaLabel'),
      updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : undefined,
      updatedBy: typeof row.updatedBy === 'string' ? row.updatedBy : undefined,
    });
  }
  return rows;
};

export const getTemplateOverride = (overrides: TemplateOverride[], id: string) =>
  overrides.find((row) => row.id === id);

export const mergeTemplateLocalized = (
  template: AdminTemplateDef,
  override: TemplateOverride | undefined,
  lang: Language,
) => {
  const base = getTemplateLocalized(template, lang);
  if (!override) return base;
  return {
    trigger: base.trigger,
    subject: pickField(override.subject, lang, base.subject),
    preheader: pickField(override.preheader, lang, base.preheader),
    body: pickField(override.body, lang, base.body),
    ctaLabel: pickField(override.ctaLabel, lang, base.ctaLabel),
  };
};

export const upsertTemplateOverride = (
  overrides: TemplateOverride[],
  next: TemplateOverride,
): TemplateOverride[] => {
  const index = overrides.findIndex((row) => row.id === next.id);
  if (index === -1) return [next, ...overrides];
  const copy = [...overrides];
  copy[index] = { ...copy[index], ...next };
  return copy;
};

export const patchOverrideField = (
  override: TemplateOverride | undefined,
  id: string,
  lang: Language,
  fields: { subject?: string; preheader?: string; body?: string; ctaLabel?: string },
  meta: { updatedBy: string },
): TemplateOverride => {
  const base: TemplateOverride = override ? { ...override } : { id };
  const patchMap = (map: TemplateFieldMap | undefined, value: string | undefined) => {
    if (typeof value === 'undefined') return map;
    return { ...(map || {}), [lang]: value };
  };
  return {
    ...base,
    id,
    subject: patchMap(base.subject, fields.subject),
    preheader: patchMap(base.preheader, fields.preheader),
    body: patchMap(base.body, fields.body),
    ctaLabel: patchMap(base.ctaLabel, fields.ctaLabel),
    updatedAt: new Date().toISOString().slice(0, 10),
    updatedBy: meta.updatedBy,
  };
};
