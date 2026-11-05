import { HistoryDayStatus } from '@/api/generated/models/HistoryDayStatus';
import type { HistoryDay } from '@/api/generated/models/HistoryDay';
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

function historyDay(calendarDate: string): HistoryDay {
  return {
    date: new Date(`${calendarDate}T00:00:00.000Z`),
    status: HistoryDayStatus.Success,
    completedTasks: 3,
    totalTasks: 3,
    note: null,
    currentStreak: 1,
    currentLevel: 1,
    finalizedAt: new Date(`${calendarDate}T07:05:00.000Z`),
    repairedAt: null,
  };
}

const fridayUtc = new Date('2026-10-02T12:00:00.000Z');
const berlin = 'Europe/Berlin';
const todayIndex = 6;

describe('buildWeekDayStates', () => {
  it('marks today incomplete after undo while streak still reflects prior days', () => {
    const states = buildWeekDayStates(
      progress({
        currentStreak: 29,
        lastSuccessfulDay: null,
      }),
      1,
      3,
      { timeZone: berlin, now: fridayUtc },
    );

    expect(states[todayIndex]).toEqual({ kind: 'today', done: 1, total: 3 });
    expect(states[todayIndex - 1]?.kind).toBe('complete');
  });

  it('uses history success for repaired days even when streak math would miss them', () => {
    const historyDaysByDate = new Map<string, HistoryDay>([
      ['2026-09-26', historyDay('2026-09-26')],
      ['2026-09-29', historyDay('2026-09-29')],
    ]);

    const states = buildWeekDayStates(
      progress({ currentStreak: 1, lastSuccessfulDay: null }),
      0,
      2,
      { timeZone: berlin, now: fridayUtc, historyDaysByDate },
    );

    expect(states[0]?.kind).toBe('complete');
    expect(states[3]?.kind).toBe('complete');
    expect(states[todayIndex]).toEqual({ kind: 'today', done: 0, total: 2 });
  });

  it('does not treat today as streak anchor when tasks are open again', () => {
    const states = buildWeekDayStates(
      progress({
        currentStreak: 30,
        lastSuccessfulDay: fridayUtc,
      }),
      2,
      3,
      { timeZone: berlin, now: fridayUtc },
    );

    expect(states[todayIndex]).toEqual({ kind: 'today', done: 2, total: 3 });
    expect(states[todayIndex - 1]?.kind).toBe('complete');
  });
});
