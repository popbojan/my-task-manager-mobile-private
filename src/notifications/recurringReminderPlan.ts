import { RecurringTaskStatus } from '@/api/generated';
import type { RecurringTask } from '@/api/generated/models/RecurringTask';
import {
  isValidNotificationTime,
  parseNotificationTime,
} from '@/notifications/recurringNotificationTimeUtils';
import {
  readLocalTimeParts,
  resolveRecurringResetTimezone,
} from '@/recurring/recurringResetPollingUtils';
import { isPremiumPreviewTask } from '@/utils/recurringPremiumPreview';
import {
  formatCalendarDate,
  shiftCalendarDate,
} from '@/utils/historyCalendar';

export const RECURRING_REMINDER_ID_PREFIX = 'recurring-reminder-';

const MS_PER_MINUTE = 60_000;

export type RecurringReminderTask = Pick<
  RecurringTask,
  'id' | 'title' | 'status' | 'notificationEnabled' | 'notificationTime'
>;

export type RecurringReminderCopy = {
  id: string;
  notificationTime: string;
  timestamp: number;
  title: string;
  body: string;
  taskIds: string[];
};

export type RecurringReminderTranslate = (
  key:
    | 'recurring.reminder.singleTitle'
    | 'recurring.reminder.singleBody'
    | 'recurring.reminder.multiTitle'
    | 'recurring.reminder.multiBody',
  params?: Record<string, string>,
) => string;

/**
 * One AlarmManager trigger per task — same simplicity as the profile daily reminder.
 * Strip UUID hyphens: some Android/Notifee paths are flaky with long hyphenated ids.
 */
export function reminderNotificationIdForTask(taskId: string): string {
  return `${RECURRING_REMINDER_ID_PREFIX}task-${taskId.replace(/-/g, '')}`;
}

/** Pre-strip id format — cancel on rewrite so debug→release upgrades don't leave orphans. */
export function legacyHyphenatedReminderNotificationIdForTask(
  taskId: string,
): string {
  return `${RECURRING_REMINDER_ID_PREFIX}task-${taskId}`;
}

/** Current + legacy ids for one task (deduped). */
export function reminderNotificationIdsForTask(taskId: string): string[] {
  const current = reminderNotificationIdForTask(taskId);
  const legacy = legacyHyphenatedReminderNotificationIdForTask(taskId);
  return current === legacy ? [current] : [current, legacy];
}

/** @deprecated Old time-grouped ids (`recurring-reminder-0900`). Kept for cleanup. */
export function reminderNotificationId(notificationTime: string): string {
  return `${RECURRING_REMINDER_ID_PREFIX}${notificationTime.replace(':', '')}`;
}

export function isLegacyTimeGroupedReminderId(id: string): boolean {
  return (
    id.startsWith(RECURRING_REMINDER_ID_PREFIX) &&
    !id.startsWith(`${RECURRING_REMINDER_ID_PREFIX}task-`) &&
    /^recurring-reminder-\d{3,4}$/.test(id)
  );
}

export function localWallClockUtcMs(
  timeZone: string,
  local: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  },
): number {
  const resolved = resolveRecurringResetTimezone(timeZone);
  const guess = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour,
    local.minute,
    0,
  );

  for (let offsetMin = -14 * 60; offsetMin <= 36 * 60; offsetMin++) {
    const candidate = guess + offsetMin * MS_PER_MINUTE;
    const parts = readLocalTimeParts(new Date(candidate), resolved);
    const hour = parts.hour === 24 ? 0 : parts.hour;

    if (
      parts.year === local.year &&
      parts.month === local.month &&
      parts.day === local.day &&
      hour === local.hour &&
      parts.minute === local.minute
    ) {
      return candidate;
    }
  }

  return guess;
}

