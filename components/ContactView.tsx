
import React, { useState } from 'react';
import { ContactCopy } from '../types/uiCopy';
import { hasMeaningfulText, normalizeUserText } from '../utils/text';
import { Language, LangCopy, getLang } from '../constants';
import { contactService } from '../services/contactService';

interface ContactViewProps {
  ui: ContactCopy;
  lang: Language;
  onBack?: () => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ ui, lang, onBack }) => {
  const copyByLang: LangCopy< {
    back: string; sentTitle: string; sentText: string; sentCta: string; supportAvailability: string;
    schedule: string; emailOnly: string; namePlaceholder: string; messagePlaceholder: string; loadingFallback: string;
  }> = {
    en: { back: 'Back', sentTitle: 'System Message Received', sentText: 'Our team has been notified. We will reach out to you via email shortly.', sentCta: 'Return to Contact', supportAvailability: 'Support Availability', schedule: 'Monday — Friday • 9:00 — 18:00 UTC', emailOnly: 'Dedicated Email Service Only', namePlaceholder: 'Enter your name', messagePlaceholder: 'How can our support team assist you today?', loadingFallback: 'Sending...' },
    ru: { back: 'Назад', sentTitle: 'Сообщение получено', sentText: 'Наша команда уведомлена. Мы свяжемся с вами по email в ближайшее время.', sentCta: 'Вернуться к контакту', supportAvailability: 'Доступность поддержки', schedule: 'Понедельник — Пятница • 9:00 — 18:00 UTC', emailOnly: 'Только поддержка по email', namePlaceholder: 'Введите ваше имя', messagePlaceholder: 'Чем наша команда может помочь вам сегодня?', loadingFallback: 'Отправка...' },
    uk: { back: 'Назад', sentTitle: 'Повідомлення отримано', sentText: 'Наша команда сповіщена. Ми зв’яжемося з вами електронною поштою найближчим часом.', sentCta: 'Повернутися до контакту', supportAvailability: 'Доступність підтримки', schedule: 'Понеділок — Пʼятниця • 9:00 — 18:00 UTC', emailOnly: 'Лише email-підтримка', namePlaceholder: "Введіть ваше ім'я", messagePlaceholder: 'Чим наша команда може допомогти вам сьогодні?', loadingFallback: 'Надсилання...' },
    es: { back: 'Atrás', sentTitle: 'Mensaje recibido', sentText: 'Nuestro equipo ha sido notificado. Nos pondremos en contacto contigo por email en breve.', sentCta: 'Volver a Contacto', supportAvailability: 'Disponibilidad de soporte', schedule: 'Lunes — Viernes • 9:00 — 18:00 UTC', emailOnly: 'Solo servicio por email', namePlaceholder: 'Escribe tu nombre', messagePlaceholder: '¿Cómo puede ayudarte hoy nuestro equipo de soporte?', loadingFallback: 'Enviando...' },
    fr: { back: 'Retour', sentTitle: 'Message reçu', sentText: 'Notre équipe a été informée. Nous vous contacterons par email sous peu.', sentCta: 'Retour au contact', supportAvailability: 'Disponibilité du support', schedule: 'Lundi — Vendredi • 9:00 — 18:00 UTC', emailOnly: 'Service email uniquement', namePlaceholder: 'Entrez votre nom', messagePlaceholder: 'Comment notre équipe peut-elle vous aider aujourd’hui ?', loadingFallback: 'Envoi...' },
    de: { back: 'Zurück', sentTitle: 'Nachricht erhalten', sentText: 'Unser Team wurde benachrichtigt. Wir melden uns in Kürze per E-Mail bei dir.', sentCta: 'Zurück zum Kontakt', supportAvailability: 'Support-Zeiten', schedule: 'Montag — Freitag • 9:00 — 18:00 UTC', emailOnly: 'Nur E-Mail-Support', namePlaceholder: 'Deinen Namen eingeben', messagePlaceholder: 'Wie kann unser Support-Team dir heute helfen?', loadingFallback: 'Senden...' },
    zh: { back: '返回', sentTitle: '消息已收到', sentText: '我们的团队已收到通知。我们将很快通过电子邮件联系你。', sentCta: '返回联系', supportAvailability: '支持时间', schedule: '周一 — 周五 • 9:00 — 18:00 UTC', emailOnly: '仅提供邮件支持', namePlaceholder: '输入你的姓名', messagePlaceholder: '我们的支持团队今天可以如何帮助你？', loadingFallback: '发送中...' },
    ja: { back: '戻る', sentTitle: 'メッセージを受信しました', sentText: 'チームに通知されました。まもなくメールでご連絡します。', sentCta: 'お問い合わせに戻る', supportAvailability: 'サポート対応時間', schedule: '月曜 — 金曜 • 9:00 — 18:00 UTC', emailOnly: 'メール対応のみ', namePlaceholder: 'お名前を入力', messagePlaceholder: '本日、サポートチームはどのようにお手伝いできますか？', loadingFallback: '送信中...' },
    pt: { back: 'Voltar', sentTitle: 'Mensagem recebida', sentText: 'Nossa equipe foi notificada. Entraremos em contato por e-mail em breve.', sentCta: 'Voltar ao contato', supportAvailability: 'Disponibilidade do suporte', schedule: 'Segunda — Sexta • 9:00 — 18:00 UTC', emailOnly: 'Atendimento apenas por e-mail', namePlaceholder: 'Digite seu nome', messagePlaceholder: 'Como nossa equipe de suporte pode ajudar você hoje?', loadingFallback: 'Enviando...' },
  ar: { back: 'Back', sentTitle: 'System Message Received', sentText: 'Our team has been notified. We will reach out to you via email shortly.', sentCta: 'Return to Contact', supportAvailability: 'Support Availability', schedule: 'Monday — Friday • 9:00 — 18:00 UTC', emailOnly: 'Dedicated Email Service Only', namePlaceholder: 'Enter your name', messagePlaceholder: 'How can our support team assist you today?', loadingFallback: 'Sending...' },
  he: { back: 'Back', sentTitle: 'System Message Received', sentText: 'Our team has been notified. We will reach out to you via email shortly.', sentCta: 'Return to Contact', supportAvailability: 'Support Availability', schedule: 'Monday — Friday • 9:00 — 18:00 UTC', emailOnly: 'Dedicated Email Service Only', namePlaceholder: 'Enter your name', messagePlaceholder: 'How can our support team assist you today?', loadingFallback: 'Sending...' },};
  const copy = getLang(copyByLang, lang);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("support");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedName = normalizeUserText(name);
    const normalizedEmail = normalizeUserText(email);
    const normalizedMessage = normalizeUserText(message);

    if (!hasMeaningfulText(normalizedName) || !hasMeaningfulText(normalizedMessage) || !hasMeaningfulText(normalizedEmail)) return;

    setName(normalizedName);
    setEmail(normalizedEmail);
    setMessage(normalizedMessage);
    setSubmitError(null);
    setIsLoading(true);

    try {
      await contactService.submit({
        name: normalizedName,
        email: normalizedEmail,
        subject,
        message: normalizedMessage,
      });
      setSent(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to send message.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center space-y-8 animate-in fade-in duration-1000">
        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full mx-auto flex items-center justify-center text-3xl">✨</div>
        <h2 className="text-3xl font-black tracking-tight">{copy.sentTitle}</h2>
        <p className="text-slate-500 font-medium italic">{copy.sentText}</p>
        <button 
          onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}
          className="px-12 py-4 bg-luna-purple text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:shadow-xl transition-all"
        >
          {copy.sentCta}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto luna-page-shell luna-page-contact space-y-16 animate-in fade-in duration-700 p-8 md:p-10 pb-20">
      {onBack && (
        <button 
          onClick={onBack} 
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-luna-purple transition-all mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {copy.back}
        </button>
      )}

      <header className="space-y-6 text-center max-w-2xl mx-auto">
        <h2 className="text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">{ui.contact.headline}</h2>
        <p className="text-lg font-medium text-slate-400 italic">{ui.contact.subheadline}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2 space-y-8">
           <div className="p-10 luna-vivid-card-alt-1 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-luna space-y-6">
              <div className="w-12 h-12 bg-luna-purple/10 flex items-center justify-center rounded-2xl text-2xl">🛡️</div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">{ui.contact.supportTitle}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{ui.contact.supportDesc}</p>
              </div>
           </div>

           <div className="p-10 luna-vivid-card-alt-3 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-luna space-y-6">
              <div className="w-12 h-12 bg-luna-teal/10 flex items-center justify-center rounded-2xl text-2xl">🌱</div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-slate-100">{ui.contact.feedbackTitle}</h3>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">{ui.contact.feedbackDesc}</p>
              </div>
           </div>

           <div className="px-8 py-6 luna-vivid-card-soft rounded-3xl border border-slate-100 dark:border-slate-800">
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">{copy.supportAvailability}</p>
             <p className="text-center text-[11px] font-bold text-slate-500 mt-2">{copy.schedule}</p>
             <p className="text-center text-[9px] text-slate-400 mt-1 uppercase tracking-tight">{copy.emailOnly}</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-8 luna-vivid-surface p-12 border border-slate-100 dark:border-slate-800 rounded-[4rem] shadow-luna">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{ui.contact.name}</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full luna-vivid-chip p-5 rounded-2xl border-0 outline-none focus:ring-2 ring-luna-purple/40 transition-all font-bold text-sm"
                required 
                placeholder={copy.namePlaceholder}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{ui.contact.email}</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full luna-vivid-chip p-5 rounded-2xl border-0 outline-none focus:ring-2 ring-luna-purple/40 transition-all font-bold text-sm"
                required 
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{ui.contact.subject}</label>
            <div className="flex flex-wrap gap-2 luna-vivid-chip p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
               {[
                 { id: 'support', label: 'support' },
                 { id: 'billing', label: 'billing' },
                 { id: 'feedback', label: 'feedback' },
                 { id: 'technical', label: 'technical' },
                 { id: 'privacy_legal', label: 'privacy' },
                 { id: 'other', label: 'other' },
               ].map((s) => (
                 <button 
                  key={s.id} 
                  type="button" 
                  onClick={() => setSubject(s.id)}
                  className={`flex-1 min-w-[80px] py-3 text-[10px] font-black uppercase rounded-xl transition-all ${subject === s.id ? 'bg-white dark:bg-slate-800 text-luna-purple shadow-lg' : 'text-slate-400'}`}
                 >
                   {s.label}
                 </button>
               ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{ui.contact.message}</label>
            <textarea 
              rows={6} 
              value={message} 
              onChange={e => setMessage(e.target.value)}
              className="w-full luna-vivid-chip p-5 rounded-2xl border-0 outline-none focus:ring-2 ring-luna-purple/40 transition-all font-medium text-sm italic"
              required 
              placeholder={copy.messagePlaceholder}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-6 bg-luna-purple text-white font-black uppercase tracking-[0.3em] rounded-full hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-luna-purple/20 flex items-center justify-center gap-4"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              ui.contact.send
            )}
          </button>
          {submitError && (
            <p className="text-xs font-bold text-rose-500 text-center">{submitError}</p>
          )}
        </form>
      </div>
    </div>
  );
};
