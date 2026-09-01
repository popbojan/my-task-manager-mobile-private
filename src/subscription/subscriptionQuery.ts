import type { QueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import { SubscriptionAccessFromJSON } from '@/api/generated/models/SubscriptionAccess';
import {
  parseSubscriptionAccessResponse,
  type SubscriptionAccessResponse,
} from '@/subscription/subscriptionAccessResponse';
import { subscriptionQueryKey } from '@/subscription/subscriptionQueryOptions';
import { invalidateRecurringQueries } from '@/recurring/recurringQueryKeys';

export async function refreshSubscriptionFromBackend(
  queryClient: QueryClient,
): Promise<SubscriptionAccessResponse> {
  return queryClient.fetchQuery({
    queryKey: subscriptionQueryKey,
    queryFn: () => fetchAndCacheSubscription(queryClient),
    staleTime: 0,
  });
}

export async function fetchAndCacheSubscription(
  queryClient: QueryClient,
): Promise<SubscriptionAccessResponse> {
  const previous = readCachedSubscription(queryClient);
  const response = await authApi.getCurrentUserSubscriptionRaw();
  const json = (await response.raw.json()) as Record<string, unknown>;
  const access = parseSubscriptionAccessResponse(
    json,
    SubscriptionAccessFromJSON(json),
  );
  queryClient.setQueryData(subscriptionQueryKey, access);

  if (access.hasPremiumAccess && !previous?.hasPremiumAccess) {
    invalidateRecurringQueries(queryClient);
  }

  return access;
}

export function readCachedSubscription(
  queryClient: QueryClient,
): SubscriptionAccessResponse | undefined {
  return queryClient.getQueryData<SubscriptionAccessResponse>(subscriptionQueryKey);
}
