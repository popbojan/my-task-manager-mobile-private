jest.mock('@/api/authClient', () => ({
  authApi: {
    getCurrentUser: jest.fn(),
    updateUserPreferences: jest.fn(),
  },
}));

jest.mock('@/device/deviceRequestHeaders', () => ({
  getCurrentUserDeviceHeaders: jest.fn(async () => ({
    xDeviceId: 'device-1',
    xDevicePlatform: 'ANDROID',
  })),
  getPreferencesDeviceHeaders: jest.fn(async options => ({
    xDeviceId: 'device-1',
    ...(options?.syncAppVersion ? { xAppVersion: '1.2.7' } : {}),
    ...(options?.syncOsVersion ? { xDeviceOSVersion: '14' } : {}),
  })),
}));

jest.mock('@/device/deviceSystemInfo', () => ({
  getDeviceOsVersion: jest.fn(() => '14'),
  getDeviceManufacturer: jest.fn(() => 'Google'),
  getDeviceModel: jest.fn(() => 'Pixel'),
}));

jest.mock('@/user/deviceTimezone', () => ({
  getDeviceTimezone: jest.fn(() => 'Pacific/Auckland'),
}));

jest.mock('@/user/mobileAppVersion', () => ({
  getMobileAppVersion: jest.fn(() => '1.2.7'),
}));

jest.mock('@/notifications/dailyOpenTasksReminderPrefs', () => ({
  dailyOpenTasksReminderPrefsFromUser: jest.fn(user => ({
    enabled: user.notificationEnabled,
    notificationTime: user.notificationTime,
  })),
  saveDailyOpenTasksReminderPrefs: jest.fn(async prefs => prefs),
}));

import { QueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import { Language, type User } from '@/api/generated';
import { loadCurrentUserWithTimezoneSync } from '@/user/currentUserQuery';

const getCurrentUser = authApi.getCurrentUser as jest.Mock;
const updateUserPreferences = authApi.updateUserPreferences as jest.Mock;

const baseUser: User = {
  id: 'user-1',
  email: 'user@example.com',
  language: Language.De,
  timezone: 'Pacific/Pago_Pago',
  notificationEnabled: true,
  notificationTime: '20:00',
  personalIntroSeenAt: null,
  mobileOnboardingSeenAt: null,
  webOnboardingSeenAt: null,
  personalFocusTaskName: null,
  personalFocusMotivation: null,
  mobileAppVersion: '1.2.7',
  device: {
    deviceId: 'device-1',
    platform: 'ANDROID',
    appVersion: '1.2.7',
    manufacturer: 'Google',
    model: 'Pixel',
    osVersion: '14',
    notificationsEnabled: true,
    notificationTime: '20:00',
  },
};

describe('loadCurrentUserWithTimezoneSync', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    getCurrentUser.mockReset();
    updateUserPreferences.mockReset();
  });

  it('loads with device headers and patches timezone when it changed', async () => {
    getCurrentUser.mockResolvedValue(baseUser);
    updateUserPreferences.mockResolvedValue({
      language: Language.De,
      timezone: 'Pacific/Auckland',
      notificationEnabled: true,
      notificationTime: '20:00',
      personalIntroSeenAt: null,
      mobileOnboardingSeenAt: null,
      webOnboardingSeenAt: null,
      personalFocusTaskName: null,
      personalFocusMotivation: null,
      device: baseUser.device,
    });
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    const user = await loadCurrentUserWithTimezoneSync(queryClient, 'token');

    expect(getCurrentUser).toHaveBeenCalledWith({
      xDeviceId: 'device-1',
      xDevicePlatform: 'ANDROID',
    });
    expect(updateUserPreferences).toHaveBeenCalledWith({
      updateUserPreferencesRequest: {
        timezone: 'Pacific/Auckland',
        mobileAppVersion: '1.2.7',
      },
      xDeviceId: 'device-1',
    });
    expect(user.timezone).toBe('Pacific/Auckland');
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['history'] });
  });

  it('syncs appVersion even on downgrade when device is present', async () => {
    getCurrentUser.mockResolvedValue({
      ...baseUser,
      timezone: 'Pacific/Auckland',
      device: {
        ...baseUser.device!,
        appVersion: '1.3.0',
      },
    });
    updateUserPreferences.mockResolvedValue({
      language: Language.De,
      timezone: 'Pacific/Auckland',
      notificationEnabled: true,
      notificationTime: '20:00',
      personalIntroSeenAt: null,
      mobileOnboardingSeenAt: null,
      webOnboardingSeenAt: null,
      personalFocusTaskName: null,
      personalFocusMotivation: null,
      device: {
        ...baseUser.device!,
        appVersion: '1.2.7',
      },
    });

    await loadCurrentUserWithTimezoneSync(queryClient, 'token');

    expect(updateUserPreferences).toHaveBeenCalledWith({
      updateUserPreferencesRequest: {
        mobileAppVersion: '1.2.7',
      },
      xDeviceId: 'device-1',
      xAppVersion: '1.2.7',
    });
  });

  it('does not PATCH device versions when device is null', async () => {
    getCurrentUser.mockResolvedValue({
      ...baseUser,
      timezone: 'Pacific/Auckland',
      mobileAppVersion: null,
      device: null,
    });

    const user = await loadCurrentUserWithTimezoneSync(queryClient, 'token');

    expect(updateUserPreferences).not.toHaveBeenCalled();
    expect(user.device).toBeNull();
  });

  it('patches OS version with timezone body when only OS changed', async () => {
    getCurrentUser.mockResolvedValue({
      ...baseUser,
      timezone: 'Pacific/Auckland',
      device: {
        ...baseUser.device!,
        osVersion: '13',
      },
    });
    updateUserPreferences.mockResolvedValue({
      language: Language.De,
      timezone: 'Pacific/Auckland',
      notificationEnabled: true,
      notificationTime: '20:00',
      personalIntroSeenAt: null,
      mobileOnboardingSeenAt: null,
      webOnboardingSeenAt: null,
      personalFocusTaskName: null,
      personalFocusMotivation: null,
      device: {
        ...baseUser.device!,
        osVersion: '14',
      },
    });

    await loadCurrentUserWithTimezoneSync(queryClient, 'token');

    expect(updateUserPreferences).toHaveBeenCalledWith({
      updateUserPreferencesRequest: {
        timezone: 'Pacific/Auckland',
        mobileAppVersion: '1.2.7',
      },
      xDeviceId: 'device-1',
      xDeviceOSVersion: '14',
    });
  });
});
