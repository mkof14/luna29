
import React from 'react';
import { HealthEvent } from '../types';
import { Language, LangCopy, getLang } from '../constants';

export const HistoryView: React.FC<{ log: HealthEvent[]; lang?: Language; onBack?: () => void }> = ({ log, lang = 'en', onBack }) => {
  const copyByLang: LangCopy< {
    daily: string; cycle: (day: string | number) => string; health: string; support: (name: string) => string; login: string; started: string; profile: string; system: string;
    titleA: string; titleB: string; subtitle: string; noEntries: string;
  }> = {
    en: { daily: 'Daily check-in saved.', cycle: (day) => `Cycle updated to Day ${day}.`, health: 'Health data updated.', support: (name) => `Support updated: ${name}.`, login: 'Logged in.', started: 'Started.', profile: 'Profile updated.', system: 'System event.', titleA: 'My', titleB: 'Journey.', subtitle: 'A look back at your journey. Every entry is a part of your story.', noEntries: 'No entries yet' },
    ru: { daily: 'Ежедневная отметка сохранена.', cycle: (day) => `Цикл обновлен: день ${day}.`, health: 'Данные здоровья обновлены.', support: (name) => `Поддержка обновлена: ${name}.`, login: 'Вход выполнен.', started: 'Начало.', profile: 'Профиль обновлен.', system: 'Системное событие.', titleA: 'Мой', titleB: 'Путь.', subtitle: 'Взгляд назад на ваш путь. Каждая запись - часть вашей истории.', noEntries: 'Пока нет записей' },
    uk: { daily: 'Щоденний чек-ін збережено.', cycle: (day) => `Цикл оновлено: день ${day}.`, health: "Дані здоров'я оновлено.", support: (name) => `Підтримку оновлено: ${name}.`, login: 'Вхід виконано.', started: 'Початок.', profile: 'Профіль оновлено.', system: 'Системна подія.', titleA: 'Мій', titleB: 'Шлях.', subtitle: 'Погляд на ваш шлях. Кожен запис - частина вашої історії.', noEntries: 'Поки немає записів' },
    es: { daily: 'Check-in diario guardado.', cycle: (day) => `Ciclo actualizado al día ${day}.`, health: 'Datos de salud actualizados.', support: (name) => `Soporte actualizado: ${name}.`, login: 'Sesión iniciada.', started: 'Inicio.', profile: 'Perfil actualizado.', system: 'Evento del sistema.', titleA: 'Mi', titleB: 'Viaje.', subtitle: 'Una mirada a tu recorrido. Cada entrada es parte de tu historia.', noEntries: 'Sin entradas todavía' },
    fr: { daily: 'Check-in quotidien enregistré.', cycle: (day) => `Cycle mis à jour au jour ${day}.`, health: 'Données santé mises à jour.', support: (name) => `Soutien mis à jour: ${name}.`, login: 'Connexion réussie.', started: 'Démarré.', profile: 'Profil mis à jour.', system: 'Événement système.', titleA: 'Mon', titleB: 'Parcours.', subtitle: 'Un regard sur votre parcours. Chaque entrée fait partie de votre histoire.', noEntries: 'Aucune entrée pour le moment' },
    de: { daily: 'Täglicher Check-in gespeichert.', cycle: (day) => `Zyklus auf Tag ${day} aktualisiert.`, health: 'Gesundheitsdaten aktualisiert.', support: (name) => `Unterstützung aktualisiert: ${name}.`, login: 'Eingeloggt.', started: 'Gestartet.', profile: 'Profil aktualisiert.', system: 'Systemereignis.', titleA: 'Meine', titleB: 'Reise.', subtitle: 'Ein Rückblick auf deinen Weg. Jeder Eintrag ist Teil deiner Geschichte.', noEntries: 'Noch keine Einträge' },
    zh: { daily: '每日打卡已保存。', cycle: (day) => `周期已更新到第 ${day} 天。`, health: '健康数据已更新。', support: (name) => `支持项已更新：${name}。`, login: '已登录。', started: '已开始。', profile: '资料已更新。', system: '系统事件。', titleA: '我的', titleB: '旅程。', subtitle: '回顾你的旅程。每一条记录都是你故事的一部分。', noEntries: '暂无记录' },
    ja: { daily: 'デイリーチェックインを保存しました。', cycle: (day) => `サイクルを${day}日目に更新しました。`, health: '健康データを更新しました。', support: (name) => `サポートを更新: ${name}。`, login: 'ログインしました。', started: '開始しました。', profile: 'プロフィールを更新しました。', system: 'システムイベント。', titleA: '私の', titleB: '記録。', subtitle: 'これまでの歩みを振り返ります。すべての記録があなたの物語です。', noEntries: 'まだ記録がありません' },
    pt: { daily: 'Check-in diário salvo.', cycle: (day) => `Ciclo atualizado para o dia ${day}.`, health: 'Dados de saúde atualizados.', support: (name) => `Suporte atualizado: ${name}.`, login: 'Login realizado.', started: 'Iniciado.', profile: 'Perfil atualizado.', system: 'Evento do sistema.', titleA: 'Minha', titleB: 'Jornada.', subtitle: 'Um olhar para sua jornada. Cada registro faz parte da sua história.', noEntries: 'Ainda sem registros' },
  };
  const copy = getLang(copyByLang, lang);
  const sortedLog = [...log].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getEventSummary = (event: HealthEvent) => {
    if (event.type === 'DAILY_CHECKIN') return copy.daily;
    if (event.type === 'CYCLE_SYNC') {
      const day = 'day' in event.payload && typeof event.payload.day === 'number' ? event.payload.day : '?';
      return copy.cycle(day);
    }
    if (event.type === 'LAB_MARKER_ENTRY') return copy.health;
    if (event.type === 'MEDICATION_LOG') {
      const name = 'name' in event.payload && typeof event.payload.name === 'string' ? event.payload.name : 'medication';
      return copy.support(name);
    }
    if (event.type === 'AUTH_SUCCESS') return copy.login;
    if (event.type === 'ONBOARDING_COMPLETE') return copy.started;
    if (event.type === 'PROFILE_UPDATE') return copy.profile;
    return copy.system;
  };

  const getEventTypeLabel = (event: HealthEvent) =>
    event.type
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  return (
    <div className="max-w-6xl mx-auto luna-page-shell luna-page-journey space-y-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 p-8 md:p-10 pb-40">
      <header className="flex flex-col items-center lg:items-start gap-10">
        <h2 className="text-6xl lg:text-9xl font-black tracking-tighter leading-none uppercase text-slate-950 dark:text-slate-100">
          {copy.titleA} <br/> <span className="text-luna-purple">{copy.titleB}</span>
        </h2>
        <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 italic font-medium max-w-2xl leading-relaxed">
          {copy.subtitle}
        </p>
      </header>

      <section data-testid="history-timeline" className="relative space-y-32">
        <div className="absolute left-10 lg:left-20 top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-800" />
        
        {sortedLog.length === 0 ? (
          <div className="p-32 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[4rem] luna-vivid-card-soft">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.5em]">{copy.noEntries}</p>
          </div>
        ) : (
          sortedLog.map((event, i) => (
            <div data-testid={`history-event-${event.type.toLowerCase()}`} key={event.id} className="relative pl-24 lg:pl-48 group animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="absolute left-[34px] lg:left-[74px] top-4 w-3 h-3 rounded-full bg-luna-purple ring-8 ring-slate-100 dark:ring-slate-950 z-10 transition-transform group-hover:scale-150" />
              
              <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
                <div className="w-48 flex-shrink-0">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400 block mb-1">
                    {new Date(event.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-300">
                    {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex-1 luna-vivid-surface p-12 rounded-[3.5rem] transition-all hover:-translate-y-1 hover:shadow-luna-deep">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[9px] font-black uppercase tracking-[0.5em] text-luna-purple">
                      {getEventTypeLabel(event)}
                    </span>
                    {event.version !== 4 && (
                      <span className="px-3 py-1 bg-slate-100 dark:bg-slate-950 rounded-full text-[8px] font-black text-slate-500 border border-slate-200">
                        V.{event.version}
                      </span>
                    )}
                  </div>
                  <p data-testid="history-event-summary" className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight italic">
                    {getEventSummary(event)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};
