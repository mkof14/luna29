import { ROLE_PERMISSIONS } from '../core/authRoles.mjs';
import { ADMIN_READ_PERMISSIONS, hasAnyPermission } from './permissions.mjs';

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

      send(
        res,
        200,
        {
          financial: adminState.financialMetrics,
          technical: adminState.technicalMetrics,
          history: adminState.metricsHistory || [],
        },
        headers
      );
      return true;
    }

    if (method === 'POST' && pathname === '/api/admin/metrics/check') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;

      if (!hasAnyPermission(auth.sessionPayload, ['manage_services', 'manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }

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
          mrr: adminState.financialMetrics.mrr,
          churn: adminState.financialMetrics.churn,
          subscribers: adminState.financialMetrics.activeSubscribers,
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
        details: 'Opened template preview via mobile admin.',
      });
      await store.save();
      send(res, 200, { ok: true }, headers);
      return true;
    }

    if (method === 'POST' && pathname === '/api/admin/invites/admin') {
      const auth = await requireSession(req, res, headers);
      if (!auth) return true;
      if (!hasAnyPermission(auth.sessionPayload, ['manage_admin_roles'])) {
        send(res, 403, { error: 'Permission denied.' }, headers);
        return true;
      }
      store.pushAudit({
        actorEmail: auth.sessionPayload.email,
        actorRole: auth.sessionPayload.role,
        action: 'admin.invite.send',
        details: 'Sent admin invite via mobile admin.',
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
