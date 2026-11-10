jest.mock('@/config/api', () => ({
  getApiBaseUrl: () => 'https://example.test',
}));

import { HistoryDayStatus } from '@/api/generated/models/HistoryDayStatus';
import type { HistoryResponse } from '@/api/generated/models/HistoryResponse';
import { isHistoryResponseForCalendarDate } from '@/history/historyResponseCalendarDate';
import { historyMonthQueryKey } from '@/history/historyQueryKeys';

function historyResponse(today: Date): HistoryResponse {
  return {
    month: '2026-11',
    today,
    timezone: 'Europe/Berlin',
    days: [
      {
        date: new Date('2026-11-07'),
        status: HistoryDayStatus.InProgress,
        completedTasks: 2,
        totalTasks: 6,
        note: null,
        finalizedAt: null,
        currentStreak: 1,
        currentLevel: 1,
        repairedAt: null,
      },
    ],
  };
}

describe('isHistoryResponseForCalendarDate', () => {
  it('accepts a payload whose today matches the current calendar date', () => {
    expect(
      isHistoryResponseForCalendarDate(
        historyResponse(new Date('2026-11-08')),
        '2026-11-08',
      ),
    ).toBe(true);
  });

  it('rejects yesterday’s live-today payload after the calendar date rolls over', () => {
    expect(
      isHistoryResponseForCalendarDate(
        historyResponse(new Date('2026-11-07')),
        '2026-11-08',
      ),
    ).toBe(false);
  });

  it('rejects missing data', () => {
    expect(isHistoryResponseForCalendarDate(undefined, '2026-11-08')).toBe(false);
  });

  it('treats ISO date-only today as the UTC calendar day', () => {
    expect(
      isHistoryResponseForCalendarDate(
        historyResponse(new Date('2026-11-10T00:00:00.000Z')),
        '2026-11-10',
      ),
    ).toBe(true);
  });
});

describe('historyMonthQueryKey', () => {
  it('keeps month caches distinct per calendar date', () => {
    const month = '2026-11';
    const token = 'token';

    expect(historyMonthQueryKey(token, month, '2026-11-07')).not.toEqual(
      historyMonthQueryKey(token, month, '2026-11-08'),
    );
    expect(historyMonthQueryKey(token, month, '2026-11-08')).toEqual([
      'history',
      'https://example.test',
      token,
      month,
      '2026-11-08',
    ]);
  });
});
