/**
 * User-facing Memory consent copy (Task 8).
 * Kept in a plain TS module so unit tests can import without JSX.
 */

export const MEMORY_COPY = {
  title: 'Memory',
  statusOn: 'On',
  statusOff: 'Off',
  on: 'On',
  off: 'Off',
  unavailable:
    'Memory settings are temporarily unavailable. Luna won’t save new memories until this is resolved.',
  statusUnavailable: 'Unavailable',
  consentUnavailable:
    'Memory settings are temporarily unavailable. Luna won’t save new memories until this is resolved.',
  explanation:
    'When Memory is on, Luna may save selected things you tell her about your wellbeing in Luna Live. She does not save every conversation message as memory. Saved items may become unreviewed signals — not confirmed facts — until you review them. You can turn Memory off anytime; existing items remain until you delete them.',
  enable: 'Turn Memory on',
  disable: 'Turn Memory off',
  disableKeeps:
    'Turning Memory off stops new Luna Live saves. Existing memory remains until you delete it.',
  disableNote:
    'Turning Memory off stops new Luna Live saves. Existing memory remains until you delete it.',
  whatRemembers: 'What Luna remembers',
  needsReview: 'Needs your review',
  confirmed: 'Confirmed by you',
  confirmedByYou: 'Confirmed by you',
  patterns: 'Patterns',
  possiblePattern: 'Possible pattern',
  confirmedPattern: 'Confirmed by you',
  nothingSaved: 'Nothing saved yet.',
  nothingReview: 'Nothing needs review.',
  memoryOff:
    'Memory is off. Luna can still talk with you, but she won’t save new eligible Luna Live memories.',
  memoryOffEmpty:
    'Memory is off. Luna can still talk with you, but she won’t save new eligible Luna Live memories.',
  confirm: 'Confirm',
  notRight: 'Not right',
  correct: 'Correct',
  delete: 'Delete',
  saveCorrection: 'Save correction',
  cancel: 'Cancel',
  close: 'Close',
  loading: 'Loading…',
  error: 'Something went wrong. Try again.',
  bulkDeferred: 'Delete all stored memory is not available yet. You can delete items one by one.',
  inferred: 'Luna inferred',
  youConfirmed: 'You confirmed',
  youCorrected: 'You corrected',
} as const;

export type MemoryCopyKey = keyof typeof MEMORY_COPY;
