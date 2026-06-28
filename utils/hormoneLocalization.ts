import { Language, LangCopy, getLang } from '../constants';
import { HormoneData } from '../types';

const nameMap: LangCopy< Record<string, string>> = {
  en: {},
  ru: {},
  uk: {
    estrogen: 'Естроген',
    progesterone: 'Прогестерон',
    prolactin: 'Пролактин',
    thyroid: 'Щитоподібна залоза (TSH)',
    insulin: 'Інсулін',
    leptin: 'Лептин',
    cortisol: 'Кортизол',
    testosterone: 'Тестостерон',
    ferritin: 'Феритин',
    vitamind: 'Вітамін D',
    vitaminb12: 'Вітамін B12',
    magnesium: 'Магній',
    zinc: 'Цинк',
    omega3: 'Омега-3',
    oxytocin: 'Окситоцин',
    serotonin: 'Серотонін',
    dopamine: 'Дофамін',
    gaba: 'ГАМК',
    melatonin: 'Мелатонін'
  },
  es: {
    estrogen: 'Estrógeno',
    progesterone: 'Progesterona',
    prolactin: 'Prolactina',
    thyroid: 'Tiroides (TSH)',
    insulin: 'Insulina',
    leptin: 'Leptina',
    cortisol: 'Cortisol',
    testosterone: 'Testosterona',
    ferritin: 'Ferritina',
    vitamind: 'Vitamina D',
    vitaminb12: 'Vitamina B12',
    magnesium: 'Magnesio',
    zinc: 'Zinc',
    omega3: 'Omega-3',
    oxytocin: 'Oxitocina',
    serotonin: 'Serotonina',
    dopamine: 'Dopamina',
    gaba: 'GABA',
    melatonin: 'Melatonina'
  },
  fr: {
    estrogen: 'Œstrogène',
    progesterone: 'Progestérone',
    prolactin: 'Prolactine',
    thyroid: 'Thyroïde (TSH)',
    insulin: 'Insuline',
    leptin: 'Leptine',
    cortisol: 'Cortisol',
    testosterone: 'Testostérone',
    ferritin: 'Ferritine',
    vitamind: 'Vitamine D',
    vitaminb12: 'Vitamine B12',
    magnesium: 'Magnésium',
    zinc: 'Zinc',
    omega3: 'Oméga-3',
    oxytocin: 'Ocytocine',
    serotonin: 'Sérotonine',
    dopamine: 'Dopamine',
    gaba: 'GABA',
    melatonin: 'Mélatonine'
  },
  de: {
    estrogen: 'Östrogen',
    progesterone: 'Progesteron',
    prolactin: 'Prolaktin',
    thyroid: 'Schilddrüse (TSH)',
    insulin: 'Insulin',
    leptin: 'Leptin',
    cortisol: 'Cortisol',
    testosterone: 'Testosteron',
    ferritin: 'Ferritin',
    vitamind: 'Vitamin D',
    vitaminb12: 'Vitamin B12',
    magnesium: 'Magnesium',
    zinc: 'Zink',
    omega3: 'Omega-3',
    oxytocin: 'Oxytocin',
    serotonin: 'Serotonin',
    dopamine: 'Dopamin',
    gaba: 'GABA',
    melatonin: 'Melatonin'
  },
  zh: {
    estrogen: '雌激素',
    progesterone: '孕激素',
    prolactin: '催乳素',
    thyroid: '甲状腺 (TSH)',
    insulin: '胰岛素',
    leptin: '瘦素',
    cortisol: '皮质醇',
    testosterone: '睾酮',
    ferritin: '铁蛋白',
    vitamind: '维生素D',
    vitaminb12: '维生素B12',
    magnesium: '镁',
    zinc: '锌',
    omega3: 'Omega-3',
    oxytocin: '催产素',
    serotonin: '血清素',
    dopamine: '多巴胺',
    gaba: 'GABA',
    melatonin: '褪黑素'
  },
  ja: {
    estrogen: 'エストロゲン',
    progesterone: 'プロゲステロン',
    prolactin: 'プロラクチン',
    thyroid: '甲状腺 (TSH)',
    insulin: 'インスリン',
    leptin: 'レプチン',
    cortisol: 'コルチゾール',
    testosterone: 'テストステロン',
    ferritin: 'フェリチン',
    vitamind: 'ビタミンD',
    vitaminb12: 'ビタミンB12',
    magnesium: 'マグネシウム',
    zinc: '亜鉛',
    omega3: 'オメガ3',
    oxytocin: 'オキシトシン',
    serotonin: 'セロトニン',
    dopamine: 'ドーパミン',
    gaba: 'GABA',
    melatonin: 'メラトニン'
  },
  pt: {
    estrogen: 'Estrogênio',
    progesterone: 'Progesterona',
    prolactin: 'Prolactina',
    thyroid: 'Tireoide (TSH)',
    insulin: 'Insulina',
    leptin: 'Leptina',
    cortisol: 'Cortisol',
    testosterone: 'Testosterona',
    ferritin: 'Ferritina',
    vitamind: 'Vitamina D',
    vitaminb12: 'Vitamina B12',
    magnesium: 'Magnésio',
    zinc: 'Zinco',
    omega3: 'Ômega-3',
    oxytocin: 'Oxitocina',
    serotonin: 'Serotonina',
    dopamine: 'Dopamina',
    gaba: 'GABA',
    melatonin: 'Melatonina'
  }
};

