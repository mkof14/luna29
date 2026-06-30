import React from 'react';
import { HelpCircle, MessageCircle, Shield } from 'lucide-react';
import { Language, LangCopy, TRANSLATIONS, getLang } from '../../constants';
import { PUBLIC_BTN_PRIMARY, PUBLIC_BTN_PRIMARY_GLOW, PUBLIC_BTN_SECONDARY } from './publicButtonStyles';
import { PublicHeroBlock } from './PublicHeroBlock';
import {
  PUBLIC_BODY,
  PUBLIC_CARD,
  PUBLIC_CARD_SOFT,
  PUBLIC_EYEBROW,
  PUBLIC_H1,
  PUBLIC_H3,
  PUBLIC_HERO_FRAME,
  PUBLIC_HERO_IMG,
  PUBLIC_ICON,
  PUBLIC_PAGE_STACK,
  PUBLIC_SHELL,
  PUBLIC_SHELL_INNER,
  PUBLIC_SHELL_PAD,
} from './publicPageStyles';

interface PublicBridgeSectionProps {
  onSignIn: () => void;
  lang: Language;
}

export const PublicBridgeSection: React.FC<PublicBridgeSectionProps> = ({ onSignIn, lang }) => {
  const bridgePublicByLang: LangCopy<{ eyebrow: string; title: string; problemTitle: string; problemBody: string; helpsTitle: string; helps: [string, string, string]; unique: string; memberLinkTitle: string; memberLinkBody: string }> = {
    en: { eyebrow: 'THE BRIDGE', title: 'Say your state clearly', problemTitle: 'Problem', problemBody: 'Sometimes it is hard to explain your state to a partner or even to yourself.', helpsTitle: 'Bridge helps', helps: ['formulate your state', 'explain it calmly', 'preserve respect in conversation'], unique: 'This is one of Luna29’s unique functions.', memberLinkTitle: 'Connected to member logic', memberLinkBody: 'In the member zone, The Bridge runs the guided 3-question flow and forms a calm note you can keep or share.' },
    ru: { eyebrow: 'МОСТ', title: 'Ясно выразить свое состояние', problemTitle: 'Проблема', problemBody: 'Иногда трудно объяснить партнёру или себе своё состояние.', helpsTitle: 'Мост помогает', helps: ['сформулировать состояние', 'объяснить его спокойно', 'сохранить уважение в разговоре'], unique: 'Это одна из уникальных функций Luna29.', memberLinkTitle: 'Связано с логикой зоны участника', memberLinkBody: 'В зоне участника Мост использует поток из 3 вопросов и формирует спокойное сообщение-заметку, которое можно сохранить или отправить.' },
    uk: { eyebrow: 'МІСТ', title: 'Чітко сформулювати свій стан', problemTitle: 'Проблема', problemBody: 'Іноді важко пояснити партнеру або собі свій стан.', helpsTitle: 'Міст допомагає', helps: ['сформулювати стан', 'пояснити його спокійно', 'зберегти повагу в розмові'], unique: 'Це одна з унікальних функцій Luna29.', memberLinkTitle: 'Повʼязано з логікою зони учасника', memberLinkBody: 'У зоні учасника Міст запускає сценарій із 3 питань та формує спокійне повідомлення-нотатку, яке можна зберегти або надіслати.' },
    es: { eyebrow: 'PUENTE', title: 'Expresa tu estado con claridad', problemTitle: 'Problema', problemBody: 'A veces es difícil explicar tu estado a tu pareja o incluso a ti misma.', helpsTitle: 'El puente ayuda a', helps: ['formular tu estado', 'explicarlo con calma', 'preservar el respeto en la conversación'], unique: 'Esta es una de las funciones únicas de Luna29.', memberLinkTitle: 'Conectado con la lógica de la zona de miembros', memberLinkBody: 'En la zona de miembros, el Puente ejecuta el flujo guiado de 3 preguntas y forma un mensaje de reflexión calmado para guardar o compartir.' },
    fr: { eyebrow: 'LE PONT', title: 'Exprimer votre état avec clarté', problemTitle: 'Problème', problemBody: "Parfois, il est difficile d'expliquer votre état à votre partenaire ou même à vous-même.", helpsTitle: 'Le Pont aide à', helps: ['formuler votre état', 'l’expliquer calmement', 'préserver le respect dans la conversation'], unique: 'C’est une des fonctions uniques de Luna29.', memberLinkTitle: 'Connecté à la logique de la zone membre', memberLinkBody: 'Dans la zone membre, le Pont lance le flux guidé en 3 questions et crée un message de réflexion calme à conserver ou partager.' },
    de: { eyebrow: 'DIE BRÜCKE', title: 'Den eigenen Zustand klar ausdrücken', problemTitle: 'Problem', problemBody: 'Manchmal ist es schwer, den eigenen Zustand der Partnerperson oder sich selbst zu erklären.', helpsTitle: 'Die Brücke hilft dabei', helps: ['den Zustand zu formulieren', 'ihn ruhig zu erklären', 'Respekt im Gespräch zu bewahren'], unique: 'Das ist eine der einzigartigen Funktionen von Luna29.', memberLinkTitle: 'Mit der Logik der Mitgliederzone verbunden', memberLinkBody: 'In der Mitgliederzone läuft die Brücke durch den geführten 3-Fragen-Flow und erstellt eine ruhige Reflexionsnachricht zum Behalten oder Teilen.' },
    zh: { eyebrow: '连接桥', title: '清晰表达你的状态', problemTitle: '问题', problemBody: '有时很难向伴侣，甚至向自己解释当前状态。', helpsTitle: '连接桥帮你', helps: ['组织你的状态表达', '平静地说明感受', '在对话中保留尊重'], unique: '这是 Luna29 的独特功能之一。', memberLinkTitle: '与会员区逻辑联动', memberLinkBody: '在会员区，连接桥会运行 3 个引导问题流程，并生成可保存或分享的平静反思信息。' },
    ja: { eyebrow: 'ブリッジ', title: '状態を明確に伝える', problemTitle: '課題', problemBody: 'ときに、自分の状態をパートナーや自分自身に説明するのは難しいです。', helpsTitle: 'ブリッジは次を助けます', helps: ['状態を言語化する', '落ち着いて説明する', '会話の尊重を保つ'], unique: 'これは Luna29 のユニークな機能の一つです。', memberLinkTitle: 'メンバーゾーンのロジックと接続', memberLinkBody: 'メンバーゾーンではブリッジが3つの質問フローを実行し、保存・共有できる落ち着いたリフレクション文を生成します。' },
    pt: { eyebrow: 'A PONTE', title: 'Expresse seu estado com clareza', problemTitle: 'Problema', problemBody: 'Às vezes é difícil explicar seu estado ao parceiro ou até para si mesma.', helpsTitle: 'A Ponte ajuda a', helps: ['formular seu estado', 'explicar com calma', 'preservar o respeito na conversa'], unique: 'Esta é uma das funções únicas da Luna29.', memberLinkTitle: 'Conectado à lógica da zona de membros', memberLinkBody: 'Na área de membros, a Ponte executa o fluxo guiado de 3 perguntas e forma uma mensagem de reflexão calma para manter ou compartilhar.' },
    ar: { eyebrow: 'الجسر', title: 'عبّري عن حالتك بوضوح', problemTitle: 'المشكلة', problemBody: 'أحياناً يصعب شرح حالتك للشريك أو حتى لنفسك.', helpsTitle: 'الجسر يساعدك على', helps: ['صياغة حالتك', 'شرحها بهدوء', 'الحفاظ على الاحترام في الحوار'], unique: 'هذه واحدة من وظائف Luna29 الفريدة.', memberLinkTitle: 'مرتبط بمنطقة العضو', memberLinkBody: 'في منطقة العضو، يشغّل الجسر تدفقاً موجهاً من 3 أسئلة ويُكوّن رسالة هادئة يمكنك الاحتفاظ بها أو مشاركتها.' },
    he: { eyebrow: 'הגשר', title: 'לבטא את המצב שלך בבהירות', problemTitle: 'הבעיה', problemBody: 'לפעמים קשה להסביר את המצב שלך לבן/בת הזוג או אפילו לעצמך.', helpsTitle: 'הגשר עוזר', helps: ['לנסח את המצב', 'להסביר אותו בשקט', 'לשמור על כבוד בשיחה'], unique: 'זו אחת מפונקציות הייחוד של Luna29.', memberLinkTitle: 'מחובר ללוגיקת אזור החברים', memberLinkBody: 'באזור החברים, הגשר מפעיל תהליך מודרך של 3 שאלות ויוצר הודעה רגועה לשמירה או שיתוף.' },
  };
  const partnerFaqTeaserByLang: LangCopy<{ fullCta: string }> = {
    en: { fullCta: 'Sign in for the full Partner FAQ in the member zone' },
    ru: { fullCta: 'Войдите, чтобы открыть полный FAQ для партнёров в зоне участника' },
    uk: { fullCta: 'Увійдіть, щоб відкрити повний FAQ для партнера в зоні учасника' },
    es: { fullCta: 'Inicia sesión para ver el FAQ completo para parejas en la zona de miembro' },
    fr: { fullCta: 'Connectez-vous pour le FAQ partenaire complet dans la zone membre' },
    de: { fullCta: 'Anmelden für das vollständige Partner-FAQ in der Mitgliederzone' },
    zh: { fullCta: '登录后在会员区查看完整伴侣 FAQ' },
    ja: { fullCta: 'サインインしてメンバーゾーンのパートナーFAQ全文を見る' },
    pt: { fullCta: 'Entre para ver o FAQ completo para parceiros na zona de membro' },
    ar: { fullCta: 'سجّلي الدخول لقراءة الأسئلة الشائعة الكاملة للشريك في منطقة العضو' },
    he: { fullCta: 'התחברי ל-FAQ המלא לבן/בת הזוג באזור החברים' },
  };
  const partnerFaqPreviewByLang: Partial<Record<Language, { items: [{ q: string; a: string }, { q: string; a: string }] }>> = {
    ar: {
      items: [
        { q: 'ما هو Luna29؟', a: 'Luna29 نظام دعم للعافية يربط الإيقاعات الفسيولوجية لمساعدتك على فهم حالتك الداخلية. إنه مرآة، وليس مدرباً.' },
        { q: 'كيف أدعمها؟', a: 'أفضل دعم هو الفهم. عندما تشارك «رسالة للشريك»، فهي دعوة للتزامن مع طاقتها الحالية — وليست طلب حل.' },
      ],
    },
    he: {
      items: [
        { q: 'מה זה Luna29?', a: 'Luna29 היא מערכת תמיכה ברווחה שממפה קצבי פיזיולוגיה כדי לעזור להבין את המצב הפנימי. זו מראה, לא מאמנת.' },
        { q: 'איך אני יכול/ה לתמוך?', a: 'התמיכה הטובה ביותר היא הבנה. כשהיא משתפת «הודעה לבן/בת הזוג», זו הזמנה להתאים את עצמך לקיבולת הנוכחית שלה — לא בקשה לפתרון.' },
      ],
    },
  };
  const actionByLang: LangCopy<{ enterMember: string; memberSignIn: string }> = {
    en: { enterMember: 'Enter Member Zone', memberSignIn: 'Already a member? Sign in' },
    ru: { enterMember: 'Перейти в зону участника', memberSignIn: 'Уже участник? Войти' },
    uk: { enterMember: 'Увійти в зону учасника', memberSignIn: 'Вже учасниця? Увійти' },
    es: { enterMember: 'Entrar a zona de miembro', memberSignIn: '¿Ya eres miembro? Iniciar sesión' },
    fr: { enterMember: 'Entrer dans la zone membre', memberSignIn: 'Déjà membre ? Se connecter' },
    de: { enterMember: 'Zur Mitgliederzone', memberSignIn: 'Schon Mitglied? Anmelden' },
    zh: { enterMember: '进入会员区', memberSignIn: '已有会员？登录' },
    ja: { enterMember: 'メンバーゾーンへ', memberSignIn: 'メンバーですか？ サインイン' },
    pt: { enterMember: 'Entrar na zona de membro', memberSignIn: 'Ja e membro? Entrar' },
    ar: { enterMember: 'الدخول إلى منطقة العضو', memberSignIn: 'عضوة بالفعل؟ تسجيل الدخول' },
    he: { enterMember: 'כניסה לאזור החברים', memberSignIn: 'כבר חברה? התחברות' },
  };
  const bridgePublic = getLang(bridgePublicByLang, lang) || bridgePublicByLang.en;
  const actions = getLang(actionByLang, lang) || actionByLang.en;
  const partnerFaq = TRANSLATIONS[lang].bridge.partnerFAQ;
  const faqTeaser = getLang(partnerFaqTeaserByLang, lang) || partnerFaqTeaserByLang.en;
  const faqPreview = getLang(partnerFaqPreviewByLang, lang);
  const faqPreviewItems = faqPreview?.items ?? (partnerFaq.items.slice(0, 2) as [{ q: string; a: string }, { q: string; a: string }]);

  return (
    <section className={PUBLIC_PAGE_STACK}>
      <section className={`${PUBLIC_SHELL} luna-page-bridge luna-page-focus luna-focus-bodymap ${PUBLIC_SHELL_PAD}`}>
        <div className={`${PUBLIC_SHELL_INNER} space-y-6`}>
          <PublicHeroBlock
            eyebrow={bridgePublic.eyebrow}
            title={bridgePublic.title}
            image="/images/heroes/bridge.webp"
            imageAlt="The Bridge"
            imagePosition="50% 38%"
          />

          <article className={`${PUBLIC_CARD_SOFT} space-y-2`}>
            <p className={PUBLIC_H3}>{bridgePublic.problemTitle}</p>
            <p className={PUBLIC_BODY}>{bridgePublic.problemBody}</p>
          </article>

          <article className={`${PUBLIC_CARD} luna-vivid-card-alt-1 space-y-3`}>
            <div className="flex items-center gap-2">
              <span className={PUBLIC_ICON}>
                <MessageCircle size={16} />
              </span>
              <p className={PUBLIC_H3}>{bridgePublic.helpsTitle}</p>
            </div>
            <ul className="space-y-2">
              {bridgePublic.helps.map((item) => (
                <li key={item} className={PUBLIC_BODY}>
                  • {item}
                </li>
              ))}
            </ul>
            <p className={PUBLIC_BODY}>{bridgePublic.unique}</p>
          </article>

          <article className={`${PUBLIC_CARD} luna-vivid-card-alt-2 space-y-2`}>
            <div className="flex items-center gap-2">
              <span className={PUBLIC_ICON}>
                <Shield size={16} />
              </span>
              <p className={PUBLIC_H3}>{bridgePublic.memberLinkTitle}</p>
            </div>
            <p className={PUBLIC_BODY}>{bridgePublic.memberLinkBody}</p>
          </article>

          <article className={`${PUBLIC_CARD_SOFT} space-y-4`}>
            <div className="flex items-center gap-2">
              <span className={PUBLIC_ICON}>
                <HelpCircle size={16} />
              </span>
              <div>
                <p className={PUBLIC_H3}>{partnerFaq.title}</p>
                <p className={`${PUBLIC_BODY} text-sm opacity-80`}>{partnerFaq.subtitle}</p>
              </div>
            </div>
            <div className="space-y-3">
              {faqPreviewItems.map((item) => (
                <div key={item.q} className="space-y-1">
                  <p className={`${PUBLIC_H3} text-sm`}>{item.q}</p>
                  <p className={PUBLIC_BODY}>{item.a}</p>
                </div>
              ))}
            </div>
            <button type="button" onClick={onSignIn} className={`${PUBLIC_BTN_SECONDARY} px-5 py-2.5 text-sm tracking-[0.06em] text-luna-purple`}>
              {faqTeaser.fullCta}
            </button>
          </article>

          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={onSignIn} className={`${PUBLIC_BTN_PRIMARY} px-7 py-3 text-sm tracking-[0.08em]`}>
              <span className={PUBLIC_BTN_PRIMARY_GLOW} />
              <span className="relative z-10">{actions.enterMember}</span>
            </button>
            <button type="button" onClick={onSignIn} className={`${PUBLIC_BTN_SECONDARY} px-5 py-3 text-sm tracking-[0.08em] text-luna-purple`}>
              {actions.memberSignIn}
            </button>
          </div>
        </div>
      </section>
    </section>
  );
};
