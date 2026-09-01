import type { QueryClient } from '@tanstack/react-query';
import { subscriptionQueryKey } from '@/subscription/subscriptionQueryOptions';

export function clearSubscriptionSessionQueries(queryClient: QueryClient): void {
  queryClient.removeQueries({ queryKey: subscriptionQueryKey });
}
