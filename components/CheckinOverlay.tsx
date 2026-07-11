import React, { useState } from 'react';
import { Language, TranslationSchema } from '../constants';
import { Logo } from './Logo';
import { CheckinBlock } from './CheckinBlock';

export type CheckinClinicalState = {
  symptoms: string[];
  isPeriod: boolean;
  periodEvent: 'started' | 'ended' | null;
  flow: 'none' | 'light' | 'medium' | 'heavy' | '';
  intensity: number;
  notes: string;
};

export const DEFAULT_CHECKIN_CLINICAL: CheckinClinicalState = {
  symptoms: [],
  isPeriod: false,
  periodEvent: null,
  flow: '',
  intensity: 3,
  notes: '',
};

const SYMPTOM_OPTIONS = [
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'brain_fog', label: 'Brain fog' },
  { id: 'irritability', label: 'Irritability' },
  { id: 'anxiety', label: 'Anxiety' },
  { id: 'cramps', label: 'Cramps' },
  { id: 'headache', label: 'Headache' },
  { id: 'bloating', label: 'Bloating' },
  { id: 'breast_tenderness', label: 'Breast tenderness' },
] as const;

const FLOW_OPTIONS: Array<{ id: CheckinClinicalState['flow']; label: string }> = [
  { id: 'none', label: 'None' },
  { id: 'light', label: 'Light' },
  { id: 'medium', label: 'Medium' },
  { id: 'heavy', label: 'Heavy' },
];

interface CheckinOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  ui: TranslationSchema;
  lang: Language;
  checkinData: Record<string, number>;
  setCheckinData: (next: Record<string, number>) => void;
  clinical: CheckinClinicalState;
  setClinical: (next: CheckinClinicalState) => void;
  onSave: () => void;
  onSaveAndBridge: () => void;
}

export const CheckinOverlay: React.FC<CheckinOverlayProps> = ({
  isOpen,
  onClose,
  ui,
  checkinData,
  setCheckinData,
  clinical,
  setClinical,
  onSave,
  onSaveAndBridge,
}) => {
  if (!isOpen) return null;

  const toggleSymptom = (id: string) => {
    const next = clinical.symptoms.includes(id)
      ? clinical.symptoms.filter((s) => s !== id)
      : [...clinical.symptoms, id];
    setClinical({ ...clinical, symptoms: next });
  };

  return (
    <div className="fixed inset-0 z-[600] bg-slate-200/98 dark:bg-slate-950/98 backdrop-blur-2xl p-6 overflow-y-auto animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto py-12 space-y-12">
        <header className="flex justify-between items-center">
          <Logo size="sm" />
          <button data-testid="checkin-close" onClick={onClose} className="w-14 h-14 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-luna-rich hover:bg-slate-50 transition-all text-3xl font-light border border-slate-300">×</button>
        </header>
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black uppercase tracking-tight text-slate-950 dark:text-white leading-tight">{ui.checkinOverlay.headline}</h2>
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400 italic">{ui.checkinOverlay.subheadline}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/60 dark:bg-slate-900/40 p-12 rounded-[4rem] border-2 border-white dark:border-slate-800 shadow-luna-inset">
          {(Object.keys(ui.checkin) as Array<keyof TranslationSchema['checkin']>).map((key) => (
            <CheckinBlock
              key={key}
              label={ui.checkin[key].label}
              value={checkinData[key]}
              onChange={(val) => setCheckinData({ ...checkinData, [key]: val })}
              minLabel={ui.checkin[key].min}
              maxLabel={ui.checkin[key].max}
            />
          ))}
        </div>

        <section className="bg-white/60 dark:bg-slate-900/40 p-8 md:p-10 rounded-[3rem] border-2 border-white dark:border-slate-800 space-y-6" data-testid="checkin-clinical">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Symptoms</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((opt) => {
                const active = clinical.symptoms.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    data-testid={`checkin-symptom-${opt.id}`}
                    onClick={() => toggleSymptom(opt.id)}
                    className={`px-3 py-2 rounded-full text-xs font-bold border min-h-[40px] ${
                      active
                        ? 'bg-luna-purple text-white border-luna-purple'
                        : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
              <input
                type="checkbox"
                data-testid="checkin-is-period"
                checked={clinical.isPeriod}
                onChange={(e) =>
                  setClinical({
                    ...clinical,
                    isPeriod: e.target.checked,
                    periodEvent: e.target.checked ? clinical.periodEvent || 'started' : null,
                    flow: e.target.checked ? clinical.flow || 'medium' : '',
                  })
                }
              />
              Period today
            </label>
            <div className="flex flex-wrap gap-2">
              {(['started', 'ended'] as const).map((event) => (
                <button
                  key={event}
                  type="button"
                  data-testid={`checkin-period-${event}`}
                  disabled={!clinical.isPeriod && event === 'started' ? false : false}
                  onClick={() =>
                    setClinical({
                      ...clinical,
                      isPeriod: event === 'started' ? true : clinical.isPeriod,
                      periodEvent: event,
                    })
                  }
                  className={`px-3 py-2 rounded-full text-xs font-bold border min-h-[40px] ${
                    clinical.periodEvent === event
                      ? 'bg-luna-purple text-white border-luna-purple'
                      : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  Period {event}
                </button>
              ))}
            </div>
          </div>

          {(clinical.isPeriod || clinical.periodEvent) && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Flow</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {FLOW_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    data-testid={`checkin-flow-${opt.id}`}
                    onClick={() => setClinical({ ...clinical, flow: opt.id })}
                    className={`px-3 py-2 rounded-full text-xs font-bold border min-h-[40px] ${
                      clinical.flow === opt.id
                        ? 'bg-luna-purple text-white border-luna-purple'
                        : 'bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-2">
              Intensity ({clinical.intensity}/5)
            </label>
            <input
              type="range"
              min={1}
              max={5}
              value={clinical.intensity}
              data-testid="checkin-intensity"
              onChange={(e) => setClinical({ ...clinical, intensity: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">Notes</span>
            <textarea
              data-testid="checkin-notes"
              value={clinical.notes}
              onChange={(e) => setClinical({ ...clinical, notes: e.target.value })}
              className="mt-2 w-full min-h-[96px] rounded-2xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-4 py-3 text-sm"
              placeholder="Optional notes for today"
            />
          </label>
        </section>

        <div className="flex flex-col gap-4">
          <button data-testid="checkin-save" onClick={onSave} className="w-full py-8 bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black text-2xl rounded-full shadow-luna-deep transition-all active:scale-95">
            {ui.checkinOverlay.save}
          </button>
          <button data-testid="checkin-save-and-bridge" onClick={onSaveAndBridge} className="w-full py-4 bg-luna-purple/10 text-luna-purple font-black text-sm uppercase tracking-widest rounded-full border-2 border-luna-purple/20 transition-all hover:bg-luna-purple/20">
            {ui.checkinOverlay.saveAndBridge}
          </button>
        </div>
      </div>
    </div>
  );
};
