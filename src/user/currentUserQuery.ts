import type { QueryClient } from '@tanstack/react-query';
import type { User } from '@/api/generated';
import { authApi } from '@/api/authClient';
import { getCurrentUserDeviceHeaders } from '@/device/deviceRequestHeaders';
import { shouldSyncDeviceField } from '@/device/shouldSyncDeviceField';
import { getDeviceOsVersion } from '@/device/deviceSystemInfo';
import {
  dailyOpenTasksReminderPrefsFromUser,
  saveDailyOpenTasksReminderPrefs,
} from '@/notifications/dailyOpenTasksReminderPrefs';
import { getDeviceTimezone } from '@/user/deviceTimezone';
import { getMobileAppVersion } from '@/user/mobileAppVersion';
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

let deviceSyncInFlight: Promise<User> | null = null;

function resolveDeviceSyncNeeds(user: User): {
  needsTimezoneSync: boolean;
  needsAppVersionSync: boolean;
  needsOsVersionSync: boolean;
} {
  const deviceTimezone = getDeviceTimezone();
  const installedAppVersion = getMobileAppVersion();
  const localOsVersion = getDeviceOsVersion();
  const needsTimezoneSync = shouldUpdateDeviceTimezone(
    user.timezone,
    deviceTimezone,
  );

  // Without a registered device, never PATCH for device versions (no create on
  // preferences → would loop forever when device stays null).
  if (user.device == null) {
    return {
      needsTimezoneSync,
      needsAppVersionSync: false,
      needsOsVersionSync: false,
    };
  }

  return {
    needsTimezoneSync,
    needsAppVersionSync: shouldSyncDeviceField(
      user.device.appVersion,
      installedAppVersion,
    ),
    needsOsVersionSync: shouldSyncDeviceField(
      user.device.osVersion,
      localOsVersion,
    ),
  };
}

/**
 * PATCH preferences only when timezone / device appVersion / device osVersion
 * differ. Dedupes overlapping start / post-login / foreground calls.
 */
export async function syncDevicePreferencesIfNeeded(
  queryClient: QueryClient,
  accessToken: string | null,
  user: User,
): Promise<User> {
  if (deviceSyncInFlight) {
    return deviceSyncInFlight;
  }

  deviceSyncInFlight = (async () => {
    const {
      needsTimezoneSync,
      needsAppVersionSync,
      needsOsVersionSync,
    } = resolveDeviceSyncNeeds(user);

    if (!needsTimezoneSync && !needsAppVersionSync && !needsOsVersionSync) {
      return user;
    }

    const deviceTimezone = getDeviceTimezone();
    const installedAppVersion = getMobileAppVersion();

    // Body is required; for OS-only updates send the current timezone.
    const patch =
      needsTimezoneSync || needsOsVersionSync
        ? { timezone: deviceTimezone }
        : {};

    const preferences = await patchUserPreferences(
      queryClient,
      accessToken,
      patch,
      {
        syncAppVersion: needsAppVersionSync,
        syncOsVersion: needsOsVersionSync,
      },
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

    let updatedUser = applyPreferencesToCurrentUser(user, preferences);
    if (needsAppVersionSync) {
      updatedUser = {
        ...updatedUser,
        mobileAppVersion: installedAppVersion,
        device: updatedUser.device
          ? { ...updatedUser.device, appVersion: installedAppVersion }
          : updatedUser.device,
      };
    }
    if (needsOsVersionSync && updatedUser.device) {
      updatedUser = {
        ...updatedUser,
        device: {
          ...updatedUser.device,
          osVersion: getDeviceOsVersion(),
        },
      };
    }

    if (accessToken) {
      queryClient.setQueryData(currentUserQueryKey(accessToken), updatedUser);
    }

    await saveDailyOpenTasksReminderPrefs(
      dailyOpenTasksReminderPrefsFromUser(updatedUser),
    ).catch(() => undefined);

    return updatedUser;
  })().finally(() => {
    deviceSyncInFlight = null;
  });

  return deviceSyncInFlight;
}

export async function loadCurrentUserWithTimezoneSync(
  queryClient: QueryClient,
  accessToken: string | null,
): Promise<User> {
  const deviceHeaders = await getCurrentUserDeviceHeaders();
  const user = await authApi.getCurrentUser(deviceHeaders);

  // Keep local cache aligned with Railway so Android flush uses server prefs.
  await saveDailyOpenTasksReminderPrefs(
    dailyOpenTasksReminderPrefsFromUser(user),
  ).catch(() => undefined);

  if (accessToken) {
    queryClient.setQueryData(currentUserQueryKey(accessToken), user);
  }

  return syncDevicePreferencesIfNeeded(queryClient, accessToken, user);
}

/** Foreground / post-login: use cached user when present. */
export async function syncCachedDevicePreferencesIfNeeded(
  queryClient: QueryClient,
  accessToken: string | null,
): Promise<void> {
  if (!accessToken) {
    return;
  }

  const cached = queryClient.getQueryData<User>(
    currentUserQueryKey(accessToken),
  );
  if (!cached) {
    return;
  }

  await syncDevicePreferencesIfNeeded(queryClient, accessToken, cached);
}
