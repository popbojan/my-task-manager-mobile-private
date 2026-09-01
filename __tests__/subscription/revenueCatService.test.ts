jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn().mockResolvedValue(undefined),
    logIn: jest.fn().mockResolvedValue({ customerInfo: { entitlements: { active: {} } } }),
    logOut: jest.fn().mockResolvedValue({ customerInfo: { entitlements: { active: {} } } }),
    getAppUserID: jest.fn().mockResolvedValue('user-123'),
    getOfferings: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    setLogLevel: jest.fn(),
    setLogHandler: jest.fn(),
    PURCHASES_ERROR_CODE: {
      PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR',
    },
  },
  LOG_LEVEL: { ERROR: 'ERROR', WARN: 'WARN' },
}));

jest.mock('@/config/revenueCat.local', () => ({
  revenueCatLocalOverrides: {
    androidPublicSdkKey: 'goog_test_key',
    androidTestStoreSdkKey: 'test_android_key',
    iosPublicSdkKey: '',
    iosTestStoreSdkKey: '',
  },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

import Purchases from 'react-native-purchases';
import {
  configureRevenueCatOnce,
  logInRevenueCat,
  logOutRevenueCat,
  resetRevenueCatServiceForTests,
} from '@/revenuecat/revenueCatService';

describe('revenueCatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRevenueCatServiceForTests();
  });

  it('configures RevenueCat only once per app run', async () => {
    await configureRevenueCatOnce();
    await configureRevenueCatOnce();

    expect(Purchases.configure).toHaveBeenCalledTimes(1);
    expect(Purchases.configure).toHaveBeenCalledWith({ apiKey: 'test_android_key' });
  });

  it('logs in with backend user id after configure', async () => {
    (Purchases.getAppUserID as jest.Mock)
      .mockResolvedValueOnce('$RCAnonymousID:old')
      .mockResolvedValueOnce('user-123');

    await logInRevenueCat('user-123');

    expect(Purchases.configure).toHaveBeenCalledTimes(1);
    expect(Purchases.logIn).toHaveBeenCalledWith('user-123');
    expect(Purchases.getAppUserID).toHaveBeenCalledTimes(2);
  });

  it('calls logOut during logout flow', async () => {
    await configureRevenueCatOnce();
    await logOutRevenueCat();

    expect(Purchases.logOut).toHaveBeenCalledTimes(1);
  });
});
