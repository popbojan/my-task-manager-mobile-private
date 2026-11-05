import { historyMonthsToRefreshAfterRepair } from '@/utils/historyCalendar';

describe('historyMonthsToRefreshAfterRepair', () => {
  it('includes repaired day, today, and visible calendar month', () => {
    const months = historyMonthsToRefreshAfterRepair({
      repairedCalendarDate: '2026-10-22',
      todayCalendarDate: '2026-10-23',
      visibleMonth: '2026-10',
    });

    expect(months.sort()).toEqual(['2026-10']);
  });

  it('refetches both months when repair and visible month differ', () => {
    const months = historyMonthsToRefreshAfterRepair({
      repairedCalendarDate: '2026-09-30',
      todayCalendarDate: '2026-10-01',
      visibleMonth: '2026-10',
    });

    expect(months.sort()).toEqual(['2026-09', '2026-10']);
  });
});
