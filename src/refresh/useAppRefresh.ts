import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthContext';
import {
  refreshAppData,
  type AppRefreshScope,
} from '@/refresh/refreshAppData';

export function useAppRefresh(scope: AppRefreshScope = 'all') {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const refreshingRef = useRef(false);

  const onRefresh = useCallback(async () => {
    if (!accessToken || refreshingRef.current) {
      return;
    }

    refreshingRef.current = true;
    setRefreshing(true);

    try {
      await refreshAppData(queryClient, accessToken, scope);
    } catch {
      // refreshAppData uses allSettled — guard against unexpected failures.
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [accessToken, queryClient, scope]);

  return { refreshing, onRefresh };
}
