import React from 'react';
import { HealthProfileIncompleteNotice } from './HealthProfileIncompleteNotice';

type Props = { onOpenProfile?: () => void };

/** Today secondary entry — never outranks primary check-in. */
export const HealthProfileTodayPrompt: React.FC<Props> = ({ onOpenProfile }) => (
  <HealthProfileIncompleteNotice variant="today" onContinue={onOpenProfile} />
);

export default HealthProfileTodayPrompt;
