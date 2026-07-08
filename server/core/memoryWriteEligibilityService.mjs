/**
 * Task 7 — Deterministic memory-write eligibility gate for Luna Live.
 *
 * No Gemini / LLM / embeddings / vectors. Decides SAVE vs NO-SAVE only.
 * Does not extract signals and does not log matched raw text fragments.
 */

export const MEMORY_GATE_VERSION = 'memory_gate_v1';
export const MEMORY_GATE_MAX_TEXT_CHARS = 2000;

/** Domains aligned with Task 3 taxonomy (not a medical ontology). */
export const MEMORY_GATE_DOMAINS = {
  sleep: [
    'sleep', 'slept', 'sleeping', 'insomnia', 'waking', 'awake', 'restless', 'sleepless',
    'nightmare', 'сон', 'спала', 'спал', 'бессон', 'проснул', 'прокинул',
  ],
  energy: [
    'tired', 'exhausted', 'drained', 'fatigue', 'fatigued', 'low energy', 'energy',
    'устал', 'устала', 'утомил', 'изможд', 'нет сил',
  ],
  mood: [
    'mood', 'irritable', 'irritability', 'anxious', 'anxiety', 'sad', 'sadness',
    'emotional', 'angry', 'depressed', 'настроен', 'раздраж', 'тревог', 'грустн',
  ],
  cycle: [
    'period', 'menstrual', 'menses', 'cycle', 'bleeding', 'cramps', 'pms',
    'менстру', 'месячн', 'цикл', 'кров',
  ],
  symptom: [
    'symptom', 'pain', 'headache', 'migraine', 'nausea', 'cramp', 'ache',
    'боль', 'головн', 'тошнот', 'мигрен',
  ],
  body_sensation: [
    'sensation', 'heaviness', 'soreness', 'restlessness', 'tight', 'chest feels',
    'ощущен', 'тяжест', 'скован',
  ],
  stress: [
    'stress', 'stressed', 'overwhelmed', 'overwhelm', 'tense', 'tension', 'стресс',
  ],
  medication_context: [
    'medication', 'medicine', 'dose', 'pill', 'prescription', 'лекарств', 'таблет',
  ],
};

const FIRST_PERSON = [
  // English
  /\bi['']?m\b/i,
  /\bi\s+am\b/i,
  /\bam\s+i\b/i,
  /\bi\b/i,
  /\bi\s+feel\b/i,
  /\bi\s+felt\b/i,
  /\bi\s+have\b/i,
  /\bi\s+had\b/i,
  /\bi\s+slept\b/i,
  /\bi\s+woke\b/i,
  /\bi\s+wake\b/i,
  /\bi\s+waking\b/i,
  /\bi\s+took\b/i,
  /\bi\s+take\b/i,
  /\bi\s+started\b/i,
  /\bi\s+start\b/i,
  /\bi\s+ve\s+been\b/i,
  /\bi['']?ve\s+been\b/i,
  /\bmy\s+(sleep|energy|mood|period|cramps?|head|body|chest|medication|medicine)\b/i,
  /\bi\s+was\b/i,
  /\bi\s+got\b/i,
  // Russian
  /\bя\b/i,
  /\bмне\b/i,
  /\bу\s+меня\b/i,
  /\bя\s+чувству/i,
  /\bя\s+спал/i,
  /\bя\s+проснул/i,
  /\bмой\s+сон\b/i,
  /\bмоя\s+энерг/i,
  /\bмое\s+настроен/i,
  /\bмои\s+месячн/i,
  // Ukrainian
  /\bмені\b/i,
  /\bу\s+мене\b/i,
  /\bя\s+відчува/i,
  /\bя\s+прокинул/i,
  /\bмій\s+сон\b/i,
  /\bмоя\s+енерг/i,
  /\bмій\s+настрій\b/i,
];

