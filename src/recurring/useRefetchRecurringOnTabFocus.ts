import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { refetchRecurringBoardData } from '@/recurring/refetchRecurringBoardData';

/** Refetch Heute data when the user returns to the today tab (screen stays mounted). */
export function useRefetchRecurringOnTabFocus(
  isActive: boolean,
  accessToken: string | null,
): void {
  const queryClient = useQueryClient();
  const wasActiveRef = useRef(isActive);

  useEffect(() => {
    const becameActive = isActive && !wasActiveRef.current;
    wasActiveRef.current = isActive;

    if (!becameActive || !accessToken) {
      return;
    }

    void refetchRecurringBoardData(queryClient, accessToken);
  }, [accessToken, isActive, queryClient]);
}
