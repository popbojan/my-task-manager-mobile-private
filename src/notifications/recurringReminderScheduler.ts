import type { RecurringReminderCopy } from '@/notifications/recurringReminderPlan';

export const RECURRING_REMINDER_CHANNEL_ID = 'recurring-reminders';

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

/** Native local alarms parked — notify-kit blocked save/UI for tens of seconds. */
export async function requestRecurringReminderPermission(): Promise<boolean> {
  return false;
}

export async function hasRecurringReminderPermission(): Promise<boolean> {
  return false;
}

export async function cancelRecurringReminderTriggers(): Promise<void> {}

export async function syncRecurringReminderTriggers(
  _reminders: RecurringReminderCopy[],
  _channelName: string,
): Promise<void> {}
