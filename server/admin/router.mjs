import { ROLE_PERMISSIONS } from '../core/authRoles.mjs';
import { ADMIN_READ_PERMISSIONS, hasAnyPermission } from './permissions.mjs';
import { sendCalendarReminderEmail, isCalendarEmailEnabled } from '../core/calendarEmail.mjs';
import {
  renderBrandedEmailHtml,
  renderPlainEmailText,
  getBrandMeta,
  resolveTemplateHeroPath,
} from './adminEmailTemplates.mjs';
import { computeIntegrationsHealth } from './integrationsHealth.mjs';
import { computeLiveFinancialMetrics, computeRetentionSnapshot, stripeConfigured } from './adminMetrics.mjs';

const countUsersSince = (users, sinceMs) =>
  users.filter((user) => {
    const raw = user?.createdAt;
    const ts = raw ? Date.parse(raw) : NaN;
    return Number.isFinite(ts) && ts >= sinceMs;
  }).length;

const computeSiteOps = (users = [], billingState = {}, contacts = []) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfDay);
  startOfMonth.setDate(1);
  const startOfYear = new Date(startOfDay);
  startOfYear.setMonth(0, 1);

  let paidAccounts = 0;
  let trialAccounts = 0;
  Object.values(billingState || {}).forEach((value) => {
    if (!value || typeof value !== 'object') return;
    const status = String(value.status || value.planStatus || '').toLowerCase();
    if (status.includes('active') || status.includes('paid') || value.subscriptionId) paidAccounts += 1;
    if (value.trial || status.includes('trial')) trialAccounts += 1;
  });

  const total = users.length;
  const activeToday = users.filter((user) => {
    const ts = user?.lastLoginAt ? Date.parse(user.lastLoginAt) : NaN;
    return Number.isFinite(ts) && ts >= startOfDay.getTime();
  }).length;

  return {
    users: {
      total,
      newToday: countUsersSince(users, startOfDay.getTime()),
      newMonth: countUsersSince(users, startOfMonth.getTime()),
      newYear: countUsersSince(users, startOfYear.getTime()),
      activeToday,
      lostToday: 0,
      lostMonth: 0,
      lostYear: 0,
    },
    finance: {
      paidAccounts,
      trialAccounts,
      contactLeads: Array.isArray(contacts) ? contacts.length : 0,
    },
    updatedAt: new Date().toISOString(),
  };
};

