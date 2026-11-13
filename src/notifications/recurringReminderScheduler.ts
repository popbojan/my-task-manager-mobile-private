import type { TimestampTrigger } from '@notifee/react-native';
import { Linking } from 'react-native';
import type { RecurringReminderCopy } from '@/notifications/recurringReminderPlan';
import {
  nextDailyReminderTimestampMs,
  RECURRING_REMINDER_ID_PREFIX,
} from '@/notifications/recurringReminderPlan';
import { RECURRING_REMINDER_OPEN_TAB } from '@/notifications/recurringReminderNavigation';
import {
  loadNotifeePackage,
  warnNotifeeUnavailable,
} from '@/notifications/notifeeBridge';

export const RECURRING_REMINDER_CHANNEL_ID = 'recurring-reminders';

/** AlarmManager writes can take seconds — keep a lead so we don't skip "now". */
const MIN_TRIGGER_LEAD_MS = 3_000;

let lastSyncedFingerprint: string | null = null;
let syncInFlight: Promise<void> | null = null;
let cachedPermission: boolean | null = null;
let permissionInFlight: Promise<boolean> | null = null;
let cachedAlarmPermission: boolean | null = null;
let alarmPermissionInFlight: Promise<boolean> | null = null;

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

/** Sync read for instant form paint — may be null until first native check. */
export function getCachedRecurringReminderPermission(): boolean | null {
  return cachedPermission;
}

/** Sync read for Android exact-alarm gate — null until first native check. */
export function getCachedRecurringReminderAlarmPermission(): boolean | null {
  return cachedAlarmPermission;
}

function yieldToUi(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

export async function requestRecurringReminderPermission(): Promise<boolean> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    warnNotifeeUnavailable('requestRecurringReminderPermission');
    cachedPermission = false;
    return false;
  }

  const { default: notifee, AuthorizationStatus } = notifeePkg;
  const settings = await notifee.requestPermission();
  const granted =
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
  cachedPermission = granted;
  return granted;
}

export async function hasRecurringReminderPermission(): Promise<boolean> {
  if (permissionInFlight) {
    return permissionInFlight;
  }

  permissionInFlight = (async () => {
    const notifeePkg = loadNotifeePackage();
    if (!notifeePkg) {
      warnNotifeeUnavailable('hasRecurringReminderPermission');
      cachedPermission = false;
      return false;
    }

    const { default: notifee, AuthorizationStatus } = notifeePkg;
    const settings = await notifee.getNotificationSettings();
    const granted =
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;
    cachedPermission = granted;
    return granted;
  })().finally(() => {
    permissionInFlight = null;
  });

  return permissionInFlight;
}

/**
 * Android 12+: timestamp/AlarmManager triggers need SCHEDULE_EXACT_ALARM.
 * iOS / unsupported devices report NOT_SUPPORTED → treat as allowed.
 */
export async function hasRecurringReminderAlarmPermission(): Promise<boolean> {
  if (alarmPermissionInFlight) {
    return alarmPermissionInFlight;
  }

  alarmPermissionInFlight = (async () => {
    const notifeePkg = loadNotifeePackage();
    if (!notifeePkg) {
      warnNotifeeUnavailable('hasRecurringReminderAlarmPermission');
      cachedAlarmPermission = false;
      return false;
    }

    const { default: notifee, AndroidNotificationSetting } = notifeePkg;
    const settings = await notifee.getNotificationSettings();
    const alarm = settings.android?.alarm;
    const granted =
      alarm == null ||
      alarm === AndroidNotificationSetting.ENABLED ||
      alarm === AndroidNotificationSetting.NOT_SUPPORTED;
    cachedAlarmPermission = granted;
    return granted;
  })().finally(() => {
    alarmPermissionInFlight = null;
  });

  return alarmPermissionInFlight;
}

/** Opens the system screen for exact alarms / “Alarms & reminders”. */
export async function openRecurringReminderAlarmSettings(): Promise<void> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    await Linking.openSettings().catch(() => undefined);
    return;
  }

  try {
    await notifeePkg.default.openAlarmPermissionSettings();
  } catch {
    await Linking.openSettings().catch(() => undefined);
  }
}

