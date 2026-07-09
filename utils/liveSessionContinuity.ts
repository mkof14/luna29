/**
 * Post–Luna Live continuity card (Task 9.1 follow-on).
 * AUTHORITY (Task 10): sole owner of post-Live one-card continuity (distinct from
 * buildContinuityCopy / buildReviewContinuityLine).
 * Pure / deterministic — one state only. No invented success.
 */

export type MemoryWriteStatus =
  | 'written'
  | 'already_exists'
  | 'feature_disabled'
  | 'consent_disabled'
  | 'consent_unavailable'
  | 'ineligible'
  | 'failed'
  | 'extraction_failed'
  | 'none'
  | string;

export type LiveCloseSummary = {
  /** New user turns in the closed open-session (resume history does not count). */
  userTurnCount: number;
  /** Last memory_write_status from /api/voice/respond (never invent). */
  memoryWriteStatus: MemoryWriteStatus | null;
  /** Chat turns for Continue (user/luna only). */
  resumeMessages: Array<{ role: 'user' | 'luna' | 'system'; text: string }>;
};

export type LiveContinuityCardKind =
  | 'conversation_completed'
  | 'remembered'
  | 'nothing_saved'
  | 'memory_off'
  | 'review_available'
  | 'possible_pattern'
  | 'confirmed_pattern'
  | 'store_unavailable'
  | 'failed';

export type LiveContinuityCard = {
  kind: LiveContinuityCardKind;
  line: string;
  memory_write_status: string | null;
};

export type ResolveLiveContinuityInput = {
  userTurnCount: number;
  memoryWriteStatus: MemoryWriteStatus | null;
  unreviewedCount: number;
  possiblePatternTitle: string | null;
  confirmedPatternTitle: string | null;
  /** Intelligence consent/store availability after refresh. */
  memoryStatus: 'off' | 'on' | 'unavailable' | 'unknown';
};

const lineForMemoryWriteStatus = (
  status: string | null,
): { kind: LiveContinuityCardKind; line: string } | null => {
  if (!status || status === 'none') return null;
  switch (status) {
    case 'written':
      return {
        kind: 'remembered',
        line: 'Conversation completed. Luna remembered something.',
      };
    case 'already_exists':
      return {
        kind: 'remembered',
        line: 'Conversation completed. Luna already had this memory.',
      };
    case 'feature_disabled':
    case 'consent_disabled':
      return {
        kind: 'memory_off',
        line: 'Conversation completed. Memory is off — nothing was saved.',
      };
    case 'consent_unavailable':
      return {
        kind: 'store_unavailable',
        line: 'Conversation completed. Memory settings are temporarily unavailable — nothing new was saved.',
      };
    case 'ineligible':
      return {
        kind: 'nothing_saved',
        line: 'Conversation completed. Nothing was saved.',
      };
    case 'failed':
    case 'extraction_failed':
      return {
        kind: 'failed',
        line: 'Conversation completed. Memory could not be updated.',
      };
    default:
      return null;
  }
};

/**
 * Priority (first match wins) — one card only:
 * 1. store_unavailable (consent/store)
 * 2. review_available
 * 3. explicit memory_write_status mapping (Task 7)
 * 4. confirmed_pattern
 * 5. possible_pattern
 * 6. memory off (consent state without write status)
 * 7. conversation_completed
 */
export const resolveLiveContinuityCard = (
  input: ResolveLiveContinuityInput,
): LiveContinuityCard | null => {
  if (!input.userTurnCount || input.userTurnCount < 1) return null;

  const status = input.memoryWriteStatus ? String(input.memoryWriteStatus) : null;

  if (status === 'consent_unavailable' || input.memoryStatus === 'unavailable') {
    return {
      kind: 'store_unavailable',
      line: 'Conversation completed. Memory settings are temporarily unavailable — nothing new was saved.',
      memory_write_status: status,
    };
  }

  if (input.unreviewedCount > 0) {
    return {
      kind: 'review_available',
      line: `Conversation completed. Luna noticed something you may want to check (${Math.min(input.unreviewedCount, 99)}).`,
      memory_write_status: status,
    };
  }

  const fromStatus = lineForMemoryWriteStatus(status);
  if (fromStatus) {
    return {
      ...fromStatus,
      memory_write_status: status,
    };
  }

  if (input.confirmedPatternTitle) {
    return {
      kind: 'confirmed_pattern',
      line: `Conversation completed. A pattern you confirmed: ${input.confirmedPatternTitle}`,
      memory_write_status: status,
    };
  }

  if (input.possiblePatternTitle) {
    return {
      kind: 'possible_pattern',
      line: `Conversation completed. Possible pattern available: ${input.possiblePatternTitle}`,
      memory_write_status: status,
    };
  }

  if (input.memoryStatus === 'off') {
    return {
      kind: 'memory_off',
      line: 'Conversation completed. Memory is off — nothing was saved.',
      memory_write_status: status,
    };
  }

  return {
    kind: 'conversation_completed',
    line: 'Conversation completed.',
    memory_write_status: status,
  };
};
