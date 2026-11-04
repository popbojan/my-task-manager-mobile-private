jest.mock('@/api/authClient', () => ({
  authApi: {
    getCurrentUser: jest.fn(),
    updateUserPreferences: jest.fn(),
  },
}));

jest.mock('@/user/deviceTimezone', () => ({
  getDeviceTimezone: jest.fn(() => 'Pacific/Auckland'),
}));

jest.mock('@/user/mobileAppVersion', () => ({
  getMobileAppVersion: jest.fn(() => '1.2.7'),
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
  personalIntroSeenAt: null,
  mobileOnboardingSeenAt: null,
  webOnboardingSeenAt: null,
  personalFocusTaskName: null,
  personalFocusMotivation: null,
  mobileAppVersion: '1.2.7',
};

describe('loadCurrentUserWithTimezoneSync', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    getCurrentUser.mockReset();
    updateUserPreferences.mockReset();
  });

  it('reloads history after the device timezone is stored', async () => {
    getCurrentUser.mockResolvedValue(baseUser);
    updateUserPreferences.mockResolvedValue({
      language: Language.De,
      timezone: 'Pacific/Auckland',
    });
    const invalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');

    const user = await loadCurrentUserWithTimezoneSync(queryClient, 'token');

    expect(user.timezone).toBe('Pacific/Auckland');
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['history'] });
  });
});
