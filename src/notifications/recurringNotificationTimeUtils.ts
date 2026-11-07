export const NOTIFICATION_TIME_PATTERN = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

export const DEFAULT_RECURRING_NOTIFICATION_TIME = '09:00';

export function isValidNotificationTime(value: string): boolean {
  return NOTIFICATION_TIME_PATTERN.test(value);
}

export function parseNotificationTime(value: string): { hours: number; minutes: number } | null {
  if (!isValidNotificationTime(value)) {
    return null;
  }

  const [hours, minutes] = value.split(':').map(part => Number(part));
  return { hours, minutes };
}

export function notificationTimeFromDate(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function notificationTimeToDate(
  value: string,
  reference = new Date(),
): Date | null {
  const parsed = parseNotificationTime(value);
  if (!parsed) {
    return null;
  }

  const date = new Date(reference);
  date.setHours(parsed.hours, parsed.minutes, 0, 0);
  return date;
}

/** Next local wall-clock instant for a daily HH:mm reminder. */
export function nextDailyNotificationTimestamp(
  notificationTime: string,
  from = new Date(),
): number | null {
  const date = notificationTimeToDate(notificationTime, from);
  if (!date) {
    return null;
  }

  if (date.getTime() <= from.getTime()) {
    date.setDate(date.getDate() + 1);
  }

  return date.getTime();
}

export function formatNotificationTimeLabel(
  notificationTime: string,
  locale: string,
): string {
  const date = notificationTimeToDate(notificationTime);
  if (!date) {
    return notificationTime;
  }

  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
