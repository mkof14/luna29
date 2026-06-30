import React from 'react';
import { Language } from '../constants';
import { HealthEvent } from '../types';
import { LunaRhythmCalendar } from './LunaRhythmCalendar';

interface LunaRhythmCalendarViewProps {
  lang: Language;
  log: HealthEvent[];
  currentCycleDay: number;
  cycleLength: number;
  onBack?: () => void;
  memberEmail?: string;
  syncEnabled?: boolean;
}

export const LunaRhythmCalendarView: React.FC<LunaRhythmCalendarViewProps> = (props) => (
  <article className="max-w-6xl mx-auto pb-24 animate-in fade-in duration-500">
    <LunaRhythmCalendar {...props} mode="page" />
  </article>
);
