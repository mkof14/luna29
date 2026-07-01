
import React, { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import { Medication } from '../types';
import { getMedicationValidationError, normalizeMedicationInput } from '../utils/medications';
import { Language, LangCopy, getLang } from '../constants';
import { MemberIconBackButton } from './member/MemberIconBackButton';
import { MemberPageIntro } from './member/MemberPageIntro';
import { LunaPageContentSection } from './shared/LunaPageContentSection';
import { getLunaPageTheme } from '../utils/lunaPageThemes';

export const MedicationsView: React.FC<{ medications: Medication[]; lang: Language; onBack?: () => void }> = ({ medications, lang, onBack }) => {
  const copyByLang: LangCopy< {
    titleA: string; titleB: string; subtitle: string; close: string; addNew: string; addSuccess: string; removeSuccess: string;
    name: string; amount: string; save: string; empty: string; remove: string; standardDose: string; addedOn: string;
  }> = {
    en: { titleA: 'Medication', titleB: 'Note.', subtitle: 'Track medications and supportive care items. Luna29 observes how your body responds over time — without clinical claims.', close: 'Close', addNew: 'Add medication', addSuccess: 'Medication note added.', removeSuccess: 'Medication note removed.', name: 'Name', amount: 'Dose', save: 'Save', empty: 'No medications logged yet.', remove: 'Remove', standardDose: 'Typical dose', addedOn: 'Added on' },
    ru: { titleA: 'Заметка', titleB: 'о препарате.', subtitle: 'Отмечайте препараты и элементы поддержки. Luna29 наблюдает реакцию тела во времени — без клинических утверждений.', close: 'Закрыть', addNew: 'Добавить препарат', addSuccess: 'Заметка о препарате добавлена.', removeSuccess: 'Заметка удалена.', name: 'Название', amount: 'Дозировка', save: 'Сохранить', empty: 'Пока нет записей о препаратах.', remove: 'Удалить', standardDose: 'Типичная доза', addedOn: 'Добавлено' },
    uk: { titleA: 'Нотатка', titleB: 'про препарат.', subtitle: 'Відстежуйте препарати та елементи підтримки. Luna29 спостерігає реакцію тіла — без клінічних тверджень.', close: 'Закрити', addNew: 'Додати препарат', addSuccess: 'Нотатку додано.', removeSuccess: 'Нотатку видалено.', name: 'Назва', amount: 'Доза', save: 'Зберегти', empty: 'Поки немає записів про препарати.', remove: 'Видалити', standardDose: 'Типова доза', addedOn: 'Додано' },
    es: { titleA: 'Mi', titleB: 'Soporte.', subtitle: 'Registra lo que te ayuda a sentirte mejor. Luna29 observa cómo responde tu cuerpo a tu plan de cuidado.', close: 'Cerrar', addNew: 'Añadir nuevo', addSuccess: 'Perfil de soporte añadido.', removeSuccess: 'Perfil de soporte eliminado.', name: 'Nombre', amount: 'Cantidad', save: 'Guardar', empty: 'Aún no hay elementos.', remove: 'Eliminar', standardDose: 'Dosis estándar', addedOn: 'Añadido el' },
    fr: { titleA: 'Mon', titleB: 'Soutien.', subtitle: 'Suivez ce qui vous aide à vous sentir mieux. Luna29 observe la réponse de votre corps à votre plan.', close: 'Fermer', addNew: 'Ajouter un élément', addSuccess: 'Profil de soutien ajouté.', removeSuccess: 'Profil de soutien supprimé.', name: 'Nom', amount: 'Quantité', save: 'Enregistrer', empty: 'Rien pour le moment.', remove: 'Retirer', standardDose: 'Dose standard', addedOn: 'Ajouté le' },
    de: { titleA: 'Meine', titleB: 'Unterstützung.', subtitle: 'Behalte im Blick, was dir hilft. Luna29 beobachtet, wie dein Körper auf deinen Plan reagiert.', close: 'Schließen', addNew: 'Neu hinzufügen', addSuccess: 'Unterstützungsprofil hinzugefügt.', removeSuccess: 'Unterstützungsprofil entfernt.', name: 'Name', amount: 'Menge', save: 'Speichern', empty: 'Noch nichts hinzugefügt.', remove: 'Entfernen', standardDose: 'Standarddosis', addedOn: 'Hinzugefügt am' },
    zh: { titleA: '我的', titleB: '支持。', subtitle: '记录哪些方式能让你感觉更好。Luna29 会观察你的身体对计划的反应。', close: '关闭', addNew: '添加新项', addSuccess: '支持档案已添加。', removeSuccess: '支持档案已删除。', name: '名称', amount: '剂量', save: '保存', empty: '尚未添加内容。', remove: '移除', standardDose: '标准剂量', addedOn: '添加于' },
    ja: { titleA: '私の', titleB: 'サポート。', subtitle: '体調を整えるために役立つものを記録しましょう。Luna29が反応を観察します。', close: '閉じる', addNew: '新しく追加', addSuccess: 'サポート項目を追加しました。', removeSuccess: 'サポート項目を削除しました。', name: '名前', amount: '量', save: '保存', empty: 'まだ追加されていません。', remove: '削除', standardDose: '標準用量', addedOn: '追加日' },
    pt: { titleA: 'Meu', titleB: 'Suporte.', subtitle: 'Acompanhe o que ajuda você a se sentir melhor. A Luna29 observa como seu corpo responde ao seu plano.', close: 'Fechar', addNew: 'Adicionar novo', addSuccess: 'Perfil de suporte adicionado.', removeSuccess: 'Perfil de suporte removido.', name: 'Nome', amount: 'Quantidade', save: 'Salvar', empty: 'Nada adicionado ainda.', remove: 'Remover', standardDose: 'Dose padrão', addedOn: 'Adicionado em' },
  ar: { titleA: 'دعمي', titleB: '.', subtitle: 'تابعي ما يساعدك على الشعور بتحسّن. Luna29 تراقب كيف يستجيب جسمك لخطة رعايتك.', close: 'إغلاق', addNew: 'إضافة عنصر جديد', addSuccess: 'تمت إضافة ملف الدعم.', removeSuccess: 'تمت إزالة ملف الدعم.', name: 'الاسم', amount: 'الكمية', save: 'حفظ', empty: 'لم تُضف عناصر بعد.', remove: 'إزالة', standardDose: 'الجرعة المعتادة', addedOn: 'أُضيف في' },
  he: { titleA: 'התמיכה', titleB: 'שלי.', subtitle: 'עקבי אחרי מה שעוזר לך להרגיש טוב יותר. Luna29 צופה איך הגוף שלך מגיב לתוכנית הטיפול.', close: 'סגירה', addNew: 'הוספת פריט חדש', addSuccess: 'פרופיל התמיכה נוסף.', removeSuccess: 'פרופיל התמיכה הוסר.', name: 'שם', amount: 'כמות', save: 'שמירה', empty: 'עדיין לא נוסף כלום.', remove: 'הסרה', standardDose: 'מינון סטנדרטי', addedOn: 'נוסף ב' },};
  const copy = getLang(copyByLang, lang);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDose, setNewDose] = useState("");
  const [localMedications, setLocalMedications] = useState<Medication[]>(medications);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const errorMapByLang: LangCopy< Record<string, string>> = {
    en: { 'Name is required.': 'Name is required.', 'This support profile already exists.': 'This support profile already exists.' },
    ru: { 'Name is required.': 'Название обязательно.', 'This support profile already exists.': 'Такой профиль поддержки уже существует.' },
    uk: { 'Name is required.': "Назва обов'язкова.", 'This support profile already exists.': 'Такий профіль підтримки вже існує.' },
    es: { 'Name is required.': 'El nombre es obligatorio.', 'This support profile already exists.': 'Este perfil de soporte ya existe.' },
    fr: { 'Name is required.': 'Le nom est requis.', 'This support profile already exists.': 'Ce profil existe déjà.' },
    de: { 'Name is required.': 'Name ist erforderlich.', 'This support profile already exists.': 'Dieses Unterstützungsprofil existiert bereits.' },
    zh: { 'Name is required.': '名称为必填项。', 'This support profile already exists.': '该支持档案已存在。' },
    ja: { 'Name is required.': '名前は必須です。', 'This support profile already exists.': 'このサポート項目は既に存在します。' },
    pt: { 'Name is required.': 'Nome é obrigatório.', 'This support profile already exists.': 'Este perfil de suporte já existe.' },
  ar: { 'Name is required.': 'الاسم مطلوب.', 'This support profile already exists.': 'ملف الدعم هذا موجود بالفعل.' },
  he: { 'Name is required.': 'שם הוא שדה חובה.', 'This support profile already exists.': 'פרופיל התמיכה הזה כבר קיים.' },};

  useEffect(() => {
    setLocalMedications(medications);
  }, [medications]);

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => setStatus(null), 2400);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleAdd = () => {
    const { name, dose } = normalizeMedicationInput(newName, newDose);
    const validationError = getMedicationValidationError(localMedications, name, dose);
    if (validationError) {
      setStatus({ type: 'error', text: getLang(errorMapByLang, lang)[validationError] || validationError });
      return;
    }

    const medId = Math.random().toString(36).slice(2, 11);
    const event = dataService.logEvent('MEDICATION_LOG', {
      action: 'ADD', 
      medId,
      name,
      dose
    });
    setLocalMedications((prev) => [
      ...prev,
      {
        id: medId,
        name,
        dose: dose || undefined,
        startDate: event.timestamp,
        observations: [],
        notes: '',
        addedAt: event.timestamp,
      },
    ]);
    setNewName("");
    setNewDose("");
    setShowAdd(false);
    setStatus({ type: 'success', text: copy.addSuccess });
  };

  const handleRemove = (id: string) => {
    dataService.logEvent('MEDICATION_LOG', { action: 'REMOVE', medId: id });
    setLocalMedications((prev) => prev.filter((med) => med.id !== id));
    setStatus({ type: 'success', text: copy.removeSuccess });
  };

  return (
    <>
      {onBack && <MemberIconBackButton lang={lang} onClick={onBack} className="mb-0" />}
      <MemberPageIntro lang={lang} page="meds" tab="meds" />

      <LunaPageContentSection themeClass={getLunaPageTheme('meds').shellClass} padded={false} className="space-y-12">
      <header className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-6">
        <p className="text-base md:text-lg font-semibold text-slate-600 dark:text-slate-300 max-w-xl text-center lg:text-left">
          {copy.subtitle}
        </p>
        <button 
          data-testid="medications-toggle-add"
          onClick={() => setShowAdd(!showAdd)}
          className={`px-12 py-5 rounded-full font-black uppercase tracking-widest shadow-2xl transition-all ${showAdd ? 'bg-rose-500 text-white' : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:scale-105'}`}
        >
          {showAdd ? copy.close : copy.addNew}
        </button>
      </header>

      {status && (
        <div
          data-testid="medications-status"
          className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/40'
              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-700/40'
          }`}
        >
          {status.text}
        </div>
      )}

      {showAdd && (
        <section data-testid="medications-form" className="luna-vivid-surface p-16 rounded-[4.5rem] animate-in zoom-in-95 duration-500 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{copy.name}</label>
               <input 
                 data-testid="medications-name-input"
                 value={newName} 
                 onChange={e => setNewName(e.target.value)}
                 className="w-full bg-slate-50 dark:bg-slate-950 p-6 rounded-[2.5rem] outline-none font-bold text-xl border-2 border-transparent focus:border-luna-teal transition-all"
                 placeholder="e.g. Magnesium"
               />
             </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{copy.amount}</label>
               <input 
                 data-testid="medications-dose-input"
                 value={newDose} 
                 onChange={e => setNewDose(e.target.value)}
                 className="w-full bg-slate-50 dark:bg-slate-950 p-6 rounded-[2.5rem] outline-none font-bold text-xl border-2 border-transparent focus:border-luna-teal transition-all"
                 placeholder="e.g. 200mg"
               />
             </div>
          </div>
          <button
            data-testid="medications-save"
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="w-full py-8 bg-luna-teal text-white font-black uppercase tracking-[0.4em] rounded-full shadow-xl hover:scale-[1.01] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {copy.save}
          </button>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {localMedications.length === 0 ? (
          <div className="col-span-full p-32 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[4rem] luna-vivid-card-soft">
            <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.5em]">{copy.empty}</p>
          </div>
        ) : (
          localMedications.map(med => (
            <div data-testid={`medications-card-${med.id}`} key={med.id} className="relative luna-vivid-card p-12 rounded-[4rem] group overflow-hidden transition-all luna-vivid-hover">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-luna-teal/5 blur-3xl rounded-full" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <span className="text-4xl">💊</span>
                  <button data-testid={`medications-remove-${med.id}`} onClick={() => handleRemove(med.id)} className="text-[8px] font-black uppercase text-rose-400 opacity-0 group-hover:opacity-100 transition-all border border-rose-100 rounded-full px-4 py-1.5">{copy.remove}</button>
                </div>
                <h4 className="text-3xl font-black uppercase tracking-tighter leading-tight">{med.name}</h4>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{med.dose || copy.standardDose}</p>
                  <p className="text-[9px] font-bold text-slate-300 italic">{copy.addedOn} {new Date(med.addedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
      </LunaPageContentSection>
    </>
  );
};
