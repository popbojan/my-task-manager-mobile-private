import type { QueryClient } from '@tanstack/react-query';
import { authApi, authRequestInit } from '@/api/authClient';
import { logOutRevenueCat } from '@/revenuecat/revenueCatService';
import { clearSubscriptionSessionQueries } from '@/subscription/clearSubscriptionSession';
import { revenueCatOfferingsQueryKey } from '@/revenuecat/useRevenueCatOfferings';
import { clearRecurringSessionQueries } from '@/recurring/recurringQueryKeys';
import { currentUserQueryKey } from '@/user/currentUserQuery';

type ClearUserSessionOptions = {
  queryClient: QueryClient;
  setAccessToken: (token: string | null) => void;
  callBackendLogout?: boolean;
};

/**
 * Logout order (spec §8 Mobile):
 * 1. RevenueCat logOut()
 * 2. Backend logout (optional)
 * 3. Clear local auth + subscription + user caches
 */
export async function clearUserSession({
  queryClient,
  setAccessToken,
  callBackendLogout = true,
}: ClearUserSessionOptions): Promise<void> {
  await logOutRevenueCat();

  if (callBackendLogout) {
    try {
      await authApi.logout(authRequestInit);
    } catch {
      // Session may already be invalid.
    }
  }

  clearRecurringSessionQueries(queryClient);
  clearSubscriptionSessionQueries(queryClient);
  queryClient.removeQueries({ queryKey: revenueCatOfferingsQueryKey });
  queryClient.removeQueries({ queryKey: ['current-user'] });
  queryClient.removeQueries({
    predicate: query => query.queryKey[0] === currentUserQueryKey(null)[0],
  });
  setAccessToken(null);
}
