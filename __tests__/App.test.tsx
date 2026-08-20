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
    requestOtp: jest.fn(),
    loginWithOtp: jest.fn(),
    logout: jest.fn(),
  },
  setAccessTokenGetter: jest.fn(),
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
