import type { QueryClient } from '@tanstack/react-query';
import type { User } from '@/api/generated';
import { authApi } from '@/api/authClient';
import {
  dailyOpenTasksReminderPrefsFromUser,
  saveDailyOpenTasksReminderPrefs,
} from '@/notifications/dailyOpenTasksReminderPrefs';
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
  // Keep local cache aligned with Railway so Android flush uses server prefs.
  await saveDailyOpenTasksReminderPrefs(
    dailyOpenTasksReminderPrefsFromUser(user),
  ).catch(() => undefined);

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
    void queryClient
      .invalidateQueries({ queryKey: ['recurring-tasks'] })
      .catch(() => undefined);
    void queryClient
      .invalidateQueries({ queryKey: ['recurring-task-progress'] })
      .catch(() => undefined);
    void queryClient
      .invalidateQueries({ queryKey: ['history'] })
      .catch(() => undefined);
  }

  const updatedUser = applyPreferencesToCurrentUser(user, preferences);
  await saveDailyOpenTasksReminderPrefs(
    dailyOpenTasksReminderPrefsFromUser(updatedUser),
  ).catch(() => undefined);

  if (needsVersionSync) {
    return { ...updatedUser, mobileAppVersion: installedVersion };
  }

  return updatedUser;
}