export function nextDailyReminderTimestampMs(
  notificationTime: string,
  timeZone: string,
  from = new Date(),
): number | null {
  const parsed = parseNotificationTime(notificationTime);
  if (!parsed) {
    return null;
  }

  const resolved = resolveRecurringResetTimezone(timeZone);
  const parts = readLocalTimeParts(from, resolved);
  const today = formatCalendarDate(parts.year, parts.month - 1, parts.day);
  const todayMs = localWallClockUtcMs(resolved, {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parsed.hours,
    minute: parsed.minutes,
  });

  if (todayMs > from.getTime()) {
    return todayMs;
  }

  const [year, month, day] = shiftCalendarDate(today, 1)
    .split('-')
    .map(Number);

  return localWallClockUtcMs(resolved, {
    year,
    month,
    day,
    hour: parsed.hours,
    minute: parsed.minutes,
  });
}

export function selectRecurringReminderTasks(
  tasks: RecurringReminderTask[],
): RecurringReminderTask[] {
  return tasks.filter(
    task =>
      !isPremiumPreviewTask(task.id) &&
      task.notificationEnabled &&
      !!task.notificationTime &&
      isValidNotificationTime(task.notificationTime),
  );
}

export function isSameLocalCalendarDay(
  left: Date,
  right: Date,
  timeZone: string,
): boolean {
  const resolved = resolveRecurringResetTimezone(timeZone);
  const a = readLocalTimeParts(left, resolved);
  const b = readLocalTimeParts(right, resolved);
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function reminderCopyForTask(
  task: RecurringReminderTask,
  t: RecurringReminderTranslate,
): { title: string; body: string } {
  const title = task.title.trim() || t('recurring.reminder.multiTitle');
  return {
    title: t('recurring.reminder.singleTitle', { title }),
    body: t('recurring.reminder.singleBody'),
  };
}

/** @deprecated Prefer reminderCopyForTask — one notification per task. */
export function reminderCopyForTasks(
  tasks: RecurringReminderTask[],
  t: RecurringReminderTranslate,
): { title: string; body: string } {
  if (tasks.length === 1) {
    return reminderCopyForTask(tasks[0], t);
  }

  const titles = tasks
    .map(task => task.title.trim())
    .filter(title => title.length > 0);

  if (titles.length === 0) {
    return {
      title: t('recurring.reminder.multiTitle'),
      body: t('recurring.reminder.singleBody'),
    };
  }

  return {
    title: t('recurring.reminder.multiTitle'),
    body: t('recurring.reminder.multiBody', { titles: titles.join(' · ') }),
  };
}

export function buildReminderCopyForTask(
  task: RecurringReminderTask,
  timeZone: string,
  t: RecurringReminderTranslate,
  from = new Date(),
): RecurringReminderCopy | null {
  if (
    isPremiumPreviewTask(task.id) ||
    !task.notificationEnabled ||
    !task.notificationTime ||
    !isValidNotificationTime(task.notificationTime)
  ) {
    return null;
  }

  const notificationTime = task.notificationTime;
  let timestamp = nextDailyReminderTimestampMs(
    notificationTime,
    timeZone,
    from,
  );
  if (timestamp === null) {
    return null;
  }

  // Done today → remind tomorrow (same idea as the old grouped plan).
  if (
    task.status === RecurringTaskStatus.Done &&
    isSameLocalCalendarDay(from, new Date(timestamp), timeZone)
  ) {
    timestamp = nextDailyReminderTimestampMs(
      notificationTime,
      timeZone,
      new Date(timestamp),
    );
    if (timestamp === null) {
      return null;
    }
  }

  const copy = reminderCopyForTask(task, t);
  return {
    id: reminderNotificationIdForTask(task.id),
    notificationTime,
    timestamp,
    title: copy.title,
    body: copy.body,
    taskIds: [task.id],
  };
}

/** One trigger per enabled task — no grouping by clock time. */
export function buildRecurringReminderPlan(
  tasks: RecurringReminderTask[],
  timeZone: string,
  t: RecurringReminderTranslate,
  from = new Date(),
): RecurringReminderCopy[] {
  return selectRecurringReminderTasks(tasks)
    .map(task => buildReminderCopyForTask(task, timeZone, t, from))
    .filter((item): item is RecurringReminderCopy => item !== null);
}
