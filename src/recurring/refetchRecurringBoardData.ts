import type { QueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import {
  recurringTaskProgressQueryKey,
  recurringTasksQueryKey,
} from '@/recurring/recurringQueryKeys';
import { isApiPremiumRequiredError } from '@/utils/apiError';

/** Fresh recurring tasks (per-task streak) + global progress — e.g. after history repair. */
export async function refetchRecurringBoardData(
  queryClient: QueryClient,
  accessToken: string,
): Promise<void> {
  const results = await Promise.allSettled([
    queryClient.fetchQuery({
      queryKey: recurringTasksQueryKey(accessToken),
      queryFn: () => authApi.getRecurringTasks(),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: recurringTaskProgressQueryKey(accessToken),
      queryFn: () => authApi.getRecurringTaskProgress(),
      staleTime: 0,
    }),
  ]);

  const unexpected = results.find(
    (result): result is PromiseRejectedResult =>
      result.status === 'rejected' && !isApiPremiumRequiredError(result.reason),
  );

  if (unexpected) {
    throw unexpected.reason;
  }
}
