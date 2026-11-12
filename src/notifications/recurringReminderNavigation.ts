import { RECURRING_REMINDER_ID_PREFIX } from '@/notifications/recurringReminderPlan';

type OpenTodayListener = () => void;

const listeners = new Set<OpenTodayListener>();

export const RECURRING_REMINDER_OPEN_TAB = 'today';

export function isRecurringReminderNotification(notification: {
  id?: string;
  data?: Record<string, unknown> | null;
} | null | undefined): boolean {
  if (!notification) {
    return false;
  }

  if (
    typeof notification.id === 'string' &&
    notification.id.startsWith(RECURRING_REMINDER_ID_PREFIX)
  ) {
    return true;
  }

  return notification.data?.openTab === RECURRING_REMINDER_OPEN_TAB;
}

/** Ask the main shell to show the Heute tab (notification press). */
export function requestOpenTodayFromReminder(): void {
  listeners.forEach(listener => {
    try {
      listener();
    } catch {
      // Listener failures must not break notification handling.
    }
  });
}

export function subscribeOpenTodayFromReminder(
  listener: OpenTodayListener,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
