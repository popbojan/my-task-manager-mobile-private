import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import { historyMonthQueryKey } from '@/history/historyQueryKeys';
import { defaultVisibleMonthKey } from '@/utils/historyCalendar';

/** Refetch Mein Weg when the user returns to the history tab (screen stays mounted). */
export function useRefetchHistoryOnTabFocus(
  isActive: boolean,
  accessToken: string | null,
  hasPremiumAccess: boolean,
  onReturnedToTab: () => void,
): void {
  const queryClient = useQueryClient();
  const wasActiveRef = useRef(isActive);

  useEffect(() => {
    const becameActive = isActive && !wasActiveRef.current;
    wasActiveRef.current = isActive;

    if (!becameActive || !accessToken || !hasPremiumAccess) {
      return;
    }

    onReturnedToTab();

    const month = defaultVisibleMonthKey();
    void queryClient.fetchQuery({
      queryKey: historyMonthQueryKey(accessToken, month),
      queryFn: () => authApi.getHistory({ month }),
      staleTime: 0,
    });
  }, [accessToken, hasPremiumAccess, isActive, onReturnedToTab, queryClient]);
}
