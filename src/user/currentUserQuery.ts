import type { QueryClient } from '@tanstack/react-query';
import type { User } from '@/api/generated';
import { authApi } from '@/api/authClient';
import { getDeviceTimezone } from '@/user/deviceTimezone';
import { shouldUpdateDeviceTimezone } from '@/user/shouldUpdateDeviceTimezone';

export function currentUserQueryKey(accessToken: string | null) {
  return ['current-user', accessToken] as const;
}

export const currentUserQueryOptions = {
  staleTime: Number.POSITIVE_INFINITY,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;

export async function loadCurrentUserWithTimezoneSync(
  queryClient: QueryClient,
): Promise<User> {
  const user = await authApi.getCurrentUser();
  const deviceTimezone = getDeviceTimezone();

  if (!shouldUpdateDeviceTimezone(user.timezone, deviceTimezone)) {
    return user;
  }

  const preferences = await authApi.updateUserPreferences({
    updateUserPreferencesRequest: {
      timezone: deviceTimezone,
    },
  });

  const syncedUser: User = {
    ...user,
    language: preferences.language,
    timezone: preferences.timezone,
  };

  void queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
  void queryClient.invalidateQueries({ queryKey: ['recurring-task-progress'] });

  return syncedUser;
}
