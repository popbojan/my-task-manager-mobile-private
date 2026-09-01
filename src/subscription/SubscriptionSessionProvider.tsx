import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useApiEnvironment } from '@/config/ApiEnvironmentProvider';
import { ensureRevenueCatLinkedToUser } from '@/revenuecat/revenueCatService';
import { useCurrentUser } from '@/user/useCurrentUser';

type SubscriptionSessionContextValue = {
  userId: string | null;
  rcIdentityReady: boolean;
};

const SubscriptionSessionContext = createContext<SubscriptionSessionContextValue>({
  userId: null,
  rcIdentityReady: false,
});

export function SubscriptionSessionProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const { environment, apiBaseUrl } = useApiEnvironment();
  const currentUserQuery = useCurrentUser();
  const userId = currentUserQuery.data?.id ?? null;
  const [rcSessionReady, setRcSessionReady] = useState(false);

  useEffect(() => {
    if (!accessToken) {
      setRcSessionReady(false);
      return;
    }

    if (currentUserQuery.isLoading && !currentUserQuery.isFetched) {
      setRcSessionReady(false);
      return;
    }

    if (!userId) {
      setRcSessionReady(false);
      return;
    }

    if (__DEV__) {
      console.log('[Auth] user.id:', userId, 'environment:', environment, 'url:', apiBaseUrl);
    }

    let cancelled = false;
    setRcSessionReady(false);

    void (async () => {
      const linked = await ensureRevenueCatLinkedToUser(userId);

      if (!cancelled) {
        if (!linked && __DEV__) {
          console.warn(
            `[RevenueCat] Could not link app_user_id to backend user.id (${userId}). Purchases stay disabled.`,
          );
        }
        setRcSessionReady(linked);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    apiBaseUrl,
    currentUserQuery.isFetched,
    currentUserQuery.isLoading,
    environment,
    userId,
  ]);

  const value = useMemo(
    () => ({
      userId,
      rcIdentityReady: !!accessToken && rcSessionReady,
    }),
    [accessToken, rcSessionReady, userId],
  );

  return (
    <SubscriptionSessionContext.Provider value={value}>
      {children}
    </SubscriptionSessionContext.Provider>
  );
}

export function useSubscriptionSession(): SubscriptionSessionContextValue {
  return useContext(SubscriptionSessionContext);
}
