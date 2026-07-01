
import React, { useState, useMemo } from 'react';
import { INITIAL_HORMONES, TRANSLATIONS, Language, LangCopy, getLang } from '../constants';
import { HormoneData } from '../types';
import { dataService } from '../services/dataService';
import HormoneDetail from './HormoneDetail';
import { getLocalizedHormone } from '../utils/hormoneLocalization';
import { MemberIconBackButton } from './member/MemberIconBackButton';
import { LunaPageHeroSection } from './shared/LunaPageHeroSection';
import { LunaPageContentSection } from './shared/LunaPageContentSection';
import { PUBLIC_PAGE_STACK } from './public/publicPageStyles';
import { MEMBER_PAGE_ROOT } from '../utils/memberPageStyles';
import { getLunaPageTheme } from '../utils/lunaPageThemes';
import { getMemberHeroImage } from '../utils/memberHeroImages';

export const HormoneLibraryView: React.FC<{ lang: Language; onBack: () => void }> = ({ lang, onBack }) => {
  const ui = TRANSLATIONS[lang];
  const copyByLang: LangCopy< { back: string; titleA: string; titleB: string; part: string; active: string; details: string; wisdom: string; quote: string }> = {
    en: { back: 'Back', titleA: 'Knowledge', titleB: 'Base.', part: 'Part', active: 'Active', details: 'Details →', wisdom: "Your Body's Wisdom", quote: 'Understanding your body is your greatest strength.' },
    ru: { back: 'Назад', titleA: 'База', titleB: 'Знаний.', part: 'Раздел', active: 'Активно', details: 'Подробнее →', wisdom: 'Мудрость тела', quote: 'Понимание своего тела - ваша величайшая сила.' },
    uk: { back: 'Назад', titleA: 'База', titleB: 'Знань.', part: 'Розділ', active: 'Активно', details: 'Детальніше →', wisdom: 'Мудрість тіла', quote: 'Розуміння свого тіла - ваша найбільша сила.' },
    es: { back: 'Atrás', titleA: 'Base de', titleB: 'Conocimiento.', part: 'Parte', active: 'Activo', details: 'Detalles →', wisdom: 'Sabiduría del cuerpo', quote: 'Comprender tu cuerpo es tu mayor fortaleza.' },
    fr: { back: 'Retour', titleA: 'Base de', titleB: 'Connaissances.', part: 'Partie', active: 'Actif', details: 'Détails →', wisdom: 'Sagesse du corps', quote: 'Comprendre votre corps est votre plus grande force.' },
    de: { back: 'Zurück', titleA: 'Wissens', titleB: 'Basis.', part: 'Teil', active: 'Aktiv', details: 'Details →', wisdom: 'Körperweisheit', quote: 'Deinen Körper zu verstehen ist deine größte Stärke.' },
    zh: { back: '返回', titleA: '知识', titleB: '库。', part: '部分', active: '已激活', details: '详情 →', wisdom: '身体智慧', quote: '理解你的身体是你最大的力量。' },
    ja: { back: '戻る', titleA: '知識', titleB: 'ベース。', part: 'パート', active: '有効', details: '詳細 →', wisdom: '身体の知恵', quote: '自分の体を理解することは、あなたの最大の強みです。' },
    pt: { back: 'Voltar', titleA: 'Base de', titleB: 'Conhecimento.', part: 'Parte', active: 'Ativo', details: 'Detalhes →', wisdom: 'Sabedoria do corpo', quote: 'Entender seu corpo é sua maior força.' },
    ar: { back: 'رجوع', titleA: 'قاعدة', titleB: 'المعرفة.', part: 'قسم', active: 'نشط', details: 'التفاصيل ←', wisdom: 'حكمة جسمكِ', quote: 'فهم جسمكِ هو أقوى ما لديكِ.' },
    he: { back: 'חזרה', titleA: 'מאגר', titleB: 'ידע.', part: 'חלק', active: 'פעיל', details: 'פרטים ←', wisdom: 'חוכמת הגוף שלך', quote: 'הבנה של הגוף שלך היא הכוח הגדול ביותר שלך.' },};
  const copy = getLang(copyByLang, lang);
  const extraByLang: LangCopy< { innerWeatherTitle: string; innerWeatherText: string; points: string[]; usageTitle: string; usageItems: string[]; localTitle: string; localText: string }> = {
    en: {
      innerWeatherTitle: 'INNER WEATHER',
      innerWeatherText: 'Energy, mood, and concentration change across time. Most shifts are rhythms, not randomness.',
      points: ['Energy changes', 'Mood changes', 'Concentration changes', 'Recovery changes'],
      usageTitle: 'How To Use Knowledge Daily',
      usageItems: ['Check 1-2 markers that match your current state.', 'Compare with your latest check-in and notes.', 'Choose one low-friction action for today.'],
      localTitle: 'Development Mode',
      localText: 'Knowledge data and your interactions are currently local-first and stay on this device.',
    },
    ru: {
      innerWeatherTitle: 'INNER WEATHER',
      innerWeatherText: 'Энергия, настроение и концентрация меняются во времени. Чаще это ритмы, а не случайность.',
      points: ['Энергия меняется', 'Настроение меняется', 'Концентрация меняется', 'Восстановление меняется'],
      usageTitle: 'Как Использовать Knowledge Ежедневно',
      usageItems: ['Выберите 1-2 маркера, соответствующих текущему состоянию.', 'Сравните с последним check-in и заметками.', 'Выберите одно простое действие на сегодня.'],
      localTitle: 'Режим Разработки',
      localText: 'Раздел Knowledge и ваши взаимодействия сейчас работают local-first и остаются на этом устройстве.',
    },
    uk: {
      innerWeatherTitle: 'INNER WEATHER',
      innerWeatherText: 'Енергія, настрій і концентрація змінюються з часом. Найчастіше це ритми, а не випадковість.',
      points: ['Енергія змінюється', 'Настрій змінюється', 'Концентрація змінюється', 'Відновлення змінюється'],
      usageTitle: 'Як Щодня Використовувати Knowledge',
      usageItems: ['Оберіть 1-2 маркери, що відповідають вашому стану.', 'Порівняйте з останнім check-in та нотатками.', 'Оберіть одну просту дію на сьогодні.'],
      localTitle: 'Режим Розробки',
      localText: 'Розділ Knowledge і ваші взаємодії зараз local-first і залишаються на пристрої.',
    },
    es: {
      innerWeatherTitle: 'INNER WEATHER',
      innerWeatherText: 'Energía, ánimo y concentración cambian con el tiempo. La mayoría de cambios son ritmos, no azar.',
      points: ['La energía cambia', 'El ánimo cambia', 'La concentración cambia', 'La recuperación cambia'],
      usageTitle: 'Cómo Usar Knowledge Cada Día',
      usageItems: ['Elige 1-2 marcadores que encajen con tu estado.', 'Compáralos con tu último check-in y notas.', 'Define una acción simple para hoy.'],
      localTitle: 'Modo Desarrollo',
      localText: 'Knowledge y tus interacciones corren en local-first y permanecen en este dispositivo.',
    },
    fr: {
      innerWeatherTitle: 'INNER WEATHER',
      innerWeatherText: 'Énergie, humeur et concentration changent dans le temps. La plupart des variations suivent un rythme.',
      points: ['L énergie change', 'L humeur change', 'La concentration change', 'La récupération change'],
      usageTitle: 'Utiliser Knowledge Au Quotidien',
      usageItems: ['Choisir 1-2 marqueurs liés à votre état actuel.', 'Comparer avec votre dernier check-in et vos notes.', 'Définir une action simple pour aujourd hui.'],
      localTitle: 'Mode Développement',
      localText: 'Knowledge et vos interactions fonctionnent en local-first et restent sur cet appareil.',
    },
    de: {
      innerWeatherTitle: 'INNER WEATHER',
      innerWeatherText: 'Energie, Stimmung und Konzentration verändern sich über die Zeit. Meist sind es Rhythmen, kein Zufall.',
      points: ['Energie verändert sich', 'Stimmung verändert sich', 'Konzentration verändert sich', 'Erholung verändert sich'],
      usageTitle: 'Knowledge Täglich Nutzen',
      usageItems: ['Wähle 1-2 Marker passend zu deinem Zustand.', 'Vergleiche mit dem letzten Check-in und Notizen.', 'Lege eine einfache Aktion für heute fest.'],
      localTitle: 'Entwicklungsmodus',
      localText: 'Knowledge und deine Interaktionen laufen local-first und bleiben auf diesem Gerät.',
    },
    zh: {
      innerWeatherTitle: 'INNER WEATHER',
      innerWeatherText: '精力、情绪与专注会随时间变化，这些变化大多来自节律而非偶然。',
      points: ['精力会变化', '情绪会变化', '专注会变化', '恢复会变化'],
      usageTitle: '每日如何使用 Knowledge',
      usageItems: ['选择 1-2 个与你当前状态匹配的指标。', '与最近一次 check-in 和记录对照。', '确定今天一个低负担行动。'],
      localTitle: '开发模式',
      localText: 'Knowledge 与你的交互当前为 local-first，数据保留在本机。',
    },
    ja: {
      innerWeatherTitle: 'INNER WEATHER',
      innerWeatherText: 'エネルギー、気分、集中は時間とともに変化します。多くはランダムではなくリズムです。',
      points: ['エネルギーは変化する', '気分は変化する', '集中は変化する', '回復は変化する'],
      usageTitle: 'Knowledge の日次活用',
      usageItems: ['現在の状態に合う指標を1-2個選ぶ。', '最新のcheck-inとメモを比較する。', '今日の小さな行動を1つ決める。'],
      localTitle: '開発モード',
      localText: 'Knowledge と操作データは現在 local-first で、この端末内に保存されます。',
    },
    pt: {
      innerWeatherTitle: 'INNER WEATHER',
      innerWeatherText: 'Energia, humor e concentração mudam com o tempo. Na maioria dos casos, são ritmos e não acaso.',
      points: ['A energia muda', 'O humor muda', 'A concentração muda', 'A recuperação muda'],
      usageTitle: 'Como Usar Knowledge No Dia A Dia',
      usageItems: ['Escolha 1-2 marcadores alinhados ao seu estado.', 'Compare com seu último check-in e notas.', 'Defina uma ação simples para hoje.'],
      localTitle: 'Modo De Desenvolvimento',
      localText: 'Knowledge e suas interações estão em local-first e ficam neste dispositivo.',
    },
    ar: {
      innerWeatherTitle: 'الطقس الداخلي',
      innerWeatherText: 'الطاقة والمزاج والتركيز تتغيّر مع الوقت. أغلب التحولات إيقاعات وليست عشوائية.',
      points: ['الطاقة تتغيّر', 'المزاج يتغيّر', 'التركيز يتغيّر', 'التعافي يتغيّر'],
      usageTitle: 'كيف تستخدمين المعرفة يومياً',
      usageItems: ['اختاري 1–2 مؤشرات تناسب حالتكِ الحالية.', 'قارني مع آخر check-in وملاحظاتكِ.', 'اختاري فعلاً واحداً بسيطاً لليوم.'],
      localTitle: 'وضع التطوير',
      localText: 'بيانات المعرفة وتفاعلاتكِ حالياً local-first وتبقى على هذا الجهاز.',
    },
    he: {
      innerWeatherTitle: 'מזג פנים פנימי',
      innerWeatherText: 'אנרגיה, מצב רוח וריכוז משתנים עם הזמן. רוב השינויים הם קצבים, לא אקראיות.',
      points: ['אנרגיה משתנה', 'מצב רוח משתנה', 'ריכוז משתנה', 'התאוששות משתנה'],
      usageTitle: 'איך להשתמש ב-Knowledge ביום-יום',
      usageItems: ['בחרי 1–2 סמנים שמתאימים למצב הנוכחי.', 'השווי ל-check-in האחרון ולהערות.', 'בחרי פעולה אחת קלה להיום.'],
      localTitle: 'מצב פיתוח',
      localText: 'נתוני Knowledge והאינטראקציות שלך כרגע local-first ונשארים במכשיר הזה.',
    },};
  const extra = getLang(extraByLang, lang) || extraByLang.en;
  const [selectedHormone, setSelectedHormone] = useState<HormoneData | null>(null);
  
  // Get system state to cross-reference data
  const log = dataService.getLog();
  const state = dataService.projectState(log);
  
  const categories = useMemo(() => [
    { id: 'rhythm', label: ui.library.categories.rhythm, icon: '🌙', color: 'text-luna-purple' },
    { id: 'metabolism', label: ui.library.categories.metabolism, icon: '⚙️', color: 'text-luna-teal' },
    { id: 'stress', label: ui.library.categories.stress, icon: '🔋', color: 'text-amber-500' },
    { id: 'vitality', label: ui.library.categories.vitality, icon: '🏹', color: 'text-rose-500' },
    { id: 'brain', label: ui.library.categories.brain, icon: '🧠', color: 'text-indigo-500' }
  ], [ui.library.categories.brain, ui.library.categories.metabolism, ui.library.categories.rhythm, ui.library.categories.stress, ui.library.categories.vitality]);

  const getHormonesByCategory = (catId: string) => {
    return INITIAL_HORMONES
      .filter(h => h.category === catId)
      .map((h) => getLocalizedHormone(h, lang));
  };

  const isMarkerSynchronized = (id: string) => {
    const lowerId = id.toLowerCase();
    // Keywords for matching expanded markers
    const mapKeywords: Record<string, string[]> = {
      shbg: ['shbg', 'гспг'],
      lh: ['lh', 'лг', 'luteinizing'],
      fsh: ['fsh', 'фсг', 'follicle'],
      amh: ['amh', 'амг', 'anti-mullerian'],
      prolactin: ['prolactin', 'пролактин'],
      thyroid: ['tsh', 'ттг'],
      freet3: ['free t3', 'т3 свободный', 'ft3'],
      freet4: ['free t4', 'т4 свободный', 'ft4'],
      rt3: ['reverse t3', 'реверсивный т3'],
      insulin: ['insulin', 'инсулин'],
      leptin: ['leptin', 'лептин'],
      cortisol: ['cortisol', 'кортизол'],
      dheas: ['dhea-s', 'дгэа-с'],
      pregnenolone: ['pregnenolone', 'прегненолон'],
      testosterone: ['testosterone', 'тестостерон'],
      ferritin: ['ferritin', 'ферритин'],
      vitamind: ['vitamin d', 'витамин d', '25-oh'],
      vitaminb12: ['vitamin b12', 'витамин b12'],
      magnesium: ['magnesium', 'магний'],
      zinc: ['zinc', 'цинк'],
      omega3: ['omega-3', 'омега-3'],
      oxytocin: ['oxytocin', 'окситоцин'],
      serotonin: ['serotonin', 'серотонин'],
      dopamine: ['dopamine', 'дофамин', 'допамин'],
      gaba: ['gaba', 'гамк'],
      melatonin: ['melatonin', 'мелатонин']
    };

    const keywords = mapKeywords[lowerId] || [lowerId];
    
    const inLabs = state.labData?.toLowerCase();
    const matchesLab = keywords.some(k => inLabs?.includes(k));
    
    const matchesProfile = keywords.some(k => 
      state.profile.conditions?.toLowerCase().includes(k) ||
      state.profile.recentInterventions?.toLowerCase().includes(k)
    );

    const matchesMeds = state.medications.some(m => 
      keywords.some(k => m.name.toLowerCase().includes(k))
    );

    const inBaselines = ['estrogen', 'progesterone', 'testosterone', 'cortisol', 'insulin', 'thyroid'].includes(lowerId);
    
    return matchesLab || matchesProfile || matchesMeds || inBaselines;
  };

  const themeClass = getLunaPageTheme('library').shellClass;

  return (
    <section data-testid="library-root" className={`${MEMBER_PAGE_ROOT} ${themeClass}`}>
      <MemberIconBackButton lang={lang} onClick={onBack} className="mb-0" />

      <div className={PUBLIC_PAGE_STACK}>
        <LunaPageHeroSection
          themeClass={themeClass}
          eyebrow={copy.titleA}
          title={`${copy.titleA} ${copy.titleB}`.trim()}
          subtitle={ui.library.subheadline}
          image={getMemberHeroImage('library')}
          imageAlt={`${copy.titleA} ${copy.titleB}`}
          tips={extra.usageItems}
          tipsTitle={extra.usageTitle}
        />

        <LunaPageContentSection themeClass={themeClass} padded={false} className="space-y-24">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/65 p-6 space-y-4 shadow-luna-rich">
          <h3 className="text-lg font-black tracking-tight text-luna-purple">{extra.innerWeatherTitle}</h3>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{extra.innerWeatherText}</p>
          <ul className="space-y-1">
            {extra.points.map((point) => (
              <li key={point} className="text-sm font-semibold text-slate-600 dark:text-slate-300">• {point}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/65 p-6 space-y-4 shadow-luna-rich">
          <h3 className="text-lg font-black tracking-tight">{extra.usageTitle}</h3>
          <ul className="space-y-1">
            {extra.usageItems.map((point) => (
              <li key={point} className="text-sm font-semibold text-slate-600 dark:text-slate-300">• {point}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-[2rem] border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/65 p-6 space-y-4 shadow-luna-rich">
          <h3 className="text-lg font-black tracking-tight">{extra.localTitle}</h3>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{extra.localText}</p>
        </article>
      </section>

      <div className="space-y-48">
        {categories.map((cat) => (
          <section key={cat.id} className="space-y-16">
            <div className="flex items-center gap-6 border-b-2 border-slate-100 dark:border-slate-800 pb-8">
              <span className="text-5xl">{cat.icon}</span>
              <div className="space-y-1">
                <h3 className={`text-3xl font-black uppercase tracking-tighter ${cat.color}`}>{cat.label}</h3>
                <p className="text-sm font-black uppercase tracking-[0.16em] opacity-40">{copy.part} {categories.indexOf(cat) + 1}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {getHormonesByCategory(cat.id).map((hormone) => {
                const isSync = isMarkerSynchronized(hormone.id);
                return (
                  <button
                    key={hormone.id}
                    data-testid={`library-card-${hormone.id}`}
                    onClick={() => setSelectedHormone(hormone)}
                    className={`group relative luna-vivid-card p-8 rounded-[3rem] shadow-luna border-2 transition-all text-left overflow-hidden flex flex-col justify-between min-h-[340px] ${isSync ? 'border-luna-purple/40 ring-4 ring-luna-purple/5 shadow-2xl scale-[1.02]' : 'border-slate-50 dark:border-slate-800 hover:border-slate-200'}`}
                  >
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-slate-50 dark:bg-slate-950 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
                    
                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-between items-start">
                        <span className="text-5xl group-hover:scale-110 transition-transform block">{hormone.icon}</span>
                        {isSync && (
                          <span className="px-3 py-1 bg-luna-purple/10 text-luna-purple text-[7px] font-black uppercase tracking-widest rounded-full border border-luna-purple/20 animate-pulse">
                            {copy.active}
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100 leading-none">{hormone.name}</h4>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {hormone.affects.slice(0, 1).map((a, i) => (
                            <span key={i} className="text-[8px] font-black uppercase tracking-widest text-slate-400">#{a.replace(/\s+/g, '')}</span>
                          ))}
                        </div>
                        <p className="text-sm font-medium text-slate-500 italic leading-relaxed line-clamp-4 pt-2">
                          {hormone.description}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 pt-6 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-luna-purple opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all">
                        {copy.details}
                      </span>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: hormone.color }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {selectedHormone && (
        <HormoneDetail hormone={selectedHormone} lang={lang} onClose={() => setSelectedHormone(null)} />
      )}

      <div className="p-20 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-[5rem] text-center space-y-12 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-luna-purple via-transparent to-transparent group-hover:scale-110 transition-transform duration-1000" />
        <div className="relative z-10 space-y-6">
          <p className="text-sm md:text-base font-black uppercase tracking-[0.24em] opacity-40">{copy.wisdom}</p>
          <p className="text-3xl lg:text-5xl font-bold italic leading-none max-w-4xl mx-auto uppercase tracking-tighter">
            {copy.quote}
          </p>
        </div>
      </div>
        </LunaPageContentSection>
      </div>
    </section>
  );
};
