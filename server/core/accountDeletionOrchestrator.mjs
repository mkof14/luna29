/**
 * WS2 Block 2 — Account deletion orchestration (Stripe → local cascade).
 * No Stripe calls inside Postgres transactions.
 */

import { createHash, randomBytes } from 'node:crypto';
import {
  DELETION_OP_STATUS,
  claimOrResumeDeletionOp,
  updateDeletionOp,
  markDeletionOpCompleted,
  markDeletionOpFailedRetryable,
  getDeletionOpById,
  getActiveDeletionOpForUser,
  getLatestDeletionOpForUser,
  tryAcquireDeletionOp,
  releaseDeletionOpLease,
  emailMarkerForUser,
} from './accountDeletionOpsStore.mjs';
import {
  deleteAccountLocalCascade,
  deleteAccountLocalJsonCascade,
  ACCOUNT_DELETION_FAILED,
} from './accountDeletionService.mjs';
import {
  createStripeAccountDeletion,
  stripeCancelRequired,
} from './stripeAccountDeletion.mjs';
import { emitOperationalEvent, OPS } from './operationalMetrics.mjs';

const logDeletion = (fields) => {
  try {
    console.info(
      '[account-deletion]',
      JSON.stringify({
        ...fields,
        // Never log email, Stripe ids, tokens, or health text.
      }),
    );
  } catch {
    /* ignore */
  }
};

/**
 * @param {{
 *   mode: 'postgres'|'json',
 *   pool: import('pg').Pool|null,
 *   memoryOps: object|null,
 *   stripeRequest: Function,
 *   billingEnabled: boolean,
 *   secretConfigured: boolean,
 *   getSubscriptionByUserId: Function|null,
 * }} deps
 */
