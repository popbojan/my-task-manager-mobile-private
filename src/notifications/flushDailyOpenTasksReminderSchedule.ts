import {
  loadDailyOpenTasksReminderPrefs,
} from '@/notifications/dailyOpenTasksReminderPrefs';
import { syncDailyOpenTasksReminderTrigger } from '@/notifications/dailyOpenTasksReminderScheduler';
import type { TranslationKey } from '@/i18n/locales/de';
import { getDeviceTimezone } from '@/user/deviceTimezone';

type Translate = (
  key: TranslationKey,
  params?: Record<string, string>,
) => string;

type FlushDailyOpenTasksReminderOptions = {
  t: Translate;
  timeZone?: string;
  /** Premium-only feature — non-premium cancels any scheduled trigger. */
  hasPremiumAccess?: boolean;
};

/** Apply stored prefs to the native daily open-tasks reminder trigger. */
export async function flushDailyOpenTasksReminderSchedule(
  options: FlushDailyOpenTasksReminderOptions,
): Promise<void> {
  const prefs = await loadDailyOpenTasksReminderPrefs();
  const timeZone = options.timeZone ?? getDeviceTimezone();
  const enabled = options.hasPremiumAccess === true && prefs.enabled;

  await syncDailyOpenTasksReminderTrigger({
    enabled,
    notificationTime: prefs.notificationTime,
    title: options.t('profile.notifications.reminderTitle'),
    body: options.t('profile.notifications.reminderBody'),
    timeZone,
    channelName: options.t('recurring.reminder.channelName'),
  });
}
