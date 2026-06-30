/**
 * Optional calendar reminder emails via Resend (RESEND_API_KEY).
 */
const RESEND_API_KEY = String(process.env.RESEND_API_KEY || '').trim();
const REMINDER_FROM = String(process.env.CALENDAR_REMINDER_FROM || 'Luna29 <reminders@luna29.com>').trim();

export const isCalendarEmailEnabled = () => Boolean(RESEND_API_KEY);

export const sendCalendarReminderEmail = async ({ to, subject, text, html }) => {
  if (!RESEND_API_KEY) {
    return { ok: false, reason: 'email_not_configured' };
  }
  if (!to) {
    return { ok: false, reason: 'missing_recipient' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: REMINDER_FROM,
      to: [to],
      subject,
      text,
      html: html || `<p>${text.replace(/\n/g, '<br/>')}</p>`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    return { ok: false, reason: detail || `http_${response.status}` };
  }

  return { ok: true };
};
