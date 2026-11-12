import type { TimestampTrigger } from '@notifee/react-native';
import { nextDailyReminderTimestampMs } from '@/notifications/recurringReminderPlan';
import { RECURRING_REMINDER_OPEN_TAB } from '@/notifications/recurringReminderNavigation';
import {
  hasRecurringReminderPermission,
  RECURRING_REMINDER_CHANNEL_ID,
} from '@/notifications/recurringReminderScheduler';
import {
  loadNotifeePackage,
  warnNotifeeUnavailable,
} from '@/notifications/notifeeBridge';
import { isValidNotificationTime } from '@/notifications/recurringNotificationTimeUtils';

/** Stable id — must not use the recurring-reminder- prefix (managed separately). */
export const DAILY_OPEN_TASKS_REMINDER_ID = 'daily-open-tasks-reminder';

const MIN_TRIGGER_LEAD_MS = 3_000;

export type SyncDailyOpenTasksReminderOptions = {
  enabled: boolean;
  notificationTime: string;
  title: string;
  body: string;
  timeZone: string;
  channelName: string;
};

async function ensureChannel(channelName: string): Promise<void> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    return;
  }

  const { default: notifee, AndroidImportance } = notifeePkg;
  await notifee.createChannel({
    id: RECURRING_REMINDER_CHANNEL_ID,
    name: channelName,
    importance: AndroidImportance.HIGH,
  });
}

export async function cancelDailyOpenTasksReminderTrigger(): Promise<void> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    return;
  }

  await notifeePkg.default.cancelTriggerNotification(DAILY_OPEN_TASKS_REMINDER_ID);
}

export async function syncDailyOpenTasksReminderTrigger(
  options: SyncDailyOpenTasksReminderOptions,
): Promise<void> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    warnNotifeeUnavailable('syncDailyOpenTasksReminderTrigger');
    return;
  }

  const { default: notifee, RepeatFrequency, TriggerType } = notifeePkg;

  if (
    !options.enabled ||
    !isValidNotificationTime(options.notificationTime)
  ) {
    await cancelDailyOpenTasksReminderTrigger();
    return;
  }

  const permissionGranted = await hasRecurringReminderPermission();
  if (!permissionGranted) {
    await cancelDailyOpenTasksReminderTrigger();
    return;
  }

  await ensureChannel(options.channelName);

  let timestamp = nextDailyReminderTimestampMs(
    options.notificationTime,
    options.timeZone,
  );
  if (timestamp === null) {
    await cancelDailyOpenTasksReminderTrigger();
    return;
  }

  if (timestamp <= Date.now() + MIN_TRIGGER_LEAD_MS) {
    timestamp = nextDailyReminderTimestampMs(
      options.notificationTime,
      options.timeZone,
      new Date(Date.now() + MIN_TRIGGER_LEAD_MS),
    );
    if (timestamp === null || timestamp <= Date.now()) {
      await cancelDailyOpenTasksReminderTrigger();
      return;
    }
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp,
    repeatFrequency: RepeatFrequency.DAILY,
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  await notifee.createTriggerNotification(
    {
      id: DAILY_OPEN_TASKS_REMINDER_ID,
      title: options.title,
      body: options.body,
      data: {
        openTab: RECURRING_REMINDER_OPEN_TAB,
      },
      android: {
        channelId: RECURRING_REMINDER_CHANNEL_ID,
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        smallIcon: 'ic_stat_notify',
      },
    },
    trigger,
  );
}
