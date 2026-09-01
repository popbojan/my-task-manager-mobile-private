/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@/api/authClient', () => ({
  authApi: {
    refreshAccessToken: jest.fn().mockRejectedValue(new Error('no session')),
    getMasteryLevels: jest.fn().mockResolvedValue([]),
    getCurrentUser: jest.fn(),
    getCurrentUserSubscriptionRaw: jest.fn(),
    requestOtp: jest.fn(),
    loginWithOtp: jest.fn(),
    logout: jest.fn(),
  },
  setAccessTokenGetter: jest.fn(),
}));

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn().mockResolvedValue(undefined),
    logIn: jest.fn().mockResolvedValue({ customerInfo: { entitlements: { active: {} } } }),
    logOut: jest.fn().mockResolvedValue({ customerInfo: { entitlements: { active: {} } } }),
    getOfferings: jest.fn().mockResolvedValue({ current: null }),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    setLogLevel: jest.fn(),
    setLogHandler: jest.fn(),
    PURCHASES_ERROR_CODE: {
      PURCHASE_CANCELLED_ERROR: 'PURCHASE_CANCELLED_ERROR',
      PURCHASE_NOT_ALLOWED_ERROR: 'PURCHASE_NOT_ALLOWED_ERROR',
    },
  },
  LOG_LEVEL: {
    ERROR: 'ERROR',
    WARN: 'WARN',
  },
  PACKAGE_TYPE: {
    MONTHLY: 'MONTHLY',
    LIFETIME: 'LIFETIME',
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
