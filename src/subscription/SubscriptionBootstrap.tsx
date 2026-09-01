import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthContext';
import { fetchAndCacheSubscription } from '@/subscription/subscriptionQuery';
import {
  subscriptionQueryKey,
  subscriptionQueryOptions,
} from '@/subscription/subscriptionQueryOptions';

/**
 * Prefetches GET /subscriptions/me after login.
 * Independent from RevenueCat so premium status stays available if RC fails.
 */
export default function SubscriptionBootstrap() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  useQuery({
    queryKey: subscriptionQueryKey,
    queryFn: () => fetchAndCacheSubscription(queryClient),
    enabled: !!accessToken,
    ...subscriptionQueryOptions,
  });

  return null;
}
