import React from 'react';
import { Language, LangCopy, getLang } from '../../constants';
import { PUBLIC_BTN_PRIMARY, PUBLIC_BTN_PRIMARY_GLOW } from './publicButtonStyles';

interface PublicRitualSectionProps {
  onSignIn: () => void;
  lang: Language;
}

export const PublicRitualSection: React.FC<PublicRitualSectionProps> = ({
  onSignIn,
  lang,
}) => {
  const ritualCopyByLang = {
    en: { eyebrow: 'RITUAL PATH', title: 'A PATH, NOT A TASK LIST', subtitle: 'A simple daily rhythm to protect attention and preserve signal.', morningTitle: 'MORNING', morningBody: 'Name your baseline before the world sets your pace.', middayTitle: 'MIDDAY', middayBody: 'Re-check capacity and adjust plans with respect for your energy.', eveningTitle: 'EVENING', eveningBody: 'Close the day with a short note to preserve signal, not noise.' },
    ru: { eyebrow: 'RITUAL PATH', title: 'ПУТЬ, А НЕ СПИСОК ДЕЛ', subtitle: 'Простой ежедневный ритм, который защищает внимание и сохраняет сигнал состояния.', morningTitle: 'УТРО', morningBody: 'Назовите базовое состояние до того, как мир задаст темп.', middayTitle: 'ДЕНЬ', middayBody: 'Переоцените ресурс и скорректируйте планы с уважением к энергии.', eveningTitle: 'ВЕЧЕР', eveningBody: 'Закройте день короткой заметкой, чтобы сохранить сигнал, а не шум.' },
    uk: { eyebrow: 'RITUAL PATH', title: 'ШЛЯХ, А НЕ СПИСОК ЗАВДАНЬ', subtitle: 'Простий щоденний ритм для захисту уваги і збереження сигналу стану.', morningTitle: 'РАНОК', morningBody: 'Назвіть свій базовий стан до того, як світ задасть темп.', middayTitle: 'ДЕНЬ', middayBody: 'Переоцініть ресурс і скоригуйте плани відповідно до енергії.', eveningTitle: 'ВЕЧІР', eveningBody: 'Завершіть день короткою нотаткою, зберігаючи сигнал, а не шум.' },
    es: { eyebrow: 'RITUAL PATH', title: 'UN CAMINO, NO UNA LISTA', subtitle: 'Un ritmo diario simple para proteger tu atención y conservar la señal.', morningTitle: 'MANANA', morningBody: 'Nombra tu estado base antes de que el mundo marque tu ritmo.', middayTitle: 'MEDIODIA', middayBody: 'Revisa tu capacidad y ajusta planes con respeto a tu energia.', eveningTitle: 'NOCHE', eveningBody: 'Cierra el dia con una reflexion corta para preservar señal, no ruido.' },
    fr: { eyebrow: 'RITUAL PATH', title: 'UN CHEMIN, PAS UNE LISTE', subtitle: 'Un rythme quotidien simple pour proteger l attention et conserver le signal.', morningTitle: 'MATIN', morningBody: 'Nommez votre base avant que le monde impose son rythme.', middayTitle: 'MIDI', middayBody: 'Reevaluez votre capacite et ajustez vos plans selon votre energie.', eveningTitle: 'SOIR', eveningBody: 'Fermez la journee avec une courte reflexion pour garder le signal, pas le bruit.' },
    de: { eyebrow: 'RITUAL PATH', title: 'EIN PFAD, KEINE TO-DO-LISTE', subtitle: 'Ein einfacher Tagesrhythmus, der Aufmerksamkeit schützt und Signale bewahrt.', morningTitle: 'MORGEN', morningBody: 'Benenne deinen Basiszustand, bevor die Welt dein Tempo setzt.', middayTitle: 'MITTAG', middayBody: 'Prüfe Kapazität neu und passe Pläne energie-gerecht an.', eveningTitle: 'ABEND', eveningBody: 'Schließe den Tag mit kurzer Reflexion, um Signal statt Rauschen zu behalten.' },
    zh: { eyebrow: 'RITUAL PATH', title: '是一条路径，不是任务清单', subtitle: '一个简单的日常节律，保护注意力并保留状态信号。', morningTitle: '早晨', morningBody: '在外界设定节奏前，先命名你的基线状态。', middayTitle: '中午', middayBody: '重新评估容量，并按能量调整计划。', eveningTitle: '夜晚', eveningBody: '用简短反思结束一天，保留信号而非噪音。' },
    ja: { eyebrow: 'RITUAL PATH', title: 'タスクではなく、道筋', subtitle: '注意力を守り、状態のシグナルを残すシンプルな日次リズム。', morningTitle: '朝', morningBody: '世界にペースを決められる前に、自分の基準状態を言語化する。', middayTitle: '昼', middayBody: '容量を再確認し、エネルギーに合わせて予定を調整する。', eveningTitle: '夜', eveningBody: '短い振り返りで一日を閉じ、ノイズではなくシグナルを残す。' },
    pt: { eyebrow: 'CAMINHO RITUAL', title: 'UM CAMINHO, NAO UMA LISTA', subtitle: 'Um ritmo diario simples que protege atencao e preserva sinal.', morningTitle: 'MANHA', morningBody: 'Nomeie sua base antes que o mundo imponha o ritmo.', middayTitle: 'MEIO-DIA', middayBody: 'Reavalie capacidade e ajuste planos com respeito a sua energia.', eveningTitle: 'NOITE', eveningBody: 'Feche o dia com uma reflexao curta para preservar sinal, nao ruido.' },
  ar: { eyebrow: 'RITUAL PATH', title: 'A PATH, NOT A TASK LIST', subtitle: 'A simple daily rhythm to protect attention and preserve signal.', morningTitle: 'MORNING', morningBody: 'Name your baseline before the world sets your pace.', middayTitle: 'MIDDAY', middayBody: 'Re-check capacity and adjust plans with respect for your energy.', eveningTitle: 'EVENING', eveningBody: 'Close the day with a short note to preserve signal, not noise.' },
  he: { eyebrow: 'RITUAL PATH', title: 'A PATH, NOT A TASK LIST', subtitle: 'A simple daily rhythm to protect attention and preserve signal.', morningTitle: 'MORNING', morningBody: 'Name your baseline before the world sets your pace.', middayTitle: 'MIDDAY', middayBody: 'Re-check capacity and adjust plans with respect for your energy.', eveningTitle: 'EVENING', eveningBody: 'Close the day with a short note to preserve signal, not noise.' },};
  const sharedByLang: LangCopy< { noteTitle: string; noteLine1: string; noteLine2: string; enterMember: string; memberSignIn: string }> = {
    en: { noteTitle: 'LUNA29 NOTE', noteLine1: 'This Home is public by design. It gives orientation without extracting attention.', noteLine2: 'Your private member zone is where personal data, check-ins, and deeper tools live.', enterMember: 'Enter Member Zone', memberSignIn: 'Already a member? Sign in' },
    ru: { noteTitle: 'ЗАМЕТКА LUNA29', noteLine1: 'Эта главная страница публичная по дизайну: она дает ориентир без перегруза внимания.', noteLine2: 'Приватная зона участника — место для личных данных, отметок состояния и более глубоких инструментов.', enterMember: 'Перейти в зону участника', memberSignIn: 'Уже участник? Войти' },
    uk: { noteTitle: 'НОТАТКА LUNA29', noteLine1: 'Ця головна сторінка публічна за задумом: вона дає орієнтацію без виснаження уваги.', noteLine2: 'Приватна зона учасника — місце для персональних даних, відміток стану та глибших інструментів.', enterMember: 'Увійти в зону учасника', memberSignIn: 'Вже учасниця? Увійти' },
    es: { noteTitle: 'NOTA LUNA29', noteLine1: 'Esta página principal es pública por diseño: orienta sin secuestrar tu atención.', noteLine2: 'Tu zona privada de miembro es donde viven datos personales, registros y herramientas profundas.', enterMember: 'Entrar a zona de miembro', memberSignIn: '¿Ya eres miembro? Iniciar sesión' },
    fr: { noteTitle: 'NOTE LUNA29', noteLine1: 'Cette page d accueil est publique par design: elle oriente sans capter excessivement votre attention.', noteLine2: 'Votre zone membre privée contient les données personnelles, suivis et outils avancés.', enterMember: 'Entrer dans la zone membre', memberSignIn: 'Déjà membre ? Se connecter' },
    de: { noteTitle: 'LUNA29 HINWEIS', noteLine1: 'Diese Startseite ist bewusst öffentlich: Sie gibt Orientierung ohne Aufmerksamkeitsdruck.', noteLine2: 'In deiner privaten Mitgliederzone liegen persönliche Daten, Status-Checks und tiefere Tools.', enterMember: 'Zur Mitgliederzone', memberSignIn: 'Schon Mitglied? Anmelden' },
    zh: { noteTitle: 'LUNA29 提示', noteLine1: '主页采用公开设计：提供方向，不消耗注意力。', noteLine2: '你的私密会员区才是个人数据、状态记录和深度工具所在。', enterMember: '进入会员区', memberSignIn: '已经是会员？登录' },
    ja: { noteTitle: 'LUNA29 NOTE', noteLine1: 'このホームは公開設計です。注意を奪わず、方向だけを示します。', noteLine2: '個人データ、状態チェック、深いツールはプライベートなメンバーゾーンにあります。', enterMember: 'メンバーゾーンへ', memberSignIn: 'メンバーですか？ サインイン' },
    pt: { noteTitle: 'NOTA LUNA29', noteLine1: 'Esta página inicial é pública por design: orienta sem sequestrar sua atenção.', noteLine2: 'Sua zona privada de membro é onde ficam dados pessoais, registros de estado e ferramentas profundas.', enterMember: 'Entrar na zona de membro', memberSignIn: 'Ja e membro? Entrar' },
  ar: { noteTitle: 'LUNA29 NOTE', noteLine1: 'This Home is public by design. It gives orientation without extracting attention.', noteLine2: 'Your private member zone is where personal data, check-ins, and deeper tools live.', enterMember: 'Enter Member Zone', memberSignIn: 'Already a member? Sign in' },
  he: { noteTitle: 'LUNA29 NOTE', noteLine1: 'This Home is public by design. It gives orientation without extracting attention.', noteLine2: 'Your private member zone is where personal data, check-ins, and deeper tools live.', enterMember: 'Enter Member Zone', memberSignIn: 'Already a member? Sign in' },};
  const copy = getLang(ritualCopyByLang, lang) || ritualCopyByLang.en;
  const shared = getLang(sharedByLang, lang) || sharedByLang.en;
  return (
    <section className="max-w-[1100px] mx-auto animate-in fade-in duration-500">
      <div className="luna-page-shell luna-page-ritual rounded-[3rem] border border-slate-200/70 dark:border-slate-800/80 bg-gradient-to-br from-[#fbf3f8]/90 via-[#f3eef7]/86 to-[#ecf2fa]/82 dark:from-[#070f23]/92 dark:via-[#0b1733]/90 dark:to-[#122345]/88 p-8 md:p-12 shadow-[0_24px_64px_rgba(88,68,128,0.16)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)] space-y-12">
        <header className="space-y-4 max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-luna-purple dark:text-fuchsia-200">{copy.eyebrow}</p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-slate-100">{copy.title}</h1>
          <p className="text-base md:text-lg font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{copy.subtitle}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-700/70 bg-[linear-gradient(160deg,rgba(251,248,254,0.8),rgba(241,236,249,0.86)),url('/images/bg5.webp')] bg-cover bg-center dark:bg-[linear-gradient(160deg,rgba(24,20,50,0.8),rgba(14,16,40,0.86)),url('/images/bg5.webp')] p-6 md:p-7 min-h-[220px] shadow-[0_12px_30px_rgba(88,70,126,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.34)]">
            <h2 className="text-sm md:text-base font-black uppercase tracking-[0.28em] text-luna-purple dark:text-fuchsia-200 mb-4">{copy.morningTitle}</h2>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{copy.morningBody}</p>
          </article>
          <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-700/70 bg-[linear-gradient(160deg,rgba(251,248,254,0.8),rgba(241,236,249,0.86)),url('/images/bg1.webp')] bg-cover bg-center dark:bg-[linear-gradient(160deg,rgba(24,20,50,0.8),rgba(14,16,40,0.86)),url('/images/bg1.webp')] p-6 md:p-7 min-h-[220px] shadow-[0_12px_30px_rgba(88,70,126,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.34)]">
            <h2 className="text-sm md:text-base font-black uppercase tracking-[0.28em] text-luna-purple dark:text-fuchsia-200 mb-4">{copy.middayTitle}</h2>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{copy.middayBody}</p>
          </article>
          <article className="rounded-[2rem] border border-slate-200/75 dark:border-slate-700/70 bg-[linear-gradient(160deg,rgba(251,248,254,0.8),rgba(241,236,249,0.86)),url('/images/bg4.webp')] bg-cover bg-center dark:bg-[linear-gradient(160deg,rgba(24,20,50,0.8),rgba(14,16,40,0.86)),url('/images/bg4.webp')] p-6 md:p-7 min-h-[220px] shadow-[0_12px_30px_rgba(88,70,126,0.12)] dark:shadow-[0_16px_36px_rgba(0,0,0,0.34)]">
            <h2 className="text-sm md:text-base font-black uppercase tracking-[0.28em] text-luna-purple dark:text-fuchsia-200 mb-4">{copy.eveningTitle}</h2>
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">{copy.eveningBody}</p>
          </article>
        </div>

        <article className="rounded-[2.2rem] border border-slate-200/75 dark:border-slate-800/85 bg-[linear-gradient(165deg,rgba(246,241,250,0.8),rgba(236,230,246,0.86)),url('/images/moon_phases_arc.webp')] bg-cover bg-center dark:bg-[linear-gradient(165deg,rgba(12,18,40,0.8),rgba(9,17,38,0.88)),url('/images/moon_phases_arc.webp')] p-6 md:p-8 space-y-3 shadow-[0_16px_38px_rgba(88,70,126,0.14)] dark:shadow-[0_20px_44px_rgba(0,0,0,0.5)]">
          <p className="text-xs font-black uppercase tracking-[0.36em] text-luna-purple dark:text-fuchsia-200">{shared.noteTitle}</p>
          <p className="text-base md:text-lg font-semibold text-slate-700 dark:text-slate-100 leading-relaxed">
            {shared.noteLine1}
            <br />
            {shared.noteLine2}
          </p>
        </article>

        <div className="flex flex-col items-start gap-4">
          <button
            onClick={onSignIn}
            className={`${PUBLIC_BTN_PRIMARY} px-7 py-3 text-sm tracking-[0.08em]`}
          >
            <span className={PUBLIC_BTN_PRIMARY_GLOW} />
            <span className="relative z-10">{shared.enterMember}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
