const pad = (n) => String(n).padStart(2, '0');

export const eventOccursOn = (event, iso) => {
  const [, m, d] = iso.split('-').map(Number);
  const [, em, ed] = event.date.split('-').map(Number);
  if (!m || !d || !em || !ed) return false;
  switch (event.recurrence) {
    case 'yearly':
      return m === em && d === ed;
    case 'monthly':
      return d === ed;
    case 'weekly': {
      const anchor = new Date(`${event.date}T12:00:00`);
      const target = new Date(`${iso}T12:00:00`);
      const diffDays = Math.round((target.getTime() - anchor.getTime()) / 86_400_000);
      return diffDays >= 0 && diffDays % 7 === 0;
    }
    case 'daily':
      return iso >= event.date;
    default:
      return iso === event.date;
  }
};

const eventDateTime = (iso, time) => {
  const t = (time || '09:00').match(/^(\d{1,2}):(\d{2})$/) ? time || '09:00' : '09:00';
  return new Date(`${iso}T${t}:00`);
};

export const buildReminderKey = (eventId, iso, minutesBefore) => `${eventId}:${iso}:${minutesBefore}`;

const wasReminderSent = (preferences, reminderKey) => (preferences?.sentReminderKeys || []).includes(reminderKey);

const markReminderSent = (preferences, reminderKey) => ({
  ...preferences,
  sentReminderKeys: [...new Set([...(preferences.sentReminderKeys || []), reminderKey])].slice(-500),
});

export const listServerReminderOccurrences = (events, windowStart, windowEnd) => {
  const out = [];
  const startIso = windowStart.toISOString().slice(0, 10);
  const endIso = windowEnd.toISOString().slice(0, 10);

  for (const event of events || []) {
    const cursor = new Date(`${startIso}T00:00:00`);
    const end = new Date(`${endIso}T23:59:59`);
    while (cursor <= end) {
      const iso = cursor.toISOString().slice(0, 10);
      if (eventOccursOn(event, iso)) {
        const base = eventDateTime(iso, event.time);
        const offsets = Array.isArray(event.remindAtMinutes) && event.remindAtMinutes.length ? event.remindAtMinutes : [0];
        for (const minutesBefore of offsets) {
          const fireAt = new Date(base.getTime() - minutesBefore * 60_000);
          if (fireAt >= windowStart && fireAt <= windowEnd) {
            out.push({
              event,
              iso,
              fireAt,
              minutesBefore,
              reminderKey: buildReminderKey(event.id, iso, minutesBefore),
            });
          }
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return out.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
};

export const dispatchDueEmailReminders = async ({ bundle, userEmail, sendEmail }) => {
  const prefs = bundle?.preferences || {};
  if (!prefs.emailReminders) return { fired: 0, bundle };
  const to = String(prefs.reminderEmail || userEmail || '').trim();
  if (!to) return { fired: 0, bundle, skipped: 'missing_email' };

  const now = new Date();
  const windowStart = new Date(now.getTime() - 10 * 60_000);
  const windowEnd = new Date(now.getTime() + 60_000);
  const occurrences = listServerReminderOccurrences(bundle.events, windowStart, windowEnd);
  let sent = 0;
  let nextPrefs = { ...prefs, sentReminderKeys: [...(prefs.sentReminderKeys || [])] };

  for (const item of occurrences) {
    if (!item.event.emailReminder) continue;
    if (wasReminderSent(nextPrefs, item.reminderKey)) continue;
    const subject = `Luna29 · ${item.event.title}`;
    const text = `${item.event.title}\n${item.iso}${item.event.time ? ` ${item.event.time}` : ''}\n${item.event.note || ''}\n\n— Luna29 Calendar`;
    const result = await sendEmail({ to, subject, text });
    if (!result.ok) continue;
    nextPrefs = markReminderSent(nextPrefs, item.reminderKey);
    sent += 1;
  }

  return {
    fired: sent,
    bundle: { ...bundle, preferences: nextPrefs, updatedAt: new Date().toISOString() },
  };
};