const THIRD_PERSON = [
  /\bmy\s+(husband|wife|partner|daughter|son|friend|mom|mother|dad|father|sister|brother|child|kids?|baby)\b/i,
  /\b(he|she)\s+(is|was|feels?|felt|has|had|slept|cannot|can't)\b/i,
  /\b(его|её|ее|її)\s+/i,
  /\b(муж|жена|дочь|дочка|сын|друг|подруга|мама|папа)\b/i,
];

const GREETING = [
  /^(hi|hello|hey|yo|sup)[\s!.?]*$/i,
  /^good\s+(morning|afternoon|evening|night)[\s!.?]*$/i,
  /^(привет|здравствуй|здравствуйте|доброе\s+утро|добрый\s+день|добрый\s+вечер)[\s!.?]*$/i,
  /^(вітаю|доброго\s+ранку)[\s!.?]*$/i,
];

const THANKS = [
  /^(thanks|thank\s+you|thx|ty)[\s!.?]*$/i,
  /^(спасибо|дякую)[\s!.?]*$/i,
];

const FAREWELL = [
  /^(bye|goodbye|good\s+night|see\s+you|later)[\s!.?]*$/i,
  /^(пока|до\s+свидания|надобраніч)[\s!.?]*$/i,
];

const PRODUCT_UI = [
  /\bhow\s+do\s+i\s+use\b/i,
  /\bwhere\s+is\s+(the\s+)?settings?\b/i,
  /\bmicrophone\s+(is\s+)?(not\s+)?work/i,
  /\bapp\s+is\s+broken\b/i,
  /\bкак\s+включить\s+микрофон\b/i,
  /\bнастройки\b/i,
  /\bмикрофон\b/i,
];

const ACCOUNT_BILLING = [
  /\bsubscription\b/i,
  /\bcancel\s+(my\s+)?plan\b/i,
  /\bpayment\b/i,
  /\bbilling\b/i,
  /\binvoice\b/i,
  /\brefund\b/i,
  /\bподписк/i,
  /\bоплат/i,
];

const META_LUNA = [
  /\bwho\s+are\s+you\b/i,
  /\bwhat\s+can\s+you\s+do\b/i,
  /\bare\s+you\s+a\s+doctor\b/i,
  /\bwhat\s+is\s+luna\b/i,
  /\bты\s+врач\b/i,
  /\bкто\s+ты\b/i,
];

const GENERIC_INFO = [
  /\bwhat\s+causes\b/i,
  /\btell\s+me\s+about\b/i,
  /\bwhat\s+is\s+(pms|insomnia|fatigue|perimenopause)\b/i,
  /\bwhy\s+does\s+\w+\s+happen\b/i,
  /\bчто\s+вызывает\b/i,
  /\bрасскажи\s+про\b/i,
  /\bрасскажи\s+о\b/i,
];

const PURE_COMMAND = [
  /^(play|open|remind|set|start|stop|mute|unmute)\b/i,
  /\bplay\s+music\b/i,
  /\bremind\s+me\b/i,
  /\bopen\s+settings\b/i,
];

const ASSISTANT_REF = [
  /^(you\s+said|why\s+did\s+you|repeat\s+that|say\s+that\s+again)\b/i,
  /\bты\s+сказал/i,
  /\bповтори\b/i,
];

const safeText = (value, max = MEMORY_GATE_MAX_TEXT_CHARS) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>]/g, '').trim().slice(0, max);
};

const matchesAny = (text, patterns) => patterns.some((re) => re.test(text));

const findDomains = (lower) => {
  const domains = [];
  const terms = [];
  for (const [domain, aliases] of Object.entries(MEMORY_GATE_DOMAINS)) {
    for (const alias of aliases) {
      const a = alias.toLowerCase();
      if (a.includes(' ')) {
        if (lower.includes(a)) {
          domains.push(domain);
          terms.push(domain);
          break;
        }
      } else {
        // Word-ish match: avoid matching inside unrelated tokens when possible.
        const re = new RegExp(`(?:^|[^\\p{L}\\p{N}_])${a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|[^\\p{L}\\p{N}_])`, 'iu');
        if (re.test(lower) || lower.includes(a)) {
          domains.push(domain);
          terms.push(domain);
          break;
        }
      }
    }
  }
  return { domains: [...new Set(domains)], terms: [...new Set(terms)] };
};

const hasFirstPerson = (text) => FIRST_PERSON.some((re) => re.test(text));

const isGenericDomainQuestion = (text, domains) => {
  if (!domains.length) return false;
  // "Tell me about sleep" / "What causes fatigue" without first-person self-report.
  if (matchesAny(text, GENERIC_INFO)) return true;
  if (/^\s*(what|how|why|when|where|tell)\b/i.test(text) && !hasFirstPerson(text)) return true;
  return false;
};

/**
 * Deterministic eligibility decision for Luna Live memory write.
 * Never returns matched raw text fragments.
 */
