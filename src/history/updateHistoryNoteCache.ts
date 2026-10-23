import type { HistoryDay } from '@/api/generated/models/HistoryDay';
import { HistoryDayStatus } from '@/api/generated/models/HistoryDayStatus';
import type { HistoryResponse } from '@/api/generated/models/HistoryResponse';
import {
  formatApiCalendarDate,
  parseCalendarDate,
} from '@/utils/historyCalendar';

function isNoteOnlyHistoryDay(day: HistoryDay): boolean {
  return (
    day.status === HistoryDayStatus.Unknown &&
    day.completedTasks === null &&
    day.totalTasks === null
  );
}

export function applyHistoryNoteToCache(
  data: HistoryResponse | undefined,
  date: string,
  note: string | null,
): HistoryResponse | undefined {
  if (!data) {
    if (note === null) {
      return data;
    }

    data = {
      month: date.slice(0, 7),
      today: parseCalendarDate(date),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      days: [],
    };
  }

  const days = [...data.days];
  const index = days.findIndex(day => formatApiCalendarDate(day.date) === date);

  if (index >= 0) {
    const existing = days[index];

    if (note === null && isNoteOnlyHistoryDay(existing)) {
      days.splice(index, 1);
    } else {
      days[index] = { ...existing, note };
    }
  } else if (note !== null) {
    days.push({
      date: parseCalendarDate(date),
      status: HistoryDayStatus.Unknown,
      completedTasks: null,
      totalTasks: null,
      note,
      finalizedAt: null,
      currentStreak: null,
      currentLevel: null,
      repairedAt: null,
    });
    days.sort((left, right) => left.date.getTime() - right.date.getTime());
  }

  return { ...data, days };
}
