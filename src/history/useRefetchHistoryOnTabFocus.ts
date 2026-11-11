import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import { historyMonthQueryKey } from '@/history/historyQueryKeys';
import { calendarDateInTimeZone } from '@/utils/calendarDateInTimeZone';

/**
 * Keep Mein Weg aligned with on-demand daily reset:
 * - Prefetch when the local calendar day rolls (even if the tab is hidden)
 * - On tab focus: force a fresh GET (same query key the screen observes)
 */
export function useRefetchHistoryOnTabFocus(
  isActive: boolean,
  accessToken: string | null,
  hasPremiumAccess: boolean,
  calendarDate: string,
  timeZone: string,
  onReturnedToTab: (freshCalendarDate: string) => void,
): void {
  const queryClient = useQueryClient();
  const wasActiveRef = useRef(isActive);
  const calendarDateRef = useRef(calendarDate);

  useEffect(() => {
    const becameActive = isActive && !wasActiveRef.current;
    const calendarDateChanged = calendarDate !== calendarDateRef.current;
    wasActiveRef.current = isActive;
    calendarDateRef.current = calendarDate;

    if (!accessToken || !hasPremiumAccess) {
      return;
    }

    if (!becameActive && !calendarDateChanged) {
      return;
    }

    const freshCalendarDate = becameActive
      ? calendarDateInTimeZone(new Date(), timeZone)
      : calendarDate;
    const month = freshCalendarDate.slice(0, 7);
    const queryKey = historyMonthQueryKey(
      accessToken,
      month,
      freshCalendarDate,
    );

    if (becameActive) {
      onReturnedToTab(freshCalendarDate);
    }

    void queryClient
      .fetchQuery({
        queryKey,
        queryFn: () => authApi.getHistory({ month }),
        staleTime: 0,
      })
      .catch(() => undefined);
  }, [
    accessToken,
    calendarDate,
    hasPremiumAccess,
    isActive,
    onReturnedToTab,
    queryClient,
    timeZone,
  ]);
}
