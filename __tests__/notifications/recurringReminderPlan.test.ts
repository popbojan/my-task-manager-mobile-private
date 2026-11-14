import { RecurringTaskStatus } from '@/api/generated';
import type { RecurringTask } from '@/api/generated/models/RecurringTask';
import {
  buildRecurringReminderPlan,
  nextDailyReminderTimestampMs,
  reminderCopyForTask,
  reminderCopyForTasks,
  legacyHyphenatedReminderNotificationIdForTask,
  reminderNotificationIdForTask,
  reminderNotificationIdsForTask,
  selectRecurringReminderTasks,
} from '@/notifications/recurringReminderPlan';

function task(overrides: Partial<RecurringTask> = {}): RecurringTask {
  return {
    id: 'task-1',
    title: 'Deutsch lernen',
    description: null,
    status: RecurringTaskStatus.Todo,
    streakCount: 0,
    lastCompletedAt: null,
    lastResetAt: new Date('2026-11-07T00:00:00.000Z'),
    nextResetAt: new Date('2026-11-08T00:00:00.000Z'),
    notificationEnabled: true,
    notificationTime: '09:00',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

const t = (
  key: string,
  params?: Record<string, string>,
): string => {
  if (key === 'recurring.reminder.singleTitle') {
    return `Zeit für ${params?.title ?? ''}`;
  }
  if (key === 'recurring.reminder.singleBody') {
    return 'Ein guter Moment, um loszulegen.';
  }
  if (key === 'recurring.reminder.multiTitle') {
    return 'Zeit für deine Aufgaben';
  }
  if (key === 'recurring.reminder.multiBody') {
    return `${params?.titles ?? ''} — ein guter Moment, um loszulegen.`;
  }
  return key;
};

describe('recurringReminderPlan', () => {
  it('schedules the next Berlin wall-clock time later today', () => {
    const from = new Date('2026-11-08T07:30:00.000Z');
    const timestamp = nextDailyReminderTimestampMs(
      '09:00',
      'Europe/Berlin',
      from,
    );

    expect(timestamp).toBe(new Date('2026-11-08T08:00:00.000Z').getTime());
  });

  it('rolls to tomorrow when the Berlin time has already passed', () => {
    const from = new Date('2026-11-08T08:05:00.000Z');
    const timestamp = nextDailyReminderTimestampMs(
      '09:00',
      'Europe/Berlin',
      from,
    );

    expect(timestamp).toBe(new Date('2026-11-09T08:00:00.000Z').getTime());
  });

  it('ignores preview tasks, disabled reminders, and invalid times', () => {
    expect(
      selectRecurringReminderTasks([
        task({ id: 'preview-subscribe' }),
        task({ id: 'off', notificationEnabled: false }),
        task({ id: 'bad', notificationTime: '9am' }),
        task({ id: 'ok' }),
      ]).map(item => item.id),
    ).toEqual(['ok']);
  });

  it('writes a warm single-task reminder copy', () => {
    expect(reminderCopyForTask(task(), t)).toEqual({
      title: 'Zeit für Deutsch lernen',
      body: 'Ein guter Moment, um loszulegen.',
    });

    expect(
      reminderCopyForTasks(
        [
          task({ id: 'a', title: 'Deutsch' }),
          task({ id: 'b', title: 'Sport' }),
        ],
        t,
      ),
    ).toEqual({
      title: 'Zeit für deine Aufgaben',
      body: 'Deutsch · Sport — ein guter Moment, um loszulegen.',
    });
  });

  it('schedules one trigger per task (no grouping by clock time)', () => {
    const from = new Date('2026-11-08T07:30:00.000Z');
    const plan = buildRecurringReminderPlan(
      [
        task({ id: 'a', title: 'Deutsch', notificationTime: '09:00' }),
        task({ id: 'b', title: 'Sport', notificationTime: '09:00' }),
      ],
      'Europe/Berlin',
      t,
      from,
    );

    expect(plan).toHaveLength(2);
    expect(plan.map(item => item.id).sort()).toEqual([
      reminderNotificationIdForTask('a'),
      reminderNotificationIdForTask('b'),
    ]);
    expect(reminderNotificationIdForTask('a-b-c')).toBe(
      'recurring-reminder-task-abc',
    );
    expect(legacyHyphenatedReminderNotificationIdForTask('a-b-c')).toBe(
      'recurring-reminder-task-a-b-c',
    );
    expect(reminderNotificationIdsForTask('a-b-c')).toEqual([
      'recurring-reminder-task-abc',
      'recurring-reminder-task-a-b-c',
    ]);
    expect(plan.every(item => item.taskIds.length === 1)).toBe(true);
  });

  it('keeps tomorrow’s reminder when the task is already done', () => {
    const from = new Date('2026-11-08T07:30:00.000Z');
    const plan = buildRecurringReminderPlan(
      [
        task({
          id: 'done',
          status: RecurringTaskStatus.Done,
          notificationTime: '09:00',
        }),
      ],
      'Europe/Berlin',
      t,
      from,
    );

    expect(plan).toEqual([
      expect.objectContaining({
        id: reminderNotificationIdForTask('done'),
        timestamp: new Date('2026-11-09T08:00:00.000Z').getTime(),
      }),
    ]);
  });

  it('still reminds today when the task is open', () => {
    const from = new Date('2026-11-08T07:30:00.000Z');
    const plan = buildRecurringReminderPlan(
      [
        task({
          id: 'open',
          title: 'Deutsch',
          notificationTime: '09:00',
        }),
      ],
      'Europe/Berlin',
      t,
      from,
    );

    expect(plan).toEqual([
      expect.objectContaining({
        id: reminderNotificationIdForTask('open'),
        title: 'Zeit für Deutsch',
        timestamp: new Date('2026-11-08T08:00:00.000Z').getTime(),
        taskIds: ['open'],
      }),
    ]);
  });
});