export const createAccountDeletionOrchestrator = (deps) => {
  const {
    mode,
    pool,
    memoryOps = null,
    stripeRequest,
    billingEnabled,
    secretConfigured,
    getSubscriptionByUserId = null,
  } = deps;

  const stripeDel = createStripeAccountDeletion({
    stripeRequest,
    billingEnabled,
    secretConfigured,
  });

  const ops = {
    async claimOrResume(args) {
      if (mode === 'postgres' && pool) return claimOrResumeDeletionOp(pool, args);
      if (memoryOps) return memoryOps.claimOrResume(args);
      throw Object.assign(new Error('deletion_ops_unavailable'), { code: 'DELETION_OPS_UNAVAILABLE' });
    },
    async update(id, patch) {
      if (mode === 'postgres' && pool) return updateDeletionOp(pool, id, patch);
      if (memoryOps) return memoryOps.update(id, patch);
      return null;
    },
    async complete(id) {
      if (mode === 'postgres' && pool) return markDeletionOpCompleted(pool, id);
      if (memoryOps) {
        return memoryOps.update(id, { status: DELETION_OP_STATUS.COMPLETED });
      }
      return null;
    },
    async fail(id, code) {
      if (mode === 'postgres' && pool) return markDeletionOpFailedRetryable(pool, id, code);
      if (memoryOps) {
        return memoryOps.update(id, {
          status: DELETION_OP_STATUS.FAILED_RETRYABLE,
          errorCode: code,
        });
      }
      return null;
    },
    async tryAcquire(id, runnerToken) {
      if (mode === 'postgres' && pool) return tryAcquireDeletionOp(pool, id, runnerToken);
      if (memoryOps) return memoryOps.tryAcquire(id, runnerToken);
      return { acquired: false, op: null };
    },
    async releaseLease(id, runnerToken) {
      if (mode === 'postgres' && pool) return releaseDeletionOpLease(pool, id, runnerToken);
      if (memoryOps) return memoryOps.releaseLease(id, runnerToken);
      return null;
    },
    async getById(id) {
      if (mode === 'postgres' && pool) return getDeletionOpById(pool, id);
      if (memoryOps) return memoryOps.getById(id);
      return null;
    },
    async getActive(userId) {
      if (mode === 'postgres' && pool) return getActiveDeletionOpForUser(pool, userId);
      if (memoryOps) return memoryOps.getActiveForUser(userId);
      return null;
    },
    async getLatest(userId) {
      if (mode === 'postgres' && pool) return getLatestDeletionOpForUser(pool, userId);
      if (memoryOps) return memoryOps.getLatestForUser(userId);
      return null;
    },
    async isBlocking(userId) {
      if (mode === 'postgres' && pool) {
        const op = await getActiveDeletionOpForUser(pool, userId);
        return Boolean(op);
      }
      if (memoryOps) return memoryOps.isBlocking(userId);
      return false;
    },
  };

  /**
   * Run full account deletion for authenticated owner.
   */
  const runAccountDeletion = async ({
    user,
    requestId = null,
    jsonCascadeContext = null,
  }) => {
    const started = Date.now();
    const userId = String(user.id);
    const email = String(user.email || '').toLowerCase();
    const userIdHash = createHash('sha256').update(userId).digest('hex').slice(0, 12);

    // Phase 1 — snapshot (no Stripe network yet)
    let stripeCustomerId = null;
    let stripeSubscriptionId = null;
    let localSubscriptionStatus = null;

    try {
      if (typeof deps.getStripeCustomerIdForUser === 'function') {
        stripeCustomerId = (await deps.getStripeCustomerIdForUser(user)) || null;
      }
    } catch {
      /* best-effort */
    }

    try {
      if (mode === 'postgres' && pool && getSubscriptionByUserId) {
        const sub = await getSubscriptionByUserId(pool, userId);
        stripeSubscriptionId = sub?.stripeSubscriptionId || null;
        localSubscriptionStatus = sub?.status || null;
      } else if (typeof deps.getStatusForUser === 'function') {
        const status = await deps.getStatusForUser(user);
        stripeSubscriptionId = status?.billing?.subscriptionId || null;
        localSubscriptionStatus = status?.billing?.status || null;
      }
    } catch {
      /* best-effort */
    }

    emitOperationalEvent(OPS.ACCOUNT_DELETION_STARTED, {
      user_id_hash: userIdHash,
    });

    const claim = await ops.claimOrResume({
      userId,
      requestId,
      stripeCustomerId,
      stripeSubscriptionId,
      localSubscriptionStatus,
    });

    const op = claim.op;
    if (!op) {
      emitOperationalEvent(OPS.ACCOUNT_DELETION_LOCAL_FAILED, {
        reason: 'deletion_op_claim_failed',
      });
      return {
        ok: false,
        deleted: false,
        retryable: true,
        errorCode: 'deletion_op_claim_failed',
        httpStatus: 500,
      };
    }

    if (claim.alreadyCompleted || op.status === DELETION_OP_STATUS.COMPLETED) {
      logDeletion({
        stage: 'completed_idempotent',
        op_id: op.id,
        user_id_hash: userIdHash,
        latency_ms: Date.now() - started,
      });
      return {
        ok: true,
        deleted: true,
        requestId: op.id,
        scope: 'account',
        alreadyCompleted: true,
      };
    }

    const runnerToken = `runner-${randomBytes(8).toString('hex')}`;
    const acquired = await ops.tryAcquire(op.id, runnerToken);
    if (!acquired.acquired) {
      // Another request owns the destructive workflow — wait briefly then return current state.
      await new Promise((r) => setTimeout(r, 40));
      const latest = (await ops.getById(op.id)) || (await ops.getLatest(userId));
      if (latest?.status === DELETION_OP_STATUS.COMPLETED) {
        return {
          ok: true,
          deleted: true,
          requestId: latest.id,
          scope: 'account',
          alreadyCompleted: true,
        };
      }
      logDeletion({
        stage: 'lease_busy',
        op_id: op.id,
        user_id_hash: userIdHash,
        latency_ms: Date.now() - started,
      });
      return {
        ok: false,
        deleted: false,
        retryable: true,
        errorCode: 'deletion_in_progress',
        requestId: op.id,
        httpStatus: 409,
      };
    }

    try {
      // Refresh snapshot fields onto op if missing (retry).
      const fresh = acquired.op || op;
      const effectiveSubId = fresh.stripeSubscriptionId || stripeSubscriptionId;
      const effectiveStatus = fresh.localSubscriptionStatus || localSubscriptionStatus;
      const stripeAlreadyDone = new Set([
        'canceled',
        'already_canceled_local',
        'already_absent',
        'skipped_no_subscription',
        'skipped_billing_disabled',
        'skipped_non_active',
      ]).has(String(fresh.stripeCancelStatus || ''));

      // Phase 2 — Stripe external (outside DB txn)
      if (
        !stripeAlreadyDone &&
        (fresh.status === DELETION_OP_STATUS.PENDING ||
          fresh.status === DELETION_OP_STATUS.FAILED_RETRYABLE ||
          fresh.status === DELETION_OP_STATUS.EXTERNAL_CLEANUP)
      ) {
        await ops.update(op.id, { status: DELETION_OP_STATUS.EXTERNAL_CLEANUP });

        if (effectiveSubId && stripeCancelRequired(effectiveStatus, effectiveSubId)) {
          const cancelResult = await stripeDel.cancelSubscriptionForDeletion({
            stripeSubscriptionId: effectiveSubId,
            localSubscriptionStatus: effectiveStatus,
          });

          logDeletion({
            stage: 'external_cleanup',
            op_id: op.id,
            user_id_hash: userIdHash,
            stripe_cancel: cancelResult.status,
            reason: cancelResult.reason,
            latency_ms: Date.now() - started,
          });

          if (!cancelResult.ok) {
            await ops.fail(op.id, cancelResult.reason || 'stripe_cancel_failed');
            emitOperationalEvent(OPS.ACCOUNT_DELETION_EXTERNAL_FAILED, {
              reason: String(cancelResult.reason || 'stripe_cancel_failed').slice(0, 80),
            });
            return {
              ok: false,
              deleted: false,
              retryable: true,
              errorCode: cancelResult.reason || 'stripe_cancel_failed',
              requestId: op.id,
              httpStatus: 503,
            };
          }

          await ops.update(op.id, {
            stripeCancelStatus: cancelResult.status,
          });
        } else {
          await ops.update(op.id, {
            stripeCancelStatus: effectiveSubId ? 'skipped_non_active' : 'skipped_no_subscription',
          });
        }
      }

      // Phase 3 — local cascade
      await ops.update(op.id, { status: DELETION_OP_STATUS.LOCAL_CLEANUP, errorCode: null });

      let cascadeResult;
      if (mode === 'postgres' && pool) {
        cascadeResult = await deleteAccountLocalCascade({
          pool,
          userId,
          email,
          actorUserId: userId,
          reason: 'user_requested',
          scope: 'account',
          requestId: op.id,
        });
      } else if (jsonCascadeContext) {
        cascadeResult = await deleteAccountLocalJsonCascade({
          ...jsonCascadeContext,
          userId,
          email,
          reason: 'user_requested',
          requestId: op.id,
        });
      } else {
        cascadeResult = { ok: false, errors: ['json_context_missing'] };
      }

      if (!cascadeResult?.ok) {
        await ops.fail(op.id, ACCOUNT_DELETION_FAILED);
        emitOperationalEvent(OPS.ACCOUNT_DELETION_LOCAL_FAILED, {
          reason: ACCOUNT_DELETION_FAILED,
        });
        logDeletion({
          stage: 'local_cleanup_failed',
          op_id: op.id,
          user_id_hash: userIdHash,
          latency_ms: Date.now() - started,
        });
        return {
          ok: false,
          deleted: false,
          retryable: true,
          errorCode: ACCOUNT_DELETION_FAILED,
          requestId: op.id,
          httpStatus: 500,
        };
      }

      await ops.complete(op.id);
      emitOperationalEvent(OPS.ACCOUNT_DELETION_COMPLETED, {
        user_id_hash: userIdHash,
      });
      logDeletion({
        stage: 'completed',
        op_id: op.id,
        user_id_hash: userIdHash,
        latency_ms: Date.now() - started,
      });

      return {
        ok: true,
        deleted: true,
        requestId: op.id,
        scope: 'account',
        emailMarker: emailMarkerForUser(userId),
      };
    } finally {
      await ops.releaseLease(op.id, runnerToken);
    }
  };

  return {
    runAccountDeletion,
    isUserDeletionBlocking: (userId) => ops.isBlocking(userId),
    getActiveDeletionOp: (userId) => ops.getActive(userId),
    ops,
  };
};
