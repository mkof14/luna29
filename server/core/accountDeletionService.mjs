/**
 * WS2.2 — Local Postgres account deletion cascade.
 *
 * Orchestrates delete/anonymize of Luna-owned user-scoped rows.
 * No Stripe external API calls. No client purge. No route-level SQL.
 * Uses the shared Postgres pool/client only (never creates a new Pool).
 *
 * Historical email limitation: contacts/invites/privacy rows are keyed by the
 * account's current email only. There is no durable previous-email or identity
 * provider history table. Cascade does not invent historical identities and
 * does not claim deletion of records under unknown prior emails.
 */

import { createHash } from 'node:crypto';
import { deletePersonalEventsForUser } from './personalEventsStore.mjs';
import { deleteMemoryConsentForUser } from './memoryConsentStore.mjs';
import { deletePersonalHealthProfileForUser } from './personalHealthProfileStore.mjs';
import { deleteCalendarBundleForUser } from './calendarUserDataStore.mjs';
import { deleteAllMobileReflectionsForUser } from './mobileReflectionsStore.mjs';
import { deleteAllMobileReportsForUser } from './mobileReportsStore.mjs';
import { deleteAllMobileUserStateForUser } from './mobileUserStateStore.mjs';
import { deleteAllMobilePushTokensForUser } from './mobilePushStore.mjs';
import { deleteBillingAccountByUserId } from './billingAccountsStore.mjs';
import { deleteSubscriptionByUserId } from './billingSubscriptionsStore.mjs';
import { deleteTrialByUserId } from './billingTrialsStore.mjs';
import { deleteContactSubmissionsByEmail } from './contactSubmissionsStore.mjs';
import { revokeAndAnonymizeAdminInvitesForEmail } from './adminInvitesStore.mjs';
import {
  anonymizePrivacyRequestsForEmail,
  insertPrivacyRequest,
} from './privacyRequestsStore.mjs';
import { anonymizeAdminAuditActorEmail } from './adminAuditStore.mjs';
import { deleteSessionsForUserFromPostgres } from './authSessionsStore.mjs';
import { deleteUserFromPostgres } from './authUsersStore.mjs';

/** Best-effort cleanup of legacy luna_trials rows (unused by billing_trials path). */
const deleteLegacyLunaTrialsForUser = async (client, userId) => {
  try {
    const result = await client.query(`DELETE FROM luna_trials WHERE user_id = $1`, [
      String(userId),
    ]);
    return Number(result.rowCount || 0);
  } catch (error) {
    // Table may not exist in some envs; do not fail cascade for unused legacy table.
    if (error?.code === '42P01') return 0;
    throw error;
  }
};

export const ACCOUNT_DELETION_FAILED = 'ACCOUNT_DELETION_FAILED';

/** Stable non-PII marker for anonymized email columns (email NOT NULL schemas). */
export const deletedUserEmailMarker = (userId) => {
  const hash = createHash('sha256').update(String(userId || '')).digest('hex').slice(0, 32);
  return `deleted:${hash}`;
};

const emptyCounts = () => ({
  sessions: 0,
  authUser: 0,
  personalEvents: 0,
  memoryConsent: 0,
  healthProfile: 0,
  calendar: 0,
  mobileReflections: 0,
  mobileReports: 0,
  mobileState: 0,
  mobilePush: 0,
  billingProjection: 0,
  billingTrials: 0,
  contactSubmissions: 0,
  adminInvites: 0,
  privacyRequests: 0,
  adminAudit: 0,
});

const failResult = (errors, partial = {}) => ({
  ok: false,
  deleted: { ...emptyCounts(), ...(partial.deleted || {}) },
  anonymized: {
    privacyRequests: partial.anonymized?.privacyRequests || 0,
    adminAudit: partial.anonymized?.adminAudit || 0,
    adminInvites: partial.anonymized?.adminInvites || 0,
  },
  retained: {
    stripeWebhookEvents: true,
    stripeExternalCustomer: true,
    stripeExternalSubscription: true,
    ...(partial.retained || {}),
  },
  errors: Array.isArray(errors) ? errors : [String(errors || 'unknown')],
  tombstoneId: null,
});

