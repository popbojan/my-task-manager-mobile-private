import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthContext';
import { refreshAccessSession } from '@/auth/refreshAccessSession';

const MIN_FOREGROUND_REFRESH_MS = 15_000;

function readInitialAppState(): AppStateStatus {
  const current = AppState.currentState;
  if (current === 'active' || current === 'background' || current === 'inactive') {
    return current;
  }

  return 'active';
}

/**
 * Re-issues the access token when the app returns to the foreground so expired
 * JWTs do not leave tasks/subscription queries in a failed state.
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

      refreshAccessSession({
        queryClient,
        setAccessToken,
        refetchAppData: true,
      })
        .finally(() => {
          refreshInFlightRef.current = false;
        })
        .catch(() => {});
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, queryClient, setAccessToken]);
}
