import type { QueryClient } from '@tanstack/react-query';
import type { User } from '@/api/generated';
import { authApi } from '@/api/authClient';
import { getDeviceTimezone } from '@/user/deviceTimezone';
import { getMobileAppVersion } from '@/user/mobileAppVersion';
import { shouldSyncMobileAppVersion } from '@/user/shouldSyncMobileAppVersion';
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
  const installedVersion = getMobileAppVersion();
  const needsTimezoneSync = shouldUpdateDeviceTimezone(
    user.timezone,
    deviceTimezone,
  );
  const needsVersionSync = shouldSyncMobileAppVersion(
    user.mobileAppVersion,
    installedVersion,
  );

  if (!needsTimezoneSync && !needsVersionSync) {
    return user;
  }

  const preferences = await patchUserPreferences(
    queryClient,
    accessToken,
    needsTimezoneSync ? { timezone: deviceTimezone } : {},
  );

  if (needsTimezoneSync) {
    void queryClient.invalidateQueries({ queryKey: ['recurring-tasks'] });
    void queryClient.invalidateQueries({ queryKey: ['recurring-task-progress'] });
  }

  const updatedUser = applyPreferencesToCurrentUser(user, preferences);

  if (needsVersionSync) {
    return { ...updatedUser, mobileAppVersion: installedVersion };
  }

  return updatedUser;
}