const templateByLang: LangCopy< {
  description: (name: string) => string;
  daily: (name: string) => string;
  imbalance: (name: string) => string;
  affects: string[];
  drivers: string[];
  track: string[];
  question: (name: string) => string;
}> = {
  en: {
    description: (name) => `${name} reflects one of your core physiological markers.`,
    daily: (name) => `${name} can influence your energy, mood, and daily resilience.`,
    imbalance: (name) => `When ${name} shifts out of range, sensitivity and fatigue may increase.`,
    affects: ['Energy', 'Mood', 'Recovery'],
    drivers: ['Sleep', 'Stress', 'Nutrition'],
    track: ['Energy stability', 'Daily clarity'],
    question: (name) => `How can I better interpret my ${name} pattern in this cycle phase?`
  },
  ru: {
    description: (name) => `${name} отражает один из ключевых физиологических маркеров.`,
    daily: (name) => `${name} влияет на энергию, настроение и устойчивость в течение дня.`,
    imbalance: (name) => `При дисбалансе ${name} могут усиливаться чувствительность и усталость.`,
    affects: ['Энергия', 'Настроение', 'Восстановление'],
    drivers: ['Сон', 'Стресс', 'Питание'],
    track: ['Стабильность энергии', 'Ясность в течение дня'],
    question: (name) => `Как корректно интерпретировать мой паттерн ${name} в этой фазе цикла?`
  },
  uk: {
    description: (name) => `${name} відображає один із ключових фізіологічних маркерів.`,
    daily: (name) => `${name} може впливати на енергію, настрій і стійкість протягом дня.`,
    imbalance: (name) => `За дисбалансу ${name} можуть посилюватися чутливість і втома.`,
    affects: ['Енергія', 'Настрій', 'Відновлення'],
    drivers: ['Сон', 'Стрес', 'Харчування'],
    track: ['Стабільність енергії', 'Ясність протягом дня'],
    question: (name) => `Як коректно інтерпретувати мій патерн ${name} у цій фазі циклу?`
  },
  es: {
    description: (name) => `${name} refleja uno de tus marcadores fisiológicos principales.`,
    daily: (name) => `${name} puede influir en tu energía, estado de ánimo y resiliencia diaria.`,
    imbalance: (name) => `Cuando ${name} se desregula, puede aumentar la sensibilidad y la fatiga.`,
    affects: ['Energía', 'Ánimo', 'Recuperación'],
    drivers: ['Sueño', 'Estrés', 'Nutrición'],
    track: ['Estabilidad de energía', 'Claridad diaria'],
    question: (name) => `¿Cómo interpretar mejor mi patrón de ${name} en esta fase del ciclo?`
  },
  fr: {
    description: (name) => `${name} reflète un de vos marqueurs physiologiques clés.`,
    daily: (name) => `${name} peut influencer votre énergie, votre humeur et votre résilience quotidienne.`,
    imbalance: (name) => `Quand ${name} se déséquilibre, sensibilité et fatigue peuvent augmenter.`,
    affects: ['Énergie', 'Humeur', 'Récupération'],
    drivers: ['Sommeil', 'Stress', 'Nutrition'],
    track: ["Stabilité de l'énergie", 'Clarté quotidienne'],
    question: (name) => `Comment mieux interpréter mon profil de ${name} dans cette phase du cycle ?`
  },
  de: {
    description: (name) => `${name} bildet einen deiner zentralen physiologischen Marker ab.`,
    daily: (name) => `${name} kann Energie, Stimmung und tägliche Belastbarkeit beeinflussen.`,
    imbalance: (name) => `Bei einem Ungleichgewicht von ${name} können Sensibilität und Müdigkeit zunehmen.`,
    affects: ['Energie', 'Stimmung', 'Erholung'],
    drivers: ['Schlaf', 'Stress', 'Ernährung'],
    track: ['Energiestabilität', 'Tagesklarheit'],
    question: (name) => `Wie kann ich mein ${name}-Muster in dieser Zyklusphase besser einordnen?`
  },
  zh: {
    description: (name) => `${name} 反映你的一个核心生理指标。`,
    daily: (name) => `${name} 会影响你的日常精力、情绪与恢复能力。`,
    imbalance: (name) => `当 ${name} 失衡时，敏感度和疲劳感可能上升。`,
    affects: ['精力', '情绪', '恢复'],
    drivers: ['睡眠', '压力', '营养'],
    track: ['精力稳定性', '日常清晰度'],
    question: (name) => `在当前周期阶段，我应如何更准确解读 ${name} 的变化？`
  },
  ja: {
    description: (name) => `${name} は主要な生理マーカーの一つを示します。`,
    daily: (name) => `${name} は日々のエネルギー、気分、回復力に影響します。`,
    imbalance: (name) => `${name} が乱れると、敏感さや疲労感が高まることがあります。`,
    affects: ['エネルギー', '気分', '回復'],
    drivers: ['睡眠', 'ストレス', '栄養'],
    track: ['エネルギーの安定', '日中の明瞭さ'],
    question: (name) => `この周期フェーズでの ${name} パターンはどう解釈すべきですか？`
  },
  pt: {
    description: (name) => `${name} reflete um dos seus marcadores fisiológicos centrais.`,
    daily: (name) => `${name} pode influenciar sua energia, humor e resiliência diária.`,
    imbalance: (name) => `Quando ${name} sai do equilíbrio, sensibilidade e fadiga podem aumentar.`,
    affects: ['Energia', 'Humor', 'Recuperação'],
    drivers: ['Sono', 'Estresse', 'Nutrição'],
    track: ['Estabilidade de energia', 'Clareza diária'],
    question: (name) => `Como interpretar melhor meu padrão de ${name} nesta fase do ciclo?`
  }
};

export const getLocalizedHormone = (hormone: HormoneData, lang: Language): HormoneData => {
  if (lang === 'en' || lang === 'ru') return hormone;

  const localizedNameBase = (nameMap[lang] ?? nameMap.en)[hormone.id] || hormone.name;
  const template = getLang(templateByLang, lang) ?? templateByLang.en;

  return {
    ...hormone,
    name: localizedNameBase,
    description: template.description(localizedNameBase),
    dailyImpact: template.daily(localizedNameBase),
    imbalanceFeeling: template.imbalance(localizedNameBase),
    affects: template.affects,
    drivers: template.drivers,
    whatToTrack: template.track,
    generalDoctorQuestions: [template.question(localizedNameBase)],
  };
};
