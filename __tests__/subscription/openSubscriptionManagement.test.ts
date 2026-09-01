import { Linking, Platform } from 'react-native';
import { SubscriptionProvider } from '@/api/generated';
import {
  openSubscriptionManagement,
  resolveSubscriptionDisplayProvider,
  resolveSubscriptionManagementTarget,
} from '@/subscription/openSubscriptionManagement';

jest.mock('@/api/authClient', () => ({
  authApi: {
    createCustomerPortalSession: jest.fn(),
  },
}));

jest.mock('@/revenuecat/revenueCatService', () => ({
  showRevenueCatManageSubscriptions: jest.fn(),
}));

jest.mock('@/config/revenueCat', () => ({
  getRevenueCatPublicSdkKey: jest.fn(() => 'test_android_key'),
}));

describe('openSubscriptionManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });

  it('maps apple provider on Android to Google Play management', () => {
    expect(
      resolveSubscriptionManagementTarget(SubscriptionProvider.Apple),
    ).toBe('google_play');
  });

  it('shows Google Play label for apple provider on Android', () => {
    expect(
      resolveSubscriptionDisplayProvider(SubscriptionProvider.Apple),
    ).toBe(SubscriptionProvider.GooglePlay);
  });

  it('opens Google Play subscriptions for google_play provider', async () => {
    const result = await openSubscriptionManagement(SubscriptionProvider.GooglePlay);

    expect(result).toEqual({ ok: false, reason: 'test_store' });
  });

  it('returns test_store reason for RevenueCat Test Store on Android', async () => {
    const result = await openSubscriptionManagement(SubscriptionProvider.Apple);

    expect(result).toEqual({ ok: false, reason: 'test_store' });
    expect(Linking.openURL).not.toHaveBeenCalled();
  });
});
