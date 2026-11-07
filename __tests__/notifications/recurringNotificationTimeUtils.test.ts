import {
  nextDailyNotificationTimestamp,
  notificationTimeFromDate,
  parseNotificationTime,
} from '@/notifications/recurringNotificationTimeUtils';

describe('recurringNotificationTimeUtils', () => {
  it('parses valid HH:mm values', () => {
    expect(parseNotificationTime('09:30')).toEqual({ hours: 9, minutes: 30 });
    expect(parseNotificationTime('23:59')).toEqual({ hours: 23, minutes: 59 });
    expect(parseNotificationTime('24:00')).toBeNull();
  });

  it('formats dates as HH:mm', () => {
    const date = new Date(2026, 5, 6, 7, 5, 0, 0);
    expect(notificationTimeFromDate(date)).toBe('07:05');
  });

  it('schedules later today when time is still ahead', () => {
    const from = new Date(2026, 5, 6, 8, 0, 0, 0);
    const timestamp = nextDailyNotificationTimestamp('09:30', from);

    expect(timestamp).not.toBeNull();
    const scheduled = new Date(timestamp!);
    expect(scheduled.getHours()).toBe(9);
    expect(scheduled.getMinutes()).toBe(30);
    expect(scheduled.getDate()).toBe(6);
  });

  it('rolls to tomorrow when time already passed', () => {
    const from = new Date(2026, 5, 6, 10, 0, 0, 0);
    const timestamp = nextDailyNotificationTimestamp('09:30', from);

    expect(timestamp).not.toBeNull();
    const scheduled = new Date(timestamp!);
    expect(scheduled.getDate()).toBe(7);
  });
});
