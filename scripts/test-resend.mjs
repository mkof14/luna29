#!/usr/bin/env node
/**
 * Send a one-off calendar reminder test email via Resend.
 * Usage: node --env-file-if-exists=.env.local scripts/test-resend.mjs [recipient]
 */
import { sendCalendarReminderEmail, isCalendarEmailEnabled } from '../server/core/calendarEmail.mjs';

const to = (process.argv[2] || process.env.SUPER_ADMIN_EMAILS || '').split(',')[0]?.trim();

if (!isCalendarEmailEnabled()) {
  console.error('RESEND_API_KEY is not set.');
  process.exit(1);
}

if (!to) {
  console.error('Pass recipient email or set SUPER_ADMIN_EMAILS.');
  process.exit(1);
}

const result = await sendCalendarReminderEmail({
  to,
  subject: 'Luna29 — Resend production test',
  text: 'This is an automated Resend test from Luna29. Calendar email reminders are configured.',
});

if (!result.ok) {
  console.error('Resend test failed:', result.reason);
  process.exit(1);
}

console.log(`Resend test email sent to ${to}`);
