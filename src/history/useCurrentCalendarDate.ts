import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { calendarDateInTimeZone } from '@/utils/calendarDateInTimeZone';

const CALENDAR_DATE_POLL_MS = 60_000;

export function useCurrentCalendarDate(timeZone: string): string {
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

  return calendarDate;
}