/**
 * Run local cascade inside one Postgres transaction when pool supports connect().
 *
 * @param {{
 *   pool: import('pg').Pool,
 *   userId: string,
 *   email: string,
 *   actorUserId?: string,
 *   reason?: string,
 *   scope?: string,
 *   requestId?: string,
 * }} args
 */
export const deleteAccountLocalCascade = async ({
  pool,
  userId,
  email,
  actorUserId = null,
  reason = 'user_requested',
  scope = 'account',
  requestId = null,
}) => {
  const uid = String(userId || '').trim();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!pool) {
    return failResult(['pool_missing']);
  }
  if (!uid) {
    return failResult(['user_id_missing']);
  }
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return failResult(['email_missing']);
  }
  if (scope !== 'account') {
    return failResult(['invalid_scope']);
  }

  const marker = deletedUserEmailMarker(uid);
  const tombstoneId =
    requestId || `dsar-del-${Date.now()}-${createHash('sha256').update(uid).digest('hex').slice(0, 8)}`;

  let client;
  try {
    client = await pool.connect();
  } catch (error) {
    return failResult([
      `connect_failed:${error instanceof Error ? error.message.slice(0, 80) : 'unknown'}`,
    ]);
  }

  const deleted = emptyCounts();
  const anonymized = { privacyRequests: 0, adminAudit: 0, adminInvites: 0 };

  try {
    await client.query('BEGIN');

    deleted.personalEvents = await deletePersonalEventsForUser(client, uid);
    deleted.memoryConsent = await deleteMemoryConsentForUser(client, uid);
    const healthProfile = await deletePersonalHealthProfileForUser(client, uid);
    deleted.healthProfile = Number(healthProfile.profiles || 0) + Number(healthProfile.facts || 0);
    deleted.calendar = await deleteCalendarBundleForUser(client, uid);

    const reflections = await deleteAllMobileReflectionsForUser(client, uid);
    deleted.mobileReflections =
      Number(reflections?.reflections || 0) + Number(reflections?.meta || 0);

    deleted.mobileReports = await deleteAllMobileReportsForUser(client, uid);
    deleted.mobileState = await deleteAllMobileUserStateForUser(client, uid);
    deleted.mobilePush = await deleteAllMobilePushTokensForUser(client, uid);

    const billingAccounts = await deleteBillingAccountByUserId(client, uid);
    const billingSubs = await deleteSubscriptionByUserId(client, uid);
    deleted.billingProjection = Number(billingAccounts || 0) + Number(billingSubs || 0);
    deleted.billingTrials = await deleteTrialByUserId(client, uid);
    await deleteLegacyLunaTrialsForUser(client, uid);

    anonymized.adminInvites = await revokeAndAnonymizeAdminInvitesForEmail(
      client,
      normalizedEmail,
      marker,
    );
    deleted.adminInvites = anonymized.adminInvites;

    deleted.contactSubmissions = await deleteContactSubmissionsByEmail(client, normalizedEmail);

    anonymized.privacyRequests = await anonymizePrivacyRequestsForEmail(
      client,
      normalizedEmail,
      marker,
    );
    deleted.privacyRequests = anonymized.privacyRequests;

    anonymized.adminAudit = await anonymizeAdminAuditActorEmail(client, normalizedEmail, marker);

    // Tombstone without plaintext email (marker only).
    await insertPrivacyRequest(client, {
      id: tombstoneId,
      type: 'delete',
      status: 'completed',
      email: marker,
      actor: marker,
      scope: 'account',
      source: 'account_deletion',
      action: reason || 'user_requested',
      requestedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    deleted.sessions = await deleteSessionsForUserFromPostgres(client, uid);
    // Auth user last — failure here rolls back entire cascade (no false success).
    deleted.authUser = await deleteUserFromPostgres(client, uid);

    await client.query('COMMIT');

    // Count-only log — never email, health text, or push tokens.
    console.info(
      '[account-deletion] local cascade ok',
      JSON.stringify({
        userIdHash: createHash('sha256').update(uid).digest('hex').slice(0, 12),
        actorUserIdHash: actorUserId
          ? createHash('sha256').update(String(actorUserId)).digest('hex').slice(0, 12)
          : null,
        scope: 'account',
        counts: {
          personalEvents: deleted.personalEvents,
          memoryConsent: deleted.memoryConsent,
          healthProfile: deleted.healthProfile,
          calendar: deleted.calendar,
          mobileReflections: deleted.mobileReflections,
          mobileReports: deleted.mobileReports,
          mobileState: deleted.mobileState,
          mobilePush: deleted.mobilePush,
          billingProjection: deleted.billingProjection,
          billingTrials: deleted.billingTrials,
          contactSubmissions: deleted.contactSubmissions,
          adminInvites: deleted.adminInvites,
          privacyRequests: anonymized.privacyRequests,
          adminAudit: anonymized.adminAudit,
          sessions: deleted.sessions,
          authUser: deleted.authUser,
        },
      }),
    );

    return {
      ok: true,
      deleted,
      anonymized,
      retained: {
        stripeWebhookEvents: true,
        stripeExternalCustomer: true,
        stripeExternalSubscription: true,
      },
      errors: [],
      tombstoneId,
      emailMarker: marker,
    };
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore */
    }
    const code = error instanceof Error ? error.message.slice(0, 120) : 'cascade_failed';
    console.warn(
      '[account-deletion] local cascade failed',
      JSON.stringify({
        userIdHash: createHash('sha256').update(uid).digest('hex').slice(0, 12),
        error: code,
      }),
    );
    return failResult([code], { deleted, anonymized });
  } finally {
    client.release();
  }
};

