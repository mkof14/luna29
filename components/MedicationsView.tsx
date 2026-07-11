
import React, { useEffect, useState } from 'react';
import { dataService } from '../services/dataService';
import { Medication } from '../types';
import { getMedicationValidationError, normalizeMedicationInput } from '../utils/medications';
import { Language, LangCopy, getLang } from '../constants';
import { MemberIconBackButton } from './member/MemberIconBackButton';
import { MemberPageIntro } from './member/MemberPageIntro';
import { LunaPageContentSection } from './shared/LunaPageContentSection';
import { getLunaPageTheme } from '../utils/lunaPageThemes';
import {
  getProfile,
  isProfileUnavailable,
  type PersonalHealthProfile,
} from '../services/personalHealthProfileService';
import { phpMedicationsSummary, listPhpMedications } from '../utils/healthProfilePlatform';
import { ProfilePersonalizationBadge } from './healthProfile/ProfilePlatformIntegration';
import { MEMBER_CHIP_ACTIVE } from '../utils/memberPageStyles';

export const MedicationsView: React.FC<{
  medications: Medication[];
  lang: Language;
  onBack?: () => void;
  onOpenHealthProfile?: () => void;
}> = ({ medications, lang, onBack, onOpenHealthProfile }) => {
  const copyByLang: LangCopy<{
    titleA: string; titleB: string; subtitle: string; close: string; addNew: string; addSuccess: string; removeSuccess: string;
    name: string; amount: string; save: string; empty: string; remove: string; standardDose: string; addedOn: string;
    clinicalTitle: string; clinicalEmpty: string; notesTitle: string; notesSubtitle: string;
  }> = {
    en: { titleA: 'Medication', titleB: 'Note.', subtitle: 'Your Personal Health Profile is the clinical source of truth. Supporting notes below are optional day-to-day observations — not a second medication list.', close: 'Close', addNew: 'Add supporting note', addSuccess: 'Supporting note added.', removeSuccess: 'Supporting note removed.', name: 'Name', amount: 'Dose', save: 'Save', empty: 'No supporting notes yet.', remove: 'Remove', standardDose: 'Typical dose', addedOn: 'Added on', clinicalTitle: 'Current medications (Personal Health Profile)', clinicalEmpty: 'No medications in your Personal Health Profile yet.', notesTitle: 'Supporting notes', notesSubtitle: 'Optional observations only — manage clinical medications in your Personal Health Profile.' },
    ru: { titleA: 'Заметка', titleB: 'о препарате.', subtitle: 'Personal Health Profile — клинический источник истины. Заметки ниже — только вспомогательные наблюдения.', close: 'Закрыть', addNew: 'Добавить заметку', addSuccess: 'Заметка добавлена.', removeSuccess: 'Заметка удалена.', name: 'Название', amount: 'Дозировка', save: 'Сохранить', empty: 'Пока нет заметок.', remove: 'Удалить', standardDose: 'Типичная доза', addedOn: 'Добавлено', clinicalTitle: 'Текущие препараты (Personal Health Profile)', clinicalEmpty: 'В Personal Health Profile пока нет препаратов.', notesTitle: 'Вспомогательные заметки', notesSubtitle: 'Только наблюдения — клинические препараты ведите в Personal Health Profile.' },
    uk: { titleA: 'Нотатка', titleB: 'про препарат.', subtitle: 'Personal Health Profile — клінічне джерело істини. Нотатки нижче — лише допоміжні спостереження.', close: 'Закрити', addNew: 'Додати нотатку', addSuccess: 'Нотатку додано.', removeSuccess: 'Нотатку видалено.', name: 'Назва', amount: 'Доза', save: 'Зберегти', empty: 'Поки немає нотаток.', remove: 'Видалити', standardDose: 'Типова доза', addedOn: 'Додано', clinicalTitle: 'Поточні препарати (Personal Health Profile)', clinicalEmpty: 'У Personal Health Profile ще немає препаратів.', notesTitle: 'Допоміжні нотатки', notesSubtitle: 'Лише спостереження — клінічні препарати ведіть у Personal Health Profile.' },
    es: { titleA: 'Nota', titleB: 'de medicación.', subtitle: 'Tu Personal Health Profile es la fuente clínica. Las notas de abajo son observaciones opcionales.', close: 'Cerrar', addNew: 'Añadir nota', addSuccess: 'Nota añadida.', removeSuccess: 'Nota eliminada.', name: 'Nombre', amount: 'Dosis', save: 'Guardar', empty: 'Aún no hay notas.', remove: 'Eliminar', standardDose: 'Dosis típica', addedOn: 'Añadido el', clinicalTitle: 'Medicamentos actuales (Personal Health Profile)', clinicalEmpty: 'Aún no hay medicamentos en tu Personal Health Profile.', notesTitle: 'Notas de apoyo', notesSubtitle: 'Solo observaciones — gestiona medicamentos clínicos en tu Personal Health Profile.' },
    fr: { titleA: 'Note', titleB: 'médicament.', subtitle: 'Votre Personal Health Profile est la source clinique. Les notes ci-dessous sont des observations optionnelles.', close: 'Fermer', addNew: 'Ajouter une note', addSuccess: 'Note ajoutée.', removeSuccess: 'Note retirée.', name: 'Nom', amount: 'Dose', save: 'Enregistrer', empty: 'Pas encore de notes.', remove: 'Retirer', standardDose: 'Dose typique', addedOn: 'Ajouté le', clinicalTitle: 'Médicaments actuels (Personal Health Profile)', clinicalEmpty: 'Aucun médicament dans votre Personal Health Profile.', notesTitle: 'Notes complémentaires', notesSubtitle: 'Observations uniquement — gérez les médicaments cliniques dans votre Personal Health Profile.' },
    de: { titleA: 'Medikamenten', titleB: 'notiz.', subtitle: 'Dein Personal Health Profile ist die klinische Quelle. Notizen unten sind optionale Beobachtungen.', close: 'Schließen', addNew: 'Notiz hinzufügen', addSuccess: 'Notiz hinzugefügt.', removeSuccess: 'Notiz entfernt.', name: 'Name', amount: 'Dosis', save: 'Speichern', empty: 'Noch keine Notizen.', remove: 'Entfernen', standardDose: 'Typische Dosis', addedOn: 'Hinzugefügt am', clinicalTitle: 'Aktuelle Medikamente (Personal Health Profile)', clinicalEmpty: 'Noch keine Medikamente im Personal Health Profile.', notesTitle: 'Ergänzende Notizen', notesSubtitle: 'Nur Beobachtungen — klinische Medikamente im Personal Health Profile pflegen.' },
    zh: { titleA: '用药', titleB: '备注。', subtitle: '个人健康档案是临床信息来源。下方备注仅为可选日常观察。', close: '关闭', addNew: '添加备注', addSuccess: '备注已添加。', removeSuccess: '备注已删除。', name: '名称', amount: '剂量', save: '保存', empty: '暂无备注。', remove: '移除', standardDose: '常用剂量', addedOn: '添加于', clinicalTitle: '当前用药（个人健康档案）', clinicalEmpty: '个人健康档案中尚无用药记录。', notesTitle: '辅助备注', notesSubtitle: '仅作观察 — 请在个人健康档案中管理临床用药。' },
    ja: { titleA: '服薬', titleB: 'メモ。', subtitle: 'Personal Health Profile が臨床の情報源です。下のメモは任意の観察です。', close: '閉じる', addNew: 'メモを追加', addSuccess: 'メモを追加しました。', removeSuccess: 'メモを削除しました。', name: '名前', amount: '用量', save: '保存', empty: 'メモはまだありません。', remove: '削除', standardDose: '一般的な用量', addedOn: '追加日', clinicalTitle: '現在の服薬（Personal Health Profile）', clinicalEmpty: 'Personal Health Profile に服薬がありません。', notesTitle: '補足メモ', notesSubtitle: '観察のみ — 臨床の服薬は Personal Health Profile で管理してください。' },
    pt: { titleA: 'Nota', titleB: 'de medicação.', subtitle: 'Seu Personal Health Profile é a fonte clínica. As notas abaixo são observações opcionais.', close: 'Fechar', addNew: 'Adicionar nota', addSuccess: 'Nota adicionada.', removeSuccess: 'Nota removida.', name: 'Nome', amount: 'Dose', save: 'Salvar', empty: 'Ainda sem notas.', remove: 'Remover', standardDose: 'Dose típica', addedOn: 'Adicionado em', clinicalTitle: 'Medicamentos atuais (Personal Health Profile)', clinicalEmpty: 'Ainda sem medicamentos no Personal Health Profile.', notesTitle: 'Notas de apoio', notesSubtitle: 'Apenas observações — gerencie medicamentos clínicos no Personal Health Profile.' },
    ar: { titleA: 'ملاحظة', titleB: 'دواء.', subtitle: 'الملف الصحي الشخصي هو المصدر السريري. الملاحظات أدناه اختيارية.', close: 'إغلاق', addNew: 'إضافة ملاحظة', addSuccess: 'تمت إضافة الملاحظة.', removeSuccess: 'تمت إزالة الملاحظة.', name: 'الاسم', amount: 'الجرعة', save: 'حفظ', empty: 'لا ملاحظات بعد.', remove: 'إزالة', standardDose: 'جرعة معتادة', addedOn: 'أُضيف في', clinicalTitle: 'الأدوية الحالية (الملف الصحي الشخصي)', clinicalEmpty: 'لا أدوية في الملف الصحي الشخصي بعد.', notesTitle: 'ملاحظات داعمة', notesSubtitle: 'ملاحظات فقط — أدِر الأدوية السريرية في الملف الصحي الشخصي.' },
    he: { titleA: 'הערת', titleB: 'תרופה.', subtitle: 'פרופיל הבריאות האישי הוא מקור האמת הקליני. ההערות למטה הן תצפיות אופציונליות.', close: 'סגירה', addNew: 'הוספת הערה', addSuccess: 'ההערה נוספה.', removeSuccess: 'ההערה הוסרה.', name: 'שם', amount: 'מינון', save: 'שמירה', empty: 'עדיין אין הערות.', remove: 'הסרה', standardDose: 'מינון טיפוסי', addedOn: 'נוסף ב', clinicalTitle: 'תרופות נוכחיות (פרופיל בריאות אישי)', clinicalEmpty: 'עדיין אין תרופות בפרופיל הבריאות האישי.', notesTitle: 'הערות תומכות', notesSubtitle: 'תצפיות בלבד — נהלי תרופות קליניות בפרופיל הבריאות האישי.' },
  };
  const copy = getLang(copyByLang, lang);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDose, setNewDose] = useState('');
  const [localMedications, setLocalMedications] = useState<Medication[]>(medications);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [phpProfile, setPhpProfile] = useState<PersonalHealthProfile | null>(null);
  const [phpMedsSummary, setPhpMedsSummary] = useState<string | null>(null);
  const [phpMeds, setPhpMeds] = useState<Array<{ name: string; dose?: string; frequency?: string }>>([]);
  const errorMapByLang: LangCopy<Record<string, string>> = {
    en: { 'Name is required.': 'Name is required.', 'This support profile already exists.': 'This support note already exists.' },
    ru: { 'Name is required.': 'Название обязательно.', 'This support profile already exists.': 'Такая заметка уже существует.' },
    uk: { 'Name is required.': "Назва обов'язкова.", 'This support profile already exists.': 'Така нотатка вже існує.' },
    es: { 'Name is required.': 'El nombre es obligatorio.', 'This support profile already exists.': 'Esta nota ya existe.' },
    fr: { 'Name is required.': 'Le nom est requis.', 'This support profile already exists.': 'Cette note existe déjà.' },
    de: { 'Name is required.': 'Name ist erforderlich.', 'This support profile already exists.': 'Diese Notiz existiert bereits.' },
    zh: { 'Name is required.': '名称为必填项。', 'This support profile already exists.': '该备注已存在。' },
    ja: { 'Name is required.': '名前は必須です。', 'This support profile already exists.': 'このメモは既に存在します。' },
    pt: { 'Name is required.': 'Nome é obrigatório.', 'This support profile already exists.': 'Esta nota já existe.' },
    ar: { 'Name is required.': 'الاسم مطلوب.', 'This support profile already exists.': 'هذه الملاحظة موجودة بالفعل.' },
    he: { 'Name is required.': 'שם הוא שדה חובה.', 'This support profile already exists.': 'ההערה הזו כבר קיימת.' },
  };

  useEffect(() => {
    setLocalMedications(medications);
  }, [medications]);

  useEffect(() => {
    let alive = true;
    void getProfile()
      .then((result) => {
        if (!alive || isProfileUnavailable(result)) return;
        setPhpProfile(result);
        setPhpMedsSummary(phpMedicationsSummary(result));
        setPhpMeds(listPhpMedications(result));
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

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
      dose,
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
    setNewName('');
    setNewDose('');
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
        <ProfilePersonalizationBadge profile={phpProfile} surface="medications" />
        <div
          data-testid="medications-php-source"
          className="rounded-2xl border border-luna-purple/20 bg-luna-purple/5 px-5 py-5 space-y-4"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-luna-purple">{copy.clinicalTitle}</p>
            <p className="text-xs text-slate-500">{phpMedsSummary || copy.clinicalEmpty}</p>
          </div>
          {phpMeds.length > 0 ? (
            <ul className="space-y-2" data-testid="medications-php-list">
              {phpMeds.map((med) => (
                <li
                  key={`${med.name}-${med.dose || ''}`}
                  className="rounded-xl bg-white/70 dark:bg-slate-900/40 px-4 py-3 flex flex-wrap items-baseline justify-between gap-2"
                >
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{med.name}</span>
                  <span className="text-xs text-slate-500">
                    {[med.dose, med.frequency].filter(Boolean).join(' · ') || copy.standardDose}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-300">{copy.clinicalEmpty}</p>
          )}
          {onOpenHealthProfile && (
            <button type="button" className={MEMBER_CHIP_ACTIVE} onClick={onOpenHealthProfile}>
              Open Personal Health Profile
            </button>
          )}
        </div>

        <header className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-6">
          <div className="space-y-1 text-center lg:text-left max-w-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{copy.notesTitle}</p>
            <p className="text-base md:text-lg font-semibold text-slate-600 dark:text-slate-300">{copy.notesSubtitle}</p>
          </div>
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
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 p-6 rounded-[2.5rem] outline-none font-bold text-xl border-2 border-transparent focus:border-luna-teal transition-all"
                  placeholder="e.g. Magnesium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{copy.amount}</label>
                <input
                  data-testid="medications-dose-input"
                  value={newDose}
                  onChange={(e) => setNewDose(e.target.value)}
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
            localMedications.map((med) => (
              <div
                data-testid={`medications-card-${med.id}`}
                key={med.id}
                className="relative luna-vivid-card p-12 rounded-[4rem] group overflow-hidden transition-all luna-vivid-hover"
              >
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-luna-teal/5 blur-3xl rounded-full" />
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Note</span>
                    <button
                      data-testid={`medications-remove-${med.id}`}
                      onClick={() => handleRemove(med.id)}
                      className="text-[8px] font-black uppercase text-rose-400 opacity-0 group-hover:opacity-100 transition-all border border-rose-100 rounded-full px-4 py-1.5"
                    >
                      {copy.remove}
                    </button>
                  </div>
                  <h4 className="text-3xl font-black uppercase tracking-tighter leading-tight">{med.name}</h4>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{med.dose || copy.standardDose}</p>
                    <p className="text-[9px] font-bold text-slate-300 italic">
                      {copy.addedOn} {new Date(med.addedAt).toLocaleDateString()}
                    </p>
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
