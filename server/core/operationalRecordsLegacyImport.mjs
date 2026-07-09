/**
 * WS1.5 — Conservative one-time import from legacy JSON into Postgres.
 * Never overwrites existing rows. Never logs PII.
 */

import { countAdminInvites, importAdminInviteIfAbsent } from './adminInvitesStore.mjs';
import { countAdminAuditEvents, importAdminAuditIfAbsent } from './adminAuditStore.mjs';
import { countPrivacyRequests, importPrivacyRequestIfAbsent } from './privacyRequestsStore.mjs';
import {
  countContactSubmissions,
  importContactSubmissionIfAbsent,
} from './contactSubmissionsStore.mjs';
import {
  countAdminWorkspaceDocuments,
  getAdminWorkspaceDocument,
  saveAdminWorkspaceDocument,
} from './adminWorkspaceStore.mjs';

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const maybeImportOperationalRecordsOnBoot = async (
  pool,
  { adminStateRaw, privacyRequestsRaw, contactSubmissionsRaw },
) => {
  if (!pool) return { imported: false, reason: 'no_pool' };

  const [invitesN, auditN, privacyN, contactsN, workspaceN] = await Promise.all([
    countAdminInvites(pool),
    countAdminAuditEvents(pool),
    countPrivacyRequests(pool),
    countContactSubmissions(pool),
    countAdminWorkspaceDocuments(pool),
  ]);

  const counts = {
    invitesInserted: 0,
    invitesSkipped: 0,
    auditInserted: 0,
    auditSkipped: 0,
    privacyInserted: 0,
    privacySkipped: 0,
    contactsInserted: 0,
    contactsSkipped: 0,
    workspaceImported: false,
  };

  // Workspace document: import only when absent
  if (workspaceN === 0 && isPlainObject(adminStateRaw)) {
    const {
      invites: _inv,
      audit: _aud,
      ...workspace
    } = adminStateRaw;
    await saveAdminWorkspaceDocument(pool, workspace);
    counts.workspaceImported = true;
  }

  if (invitesN === 0 && Array.isArray(adminStateRaw?.invites)) {
    for (const row of adminStateRaw.invites) {
      const result = await importAdminInviteIfAbsent(pool, row);
      if (result === 'inserted') counts.invitesInserted += 1;
      else counts.invitesSkipped += 1;
    }
  }

  if (auditN === 0 && Array.isArray(adminStateRaw?.audit)) {
    for (const row of adminStateRaw.audit) {
      const result = await importAdminAuditIfAbsent(pool, row);
      if (result === 'inserted') counts.auditInserted += 1;
      else counts.auditSkipped += 1;
    }
  }

  if (privacyN === 0 && Array.isArray(privacyRequestsRaw)) {
    for (const row of privacyRequestsRaw) {
      const result = await importPrivacyRequestIfAbsent(pool, row);
      if (result === 'inserted') counts.privacyInserted += 1;
      else counts.privacySkipped += 1;
    }
  }

  if (contactsN === 0 && Array.isArray(contactSubmissionsRaw)) {
    for (const row of contactSubmissionsRaw) {
      const result = await importContactSubmissionIfAbsent(pool, row);
      if (result === 'inserted') counts.contactsInserted += 1;
      else counts.contactsSkipped += 1;
    }
  }

  const any =
    counts.workspaceImported ||
    counts.invitesInserted ||
    counts.auditInserted ||
    counts.privacyInserted ||
    counts.contactsInserted;

  if (any) {
    console.info(
      `[operational-records] legacy import: workspace=${counts.workspaceImported ? 1 : 0} invites=${counts.invitesInserted} audit=${counts.auditInserted} privacy=${counts.privacyInserted} contacts=${counts.contactsInserted}`,
    );
  }

  // Touch get to ensure table readable after import
  if (counts.workspaceImported) await getAdminWorkspaceDocument(pool);

  return { imported: any, counts };
};
