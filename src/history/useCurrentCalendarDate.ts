import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { calendarDateInTimeZone } from '@/utils/calendarDateInTimeZone';

const CALENDAR_DATE_POLL_MS = 30_000;

/**
 * Local calendar YYYY-MM-DD in the user timezone.
 * `syncWhen` forces an immediate sync (e.g. when a tab becomes active)
 * so midnight is not missed by the poll interval.
 */
export function useCurrentCalendarDate(
  timeZone: string,
  syncWhen: boolean = true,
): string {
  const [calendarDate, setCalendarDate] = useState(() =>
    calendarDateInTimeZone(new Date(), timeZone),
  );

  useEffect(() => {
    function sync() {
      const next = calendarDateInTimeZone(new Date(), timeZone);
      setCalendarDate(current => (current === next ? current : next));
    }

    sync();

    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        sync();
      }
    });
    const intervalId = setInterval(sync, CALENDAR_DATE_POLL_MS);

    return () => {
      subscription.remove();
      clearInterval(intervalId);
    };
  }, [timeZone]);

  useEffect(() => {
    if (!syncWhen) {
      return;
    }

    const next = calendarDateInTimeZone(new Date(), timeZone);
    setCalendarDate(current => (current === next ? current : next));
  }, [syncWhen, timeZone]);

  return calendarDate;
}
