import { RecurringTaskStatus } from '@/api/generated';
import type { RecurringTask } from '@/api/generated/models/RecurringTask';
import {
  buildRecurringTaskNotificationFields,
  recurringTaskToFormState,
  resolveStoredNotificationTime,
  selectRecurringTaskForForm,
} from '@/pages/recurring-tasks/recurringTaskFormUtils';

function task(overrides: Partial<RecurringTask> = {}): RecurringTask {
  return {
    id: 'task-1',
    title: 'Daily',
    description: null,
    status: RecurringTaskStatus.Todo,
    streakCount: 0,
    lastCompletedAt: null,
    lastResetAt: new Date('2026-11-07T00:00:00.000Z'),
    nextResetAt: new Date('2026-11-08T00:00:00.000Z'),
    notificationEnabled: false,
    notificationTime: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('recurringTaskFormUtils', () => {
  it('keeps a chosen reminder time even when notifications stay off', () => {
    expect(
      buildRecurringTaskNotificationFields({
        notificationEnabled: false,
        notificationTime: '20:30',
      }),
    ).toEqual({
      notificationEnabled: false,
      notificationTime: '20:30',
    });
  });

  it('stores the displayed default time when the switch is off and no time was picked', () => {
    expect(
      buildRecurringTaskNotificationFields({
        notificationEnabled: false,
        notificationTime: null,
      }),
    ).toEqual({
      notificationEnabled: false,
      notificationTime: '09:00',
    });
  });

  it('keeps the stored time when reminders are turned on later', () => {
    expect(
      buildRecurringTaskNotificationFields({
        notificationEnabled: true,
        notificationTime: '06:15',
      }),
    ).toEqual({
      notificationEnabled: true,
      notificationTime: '06:15',
    });
  });

  it('loads a saved time into the form even if reminders are disabled', () => {
    const form = recurringTaskToFormState(
      task({ notificationEnabled: false, notificationTime: '21:00' }),
    );

    expect(form.notificationEnabled).toBe(false);
    expect(form.notificationTime).toBe('21:00');
  });

  it('falls back to the default reminder time in the form', () => {
    expect(resolveStoredNotificationTime(null)).toBe('09:00');
    expect(recurringTaskToFormState(task()).notificationTime).toBe('09:00');
  });

  it('prefers the list task when it was updated later than the cached GET', () => {
    const fetched = task({
      notificationTime: '09:00',
      updatedAt: new Date('2026-11-07T10:00:00.000Z'),
    });
    const listed = task({
      notificationTime: '08:00',
      updatedAt: new Date('2026-11-07T10:01:00.000Z'),
    });

    expect(selectRecurringTaskForForm(fetched, listed)?.notificationTime).toBe(
      '08:00',
    );
  });
});
