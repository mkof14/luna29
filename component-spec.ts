import { 
  HormoneData, 
  HormoneStatus, 
  CyclePhase, 
  HealthEvent, 
  Medication, 
  Insight, 
  DoctorQuestion 
} from './types';

/**
 * LUNA29 BALANCE: COMPONENT SPECIFICATION v2.2
 * Detailed architecture for the UI presentation layer.
 */

// --- 1. DASHBOARD & HERO ---

/**
 * @component TopStateSummary
 * Displays current day and phase hero data.
 */
export interface TopStateSummaryProps {
  currentDay: number;
  phase: CyclePhase;
  mainInsight?: string;
  isPeriod: boolean;
  onPhaseClick: () => void;
  isLoading?: boolean; // Shows skeleton while projecting state
  error?: string; // Shows inline error message if sync fails
}

// --- 2. HORMONE GRID SYSTEM ---

/**
 * @component HormoneCard
 * Atomic unit of the state map.
 */
export interface HormoneCardProps {
  data: HormoneData;
  isActive: boolean; // True if interaction lines are shown
  onClick: (hormone: HormoneData) => void;
  /** Handling: Pulse animation if status is 'UNSTABLE' or 'STRAINED' */
  /** A11y: aria-label="Estrogen: [Status], [Level]%" */
}

export interface HormoneGridProps {
  hormones: HormoneData[];
  selectedId?: string;
  onHormoneSelect: (hormone: HormoneData) => void;
  /** Layout: 1 col on mobile, 3 cols on desktop */
}

/**
 * @component ConnectionsOverlay
 * Visual relational lines between hormone cards.
 */
export interface ConnectionsOverlayProps {
  active: boolean;
  visibleConnections: Array<{ from: string; to: string; label: string }>;
  /** Handling: Calculates SVG paths based on DOM node coordinates */
  /** A11y: aria-hidden="true" (Decorative context) */
}

// --- 3. QUICK METRICS ---

/**
 * @component StateSummaryTiles
 * Small cards for 1-5 magnitude metrics.
 */
export interface StateSummaryTileProps {
  label: string;
  value: number; // 1-5
  icon: string;
  /** Handling: Values < 2 or > 4 may trigger subtle status styling */
  /** A11y: role="progressbar", aria-valuemin="1", aria-valuemax="5" */
}

// --- 4. BEHAVIORAL GUIDANCE ---

/**
 * @component NextActionsPanel
 * List of nudges from the rule engine.
 */
export interface NextActionsPanelProps {
  actions: Array<{ 
    id: string; 
    text: string; 
    type: 'track' | 'discuss' | 'read' 
  }>;
  onActionClick: (id: string) => void;
  /** Empty State: "System Balanced. No immediate actions required." */
  /** A11y: role="list", children as role="listitem" */
}

// --- 5. TEMPORAL RHYTHM ---

/**
 * @component CycleTimeline
 * The 28-day wave chart and scrubber.
 */
export interface CycleTimelineProps {
  currentDay: number;
  cycleLength: number;
  onDayChange: (day: number) => void;
  isDetailed?: boolean; // Larger view with phase info
  /** Handling: Click chart to jump to day. Drag slider for fine-tuning. */
  /** A11y: input type="range" with aria-label="Cycle Day Selection" */
}

/**
 * @component PhaseIndicator
 * Seasonal context for the current rhythm.
 */
export interface PhaseIndicatorProps {
  phase: CyclePhase;
  days: [number, number];
  description: string;
  feeling: string;
  /** Visuals: Color-coded background (Teal/Violet/Pink/Slate) */
}

// --- 6. DATA INGESTION ---

/**
 * @component QuickCheckInForm
 * Daily subjective data entry.
 */
export interface QuickCheckInFormProps {
  isOpen: boolean;
  initialValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  /** A11y: role="dialog", aria-modal="true", trap focus, Escape to close */
}

/**
 * @component LabEntryForm
 * OCR and text ingestion for markers.
 */
export interface LabEntryFormProps {
  value: string;
  onChange: (val: string) => void;
  onAnalyze: () => void;
  onScanClick: () => void; // Triggers camera for OCR
  isAnalyzing: boolean;
  error?: string; // Validation/Parser errors
}

// --- 7. SENSITIVITY PROFILES ---

/**
 * @component MedicationList
 * CRUD stream for med/supp profiles.
 */
export interface MedicationListProps {
  medications: Medication[];
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  /** Empty State: "No active profiles. Add to track sensitivities." */
}

/**
 * @component MedicationForm
 * Entry for new profiles.
 */
export interface MedicationFormProps {
  onSave: (med: Partial<Medication>) => void;
  onCancel: () => void;
  /** A11y: Required field indicators, inline validation */
}

// --- 8. CLINICAL PREP ---

/**
 * @component DoctorPrepSummary
 * Clinical report generator.
 */
export interface DoctorPrepSummaryProps {
  summaryText?: string | null;
  questions: DoctorQuestion[];
  isGenerating: boolean;
  onGenerate: () => void;
  onCopy: () => void;
  /** Error: "Synthesis interrupted. Please retry." */
  /** A11y: Status message on copy success */
}

/**
 * @component ExportControls
 * Data portability triggers.
 */
export interface ExportControlsProps {
  onExportJSON: () => void;
  /** Handling: Disables while generation is in progress */
}

// --- 9. HISTORICAL RECORD ---

/**
 * @component HistoryTimeline
 * Chronological stream of all HealthEvents.
 */
export interface HistoryTimelineProps {
  events: HealthEvent[];
  onEventClick: (event: HealthEvent) => void;
  /** Empty State: "Temporal record clear. Sync today to initialize." */
  /** A11y: Grouped by date landmarks (H3 labels) */
}

/**
 * @component HistoryFilters
 * Scoping for the temporal record.
 */
export interface HistoryFiltersProps {
  activeRange: '7' | '30' | '90';
  onRangeChange: (range: '7' | '30' | '90') => void;
}
