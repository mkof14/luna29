import React from 'react';
import { Language, LangCopy, getLang } from '../../constants';

interface PublicMapSectionProps {
  lang: Language;
  theme: 'light' | 'dark';
  eyebrow: string;
  mapCards: {
    weatherText: string;
    memoryText: string;
    languageText: string;
  };
  appliedTitle: string;
  appliedBody: string;
  bodyMapBackgroundStyle: React.CSSProperties;
}

export const PublicMapSection: React.FC<PublicMapSectionProps> = ({
  lang,
  theme,
  eyebrow,
  mapCards,
  appliedTitle,
  appliedBody,
  bodyMapBackgroundStyle,
}) => {
  const lunaBalanceVisionByLang: LangCopy< { title: string; subtitle: string; points: [string, string, string, string]; ending: string }> = {
    en: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance is a visual map of physiological rhythms. It shows how hormonal and biological markers interact and influence your state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], ending: 'Instead of isolated numbers, Luna29 builds a clear picture of inner dynamics over time.' },
    ru: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance — визуальная карта физиологических ритмов. Она показывает, как гормональные и биологические маркеры взаимодействуют и влияют на состояние.', points: ['Энергия', 'Настроение', 'Концентрация', 'Восстановление'], ending: 'Вместо отдельных чисел Luna29 формирует целостную картину внутренней динамики во времени.' },
    uk: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance — візуальна карта фізіологічних ритмів. Вона показує, як гормональні й біологічні маркери взаємодіють і впливають на стан.', points: ['Енергія', 'Настрій', 'Концентрація', 'Відновлення'], ending: 'Замість окремих чисел Luna29 формує цілісну картину внутрішньої динаміки у часі.' },
    es: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance es un mapa visual de ritmos fisiológicos. Muestra cómo los marcadores hormonales y biológicos interactúan e influyen en tu estado.', points: ['Energía', 'Ánimo', 'Enfoque', 'Recuperación'], ending: 'En lugar de números aislados, Luna29 construye una imagen clara de tu dinámica interna a lo largo del tiempo.' },
    fr: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance est une carte visuelle des rythmes physiologiques. Elle montre comment les marqueurs hormonaux et biologiques interagissent et influencent votre état.', points: ['Énergie', 'Humeur', 'Focus', 'Récupération'], ending: 'Au lieu de chiffres isolés, Luna29 construit une image claire de votre dynamique interne dans le temps.' },
    de: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance ist eine visuelle Karte physiologischer Rhythmen. Sie zeigt, wie hormonelle und biologische Marker interagieren und deinen Zustand beeinflussen.', points: ['Energie', 'Stimmung', 'Fokus', 'Regeneration'], ending: 'Statt isolierter Zahlen zeigt Luna29 ein klares Bild deiner inneren Dynamik über die Zeit.' },
    zh: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance 是一张生理节律可视化地图，展示激素与生物指标如何相互作用并影响你的状态。', points: ['能量', '情绪', '专注', '恢复'], ending: 'Luna29 不只给你零散数字，而是给出随时间变化的内在动态全景。' },
    ja: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance は生理リズムを可視化するマップです。ホルモンや生体指標の相互作用を示し、今の状態を読み解きます。', points: ['エネルギー', '気分', '集中', '回復'], ending: '単発の数値ではなく、時間軸での内的ダイナミクスを明確に可視化します。' },
    pt: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance e um mapa visual de ritmos fisiologicos. Mostra como marcadores hormonais e biologicos interagem e influenciam seu estado.', points: ['Energia', 'Humor', 'Foco', 'Recuperacao'], ending: 'Em vez de numeros isolados, a Luna29 constrói uma imagem clara da dinamica interna ao longo do tempo.' },
  };
  const innerWeatherByLang: LangCopy< { title: string; intro: string; points: [string, string, string]; line1: string; line2: string; line3: string }> = {
    en: { title: 'INNER WEATHER', intro: 'Short explanation:', points: ['energy shifts', 'mood shifts', 'focus shifts'], line1: 'But these changes are rarely random.', line2: 'Most often they are rhythms of physiology.', line3: 'Luna29 helps you see this movement as a map of inner weather.' },
    ru: { title: 'ВНУТРЕННЯЯ ПОГОДА', intro: 'Короткое объяснение:', points: ['энергия меняется', 'настроение меняется', 'концентрация меняется'], line1: 'Но эти изменения редко случайны.', line2: 'Чаще это ритмы физиологии.', line3: 'Luna29 помогает увидеть эту динамику как карту внутренней погоды.' },
    uk: { title: 'ВНУТРІШНЯ ПОГОДА', intro: 'Коротке пояснення:', points: ['енергія змінюється', 'настрій змінюється', 'фокус змінюється'], line1: 'Але ці зміни рідко випадкові.', line2: 'Найчастіше це ритми фізіології.', line3: 'Luna29 допомагає побачити цю динаміку як карту внутрішньої погоди.' },
    es: { title: 'CLIMA INTERNO', intro: 'Explicación breve:', points: ['la energía cambia', 'el ánimo cambia', 'el foco cambia'], line1: 'Pero estos cambios rara vez son aleatorios.', line2: 'Con más frecuencia son ritmos fisiológicos.', line3: 'Luna29 te ayuda a ver esta dinámica como un mapa de clima interno.' },
    fr: { title: 'METEO INTERIEURE', intro: 'Explication courte:', points: ['l energie change', 'l humeur change', 'la concentration change'], line1: 'Mais ces changements sont rarement aleatoires.', line2: 'Le plus souvent, ce sont des rythmes physiologiques.', line3: 'Luna29 vous aide a voir cette dynamique comme une carte de meteo interieure.' },
    de: { title: 'INNERES WETTER', intro: 'Kurze Erklärung:', points: ['Energie verändert sich', 'Stimmung verändert sich', 'Fokus verändert sich'], line1: 'Diese Veränderungen sind jedoch selten zufällig.', line2: 'Meist sind es physiologische Rhythmen.', line3: 'Luna29 hilft dir, diese Dynamik als innere Wetterkarte zu sehen.' },
    zh: { title: '内在天气', intro: '简短说明：', points: ['能量会变化', '情绪会变化', '专注会变化'], line1: '但这些变化很少是随机的。', line2: '更常见的是生理节律在起作用。', line3: 'Luna29 帮助你把这种动态看作一张内在天气地图。' },
    ja: { title: 'インナーウェザー', intro: '短い説明：', points: ['エネルギーは変わる', '気分は変わる', '集中は変わる'], line1: 'しかし、これらの変化は偶然ではありません。', line2: '多くは生理的リズムです。', line3: 'Luna29 はこの動きを「内なる天気図」として見える化します。' },
    pt: { title: 'CLIMA INTERNO', intro: 'Explicação curta:', points: ['a energia muda', 'o humor muda', 'a concentração muda'], line1: 'Mas essas mudanças raramente são aleatórias.', line2: 'Na maioria das vezes, são ritmos da fisiologia.', line3: 'A Luna29 ajuda você a ver essa dinâmica como um mapa do clima interno.' },
  };
  const mapCoreLabelByLang: LangCopy< string> = {
    en: 'Luna29 Balance Core',
    ru: 'Ядро Luna29 Balance',
    uk: 'Ядро Luna29 Balance',
    es: 'Nucleo De Luna29 Balance',
    fr: 'Noyau Luna29 Balance',
    de: 'Luna29 Balance Kern',
    zh: 'Luna29 Balance 核心',
    ja: 'Luna29 Balance コア',
    pt: 'Nucleo Luna29 Balance',
  };
  const lunaBalanceVision = getLang(lunaBalanceVisionByLang, lang) || lunaBalanceVisionByLang.en;
  const innerWeather = getLang(innerWeatherByLang, lang) || innerWeatherByLang.en;
  const coreLabel = getLang(mapCoreLabelByLang, lang) || mapCoreLabelByLang.en;
  const cards = [
    { title: lunaBalanceVision.points[0], text: mapCards.weatherText, icon: '🌙' },
    { title: lunaBalanceVision.points[1], text: mapCards.memoryText, icon: '🌊' },
    { title: lunaBalanceVision.points[2], text: mapCards.languageText, icon: '🕊️' },
  ];
  return (
    <section
      className={`luna-page-shell luna-page-bodymap rounded-[3rem] p-8 md:p-10 space-y-8 relative overflow-hidden animate-in fade-in duration-500 ${
        theme === 'dark'
          ? 'text-white border border-slate-800 shadow-luna-deep'
          : 'text-slate-800 border border-slate-200/70 shadow-luna-rich'
      }`}
    >
      <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-luna-purple/34 blur-[105px]" />
      <div className="absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-luna-teal/30 blur-[105px]" />
      <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full bg-luna-coral/24 blur-[110px]" />
      <div className="relative z-10 h-56 md:h-72 lg:h-80 rounded-[2.5rem] overflow-hidden border border-transparent bg-transparent">
        <div className="absolute inset-0" style={bodyMapBackgroundStyle} />
        <img
          src="/images/f5.webp"
          alt="Body map visual"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-68"
          style={{ objectPosition: '50% 44%', filter: 'saturate(.62) contrast(.86) brightness(.82)' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(110%_75%_at_20%_18%,rgba(245,236,250,0.30),transparent_58%),radial-gradient(95%_70%_at_84%_82%,rgba(206,184,228,0.20),transparent_62%)] dark:bg-[radial-gradient(110%_75%_at_20%_18%,rgba(57,45,86,0.28),transparent_58%),radial-gradient(95%_70%_at_84%_82%,rgba(42,66,108,0.24),transparent_62%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(247,236,230,0.32)] via-transparent to-[rgba(240,230,238,0.3)] dark:from-[rgba(12,16,30,0.44)] dark:via-transparent dark:to-[rgba(14,18,32,0.42)]" />
      </div>
      <header className="space-y-2 relative z-10">
        <p className="text-sm md:text-base font-black uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight">{lunaBalanceVision.title}</h2>
        <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} font-semibold max-w-3xl`}>
          {lunaBalanceVision.subtitle}
        </p>
      </header>
      <div className="relative z-10 rounded-[2rem] border border-slate-200/80 dark:border-slate-700/70 bg-gradient-to-br from-[#fff4fb]/90 via-[#f5e8f8]/84 to-[#e5eef9]/78 dark:from-slate-900/72 dark:via-slate-900/65 dark:to-slate-800/62 p-6 md:p-7 shadow-[0_22px_54px_rgba(86,66,128,0.24)] dark:shadow-[0_18px_46px_rgba(0,0,0,0.45)]">
        <p className="text-base md:text-lg font-black uppercase tracking-[0.16em] text-luna-purple mb-3">{coreLabel}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lunaBalanceVision.points.map((point) => (
            <div key={point} className="rounded-2xl border border-slate-200/80 dark:border-slate-700/70 bg-[linear-gradient(160deg,rgba(255,252,255,0.76),rgba(244,238,250,0.82)),url('/images/bg1.webp')] bg-cover bg-center dark:bg-[linear-gradient(160deg,rgba(22,19,48,0.78),rgba(14,16,41,0.84)),url('/images/bg1.webp')] p-4 text-center shadow-[0_12px_28px_rgba(91,76,131,0.2)] dark:shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
              <p className="text-sm md:text-base font-black uppercase tracking-[0.12em] text-slate-800 dark:text-slate-100">{point}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm md:text-base font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">{lunaBalanceVision.ending}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
        {cards.map((item) => (
          <article
            key={item.title}
            className={`p-6 rounded-[2rem] backdrop-blur-sm relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-slate-900/70 via-slate-900/62 to-slate-800/60 border border-white/10 shadow-[0_14px_36px_rgba(0,0,0,0.4)]'
                : 'bg-gradient-to-br from-[#fff6fc]/90 via-[#f4e8f7]/82 to-[#e3ecf8]/76 border border-slate-200/80 shadow-[0_16px_36px_rgba(94,76,136,0.2)]'
            }`}
          >
            <div className="absolute -right-2 -top-2 p-4 opacity-25 text-5xl group-hover:scale-110 transition-transform">{item.icon}</div>
            <h3 className="text-xl font-black uppercase tracking-tight mb-3">{item.title}</h3>
            <p className={`${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} font-semibold leading-relaxed text-sm`}>{item.text}</p>
          </article>
        ))}
      </div>
      <article className="relative z-10 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/85 bg-gradient-to-br from-[#f5e9f3]/90 via-[#ece6f2]/86 to-[#e3ebf8]/82 dark:from-[#050f23]/95 dark:via-[#08162f]/93 dark:to-[#0c1f3f]/91 p-6 md:p-7 shadow-[0_16px_38px_rgba(90,72,130,0.18)] dark:shadow-[0_20px_44px_rgba(0,0,0,0.52)]">
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
      <article className="relative z-10 rounded-[2rem] border border-slate-200/80 dark:border-slate-800/85 bg-[linear-gradient(165deg,rgba(248,243,251,0.78),rgba(236,230,246,0.86)),url('/images/bg5.webp')] bg-cover bg-center dark:bg-[linear-gradient(165deg,rgba(13,18,40,0.78),rgba(9,18,40,0.86)),url('/images/bg5.webp')] p-6 shadow-[0_18px_42px_rgba(88,69,126,0.2)] dark:shadow-[0_20px_42px_rgba(0,0,0,0.5)]">
        <p className="text-base md:text-lg font-black uppercase tracking-[0.16em] text-luna-purple mb-3">{appliedTitle}</p>
        <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
          {appliedBody}
        </p>
      </article>
    </section>
  );
};
