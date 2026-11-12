import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_DAILY_OPEN_TASKS_REMINDER_TIME,
  isValidNotificationTime,
} from '@/notifications/recurringNotificationTimeUtils';

const STORAGE_KEY = '@mtm/daily-open-tasks-reminder';

export type DailyOpenTasksReminderPrefs = {
  enabled: boolean;
  notificationTime: string;
};

export const DEFAULT_DAILY_OPEN_TASKS_REMINDER_PREFS: DailyOpenTasksReminderPrefs =
  {
    enabled: true,
    notificationTime: DEFAULT_DAILY_OPEN_TASKS_REMINDER_TIME,
  };

function normalizePrefs(
  value: Partial<DailyOpenTasksReminderPrefs> | null | undefined,
): DailyOpenTasksReminderPrefs {
  const notificationTime =
    typeof value?.notificationTime === 'string' &&
    isValidNotificationTime(value.notificationTime)
      ? value.notificationTime
      : DEFAULT_DAILY_OPEN_TASKS_REMINDER_TIME;

  return {
    enabled: value?.enabled !== false,
    notificationTime,
  };
}

export async function loadDailyOpenTasksReminderPrefs(): Promise<DailyOpenTasksReminderPrefs> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_DAILY_OPEN_TASKS_REMINDER_PREFS };
    }

    return normalizePrefs(JSON.parse(raw) as Partial<DailyOpenTasksReminderPrefs>);
  } catch {
    return { ...DEFAULT_DAILY_OPEN_TASKS_REMINDER_PREFS };
  }
}

export async function saveDailyOpenTasksReminderPrefs(
  prefs: DailyOpenTasksReminderPrefs,
): Promise<DailyOpenTasksReminderPrefs> {
  const normalized = normalizePrefs(prefs);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}
