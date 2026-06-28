export const reminderMessages = [
  'A quiet moment with Luna29 tonight.',
  'How did today feel for you?',
  'Take a minute to reflect.',
];

export function getReminderPreview(dayOfMonth: number): string {
  return reminderMessages[dayOfMonth % reminderMessages.length];
}
