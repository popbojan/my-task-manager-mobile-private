import type { HistoryResponse } from '@/api/generated/models/HistoryResponse';
import { formatApiCalendarDate } from '@/utils/historyCalendar';

export function isHistoryResponseForCalendarDate(
  data: HistoryResponse | undefined,
  calendarDate: string,
): boolean {
  if (!data) {
    return false;
  }

  return formatApiCalendarDate(data.today) === calendarDate;
}
