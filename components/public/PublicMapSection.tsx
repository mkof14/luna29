import React from 'react';
import { Heart, Sparkles, Zap } from 'lucide-react';
import { Language, LangCopy, getLang } from '../../constants';
import { PublicHeroBlock } from './PublicHeroBlock';
import { versionedStaticAsset } from '../../utils/staticAssetUrl';
import {
  PUBLIC_BODY,
  PUBLIC_CARD,
  PUBLIC_CARD_SOFT,
  PUBLIC_EYEBROW,
  PUBLIC_H2,
  PUBLIC_H3,
  PUBLIC_HERO_FRAME,
  PUBLIC_HERO_IMG,
  PUBLIC_ICON,
  PUBLIC_PAGE_STACK,
  PUBLIC_SHELL,
  PUBLIC_SHELL_INNER,
  PUBLIC_SHELL_PAD,
} from './publicPageStyles';

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

const cardIcons = [Zap, Heart, Sparkles] as const;
const cardAlts = ['', 'luna-vivid-card-alt-1', 'luna-vivid-card-alt-2'] as const;

export const PublicMapSection: React.FC<PublicMapSectionProps> = ({
  lang,
  eyebrow,
  mapCards,
  appliedTitle,
  appliedBody,
  bodyMapBackgroundStyle,
}) => {
  const lunaBalanceVisionByLang: LangCopy<{ title: string; subtitle: string; points: [string, string, string, string]; ending: string }> = {
    en: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance is a visual map of physiological rhythms. It shows how hormonal and biological markers interact and influence your state.', points: ['Energy', 'Mood', 'Focus', 'Recovery'], ending: 'Instead of isolated numbers, Luna29 builds a clear picture of inner dynamics over time.' },
    ru: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance — визуальная карта физиологических ритмов. Она показывает, как гормональные и биологические маркеры взаимодействуют и влияют на состояние.', points: ['Энергия', 'Настроение', 'Концентрация', 'Восстановление'], ending: 'Вместо отдельных чисел Luna29 формирует целостную картину внутренней динамики во времени.' },
    uk: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance — візуальна карта фізіологічних ритмів. Вона показує, як гормональні й біологічні маркери взаємодіють і впливають на стан.', points: ['Енергія', 'Настрій', 'Концентрація', 'Відновлення'], ending: 'Замість окремих чисел Luna29 формує цілісну картину внутрішньої динаміки у часі.' },
    es: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance es un mapa visual de ritmos fisiológicos. Muestra cómo los marcadores hormonales y biológicos interactúan e influyen en tu estado.', points: ['Energía', 'Ánimo', 'Enfoque', 'Recuperación'], ending: 'En lugar de números aislados, Luna29 construye una imagen clara de tu dinámica interna a lo largo del tiempo.' },
    fr: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance est une carte visuelle des rythmes physiologiques. Elle montre comment les marqueurs hormonaux et biologiques interagissent et influencent votre état.', points: ['Énergie', 'Humeur', 'Focus', 'Récupération'], ending: 'Au lieu de chiffres isolés, Luna29 construit une image claire de votre dynamique interne dans le temps.' },
    de: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance ist eine visuelle Karte physiologischer Rhythmen. Sie zeigt, wie hormonelle und biologische Marker interagieren und deinen Zustand beeinflussen.', points: ['Energie', 'Stimmung', 'Fokus', 'Regeneration'], ending: 'Statt isolierter Zahlen zeigt Luna29 ein klares Bild deiner inneren Dynamik über die Zeit.' },
    zh: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance 是一张生理节律可视化地图，展示激素与生物指标如何相互作用并影响你的状态。', points: ['能量', '情绪', '专注', '恢复'], ending: 'Luna29 不只给你零散数字，而是给出随时间变化的内在动态全景。' },
    ja: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance は生理リズムを可視化するマップです。ホルモンや生体指標の相互作用を示し、今の状態を読み解きます。', points: ['エネルギー', '気分', '集中', '回復'], ending: '単発の数値ではなく、時間軸での内的ダイナミクスを明確に可視化します。' },
    pt: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance e um mapa visual de ritmos fisiologicos. Mostra como marcadores hormonais e biologicos interagem e influenciam seu estado.', points: ['Energia', 'Humor', 'Foco', 'Recuperacao'], ending: 'Em vez de numeros isolados, a Luna29 constrói uma imagem clara da dinamica interna ao longo do tempo.' },
    ar: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance خريطة بصرية للإيقاعات الفسيولوجية. تُظهر كيف تتفاعل المؤشرات الهرمونية والبيولوجية وتؤثر على حالتكِ.', points: ['الطاقة', 'المزاج', 'التركيز', 'التعافي'], ending: 'بدلاً من أرقام معزولة، تبني Luna29 صورة واضحة للديناميكية الداخلية عبر الزمن.' },
    he: { title: 'Luna29 Balance', subtitle: 'Luna29 Balance היא מפת קצבים פיזיולוגיים. היא מראה איך סמנים הורמונליים וביולוגיים משפיעים על המצב שלך.', points: ['אנרגיה', 'מצב רוח', 'ריכוז', 'התאוששות'], ending: 'במקום מספרים בודדים, Luna29 בונה תמונה ברורה של הדינמיקה הפנימית לאורך זמן.' },
  };
  const innerWeatherByLang: LangCopy<{ title: string; intro: string; points: [string, string, string]; line1: string; line2: string; line3: string }> = {
    en: { title: 'Inner weather', intro: 'Short explanation:', points: ['energy shifts', 'mood shifts', 'focus shifts'], line1: 'But these changes are rarely random.', line2: 'Most often they are rhythms of physiology.', line3: 'Luna29 helps you see this movement as a map of inner weather.' },
    ru: { title: 'Внутренняя погода', intro: 'Короткое объяснение:', points: ['энергия меняется', 'настроение меняется', 'концентрация меняется'], line1: 'Но эти изменения редко случайны.', line2: 'Чаще это ритмы физиологии.', line3: 'Luna29 помогает увидеть эту динамику как карту внутренней погоды.' },
    uk: { title: 'Внутрішня погода', intro: 'Коротке пояснення:', points: ['енергія змінюється', 'настрій змінюється', 'фокус змінюється'], line1: 'Але ці зміни рідко випадкові.', line2: 'Найчастіше це ритми фізіології.', line3: 'Luna29 допомагає побачити цю динаміку як карту внутрішньої погоди.' },
    es: { title: 'Clima interno', intro: 'Explicación breve:', points: ['la energía cambia', 'el ánimo cambia', 'el foco cambia'], line1: 'Pero estos cambios rara vez son aleatorios.', line2: 'Con más frecuencia son ritmos fisiológicos.', line3: 'Luna29 te ayuda a ver esta dinámica como un mapa de clima interno.' },
    fr: { title: 'Météo intérieure', intro: 'Explication courte:', points: ['l energie change', 'l humeur change', 'la concentration change'], line1: 'Mais ces changements sont rarement aleatoires.', line2: 'Le plus souvent, ce sont des rythmes physiologiques.', line3: 'Luna29 vous aide a voir cette dynamique comme une carte de meteo interieure.' },
    de: { title: 'Inneres Wetter', intro: 'Kurze Erklärung:', points: ['Energie verändert sich', 'Stimmung verändert sich', 'Fokus verändert sich'], line1: 'Diese Veränderungen sind jedoch selten zufällig.', line2: 'Meist sind es physiologische Rhythmen.', line3: 'Luna29 hilft dir, diese Dynamik als innere Wetterkarte zu sehen.' },
    zh: { title: '内在天气', intro: '简短说明：', points: ['能量会变化', '情绪会变化', '专注会变化'], line1: '但这些变化很少是随机的。', line2: '更常见的是生理节律在起作用。', line3: 'Luna29 帮助你把这种动态看作一张内在天气地图。' },
    ja: { title: 'インナーウェザー', intro: '短い説明：', points: ['エネルギーは変わる', '気分は変わる', '集中は変わる'], line1: 'しかし、これらの変化は偶然ではありません。', line2: '多くは生理的リズムです。', line3: 'Luna29 はこの動きを「内なる天気図」として見える化します。' },
    pt: { title: 'Clima interno', intro: 'Explicação curta:', points: ['a energia muda', 'o humor muda', 'a concentração muda'], line1: 'Mas essas mudanças raramente são aleatórias.', line2: 'Na maioria das vezes, são ritmos da fisiologia.', line3: 'A Luna29 ajuda você a ver essa dinâmica como um mapa do clima interno.' },
    ar: { title: 'الطقس الداخلي', intro: 'شرح مختصر:', points: ['تغيّرات الطاقة', 'تغيّرات المزاج', 'تغيّرات التركيز'], line1: 'لكن هذه التغييرات نادراً ما تكون عشوائية.', line2: 'في أغلب الأحيان هي إيقاعات الفسيولوجيا.', line3: 'Luna29 تساعدكِ على رؤية هذا الحراك كخريطة للطقس الداخلي.' },
    he: { title: 'מזג פנים פנימי', intro: 'הסבר קצר:', points: ['שינויי אנרגיה', 'שינויי מצב רוח', 'שינויי ריכוז'], line1: 'אבל השינויים האלה לעיתים רחוקות אקראיים.', line2: 'לרוב מדובר בקצבי פיזיולוגיה.', line3: 'Luna29 עוזרת לראות את התנועה הזו כמפת מזג פנים פנימי.' },
  };
  const mapCoreLabelByLang: LangCopy<string> = {
    en: 'Luna29 Balance Core',
    ru: 'Ядро Luna29 Balance',
    uk: 'Ядро Luna29 Balance',
    es: 'Nucleo De Luna29 Balance',
    fr: 'Noyau Luna29 Balance',
    de: 'Luna29 Balance Kern',
    zh: 'Luna29 Balance 核心',
    ja: 'Luna29 Balance コア',
    pt: 'Nucleo Luna29 Balance',
    ar: 'نواة Luna29 Balance',
    he: 'ליבת Luna29 Balance',
  };
  const lunaBalanceVision = getLang(lunaBalanceVisionByLang, lang) || lunaBalanceVisionByLang.en;
  const innerWeather = getLang(innerWeatherByLang, lang) || innerWeatherByLang.en;
  const coreLabel = getLang(mapCoreLabelByLang, lang) || mapCoreLabelByLang.en;
  const cards = [
    { title: lunaBalanceVision.points[0], text: mapCards.weatherText },
    { title: lunaBalanceVision.points[1], text: mapCards.memoryText },
    { title: lunaBalanceVision.points[2], text: mapCards.languageText },
  ];

  return (
    <section className={PUBLIC_PAGE_STACK}>
      <section className={`${PUBLIC_SHELL} luna-page-bodymap luna-page-focus luna-focus-bodymap ${PUBLIC_SHELL_PAD}`}>
        <div className={`${PUBLIC_SHELL_INNER} space-y-8`}>
          <PublicHeroBlock
            eyebrow={eyebrow}
            title={lunaBalanceVision.title}
            subtitle={lunaBalanceVision.subtitle}
            image={versionedStaticAsset('/images/f5.webp')}
            imageAlt="Body map visual"
            imagePosition="50% 44%"
            caption={lunaBalanceVision.ending}
          />

          <article className={`${PUBLIC_CARD_SOFT} space-y-4`}>
            <p className={PUBLIC_H3}>{coreLabel}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {lunaBalanceVision.points.map((point, index) => (
                <div key={point} className={`${PUBLIC_CARD} text-center py-4 ${index % 2 === 1 ? 'luna-vivid-card-alt-3' : ''}`}>
                  <p className="text-sm font-black uppercase tracking-[0.1em] text-slate-800 dark:text-slate-100">{point}</p>
                </div>
              ))}
            </div>
            <p className={PUBLIC_BODY}>{lunaBalanceVision.ending}</p>
          </article>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {cards.map((item, index) => {
              const Icon = cardIcons[index] ?? Sparkles;
              return (
                <article key={item.title} className={`${PUBLIC_CARD} ${cardAlts[index] ?? ''}`}>
                  <span className={PUBLIC_ICON}>
                    <Icon size={16} />
                  </span>
                  <h3 className={`mt-3 ${PUBLIC_H3}`}>{item.title}</h3>
                  <p className={`mt-2 ${PUBLIC_BODY}`}>{item.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={`${PUBLIC_SHELL} luna-page-reports ${PUBLIC_SHELL_PAD}`}>
        <article className={`${PUBLIC_SHELL_INNER} ${PUBLIC_CARD_SOFT} space-y-3`}>
          <p className={PUBLIC_H3}>{innerWeather.title}</p>
          <p className={PUBLIC_BODY}>{innerWeather.intro}</p>
          <ul className="space-y-1">
            {innerWeather.points.map((point) => (
              <li key={point} className={PUBLIC_BODY}>
                • {point}
              </li>
            ))}
          </ul>
          <p className={PUBLIC_BODY}>
            {innerWeather.line1}
            <br />
            {innerWeather.line2}
          </p>
          <p className={PUBLIC_BODY}>{innerWeather.line3}</p>
        </article>
      </section>

      <section className={`${PUBLIC_SHELL} luna-page-support ${PUBLIC_SHELL_PAD}`}>
        <article className={`${PUBLIC_SHELL_INNER} ${PUBLIC_CARD} luna-vivid-card-alt-4 space-y-2`}>
          <p className={PUBLIC_H3}>{appliedTitle}</p>
          <p className={PUBLIC_BODY}>{appliedBody}</p>
        </article>
      </section>
    </section>
  );
};
