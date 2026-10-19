import type { QueryClient } from '@tanstack/react-query';
import type { User } from '@/api/generated';
import { authApi } from '@/api/authClient';
import { getDeviceTimezone } from '@/user/deviceTimezone';
import { shouldUpdateDeviceTimezone } from '@/user/shouldUpdateDeviceTimezone';
import {
  applyPreferencesToCurrentUser,
  patchUserPreferences,
} from '@/user/userPreferences';

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
  accessToken: string | null,
): Promise<User> {
  const user = await authApi.getCurrentUser();
  const deviceTimezone = getDeviceTimezone();

  if (!shouldUpdateDeviceTimezone(user.timezone, deviceTimezone)) {
    return user;
  }

  const preferences = await patchUserPreferences(queryClient, accessToken, {
    timezone: deviceTimezone,
  });

  void queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
  void queryClient.invalidateQueries({ queryKey: ['recurring-task-progress'] });

  return applyPreferencesToCurrentUser(user, preferences);
}
