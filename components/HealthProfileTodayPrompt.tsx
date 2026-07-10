import React, { useEffect, useState } from 'react';
import { trackEvent } from '../services/analyticsService';
import {
  getCompletion,
  getNextQuestion,
  isProfileUnavailable,
  ProfileQuestion,
  respondQuestion,
} from '../services/personalHealthProfileService';

type Props = { onOpenProfile?: () => void };
const bucket = (percent: number) => `${Math.min(100, Math.floor(percent / 25) * 25)}_to_${Math.min(100, Math.floor(percent / 25) * 25 + 24)}`;

/** Secondary Today prompt only; the primary check-in remains untouched. */
export const HealthProfileTodayPrompt: React.FC<Props> = ({ onOpenProfile }) => {
  const [completion, setCompletion] = useState<number | null>(null);
  const [question, setQuestion] = useState<ProfileQuestion | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([getCompletion(), getNextQuestion('today')]).then(([completionResult, questionResult]) => {
      if (!active || isProfileUnavailable(completionResult) || isProfileUnavailable(questionResult)) return;
      const percent = Number(completionResult.completion_percent || 0);
      setCompletion(percent);
      setQuestion(questionResult.question || null);
      if (questionResult.question) {
        trackEvent('profile_question_shown', { surface: 'today', section_id: questionResult.question.section, action: 'show', result: 'ok', completion_bucket: bucket(percent) });
      }
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  if (completion == null) return null;
  const label = question ? (question.section === 'sleep' ? 'Add your sleep routine for more relevant daily context.' : question.prompt) : 'Your profile is ready for basic personalization.';
  const dismiss = async () => {
    if (!question) return;
    try {
      await respondQuestion(question.id, 'not_now');
      trackEvent('profile_question_skipped', { surface: 'today', section_id: question.section, action: 'not_now', result: 'ok', completion_bucket: bucket(completion) });
      setQuestion(null);
    } catch { /* non-blocking */ }
  };
  return <div data-testid="health-profile-today-prompt" className="rounded-xl border border-luna-purple/20 bg-luna-purple/5 px-4 py-3 space-y-2">
    <p className="text-sm font-medium text-slate-700 dark:text-slate-100">{label}</p>
    <div className="flex flex-wrap gap-3">
      {onOpenProfile && <button type="button" onClick={onOpenProfile} className="text-[10px] font-black uppercase tracking-[0.12em] text-luna-purple">Open profile</button>}
      {question && <button type="button" onClick={() => void dismiss()} className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Not now</button>}
    </div>
  </div>;
};

export default HealthProfileTodayPrompt;
