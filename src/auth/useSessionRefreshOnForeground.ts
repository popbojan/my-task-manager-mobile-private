import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthContext';
import { refreshAccessSession } from '@/auth/refreshAccessSession';
import { withTimeout } from '@/utils/withTimeout';

/** Avoid hammering refresh on quick app switches. */
const MIN_FOREGROUND_REFRESH_MS = 30_000;
/** Token refresh only — keep short so resume stays interactive. */
const FOREGROUND_REFRESH_TIMEOUT_MS = 8_000;

function readInitialAppState(): AppStateStatus {
  const current = AppState.currentState;
  if (current === 'active' || current === 'background' || current === 'inactive') {
    return current;
  }

  return 'active';
}

/**
 * Re-issues the access token when the app returns to the foreground.
 * Does not reload the whole app — active screens keep cached data and refresh
 * via pull-to-refresh / tab focus.
 */
export function useSessionRefreshOnForeground(enabled: boolean): void {
  const queryClient = useQueryClient();
  const { accessToken, setAccessToken } = useAuth();
  const accessTokenRef = useRef(accessToken);
  const refreshInFlightRef = useRef(false);
  const lastRefreshAtRef = useRef(0);
  const appStateRef = useRef<AppStateStatus>(readInitialAppState());

  accessTokenRef.current = accessToken;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const subscription = AppState.addEventListener('change', nextState => {
      const wasBackground =
        appStateRef.current === 'background' || appStateRef.current === 'inactive';
      appStateRef.current = nextState;

      if (nextState !== 'active' || !wasBackground) {
        return;
      }

      if (!accessTokenRef.current || refreshInFlightRef.current) {
        return;
      }

      const now = Date.now();
      if (now - lastRefreshAtRef.current < MIN_FOREGROUND_REFRESH_MS) {
        return;
      }

      refreshInFlightRef.current = true;
      lastRefreshAtRef.current = now;

      // Token only — never invalidate/refetch here. A new JWT used to remount
      // empty query keys and flash AppLaunchView for 10–20s; cache is migrated
      // in refreshAccessSession. Screens stay interactive; pull-to-refresh for data.
      void withTimeout(
        refreshAccessSession({
          queryClient,
          setAccessToken,
          refetchAppData: false,
        }),
        FOREGROUND_REFRESH_TIMEOUT_MS,
      )
        .catch(() => {
          // Don't cancel in-flight UI queries — resume must stay responsive.
        })
        .finally(() => {
          refreshInFlightRef.current = false;
        });
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, queryClient, setAccessToken]);
}
