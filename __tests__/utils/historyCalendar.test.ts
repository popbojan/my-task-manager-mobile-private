import {
  addMonths,
  buildMonthCalendarGrid,
  formatHistoryLevelDisplay,
  formatHistoryStreakDisplay,
  formatHistoryTaskRatio,
  formatHistoryTaskRatioDisplay,
  indexHistoryDaysByDate,
  resolveHistoryDayCellTone,
  shouldShowHistorySuccessCrown,
} from '@/utils/historyCalendar';
import { HistoryDayStatus } from '@/api/generated/models/HistoryDayStatus';
import type { HistoryDay } from '@/api/generated/models/HistoryDay';

describe('historyCalendar', () => {
  it('builds a Monday-start grid for October 2026 with adjacent month days', () => {
    const cells = buildMonthCalendarGrid('2026-10');
    const currentMonthCells = cells.filter(cell => !cell.isAdjacentMonth);
    const adjacentCells = cells.filter(cell => cell.isAdjacentMonth);

    expect(currentMonthCells).toHaveLength(31);
    expect(adjacentCells.length).toBeGreaterThan(0);
    expect(cells[0]).toEqual({
      kind: 'day',
      date: '2026-09-28',
      dayOfMonth: 28,
      isAdjacentMonth: true,
    });
    expect(currentMonthCells[0]).toEqual({
      kind: 'day',
      date: '2026-10-01',
      dayOfMonth: 1,
      isAdjacentMonth: false,
    });
    expect(cells.length % 7).toBe(0);
    expect(cells.at(-1)?.isAdjacentMonth).toBe(true);
  });

  it('shifts months with addMonths', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
  });

  it('indexes history days by date', () => {
    const day: HistoryDay = {
      date: new Date('2026-10-10T00:00:00.000Z'),
      status: HistoryDayStatus.Success,
      completedTasks: 7,
      totalTasks: 7,
      note: null,
      finalizedAt: new Date('2026-10-10T22:05:00Z'),
      currentStreak: 12,
      currentLevel: 2,
    };
    const map = indexHistoryDaysByDate([day]);
    expect(map.get('2026-10-10')).toEqual(day);
  });

  it('maps status to cell tone and ratio text', () => {
    const inProgress: HistoryDay = {
      date: new Date('2026-10-11T00:00:00.000Z'),
      status: HistoryDayStatus.InProgress,
      completedTasks: 4,
      totalTasks: 7,
      note: null,
      finalizedAt: null,
      currentStreak: 12,
      currentLevel: 2,
    };

    expect(resolveHistoryDayCellTone(inProgress)).toBe('in_progress');
    expect(formatHistoryTaskRatio(inProgress)).toBe('4/7');
    expect(formatHistoryTaskRatioDisplay(inProgress)).toBe('4/7');
    expect(formatHistoryStreakDisplay(inProgress)).toBe('12');
    expect(formatHistoryLevelDisplay(inProgress)).toBe('2');
    expect(shouldShowHistorySuccessCrown(inProgress)).toBe(false);
  });

  it('shows success crown only for completed success days', () => {
    const success: HistoryDay = {
      date: new Date('2026-10-10T00:00:00.000Z'),
      status: HistoryDayStatus.Success,
      completedTasks: 7,
      totalTasks: 7,
      note: null,
      finalizedAt: new Date('2026-10-10T22:05:00Z'),
      currentStreak: 12,
      currentLevel: 2,
    };

    expect(shouldShowHistorySuccessCrown(success)).toBe(true);
  });

  it('uses placeholders when history metrics are null', () => {
    const unknown: HistoryDay = {
      date: new Date('2026-10-12T00:00:00.000Z'),
      status: HistoryDayStatus.Unknown,
      completedTasks: null,
      totalTasks: null,
      note: null,
      finalizedAt: null,
      currentStreak: null,
      currentLevel: null,
    };

    expect(formatHistoryTaskRatioDisplay(unknown)).toBe('—');
    expect(formatHistoryStreakDisplay(unknown)).toBe('—');
    expect(formatHistoryLevelDisplay(unknown)).toBe('—');
  });
});
