import React from 'react';
import { Language } from '../constants';
import { HealthProfileIntake } from './healthProfile/HealthProfileIntake';

type Props = { lang: Language; showIntro?: boolean };

/**
 * Personal Health Profile entry component.
 * Medical-intake UX; APIs/storage/completion unchanged.
 * `showIntro` retained for call-site compatibility (hero lives inside intake).
 */
export const HealthProfilePanel: React.FC<Props> = ({ lang }) => <HealthProfileIntake lang={lang} />;

export default HealthProfilePanel;