/**
 * JSON/dev fallback: delete in-memory/file mirrors when Postgres cascade is not used.
 * Still no Stripe external calls. Used only when auth identity is JSON mode.
 */
export const deleteAccountLocalJsonCascade = async ({
  userId,
  email,
  users,
  sessions,
  contactSubmissions,
  privacyRequests,
  calendarStore,
  mobileReflections,
  mobileReports,
  mobileStateStore,
  mobilePushStore,
  personalEventsStore,
  memoryConsentStore,
  personalHealthProfileStore,
  billingService,
  adminState,
  reason = 'user_requested',
  requestId = null,
}) => {
  const uid = String(userId || '').trim();
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const marker = deletedUserEmailMarker(uid);
  const tombstoneId =
    requestId || `dsar-del-${Date.now()}-${createHash('sha256').update(uid).digest('hex').slice(0, 8)}`;
  const deleted = emptyCounts();
  const anonymized = { privacyRequests: 0, adminAudit: 0, adminInvites: 0 };
  const errors = [];

  try {
    // Unavailable backends have no durable rows in this runtime — skip (do not throw).
    if (
      personalEventsStore?.hardDeleteAllForUser &&
      personalEventsStore.available !== false &&
      personalEventsStore.kind !== 'unavailable'
    ) {
      deleted.personalEvents = await personalEventsStore.hardDeleteAllForUser(uid);
    }
    if (
      memoryConsentStore?.hardDeleteForUser &&
      memoryConsentStore.available !== false &&
      memoryConsentStore.kind !== 'unavailable'
    ) {
      deleted.memoryConsent = await memoryConsentStore.hardDeleteForUser(uid);
    }
    if (
      personalHealthProfileStore?.hardDeleteAllForUser &&
      personalHealthProfileStore.available !== false &&
      personalHealthProfileStore.kind !== 'unavailable'
    ) {
      deleted.healthProfile = await personalHealthProfileStore.hardDeleteAllForUser(uid);
    }

    if (calendarStore && typeof calendarStore === 'object' && calendarStore[uid]) {
      delete calendarStore[uid];
      deleted.calendar = 1;
    }

    const profileKey = `user:${uid}`;
    if (mobileReflections?.profiles?.[profileKey]) {
      const entries = mobileReflections.profiles[profileKey]?.entries?.length || 0;
      delete mobileReflections.profiles[profileKey];
      deleted.mobileReflections = Math.max(1, entries);
    }
    if (mobileReports?.profiles?.[profileKey]) {
      deleted.mobileReports = Array.isArray(mobileReports.profiles[profileKey])
        ? mobileReports.profiles[profileKey].length
        : 1;
      delete mobileReports.profiles[profileKey];
    }
    if (mobileStateStore?.profiles?.[profileKey]) {
      delete mobileStateStore.profiles[profileKey];
      deleted.mobileState = 1;
    }
    if (mobilePushStore?.profiles?.[profileKey]) {
      deleted.mobilePush = Array.isArray(mobilePushStore.profiles[profileKey]?.tokens)
        ? mobilePushStore.profiles[profileKey].tokens.length
        : 1;
      delete mobilePushStore.profiles[profileKey];
    }

    if (billingService?.deleteBillingForUser) {
      await billingService.deleteBillingForUser({ id: uid, email: normalizedEmail });
      deleted.billingProjection = 1;
      deleted.billingTrials = 1;
    }

    if (Array.isArray(contactSubmissions)) {
      const before = contactSubmissions.length;
      const next = contactSubmissions.filter(
        (item) => String(item.email || '').toLowerCase() !== normalizedEmail,
      );
      deleted.contactSubmissions = before - next.length;
      contactSubmissions.length = 0;
      contactSubmissions.push(...next);
    }

    if (Array.isArray(privacyRequests)) {
      for (const row of privacyRequests) {
        const emailMatch = String(row.email || '').toLowerCase() === normalizedEmail;
        const actorMatch = String(row.actor || '').toLowerCase() === normalizedEmail;
        if (emailMatch || actorMatch) {
          if (emailMatch) row.email = marker;
          if (actorMatch) row.actor = marker;
          if (row.fields != null) delete row.fields;
          if (row.scopes != null) delete row.scopes;
          if (row.consent_scopes != null) delete row.consent_scopes;
          anonymized.privacyRequests += 1;
        }
      }
      deleted.privacyRequests = anonymized.privacyRequests;
      privacyRequests.unshift({
        id: tombstoneId,
        type: 'delete',
        status: 'completed',
        email: marker,
        actor: marker,
        scope: 'account',
        source: 'account_deletion',
        action: reason || 'user_requested',
        requestedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      });
    }

    if (adminState && Array.isArray(adminState.invites)) {
      for (const invite of adminState.invites) {
        const emailMatch = String(invite.email || '').toLowerCase() === normalizedEmail;
        const createdByMatch = String(invite.createdBy || '').toLowerCase() === normalizedEmail;
        if (emailMatch || createdByMatch) {
          if (emailMatch && invite.status === 'pending') invite.status = 'revoked';
          if (emailMatch) {
            invite.email = marker;
            invite.inviteLink = undefined;
          }
          if (createdByMatch) invite.createdBy = marker;
          anonymized.adminInvites += 1;
        }
      }
      deleted.adminInvites = anonymized.adminInvites;
    }
    if (adminState && Array.isArray(adminState.audit)) {
      for (const entry of adminState.audit) {
        let touched = false;
        if (String(entry.actorEmail || '').toLowerCase() === normalizedEmail) {
          entry.actorEmail = marker;
          touched = true;
        }
        if (typeof entry.details === 'string' && entry.details.toLowerCase().includes(normalizedEmail)) {
          entry.details = entry.details.replace(
            new RegExp(normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
            marker,
          );
          touched = true;
        }
        if (touched) anonymized.adminAudit += 1;
      }
    }

    if (sessions instanceof Map) {
      for (const [token, session] of sessions.entries()) {
        if (session?.userId === uid) {
          sessions.delete(token);
          deleted.sessions += 1;
        }
      }
    }

    if (Array.isArray(users)) {
      const idx = users.findIndex((u) => u.id === uid);
      if (idx >= 0) {
        users.splice(idx, 1);
        deleted.authUser = 1;
      }
    }

    return {
      ok: true,
      deleted,
      anonymized,
      retained: {
        stripeWebhookEvents: true,
        stripeExternalCustomer: true,
        stripeExternalSubscription: true,
      },
      errors,
      tombstoneId,
      emailMarker: marker,
    };
  } catch (error) {
    const code = error instanceof Error ? error.message.slice(0, 120) : 'json_cascade_failed';
    return failResult([code], { deleted, anonymized });
  }
};
