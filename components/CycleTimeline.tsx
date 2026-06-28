
import React from 'react';
import { motion } from 'motion/react';
import { CyclePhase } from '../types';
import { PHASE_INFO, LangCopy, getLang } from '../constants';
import { Language } from '../constants';
import PhaseIndicator from './PhaseIndicator';
import { JourneyProgress } from './JourneyProgress';

interface CycleTimelineProps {
  currentDay: number;
  onDayChange: (day: number) => void;
  lang?: Language;
  isDetailed?: boolean;
  onBack?: () => void;
}

const CycleTimeline: React.FC<CycleTimelineProps> = ({ currentDay, onDayChange, lang = 'en', isDetailed = false, onBack }) => {
  const currentPhase = currentDay <= 5 ? CyclePhase.MENSTRUAL : 
                       currentDay <= 12 ? CyclePhase.FOLLICULAR : 
                       currentDay <= 15 ? CyclePhase.OVULATORY : CyclePhase.LUTEAL;
  
  const info = PHASE_INFO[currentPhase];
  const scrubberPos = `${((currentDay - 1) / 27) * 100}%`;
  const phaseNamesByLang: LangCopy< Record<CyclePhase, string>> = {
    en: { Menstrual: 'Menstrual', Follicular: 'Follicular', Ovulatory: 'Ovulatory', Luteal: 'Luteal' },
    ru: { Menstrual: 'Менструальная', Follicular: 'Фолликулярная', Ovulatory: 'Овуляторная', Luteal: 'Лютеиновая' },
    uk: { Menstrual: 'Менструальна', Follicular: 'Фолікулярна', Ovulatory: 'Овуляторна', Luteal: 'Лютеїнова' },
    es: { Menstrual: 'Menstrual', Follicular: 'Folicular', Ovulatory: 'Ovulatoria', Luteal: 'Lútea' },
    fr: { Menstrual: 'Menstruelle', Follicular: 'Folliculaire', Ovulatory: 'Ovulatoire', Luteal: 'Lutéale' },
    de: { Menstrual: 'Menstruell', Follicular: 'Follikulär', Ovulatory: 'Ovulatorisch', Luteal: 'Luteal' },
    zh: { Menstrual: '经期', Follicular: '卵泡期', Ovulatory: '排卵期', Luteal: '黄体期' },
    ja: { Menstrual: '月経期', Follicular: '卵胞期', Ovulatory: '排卵期', Luteal: '黄体期' },
    pt: { Menstrual: 'Menstrual', Follicular: 'Folicular', Ovulatory: 'Ovulatória', Luteal: 'Lútea' },
  };
  const uiByLang: LangCopy< { back: string; internalSeason: string; cycleRegulator: string; day: string; slideToAdjust: string; min: string; peak: string; mode: string; peakCapacity: string; conserveEnergy: string; steadyState: string }> = {
    en: { back: 'Back', internalSeason: 'Internal Season', cycleRegulator: 'Cycle Regulator', day: 'Day', slideToAdjust: 'Slide to adjust', min: 'Min', peak: 'Peak', mode: 'mode', peakCapacity: 'Peak Capacity', conserveEnergy: 'Conserve Energy', steadyState: 'Steady State' },
    ru: { back: 'Назад', internalSeason: 'Внутренний сезон', cycleRegulator: 'Регулятор цикла', day: 'День', slideToAdjust: 'Сдвиньте для настройки', min: 'Мин', peak: 'Пик', mode: 'режим', peakCapacity: 'Пиковый ресурс', conserveEnergy: 'Сохранять энергию', steadyState: 'Стабильный режим' },
    uk: { back: 'Назад', internalSeason: 'Внутрішній сезон', cycleRegulator: 'Регулятор циклу', day: 'День', slideToAdjust: 'Потягніть для налаштування', min: 'Мін', peak: 'Пік', mode: 'режим', peakCapacity: 'Піковий ресурс', conserveEnergy: 'Зберігати енергію', steadyState: 'Стабільний стан' },
    es: { back: 'Atrás', internalSeason: 'Temporada interna', cycleRegulator: 'Regulador de ciclo', day: 'Día', slideToAdjust: 'Desliza para ajustar', min: 'Mín', peak: 'Pico', mode: 'modo', peakCapacity: 'Capacidad máxima', conserveEnergy: 'Conservar energía', steadyState: 'Estado estable' },
    fr: { back: 'Retour', internalSeason: 'Saison interne', cycleRegulator: 'Régulateur du cycle', day: 'Jour', slideToAdjust: 'Glissez pour ajuster', min: 'Min', peak: 'Pic', mode: 'mode', peakCapacity: 'Capacité maximale', conserveEnergy: "Préserver l'énergie", steadyState: 'État stable' },
    de: { back: 'Zurück', internalSeason: 'Innere Saison', cycleRegulator: 'Zyklusregler', day: 'Tag', slideToAdjust: 'Zum Anpassen schieben', min: 'Min', peak: 'Peak', mode: 'Modus', peakCapacity: 'Spitzenkapazität', conserveEnergy: 'Energie sparen', steadyState: 'Stabiler Zustand' },
    zh: { back: '返回', internalSeason: '内在季节', cycleRegulator: '周期调节器', day: '第', slideToAdjust: '滑动调整', min: '低', peak: '峰值', mode: '模式', peakCapacity: '峰值容量', conserveEnergy: '节省能量', steadyState: '稳定状态' },
    ja: { back: '戻る', internalSeason: '内なる季節', cycleRegulator: 'サイクル調整', day: '日', slideToAdjust: 'スライドで調整', min: '最小', peak: '最大', mode: 'モード', peakCapacity: '最大容量', conserveEnergy: '省エネ', steadyState: '安定状態' },
    pt: { back: 'Voltar', internalSeason: 'Estação interna', cycleRegulator: 'Regulador do ciclo', day: 'Dia', slideToAdjust: 'Deslize para ajustar', min: 'Mín', peak: 'Pico', mode: 'modo', peakCapacity: 'Capacidade máxima', conserveEnergy: 'Conservar energia', steadyState: 'Estado estável' },
  };
  const ui = getLang(uiByLang, lang);
  const lunaBalanceByLang: LangCopy< { title: string; subtitle: string; points: [string, string, string, string]; appliedTitle: string; appliedBody: string; summary: string }> = {
    en: {
      title: 'Luna29 Balance',
      subtitle: 'A visual map of physiological rhythms. See how hormonal and biological markers interact and affect your daily state.',
      points: ['Energy', 'Mood', 'Focus', 'Recovery'],
      appliedTitle: 'Applied In Member Mode',
      appliedBody: 'Use cycle day, phase state, and sensitivity cards to turn patterns into practical decisions for work, communication, and restoration.',
      summary: 'Instead of isolated numbers, this view shows your inner dynamics as one connected system.',
    },
    ru: {
      title: 'Luna29 Balance',
      subtitle: 'Визуальная карта физиологических ритмов. Показывает, как гормональные и биологические маркеры взаимодействуют и влияют на состояние каждый день.',
      points: ['Энергия', 'Настроение', 'Концентрация', 'Восстановление'],
      appliedTitle: 'Прикладная Часть В Мембер Режиме',
      appliedBody: 'Используйте день цикла, фазу и карточки чувствительности, чтобы переводить паттерны в практичные решения для работы, общения и восстановления.',
      summary: 'Вместо отдельных чисел вы видите связанную картину внутренней динамики.',
    },
    uk: { title: 'Luna29 Balance', subtitle: 'A visual map of physiological rhythms. See how hormonal and biological markers interact and affect your daily state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], appliedTitle: 'Applied In Member Mode', appliedBody: 'Use cycle day, phase state, and sensitivity cards to turn patterns into practical decisions for work, communication, and restoration.', summary: 'Instead of isolated numbers, this view shows your inner dynamics as one connected system.' },
    es: { title: 'Luna29 Balance', subtitle: 'A visual map of physiological rhythms. See how hormonal and biological markers interact and affect your daily state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], appliedTitle: 'Applied In Member Mode', appliedBody: 'Use cycle day, phase state, and sensitivity cards to turn patterns into practical decisions for work, communication, and restoration.', summary: 'Instead of isolated numbers, this view shows your inner dynamics as one connected system.' },
    fr: { title: 'Luna29 Balance', subtitle: 'A visual map of physiological rhythms. See how hormonal and biological markers interact and affect your daily state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], appliedTitle: 'Applied In Member Mode', appliedBody: 'Use cycle day, phase state, and sensitivity cards to turn patterns into practical decisions for work, communication, and restoration.', summary: 'Instead of isolated numbers, this view shows your inner dynamics as one connected system.' },
    de: { title: 'Luna29 Balance', subtitle: 'A visual map of physiological rhythms. See how hormonal and biological markers interact and affect your daily state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], appliedTitle: 'Applied In Member Mode', appliedBody: 'Use cycle day, phase state, and sensitivity cards to turn patterns into practical decisions for work, communication, and restoration.', summary: 'Instead of isolated numbers, this view shows your inner dynamics as one connected system.' },
    zh: { title: 'Luna29 Balance', subtitle: 'A visual map of physiological rhythms. See how hormonal and biological markers interact and affect your daily state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], appliedTitle: 'Applied In Member Mode', appliedBody: 'Use cycle day, phase state, and sensitivity cards to turn patterns into practical decisions for work, communication, and restoration.', summary: 'Instead of isolated numbers, this view shows your inner dynamics as one connected system.' },
    ja: { title: 'Luna29 Balance', subtitle: 'A visual map of physiological rhythms. See how hormonal and biological markers interact and affect your daily state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], appliedTitle: 'Applied In Member Mode', appliedBody: 'Use cycle day, phase state, and sensitivity cards to turn patterns into practical decisions for work, communication, and restoration.', summary: 'Instead of isolated numbers, this view shows your inner dynamics as one connected system.' },
    pt: { title: 'Luna29 Balance', subtitle: 'A visual map of physiological rhythms. See how hormonal and biological markers interact and affect your daily state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], appliedTitle: 'Applied In Member Mode', appliedBody: 'Use cycle day, phase state, and sensitivity cards to turn patterns into practical decisions for work, communication, and restoration.', summary: 'Instead of isolated numbers, this view shows your inner dynamics as one connected system.' },
  };
  const lunaBalance = getLang(lunaBalanceByLang, lang) || lunaBalanceByLang.en;
  const innerWeatherByLang: LangCopy< { title: string; intro: string; points: [string, string, string]; line1: string; line2: string; line3: string }> = {
    en: { title: 'INNER WEATHER', intro: 'Short explanation:', points: ['energy changes', 'mood changes', 'focus changes'], line1: 'But these changes are rarely random.', line2: 'More often, they are rhythms of physiology.', line3: 'Luna29 helps you see this dynamic as a map of inner weather.' },
    ru: { title: 'ВНУТРЕННЯЯ ПОГОДА', intro: 'Короткое объяснение:', points: ['энергия меняется', 'настроение меняется', 'концентрация меняется'], line1: 'Но эти изменения редко случайны.', line2: 'Чаще это ритмы физиологии.', line3: 'Luna29 помогает видеть эту динамику как карту внутренней погоды.' },
    uk: { title: 'ВНУТРІШНЯ ПОГОДА', intro: 'Коротке пояснення:', points: ['енергія змінюється', 'настрій змінюється', 'концентрація змінюється'], line1: 'Але ці зміни рідко випадкові.', line2: 'Найчастіше це ритми фізіології.', line3: 'Luna29 допомагає бачити цю динаміку як карту внутрішньої погоди.' },
    es: { title: 'CLIMA INTERIOR', intro: 'Explicación breve:', points: ['la energía cambia', 'el estado de ánimo cambia', 'la concentración cambia'], line1: 'Pero estos cambios rara vez son aleatorios.', line2: 'Con más frecuencia, son ritmos de la fisiología.', line3: 'Luna29 te ayuda a ver esta dinámica como un mapa del clima interior.' },
    fr: { title: 'MÉTÉO INTÉRIEURE', intro: 'Explication courte :', points: ["l'énergie change", "l'humeur change", 'la concentration change'], line1: 'Mais ces changements sont rarement aléatoires.', line2: 'Le plus souvent, ce sont des rythmes physiologiques.', line3: 'Luna29 vous aide à voir cette dynamique comme une carte de la météo intérieure.' },
    de: { title: 'INNERES WETTER', intro: 'Kurze Erklärung:', points: ['Energie verändert sich', 'Stimmung verändert sich', 'Konzentration verändert sich'], line1: 'Diese Veränderungen sind jedoch selten zufällig.', line2: 'Meist sind es Rhythmen der Physiologie.', line3: 'Luna29 hilft, diese Dynamik als Karte des inneren Wetters zu sehen.' },
    zh: { title: '内在天气', intro: '简短说明：', points: ['能量会变化', '情绪会变化', '专注会变化'], line1: '但这些变化很少是随机的。', line2: '更常见的是生理节律在起作用。', line3: 'Luna29 帮助你把这种动态看作一张内在天气地图。' },
    ja: { title: 'インナーウェザー', intro: '短い説明：', points: ['エネルギーは変わる', '気分は変わる', '集中は変わる'], line1: 'しかし、これらの変化は偶然ではありません。', line2: '多くは生理的リズムです。', line3: 'Luna29 はこの動きを「内なる天気図」として見える化します。' },
    pt: { title: 'CLIMA INTERNO', intro: 'Explicação curta:', points: ['a energia muda', 'o humor muda', 'a concentração muda'], line1: 'Mas essas mudanças raramente são aleatórias.', line2: 'Na maioria das vezes, são ritmos da fisiologia.', line3: 'A Luna29 ajuda você a ver essa dinâmica como um mapa do clima interno.' },
  };
  const innerWeather = getLang(innerWeatherByLang, lang) || innerWeatherByLang.en;
  const phaseSeasonByLang: LangCopy< Record<CyclePhase, string>> = {
    en: { Menstrual: 'Restoration Season', Follicular: 'Building Season', Ovulatory: 'Vibrancy Season', Luteal: 'Nesting Season' },
    ru: { Menstrual: 'Сезон восстановления', Follicular: 'Сезон набора ресурса', Ovulatory: 'Сезон яркости', Luteal: 'Сезон уюта' },
    uk: { Menstrual: 'Сезон відновлення', Follicular: 'Сезон нарощування ресурсу', Ovulatory: 'Сезон яскравості', Luteal: 'Сезон гніздування' },
    es: { Menstrual: 'Temporada de restauración', Follicular: 'Temporada de crecimiento', Ovulatory: 'Temporada de vitalidad', Luteal: 'Temporada de refugio' },
    fr: { Menstrual: 'Saison de restauration', Follicular: 'Saison de construction', Ovulatory: 'Saison de vitalité', Luteal: 'Saison de recentrage' },
    de: { Menstrual: 'Erholungsphase', Follicular: 'Aufbauphase', Ovulatory: 'Vibranzphase', Luteal: 'Rückzugsphase' },
    zh: { Menstrual: '修复季', Follicular: '构建季', Ovulatory: '活力季', Luteal: '内收季' },
    ja: { Menstrual: '回復シーズン', Follicular: '構築シーズン', Ovulatory: '活性シーズン', Luteal: '内向シーズン' },
    pt: { Menstrual: 'Estação de restauração', Follicular: 'Estação de construção', Ovulatory: 'Estação de vitalidade', Luteal: 'Estação de recolhimento' },
  };
  const sensitivityByLang: LangCopy< Record<string, string>> = {
    en: {},
    ru: { Quiet: 'Тихо', Soft: 'Мягко', Selective: 'Избирательно', Bright: 'Ясно', Rising: 'Растет', Open: 'Открыто', Radiant: 'Сияние', Full: 'Полно', Outgoing: 'Общительно', Reflective: 'Рефлексивно', Grounding: 'Заземление', Guarded: 'Бережно' },
    uk: { Quiet: 'Тихо', Soft: 'М’яко', Selective: 'Вибірково', Bright: 'Ясно', Rising: 'Зростає', Open: 'Відкрито', Radiant: 'Сяйво', Full: 'Повно', Outgoing: 'Соціально', Reflective: 'Рефлексивно', Grounding: 'Заземлення', Guarded: 'Обережно' },
    es: { Quiet: 'Calma', Soft: 'Suave', Selective: 'Selectivo', Bright: 'Brillante', Rising: 'En ascenso', Open: 'Abierto', Radiant: 'Radiante', Full: 'Lleno', Outgoing: 'Extrovertido', Reflective: 'Reflexivo', Grounding: 'Aterrizado', Guarded: 'Reservado' },
    fr: { Quiet: 'Calme', Soft: 'Doux', Selective: 'Sélectif', Bright: 'Clair', Rising: 'En hausse', Open: 'Ouvert', Radiant: 'Rayonnant', Full: 'Plein', Outgoing: 'Sociable', Reflective: 'Réflexif', Grounding: 'Ancré', Guarded: 'Réservé' },
    de: { Quiet: 'Ruhig', Soft: 'Sanft', Selective: 'Selektiv', Bright: 'Hell', Rising: 'Ansteigend', Open: 'Offen', Radiant: 'Strahlend', Full: 'Voll', Outgoing: 'Kontaktfreudig', Reflective: 'Reflektierend', Grounding: 'Geerdet', Guarded: 'Zurückhaltend' },
    zh: { Quiet: '安静', Soft: '柔和', Selective: '选择性', Bright: '明亮', Rising: '上升', Open: '开放', Radiant: '充盈', Full: '满格', Outgoing: '外向', Reflective: '内省', Grounding: '稳定', Guarded: '防护' },
    ja: { Quiet: '静穏', Soft: 'やわらかい', Selective: '選択的', Bright: '明るい', Rising: '上昇中', Open: 'オープン', Radiant: '輝き', Full: '満ちる', Outgoing: '社交的', Reflective: '内省的', Grounding: '安定', Guarded: '防御的' },
    pt: { Quiet: 'Calmo', Soft: 'Suave', Selective: 'Seletivo', Bright: 'Brilhante', Rising: 'Em alta', Open: 'Aberto', Radiant: 'Radiante', Full: 'Cheio', Outgoing: 'Expansivo', Reflective: 'Reflexivo', Grounding: 'Aterrado', Guarded: 'Reservado' },
  };

  return (
    <div className="w-full luna-page-shell luna-page-ritual animate-in fade-in duration-1000 space-y-8 p-8 md:p-10 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-20 w-80 h-80 rounded-full bg-luna-purple/28 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-luna-teal/24 blur-[110px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-luna-coral/20 blur-[120px]" />
      {onBack && (
        <button 
          onClick={onBack} 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {ui.back}
        </button>
      )}
      <JourneyProgress lang={lang} currentStep={2} />

      <div className="relative w-full h-40 mb-12 overflow-hidden bg-gradient-to-br from-[#faedf5]/88 via-[#eee3f2]/82 to-[#e2ebf8]/78 dark:from-slate-900/55 dark:to-slate-900/45 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_18px_42px_rgba(91,74,131,0.2)] dark:shadow-[0_14px_34px_rgba(0,0,0,0.38)]">
        <svg viewBox="0 0 1000 200" className="absolute inset-0 w-full h-full preserve-3d" preserveAspectRatio="none">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ec4899" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path 
            d="M0,150 C150,150 250,50 400,50 C550,50 650,150 800,150 C950,150 1000,100 1000,100 L1000,200 L0,200 Z" 
            fill="url(#waveGradient)"
            className="animate-wave-flow"
          />
          <path 
            d="M0,150 C150,150 250,50 400,50 C550,50 650,150 800,150 C950,150 1000,100 1000,100" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            strokeOpacity="0.1"
          />
          <line 
            x1={(currentDay / 28) * 1000} 
            y1="0" 
            x2={(currentDay / 28) * 1000} 
            y2="200" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeDasharray="4 4" 
            opacity="0.2"
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <span className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-pink-500 mb-2 block">{ui.internalSeason}</span>
            <h3 className="text-3xl font-black uppercase tracking-tighter">{getLang(phaseSeasonByLang, lang)[currentPhase] || info.description}</h3>
          </div>
        </div>
      </div>

      <section className="rounded-[2.6rem] border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-[#f3e5f1]/94 via-[#e8e1f2]/92 to-[#dde9f7]/90 dark:from-[#07122c]/92 dark:via-[#0c1c3d]/90 dark:to-[#10264b]/88 p-7 md:p-8 shadow-[0_24px_56px_rgba(92,72,132,0.22)] dark:shadow-[0_22px_52px_rgba(0,0,0,0.45)] space-y-5">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">{lunaBalance.title}</h2>
        <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{lunaBalance.subtitle}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lunaBalance.points.map((point) => (
            <div
              key={point}
              className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/70 p-4 text-center shadow-[0_12px_28px_rgba(94,76,136,0.2)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.36)]"
              style={{
                backgroundImage: "url('/images/voice-journal-bg.webp')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,rgba(255,248,255,0.72),rgba(240,230,248,0.58),rgba(222,232,247,0.52))] dark:bg-[linear-gradient(140deg,rgba(8,13,29,0.7),rgba(13,24,47,0.64),rgba(18,34,63,0.58))]" />
              <p className="relative text-xs md:text-sm font-black uppercase tracking-[0.14em] text-slate-800 dark:text-slate-100">{point}</p>
            </div>
          ))}
        </div>
        <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{lunaBalance.summary}</p>
      </section>

      <article className="rounded-[2.4rem] border border-slate-200/80 dark:border-slate-800/88 bg-gradient-to-br from-[#f5e9f3]/90 via-[#ece6f2]/86 to-[#e3ebf8]/82 dark:from-[#050f23]/95 dark:via-[#08162f]/93 dark:to-[#0c1f3f]/91 p-6 md:p-7 shadow-[0_18px_42px_rgba(91,73,130,0.18)] dark:shadow-[0_20px_44px_rgba(0,0,0,0.5)]">
        <p className="text-base md:text-lg font-black uppercase tracking-[0.2em] text-luna-purple mb-3">{innerWeather.title}</p>
        <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{innerWeather.intro}</p>
        <ul className="mt-3 space-y-1">
          <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {innerWeather.points[0]}</li>
          <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {innerWeather.points[1]}</li>
          <li className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">• {innerWeather.points[2]}</li>
        </ul>
        <p className="mt-4 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
          {innerWeather.line1}
          <br />
          {innerWeather.line2}
        </p>
        <p className="mt-3 text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
          {innerWeather.line3}
        </p>
      </article>

      <div className="space-y-16">
        <PhaseIndicator 
          phase={currentPhase}
          range={info.range}
          description={info.description}
          feeling={info.feeling}
        />

        <div className="space-y-10 bg-gradient-to-br from-[#f6ebf4]/84 via-[#ede5f2]/80 to-[#e4ecf8]/76 dark:from-slate-900/58 dark:via-slate-900/46 dark:to-slate-900/34 p-10 rounded-[3rem] border border-slate-200/80 dark:border-slate-800 shadow-[0_18px_42px_rgba(91,73,130,0.18)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.4)]">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-slate-400">{ui.cycleRegulator}</h4>
            <span className="px-4 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-[10px] font-black uppercase tracking-widest">{ui.day} {currentDay}</span>
          </div>
          
          <div className="relative h-20 flex items-center px-4">
            <input 
              type="range" 
              min="1" 
              max="28" 
              value={currentDay} 
              onChange={(e) => onDayChange(parseInt(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
            />
            
            {/* Track Background */}
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full relative overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 via-luna-purple to-indigo-500 transition-all duration-300"
                style={{ width: scrubberPos }}
              />
            </div>

            {/* Phase Markers on Track */}
            <div className="absolute inset-x-4 h-4 flex justify-between items-center pointer-events-none px-1">
               {[1, 6, 13, 16].map(day => (
                 <div key={day} className="w-1 h-1 bg-white/50 rounded-full" />
               ))}
            </div>

            {/* Handle */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-14 h-14 bg-white dark:bg-slate-900 border-[6px] border-slate-900 dark:border-slate-100 rounded-full shadow-2xl transition-all duration-300 z-20 flex items-center justify-center group"
              style={{ left: `calc(${scrubberPos} - 28px)`, marginLeft: '1rem' }}
            >
              <div className="flex flex-col items-center">
                <div className="flex gap-0.5 mb-1">
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-pulse" />
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-pulse delay-75" />
                  <div className="w-1 h-1 bg-slate-400 rounded-full animate-pulse delay-150" />
                </div>
                <span className="text-[11px] font-black leading-none">{currentDay}</span>
              </div>
              
              {/* Visual "Drag Me" Hint */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md pointer-events-none">
                {ui.slideToAdjust}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 text-[9px] font-black text-slate-400 uppercase tracking-widest px-4 text-center">
            <div className={currentDay <= 5 ? 'text-pink-500' : ''}>{getLang(phaseNamesByLang, lang)[CyclePhase.MENSTRUAL]}</div>
            <div className={currentDay > 5 && currentDay <= 12 ? 'text-luna-purple' : ''}>{getLang(phaseNamesByLang, lang)[CyclePhase.FOLLICULAR]}</div>
            <div className={currentDay > 12 && currentDay <= 15 ? 'text-indigo-500' : ''}>{getLang(phaseNamesByLang, lang)[CyclePhase.OVULATORY]}</div>
            <div className={currentDay > 15 ? 'text-slate-900 dark:text-white' : ''}>{getLang(phaseNamesByLang, lang)[CyclePhase.LUTEAL]}</div>
          </div>
        </div>

        <article className="rounded-[2.6rem] border border-slate-200/80 dark:border-slate-800/88 bg-gradient-to-br from-[#f1e3ef]/92 via-[#e5e0ef]/90 to-[#dae5f5]/88 dark:from-[#061126]/94 dark:via-[#08162f]/92 dark:to-[#0d1f3c]/90 p-7 md:p-8 shadow-[0_20px_46px_rgba(92,73,132,0.18)] dark:shadow-[0_20px_44px_rgba(0,0,0,0.5)] space-y-3">
          <p className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-luna-purple">{lunaBalance.appliedTitle}</p>
          <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{lunaBalance.appliedBody}</p>
        </article>

        {isDetailed && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
             {Object.entries(info.sensitivity).map(([key, val], index) => {
               const icons: Record<string, string> = { mood: '🎭', energy: '⚡', social: '🤝' };
               const colors: Record<string, string> = { 
                 mood: 'from-rose-500/20 to-rose-500/5 border-rose-200/50 dark:border-rose-900/30 text-rose-600 dark:text-rose-400',
                 energy: 'from-amber-500/20 to-amber-500/5 border-amber-200/50 dark:border-amber-900/30 text-amber-600 dark:text-amber-400',
                 social: 'from-indigo-500/20 to-indigo-500/5 border-indigo-200/50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400'
               };

               const glowColors: Record<string, string> = {
                 mood: 'bg-rose-500',
                 energy: 'bg-amber-500',
                 social: 'bg-indigo-500'
               };
               
               return (
                 <motion.div 
                   key={key}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.1 }}
                   whileHover={{ y: -8, scale: 1.02 }}
                   className={`relative p-10 rounded-[3rem] border-2 bg-gradient-to-b shadow-xl flex flex-col items-center text-center gap-8 overflow-hidden group ${colors[key]}`}
                 >
                   {/* Background Glow */}
                   <div className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity ${glowColors[key]}`} />
                   
                   <motion.div 
                     whileHover={{ rotate: [0, -10, 10, 0] }}
                     className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-5xl shadow-2xl border border-current/10 relative z-10"
                   >
                     {icons[key]}
                   </motion.div>

                   <div className="space-y-3 relative z-10">
                     <span className="text-sm font-black uppercase tracking-[0.22em] opacity-50 block">{key} {ui.mode}</span>
                     <p className="text-3xl font-black uppercase tracking-tighter leading-none">{getLang(sensitivityByLang, lang)[val] || val}</p>
                   </div>
                   
                   {/* Visual Meter */}
                   <div className="w-full space-y-3 relative z-10">
                     <div className="w-full h-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ 
                            width: val === 'Full' || val === 'Radiant' || val === 'Outgoing' ? '100%' :
                                   val === 'Rising' || val === 'Bright' || val === 'Open' ? '70%' :
                                   val === 'Grounding' || val === 'Reflective' || val === 'Guarded' ? '40%' : '20%'
                          }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-current shadow-[0_0_10px_rgba(0,0,0,0.1)]" 
                        />
                     </div>
                     <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest opacity-40">
                       <span>{ui.min}</span>
                       <span>{ui.peak}</span>
                     </div>
                   </div>

                   {/* Subtle Tip */}
                   <div className="pt-4 border-t border-current/10 w-full relative z-10">
                     <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                       {val === 'Radiant' || val === 'Full' || val === 'Outgoing' ? ui.peakCapacity :
                        val === 'Reflective' || val === 'Guarded' ? ui.conserveEnergy : ui.steadyState}
                     </p>
                   </div>
                 </motion.div>
               );
             })}
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes wave-flow {
          0% { transform: translateX(0); }
          50% { transform: translateX(-10px); }
          100% { transform: translateX(0); }
        }
        .animate-wave-flow {
          animation: wave-flow 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CycleTimeline;
