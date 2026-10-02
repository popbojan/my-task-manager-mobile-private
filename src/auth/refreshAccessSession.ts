import type { QueryClient } from '@tanstack/react-query';
import { authApi, authRequestInit } from '@/api/authClient';
import { refreshAppData } from '@/refresh/refreshAppData';
import { clearRecurringSessionQueries } from '@/recurring/recurringQueryKeys';
import { clearSubscriptionSessionQueries } from '@/subscription/clearSubscriptionSession';

export type RefreshAccessSessionOptions = {
  queryClient: QueryClient;
  setAccessToken: (token: string | null) => void;
  /** Reload tasks, subscription, etc. after a new access token is issued. */
  refetchAppData?: boolean;
};

/**
 * Uses the HttpOnly refresh cookie to obtain a fresh access token.
 * Clears stale React Query caches when the session ends or the token rotates.
 */
export async function refreshAccessSession({
  queryClient,
  setAccessToken,
  refetchAppData = false,
}: RefreshAccessSessionOptions): Promise<string | null> {
  try {
    const data = await authApi.refreshAccessToken(authRequestInit);
    clearRecurringSessionQueries(queryClient);
    clearSubscriptionSessionQueries(queryClient);
    setAccessToken(data.accessToken);

    if (refetchAppData && data.accessToken) {
      await refreshAppData(queryClient, data.accessToken);
    }

    return data.accessToken;
  } catch {
    clearRecurringSessionQueries(queryClient);
    clearSubscriptionSessionQueries(queryClient);
    setAccessToken(null);
    return null;
  }
}
