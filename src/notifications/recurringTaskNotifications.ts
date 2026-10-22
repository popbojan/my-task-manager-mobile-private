import type { TimestampTrigger } from '@notifee/react-native';
import type { RecurringTask } from '@/api/generated';
import {
  loadNotifeePackage,
  warnNotifeeUnavailable,
} from '@/notifications/notifeeBridge';
import {
  nextDailyNotificationTimestamp,
  parseNotificationTime,
} from '@/notifications/recurringNotificationTimeUtils';

const ANDROID_CHANNEL_ID = 'recurring-task-reminders';
const NOTIFICATION_ID_PREFIX = 'recurring-task:';

export type RecurringNotificationCopy = {
  channelName: string;
  channelDescription: string;
  body: (taskTitle: string) => string;
};

function notificationIdForTask(taskId: string): string {
  return `${NOTIFICATION_ID_PREFIX}${taskId}`;
}

function isManagedRecurringNotificationId(id: string): boolean {
  return id.startsWith(NOTIFICATION_ID_PREFIX);
}

export async function ensureRecurringNotificationChannel(
  copy: RecurringNotificationCopy,
): Promise<void> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    warnNotifeeUnavailable('ensureRecurringNotificationChannel');
    return;
  }

  const { default: notifee, AndroidImportance } = notifeePkg;

  await notifee.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: copy.channelName,
    description: copy.channelDescription,
    importance: AndroidImportance.HIGH,
  });
}

export async function hasRecurringNotificationPermission(): Promise<boolean> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    warnNotifeeUnavailable('hasRecurringNotificationPermission');
    return false;
  }

  const { default: notifee, AuthorizationStatus } = notifeePkg;
  const settings = await notifee.getNotificationSettings();

  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

export async function requestRecurringNotificationPermission(): Promise<boolean> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    warnNotifeeUnavailable('requestRecurringNotificationPermission');
    return false;
  }

  const { default: notifee, AuthorizationStatus } = notifeePkg;
  const settings = await notifee.requestPermission();

  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

export async function cancelRecurringTaskNotification(taskId: string): Promise<void> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    return;
  }

  await notifeePkg.default.cancelTriggerNotification(notificationIdForTask(taskId));
}

export async function cancelAllRecurringTaskNotifications(): Promise<void> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    return;
  }

  const notifee = notifeePkg.default;
  const triggerIds = await notifee.getTriggerNotificationIds();
  const managedIds = triggerIds.filter(isManagedRecurringNotificationId);

  await Promise.all(managedIds.map(id => notifee.cancelTriggerNotification(id)));
}

export async function syncRecurringTaskNotifications(
  tasks: RecurringTask[],
  copy: RecurringNotificationCopy,
): Promise<void> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    warnNotifeeUnavailable('syncRecurringTaskNotifications');
    return;
  }

  const { default: notifee, RepeatFrequency, TriggerType } = notifeePkg;

  await ensureRecurringNotificationChannel(copy);

  const permissionGranted = await hasRecurringNotificationPermission();
  const enabledTaskIds = new Set<string>();

  for (const task of tasks) {
    const notificationId = notificationIdForTask(task.id);

    if (!task.notificationEnabled || !task.notificationTime) {
      await notifee.cancelTriggerNotification(notificationId);
      continue;
    }

    if (!parseNotificationTime(task.notificationTime)) {
      await notifee.cancelTriggerNotification(notificationId);
      continue;
    }

    if (!permissionGranted) {
      continue;
    }

    const timestamp = nextDailyNotificationTimestamp(task.notificationTime);
    if (timestamp === null) {
      continue;
    }

    enabledTaskIds.add(task.id);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp,
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title: task.title,
        body: copy.body(task.title),
        android: {
          channelId: ANDROID_CHANNEL_ID,
          pressAction: { id: 'default' },
        },
      },
      trigger,
    );
  }

  const triggerIds = await notifee.getTriggerNotificationIds();
  const staleIds = triggerIds.filter((id: string) => {
    if (!isManagedRecurringNotificationId(id)) {
      return false;
    }

    const taskId = id.slice(NOTIFICATION_ID_PREFIX.length);
    return !enabledTaskIds.has(taskId);
  });

  await Promise.all(staleIds.map((id: string) => notifee.cancelTriggerNotification(id)));
}
