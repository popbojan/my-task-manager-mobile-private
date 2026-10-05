import type { QueryClient } from '@tanstack/react-query';
import { authApi, authRequestInit, getAccessToken } from '@/api/authClient';
import { ResponseError } from '@/api/generated/runtime';
import { refreshAppData } from '@/refresh/refreshAppData';
import { clearRecurringSessionQueries } from '@/recurring/recurringQueryKeys';
import { clearSubscriptionSessionQueries } from '@/subscription/clearSubscriptionSession';
import { invalidateAuthenticatedSessionQueries } from '@/session/invalidateAuthenticatedQueries';

export type RefreshAccessSessionOptions = {
  queryClient: QueryClient;
  setAccessToken: (token: string | null) => void;
  /** Reload tasks, subscription, etc. after a new access token is issued. */
  refetchAppData?: boolean;
};

function isUnauthorizedRefresh(error: unknown): boolean {
  return error instanceof ResponseError && error.response.status === 401;
}

function clearAuthenticatedSession(
  queryClient: QueryClient,
  setAccessToken: (token: string | null) => void,
): void {
  clearRecurringSessionQueries(queryClient);
  clearSubscriptionSessionQueries(queryClient);
  setAccessToken(null);
}

/**
 * Uses the HttpOnly refresh cookie to obtain a fresh access token.
 * Clears stale React Query caches when the session ends or the token rotates.
 */
export async function refreshAccessSession({
  queryClient,
  setAccessToken,
  refetchAppData = false,
}: RefreshAccessSessionOptions): Promise<string | null> {
  const previousToken = getAccessToken();

  try {
    const data = await authApi.refreshAccessToken(authRequestInit);
    setAccessToken(data.accessToken);
    invalidateAuthenticatedSessionQueries(queryClient);

    if (refetchAppData && data.accessToken) {
      void refreshAppData(queryClient, data.accessToken);
    }

    return data.accessToken;
  } catch (error) {
    if (!isUnauthorizedRefresh(error)) {
      if (previousToken) {
        return previousToken;
      }
      // Transient failure on cold start — keep caches; caller may still have a persisted token.
      return null;
    }

    clearAuthenticatedSession(queryClient, setAccessToken);
    return null;
  }
}