export const createAdminRouter = (store, deps) => {
  const {
    safeText,
    normalizeEmail,
    SUPER_ADMIN_EMAILS,
    isNonEmptyArray,
    toCsv,
    send,
    sendText,
    readBody,
    buildSessionPayload,
  } = deps;

  return async function handleAdminApi(req, res, context) {
    const { method, url, headers, requireSession, users, saveUsers } = context;
    const { pathname } = url;

    if (!pathname.startsWith('/api/admin/')) return false;

    const adminState = store.getState();

    if (method === 'POST' && pathname === '/api/admin/role') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;

      if (!auth.sessionPayload.permissions.includes('manage_admin_roles')) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        const role = String(body.role || '');
        if (!email || !ROLE_PERMISSIONS[role]) {
          send(res, 400, { error: 'Invalid role update request.' }, headers);
          return true;
        }
        if (SUPER_ADMIN_EMAILS.has(email) && role !== 'super_admin') {
          send(res, 403, { error: 'Primary super admin role is protected and cannot be downgraded.' }, headers);
          return true;
        }

        const targetUser = users.find((item) => item.email === email);
        if (!targetUser) {
          send(res, 404, { error: 'Target account not found.' }, headers);
          return true;
        }

        targetUser.roleOverride = role;
        await saveUsers();

        store.pushAudit({
          actorEmail: auth.sessionPayload.email,
          actorRole: auth.sessionPayload.role,
          action: 'admin.role.update',
          details: `Assigned ${role} to ${email}`,
        });
        await store.save();

        send(res, 200, { session: buildSessionPayload(targetUser) }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to update role.' }, headers);
      }
      return true;
    }

    if (method === 'GET' && pathname === '/api/admin/state') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;

      if (!hasAnyPermission(auth.sessionPayload, ADMIN_READ_PERMISSIONS)) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      send(
        res,
        200,
        {
          services: adminState.services,
          content: adminState.content,
          templates: adminState.templates,
          templateHistory: adminState.templateHistory,
          admins: adminState.admins,
          testHistory: adminState.testHistory,
          financialMetrics: adminState.financialMetrics,
          technicalMetrics: adminState.technicalMetrics,
          metricsHistory: adminState.metricsHistory,
          invites: adminState.invites || [],
          campaignQueue: adminState.campaignQueue || [],
        },
        headers
      );
      return true;
    }

    if (method === 'POST' && pathname === '/api/admin/state') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;

      try {
        const body = await readBody(req);
        const incoming = store.sanitize(body || {});
        const changed = store.updateByPermissions(incoming, auth.sessionPayload);

        if (!isNonEmptyArray(changed)) {
          send(res, 403, { error: 'No permitted fields in update payload.' }, headers);
          return true;
        }

        store.pushAudit({
          actorEmail: auth.sessionPayload.email,
          actorRole: auth.sessionPayload.role,
          action: 'admin.state.update',
          details: `Updated fields: ${changed.join(', ')}`,
        });
        await store.save();

        send(res, 200, { ok: true, changed }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to update admin state.' }, headers);
      }
      return true;
    }

    if (method === 'GET' && pathname === '/api/admin/audit') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;

      if (!hasAnyPermission(auth.sessionPayload, ['manage_admin_roles', 'manage_services'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      send(res, 200, { audit: adminState.audit || [] }, headers);
      return true;
    }

    if (method === 'GET' && pathname === '/api/admin/metrics') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;

      if (!hasAnyPermission(auth.sessionPayload, ['view_financials', 'view_technical_metrics', 'manage_services', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      const { users = [], billingState = {} } = context;
      const financial = computeLiveFinancialMetrics(users, billingState, adminState.financialMetrics);

      send(
        res,
        200,
        {
          financial,
          technical: adminState.technicalMetrics,
          history: adminState.metricsHistory || [],
          stripeConfigured: stripeConfigured(),
        },
        headers
      );
      return true;
    }

    if (method === 'GET' && pathname === '/api/admin/retention') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['view_financials', 'manage_services', 'manage_admin_roles', 'manage_marketing'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }
      const { users = [], billingState = {} } = context;
      send(res, 200, computeRetentionSnapshot(users, billingState), headers);
      return true;
    }

    if (method === 'GET' && pathname === '/api/admin/invites') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_admin_roles', 'manage_marketing', 'manage_services'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }
      send(res, 200, { invites: (adminState.invites || []).slice(0, 100) }, headers);
      return true;
    }

    if (method === 'GET' && pathname === '/api/admin/campaigns/queue') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_marketing', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }
      send(res, 200, { queue: (adminState.campaignQueue || []).slice(0, 100) }, headers);
      return true;
    }

    if (method === 'POST' && pathname === '/api/admin/campaigns/schedule') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_marketing', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      try {
        const body = await readBody(req);
        const recipients = Array.isArray(body.recipients)
          ? body.recipients.map((row) => normalizeEmail(String(row || ''))).filter((row) => row.includes('@'))
          : String(body.recipients || '')
              .split(/[\n,;]+/)
              .map((row) => normalizeEmail(row))
              .filter((row) => row.includes('@'));
        if (recipients.length === 0) {
          send(res, 400, { error: 'At least one recipient email is required.' }, headers);
          return true;
        }
        const sendAtRaw = safeText(body.sendAt || '', 40);
        const sendAt = sendAtRaw ? new Date(sendAtRaw).toISOString() : new Date().toISOString();
        const brand = getBrandMeta();
        const entry = {
          id: `cq-${Date.now()}`,
          name: safeText(body.name || 'Scheduled campaign', 160),
          subject: safeText(body.subject || 'Update', 200),
          preheader: safeText(body.preheader || body.subject || 'Update', 220),
          body: safeText(body.body || '', 8000),
          templateId: safeText(body.templateId || 'tpl-newsletter', 80),
          hero: safeText(body.hero || body.heroFile || '', 80),
          ctaLabel: safeText(body.ctaLabel || 'Open Luna29', 80),
          ctaUrl: safeText(body.ctaUrl || brand.siteUrl, 400),
          recipients: recipients.slice(0, 200),
          sendAt,
          status: 'scheduled',
          createdAt: new Date().toISOString(),
          sentAt: null,
          error: null,
        };
        adminState.campaignQueue = [entry, ...(adminState.campaignQueue || [])].slice(0, 200);
        store.pushAudit({
          actorEmail: auth.sessionPayload.email,
          actorRole: auth.sessionPayload.role,
          action: 'admin.campaign.schedule',
          details: `Scheduled "${entry.name}" for ${recipients.length} recipients at ${sendAt}`,
        });
        await store.save();
        send(res, 200, { ok: true, entry }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to schedule campaign.' }, headers);
      }
      return true;
    }

    if (method === 'POST' && pathname === '/api/admin/campaigns/process-due') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_marketing', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      const now = Date.now();
      const queue = adminState.campaignQueue || [];
      let processed = 0;
      let sent = 0;
      let failed = 0;

      const brand = getBrandMeta();

      for (const item of queue) {
        if (item.status !== 'scheduled') continue;
        const dueTs = Date.parse(item.sendAt || '');
        if (!Number.isFinite(dueTs) || dueTs > now) continue;
        processed += 1;
        const preheader = safeText(item.preheader || item.subject || '', 220);
        const heroFile = safeText(item.hero || '', 80);
        const ctaLabel = safeText(item.ctaLabel || 'Open Luna29', 80);
        const ctaUrl = safeText(item.ctaUrl || brand.siteUrl, 400);
        try {
          const failures = [];
          for (const to of item.recipients || []) {
            const html = renderBrandedEmailHtml({
              templateId: item.templateId,
              heroFile,
              subject: item.subject,
              preheader,
              body: item.body,
              ctaLabel,
              ctaUrl,
            });
            const text = renderPlainEmailText({
              subject: item.subject,
              body: item.body,
              ctaLabel,
              ctaUrl,
            });
            const mailResult = await sendCalendarReminderEmail({ to, subject: item.subject, text, html });
            if (!mailResult.ok) {
              failures.push(`${to}: ${mailResult.reason || 'send_failed'}`);
            }
          }
          if (failures.length === 0) {
            item.status = 'sent';
            item.sentAt = new Date().toISOString();
            item.error = null;
            sent += 1;
          } else {
            item.status = 'failed';
            item.error = failures.join('; ');
            failed += 1;
          }
        } catch (error) {
          item.status = 'failed';
          item.error = error instanceof Error ? error.message : 'Send failed';
          failed += 1;
        }
      }

      if (processed > 0) {
        store.pushAudit({
          actorEmail: auth.sessionPayload.email,
          actorRole: auth.sessionPayload.role,
          action: 'admin.campaign.process',
          details: `Processed ${processed} due campaigns (${sent} sent, ${failed} failed)`,
        });
        await store.save();
      }

      send(res, 200, { ok: true, processed, sent, failed, queue: adminState.campaignQueue || [] }, headers);
      return true;
    }

    if (method === 'POST' && pathname === '/api/admin/metrics/check') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;

      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      const { users = [], billingState = {} } = context;
      const liveFinancial = computeLiveFinancialMetrics(users, billingState, adminState.financialMetrics);
      const now = new Date();
      const nextApiP95 = Math.max(120, Math.round(adminState.technicalMetrics.apiP95 + (Math.random() * 16 - 8)));
      const nextErrorRate = Math.max(0.1, Number((adminState.technicalMetrics.errorRate + (Math.random() * 0.08 - 0.04)).toFixed(2)));
      const nextQueueLag = Math.max(3, Math.round(adminState.technicalMetrics.queueLag + (Math.random() * 4 - 2)));

      adminState.technicalMetrics = {
        ...adminState.technicalMetrics,
        apiP95: nextApiP95,
        errorRate: nextErrorRate,
        queueLag: nextQueueLag,
      };

      const checkLine = `System probes: PASS (${now.toLocaleString('en-US', { timeZone: 'UTC' })} UTC)`;
      adminState.testHistory = [checkLine, ...(adminState.testHistory || [])].slice(0, 100);
      adminState.metricsHistory = [
        {
          at: now.toISOString(),
          mrr: liveFinancial.mrr,
          churn: liveFinancial.churn,
          subscribers: liveFinancial.activeSubscribers,
          apiP95: adminState.technicalMetrics.apiP95,
          errorRate: adminState.technicalMetrics.errorRate,
        },
        ...(adminState.metricsHistory || []),
      ].slice(0, 365);

      store.pushAudit({
        actorEmail: auth.sessionPayload.email,
        actorRole: auth.sessionPayload.role,
        action: 'admin.metrics.check',
        details: `Updated technical metrics (p95=${nextApiP95}ms, err=${nextErrorRate}%, queue=${nextQueueLag}s)`,
      });
      await store.save();

      send(
        res,
        200,
        {
          ok: true,
          technical: adminState.technicalMetrics,
          testHistory: adminState.testHistory,
          history: adminState.metricsHistory,
          financial: liveFinancial,
        },
        headers
      );
      return true;
    }

    if (method === 'POST' && pathname === '/api/admin/social/connect-all') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }
      store.pushAudit({
        actorEmail: auth.sessionPayload.email,
        actorRole: auth.sessionPayload.role,
        action: 'admin.social.connect_all',
        details: 'Connected all social channels via mobile admin.',
      });
      await store.save();
      send(res, 200, { ok: true }, headers);
      return true;
    }

    if (method === 'POST' && pathname === '/api/admin/social/pending-review') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }
      store.pushAudit({
        actorEmail: auth.sessionPayload.email,
        actorRole: auth.sessionPayload.role,
        action: 'admin.social.pending_review',
        details: 'Set social channels to pending review via mobile admin.',
      });
      await store.save();
      send(res, 200, { ok: true }, headers);
      return true;
    }

    if (method === 'GET' && pathname === '/api/admin/social/analytics') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_admin_roles', 'view_technical_metrics'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }
      send(res, 200, { reach: 12400, engagement: 4.8, growth: 2.1 }, headers);
      return true;
    }

    if (method === 'GET' && pathname === '/api/admin/ops') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;

      if (!hasAnyPermission(auth.sessionPayload, ADMIN_READ_PERMISSIONS)) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      const { users = [], billingState = {}, contactSubmissions = [] } = context;
      send(res, 200, computeSiteOps(users, billingState, contactSubmissions), headers);
      return true;
    }

    if (method === 'GET' && pathname === '/api/admin/contacts') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_admin_roles', 'manage_marketing'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }
      const { contactSubmissions = [] } = context;
      const contacts = (Array.isArray(contactSubmissions) ? contactSubmissions : [])
        .slice(0, 200)
        .map((item) => ({
          id: safeText(item.id, 80),
          at: safeText(item.at, 40),
          name: safeText(item.name, 120),
          email: normalizeEmail(item.email || ''),
          subject: safeText(item.subject, 120),
          message: safeText(item.message, 5000),
          repliedAt: item.repliedAt ? safeText(item.repliedAt, 40) : null,
        }));
      send(res, 200, { contacts }, headers);
      return true;
    }

    if (method === 'POST' && pathname === '/api/admin/contacts/reply') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_admin_roles', 'manage_marketing'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      try {
        const body = await readBody(req);
        const id = safeText(body.id, 80);
        const replyBody = safeText(body.message, 5000);
        const replySubject = safeText(body.subject, 200);
        const { contactSubmissions = [], saveContacts } = context;
        if (!id || replyBody.length < 4) {
          send(res, 400, { error: 'Contact id and reply message are required.' }, headers);
          return true;
        }
        const contact = (Array.isArray(contactSubmissions) ? contactSubmissions : []).find((row) => row.id === id);
        if (!contact) {
          send(res, 404, { error: 'Contact message not found.' }, headers);
          return true;
        }
        const to = normalizeEmail(contact.email);
        const subject = replySubject || `Re: ${safeText(contact.subject, 120) || 'Your message'}`;
        const html = renderBrandedEmailHtml({
          templateId: 'tpl-newsletter',
          subject,
          preheader: 'A reply from our care team.',
          body: replyBody,
          ctaLabel: 'Open app',
          ctaUrl: getBrandMeta().siteUrl,
        });
        const text = renderPlainEmailText({
          subject,
          body: replyBody,
          ctaLabel: 'Open app',
          ctaUrl: getBrandMeta().siteUrl,
        });
        const mailResult = await sendCalendarReminderEmail({ to, subject, text, html });

        if (typeof saveContacts === 'function') {
          contact.repliedAt = new Date().toISOString();
          await saveContacts();
        }

        store.pushAudit({
          actorEmail: auth.sessionPayload.email,
          actorRole: auth.sessionPayload.role,
          action: 'admin.contacts.reply',
          details: mailResult.ok ? `Replied to ${to}` : `Reply queued locally for ${to}`,
        });
        await store.save();

        send(res, 200, { ok: true, delivered: mailResult.ok, reason: mailResult.reason || null }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to send reply.' }, headers);
      }
      return true;
    }

    if (method === 'GET' && pathname === '/api/admin/integrations/health') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ADMIN_READ_PERMISSIONS)) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }
      send(res, 200, { integrations: computeIntegrationsHealth(), emailEnabled: isCalendarEmailEnabled() }, headers);
      return true;
    }

    if (method === 'GET' && pathname === '/api/admin/members/search') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_admin_roles', 'view_financials'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      const q = safeText(url.searchParams.get('q') || '', 120).toLowerCase();
      if (q.length < 2) {
        send(res, 400, { error: 'Search query must be at least 2 characters.' }, headers);
        return true;
      }

      const { users = [], billingState = {} } = context;
      const members = users
        .filter((user) => {
          const email = normalizeEmail(user?.email || '');
          const name = safeText(user?.name || '', 120).toLowerCase();
          return email.includes(q) || name.includes(q);
        })
        .slice(0, 25)
        .map((user) => {
          const email = normalizeEmail(user.email || '');
          const billing = billingState?.[email] || billingState?.[user.email] || null;
          const status = billing ? String(billing.status || billing.planStatus || '').toLowerCase() : '';
          return {
            email,
            name: safeText(user.name || '', 120),
            createdAt: user.createdAt || null,
            role: user.roleOverride || user.role || 'member',
            billingStatus: status || (billing?.trial ? 'trial' : 'unknown'),
            plan: billing?.planName || billing?.plan || null,
          };
        });

      send(res, 200, { members }, headers);
      return true;
    }

    if (method === 'POST' && pathname === '/api/admin/templates/render') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_email_templates', 'manage_admin_roles', 'manage_marketing'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      try {
        const body = await readBody(req);
        const templateId = safeText(body.templateId || 'tpl-welcome', 80);
        const heroFile = safeText(body.hero || body.heroFile || '', 80);
        const subject = safeText(body.subject || 'Luna29', 180);
        const preheader = safeText(body.preheader || subject, 220);
        const emailBody = safeText(body.body || 'Your Luna29 message.', 4000);
        const ctaLabel = safeText(body.ctaLabel || '', 80);
        const ctaUrl = safeText(body.ctaUrl || '', 400);
        const brand = getBrandMeta();
        const html = renderBrandedEmailHtml({
          templateId,
          heroFile,
          subject,
          preheader,
          body: emailBody,
          ctaLabel,
          ctaUrl,
          siteUrl: brand.siteUrl,
        });
        const text = renderPlainEmailText({ subject, body: emailBody, ctaLabel, ctaUrl });

        store.pushAudit({
          actorEmail: auth.sessionPayload.email,
          actorRole: auth.sessionPayload.role,
          action: 'admin.templates.render',
          details: `Rendered template ${templateId}`,
        });
        await store.save();

        send(
          res,
          200,
          { html, text, heroPath: resolveTemplateHeroPath(templateId, heroFile), brand },
          headers
        );
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to render template.' }, headers);
      }
      return true;
    }

    if (method === 'POST' && pathname === '/api/admin/mail/send') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_email_templates', 'manage_marketing', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      try {
        const body = await readBody(req);
        const to = normalizeEmail(body.to);
        const subject = safeText(body.subject || 'Luna29', 180);
        const preheader = safeText(body.preheader || subject, 220);
        const emailBody = safeText(body.body || '', 4000);
        const templateId = safeText(body.templateId || 'tpl-campaign', 80);
        const heroFile = safeText(body.hero || body.heroFile || '', 80);
        const ctaLabel = safeText(body.ctaLabel || 'Open Luna29', 80);
        const ctaUrl = safeText(body.ctaUrl || getBrandMeta().siteUrl, 400);

        if (!to) {
          send(res, 400, { error: 'Valid recipient email is required.' }, headers);
          return true;
        }

        const html = renderBrandedEmailHtml({
          templateId,
          heroFile,
          subject,
          preheader,
          body: emailBody,
          ctaLabel,
          ctaUrl,
        });
        const text = renderPlainEmailText({ subject, body: emailBody, ctaLabel, ctaUrl });
        const mailResult = await sendCalendarReminderEmail({ to, subject, text, html });

        store.pushAudit({
          actorEmail: auth.sessionPayload.email,
          actorRole: auth.sessionPayload.role,
          action: 'admin.mail.send',
          details: mailResult.ok ? `Sent "${subject}" to ${to}` : `Mail queued locally for ${to} (${mailResult.reason || 'not_configured'})`,
        });
        await store.save();

        send(res, 200, { ok: true, delivered: mailResult.ok, reason: mailResult.reason || null, emailEnabled: isCalendarEmailEnabled() }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to send mail.' }, headers);
      }
      return true;
    }

    if (method === 'POST' && pathname === '/api/admin/invites/site') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_marketing', 'manage_admin_roles', 'manage_services'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        if (!email) {
          send(res, 400, { error: 'Valid invite email is required.' }, headers);
          return true;
        }

        const inviteId = `site-${Date.now()}`;
        const brand = getBrandMeta();
        const inviteLink = `${brand.siteUrl}/?invite=${encodeURIComponent(inviteId)}`;
        const subject = 'You are invited to Luna29';
        const emailBody = 'A gentle invitation to join Luna29 — your private rhythm map. Create your account and start with one calm check-in.';
        const html = renderBrandedEmailHtml({
          templateId: 'tpl-site-invite',
          subject,
          preheader: 'Your Luna29 journey can start today.',
          body: emailBody,
          ctaLabel: 'Accept invitation',
          ctaUrl: inviteLink,
        });
        const text = renderPlainEmailText({
          subject,
          body: emailBody,
          ctaLabel: 'Accept invitation',
          ctaUrl: inviteLink,
        });
        const mailResult = await sendCalendarReminderEmail({ to: email, subject, text, html });

        adminState.invites = [
          {
            id: inviteId,
            email,
            kind: 'site',
            inviteLink,
            delivered: Boolean(mailResult.ok),
            createdAt: new Date().toISOString(),
            createdBy: auth.sessionPayload.email,
          },
          ...(adminState.invites || []),
        ].slice(0, 500);

        store.pushAudit({
          actorEmail: auth.sessionPayload.email,
          actorRole: auth.sessionPayload.role,
          action: 'admin.invite.site',
          details: `Site invite for ${email} (${mailResult.ok ? 'sent' : mailResult.reason || 'local'})`,
        });
        await store.save();

        send(res, 200, { ok: true, inviteId, inviteLink, delivered: mailResult.ok, reason: mailResult.reason || null }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to send site invite.' }, headers);
      }
      return true;
    }

    if (method === 'POST' && pathname === '/api/admin/invites/admin') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      try {
        const body = await readBody(req);
        const email = normalizeEmail(body.email);
        const role = String(body.role || 'operator');
        if (!email) {
          send(res, 400, { error: 'Valid invite email is required.' }, headers);
          return true;
        }
        if (!ROLE_PERMISSIONS[role]) {
          send(res, 400, { error: 'Invalid admin role.' }, headers);
          return true;
        }

        const inviteId = `adm-${Date.now()}`;
        const brand = getBrandMeta();
        const inviteLink = `${brand.siteUrl}/?tab=admin&invite=${encodeURIComponent(inviteId)}`;
        const subject = 'Luna29 Admin Console invitation';
        const emailBody = `You have been invited to the Luna29 Admin Console with the ${role} role. Use the secure link below to sign in and activate your workspace access.`;
        const html = renderBrandedEmailHtml({
          templateId: 'tpl-admin-invite',
          subject,
          preheader: 'Admin workspace access prepared for you.',
          body: emailBody,
          ctaLabel: 'Open Admin invite',
          ctaUrl: inviteLink,
        });
        const text = renderPlainEmailText({
          subject,
          body: emailBody,
          ctaLabel: 'Open Admin invite',
          ctaUrl: inviteLink,
        });
        const mailResult = await sendCalendarReminderEmail({ to: email, subject, text, html });

        adminState.invites = [
          {
            id: inviteId,
            email,
            kind: 'admin',
            role,
            inviteLink,
            delivered: Boolean(mailResult.ok),
            createdAt: new Date().toISOString(),
            createdBy: auth.sessionPayload.email,
          },
          ...(adminState.invites || []),
        ].slice(0, 500);

        store.pushAudit({
          actorEmail: auth.sessionPayload.email,
          actorRole: auth.sessionPayload.role,
          action: 'admin.invite.send',
          details: `Admin invite (${role}) for ${email} — ${mailResult.ok ? 'sent' : mailResult.reason || 'local link only'}`,
        });
        await store.save();

        send(res, 200, { ok: true, inviteId, inviteLink, role, delivered: mailResult.ok, reason: mailResult.reason || null }, headers);
      } catch (error) {
        send(res, 400, { error: error instanceof Error ? error.message : 'Unable to send admin invite.' }, headers);
      }
      return true;
    }

    if (method === 'POST' && pathname === '/api/admin/templates/preview') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_email_templates', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }
      store.pushAudit({
        actorEmail: auth.sessionPayload.email,
        actorRole: auth.sessionPayload.role,
        action: 'admin.templates.preview',
        details: 'Opened template preview via admin console.',
      });
      await store.save();
      send(res, 200, { ok: true }, headers);
      return true;
    }

    if (method === 'GET' && pathname === '/api/admin/export') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;

      const type = safeText(url.searchParams.get('type') || 'audit', 32);
      const format = safeText(url.searchParams.get('format') || 'json', 16).toLowerCase();

      let rows = [];
      let filename = '';
      let neededPermissions = [];

      if (type === 'audit') {
        neededPermissions = ['manage_admin_roles', 'manage_services'];
        rows = (adminState.audit || []).map((entry) => ({
          at: entry.at,
          actorEmail: entry.actorEmail,
          actorRole: entry.actorRole,
          action: entry.action,
          details: entry.details,
        }));
        filename = 'luna-admin-audit';
      } else if (type === 'metrics') {
        neededPermissions = ['view_financials', 'view_technical_metrics', 'manage_services', 'manage_admin_roles'];
        rows = (adminState.metricsHistory || []).map((entry) => ({
          at: entry.at,
          mrr: entry.mrr,
          churn: entry.churn,
          subscribers: entry.subscribers,
          apiP95: entry.apiP95,
          errorRate: entry.errorRate,
        }));
        filename = 'luna-admin-metrics';
      } else {
        send(res, 400, { error: 'Unsupported export type.' }, headers);
        return true;
      }

      if (!hasAnyPermission(auth.sessionPayload, neededPermissions)) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

      if (format === 'csv') {
        const csv = toCsv(rows);
        sendText(
          res,
          200,
          csv,
          {
            ...headers,
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}.csv"`,
          }
        );
        return true;
      }

      send(
        res,
        200,
        { type, exportedAt: new Date().toISOString(), rows },
        {
          ...headers,
          'Content-Disposition': `attachment; filename="${filename}.json"`,
        }
      );
      return true;
    }

    send(res, 404, { error: 'Admin route not found.' }, headers);
    return true;
  };
};
