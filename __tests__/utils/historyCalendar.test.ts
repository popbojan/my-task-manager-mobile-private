import {
  addMonths,
  buildMonthCalendarGrid,
  computeHistoryCalendarCellWidth,
  formatHistoryLevelDisplay,
  formatHistoryStreakDisplay,
  formatApiCalendarDate,
  formatHistoryTaskRatio,
  formatHistoryTaskRatioDisplay,
  indexHistoryDaysByDate,
  parseCalendarDate,
  resolveHistoryDayCellTone,
  shouldShowHistoryInProgressMark,
  shouldShowHistoryMissedMark,
  shouldShowHistoryNoteMark,
  shouldShowHistorySuccessCrown,
  resolveHistoryDayProgressPercent,
  isRepairableMissedHistoryDay,
} from '@/utils/historyCalendar';
import { HistoryDayStatus } from '@/api/generated/models/HistoryDayStatus';
import type { HistoryDay } from '@/api/generated/models/HistoryDay';

describe('historyCalendar', () => {
  it('builds a Monday-start grid for October 2026 with blank padding cells', () => {
    const cells = buildMonthCalendarGrid('2026-10');
    const dayCells = cells.filter(cell => cell.kind === 'day');
    const blankCells = cells.filter(cell => cell.kind === 'blank');

    expect(dayCells).toHaveLength(31);
    expect(blankCells.length).toBeGreaterThan(0);
    expect(cells[0]).toEqual({ kind: 'blank' });
    expect(dayCells[0]).toEqual({
      kind: 'day',
      date: '2026-10-01',
      dayOfMonth: 1,
    });
    expect(cells.length % 7).toBe(0);
    expect(cells.at(-1)).toEqual({ kind: 'blank' });
  });

  it('computes a fixed cell width for seven weekday columns', () => {
    const cellWidth = computeHistoryCalendarCellWidth(390);

    expect(cellWidth).toBeGreaterThan(0);
    expect(cellWidth * 7 + 4 * 6).toBeLessThanOrEqual(390);
  });

  it('shifts months with addMonths', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
  });

  it('formats API calendar dates with UTC date parts', () => {
    expect(formatApiCalendarDate(parseCalendarDate('2026-10-15'))).toBe('2026-10-15');
    expect(formatApiCalendarDate(new Date('2026-10-23T00:00:00.000Z'))).toBe('2026-10-23');
  });

  it('indexes note-only days by the same calendar date key', () => {
    const day: HistoryDay = {
      date: parseCalendarDate('2026-10-18'),
      status: HistoryDayStatus.Unknown,
      completedTasks: null,
      totalTasks: null,
      note: 'Test',
      finalizedAt: null,
      currentStreak: null,
      currentLevel: null,
    };

    expect(indexHistoryDaysByDate([day]).get('2026-10-18')).toEqual(day);
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

  it('allows repair only for finalized missed yesterday', () => {
    const missedYesterday: HistoryDay = {
      date: new Date('2026-10-22T00:00:00.000Z'),
      status: HistoryDayStatus.Missed,
      completedTasks: 0,
      totalTasks: 7,
      note: null,
      finalizedAt: new Date('2026-10-22T22:05:00Z'),
      currentStreak: 0,
      currentLevel: 1,
      repairedAt: null,
    };

    expect(
      isRepairableMissedHistoryDay(missedYesterday, '2026-10-22', '2026-10-23'),
    ).toBe(true);
    expect(
      isRepairableMissedHistoryDay(missedYesterday, '2026-10-21', '2026-10-23'),
    ).toBe(false);
  });

  it('derives status badge helpers for missed and in-progress days', () => {
    const missed: HistoryDay = {
      date: new Date('2026-10-09T00:00:00.000Z'),
      status: HistoryDayStatus.Missed,
      completedTasks: 0,
      totalTasks: 7,
      note: null,
      finalizedAt: new Date('2026-10-09T22:05:00Z'),
      currentStreak: 0,
      currentLevel: 1,
      repairedAt: null,
    };
    const inProgress: HistoryDay = {
      date: new Date('2026-10-11T00:00:00.000Z'),
      status: HistoryDayStatus.InProgress,
      completedTasks: 3,
      totalTasks: 7,
      note: null,
      finalizedAt: null,
      currentStreak: 5,
      currentLevel: 1,
    };

    expect(shouldShowHistoryMissedMark(missed)).toBe(true);
    expect(shouldShowHistoryInProgressMark(inProgress)).toBe(true);
    expect(resolveHistoryDayProgressPercent(inProgress)).toBe(43);
    expect(shouldShowHistoryMissedMark(inProgress)).toBe(false);
  });

  it('shows note mark only when trimmed note text exists', () => {
    const withNote: HistoryDay = {
      date: new Date('2026-10-12T00:00:00.000Z'),
      status: HistoryDayStatus.Unknown,
      completedTasks: null,
      totalTasks: null,
      note: '  Gedachte  ',
      finalizedAt: null,
      currentStreak: null,
      currentLevel: null,
    };
    const blankNote: HistoryDay = {
      ...withNote,
      note: '   ',
    };

    expect(shouldShowHistoryNoteMark(withNote)).toBe(true);
    expect(shouldShowHistoryNoteMark(blankNote)).toBe(false);
    expect(shouldShowHistoryNoteMark(undefined)).toBe(false);
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
