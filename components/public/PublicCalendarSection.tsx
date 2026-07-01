import React, { useMemo } from 'react';
import { Language, LangCopy, getLang } from '../../constants';
import { DEFAULT_CYCLE_LENGTH } from '../../constants/appDefaults';
import { LunaRhythmCalendar } from '../LunaRhythmCalendar';
import { PUBLIC_PAGE_ART } from '../../utils/publicPageArt';
import { PUBLIC_BTN_PRIMARY, PUBLIC_BTN_PRIMARY_GLOW, PUBLIC_BTN_SECONDARY } from './publicButtonStyles';
import {
  PUBLIC_BODY,
  PUBLIC_CHIP,
  PUBLIC_EYEBROW,
  PUBLIC_H1,
  PUBLIC_LEAD,
  PUBLIC_PAGE_STACK,
  PUBLIC_SHELL,
  PUBLIC_SHELL_INNER,
  PUBLIC_SHELL_PAD,
} from './publicPageStyles';
import { PublicQuietArtBackground } from './PublicQuietArtBackground';
import { PublicHeroBlock } from './PublicHeroBlock';
import { buildPublicCalendarDemoLog, PUBLIC_CALENDAR_DEMO_CYCLE_DAY } from '../../utils/publicCalendarDemo';

interface PublicCalendarSectionProps {
  lang: Language;
  onSignIn: () => void;
  onSignUp: () => void;
  onBackHome: () => void;
}

const copyByLang: LangCopy<{
  eyebrow: string;
  title: string;
  subtitle: string;
  previewNote: string;
  previewBadge: string;
  enterMember: string;
  startTrial: string;
  memberSignIn: string;
}> = {
  en: {
    eyebrow: 'RHYTHM CALENDAR',
    title: 'Your cycle as an editorial calendar',
    subtitle:
      'Explore month and year views with watercolor art, daily notes, print, share, and calendar sync — a calm map of rhythm, check-ins, and Luna moments.',
    previewNote:
      'This is a live preview with sample data. Sign in to save your own journal, sync with Google Calendar, and connect check-ins to your real cycle.',
    previewBadge: 'Public preview',
    enterMember: 'Start free trial',
    startTrial: 'Create account',
    memberSignIn: 'Already a member? Sign in',
  },
  ru: {
    eyebrow: 'КАЛЕНДАРЬ РИТМА',
    title: 'Ваш цикл как editorial-календарь',
    subtitle:
      'Месяц и год с акварельными иллюстрациями, записями на каждый день, печатью, обменом и синхронизацией — спокойная карта ритма, check-in и моментов Luna.',
    previewNote:
      'Это живой preview с примерными данными. Войдите, чтобы сохранять свой журнал, синхронизировать Google Calendar и связать check-in с реальным циклом.',
    previewBadge: 'Публичный preview',
    enterMember: 'Начать пробный период',
    startTrial: 'Создать аккаунт',
    memberSignIn: 'Уже участник? Войти',
  },
  uk: {
    eyebrow: 'КАЛЕНДАР РИТМУ',
    title: 'Ваш цикл як editorial-календар',
    subtitle:
      'Місяць і рік з акварельними ілюстраціями, щоденними записами, друком, обміном і синхронізацією — спокійна карта ритму, check-in і моментів Luna.',
    previewNote:
      'Це живий preview із зразковими даними. Увійдіть, щоб зберігати свій журнал, синхронізувати Google Calendar і пов’язати check-in із реальним циклом.',
    previewBadge: 'Публічний preview',
    enterMember: 'Почати пробний період',
    startTrial: 'Створити акаунт',
    memberSignIn: 'Вже учасниця? Увійти',
  },
  es: {
    eyebrow: 'CALENDARIO DE RITMO',
    title: 'Tu ciclo como calendario editorial',
    subtitle:
      'Vistas mensual y anual con arte acuarela, notas diarias, impresión, compartir y sincronización — un mapa tranquilo de ritmo, check-ins y momentos Luna.',
    previewNote:
      'Esta es una vista previa en vivo con datos de ejemplo. Inicia sesión para guardar tu diario, sincronizar Google Calendar y conectar check-ins a tu ciclo real.',
    previewBadge: 'Vista previa pública',
    enterMember: 'Iniciar prueba gratis',
    startTrial: 'Crear cuenta',
    memberSignIn: '¿Ya eres miembro? Iniciar sesión',
  },
  fr: {
    eyebrow: 'CALENDRIER DU RYTHME',
    title: 'Votre cycle comme calendrier éditorial',
    subtitle:
      'Vues mois et année avec art aquarelle, notes quotidiennes, impression, partage et synchronisation — une carte calme du rythme, des check-ins et des moments Luna.',
    previewNote:
      'Aperçu en direct avec données d’exemple. Connectez-vous pour enregistrer votre journal, synchroniser Google Calendar et lier vos check-ins à votre cycle réel.',
    previewBadge: 'Aperçu public',
    enterMember: 'Essai gratuit',
    startTrial: 'Créer un compte',
    memberSignIn: 'Déjà membre ? Se connecter',
  },
  de: {
    eyebrow: 'RHYTHMUS-KALENDER',
    title: 'Dein Zyklus als Editorial-Kalender',
    subtitle:
      'Monats- und Jahresansicht mit Aquarell-Kunst, Tagesnotizen, Druck, Teilen und Sync — eine ruhige Karte aus Rhythmus, Check-ins und Luna-Momenten.',
    previewNote:
      'Live-Vorschau mit Beispieldaten. Melde dich an, um dein Journal zu speichern, Google Calendar zu syncen und Check-ins mit deinem echten Zyklus zu verbinden.',
    previewBadge: 'Öffentliche Vorschau',
    enterMember: 'Kostenlos testen',
    startTrial: 'Konto erstellen',
    memberSignIn: 'Schon Mitglied? Anmelden',
  },
  zh: {
    eyebrow: '节律日历',
    title: '把周期变成 editorial 日历',
    subtitle: '月视图与年视图、水彩插画、每日记录、打印、分享与同步——节律、check-in 与 Luna 时刻的平静地图。',
    previewNote: '这是带示例数据的实时预览。登录后可保存日记、同步 Google 日历，并将 check-in 连接到你的真实周期。',
    previewBadge: '公开预览',
    enterMember: '开始免费试用',
    startTrial: '创建账户',
    memberSignIn: '已是会员？登录',
  },
  ja: {
    eyebrow: 'リズムカレンダー',
    title: 'サイクルをエディトリアルカレンダーに',
    subtitle: '水彩イラスト、日次メモ、印刷・共有・同期付きの月/年ビュー — リズム、check-in、Lunaの瞬間の静かな地図。',
    previewNote: 'サンプルデータのライブプレビューです。サインインするとジャーナル保存、Googleカレンダー同期、実サイクル連携が使えます。',
    previewBadge: '公開プレビュー',
    enterMember: '無料トライアル',
    startTrial: 'アカウント作成',
    memberSignIn: 'メンバーですか？ サインイン',
  },
  pt: {
    eyebrow: 'CALENDÁRIO DE RITMO',
    title: 'Seu ciclo como calendário editorial',
    subtitle:
      'Visões mensal e anual com arte aquarela, notas diárias, impressão, compartilhamento e sync — um mapa calmo de ritmo, check-ins e momentos Luna.',
    previewNote:
      'Prévia ao vivo com dados de exemplo. Entre para salvar seu diário, sincronizar Google Calendar e conectar check-ins ao ciclo real.',
    previewBadge: 'Prévia pública',
    enterMember: 'Iniciar teste grátis',
    startTrial: 'Criar conta',
    memberSignIn: 'Já é membro? Entrar',
  },
  ar: {
    eyebrow: 'تقويم الإيقاع',
    title: 'دورتكِ كتقويم تحريري',
    subtitle:
      'عرض شهري وسنوي بفن ألوان مائية، ملاحظات يومية، طباعة ومشاركة ومزامنة — خريطة هادئة للإيقاع وتسجيلات check-in ولحظات Luna.',
    previewNote:
      'معاينة حية ببيانات نموذجية. سجّلي الدخول لحفظ يومياتكِ، مزامنة Google Calendar وربط check-in بدورتكِ الحقيقية.',
    previewBadge: 'معاينة عامة',
    enterMember: 'ابدئي التجربة المجانية',
    startTrial: 'إنشاء حساب',
    memberSignIn: 'عضوة بالفعل؟ سجّلي الدخول',
  },
  he: {
    eyebrow: 'לוח קצב',
    title: 'המחזור שלך כלוח עריכה',
    subtitle:
      'תצוגות חודש ושנה עם איורי מים עדינים, הערות יומיות, הדפסה, שיתוף וסנכרון — מפת קצב, צ׳ק-אין ורגעי Luna.',
    previewNote:
      'תצוגה מקדימה חיה עם נתוני דוגמה. התחברי כדי לשמור יומן, לסנכרן Google Calendar ולקשר צ׳ק-אין למחזור האמיתי.',
    previewBadge: 'תצוגה ציבורית',
    enterMember: 'התחילי ניסיון חינם',
    startTrial: 'יצירת חשבון',
    memberSignIn: 'כבר חברה? התחברי',
  },
};