/**
 * If exact alarms are disabled, open the system alarm settings once.
 * Returns whether alarms are allowed afterwards (may still be false if user backs out).
 */
export async function ensureRecurringReminderAlarmPermission(): Promise<boolean> {
  const allowed = await hasRecurringReminderAlarmPermission();
  if (allowed) {
    return true;
  }

  await openRecurringReminderAlarmSettings();
  return hasRecurringReminderAlarmPermission();
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
  for (const id of managedIds) {
    await notifee.cancelTriggerNotification(id);
    await yieldToUi();
  }
  lastSyncedFingerprint = null;
}

type SyncRecurringReminderOptions = {
  /**
   * When false, skip native work (legacy idle path). Callers that touch
   * AlarmManager must pass true — there is no background sync anymore.
   */
  force?: boolean;
  /** IANA timezone used to roll past-due plan timestamps forward. */
  timeZone: string;
};

function resolveLiveTriggerTimestamp(
  reminder: RecurringReminderCopy,
  timeZone: string,
  nowMs: number,
): number | null {
  if (reminder.timestamp > nowMs + MIN_TRIGGER_LEAD_MS) {
    return reminder.timestamp;
  }

  // Save/AlarmManager can outlast the planned minute — schedule the next slot.
  return nextDailyReminderTimestampMs(
    reminder.notificationTime,
    timeZone,
    new Date(nowMs + MIN_TRIGGER_LEAD_MS),
  );
}

/**
 * Apply the reminder plan to native triggers (AlarmManager).
 * Only call from explicit user reminder actions (form Save / delete / profile).
 * Never from AppState background/resume — that freezes the UI for many seconds.
 */
export async function syncRecurringReminderTriggers(
  reminders: RecurringReminderCopy[],
  channelName: string,
  options: SyncRecurringReminderOptions,
): Promise<void> {
  const force = options.force === true;
  const timeZone = options.timeZone;

  // No idle/background path — callers must opt in with force: true.
  if (!force) {
    return;
  }

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

    const { default: notifee, RepeatFrequency, TriggerType } = notifeePkg;

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

    // AlarmManager: reliable with app closed / after reboot; keep under Save/delete loaders.
    const desiredIds = new Set(reminders.map(reminder => reminder.id));
    const existingIds = await notifee.getTriggerNotificationIds();
    const staleIds = existingIds.filter(
      id => isManagedReminderId(id) && !desiredIds.has(id),
    );

    for (const id of staleIds) {
      await notifee.cancelTriggerNotification(id);
    }

    let scheduledCount = 0;
    for (const reminder of reminders) {
      const timestamp = resolveLiveTriggerTimestamp(
        reminder,
        timeZone,
        Date.now(),
      );
      if (timestamp === null || timestamp <= Date.now()) {
        if (__DEV__) {
          console.warn(
            `[notifications] skipped trigger ${reminder.id} (${reminder.notificationTime}) — no future slot`,
          );
        }
        continue;
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
          id: reminder.id,
          title: reminder.title,
          body: reminder.body,
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
      scheduledCount += 1;
    }

    if (reminders.length > 0 && scheduledCount === 0) {
      // Don't mark synced — otherwise we never retry after a slow save past the minute.
      lastSyncedFingerprint = null;
      return;
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

/**
 * Opens app-level notification settings (master toggle), not a single channel page.
 * Channel settings often have no switch when notifications are disabled for the app.
 */
export async function openRecurringReminderNotificationSettings(): Promise<void> {
  const notifeePkg = loadNotifeePackage();
  if (!notifeePkg) {
    await Linking.openSettings().catch(() => undefined);
    return;
  }

  try {
    // No channelId → app notification screen with the main allow/deny switch.
    await notifeePkg.default.openNotificationSettings();
  } catch {
    await Linking.openSettings().catch(() => undefined);
  }
}

