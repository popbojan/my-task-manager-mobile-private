import type { TimestampTrigger } from '@notifee/react-native';
import { Linking } from 'react-native';
import type { RecurringReminderCopy } from '@/notifications/recurringReminderPlan';
import { RECURRING_REMINDER_ID_PREFIX } from '@/notifications/recurringReminderPlan';
import {
  loadNotifeePackage,
  warnNotifeeUnavailable,
} from '@/notifications/notifeeBridge';

export const RECURRING_REMINDER_CHANNEL_ID = 'recurring-reminders';

let lastSyncedFingerprint: string | null = null;
let syncInFlight: Promise<void> | null = null;

export function reminderPlanFingerprint(
  reminders: RecurringReminderCopy[],
): string {
  return reminders
    .map(
      reminder =>
        `${reminder.id}|${reminder.timestamp}|${reminder.title}|${reminder.body}`,
    )
    .join('\n');
}

function isManagedReminderId(id: string): boolean {
  return id.startsWith(RECURRING_REMINDER_ID_PREFIX);
}

export async function requestRecurringReminderPermission(): Promise<boolean> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    warnNotifeeUnavailable('requestRecurringReminderPermission');
    return false;
  }

  const { default: notifee, AuthorizationStatus } = notifeePkg;
  const settings = await notifee.requestPermission();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

export async function hasRecurringReminderPermission(): Promise<boolean> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    warnNotifeeUnavailable('hasRecurringReminderPermission');
    return false;
  }

  const { default: notifee, AuthorizationStatus } = notifeePkg;
  const settings = await notifee.getNotificationSettings();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

async function ensureReminderChannel(channelName: string): Promise<void> {
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

export async function cancelRecurringReminderTriggers(): Promise<void> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    return;
  }

  const notifee = notifeePkg.default;
  const triggerIds = await notifee.getTriggerNotificationIds();
  const managedIds = triggerIds.filter(isManagedReminderId);
  await Promise.all(
    managedIds.map(id => notifee.cancelTriggerNotification(id)),
  );
  lastSyncedFingerprint = null;
}

/**
 * Apply the reminder plan to native triggers.
 * Diffs by id: cancel stale managed triggers, upsert the desired set.
 * Safe to call off the UI path; skips work when fingerprint is unchanged.
 */
export async function syncRecurringReminderTriggers(
  reminders: RecurringReminderCopy[],
  channelName: string,
): Promise<void> {
  const fingerprint = reminderPlanFingerprint(reminders);
  if (fingerprint === lastSyncedFingerprint) {
    return;
  }

  if (syncInFlight) {
    await syncInFlight;
    if (fingerprint === lastSyncedFingerprint) {
      return;
    }
  }

  const run = (async () => {
    const notifeePkg = loadNotifeePackage();
    if (!notifeePkg) {
      warnNotifeeUnavailable('syncRecurringReminderTriggers');
      return;
    }

    const {
      default: notifee,
      AndroidNotificationSetting,
      TriggerType,
    } = notifeePkg;

    await ensureReminderChannel(channelName);

    if (reminders.length === 0) {
      await cancelRecurringReminderTriggers();
      lastSyncedFingerprint = fingerprint;
      return;
    }

    const permissionGranted = await hasRecurringReminderPermission();
    if (!permissionGranted) {
      await cancelRecurringReminderTriggers();
      lastSyncedFingerprint = fingerprint;
      return;
    }

    const settings = await notifee.getNotificationSettings();
    const alarmEnabled =
      settings.android?.alarm === undefined ||
      settings.android.alarm === AndroidNotificationSetting.ENABLED;

    const desiredIds = new Set(reminders.map(reminder => reminder.id));
    const existingIds = await notifee.getTriggerNotificationIds();
    const staleIds = existingIds.filter(
      id => isManagedReminderId(id) && !desiredIds.has(id),
    );

    await Promise.all(
      staleIds.map(id => notifee.cancelTriggerNotification(id)),
    );

    for (const reminder of reminders) {
      if (reminder.timestamp <= Date.now()) {
        continue;
      }

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: reminder.timestamp,
        ...(alarmEnabled
          ? { alarmManager: { allowWhileIdle: true } }
          : {}),
      };

      await notifee.createTriggerNotification(
        {
          id: reminder.id,
          title: reminder.title,
          body: reminder.body,
          android: {
            channelId: RECURRING_REMINDER_CHANNEL_ID,
            pressAction: { id: 'default' },
            smallIcon: 'ic_stat_notify',
          },
        },
        trigger,
      );
    }

    lastSyncedFingerprint = fingerprint;
  })();

  syncInFlight = run.finally(() => {
    if (syncInFlight === run) {
      syncInFlight = null;
    }
  });

  await syncInFlight;
}

/** Force next sync even if the plan fingerprint matches (e.g. after permission grant). */
export function invalidateRecurringReminderSyncFingerprint(): void {
  lastSyncedFingerprint = null;
}

/** Opens the OS notification settings for this app (fallback: app settings). */
export async function openRecurringReminderNotificationSettings(): Promise<void> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    await Linking.openSettings().catch(() => undefined);
    return;
  }

  try {
    await notifeePkg.default.openNotificationSettings(
      RECURRING_REMINDER_CHANNEL_ID,
    );
  } catch {
    await Linking.openSettings().catch(() => undefined);
  }
}
