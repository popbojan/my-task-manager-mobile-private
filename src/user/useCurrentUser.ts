import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthContext';
import {
  currentUserQueryKey,
  currentUserQueryOptions,
  loadCurrentUserWithTimezoneSync,
} from '@/user/currentUserQuery';

export function useCurrentUser() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: currentUserQueryKey(accessToken),
    queryFn: () => loadCurrentUserWithTimezoneSync(queryClient),
    enabled: !!accessToken,
    ...currentUserQueryOptions,
  });
}
