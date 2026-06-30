import { Language, LangCopy, getLang } from '../../constants';
import {
  LegalDocType,
  LegalDocContent,
  LegalDocSection,
  LegalDocMeta,
  LEGAL_DOC_META,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_EFFECTIVE_DATE_BY_LANG,
} from './types';
import { LEGAL_PRIVACY } from './privacy';
import { LEGAL_TERMS } from './terms';
import { LEGAL_MEDICAL } from './medical';
import { LEGAL_COOKIES } from './cookies';
import { LEGAL_DATA_RIGHTS } from './dataRights';
import { LEGAL_HUB } from './legalHub';
import { LEGAL_CONTACT_SECTION } from './contactSection';
import { LEGAL_UI, LegalUiCopy } from './ui';
import { LEGAL_HUB_LABEL, LEGAL_NAV_LABELS, LegalNavDocType } from './labels';

const BY_DOC: Record<Exclude<LegalDocType, 'legal'>, LangCopy<LegalDocContent>> = {
  privacy: LEGAL_PRIVACY,
  terms: LEGAL_TERMS,
  medical: LEGAL_MEDICAL,
  cookies: LEGAL_COOKIES,
  data_rights: LEGAL_DATA_RIGHTS,
};

export function getLegalHub(lang: Language): LegalDocContent {
  return getLang(LEGAL_HUB, lang);
}

export function getLegalDoc(lang: Language, doc: LegalDocType): LegalDocContent {
  if (doc === 'legal') return getLegalHub(lang);
  const base = getLang(BY_DOC[doc], lang);
  const contact = getLang(LEGAL_CONTACT_SECTION, lang);
  return { ...base, sections: [...base.sections, contact] };
}

export function getLegalNavLabels(lang: Language): Record<LegalNavDocType, string> {
  return getLang(LEGAL_NAV_LABELS, lang);
}

export function getLegalHubLabel(lang: Language): string {
  return getLang(LEGAL_HUB_LABEL, lang);
}

export function getLegalUi(lang: Language): LegalUiCopy {
  return getLang(LEGAL_UI, lang);
}

export function getLegalEffectiveDate(lang: Language): string {
  return LEGAL_EFFECTIVE_DATE_BY_LANG[lang] ?? LEGAL_EFFECTIVE_DATE;
}

export type {
  LegalDocType,
  LegalDocContent,
  LegalDocSection,
  LegalDocMeta,
  LegalUiCopy,
  LangCopy,
};

export {
  LEGAL_DOC_META,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_EFFECTIVE_DATE_BY_LANG,
  LEGAL_PRIVACY,
  LEGAL_TERMS,
  LEGAL_MEDICAL,
  LEGAL_COOKIES,
  LEGAL_DATA_RIGHTS,
  LEGAL_HUB,
  LEGAL_UI,
  LEGAL_NAV_LABELS,
  LEGAL_HUB_LABEL,
};

export {
  LEGAL_ENTITY_NAME,
  LEGAL_PRODUCT_NAME,
  LEGAL_WEBSITE,
  LEGAL_PRIVACY_EMAIL,
  LEGAL_SUPPORT_EMAIL,
} from './entity';

export type { LegalNavDocType } from './labels';
