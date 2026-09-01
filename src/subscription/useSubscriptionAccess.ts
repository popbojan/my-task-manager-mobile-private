import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthContext';
import { fetchAndCacheSubscription } from '@/subscription/subscriptionQuery';
import {
  subscriptionQueryKey,
  subscriptionQueryOptions,
} from '@/subscription/subscriptionQueryOptions';

/** Premium status comes from the backend — never blocked by RevenueCat. */
export function useSubscriptionAccess() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: subscriptionQueryKey,
    queryFn: () => fetchAndCacheSubscription(queryClient),
    enabled: !!accessToken,
    ...subscriptionQueryOptions,
  });
}