export const evaluateMemoryWriteEligibility = ({
  text,
  mode,
  source_surface: sourceSurface,
  language,
} = {}) => {
  const gate_version = MEMORY_GATE_VERSION;
  const raw = safeText(text, MEMORY_GATE_MAX_TEXT_CHARS);
  const lower = raw.toLowerCase();

  if (!raw) {
    return { eligible: false, reason: 'empty_text', matched_domains: [], matched_terms: [], gate_version };
  }

  const surface = String(sourceSurface || '').toLowerCase();
  const modeNorm = String(mode || '').toLowerCase();
  if (modeNorm === 'teaser' || surface === 'teaser' || surface === 'public_teaser') {
    return { eligible: false, reason: 'teaser_mode', matched_domains: [], matched_terms: [], gate_version };
  }
  if (surface && surface !== 'luna_live' && surface !== 'live' && surface !== '') {
    // Only Luna Live write path uses this gate; other surfaces have their own writers.
    if (surface === 'voice_reflection' || surface === 'audio_reflection') {
      return { eligible: false, reason: 'wrong_surface', matched_domains: [], matched_terms: [], gate_version };
    }
  }

  if (matchesAny(raw, GREETING)) {
    return { eligible: false, reason: 'greeting', matched_domains: [], matched_terms: [], gate_version };
  }
  if (matchesAny(raw, THANKS)) {
    return { eligible: false, reason: 'thanks', matched_domains: [], matched_terms: [], gate_version };
  }
  if (matchesAny(raw, FAREWELL)) {
    return { eligible: false, reason: 'farewell', matched_domains: [], matched_terms: [], gate_version };
  }
  if (matchesAny(raw, PRODUCT_UI)) {
    return { eligible: false, reason: 'product_ui', matched_domains: [], matched_terms: [], gate_version };
  }
  if (matchesAny(raw, ACCOUNT_BILLING)) {
    return { eligible: false, reason: 'account_billing', matched_domains: [], matched_terms: [], gate_version };
  }
  if (matchesAny(raw, META_LUNA)) {
    return { eligible: false, reason: 'meta_luna', matched_domains: [], matched_terms: [], gate_version };
  }
  if (matchesAny(raw, PURE_COMMAND) && !hasFirstPerson(raw)) {
    return { eligible: false, reason: 'pure_command', matched_domains: [], matched_terms: [], gate_version };
  }
  if (matchesAny(raw, ASSISTANT_REF) && !hasFirstPerson(raw)) {
    return { eligible: false, reason: 'assistant_reference', matched_domains: [], matched_terms: [], gate_version };
  }
  if (matchesAny(raw, THIRD_PERSON) && !hasFirstPerson(raw)) {
    return { eligible: false, reason: 'third_person', matched_domains: [], matched_terms: [], gate_version };
  }
  // Prefer third-person exclusion when clearly about another person even with "my".
  if (/\bmy\s+(husband|wife|partner|daughter|son|friend|mom|mother|dad|father|sister|brother|child|kids?|baby)\b/i.test(raw)) {
    return { eligible: false, reason: 'third_person', matched_domains: [], matched_terms: [], gate_version };
  }

  const { domains, terms } = findDomains(lower);
  if (!domains.length) {
    return { eligible: false, reason: 'no_domain_match', matched_domains: [], matched_terms: [], gate_version };
  }

  // First-person self-report with domain wins over generic-info heuristics
  // (e.g. "Why am I so exhausted today?" is eligible; "Why does fatigue happen?" is not).
  if (hasFirstPerson(raw)) {
    void language;
    return {
      eligible: true,
      reason: 'first_person_self_report',
      matched_domains: domains,
      matched_terms: terms,
      gate_version,
    };
  }

  if (isGenericDomainQuestion(raw, domains)) {
    return { eligible: false, reason: 'generic_information', matched_domains: domains, matched_terms: terms, gate_version };
  }

  return { eligible: false, reason: 'not_first_person', matched_domains: domains, matched_terms: terms, gate_version };
};

/**
 * Validate opaque client_message_id for idempotency only (not ownership).
 * Accepts UUID and short opaque hex/base64url-like tokens.
 */
export const validateClientMessageId = (value) => {
  if (value == null || value === '') {
    return { ok: false, reason: 'missing_id' };
  }
  if (typeof value !== 'string') {
    return { ok: false, reason: 'invalid_id' };
  }
  const id = value.trim();
  if (id.length < 8 || id.length > 80) {
    return { ok: false, reason: 'invalid_id' };
  }
  // Opaque: UUID or [A-Za-z0-9_-]+
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    return { ok: false, reason: 'invalid_id' };
  }
  // Reject obvious identity leakage patterns.
  if (/@|user:|email|password/i.test(id)) {
    return { ok: false, reason: 'invalid_id' };
  }
  return { ok: true, id };
};

export const buildLunaLiveObservationClientEventId = (clientMessageId) =>
  `luna_live:${clientMessageId}`;
