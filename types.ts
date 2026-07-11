
export enum HormoneStatus {
  BALANCED = 'Steady',
  UNSTABLE = 'Sensitive',
  STRAINED = 'Stressed',
  FLUCTUATING = 'Changing',
  PEAK = 'Active',
  DORMANT = 'Quiet'
}

export enum CyclePhase {
  MENSTRUAL = 'Menstrual',
  FOLLICULAR = 'Follicular',
  OVULATORY = 'Ovulatory',
  LUTEAL = 'Luteal'
}

export enum ConfidenceLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export type AuthProvider = 'password' | 'google';

export type AdminRole = 'member' | 'viewer' | 'operator' | 'content_manager' | 'finance_manager' | 'super_admin';

export type AdminPermission =
  | 'manage_services'
  | 'manage_marketing'
  | 'manage_email_templates'
  | 'manage_admin_roles'
  | 'view_financials'
  | 'view_technical_metrics';

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  provider: AuthProvider;
  role: AdminRole;
  permissions: AdminPermission[];
  lastLoginAt: string;
  avatarUrl?: string;
  emailVerified?: boolean;
}

export interface SymptomArchetype {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export type EventType = 
  | 'DAILY_CHECKIN'
  | 'CYCLE_SYNC'
  | 'LAB_MARKER_ENTRY'
  | 'MEDICATION_LOG'
  | 'INSIGHT_GENERATED'
  | 'ONBOARDING_COMPLETE'
  | 'DATA_EXPORTED'
  | 'PROFILE_UPDATE'
  | 'AUTH_SUCCESS'
  | 'SUBSCRIPTION_PURCHASE'
  | 'AUDIO_REFLECTION'
  | 'FUEL_LOG';

export interface HealthEvent {
  id: string;
  timestamp: string;
  type: EventType;
  version: number;
  payload: EventPayload;
}

export interface DailyCheckinPayload {
  metrics: Record<string, number>;
  symptoms: string[];
  isPeriod: boolean;
  /** Optional clinical check-in fields for Closed Paid Beta. */
  periodEvent?: 'started' | 'ended' | null;
  flow?: 'none' | 'light' | 'medium' | 'heavy' | '';
  intensity?: number | null;
  notes?: string;
}

export interface CycleSyncPayload {
  day: number;
  length: number;
}

export interface FuelLogPayload {
  nutrient: string;
}

export interface MedicationAddPayload {
  action: 'ADD';
  medId: string;
  name: string;
  dose?: string;
  observations?: string[];
  notes?: string;
}

export interface MedicationRemovePayload {
  action: 'REMOVE';
  medId: string;
}

export type MedicationLogPayload = MedicationAddPayload | MedicationRemovePayload;

export interface LabMarkerEntryPayload {
  rawText: string;
  analysis?: string;
  day?: number;
}

export type ProfileUpdatePayload = Partial<ProfileData>;

export type EventPayload =
  | Record<string, never>
  | Record<string, unknown>
  | DailyCheckinPayload
  | CycleSyncPayload
  | FuelLogPayload
  | MedicationLogPayload
  | LabMarkerEntryPayload
  | ProfileUpdatePayload;

export interface ProfileData {
  name: string;
  birthDate: string;
  lastUpdated: string;
  weight: string;
  height: string;
  bloodType: string;
  allergies: string;
  conditions: string;
  recentInterventions: string;
  contraception: string;
  stressBaseline: string; 
  sensitivities: string[];
  mentalArchetype: string;
  familyHistory: string;
  menarcheAge: string;
  units: 'metric' | 'imperial';
}

export interface SystemState {
  events: HealthEvent[];
  onboarded: boolean;
  isAuthenticated: boolean;
  subscriptionTier: 'none' | 'monthly' | 'yearly';
  currentDay: number;
  cycleLength: number;
  medications: Medication[];
  symptoms: string[];
  labData: string;
  lastCheckin?: DailyCheckinPayload & { timestamp: string };
  fuelLogs: string[]; // List of nutrients consumed today
  profile: ProfileData;
  activeArchetype?: SymptomArchetype;
}

export interface Medication {
  id: string;
  name: string;
  dose?: string;
  startDate?: string;
  observations: string[];
  notes: string;
  addedAt: string;
}

export interface HormoneData {
  id: string;
  name: string;
  icon: string;
  level: number;
  status: HormoneStatus;
  trend: number[]; 
  affects: string[];
  symptoms: string[];
  color: string;
  description: string;
  dailyImpact: string;
  imbalanceFeeling: string;
  drivers: string[];
  whatToTrack: string[];
  generalDoctorQuestions: string[];
  category?: string; // Optional for library grouping
}

export interface Insight {
  id: string;
  title: string;
  category: string;
  text: string;
  hormoneId?: string;
}

export interface DoctorQuestion {
  id: string;
  question: string;
  context: string;
}

export interface PhysioInput {
  age: number;
  cycleDay: number;
  cycleLength: number;
  symptoms: string[];
  labMarkers?: Record<string, number>;
  medications: string[];
}

export interface RuleOutput {
  hormoneStatuses: Record<string, HormoneStatus>;
  insights: Insight[];
  doctorQuestions: DoctorQuestion[];
  archetype?: SymptomArchetype;
}

export enum PartnerNoteIntent {
  UNDERSTANDING = 'understanding',
  SPACE = 'space',
  SUPPORT = 'support',
  PREVENT_MISUNDERSTANDING = 'prevent_misunderstanding',
  NOT_SURE = 'not_sure'
}

export enum PartnerNoteTone {
  CALM = 'calm',
  WARM = 'warm',
  SHORT = 'short',
  DETAILED = 'detailed',
  REPAIR = 'repair'
}

export enum PartnerNoteBoundary {
  SOFT = 'soft',
  GENTLE = 'gentle',
  CLEAR = 'clear'
}

export interface PartnerNoteInput {
  state_energy: 'low' | 'medium' | 'high';
  state_sensitivity: 'low' | 'medium' | 'high';
  state_social_bandwidth: 'low' | 'medium' | 'high';
  state_cognitive_load: 'low' | 'medium' | 'high';
  relationship_context: 'stable' | 'tense' | 'recovering';
  intent: PartnerNoteIntent;
  tone: PartnerNoteTone;
  boundary_level: PartnerNoteBoundary;
  partner_name?: string;
  preferred_terms?: string;
  avoid_terms?: string[];
  language?: string;
}

export interface PartnerNoteMessage {
  id: string;
  content: string;
}

export interface BridgeReflectionInput {
  language: string;
  reflection: {
    quiet_presence: string;
    not_meaning: string;
    kindness_needed: string;
  };
}

export interface BridgeLetterOutput {
  meta: {
    language: string;
    contains_medical: boolean;
    contains_therapy_language: boolean;
    contains_blame: boolean;
  };
  bridge_letter: {
    content: string;
  };
}

export interface PartnerNoteOutput {
  meta: {
    language: string;
    contains_medical: boolean;
    contains_blame: boolean;
    safety_flags: string[];
  };
  messages: {
    text: PartnerNoteMessage[];
    note: PartnerNoteMessage[];
    letter: PartnerNoteMessage[];
  };
}
