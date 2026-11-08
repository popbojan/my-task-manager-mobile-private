import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import { historyMonthQueryKey } from '@/history/historyQueryKeys';

/** Refetch Mein Weg when the user returns to the history tab (screen stays mounted). */
export function useRefetchHistoryOnTabFocus(
  isActive: boolean,
  accessToken: string | null,
  hasPremiumAccess: boolean,
  calendarDate: string,
  onReturnedToTab: () => void,
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

    if (!becameActive && !(isActive && calendarDateChanged)) {
      return;
    }

    if (becameActive) {
      onReturnedToTab();
    }

    const month = calendarDate.slice(0, 7);
    void queryClient
      .fetchQuery({
        queryKey: historyMonthQueryKey(accessToken, month, calendarDate),
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
  ]);
}
