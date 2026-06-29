
import {
  HealthEvent,
  EventType,
  SystemState,
  Medication,
  ProfileData,
  EventPayload,
  CycleSyncPayload,
  DailyCheckinPayload,
  FuelLogPayload,
  LabMarkerEntryPayload,
  MedicationLogPayload,
  ProfileUpdatePayload,
} from '../types';
import { secureGetItem, secureSetItem } from './secureHealthStorage';

const STORAGE_KEY = 'luna_event_log_v3';

let logCache: HealthEvent[] | null = null;

const DEFAULT_PROFILE: ProfileData = {
  name: '',
  birthDate: '',
  lastUpdated: '',
  weight: '',
  height: '',
  bloodType: '',
  allergies: '',
  conditions: '',
  recentInterventions: '',
  contraception: '',
  stressBaseline: 'medium',
  sensitivities: [],
  mentalArchetype: '',
  familyHistory: '',
  menarcheAge: '',
  units: 'metric'
};

// Security Helper
const sanitizeInput = (str: unknown): string => {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>]/g, '').trim();
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isCycleSyncPayload = (payload: EventPayload): payload is CycleSyncPayload => {
  if (!isRecord(payload)) return false;
  const record = payload as Record<string, unknown>;
  return typeof record.day === 'number' && typeof record.length === 'number';
};

const isDailyCheckinPayload = (payload: EventPayload): payload is DailyCheckinPayload => {
  if (!isRecord(payload)) return false;
  const record = payload as Record<string, unknown>;
  return isRecord(record.metrics) && Array.isArray(record.symptoms) && typeof record.isPeriod === 'boolean';
};

const isFuelLogPayload = (payload: EventPayload): payload is FuelLogPayload => {
  if (!isRecord(payload)) return false;
  const record = payload as Record<string, unknown>;
  return typeof record.nutrient === 'string';
};

const isMedicationLogPayload = (payload: EventPayload): payload is MedicationLogPayload => {
  if (!isRecord(payload)) return false;
  const record = payload as Record<string, unknown>;
  if (typeof record.action !== 'string' || typeof record.medId !== 'string') return false;
  return record.action === 'REMOVE' || (record.action === 'ADD' && typeof record.name === 'string');
};

const isLabMarkerEntryPayload = (payload: EventPayload): payload is LabMarkerEntryPayload => {
  if (!isRecord(payload)) return false;
  const record = payload as Record<string, unknown>;
  return typeof record.rawText === 'string';
};

const isProfileUpdatePayload = (payload: EventPayload): payload is ProfileUpdatePayload =>
  isRecord(payload);

const parseLog = (raw: string | null): HealthEvent[] => {
  if (!raw) return [];
  if (raw.startsWith('enc:v1:')) return logCache || [];
  try {
    return JSON.parse(raw) as HealthEvent[];
  } catch {
    return [];
  }
};

export const dataService = {
  hydrateLog: async (): Promise<HealthEvent[]> => {
    const raw = await secureGetItem(STORAGE_KEY);
    logCache = parseLog(raw);
    return logCache;
  },

  logEvent: (type: EventType, payload: EventPayload): HealthEvent => {
    try {
      const log = dataService.getLog();
      
      // Sanitization Layer
      const sanitizedPayload = JSON.parse(JSON.stringify(payload), (key, value) => {
        return typeof value === 'string' ? sanitizeInput(value) : value;
      });

      const newEvent: HealthEvent = {
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15),
        timestamp: new Date().toISOString(),
        type,
        payload: sanitizedPayload,
        version: 4
      };
      
      const updatedLog = [...log, newEvent];
      logCache = updatedLog;
      void secureSetItem(STORAGE_KEY, JSON.stringify(updatedLog));
      return newEvent;
    } catch (e) {
      console.error("Data sync failed", e);
      throw e;
    }
  },

  getLog: (): HealthEvent[] => {
    if (logCache) return logCache;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      logCache = parseLog(raw);
      return logCache;
    } catch (e) {
      return [];
    }
  },

  projectState: (log: HealthEvent[]): SystemState => {
    const today = new Date().toISOString().split('T')[0];
    
    return log.reduce((state: SystemState, event: HealthEvent) => {
      const eventDate = event.timestamp.split('T')[0];
      
      switch (event.type) {
        case 'ONBOARDING_COMPLETE':
          return { ...state, onboarded: true };
        case 'CYCLE_SYNC':
          if (!isCycleSyncPayload(event.payload)) return state;
          return { ...state, currentDay: event.payload.day, cycleLength: event.payload.length };
        case 'DAILY_CHECKIN':
          if (!isDailyCheckinPayload(event.payload)) return state;
          {
            const payload = event.payload;
            const symptoms = Array.from(new Set([...state.symptoms, ...(payload.symptoms || [])]));
            return { ...state, symptoms, lastCheckin: { ...payload, timestamp: event.timestamp } };
          }
        case 'FUEL_LOG':
          if (!isFuelLogPayload(event.payload)) return state;
          if (eventDate === today) {
            return { ...state, fuelLogs: [...state.fuelLogs, event.payload.nutrient] };
          }
          return state;
        case 'MEDICATION_LOG':
          if (!isMedicationLogPayload(event.payload)) return state;
          {
            const payload = event.payload;
            if (payload.action === 'ADD') {
              const newMed: Medication = {
                id: payload.medId,
                name: payload.name,
                dose: payload.dose,
                startDate: event.timestamp,
                observations: payload.observations || [],
                notes: payload.notes || '',
                addedAt: event.timestamp
              };
              return { ...state, medications: [...state.medications, newMed] };
            }
            if (payload.action === 'REMOVE') {
              return { ...state, medications: state.medications.filter(m => m.id !== payload.medId) };
            }
            return state;
          }
        case 'LAB_MARKER_ENTRY':
          if (!isLabMarkerEntryPayload(event.payload)) return state;
          return { ...state, labData: event.payload.rawText };
        case 'PROFILE_UPDATE':
          if (!isProfileUpdatePayload(event.payload)) return state;
          return { ...state, profile: { ...state.profile, ...event.payload } };
        default:
          return state;
      }
    }, {
      events: log,
      onboarded: false,
      isAuthenticated: false,
      subscriptionTier: 'none',
      currentDay: 1,
      cycleLength: 28,
      medications: [],
      symptoms: [],
      labData: '',
      fuelLogs: [],
      profile: { ...DEFAULT_PROFILE }
    });
  }
};
