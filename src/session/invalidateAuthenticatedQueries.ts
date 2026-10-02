import type { QueryClient } from '@tanstack/react-query';
import { subscriptionQueryKey } from '@/subscription/subscriptionQueryOptions';

/** Mark session queries stale and refetch (keeps last data while loading). */
export function invalidateAuthenticatedSessionQueries(
  queryClient: QueryClient,
): void {
  void queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
  void queryClient.invalidateQueries({ queryKey: ['recurring-task-progress'] });
  void queryClient.invalidateQueries({ queryKey: ['current-user'] });
  void queryClient.invalidateQueries({ queryKey: ['tasks'] });
  void queryClient.invalidateQueries({ queryKey: subscriptionQueryKey });
  void queryClient.invalidateQueries({ queryKey: ['mastery-levels'] });
}
