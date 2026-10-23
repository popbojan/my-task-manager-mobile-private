import type { QueryClient } from '@tanstack/react-query';
import { historyMonthQueryKey } from '@/history/historyQueryKeys';

/** Refetch month caches so the calendar grid matches the backend (incl. streak snapshots). */
export async function refetchHistoryMonths(
  queryClient: QueryClient,
  accessToken: string,
  monthKeys: string[],
): Promise<void> {
  const unique = [...new Set(monthKeys)].filter(Boolean);

  await Promise.all(
    unique.map(month =>
      queryClient.refetchQueries({
        queryKey: historyMonthQueryKey(accessToken, month),
      }),
    ),
  );
}
