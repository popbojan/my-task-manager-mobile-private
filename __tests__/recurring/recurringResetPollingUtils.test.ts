import type { RecurringTask } from '@/api/generated';
import { RecurringTaskStatus } from '@/api/generated';
import {
  buildResetPollSchedule,
  fullWindowPollDelaysMs,
  hasNextResetAdvanced,
  hasTodaysResetRecorded,
  minNextResetAtMs,
  msUntilLocalClock,
} from '@/recurring/recurringResetPollingUtils';

function task(nextResetAt: Date, lastResetAt: Date | null = null): RecurringTask {
  return {
    id: 'task-1',
    title: 'Test',
    description: null,
    status: RecurringTaskStatus.Done,
    streakCount: 1,
    lastCompletedAt: null,
    lastResetAt,
    nextResetAt,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };
}

describe('recurringResetPollingUtils', () => {
  it('schedules six minute offsets for a full reset window', () => {
    expect(fullWindowPollDelaysMs()).toEqual([0, 60_000, 120_000, 180_000, 240_000, 300_000]);
  });

  it('detects when nextResetAt moved forward after the backend reset', () => {
    const baseline = new Date('2026-06-07T22:05:00.000Z');
    const advanced = new Date('2026-06-08T22:05:00.000Z');

    expect(hasNextResetAdvanced(baseline.getTime(), [task(baseline)])).toBe(false);
    expect(hasNextResetAdvanced(baseline.getTime(), [task(advanced)])).toBe(true);
  });

  it('uses the earliest nextResetAt across tasks', () => {
    const earlier = new Date('2026-06-07T22:05:00.000Z');
    const later = new Date('2026-06-08T22:05:00.000Z');

    expect(minNextResetAtMs([task(later), task(earlier)])).toBe(earlier.getTime());
  });

  it('detects when todays reset is already recorded during the poll window', () => {
    const now = new Date('2026-10-22T22:06:00.000Z');
    const tasks = [
      task(
        new Date('2026-10-23T22:05:00.000Z'),
        new Date('2026-10-22T22:05:00.000Z'),
      ),
    ];

    expect(hasTodaysResetRecorded(tasks, 'Europe/Berlin', now)).toBe(true);
  });

  it('builds remaining poll delays when already inside the window', () => {
    const from = new Date('2026-06-08T22:07:10.000Z');
    const plan = buildResetPollSchedule('Europe/Berlin', from);

    expect(plan.mode).toBe('active');
    if (plan.mode !== 'active') {
      return;
    }

    expect(plan.delaysMs).toHaveLength(4);
    expect(plan.delaysMs[0]).toBe(
      msUntilLocalClock('Europe/Berlin', 0, 7, from),
    );
  });
});
