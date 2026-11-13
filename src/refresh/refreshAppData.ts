import type { QueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import { refetchRecurringBoardData } from '@/recurring/refetchRecurringBoardData';
import { revenueCatOfferingsQueryKey } from '@/revenuecat/useRevenueCatOfferings';
import {
  readCachedSubscription,
  refreshSubscriptionFromBackend,
} from '@/subscription/subscriptionQuery';
import {
  currentUserQueryKey,
  loadCurrentUserWithTimezoneSync,
} from '@/user/currentUserQuery';

function tasksQueryKey(accessToken: string) {
  return ['tasks', accessToken] as const;
}

export type AppRefreshScope =
  | 'today'
  | 'history'
  | 'progress'
  | 'tasks'
  | 'profile'
  | 'all';

async function refreshCurrentUser(
  queryClient: QueryClient,
  accessToken: string,
): Promise<void> {
  await queryClient.fetchQuery({
    queryKey: currentUserQueryKey(accessToken),
    queryFn: () => loadCurrentUserWithTimezoneSync(queryClient, accessToken),
    staleTime: 0,
  });
}

/** Refetch only what the active screen needs (pull-to-refresh). */
export async function refreshAppData(
  queryClient: QueryClient,
  accessToken: string | null,
  scope: AppRefreshScope = 'all',
): Promise<void> {
  if (!accessToken) {
    return;
  }

  if (scope === 'today') {
    const hasPremiumAccess =
      readCachedSubscription(queryClient)?.hasPremiumAccess === true;
    if (!hasPremiumAccess) {
      return;
    }
    await Promise.allSettled([
      refetchRecurringBoardData(queryClient, accessToken),
    ]);
    return;
  }

  if (scope === 'history') {
    await Promise.allSettled([
      queryClient.invalidateQueries({
        queryKey: ['history'],
        refetchType: 'active',
      }),
    ]);
    return;
  }

  if (scope === 'progress') {
    const hasPremiumAccess =
      readCachedSubscription(queryClient)?.hasPremiumAccess === true;
    await Promise.allSettled([
      hasPremiumAccess
        ? refetchRecurringBoardData(queryClient, accessToken)
        : Promise.resolve(),
      queryClient.invalidateQueries({
        queryKey: ['history'],
        refetchType: 'active',
      }),
      queryClient.invalidateQueries({
        queryKey: ['mastery-levels'],
        refetchType: 'active',
      }),
    ]);
    return;
  }

  if (scope === 'tasks') {
    await Promise.allSettled([
      queryClient.fetchQuery({
        queryKey: tasksQueryKey(accessToken),
        queryFn: () => authApi.getTasks(),
        staleTime: 0,
      }),
    ]);
    return;
  }

  if (scope === 'profile') {
    await Promise.allSettled([
      refreshCurrentUser(queryClient, accessToken),
      refreshSubscriptionFromBackend(queryClient),
    ]);
    return;
  }

  // Full refresh (rare: onboarding / explicit all).
  await Promise.allSettled([
    refreshCurrentUser(queryClient, accessToken),
  ]);

  await Promise.allSettled([
    refreshSubscriptionFromBackend(queryClient),
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

  const hasPremiumAccess =
    readCachedSubscription(queryClient)?.hasPremiumAccess === true;

  if (!hasPremiumAccess) {
    return;
  }

  await Promise.allSettled([
    refetchRecurringBoardData(queryClient, accessToken),
    queryClient.invalidateQueries({ queryKey: ['history'] }),
  ]);
}
