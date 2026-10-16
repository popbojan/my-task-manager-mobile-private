import {
  addMonths,
  buildMonthCalendarGrid,
  formatHistoryTaskRatio,
  indexHistoryDaysByDate,
  resolveHistoryDayCellTone,
} from '@/utils/historyCalendar';
import { HistoryDayStatus } from '@/api/generated/models/HistoryDayStatus';
import type { HistoryDay } from '@/api/generated/models/HistoryDay';

describe('historyCalendar', () => {
  it('builds a Monday-start grid for October 2026', () => {
    const cells = buildMonthCalendarGrid('2026-10');
    const dayCells = cells.filter(cell => cell.kind === 'day');
    const blankCells = cells.filter(cell => cell.kind === 'blank');
    expect(dayCells).toHaveLength(31);
    expect(blankCells.length).toBeGreaterThanOrEqual(3);
    expect(dayCells[0]).toEqual({
      kind: 'day',
      date: '2026-10-01',
      dayOfMonth: 1,
    });
    expect(cells.length % 7).toBe(0);
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
  });
});
