import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { env, hasApiBaseUrl } from '../config/env';

export type ReminderPermissionState = 'granted' | 'denied' | 'undetermined';

const toReminderPermission = (status: Notifications.PermissionStatus): ReminderPermissionState => {
  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
};

export async function getReminderPermissionState(): Promise<ReminderPermissionState> {
  try {
    const permissions = await Notifications.getPermissionsAsync();
    return toReminderPermission(permissions.status);
  } catch {
    return 'undetermined';
  }
}

export async function requestReminderPermission(): Promise<ReminderPermissionState> {
  try {
    const permissions = await Notifications.requestPermissionsAsync();
    return toReminderPermission(permissions.status);
  } catch {
    return 'denied';
  }
}

export async function scheduleEveningReflectionReminder(): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('evening-reflection', {
        name: 'Evening Reflection',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Luna29',
        body: 'A quiet moment with Luna29 tonight.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 20,
        minute: 30,
      },
    });
  } catch {
    // Ignore scheduling failures in development environments.
  }
}

export async function getExpoPushTokenValue(): Promise<string> {
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ||
      Constants?.easConfig?.projectId ||
      undefined;
    const token = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
    return token.data || '';
  } catch {
    return '';
  }
}

async function postPush<T>(path: string, payload?: Record<string, unknown>): Promise<T> {
  if (!hasApiBaseUrl) throw new Error('Missing EXPO_PUBLIC_API_BASE_URL');
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload || {}),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof json?.error === 'string' ? json.error : `Request failed: ${response.status}`);
  }
  return json as T;
}

export async function fetchPushRegistrationStatus(): Promise<{ registered: boolean; count: number; updatedAt?: string | null }> {
  if (!hasApiBaseUrl) return { registered: false, count: 0, updatedAt: null };
  const response = await fetch(`${env.apiBaseUrl}/api/mobile/push/status`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof json?.error === 'string' ? json.error : `Request failed: ${response.status}`);
  }
  return {
    registered: Boolean(json?.registered),
    count: Number(json?.count || 0),
    updatedAt: typeof json?.updatedAt === 'string' ? json.updatedAt : null,
  };
}

export async function registerDevicePushToken(deviceName = ''): Promise<{ ok: boolean; registered: boolean; count: number }> {
  const permission = await requestReminderPermission();
  if (permission !== 'granted') {
    throw new Error('Push permission is not granted.');
  }
  const token = await getExpoPushTokenValue();
  if (!token) {
    throw new Error('Could not get Expo push token.');
  }
  return postPush<{ ok: boolean; registered: boolean; count: number }>('/api/mobile/push/register', {
    token,
    platform: Platform.OS,
    deviceName: deviceName || Platform.OS,
  });
}

export async function sendPushTest(): Promise<{ ok: boolean; queued: boolean; message: string }> {
  if (!hasApiBaseUrl) {
    return { ok: true, queued: false, message: 'Push test is available with API mode.' };
  }
  return postPush<{ ok: boolean; queued: boolean; message: string }>('/api/mobile/push/test');
}
