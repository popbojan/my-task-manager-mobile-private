jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    logOut: jest.fn(),
  },
}));

jest.mock('@/revenuecat/revenueCatService', () => ({
  logOutRevenueCat: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/api/authClient', () => ({
  authApi: {
    logout: jest.fn().mockResolvedValue(undefined),
  },
  authRequestInit: {},
}));

import { QueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/authClient';
import { logOutRevenueCat } from '@/revenuecat/revenueCatService';
import { subscriptionQueryKey } from '@/subscription/subscriptionQueryOptions';
import { clearUserSession } from '@/session/clearUserSession';

describe('clearUserSession', () => {
  it('logs out RevenueCat before clearing local auth and subscription state', async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(subscriptionQueryKey, {
      hasPremiumAccess: true,
      subscription: null,
    });
    const setAccessToken = jest.fn();
    const callOrder: string[] = [];

    (logOutRevenueCat as jest.Mock).mockImplementation(async () => {
      callOrder.push('revenuecat');
    });
    (authApi.logout as jest.Mock).mockImplementation(async () => {
      callOrder.push('backend');
    });

    await clearUserSession({ queryClient, setAccessToken });

    expect(callOrder).toEqual(['revenuecat', 'backend']);
    expect(queryClient.getQueryData(subscriptionQueryKey)).toBeUndefined();
    expect(setAccessToken).toHaveBeenCalledWith(null);
  });
});
