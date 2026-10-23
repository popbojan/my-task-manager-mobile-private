import type { HistoryDay } from '@/api/generated/models/HistoryDay';
import type { HistoryResponse } from '@/api/generated/models/HistoryResponse';
import { formatApiCalendarDate } from '@/utils/historyCalendar';

export function applyHistoryDayToCache(
  data: HistoryResponse | undefined,
  updatedDay: HistoryDay,
): HistoryResponse | undefined {
  if (!data) {
    return data;
  }

  const date = formatApiCalendarDate(updatedDay.date);
  const days = [...data.days];
  const index = days.findIndex(day => formatApiCalendarDate(day.date) === date);

  if (index >= 0) {
    days[index] = updatedDay;
  } else {
    days.push(updatedDay);
    days.sort((left, right) => left.date.getTime() - right.date.getTime());
  }

  return { ...data, days };
}
