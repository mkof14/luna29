import { DEFAULT_CYCLE_LENGTH } from '../constants/appDefaults';
import { HealthEvent } from '../types';

/** Sample events for the public calendar preview (no auth required). */
export const buildPublicCalendarDemoLog = (): HealthEvent[] => {
  const now = new Date();
  const events: HealthEvent[] = [];

  const anchor = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13, 9, 0, 0);
  events.push({
    id: 'public-demo-cycle-sync',
    timestamp: anchor.toISOString(),
    type: 'CYCLE_SYNC',
    version: 1,
    payload: { day: 1, length: DEFAULT_CYCLE_LENGTH },
  });

  for (let offset = 0; offset < 28; offset += 2) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset, 18, 30, 0);
    events.push({
      id: `public-demo-checkin-${offset}`,
      timestamp: day.toISOString(),
      type: 'DAILY_CHECKIN',
      version: 1,
      payload: {
        metrics: { energy: 42 + (offset % 5) * 8, mood: 48 + (offset % 4) * 6, sleep: 44 + (offset % 6) * 5 },
        symptoms: [],
        isPeriod: offset >= 20,
      },
    });
  }

  for (let offset = 1; offset < 21; offset += 5) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset, 20, 15, 0);
    events.push({
      id: `public-demo-voice-${offset}`,
      timestamp: day.toISOString(),
      type: 'AUDIO_REFLECTION',
      version: 1,
      payload: { text: 'A calm evening note — preview only.' },
    });
  }

  return events;
};

export const PUBLIC_CALENDAR_DEMO_CYCLE_DAY = 14;
