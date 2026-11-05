import {
  calendarDateInTimeZone,
  rollingCalendarDatesEndingToday,
  weekCalendarDatesMondayStart,
} from '@/utils/calendarDateInTimeZone';

describe('calendarDateInTimeZone', () => {
  it('uses the IANA timezone for calendar-day boundaries', () => {
    expect(
      calendarDateInTimeZone(
        new Date('2026-10-01T22:05:00.000Z'),
        'Europe/Berlin',
      ),
    ).toBe('2026-10-02');
  });

  it('builds Monday-start weeks from a calendar date', () => {
    expect(weekCalendarDatesMondayStart('2026-10-02')).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
  });

  it('builds rolling seven-day windows ending today', () => {
    expect(rollingCalendarDatesEndingToday('2026-10-02', 7)).toEqual([
      '2026-09-26',
      '2026-09-27',
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
    ]);
  });
});