export const PublicCalendarSection: React.FC<PublicCalendarSectionProps> = ({
  lang,
  onSignIn,
  onSignUp,
  onBackHome,
}) => {
  const copy = getLang(copyByLang, lang) || copyByLang.en;
  const demoLog = useMemo(() => buildPublicCalendarDemoLog(), []);

  return (
    <section className={`relative ${PUBLIC_PAGE_STACK}`}>
      <PublicQuietArtBackground page="calendar" />
      <div className={`${PUBLIC_SHELL} luna-page-voice luna-page-focus luna-focus-home relative z-10 ${PUBLIC_SHELL_PAD} space-y-8`}>
        <div className={`${PUBLIC_SHELL_INNER} space-y-8`}>
          <PublicHeroBlock
            eyebrow={copy.eyebrow}
            title={copy.title}
            subtitle={copy.subtitle}
            image={PUBLIC_PAGE_ART.calendar}
            imageAlt="Rhythm calendar"
            imagePosition="center 32%"
            chip={<span className={PUBLIC_CHIP}>{copy.previewBadge}</span>}
          >
            <p className={PUBLIC_BODY}>{copy.previewNote}</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button type="button" onClick={onSignUp} className={`${PUBLIC_BTN_PRIMARY} px-6 py-3 text-sm tracking-[0.08em]`}>
                <span className={PUBLIC_BTN_PRIMARY_GLOW} />
                <span className="relative z-10">{copy.enterMember}</span>
              </button>
              <button type="button" onClick={onSignIn} className={`${PUBLIC_BTN_SECONDARY} px-5 py-3 text-sm tracking-[0.08em] text-luna-purple`}>
                {copy.memberSignIn}
              </button>
            </div>
          </PublicHeroBlock>
        </div>

        <div className={PUBLIC_SHELL_INNER}>
          <LunaRhythmCalendar
            lang={lang}
            log={demoLog}
            currentCycleDay={PUBLIC_CALENDAR_DEMO_CYCLE_DAY}
            cycleLength={DEFAULT_CYCLE_LENGTH}
            onBack={onBackHome}
          />
        </div>
      </div>
    </section>
  );
};
