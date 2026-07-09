/**
 * WS1.6 — Conservative one-time import of Calendar/Mobile JSON into Postgres.
 * Never overwrites existing rows. Never logs PII / health text / tokens.
 *
 * Ownership: only import keys matching `user:{userId}` (trustworthy auth id).
 * Legacy device:/guest: keys are skipped.
 */

import {
  countCalendarUserData,
  importCalendarBundleIfAbsent,
} from './calendarUserDataStore.mjs';
import {
  countMobileReflections,
  ensureMobileReflectionMeta,
  importMobileReflectionIfAbsent,
} from './mobileReflectionsStore.mjs';
import { countMobileReports, importMobileReportIfAbsent } from './mobileReportsStore.mjs';
import {
  countMobileUserState,
  importMobileStateSectionIfAbsent,
} from './mobileUserStateStore.mjs';
import {
  countMobilePushRegistrations,
  importMobilePushTokenIfAbsent,
} from './mobilePushStore.mjs';

const parseTrustedUserId = (profileKey) => {
  const key = String(profileKey || '');
  const match = /^user:([a-zA-Z0-9_-]{8,120})$/.exec(key);
  return match ? match[1] : null;
};

/**
 * Calendar JSON is keyed by raw auth user id (randomBytes(12).toString('hex') => 24 hex).
 * Reject emails, device:/guest: prefixes, and any non-hex / wrong-length keys.
 */
const isTrustedCalendarUserId = (raw) => {
  const uid = String(raw || '').trim();
  if (!/^[a-f0-9]{24}$/i.test(uid)) return false;
  if (uid.includes('@') || uid.includes(':')) return false;
  return true;
};

export const maybeImportUserDataOnBoot = async (
  pool,
  {
    calendarStoreRaw,
    mobileReflectionsRaw,
    mobileReportsRaw,
    mobileStateRaw,
    mobilePushRaw,
  },
) => {
  if (!pool) return { imported: false, reason: 'no_pool' };

  const [calendarN, reflectionsN, reportsN, stateN, pushN] = await Promise.all([
    countCalendarUserData(pool),
    countMobileReflections(pool),
    countMobileReports(pool),
    countMobileUserState(pool),
    countMobilePushRegistrations(pool),
  ]);

  const counts = {
    calendarInserted: 0,
    calendarSkipped: 0,
    reflectionsInserted: 0,
    reflectionsSkipped: 0,
    reportsInserted: 0,
    reportsSkipped: 0,
    stateInserted: 0,
    stateSkipped: 0,
    pushInserted: 0,
    pushSkipped: 0,
  };

  if (calendarN === 0 && calendarStoreRaw && typeof calendarStoreRaw === 'object') {
    for (const [userId, bundle] of Object.entries(calendarStoreRaw)) {
      // Calendar store is keyed by raw auth user id (not user: prefix).
      if (!isTrustedCalendarUserId(userId) || !bundle || typeof bundle !== 'object') {
        counts.calendarSkipped += 1;
        continue;
      }
      const result = await importCalendarBundleIfAbsent(pool, String(userId).trim().toLowerCase(), bundle);
      if (result === 'inserted') counts.calendarInserted += 1;
      else counts.calendarSkipped += 1;
    }
  }

  if (reflectionsN === 0 && mobileReflectionsRaw?.profiles) {
    for (const [profileKey, profile] of Object.entries(mobileReflectionsRaw.profiles)) {
      const userId = parseTrustedUserId(profileKey);
      if (!userId || !profile || typeof profile !== 'object') {
        counts.reflectionsSkipped += 1;
        continue;
      }
      await ensureMobileReflectionMeta(pool, userId, profile.name || null);
      const entries = Array.isArray(profile.entries) ? profile.entries : [];
      for (const entry of entries) {
        const result = await importMobileReflectionIfAbsent(pool, userId, entry);
        if (result === 'inserted') counts.reflectionsInserted += 1;
        else counts.reflectionsSkipped += 1;
      }
    }
  }

  if (reportsN === 0 && mobileReportsRaw?.profiles) {
    for (const [profileKey, reports] of Object.entries(mobileReportsRaw.profiles)) {
      const userId = parseTrustedUserId(profileKey);
      if (!userId || !Array.isArray(reports)) {
        counts.reportsSkipped += 1;
        continue;
      }
      for (const report of reports) {
        const result = await importMobileReportIfAbsent(pool, userId, report);
        if (result === 'inserted') counts.reportsInserted += 1;
        else counts.reportsSkipped += 1;
      }
    }
  }

  if (stateN === 0 && mobileStateRaw?.profiles) {
    for (const [profileKey, profile] of Object.entries(mobileStateRaw.profiles)) {
      const userId = parseTrustedUserId(profileKey);
      if (!userId || !profile?.sections || typeof profile.sections !== 'object') {
        counts.stateSkipped += 1;
        continue;
      }
      for (const [sectionKey, data] of Object.entries(profile.sections)) {
        const result = await importMobileStateSectionIfAbsent(pool, userId, sectionKey, data);
        if (result === 'inserted') counts.stateInserted += 1;
        else counts.stateSkipped += 1;
      }
    }
  }

  if (pushN === 0 && mobilePushRaw?.profiles) {
    for (const [profileKey, profile] of Object.entries(mobilePushRaw.profiles)) {
      const userId = parseTrustedUserId(profileKey);
      if (!userId || !profile || typeof profile !== 'object') {
        counts.pushSkipped += 1;
        continue;
      }
      const tokens = Array.isArray(profile.tokens) ? profile.tokens : [];
      for (const item of tokens) {
        const result = await importMobilePushTokenIfAbsent(pool, userId, item);
        if (result === 'inserted') counts.pushInserted += 1;
        else counts.pushSkipped += 1;
      }
    }
  }

  const any =
    counts.calendarInserted ||
    counts.reflectionsInserted ||
    counts.reportsInserted ||
    counts.stateInserted ||
    counts.pushInserted;

  if (any) {
    console.info(
      `[user-data] legacy import: calendar=${counts.calendarInserted} reflections=${counts.reflectionsInserted} reports=${counts.reportsInserted} state=${counts.stateInserted} push=${counts.pushInserted}`,
    );
  }

  return { imported: Boolean(any), counts };
};
