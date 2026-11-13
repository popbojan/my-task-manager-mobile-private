import type { QueryClient } from '@tanstack/react-query';
import { authApi, authRequestInit, getAccessToken } from '@/api/authClient';
import { ResponseError } from '@/api/generated/runtime';
import { refreshAppData } from '@/refresh/refreshAppData';
import { clearRecurringSessionQueries } from '@/recurring/recurringQueryKeys';
import { clearSubscriptionSessionQueries } from '@/subscription/clearSubscriptionSession';
import { invalidateAuthenticatedSessionQueries } from '@/session/invalidateAuthenticatedQueries';
import { migrateSessionQueriesForAccessToken } from '@/session/migrateSessionQueriesForAccessToken';

export type RefreshAccessSessionOptions = {
  queryClient: QueryClient;
  setAccessToken: (token: string | null) => void;
  /**
   * Full session data reload after token refresh. Off by default — foreground
   * resume should stay snappy; screens refresh themselves (pull / tab focus).
   */
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
 * Clears caches only when the session ends (401).
 */
export async function refreshAccessSession({
  queryClient,
  setAccessToken,
  refetchAppData = false,
}: RefreshAccessSessionOptions): Promise<string | null> {
  const previousToken = getAccessToken();

  try {
    const data = await authApi.refreshAccessToken(authRequestInit);
    if (
      previousToken &&
      data.accessToken &&
      previousToken !== data.accessToken
    ) {
      migrateSessionQueriesForAccessToken(
        queryClient,
        previousToken,
        data.accessToken,
      );
    }
    setAccessToken(data.accessToken);

    if (refetchAppData && data.accessToken) {
      invalidateAuthenticatedSessionQueries(queryClient);
      void refreshAppData(queryClient, data.accessToken, 'all');
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
