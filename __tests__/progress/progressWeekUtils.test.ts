import type { RecurringTaskProgress } from '@/api/generated/models/RecurringTaskProgress';
import { buildWeekDayStates } from '@/pages/progress/progressWeekUtils';

function progress(overrides: Partial<RecurringTaskProgress>): RecurringTaskProgress {
  return {
    id: 'p1',
    currentStreak: 0,
    highestStreakReached: 0,
    currentLevel: 1,
    highestLevelReached: 1,
    createdAt: new Date(0),
    updatedAt: new Date(0),
    ...overrides,
  };
}

/** Friday 2026-10-02 — matches a stable week Mon Sep 28 … Sun Oct 4. */
const friday = new Date(2026, 9, 2, 12, 0, 0);

describe('buildWeekDayStates', () => {
  it('marks today incomplete after undo while streak still reflects prior days', () => {
    const states = buildWeekDayStates(
      progress({
        currentStreak: 29,
        lastSuccessfulDay: null,
      }),
      1,
      3,
      friday,
    );

    expect(states[4]).toEqual({ kind: 'today', done: 1, total: 3 });
    expect(states[0]?.kind).toBe('complete');
    expect(states[3]?.kind).toBe('complete');
  });

  it('does not treat today as streak anchor when tasks are open again', () => {
    const states = buildWeekDayStates(
      progress({
        currentStreak: 30,
        lastSuccessfulDay: friday,
      }),
      2,
      3,
      friday,
    );

    expect(states[4]).toEqual({ kind: 'today', done: 2, total: 3 });
    expect(states[3]?.kind).toBe('complete');
  });

  it('shows check for today when all tasks are done and streak includes today', () => {
    const states = buildWeekDayStates(
      progress({
        currentStreak: 5,
        lastSuccessfulDay: friday,
      }),
      2,
      2,
      friday,
    );

    expect(states[4]).toEqual({ kind: 'today', done: 2, total: 2 });
  });
});
