import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Language, getLang } from '../constants';
import { MemberIconBackButton } from './member/MemberIconBackButton';
import { MemberPageIntro } from './member/MemberPageIntro';
import { LunaPageContentSection } from './shared/LunaPageContentSection';
import { getLunaPageTheme } from '../utils/lunaPageThemes';
import { billingService } from '../services/billingService';
import { conversionEvents } from '../utils/conversionEvents';

interface InsightsPaywallViewProps {
  lang: Language;
  onBack: () => void;
}

export const InsightsPaywallView: React.FC<InsightsPaywallViewProps> = ({ lang, onBack }) => {
  const copyByLang: Partial<Record<
    Language,
    {
      top: string;
      lineA: string;
      lineB: string;
      exampleA: string;
      exampleB: string;
      sectionA: string;
      sectionB: string;
      sectionC: string;
      annual: string;
      monthly: string;
      cta: string;
      trial: string;
      cancel: string;
      back: string;
      unavailable: string;
      loading: string;
    }
  >> = {
    en: {
      top: 'Luna29 is beginning to understand your rhythm.',
      lineA: 'Unlock deeper insights about your body,',
      lineB: 'energy, and emotional patterns.',
      exampleA: 'Your energy often drops two days before your cycle begins.',
      exampleB: 'Short sleep also makes the next day heavier.',
      sectionA: 'Personal patterns',
      sectionB: 'Monthly notes',
      sectionC: 'Deeper voice insights',
      annual: '$89 per year',
      monthly: 'or $12.99 monthly',
      cta: 'Unlock deeper insights',
      trial: '7-day free trial',
      cancel: 'Cancel anytime',
      back: 'Back',
      unavailable: 'Billing is temporarily unavailable. Try again shortly.',
      loading: 'Checking billing...',
    },
    ru: {
      top: 'Luna29 начинает понимать ваш ритм.',
      lineA: 'Откройте глубокие инсайты о теле,',
      lineB: 'энергии и эмоциональных паттернах.',
      exampleA: 'Энергия часто снижается за два дня до начала цикла.',
      exampleB: 'Короткий сон также делает следующий день тяжелее.',
      sectionA: 'Личные паттерны',
      sectionB: 'Месячные заметки',
      sectionC: 'Глубокие голосовые инсайты',
      annual: '$89 в год',
      monthly: 'или $12.99 в месяц',
      cta: 'Открыть глубокие инсайты',
      trial: '7 дней бесплатного пробного периода',
      cancel: 'Можно отменить в любое время',
      back: 'Назад',
      unavailable: 'Оплата временно недоступна. Попробуйте чуть позже.',
      loading: 'Проверяем оплату...',
    },
    uk: {
      top: 'Luna29 починає розуміти ваш ритм.',
      lineA: 'Відкрийте глибші інсайти про тіло,',
      lineB: 'енергію та емоційні патерни.',
      exampleA: 'Енергія часто знижується за два дні до початку циклу.',
      exampleB: 'Короткий сон також робить наступний день важчим.',
      sectionA: 'Персональні патерни',
      sectionB: 'Місячні нотатки',
      sectionC: 'Глибші голосові інсайти',
      annual: '$89 на рік',
      monthly: 'або $12.99 щомісяця',
      cta: 'Відкрити глибші інсайти',
      trial: '7-денний безкоштовний пробний період',
      cancel: 'Можна скасувати будь-коли',
      back: 'Назад',
      unavailable: 'Оплата тимчасово недоступна. Спробуйте трохи пізніше.',
      loading: 'Перевіряємо оплату...',
    },
    es: {
      top: 'Luna29 está empezando a entender tu ritmo.',
      lineA: 'Desbloquea insights más profundos sobre tu cuerpo,',
      lineB: 'energía y patrones emocionales.',
      exampleA: 'Tu energía suele bajar dos días antes de que empiece el ciclo.',
      exampleB: 'Dormir poco también hace más pesado el día siguiente.',
      sectionA: 'Patrones personales',
      sectionB: 'Notas mensuales',
      sectionC: 'Insights de voz más profundos',
      annual: '$89 al año',
      monthly: 'o $12.99 al mes',
      cta: 'Desbloquear insights más profundos',
      trial: 'Prueba gratis de 7 días',
      cancel: 'Cancela cuando quieras',
      back: 'Atrás',
      unavailable: 'La facturación no está disponible ahora. Inténtalo en breve.',
      loading: 'Comprobando facturación...',
    },
    fr: {
      top: 'Luna29 commence à comprendre votre rythme.',
      lineA: 'Débloquez des insights plus profonds sur votre corps,',
      lineB: 'votre énergie et vos schémas émotionnels.',
      exampleA: 'Votre énergie baisse souvent deux jours avant le début du cycle.',
      exampleB: 'Un sommeil court rend aussi le lendemain plus lourd.',
      sectionA: 'Schémas personnels',
      sectionB: 'Notes mensuelles',
      sectionC: 'Insights vocaux plus profonds',
      annual: '$89 par an',
      monthly: 'ou $12.99 par mois',
      cta: 'Débloquer des insights plus profonds',
      trial: 'Essai gratuit de 7 jours',
      cancel: 'Annulez à tout moment',
      back: 'Retour',
      unavailable: 'La facturation est temporairement indisponible. Réessayez bientôt.',
      loading: 'Vérification de la facturation...',
    },
    de: {
      top: 'Luna29 beginnt, deinen Rhythmus zu verstehen.',
      lineA: 'Schalte tiefere Insights über deinen Körper frei,',
      lineB: 'Energie und emotionale Muster.',
      exampleA: 'Deine Energie sinkt oft zwei Tage vor Zyklusbeginn.',
      exampleB: 'Kurzer Schlaf macht den nächsten Tag ebenfalls schwerer.',
      sectionA: 'Persönliche Muster',
      sectionB: 'Monatsnotizen',
      sectionC: 'Tiefere Voice-Insights',
      annual: '$89 pro Jahr',
      monthly: 'oder $12.99 monatlich',
      cta: 'Tiefere Insights freischalten',
      trial: '7 Tage kostenlos testen',
      cancel: 'Jederzeit kündbar',
      back: 'Zurück',
      unavailable: 'Abrechnung ist vorübergehend nicht verfügbar. Bitte bald erneut versuchen.',
      loading: 'Abrechnung wird geprüft...',
    },
    zh: {
      top: 'Luna29 开始理解你的节律。',
      lineA: '解锁关于身体的更深洞察，',
      lineB: '精力与情绪模式。',
      exampleA: '精力常在周期开始前两天下降。',
      exampleB: '睡眠不足也会让第二天更沉重。',
      sectionA: '个人模式',
      sectionB: '月度笔记',
      sectionC: '更深的语音洞察',
      annual: '每年 $89',
      monthly: '或每月 $12.99',
      cta: '解锁更深洞察',
      trial: '7 天免费试用',
      cancel: '随时可取消',
      back: '返回',
      unavailable: '计费暂时不可用。请稍后再试。',
      loading: '正在检查计费...',
    },
    ja: {
      top: 'Luna29 はあなたのリズムを理解し始めています。',
      lineA: '体についてのより深いインサイトを解放し、',
      lineB: 'エネルギーと感情のパターンへ。',
      exampleA: 'エネルギーは周期の始まりの2日前に下がりがちです。',
      exampleB: '短い睡眠も翌日をより重く感じさせます。',
      sectionA: '個人のパターン',
      sectionB: '月次ノート',
      sectionC: 'より深いボイスインサイト',
      annual: '年額 $89',
      monthly: 'または月額 $12.99',
      cta: 'より深いインサイトを解放',
      trial: '7日間無料トライアル',
      cancel: 'いつでもキャンセル可',
      back: '戻る',
      unavailable: '請求は一時的に利用できません。しばらくして再試行してください。',
      loading: '請求を確認中...',
    },
    pt: {
      top: 'A Luna29 está começando a entender seu ritmo.',
      lineA: 'Desbloqueie insights mais profundos sobre seu corpo,',
      lineB: 'energia e padrões emocionais.',
      exampleA: 'Sua energia costuma cair dois dias antes do ciclo começar.',
      exampleB: 'Sono curto também deixa o dia seguinte mais pesado.',
      sectionA: 'Padrões pessoais',
      sectionB: 'Notas mensais',
      sectionC: 'Insights de voz mais profundos',
      annual: '$89 por ano',
      monthly: 'ou $12.99 por mês',
      cta: 'Desbloquear insights mais profundos',
      trial: 'Teste grátis de 7 dias',
      cancel: 'Cancele quando quiser',
      back: 'Voltar',
      unavailable: 'A cobrança está temporariamente indisponível. Tente em breve.',
      loading: 'Verificando cobrança...',
    },
    ar: {
      top: 'Luna29 بدأت تفهم إيقاعكِ.',
      lineA: 'افتحي رؤى أعمق عن جسمكِ،',
      lineB: 'طاقتكِ وأنماطكِ العاطفية.',
      exampleA: 'طاقتكِ غالباً تنخفض قبل يومين من بدء دورتكِ.',
      exampleB: 'النوم القصير يجعل اليوم التالي أثقل أيضاً.',
      sectionA: 'أنماط شخصية',
      sectionB: 'ملاحظات شهرية',
      sectionC: 'رؤى صوتية أعمق',
      annual: '$89 سنوياً',
      monthly: 'أو $12.99 شهرياً',
      cta: 'افتحي رؤى أعمق',
      trial: 'تجربة مجانية 7 أيام',
      cancel: 'إلغاء في أي وقت',
      back: 'رجوع',
      unavailable: 'الفوترة غير متاحة بعد.',
      loading: 'جارٍ التحقق من الفوترة...',
    },
    he: {
      top: 'Luna29 מתחילה להבין את הקצב שלך.',
      lineA: 'פתחי תובנות עמוקות יותר על הגוף שלך,',
      lineB: 'האנרגיה והדפוסים הרגשיים.',
      exampleA: 'האנרגיה שלך לעיתים יורדת יומיים לפני תחילת המחזור.',
      exampleB: 'שינה קצרה גם הופכת את היום הבא לכבד יותר.',
      sectionA: 'דפוסים אישיים',
      sectionB: 'הערות חודשיות',
      sectionC: 'תובנות קול עמוקות יותר',
      annual: '$89 לשנה',
      monthly: 'או $12.99 לחודש',
      cta: 'פתחי תובנות עמוקות יותר',
      trial: 'ניסיון חינם ל-7 ימים',
      cancel: 'ביטול בכל עת',
      back: 'חזרה',
      unavailable: 'חיוב עדיין לא זמין.',
      loading: 'בודקת חיוב...',
    },
  };
  const defaultCopy = copyByLang.en!;
  const copy = getLang(copyByLang, lang) || defaultCopy;

  const [billingEnabled, setBillingEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedback, setFeedback] = useState<string>('');
  const [billingPeriod, setBillingPeriod] = useState<'month' | 'year'>('year');

  useEffect(() => {
    let mounted = true;
    conversionEvents.paywallViewed('insights');
    billingService
      .getStatus()
      .then((payload) => {
        if (!mounted) return;
        setBillingEnabled(Boolean(payload.enabled));
      })
      .catch(() => {
        if (!mounted) return;
        setBillingEnabled(false);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const sections = useMemo(() => [copy.sectionA, copy.sectionB, copy.sectionC], [copy.sectionA, copy.sectionB, copy.sectionC]);

  const handleUnlock = async () => {
    if (!billingEnabled) {
      setFeedback(copy.unavailable);
      return;
    }
    try {
      conversionEvents.checkoutStarted(billingPeriod);
      const payload = await billingService.createCheckoutSession(billingPeriod);
      conversionEvents.trialStarted();
      if (payload.url) window.location.href = payload.url;
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : copy.unavailable);
    }
  };

  return (
    <>
      <MemberIconBackButton lang={lang} onClick={onBack} className="mb-0" />
      <MemberPageIntro lang={lang} page="insights_paywall" tab="insights_paywall" />

      <LunaPageContentSection themeClass={getLunaPageTheme('insights_paywall').shellClass}>
        <div className="space-y-2">
          <p className="text-base font-medium text-slate-700 dark:text-slate-200">{copy.lineA} {copy.lineB}</p>
        </div>

        <article className="rounded-2xl bg-slate-100/75 dark:bg-slate-800/60 p-5 space-y-2">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Insights are built from your check-ins and reflections — never sample health information.
          </p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Unlock deeper pattern discovery after you subscribe.
          </p>
        </article>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {sections.map((section) => (
            <article key={section} className="rounded-2xl border border-slate-200/80 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/55 p-4">
              <div className="inline-flex items-center gap-2 text-luna-purple">
                <Sparkles size={13} />
                <p className="text-sm font-black">{section}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="insights-period-year"
            onClick={() => setBillingPeriod('year')}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
              billingPeriod === 'year'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            {copy.annual}
          </button>
          <button
            type="button"
            data-testid="insights-period-month"
            onClick={() => setBillingPeriod('month')}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
              billingPeriod === 'month'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            {copy.monthly}
          </button>
        </div>

        <div className="space-y-3">
          <button
            data-testid="insights-unlock"
            onClick={handleUnlock}
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 rounded-full bg-luna-purple text-white text-[11px] font-black uppercase tracking-[0.16em] hover:brightness-105 transition-all disabled:opacity-45"
          >
            {copy.cta}
          </button>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{copy.trial}</p>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{copy.cancel}</p>
          {loading && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{copy.loading}</p>}
          {feedback && <p className="text-xs font-semibold text-rose-500 dark:text-rose-300">{feedback}</p>}
        </div>
      </LunaPageContentSection>
    </>
  );
};
