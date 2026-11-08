import type { QueryClient } from '@tanstack/react-query';
import { subscriptionQueryKey } from '@/subscription/subscriptionQueryOptions';

function invalidateQueriesQuietly(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
): void {
  void queryClient.invalidateQueries({ queryKey }).catch(() => undefined);
}

/** Mark session queries stale and refetch (keeps last data while loading). */
export function invalidateAuthenticatedSessionQueries(
  queryClient: QueryClient,
): void {
  invalidateQueriesQuietly(queryClient, ['recurring-tasks']);
  invalidateQueriesQuietly(queryClient, ['recurring-task']);
  invalidateQueriesQuietly(queryClient, ['recurring-task-progress']);
  invalidateQueriesQuietly(queryClient, ['history']);
  invalidateQueriesQuietly(queryClient, ['current-user']);
  invalidateQueriesQuietly(queryClient, ['tasks']);
  invalidateQueriesQuietly(queryClient, subscriptionQueryKey);
  invalidateQueriesQuietly(queryClient, ['mastery-levels']);
}
