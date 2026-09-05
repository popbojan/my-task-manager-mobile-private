import type { QueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import {
  recurringTaskProgressQueryKey,
  recurringTasksQueryKey,
} from '@/recurring/recurringQueryKeys';
import { revenueCatOfferingsQueryKey } from '@/revenuecat/useRevenueCatOfferings';
import { refreshSubscriptionFromBackend } from '@/subscription/subscriptionQuery';
import {
  currentUserQueryKey,
  loadCurrentUserWithTimezoneSync,
} from '@/user/currentUserQuery';

function tasksQueryKey(accessToken: string) {
  return ['tasks', accessToken] as const;
}

/** Refetch all backend-backed session data (used by pull-to-refresh). */
export async function refreshAppData(
  queryClient: QueryClient,
  accessToken: string | null,
): Promise<void> {
  if (!accessToken) {
    return;
  }

  // Premium-gated endpoints may return 403 — refresh must never crash the app.
  await Promise.allSettled([
    queryClient.fetchQuery({
      queryKey: currentUserQueryKey(accessToken),
      queryFn: () => loadCurrentUserWithTimezoneSync(queryClient),
      staleTime: 0,
    }),
    refreshSubscriptionFromBackend(queryClient),
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
    queryClient.fetchQuery({
      queryKey: tasksQueryKey(accessToken),
      queryFn: () => authApi.getTasks(),
      staleTime: 0,
    }),
    queryClient.fetchQuery({
      queryKey: ['mastery-levels'],
      queryFn: () => authApi.getMasteryLevels(),
      staleTime: 0,
    }),
    queryClient.invalidateQueries({ queryKey: revenueCatOfferingsQueryKey }),
  ]);
}
